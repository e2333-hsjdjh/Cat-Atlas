"""本地 YOLO-seg 抠图：把 images/ 里的猫咪从照片中分割出来，输出透明底 PNG。

- 模型：yolov8m-seg.pt（首次运行自动下载，约 50MB）
- 设备：优先 Apple MPS（Metal GPU），失败则回退 CPU
- 输出：images/cutouts/<原名>__猫N.png（每张图里每只猫单独一张）+ contact_sheet.jpg 汇总预览
"""
import os
import sys
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw

import torch

SRC_DIR = Path(__file__).resolve().parent.parent / "images"
OUT_DIR = Path(__file__).resolve().parent.parent / "images" / "cutouts"
MODEL_NAME = "yolov8m-seg.pt"
CONF = 0.3
IOU = 0.5
EDGE_FEATHER = 1.5  # 边缘羽化 sigma（像素）


def pick_device():
    if torch.backends.mps.is_available():
        return "mps"
    return "cpu"


def main():
    from ultralytics import YOLO

    device = pick_device()
    print(f"[info] 使用设备: {device}")

    model = YOLO(MODEL_NAME)
    if device == "mps":
        model.to("mps")

    images = sorted(SRC_DIR.glob("*.jpg")) + sorted(SRC_DIR.glob("*.jpeg")) + sorted(SRC_DIR.glob("*.png"))
    if not images:
        print("[error] images/ 下没有找到图片")
        sys.exit(1)

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    sheet_images = []
    total_cats = 0

    for img_path in images:
        print(f"\n[process] {img_path.name}")
        img = cv2.imread(str(img_path))
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        h, w = img.shape[:2]

        results = model.predict(str(img_path), classes=[15], conf=CONF, iou=IOU, device=device, verbose=False)

        if not results or results[0].masks is None or len(results[0].masks) == 0:
            print(f"  [skip] 未检测到猫咪: {img_path.name}")
            continue

        masks = results[0].masks.data.cpu().numpy()  # (N, mask_h, mask_w) 二值
        boxes = results[0].boxes.xyxy.cpu().numpy()  # (N, 4)
        scores = results[0].boxes.conf.cpu().numpy()

        for i, (mask_small, box, score) in enumerate(zip(masks, boxes, scores), start=1):
            # 把低分辨率 mask 放大回原图尺寸
            mask = cv2.resize(mask_small.astype(np.float32), (w, h), interpolation=cv2.INTER_LINEAR)
            mask = np.clip(mask, 0, 1)
            # 二值化后再轻微羽化，让边缘平滑
            mask_bin = (mask > 0.5).astype(np.uint8)
            if EDGE_FEATHER > 0:
                mask_soft = cv2.GaussianBlur(mask_bin.astype(np.float32), (0, 0), EDGE_FEATHER)
            else:
                mask_soft = mask_bin.astype(np.float32)
            alpha = (mask_soft * 255).astype(np.uint8)

            x1, y1, x2, y2 = [int(v) for v in box]
            # bbox 外扩 3%，避免边缘被切
            pad_x, pad_y = int((x2 - x1) * 0.03), int((y2 - y1) * 0.03)
            x1, y1 = max(0, x1 - pad_x), max(0, y1 - pad_y)
            x2, y2 = min(w, x2 + pad_x), min(h, y2 + pad_y)

            rgba = np.dstack([img, alpha])
            cut = rgba[y1:y2, x1:x2]
            out_name = f"{img_path.stem}__猫{i}.png"
            out_path = OUT_DIR / out_name
            Image.fromarray(cut).save(out_path)
            print(f"  [ok] {out_name}  置信度 {score:.2f}  区域 {x1},{y1}-{x2},{y2}")

            # 汇总预览：白底贴图，最多拼 8 张
            if len(sheet_images) < 8:
                sheet_images.append(Image.fromarray(cut).convert("RGBA"))
            total_cats += 1

    # 汇总预览图
    if sheet_images:
        rows = (len(sheet_images) + 3) // 4
        cell = 320
        sheet = Image.new("RGB", (cell * min(len(sheet_images), 4), cell * rows), "white")
        draw = ImageDraw.Draw(sheet)
        for idx, im in enumerate(sheet_images):
            im.thumbnail((cell - 24, cell - 24), Image.LANCZOS)
            bg = Image.new("RGBA", (cell - 24, cell - 24), (255, 255, 255, 255))
            bg.paste(im, (0, 0), im)
            r, c = divmod(idx, 4)
            sheet.paste(bg.convert("RGB"), (12 + c * cell, 12 + r * cell))
        sheet_path = OUT_DIR / "contact_sheet.jpg"
        sheet.save(sheet_path, quality=90)
        print(f"\n[ok] 汇总预览: {sheet_path}")

    print(f"\n[done] 共抠出 {total_cats} 只猫咪 -> {OUT_DIR}")


if __name__ == "__main__":
    main()
