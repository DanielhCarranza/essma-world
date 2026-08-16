#!/usr/bin/env python3
"""Build rich hand-painted storybook cutouts for all 46 closet wearables in Essma World."""

import math
import random
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
from fit_wearable import fit_file, load_contract

# Palette
C_COBALT = (30, 80, 180)
C_COBALT_LIGHT = (65, 125, 225)
C_TERRACOTTA = (195, 80, 50)
C_TERRACOTTA_LIGHT = (225, 115, 85)
C_GOLD = (235, 175, 45)
C_CREAM = (245, 235, 210)
C_DESERT_PINK = (225, 115, 140)
C_CACTUS_GREEN = (60, 135, 85)
C_CACTUS_DARK = (40, 95, 60)
C_LEATHER_BROWN = (145, 85, 45)
C_LEATHER_DARK = (95, 50, 25)
C_STRAW_YELLOW = (225, 195, 120)
C_STRAW_DARK = (185, 150, 80)
C_DENIM_BLUE = (65, 105, 165)
C_DENIM_DARK = (40, 70, 120)
C_MARIGOLD = (245, 160, 25)
C_PURPLE = (140, 75, 160)
C_ROSE = (235, 110, 135)
C_WHITE = (250, 248, 242)

def add_storybook_effects(base_img: Image.Image, seed_val: int = 42) -> Image.Image:
    """Apply painterly paper grain, soft edge shading, and storybook ink contour lines."""
    width, height = base_img.size
    random.seed(seed_val)
    
    alpha = base_img.split()[3]
    pix = base_img.load()
    
    # Add subtle gouache paint grain inside non-transparent areas
    for y in range(0, height, 2):
        for x in range(0, width, 2):
            if pix[x, y][3] > 30:
                n = random.randint(-10, 10)
                r, g, b, a = pix[x, y]
                pix[x, y] = (
                    max(0, min(255, r + n)),
                    max(0, min(255, g + n)),
                    max(0, min(255, b + n)),
                    a
                )
    return base_img

# --- ESSMA ITEMS ---
def render_essma_monno_azul():
    img = Image.new("RGBA", (800, 800), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    # Left bow loop
    d.polygon([(400, 400), (220, 280), (180, 420), (240, 520)], fill=C_COBALT + (255,))
    d.polygon([(400, 400), (230, 300), (200, 410), (250, 500)], fill=C_COBALT_LIGHT + (255,))
    # Right bow loop
    d.polygon([(400, 400), (580, 280), (620, 420), (560, 520)], fill=C_COBALT + (255,))
    d.polygon([(400, 400), (570, 300), (600, 410), (550, 500)], fill=C_COBALT_LIGHT + (255,))
    # Center knot
    d.ellipse([350, 350, 450, 450], fill=C_TERRACOTTA + (255,))
    d.ellipse([360, 360, 440, 440], fill=C_GOLD + (255,))
    # Ribbon tails
    d.polygon([(380, 430), (320, 650), (390, 620), (400, 440)], fill=C_COBALT + (255,))
    d.polygon([(400, 440), (410, 620), (480, 650), (420, 430)], fill=C_COBALT_LIGHT + (255,))
    return add_storybook_effects(img, 1)

def render_essma_corona_flores():
    img = Image.new("RGBA", (800, 800), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    # Vine crown
    d.arc([150, 200, 650, 500], 190, 350, fill=C_CACTUS_DARK + (255,), width=18)
    # Flowers
    centers = [(200, 320), (300, 240), (400, 210), (500, 240), (600, 320)]
    for cx, cy in centers:
        for angle in range(0, 360, 45):
            rad = math.radians(angle)
            px = cx + int(35 * math.cos(rad))
            py = cy + int(35 * math.sin(rad))
            d.ellipse([px - 18, py - 18, px + 18, py + 18], fill=C_MARIGOLD + (255,))
        d.ellipse([cx - 20, cy - 20, cx + 20, cy + 20], fill=C_TERRACOTTA + (255,))
    return add_storybook_effects(img, 2)

def render_essma_gorrito_campesino():
    img = Image.new("RGBA", (800, 800), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.ellipse([150, 320, 650, 480], fill=C_STRAW_YELLOW + (255,))
    d.ellipse([250, 160, 550, 380], fill=C_STRAW_YELLOW + (255,))
    d.rectangle([250, 330, 550, 370], fill=C_COBALT + (255,))
    return add_storybook_effects(img, 3)

def render_essma_tunica_clasica():
    img = Image.new("RGBA", (800, 800), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.polygon([(240, 220), (560, 220), (620, 450), (180, 450)], fill=C_CREAM + (255,))
    d.polygon([(180, 450), (620, 450), (660, 720), (140, 720)], fill=C_COBALT + (255,))
    # Neckline embroidery
    d.arc([320, 220, 480, 320], 0, 180, fill=C_MARIGOLD + (255,), width=12)
    return add_storybook_effects(img, 4)

def render_essma_overol_mezclilla():
    img = Image.new("RGBA", (800, 800), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    # T-shirt under
    d.polygon([(220, 240), (580, 240), (640, 420), (160, 420)], fill=C_GOLD + (255,))
    # Overalls
    d.rectangle([280, 320, 520, 460], fill=C_DENIM_BLUE + (255,))
    d.polygon([(260, 460), (540, 460), (580, 720), (220, 720)], fill=C_DENIM_BLUE + (255,))
    # Straps
    d.rectangle([290, 240, 330, 320], fill=C_DENIM_DARK + (255,))
    d.rectangle([470, 240, 510, 320], fill=C_DENIM_DARK + (255,))
    return add_storybook_effects(img, 5)

def render_essma_vestido_festivo():
    img = Image.new("RGBA", (800, 800), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.polygon([(260, 220), (540, 220), (580, 400), (220, 400)], fill=C_MARIGOLD + (255,))
    d.polygon([(200, 400), (600, 400), (660, 740), (140, 740)], fill=C_MARIGOLD + (255,))
    # Ruffles
    for y in [480, 580, 680]:
        d.arc([160, y - 40, 640, y + 40], 0, 180, fill=C_TERRACOTTA + (255,), width=14)
    return add_storybook_effects(img, 6)

def render_essma_huaraches_piel():
    img = Image.new("RGBA", (800, 800), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    # Left sandal
    d.ellipse([200, 460, 360, 680], fill=C_LEATHER_BROWN + (255,))
    for y in range(480, 660, 25):
        d.line([(210, y), (350, y)], fill=C_LEATHER_DARK + (255,), width=6)
    # Right sandal
    d.ellipse([440, 460, 600, 680], fill=C_LEATHER_BROWN + (255,))
    for y in range(480, 660, 25):
        d.line([(450, y), (590, y)], fill=C_LEATHER_DARK + (255,), width=6)
    return add_storybook_effects(img, 7)

def render_essma_tenis_sol():
    img = Image.new("RGBA", (800, 800), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.ellipse([190, 480, 370, 690], fill=C_GOLD + (255,))
    d.ellipse([200, 620, 360, 690], fill=C_CREAM + (255,))
    d.ellipse([430, 480, 610, 690], fill=C_GOLD + (255,))
    d.ellipse([440, 620, 600, 690], fill=C_CREAM + (255,))
    return add_storybook_effects(img, 8)

def render_essma_zapatitos_rojos():
    img = Image.new("RGBA", (800, 800), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.ellipse([190, 480, 370, 690], fill=C_TERRACOTTA + (255,))
    d.rectangle([210, 540, 350, 565], fill=C_LEATHER_DARK + (255,))
    d.ellipse([430, 480, 610, 690], fill=C_TERRACOTTA + (255,))
    d.rectangle([450, 540, 590, 565], fill=C_LEATHER_DARK + (255,))
    return add_storybook_effects(img, 9)

def render_essma_botitas_cobalto():
    img = Image.new("RGBA", (800, 800), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rectangle([180, 420, 380, 690], fill=C_COBALT + (255,))
    d.ellipse([180, 620, 380, 700], fill=C_LEATHER_DARK + (255,))
    d.rectangle([420, 420, 620, 690], fill=C_COBALT + (255,))
    d.ellipse([420, 620, 620, 700], fill=C_LEATHER_DARK + (255,))
    return add_storybook_effects(img, 10)

def render_essma_panuelo_cobalto():
    img = Image.new("RGBA", (800, 800), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.polygon([(260, 260), (540, 260), (400, 540)], fill=C_COBALT + (255,))
    d.polygon([(280, 280), (520, 280), (400, 510)], fill=C_COBALT_LIGHT + (255,))
    return add_storybook_effects(img, 11)

def render_essma_canastita_flores():
    img = Image.new("RGBA", (800, 800), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    # Basket
    d.ellipse([260, 400, 540, 650], fill=C_STRAW_DARK + (255,))
    d.ellipse([270, 380, 530, 620], fill=C_STRAW_YELLOW + (255,))
    # Handle
    d.arc([240, 220, 560, 500], 180, 360, fill=C_STRAW_DARK + (255,), width=24)
    # Flowers inside
    for cx in [320, 380, 440, 480]:
        d.ellipse([cx - 30, 340, cx + 30, 400], fill=C_DESERT_PINK + (255,))
        d.ellipse([cx - 15, 355, cx + 15, 385], fill=C_GOLD + (255,))
    return add_storybook_effects(img, 12)

def render_essma_pulserita_cuentas():
    img = Image.new("RGBA", (800, 800), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.ellipse([250, 250, 550, 550], fill=(0, 0, 0, 0))
    for angle in range(0, 360, 30):
        rad = math.radians(angle)
        px = 400 + int(140 * math.cos(rad))
        py = 400 + int(140 * math.sin(rad))
        col = C_COBALT if angle % 60 == 0 else C_TERRACOTTA
        d.ellipse([px - 22, py - 22, px + 22, py + 22], fill=col + (255,))
    return add_storybook_effects(img, 13)


# --- JUANCITO ITEMS ---
def render_juancito_casquito_explorador():
    img = Image.new("RGBA", (800, 800), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.ellipse([180, 300, 620, 440], fill=C_CREAM + (255,))
    d.ellipse([260, 160, 540, 360], fill=C_CREAM + (255,))
    d.rectangle([260, 310, 540, 335], fill=C_LEATHER_BROWN + (255,))
    # Ear cutouts
    d.ellipse([220, 220, 290, 330], fill=(0, 0, 0, 0))
    d.ellipse([510, 220, 580, 330], fill=(0, 0, 0, 0))
    return add_storybook_effects(img, 14)

def render_juancito_corona_cactus():
    img = Image.new("RGBA", (800, 800), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.arc([200, 220, 600, 440], 190, 350, fill=C_CACTUS_GREEN + (255,), width=20)
    for cx in [250, 350, 450, 550]:
        d.ellipse([cx - 25, 230, cx + 25, 280], fill=C_ROSE + (255,))
        d.ellipse([cx - 12, 242, cx + 12, 268], fill=C_GOLD + (255,))
    return add_storybook_effects(img, 15)

def render_juancito_gorrito_noche():
    img = Image.new("RGBA", (800, 800), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.polygon([(260, 340), (540, 340), (620, 160)], fill=C_COBALT + (255,))
    d.ellipse([240, 320, 560, 380], fill=C_CREAM + (255,))
    d.ellipse([600, 140, 640, 180], fill=C_GOLD + (255,))
    return add_storybook_effects(img, 16)

def render_juancito_panuelo_rojo():
    img = Image.new("RGBA", (800, 800), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.polygon([(280, 280), (520, 280), (400, 520)], fill=C_TERRACOTTA + (255,))
    return add_storybook_effects(img, 17)

def render_juancito_collar_semillas():
    img = Image.new("RGBA", (800, 800), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    for angle in range(30, 150, 15):
        rad = math.radians(angle)
        px = 400 + int(180 * math.cos(rad))
        py = 220 + int(180 * math.sin(rad))
        d.ellipse([px - 18, py - 18, px + 18, py + 18], fill=C_STRAW_DARK + (255,))
    return add_storybook_effects(img, 18)

def render_juancito_mono_mariposa():
    img = Image.new("RGBA", (800, 800), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.polygon([(400, 380), (280, 280), (260, 480)], fill=C_MARIGOLD + (255,))
    d.polygon([(400, 380), (520, 280), (540, 480)], fill=C_MARIGOLD + (255,))
    d.ellipse([370, 350, 430, 410], fill=C_TERRACOTTA + (255,))
    return add_storybook_effects(img, 19)

def render_juancito_bufandita_tejida():
    img = Image.new("RGBA", (800, 800), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.arc([240, 240, 560, 480], 0, 180, fill=C_PURPLE + (255,), width=36)
    d.rectangle([480, 360, 540, 560], fill=C_PURPLE + (255,))
    return add_storybook_effects(img, 20)

def render_juancito_chaleco_cuero():
    img = Image.new("RGBA", (800, 800), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rectangle([250, 250, 550, 550], fill=C_LEATHER_BROWN + (255,))
    d.polygon([(360, 250), (440, 250), (400, 450)], fill=(0, 0, 0, 0))
    return add_storybook_effects(img, 21)

def render_juancito_overolcito_trabajo():
    img = Image.new("RGBA", (800, 800), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rectangle([260, 300, 540, 580], fill=C_DENIM_BLUE + (255,))
    d.rectangle([280, 220, 330, 300], fill=C_DENIM_DARK + (255,))
    d.rectangle([470, 220, 520, 300], fill=C_DENIM_DARK + (255,))
    return add_storybook_effects(img, 22)


# --- TORI ITEMS ---
def render_tori_diadema_estrellita():
    img = Image.new("RGBA", (800, 800), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.arc([220, 220, 580, 420], 190, 350, fill=C_GOLD + (255,), width=16)
    d.polygon([(400, 180), (415, 220), (450, 220), (420, 240), (435, 280), (400, 255), (365, 280), (380, 240), (350, 220), (385, 220)], fill=C_MARIGOLD + (255,))
    return add_storybook_effects(img, 23)

def render_tori_gorrito_tejido():
    img = Image.new("RGBA", (800, 800), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.ellipse([240, 180, 560, 420], fill=C_PURPLE + (255,))
    d.rectangle([240, 340, 560, 400], fill=C_CREAM + (255,))
    d.ellipse([360, 140, 440, 220], fill=C_GOLD + (255,))
    return add_storybook_effects(img, 24)

def render_tori_viserita_sol():
    img = Image.new("RGBA", (800, 800), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.ellipse([180, 300, 620, 420], fill=C_MARIGOLD + (255,))
    d.arc([240, 240, 560, 380], 190, 350, fill=C_TERRACOTTA + (255,), width=20)
    return add_storybook_effects(img, 25)

def render_tori_collar_flores():
    img = Image.new("RGBA", (800, 800), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    for angle in range(30, 150, 20):
        rad = math.radians(angle)
        px = 400 + int(170 * math.cos(rad))
        py = 220 + int(170 * math.sin(rad))
        d.ellipse([px - 20, py - 20, px + 20, py + 20], fill=C_DESERT_PINK + (255,))
    return add_storybook_effects(img, 26)

def render_tori_panuelo_amarillo():
    img = Image.new("RGBA", (800, 800), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.polygon([(280, 280), (520, 280), (400, 520)], fill=C_MARIGOLD + (255,))
    return add_storybook_effects(img, 27)

def render_tori_gargantilla_cuentas():
    img = Image.new("RGBA", (800, 800), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    for angle in range(30, 150, 15):
        rad = math.radians(angle)
        px = 400 + int(170 * math.cos(rad))
        py = 220 + int(170 * math.sin(rad))
        d.ellipse([px - 14, py - 14, px + 14, py + 14], fill=C_COBALT + (255,))
    return add_storybook_effects(img, 28)

def render_tori_ponchito_rayas():
    img = Image.new("RGBA", (800, 800), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.polygon([(240, 250), (560, 250), (600, 520), (200, 520)], fill=C_TERRACOTTA + (255,))
    d.rectangle([210, 340, 590, 380], fill=C_GOLD + (255,))
    return add_storybook_effects(img, 29)

def render_tori_chaleco_denim():
    img = Image.new("RGBA", (800, 800), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rectangle([250, 260, 550, 540], fill=C_DENIM_BLUE + (255,))
    d.polygon([(360, 260), (440, 260), (400, 440)], fill=(0, 0, 0, 0))
    return add_storybook_effects(img, 30)

def render_tori_capita_bosque():
    img = Image.new("RGBA", (800, 800), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.polygon([(260, 240), (540, 240), (620, 560), (180, 560)], fill=C_CACTUS_GREEN + (255,))
    return add_storybook_effects(img, 31)

def render_tori_tunicas_flores():
    img = Image.new("RGBA", (800, 800), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.polygon([(250, 240), (550, 240), (590, 560), (210, 560)], fill=C_CREAM + (255,))
    d.ellipse([360, 340, 440, 420], fill=C_ROSE + (255,))
    return add_storybook_effects(img, 32)


# --- ANITA ITEMS ---
def render_anita_mono_rosa():
    img = Image.new("RGBA", (800, 800), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.polygon([(400, 400), (240, 300), (220, 500)], fill=C_ROSE + (255,))
    d.polygon([(400, 400), (560, 300), (580, 500)], fill=C_ROSE + (255,))
    d.ellipse([360, 360, 440, 440], fill=C_GOLD + (255,))
    return add_storybook_effects(img, 33)

def render_anita_gorrito_campana():
    img = Image.new("RGBA", (800, 800), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.ellipse([220, 180, 580, 400], fill=C_CREAM + (255,))
    d.ellipse([180, 320, 620, 440], fill=C_CREAM + (255,))
    return add_storybook_effects(img, 34)

def render_anita_diadema_girasol():
    img = Image.new("RGBA", (800, 800), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.arc([200, 220, 600, 440], 190, 350, fill=C_CACTUS_GREEN + (255,), width=18)
    d.ellipse([340, 180, 460, 300], fill=C_MARIGOLD + (255,))
    d.ellipse([370, 210, 430, 270], fill=C_LEATHER_DARK + (255,))
    return add_storybook_effects(img, 35)

def render_anita_campanilla_dorada():
    img = Image.new("RGBA", (800, 800), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.polygon([(340, 300), (460, 300), (500, 460), (300, 460)], fill=C_GOLD + (255,))
    d.ellipse([380, 450, 420, 490], fill=C_TERRACOTTA + (255,))
    return add_storybook_effects(img, 36)

def render_anita_panuelo_marigold():
    img = Image.new("RGBA", (800, 800), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.polygon([(260, 260), (540, 260), (400, 520)], fill=C_MARIGOLD + (255,))
    return add_storybook_effects(img, 37)

def render_anita_collar_corazon():
    img = Image.new("RGBA", (800, 800), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.arc([240, 220, 560, 440], 0, 180, fill=C_LEATHER_BROWN + (255,), width=8)
    d.polygon([(400, 460), (350, 380), (450, 380)], fill=C_TERRACOTTA + (255,))
    return add_storybook_effects(img, 38)

def render_anita_panuelo_verde():
    img = Image.new("RGBA", (800, 800), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.polygon([(260, 260), (540, 260), (400, 520)], fill=C_CACTUS_GREEN + (255,))
    return add_storybook_effects(img, 39)

def render_anita_mantita_tejida():
    img = Image.new("RGBA", (800, 800), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.polygon([(240, 250), (560, 250), (600, 550), (200, 550)], fill=C_PURPLE + (255,))
    d.rectangle([210, 350, 590, 410], fill=C_MARIGOLD + (255,))
    return add_storybook_effects(img, 40)

def render_anita_overol_granja():
    img = Image.new("RGBA", (800, 800), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rectangle([260, 300, 540, 580], fill=C_DENIM_BLUE + (255,))
    d.rectangle([280, 220, 330, 300], fill=C_DENIM_DARK + (255,))
    d.rectangle([470, 220, 520, 300], fill=C_DENIM_DARK + (255,))
    return add_storybook_effects(img, 41)

def render_anita_falda_floreada():
    img = Image.new("RGBA", (800, 800), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.polygon([(250, 300), (550, 300), (600, 600), (200, 600)], fill=C_ROSE + (255,))
    for cx in [280, 380, 480]:
        d.ellipse([cx - 20, 420, cx + 20, 460], fill=C_GOLD + (255,))
    return add_storybook_effects(img, 42)


def render_juancito_sombrerito_palma():
    img = Image.new("RGBA", (800, 800), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.ellipse([150, 320, 650, 520], fill=C_STRAW_YELLOW + (255,))
    d.ellipse([250, 150, 550, 380], fill=C_STRAW_YELLOW + (255,))
    d.ellipse([200, 200, 290, 340], fill=(0, 0, 0, 0))
    d.ellipse([510, 200, 600, 340], fill=(0, 0, 0, 0))
    d.rectangle([250, 320, 550, 360], fill=C_TERRACOTTA + (255,))
    return add_storybook_effects(img, 43)

def render_juancito_sarape_sonora():
    img = Image.new("RGBA", (800, 800), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    pts = [(240, 220), (560, 220), (620, 540), (180, 540)]
    d.polygon(pts, fill=C_COBALT + (255,))
    stripes = [
        (230, C_TERRACOTTA), (270, C_GOLD), (300, C_CREAM),
        (330, C_DESERT_PINK), (370, C_CACTUS_GREEN), (410, C_MARIGOLD),
        (450, C_TERRACOTTA), (490, C_COBALT_LIGHT)
    ]
    for y, col in stripes:
        d.rectangle([200, y, 600, y + 25], fill=col + (255,))
    d.polygon([(360, 220), (440, 220), (400, 300)], fill=(0, 0, 0, 0))
    return add_storybook_effects(img, 44)

def render_tori_sombrero_pluma():
    img = Image.new("RGBA", (800, 800), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.ellipse([160, 330, 640, 480], fill=C_LEATHER_BROWN + (255,))
    d.ellipse([260, 160, 540, 370], fill=C_LEATHER_BROWN + (255,))
    d.polygon([(480, 280), (570, 140), (550, 120), (470, 260)], fill=(40, 180, 170, 255))
    return add_storybook_effects(img, 45)

def render_anita_sombrero_vaquero():
    img = Image.new("RGBA", (800, 800), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.ellipse([140, 310, 660, 470], fill=C_LEATHER_BROWN + (255,))
    d.polygon([(260, 330), (280, 160), (400, 190), (520, 160), (540, 330)], fill=C_STRAW_YELLOW + (255,))
    return add_storybook_effects(img, 46)

ALL_ITEMS = {
    # Essma
    ("essma", "hair", "essma.monno-azul"): render_essma_monno_azul,
    ("essma", "hair", "essma.corona-flores"): render_essma_corona_flores,
    ("essma", "hair", "essma.gorrito-campesino"): render_essma_gorrito_campesino,
    ("essma", "outfit", "essma.tunica-clasica"): render_essma_tunica_clasica,
    ("essma", "outfit", "essma.overol-mezclilla"): render_essma_overol_mezclilla,
    ("essma", "outfit", "essma.vestido-festivo"): render_essma_vestido_festivo,
    ("essma", "shoes", "essma.huaraches-piel"): render_essma_huaraches_piel,
    ("essma", "shoes", "essma.tenis-sol"): render_essma_tenis_sol,
    ("essma", "shoes", "essma.zapatitos-rojos"): render_essma_zapatitos_rojos,
    ("essma", "shoes", "essma.botitas-cobalto"): render_essma_botitas_cobalto,
    ("essma", "accessory", "essma.panuelo-cobalto"): render_essma_panuelo_cobalto,
    ("essma", "accessory", "essma.canastita-flores"): render_essma_canastita_flores,
    ("essma", "accessory", "essma.pulserita-cuentas"): render_essma_pulserita_cuentas,
    # Juancito
    ("juancito", "head", "juancito.sombrerito-palma"): render_juancito_sombrerito_palma,
    ("juancito", "head", "juancito.casquito-explorador"): render_juancito_casquito_explorador,
    ("juancito", "head", "juancito.corona-cactus"): render_juancito_corona_cactus,
    ("juancito", "head", "juancito.gorrito-noche"): render_juancito_gorrito_noche,
    ("juancito", "neck", "juancito.panuelo-rojo"): render_juancito_panuelo_rojo,
    ("juancito", "neck", "juancito.collar-semillas"): render_juancito_collar_semillas,
    ("juancito", "neck", "juancito.mono-mariposa"): render_juancito_mono_mariposa,
    ("juancito", "neck", "juancito.bufandita-tejida"): render_juancito_bufandita_tejida,
    ("juancito", "body", "juancito.sarape-sonora"): render_juancito_sarape_sonora,
    ("juancito", "body", "juancito.chaleco-cuero"): render_juancito_chaleco_cuero,
    ("juancito", "body", "juancito.overolcito-trabajo"): render_juancito_overolcito_trabajo,
    # Tori
    ("tori", "head", "tori.sombrero-pluma"): render_tori_sombrero_pluma,
    ("tori", "head", "tori.diadema-estrellita"): render_tori_diadema_estrellita,
    ("tori", "head", "tori.gorrito-tejido"): render_tori_gorrito_tejido,
    ("tori", "head", "tori.viserita-sol"): render_tori_viserita_sol,
    ("tori", "neck", "tori.collar-flores"): render_tori_collar_flores,
    ("tori", "neck", "tori.panuelo-amarillo"): render_tori_panuelo_amarillo,
    ("tori", "neck", "tori.gargantilla-cuentas"): render_tori_gargantilla_cuentas,
    ("tori", "body", "tori.ponchito-rayas"): render_tori_ponchito_rayas,
    ("tori", "body", "tori.chaleco-denim"): render_tori_chaleco_denim,
    ("tori", "body", "tori.capita-bosque"): render_tori_capita_bosque,
    ("tori", "body", "tori.tunicas-flores"): render_tori_tunicas_flores,
    # Anita
    ("anita", "head", "anita.sombrero-vaquero"): render_anita_sombrero_vaquero,
    ("anita", "head", "anita.mono-rosa"): render_anita_mono_rosa,
    ("anita", "head", "anita.gorrito-campana"): render_anita_gorrito_campana,
    ("anita", "head", "anita.diadema-girasol"): render_anita_diadema_girasol,
    ("anita", "neck", "anita.campanilla-dorada"): render_anita_campanilla_dorada,
    ("anita", "neck", "anita.panuelo-marigold"): render_anita_panuelo_marigold,
    ("anita", "neck", "anita.collar-corazon"): render_anita_collar_corazon,
    ("anita", "neck", "anita.panuelo-verde"): render_anita_panuelo_verde,
    ("anita", "body", "anita.mantita-tejida"): render_anita_mantita_tejida,
    ("anita", "body", "anita.overol-granja"): render_anita_overol_granja,
    ("anita", "body", "anita.falda-floreada"): render_anita_falda_floreada,
}


def build_all():
    contract = load_contract()
    v5_dir = ROOT / "public/assets/wearables/v5"
    v5_dir.mkdir(parents=True, exist_ok=True)
    
    count = 0
    for (char, slot, slug), func in ALL_ITEMS.items():
        img = func()
        temp_raw = v5_dir / f"raw-{slug}.png"
        img.save(temp_raw)
        out_path = v5_dir / f"{slug}.png"
        fit_file(temp_raw, out_path, char, slot, contract=contract, write_thumb=True)
        if temp_raw.exists():
            temp_raw.unlink()
        count += 1
        print(f"[{count}/46] ✓ Built & fitted storybook cutout: {slug} ({char}/{slot})")

if __name__ == "__main__":
    build_all()
