#!/usr/bin/env python3
"""
Lift a device off a flat studio ground so dark mode is not a white plate.

The photograph is unchanged. Only the connected field of one flat colour,
reached from the edge, is made transparent. White type, white screens and
logo counters that are enclosed by the product stay. Diagrams where the
white is the paper (a wordmark, a colour board, a card footer) are not in
the list: opening them showed the knockout eating the artwork.

Run from the repo root: python3 design/build-dark-plates.py
"""
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "src" / "assets"

# Source filename, without the extension the plate is named from.
ALLOW = [
    "work-betfair-sportsbook.jpg",
    "work-tv.jpg",
    "work-grabbd.png",
    "project-apps-further.jpg",
    "project-apps-store-1.jpg",
    "project-apps-store-2.jpg",
    "project-rebrand-devices.jpg",
    "project-key-flow.png",
    "project-watch.png",
    "project-casino-phones.jpg",
    "project-casino-ipad.jpg",
    "project-casino.jpg",
    "project-arcade.jpg",
    "project-arcade-bonus.jpg",
    "project-arcade-phones.jpg",
    "project-poker-iphone.jpg",
    "project-poker-android.jpg",
    "project-sportsbook-1.jpg",
    "project-sportsbook-2.jpg",
    "project-sportsbook-3.jpg",
    "project-grabbd-concepts.jpg",
    "project-tv-22.jpg",
    "project-tv-11.jpg",
    "project-tv-guide.jpg",
    "project-tv-note.jpg",
    "project-tv-playback.jpg",
]


def knockout(path: Path, tol: int = 28, shadow: int = 48, min_share: float = 0.22) -> Image.Image:
    im = Image.open(path).convert("RGBA")
    arr = np.array(im)
    rgb = arr[:, :, :3].astype(np.int16)
    h, w = rgb.shape[:2]
    edge = np.concatenate([rgb[0], rgb[-1], rgb[:, 0], rgb[:, -1]], axis=0)
    q = (edge // 12) * 12
    keys = q[:, 0].astype(np.int32) * 1_000_000 + q[:, 1].astype(np.int32) * 1000 + q[:, 2]
    vals, counts = np.unique(keys, return_counts=True)
    plate = None
    for i in np.argsort(-counts):
        pr, pg, pb = int(vals[i] // 1_000_000), int((vals[i] // 1000) % 1000), int(vals[i] % 1000)
        lum = 0.2126 * pr + 0.7152 * pg + 0.0722 * pb
        if lum < 80:
            continue
        if counts[i] / len(edge) < min_share:
            break
        sel = keys == vals[i]
        plate = np.median(edge[sel], axis=0)
        break
    if plate is None:
        raise SystemExit(f"{path.name}: no flat ground on the edge")
    dist = np.max(np.abs(rgb - plate), axis=2)
    mask = dist <= tol
    labels, _ = ndimage.label(mask)
    border = np.unique(np.concatenate([labels[0], labels[-1], labels[:, 0], labels[:, -1]]))
    border = border[border != 0]
    vis = np.isin(labels, border)
    soft = dist <= tol + shadow
    slabels, _ = ndimage.label(soft)
    touch = np.unique(slabels[vis])
    touch = touch[touch != 0]
    vis = np.isin(slabels, touch)
    near = dist <= tol + shadow + 24
    grown = ndimage.binary_dilation(vis, iterations=12) & near
    glabels, _ = ndimage.label(grown | vis)
    keep = np.unique(glabels[vis])
    keep = keep[keep != 0]
    vis = np.isin(glabels, keep)
    out = arr.copy()
    out[:, :, 3] = np.where(vis, 0, 255)
    # The last pixel of the ground is a mix. Give it a soft edge so a
    # white fringe does not sit on the dark page.
    fringe = ndimage.binary_dilation(vis, iterations=1) & ~vis
    span = float(tol + 10)
    alpha = np.clip(dist.astype(np.float32) / span, 0, 1)
    out[:, :, 3] = np.where(fringe, (alpha * 255).astype(np.uint8), out[:, :, 3])
    result = Image.fromarray(out)
    long_edge = max(result.size)
    if long_edge > 1600:
        scale = 1600 / long_edge
        result = result.resize((round(result.width * scale), round(result.height * scale)), Image.Resampling.LANCZOS)
    return result


def main() -> None:
    for name in ALLOW:
        src = SRC / name
        dest = SRC / f"dark-{src.stem}.webp"
        plate = knockout(src)
        plate.save(dest, "WEBP", quality=82, method=6)
        print(f"{dest.name}  {dest.stat().st_size // 1024}KB")


if __name__ == "__main__":
    main()
