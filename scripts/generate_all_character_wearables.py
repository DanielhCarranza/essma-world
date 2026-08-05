import os
from pathlib import Path
from PIL import Image, ImageDraw

CANVAS_SIZE = 1254
THUMB_SIZE = 256

out_dir_v2 = Path("public/assets/wearables/v2")
thumb_dir_v2 = Path("public/assets/wearables/v2/thumbnails")
out_dir_v2.mkdir(parents=True, exist_ok=True)
thumb_dir_v2.mkdir(parents=True, exist_ok=True)

# Palette
COBALT = (29, 78, 216, 255)
LIGHT_BLUE = (59, 130, 246, 255)
SKY_BLUE = (125, 211, 252, 255)
MARIGOLD = (245, 158, 11, 255)
ORANGE = (234, 88, 12, 255)
CREAM = (254, 243, 199, 255)
RED = (220, 38, 38, 255)
PINK = (244, 114, 182, 255)
GREEN = (21, 128, 61, 255)
LEATHER = (154, 52, 18, 255)
WICKER = (180, 83, 9, 255)
DENIM = (37, 99, 235, 255)
DARK_DENIM = (30, 64, 175, 255)
GOLD = (234, 179, 8, 255)

def make_thumb(img: Image.Image) -> Image.Image:
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

def save_wearable(slug: str, draw_fn):
    img = Image.new("RGBA", (CANVAS_SIZE, CANVAS_SIZE), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    draw_fn(d)
    img.save(out_dir_v2 / f"{slug}.png")
    make_thumb(img).save(thumb_dir_v2 / f"{slug}.png")
    print(f"✓ Saved {slug}.png")

# ---------------------------------------------------------------
# JUANCITO (Prairie Dog - Head: 627, 388; Neck: 627, 575; Body: 627, 720)
# ---------------------------------------------------------------

# Head:
save_wearable("juancito.sombrerito-palma", lambda d: (
    d.ellipse([517, 320, 737, 395], fill=MARIGOLD, outline=WICKER, width=6),
    d.ellipse([547, 340, 707, 360], fill=COBALT)
))

save_wearable("juancito.casquito-explorador", lambda d: (
    d.ellipse([537, 325, 717, 400], fill=WICKER),
    d.rectangle([527, 380, 727, 395], fill=LEATHER)
))

save_wearable("juancito.corona-cactus", lambda d: (
    d.ellipse([527, 360, 727, 390], outline=GREEN, width=10),
    d.ellipse([607, 345, 647, 385], fill=RED),
    d.ellipse([620, 358, 634, 372], fill=GOLD)
))

save_wearable("juancito.gorrito-noche", lambda d: (
    d.polygon([(627, 280), (557, 388), (697, 388)], fill=COBALT),
    d.ellipse([612, 265, 642, 295], fill=CREAM)
))

# Neck:
save_wearable("juancito.panuelo-rojo", lambda d: (
    d.polygon([(547, 560), (707, 560), (627, 630)], fill=RED),
    d.ellipse([617, 552, 637, 572], fill=GOLD)
))

save_wearable("juancito.collar-semillas", lambda d: (
    d.ellipse([547, 555, 707, 605], outline=LEATHER, width=8),
    d.ellipse([617, 595, 637, 615], fill=MARIGOLD)
))

save_wearable("juancito.mono-mariposa", lambda d: (
    d.polygon([(567, 560), (627, 575), (567, 590)], fill=MARIGOLD),
    d.polygon([(687, 560), (627, 575), (687, 590)], fill=MARIGOLD),
    d.ellipse([617, 565, 637, 585], fill=ORANGE)
))

save_wearable("juancito.bufandita-tejida", lambda d: (
    d.rectangle([557, 560, 697, 590], fill=DENIM),
    d.rectangle([657, 585, 687, 635], fill=DARK_DENIM)
))

# Body:
save_wearable("juancito.sarape-sonora", lambda d: (
    d.rectangle([517, 660, 737, 780], fill=MARIGOLD),
    d.rectangle([517, 690, 737, 715], fill=COBALT),
    d.rectangle([517, 735, 737, 750], fill=RED)
))

save_wearable("juancito.chaleco-cuero", lambda d: (
    d.rectangle([537, 655, 717, 775], fill=LEATHER),
    d.polygon([(627, 655), (597, 775), (657, 775)], fill=(0,0,0,0)), # Vest open center
    d.ellipse([557, 675, 567, 685], fill=GOLD),
    d.ellipse([687, 675, 697, 685], fill=GOLD)
))

save_wearable("juancito.overolcito-trabajo", lambda d: (
    d.rectangle([537, 670, 717, 780], fill=DENIM),
    d.rectangle([567, 625, 587, 675], fill=DARK_DENIM),
    d.rectangle([667, 625, 687, 675], fill=DARK_DENIM)
))

# ---------------------------------------------------------------
# TORI (Cacomixtle - Head: 627, 360; Neck: 627, 560; Body: 627, 735)
# ---------------------------------------------------------------

# Head:
save_wearable("tori.sombrero-pluma", lambda d: (
    d.ellipse([517, 310, 737, 370], fill=LEATHER),
    d.polygon([(657, 320), (707, 260), (677, 330)], fill=RED) # Feather
))

save_wearable("tori.diadema-estrellita", lambda d: (
    d.ellipse([527, 335, 727, 365], outline=COBALT, width=8),
    d.ellipse([612, 320, 642, 350], fill=GOLD)
))

save_wearable("tori.gorrito-tejido", lambda d: (
    d.ellipse([537, 290, 717, 370], fill=ORANGE),
    d.ellipse([612, 275, 642, 305], fill=CREAM)
))

save_wearable("tori.viserita-sol", lambda d: (
    d.ellipse([507, 335, 747, 375], fill=MARIGOLD),
    d.rectangle([537, 340, 717, 355], fill=RED)
))

# Neck:
save_wearable("tori.collar-flores", lambda d: (
    d.ellipse([537, 540, 717, 585], outline=GREEN, width=6),
    d.ellipse([567, 555, 587, 575], fill=RED),
    d.ellipse([617, 560, 637, 580], fill=MARIGOLD),
    d.ellipse([667, 555, 687, 575], fill=COBALT)
))

save_wearable("tori.panuelo-amarillo", lambda d: (
    d.polygon([(547, 545), (707, 545), (627, 610)], fill=MARIGOLD),
    d.ellipse([617, 540, 637, 560], fill=RED)
))

save_wearable("tori.gargantilla-cuentas", lambda d: (
    d.ellipse([547, 545, 707, 575], outline=LIGHT_BLUE, width=10)
))

# Body:
save_wearable("tori.ponchito-rayas", lambda d: (
    d.polygon([(627, 650), (747, 790), (507, 790)], fill=MARIGOLD),
    d.polygon([(627, 680), (717, 770), (537, 770)], fill=COBALT)
))

save_wearable("tori.chaleco-denim", lambda d: (
    d.rectangle([527, 670, 727, 790], fill=DENIM),
    d.polygon([(627, 670), (607, 790), (647, 790)], fill=(0,0,0,0))
))

save_wearable("tori.capita-bosque", lambda d: (
    d.ellipse([497, 660, 757, 800], fill=GREEN)
))

save_wearable("tori.tunicas-flores", lambda d: (
    d.rectangle([517, 660, 737, 800], fill=CREAM),
    d.ellipse([612, 710, 642, 740], fill=RED),
    d.ellipse([567, 740, 597, 770], fill=MARIGOLD),
    d.ellipse([657, 740, 687, 770], fill=MARIGOLD)
))

# ---------------------------------------------------------------
# ANITA (Calf - Head: 627, 390; Neck: 627, 560; Body: 627, 760)
# ---------------------------------------------------------------

# Head:
save_wearable("anita.sombrero-vaquero", lambda d: (
    d.ellipse([487, 310, 767, 395], fill=LEATHER),
    d.ellipse([547, 300, 707, 360], fill=WICKER),
    d.rectangle([547, 350, 707, 360], fill=RED)
))

save_wearable("anita.mono-rosa", lambda d: (
    d.ellipse([557, 350, 627, 390], fill=PINK),
    d.ellipse([627, 350, 697, 390], fill=PINK),
    d.ellipse([612, 355, 642, 385], fill=RED)
))

save_wearable("anita.gorrito-campana", lambda d: (
    d.ellipse([527, 310, 727, 395], fill=CREAM),
    d.rectangle([527, 370, 727, 385], fill=LIGHT_BLUE)
))

save_wearable("anita.diadema-girasol", lambda d: (
    d.ellipse([517, 360, 737, 395], outline=GREEN, width=8),
    d.ellipse([607, 335, 647, 375], fill=MARIGOLD),
    d.ellipse([617, 345, 637, 365], fill=LEATHER)
))

# Neck:
save_wearable("anita.campanilla-dorada", lambda d: (
    d.ellipse([527, 540, 727, 590], outline=LEATHER, width=8),
    d.polygon([(612, 575), (642, 575), (647, 615), (607, 615)], fill=GOLD) # Bell
))

save_wearable("anita.panuelo-marigold", lambda d: (
    d.polygon([(537, 545), (717, 545), (627, 615)], fill=MARIGOLD),
    d.ellipse([617, 540, 637, 560], fill=RED)
))

save_wearable("anita.collar-corazon", lambda d: (
    d.ellipse([527, 540, 727, 585], outline=RED, width=6),
    d.ellipse([612, 570, 642, 600], fill=PINK)
))

save_wearable("anita.panuelo-verde", lambda d: (
    d.polygon([(537, 545), (717, 545), (627, 615)], fill=GREEN)
))

# Body:
save_wearable("anita.mantita-tejida", lambda d: (
    d.rectangle([487, 700, 767, 820], fill=RED),
    d.rectangle([487, 730, 767, 760], fill=MARIGOLD),
    d.rectangle([487, 775, 767, 795], fill=COBALT)
))

save_wearable("anita.overol-granja", lambda d: (
    d.rectangle([517, 690, 737, 830], fill=DENIM),
    d.rectangle([547, 640, 567, 695], fill=DARK_DENIM),
    d.rectangle([687, 640, 707, 695], fill=DARK_DENIM)
))

save_wearable("anita.falda-floreada", lambda d: (
    d.polygon([(537, 690), (717, 690), (787, 830), (467, 830)], fill=PINK),
    d.ellipse([547, 740, 577, 770], fill=MARIGOLD),
    d.ellipse([677, 740, 707, 770], fill=MARIGOLD)
))

print("All character wearable assets (Juancito, Tori, Anita) generated cleanly!")
