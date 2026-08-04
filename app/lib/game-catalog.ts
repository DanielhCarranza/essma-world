/**
 * Authored, shipped data for the playable-core catalog. This module never
 * contains player state; saved profiles refer to these stable IDs only.
 */

export const CATALOG_VERSION = 1;

export const CHARACTER_IDS = ["essma", "juancito", "tori", "anita"] as const;
export type CharacterId = (typeof CHARACTER_IDS)[number];

export const WEARABLE_SLOTS = ["hair", "outfit", "shoes", "accessory", "head", "neck", "body"] as const;
export type WearableSlot = (typeof WEARABLE_SLOTS)[number];

export type LocalizedText = {
  "es-MX": { name: string; description: string };
};

export type AssetQa = {
  status: "planned" | "approved";
  score: number | null;
  accessibilityReviewed: boolean;
  productApproved: boolean;
  culturalReview: "not-performed" | "approved";
};

export type CatalogAsset = {
  runtimePath: string;
  thumbnailPath: string;
  width: number;
  height: number;
  alt: string;
  provenance: {
    source: "original-production";
    prompt: string;
    referenceUse: "high-level-direction-only";
  };
  qa: AssetQa;
};

export type CharacterDefinition = {
  id: CharacterId;
  version: number;
  kind: "playable-character";
  locale: LocalizedText;
  anchors: Partial<Record<WearableSlot, { x: number; y: number }>>;
  asset: CatalogAsset;
};

export type WearableDefinition = {
  id: string;
  version: number;
  kind: "wearable";
  target: CharacterId;
  slot: WearableSlot;
  anchor: { x: number; y: number };
  zIndex: number;
  locale: LocalizedText;
  unlock: { type: "starter" };
  asset: CatalogAsset;
};

export type CameoDefinition = {
  id: "loro" | "oso" | "capybara";
  version: number;
  kind: "non-interactive-cameo";
  locale: LocalizedText;
  asset: CatalogAsset;
};

const qa: AssetQa = {
  status: "planned",
  score: null,
  accessibilityReviewed: false,
  productApproved: false,
  culturalReview: "not-performed",
};

function originalAsset(runtimePath: string, thumbnailPath: string, alt: string, assetQa: AssetQa = qa): CatalogAsset {
  return {
    runtimePath,
    thumbnailPath,
    width: 1254,
    height: 1254,
    alt,
    provenance: {
      source: "original-production",
      prompt: "Original 2D storybook ranch art; warm Sonoran palette, tactile materials, clear silhouette, no text, logos, copied designs, or named-studio imitation.",
      referenceUse: "high-level-direction-only",
    },
    qa: { ...assetQa },
  };
}

export const characters: readonly CharacterDefinition[] = [
  { id: "essma", version: 1, kind: "playable-character", locale: { "es-MX": { name: "Essma", description: "Exploradora del rancho con rizos oscuros y moño azul." } }, anchors: { hair: { x: 627, y: 270 }, outfit: { x: 627, y: 710 }, shoes: { x: 627, y: 1085 }, accessory: { x: 770, y: 285 } }, asset: originalAsset("/assets/characters/v1/essma-base.png", "/assets/characters/v1/thumbnails/essma-base.png", "Essma, exploradora del rancho", { ...qa, score: 82 }) },
  { id: "juancito", version: 1, kind: "playable-character", locale: { "es-MX": { name: "Juancito", description: "Perrito de la pradera amigo de Essma." } }, anchors: { head: { x: 627, y: 388 }, neck: { x: 627, y: 575 }, body: { x: 627, y: 720 } }, asset: originalAsset("/assets/characters/v1/juancito-base.png", "/assets/characters/v1/thumbnails/juancito-base.png", "Juancito, perrito de la pradera", { ...qa, status: "approved", score: 89 }) },
  { id: "tori", version: 1, kind: "playable-character", locale: { "es-MX": { name: "Tori", description: "Cacomixtle curioso del rancho." } }, anchors: { head: { x: 627, y: 360 }, neck: { x: 627, y: 560 }, body: { x: 627, y: 735 } }, asset: originalAsset("/assets/characters/v1/tori-base.png", "/assets/characters/v1/thumbnails/tori-base.png", "Tori, cacomixtle", { ...qa, status: "approved", score: 92 }) },
  { id: "anita", version: 1, kind: "playable-character", locale: { "es-MX": { name: "Anita", description: "Vaquita amable del rancho." } }, anchors: { head: { x: 627, y: 390 }, neck: { x: 627, y: 560 }, body: { x: 627, y: 760 } }, asset: originalAsset("/assets/characters/v1/anita-base.png", "/assets/characters/v1/thumbnails/anita-base.png", "Anita, vaquita", { ...qa, status: "approved", score: 91 }) },
] as const;

function wearable(id: string, target: CharacterId, slot: WearableSlot, name: string, description: string, zIndex: number, score: number): WearableDefinition {
  const character = characters.find((entry) => entry.id === target);
  const anchor = character?.anchors[slot];
  if (!anchor) throw new Error(`Missing ${slot} anchor for ${target}`);
  const slug = id.replace("wearable.", "");
  return { id, version: 1, kind: "wearable", target, slot, anchor, zIndex, locale: { "es-MX": { name, description } }, unlock: { type: "starter" }, asset: originalAsset(`/assets/wearables/v1/${slug}.png`, `/assets/wearables/v1/thumbnails/${slug}.png`, `${name}, accesorio para ${character.locale["es-MX"].name}`, { ...qa, status: "approved", score }) };
}

export const wearables: readonly WearableDefinition[] = [
  wearable("wearable.essma.trenza-cobre", "essma", "hair", "Trenza cobriza", "Peinado para Essma.", 10, 91),
  wearable("wearable.essma.vestido-girasol", "essma", "outfit", "Vestido girasol", "Vestido para Essma.", 30, 94),
  wearable("wearable.essma.botitas-camino", "essma", "shoes", "Botitas de camino", "Botitas para Essma.", 40, 91),
  wearable("wearable.essma.diademita-flor", "essma", "accessory", "Diademita de flor", "Diademita para Essma.", 50, 87),
  wearable("wearable.juancito.gorrito-aventurero", "juancito", "head", "Gorrito aventurero", "Gorrito para Juancito.", 30, 89),
  wearable("wearable.juancito.chaleco-bolsitas", "juancito", "body", "Chaleco con bolsitas", "Chaleco para Juancito.", 20, 92),
  wearable("wearable.tori.panuelo-azul", "tori", "neck", "Pañuelo azul", "Pañuelo para Tori.", 30, 93),
  wearable("wearable.tori.gorrito-hojita", "tori", "head", "Gorrito de hojita", "Gorrito para Tori.", 40, 92),
  wearable("wearable.anita.chaleco-margarita", "anita", "body", "Chaleco margarita", "Chaleco para Anita.", 20, 94),
  wearable("wearable.anita.panuelo-rosa", "anita", "neck", "Pañuelo rosa", "Pañuelo para Anita.", 30, 92),
] as const;

export const cameos: readonly CameoDefinition[] = [
  { id: "loro", version: 1, kind: "non-interactive-cameo", locale: { "es-MX": { name: "Loro Loco", description: "Un loro alegre que pronto visitará el rancho." } }, asset: originalAsset("/assets/cameos/v1/loro-loco.png", "/assets/cameos/v1/thumbnails/loro-loco.png", "Retrato de Loro Loco", { ...qa, status: "approved", score: 88 }) },
  { id: "oso", version: 1, kind: "non-interactive-cameo", locale: { "es-MX": { name: "Oso Taquito", description: "Un osito amable que pronto visitará el rancho." } }, asset: originalAsset("/assets/cameos/v1/oso-taquito.png", "/assets/cameos/v1/thumbnails/oso-taquito.png", "Retrato de Oso Taquito", { ...qa, status: "approved", score: 88 }) },
  { id: "capybara", version: 1, kind: "non-interactive-cameo", locale: { "es-MX": { name: "Capybara", description: "Una capibara tranquila que pronto visitará el rancho." } }, asset: originalAsset("/assets/cameos/v1/capybara.png", "/assets/cameos/v1/thumbnails/capybara.png", "Retrato de Capybara", { ...qa, status: "approved", score: 88 }) },
] as const;

export const starterWearableIds = wearables.map((item) => item.id);

export function isCharacterId(value: unknown): value is CharacterId {
  return typeof value === "string" && (CHARACTER_IDS as readonly string[]).includes(value);
}

export function getWearable(id: string): WearableDefinition | undefined {
  return wearables.find((item) => item.id === id);
}

export function isCompatibleWearable(characterId: CharacterId, slot: WearableSlot, itemId: unknown): itemId is string {
  if (typeof itemId !== "string") return false;
  const item = getWearable(itemId);
  return item?.target === characterId && item.slot === slot;
}
