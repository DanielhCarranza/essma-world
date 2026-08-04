import assert from "node:assert/strict";
import test from "node:test";

const libDir = process.env.ESSMA_LIB_DIR;
if (!libDir) throw new Error("Set ESSMA_LIB_DIR to the temporary compiled app/lib directory before running this test.");

const catalog = await import(`${libDir}/game-catalog.js`);
const profileLib = await import(`${libDir}/player-profile.js`);
const appearanceLib = await import(`${libDir}/appearance.js`);
const { CHARACTER_IDS, characters, getWearable, isCompatibleWearable, starterWearableIds, wearables } = catalog;
const { canEquip, createStarterProfile, PROFILE_SCHEMA_VERSION, validateAndMigrateProfile } = profileLib;
const { randomizeAppearance, resetAppearance, resolveAppearance } = appearanceLib;
const NOW = "2026-08-03T12:00:00.000Z";

test("catalog contains four anchored bases and ten compatible starter wearables", () => {
  assert.equal(characters.length, 4);
  assert.equal(wearables.length, 10);
  assert.deepEqual([...new Set(characters.map((character) => character.id))].sort(), [...CHARACTER_IDS].sort());
  for (const item of wearables) {
    assert.ok(getWearable(item.id));
    assert.ok(isCompatibleWearable(item.target, item.slot, item.id));
    assert.ok(characters.find((character) => character.id === item.target).anchors[item.slot]);
    assert.match(item.asset.runtimePath, /^\/assets\/wearables\/v1\//);
    assert.equal(item.asset.provenance.referenceUse, "high-level-direction-only");
  }
});

test("catalog rejects an item when its target or slot does not match", () => {
  assert.equal(isCompatibleWearable("essma", "outfit", "wearable.tori.panuelo-azul"), false);
  assert.equal(isCompatibleWearable("tori", "head", "wearable.tori.panuelo-azul"), false);
});

test("a v1 profile migrates to normalized v2 state without unknown items", () => {
  const result = validateAndMigrateProfile({
    schemaVersion: 1,
    profileId: "local-primary",
    settings: { music: false, sfx: true, reducedMotion: true },
    appearance: { essma: { outfit: "wearable.essma.vestido-girasol", head: "wearable.tori.gorrito-hojita" }, tori: { neck: "wearable.tori.panuelo-azul" } },
  }, NOW);
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.profile.schemaVersion, PROFILE_SCHEMA_VERSION);
  assert.equal(result.profile.createdAt, NOW);
  assert.equal(result.profile.settings.music, false);
  assert.equal(result.profile.appearance.essma.outfit, "wearable.essma.vestido-girasol");
  assert.equal(result.profile.appearance.essma.head, undefined);
  assert.equal(result.profile.appearance.tori.neck, "wearable.tori.panuelo-azul");
  assert.deepEqual(result.profile.unlocks.itemIds, starterWearableIds);
});

test("invalid v2 imports are rejected instead of normalized into a replacement", () => {
  const valid = createStarterProfile(NOW);
  const unknownUnlock = { ...valid, unlocks: { ...valid.unlocks, itemIds: [...valid.unlocks.itemIds, "wearable.unknown"] } };
  const incompatibleLook = { ...valid, appearance: { ...valid.appearance, essma: { neck: "wearable.tori.panuelo-azul" } } };
  assert.deepEqual(validateAndMigrateProfile(unknownUnlock, NOW), { ok: false, reason: "invalid-unlock" });
  assert.deepEqual(validateAndMigrateProfile(incompatibleLook, NOW), { ok: false, reason: "invalid-appearance" });
  assert.deepEqual(validateAndMigrateProfile({ schemaVersion: 99 }, NOW), { ok: false, reason: "incompatible-profile" });
});

test("equipment must be an unlocked compatible catalog item", () => {
  const profile = createStarterProfile(NOW);
  assert.equal(canEquip(profile, "essma", "outfit", "wearable.essma.vestido-girasol"), true);
  assert.equal(canEquip(profile, "essma", "outfit", "wearable.tori.panuelo-azul"), false);
  profile.unlocks.itemIds = profile.unlocks.itemIds.filter((id) => id !== "wearable.essma.vestido-girasol");
  assert.equal(canEquip(profile, "essma", "outfit", "wearable.essma.vestido-girasol"), false);
});

test("the shared resolver, reset, and randomize helpers only produce compatible layers", () => {
  const profile = createStarterProfile(NOW);
  profile.appearance.essma.outfit = "wearable.essma.vestido-girasol";
  const resolved = resolveAppearance(profile.appearance, "essma");
  assert.equal(resolved.character.id, "essma");
  assert.deepEqual(resolved.layers.map((item) => item.id), ["wearable.essma.vestido-girasol"]);
  assert.deepEqual(resetAppearance(profile.appearance, "essma").essma, {});
  const randomized = randomizeAppearance(profile, "tori", () => 0.9);
  assert.ok(Object.values(randomized.tori).every((id) => id?.startsWith("wearable.tori.")));
});
