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

- The initial user experience exists in `app/page.tsx`: ranch home, four dress-up targets, ten starter catalog entries, Mexican-Spanish UI, IndexedDB profile save, and parent backup export/import.
- `public/assets/rancho-de-essma-v1.png` is an original ranch background. Visual QA: **92/100, passed**. It may ship as launch key art, but later production needs the documented parallax layers and catalog/provenance metadata.
- The current dress-up people/animals are intentionally code-native placeholder dolls. They prove interaction, layering slots, and persistence; replace them with approved original runtime art before release.
- The ranch world and its touch/mouse hotspots run in `app/ranch-scene.tsx` through Phaser, using the approved ranch asset as the initial backdrop. React retains the accessible menus, inventory panels, persistence, and semantic fallback controls; the scene communicates selections through a small typed event interface.
- Future Three.js work is isolated to future mini-games. Do **not** add Three.js to the ranch core.

## First task: recover a healthy native build

The prior environment used a WSL shell over a Windows-mounted workspace. Its `npm ci` resolver stalled and left `node_modules` incomplete. This is an environment issue, not a source-code diagnosis.

1. Clone the repository into a native Linux/WSL filesystem location, not a `/mnt/c/...` mounted path.
2. Run a clean `npm ci`.
3. Run `npm run build`, `npm test`, and `npm run lint`.
4. If the lockfile needs normalizing after the clean install, regenerate it from `package.json` and commit that focused repair.
5. Fix actual TypeScript, rendering, or test failures before adding features.

## Next implementation slice

After validation, continue from the focused Phaser ranch change:

- Keep the React dress-up panel, accessibility, Spanish strings, IndexedDB schema, and parent backup contract intact while advancing the scene.
- Preserve the typed scene-to-React event interface for ranch hotspot and character selection.
- Generate or commission original character bases for Essma, Juancito, Tori, and Anita, plus the ten cataloged wearable layers. Submit each production asset to visual QA before use.
- Add only the asset metadata needed for the playable core: stable ID, target, slot, source/prompt/provenance, thumbnail, runtime file, and `es-MX` display name.

## Non-negotiable acceptance criteria

- A child can select Essma, Juancito, Tori, or Anita from the ranch, equip compatible items, and see the change immediately.
- Looks, audio/reduced-motion preferences, and settings persist across a normal refresh through IndexedDB.
- Parent backup export/import validates data and never exposes a child to external links or personal-data collection.
- Touch, mouse, and keyboard navigation are usable; important interactions have labels and visible focus.
- The page builds and tests successfully in the target environment.
- No visual asset contains generated text, third-party marks, copied game UI, Nintendo/Switch/ESRB material, or a named-studio imitation.

## Visual-quality gate

Use the reference direction already recorded in the Asset Bible: Essma’s dark curly hair and blue bow; instantly recognizable prairie-dog, cacomixtle, and calf silhouettes; warm Sonoran gold/terracotta/cactus/cobalt palette; tactile wood/adobe/textile materials; and a clear center play zone. The QA threshold is 85/100 with no hard-fail issue.
