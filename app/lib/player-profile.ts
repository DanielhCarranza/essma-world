import { CHARACTER_IDS, CharacterId, getWearable, isCharacterId, isCompatibleWearable, starterWearableIds, WearableSlot } from "./game-catalog.js";

export const PROFILE_SCHEMA_VERSION = 2;
export const LOCAL_PROFILE_ID = "local-primary" as const;

export type ProfileSettings = { music: boolean; sfx: boolean; reducedMotion: boolean };
export type Appearance = Record<CharacterId, Partial<Record<WearableSlot, string>>>;

export type PlayerProfile = {
  schemaVersion: typeof PROFILE_SCHEMA_VERSION;
  profileId: typeof LOCAL_PROFILE_ID;
  createdAt: string;
  updatedAt: string;
  settings: ProfileSettings;
  unlocks: { itemIds: string[]; companionIds: string[]; regionIds: string[] };
  appearance: Appearance;
};

type LegacyProfileV1 = {
  schemaVersion: 1;
  profileId: typeof LOCAL_PROFILE_ID;
  appearance: unknown;
  settings: unknown;
};

export type ProfileValidationResult = { ok: true; profile: PlayerProfile } | { ok: false; reason: string };
const defaultSettings: ProfileSettings = { music: true, sfx: true, reducedMotion: false };

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function isIsoDate(value: unknown): value is string {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}

function normalizeSettings(value: unknown): ProfileSettings {
  if (!isRecord(value)) return { ...defaultSettings };
  return {
    music: typeof value.music === "boolean" ? value.music : defaultSettings.music,
    sfx: typeof value.sfx === "boolean" ? value.sfx : defaultSettings.sfx,
    reducedMotion: typeof value.reducedMotion === "boolean" ? value.reducedMotion : defaultSettings.reducedMotion,
  };
}

function normalizeIds(value: unknown, allowed: ReadonlySet<string>): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((id): id is string => typeof id === "string" && allowed.has(id)))];
}

function normalizeAppearance(value: unknown, unlockedItemIds: ReadonlySet<string>): Appearance {
  const input = isRecord(value) ? value : {};
  return Object.fromEntries(CHARACTER_IDS.map((characterId) => {
    const inputLook = isRecord(input[characterId]) ? input[characterId] : {};
    const look: Partial<Record<WearableSlot, string>> = {};
    for (const [slot, itemId] of Object.entries(inputLook)) {
      if (isCompatibleWearable(characterId, slot as WearableSlot, itemId) && unlockedItemIds.has(itemId)) look[slot as WearableSlot] = itemId;
    }
    return [characterId, look];
  })) as Appearance;
}

export function createStarterProfile(now = new Date().toISOString()): PlayerProfile {
  return {
    schemaVersion: PROFILE_SCHEMA_VERSION,
    profileId: LOCAL_PROFILE_ID,
    createdAt: now,
    updatedAt: now,
    settings: { ...defaultSettings },
    unlocks: { itemIds: [...starterWearableIds], companionIds: [], regionIds: [] },
    appearance: normalizeAppearance({}, new Set(starterWearableIds)),
  };
}

/** Normalizes only data that has already passed the import's structural checks. */
export function normalizeProfile(value: PlayerProfile): PlayerProfile {
  const unlockedItemIds = normalizeIds(value.unlocks.itemIds, new Set(starterWearableIds));
  const usableUnlocks = unlockedItemIds.length ? unlockedItemIds : [...starterWearableIds];
  return {
    schemaVersion: PROFILE_SCHEMA_VERSION,
    profileId: LOCAL_PROFILE_ID,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
    settings: normalizeSettings(value.settings),
    unlocks: { itemIds: usableUnlocks, companionIds: [], regionIds: [] },
    appearance: normalizeAppearance(value.appearance, new Set(usableUnlocks)),
  };
}

function validateV2(value: unknown): ProfileValidationResult {
  if (!isRecord(value) || value.schemaVersion !== PROFILE_SCHEMA_VERSION || value.profileId !== LOCAL_PROFILE_ID) return { ok: false, reason: "incompatible-profile" };
  if (!isIsoDate(value.createdAt) || !isIsoDate(value.updatedAt) || !isRecord(value.settings) || !isRecord(value.unlocks) || !isRecord(value.appearance)) return { ok: false, reason: "malformed-profile" };
  const rawItems = value.unlocks.itemIds;
  if (!Array.isArray(rawItems) || rawItems.some((id) => typeof id !== "string" || !getWearable(id))) return { ok: false, reason: "invalid-unlock" };
  for (const characterId of CHARACTER_IDS) {
    const look = value.appearance[characterId];
    if (look !== undefined && !isRecord(look)) return { ok: false, reason: "malformed-appearance" };
    if (isRecord(look)) for (const [slot, itemId] of Object.entries(look)) {
      if (!isCompatibleWearable(characterId, slot as WearableSlot, itemId) || !rawItems.includes(itemId)) return { ok: false, reason: "invalid-appearance" };
    }
  }
  return { ok: true, profile: normalizeProfile(value as unknown as PlayerProfile) };
}

function migrateV1(value: LegacyProfileV1, now: string): ProfileValidationResult {
  if (!isRecord(value.appearance) || !isRecord(value.settings)) return { ok: false, reason: "malformed-profile" };
  const profile = createStarterProfile(now);
  profile.settings = normalizeSettings(value.settings);
  profile.appearance = normalizeAppearance(value.appearance, new Set(profile.unlocks.itemIds));
  return { ok: true, profile };
}

/**
 * The single validation entry point for IndexedDB reads and parent backups.
 * A false result means callers must leave their currently saved profile intact.
 */
export function validateAndMigrateProfile(value: unknown, now = new Date().toISOString()): ProfileValidationResult {
  if (!isRecord(value)) return { ok: false, reason: "malformed-profile" };
  if (value.schemaVersion === 1 && value.profileId === LOCAL_PROFILE_ID) return migrateV1(value as LegacyProfileV1, now);
  return validateV2(value);
}

export function canEquip(profile: PlayerProfile, characterId: CharacterId, slot: WearableSlot, itemId: string): boolean {
  return profile.unlocks.itemIds.includes(itemId) && isCompatibleWearable(characterId, slot, itemId);
}

export function characterName(characterId: unknown): string | null {
  return isCharacterId(characterId) ? characterId : null;
}
