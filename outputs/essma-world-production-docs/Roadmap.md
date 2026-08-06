# Essma World Roadmap

The roadmap prioritizes a delightful, safe first play session over broad but shallow content. Dates are intentionally omitted until the team establishes capacity, art throughput, and playtest cadence.

## 0. Pre-production ✅ COMPLETE

**Deliverables:** canonical cast sheet; approved visual system; content/safety review process; catalog IDs and layering rules; clickable screen flow; technical spike plan; first asset briefs.

---

## 1. Playable Core ✅ SUBSTANTIALLY COMPLETE

**What was built (as of 2026-08-05):**
- ✅ World map (es-MX, illustrated, locked future regions)
- ✅ Rancho de Essma Phaser scene with hotspots, characters, cameos
- ✅ 65 wearable items across 4 characters (Essma, Juancito, Tori, Anita) — 5+ per slot per character
- ✅ Dress-up panel: 100vh layout, centered character preview, friend picker in header, category tabs, scrollable closet
- ✅ Item equip/unequip toggle (re-tap to unselect) with "🚫 Quitar" button
- ✅ Canonical zIndex layering (shoes:25, outfit/body:30, neck/accessory:35, head/hair:40) enforced for all 65 items across all 4 characters
- ✅ White sleeve overlay (ESSMA_HANDS_OVERLAY) removed — clean dress rendering on Essma
- ✅ Patio decorator with drag+drop placement, undo, reset
- ✅ Garden mini-game with reward contract
- ✅ IndexedDB save, caregiver export/import with 2-second hold gate
- ✅ Settings (music, SFX, reduced motion)
- ✅ Touch, mouse, keyboard support

**Remaining Phase 1 gaps (priority order):**
- ⬜ Visual QA: verify all 65 wearables fit at game scale on all characters in browser (alpha edges, anchors, transparent PNGs)
- ⬜ Asset provenance: complete product review pass for all v2 wearables (currently `productApproved: false`)
- ⬜ Cultural review: native speaker pass for `es-MX` item names and descriptions
- ⬜ Mobile responsiveness: test dress-up and ranch action bar on 390×844 portrait / 844×390 landscape
- ⬜ First-play guide: icon-led, no reading required for a 5-year-old

---

## 2. Cozy Ranch Expansion 🟡 NEXT UP

### 2a. Animal Care Activity (highest priority)
- 2-minute gentle care interaction: feed Juancito seeds, water Anita's flowers, brush Tori's tail
- No failure state, no countdown, no streak — just a warm "¡Gracias!" moment
- Returns a cosmetic reward through the mini-game result contract
- Reward shown in a "¡Nuevo adorno!" collection moment
- React host validates; Phaser scene shows visual response (sparkle / nuzzle animation)

### 2b. Collection Feedback Screen
- "Mochila" panel showing all earned items with thumbnails
- Keyboard navigable, labeled, no punishing lock icons
- Caregiver-readable progress without confusing the child

### 2c. Photo Mode
- Camera icon → download current ranch view as PNG
- Local only — no upload, no external sharing
- Works on desktop (canvas `toDataURL`) and mobile (Web Share API fallback)

### 2d. Expanded Decorations (10 → 20 items)
- 10 additional patio items: planters, garden beds, fences, lights, benches, water features
- Original transparent PNGs at 1254×1254 with 256×256 thumbnails
- Registered in versioned catalog with provenance/QA records

### 2e. Ranch Scene Polish
- Ambient character idle animations (Phaser tweens — no Three.js)
- Day/sunset lighting toggle (warm filter)
- Seasonal decoration overlays (flowers, paper lanterns)

**Exit gate:** a child completes care, receives a reward, sees it in collection, retains on refresh. No timer, no failure, no paid shortcut.

---

## 3. World Expansion 🔒 FUTURE

**Goal:** unlock one locked region (Desierto first). Short story (3–5 scenes), 5 new wearables, 5 new decor items native to that region.

**Regions planned (in order):**
1. **Desierto** — cactus forest, Juancito discovers a coyote cameo
2. **Pueblo** — mercado, textiles, festival decoration
3. **Oasis** — water play, Tori finds desert flowers
4. **Bosque** — pine trees, Anita calf adventure
5. **Valle de Flores** — marigold fields, Día de Muertos imagery

**Exit gate:** each region has a distinct play reason, asset pack, clear navigation, and return path.

---

## 4. Audio & Accessibility Polish 🔒 FUTURE

- Replace placeholder audio with original composed music
- Character SFX for equip/unequip, decor placement, care interactions
- WebAudio spatial positioning for ranch ambience
- Full ARIA landmark audit and screen reader walkthrough
- Keyboard navigation through Phaser canvas hotspots

---

## 5. Future Modules 🔒 FUTURE

- Essma Bros adapter after source review
- Additional mini-games (isolated, lazy-loaded)
- Optional 3D prototype behind the mini-game module seam
- Seasonal content tools and festival framework
- Parent-controlled cloud-backup option (privacy-reviewed)

**Exit gate:** no module corrupts the core profile, bypasses reward validation, introduces unreviewed child data collection, or slows the 2D ranch on baseline devices.

---

## Technical Debt (address before Phase 3)

- [ ] Replace hardcoded `STABLE_STARTER_DATE` with proper profile migration versioning
- [ ] Add strict null checks to `app/ranch-scene.tsx` (multiple `!` non-null assertions)
- [ ] Improve Phaser scene destroy/mount cycle to prevent memory leaks on screen switches
- [ ] Integration tests for equip/unequip toggle flow
- [ ] Update `docs/ASSET-QA.md` with all v2 wearable QA results
- [ ] Remove unused generator scripts from root (`generate.log`, old `.mjs` scripts)

---

## Milestone order within each phase

1. Approve player goal and acceptance criteria.
2. Approve content/asset brief and cultural review needs.
3. Implement catalog + scene/UI behavior.
4. Integrate final asset/audio variants.
5. Run functional, accessibility, safety, and child-observation tests.
6. Fix priority findings before expanding scope.
