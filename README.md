# Essma World

**Essma World** is a cozy, Spanish-first 2D web game about Essma de María and her animal friends exploring, creating, and caring for their ranch in Sonora, Mexico.

The game is being built as a child-safe creative world for one player aged 5–10. Its opening experience is pure dress-up fun: choose Essma, Juancito, Tori, or Anita; create a look; and see it at **Rancho de Essma**. Future updates will add ranch decoration, quests, gentle learning mini-games, new regions, and isolated 3D mini-games where they genuinely improve play.

## What is in this repository

- A first playable-core source experience: ranch home, Spanish dress-up UI, four launch characters, ten starter wearables, local device saving, accessibility preferences, and parent backup/export/import.
- An original, visually reviewed Sonoran ranch background in `public/assets/`.
- A complete production package covering product, gameplay, architecture, assets, safety, roadmap, and tests.
- The full user-supplied visual reference pack, kept privately for art direction.

## The game promise

- **Creative:** dress Essma and her friends, then later decorate and personalize the ranch.
- **Sonoran:** build from real landscapes, animals, materials, and traditions with respectful cultural review.
- **Gentle:** no ads, purchases, accounts, chat, scoring pressure, streaks, loot boxes, or child data collection.
- **Spanish-first:** every child-facing string is Mexican Spanish.

## Canonical friends

| Character | Role in the playable core |
| --- | --- |
| Essma de María | Main character and dress-up lead |
| Juancito | Interactive, dressable prairie dog |
| Tori | Interactive, dressable cacomixtle |
| Anita | Interactive, dressable little cow |
| Loro Loco, Oso Taquito, Capybara | Protected recurring story characters; later interactions |

## Start here

| Need | Where to go |
| --- | --- |
| Continue implementation | [`docs/NEXT-AGENT-HANDOFF.md`](docs/NEXT-AGENT-HANDOFF.md) |
| Repository rules for agents | [`AGENTS.md`](AGENTS.md) |
| Product and design documents | [`outputs/essma-world-production-docs/README.md`](outputs/essma-world-production-docs/README.md) |
| Visual gold-standard reference pack | [`docs/reference-images/README.md`](docs/reference-images/README.md) |
| Active continuation task | [GitHub Issue #1](https://github.com/DanielhCarranza/essma-world/issues/1) |

## Development

Use a native Linux/WSL filesystem location for this repository, not a Windows-mounted `/mnt/c/...` path. The original mounted-path environment stalled while resolving JavaScript dependencies.

```bash
npm ci
npm run dev
npm run build
npm test
npm run lint
```

The current core uses React for accessible menus, dress-up panels, settings, and local-save flows. The ranch world is planned to move behind a Phaser 2D scene boundary. Three.js is a future option for self-contained mini-games only; it must not be introduced into the ranch core.

## Art and references

The five reference images in `docs/reference-images/` are the project’s visual gold standard for warmth, materials, character identity, game ambition, and Spanish-first UI feel. They are **inspiration only**: do not use them as runtime assets or copy their artwork, text, layouts, brand marks, age ratings, or logos.

New production assets must be original, have a stable catalog ID and provenance record, work at game scale, and pass the visual-quality gate described in the [Asset Bible](outputs/essma-world-production-docs/ASSET-BIBLE.md).

## Roadmap

1. **Playable Core:** validate the build; finish the 2D ranch and dress-up foundation.
2. **Cozy Ranch Expansion:** decoration, animal care, quests, collection, photo mode, and one optional mini-game.
3. **World Expansion:** desert, pueblo, oasis, festivals, collectibles, and new companions.
4. **Future modules:** Essma Bros integration, isolated 3D mini-games, seasonal content, and an evaluated parent-controlled cloud-backup option.

The detailed milestones and acceptance gates live in [Roadmap.md](outputs/essma-world-production-docs/Roadmap.md).

## Contributing

Read `AGENTS.md` before working in the repository. Keep changes focused, preserve the child-safety guardrails, update the relevant production document when a durable decision changes, and run the listed verification commands before handing work off.
