# Essma World — Next Agent Handoff

## Mission

Turn the committed **Playable Core** into a validated, deployable 2D Sites game without expanding the product scope. The child-facing game remains Mexican Spanish, single-player, local-only, and free of ads, purchases, accounts, chat, and analytics.

Read the production package and visual references first:

1. [`outputs/essma-world-production-docs/README.md`](../outputs/essma-world-production-docs/README.md)
2. [`PRD.md`](../outputs/essma-world-production-docs/PRD.md)
3. [`ARCHITECTURE.md`](../outputs/essma-world-production-docs/ARCHITECTURE.md)
4. [`ASSET-BIBLE.md`](../outputs/essma-world-production-docs/ASSET-BIBLE.md)
5. [`docs/reference-images/README.md`](reference-images/README.md) and the five supplied images it indexes.

## Current state

- The child-first loop exists in `app/page.tsx`: illustrated map → Rancho → dress a friend → decorate the patio → save locally. Rancho is open; five future regions are visibly locked.
- `public/assets/rancho-de-essma-v1.png` is an original ranch background. Visual QA: **92/100, passed**. It may ship as launch key art, but later production needs the documented parallax layers and catalog/provenance metadata.
- Four original production bases, twenty aligned wearable layers, three cameo portraits, and ten transparent patio props are registered in the versioned catalog. Generated pack manifests live beside the runtime assets.
- The ranch world and its touch/mouse hotspots run in `app/ranch-scene.tsx` through Phaser, using the approved ranch asset as the initial backdrop. React retains the accessible menus, inventory panels, persistence, and semantic fallback controls; the scene communicates selections through a small typed event interface.
- Future Three.js work is isolated to future mini-games. Do **not** add Three.js to the ranch core.

## First task: preserve a healthy build

Run `npm ci --include=dev`, `npm test`, and `npm run lint` before feature work. Keep the repository in a native filesystem location and treat a red build as a release blocker.

## Next implementation slice

After validation, the next coherent slice is one short visual ranch activity:

- Add a no-reading-required care or discovery interaction that lasts about two minutes and has no failure pressure.
- Return rewards only through the existing framework-neutral mini-game result contract and React host validation.
- Add a small visible “you did it” collection moment; do not add currency, streaks, timers, or a shop.
- Keep Three.js out of the ranch. If a future mini-game genuinely needs it, lazy-load it behind the existing module seam and give it a separate performance budget.

## Non-negotiable acceptance criteria

- A child can select Essma, Juancito, Tori, or Anita, equip compatible items, place or remove patio decor, and see changes immediately.
- Looks, patio layout, audio/reduced-motion preferences, and settings persist across a normal refresh through IndexedDB.
- Parent backup export/import validates data and never exposes a child to external links or personal-data collection.
- Touch, mouse, and keyboard navigation are usable; important interactions have labels and visible focus.
- The page builds and tests successfully in the target environment.
- No visual asset contains generated text, third-party marks, copied game UI, Nintendo/Switch/ESRB material, or a named-studio imitation.

## Visual-quality gate

Use the reference direction already recorded in the Asset Bible: Essma’s dark curly hair and blue bow; instantly recognizable prairie-dog, cacomixtle, and calf silhouettes; warm Sonoran gold/terracotta/cactus/cobalt palette; tactile wood/adobe/textile materials; and a clear center play zone. The QA threshold is 85/100 with no hard-fail issue.
