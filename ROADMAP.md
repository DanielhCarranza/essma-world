# Essma World — Delivery Roadmap

This is the practical continuation plan for the committed playable core
(`0551cb6`). It is deliberately ordered by player value and dependency, not by
the size of a feature. There are no dates: establish a reliable child-playtest
cadence and art throughput before estimating them.

## Product north star

Essma World should feel like a safe, warm little place a five-year-old can
return to without being taught how to use it: choose the bright open Rancho on
the map, make a friend look lovely, arrange a small patio, and discover one
gentle new thing. It is Mexican-Spanish-first, one-player, local-only, and
free of ads, purchases, accounts, chat, analytics, scores, streaks, and
failure pressure.

The release bar is **not** “there are many screens.” It is that a young child
can understand the next action from the picture and short label, see a joyful
result quickly, and safely come back to the same ranch later.

## What is already done — do not rebuild it

The following is implemented on the current branch. Audit and improve it; do
not replace it with parallel systems.

- **World entry:** original responsive landscape/portrait map; Rancho is open
  and Desierto, Pueblo, Bosque, Oasis, and Valle de flores are intentionally
  locked future destinations.
- **Ranch hub:** one client-side Phaser ranch scene with mouse/touch hotspots,
  keyboard-accessible React equivalents, original background, and three
  teaser cameos (Loro Loco, Oso Taquito, Capybara).
- **Creative loop:** four dressable friends (Essma, Juancito, Tori, Anita),
  default looks, 65 catalogued wearable layers (5+ per slot across Essma,
  Juancito, Tori, and Anita), 10 snap-safe patio decorations,
  placement/removal/undo/reset, and shared React/Phaser appearance resolution.
- **Garden activity (P1):** “Cuida el jardín” two-minute visual discovery
  loop with host-validated cosmetic rewards (gardener hat + sunflower pot).
- **Data foundation:** catalog v2; validated local IndexedDB player profile
  schema v4; migrations; versioned asset paths and pack manifests; guarded
  adult export/import with confirmation.
- **Preferences:** persisted music, SFX, and reduced-motion settings; original
  ranch loop, ambience, confirm, and cancel audio.
- **Safety and architecture:** no Three.js in the ranch; a framework-neutral
  future mini-game result contract; local-only player state; no child-facing
  outbound links or commercial/social systems.
- **Baseline checks:** native catalog/profile and mini-game-contract tests,
  rendered-page checks, TypeScript, lint, production build, image alpha and
  dimension checks, and audio metadata checks have been run for the core.

Current non-negotiable documents are [AGENTS.md](AGENTS.md),
[NEXT-AGENT-HANDOFF.md](docs/NEXT-AGENT-HANDOFF.md), and the production
package in `outputs/essma-world-production-docs/`. The supplied reference
images are direction only and must never become runtime art.

## Release sequencing

| Priority | Goal | Why it comes now |
| --- | --- | --- |
| **P0** | Make the current creative core genuinely release-ready and test it with children. | A richer game on an unvalidated, visually inconsistent foundation is expensive rework. |
| **P1** | Add one no-reading-required, two-minute ranch activity and its honest reward loop. | It gives the player a reason to return without opening the map or adding a large world. |
| **P2** | Make the ranch a cozier, more expressive place with a small story/collection slice. | Build depth from the proven activity and asset pipeline. |
| **P3** | Open regions and add isolated mini-games, including any Three.js experiment. | These require content, performance, and safety budgets that the core does not yet need. |

## P0 — Before merge/release

P0 is a release gate, not a scope-expansion milestone. Every item below must
be complete or explicitly deferred behind a non-player-facing feature flag.

### P0.1 Child-first flow and visual clarity

**Work**

- Run moderated, caregiver-consented sessions with 3–5 children in the target
  age range. Record only anonymous observations; do not collect names,
  recordings, accounts, or analytics.
- Test the first ten minutes: find Rancho, choose a friend, change clothing,
  return, decorate, undo an accidental placement, and reopen the game.
- Simplify any label that children cannot act on. The map must communicate
  “Rancho is where I can play” without needing the locked-place labels. Keep
  icon + very short Spanish label together for every primary action.
- Revisit desktop and portrait mobile hierarchy: characters remain large and
  tappable, the decoration tray never hides an essential control, and notices
  never cover the only available choice.
- Make completion moments more visual than verbal: a small happy reaction,
  clear selected state, and brief “Listo/Qué bonito” confirmation. Respect
  reduced motion from the first render.

**Acceptance criteria**

- At least 4 of 5 observed children independently reach Rancho, dress one
  friend, return to the ranch, and place one decoration; any critical
  navigation confusion is fixed and retested.
- The primary task is discoverable on a 390 × 844 viewport and a desktop
  viewport without horizontal page scrolling, clipped controls, or a text-only
  instruction.
- Every actionable visual hotspot has a semantic button alternative, an
  accessible name, visible focus, Enter/Space activation, and Escape/back
  behavior where appropriate.

**Asset/content needs**

- Optional only: a tiny set of universal action/feedback icons. Do not add
  generated copy inside images.

### P0.2 Finish the release-quality art pass

**Work**

- Replace or correct Essma’s neutral base before release. Its current visual
  QA score is **82/100**, below the 85/100 gate. Preserve her approved identity
  direction: young child, light complexion, dark curls, blue bow; do not copy
  a supplied reference pose or artwork.
- Re-check all v1/v2 layer anchors against the final Essma base and every
  companion at both dress-up and ranch scale. Correct clipping, unexpected
  straps, hidden footwear, collision with faces, and poor transparent edges.
- Verify the generated asset archives/manifests contain every source and
  runtime/thumbnail derivative. Keep unused but potentially useful generations
  in a clearly labelled, non-runtime source/archive location with provenance;
  never silently overwrite an approved runtime asset.
- Perform product review for every release asset. The current catalog correctly
  says `productApproved: false` and `culturalReview: "not-performed"`; do not
  change either status without real review evidence.
- Obtain a qualified local/cultural review for culture-specific names, wildlife
  behavior, food, textiles, places, celebrations, and future story material.
  The review may recommend changes; it must not be represented as completed
  before it is actually performed.

**Acceptance criteria**

- Each shippable asset has stable ID, version, exact source/provenance,
  es-MX name/alt text, dimensions, runtime and thumbnail paths, and recorded
  QA result.
- Essma base and every launch art group score at least 85/100 with no hard
  failure: no copied pose/art, named-studio imitation, text, logo, rating,
  third-party mark, broken alpha, or misaligned wearable.
- QA is performed separately on desktop and mobile composite screenshots; the
  final reviewer signs the product decision in `docs/ASSET-QA.md`.

### P0.3 Save, accessibility, audio, and graceful failure

**Work**

- Manually exercise fresh profile, normal refresh, old-schema migration,
  IndexedDB-unavailable mode, malformed backup, valid backup replacement, and
  interrupted/failed write messages.
- Audit focus restoration for map settings, ranch dialogs, adult hold gate,
  import confirmation, decorator tray, and dress-up exit. Confirm there is no
  keyboard trap.
- Test sound-off before entering Rancho, music/SFX toggles during playback,
  autoplay denial, and reduced-motion before Phaser begins its pulse/tween.
- Test the Phaser load-error state in a deliberately blocked/canvas-limited
  browser and ensure React dress-up remains useful. Add a short supported
  browser note only if a real incompatibility is observed.

**Acceptance criteria**

- A refresh restores each friend’s look, patio layout, and all three settings.
- Import rejects malformed/incompatible data without replacing the valid
  current profile and shows a caregiver-readable explanation.
- The complete creative loop is possible with mouse, touch, and keyboard, with
  audio off and with reduced motion enabled.
- No essential interaction depends on sound, color, hovering, drag precision,
  multi-touch, or reading a paragraph.

### P0.4 Engineering, performance, privacy, and deployment

**Work**

- Add CI that runs reproducible install, build, lint, tests, catalog/asset
  validation, and a dependency/license/security audit on pull requests.
- Add browser-level smoke coverage for map → ranch → dress → decorate →
  refresh persistence, plus adult gate/import cancellation. Static rendered
  HTML checks are useful but do not replace interaction coverage.
- Profile production bundles and initial load on representative low-end mobile
  hardware/network. Preload only active-scene assets; lazy-load Phaser and
  defer locked-region media. Set and record an initial JS/image/audio budget.
- Confirm deployment configuration, cache headers, a production preview URL,
  error reporting policy with no child identifiers, and a rollback procedure.
- Inspect the final network and bundle for third-party SDKs, external images,
  analytics, ad/payment/social/chat code, location/camera/microphone prompts,
  and reference-image usage.

**Acceptance criteria**

- A clean `npm ci --include=dev && npm run build && npm test && npm run lint`
  passes in CI and on the release candidate commit.
- Automated browser smoke tests run against the production build, not only a
  development server.
- The team has documented baseline load/bundle measurements and an explicit
  regression budget; a blocked Phaser load produces a kind fallback rather
  than a blank area.
- Deployment is reachable over HTTPS with no child-data collection path and a
  tested rollback owner/process.

## P1 — Garden activity (implemented)

P1.1 “Cuida el jardín” is implemented on the current branch with the existing
`MiniGameModule`/`MiniGameResult` contract, host-validated rewards, and
collection persistence. The **next playable slice** is **Animal Care** under
**P2 — Cozy Ranch Expansion** (see below).

This section documents the completed P1 scope for reference.

### P1.1 “Cuida el jardín” or equivalent visual discovery activity

Choose one activity through a small concept review before implementation. A
recommended slice is a two-minute garden-care loop: match a visible watering
can/seed/flower picture to one friendly garden spot, celebrate growth, and
return a cosmetic reward. It must never depict neglected animals or punish a
child for leaving.

**Dependencies**

- Final P0 interaction findings and release-quality Essma assets.
- A written learning intent of `fun` or `nature`, playtime target, state
  diagram, reward list, copy list, and cultural/source review notes.
- The existing `MiniGameModule`/`MiniGameResult` contract, extended only where
  necessary; the React host must apply a validated result atomically.

**Implementation**

- Build a lazy activity module (Phaser is preferred for 2D; React is fine for
  a UI-led interaction). It receives only the immutable context and has no
  IndexedDB/profile write access.
- Register a unique mini-game definition and an allowlist of new catalog IDs.
  Implement host wiring, cancellation, load/runtime failure state, and one
  visible “you found it” collection moment.
- Add a small progress/replay affordance with no timer, score, daily limit,
  currency, randomized reward, or paid shortcut.

**Asset needs**

- One short activity backdrop, 3–5 large interaction objects, 2–3 simple
  feedback states, a reward card, and 2–4 reward assets.
- Original confirm/cancel/delight audio plus a text equivalent for all
  meaningful sound.

**Acceptance criteria**

- A pre-reading child can start, understand, complete, cancel, and replay the
  activity using pictures and 1–3 word labels.
- Completion grants only allowlisted catalog IDs through one validated,
  atomic host update; duplicate, invalid, cancelled, and failed results cannot
  corrupt or partially change the profile.
- The new reward is visible in the collection, usable in dress-up/decorating,
  and persists through refresh and validated backup/import.

### P1.2 Release the collection as a child-facing reward surface

**Work**

- Turn the existing collection dialog into a picture-first shelf: owned item
  thumbnail, character/set grouping, plain status, and a direct “usar” action.
- Keep all starter content available. Locked future items must say/show what
  gentle activity opens them; never hide items behind a probability mechanic.
- Add a parent-accessible, non-child-facing credits/provenance surface when
  collaborators or licenses need acknowledgement.

**Acceptance criteria**

- A child can find a newly earned item and equip/place it without an adult.
- Lock state is understandable without color or a long reading task; there is
  no shop, currency, scarcity timer, streak, or purchase surface.

## P2 — Cozy ranch expansion (next slice: Animal Care)

P2 adds depth around the proven garden activity. The highest-priority next
slice is a gentle **Animal Care** interaction (~2 minutes, no failure, no
timer): feed, water, or brush a ranch friend and earn a cosmetic reward through
the same validated mini-game host. Ship each row below as a small playable
slice with its own asset pack and playtest, not as a long backlog sprint.

| Slice | Dependencies | Definition of done |
| --- | --- | --- |
| **Ranch activity variety** | P1 reward host and content template | Add brush/feed/water or discovery variants with no neglect/failure state; each has visual instructions, cancel/replay, and a tested reward policy. |
| **Short story quest** | P1 activity, copy review, story-card format | One 5–8 minute map/ranch story with 2–3 choices, clear return path, no combat or pressure, and a cosmetic/story-clue reward. |
| **Ranch expression** | Approved character poses and motion budget | Add only useful idles, happy reactions, and pose variants; every animation has reduced-motion/static behavior. |
| **Decoration sets** | Zone/layout migration plan, final decor QA | Add themed original ranch, garden, and home sets with shadows/placement previews; keep snap zones and undo/reset. |
| **Photo memory mode** | Parent safety decision, no sharing design | Local-only snapshot/framing view with no automatic gallery upload, social share, camera permission, or child-facing external link. |
| **Content tooling** | Catalog validators and asset documentation | A repeatable authored manifest/check script for assets, strings, QA, unlock source, and credits so content does not become hard-coded scene logic. |

### P2 acceptance gate

- A child has at least two gentle things to do at the ranch and can choose
  between them without reading a menu paragraph.
- Every quest/activity is optional, replayable, and pressure-free; rewards are
  transparent, deterministic, catalogued, and safe to import/export.
- New cultural content has a factual source and completed documented review.
- Combined ranch assets stay within the agreed mobile load and memory budget.

## P3 — World expansion and future isolated modules

### P3.1 Open one second map region

Open **one** of the five locked nodes only after P1/P2 validates return play.
Select it based on a reviewed story purpose rather than the easiest art.

**Suggested production order**

1. Define the reason to visit, visual landmarks, activity, return route, and
   asset budget for one region.
2. Commission/review one focused scene pack (landscape, interactive objects,
   2–4 region props/rewards, ambience, navigation states).
3. Add travel/loading transition, local save/migration, accessible controls,
   and the same safe mini-game/reward boundary.
4. Playtest the map: players know which node is open, can return home, and do
   not confuse a future lock with a broken button.

**Acceptance criteria**

- The region has a distinct, complete play reason and a ranch return path.
- Locked regions remain content promises, not fake interactions; each displays
  a concise non-frustrating “pronto” state.
- Region media is deferred until selected and does not slow the ranch baseline.

### P3.2 Three.js and Essma Bros: isolated only

Do not install Three.js or place a renderer in the ranch bundle to “prepare.”
The seam already exists in `app/mini-game.ts`; preserve it.

**Entry requirements**

- A real mini-game design brief, success criteria, source/rights review (for
  Essma Bros or supplied prototype code), threat/privacy review, and a device
  performance budget.
- Dynamic import behind a feature flag; explicit load/unsupported/cancel/error
  states; no direct mutation of IndexedDB or React player state.
- Independent package and asset budget, GPU/memory test matrix, and automated
  contract tests for every possible returned result.

**Acceptance criteria**

- A 3D/module failure cannot break map, ranch, saved appearance, or layout.
- Only the validated host can grant allowlisted rewards atomically.
- The 2D game does not download the 3D module until the child intentionally
  enters it, and baseline 2D performance is unchanged.

### P3.3 Later product decisions — require a new approval

Cloud backup, accounts, notifications, seasonal calendars, real-money shops,
social sharing, analytics, or multiplayer are **not roadmap defaults**. Each
would need a separate product, legal/privacy, child-safety, consent, data
retention, security, and accessibility decision. Do not let a technical
convenience turn any of them on implicitly.

## Cross-cutting definition of done for every future slice

Before a slice is marked complete:

1. **Brief:** write its child goal, no-pressure interaction, es-MX copy,
   accessibility behavior, reward policy, and out-of-scope list.
2. **Assets:** create original art/audio using the asset pipeline, preserve
   source/provenance, derive runtime/thumbnail files, and pass the 85/100 QA
   gate with no hard failure.
3. **Culture and safety:** document sources/reviewer status honestly; verify no
   stereotypes, sacred/ceremonial content used as a costume/collectible,
   personal-data capture, external child links, ads, purchases, or social
   features.
4. **Engineering:** add catalog entries and migrations before scene/UI code;
   update only through validated profile services; keep modules lazy and
   preserve the React/Phaser boundary.
5. **Tests:** add unit tests for validation/migration/rewards, browser
   interaction coverage for the happy path and failure path, visual mobile +
   desktop QA, keyboard/touch/mouse checks, audio-off/reduced-motion checks,
   and clean build/lint/test/asset validation.
6. **Playtest:** observe the intended age group with caregiver consent, fix
   critical confusion, and record anonymous findings and final product
   decision in the relevant docs.

## First ticket set for the next agent

Work in this order; finish P0 gates before expanding P2 scope.

1. Run the full P0 regression matrix on the exact release-candidate commit and
   create CI/browser smoke coverage for gaps found.
2. Perform the Essma-base/layer visual pass on all 65 wearables; archive every
   generated source, revise manifests/catalog QA, and obtain final product
   approval.
3. Conduct the small supervised usability study; ship only the child-facing
   clarity fixes it identifies, then rerun P0 checks.
4. Make a one-page Animal Care activity brief, reward allowlist, and asset
   brief; have cultural/content review before art generation.
5. Implement Animal Care end-to-end through the existing mini-game contract and
   host validation, then playtest it before adding a second ranch task or
   opening a region.

## References

- [Product requirements](outputs/essma-world-production-docs/PRD.md)
- [Game design](outputs/essma-world-production-docs/GDD.md)
- [Architecture](outputs/essma-world-production-docs/ARCHITECTURE.md)
- [Asset Bible](outputs/essma-world-production-docs/ASSET-BIBLE.md)
- [Test plan](outputs/essma-world-production-docs/TEST-PLAN.md)
- [Content and safety](outputs/essma-world-production-docs/CONTENT-AND-SAFETY.md)
- [Current asset QA status](docs/ASSET-QA.md)
