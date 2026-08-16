#!/usr/bin/env python3
"""Update app/lib/game-catalog.ts to release all 46 v5 wearables from pending-art to starter (or reward)."""

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CATALOG_PATH = ROOT / "app/lib/game-catalog.ts"

content = CATALOG_PATH.read_text()

# Replacement pattern for pending-art unlock blocks in game-catalog.ts:
# e.g.:
#     2,
#
#     { type: "pending-art", reason: "procedural-placeholder" },
#   ),

# Convert pending-art blocks to assetVersion 5 and unlock starter (or reward)
def update_catalog_source(src: str) -> str:
    # 1. Update botitas-cobalto to version 5
    src = src.replace(
        'wearable(\n    "wearable.essma.botitas-cobalto",\n    "essma",\n    "shoes",\n    "Botitas azules",\n    "Botitas suaves para caminar.",\n    40,\n    89,\n    2,',
        'wearable(\n    "wearable.essma.botitas-cobalto",\n    "essma",\n    "shoes",\n    "Botitas azules",\n    "Botitas suaves para caminar.",\n    40,\n    92,\n    5,'
    )
    
    # 2. Update all pending-art items
    # Pattern matching wearable definition with pending-art unlock
    pattern = re.compile(
        r'(wearable\(\s*"wearable\.[^"]+",\s*"[^"]+",\s*"[^"]+",\s*"[^"]+",\s*"[^"]+",\s*\d+,\s*\d+,\s*)2,(\s*\{ type: "pending-art", reason: "procedural-placeholder" \},?\s*\),?)',
        re.DOTALL
    )

    def replacer(match):
        prefix = match.group(1)
        # Bump version to 5 and set starter unlock
        return f'{prefix}5,\n  ),'

    updated = pattern.sub(replacer, src)
    return updated

new_content = update_catalog_source(content)
CATALOG_PATH.write_text(new_content)
print("Updated game-catalog.ts with v5 wearable unlocks!")
