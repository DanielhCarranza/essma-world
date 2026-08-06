# Technical Architecture — Essma World

## Architecture overview

Essma World is a Sites-hosted, touch-friendly web game. React and TypeScript provide the application shell and accessible menus; Phaser runs the 2D ranch and future mini-game scenes. This keeps buttons, dialogs, settings, and focus handling in semantic UI while the world remains performant canvas gameplay.

```text
React shell and UI
  ├─ localization + accessibility settings
  ├─ catalog/state services
  └─ Phaser scene host
       ├─ Ranch scene
       ├─ Dress-up preview scene
       └─ Future mini-game adapter
              └─ Result → reward validation → save

Static asset catalog + bundled media → runtime loader/cache
IndexedDB profile store              → validated game state
Parent backup file                  → export/import validator
```

## Project boundaries

- **React/Vite/TypeScript:** routes or screen state, dialogs, inventory UI, accessibility, settings, error boundaries, and parent backup flow.
- **Phaser:** 2D scenes, interaction hotspots, layered character preview, animation, and mini-game runtime.
- **Catalogs:** versioned JSON/TypeScript data for characters, assets, quests, regions, and mini-game metadata. Catalogs are authored and shipped with the game; they are never player-owned state.
- **Static assets:** optimized originals under a versioned public asset path. The browser cache serves repeat visits; game state stores only stable IDs, not image/audio bytes.

## Persistence

The product explicitly requires one-device local play, so IndexedDB is the authoritative v1 profile store. This is a deliberate local-only exception to hosted persistence: there is no identity, server profile, or cross-device claim.

```ts
type PlayerProfile = {
  schemaVersion: number;
  profileId: "local-primary";
  updatedAt: string;
  settings: { music: boolean; sfx: boolean; reducedMotion: boolean };
  unlocks: { itemIds: string[]; companionIds: string[]; regionIds: string[] };
  appearance: Record<string, Record<string, string | null>>;
  ranchLayout: { version: number; placements: RanchPlacement[] };
  questProgress: Record<string, QuestProgress>;
  miniGameRecords: Record<string, MiniGameRecord>;
};
```

- Validate data when reading, writing, importing, or migrating.
- Retain unknown fields only when safe; replace invalid item IDs with the target’s approved base look.
- Use IndexedDB transactions for changes that grant a reward and update progress together.
- Local browser data can be cleared. A parent-only export produces a versioned JSON backup; import validates schema/version before replacing the current profile and always asks for confirmation.
- `localStorage` may hold only a nonessential UI hint, never the profile source of truth.

## Data contracts

```ts
type AssetDefinition = {
  id: string; version: number; kind: "wearable" | "decor" | "scene" | "audio";
  targets?: string[]; slot?: string; layers?: AssetLayer[];
  locale: { "es-MX": { name: string; description?: string } };
  unlock: { type: "starter" | "quest" | "collection"; source?: string };
};

type MiniGameDefinition = {
  id: string; version: number; entry: "phaser" | "isolated-module";
  allowedRewards: string[]; learningIntent?: "fun" | "nature" | "math" | "literacy";
};

type MiniGameResult = { status: "complete" | "cancelled" | "failed"; rewards: string[] };
```

The host validates a mini-game’s definition and result. A mini-game cannot directly mutate the player profile or grant an item outside its approved reward list. Essma Bros will use this contract after its source is attached and audited.

## 3D boundary and future hosted features

The ranch core stays 2D. A future 3D mini-game is an isolated, lazy-loaded module with a small input/result interface; it must not change the React/Phaser ranch contracts. Parent-controlled cloud backup, if later approved, requires explicit consent design, a backend data model, and a migration from the local profile—none is included in v1.

## Quality and operational constraints

- Support current mobile and desktop browsers; show a kind unsupported-browser message rather than failing silently.
- Preload only the active scene and its immediately required assets; defer future region media.
- Respect reduced motion and audio preferences in every scene.
- No external trackers, third-party advertising SDKs, social SDKs, or payment SDKs.
