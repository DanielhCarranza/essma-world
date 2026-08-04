"use client";

import { useEffect, useRef } from "react";
import { characters, CharacterId, wearables } from "./lib/game-catalog";
import type { Appearance } from "./lib/player-profile";
import { resolveAppearance } from "./lib/appearance";

export type RanchEvent =
  | { type: "choose-character"; character: CharacterId }
  | { type: "show-story"; story: "map" | "flowers" | "loro" | "oso" | "capybara" };

type RanchSceneProps = { appearance: Appearance; onEvent: (event: RanchEvent) => void; reducedMotion: boolean; selectedCharacter: CharacterId };
type SceneSnapshot = Pick<RanchSceneProps, "appearance" | "reducedMotion" | "selectedCharacter">;

const friends: Array<{ id: CharacterId; x: number; y: number }> = [
  { id: "essma", x: 260, y: 530 }, { id: "juancito", x: 505, y: 550 },
  { id: "tori", x: 750, y: 530 }, { id: "anita", x: 990, y: 550 },
];

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
        private figures = new Map<CharacterId, {
          frame: Phaser.GameObjects.Container; base: Phaser.GameObjects.Image; hit: Phaser.GameObjects.Rectangle;
          label: Phaser.GameObjects.Text; layers: Phaser.GameObjects.Image[]; nx: number; ny: number;
        }>();
        private backdrop!: Phaser.GameObjects.Image;
        private shade!: Phaser.GameObjects.Rectangle;
        private titleBox!: Phaser.GameObjects.Rectangle;
        private titleKicker!: Phaser.GameObjects.Text;
        private title!: Phaser.GameObjects.Text;
        private storySpots: Array<{ zone: Phaser.GameObjects.Rectangle; label: Phaser.GameObjects.Text; nx: number; ny: number }> = [];
        private figureSize = 156;
        private pulse?: Phaser.Tweens.Tween;

        preload() {
          this.load.image("rancho", "/assets/rancho-de-essma-v1.png");
          characters.forEach((character) => this.load.image(`base:${character.id}`, character.asset.runtimePath));
          wearables.forEach((item) => this.load.image(`wearable:${item.id}`, item.asset.runtimePath));
        }

        create() {
          this.backdrop = this.add.image(0, 0, "rancho").setOrigin(0.5);
          this.shade = this.add.rectangle(0, 0, 1, 1, 0x1e1710, 0.13).setOrigin(0);
          this.titleBox = this.add.rectangle(0, 0, 480, 102, 0x75412b, 0.94).setStrokeStyle(4, 0xa96032);
          this.titleKicker = this.add.text(0, 0, "UN DÍA BONITO EN EL", { fontFamily: "Arial", fontSize: "19px", fontStyle: "bold", color: "#fff7e7" });
          this.title = this.add.text(0, 0, "Rancho de Essma", { fontFamily: "Arial", fontSize: "40px", fontStyle: "bold", color: "#fff7e7" });

          const storySpot = (nx: number, ny: number, label: string, story: Extract<RanchEvent, { type: "show-story" }>['story']) => {
            const zone = this.add.rectangle(0, 0, 160, 42, 0x744c36, 0.94).setStrokeStyle(2, 0xfff0cf).setInteractive({ useHandCursor: true });
            zone.on("pointerup", () => eventRef.current({ type: "show-story", story }));
            const text = this.add.text(0, 0, label, { fontFamily: "Arial", fontSize: "16px", fontStyle: "bold", color: "#fff6df" }).setOrigin(0.5);
            this.storySpots.push({ zone, label: text, nx, ny });
          };
          storySpot(0.45, 0.48, "El mapa", "map");
          storySpot(0.85, 0.43, "Las flores", "flowers");
          storySpot(0.8, 0.18, "Visitas", "loro");

          friends.forEach((friend) => {
            const character = characters.find((entry) => entry.id === friend.id)!;
            const base = this.add.image(0, 0, `base:${friend.id}`).setDisplaySize(156, 156);
            const frame = this.add.container(0, 0, [base]);
            const hit = this.add.rectangle(0, 0, 172, 208, 0xffffff, 0).setInteractive({ useHandCursor: true });
            hit.on("pointerup", () => eventRef.current({ type: "choose-character", character: friend.id }));
            const label = this.add.text(0, 0, character.locale["es-MX"].name, { fontFamily: "Arial", fontSize: "19px", fontStyle: "bold", color: "#512b22", backgroundColor: "#fff0cf", padding: { x: 10, y: 6 } }).setOrigin(0.5);
            this.figures.set(friend.id, { frame, base, hit, label, layers: [], nx: friend.x / 1280, ny: friend.y / 720 });
          });

          this.events.on("ranch:update", this.updateSnapshot, this);
          this.scale.on("resize", this.layout, this);
          this.layout();
          this.updateSnapshot({ appearance, reducedMotion, selectedCharacter });
        }

        /** Keeps the world coherent in a portrait viewport without letterboxing. */
        layout() {
          const width = this.scale.width;
          const height = this.scale.height;
          const cover = Math.max(width / 1280, height / 720);
          const compact = width < 620;
          this.backdrop.setPosition(width / 2, height / 2).setScale(cover);
          this.shade.setDisplaySize(width, height);
          this.figureSize = Math.max(54, Math.min(156, Math.min(width / 4.5, height / 3.7)));
          const titleScale = compact ? Math.max(0.48, width / 780) : 1;
          const titleX = Math.max(18, width * 0.06);
          this.titleBox.setPosition(Math.max(17 + 240 * titleScale, width * 0.25), 26 + 51 * titleScale).setScale(titleScale);
          this.titleKicker.setPosition(titleX, 26 + 24 * titleScale).setFontSize(`${19 * titleScale}px`);
          this.title.setPosition(titleX, 26 + 49 * titleScale).setFontSize(`${40 * titleScale}px`);
          this.storySpots.forEach(({ zone, label, nx, ny }) => {
            const x = Math.max(72, Math.min(width - 72, width * nx));
            const y = Math.max(130, Math.min(height - 118, height * ny));
            zone.setPosition(x, y).setVisible(!compact);
            label.setPosition(x, y).setVisible(!compact);
          });
          this.figures.forEach(({ frame, base, hit, label, layers, nx, ny }) => {
            const x = width * nx;
            const y = Math.min(height - 106, Math.max(height * 0.66, height * ny - 15));
            frame.setPosition(x, y);
            base.setDisplaySize(this.figureSize, this.figureSize);
            layers.forEach((layer) => layer.setDisplaySize(this.figureSize, this.figureSize));
            hit.setPosition(x, y).setSize(this.figureSize * 1.18, this.figureSize * 1.42);
            label.setPosition(x, y + this.figureSize * 0.67).setFontSize(`${Math.max(11, this.figureSize * 0.12)}px`);
          });
        }

        updateSnapshot(snapshot: SceneSnapshot) {
          this.pulse?.stop();
          this.figures.forEach(({ frame, layers }, characterId) => {
            layers.forEach((layer) => layer.destroy());
            layers.length = 0;
            resolveAppearance(snapshot.appearance, characterId).layers.forEach((item) => {
              const layer = this.add.image(0, 0, `wearable:${item.id}`).setDisplaySize(this.figureSize, this.figureSize);
              if (item.slot === "hair") frame.addAt(layer, 0); else frame.add(layer);
              layers.push(layer);
            });
            frame.setScale(characterId === snapshot.selectedCharacter ? 1.08 : 1);
          });
          if (!snapshot.reducedMotion) {
            const selected = this.figures.get(snapshot.selectedCharacter)?.frame;
            if (selected) this.pulse = this.tweens.add({ targets: selected, scale: 1.12, duration: 1000, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
          }
        }

        shutdown() {
          this.events.off("ranch:update", this.updateSnapshot, this);
          this.scale.off("resize", this.layout, this);
        }
      }

      const game = new Phaser.Game({
        type: Phaser.AUTO, parent: host, width: 1280, height: 720, backgroundColor: "#75412b", scene: RanchoScene,
        // The canvas fills its host; layout cover-scales the ranch art within it.
        scale: { mode: Phaser.Scale.RESIZE }, input: { activePointers: 1 }, banner: false,
      });
      gameRef.current = game;
    }).catch(() => host.setAttribute("data-load-error", "true"));

    return () => { cancelled = true; gameRef.current?.destroy(true); gameRef.current = null; };
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
