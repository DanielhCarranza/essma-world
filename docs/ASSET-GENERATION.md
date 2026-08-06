# Asset Generation Playbook

This is the repeatable production process for every new Essma World visual asset. It is model-agnostic: use GPT Image, Gemini / Nano Banana, Grok Imagine, or another generator that can produce the required source image. A generated image is not production-ready until it passes the processing, catalog, and in-game checks below.

Read this together with [the Asset Bible](production/ASSET-BIBLE.md), [asset QA](ASSET-QA.md), and the [reference-image policy](reference-images/README.md).

## Non-negotiables

- Make original art. The five supplied reference images are private, high-level direction only. Never ship, runtime-load, trace, copy a pose/composition/UI screen from, or use them as image-to-image source for production art.
- Never request or ship third-party characters, brands, logos, ratings, watermarks, generated lettering, or imitation of a named studio or artist.
- Sonoran direction is not an external cultural review. Set culturalReview to not-performed until a real qualified reviewer has completed one. Set productApproved to false until the product owner has reviewed the asset in the game.
- Keep masters and raw generations outside public/. Public assets are versioned, optimized, runtime-safe derivatives only.
- A filename is not an asset record. Every shippable asset needs a stable catalog ID, dimensions, Spanish alt text, provenance, QA record, and visible in-game test.

## Art direction and consistency lock

Essma World is an original, child-friendly 2D storybook world: golden Sonoran afternoon; sand, terracotta, marigold, cactus green, cobalt, and desert-pink palette; tactile adobe, wood, woven textile, paper, ceramic, and leather-like materials. Forms are rounded, expressive, cozy, and readable at small sizes, never photorealistic.

Character identity is a hard constraint:

| Character | Keep consistent | Slots |
| --- | --- | --- |
| Essma | young child, light complexion, dark curly hair, blue bow, warm expression | hair, outfit, shoes, accessory |
| Juancito | recognizable prairie-dog silhouette | body, neck, head |
| Tori | recognizable cacomixtle/ringtail silhouette and ringed tail | body, neck, head |
| Anita | young calf silhouette and gentle proportions | body, neck, head |

For one pack, freeze a compact style lock: palette swatches, line/paint treatment, camera/view, light direction, target base, canvas size, and a small approved contact sheet. Use it in every prompt. A production base may be supplied privately as a scale/alignment guide when the model supports it; it must not be used to clone external artwork. Do not silently vary all of these constraints between models or batches.

## Paths, versions, and dimensions

Use a new version directory for a replacement or new pack:

    public/assets/characters/vN/<character>-base.png
    public/assets/wearables/vN/<target>.<slug>.png
    public/assets/wearables/vN/thumbnails/<target>.<slug>.png
    public/assets/decor/vN/<slug>.png
    public/assets/decor/vN/thumbnails/<slug>.png
    public/assets/cameos/vN/<slug>.png
    public/assets/world/vN/<scene>-landscape-vN.png
    public/assets/world/vN/<scene>-portrait-vN.png

- Use lowercase ASCII slugs with hyphens. Do not overwrite an accepted asset in place.
- Runtime assets are transparent PNGs except full backgrounds/maps.
- Wearables are 1254 x 1254px transparent layers. Decor is 768 x 768px transparent layers. Thumbnails are 256 x 256px.
- The current map pack has separate 1672 x 941px landscape and 941 x 1672px portrait art. Do not use a blind crop as the mobile map.
- Register exact paths, width, height, Spanish alt text, provenance, and QA in app/lib/game-catalog.ts. Player profiles save IDs only.

## Brief before generating

Create one written spec before sending a prompt:

| Field | Example |
| --- | --- |
| Stable ID | wearable.essma.sombrero-viajero |
| Version / owner | v3 / art-pack-spring-2026 |
| Kind | wearable, decor, base, cameo, or world backdrop |
| Target / slot | essma / hair |
| Play use | visible at ranch and dress-up scale; brim must not cover eyes |
| Render contract | native transparent or chroma source; 1254px final canvas |
| Layer contract | z-index, anchor, approved placement box |
| Accessibility | Spanish name, concise description, meaningful alt |
| Source notes | model/version, final prompt, inputs, terms/license review |
| QA | draft; no pre-marked product or cultural approval |

For layers, consult the target anchors and WearableDefinition in app/lib/game-catalog.ts. The final overlay on the real base is the source of truth, not a generator saying that an asset is centered.

## Structured prompt template

    Project: Essma World, original child-safe Spanish-first 2D game.
    Use case: [dress-up layer | ranch decoration | character base | cameo | map].
    Style lock: original hand-painted children's-storybook cutout art; warm
    Sonoran golden afternoon; tactile adobe, wood, woven textile, paper and
    ceramic; rounded readable silhouette; [front-facing / three-quarter] view;
    [light direction]. Match supplied production layout guidance only for
    scale/alignment, never an external copyrighted work.
    Subject: [one specific subject and material/color details].
    Composition: [isolated object / full scene], [camera], [safe margins],
    [empty space required for overlays].
    Output: [transparent if genuinely supported; otherwise flat chroma key
    such as #00ff00], no cast shadow unless requested.
    Quality: clean opaque forms, crisp but softly antialiased edges, clear at
    mobile size, no tiny decorative noise.
    Must not include: people/faces except the requested original character;
    text, letters, numbers, signs, logos, ratings, watermark, UI, brand marks,
    third-party characters, copied pose/composition, named-studio or artist
    imitation, photorealism, scary imagery, or border/frame.

Save the exact final prompt and model/version in the pack manifest. If a model cannot make valid transparency, use the chroma route rather than guessing at runtime.

## Prompt examples

### Character base

    Project: Essma World. Use case: playable character base, no clothing layer.
    Create an entirely original front-facing full-body 2D storybook cutout of
    Essma, a cheerful young child with light complexion, dark curly hair and a
    small cobalt-blue bow. Neutral relaxed standing pose, hands clear of the
    torso, gentle smile, simple cream base outfit so future layers remain
    readable. Warm Sonoran storybook materials and soft golden light; rounded,
    clean silhouette. Isolated on flat #00ff00 chroma background, no ground
    shadow, generous edge margin. No text, logos, other characters, watermark,
    copied pose, branded styling, named-studio imitation, or UI.

### Wearable layer

    Project: Essma World. Use case: isolated Essma outfit-slot layer. Create an
    original child-sized cream embroidered tunic with a cobalt-blue skirt and a
    few simple desert-flower stitches. Front-facing, empty garment only: no
    body, head, hands, feet, jewelry, mannequin, hanger, or long loose straps.
    Strong readable silhouette, woven-fabric texture, opening and hem suitable
    for a 1254px layer canvas. Isolated on flat #00ff00 chroma background, no
    shadow, text, logo, watermark, brand, copied design, or named-studio
    imitation.

### Ranch decor

    Project: Essma World. Use case: single placeable patio decoration. Create
    an original low rustic mesquite bench with a small woven seat cushion,
    friendly rounded proportions, three-quarter view facing slightly right.
    It must feel at home in a warm Sonoran adobe ranch patio but be isolated as
    one object with a simple grounded silhouette. Terracotta, sun-warmed wood,
    and a small cobalt textile accent. Flat #00ff00 chroma background; no
    character, animal, lettering, logo, watermark, UI, scene backdrop, copied
    composition, or named-studio imitation.

### World-map backdrop

    Project: Essma World. Use case: original landscape 16:9 web-game map
    backdrop. Paint a wide aerial three-quarter children's-storybook landscape
    at golden Sonoran afternoon. Place a ranch home with adobe house, small
    barn, corral and mesquite trees as the prominent center destination.
    Arrange five separated future landmark areas around it: cactus mesas, a
    small adobe pueblo, a mesquite grove, a blue oasis, and a wildflower
    valley. Connect them with a gently winding dusty trail. Leave uncluttered
    ground near every landmark for HTML hotspot overlays and keep landmarks
    inside 6% crop-safe margins. Background art only: no labels, signs, text,
    icons, UI, compass, characters, animals, logos, watermark, copied map
    layout, or named-studio imitation.

Make a separate portrait 9:16 prompt and artwork; keep the ranch central and leave a quiet top strip for the header.

### Cameo portrait

    Project: Essma World. Use case: non-interactive ranch cameo portrait.
    Create one original cheerful red-and-gold parrot called Loro Loco,
    chest-up, front-three-quarter view, expressive but calm. Warm storybook
    paint texture, clear feather groups, friendly big silhouette, transparent
    or flat #00ff00 chroma background. Portrait only: no words, speech bubble,
    sign, logo, watermark, UI, external character likeness, copied pose, or
    named-studio imitation.

## Source generation modes

### Native transparent output

Use this only after checking its actual alpha channel. Inspect on light and dark backgrounds: tools can leave a white matte, translucent holes, or a cropped edge while claiming transparency.

### Chroma-key source

Ask for one flat saturated key color (the v2 packs used solid green) with no similar color inside the subject. Keep the subject away from edges and avoid gradients, floors, and contact shadows. Remove the key locally, preserve soft antialiasing, despill the edge, and inspect at 100%. A checkerboard screenshot is not proof of valid alpha.

## Processing pipeline

The current v2 wearables and v1 decor followed this sequence:

1. Generate several isolated source candidates from the written brief.
2. Reject candidates with text, people, external IP, dirty/opaque background, weak silhouette, wrong perspective, or inconsistent child-safe direction.
3. Remove chroma (or validate native alpha) locally. Record the tool and settings. The prior pack used a local helper with border-key selection, soft matte, and despill.
4. Crop the non-transparent bounding box, resize without distortion, and composite it into the canonical transparent runtime canvas.
5. For wearables, use the included helper rather than hand-editing every final canvas:

       python3 scripts/reposition-wearable.py INPUT.png OUTPUT.png \
         --center-x 627 --top 10 --max-width 410 --max-height 195 --canvas 1254

   The placement values are authored per item after overlaying it on the target base. The script preserves alpha, crops the opaque box, scales proportionally, and composites it into the shared canvas. It does not decide whether the art is correct.
6. For decor, composite the cleaned prop into a 768px canvas with a sensible ground baseline. The ranch placement-zone anchor, not its raw crop, decides scene location.
7. Make the 256px thumbnail from the final runtime PNG, not raw generated art.
8. Check PNG dimensions, alpha, edges, and paths; add manifest and catalog data; then integrate.

Do not overwrite raw sources during processing. Keep them in an access-controlled source location with seed/request ID when available. Public runtime files are approved derivatives only.

## Metadata and catalog registration

Each pack needs a JSON manifest beside its runtime files. Current examples:

- public/assets/wearables/v2/wearables-v2.metadata.json
- public/assets/decor/v1/decor-v1.metadata.json
- public/assets/world/v2/sonora-world-map-v2.metadata.json

Record at least: pack ID/version; asset IDs/files; generator and model version; generation date; exact final prompt or prompt reference; reference-use policy; private input references (if any); processing steps; runtime and thumbnail dimensions; owner; license/terms check; and QA result. A per-item short spec is okay only when it clearly points to the locked common prompt.

Then update CatalogAsset in app/lib/game-catalog.ts with runtime path, thumbnail path, dimensions, Spanish alt text, provenance, and QA. Do not change an existing stable ID to mean a different visual; create a versioned replacement and migrate deliberately.

Truthful defaults until real review:

    qa: {
      status: "planned",
      score: null,
      accessibilityReviewed: false,
      productApproved: false,
      culturalReview: "not-performed",
    }

A current catalog status of approved only means the internal release-candidate visual/technical gate passed. It does not mean final product approval or cultural review.

## 85/100 visual QA gate

Score each final asset at 100% and in the actual app. A release candidate needs 85 or more, all hard-fail checks clear, and a record in docs/ASSET-QA.md or its pack manifest.

| Criterion | Points | Check |
| --- | ---: | --- |
| Character/style consistency | 20 | identity lock, palette, materials, light, child-safe tone |
| Silhouette/mobile readability | 15 | recognizable in thumbnail and ranch |
| Layer/scene alignment | 20 | slot, scale, z-order, anchors; no accidental eye/face obstruction |
| Technical finish | 15 | valid alpha, no halos, right canvas/dimensions, no accidental crop |
| Composition/usefulness | 10 | hotspot space, decor ground line, usable hierarchy |
| Accessibility/support | 10 | useful alt, contrast when relevant, not color-only |
| Originality/provenance | 10 | source record and no prohibited/copying signals |

Hard-fail and regenerate/rework for generated text, watermark/logo/brand, third-party or copied character/pose/layout, named-studio imitation, unsafe/scary content, unclean alpha, malformed dimensions, incompatible slot/perspective, or a reference image in public/runtime paths.

## Batch strategy for the remaining backlog

1. Work by playable slice, not an abstract total count: build each activity's characters, feedback, props, and state before starting another region.
2. Start every family with a 3–5 item calibration batch. Select a winner, update prompt/placement numbers, then generate the remainder.
3. Batch one family at a time: Essma outfits, animal neckwear, garden decor, and so on. This exposes drift.
4. Maintain a private contact sheet with source filename, final filename, prompt version, model, QA score, and decision. Retain rejected outputs privately for audit/learning.
5. When switching models, first run the same calibration brief. Compare at game scale against approved assets and revise palette, camera, edge treatment, and texture constraints before accepting any batch.
6. Reserve an integration pass for selected thumbnails, missing-file fallback, dark/light background edge tests, mobile crop, reduced-motion, and focus/pressed UI states.

## In-game acceptance checklist

- [ ] npm run build, npm test, and npm run lint pass.
- [ ] Every catalog path loads; a missing wearable still falls back to the base.
- [ ] Dress-up preview and Phaser ranch show the same resolved appearance.
- [ ] Each wearable works only for the compatible target/slot and correct z-order.
- [ ] At desktop and mobile sizes, layers do not accidentally block Essma's eyes, hands, or controls; decor stays in its intended zone.
- [ ] Thumbnails match runtime art and are clear at 256px.
- [ ] Scene art has enough UI/hotspot space; map labels remain DOM, never baked into bitmaps.
- [ ] Alpha has been inspected on light, dark, and ranch-background colors.
- [ ] Mouse, touch, and keyboard work without relying on art alone; Spanish labels and alt text exist.
- [ ] Metadata, QA score, product approval, and cultural-review values are accurate.

## Current-pack record

On 2026-08-04, OpenAI built-in image generation produced the original v2 wearable pack, v1 patio-decor pack, and v2 landscape/portrait map pair. Repository references supplied only broad direction and character identity; no reference image ships or runs in the game. Wearables and decor used a solid chroma source, local alpha cleanup, inspection, canonical-canvas placement, and derived thumbnails. Wearables were placed with scripts/reposition-wearable.py on 1254px layers; decor uses 768px transparent runtime canvases; maps were authored separately for landscape and portrait. Complete current prompts/provenance are in the manifests above, and QA scores/pending approval are recorded in docs/ASSET-QA.md.

This workflow can be repeated with any suitable generator, but every output is a new candidate until source/terms, metadata, alpha, alignment, QA score, and in-game behavior are reviewed.
