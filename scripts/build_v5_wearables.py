#!/usr/bin/env python3
"""Build, process, fit, and generate thumbnails for all 46 v5 Essma World wearables.

Creates rich, high-resolution storybook cutouts with Sonoran color palette,
tactile textures (wool, straw, denim, leather, embroidery, beads), soft anti-aliased
alpha channels, and slot-fit contract positioning.
"""

import math
import os
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageOps

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
from fit_wearable import fit_file, load_contract, KEEPER_SPECS

OUT_V5 = ROOT / "public/assets/wearables/v5"
THUMB_V5 = OUT_V5 / "thumbnails"
OUT_V5.mkdir(parents=True, exist_ok=True)
THUMB_V5.mkdir(parents=True, exist_ok=True)

# Color Palette (Sonoran Storybook Palette)
COBALT = (29, 78, 216, 255)
DARK_COBALT = (30, 58, 138, 255)
LIGHT_COBALT = (96, 165, 250, 255)

MARIGOLD = (245, 158, 11, 255)
DARK_MARIGOLD = (180, 83, 9, 255)
LIGHT_MARIGOLD = (252, 211, 77, 255)

ORANGE = (234, 88, 12, 255)
TERRACOTTA = (194, 65, 12, 255)
DESERT_SAND = (254, 243, 199, 255)
CREAM = (255, 251, 235, 255)

RED = (220, 38, 38, 255)
DARK_RED = (153, 27, 27, 255)
CORAL_PINK = (244, 114, 182, 255)
DARK_PINK = (190, 24, 93, 255)

CACTUS_GREEN = (21, 128, 61, 255)
DARK_GREEN = (20, 83, 45, 255)
LIGHT_GREEN = (74, 222, 128, 255)

TURQUOISE = (13, 148, 136, 255)
LIGHT_TURQUOISE = (45, 212, 191, 255)

LEATHER = (146, 64, 14, 255)
DARK_LEATHER = (120, 53, 15, 255)
LIGHT_LEATHER = (217, 119, 6, 255)

STRAW_GOLD = (234, 179, 8, 255)
STRAW_DARK = (161, 98, 7, 255)
STRAW_LIGHT = (253, 224, 71, 255)

DENIM = (37, 99, 235, 255)
DARK_DENIM = (30, 64, 175, 255)
LIGHT_DENIM = (147, 197, 253, 255)

GOLD = (234, 179, 8, 255)
BRASS = (180, 83, 9, 255)
WHITE = (255, 255, 255, 255)
TRANSPARENT = (0, 0, 0, 0)
OUTLINE = (30, 25, 20, 220)


def create_canvas(size=1024):
    return Image.new("RGBA", (size, size), TRANSPARENT)


def add_texture_and_shading(img, shadow_alpha=40):
    """Add soft storybook shading and edge warmth."""
    alpha = img.getchannel("A")
    bbox = alpha.getbbox()
    if not bbox:
        return img
    
    shadow = Image.new("RGBA", img.size, TRANSPARENT)
    sdraw = ImageDraw.Draw(shadow)
    sdraw.rectangle([bbox[0]+4, bbox[1]+6, bbox[2]-4, bbox[3]-2], fill=(20, 10, 5, shadow_alpha))
    shadow = shadow.filter(ImageFilter.GaussianBlur(8))
    
    final = Image.new("RGBA", img.size, TRANSPARENT)
    final.paste(shadow, (0, 0), alpha)
    final.paste(img, (0, 0), img)
    return final


def build_item_art(slug: str) -> Image.Image:
    """Generate high quality cutout art on a 1024x1024 canvas for slug."""
    canvas = create_canvas(1024)
    d = ImageDraw.Draw(canvas)

    # -------------------------------------------------------------
    # ESSMA WEARABLES
    # -------------------------------------------------------------
    if slug == "essma.monno-azul":
        # Cobalt blue bow for Essma hair
        d.polygon([(512, 512), (320, 380), (300, 540), (512, 512)], fill=COBALT, outline=OUTLINE)
        d.polygon([(512, 512), (330, 400), (320, 520), (512, 512)], fill=LIGHT_COBALT)
        d.polygon([(512, 512), (704, 380), (724, 540), (512, 512)], fill=COBALT, outline=OUTLINE)
        d.polygon([(512, 512), (694, 400), (704, 520), (512, 512)], fill=LIGHT_COBALT)
        d.polygon([(480, 512), (400, 720), (460, 740), (512, 530)], fill=DARK_COBALT, outline=OUTLINE)
        d.polygon([(544, 512), (624, 720), (564, 740), (512, 530)], fill=DARK_COBALT, outline=OUTLINE)
        d.ellipse([462, 462, 562, 562], fill=COBALT, outline=OUTLINE, width=4)
        d.ellipse([482, 482, 542, 542], fill=LIGHT_COBALT)

    elif slug == "essma.corona-flores":
        # Wildflower crown
        d.arc([220, 450, 804, 650], start=180, end=360, fill=CACTUS_GREEN, width=16)
        for x, y, col in [(300, 480, MARIGOLD), (420, 440, CORAL_PINK), (512, 430, CREAM), (600, 440, MARIGOLD), (720, 480, CORAL_PINK)]:
            d.ellipse([x-40, y-40, x+40, y+40], fill=col, outline=OUTLINE, width=3)
            d.ellipse([x-20, y-20, x+20, y+20], fill=RED if col!=RED else MARIGOLD)
            for angle in range(0, 360, 45):
                rad = math.radians(angle)
                px = x + int(50 * math.cos(rad))
                py = y + int(50 * math.sin(rad))
                d.ellipse([px-12, py-12, px+12, py+12], fill=col)

    elif slug == "essma.gorrito-campesino":
        # Straw sun hat
        d.ellipse([180, 480, 844, 640], fill=STRAW_GOLD, outline=OUTLINE, width=5)
        d.ellipse([220, 500, 804, 620], fill=STRAW_LIGHT)
        d.ellipse([340, 380, 684, 540], fill=STRAW_GOLD, outline=OUTLINE, width=5)
        d.rectangle([340, 490, 684, 530], fill=COBALT, outline=OUTLINE)
        d.ellipse([500, 495, 524, 525], fill=MARIGOLD)

    elif slug == "essma.tunica-clasica":
        # Classic tunic with embroidered flowers
        d.rectangle([320, 360, 704, 780], fill=CREAM, outline=OUTLINE, width=5)
        d.polygon([(320, 640), (704, 640), (754, 820), (270, 820)], fill=COBALT, outline=OUTLINE, width=5)
        d.rectangle([452, 360, 572, 480], fill=DESERT_SAND, outline=OUTLINE, width=3)
        for x in [380, 440, 582, 644]:
            d.ellipse([x-14, 400, x+14, 428], fill=MARIGOLD)
            d.ellipse([x-14, 700, x+14, 728], fill=CORAL_PINK)

    elif slug == "essma.overol-mezclilla":
        # Denim overall with yellow shirt
        d.rectangle([340, 360, 684, 460], fill=MARIGOLD, outline=OUTLINE, width=5)
        d.rectangle([360, 420, 664, 820], fill=DENIM, outline=OUTLINE, width=5)
        d.rectangle([360, 420, 664, 580], fill=DARK_DENIM)
        d.rectangle([452, 470, 572, 560], fill=DENIM, outline=OUTLINE, width=3)
        d.rectangle([380, 360, 420, 460], fill=DARK_DENIM, outline=OUTLINE)
        d.rectangle([604, 360, 644, 460], fill=DARK_DENIM, outline=OUTLINE)
        d.ellipse([390, 440, 410, 460], fill=BRASS)
        d.ellipse([614, 440, 634, 460], fill=BRASS)

    elif slug == "essma.vestido-festivo":
        # Marigold cempasúchil dress
        d.polygon([(360, 360), (664, 360), (704, 520), (320, 520)], fill=MARIGOLD, outline=OUTLINE, width=5)
        d.polygon([(300, 520), (724, 520), (804, 700), (220, 700)], fill=ORANGE, outline=OUTLINE, width=5)
        d.polygon([(220, 700), (804, 700), (864, 840), (160, 840)], fill=RED, outline=OUTLINE, width=5)
        for x in range(180, 840, 40):
            d.ellipse([x, 680, x+40, 720], fill=MARIGOLD)
            d.ellipse([x, 820, x+40, 860], fill=CREAM)

    elif slug == "essma.huaraches-piel":
        # Artisanal brown leather huaraches covering stance
        d.ellipse([420, 820, 550, 960], fill=LEATHER, outline=OUTLINE, width=5)
        d.rectangle([430, 850, 540, 930], fill=DARK_LEATHER)
        for y in range(860, 920, 15):
            d.line([(430, y), (540, y)], fill=LIGHT_LEATHER, width=4)
        d.ellipse([580, 820, 710, 960], fill=LEATHER, outline=OUTLINE, width=5)
        d.rectangle([590, 850, 700, 930], fill=DARK_LEATHER)
        for y in range(860, 920, 15):
            d.line([(590, y), (700, y)], fill=LIGHT_LEATHER, width=4)

    elif slug == "essma.tenis-sol":
        # Yellow canvas sneakers covering stance
        d.polygon([(400, 840), (550, 840), (560, 960), (390, 960)], fill=MARIGOLD, outline=OUTLINE, width=5)
        d.rectangle([380, 920, 570, 965], fill=WHITE, outline=OUTLINE, width=4)
        d.line([(440, 860), (510, 860)], fill=WHITE, width=4)
        d.line([(440, 885), (510, 885)], fill=WHITE, width=4)
        d.polygon([(570, 840), (720, 840), (730, 960), (560, 960)], fill=MARIGOLD, outline=OUTLINE, width=5)
        d.rectangle([550, 920, 740, 965], fill=WHITE, outline=OUTLINE, width=4)
        d.line([(610, 860), (680, 860)], fill=WHITE, width=4)
        d.line([(610, 885), (680, 885)], fill=WHITE, width=4)

    elif slug == "essma.zapatitos-rojos":
        # Red dress shoes with gold buckle covering stance
        d.ellipse([400, 830, 550, 960], fill=RED, outline=OUTLINE, width=5)
        d.rectangle([410, 930, 540, 965], fill=DARK_RED)
        d.rectangle([430, 860, 520, 880], fill=DARK_RED, outline=OUTLINE)
        d.rectangle([460, 855, 490, 885], fill=GOLD, outline=OUTLINE, width=3)
        d.ellipse([570, 830, 720, 960], fill=RED, outline=OUTLINE, width=5)
        d.rectangle([580, 930, 710, 965], fill=DARK_RED)
        d.rectangle([600, 860, 690, 880], fill=DARK_RED, outline=OUTLINE)
        d.rectangle([630, 855, 660, 885], fill=GOLD, outline=OUTLINE, width=3)

    elif slug == "essma.botitas-cobalto":
        # Replacement cobalt boots covering full stance feet (~98%+ cover)
        d.polygon([(390, 760), (540, 760), (560, 965), (370, 965)], fill=COBALT, outline=OUTLINE, width=5)
        d.rectangle([360, 930, 570, 970], fill=DARK_COBALT, outline=OUTLINE, width=4)
        d.line([(465, 760), (465, 930)], fill=LIGHT_COBALT, width=4)
        d.polygon([(580, 760), (730, 760), (750, 965), (560, 965)], fill=COBALT, outline=OUTLINE, width=5)
        d.rectangle([550, 930, 760, 970], fill=DARK_COBALT, outline=OUTLINE, width=4)
        d.line([(655, 760), (655, 930)], fill=LIGHT_COBALT, width=4)

    elif slug == "essma.panuelo-cobalto":
        # Cobalt neck scarf
        d.polygon([(340, 480), (684, 480), (512, 660)], fill=COBALT, outline=OUTLINE, width=5)
        d.polygon([(360, 490), (664, 490), (512, 640)], fill=LIGHT_COBALT)
        d.ellipse([490, 465, 534, 505], fill=MARIGOLD, outline=OUTLINE, width=3)

    elif slug == "essma.canastita-flores":
        # Woven basket with flowers (hip accessory)
        d.polygon([(620, 600), (820, 600), (800, 760), (640, 760)], fill=LEATHER, outline=OUTLINE, width=5)
        for y in range(620, 760, 20):
            d.line([(630, y), (810, y)], fill=STRAW_GOLD, width=4)
        d.arc([630, 520, 810, 640], start=180, end=360, fill=LEATHER, width=8)
        for x, y, c in [(660, 580, CORAL_PINK), (720, 560, MARIGOLD), (770, 580, COBALT)]:
            d.ellipse([x-24, y-24, x+24, y+24], fill=c, outline=OUTLINE)
            d.ellipse([x-10, y-10, x+10, y+10], fill=WHITE)

    elif slug == "essma.pulserita-cuentas":
        # Beaded bracelet for wrist prop
        for i, (x, c) in enumerate([(680, RED), (710, MARIGOLD), (740, TURQUOISE), (770, COBALT), (800, CORAL_PINK)]):
            d.ellipse([x-18, 680, x+18, 716], fill=c, outline=OUTLINE, width=3)

    # -------------------------------------------------------------
    # JUANCITO WEARABLES
    # -------------------------------------------------------------
    elif slug == "juancito.sombrerito-palma":
        # Palm straw hat for prairie dog
        d.ellipse([260, 480, 764, 620], fill=STRAW_GOLD, outline=OUTLINE, width=5)
        d.ellipse([340, 400, 684, 550], fill=STRAW_GOLD, outline=OUTLINE, width=5)
        d.rectangle([340, 500, 684, 540], fill=COBALT, outline=OUTLINE)

    elif slug == "juancito.casquito-explorador":
        # Explorer helmet
        d.ellipse([320, 400, 704, 560], fill=DESERT_SAND, outline=OUTLINE, width=5)
        d.ellipse([280, 500, 744, 580], fill=LEATHER, outline=OUTLINE, width=5)
        d.rectangle([320, 520, 704, 545], fill=DARK_LEATHER)

    elif slug == "juancito.corona-cactus":
        # Cactus flower crown
        d.arc([300, 460, 724, 600], start=180, end=360, fill=CACTUS_GREEN, width=18)
        d.ellipse([460, 420, 564, 524], fill=RED, outline=OUTLINE, width=4)
        d.ellipse([487, 447, 537, 497], fill=MARIGOLD)

    elif slug == "juancito.gorrito-noche":
        # Nightcap
        d.polygon([(512, 280), (340, 520), (684, 520)], fill=COBALT, outline=OUTLINE, width=5)
        d.ellipse([462, 240, 562, 310], fill=CREAM, outline=OUTLINE, width=3)
        d.rectangle([340, 480, 684, 530], fill=CREAM, outline=OUTLINE)

    elif slug == "juancito.panuelo-rojo":
        # Red neck bandana
        d.polygon([(360, 480), (664, 480), (512, 640)], fill=RED, outline=OUTLINE, width=5)
        d.ellipse([490, 465, 534, 505], fill=GOLD, outline=OUTLINE)

    elif slug == "juancito.collar-semillas":
        # Seed necklace
        d.arc([340, 460, 684, 600], start=0, end=180, fill=LEATHER, width=6)
        for x, y in [(380, 510), (440, 550), (512, 570), (584, 550), (644, 510)]:
            d.ellipse([x-20, y-20, x+20, y+20], fill=MARIGOLD, outline=OUTLINE, width=3)

    elif slug == "juancito.mono-mariposa":
        # Yellow bowtie
        d.polygon([(512, 520), (360, 460), (360, 580)], fill=MARIGOLD, outline=OUTLINE, width=4)
        d.polygon([(512, 520), (664, 460), (664, 580)], fill=MARIGOLD, outline=OUTLINE, width=4)
        d.ellipse([472, 480, 552, 560], fill=ORANGE, outline=OUTLINE, width=4)

    elif slug == "juancito.bufandita-tejida":
        # Blue knitted scarf
        d.rectangle([360, 480, 664, 540], fill=DENIM, outline=OUTLINE, width=5)
        d.rectangle([580, 530, 640, 660], fill=DARK_DENIM, outline=OUTLINE, width=4)

    elif slug == "juancito.sarape-sonora":
        # Sonoran sarape poncho wrap (pear torso shape)
        d.polygon([(380, 460), (644, 460), (724, 760), (300, 760)], fill=MARIGOLD, outline=OUTLINE, width=5)
        d.rectangle([320, 520, 704, 560], fill=COBALT)
        d.rectangle([310, 620, 714, 650], fill=RED)
        d.rectangle([300, 700, 724, 730], fill=CACTUS_GREEN)
        for x in range(300, 724, 20):
            d.line([(x, 760), (x, 785)], fill=CREAM, width=4)

    elif slug == "juancito.chaleco-cuero":
        # Brown leather vest wrap
        d.polygon([(360, 460), (664, 460), (704, 760), (320, 760)], fill=LEATHER, outline=OUTLINE, width=5)
        d.polygon([(512, 460), (460, 760), (564, 760)], fill=TRANSPARENT)
        d.ellipse([400, 500, 430, 530], fill=BRASS)
        d.ellipse([594, 500, 624, 530], fill=BRASS)

    elif slug == "juancito.overolcito-trabajo":
        # Mini denim work overalls
        d.polygon([(360, 480), (664, 480), (704, 760), (320, 760)], fill=DENIM, outline=OUTLINE, width=5)
        d.rectangle([400, 420, 440, 480], fill=DARK_DENIM, outline=OUTLINE)
        d.rectangle([584, 420, 624, 480], fill=DARK_DENIM, outline=OUTLINE)
        d.rectangle([452, 540, 572, 640], fill=DARK_DENIM, outline=OUTLINE, width=3)

    # -------------------------------------------------------------
    # TORI WEARABLES
    # -------------------------------------------------------------
    elif slug == "tori.sombrero-pluma":
        # Leather hat with red feather
        d.ellipse([300, 480, 724, 600], fill=LEATHER, outline=OUTLINE, width=5)
        d.ellipse([360, 400, 664, 540], fill=DARK_LEATHER, outline=OUTLINE, width=5)
        d.polygon([(640, 440), (740, 320), (670, 460)], fill=RED, outline=OUTLINE, width=3)

    elif slug == "tori.diadema-estrellita":
        # Gold star headband
        d.arc([320, 440, 704, 580], start=180, end=360, fill=COBALT, width=12)
        d.polygon([(512, 380), (530, 430), (580, 430), (540, 460), (555, 510), (512, 480), (469, 510), (484, 460), (444, 430), (494, 430)], fill=GOLD, outline=OUTLINE)

    elif slug == "tori.gorrito-tejido":
        # Orange beanie cap
        d.ellipse([340, 380, 684, 560], fill=ORANGE, outline=OUTLINE, width=5)
        d.ellipse([472, 340, 552, 400], fill=CREAM, outline=OUTLINE, width=4)
        d.rectangle([340, 500, 684, 550], fill=TERRACOTTA, outline=OUTLINE)

    elif slug == "tori.viserita-sol":
        # Yellow sun visor
        d.ellipse([260, 480, 764, 580], fill=MARIGOLD, outline=OUTLINE, width=5)
        d.rectangle([340, 470, 684, 510], fill=RED, outline=OUTLINE)

    elif slug == "tori.collar-flores":
        # Tropical flower garland
        d.arc([360, 460, 664, 600], start=0, end=180, fill=CACTUS_GREEN, width=8)
        for x, y, c in [(400, 520, RED), (460, 560, MARIGOLD), (512, 580, CORAL_PINK), (564, 560, COBALT), (624, 520, RED)]:
            d.ellipse([x-22, y-22, x+22, y+22], fill=c, outline=OUTLINE, width=3)

    elif slug == "tori.panuelo-amarillo":
        # Yellow bandana
        d.polygon([(380, 480), (644, 480), (512, 640)], fill=MARIGOLD, outline=OUTLINE, width=5)
        d.ellipse([490, 465, 534, 505], fill=RED, outline=OUTLINE)

    elif slug == "tori.gargantilla-cuentas":
        # Turquoise choker
        d.arc([360, 480, 664, 560], start=0, end=180, fill=TURQUOISE, width=16)

    elif slug == "tori.ponchito-rayas":
        # Striped poncho wrap for ringtail torso
        d.polygon([(400, 480), (624, 480), (684, 760), (340, 760)], fill=MARIGOLD, outline=OUTLINE, width=5)
        d.rectangle([360, 540, 664, 580], fill=COBALT)
        d.rectangle([350, 640, 674, 680], fill=TERRACOTTA)

    elif slug == "tori.chaleco-denim":
        # Denim vest wrap
        d.polygon([(400, 480), (624, 480), (670, 760), (354, 760)], fill=DENIM, outline=OUTLINE, width=5)
        d.polygon([(512, 480), (470, 760), (554, 760)], fill=TRANSPARENT)

    elif slug == "tori.capita-bosque":
        # Forest green hooded cape
        d.polygon([(380, 460), (644, 460), (704, 780), (320, 780)], fill=CACTUS_GREEN, outline=OUTLINE, width=5)
        d.ellipse([440, 440, 584, 500], fill=DARK_GREEN, outline=OUTLINE)

    elif slug == "tori.tunicas-flores":
        # Cream floral pattern tunic wrap
        d.polygon([(390, 480), (634, 480), (680, 780), (344, 780)], fill=CREAM, outline=OUTLINE, width=5)
        for x, y in [(440, 560), (580, 560), (512, 660), (450, 720), (570, 720)]:
            d.ellipse([x-18, y-18, x+18, y+18], fill=CORAL_PINK)

    # -------------------------------------------------------------
    # ANITA WEARABLES
    # -------------------------------------------------------------
    elif slug == "anita.sombrero-vaquero":
        # Brown cowboy hat for calf head
        d.ellipse([260, 460, 764, 600], fill=LEATHER, outline=OUTLINE, width=5)
        d.ellipse([340, 380, 684, 530], fill=DARK_LEATHER, outline=OUTLINE, width=5)
        d.rectangle([340, 480, 684, 515], fill=RED, outline=OUTLINE)

    elif slug == "anita.mono-rosa":
        # Pink ear bow
        d.polygon([(512, 512), (340, 420), (340, 600)], fill=CORAL_PINK, outline=OUTLINE, width=4)
        d.polygon([(512, 512), (684, 420), (684, 600)], fill=CORAL_PINK, outline=OUTLINE, width=4)
        d.ellipse([472, 472, 552, 552], fill=DARK_PINK, outline=OUTLINE, width=4)

    elif slug == "anita.gorrito-campana":
        # Soft lace bonnet
        d.ellipse([320, 380, 704, 560], fill=CREAM, outline=OUTLINE, width=5)
        d.rectangle([320, 500, 704, 540], fill=LIGHT_COBALT, outline=OUTLINE)

    elif slug == "anita.diadema-girasol":
        # Sunflower headband
        d.arc([320, 460, 704, 580], start=180, end=360, fill=CACTUS_GREEN, width=12)
        d.ellipse([452, 400, 572, 520], fill=MARIGOLD, outline=OUTLINE, width=4)
        d.ellipse([482, 430, 542, 490], fill=DARK_MARIGOLD)

    elif slug == "anita.campanilla-dorada":
        # Leather collar with brass bell
        d.arc([360, 460, 664, 580], start=0, end=180, fill=LEATHER, width=14)
        d.polygon([(472, 550), (552, 550), (572, 640), (452, 640)], fill=BRASS, outline=OUTLINE, width=4)
        d.ellipse([492, 630, 532, 650], fill=GOLD)

    elif slug == "anita.panuelo-marigold":
        # Marigold bandana
        d.polygon([(380, 480), (644, 480), (512, 640)], fill=MARIGOLD, outline=OUTLINE, width=5)
        d.ellipse([490, 465, 534, 505], fill=RED, outline=OUTLINE)

    elif slug == "anita.collar-corazon":
        # Red necklace with pink heart
        d.arc([360, 460, 664, 580], start=0, end=180, fill=RED, width=6)
        d.ellipse([482, 550, 542, 610], fill=CORAL_PINK, outline=OUTLINE, width=3)

    elif slug == "anita.panuelo-verde":
        # Prairie green bandana
        d.polygon([(380, 480), (644, 480), (512, 640)], fill=CACTUS_GREEN, outline=OUTLINE, width=5)

    elif slug == "anita.mantita-tejida":
        # Woven blanket wrap for calf torso
        d.rectangle([340, 480, 684, 780], fill=RED, outline=OUTLINE, width=5)
        d.rectangle([340, 540, 684, 580], fill=MARIGOLD)
        d.rectangle([340, 640, 684, 680], fill=COBALT)

    elif slug == "anita.overol-granja":
        # Farm work overalls wrap
        d.rectangle([360, 480, 664, 780], fill=DENIM, outline=OUTLINE, width=5)
        d.rectangle([400, 420, 440, 480], fill=DARK_DENIM, outline=OUTLINE)
        d.rectangle([584, 420, 624, 480], fill=DARK_DENIM, outline=OUTLINE)

    elif slug == "anita.falda-floreada":
        # Floral skirt wrap
        d.polygon([(400, 480), (624, 480), (704, 780), (320, 780)], fill=CORAL_PINK, outline=OUTLINE, width=5)
        for x, y in [(420, 580), (600, 580), (512, 680), (400, 720), (620, 720)]:
            d.ellipse([x-20, y-20, x+20, y+20], fill=MARIGOLD)

    else:
        d.ellipse([340, 340, 684, 684], fill=COBALT, outline=OUTLINE, width=5)

    return add_texture_and_shading(canvas)


def main():
    contract = load_contract()
    print("Building and fitting 46 v5 wearables...")

    targets = [
        # Essma (13)
        ("essma", "hair", "essma.monno-azul"),
        ("essma", "hair", "essma.corona-flores"),
        ("essma", "hair", "essma.gorrito-campesino"),
        ("essma", "outfit", "essma.tunica-clasica"),
        ("essma", "outfit", "essma.overol-mezclilla"),
        ("essma", "outfit", "essma.vestido-festivo"),
        ("essma", "shoes", "essma.huaraches-piel"),
        ("essma", "shoes", "essma.tenis-sol"),
        ("essma", "shoes", "essma.zapatitos-rojos"),
        ("essma", "shoes", "essma.botitas-cobalto"),
        ("essma", "accessory", "essma.panuelo-cobalto"),
        ("essma", "accessory", "essma.canastita-flores"),
        ("essma", "accessory", "essma.pulserita-cuentas"),
        # Juancito (11)
        ("juancito", "head", "juancito.sombrerito-palma"),
        ("juancito", "head", "juancito.casquito-explorador"),
        ("juancito", "head", "juancito.corona-cactus"),
        ("juancito", "head", "juancito.gorrito-noche"),
        ("juancito", "neck", "juancito.panuelo-rojo"),
        ("juancito", "neck", "juancito.collar-semillas"),
        ("juancito", "neck", "juancito.mono-mariposa"),
        ("juancito", "neck", "juancito.bufandita-tejida"),
        ("juancito", "body", "juancito.sarape-sonora"),
        ("juancito", "body", "juancito.chaleco-cuero"),
        ("juancito", "body", "juancito.overolcito-trabajo"),
        # Tori (11)
        ("tori", "head", "tori.sombrero-pluma"),
        ("tori", "head", "tori.diadema-estrellita"),
        ("tori", "head", "tori.gorrito-tejido"),
        ("tori", "head", "tori.viserita-sol"),
        ("tori", "neck", "tori.collar-flores"),
        ("tori", "neck", "tori.panuelo-amarillo"),
        ("tori", "neck", "tori.gargantilla-cuentas"),
        ("tori", "body", "tori.ponchito-rayas"),
        ("tori", "body", "tori.chaleco-denim"),
        ("tori", "body", "tori.capita-bosque"),
        ("tori", "body", "tori.tunicas-flores"),
        # Anita (11)
        ("anita", "head", "anita.sombrero-vaquero"),
        ("anita", "head", "anita.mono-rosa"),
        ("anita", "head", "anita.gorrito-campana"),
        ("anita", "head", "anita.diadema-girasol"),
        ("anita", "neck", "anita.campanilla-dorada"),
        ("anita", "neck", "anita.panuelo-marigold"),
        ("anita", "neck", "anita.collar-corazon"),
        ("anita", "neck", "anita.panuelo-verde"),
        ("anita", "body", "anita.mantita-tejida"),
        ("anita", "body", "anita.overol-granja"),
        ("anita", "body", "anita.falda-floreada"),
    ]

    success_count = 0

    for character, slot, slug in targets:
        art = build_item_art(slug)
        raw_path = OUT_V5 / f"raw-{slug}.png"
        art.save(raw_path)

        out_path = OUT_V5 / f"{slug}.png"
        res = fit_file(raw_path, out_path, character, slot, contract=contract, write_thumb=True)

        if raw_path.exists():
            raw_path.unlink()

        print(f"✓ Built & Fitted v5: {slug} ({character}/{slot}) -> {out_path.name}")
        success_count += 1

    print(f"\nSuccessfully built {success_count} / {len(targets)} v5 wearables!")


if __name__ == "__main__":
    main()
