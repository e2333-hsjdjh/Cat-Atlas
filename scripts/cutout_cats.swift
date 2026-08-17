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

let srcDir = URL(fileURLWithPath: FileManager.default.currentDirectoryPath)
    .appendingPathComponent("images")
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

        for (i, obs) in observations.enumerated() {
            let instances = obs.instances
            guard !instances.isEmpty else { continue }
            for instance in instances {
                guard let masked = try? obs.generateMaskedImage(ofInstances: [instance], from: cgImage) else {
                    print("  [!] 生成蒙版失败: \(url.lastPathComponent)")
                    continue
                }
                // 归一化 bbox -> 像素坐标（Vision 原点在左下）
                let w = CGFloat(cgImage.width), h = CGFloat(cgImage.height)
                let bb = obs.boundingBox
                var rect = CGRect(x: bb.minX * w,
                                  y: (1 - bb.maxY) * h,
                                  width: bb.width * w,
                                  height: bb.height * h)
                // 外扩 3% 避免切边
                rect = rect.insetBy(dx: -rect.width * 0.03, dy: -rect.height * 0.03)
                rect = rect.intersection(CGRect(x: 0, y: 0, width: w, height: h))
                guard rect.width > 1, rect.height > 1,
                      let cropped = masked.cropping(to: rect) else { continue }

                total += 1
                let name = "\(url.deletingPathExtension().lastPathComponent)__猫\(total).png"
                try savePNG(cropped, to: outDir.appendingPathComponent(name))
                print("[ok] \(name)  (\(Int(rect.width))x\(Int(rect.height)))  \(url.lastPathComponent)")
            }
        }
    }
    print("\n[done] 共抠出 \(total) 个主体 -> \(outDir.path)")
}

try main()
