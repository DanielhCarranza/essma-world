"use client";

import { useEffect, useRef } from "react";

export type RanchCharacterId = "essma" | "juancito" | "tori" | "anita";

export type RanchEvent =
  | { type: "choose-character"; character: RanchCharacterId }
  | { type: "show-story"; story: "map" | "flowers" | "cameo" };

type RanchSceneProps = {
  onEvent: (event: RanchEvent) => void;
  reducedMotion: boolean;
  selectedCharacter: RanchCharacterId;
};

const friends: Array<{ id: RanchCharacterId; name: string; subtitle: string; color: number; x: number; y: number }> = [
  { id: "essma", name: "Essma", subtitle: "Vestir", color: 0xef8d46, x: 270, y: 545 },
  { id: "juancito", name: "Juancito", subtitle: "Vestir", color: 0x98a84a, x: 505, y: 565 },
  { id: "tori", name: "Tori", subtitle: "Vestir", color: 0x5c8ba8, x: 740, y: 545 },
  { id: "anita", name: "Anita", subtitle: "Vestir", color: 0xd87787, x: 970, y: 565 },
];

export default function RanchScene({ onEvent, reducedMotion, selectedCharacter }: RanchSceneProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const eventRef = useRef(onEvent);

  useEffect(() => {
    eventRef.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let game: { destroy: (removeCanvas: boolean) => void } | undefined;
    let cancelled = false;

    void import("phaser").then((module) => {
      if (cancelled) return;
      const Phaser = module.default;

      class RanchoScene extends Phaser.Scene {
        preload() {
          this.load.image("rancho", "/assets/rancho-de-essma-v1.png");
        }

        create() {
          const background = this.add.image(640, 360, "rancho");
          background.setDisplaySize(1280, 720);

          this.add.rectangle(640, 360, 1280, 720, 0x1e1710, 0.12);
          this.add.rectangle(310, 115, 440, 104, 0x75412b, 0.92).setStrokeStyle(4, 0xa96032);
          this.add.text(110, 82, "UN DÍA BONITO EN EL", { fontFamily: "Arial", fontSize: "19px", fontStyle: "bold", color: "#fff7e7" });
          this.add.text(110, 108, "Rancho de Essma", { fontFamily: "Arial", fontSize: "40px", fontStyle: "bold", color: "#fff7e7" });

          const storySpot = (x: number, y: number, label: string, story: Extract<RanchEvent, { type: "show-story" }>["story"]) => {
            const zone = this.add.rectangle(x, y, 154, 42, 0x744c36, 0.94).setStrokeStyle(2, 0xfff0cf);
            zone.setInteractive({ useHandCursor: true });
            zone.on("pointerup", () => eventRef.current({ type: "show-story", story }));
            this.add.text(x, y, label, { fontFamily: "Arial", fontSize: "16px", fontStyle: "bold", color: "#fff6df" }).setOrigin(0.5);
          };

          storySpot(592, 345, "✦ El mapa", "map");
          storySpot(1090, 310, "✿ Flores", "flowers");
          storySpot(1020, 128, "🦜 Muy pronto", "cameo");

          friends.forEach((friend) => {
            const selected = friend.id === selectedCharacter;
            const body = this.add.circle(friend.x, friend.y, selected ? 57 : 51, friend.color).setStrokeStyle(selected ? 7 : 4, selected ? 0xffe797 : 0x5b3328);
            body.setInteractive({ useHandCursor: true });
            body.on("pointerup", () => eventRef.current({ type: "choose-character", character: friend.id }));
            this.add.text(friend.x, friend.y - 7, friend.name === "Essma" ? "✦" : "♥", { fontSize: "28px", color: "#fff5d9" }).setOrigin(0.5);
            this.add.text(friend.x, friend.y + 67, friend.name, { fontFamily: "Arial", fontSize: "19px", fontStyle: "bold", color: "#512b22", backgroundColor: "#fff0cf", padding: { x: 10, y: 6 } }).setOrigin(0.5);
            this.add.text(friend.x, friend.y + 97, friend.subtitle, { fontFamily: "Arial", fontSize: "14px", fontStyle: "bold", color: "#fff7e8", backgroundColor: "#75412b", padding: { x: 8, y: 4 } }).setOrigin(0.5);
          });

          if (!reducedMotion) {
            this.tweens.add({ targets: this.children.list.filter((child) => child.type === "Arc"), scale: 1.04, duration: 1100, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
          }
        }
      }

      game = new Phaser.Game({
        type: Phaser.AUTO,
        parent: host,
        width: 1280,
        height: 720,
        backgroundColor: "#f0c474",
        scene: RanchoScene,
        scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
        input: { activePointers: 1 },
        banner: false,
      });
    });

    return () => {
      cancelled = true;
      game?.destroy(true);
    };
  }, [reducedMotion, selectedCharacter]);

  return (
    <div className="phaser-ranch-shell">
      <div className="phaser-ranch" ref={hostRef} aria-hidden="true" />
      <div className="scene-accessibility" aria-label="Elige una actividad del Rancho de Essma">
        <p>Elige a un amigo para vestir.</p>
        {friends.map((friend) => <button key={friend.id} onClick={() => onEvent({ type: "choose-character", character: friend.id })}>Vestir a {friend.name}</button>)}
        <button onClick={() => onEvent({ type: "show-story", story: "map" })}>Ver el mapa</button>
        <button onClick={() => onEvent({ type: "show-story", story: "flowers" })}>Ver las flores</button>
        <button onClick={() => onEvent({ type: "show-story", story: "cameo" })}>Conocer a Loro Loco</button>
      </div>
    </div>
  );
}
