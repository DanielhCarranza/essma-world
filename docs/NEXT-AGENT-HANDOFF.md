# Essma World — Next Agent Handoff

## Mission

Extend the committed **Playable Core** into the **Cozy Ranch Expansion** (Phase 2). The child-facing game remains Mexican Spanish, single-player, local-only, and free of ads, purchases, accounts, chat, and analytics.

Read the production package first:

1. [`outputs/essma-world-production-docs/README.md`](../outputs/essma-world-production-docs/README.md)
2. [`Roadmap.md`](../outputs/essma-world-production-docs/Roadmap.md) — Phase 2 tasks are fully specified here
3. [`ARCHITECTURE.md`](../outputs/essma-world-production-docs/ARCHITECTURE.md)
4. [`ASSET-BIBLE.md`](../outputs/essma-world-production-docs/ASSET-BIBLE.md)
5. [`docs/reference-images/README.md`](reference-images/README.md) and the five supplied images.

---

## Current state (as of 2026-08-05)

### What is working

- **World map → Rancho → Dress-up → Patio → Save** loop is fully playable.
- **65 wearable items** across 4 characters (Essma, Juancito, Tori, Anita), 5+ items per slot.
- **Dress-up panel**: 100vh layout, centered character preview, friend picker in header, equip/unequip toggle (re-tap), "🚫 Quitar" button, scrollable closet.
- **Layer rendering**: canonical zIndex hierarchy (shoes:25, outfit/body:30, neck/accessory:35, head/hair:40) applied to all 65 items. ESSMA_HANDS_OVERLAY removed for clean dress rendering.
- **Garden mini-game**: complete with reward contract and React host validation.
- **IndexedDB save** with caregiver export/import (2-second hold gate).
- **Settings**: music, SFX, reduced motion honored before any audio or animation starts.
- Dev server runs via `npx vinext dev --port 3000` (requires `BypassSandbox: true` — the Cloudflare plugin needs port 9229 for debugging, which is blocked in the sandbox).

### Phase 1 gaps still open

- ⬜ Visual QA of all 65 wearables at game scale (alpha edges, correct anchors, transparent PNGs)
- ⬜ Asset provenance records: `productApproved: false` on all v2 wearables — needs a proper product review pass
- ⬜ Cultural review: `culturalReview: "not-performed"` on all assets — needs a native `es-MX` speaker pass for item names
- ⬜ Mobile: test dress-up panel + ranch action bar at 390×844 portrait and 844×390 landscape
- ⬜ First-play guide: make it icon-led, no reading required for a 5-year-old

---

## Next implementation slice — Animal Care Activity

The highest-priority Phase 2 task is a **gentle animal care interaction** (~2 minutes, no failure, no timer):

1. **Entry**: A "Cuidar" button appears in the ranch action bar (alongside "Decorar" and "Jardín")
2. **Activity**: The player taps/drags to feed Juancito seeds, water Anita's flowers, or brush Tori's tail — whichever animal is in the scene. Uses the existing Phaser hotspot system.
3. **Completion**: A warm "¡Gracias!" moment with a sparkle animation (Phaser tweens, no Three.js). Returns a `MiniGameResult` through the existing contract.
4. **Reward**: React host validates via `applyMiniGameResult`, unlocks one cosmetic item (hat, scarf, or decor). Shows "¡Nuevo adorno!" notice.
5. **No**: failure states, timers, streaks, scores, currency, or external links.

### Architecture notes

- The activity can follow the `GardenActivity` pattern in `app/garden-activity.tsx` — it renders as an overlay, receives a read-only context, and calls `onFinish(result)`.
- Define reward IDs in a `CARE_REWARD_IDS` constant (new wearable/decor items in the catalog) and pass them through the mini-game policy.
- The Phaser ranch scene should respond to a `"care-complete"` typed event by playing a brief idle animation on the cared-for character.
- Do not add Three.js. Keep all animations as Phaser tweens or CSS transitions.

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

Use the reference direction in the Asset Bible: Essma's dark curly hair and blue bow; instantly recognizable prairie-dog, cacomixtle, and calf silhouettes; warm Sonoran gold/terracotta/cactus/cobalt palette; tactile wood/adobe/textile materials; clear center play zone. The QA threshold is **85/100 with no hard-fail issue**.
