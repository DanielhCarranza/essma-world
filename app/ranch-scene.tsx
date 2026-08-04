"use client";

import { useEffect, useRef } from "react";
import { cameos, characters, CharacterId, wearables } from "./lib/game-catalog";
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
        private title!: Phaser.GameObjects.Text;
        private storySpots: Array<{ zone: Phaser.GameObjects.Rectangle; label: Phaser.GameObjects.Text; nx: number; ny: number }> = [];
        private loro!: { portrait: Phaser.GameObjects.Image; hit: Phaser.GameObjects.Rectangle; label: Phaser.GameObjects.Text };
        private figureSize = 212;
        private pulse?: Phaser.Tweens.Tween;

        preload() {
          this.load.image("rancho", "/assets/rancho-de-essma-v1.png");
          characters.forEach((character) => this.load.image(`base:${character.id}`, character.asset.runtimePath));
          wearables.forEach((item) => this.load.image(`wearable:${item.id}`, item.asset.runtimePath));
          cameos.forEach((cameo) => this.load.image(`cameo:${cameo.id}`, cameo.asset.runtimePath));
        }

        create() {
          this.backdrop = this.add.image(0, 0, "rancho").setOrigin(0.5);
          this.shade = this.add.rectangle(0, 0, 1, 1, 0x1e1710, 0.13).setOrigin(0);
          // A small place marker leaves the ranch picture and the friends as the main read.
          this.titleBox = this.add.rectangle(0, 0, 150, 44, 0x75412b, 0.94).setStrokeStyle(3, 0xffe9bd);
          this.title = this.add.text(0, 0, "☀  Rancho", { fontFamily: "Arial", fontSize: "20px", fontStyle: "bold", color: "#fff7e7" }).setOrigin(0.5);

          const storySpot = (nx: number, ny: number, label: string, story: Extract<RanchEvent, { type: "show-story" }>['story']) => {
            const zone = this.add.rectangle(0, 0, 160, 42, 0x744c36, 0.94).setStrokeStyle(2, 0xfff0cf).setInteractive({ useHandCursor: true });
            zone.on("pointerup", () => eventRef.current({ type: "show-story", story }));
            const text = this.add.text(0, 0, label, { fontFamily: "Arial", fontSize: "16px", fontStyle: "bold", color: "#fff6df" }).setOrigin(0.5);
            this.storySpots.push({ zone, label: text, nx, ny });
          };
          storySpot(0.48, 0.45, "🗺  Mapa", "map");
          storySpot(0.84, 0.48, "🌼  Flores", "flowers");

          const loro = this.add.image(0, 0, "cameo:loro").setDisplaySize(72, 72);
          const loroHit = this.add.rectangle(0, 0, 94, 104, 0xffffff, 0).setInteractive({ useHandCursor: true });
          loroHit.on("pointerup", () => eventRef.current({ type: "show-story", story: "loro" }));
          const loroLabel = this.add.text(0, 0, "Loro", { fontFamily: "Arial", fontSize: "14px", fontStyle: "bold", color: "#512b22", backgroundColor: "#fff0cf", padding: { x: 7, y: 4 } }).setOrigin(0.5);
          this.loro = { portrait: loro, hit: loroHit, label: loroLabel };

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
          this.figureSize = compact
            ? Math.max(92, Math.min(124, Math.min(width * 0.31, height * 0.19)))
            : Math.max(132, Math.min(212, Math.min(width / 4.9, height / 3.15)));
          const titleScale = compact ? Math.max(0.68, width / 500) : 1;
          this.titleBox.setPosition(24 + 75 * titleScale, 20 + 22 * titleScale).setScale(titleScale);
          this.title.setPosition(24 + 75 * titleScale, 20 + 22 * titleScale).setFontSize(`${20 * titleScale}px`);
          this.storySpots.forEach(({ zone, label, nx, ny }) => {
            const x = Math.max(72, Math.min(width - 72, width * nx));
            const y = Math.max(130, Math.min(height - 118, height * ny));
            zone.setPosition(x, y).setVisible(!compact);
            label.setPosition(x, y).setVisible(!compact);
          });
          const loroX = width * (compact ? 0.86 : 0.88);
          const loroY = compact ? 72 : 96;
          const loroSize = compact ? 48 : 72;
          this.loro.portrait.setPosition(loroX, loroY).setDisplaySize(loroSize, loroSize);
          this.loro.hit.setPosition(loroX, loroY).setSize(loroSize * 1.3, loroSize * 1.45);
          this.loro.label.setPosition(loroX, loroY + loroSize * 0.66).setFontSize(`${compact ? 11 : 14}px`);
          this.figures.forEach(({ frame, base, hit, label, layers, nx, ny }, characterId) => {
            const compactPosition: Record<CharacterId, { x: number; y: number }> = {
              essma: { x: 0.27, y: 0.48 }, juancito: { x: 0.73, y: 0.48 },
              tori: { x: 0.27, y: 0.74 }, anita: { x: 0.73, y: 0.74 },
            };
            const compactFriend = compactPosition[characterId];
            const x = width * (compact ? compactFriend.x : nx);
            const y = compact
              ? height * compactFriend.y
              : Math.min(height - 120, Math.max(height * 0.64, height * ny - 20));
            frame.setPosition(x, y);
            base.setDisplaySize(this.figureSize, this.figureSize);
            layers.forEach((layer) => layer.setDisplaySize(this.figureSize, this.figureSize));
            hit.setPosition(x, y).setSize(this.figureSize * 1.16, this.figureSize * 1.3);
            label.setPosition(x, y + this.figureSize * 0.62).setFontSize(`${Math.max(12, this.figureSize * 0.12)}px`);
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
      <p className="scene-control-prompt">Toca un amigo.</p>
      {friends.map(({ id }) => <button className="scene-character-control" key={id} onClick={() => onEvent({ type: "choose-character", character: id })}>👕 {characters.find((character) => character.id === id)?.locale["es-MX"].name}</button>)}
      <button className="scene-map-control" onClick={() => onEvent({ type: "show-story", story: "map" })}>🗺 Mapa</button>
      <button className="scene-flower-control" onClick={() => onEvent({ type: "show-story", story: "flowers" })}>🌼 Flores</button>
      <button className="scene-cameo-control" onClick={() => onEvent({ type: "show-story", story: "loro" })}>🦜 Loro</button>
      <button className="scene-cameo-control" onClick={() => onEvent({ type: "show-story", story: "oso" })}>🐻 Oso</button>
      <button className="scene-cameo-control" onClick={() => onEvent({ type: "show-story", story: "capybara" })}>🦫 Capi</button>
    </nav>
    <p className="scene-load-error" role="status">No pudimos abrir el rancho en este navegador. Aún puedes vestir a los amigos.</p>
  </div>;
}
