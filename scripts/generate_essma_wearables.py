import os
from pathlib import Path
from PIL import Image, ImageDraw

CANVAS_SIZE = 1254
THUMB_SIZE = 256

out_dir_v2 = Path("public/assets/wearables/v2")
thumb_dir_v2 = Path("public/assets/wearables/v2/thumbnails")
out_dir_v2.mkdir(parents=True, exist_ok=True)
thumb_dir_v2.mkdir(parents=True, exist_ok=True)

# Colors
COBALT = (29, 78, 216, 255)
LIGHT_BLUE = (59, 130, 246, 255)
MARIGOLD = (245, 158, 11, 255)
ORANGE = (234, 88, 12, 255)
CREAM = (254, 243, 199, 255)
RED = (220, 38, 38, 255)
GREEN = (21, 128, 61, 255)
LEATHER = (154, 52, 18, 255)
WICKER = (180, 83, 9, 255)
DENIM = (37, 99, 235, 255)
DARK_DENIM = (30, 64, 175, 255)
GOLD = (234, 179, 8, 255)

def make_thumbnail(img: Image.Image) -> Image.Image:
    bbox = img.getbbox()
    if not bbox:
        bbox = (0, 0, img.width, img.height)
    item = img.crop(bbox)
    scale = min((THUMB_SIZE - 32) / item.width, (THUMB_SIZE - 32) / item.height)
    new_w = max(1, round(item.width * scale))
    new_h = max(1, round(item.height * scale))
    item = item.resize((new_w, new_h), Image.Resampling.LANCZOS)
    
    thumb = Image.new("RGBA", (THUMB_SIZE, THUMB_SIZE), (0, 0, 0, 0))
    offset_x = round((THUMB_SIZE - new_w) / 2)
    offset_y = round((THUMB_SIZE - new_h) / 2)
    thumb.alpha_composite(item, (offset_x, offset_y))
    return thumb

# --- ITEMS ---

# 1. Signature Blue Bow (Hair/Head)
img_bow = Image.new("RGBA", (CANVAS_SIZE, CANVAS_SIZE), (0, 0, 0, 0))
d = ImageDraw.Draw(img_bow)
d.ellipse([535, 165, 625, 215], fill=COBALT) # Left loop
d.ellipse([629, 165, 719, 215], fill=COBALT) # Right loop
d.ellipse([609, 172, 645, 208], fill=LIGHT_BLUE) # Center knot
d.polygon([(615, 195), (590, 245), (615, 240)], fill=COBALT) # Left tail
d.polygon([(639, 195), (664, 245), (639, 240)], fill=COBALT) # Right tail
img_bow.save(out_dir_v2 / "essma.monno-azul.png")
make_thumbnail(img_bow).save(thumb_dir_v2 / "essma.monno-azul.png")

# 2. Wildflower Crown (Hair)
img_crown = Image.new("RGBA", (CANVAS_SIZE, CANVAS_SIZE), (0, 0, 0, 0))
d = ImageDraw.Draw(img_crown)
d.ellipse([492, 200, 762, 230], outline=GREEN, width=12) # Vine
d.ellipse([510, 197, 540, 227], fill=MARIGOLD)
d.ellipse([560, 200, 594, 234], fill=RED)
d.ellipse([610, 192, 648, 230], fill=COBALT) # Center flower
d.ellipse([664, 200, 698, 234], fill=MARIGOLD)
d.ellipse([714, 197, 744, 227], fill=ORANGE)
d.ellipse([622, 204, 636, 218], fill=CREAM) # Center core
img_crown.save(out_dir_v2 / "essma.corona-flores.png")
make_thumbnail(img_crown).save(thumb_dir_v2 / "essma.corona-flores.png")

# 3. Sun Bonnet / Visor (Hair)
img_bonnet = Image.new("RGBA", (CANVAS_SIZE, CANVAS_SIZE), (0, 0, 0, 0))
d = ImageDraw.Draw(img_bonnet)
d.ellipse([477, 135, 777, 225], fill=MARIGOLD, outline=WICKER, width=8)
d.ellipse([467, 165, 787, 205], fill=WICKER)
d.ellipse([487, 185, 767, 205], fill=COBALT) # Ribbon
img_bonnet.save(out_dir_v2 / "essma.gorrito-campesino.png")
make_thumbnail(img_bonnet).save(thumb_dir_v2 / "essma.gorrito-campesino.png")

# 4. Canonical Default Tunic & Cobalt Skirt (Outfit)
img_tunic = Image.new("RGBA", (CANVAS_SIZE, CANVAS_SIZE), (0, 0, 0, 0))
d = ImageDraw.Draw(img_tunic)
# Cream tunic top (y: 570..690)
d.polygon([(507, 610), (747, 610), (730, 690), (524, 690)], fill=CREAM)
d.ellipse([507, 580, 747, 640], fill=CREAM)
# Chest embroidery
d.ellipse([615, 615, 639, 639], fill=RED)
d.ellipse([623, 623, 631, 631], fill=GOLD)
d.ellipse([570, 620, 588, 638], fill=MARIGOLD)
d.ellipse([666, 620, 684, 638], fill=MARIGOLD)
# Cobalt Blue Skirt (y: 690..860)
d.polygon([(524, 690), (730, 690), (817, 860), (437, 860)], fill=COBALT)
d.ellipse([437, 845, 817, 875], fill=LIGHT_BLUE) # Hem
img_tunic.save(out_dir_v2 / "essma.tunica-clasica.png")
make_thumbnail(img_tunic).save(thumb_dir_v2 / "essma.tunica-clasica.png")

# 5. Denim Overalls & Shirt (Outfit)
img_overalls = Image.new("RGBA", (CANVAS_SIZE, CANVAS_SIZE), (0, 0, 0, 0))
d = ImageDraw.Draw(img_overalls)
d.ellipse([512, 585, 742, 645], fill=MARIGOLD) # Yellow undershirt
d.polygon([(555, 620), (699, 620), (761, 860), (493, 860)], fill=DENIM) # Denim body
d.rectangle([550, 575, 572, 625], fill=DARK_DENIM) # Left strap
d.rectangle([682, 575, 704, 625], fill=DARK_DENIM) # Right strap
d.ellipse([555, 618, 567, 630], fill=GOLD) # Button
d.ellipse([687, 618, 699, 630], fill=GOLD) # Button
d.rectangle([595, 640, 659, 685], fill=DARK_DENIM) # Pocket
img_overalls.save(out_dir_v2 / "essma.overol-mezclilla.png")
make_thumbnail(img_overalls).save(thumb_dir_v2 / "essma.overol-mezclilla.png")

# 6. Marigold Festive Dress (Outfit)
img_festive = Image.new("RGBA", (CANVAS_SIZE, CANVAS_SIZE), (0, 0, 0, 0))
d = ImageDraw.Draw(img_festive)
d.polygon([(512, 600), (742, 600), (720, 660), (534, 660)], fill=MARIGOLD)
d.polygon([(534, 660), (720, 660), (812, 870), (442, 870)], fill=MARIGOLD)
d.rectangle([512, 655, 742, 672], fill=RED) # Sash
d.ellipse([442, 850, 812, 890], fill=ORANGE) # Ruffle trim
img_festive.save(out_dir_v2 / "essma.vestido-festivo.png")
make_thumbnail(img_festive).save(thumb_dir_v2 / "essma.vestido-festivo.png")

# 7. Leather Huarache Sandals (Shoes)
img_sandals = Image.new("RGBA", (CANVAS_SIZE, CANVAS_SIZE), (0, 0, 0, 0))
d = ImageDraw.Draw(img_sandals)
d.ellipse([535, 1055, 595, 1095], fill=LEATHER) # Left sandal
d.rectangle([540, 1065, 590, 1075], fill=WICKER)
d.ellipse([655, 1055, 715, 1095], fill=LEATHER) # Right sandal
d.rectangle([660, 1065, 710, 1075], fill=WICKER)
img_sandals.save(out_dir_v2 / "essma.huaraches-piel.png")
make_thumbnail(img_sandals).save(thumb_dir_v2 / "essma.huaraches-piel.png")

# 8. Yellow Canvas Sneakers (Shoes)
img_sneakers = Image.new("RGBA", (CANVAS_SIZE, CANVAS_SIZE), (0, 0, 0, 0))
d = ImageDraw.Draw(img_sneakers)
d.ellipse([533, 1048, 597, 1092], fill=MARIGOLD)
d.ellipse([533, 1077, 597, 1093], fill=CREAM) # Left sole
d.ellipse([533, 1060, 555, 1080], fill=CREAM) # Left toe cap
d.ellipse([653, 1048, 717, 1092], fill=MARIGOLD)
d.ellipse([653, 1077, 717, 1093], fill=CREAM) # Right sole
d.ellipse([695, 1060, 717, 1080], fill=CREAM) # Right toe cap
img_sneakers.save(out_dir_v2 / "essma.tenis-sol.png")
make_thumbnail(img_sneakers).save(thumb_dir_v2 / "essma.tenis-sol.png")

# 9. Red Festive Shoes (Shoes)
img_red_shoes = Image.new("RGBA", (CANVAS_SIZE, CANVAS_SIZE), (0, 0, 0, 0))
d = ImageDraw.Draw(img_red_shoes)
d.ellipse([535, 1048, 595, 1088], fill=RED)
d.ellipse([560, 1055, 570, 1065], fill=GOLD) # Left buckle
d.ellipse([655, 1048, 715, 1088], fill=RED)
d.ellipse([680, 1055, 690, 1065], fill=GOLD) # Right buckle
img_red_shoes.save(out_dir_v2 / "essma.zapatitos-rojos.png")
make_thumbnail(img_red_shoes).save(thumb_dir_v2 / "essma.zapatitos-rojos.png")

# 10. Cobalt Neck Kerchief (Accessory)
img_kerchief = Image.new("RGBA", (CANVAS_SIZE, CANVAS_SIZE), (0, 0, 0, 0))
d = ImageDraw.Draw(img_kerchief)
d.ellipse([562, 545, 692, 595], fill=COBALT)
d.ellipse([615, 570, 639, 594], fill=LIGHT_BLUE) # Knot
d.ellipse([595, 555, 603, 563], fill=CREAM)
d.ellipse([651, 555, 659, 563], fill=CREAM)
img_kerchief.save(out_dir_v2 / "essma.panuelo-cobalto.png")
make_thumbnail(img_kerchief).save(thumb_dir_v2 / "essma.panuelo-cobalto.png")

# 11. Flower Basket (Accessory)
img_basket = Image.new("RGBA", (CANVAS_SIZE, CANVAS_SIZE), (0, 0, 0, 0))
d = ImageDraw.Draw(img_basket)
d.ellipse([755, 695, 845, 765], fill=WICKER)
d.ellipse([770, 680, 794, 704], fill=MARIGOLD)
d.ellipse([791, 675, 819, 703], fill=RED)
d.ellipse([816, 680, 840, 704], fill=COBALT)
d.ellipse([775, 655, 825, 715], outline=WICKER, width=8) # Handle
img_basket.save(out_dir_v2 / "essma.canastita-flores.png")
make_thumbnail(img_basket).save(thumb_dir_v2 / "essma.canastita-flores.png")

# 12. Beaded Bracelet (Accessory)
img_bracelet = Image.new("RGBA", (CANVAS_SIZE, CANVAS_SIZE), (0, 0, 0, 0))
d = ImageDraw.Draw(img_bracelet)
d.ellipse([799, 679, 811, 691], fill=RED)
d.ellipse([809, 679, 821, 691], fill=GOLD)
d.ellipse([819, 679, 831, 691], fill=COBALT)
d.ellipse([829, 679, 841, 691], fill=MARIGOLD)
img_bracelet.save(out_dir_v2 / "essma.pulserita-cuentas.png")
make_thumbnail(img_bracelet).save(thumb_dir_v2 / "essma.pulserita-cuentas.png")

print("Generated all 12 Essma wearables and thumbnails cleanly!")
