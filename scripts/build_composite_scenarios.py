#!/usr/bin/env python3
"""
Build 4 distinct, rich storybook scenario background paintings by compositing
and retouching master production art (rancho-de-essma-v1.png and sonora-world-map-landscape-v2.png)
with decor elements and atmospheric storybook lighting.
"""

import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance, ImageChops

ROOT = Path(__file__).resolve().parents[1]

def create_color_layer(size, color):
    return Image.new("RGBA", size, color)

def build_scenarios():
    scenarios_dir = ROOT / "public/assets/scenarios/v1"
    thumbs_dir = scenarios_dir / "thumbnails"
    scenarios_dir.mkdir(parents=True, exist_ok=True)
    thumbs_dir.mkdir(parents=True, exist_ok=True)

    rancho_path = ROOT / "public/assets/rancho-de-essma-v1.png"
    map_path = ROOT / "public/assets/world/v2/sonora-world-map-landscape-v2.png"
    decor_dir = ROOT / "public/assets/decor/v1"

    rancho = Image.open(rancho_path).convert("RGBA")
    w, h = rancho.size  # 1672, 941

    map_img = Image.open(map_path).convert("RGBA").resize((w, h), Image.Resampling.LANCZOS)

    # Helper to load decor item
    def load_decor(name):
        p = decor_dir / f"{name}.png"
        if p.exists():
            return Image.open(p).convert("RGBA")
        return None

    # 1. Patio Central: The original master adobe courtyard
    patio = rancho.copy()
    patio.save(scenarios_dir / "patio-central.png")
    patio.resize((256, 144), Image.Resampling.LANCZOS).save(thumbs_dir / "patio-central.png")

    # 2. El Huerto: Lush Orchard & Garden View
    # We blend map's lush green valley into the background and add garden elements
    huerto = rancho.copy()
    # Mask out the sky & upper background with map green valley
    mask_h = Image.new("L", (w, h), 0)
    draw_mh = ImageDraw.Draw(mask_h)
    draw_mh.rectangle([(0, 0), (w, int(h * 0.65))], fill=255)
    mask_h = mask_h.filter(ImageFilter.GaussianBlur(40))

    # Blend map green valley
    map_huerto = map_img.filter(ImageFilter.GaussianBlur(2))
    huerto = Image.composite(map_huerto, huerto, mask_h)

    # Add green garden tint
    overlay_h = create_color_layer((w, h), (40, 100, 50, 40))
    huerto = Image.alpha_composite(huerto, overlay_h)

    # Composite garden flower pots into background landscape
    girasol = load_decor("maceta-girasol")
    if girasol:
        g1 = girasol.resize((220, 220), Image.Resampling.LANCZOS)
        huerto.paste(g1, (120, 520), g1)
        g2 = girasol.resize((180, 180), Image.Resampling.LANCZOS)
        huerto.paste(g2, (1380, 540), g2)

    cajon = load_decor("cajon-cosecha")
    if cajon:
        c1 = cajon.resize((200, 200), Image.Resampling.LANCZOS)
        huerto.paste(c1, (340, 580), c1)

    huerto.save(scenarios_dir / "el-huerto.png")
    huerto.resize((256, 144), Image.Resampling.LANCZOS).save(thumbs_dir / "el-huerto.png")

    # 3. El Corral: Warm Terracotta Ranch Yard & Hills
    corral = rancho.copy()
    # Mirror landscape horizontally for a different perspective layout
    corral_flipped = ImageChops.duplicate(rancho).transpose(Image.FLIP_LEFT_RIGHT)
    # Blend flipped background for distinct architectural composition
    mask_c = Image.new("L", (w, h), 0)
    draw_mc = ImageDraw.Draw(mask_c)
    draw_mc.rectangle([(0, 0), (w, int(h * 0.70))], fill=200)
    mask_c = mask_c.filter(ImageFilter.GaussianBlur(30))
    corral = Image.composite(corral_flipped, corral, mask_c)

    # Warm Sonoran terracotta/amber sunlight overlay
    overlay_c = create_color_layer((w, h), (180, 90, 30, 45))
    corral = Image.alpha_composite(corral, overlay_c)

    banca = load_decor("banca-mesquite")
    if banca:
        b1 = banca.resize((260, 260), Image.Resampling.LANCZOS)
        corral.paste(b1, (1120, 520), b1)

    corral.save(scenarios_dir / "el-corral.png")
    corral.resize((256, 144), Image.Resampling.LANCZOS).save(thumbs_dir / "el-corral.png")

    # 4. La Terraza: Sunset Violet & Gold Twilight View
    terraza = rancho.copy()
    # Blend map sunset upper sky & desert mountain silhouettes
    mask_t = Image.new("L", (w, h), 0)
    draw_mt = ImageDraw.Draw(mask_t)
    draw_mt.rectangle([(0, 0), (w, int(h * 0.55))], fill=255)
    mask_t = mask_t.filter(ImageFilter.GaussianBlur(50))

    map_sunset = ImageEnhance.Color(map_img).enhance(1.4)
    terraza = Image.composite(map_sunset, terraza, mask_t)

    # Rich violet and golden sunset overlay
    overlay_t = create_color_layer((w, h), (120, 40, 90, 65))
    terraza = Image.alpha_composite(terraza, overlay_t)

    # Sunset glowing warm light
    sun_glow = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw_sg = ImageDraw.Draw(sun_glow)
    draw_sg.ellipse([(w//2 - 250, 150), (w//2 + 250, 650)], fill=(255, 180, 80, 70))
    sun_glow = sun_glow.filter(ImageFilter.GaussianBlur(80))
    terraza = Image.alpha_composite(terraza, sun_glow)

    farol = load_decor("farol-papel")
    if farol:
        f1 = farol.resize((160, 160), Image.Resampling.LANCZOS)
        terraza.paste(f1, (200, 440), f1)
        terraza.paste(f1, (1320, 440), f1)

    terraza.save(scenarios_dir / "la-terraza.png")
    terraza.resize((256, 144), Image.Resampling.LANCZOS).save(thumbs_dir / "la-terraza.png")

    print("✓ Composite master storybook scenario paintings created in public/assets/scenarios/v1/")

if __name__ == "__main__":
    build_scenarios()
