# Essma World — Agent Guide

## Start here

- Read `docs/NEXT-AGENT-HANDOFF.md` for the active implementation slice.
- Treat `outputs/essma-world-production-docs/README.md` as the product-design index; read the linked PRD, GDD, architecture, asset, safety, roadmap, and test documents before changing a system they govern.
- The game is Mexican-Spanish-first. Keep production-facing code and documents in English unless a document says otherwise.

## Repository map

- `app/` — child-facing Sites application and UI.
- `public/assets/` — approved runtime media only.
- `docs/reference-images/` — visual inspiration only; never import these files into game runtime or publish their logos/ratings/text as product content.
- `outputs/essma-world-production-docs/` — canonical production documents, intentionally checked in.
- `docs/` — agent handoffs and engineering notes.

## Product guardrails

- Preserve Essma, Juancito, Tori, Anita, Loro Loco, Oso Taquito, and Capybara as canonical recurring characters. Do not change Juancito’s prairie-dog species or Tori’s cacomixtle species.
- The playable core is 2D. Keep React for accessible UI and Phaser as the future 2D world boundary. Do not add Three.js to the ranch core; reserve it for a later, isolated mini-game module.
- Maintain one-player local play: no ads, purchases, accounts, chat, external links for children, analytics, or child personal-data collection.
- Keep the opening dress-up experience creative and pressure-free: no scores, streaks, time pressure, loot boxes, or paid unlock paths.

## Assets and visual quality

- Use the reference pack for mood, palette, materials, composition, and the established Essma/companion identity—not for direct copying. Never ship third-party marks, copied UI, generated text, or a named-studio imitation.
- Every production asset needs a stable catalog ID, provenance/source record, Mexican-Spanish display name, target resolution, and an accessibility review.
- Verify wearable-slot anchors and transparent edges before shipping. New launch art must pass the documented visual QA threshold (85/100, with no hard-fail issue).

## Development and verification

- Develop from a native Linux/WSL filesystem location, not a Windows-mounted `/mnt/c/...` path. The prior mounted-path install stalled.
- Install with `npm ci`; verify with `npm run build`, `npm test`, and `npm run lint` after code, dependency, or configuration changes.
- Keep player profile state in IndexedDB; use browser storage only for nonessential UI hints. Validate save imports and migrations before replacing stored data.
- Make focused commits. Update the relevant production document and this guide when a durable product or workflow rule changes.

