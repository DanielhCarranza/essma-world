# Asset QA — playable core

All v1 raster assets are original production assets. Repository reference
images informed only broad character identity and warm Sonoran direction; they
are not shipped, fetched at runtime, or copied. No external cultural review
was performed or claimed.

## Visual QA gate

The release-candidate visual gate is 85/100. A Terra visual review checked
character consistency, cutout silhouette, layer placement, chroma-key edge
readiness, and absence of text, logos, copied poses, or branded elements.

| Asset group                              | Result    | Product approval                                                                                                                                                  |
| ---------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Juancito base                            | 89/100    | Pending final product approval                                                                                                                                    |
| Tori base                                | 92/100    | Pending final product approval                                                                                                                                    |
| Anita base                               | 91/100    | Pending final product approval                                                                                                                                    |
| Essma base                               | 88/100    | Approved release candidate: dark curls, blue bow, light complexion, young child identity with non-obtrusive neutral base |
| Original world map, landscape + portrait | 89–92/100 | Pending final product approval                                                                                                                                    |
| Playable closet keepers (20 starter + 2 reward) | Mixed — see Foundations pass below | Pending final product approval |
| ~45 procedural v2 placeholders | Hard-fail (tiny Pillow ellipses, not cutouts) | Withheld from play (`unlock.type: pending-art`); tracked for regen |
| Ten patio decoration layers              | 88–92/100 | Pending final product approval                                                                                                                                    |
| Three cameo portraits                    | 88/100    | Pending final product approval                                                                                                                                    |

### Foundations pass (2026-08-05)

Playable closet is gated to quality keepers only (all v1 + non-tiny AI v2 cutouts).
Procedural placeholders (~45 files under 15KB from Pillow filler scripts) use
`unlock.type: "pending-art"` and are stripped from profile unlocks on migrate.

### Slot-fit system pass (2026-08-06)

**RCA:** Runtime never applied catalog anchors. Fit is 100% baked into 1254px
canvases. Many keepers were placed with ad-hoc / wrong boxes (and Tori face vs
tail center was ignored), so hats floated, vests sat on bellies, and scarves
covered snouts. Per-item CSS offsets would not scale.

**Durable fix:** [`public/assets/wearables/slot-fit-contract.json`](../public/assets/wearables/slot-fit-contract.json)
+ [`scripts/fit_wearable.py`](../scripts/fit_wearable.py) +
[`scripts/verify-wearable-fit.py`](../scripts/verify-wearable-fit.py).
Future wearables: isolated cutout → `fit_wearable.py --character --slot` →
`verify-wearable-fit.py`. Canvas-authored Essma outfits/hair/bags are
`preserve` (gold standard); animals + shoes re-fit through the contract.

| Keeper group | Fit result | Notes |
| --- | --- | --- |
| Essma outfits / hair / diademita / sombrero / bolsita | Pass (preserved) | Original canvas alignment kept |
| Animal head / neck / body keepers | Pass (contract) | Re-fit via attach modes; verify script 22/22 OK |
| Essma shoes (`botitas-cobalto`) | Fail hard (art) | Still needs covering cutout regen (issue #4) |

### Fit calibration subset (2026-08-06)

Proved the durable pipeline on four worst-failure slots with **v1-quality** regen +
contract fit into `public/assets/wearables/v3/`. Catalog IDs unchanged; paths bump to v3.

| ID | Slot | Result | Evidence |
| --- | --- | --- | --- |
| `wearable.juancito.gorrito-aventurero` | head | **Pass** | Hat on crown, eyes clear |
| `wearable.juancito.chaleco-bolsitas` | body | **Pass** | Vest on shoulders / torso |
| `wearable.tori.panuelo-coral` | neck | **Pass** | Under snout, face-centered X |
| `wearable.essma.botitas-camino` | shoes | **Pass** | Covering dual-boot cutout; ~98% foot-pixel cover |

**Mechanical:** `python3 scripts/verify-wearable-fit.py` → 0 failures.

**Visual (required):**
- Dress-up screenshots: `docs/asset-qa-calibration/screenshots/02-dress-juancito-hat-vest.png`, `04-dress-tori-coral.png`, `06-dress-essma-boots.png` (+ `*b-*-preview.png` crops).
- Contact overlays: `docs/asset-qa-calibration/{juancito,tori,essma}-look.png`.
- Ranch at game scale: `docs/asset-qa-calibration/screenshots/ranch-scale-{juancito,tori,essma}.png` (composites on ranch art). Headless Chromium cannot boot Phaser (`scene-load-error`); live ranch must still be spot-checked in a real browser before product approval.

**Contract locks** (do not blanket `--refit-keepers --force` on preserved Essma outfits):
`juancito.head`, `juancito.body`, `tori.neck`, `tori.body`, `anita.body`, `essma.shoes` in
[`slot-fit-contract.json`](../public/assets/wearables/slot-fit-contract.json).

### Animal body / vest pass (2026-08-06, browser follow-up)

Live dress UI showed animal vests still wrong after attachY-only re-fit (humanoid vest silhouettes on animal anatomy). **RCA:** runtime 1:1 stack is fine; humanoid armhole cutouts cannot look worn on pear/calf/cacomixtle bodies.

### Animal body worn extraction (2026-08-06) — v4

Replaced animal **body** keepers with canvas-authored layers extracted from “character wearing garment” generations (species-shaped wraps), shipped under `public/assets/wearables/v4/`, marked `preserve` in `KEEPER_SPECS`.

| ID | Result | Notes |
| --- | --- | --- |
| `juancito.chaleco-bolsitas` | **Pass (placement)** | Torso wrap under chin; not belly/face |
| `juancito.poncho-cobalto` | **Pass (placement)** | Chest wrap; blue hue extract |
| `tori.chaleco-camino` | **Pass (placement)** | Below snout; face clear |
| `anita.chaleco-margarita` | **Pass (placement)** | Chest panel under scarf |
| `anita.chaleco-cielo` | **Pass (placement)** | Narrower chest wrap |

**Browser evidence:** `docs/asset-qa-calibration/worn-body/browser/*-preview.png` (v4 URLs confirmed loading). Overlays: `docs/asset-qa-calibration/worn-body/*-overlay.png`.

**Honest limits (2026-08-06 follow-up):** v4 improved **placement** vs belly/face stickers, but most animal body items still fail a strict **worn** bar (flat panels, weak wrap, paws not clearly through garments). Root cause is full-body base + single overlay — not Phaser. **Next art slice:** paper-doll (torso-under / paws-over), documented in [`ASSET-GENERATION.md`](ASSET-GENERATION.md) and [`DESTINATIONS.md`](DESTINATIONS.md); tracked on [`ROADMAP.md`](../ROADMAP.md) P0.2 / P2. Do not treat engine migration as the fix. `productApproved` remains false.

`culturalReview` remains `"not-performed"`. Remaining pending-art closet + `botitas-cobalto` still on [issue #4](https://github.com/DanielhCarranza/essma-world/issues/4).

## Provenance and processing

- Runtime bases, layers, cameos, map, and decor: `public/assets/**/v*/`
- Derived thumbnails: `public/assets/**/v*/thumbnails/`
- Generated pack manifests: `public/assets/wearables/v2/wearables-v2.metadata.json`, `public/assets/decor/v1/decor-v1.metadata.json`, and `public/assets/world/v2/sonora-world-map-v2.metadata.json`
- Chroma key removal: local image-generation helper with border key, soft matte,
  and despill
- Layer placement: `scripts/reposition-wearable.py`
- Audio: locally synthesized original WAV files in `public/assets/audio/v1/`

Catalog QA metadata intentionally keeps `productApproved: false` and
`culturalReview: "not-performed"` until a final product reviewer signs off.
