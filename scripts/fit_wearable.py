#!/usr/bin/env python3
"""Fit an isolated wearable into a character slot using the shared slot contract.

This is the durable placement path for Essma World wearables:

1. Art is generated as an isolated cutout (any canvas).
2. This script reads public/assets/wearables/slot-fit-contract.json
   for the target character + slot (not per-item hardcoding).
3. It crops opaque pixels, scales into the slot box, and writes a 1254px
   layer that React and Phaser stack 1:1 with the character base.

Side-biased props (braids, hip bags) keep their lateral offset relative to
the design center so they are not forced onto the midline. Accessory items
whose source centroid is in the lower half of the canvas use the optional
`lower` sub-box (hip bags / held props).

Usage:
  python3 scripts/fit_wearable.py INPUT.png OUTPUT.png \\
      --character juancito --slot head

  python3 scripts/fit_wearable.py --refit-keepers
  python3 scripts/fit_wearable.py --refit-keepers --dry-run
"""

from __future__ import annotations

import argparse
import json
import shutil
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
CONTRACT_PATH = ROOT / "public/assets/wearables/slot-fit-contract.json"
DEFAULT_CANVAS = 1254
DESIGN_CENTER_X = 627
SIDE_BIAS_THRESHOLD = 70

# Playable keepers (starter + reward). Keep in sync with catalog unlocks.
# (character, slot, id_slug, runtime_path, preserve_canvas)
# preserve_canvas=True: already painted to the 1254 base; do not re-fit.
KEEPER_SPECS: list[tuple[str, str, str, Path, bool]] = [
    ("essma", "hair", "essma.trenza-cobre", Path("public/assets/wearables/v1/essma.trenza-cobre.png"), True),
    ("essma", "outfit", "essma.vestido-girasol", Path("public/assets/wearables/v1/essma.vestido-girasol.png"), True),
    ("essma", "shoes", "essma.botitas-camino", Path("public/assets/wearables/v3/essma.botitas-camino.png"), False),
    ("essma", "accessory", "essma.diademita-flor", Path("public/assets/wearables/v1/essma.diademita-flor.png"), True),
    ("essma", "accessory", "essma.sombrero-viajero", Path("public/assets/wearables/v2/essma.sombrero-viajero.png"), True),
    ("essma", "outfit", "essma.conjunto-florido", Path("public/assets/wearables/v2/essma.conjunto-florido.png"), True),
    ("essma", "shoes", "essma.botitas-cobalto", Path("public/assets/wearables/v5/essma.botitas-cobalto.png"), False),
    ("essma", "hair", "essma.monno-azul", Path("public/assets/wearables/v5/essma.monno-azul.png"), False),
    ("essma", "hair", "essma.corona-flores", Path("public/assets/wearables/v5/essma.corona-flores.png"), False),
    ("essma", "hair", "essma.gorrito-campesino", Path("public/assets/wearables/v5/essma.gorrito-campesino.png"), False),
    ("essma", "outfit", "essma.tunica-clasica", Path("public/assets/wearables/v5/essma.tunica-clasica.png"), False),
    ("essma", "outfit", "essma.overol-mezclilla", Path("public/assets/wearables/v5/essma.overol-mezclilla.png"), False),
    ("essma", "outfit", "essma.vestido-festivo", Path("public/assets/wearables/v5/essma.vestido-festivo.png"), False),
    ("essma", "shoes", "essma.huaraches-piel", Path("public/assets/wearables/v5/essma.huaraches-piel.png"), False),
    ("essma", "shoes", "essma.tenis-sol", Path("public/assets/wearables/v5/essma.tenis-sol.png"), False),
    ("essma", "shoes", "essma.zapatitos-rojos", Path("public/assets/wearables/v5/essma.zapatitos-rojos.png"), False),
    ("essma", "accessory", "essma.panuelo-cobalto", Path("public/assets/wearables/v5/essma.panuelo-cobalto.png"), False),
    ("essma", "accessory", "essma.canastita-flores", Path("public/assets/wearables/v5/essma.canastita-flores.png"), False),
    ("essma", "accessory", "essma.pulserita-cuentas", Path("public/assets/wearables/v5/essma.pulserita-cuentas.png"), False),
    ("juancito", "head", "juancito.sombrerito-palma", Path("public/assets/wearables/v5/juancito.sombrerito-palma.png"), False),
    ("juancito", "head", "juancito.casquito-explorador", Path("public/assets/wearables/v5/juancito.casquito-explorador.png"), False),
    ("juancito", "head", "juancito.corona-cactus", Path("public/assets/wearables/v5/juancito.corona-cactus.png"), False),
    ("juancito", "head", "juancito.gorrito-noche", Path("public/assets/wearables/v5/juancito.gorrito-noche.png"), False),
    ("juancito", "neck", "juancito.panuelo-rojo", Path("public/assets/wearables/v5/juancito.panuelo-rojo.png"), False),
    ("juancito", "neck", "juancito.collar-semillas", Path("public/assets/wearables/v5/juancito.collar-semillas.png"), False),
    ("juancito", "neck", "juancito.mono-mariposa", Path("public/assets/wearables/v5/juancito.mono-mariposa.png"), False),
    ("juancito", "neck", "juancito.bufandita-tejida", Path("public/assets/wearables/v5/juancito.bufandita-tejida.png"), False),
    ("juancito", "body", "juancito.sarape-sonora", Path("public/assets/wearables/v5/juancito.sarape-sonora.png"), False),
    ("juancito", "body", "juancito.chaleco-cuero", Path("public/assets/wearables/v5/juancito.chaleco-cuero.png"), False),
    ("juancito", "body", "juancito.overolcito-trabajo", Path("public/assets/wearables/v5/juancito.overolcito-trabajo.png"), False),
    ("tori", "head", "tori.sombrero-pluma", Path("public/assets/wearables/v5/tori.sombrero-pluma.png"), False),
    ("tori", "head", "tori.diadema-estrellita", Path("public/assets/wearables/v5/tori.diadema-estrellita.png"), False),
    ("tori", "head", "tori.gorrito-tejido", Path("public/assets/wearables/v5/tori.gorrito-tejido.png"), False),
    ("tori", "head", "tori.viserita-sol", Path("public/assets/wearables/v5/tori.viserita-sol.png"), False),
    ("tori", "neck", "tori.collar-flores", Path("public/assets/wearables/v5/tori.collar-flores.png"), False),
    ("tori", "neck", "tori.panuelo-amarillo", Path("public/assets/wearables/v5/tori.panuelo-amarillo.png"), False),
    ("tori", "neck", "tori.gargantilla-cuentas", Path("public/assets/wearables/v5/tori.gargantilla-cuentas.png"), False),
    ("tori", "body", "tori.ponchito-rayas", Path("public/assets/wearables/v5/tori.ponchito-rayas.png"), False),
    ("tori", "body", "tori.chaleco-denim", Path("public/assets/wearables/v5/tori.chaleco-denim.png"), False),
    ("tori", "body", "tori.capita-bosque", Path("public/assets/wearables/v5/tori.capita-bosque.png"), False),
    ("tori", "body", "tori.tunicas-flores", Path("public/assets/wearables/v5/tori.tunicas-flores.png"), False),
    ("anita", "head", "anita.sombrero-vaquero", Path("public/assets/wearables/v5/anita.sombrero-vaquero.png"), False),
    ("anita", "head", "anita.mono-rosa", Path("public/assets/wearables/v5/anita.mono-rosa.png"), False),
    ("anita", "head", "anita.gorrito-campana", Path("public/assets/wearables/v5/anita.gorrito-campana.png"), False),
    ("anita", "head", "anita.diadema-girasol", Path("public/assets/wearables/v5/anita.diadema-girasol.png"), False),
    ("anita", "neck", "anita.campanilla-dorada", Path("public/assets/wearables/v5/anita.campanilla-dorada.png"), False),
    ("anita", "neck", "anita.panuelo-marigold", Path("public/assets/wearables/v5/anita.panuelo-marigold.png"), False),
    ("anita", "neck", "anita.collar-corazon", Path("public/assets/wearables/v5/anita.collar-corazon.png"), False),
    ("anita", "neck", "anita.panuelo-verde", Path("public/assets/wearables/v5/anita.panuelo-verde.png"), False),
    ("anita", "body", "anita.mantita-tejida", Path("public/assets/wearables/v5/anita.mantita-tejida.png"), False),
    ("anita", "body", "anita.overol-granja", Path("public/assets/wearables/v5/anita.overol-granja.png"), False),
    ("anita", "body", "anita.falda-floreada", Path("public/assets/wearables/v5/anita.falda-floreada.png"), False),
    ("essma", "accessory", "essma.bolsita-tejida", Path("public/assets/wearables/v2/essma.bolsita-tejida.png"), True),
    ("essma", "accessory", "essma.sombrero-jardinero", Path("public/assets/wearables/v2/essma.sombrero-jardinero.png"), False),
    ("juancito", "head", "juancito.gorrito-aventurero", Path("public/assets/wearables/v3/juancito.gorrito-aventurero.png"), False),
    # Animal body keepers are canvas-authored (worn extraction) — do not re-fit.
    ("juancito", "body", "juancito.chaleco-bolsitas", Path("public/assets/wearables/v4/juancito.chaleco-bolsitas.png"), True),
    ("juancito", "neck", "juancito.panuelo-verde", Path("public/assets/wearables/v2/juancito.panuelo-verde.png"), False),
    ("juancito", "body", "juancito.poncho-cobalto", Path("public/assets/wearables/v4/juancito.poncho-cobalto.png"), True),
    ("juancito", "head", "juancito.gorrito-semillas", Path("public/assets/wearables/v2/juancito.gorrito-semillas.png"), False),
    ("tori", "head", "tori.gorrito-hojita", Path("public/assets/wearables/v1/tori.gorrito-hojita.png"), False),
    ("tori", "neck", "tori.panuelo-azul", Path("public/assets/wearables/v1/tori.panuelo-azul.png"), False),
    ("tori", "neck", "tori.panuelo-coral", Path("public/assets/wearables/v3/tori.panuelo-coral.png"), False),
    ("tori", "body", "tori.chaleco-camino", Path("public/assets/wearables/v4/tori.chaleco-camino.png"), True),
    ("anita", "body", "anita.chaleco-margarita", Path("public/assets/wearables/v4/anita.chaleco-margarita.png"), True),
    ("anita", "neck", "anita.panuelo-rosa", Path("public/assets/wearables/v1/anita.panuelo-rosa.png"), False),
    ("anita", "body", "anita.chaleco-cielo", Path("public/assets/wearables/v4/anita.chaleco-cielo.png"), True),
    ("anita", "head", "anita.corona-flores", Path("public/assets/wearables/v2/anita.corona-flores.png"), False),
]


def load_contract() -> dict:
    return json.loads(CONTRACT_PATH.read_text())


def slot_box(contract: dict, character: str, slot: str) -> dict:
    try:
        return contract["characters"][character][slot]
    except KeyError as exc:
        raise SystemExit(f"No slot contract for {character}/{slot}") from exc


def resolve_box(box: dict, bounds: tuple[int, int, int, int], canvas: int) -> dict:
    """Use optional lower sub-box when source content lives in the lower half."""
    src_cy = (bounds[1] + bounds[3]) / 2
    lower = box.get("lower")
    if isinstance(lower, dict) and src_cy >= canvas * 0.55:
        return lower
    return box


def fit_image(
    source: Image.Image,
    box: dict,
    *,
    canvas: int = DEFAULT_CANVAS,
    design_center_x: int = DESIGN_CENTER_X,
    max_enlarge: float = 1.75,
) -> Image.Image:
    rgba = source.convert("RGBA")
    alpha = rgba.getchannel("A")
    bounds = alpha.getbbox()
    if not bounds:
        raise SystemExit("No opaque pixels in source")

    box = resolve_box(box, bounds, canvas)
    item = rgba.crop(bounds)
    # Bias vs the *source image* midline (works for 1024 cutouts and 1254 canvases).
    # Do not compare to design_center_x — that only applies on the final canvas.
    src_cx = (bounds[0] + bounds[2]) / 2
    source_mid_x = rgba.width / 2
    lateral_bias = src_cx - source_mid_x
    # Scale bias into final canvas space when source isn't already 1254.
    if rgba.width != canvas and rgba.width > 0:
        lateral_bias *= canvas / rgba.width

    max_w = int(box["maxWidth"])
    max_h = int(box["maxHeight"])
    scale = min(max_w / item.width, max_h / item.height)
    # Cap enlargement so tiny props (leaf hats) do not balloon to the max box.
    if scale > max_enlarge:
        scale = max_enlarge
    size = (max(1, round(item.width * scale)), max(1, round(item.height * scale)))
    item = item.resize(size, Image.Resampling.LANCZOS)

    center_x = int(box["centerX"])
    if abs(lateral_bias) >= SIDE_BIAS_THRESHOLD:
        center_x = int(center_x + lateral_bias)

    left = round(center_x - item.width / 2)
    attach = box.get("attach", "cover-from")
    if attach == "stand-on":
        ground = int(box.get("groundY", canvas - 20))
        top = ground - item.height
    elif attach == "sit-on":
        attach_y = int(box["attachY"])
        sit_inset = int(box.get("sitInset", 30))
        top = attach_y - item.height + sit_inset
    elif attach == "hang-from":
        top = int(box["attachY"])
    else:  # cover-from
        top = int(box.get("attachY", box.get("top", 0)))

    layer = Image.new("RGBA", (canvas, canvas))
    layer.alpha_composite(item, (left, max(0, top)))
    return layer


def write_thumbnail(runtime: Path, thumb: Path, size: int = 256) -> None:
    im = Image.open(runtime).convert("RGBA")
    box = im.getchannel("A").getbbox()
    if not box:
        raise SystemExit(f"No opaque pixels for thumbnail: {runtime}")
    cropped = im.crop(box)
    scale = min(size / cropped.width, size / cropped.height)
    resized = cropped.resize(
        (max(1, round(cropped.width * scale)), max(1, round(cropped.height * scale))),
        Image.Resampling.LANCZOS,
    )
    thumb_im = Image.new("RGBA", (size, size))
    thumb_im.alpha_composite(
        resized,
        ((size - resized.width) // 2, (size - resized.height) // 2),
    )
    thumb.parent.mkdir(parents=True, exist_ok=True)
    thumb_im.save(thumb)


def fit_file(
    input_path: Path,
    output_path: Path,
    character: str,
    slot: str,
    *,
    contract: dict | None = None,
    write_thumb: bool = True,
) -> dict:
    contract = contract or load_contract()
    box = slot_box(contract, character, slot)
    canvas = int(contract.get("canvas", DEFAULT_CANVAS))
    design_cx = int(contract.get("designCenterX", DESIGN_CENTER_X))
    max_enlarge = float(contract.get("maxEnlarge", 1.75))
    source = Image.open(input_path)
    fitted = fit_image(
        source,
        box,
        canvas=canvas,
        design_center_x=design_cx,
        max_enlarge=max_enlarge,
    )
    output_path.parent.mkdir(parents=True, exist_ok=True)
    fitted.save(output_path)
    result = {
        "character": character,
        "slot": slot,
        "output": str(output_path),
        "content": fitted.getchannel("A").getbbox(),
    }
    if write_thumb:
        thumb = output_path.parent / "thumbnails" / output_path.name
        write_thumbnail(output_path, thumb)
        result["thumbnail"] = str(thumb)
    return result


def refit_keepers(*, dry_run: bool = False, force: bool = False) -> int:
    contract = load_contract()
    backup_root = ROOT / ".fit-backups" / "wearables"
    count = 0
    for character, slot, slug, rel, preserve in KEEPER_SPECS:
        path = ROOT / rel
        if not path.exists():
            print(f"SKIP missing {rel}", file=sys.stderr)
            continue
        if preserve and not force:
            print(f"PRESERVE {slug} (canvas-authored)")
            continue
        if dry_run:
            print(f"WOULD FIT {slug} → {character}/{slot}")
            count += 1
            continue
        backup = backup_root / rel
        backup.parent.mkdir(parents=True, exist_ok=True)
        if not backup.exists():
            shutil.copy2(path, backup)
        result = fit_file(backup, path, character, slot, contract=contract)
        print(f"FIT {slug} {character}/{slot} content={result['content']}")
        count += 1
    return count


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input", type=Path, nargs="?")
    parser.add_argument("output", type=Path, nargs="?")
    parser.add_argument("--character", choices=["essma", "juancito", "tori", "anita"])
    parser.add_argument(
        "--slot",
        choices=["hair", "outfit", "shoes", "accessory", "head", "neck", "body"],
    )
    parser.add_argument("--refit-keepers", action="store_true")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument(
        "--force",
        action="store_true",
        help="Also re-fit canvas-authored (preserve) keepers",
    )
    parser.add_argument("--no-thumb", action="store_true")
    args = parser.parse_args()

    if args.refit_keepers:
        n = refit_keepers(dry_run=args.dry_run, force=args.force)
        print(f"{'Would refit' if args.dry_run else 'Refit'} {n} keepers")
        return

    if not args.input or not args.output or not args.character or not args.slot:
        parser.error("Provide INPUT OUTPUT --character --slot, or --refit-keepers")

    result = fit_file(
        args.input,
        args.output,
        args.character,
        args.slot,
        write_thumb=not args.no_thumb,
    )
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
