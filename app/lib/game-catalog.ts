/**
 * Authored, shipped data for the playable-core catalog. This module never
 * contains player state; saved profiles refer to these stable IDs only.
 */

export const CATALOG_VERSION = 2;

export const CHARACTER_IDS = ["essma", "juancito", "tori", "anita"] as const;
export type CharacterId = (typeof CHARACTER_IDS)[number];

export const WEARABLE_SLOTS = [
  "hair",
  "outfit",
  "shoes",
  "accessory",
  "head",
  "neck",
  "body",
] as const;
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
  unlock: { type: "starter" } | { type: "reward"; activityId: string };
  asset: CatalogAsset;
};

export const WORLD_REGION_IDS = [
  "region.rancho",
  "region.desierto",
  "region.pueblo",
  "region.bosque",
  "region.oasis",
  "region.valle-de-flores",
] as const;
export type WorldRegionId = (typeof WORLD_REGION_IDS)[number];

export type WorldRegionDefinition = {
  id: WorldRegionId;
  version: number;
  kind: "world-region";
  availability: "open" | "locked";
  locale: LocalizedText;
  mapPosition: { x: number; y: number };
  asset: CatalogAsset;
};

export const RANCH_PLACEMENT_ZONE_IDS = [
  "patio.puerta",
  "patio.mesquite",
  "patio.corral",
  "patio.macetas",
  "patio.fogata",
  "patio.flores",
] as const;
export type RanchPlacementZoneId = (typeof RANCH_PLACEMENT_ZONE_IDS)[number];

/** Authored, normalized anchors on the 1280 × 720 ranch composition. */
export type RanchPlacementZone = {
  id: RanchPlacementZoneId;
  version: number;
  kind: "ranch-placement-zone";
  locale: LocalizedText;
  anchor: { x: number; y: number };
  footprint: { width: number; height: number };
};

export type RanchDecorDefinition = {
  id: string;
  version: number;
  kind: "ranch-decor";
  locale: LocalizedText;
  unlock: { type: "starter" } | { type: "reward"; activityId: string };
  compatibleZoneIds: readonly RanchPlacementZoneId[];
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

function originalAsset(
  runtimePath: string,
  thumbnailPath: string,
  alt: string,
  assetQa: AssetQa = qa,
  width = 1254,
  height = 1254,
): CatalogAsset {
  return {
    runtimePath,
    thumbnailPath,
    width,
    height,
    alt,
    provenance: {
      source: "original-production",
      prompt:
        "Original 2D storybook ranch art; warm Sonoran palette, tactile materials, clear silhouette, no text, logos, copied designs, or named-studio imitation.",
      referenceUse: "high-level-direction-only",
    },
    qa: { ...assetQa },
  };
}

function releaseCandidateQa(score: number): AssetQa {
  return {
    status: "approved",
    score,
    accessibilityReviewed: true,
    productApproved: false,
    culturalReview: "not-performed",
  };
}

export const characters: readonly CharacterDefinition[] = [
  {
    id: "essma",
    version: 1,
    kind: "playable-character",
    locale: {
      "es-MX": {
        name: "Essma",
        description: "Exploradora del rancho con rizos oscuros y moño azul.",
      },
    },
    anchors: {
      hair: { x: 627, y: 270 },
      outfit: { x: 627, y: 710 },
      shoes: { x: 627, y: 1085 },
      accessory: { x: 770, y: 285 },
    },
    asset: originalAsset(
      "/assets/characters/v1/essma-base.png",
      "/assets/characters/v1/thumbnails/essma-base.png",
      "Essma, exploradora del rancho",
      { ...qa, status: "approved", score: 88 },
    ),
  },
  {
    id: "juancito",
    version: 1,
    kind: "playable-character",
    locale: {
      "es-MX": {
        name: "Juancito",
        description: "Perrito de la pradera amigo de Essma.",
      },
    },
    anchors: {
      head: { x: 627, y: 388 },
      neck: { x: 627, y: 575 },
      body: { x: 627, y: 720 },
    },
    asset: originalAsset(
      "/assets/characters/v1/juancito-base.png",
      "/assets/characters/v1/thumbnails/juancito-base.png",
      "Juancito, perrito de la pradera",
      { ...qa, status: "approved", score: 89 },
    ),
  },
  {
    id: "tori",
    version: 1,
    kind: "playable-character",
    locale: {
      "es-MX": { name: "Tori", description: "Cacomixtle curioso del rancho." },
    },
    anchors: {
      head: { x: 627, y: 360 },
      neck: { x: 627, y: 560 },
      body: { x: 627, y: 735 },
    },
    asset: originalAsset(
      "/assets/characters/v1/tori-base.png",
      "/assets/characters/v1/thumbnails/tori-base.png",
      "Tori, cacomixtle",
      { ...qa, status: "approved", score: 92 },
    ),
  },
  {
    id: "anita",
    version: 1,
    kind: "playable-character",
    locale: {
      "es-MX": { name: "Anita", description: "Vaquita amable del rancho." },
    },
    anchors: {
      head: { x: 627, y: 390 },
      neck: { x: 627, y: 560 },
      body: { x: 627, y: 760 },
    },
    asset: originalAsset(
      "/assets/characters/v1/anita-base.png",
      "/assets/characters/v1/thumbnails/anita-base.png",
      "Anita, vaquita",
      { ...qa, status: "approved", score: 91 },
    ),
  },
] as const;

const defaultZIndexForSlot: Record<WearableSlot, number> = {
  shoes: 25,
  outfit: 30,
  body: 30,
  neck: 35,
  accessory: 35,
  hair: 40,
  head: 40,
};

function wearable(
  id: string,
  target: CharacterId,
  slot: WearableSlot,
  name: string,
  description: string,
  zIndex: number,
  score: number,
  assetVersion: 1 | 2 = 1,
  unlock: WearableDefinition["unlock"] = { type: "starter" },
): WearableDefinition {
  const character = characters.find((entry) => entry.id === target);
  const anchor = character?.anchors[slot];
  if (!anchor) throw new Error(`Missing ${slot} anchor for ${target}`);
  const slug = id.replace("wearable.", "");

  const resolvedZIndex =
    zIndex > 0
      ? slot === "hair" && zIndex < 20
        ? zIndex
        : defaultZIndexForSlot[slot] || zIndex
      : defaultZIndexForSlot[slot] || 30;

  return {
    id,
    version: assetVersion,
    kind: "wearable",
    target,
    slot,
    anchor,
    zIndex: resolvedZIndex,
    locale: { "es-MX": { name, description } },
    unlock,
    asset: originalAsset(
      `/assets/wearables/v${assetVersion}/${slug}.png`,
      `/assets/wearables/v${assetVersion}/thumbnails/${slug}.png`,
      `${name}, accesorio para ${character.locale["es-MX"].name}`,
      releaseCandidateQa(score),
    ),
  };
}

export const wearables: readonly WearableDefinition[] = [
  wearable(
    "wearable.essma.trenza-cobre",
    "essma",
    "hair",
    "Trenza cobriza",
    "Peinado para Essma.",
    10,
    91,
  ),
  wearable(
    "wearable.essma.vestido-girasol",
    "essma",
    "outfit",
    "Vestido girasol",
    "Vestido para Essma.",
    30,
    94,
  ),
  wearable(
    "wearable.essma.botitas-camino",
    "essma",
    "shoes",
    "Botitas de camino",
    "Botitas para Essma.",
    40,
    91,
  ),
  wearable(
    "wearable.essma.diademita-flor",
    "essma",
    "accessory",
    "Diademita de flor",
    "Diademita para Essma.",
    50,
    87,
  ),
  wearable(
    "wearable.juancito.gorrito-aventurero",
    "juancito",
    "head",
    "Gorrito aventurero",
    "Gorrito para Juancito.",
    30,
    89,
  ),
  wearable(
    "wearable.juancito.chaleco-bolsitas",
    "juancito",
    "body",
    "Chaleco con bolsitas",
    "Chaleco para Juancito.",
    20,
    92,
  ),
  wearable(
    "wearable.tori.panuelo-azul",
    "tori",
    "neck",
    "Pañuelo azul",
    "Pañuelo para Tori.",
    30,
    93,
  ),
  wearable(
    "wearable.tori.gorrito-hojita",
    "tori",
    "head",
    "Gorrito de hojita",
    "Gorrito para Tori.",
    40,
    92,
  ),
  wearable(
    "wearable.anita.chaleco-margarita",
    "anita",
    "body",
    "Chaleco margarita",
    "Chaleco para Anita.",
    20,
    94,
  ),
  wearable(
    "wearable.anita.panuelo-rosa",
    "anita",
    "neck",
    "Pañuelo rosa",
    "Pañuelo para Anita.",
    30,
    92,
  ),
  wearable(
    "wearable.essma.sombrero-viajero",
    "essma",
    "hair",
    "Sombrero viajero",
    "Sombrero ligero para Essma.",
    60,
    90,
    2,
  ),
  wearable(
    "wearable.essma.conjunto-florido",
    "essma",
    "outfit",
    "Conjunto florido",
    "Blusa y falda para explorar.",
    30,
    92,
    2,
  ),
  wearable(
    "wearable.essma.botitas-cobalto",
    "essma",
    "shoes",
    "Botitas azules",
    "Botitas suaves para caminar.",
    40,
    89,
    2,
  ),
  wearable(
    "wearable.essma.bolsita-tejida",
    "essma",
    "accessory",
    "Bolsita tejida",
    "Bolsita para guardar tesoros.",
    50,
    91,
    2,
  ),
  wearable(
    "wearable.essma.monno-azul",
    "essma",
    "hair",
    "Moño azul",
    "El moño azul clásico de Essma.",
    60,
    95,
    2,
  ),
  wearable(
    "wearable.essma.corona-flores",
    "essma",
    "hair",
    "Corona de flores",
    "Corona con flores silvestres del desierto.",
    60,
    92,
    2,
  ),
  wearable(
    "wearable.essma.gorrito-campesino",
    "essma",
    "hair",
    "Gorrito de sol",
    "Gorrito de paja para proteger del sol.",
    60,
    91,
    2,
  ),
  wearable(
    "wearable.essma.tunica-clasica",
    "essma",
    "outfit",
    "Túnica clásica",
    "Túnica bordada y faldita azul de Essma.",
    30,
    96,
    2,
  ),
  wearable(
    "wearable.essma.overol-mezclilla",
    "essma",
    "outfit",
    "Overol de mezclilla",
    "Overol cómodo con camiseta amarilla.",
    30,
    93,
    2,
  ),
  wearable(
    "wearable.essma.vestido-festivo",
    "essma",
    "outfit",
    "Vestido festivo",
    "Vestido de cempasúchil con holanes.",
    30,
    94,
    2,
  ),
  wearable(
    "wearable.essma.huaraches-piel",
    "essma",
    "shoes",
    "Huarachitos de piel",
    "Huaraches artesanales de piel suave.",
    40,
    91,
    2,
  ),
  wearable(
    "wearable.essma.tenis-sol",
    "essma",
    "shoes",
    "Tenis amarillos",
    "Tenis de tela muy cómodos para correr.",
    40,
    92,
    2,
  ),
  wearable(
    "wearable.essma.zapatitos-rojos",
    "essma",
    "shoes",
    "Zapatitos rojos",
    "Zapatitos de vestir con hebilla dorada.",
    40,
    93,
    2,
  ),
  wearable(
    "wearable.essma.panuelo-cobalto",
    "essma",
    "accessory",
    "Pañuelo azul",
    "Pañuelo suave para el cuello.",
    50,
    90,
    2,
  ),
  wearable(
    "wearable.essma.canastita-flores",
    "essma",
    "accessory",
    "Canastita de flores",
    "Canastita tejida llena de florecitas.",
    50,
    92,
    2,
  ),
  wearable(
    "wearable.essma.pulserita-cuentas",
    "essma",
    "accessory",
    "Pulserita de cuentas",
    "Pulserita de colores brillantes.",
    50,
    91,
    2,
  ),
  wearable(
    "wearable.juancito.panuelo-verde",
    "juancito",
    "neck",
    "Pañuelo verde",
    "Pañuelo alegre para Juancito.",
    30,
    90,
    2,
  ),
  wearable(
    "wearable.juancito.poncho-cobalto",
    "juancito",
    "body",
    "Poncho azul",
    "Poncho para explorar el rancho.",
    40,
    88,
    2,
  ),
  wearable(
    "wearable.tori.chaleco-camino",
    "tori",
    "body",
    "Chaleco de camino",
    "Chaleco naranja para Tori.",
    20,
    91,
    2,
  ),
  wearable(
    "wearable.tori.panuelo-coral",
    "tori",
    "neck",
    "Pañuelo coral",
    "Pañuelo color coral para Tori.",
    30,
    89,
    2,
  ),
  wearable(
    "wearable.anita.corona-flores",
    "anita",
    "head",
    "Corona de flores",
    "Flores para Anita.",
    30,
    90,
    2,
  ),
  wearable(
    "wearable.anita.chaleco-cielo",
    "anita",
    "body",
    "Chaleco cielo",
    "Chaleco azul suave para Anita.",
    20,
    92,
    2,
  ),
  // JUANCITO WEARABLES
  wearable(
    "wearable.juancito.sombrerito-palma",
    "juancito",
    "head",
    "Sombrerito de palma",
    "Sombrerito fresco para Juancito.",
    30,
    92,
    2,
  ),
  wearable(
    "wearable.juancito.casquito-explorador",
    "juancito",
    "head",
    "Casquito explorador",
    "Casquito de explorador del desierto.",
    30,
    91,
    2,
  ),
  wearable(
    "wearable.juancito.corona-cactus",
    "juancito",
    "head",
    "Corona de cactus",
    "Corona con flor de pitaya.",
    30,
    93,
    2,
  ),
  wearable(
    "wearable.juancito.gorrito-noche",
    "juancito",
    "head",
    "Gorrito de descanso",
    "Gorrito suave de noche.",
    30,
    90,
    2,
  ),
  wearable(
    "wearable.juancito.panuelo-rojo",
    "juancito",
    "neck",
    "Pañuelo rojo",
    "Pañuelo rojo brillante para el cuello.",
    30,
    91,
    2,
  ),
  wearable(
    "wearable.juancito.collar-semillas",
    "juancito",
    "neck",
    "Collar de semillas",
    "Collar artesanal de semillas.",
    30,
    90,
    2,
  ),
  wearable(
    "wearable.juancito.mono-mariposa",
    "juancito",
    "neck",
    "Moñito mariposa",
    "Moño elegante amarillo.",
    30,
    92,
    2,
  ),
  wearable(
    "wearable.juancito.bufandita-tejida",
    "juancito",
    "neck",
    "Bufandita azul",
    "Bufanda abrigadora tejida.",
    30,
    91,
    2,
  ),
  wearable(
    "wearable.juancito.sarape-sonora",
    "juancito",
    "body",
    "Sarape de Sonora",
    "Sarape tradicional colorido.",
    20,
    95,
    2,
  ),
  wearable(
    "wearable.juancito.chaleco-cuero",
    "juancito",
    "body",
    "Chaleco de cuero",
    "Chaleco resistente de piel.",
    20,
    93,
    2,
  ),
  wearable(
    "wearable.juancito.overolcito-trabajo",
    "juancito",
    "body",
    "Overolcito de trabajo",
    "Mini overol de mezclilla.",
    20,
    94,
    2,
  ),
  // TORI WEARABLES
  wearable(
    "wearable.tori.sombrero-pluma",
    "tori",
    "head",
    "Sombrero con pluma",
    "Sombrero elegante para Tori.",
    40,
    93,
    2,
  ),
  wearable(
    "wearable.tori.diadema-estrellita",
    "tori",
    "head",
    "Diadema de estrella",
    "Diadema brillante dorada.",
    40,
    91,
    2,
  ),
  wearable(
    "wearable.tori.gorrito-tejido",
    "tori",
    "head",
    "Gorrito tejido",
    "Gorrito abrigador naranja.",
    40,
    90,
    2,
  ),
  wearable(
    "wearable.tori.viserita-sol",
    "tori",
    "head",
    "Viserita de sol",
    "Visera ligera amarilla.",
    40,
    92,
    2,
  ),
  wearable(
    "wearable.tori.collar-flores",
    "tori",
    "neck",
    "Collar de flores",
    "Guirnalda de flores tropicales.",
    30,
    94,
    2,
  ),
  wearable(
    "wearable.tori.panuelo-amarillo",
    "tori",
    "neck",
    "Pañuelo amarillo",
    "Pañuelo alegre de sol.",
    30,
    90,
    2,
  ),
  wearable(
    "wearable.tori.gargantilla-cuentas",
    "tori",
    "neck",
    "Gargantilla azul",
    "Gargantilla de cuentas turquesa.",
    30,
    91,
    2,
  ),
  wearable(
    "wearable.tori.ponchito-rayas",
    "tori",
    "body",
    "Ponchito a rayas",
    "Poncho colorido de lana.",
    20,
    95,
    2,
  ),
  wearable(
    "wearable.tori.chaleco-denim",
    "tori",
    "body",
    "Chaleco de mezclilla",
    "Chaleco moderno de mezclilla.",
    20,
    92,
    2,
  ),
  wearable(
    "wearable.tori.capita-bosque",
    "tori",
    "body",
    "Capita de bosque",
    "Capita verde para explorar.",
    20,
    93,
    2,
  ),
  wearable(
    "wearable.tori.tunicas-flores",
    "tori",
    "body",
    "Túnica floreada",
    "Túnica fresca con estampados.",
    20,
    94,
    2,
  ),
  // ANITA WEARABLES
  wearable(
    "wearable.anita.sombrero-vaquero",
    "anita",
    "head",
    "Sombrero vaquero",
    "Sombrero de vaquerita para Anita.",
    30,
    95,
    2,
  ),
  wearable(
    "wearable.anita.mono-rosa",
    "anita",
    "head",
    "Moño rosa",
    "Moño coqueto para la oreja.",
    30,
    92,
    2,
  ),
  wearable(
    "wearable.anita.gorrito-campana",
    "anita",
    "head",
    "Gorrito campana",
    "Gorrito de encaje suave.",
    30,
    90,
    2,
  ),
  wearable(
    "wearable.anita.diadema-girasol",
    "anita",
    "head",
    "Diadema girasol",
    "Diadema con girasol desértico.",
    30,
    93,
    2,
  ),
  wearable(
    "wearable.anita.campanilla-dorada",
    "anita",
    "neck",
    "Campanilla dorada",
    "Campanilla de bronce suave.",
    30,
    94,
    2,
  ),
  wearable(
    "wearable.anita.panuelo-marigold",
    "anita",
    "neck",
    "Pañuelo cempasúchil",
    "Pañuelo color marigold.",
    30,
    91,
    2,
  ),
  wearable(
    "wearable.anita.collar-corazon",
    "anita",
    "neck",
    "Collar de corazón",
    "Collar con dije de corazón rosa.",
    30,
    92,
    2,
  ),
  wearable(
    "wearable.anita.panuelo-verde",
    "anita",
    "neck",
    "Pañuelo pradera",
    "Pañuelo verde prado.",
    30,
    90,
    2,
  ),
  wearable(
    "wearable.anita.mantita-tejida",
    "anita",
    "body",
    "Mantita tejida",
    "Mantita abrigadora para la espalda.",
    20,
    95,
    2,
  ),
  wearable(
    "wearable.anita.overol-granja",
    "anita",
    "body",
    "Overol granjero",
    "Overol de trabajo de la granja.",
    20,
    93,
    2,
  ),
  wearable(
    "wearable.anita.falda-floreada",
    "anita",
    "body",
    "Faldita floreada",
    "Faldita rosa con florecitas.",
    20,
    94,
    2,
  ),
  wearable(
    "wearable.essma.sombrero-jardinero",
    "essma",
    "hair",
    "Sombrero jardinero",
    "Sombrero para cuidar el jardín.",
    60,
    91,
    2,
    { type: "reward", activityId: "cuida-el-jardin" },
  ),
] as const;

export const worldRegions: readonly WorldRegionDefinition[] = [
  {
    id: "region.rancho",
    version: 1,
    kind: "world-region",
    availability: "open",
    locale: {
      "es-MX": {
        name: "Rancho",
        description: "El hogar de Essma y sus amigos.",
      },
    },
    mapPosition: { x: 0.48, y: 0.61 },
    asset: originalAsset(
      "/assets/world/v2/sonora-world-map-landscape-v2.png",
      "/assets/world/v2/sonora-world-map-portrait-v2.png",
      "Rancho de Essma en el mapa",
      releaseCandidateQa(91),
      1672,
      941,
    ),
  },
  {
    id: "region.desierto",
    version: 1,
    kind: "world-region",
    availability: "locked",
    locale: {
      "es-MX": {
        name: "Desierto",
        description: "Una aventura entre saguaros. Pronto.",
      },
    },
    mapPosition: { x: 0.2, y: 0.46 },
    asset: originalAsset(
      "/assets/world/v2/sonora-world-map-landscape-v2.png",
      "/assets/world/v2/sonora-world-map-portrait-v2.png",
      "Desierto con saguaros en el mapa",
      releaseCandidateQa(89),
      1672,
      941,
    ),
  },
  {
    id: "region.pueblo",
    version: 1,
    kind: "world-region",
    availability: "locked",
    locale: {
      "es-MX": {
        name: "Pueblo",
        description: "Un pueblo lleno de color. Pronto.",
      },
    },
    mapPosition: { x: 0.72, y: 0.29 },
    asset: originalAsset(
      "/assets/world/v2/sonora-world-map-landscape-v2.png",
      "/assets/world/v2/sonora-world-map-portrait-v2.png",
      "Pueblo de colores en el mapa",
      releaseCandidateQa(90),
      1672,
      941,
    ),
  },
  {
    id: "region.bosque",
    version: 1,
    kind: "world-region",
    availability: "locked",
    locale: {
      "es-MX": {
        name: "Bosque",
        description: "Un bosque de mezquites. Pronto.",
      },
    },
    mapPosition: { x: 0.79, y: 0.61 },
    asset: originalAsset(
      "/assets/world/v2/sonora-world-map-landscape-v2.png",
      "/assets/world/v2/sonora-world-map-portrait-v2.png",
      "Bosque de mezquites en el mapa",
      releaseCandidateQa(90),
      1672,
      941,
    ),
  },
  {
    id: "region.oasis",
    version: 1,
    kind: "world-region",
    availability: "locked",
    locale: {
      "es-MX": {
        name: "Oasis",
        description: "Agüita fresca para una aventura. Pronto.",
      },
    },
    mapPosition: { x: 0.28, y: 0.76 },
    asset: originalAsset(
      "/assets/world/v2/sonora-world-map-landscape-v2.png",
      "/assets/world/v2/sonora-world-map-portrait-v2.png",
      "Oasis en el mapa",
      releaseCandidateQa(88),
      1672,
      941,
    ),
  },
  {
    id: "region.valle-de-flores",
    version: 1,
    kind: "world-region",
    availability: "locked",
    locale: {
      "es-MX": {
        name: "Valle de flores",
        description: "Un valle que florece. Pronto.",
      },
    },
    mapPosition: { x: 0.63, y: 0.82 },
    asset: originalAsset(
      "/assets/world/v2/sonora-world-map-landscape-v2.png",
      "/assets/world/v2/sonora-world-map-portrait-v2.png",
      "Valle de flores en el mapa",
      releaseCandidateQa(92),
      1672,
      941,
    ),
  },
] as const;

export const ranchPlacementZones: readonly RanchPlacementZone[] = [
  {
    id: "patio.puerta",
    version: 1,
    kind: "ranch-placement-zone",
    locale: {
      "es-MX": {
        name: "Junto a la puerta",
        description: "Un rinconcito frente a la casa.",
      },
    },
    anchor: { x: 0.2, y: 0.6 },
    footprint: { width: 0.14, height: 0.16 },
  },
  {
    id: "patio.mesquite",
    version: 1,
    kind: "ranch-placement-zone",
    locale: {
      "es-MX": {
        name: "Bajo el mezquite",
        description: "Un lugar fresco bajo el árbol.",
      },
    },
    anchor: { x: 0.35, y: 0.61 },
    footprint: { width: 0.16, height: 0.17 },
  },
  {
    id: "patio.corral",
    version: 1,
    kind: "ranch-placement-zone",
    locale: {
      "es-MX": {
        name: "Cerca del corral",
        description: "Un espacio junto a los amigos del rancho.",
      },
    },
    anchor: { x: 0.68, y: 0.61 },
    footprint: { width: 0.15, height: 0.15 },
  },
  {
    id: "patio.macetas",
    version: 1,
    kind: "ranch-placement-zone",
    locale: {
      "es-MX": {
        name: "Rincón de macetas",
        description: "Un lugar soleado para plantas.",
      },
    },
    anchor: { x: 0.85, y: 0.65 },
    footprint: { width: 0.13, height: 0.16 },
  },
  {
    id: "patio.fogata",
    version: 1,
    kind: "ranch-placement-zone",
    locale: {
      "es-MX": {
        name: "Patio de fogata",
        description: "Un espacio para reunirse al atardecer.",
      },
    },
    anchor: { x: 0.53, y: 0.72 },
    footprint: { width: 0.17, height: 0.14 },
  },
  {
    id: "patio.flores",
    version: 1,
    kind: "ranch-placement-zone",
    locale: {
      "es-MX": {
        name: "Jardín de flores",
        description: "Un rincón lleno de flores.",
      },
    },
    anchor: { x: 0.08, y: 0.68 },
    footprint: { width: 0.14, height: 0.14 },
  },
] as const;

function defineRanchDecor(
  id: string,
  name: string,
  description: string,
  compatibleZoneIds: readonly RanchPlacementZoneId[],
  score: number,
  unlock: RanchDecorDefinition["unlock"] = { type: "starter" },
): RanchDecorDefinition {
  const slug = id.replace("decor.rancho.", "");
  return {
    id,
    version: 1,
    kind: "ranch-decor",
    locale: { "es-MX": { name, description } },
    unlock,
    compatibleZoneIds,
    asset: originalAsset(
      `/assets/decor/v1/${slug}.png`,
      `/assets/decor/v1/thumbnails/${slug}.png`,
      `${name}, decoración para el patio`,
      releaseCandidateQa(score),
      768,
      768,
    ),
  };
}

export const ranchDecor: readonly RanchDecorDefinition[] = [
  defineRanchDecor(
    "decor.rancho.mesa-picnic",
    "Mesa de picnic",
    "Mesa de madera para compartir.",
    ["patio.mesquite", "patio.fogata"],
    91,
  ),
  defineRanchDecor(
    "decor.rancho.sillas-coloridas",
    "Sillas coloridas",
    "Dos sillas para platicar.",
    ["patio.puerta", "patio.mesquite", "patio.fogata"],
    89,
  ),
  defineRanchDecor(
    "decor.rancho.macetas-talavera",
    "Macetas de barro",
    "Macetas con flores alegres.",
    ["patio.puerta", "patio.macetas", "patio.flores"],
    92,
  ),
  defineRanchDecor(
    "decor.rancho.tapete-tejido",
    "Tapete tejido",
    "Tapete suave para el patio.",
    ["patio.puerta", "patio.fogata"],
    90,
  ),
  defineRanchDecor(
    "decor.rancho.fogata-amigable",
    "Fogata amigable",
    "Fogata apagada y segura para imaginar.",
    ["patio.fogata"],
    90,
  ),
  defineRanchDecor(
    "decor.rancho.bebedero-pajaros",
    "Bebedero de pajaritos",
    "Un platito de agua para las aves.",
    ["patio.mesquite", "patio.flores"],
    89,
  ),
  defineRanchDecor(
    "decor.rancho.cajon-cosecha",
    "Cajón de cosecha",
    "Cajón con verduras del huerto.",
    ["patio.corral", "patio.puerta"],
    88,
  ),
  defineRanchDecor(
    "decor.rancho.farol-papel",
    "Farol de papel",
    "Farol cálido para el patio.",
    ["patio.puerta", "patio.mesquite", "patio.fogata"],
    91,
  ),
  defineRanchDecor(
    "decor.rancho.molinillo-viento",
    "Molinillo de viento",
    "Molinillo que baila con la brisa.",
    ["patio.macetas", "patio.flores"],
    89,
  ),
  defineRanchDecor(
    "decor.rancho.banca-mesquite",
    "Banca de mezquite",
    "Banca para descansar y mirar el rancho.",
    ["patio.mesquite", "patio.corral", "patio.fogata"],
    92,
  ),
  defineRanchDecor(
    "decor.rancho.maceta-girasol",
    "Maceta de girasoles",
    "Maceta del jardín con girasoles sonrientes.",
    ["patio.puerta", "patio.macetas", "patio.flores"],
    92,
    { type: "reward", activityId: "cuida-el-jardin" },
  ),
] as const;

export const cameos: readonly CameoDefinition[] = [
  {
    id: "loro",
    version: 1,
    kind: "non-interactive-cameo",
    locale: {
      "es-MX": {
        name: "Loro Loco",
        description: "Un loro alegre que pronto visitará el rancho.",
      },
    },
    asset: originalAsset(
      "/assets/cameos/v1/loro-loco.png",
      "/assets/cameos/v1/thumbnails/loro-loco.png",
      "Retrato de Loro Loco",
      { ...qa, status: "approved", score: 88 },
    ),
  },
  {
    id: "oso",
    version: 1,
    kind: "non-interactive-cameo",
    locale: {
      "es-MX": {
        name: "Oso Taquito",
        description: "Un osito amable que pronto visitará el rancho.",
      },
    },
    asset: originalAsset(
      "/assets/cameos/v1/oso-taquito.png",
      "/assets/cameos/v1/thumbnails/oso-taquito.png",
      "Retrato de Oso Taquito",
      { ...qa, status: "approved", score: 88 },
    ),
  },
  {
    id: "capybara",
    version: 1,
    kind: "non-interactive-cameo",
    locale: {
      "es-MX": {
        name: "Capybara",
        description: "Una capibara tranquila que pronto visitará el rancho.",
      },
    },
    asset: originalAsset(
      "/assets/cameos/v1/capybara.png",
      "/assets/cameos/v1/thumbnails/capybara.png",
      "Retrato de Capybara",
      { ...qa, status: "approved", score: 88 },
    ),
  },
] as const;

export const starterWearableIds = wearables
  .filter((item) => item.unlock.type === "starter")
  .map((item) => item.id);
export const starterRanchDecorIds = ranchDecor
  .filter((item) => item.unlock.type === "starter")
  .map((item) => item.id);
export const starterRegionIds: readonly WorldRegionId[] = ["region.rancho"];

/**
 * A friendly, fully dressed starting point for every friend.  These IDs are
 * catalog data rather than player data: a profile only records choices that
 * differ from (or reaffirm) these defaults.
 */
export const DEFAULT_LOOKS: Readonly<
  Record<CharacterId, Readonly<Partial<Record<WearableSlot, string>>>>
> = Object.freeze({
  essma: Object.freeze({
    outfit: "wearable.essma.vestido-girasol",
    shoes: "wearable.essma.botitas-camino",
    accessory: "wearable.essma.diademita-flor",
  }),
  juancito: Object.freeze({
    head: "wearable.juancito.gorrito-aventurero",
    body: "wearable.juancito.chaleco-bolsitas",
  }),
  tori: Object.freeze({
    head: "wearable.tori.gorrito-hojita",
    neck: "wearable.tori.panuelo-azul",
  }),
  anita: Object.freeze({
    body: "wearable.anita.chaleco-margarita",
    neck: "wearable.anita.panuelo-rosa",
  }),
});

export function defaultLookFor(
  characterId: CharacterId,
): Partial<Record<WearableSlot, string>> {
  return { ...DEFAULT_LOOKS[characterId] };
}

export function isCharacterId(value: unknown): value is CharacterId {
  return (
    typeof value === "string" &&
    (CHARACTER_IDS as readonly string[]).includes(value)
  );
}

export function getWearable(id: string): WearableDefinition | undefined {
  return wearables.find((item) => item.id === id);
}

export function getWorldRegion(id: unknown): WorldRegionDefinition | undefined {
  return typeof id === "string"
    ? worldRegions.find((region) => region.id === id)
    : undefined;
}

export function getRanchDecor(id: unknown): RanchDecorDefinition | undefined {
  return typeof id === "string"
    ? ranchDecor.find((decor) => decor.id === id)
    : undefined;
}

export function getRanchPlacementZone(
  id: unknown,
): RanchPlacementZone | undefined {
  return typeof id === "string"
    ? ranchPlacementZones.find((zone) => zone.id === id)
    : undefined;
}

export function isCompatibleRanchPlacement(
  decorId: unknown,
  zoneId: unknown,
): boolean {
  const decor = getRanchDecor(decorId);
  const zone = getRanchPlacementZone(zoneId);
  return !!decor && !!zone && decor.compatibleZoneIds.includes(zone.id);
}

export function isCompatibleWearable(
  characterId: CharacterId,
  slot: WearableSlot,
  itemId: unknown,
): itemId is string {
  if (typeof itemId !== "string") return false;
  const item = getWearable(itemId);
  return item?.target === characterId && item.slot === slot;
}
