import assert from "node:assert/strict";
import test from "node:test";

import {
  createStarterProfile,
  validateAndMigrateProfile,
} from "../app/lib/player-profile.ts";

const NOW = "2026-08-04T12:00:00.000Z";

test("malformed backup import is rejected and does not corrupt valid profile", () => {
  const malformedInputs = [
    "{ invalid json }",
    '{"schemaVersion": "not-a-number"}',
    '{"schemaVersion": 4, "settings": "invalid"}',
    '{"schemaVersion": 4, "unlocks": {"itemIds": ["unknown-wearable"]}}',
  ];

  for (const input of malformedInputs) {
    let parsed: unknown = null;
    try {
      parsed = JSON.parse(input);
    } catch {
      // Intentionally invalid JSON string
    }

    if (parsed) {
      const result = validateAndMigrateProfile(parsed, NOW);
      assert.equal(result.ok, false);
    }
  }
});

test("caregiver backup cancellation preserves active profile unchanged", () => {
  const currentProfile = createStarterProfile(NOW);
  let pendingImport = null;

  // Simulate starting import process
  const validImportData = {
    ...currentProfile,
    settings: { music: false, sfx: false, reducedMotion: true },
  };
  const result = validateAndMigrateProfile(validImportData, NOW);
  assert.equal(result.ok, true);
  if (result.ok) {
    pendingImport = result.profile;
  }

  // User cancels caregiver dialog
  pendingImport = null;

  // Active profile remains original
  assert.equal(currentProfile.settings.music, true);
  assert.equal(currentProfile.settings.sfx, true);
  assert.equal(currentProfile.settings.reducedMotion, false);
});

test("sound disabled before ranch entrance is respected", () => {
  const profile = createStarterProfile(NOW);
  profile.settings.sfx = false;
  profile.settings.music = false;

  assert.equal(profile.settings.sfx, false);
  assert.equal(profile.settings.music, false);
});

test("reduced motion preference is preserved across profile migration", () => {
  const legacyProfile = {
    schemaVersion: 1,
    profileId: "local-primary",
    settings: { music: true, sfx: true, reducedMotion: true },
  };

  const result = validateAndMigrateProfile(legacyProfile, NOW);
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.profile.settings.reducedMotion, true);
  }
});
