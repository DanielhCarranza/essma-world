import {
  CHARACTER_IDS,
  CharacterId,
  defaultLookFor,
  getRanchDecor,
  isCharacterId,
  isCompatibleRanchPlacement,
  isCompatibleWearable,
  RanchPlacementZoneId,
  starterRanchDecorIds,
  starterRegionIds,
  starterWearableIds,
  WearableSlot,
  WORLD_REGION_IDS,
} from "./game-catalog.js";

export const PROFILE_SCHEMA_VERSION = 4;
export const RANCH_LAYOUT_VERSION = 1;
export const LOCAL_PROFILE_ID = "local-primary" as const;

export type ProfileSettings = {
  music: boolean;
  sfx: boolean;
  reducedMotion: boolean;
};
export type Appearance = Record<
  CharacterId,
  Partial<Record<WearableSlot, string>>
>;
export type RanchPlacement = { decorId: string; zoneId: RanchPlacementZoneId };
export type RanchLayout = {
  version: typeof RANCH_LAYOUT_VERSION;
  placements: RanchPlacement[];
};
export type ProfileUnlocks = {
  itemIds: string[];
  decorIds: string[];
  companionIds: string[];
  regionIds: string[];
};

export type PlayerProfile = {
  schemaVersion: typeof PROFILE_SCHEMA_VERSION;
  profileId: typeof LOCAL_PROFILE_ID;
  createdAt: string;
  updatedAt: string;
  settings: ProfileSettings;
  unlocks: ProfileUnlocks;
  appearance: Appearance;
  ranchLayout: RanchLayout;
};

type LegacyProfileV1 = {
  schemaVersion: 1;
  profileId: typeof LOCAL_PROFILE_ID;
  appearance: unknown;
  settings: unknown;
};

type LegacyProfileV2OrV3 = {
  schemaVersion: 2 | 3;
  profileId: typeof LOCAL_PROFILE_ID;
  createdAt: unknown;
  updatedAt: unknown;
  settings: unknown;
  unlocks: unknown;
  appearance: unknown;
};

export type ProfileValidationResult =
  { ok: true; profile: PlayerProfile } | { ok: false; reason: string };
const defaultSettings: ProfileSettings = {
  music: true,
  sfx: true,
  reducedMotion: false,
};
const knownWearableIds = new Set(starterWearableIds);
const knownDecorIds = new Set(starterRanchDecorIds);
const knownCompanionIds = new Set<string>(CHARACTER_IDS);
const knownRegionIds = new Set<string>(WORLD_REGION_IDS);

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function isIsoDate(value: unknown): value is string {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}

function cloneRanchLayout(layout: RanchLayout): RanchLayout {
  return {
    version: RANCH_LAYOUT_VERSION,
    placements: layout.placements.map((placement) => ({ ...placement })),
  };
}

function normalizeSettings(value: unknown): ProfileSettings {
  if (!isRecord(value)) return { ...defaultSettings };
  return {
    music:
      typeof value.music === "boolean" ? value.music : defaultSettings.music,
    sfx: typeof value.sfx === "boolean" ? value.sfx : defaultSettings.sfx,
    reducedMotion:
      typeof value.reducedMotion === "boolean"
        ? value.reducedMotion
        : defaultSettings.reducedMotion,
  };
}

function normalizeIds(value: unknown, allowed: ReadonlySet<string>): string[] {
  if (!Array.isArray(value)) return [];
  return [
    ...new Set(
      value.filter(
        (id): id is string => typeof id === "string" && allowed.has(id),
      ),
    ),
  ];
}

function normalizeAppearance(
  value: unknown,
  unlockedItemIds: ReadonlySet<string>,
): Appearance {
  const input = isRecord(value) ? value : {};
  return Object.fromEntries(
    CHARACTER_IDS.map((characterId) => {
      const inputLook = isRecord(input[characterId]) ? input[characterId] : {};
      const look: Partial<Record<WearableSlot, string>> = {};
      const defaults = defaultLookFor(characterId);

      // Start with defaults for slots not specified in inputLook
      for (const [slot, defaultItemId] of Object.entries(defaults)) {
        if (!(slot in inputLook) && unlockedItemIds.has(defaultItemId)) {
          look[slot as WearableSlot] = defaultItemId;
        }
      }

      // Apply explicit player equipment or unselection
      for (const [slot, itemId] of Object.entries(inputLook)) {
        if (
          typeof itemId === "string" &&
          itemId !== "" &&
          isCompatibleWearable(characterId, slot as WearableSlot, itemId) &&
          unlockedItemIds.has(itemId)
        ) {
          look[slot as WearableSlot] = itemId;
        }
      }
      return [characterId, look];
    }),
  ) as Appearance;
}

function hasOnlyKnownIds(
  value: unknown,
  allowed: ReadonlySet<string>,
): value is string[] {
  return (
    Array.isArray(value) &&
    value.every((id) => typeof id === "string" && allowed.has(id))
  );
}

function validAppearance(
  value: unknown,
  unlockedItemIds: readonly string[],
): boolean {
  if (!isRecord(value)) return false;
  for (const characterId of CHARACTER_IDS) {
    const look = value[characterId];
    if (look !== undefined && !isRecord(look)) return false;
    if (isRecord(look)) {
      for (const [slot, itemId] of Object.entries(look)) {
        if (
          typeof itemId === "string" &&
          itemId !== "" &&
          (!isCompatibleWearable(characterId, slot as WearableSlot, itemId) ||
            !unlockedItemIds.includes(itemId))
        )
          return false;
      }
    }
  }
  return true;
}

/** Parses a layout without silently fixing it. Invalid data must not be persisted. */
export function validateRanchLayout(value: unknown): RanchLayout | null {
  if (
    !isRecord(value) ||
    value.version !== RANCH_LAYOUT_VERSION ||
    !Array.isArray(value.placements)
  )
    return null;
  const occupiedZones = new Set<string>();
  const placedDecor = new Set<string>();
  const placements: RanchPlacement[] = [];
  for (const rawPlacement of value.placements) {
    if (
      !isRecord(rawPlacement) ||
      typeof rawPlacement.decorId !== "string" ||
      typeof rawPlacement.zoneId !== "string"
    )
      return null;
    if (
      !getRanchDecor(rawPlacement.decorId) ||
      !isCompatibleRanchPlacement(rawPlacement.decorId, rawPlacement.zoneId)
    )
      return null;
    if (
      occupiedZones.has(rawPlacement.zoneId) ||
      placedDecor.has(rawPlacement.decorId)
    )
      return null;
    occupiedZones.add(rawPlacement.zoneId);
    placedDecor.add(rawPlacement.decorId);
    placements.push({
      decorId: rawPlacement.decorId,
      zoneId: rawPlacement.zoneId as RanchPlacementZoneId,
    });
  }
  return { version: RANCH_LAYOUT_VERSION, placements };
}

export function createEmptyRanchLayout(): RanchLayout {
  return { version: RANCH_LAYOUT_VERSION, placements: [] };
}

/** Replaces a zone while keeping a decor item unique in the patio. */
export function placeRanchDecor(
  layout: RanchLayout,
  decorId: string,
  zoneId: RanchPlacementZoneId,
): RanchLayout | null {
  const validLayout = validateRanchLayout(layout);
  if (!validLayout || !isCompatibleRanchPlacement(decorId, zoneId)) return null;
  return {
    version: RANCH_LAYOUT_VERSION,
    placements: [
      ...validLayout.placements.filter(
        (placement) =>
          placement.zoneId !== zoneId && placement.decorId !== decorId,
      ),
      { decorId, zoneId },
    ],
  };
}

export function removeRanchDecor(
  layout: RanchLayout,
  zoneId: RanchPlacementZoneId,
): RanchLayout | null {
  const validLayout = validateRanchLayout(layout);
  if (!validLayout) return null;
  return {
    version: RANCH_LAYOUT_VERSION,
    placements: validLayout.placements.filter(
      (placement) => placement.zoneId !== zoneId,
    ),
  };
}

/** A UI can retain the prior layout and pass it here for a validated undo. */
export function undoRanchDecor(
  previousLayout: RanchLayout,
): RanchLayout | null {
  const validLayout = validateRanchLayout(previousLayout);
  return validLayout ? cloneRanchLayout(validLayout) : null;
}

export function resetRanchLayout(): RanchLayout {
  return createEmptyRanchLayout();
}

export function canPlaceRanchDecor(
  profile: PlayerProfile,
  decorId: string,
  zoneId: RanchPlacementZoneId,
): boolean {
  return (
    profile.unlocks.decorIds.includes(decorId) &&
    isCompatibleRanchPlacement(decorId, zoneId)
  );
}

export function createStarterProfile(
  now = new Date().toISOString(),
): PlayerProfile {
  return {
    schemaVersion: PROFILE_SCHEMA_VERSION,
    profileId: LOCAL_PROFILE_ID,
    createdAt: now,
    updatedAt: now,
    settings: { ...defaultSettings },
    unlocks: {
      itemIds: [...starterWearableIds],
      decorIds: [...starterRanchDecorIds],
      companionIds: [],
      regionIds: [...starterRegionIds],
    },
    appearance: normalizeAppearance({}, new Set(starterWearableIds)),
    ranchLayout: createEmptyRanchLayout(),
  };
}

/** Normalizes only data that has already passed the import's structural checks. */
export function normalizeProfile(value: PlayerProfile): PlayerProfile {
  const unlockedItemIds = normalizeIds(value.unlocks.itemIds, knownWearableIds);
  const usableItemIds = [
    ...new Set([...starterWearableIds, ...unlockedItemIds]),
  ];
  const unlockedDecorIds = [
    ...new Set([
      ...starterRanchDecorIds,
      ...normalizeIds(value.unlocks.decorIds, knownDecorIds),
    ]),
  ];
  const regionIds = [
    ...new Set([
      ...starterRegionIds,
      ...normalizeIds(value.unlocks.regionIds, knownRegionIds),
    ]),
  ];
  const ranchLayout = validateRanchLayout(value.ranchLayout);
  // The caller has already structurally validated this layout. Keeping this
  // fallback prevents an accidental invalid in-memory object from persisting.
  if (
    !ranchLayout ||
    ranchLayout.placements.some(
      (placement) => !unlockedDecorIds.includes(placement.decorId),
    )
  )
    throw new Error("Cannot normalize invalid ranch layout");
  return {
    schemaVersion: PROFILE_SCHEMA_VERSION,
    profileId: LOCAL_PROFILE_ID,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
    settings: normalizeSettings(value.settings),
    unlocks: {
      itemIds: usableItemIds,
      decorIds: unlockedDecorIds,
      companionIds: normalizeIds(value.unlocks.companionIds, knownCompanionIds),
      regionIds,
    },
    appearance: normalizeAppearance(value.appearance, new Set(usableItemIds)),
    ranchLayout,
  };
}

function validateLegacyProfile(
  value: LegacyProfileV2OrV3,
): ProfileValidationResult {
  if (
    !isIsoDate(value.createdAt) ||
    !isIsoDate(value.updatedAt) ||
    !isRecord(value.settings) ||
    !isRecord(value.unlocks) ||
    !isRecord(value.appearance)
  )
    return { ok: false, reason: "malformed-profile" };
  const rawItems = value.unlocks.itemIds;
  if (!hasOnlyKnownIds(rawItems, knownWearableIds))
    return { ok: false, reason: "invalid-unlock" };
  if (!validAppearance(value.appearance, rawItems))
    return { ok: false, reason: "invalid-appearance" };
  if (
    value.unlocks.companionIds !== undefined &&
    !hasOnlyKnownIds(value.unlocks.companionIds, knownCompanionIds)
  )
    return { ok: false, reason: "invalid-unlock" };
  if (
    value.unlocks.regionIds !== undefined &&
    !hasOnlyKnownIds(value.unlocks.regionIds, knownRegionIds)
  )
    return { ok: false, reason: "invalid-unlock" };
  const profile = createStarterProfile(value.createdAt);
  profile.updatedAt = value.updatedAt;
  profile.settings = normalizeSettings(value.settings);
  profile.unlocks = {
    itemIds: [...new Set([...starterWearableIds, ...rawItems])],
    decorIds: [...starterRanchDecorIds],
    companionIds: normalizeIds(value.unlocks.companionIds, knownCompanionIds),
    regionIds: [
      ...new Set([
        ...starterRegionIds,
        ...normalizeIds(value.unlocks.regionIds, knownRegionIds),
      ]),
    ],
  };
  profile.appearance = normalizeAppearance(
    value.appearance,
    new Set(profile.unlocks.itemIds),
  );
  return { ok: true, profile };
}

function validateV4(value: unknown): ProfileValidationResult {
  if (
    !isRecord(value) ||
    value.schemaVersion !== PROFILE_SCHEMA_VERSION ||
    value.profileId !== LOCAL_PROFILE_ID
  )
    return { ok: false, reason: "incompatible-profile" };
  if (
    !isIsoDate(value.createdAt) ||
    !isIsoDate(value.updatedAt) ||
    !isRecord(value.settings) ||
    !isRecord(value.unlocks) ||
    !isRecord(value.appearance)
  )
    return { ok: false, reason: "malformed-profile" };
  const unlocks = value.unlocks;
  if (
    !hasOnlyKnownIds(unlocks.itemIds, knownWearableIds) ||
    !hasOnlyKnownIds(unlocks.decorIds, knownDecorIds) ||
    !hasOnlyKnownIds(unlocks.companionIds, knownCompanionIds) ||
    !hasOnlyKnownIds(unlocks.regionIds, knownRegionIds)
  )
    return { ok: false, reason: "invalid-unlock" };
  const unlockedDecorIds = unlocks.decorIds as string[];
  if (!validAppearance(value.appearance, unlocks.itemIds))
    return { ok: false, reason: "invalid-appearance" };
  const ranchLayout = validateRanchLayout(value.ranchLayout);
  if (
    !ranchLayout ||
    ranchLayout.placements.some(
      (placement) => !unlockedDecorIds.includes(placement.decorId),
    )
  )
    return { ok: false, reason: "invalid-ranch-layout" };
  return { ok: true, profile: normalizeProfile(value as PlayerProfile) };
}

function migrateV1(
  value: LegacyProfileV1,
  now: string,
): ProfileValidationResult {
  if (!isRecord(value.appearance) || !isRecord(value.settings))
    return { ok: false, reason: "malformed-profile" };
  const profile = createStarterProfile(now);
  profile.settings = normalizeSettings(value.settings);
  profile.appearance = normalizeAppearance(
    value.appearance,
    new Set(profile.unlocks.itemIds),
  );
  return { ok: true, profile };
}

/**
 * The single validation entry point for IndexedDB reads and parent backups.
 * A false result means callers must leave their currently saved profile intact.
 */
export function validateAndMigrateProfile(
  value: unknown,
  now = new Date().toISOString(),
): ProfileValidationResult {
  if (!isRecord(value)) return { ok: false, reason: "malformed-profile" };
  if (value.schemaVersion === 1 && value.profileId === LOCAL_PROFILE_ID)
    return migrateV1(value as LegacyProfileV1, now);
  if (
    (value.schemaVersion === 2 || value.schemaVersion === 3) &&
    value.profileId === LOCAL_PROFILE_ID
  )
    return validateLegacyProfile(value as LegacyProfileV2OrV3);
  return validateV4(value);
}

export function canEquip(
  profile: PlayerProfile,
  characterId: CharacterId,
  slot: WearableSlot,
  itemId: string,
): boolean {
  return (
    profile.unlocks.itemIds.includes(itemId) &&
    isCompatibleWearable(characterId, slot, itemId)
  );
}

export function characterName(characterId: unknown): string | null {
  return isCharacterId(characterId) ? characterId : null;
}
