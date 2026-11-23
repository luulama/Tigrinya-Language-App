import Capacitor

final class MobileBridgeViewController: CAPBridgeViewController {
    override func capacitorDidLoad() {
        bridge?.registerPluginInstance(PrivateVoicePlugin())
        webView?.allowsBackForwardNavigationGestures = true
        #if DEBUG
        if #available(iOS 16.4, *) { webView?.isInspectable = true }
        #endif
    }
}
