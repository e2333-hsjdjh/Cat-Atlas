// 用苹果系统自带模型抠图：
// Vision 框架的 VNGenerateForegroundInstanceMaskRequest（主体分割，即系统"移除背景"同款模型），
// 本地运行于 Neural Engine / GPU，无需联网下载任何权重。
//
// 用法: swift scripts/cutout_cats.swift
// 输入: images/*.jpg|jpeg|png
// 输出: images/cutouts/<原名>__猫N.png（透明底，每只猫单独一张）

import Foundation
import Vision
import CoreImage
import ImageIO
import UniformTypeIdentifiers

let srcDir: URL = {
    if CommandLine.arguments.count > 1 {
        return URL(fileURLWithPath: CommandLine.arguments[1])
    }
    return URL(fileURLWithPath: FileManager.default.currentDirectoryPath).appendingPathComponent("images")
}()
let outDir = srcDir.appendingPathComponent("cutouts")

func loadImageOriented(_ url: URL) -> CGImage? {
    guard let src = CGImageSourceCreateWithURL(url as CFURL, nil),
          let image = CGImageSourceCreateImageAtIndex(src, 0, nil) else { return nil }
    guard let props = CGImageSourceCopyPropertiesAtIndex(src, 0, nil) as? [CFString: Any],
          let raw = props[kCGImagePropertyOrientation] as? UInt32,
          let orientation = CGImagePropertyOrientation(rawValue: raw), orientation != .up
    else { return image }
    let ci = CIImage(cgImage: image).oriented(orientation)
    return CIContext().createCGImage(ci, from: ci.extent)
}

func savePNG(_ image: CGImage, to url: URL) throws {
    let dest = CGImageDestinationCreateWithURL(url as CFURL, UTType.png.identifier as CFString, 1, nil)!
    CGImageDestinationAddImage(dest, image, nil)
    guard CGImageDestinationFinalize(dest) else { throw NSError(domain: "cutout", code: 3) }
}

func main() throws {
    try FileManager.default.createDirectory(at: outDir, withIntermediateDirectories: true)
    let fm = FileManager.default
    let files = try fm.contentsOfDirectory(at: srcDir, includingPropertiesForKeys: nil)
        .filter { ["jpg", "jpeg", "png"].contains($0.pathExtension.lowercased()) }
        .sorted { $0.lastPathComponent < $1.lastPathComponent }

    print("共 \(files.count) 张图片 -> \(outDir.path)\n")
    let request = VNGenerateForegroundInstanceMaskRequest()
    var total = 0

    for url in files {
        guard let cgImage = loadImageOriented(url) else {
            print("[skip] 无法读取: \(url.lastPathComponent)")
            continue
        }
        let handler = VNImageRequestHandler(cgImage: cgImage)
        try handler.perform([request])
        let observations = request.results ?? []

        if observations.isEmpty {
            print("[skip] 未检测到主体: \(url.lastPathComponent)")
            continue
        }

        for (_, obs) in observations.enumerated() {
            // allInstances: 该观察里所有非背景实例的索引集合
            for idx in obs.allInstances {
                guard let pixelBuffer = try? obs.generateMaskedImage(
                    ofInstances: IndexSet(integer: idx), from: handler, croppedToInstancesExtent: true
                ) else {
                    print("  [!] 生成蒙版失败: \(url.lastPathComponent)")
                    continue
                }
                let ci = CIImage(cvPixelBuffer: pixelBuffer)
                guard let maskedCG = CIContext().createCGImage(ci, from: ci.extent) else { continue }

                total += 1
                let name = "\(url.deletingPathExtension().lastPathComponent)__猫\(total).png"
                try savePNG(maskedCG, to: outDir.appendingPathComponent(name))
                print("[ok] \(name)  (\(maskedCG.width)x\(maskedCG.height))  \(url.lastPathComponent)")
            }
        }
    }
    print("\n[done] 共抠出 \(total) 个主体 -> \(outDir.path)")
}

try main()
