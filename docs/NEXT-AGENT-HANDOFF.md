# Essma World — Next Agent Handoff

## Mission

Keep the **2D hub** (map → ranch → dress → decorate → save) warm and
child-clear, then grow **isolated destinations** later. Do **not** rebuild
dress-up/ranch in 3D for Kart/Kong.

Read first:

1. [`ROADMAP.md`](../ROADMAP.md) — P0–P3 sequencing
2. [`docs/DESTINATIONS.md`](DESTINATIONS.md) — hub vs destinations, Bros → Kong → Kart
3. [`docs/ASSET-GENERATION.md`](ASSET-GENERATION.md) — wearable + paper-doll pipeline
4. [`docs/ASSET-QA.md`](ASSET-QA.md) — honest art status
5. [`docs/reference-images/README.md`](reference-images/README.md) — direction only
6. Production package when present: `docs/production/` or `outputs/essma-world-production-docs/`

---

## Current state (as of 2026-08-06)

### What is working

- **World map → Rancho → Dress-up → Patio → Save** loop is fully playable.
- **Playable closet = quality keepers only**: 20 starter + 2 reward wearables (v1 originals + solid AI v2 cutouts + **v3 calibration four** + **v4 animal body**). ~45 procedural Pillow placeholders are `unlock.type: "pending-art"` and stripped from profiles.
- **Dress-up**: equip/unequip toggle + Quitar; **unequip now persists** across save/reload (explicit `""` is not refilled from `DEFAULT_LOOKS`).
- **Ranch action bar**: Decorar / Jardín / Cuidar stack correctly in flex (absolute stacking bug fixed).
- **Garden + Care** mini-games with reward contract and React host validation.
- **IndexedDB save** with caregiver export/import (2-second hold gate).
- **Settings**: music, SFX, reduced motion honored before any audio or animation starts.

### Architecture decision locked ✅

- **Hub** = React + Phaser 2D paper-doll. **Destinations** (Essma Bros, Kong, Kart) = isolated `MiniGameModule`s; Three.js only lazy inside a destination.
- Identity bridge is phased (game-specific art first; hub cosmetics mapped later). See [`DESTINATIONS.md`](DESTINATIONS.md).

### Foundations + fit calibration

- Closet gate + profile migration strip pending-art IDs.
- Durable unequip + tests.
- Decorar CSS fix.
- Essma dress panel remounts on `selected` (`key={selected}`); scene controls expose `data-character-id`.
- **Overlay vs Phaser input**: ranch chips/action bar no longer double-fire world hits (`input.windowEvents: false` + canvas-target guard). Mouse/touch on **Essma** opens Essma dress, not Juancito.
- **Slot-fit contract** + `fit_wearable.py` / `verify-wearable-fit.py`.
- **v3 calibration** (hat/scarf/boots) + **v4 animal body** worn-extraction: placement improved; **worn visual bar still open** for most animal bodies → next slice is paper-doll (torso-under / paws-over), not attachY or 3D.
- GitHub issue for remaining regen: https://github.com/DanielhCarranza/essma-world/issues/4

### Phase 1 / quality gaps still open

- ⬜ Animal **paper-doll** worn fit (Juancito / Tori / Anita) — ROADMAP P0.2 / P2
- ⬜ Regen remaining pending-art wearables + `botitas-cobalto` covering cutout ([issue #4](https://github.com/DanielhCarranza/essma-world/issues/4))
- ⬜ Asset provenance: `productApproved: false` until real product review
- ⬜ Cultural review: `culturalReview: "not-performed"`
- ✅ Mobile smoke (390×844): Decorar/Jardín/Cuidar visible non-overlapping; Essma chip opens Essma; unequip shoes persists as `""` after refresh
- ⬜ First-play guide: icon-led, no reading required for a 5-year-old
- ⬜ Live-browser ranch spot-check of calibration looks (headless Phaser fails; dress previews already pass)

---

## Next implementation slices (priority order)

1. **Animal paper-doll worn fit** — torso base + paws overlay; species-shaped body keepers; browser visual gate (`ASSET-GENERATION` “Paper-doll authoring”).
2. **Mochila** — collection panel for unlocked wearables/decor (exclude `pending-art`).
3. Remaining P0 usability / CI confidence as needed.
4. Animal Care polish / brief if still incomplete vs ROADMAP.
5. **Essma Bros zip inventory** + destination brief — wire as module later; never into ranch Phaser.
6. Essma Kong, then Essma Kart (lazy 3D only in Kart module) — after hub love and one destination loop.

Do **not** re-enable pending-art items until issue #4 delivers real cutouts.
Do **not** install Three.js on the ranch “to prepare.”

---

## Non-negotiable acceptance criteria

- A child can select Essma, Juancito, Tori, or Anita, equip compatible items, place or remove patio decor, and see changes immediately.
- Looks, patio layout, audio/reduced-motion preferences, and settings persist across a normal refresh through IndexedDB.
- Parent backup export/import validates data and never exposes a child to external links or personal-data collection.
- Touch, mouse, and keyboard navigation are usable; important interactions have labels and visible focus.
- The page builds and tests successfully: `npm test && npm run lint && npx tsc --noEmit` all pass.
- No visual asset contains generated text, third-party marks, copied game UI, Nintendo/Switch/ESRB material, or a named-studio imitation.

---

## Dev environment notes

- `npm run dev` / `npx vinext dev --port 3000` **must** be run with `BypassSandbox: true` — port 9229 (Cloudflare plugin debugger) is blocked in the standard sandbox.
- If the server reports "Port 3000 is in use, trying another one...", kill stale processes first: `pkill -9 -f "serve-static.mjs"; pkill -9 -f "vinext dev"`, then restart.
- `npm test`, `npm run lint`, `npx tsc --noEmit` all run correctly inside the standard sandbox.

---

## Visual-quality gate

Use the reference direction in the Asset Bible: Essma's dark curly hair and blue bow; instantly recognizable prairie-dog, cacomixtle, and calf silhouettes; warm Sonoran gold/terracotta/cactus/cobalt palette; tactile wood/adobe/textile materials; clear center play zone. The QA threshold is **85/100 with no hard-fail issue**. Clothes must look **worn** (paper-doll occlusion), not merely centered.
