# Essma World — Agent Guide

## Mission and current slice

Build **Essma World** as a warm, original, Mexican-Spanish-first 2D web game
for one young child. The current playable core is: **world map → Rancho de
Essma → dress a friend → decorate the patio → save locally**. The player should
be able to understand the next action mostly from pictures, placement, and
short labels—not paragraphs of text.

Work on `codex/issue-1-phaser-ranch` for GitHub Issue #1 unless the user
explicitly asks to change scope or branch. Keep commits local until asked to
push or open/update a PR. Do not overwrite, reset, or discard work you did not
create.

## Read before changing a system

1. `docs/NEXT-AGENT-HANDOFF.md` — current state and the next coherent slice.
2. `docs/production/README.md` — production-document index, then the
   relevant PRD, GDD, Architecture, Asset Bible, Safety, Roadmap, and
   Test Plan.
3. `docs/reference-images/README.md` and its five images — art direction only.
4. `docs/ASSET-QA.md` and the generated pack manifests before touching art.

When product docs, a past handoff, and implementation disagree, use the latest
documented canonical decision; raise a conflict rather than silently changing
the game promise.

## Repository map

- `app/page.tsx` — React game shell, navigation, dialogs, persistence host.
- `app/world-map.tsx` — accessible illustrated map shell.
- `app/ranch-scene.tsx` — persistent Phaser 2D ranch scene and typed events.
- `app/dress-up-panel.tsx`, `app/ranch-decorator.tsx` — accessible child UI.
- `app/lib/game-catalog.ts` — versioned authored catalog; never player state.
- `app/lib/player-profile.ts` / `app/lib/profile-store.ts` — validated
  IndexedDB profile, migrations, import/export.
- `app/mini-game.ts` — framework-neutral future mini-game result boundary.
- `public/assets/**/v*/` — versioned runtime assets and thumbnails.
- `docs/reference-images/` — private inspiration, never runtime content.
- `docs/production/` — checked-in product source of truth.
- `tests/` — rendered-page, catalog/profile, and mini-game contract coverage.

## Architecture boundaries

- **React + TypeScript** owns navigation, semantic controls, dialogs, focus,
  accessibility, catalog/profile orchestration, settings, and parent-only
  flows.
- **Phaser** owns the 2D ranch canvas, visual layering, and canvas hotspots.
  Keep one ranch scene instance alive; update its state through its typed event
  boundary instead of recreating it for a selection or setting change.
- Semantic React controls must mirror important Phaser actions for keyboard,
  screen-reader, mouse, and touch use. Canvas code must not write profiles.
- **Three.js is not a ranch dependency.** If needed later, lazy-load it in an
  isolated module implementing `MiniGameModule`; give it separate assets and a
  performance budget. It receives read-only context and returns a result only.
- Only the React host validates rewards and saves the next profile atomically.
  Mini-games must never receive IndexedDB, mutable profile state, or setters.

## Product, language, and child-safety rules

- Child-facing copy is `es-MX`; use short, concrete labels and icon-led choices.
  Avoid reading-heavy instructions, jargon, dense overlays, and unexplained
  hotspots. Keep parent/developer documentation in English unless specified.
- Canonical recurring cast: Essma de María; Juancito (prairie dog); Tori
  (cacomixtle); Anita (calf); Loro Loco, Oso Taquito, and Capybara (cameos
  until a documented design promotes them). Do not change their species or
  identity without product approval.
- Preserve creative, pressure-free play: no scores, timers, streaks, failure
  punishment, loot boxes, shops, currency, or paid unlocks in the core.
- Never add ads, purchases, accounts, chat, social sharing, external links for
  children, analytics, trackers, or child personal-data collection.
- Honor music, SFX, and reduced-motion settings before scene animation or
  sound starts. Provide kind loading and unsupported-browser states.
- Keep backups in a dedicated caregiver-only flow with explanation, two-second
  hold gate, validation, replacement confirmation, Escape/focus management,
  and focus restoration.

## Catalog, profile, and persistence rules

- Catalog records are shipped, versioned authored data with stable IDs. Keep
  assets, display copy, targets, slots, anchors, compatibility, unlock rules,
  provenance, dimensions, alt text, and QA metadata in the catalog/manifest.
- Profiles persist stable IDs, settings, unlocks, timestamps, appearance, and
  ranch placements—not URLs, image bytes, catalog definitions, or arbitrary
  fields. IndexedDB is authoritative; `localStorage` may hold only nonessential
  UI hints.
- Treat profile reads, writes, imports, and migrations as untrusted input.
  Normalize known safe legacy data; reject malformed/incompatible imports
  without replacing a valid saved profile. Keep default looks compatible and
  every character dressed.
- Use existing helpers for wearable slot compatibility, decor placement,
  migrations, reward validation, and transaction boundaries. Add tests when
  altering a catalog schema, migration, or reward path.

## Asset pipeline and provenance

- Reference images establish direction only: warm Sonoran gold/terracotta/
  cactus/cobalt palette, tactile adobe/wood/textile materials, clear silhouettes,
  Essma’s dark curls and blue bow. Never copy poses, composition, UI, text,
  logos, ratings, brands, or a named studio’s style.
- Never ship, fetch, or import reference images at runtime. Production assets
  must be original and live under a versioned `public/assets/.../vN/` path with
  derived thumbnails and a manifest/provenance record.
- Each new asset needs stable ID, `es-MX` name, accessible alt text, dimensions,
  runtime/thumbnail paths, prompt/source record, and truthful QA status.
  `productApproved` remains false and `culturalReview` remains
  `"not-performed"` until those reviews actually occur.
- Verify alpha/chroma cleanup, transparent edges, dimensions, usable game-scale
  silhouette, wearable canvas/anchors/layer order, fallbacks, and mobile/desktop
  appearance. The release-candidate gate is **85/100 with no hard fail**.
  Record findings in `docs/ASSET-QA.md`; do not claim an external cultural
  review that was not performed.

## Visual and interaction quality

- Treat the reference pack as the ambition bar, not a layout to trace. Favor a
  single clear focal action, roomy touch targets (minimum 44x44px), visible selected/locked state,
  and an unobstructed ranch play area.
- Test both a narrow mobile viewport and desktop. Check that map locations,
  character scale, dress layers, patio objects, modal stacking, and bottom
  navigation make immediate sense to a five-year-old.
- Every interaction needs visible feedback and a recovery path. Keep locked
  world regions clearly unavailable and avoid buttons whose purpose is unclear.
- WebAudio and SFX must require an explicit initial user interaction (tap/click) to unlock on mobile browsers.
- Honor `prefers-reduced-motion` and sound toggles before scene animations, particle systems, or audio contexts start.

## Game development skills & subsystem guidelines

When working on specific game subsystems, consult and apply the corresponding skills in `.agents/skills/`:

- **Scene Lifecycle & Memory Cleanup**: Destroy Phaser canvas instances, WebGL shaders, textures, and unbind typed event listeners on unmount. Avoid memory leaks when switching views (`.agents/skills/optimize-threejs-games/SKILL.md`).
- **Camera & Viewport Tuning**: Frame 2D ranch scene and 3D mini-games for responsiveness, smooth panning, and unobstructed focal areas across mobile and desktop (`.agents/skills/build-game-camera-controls/SKILL.md`).
- **Audio Feedback**: Implement non-intrusive action sounds, spatial audio, sound-off controls, and mobile WebAudio unlock handlers (`.agents/skills/build-game-audio-feedback/SKILL.md`).
- **Inventory & Decorator Mechanics**: Enforce deterministic drag-and-drop placement, slot compatibility, and atomic state updates via React host (`.agents/skills/build-game-inventory/SKILL.md`).
- **VFX & Animations**: Use performant, accessible 2D/3D particle effects and telegraphs with fallback for low-power devices (`.agents/skills/create-game-vfx/SKILL.md`).
- **Game Testing & Verification**: Run headless/headful browser checks, verify zero console errors, test touch/keyboard/mouse inputs, and test profile persistence integrity (`.agents/skills/test-playable-web-games/SKILL.md`).

## Development, tests, and handoff

Use Node `>=22.13.0`. Keep the repository on a native filesystem (not a
Windows-mounted `/mnt/c/...` path).

```bash
npm ci --include=dev
npm run dev
npm run build
npm test
npm run lint
```

- Run at least the targeted test(s) while iterating; run build, test, and lint
  before handoff for code, asset-path, dependency, or configuration changes.
- Also run relevant image alpha/dimension and audio metadata checks when media
  changes. Manually exercise mouse, touch, and keyboard workflows, including a
  refresh/persistence check and sound-off/reduced-motion behavior.
- Use `rg` for searching. Prefer `apply_patch` for focused edits. Do not add
  dependencies, run destructive Git commands, or change build tooling without
  explicit need and verification.
- Make focused commits with imperative messages. Inspect `git diff --check`,
  `git status`, and the staged diff before committing. Do not commit generated
  caches, local environment files, reference media used only for inspiration,
  or unrelated edits.

## Definition of done

Before declaring a slice complete, confirm it is in scope, Spanish-first,
child-safe, accessible, locally persistent when applicable, visually coherent,
and works with mouse/touch/keyboard at mobile and desktop sizes. Update the
relevant production document, asset manifest/QA record, tests, and this guide
when a durable decision or workflow changed. Report exactly what was verified,
what is pending, and do not represent unperformed review as complete.

