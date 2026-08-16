import assert from "node:assert/strict";
import test from "node:test";

const libDir = process.env.ESSMA_LIB_DIR;
if (!libDir)
  throw new Error(
    "Set ESSMA_LIB_DIR to the temporary compiled app/lib directory before running this test.",
  );

const catalog = await import(`${libDir}/game-catalog.js`);
const profileLib = await import(`${libDir}/player-profile.js`);
const appearanceLib = await import(`${libDir}/appearance.js`);
const {
  CHARACTER_IDS,
  DEFAULT_LOOKS,
  characters,
  getWearable,
  isCompatibleRanchPlacement,
  isCompatibleWearable,
  pendingArtWearableIds,
  ranchDecor,
  ranchPlacementZones,
  ranchScenarios,
  starterRanchDecorIds,
  starterWearableIds,
  wearables,
  worldRegions,
} = catalog;
const {
  canEquip,
  canPlaceRanchDecor,
  createEmptyRanchLayout,
  createStarterProfile,
  placeRanchDecor,
  PROFILE_SCHEMA_VERSION,
  removeRanchDecor,
  resetRanchLayout,
  selectRanchScenario,
  undoRanchDecor,
  validateAndMigrateProfile,
} = profileLib;
const { randomizeAppearance, resetAppearance, resolveAppearance } =
  appearanceLib;
const NOW = "2026-08-03T12:00:00.000Z";

test("catalog contains four anchored bases and compatible wearables", () => {
  assert.equal(characters.length, 4);
  assert.ok(wearables.length >= 20);
  assert.deepEqual(
    Object.fromEntries(
      CHARACTER_IDS.map((id) => [
        id,
        wearables.filter((item) => item.target === id).length,
      ]),
    ),
    {
      essma: 21,
      juancito: 16,
      tori: 15,
      anita: 15,
    },
  );
  assert.deepEqual(
    [...new Set(characters.map((character) => character.id))].sort(),
    [...CHARACTER_IDS].sort(),
  );
  for (const item of wearables) {
    assert.ok(getWearable(item.id));
    assert.ok(isCompatibleWearable(item.target, item.slot, item.id));
    assert.ok(
      characters.find((character) => character.id === item.target).anchors[
        item.slot
      ],
    );
    assert.match(item.asset.runtimePath, /^\/assets\/wearables\/v[1-9]\d*\//);
    assert.match(
      item.asset.thumbnailPath,
      /^\/assets\/wearables\/v[1-9]\d*\/thumbnails\//,
    );
    assert.equal(
      item.asset.provenance.referenceUse,
      "high-level-direction-only",
    );
  }
  for (const characterId of CHARACTER_IDS) {
    assert.ok(
      Object.keys(DEFAULT_LOOKS[characterId]).length > 0,
      `${characterId} needs a default look`,
    );
    for (const [slot, itemId] of Object.entries(DEFAULT_LOOKS[characterId])) {
      assert.ok(isCompatibleWearable(characterId, slot, itemId));
    }
  }
});

test("catalog defines an open Rancho, five locked regions, and reviewed decor placement data", () => {
  assert.equal(worldRegions.length, 6);
  assert.equal(
    worldRegions
      .filter((region) => region.availability === "open")
      .map((region) => region.id)
      .join(),
    "region.rancho",
  );
  assert.equal(
    worldRegions.filter((region) => region.availability === "locked").length,
    5,
  );
  assert.equal(ranchPlacementZones.length, 6);
  assert.ok(ranchDecor.length >= 10);
  assert.deepEqual(
    starterRanchDecorIds,
    ranchDecor.filter((item) => item.unlock.type === "starter").map((decor) => decor.id),
  );
  for (const decor of ranchDecor) {
    assert.match(decor.asset.runtimePath, /^\/assets\/decor\/v1\//);
    assert.match(
      decor.asset.thumbnailPath,
      /^\/assets\/decor\/v1\/thumbnails\//,
    );
    assert.equal(
      decor.asset.provenance.referenceUse,
      "high-level-direction-only",
    );
    assert.equal(decor.asset.qa.status, "approved");
    assert.ok(decor.asset.qa.score >= 85);
    assert.equal(decor.asset.qa.accessibilityReviewed, true);
    assert.equal(decor.asset.qa.productApproved, false);
    assert.equal(decor.asset.qa.culturalReview, "not-performed");
    for (const zoneId of decor.compatibleZoneIds)
      assert.equal(isCompatibleRanchPlacement(decor.id, zoneId), true);
  }
});

test("catalog rejects an item when its target or slot does not match", () => {
  assert.equal(
    isCompatibleWearable("essma", "outfit", "wearable.tori.panuelo-azul"),
    false,
  );
  assert.equal(
    isCompatibleWearable("tori", "head", "wearable.tori.panuelo-azul"),
    false,
  );
});

test("a v1 profile migrates to normalized current state without unknown items", () => {
  const result = validateAndMigrateProfile(
    {
      schemaVersion: 1,
      profileId: "local-primary",
      settings: { music: false, sfx: true, reducedMotion: true },
      appearance: {
        essma: {
          outfit: "wearable.essma.vestido-girasol",
          head: "wearable.tori.gorrito-hojita",
        },
        tori: { neck: "wearable.tori.panuelo-azul" },
      },
    },
    NOW,
  );
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.profile.schemaVersion, PROFILE_SCHEMA_VERSION);
  assert.equal(result.profile.createdAt, NOW);
  assert.equal(result.profile.settings.music, false);
  assert.equal(
    result.profile.appearance.essma.outfit,
    "wearable.essma.vestido-girasol",
  );
  assert.equal(result.profile.appearance.essma.head, "");
  assert.equal(
    result.profile.appearance.tori.neck,
    "wearable.tori.panuelo-azul",
  );
  assert.equal(
    result.profile.appearance.juancito.body,
    "wearable.juancito.chaleco-bolsitas",
  );
  assert.deepEqual(result.profile.unlocks.itemIds, starterWearableIds);
  assert.deepEqual(result.profile.unlocks.decorIds, starterRanchDecorIds);
  assert.deepEqual(result.profile.ranchLayout.placements, []);
});

test("starter, legacy, and reset looks are dressed while explicit equipment is preserved", () => {
  const starter = createStarterProfile(NOW);
  assert.deepEqual(starter.appearance.essma, DEFAULT_LOOKS.essma);
  assert.deepEqual(starter.appearance.anita, DEFAULT_LOOKS.anita);

  const migrated = validateAndMigrateProfile(
    {
      schemaVersion: 2,
      profileId: "local-primary",
      createdAt: NOW,
      updatedAt: NOW,
      settings: { music: true, sfx: true, reducedMotion: false },
      unlocks: { itemIds: starterWearableIds, companionIds: [], regionIds: [] },
      appearance: {
        essma: {
          outfit: "wearable.essma.vestido-girasol",
          shoes: "wearable.essma.botitas-camino",
        },
      },
    },
    NOW,
  );
  assert.equal(migrated.ok, true);
  if (!migrated.ok) return;
  assert.equal(migrated.profile.schemaVersion, PROFILE_SCHEMA_VERSION);
  assert.equal(
    migrated.profile.appearance.essma.outfit,
    "wearable.essma.vestido-girasol",
  );
  assert.equal(
    migrated.profile.appearance.essma.accessory,
    "wearable.essma.diademita-flor",
  );
  assert.equal(
    migrated.profile.appearance.tori.head,
    "wearable.tori.gorrito-hojita",
  );
});

test("invalid v2 imports are rejected instead of normalized into a replacement", () => {
  const valid = createStarterProfile(NOW);
  const unknownUnlock = {
    ...valid,
    unlocks: {
      ...valid.unlocks,
      itemIds: [...valid.unlocks.itemIds, "wearable.unknown"],
    },
  };
  const incompatibleLook = {
    ...valid,
    appearance: {
      ...valid.appearance,
      essma: { neck: "wearable.tori.panuelo-azul" },
    },
  };
  assert.deepEqual(validateAndMigrateProfile(unknownUnlock, NOW), {
    ok: false,
    reason: "invalid-unlock",
  });
  assert.deepEqual(validateAndMigrateProfile(incompatibleLook, NOW), {
    ok: false,
    reason: "invalid-appearance",
  });
  assert.deepEqual(validateAndMigrateProfile({ schemaVersion: 99 }, NOW), {
    ok: false,
    reason: "incompatible-profile",
  });
});

test("a v3 profile preserves appearances, settings, and known unlocks while receiving an empty ranch layout", () => {
  const result = validateAndMigrateProfile(
    {
      schemaVersion: 3,
      profileId: "local-primary",
      createdAt: NOW,
      updatedAt: "2026-08-03T13:00:00.000Z",
      settings: { music: false, sfx: false, reducedMotion: true },
      unlocks: {
        itemIds: starterWearableIds,
        companionIds: ["tori"],
        regionIds: ["region.rancho"],
      },
      appearance: { tori: { head: "wearable.tori.gorrito-hojita" } },
    },
    NOW,
  );
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.profile.schemaVersion, PROFILE_SCHEMA_VERSION);
  assert.equal(result.profile.updatedAt, "2026-08-03T13:00:00.000Z");
  assert.equal(result.profile.settings.reducedMotion, true);
  assert.deepEqual(result.profile.unlocks.companionIds, ["tori"]);
  assert.equal(
    result.profile.appearance.tori.head,
    "wearable.tori.gorrito-hojita",
  );
  assert.deepEqual(result.profile.ranchLayout, createEmptyRanchLayout());
});

test("ranch placements are compatible, unique, reversible, and never normalize invalid backups", () => {
  const profile = createStarterProfile(NOW);
  const first = placeRanchDecor(
    profile.ranchLayout,
    "decor.rancho.mesa-picnic",
    "patio.mesquite",
  );
  assert.equal(first.activeScenarioId, "patio-central");
  assert.deepEqual(first.placements, [
    { decorId: "decor.rancho.mesa-picnic", zoneId: "patio.mesquite" },
  ]);
  assert.equal(
    canPlaceRanchDecor(profile, "decor.rancho.mesa-picnic", "patio.mesquite"),
    true,
  );
  assert.equal(
    canPlaceRanchDecor(profile, "decor.rancho.mesa-picnic", "patio.flores"),
    false,
  );
  const moved = placeRanchDecor(
    first,
    "decor.rancho.mesa-picnic",
    "patio.fogata",
  );
  assert.equal(moved.activeScenarioId, "patio-central");
  assert.deepEqual(moved.placements, [
    { decorId: "decor.rancho.mesa-picnic", zoneId: "patio.fogata" },
  ]);
  const removed = removeRanchDecor(moved, "patio.fogata");
  assert.equal(removed.activeScenarioId, "patio-central");
  assert.deepEqual(removed.placements, []);
  assert.deepEqual(undoRanchDecor(first), first);
  assert.deepEqual(resetRanchLayout(), createEmptyRanchLayout());
  assert.equal(
    placeRanchDecor(
      profile.ranchLayout,
      "decor.rancho.mesa-picnic",
      "patio.flores",
    ),
    null,
  );

  const invalidZone = {
    ...profile,
    ranchLayout: {
      version: 1,
      placements: [
        { decorId: "decor.rancho.mesa-picnic", zoneId: "patio.flores" },
      ],
    },
  };
  const lockedDecor = {
    ...profile,
    unlocks: {
      ...profile.unlocks,
      decorIds: profile.unlocks.decorIds.filter(
        (id) => id !== "decor.rancho.mesa-picnic",
      ),
    },
    ranchLayout: {
      version: 1,
      placements: [
        { decorId: "decor.rancho.mesa-picnic", zoneId: "patio.mesquite" },
      ],
    },
  };
  assert.deepEqual(validateAndMigrateProfile(invalidZone, NOW), {
    ok: false,
    reason: "invalid-ranch-layout",
  });
  assert.deepEqual(validateAndMigrateProfile(lockedDecor, NOW), {
    ok: false,
    reason: "invalid-ranch-layout",
  });
});

test("equipment must be an unlocked compatible catalog item", () => {
  const profile = createStarterProfile(NOW);
  assert.equal(
    canEquip(profile, "essma", "outfit", "wearable.essma.vestido-girasol"),
    true,
  );
  assert.equal(
    canEquip(profile, "essma", "outfit", "wearable.tori.panuelo-azul"),
    false,
  );
  profile.unlocks.itemIds = profile.unlocks.itemIds.filter(
    (id) => id !== "wearable.essma.vestido-girasol",
  );
  assert.equal(
    canEquip(profile, "essma", "outfit", "wearable.essma.vestido-girasol"),
    false,
  );
});

test("the shared resolver, reset, and randomize helpers only produce compatible layers", () => {
  const profile = createStarterProfile(NOW);
  profile.appearance.essma.outfit = "wearable.essma.vestido-girasol";
  const resolved = resolveAppearance(profile.appearance, "essma");
  assert.equal(resolved.character.id, "essma");
  assert.deepEqual(
    resolved.layers.map((item) => item.id),
    [
      "wearable.essma.botitas-camino",
      "wearable.essma.vestido-girasol",
      "wearable.essma.diademita-flor",
    ],
  );
  assert.deepEqual(
    resetAppearance(profile.appearance, "essma").essma,
    DEFAULT_LOOKS.essma,
  );
  const randomized = randomizeAppearance(profile, "tori", () => 0.9);
  assert.ok(
    Object.values(randomized.tori).every((id) =>
      id?.startsWith("wearable.tori."),
    ),
  );
});

test("playable closet contains all shipped v5 wearables without pending-art placeholders", () => {
  assert.equal(pendingArtWearableIds.length, 0);
  assert.ok(starterWearableIds.includes("wearable.essma.huaraches-piel"));
  assert.ok(starterWearableIds.includes("wearable.essma.tenis-sol"));
  assert.ok(starterWearableIds.includes("wearable.essma.botitas-camino"));
  assert.ok(starterWearableIds.includes("wearable.essma.botitas-cobalto"));
  const starter = createStarterProfile(NOW);
  assert.ok(starter.unlocks.itemIds.includes("wearable.essma.tenis-sol"));

  const validProfile = {
    ...starter,
    appearance: {
      ...starter.appearance,
      essma: {
        ...starter.appearance.essma,
        shoes: "wearable.essma.tenis-sol",
      },
    },
  };
  const cleaned = validateAndMigrateProfile(validProfile, NOW);
  assert.equal(cleaned.ok, true);
  if (!cleaned.ok) return;
  assert.equal(
    cleaned.profile.appearance.essma.shoes,
    "wearable.essma.tenis-sol",
  );
});

test("explicit unequip persists across normalize / save cycles", () => {
  const starter = createStarterProfile(NOW);
  const unequipped = {
    ...starter,
    appearance: {
      ...starter.appearance,
      essma: {
        ...starter.appearance.essma,
        shoes: "",
        accessory: "",
      },
    },
  };
  const once = validateAndMigrateProfile(unequipped, NOW);
  assert.equal(once.ok, true);
  if (!once.ok) return;
  assert.equal(once.profile.appearance.essma.shoes, "");
  assert.equal(once.profile.appearance.essma.accessory, "");
  assert.equal(
    once.profile.appearance.essma.outfit,
    "wearable.essma.vestido-girasol",
  );

  const twice = validateAndMigrateProfile(once.profile, NOW);
  assert.equal(twice.ok, true);
  if (!twice.ok) return;
  assert.equal(twice.profile.appearance.essma.shoes, "");
  assert.equal(twice.profile.appearance.essma.accessory, "");

  const resolved = resolveAppearance(twice.profile.appearance, "essma");
  assert.deepEqual(
    resolved.layers.map((item) => item.id),
    ["wearable.essma.vestido-girasol"],
  );
});

test("ranch scenarios catalog definitions and scenario layout switching work properly", () => {
  assert.equal(ranchScenarios.length, 5);
  assert.deepEqual(
    ranchScenarios.map((s) => s.id),
    ["patio-central", "jardin-de-flores", "el-huerto", "el-corral", "la-terraza"],
  );

  const profile = createStarterProfile(NOW);
  const layoutWithDecor = placeRanchDecor(
    profile.ranchLayout,
    "decor.rancho.mesa-picnic",
    "patio.mesquite",
  );
  assert.equal(layoutWithDecor.activeScenarioId, "patio-central");
  assert.equal(layoutWithDecor.placements.length, 1);

  // Switch to el-huerto
  const huertoLayout = selectRanchScenario(layoutWithDecor, "el-huerto");
  assert.equal(huertoLayout.activeScenarioId, "el-huerto");
  assert.equal(huertoLayout.placements.length, 0);

  // Decorate el-huerto
  const huertoDecorated = placeRanchDecor(
    huertoLayout,
    "decor.rancho.macetas-talavera",
    "patio.macetas",
  );
  assert.equal(huertoDecorated.activeScenarioId, "el-huerto");
  assert.equal(huertoDecorated.placements.length, 1);
  assert.equal(huertoDecorated.placements[0].decorId, "decor.rancho.macetas-talavera");

  // Switch back to patio-central — original decor must be preserved!
  const centralReturned = selectRanchScenario(huertoDecorated, "patio-central");
  assert.equal(centralReturned.activeScenarioId, "patio-central");
  assert.equal(centralReturned.placements.length, 1);
  assert.equal(centralReturned.placements[0].decorId, "decor.rancho.mesa-picnic");
});
