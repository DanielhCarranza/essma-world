# Essma World — Hub and Destinations

Canonical product architecture for how the ranch, dress-up, and future
mini-games relate. Read with [`ROADMAP.md`](../ROADMAP.md),
[`app/mini-game.ts`](../app/mini-game.ts), and
[`docs/ASSET-GENERATION.md`](ASSET-GENERATION.md).

## Product shape

Essma World is a **safe home base (hub)** plus **optional destinations**
(mini-worlds / mini-games), not a single 3D avatar game.

| Layer | Child job | Tech |
| --- | --- | --- |
| **Hub** | Dress friends, decorate the ranch, choose where to go | React + Phaser 2D |
| **World doors** | Open map places when ready | World map + profile unlocks |
| **Destinations** | Play Essma Bros, Kart, Kong-style climbs, etc. | Isolated `MiniGameModule` (2D or 3D) |

Dress-up and patio play stay in the hub. Racing, platforming, and climb games
live behind map doors or ranch portals. They never become ranch renderer
dependencies.

## Durable decisions (do not silently reverse)

1. **Do not rebuild ranch / dress-up in 3D** to “prepare” for Kart or Kong.
   Phaser remains the ranch canvas. Three.js (or another engine) loads only
   inside a destination module.
2. **Hub wearables stay 2D paper-doll layers** (1254×1254 stacked 1:1). Fit
   problems are art/authoring problems (limb overlays, species-shaped wraps),
   not a reason to switch engines.
3. **Every destination implements `MiniGameModule`**: read-only
   `MiniGameContext`, returns `MiniGameResult`. Only the React host validates
   rewards and writes IndexedDB.
4. **Originality:** destinations may be *inspired by* beloved genres (kart,
   climb, platformer). They must not copy Nintendo (or other) assets, UI,
   level layouts, logos, or trade dress. Cast, places, and names stay Essma
   World / Sonoran.
5. **Child-safety defaults still apply** in destinations: no ads, purchases,
   accounts, chat, social share, analytics, or child personal-data collection.
   Prefer gentle challenge; avoid harsh failure punishment in early slices.

## Identity bridge (hub look → destination cosmetics)

Do **not** require a shared 3D wardrobe before the first destination ships.

| Phase | What destinations see |
| --- | --- |
| **A — Now** | Hub appearance stays 2D catalog IDs only |
| **B — First destinations** | Game-specific Essma / friends art; fixed or simple palette variants |
| **C — Later** | Map a few hub slots → destination cosmetics via catalog IDs (e.g. scarf color, hat, kart skin) |
| **D — Optional much later** | Shared 3D avatar only if content volume justifies a second pipeline |

Dress-up remains valuable even when a kart race only reads “Essma with blue
bow + unlocked scarf tint.”

## Destination contract (every mini-game)

Before implementation, write a one-page brief covering:

| Field | Required |
| --- | --- |
| Stable ID | e.g. `destination.essma-bros` |
| Child goal | One sentence, icon-led play |
| Entry | Map node and/or ranch portal; intentional enter only |
| Engine | Phaser 2D, React UI, Three.js, or other — **lazy** |
| Context in | `MiniGameContext` only (settings, locale, unlock snapshot) |
| Result out | `completed` + allowlisted unlock IDs, `cancelled`, or `failed` |
| Rewards | Catalog IDs only; host allowlist; atomic save |
| Assets | Separate versioned `public/assets/...` budget; no ranch bundle bloat |
| Failure | Load / unsupported / runtime errors return to hub without corrupting save |
| Cleanup | Destroy renderers, audio, listeners on exit |
| Originality / rights | Source review for any prototype zip; no third-party marks |
| Performance | Mobile budget; does not download until entered |

Code seam: [`app/mini-game.ts`](../app/mini-game.ts). Garden and Care already
prove the host path; destinations reuse it.

## Destination modules in the repo (v1 inventory)

Two prototypes are checked in as isolated destination modules. Both launch from
the **world-map cover** (intentional enter). v1 uses **empty reward
allowlists** — the host contract is wired, but no hub unlocks are granted yet.
Every destination must expose a child-clear **Salir** path back to the hub.

| Module | Engine | Source | Assets | Persistence |
| --- | --- | --- | --- | --- |
| **Essma Bros** | Custom 2D canvas platformer (not Phaser); React `App`; 3 levels; procedural WebAudio | [`app/destinations/essma-bros/`](../app/destinations/essma-bros/) | [`public/assets/destinations/essma-bros/v1/`](../public/assets/destinations/essma-bros/v1/) | None in destination; hub IndexedDB only |
| **Essma Kart** | Three.js racer; zustand; lazy-load only | [`app/destinations/essma-kart/`](../app/destinations/essma-kart/) | [`public/assets/destinations/essma-kart/v1/`](../public/assets/destinations/essma-kart/v1/) | `localStorage` hints only (`essma_kart_save`, ghost replays); **never IndexedDB** |

**Prototype hygiene:** `temp-mini-game/` holds local zip archives and is
**gitignored** — do not commit zips. No Gemini-generated runtime assets.

**Future asset sharing (do not build now):** later we may share character or
wearable art between the hub and destinations via catalog IDs. v1 destinations
use game-specific art only; do not block shipping on a shared wardrobe pipeline.

## Planned destinations (sequenced)

Current pair: **Essma Bros + Essma Kart** (enter → play → Salir). **Essma
Kong** remains a later climb destination.

### 1. Essma Bros — in repo

- **Genre:** kind side-scrolling platformer (Mario Bros–*inspired*, original).
- **Engine:** custom 2D canvas (not Phaser); React shell; procedural WebAudio.
- **v1 gate:** enter from map cover, play three levels, Salir on mobile +
  desktop; contract tests; no ranch Three.js import.
- **Rewards:** empty allowlist for v1; optional hub unlock in a later slice.

### 2. Essma Kart — in repo

- **Genre:** local-only kart racing (Mario Kart–*inspired*, original tracks
  and vehicles).
- **Engine:** Three.js **inside this module only**, lazy-loaded, with its own
  performance budget.
- **Persistence:** zustand + `localStorage` for kart settings/ghosts only;
  never writes IndexedDB or profile state.
- **v1 gate:** enter from map cover, race, Salir; empty reward allowlist.
- **Identity:** Phase B — game-specific cast art; hub cosmetic bridge later.
- **Hero kart mesh:** runtime GLB at
  [`public/assets/destinations/essma-kart/v1/essma-kart-model.glb`](../public/assets/destinations/essma-kart/v1/essma-kart-model.glb)
  (compressed from the authoring file). Keep the 60MB source out of git;
  re-run `scripts/compress-kart-glb.py` if the sculpt changes.

### 3. Essma Kong — later

- **Genre:** climb / collect vertical play (Donkey Kong–*inspired*, original).
- **Why after Bros/Kart:** the enter → play → return loop is proven; Kong adds
  a smaller vertical slice than racing.
- **Hub link:** same destination contract; optional unlock tied to care/garden
  story later.

Locked map places (Desierto, Pueblo, Bosque, Oasis, Valle de flores) remain
content promises until a destination brief + asset pack + playtest exist for
the chosen node. Do not fake-open a region.

## Hub paper-doll (required for “worn” clothes)

Industry 2D dress-up does not “warp stickers.” It uses occlusion:

- **Essma already:** outfit layers + `hands-overlay` above clothes.
- **Animals next:** split bases into **torso under garments** and
  **paws/forelimbs (and if needed head) over garments**; author
  species-shaped body wraps with limb cutouts and matching light.

Until that ships, animal body v4 layers may pass *placement* and still fail
the *worn* visual bar. See ASSET-GENERATION “Paper-doll authoring.”

## What not to do

- Install Three.js in the ranch bundle “to prepare.”
- Share one WebGL context between ranch and Kart.
- Let a destination write profiles or invent unlock IDs.
- Treat attachY tuning as a substitute for paper-doll structure.
- Clone commercial level layouts or character designs from named franchises.
