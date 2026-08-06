#!/usr/bin/env python3
"""Process AI generated wearable image (chroma key cleanup -> alpha transparent -> slot fit)."""

import sys
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
from fit_wearable import fit_file, load_contract

def chroma_to_alpha(img: Image.Image, key_color=(0, 255, 0), tolerance=70) -> Image.Image:
    """Convert green chroma background into clean transparent alpha channel with soft despill."""
    img = img.convert("RGBA")
    r, g, b, a = img.split()
    
    kr, kg, kb = key_color
    r_data = list(r.getdata())
    g_data = list(g.getdata())
    b_data = list(b.getdata())
    
    alpha_data = []
    new_g_data = []
    
    for i in range(len(r_data)):
        pr, pg, pb = r_data[i], g_data[i], b_data[i]
        # Dist from key color (green)
        dist = math.sqrt((pr - kr)**2 + (pg - kg)**2 + (pb - kb)**2) if 'math' in globals() else abs(pg - kg)
        
        # Chroma key condition: green dominant over red and blue
        is_green = (pg > 120 and pg > pr + 30 and pg > pb + 30)
        
        if is_green:
            alpha_data.append(0)
            new_g_data.append(int((pr + pb) / 2))
        else:
            alpha_data.append(255)
            # Despill green fringe on edges
            if pg > pr and pg > pb:
                new_g_data.append(max(pr, pb))
            else:
                new_g_data.append(pg)
                
    g.putdata(new_g_data)
    alpha = Image.new("L", img.size)
    alpha.putdata(alpha_data)
    
    cleaned = Image.merge("RGBA", (r, g, b, alpha))
    return cleaned

import math

def process_wearable(input_path: str, character: str, slot: str, slug: str):
    contract = load_contract()
    src = Image.open(input_path)
    cleaned = chroma_to_alpha(src)
    
    temp_raw = ROOT / "public/assets/wearables/v5" / f"raw-{slug}.png"
    temp_raw.parent.mkdir(parents=True, exist_ok=True)
    cleaned.save(temp_raw)
    
    out_path = ROOT / "public/assets/wearables/v5" / f"{slug}.png"
    res = fit_file(temp_raw, out_path, character, slot, contract=contract, write_thumb=True)
    
    if temp_raw.exists():
        temp_raw.unlink()
        
    print(f"✓ Processed & Fitted AI art: {slug} ({character}/{slot}) -> {out_path}")
    return res

if __name__ == "__main__":
    if len(sys.argv) < 5:
        print("Usage: python3 scripts/process_ai_wearable.py <input_path> <character> <slot> <slug>")
        sys.exit(1)
    process_wearable(sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4])
