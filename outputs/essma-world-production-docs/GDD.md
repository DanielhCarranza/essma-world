# Game Design Document — Essma World

## Player experience

The player begins at **Rancho de Essma**. The first session is a guided invitation: choose Essma or a friend, pick a hat, outfit, accessory, or shoes, and watch the ranch scene become theirs. There is no score, currency, or wrong combination.

### First-session flow

```text
Inicio → “¡Hola, Essma!” → Rancho → Vestir → Elegir personaje
       → Elegir artículo → Vista previa → “¡Listo!” → Rancho
```

On return, each equipped character uses their saved appearance. The menu offers a large play button, a dress-up shortcut, settings, and a discreet parent entry point.

## Dress-up system

### Supported launch layers

| Target | Layers |
| --- | --- |
| Essma | hair, outfit, accessory, shoes |
| Juancito, Tori, Anita | head, neck, body |

Each item has an ID, thumbnail, full-size visual layers, allowed targets, layer slot, unlock rule, display name, and optional collection/set tag. Equipping an item replaces only its slot; a reset restores the approved base look. “Sorpresa” randomizes only compatible unlocked items.

### Starter catalog target

At least ten total items are available at launch: a mix of Essma clothing/accessories plus compatible companion hats, bandanas, or body items. Exact visual choices are selected from the approved asset manifest, not invented in code.

## Ranch hub

The initial ranch is one friendly, readable 2D scene with the house, barn, corral, desert vegetation, and activity hotspots. It acts as a visual home—not a complex simulation. Tapping a character opens dress-up; tapping a locked cameo can show a short story card such as “¡Muy pronto conocerás a Loro Loco!”.

## Progression and rewards

The Playable Core has no compulsory economy. Later phases introduce **Ranch Coins** and **Friendship Hearts** only if they reward activity without purchase pressure. “Desert Stars” are not included while the game has no purchases.

Future unlock rules are transparent: a player sees what activity opens an item and never loses earned content. Daily-pressure systems, streaks, loot-box mechanics, and time-gated punishment are prohibited.

## Future systems

- **Decoration:** snap-safe placement, move, rotate, undo, and reset; no irreversible layouts.
- **Animal care:** short feed/brush/bathe interactions with visible kindness, not neglect penalties.
- **Quests:** one clear goal, progress indicator, and cosmetic/story reward.
- **Mini-games:** short, optional, and declared as fun, nature/culture discovery, early math, or Spanish-literacy activities before production begins.
- **Essma Bros:** a future mini-game integrated only through the documented contract after the sample code is supplied and reviewed.

## Controls and accessibility

- Touch: large tap targets, drag only where it adds clear value, and no multi-touch requirement.
- Desktop: click; keyboard tab/enter/escape; arrows where spatial movement exists.
- Provide text label plus icon for primary actions, captions for important audio, audio mute, and reduced-motion mode.
- Never require reading a long paragraph to continue. Use short phrases such as “Vestir”, “Listo”, “Volver”, and “Sorpresa”.

## Screen inventory

| Screen | Primary action |
| --- | --- |
| Inicio | Enter ranch or dress-up. |
| Rancho | Choose a friend, hotspot, or future activity. |
| Vestir | Select target, category, and item; preview and confirm. |
| Colección | Browse unlocked looks; future phases. |
| Ajustes | Audio, reduced motion, and language display confirmation. |
| Parent backup | Export/import saved progress after an adult gate. |
