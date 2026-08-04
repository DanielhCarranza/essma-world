import { characters, CharacterDefinition, CharacterId, defaultLookFor, getWearable, WearableDefinition } from "./game-catalog.js";
import { Appearance, PlayerProfile } from "./player-profile.js";

export type ResolvedAppearance = Readonly<{
  character: CharacterDefinition;
  layers: readonly WearableDefinition[];
}>;

/** The single appearance snapshot consumed by the React preview and Phaser. */
export function resolveAppearance(appearance: Appearance, characterId: CharacterId): ResolvedAppearance {
  const character = characters.find((entry) => entry.id === characterId);
  if (!character) throw new Error(`Unknown character ${characterId}`);
  const layers = Object.values(appearance[characterId])
    .map((id) => id && getWearable(id))
    .filter((item): item is WearableDefinition => Boolean(item && item.target === characterId))
    .sort((a, b) => a.zIndex - b.zIndex);
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
