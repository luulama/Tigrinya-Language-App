import AVFoundation
import Capacitor
import UIKit
import WebKit

/// One optional, eight-second clip. No upload, persistence, speech recognition or scoring.
@objc(PrivateVoicePlugin)
public final class PrivateVoicePlugin: CAPPlugin, CAPBridgedPlugin, AVAudioRecorderDelegate {
    public let identifier = "PrivateVoicePlugin"
    public let jsName = "PrivateVoice"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "record", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "stop", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "cancel", returnType: CAPPluginReturnPromise)
    ]
    private var recorder: AVAudioRecorder?
    private var pending: CAPPluginCall?
    private var file: URL?
    private var generation = 0
    private var navigation: NSKeyValueObservation?
    private let directory = FileManager.default.temporaryDirectory.appendingPathComponent("TigrinyaPrivateVoice", isDirectory: true)

    public override func load() {
        // Only the plugin's own ephemeral directory, including interrupted previous sessions.
        try? FileManager.default.removeItem(at: directory)
        NotificationCenter.default.addObserver(self, selector: #selector(backgrounded), name: UIApplication.didEnterBackgroundNotification, object: nil)
        NotificationCenter.default.addObserver(self, selector: #selector(backgrounded), name: AVAudioSession.interruptionNotification, object: nil)
        navigation = bridge?.webView?.observe(\.url, options: [.new]) { [weak self] _, _ in
            DispatchQueue.main.async { self?.discard("Page changed") }
        }
    }

    deinit { NotificationCenter.default.removeObserver(self) }

    @objc private func backgrounded() { DispatchQueue.main.async { self.discard("Recording cancelled") } }

    @objc public func record(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            guard self.bridge?.webView?.url?.path.hasSuffix("/voice.html") == true else {
                call.reject("Open private voice practice first", "UNAVAILABLE"); return
            }
            guard self.pending == nil else { call.reject("A recording is already active", "BUSY"); return }
            self.generation += 1
            let request = self.generation
            self.pending = call
            let permission: (Bool) -> Void = { [weak self] allowed in
                DispatchQueue.main.async {
                    guard let self, self.generation == request, self.pending != nil else { return }
                    guard allowed else { self.discard("Microphone permission was declined"); return }
                    self.begin()
                }
            }
            if #available(iOS 17.0, *) { AVAudioApplication.requestRecordPermission(completionHandler: permission) }
            else { AVAudioSession.sharedInstance().requestRecordPermission(permission) }
        }
    }

    private func begin() {
        do {
            let session = AVAudioSession.sharedInstance()
            try session.setCategory(.playAndRecord, mode: .default, options: [.defaultToSpeaker])
            try session.setActive(true)
            try FileManager.default.createDirectory(at: directory, withIntermediateDirectories: true)
            let location = directory.appendingPathComponent(UUID().uuidString + ".m4a")
            file = location
            var values = URLResourceValues(); values.isExcludedFromBackup = true
            var folder = directory; try folder.setResourceValues(values)
            let active = try AVAudioRecorder(url: location, settings: [
                AVFormatIDKey: kAudioFormatMPEG4AAC,
                AVSampleRateKey: 44100,
                AVNumberOfChannelsKey: 1,
                AVEncoderBitRateKey: 64000
            ])
            active.delegate = self
            recorder = active
            guard active.record(forDuration: 8) else { throw NSError(domain: "PrivateVoice", code: 1) }
        } catch { discard("The microphone is busy or unavailable") }
    }

    @objc public func stop(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            if let active = self.recorder { active.stop() }
            else if self.pending != nil { self.discard("Recording cancelled before permission completed") }
            call.resolve()
        }
    }

    @objc public func cancel(_ call: CAPPluginCall) {
        DispatchQueue.main.async { self.discard("Recording cancelled"); call.resolve() }
    }

    private func cleanup() {
        recorder?.delegate = nil
        recorder?.stop()
        recorder = nil
        if let file { try? FileManager.default.removeItem(at: file) }
        file = nil
        try? AVAudioSession.sharedInstance().setActive(false, options: .notifyOthersOnDeactivation)
    }

    private func discard(_ reason: String) {
        generation += 1
        let call = pending; pending = nil
        cleanup()
        call?.reject(reason, "RECORDING_UNAVAILABLE")
    }

    public func audioRecorderDidFinishRecording(_ recorder: AVAudioRecorder, successfully flag: Bool) {
        DispatchQueue.main.async {
            guard recorder === self.recorder, let call = self.pending else { return }
            guard flag, let file = self.file, let bytes = try? Data(contentsOf: file), !bytes.isEmpty, bytes.count < 1_500_000 else {
                self.discard("No usable clip was captured"); return
            }
            self.pending = nil
            self.cleanup()
            call.resolve(["base64": bytes.base64EncodedString(), "mimeType": "audio/mp4"])
        }
    }

    public func audioRecorderEncodeErrorDidOccur(_ recorder: AVAudioRecorder, error: Error?) {
        DispatchQueue.main.async { if recorder === self.recorder { self.discard("Recording interrupted") } }
    }
}
