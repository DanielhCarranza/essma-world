# Asset Bible — Essma World

## Art direction

Create an original, rounded, storybook-like family-animation look: expressive faces, tactile materials, readable silhouettes, and the warm light of Sonora. The visual system takes mood cues from desert sunsets, adobe, wood, woven textiles, flowers, and ranch life—without copying reference-image characters, layouts, brand marks, or a named studio’s style.

### Palette and material language

| Role | Direction |
| --- | --- |
| Ground | sand beige, clay, warm brown, faded ochre |
| Sun and celebration | sunset orange, marigold yellow, desert pink |
| Nature | cactus green, mesquite green, water blue |
| UI | carved wood, stitched fabric, soft paper, painted ceramic accents |
| Readability | high-contrast dark text on light cards; do not rely on color alone |

## Production rules

- Every shippable asset receives a stable ID, source file, owner, license/provenance, target resolution, and catalog entry.
- Produce base characters and wearable layers from the same approved rig/template; do not paint a combined outfit into a base character.
- Export optimized runtime variants separately from editable source files.
- Use audio that is original or correctly licensed; log source and license.
- A cultural reviewer approves Sonoran references before the asset enters the catalog.

## Phase-based asset manifest

### A. Playable Core — required before first playtest

| Pack | Required assets |
| --- | --- |
| Character bases | Essma front/three-quarter 2D pose set; Juancito, Tori, Anita interactive bases; Loro Loco, Oso Taquito, Capybara cameo portraits. |
| Wearables | Ten compatible starter items: a balanced set of Essma hair/outfit/accessory/shoe pieces and animal head/neck/body pieces. |
| Ranch scene | Daytime Rancho de Essma background, house, barn, corral, paths, fence, cactus/flower set, interaction markers, and a locked-cameo story card. |
| UI kit | Logo wordmark, primary/secondary buttons, category tabs, inventory card, confirmation/reset/randomize icons, settings controls, dialog frame, focus/pressed/disabled states. |
| Motion | Idle, delighted reaction, tap feedback, scene transition, equip preview; reduced-motion alternatives. |
| Audio | One short original music loop, UI confirmation/cancel sounds, ranch ambience, and separate mute-safe volume behavior. |

### B. Cozy Ranch Expansion

- Essma and companion expressions, additional walk/celebration/action states.
- Initial furniture/decor sets: rustic ranch, Sonoran home, nature garden, and festival accents.
- Decoration placement shadows, grid/snap indicators, interaction states, animal-care props, story cards, and quest badges.
- First mini-game asset pack, selected only after its learning intent and interaction design are approved.

### C. World Expansion

- Region scene packs: Sonoran Desert, Pueblo Mágico, Mesquite Forest, Oasis, mountain pass, and Festival Plaza.
- Map nodes, travel transitions, collectible families, shop/vendor content, seasonal environment variants, and approved NPCs.
- New companion packs for Loro Loco, Oso Taquito, and Capybara once they move from cameo to interactive status.

### D. Future modules

- Essma Bros sprites, collision tiles, enemies, backgrounds, sounds, and controls only after the supplied prototype’s technical and rights review.
- Optional 3D mini-game models, textures, animations, and performance budgets as a standalone asset track.

## Layering specification

Character art uses logical slots, z-index rules, and per-target anchor points. A wearable must declare each supported target and slot. The runtime chooses the asset by ID; it must never rely on filename guessing.

| Target | Slots | Example |
| --- | --- | --- |
| Essma | hair → outfit → shoes → accessory foreground | braid, dress, boots, flower crown |
| Animals | body → neck → head | vest, bandana, hat |

Each layer needs normal, selected-preview, and missing-asset fallback behavior. The base appearance is always available as an offline fallback.

## Asset pipeline and acceptance

1. Write a catalog brief and cultural/source notes.
2. Create concept and get art-direction approval.
3. Produce editable master, runtime layers, thumbnail, and metadata.
4. Verify silhouette, layer alignment, Spanish name, target compatibility, contrast, and reduced-motion behavior.
5. Register the approved version in the catalog, then test in the game scene.

No production target requires the initial “hundreds of assets” vision at once. The roadmap gates each pack by a playable use case so quality and consistency remain high.
