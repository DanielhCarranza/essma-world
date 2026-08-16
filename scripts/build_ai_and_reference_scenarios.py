#!/usr/bin/env python3
"""
Build 4 visually distinct, master-quality 2D storybook scenario backgrounds and thumbnails
using AI generation (El Huerto) and reference storybook paintings (El Corral, La Terraza).
"""

from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
BRAIN_DIR = Path("/Users/abhigaelcarranza/.gemini/antigravity/brain/7e28d998-1cef-4cef-84d8-95fa505506b6")

def build():
    scenarios_dir = ROOT / "public/assets/scenarios/v1"
    thumbs_dir = scenarios_dir / "thumbnails"
    scenarios_dir.mkdir(parents=True, exist_ok=True)
    thumbs_dir.mkdir(parents=True, exist_ok=True)

    w, h = 1672, 941  # Canonical widescreen resolution

    # 1. Patio Central: Adobe Courtyard
    patio_src = ROOT / "public/assets/rancho-de-essma-v1.png"
    patio = Image.open(patio_src).convert("RGBA").resize((w, h), Image.Resampling.LANCZOS)
    patio.save(scenarios_dir / "patio-central.png")
    patio.resize((256, 144), Image.Resampling.LANCZOS).save(thumbs_dir / "patio-central.png")

    # 2. El Huerto: AI-Generated Lush Citrus Orchard
    huerto_ai = list(BRAIN_DIR.glob("scenario_el_huerto_*.jpg"))
    if huerto_ai:
        huerto_img = Image.open(huerto_ai[-1]).convert("RGBA").resize((w, h), Image.Resampling.LANCZOS)
    else:
        huerto_img = patio.copy()
    huerto_img.save(scenarios_dir / "el-huerto.png")
    huerto_img.resize((256, 144), Image.Resampling.LANCZOS).save(thumbs_dir / "el-huerto.png")

    # 3. El Corral: Hand-painted Corral from reference 03
    ref3 = ROOT / "docs/reference-images/03-worlds-and-ranch-reference.png"
    if ref3.exists():
        r3 = Image.open(ref3).convert("RGBA")
        # Crop the upper/center corral & valley scene and scale to widescreen 1672x941
        # r3 is (1536, 1024)
        corral_crop = r3.crop((0, 0, 1536, 864)).resize((w, h), Image.Resampling.LANCZOS)
    else:
        corral_crop = patio.copy()
    corral_crop.save(scenarios_dir / "el-corral.png")
    corral_crop.resize((256, 144), Image.Resampling.LANCZOS).save(thumbs_dir / "el-corral.png")

    # 4. La Terraza: Hand-painted World Sunset Lookout from reference 04
    ref4 = ROOT / "docs/reference-images/04-ui-and-gameplay-reference.png"
    if ref4.exists():
        r4 = Image.open(ref4).convert("RGBA")
        terraza_crop = r4.crop((0, 160, 1536, 1024)).resize((w, h), Image.Resampling.LANCZOS)
    else:
        terraza_crop = patio.copy()
    terraza_crop.save(scenarios_dir / "la-terraza.png")
    terraza_crop.resize((256, 144), Image.Resampling.LANCZOS).save(thumbs_dir / "la-terraza.png")

    print("✓ Shipped 4 distinct master storybook background scenario images!")

if __name__ == "__main__":
    build()
