# Essma World — Next Agent Handoff

## Mission

Keep the **2D hub** (map → ranch → dress → decorate → save) warm and
child-clear, then grow **isolated destinations** later. Do **not** rebuild
dress-up/ranch in 3D for Kart/Kong.

Read first:

1. [`ROADMAP.md`](../ROADMAP.md) — P0–P3 sequencing
2. [`docs/DESTINATIONS.md`](DESTINATIONS.md) — hub vs destinations, Bros + Kart in repo; Kong later
3. [`docs/production/README.md`](production/README.md) — production package index
4. [`docs/ASSET-GENERATION.md`](ASSET-GENERATION.md) — wearable + paper-doll pipeline
5. [`docs/ASSET-QA.md`](ASSET-QA.md) — honest art status
6. [`docs/reference-images/README.md`](reference-images/README.md) — direction only
7. Production deep-dives as needed: [`ARCHITECTURE.md`](production/ARCHITECTURE.md),
   [`ASSET-BIBLE.md`](production/ASSET-BIBLE.md), [`Roadmap.md`](production/Roadmap.md)

---

## Current state (as of 2026-08-15)

### What is working

- **World map → Rancho → Dress-up → Patio → Save** loop is fully playable.
- **Playable closet = quality keepers only**: 20 starter + 2 reward wearables (v1 originals + solid AI v2 cutouts + **v3 calibration four** + **v4 animal body**). ~45 procedural Pillow placeholders are `unlock.type: "pending-art"` and stripped from profiles.
- **Dress-up**: equip/unequip toggle + Quitar; **unequip now persists** across save/reload (explicit `""` is not refilled from `DEFAULT_LOOKS`).
- **Ranch action bar**: Decorar / Jardín / Cuidar stack correctly in flex (absolute stacking bug fixed).
- **Garden + Care** mini-games with reward contract and React host validation.
- **IndexedDB save** with caregiver export/import (2-second hold gate).
- **Settings**: music, SFX, reduced motion honored before any audio or animation starts.
- **Destinations (v1 enter/play/Salir):** Essma Bros and Essma Kart are wired as isolated modules under `app/destinations/essma-bros/` and `app/destinations/essma-kart/`, launched from the world-map cover. Host uses [`app/lib/destinations.ts`](../app/lib/destinations.ts) and [`app/destination-shell.tsx`](../app/destination-shell.tsx). v1 reward allowlists are empty.

### Architecture decision locked ✅

- **Hub** = React + Phaser 2D paper-doll. **Destinations** = isolated `MiniGameModule`s under `app/destinations/`; **Three.js lazy-loads only in Essma Kart**, never in the ranch.
- Identity bridge is phased (game-specific art first; hub cosmetics mapped later). Do **not** rebuild ranch/dress-up in 3D. See [`DESTINATIONS.md`](DESTINATIONS.md).
- **Kart persistence:** `localStorage` hints only (`essma_kart_save`, ghosts); destinations never write IndexedDB.
- **Prototype zips:** `temp-mini-game/` is gitignored; do not commit archives.

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

After the destination enter/play/Salir slice, prioritize **hub polish**, not a
ranch 3D rewrite:

1. **Animal paper-doll worn fit** — torso base + paws overlay; species-shaped body keepers; browser visual gate (`ASSET-GENERATION` “Paper-doll authoring”).
2. **Mochila** — collection panel for unlocked wearables/decor (exclude `pending-art`).
3. **Destination polish** — Salir clarity, mobile feel, soften score pressure in Bros/Kart; keep v1 empty reward allowlists until unlock policy is chosen.
4. Remaining P0 usability / CI confidence as needed.
5. Animal Care polish / brief if still incomplete vs ROADMAP.
6. **Essma Kong** — later climb destination; after Bros/Kart loop and hub love are solid.

Do **not** re-enable pending-art items until issue #4 delivers real cutouts.
Do **not** install Three.js on the ranch “to prepare.”
Do **not** share hub wearables into destinations yet — game-specific art only for v1.

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
