#!/usr/bin/env python3
"""
Build 4 distinct, handcrafted 2D storybook scenario backgrounds and thumbnails
for Essma World without relying on external API generation.
"""

import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance

ROOT = Path(__file__).resolve().parents[1]

def create_gradient(width, height, top_color, bottom_color):
    """Creates a smooth vertical color gradient image."""
    img = Image.new("RGBA", (width, height))
    draw = ImageDraw.Draw(img)
    for y in range(height):
        r = int(top_color[0] + (bottom_color[0] - top_color[0]) * y / height)
        g = int(top_color[1] + (bottom_color[1] - top_color[1]) * y / height)
        b = int(top_color[2] + (bottom_color[2] - top_color[2]) * y / height)
        draw.line([(0, y), (width, y)], fill=(r, g, b, 255))
    return img

def build_scenarios():
    scenarios_dir = ROOT / "public/assets/scenarios/v1"
    thumbs_dir = scenarios_dir / "thumbnails"
    scenarios_dir.mkdir(parents=True, exist_ok=True)
    thumbs_dir.mkdir(parents=True, exist_ok=True)

    rancho_src = ROOT / "public/assets/rancho-de-essma-v1.png"
    base = Image.open(rancho_src).convert("RGBA")
    w, h = base.size  # 1280, 720

    # -------------------------------------------------------------
    # 1. Patio Central: The original beloved Adobe Patio
    # -------------------------------------------------------------
    patio = base.copy()
    patio.save(scenarios_dir / "patio-central.png")
    patio.resize((256, 144), Image.Resampling.LANCZOS).save(thumbs_dir / "patio-central.png")

    # -------------------------------------------------------------
    # 2. El Huerto: Lush Green Orchard Garden
    # -------------------------------------------------------------
    # Sky: fresh morning blue to soft yellow
    huerto = create_gradient(w, h, (140, 200, 230), (245, 230, 180))
    draw_h = ImageDraw.Draw(huerto)

    # Distant green mountains
    draw_h.polygon([(0, 380), (320, 260), (680, 390)], fill=(100, 150, 110, 255))
    draw_h.polygon([(450, 390), (850, 250), (1280, 360)], fill=(80, 135, 95, 255))

    # Orchard Soil & Grass Ground
    draw_h.rectangle([(0, 360), (w, h)], fill=(125, 168, 88, 255))
    draw_h.polygon([(0, 480), (w, 420), (w, h), (0, h)], fill=(90, 138, 62, 255))

    # Garden Rows / Pathways
    for x in range(100, 1200, 220):
        draw_h.polygon([(x, 480), (x + 80, 480), (x + 120, h), (x - 20, h)], fill=(145, 105, 65, 220))

    # Citrus Trees & Nopales
    def draw_citrus_tree(x, y, scale=1.0):
        # Trunk
        tw = int(30 * scale)
        th = int(120 * scale)
        draw_h.rectangle([(x - tw//2, y - th), (x + tw//2, y)], fill=(105, 65, 35, 255))
        # Foliage blobs
        r = int(70 * scale)
        draw_h.ellipse([(x - r, y - th - r), (x + r, y - th + r//2)], fill=(55, 125, 45, 255))
        draw_h.ellipse([(x - int(r*0.8), y - th - int(r*1.2)), (x + int(r*0.8), y - th)], fill=(75, 155, 55, 255))
        # Oranges
        for ox, oy in [(x-25, y-th-10), (x+20, y-th-30), (x-10, y-th+10), (x+30, y-th+5)]:
            draw_h.ellipse([(ox-6, oy-6), (ox+6, oy+6)], fill=(245, 130, 25, 255))

    draw_citrus_tree(180, 480, scale=1.1)
    draw_citrus_tree(420, 450, scale=0.9)
    draw_citrus_tree(950, 470, scale=1.15)
    draw_citrus_tree(1150, 440, scale=0.85)

    # Saguaro Silhouette in Background
    def draw_saguaro(x, y, h_sag=100):
        draw_h.rectangle([(x-8, y-h_sag), (x+8, y)], fill=(45, 95, 45, 255))
        draw_h.rectangle([(x-24, y-int(h_sag*0.7)), (x-8, y-int(h_sag*0.6))], fill=(45, 95, 45, 255))
        draw_h.rectangle([(x-24, y-int(h_sag*0.85)), (x-16, y-int(h_sag*0.6))], fill=(45, 95, 45, 255))
        draw_h.rectangle([(x+8, y-int(h_sag*0.6)), (x+24, y-int(h_sag*0.5))], fill=(45, 95, 45, 255))
        draw_h.rectangle([(x+16, y-int(h_sag*0.75)), (x+24, y-int(h_sag*0.5))], fill=(45, 95, 45, 255))

    draw_saguaro(620, 390, h_sag=90)
    draw_saguaro(720, 395, h_sag=75)

    # Garden Fence
    draw_h.line([(0, 430), (w, 430)], fill=(200, 170, 130, 255), width=5)
    for fx in range(50, w, 100):
        draw_h.rectangle([(fx-4, 410), (fx+4, 460)], fill=(180, 145, 105, 255))

    huerto.save(scenarios_dir / "el-huerto.png")
    huerto.resize((256, 144), Image.Resampling.LANCZOS).save(thumbs_dir / "el-huerto.png")

    # -------------------------------------------------------------
    # 3. El Corral: Rustic Wooden Animal Yard & Barn
    # -------------------------------------------------------------
    corral = create_gradient(w, h, (235, 175, 120), (250, 215, 160))
    draw_c = ImageDraw.Draw(corral)

    # Sonoran Desert Red Hills
    draw_c.polygon([(0, 360), (400, 240), (850, 370)], fill=(195, 105, 65, 255))
    draw_c.polygon([(600, 370), (1000, 220), (1280, 340)], fill=(175, 85, 50, 255))

    # Barn Roof on Left
    draw_c.polygon([(0, 200), (260, 140), (480, 280), (0, 320)], fill=(155, 55, 40, 255))
    draw_c.rectangle([(0, 280), (420, 420)], fill=(125, 75, 50, 255))

    # Dirt Ground
    draw_c.rectangle([(0, 400), (w, h)], fill=(195, 140, 85, 255))
    draw_c.polygon([(0, 460), (w, 430), (w, h), (0, h)], fill=(175, 120, 65, 255))

    # Split rail wooden fence across the corral
    draw_c.line([(0, 450), (w, 450)], fill=(115, 70, 40, 255), width=8)
    draw_c.line([(0, 480), (w, 480)], fill=(115, 70, 40, 255), width=8)
    for fx in range(60, w, 140):
        draw_c.rectangle([(fx-6, 420), (fx+6, 510)], fill=(95, 55, 30, 255))

    # Hay Bales & Water Trough
    def draw_hay_bale(x, y):
        draw_c.rectangle([(x, y-40), (x+70, y)], fill=(225, 190, 75, 255))
        draw_c.line([(x+20, y-40), (x+20, y)], fill=(170, 130, 40, 255), width=2)
        draw_c.line([(x+50, y-40), (x+50, y)], fill=(170, 130, 40, 255), width=2)

    draw_hay_bale(500, 490)
    draw_hay_bale(560, 490)
    draw_hay_bale(530, 455)

    # Wooden Water Trough
    draw_c.rectangle([(850, 470), (1050, 520)], fill=(105, 65, 35, 255))
    draw_c.rectangle([(855, 475), (1045, 500)], fill=(75, 135, 175, 255))  # Water

    corral.save(scenarios_dir / "el-corral.png")
    corral.resize((256, 144), Image.Resampling.LANCZOS).save(thumbs_dir / "el-corral.png")

    # -------------------------------------------------------------
    # 4. La Terraza: Sunset Golden Hour Veranda
    # -------------------------------------------------------------
    terraza = create_gradient(w, h, (95, 55, 115), (245, 135, 85))
    draw_t = ImageDraw.Draw(terraza)

    # Giant Setting Sun
    draw_t.ellipse([(w//2 - 120, 260), (w//2 + 120, 500)], fill=(255, 215, 110, 255))

    # Saguaro & Mountain Silhouettes against sunset
    draw_t.polygon([(0, 420), (350, 310), (700, 430)], fill=(75, 35, 65, 255))
    draw_t.polygon([(550, 430), (950, 290), (1280, 410)], fill=(60, 25, 50, 255))

    def draw_twilight_saguaro(x, y, h_sag=120):
        draw_t.rectangle([(x-10, y-h_sag), (x+10, y)], fill=(40, 15, 35, 255))
        draw_t.rectangle([(x-30, y-int(h_sag*0.7)), (x-10, y-int(h_sag*0.6))], fill=(40, 15, 35, 255))
        draw_t.rectangle([(x-30, y-int(h_sag*0.9)), (x-20, y-int(h_sag*0.6))], fill=(40, 15, 35, 255))
        draw_t.rectangle([(x+10, y-int(h_sag*0.6)), (x+30, y-int(h_sag*0.5))], fill=(40, 15, 35, 255))
        draw_t.rectangle([(x+20, y-int(h_sag*0.8)), (x+30, y-int(h_sag*0.5))], fill=(40, 15, 35, 255))

    draw_twilight_saguaro(200, 420, 130)
    draw_twilight_saguaro(1080, 410, 140)

    # Terracotta Tile Terrace Floor
    draw_t.rectangle([(0, 420), (w, h)], fill=(185, 85, 55, 255))
    # Grid lines for terracotta tiles
    for x in range(0, w, 80):
        draw_t.line([(x, 420), (x, h)], fill=(145, 60, 40, 255), width=2)
    for y in range(420, h, 40):
        draw_t.line([(0, y), (w, y)], fill=(145, 60, 40, 255), width=2)

    # Carved Wooden Pergola Beams & Lanterns along top
    draw_t.rectangle([(0, 0), (w, 40)], fill=(95, 45, 30, 255))
    for bx in range(40, w, 120):
        draw_t.rectangle([(bx, 0), (bx+20, 70)], fill=(80, 35, 20, 255))
        # Hanging warm paper lantern
        draw_t.line([(bx+10, 70), (bx+10, 95)], fill=(40, 20, 10, 255), width=2)
        draw_t.ellipse([(bx-2, 95), (bx+22, 125)], fill=(255, 210, 100, 255))

    terraza.save(scenarios_dir / "la-terraza.png")
    terraza.resize((256, 144), Image.Resampling.LANCZOS).save(thumbs_dir / "la-terraza.png")

    print("✓ Handcrafted distinct 2D storybook scenario backgrounds created in public/assets/scenarios/v1/")

if __name__ == "__main__":
    build_scenarios()
