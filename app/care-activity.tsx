"use client";

import { useState } from "react";
import type { CharacterId } from "./lib/game-catalog";
import type { MiniGameContext, MiniGameResult } from "./mini-game";

export const CARE_REWARD_IDS = [
  "wearable.juancito.gorrito-semillas",
  "decor.rancho.maceta-corazon",
] as const;

export type CareActivityProps = {
  context: MiniGameContext;
  onFinish: (result: MiniGameResult) => void;
};

type CareFriend = {
  id: CharacterId;
  name: string;
  action: string;
  icon: string;
  careCount: number;
};

const INITIAL_FRIENDS: readonly CareFriend[] = [
  {
    id: "juancito",
    name: "Juancito",
    action: "Dar semillas",
    icon: "🌾",
    careCount: 0,
  },
  {
    id: "anita",
    name: "Anita",
    action: "Regar flores",
    icon: "💧",
    careCount: 0,
  },
  {
    id: "tori",
    name: "Tori",
    action: "Peinar cola",
    icon: "✨",
    careCount: 0,
  },
];

function friendStage(careCount: number): "needs" | "happy" {
  return careCount >= 2 ? "happy" : "needs";
}

export function CareActivity({ context, onFinish }: CareActivityProps) {
  const [friends, setFriends] = useState<readonly CareFriend[]>(INITIAL_FRIENDS);
  const [completed, setCompleted] = useState(false);
  const reducedMotion = context.settings.reducedMotion;

  const allHappy = friends.every((friend) => friendStage(friend.careCount) === "happy");

  function careForFriend(friendId: CharacterId) {
    if (completed) return;
    setFriends((current) =>
      current.map((friend) => {
        if (friend.id !== friendId || friend.careCount >= 2) return friend;
        return { ...friend, careCount: friend.careCount + 1 };
      }),
    );
  }

  function handleComplete() {
    setCompleted(true);
    const unearned =
      CARE_REWARD_IDS.find((id) => !context.player.unlockedIds.includes(id)) ??
      CARE_REWARD_IDS[0];

    onFinish({
      status: "completed",
      rewards: [{ type: "unlock", catalogId: unearned }],
    });
  }

  return (
    <div
      className="care-activity-overlay"
      role="dialog"
      aria-label="Cuidar amigos"
    >
      <div className="care-card">
        <header className="care-header">
          <div className="care-title">
            <span aria-hidden="true">💛</span>
            <h2>Cuidar amigos</h2>
          </div>
          <button
            type="button"
            className="care-close-button"
            onClick={() => onFinish({ status: "cancelled" })}
            aria-label="Volver al rancho"
          >
            ×
          </button>
        </header>

        <p className="care-instruction">
          {allHappy
            ? "¡Gracias por cuidar a tus amigos!"
            : "Toca a cada amigo para cuidarlo"}
        </p>

        <div className="care-friends">
          {friends.map((friend) => {
            const stage = friendStage(friend.careCount);
            const motionClass =
              !reducedMotion && friend.careCount === 1 ? " is-caring" : "";
            return (
              <button
                key={friend.id}
                type="button"
                className={`care-friend stage-${stage}${motionClass}`}
                onClick={() => careForFriend(friend.id)}
                disabled={stage === "happy"}
                aria-label={`${friend.name}: ${
                  stage === "happy"
                    ? "Contento y feliz"
                    : `${friend.action}, toque ${friend.careCount + 1} de 2`
                }`}
              >
                <span className="care-friend-icon" aria-hidden="true">
                  {stage === "happy" ? "😊" : friend.icon}
                </span>
                <span className="care-friend-name">{friend.name}</span>
                <span className="care-friend-action">
                  {stage === "happy" ? "¡Feliz!" : friend.action}
                </span>
              </button>
            );
          })}
        </div>

        {allHappy && !completed && (
          <div className="care-complete-moment">
            <p className="care-thanks" aria-live="polite">
              ¡Gracias!
            </p>
            <button
              type="button"
              className="claim-reward-button"
              onClick={handleComplete}
            >
              🎁 Recoger regalo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
