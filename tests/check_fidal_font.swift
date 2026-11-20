// Optional macOS font diagnostics. No UI automation or application dependency.
import Foundation
import CoreText
import CoreGraphics
import ImageIO
import UniformTypeIdentifiers

guard CommandLine.arguments.count == 3 else { fatalError("Usage: swift check_fidal_font.swift corpus.json specimen.png") }
let input = try Data(contentsOf: URL(fileURLWithPath: CommandLine.arguments[1]))
let strings = try JSONSerialization.jsonObject(with: input) as! [String]
// Load the installed file directly: a sandboxed font-name lookup may fall back
// to Helvetica even when the font exists. This tests glyph data, not CSS lookup.
let fontURL = URL(fileURLWithPath: "/System/Library/Fonts/Supplemental/KefaIII.ttf")
guard let provider = CGDataProvider(url: fontURL as CFURL), let graphicsFont = CGFont(provider) else { fatalError("Installed Kefa font file is unavailable") }
let font = CTFontCreateWithGraphicsFont(graphicsFont, 72, nil, nil)
let family = CTFontCopyFamilyName(font) as String
guard family.lowercased().contains("kefa") else { fatalError("Kefa is not available; resolved to \(family)") }
let scalars = Set(strings.joined().unicodeScalars.filter { (0x1200...0x137f).contains($0.value) })
var missing: [String] = []
for scalar in scalars {
    var characters = Array(String(scalar).utf16)
    var glyphs = Array(repeating: CGGlyph(0), count: characters.count)
    if !CTFontGetGlyphsForCharacters(font, &characters, &glyphs, characters.count) || glyphs.contains(0) {
        missing.append(String(format: "U+%04X", scalar.value))
    }
}
guard missing.isEmpty else { fatalError("Missing Kefa glyphs: \(missing.sorted())") }
let width = 1200, height = 1050
let colorSpace = CGColorSpaceCreateDeviceRGB()
let canvas = CGContext(data: nil, width: width, height: height, bitsPerComponent: 8, bytesPerRow: width * 4, space: colorSpace, bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
canvas.setFillColor(CGColor(gray: 1, alpha: 1)); canvas.fill(CGRect(x: 0, y: 0, width: width, height: height))
func attributes(_ size: CGFloat) -> [NSAttributedString.Key: Any] {
    return [NSAttributedString.Key(kCTFontAttributeName as String): CTFontCreateCopyWithAttributes(font, size, nil, nil), NSAttributedString.Key(kCTForegroundColorAttributeName as String): CGColor(gray: 0.12, alpha: 1)]
}
func line(_ text: String, _ y: CGFloat, _ size: CGFloat) {
    let textLine = CTLineCreateWithAttributedString(NSAttributedString(string: text, attributes: attributes(size)))
    guard CTLineGetTypographicBounds(textLine, nil, nil, nil) < 1080 else { fatalError("Specimen line overflows") }
    canvas.textPosition = CGPoint(x: 60, y: y); CTLineDraw(textLine, canvas)
}
line("Kefa III / Tigrinya Fidäl / local font diagnostic", 980, 25)
line("በ ቡ ቢ ባ ቤ ብ ቦ", 850, 78)
line("ተ ቱ ቲ ታ ቴ ት ቶ", 720, 78)
line("መ ሙ ሚ ማ ሜ ም ሞ", 590, 78)
line("ቤት   ማይ   ድሙ   በጊዕ   ስሳ፟", 455, 62)
line("Combining-mark sample is an encoding test, not lesson vocabulary.", 408, 22)
let wrapped = String(repeating: "ቤት ማይ ድሙ ስሳ፟ ", count: 7)
let attributed = NSAttributedString(string: wrapped, attributes: attributes(42))
let framesetter = CTFramesetterCreateWithAttributedString(attributed)
let box = CGPath(rect: CGRect(x: 60, y: 70, width: 1080, height: 310), transform: nil)
let frame = CTFramesetterCreateFrame(framesetter, CFRangeMake(0, attributed.length), box, nil)
guard CTFrameGetVisibleStringRange(frame).length == attributed.length else { fatalError("Wrapped specimen clipped") }
guard CFArrayGetCount(CTFrameGetLines(frame)) > 1 else { fatalError("Wrap diagnostic did not produce multiple lines") }
CTFrameDraw(frame, canvas)
let image = canvas.makeImage()!
let destination = CGImageDestinationCreateWithURL(URL(fileURLWithPath: CommandLine.arguments[2]) as CFURL, UTType.png.identifier as CFString, 1, nil)!
CGImageDestinationAddImage(destination, image, nil)
guard CGImageDestinationFinalize(destination) else { fatalError("Could not write specimen") }
print("PASS: \(family) covers all \(scalars.count) tested Ethiopic scalars, including the combining mark; CoreText multiline rendering fits the specimen.")
