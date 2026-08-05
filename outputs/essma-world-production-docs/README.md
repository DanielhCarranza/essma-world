# Essma World — Production Documents

This package is the source of truth for pre-production of **Essma World**, a Spanish-first, child-safe cozy ranch and dress-up web game.

## Read in this order

1. [PRD](PRD.md) — product intent, audience, scope, and canonical cast.
2. [GDD](GDD.md) — player experience and game systems.
3. [Architecture](ARCHITECTURE.md) — implementation boundaries and data model.
4. [Asset Bible](ASSET-BIBLE.md) — original art, audio, and content production plan.
5. [Content and Safety](CONTENT-AND-SAFETY.md) — language, accessibility, and child-safety rules.
6. [Roadmap](Roadmap.md) — milestone gates and production sequence.
7. [Test Plan](TEST-PLAN.md) — acceptance scenarios.

## Canonical decisions

- The child-facing game is entirely in Mexican Spanish; these production documents are in English.
- Essma de María is the protagonist. Juancito, Tori, Anita, Loro Loco, Oso Taquito, and Capybara are protected recurring characters. New characters may change through the content pipeline.
- The playable core is a 2D map-and-ranch vertical slice: one open ranch, five locked future places, Essma, Juancito, Tori, Anita, twenty starter wearables, and ten patio decorations.
- Dress-up is creative play, with no learning objective in the opening experience. Learning is added only in later mini-games and quests.
- The game has one local player, no ads, purchases, accounts, chat, social sharing, or analytics. A parent-only export/import backup is planned.
- Authored assets are original. Reference images establish mood only; they do not grant permission to copy characters, layouts, logos, or third-party marks.

## Glossary

| Term | Meaning |
| --- | --- |
| **Ranch hub** | The playable Rancho de Essma scene and the player’s home base. |
| **Catalog** | Versioned authored data that defines an item, character, quest, region, or mini-game. |
| **Wearable** | An outfit layer or accessory that can be equipped by a supported character. |
| **Cameo** | A visible story appearance that is not yet dressable or interactable. |
| **Mini-game contract** | The fixed interface a future mini-game uses to open, return a result, and grant safe rewards. |
| **Parent-only surface** | A guarded screen intended for an adult, such as backup/restore. |

## Source and reference policy

The supplied PRD and visual references inform this package. In case of conflict, the latest documented canonical decision above wins. The written PRD is authoritative for Juancito’s species (prairie dog), even if a reference image labels a character differently. External Sonoran cultural review has not yet been performed; metadata must continue to say so until a named review actually occurs.
