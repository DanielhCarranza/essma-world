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

## Planned destinations (sequenced)

Order is by learning cost and hub value, not by ambition. Kart is the dream;
Bros / Kong teach the enter → play → reward → return loop cheaper.

### 1. Essma Bros (first destination candidate)

- **Genre:** kind side-scrolling platformer (Mario Bros–*inspired*, original).
- **Source:** existing prototype zip (inventory + rights review before merge).
- **Engine guess:** keep as 2D unless the zip already commits otherwise.
- **Hub link:** map node or ranch “adventure door”; unlock one wearable or
  decor on gentle completion.
- **Gate:** playable enter/exit on mobile + desktop; contract tests; no ranch
  Three.js import.

### 2. Essma Kong (second)

- **Genre:** climb / collect vertical play (Donkey Kong–*inspired*, original).
- **Why second:** smaller systems surface than racing; good 2.5D or light 3D
  practice inside an isolated module.
- **Hub link:** same destination contract; optional unlock tied to care/garden
  story later.

### 3. Essma Kart (later)

- **Genre:** local-only kart racing (Mario Kart–*inspired*, original tracks
  and vehicles).
- **Why last among the three:** tracks, feel, mobile steering, and art cost.
- **3D:** allowed **inside this module only**, lazy-loaded, with its own
  performance budget.
- **Identity:** Phase B/C bridge — recognizable cast; optional cosmetic from
  hub unlocks later.

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
