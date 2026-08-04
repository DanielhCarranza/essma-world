"use client";

import { useEffect, useRef } from "react";
import { characters, CharacterId, wearables } from "./lib/game-catalog";
import type { Appearance } from "./lib/player-profile";
import { resolveAppearance } from "./lib/appearance";

export type RanchEvent =
  | { type: "choose-character"; character: CharacterId }
  | { type: "show-story"; story: "map" | "flowers" | "loro" | "oso" | "capybara" };

type RanchSceneProps = {
  appearance: Appearance;
  onEvent: (event: RanchEvent) => void;
  reducedMotion: boolean;
  selectedCharacter: CharacterId;
};

const friends: Array<{ id: CharacterId; x: number; y: number }> = [
  { id: "essma", x: 260, y: 530 },
  { id: "juancito", x: 505, y: 550 },
  { id: "tori", x: 750, y: 530 },
  { id: "anita", x: 990, y: 550 },
];

type SceneSnapshot = Pick<RanchSceneProps, "appearance" | "reducedMotion" | "selectedCharacter">;

export default function RanchScene({ appearance, onEvent, reducedMotion, selectedCharacter }: RanchSceneProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const eventRef = useRef(onEvent);
  const gameRef = useRef<{ events: { emit: (event: string, ...args: unknown[]) => void }; destroy: (removeCanvas: boolean) => void } | null>(null);

  useEffect(() => { eventRef.current = onEvent; }, [onEvent]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let cancelled = false;

    void import("phaser").then((module) => {
      if (cancelled) return;
      const Phaser = module.default;

      class RanchoScene extends Phaser.Scene {
        private figures = new Map<CharacterId, { frame: Phaser.GameObjects.Container; layers: Phaser.GameObjects.Image[] }>();
        private pulse?: Phaser.Tweens.Tween;

        preload() {
          this.load.image("rancho", "/assets/rancho-de-essma-v1.png");
          characters.forEach((character) => this.load.image(`base:${character.id}`, character.asset.runtimePath));
          wearables.forEach((item) => this.load.image(`wearable:${item.id}`, item.asset.runtimePath));
        }

        create() {
          this.add.image(640, 360, "rancho").setDisplaySize(1280, 720);
          this.add.rectangle(640, 360, 1280, 720, 0x1e1710, 0.13);
          this.add.rectangle(323, 115, 480, 102, 0x75412b, 0.94).setStrokeStyle(4, 0xa96032);
          this.add.text(105, 82, "UN DÍA BONITO EN EL", { fontFamily: "Arial", fontSize: "19px", fontStyle: "bold", color: "#fff7e7" });
          this.add.text(105, 107, "Rancho de Essma", { fontFamily: "Arial", fontSize: "40px", fontStyle: "bold", color: "#fff7e7" });

          const storySpot = (x: number, y: number, label: string, story: Extract<RanchEvent, { type: "show-story" }>["story"]) => {
            const zone = this.add.rectangle(x, y, 160, 42, 0x744c36, 0.94).setStrokeStyle(2, 0xfff0cf).setInteractive({ useHandCursor: true });
            zone.on("pointerup", () => eventRef.current({ type: "show-story", story }));
            this.add.text(x, y, label, { fontFamily: "Arial", fontSize: "16px", fontStyle: "bold", color: "#fff6df" }).setOrigin(0.5);
          };
          storySpot(580, 345, "El mapa", "map");
          storySpot(1090, 310, "Las flores", "flowers");
          storySpot(1025, 128, "Visitas", "loro");

          friends.forEach((friend) => {
            const character = characters.find((entry) => entry.id === friend.id)!;
            const base = this.add.image(0, 0, `base:${friend.id}`).setDisplaySize(156, 156);
            const frame = this.add.container(friend.x, friend.y - 15, [base]);
            const hit = this.add.rectangle(friend.x, friend.y - 15, 172, 208, 0xffffff, 0).setInteractive({ useHandCursor: true });
            hit.on("pointerup", () => eventRef.current({ type: "choose-character", character: friend.id }));
            this.add.text(friend.x, friend.y + 96, character.locale["es-MX"].name, { fontFamily: "Arial", fontSize: "19px", fontStyle: "bold", color: "#512b22", backgroundColor: "#fff0cf", padding: { x: 10, y: 6 } }).setOrigin(0.5);
            this.figures.set(friend.id, { frame, layers: [] });
          });

          this.events.on("ranch:update", this.updateSnapshot, this);
          this.updateSnapshot({ appearance, reducedMotion, selectedCharacter });
        }

        updateSnapshot(snapshot: SceneSnapshot) {
          this.pulse?.stop();
          this.figures.forEach(({ frame, layers }, characterId) => {
            layers.forEach((layer) => layer.destroy());
            layers.length = 0;
            const chosen = resolveAppearance(snapshot.appearance, characterId).layers;
            chosen.forEach((item) => {
              const layer = this.add.image(0, 0, `wearable:${item.id}`).setDisplaySize(156, 156);
              if (item.slot === "hair") frame.addAt(layer, 0);
              else frame.add(layer);
              layers.push(layer);
            });
            frame.setScale(characterId === snapshot.selectedCharacter ? 1.08 : 1);
          });
          if (!snapshot.reducedMotion) {
            const selected = this.figures.get(snapshot.selectedCharacter)?.frame;
            if (selected) this.pulse = this.tweens.add({ targets: selected, scale: 1.12, duration: 1000, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
          }
        }

        shutdown() { this.events.off("ranch:update", this.updateSnapshot, this); }
      }

      const game = new Phaser.Game({
        type: Phaser.AUTO,
        parent: host,
        width: 1280,
        height: 720,
        backgroundColor: "#f0c474",
        scene: RanchoScene,
        // Cover prevents the narrow mobile viewport from showing FIT letterbox bars.
        scale: { mode: Phaser.Scale.ENVELOP, autoCenter: Phaser.Scale.CENTER_BOTH },
        input: { activePointers: 1 },
        banner: false,
      });
      gameRef.current = game;
    }).catch(() => host.setAttribute("data-load-error", "true"));

    return () => {
      cancelled = true;
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  // The Phaser instance must survive state updates; snapshots are emitted below.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { gameRef.current?.events.emit("ranch:update", { appearance, reducedMotion, selectedCharacter } satisfies SceneSnapshot); }, [appearance, reducedMotion, selectedCharacter]);

  return <div className="phaser-ranch-shell">
    <div className="phaser-ranch" ref={hostRef} aria-label="Escena interactiva del Rancho de Essma" />
    <nav className="scene-accessibility" aria-label="Controles del Rancho de Essma">
      <p>Elige a un amigo para vestir.</p>
      {friends.map(({ id }) => <button key={id} onClick={() => onEvent({ type: "choose-character", character: id })}>Vestir a {characters.find((character) => character.id === id)?.locale["es-MX"].name}</button>)}
      <button onClick={() => onEvent({ type: "show-story", story: "map" })}>Ver el mapa</button>
      <button onClick={() => onEvent({ type: "show-story", story: "flowers" })}>Ver las flores</button>
      <button onClick={() => onEvent({ type: "show-story", story: "loro" })}>Conocer a Loro Loco</button>
      <button onClick={() => onEvent({ type: "show-story", story: "oso" })}>Conocer a Oso Taquito</button>
      <button onClick={() => onEvent({ type: "show-story", story: "capybara" })}>Conocer a Capybara</button>
    </nav>
    <p className="scene-load-error" role="status">No pudimos abrir el rancho en este navegador. Aún puedes vestir a los amigos.</p>
  </div>;
}
