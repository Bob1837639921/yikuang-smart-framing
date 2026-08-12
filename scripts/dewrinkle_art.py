"""Deterministic paper-lighting correction; never generates or repaints art."""
from __future__ import annotations
import argparse
import numpy as np
from PIL import Image, ImageFilter, ImageEnhance


def crop_sheet(im: Image.Image) -> Image.Image:
    a = np.asarray(im.convert("RGB"), dtype=np.float32)
    # The demo photo has a neutral gray surround. Paper is warmer and brighter.
    warmth = a[..., 0] - a[..., 2]
    bright = a.mean(axis=2)
    mask = (warmth > 11) & (bright > 118)
    ys, xs = np.where(mask)
    if len(xs) < 100:
        return im
    x0, x1 = np.percentile(xs, [1, 99]).astype(int)
    y0, y1 = np.percentile(ys, [1, 99]).astype(int)
    pad = 4
    return im.crop((max(0, x0-pad), max(0, y0-pad), min(im.width, x1+pad), min(im.height, y1+pad)))


def dewrinkle(im: Image.Image, strength: float = 0.72) -> Image.Image:
    rgb = np.asarray(im.convert("RGB"), dtype=np.float32) / 255.0
    # Estimate illumination from luminance at a scale much larger than brush details.
    lum = 0.2126 * rgb[..., 0] + 0.7152 * rgb[..., 1] + 0.0722 * rgb[..., 2]
    lum_img = Image.fromarray(np.uint8(np.clip(lum * 255, 0, 255)), "L")
    radius = max(12, min(im.size) // 42)
    field = np.asarray(lum_img.filter(ImageFilter.GaussianBlur(radius=radius)), dtype=np.float32) / 255.0
    # Use a robust target so dark painted regions do not set the paper baseline.
    target = float(np.percentile(field, 72))
    gain = np.clip(target / np.maximum(field, 0.18), 0.72, 1.38)
    gain = 1.0 + (gain - 1.0) * strength
    corrected = np.clip(rgb * gain[..., None], 0, 1)
    # Suppress residual wrinkle contrast on light paper while protecting ink.
    smooth_rgb = np.asarray(im.filter(ImageFilter.GaussianBlur(radius=max(7, radius // 2))), dtype=np.float32) / 255.0
    # Protection approaches 1 in dark/ink regions and 0 on bright paper.
    protection = np.clip((0.70 - lum) / 0.32, 0, 1) ** 1.45
    paper_mix = strength * 0.88 * (1.0 - protection)
    corrected = corrected * (1 - paper_mix[..., None]) + smooth_rgb * paper_mix[..., None]
    out = Image.fromarray(np.uint8(corrected * 255), "RGB")
    # Restore modest local definition lost by illumination normalization.
    out = out.filter(ImageFilter.UnsharpMask(radius=1.2, percent=32, threshold=5))
    out = ImageEnhance.Contrast(out).enhance(1.03)
    return out


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("input")
    p.add_argument("output")
    p.add_argument("--strength", type=float, default=.72)
    args = p.parse_args()
    source = Image.open(args.input).convert("RGB")
    sheet = crop_sheet(source)
    result = dewrinkle(sheet, args.strength)
    result.save(args.output, quality=95)
    print(f"source={source.size} sheet={sheet.size} output={args.output}")


if __name__ == "__main__":
    main()
