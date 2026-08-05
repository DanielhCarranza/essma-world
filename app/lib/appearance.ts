import { characters, CharacterDefinition, CharacterId, defaultLookFor, getWearable, WearableDefinition } from "./game-catalog.js";
import { Appearance, PlayerProfile } from "./player-profile.js";

export type ResolvedAppearance = Readonly<{
  character: CharacterDefinition;
  layers: readonly WearableDefinition[];
}>;

export const ESSMA_HANDS_OVERLAY: WearableDefinition = {
  id: "wearable.essma.hands-overlay",
  version: 1,
  kind: "wearable",
  target: "essma",
  slot: "body",
  anchor: { x: 627, y: 710 },
  zIndex: 35,
  locale: { "es-MX": { name: "Manitas", description: "Manitas de Essma" } },
  unlock: { type: "starter" },
  asset: {
    runtimePath: "/assets/characters/v1/essma-hands.png",
    thumbnailPath: "/assets/characters/v1/essma-hands.png",
    width: 1254,
    height: 1254,
    alt: "Manitas de Essma",
    provenance: {
      source: "original-production",
      prompt: "Essma hands overlay",
      referenceUse: "high-level-direction-only",
    },
    qa: {
      status: "approved",
      score: 95,
      accessibilityReviewed: true,
      productApproved: false,
      culturalReview: "not-performed",
    },
  },
};

/** The single appearance snapshot consumed by the React preview and Phaser. */
export function resolveAppearance(appearance: Appearance, characterId: CharacterId): ResolvedAppearance {
  const character = characters.find((entry) => entry.id === characterId);
  if (!character) throw new Error(`Unknown character ${characterId}`);
  const layers = Object.values(appearance[characterId])
    .map((id) => id && getWearable(id))
    .filter((item): item is WearableDefinition => Boolean(item && item.target === characterId));
  if (characterId === "essma" && appearance.essma.outfit) {
    layers.push(ESSMA_HANDS_OVERLAY);
  }
  layers.sort((a, b) => a.zIndex - b.zIndex);
  return Object.freeze({ character, layers: Object.freeze(layers) });
}

export function resetAppearance(appearance: Appearance, characterId: CharacterId): Appearance {
  return { ...appearance, [characterId]: defaultLookFor(characterId) };
}

export function randomizeAppearance(profile: PlayerProfile, characterId: CharacterId, random = Math.random): Appearance {
  const choices = profile.unlocks.itemIds.map(getWearable).filter((item): item is WearableDefinition => Boolean(item && item.target === characterId));
  const next: Appearance[CharacterId] = defaultLookFor(characterId);
  for (const item of choices) {
    if (!(item.slot in next) || random() >= 0.5) next[item.slot] = item.id;
  }
  return { ...profile.appearance, [characterId]: next };
}
