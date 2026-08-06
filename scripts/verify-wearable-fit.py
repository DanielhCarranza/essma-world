#!/usr/bin/env python3
"""Verify wearable layers against character bases + the slot-fit contract.

Produces contact-sheet overlays and a JSON report. Exit code 1 if any keeper
fails hard checks (empty alpha, off-canvas, or shoes that leave feet uncovered).

Usage:
  python3 scripts/verify-wearable-fit.py
  python3 scripts/verify-wearable-fit.py --out /tmp/essma-fit-verify
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
from fit_wearable import KEEPER_SPECS, load_contract  # type: ignore

BASES = {
    "essma": ROOT / "public/assets/characters/v1/essma-base.png",
    "juancito": ROOT / "public/assets/characters/v1/juancito-base.png",
    "tori": ROOT / "public/assets/characters/v1/tori-base.png",
    "anita": ROOT / "public/assets/characters/v1/anita-base.png",
}


def feet_uncovered_ratio(base: Image.Image, wear: Image.Image) -> float:
    """Fraction of opaque base pixels in the foot band not covered by shoes."""
    ba = base.getchannel("A")
    wa = wear.getchannel("A")
    bb = ba.getbbox()
    if not bb:
        return 0.0
    y0 = bb[1] + int((bb[3] - bb[1]) * 0.88)
    total = covered = 0
    for y in range(y0, bb[3]):
        for x in range(bb[0], bb[2]):
            if ba.getpixel((x, y)) > 40:
                total += 1
                if wa.getpixel((x, y)) > 40:
                    covered += 1
    if total == 0:
        return 0.0
    return 1.0 - covered / total


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--out", type=Path, default=Path("/tmp/essma-fit-verify"))
    args = parser.parse_args()
    args.out.mkdir(parents=True, exist_ok=True)

    contract = load_contract()
    report = []
    failures = 0

    for character, slot, slug, rel, _preserve in KEEPER_SPECS:
        path = ROOT / rel
        base_path = BASES[character]
        if not path.exists():
            report.append({"id": slug, "ok": False, "reason": "missing-file"})
            failures += 1
            continue

        base = Image.open(base_path).convert("RGBA")
        wear = Image.open(path).convert("RGBA")
        wb = wear.getchannel("A").getbbox()
        box = contract["characters"][character][slot]
        row = {
            "id": slug,
            "character": character,
            "slot": slot,
            "content": wb,
            "slotBox": box,
            "ok": True,
            "issues": [],
        }
        if not wb:
            row["ok"] = False
            row["issues"].append("empty-alpha")
            failures += 1
        else:
            if wb[0] < 0 or wb[1] < 0 or wb[2] > 1254 or wb[3] > 1254:
                row["ok"] = False
                row["issues"].append("off-canvas")
                failures += 1
            # Content should intersect the primary or optional lower slot band.
            bands = [box]
            if isinstance(box.get("lower"), dict):
                bands.append(box["lower"])
            in_band = False
            for band in bands:
                attach = band.get("attach", "cover-from")
                if attach == "stand-on":
                    slot_bottom = int(band.get("groundY", 1254))
                    slot_top = slot_bottom - int(band["maxHeight"])
                elif attach == "sit-on":
                    attach_y = int(band["attachY"])
                    slot_bottom = attach_y + 40
                    slot_top = attach_y - int(band["maxHeight"])
                else:
                    attach_y = int(band.get("attachY", band.get("top", 0)))
                    slot_top = attach_y - 40
                    slot_bottom = attach_y + int(band["maxHeight"])
                if not (wb[3] < slot_top - 60 or wb[1] > slot_bottom + 60):
                    in_band = True
                    break
            if not in_band:
                row["ok"] = False
                row["issues"].append("outside-slot-band")
                failures += 1
            if slot == "shoes":
                uncovered = feet_uncovered_ratio(base, wear)
                row["feetUncovered"] = round(uncovered, 3)
                if uncovered > 0.35:
                    row["ok"] = False
                    row["issues"].append("feet-show-through")
                    failures += 1

        canvas = Image.new("RGBA", base.size, (245, 235, 210, 255))
        canvas.alpha_composite(base)
        canvas.alpha_composite(wear)
        draw = ImageDraw.Draw(canvas)
        bb = base.getchannel("A").getbbox()
        if bb:
            draw.rectangle(bb, outline=(30, 120, 220, 255), width=3)
        if wb:
            draw.rectangle(wb, outline=(220, 40, 40, 255), width=3)
        preview = canvas.resize((360, 360), Image.Resampling.LANCZOS)
        preview.save(args.out / f"{slug}.png")
        report.append(row)
        status = "OK" if row["ok"] else "FAIL"
        print(f"{status:4} {slug:32} {row['issues']}")

    (args.out / "report.json").write_text(json.dumps(report, indent=2))
    print(f"\nWrote {args.out} ({failures} failures)")
    raise SystemExit(1 if failures else 0)


if __name__ == "__main__":
    main()
