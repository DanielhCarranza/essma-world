import type { ComponentType } from "react";
import type { MiniGameContext } from "../mini-game";

export const DESTINATION_IDS = ["essma-bros", "essma-kart"] as const;
export type DestinationId = (typeof DESTINATION_IDS)[number];

/** v1 destinations grant no hub unlocks. Host still validates through applyMiniGameResult. */
export const DESTINATION_REWARD_IDS: readonly string[] = [];

export type DestinationAppProps = {
  onExit: () => void;
  onUnsupported?: () => void;
  context: MiniGameContext;
};

export type DestinationDefinition = Readonly<{
  id: DestinationId;
  catalogId: string;
  locale: { "es-MX": { name: string; description: string } };
  coverPath: string;
  load: () => Promise<{ default: ComponentType<DestinationAppProps> }>;
}>;

export const destinations: readonly DestinationDefinition[] = [
  {
    id: "essma-bros",
    catalogId: "destination.essma-bros",
    locale: {
      "es-MX": {
        name: "Essma Bros",
        description: "Una aventura en el desierto.",
      },
    },
    coverPath: "/assets/destinations/essma-bros/v1/cover.png",
    load: () =>
      import("../destinations/essma-bros").then((mod) => ({
        default: mod.EssmaBrosApp as ComponentType<DestinationAppProps>,
      })),
  },
  {
    id: "essma-kart",
    catalogId: "destination.essma-kart",
    locale: {
      "es-MX": {
        name: "Essma Kart",
        description: "Una carrera con amigas.",
      },
    },
    coverPath: "/assets/destinations/essma-kart/v1/cover.jpg",
    load: () =>
      import("../destinations/essma-kart").then((mod) => ({
        default: mod.EssmaKartApp as ComponentType<DestinationAppProps>,
      })),
  },
];

export function getDestination(id: DestinationId): DestinationDefinition {
  const found = destinations.find((entry) => entry.id === id);
  if (!found) throw new Error(`Unknown destination ${id}`);
  return found;
}
