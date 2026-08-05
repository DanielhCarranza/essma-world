"use client";

import { useState } from "react";
import type { MiniGameContext, MiniGameResult } from "./mini-game";

export const GARDEN_REWARD_IDS = [
  "decor.rancho.maceta-girasol",
  "wearable.essma.sombrero-jardinero",
] as const;

export type GardenActivityProps = {
  context: MiniGameContext;
  onFinish: (result: MiniGameResult) => void;
};

type GardenSpot = {
  id: string;
  name: string;
  stage: "seed" | "sprout" | "bloom";
  flowerName: string;
  icon: string;
};

const INITIAL_SPOTS: readonly GardenSpot[] = [
  {
    id: "spot-girasol",
    name: "Girasol del rancho",
    stage: "seed",
    flowerName: "Girasol",
    icon: "🌻",
  },
  {
    id: "spot-dalia",
    name: "Flor del sol",
    stage: "seed",
    flowerName: "Dalia",
    icon: "🌸",
  },
  {
    id: "spot-cacto",
    name: "Flor de cacto",
    stage: "seed",
    flowerName: "Biznaga",
    icon: "🌺",
  },
];

export function GardenActivity({ context, onFinish }: GardenActivityProps) {
  const [spots, setSpots] = useState<readonly GardenSpot[]>(INITIAL_SPOTS);
  const [activeTool, setActiveTool] = useState<"water" | "sun">("water");
  const [completed, setCompleted] = useState(false);

  const bloomsCount = spots.filter((s) => s.stage === "bloom").length;
  const isAllBloomed = bloomsCount === spots.length;

  function careForSpot(spotId: string) {
    if (completed) return;
    setSpots((current) =>
      current.map((spot) => {
        if (spot.id !== spotId) return spot;
        if (spot.stage === "seed") return { ...spot, stage: "sprout" };
        if (spot.stage === "sprout") return { ...spot, stage: "bloom" };
        return spot;
      }),
    );
  }

  function handleComplete() {
    setCompleted(true);
    // Determine reward: pick an unearned reward if possible, else first reward
    const unearned = GARDEN_REWARD_IDS.find(
      (id) => !context.player.unlockedIds.includes(id),
    ) ?? GARDEN_REWARD_IDS[0];

    onFinish({
      status: "completed",
      rewards: [{ type: "unlock", catalogId: unearned }],
    });
  }

  return (
    <div
      className="garden-activity-overlay"
      role="dialog"
      aria-label="Cuida el jardín"
    >
      <div className="garden-card">
        <header className="garden-header">
          <div className="garden-title">
            <span aria-hidden="true">🌱</span>
            <h2>Cuida el jardín</h2>
          </div>
          <button
            type="button"
            className="garden-close-button"
            onClick={() => onFinish({ status: "cancelled" })}
            aria-label="Volver al rancho"
          >
            ×
          </button>
        </header>

        <p className="garden-instruction">
          {isAllBloomed
            ? "¡Qué bonito floreció el jardín! 🌻"
            : "Toca las plantas para regar y darles sol"}
        </p>

        <div className="garden-tools">
          <button
            type="button"
            className={`tool-chip ${activeTool === "water" ? "is-selected" : ""}`}
            onClick={() => setActiveTool("water")}
            aria-label="Agua para las plantas"
          >
            💧 Agua
          </button>
          <button
            type="button"
            className={`tool-chip ${activeTool === "sun" ? "is-selected" : ""}`}
            onClick={() => setActiveTool("sun")}
            aria-label="Sol para las plantas"
          >
            ☀️ Sol
          </button>
        </div>

        <div className="garden-bed">
          {spots.map((spot) => (
            <button
              key={spot.id}
              type="button"
              className={`garden-spot stage-${spot.stage}`}
              onClick={() => careForSpot(spot.id)}
              aria-label={`${spot.name}: ${
                spot.stage === "seed"
                  ? "Semilla lista para cuidar"
                  : spot.stage === "sprout"
                    ? "Brote creciendo"
                    : "Flor abierta"
              }`}
            >
              <span className="spot-icon" aria-hidden="true">
                {spot.stage === "seed"
                  ? "🌱"
                  : spot.stage === "sprout"
                    ? "🌿"
                    : spot.icon}
              </span>
              <span className="spot-label">
                {spot.stage === "bloom" ? spot.flowerName : "Cuidar"}
              </span>
            </button>
          ))}
        </div>

        {isAllBloomed && !completed && (
          <div className="garden-complete-moment">
            <button
              type="button"
              className="claim-reward-button"
              onClick={handleComplete}
            >
              🎁 Recoger regalo del jardín
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
