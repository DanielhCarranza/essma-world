"""Place a chroma-keyed, isolated clothing item onto a character-sized layer canvas.

The generator produces an isolated object on a square source canvas.  This
tool keeps its alpha edge but places the cropped object at catalog-approved
coordinates so React and Phaser can stack the same 1254px layers exactly.
"""

from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image

DEFAULT_CANVAS = 1254


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("input", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--center-x", type=int, required=True)
    parser.add_argument("--top", type=int, required=True)
    parser.add_argument("--max-width", type=int, required=True)
    parser.add_argument("--max-height", type=int, required=True)
    parser.add_argument("--canvas", type=int, default=DEFAULT_CANVAS)
    args = parser.parse_args()

    source = Image.open(args.input).convert("RGBA")
    alpha = source.getchannel("A")
    box = alpha.getbbox()
    if not box:
        raise SystemExit(f"No opaque pixels in {args.input}")
    item = source.crop(box)
    scale = min(args.max_width / item.width, args.max_height / item.height)
    size = (max(1, round(item.width * scale)), max(1, round(item.height * scale)))
    item = item.resize(size, Image.Resampling.LANCZOS)
    layer = Image.new("RGBA", (args.canvas, args.canvas))
    left = round(args.center_x - item.width / 2)
    layer.alpha_composite(item, (left, args.top))
    args.output.parent.mkdir(parents=True, exist_ok=True)
    layer.save(args.output)


if __name__ == "__main__":
    main()
