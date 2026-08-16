"use client";

import { useEffect, useRef } from "react";
import {
  cameos,
  CameoDefinition,
  characters,
  CharacterId,
  ranchDecor,
  ranchPlacementZones,
  RanchPlacementZoneId,
  ranchScenarios,
  wearables,
} from "./lib/game-catalog";
import type { Appearance, RanchLayout } from "./lib/player-profile";
import { resolveAppearance } from "./lib/appearance";

export type RanchEvent =
  | { type: "choose-character"; character: CharacterId }
  | { type: "choose-placement-zone"; zoneId: RanchPlacementZoneId }
  | {
      type: "show-story";
      story: "map" | "flowers" | "loro" | "oso" | "capybara";
    };

type RanchSceneProps = {
  appearance: Appearance;
  layout: RanchLayout;
  onEvent: (event: RanchEvent) => void;
  reducedMotion: boolean;
  selectedCharacter: CharacterId;
  decorating?: boolean;
  selectedDecorId?: string | null;
  celebrateCharacter?: CharacterId | null;
};

type SceneSnapshot = Pick<
  RanchSceneProps,
  | "appearance"
  | "layout"
  | "reducedMotion"
  | "selectedCharacter"
  | "decorating"
  | "selectedDecorId"
  | "celebrateCharacter"
>;

const friends: Array<{ id: CharacterId; x: number; y: number }> = [
  { id: "essma", x: 260, y: 530 },
  { id: "juancito", x: 505, y: 550 },
  { id: "tori", x: 750, y: 530 },
  { id: "anita", x: 990, y: 550 },
];

export default function RanchScene({
  appearance,
  layout,
  onEvent,
  reducedMotion,
  selectedCharacter,
  decorating = false,
  selectedDecorId = null,
  celebrateCharacter = null,
}: RanchSceneProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const eventRef = useRef(onEvent);
  const gameRef = useRef<{
    events: { emit: (event: string, ...args: unknown[]) => void };
    destroy: (removeCanvas: boolean) => void;
  } | null>(null);

  useEffect(() => {
    eventRef.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || typeof window === "undefined") return;
    let cancelled = false;

    void import("phaser")
      .then((module) => {
        if (cancelled) return;
        const Phaser = module.default;

        class RanchoScene extends Phaser.Scene {
          private figures = new Map<
            CharacterId,
            {
              frame: Phaser.GameObjects.Container;
              base: Phaser.GameObjects.Image;
              hit: Phaser.GameObjects.Rectangle;
              label: Phaser.GameObjects.Text;
              layers: Phaser.GameObjects.Image[];
              nx: number;
              ny: number;
            }
          >();
          private backdrop!: Phaser.GameObjects.Image;
          private shade!: Phaser.GameObjects.Rectangle;
          private titleBox!: Phaser.GameObjects.Rectangle;
          private title!: Phaser.GameObjects.Text;
          private cameoFigures = new Map<
            CameoDefinition["id"],
            {
              portrait: Phaser.GameObjects.Image;
              hit: Phaser.GameObjects.Rectangle;
              label: Phaser.GameObjects.Text;
            }
          >();
          private decorSprites = new Map<
            RanchPlacementZoneId,
            Phaser.GameObjects.Image
          >();
          private placementTargets = new Map<
            RanchPlacementZoneId,
            Phaser.GameObjects.Ellipse
          >();
          private figureSize = 212;
          private pulse?: Phaser.Tweens.Tween;
          private celebrateTween?: Phaser.Tweens.Tween;
          private celebrateParticles: Phaser.GameObjects.Arc[] = [];
          private celebrating = false;
          private celebratingCharacter: CharacterId | null = null;
          private previousCelebrateCharacter: CharacterId | null | undefined =
            undefined;

          preload() {
            this.load.image("rancho", "/assets/rancho-de-essma-v1.png");
            ranchScenarios.forEach((scenario) =>
              this.load.image(`scenario:${scenario.id}`, scenario.asset.runtimePath),
            );
            characters.forEach((character) =>
              this.load.image(
                `base:${character.id}`,
                character.asset.runtimePath,
              ),
            );
            wearables.forEach((item) =>
              this.load.image(`wearable:${item.id}`, item.asset.runtimePath),
            );
            this.load.image(
              "wearable:wearable.essma.hands-overlay",
              "/assets/characters/v1/essma-hands.png",
            );
            cameos.forEach((cameo) =>
              this.load.image(`cameo:${cameo.id}`, cameo.asset.runtimePath),
            );
            ranchDecor.forEach((decor) =>
              this.load.image(`decor:${decor.id}`, decor.asset.runtimePath),
            );
          }

          create() {
            const initialScenarioKey = `scenario:${layout.activeScenarioId ?? "patio-central"}`;
            this.backdrop = this.add
              .image(0, 0, this.textures.exists(initialScenarioKey) ? initialScenarioKey : "rancho")
              .setOrigin(0.5)
              .setDepth(0);
            this.shade = this.add
              .rectangle(0, 0, 1, 1, 0x1e1710, 0.13)
              .setOrigin(0)
              .setDepth(1);
            this.titleBox = this.add
              .rectangle(0, 0, 150, 44, 0x75412b, 0.94)
              .setStrokeStyle(3, 0xffe9bd)
              .setDepth(30);
            this.title = this.add
              .text(0, 0, "Rancho", {
                fontFamily: "Arial",
                fontSize: "20px",
                fontStyle: "bold",
                color: "#fff7e7",
              })
              .setOrigin(0.5)
              .setDepth(31);

            cameos.forEach((cameo) => {
              const portrait = this.add
                .image(0, 0, `cameo:${cameo.id}`)
                .setDisplaySize(72, 72)
                .setDepth(20);
              const hit = this.add
                .rectangle(0, 0, 94, 104, 0xffffff, 0)
                .setInteractive({ useHandCursor: true })
                .setDepth(21);
              hit.on("pointerup", (pointer: Phaser.Input.Pointer) => {
                // Ignore overlay/DOM hits that Phaser still maps into world space.
                if (
                  pointer.event?.target &&
                  pointer.event.target !== this.game.canvas
                ) {
                  return;
                }
                eventRef.current({ type: "show-story", story: cameo.id });
              });
              const shortName =
                cameo.id === "loro"
                  ? "Loro"
                  : cameo.id === "oso"
                    ? "Oso"
                    : "Capi";
              const label = this.add
                .text(0, 0, shortName, {
                  fontFamily: "Arial",
                  fontSize: "14px",
                  fontStyle: "bold",
                  color: "#512b22",
                  backgroundColor: "#fff0cf",
                  padding: { x: 7, y: 4 },
                })
                .setOrigin(0.5)
                .setDepth(22);
              this.cameoFigures.set(cameo.id, { portrait, hit, label });
            });

            ranchPlacementZones.forEach((zone) => {
              const target = this.add
                .ellipse(0, 0, 10, 10, 0xffdd72, 0.26)
                .setStrokeStyle(3, 0xfff4c7, 0.9)
                .setVisible(false)
                .setDepth(8)
                .setInteractive({ useHandCursor: true });
              target.on("pointerup", (pointer: Phaser.Input.Pointer) => {
                if (
                  pointer.event?.target &&
                  pointer.event.target !== this.game.canvas
                ) {
                  return;
                }
                eventRef.current({
                  type: "choose-placement-zone",
                  zoneId: zone.id,
                });
              });
              this.placementTargets.set(zone.id, target);
            });

            friends.forEach((friend) => {
              const character = characters.find(
                (entry) => entry.id === friend.id,
              )!;
              const base = this.add
                .image(0, 0, `base:${friend.id}`)
                .setDisplaySize(156, 156);
              const frame = this.add.container(0, 0, [base]).setDepth(900);
              const hit = this.add
                .rectangle(0, 0, 172, 208, 0xffffff, 0)
                .setInteractive({ useHandCursor: true })
                .setDepth(924);
              hit.on("pointerup", (pointer: Phaser.Input.Pointer) => {
                if (
                  pointer.event?.target &&
                  pointer.event.target !== this.game.canvas
                ) {
                  return;
                }
                eventRef.current({
                  type: "choose-character",
                  character: friend.id,
                });
              });
              const label = this.add
                .text(0, 0, character.locale["es-MX"].name, {
                  fontFamily: "Arial",
                  fontSize: "19px",
                  fontStyle: "bold",
                  color: "#512b22",
                  backgroundColor: "#fff0cf",
                  padding: { x: 10, y: 6 },
                })
                .setOrigin(0.5)
                .setDepth(925);
              this.figures.set(friend.id, {
                frame,
                base,
                hit,
                label,
                layers: [],
                nx: friend.x / 1280,
                ny: friend.y / 720,
              });
            });

            this.events.on("ranch:update", this.updateSnapshot, this);
            this.scale.on("resize", this.layoutScene, this);
            this.layoutScene();
            this.updateSnapshot({
              appearance,
              layout,
              reducedMotion,
              selectedCharacter,
              decorating,
              selectedDecorId,
              celebrateCharacter,
            });
          }

          private stopCelebrate() {
            this.celebrateTween?.stop();
            this.celebrateTween = undefined;
            this.celebrateParticles.forEach((particle) => particle.destroy());
            this.celebrateParticles = [];
            this.celebrating = false;
            this.celebratingCharacter = null;
          }

          private spawnSparkles(x: number, y: number) {
            const colors = [0xffe066, 0xffc857, 0xffffff];
            for (let i = 0; i < 5; i++) {
              const angle = (Math.PI * 2 * i) / 5 + Math.random() * 0.4;
              const dist = 18 + Math.random() * 28;
              const star = this.add
                .circle(x, y, 3 + Math.random() * 3, colors[i % colors.length], 0.92)
                .setDepth(950);
              this.celebrateParticles.push(star);
              this.tweens.add({
                targets: star,
                x: x + Math.cos(angle) * dist,
                y: y + Math.sin(angle) * dist - 12,
                alpha: 0,
                scale: 0.15,
                duration: 480 + Math.random() * 180,
                ease: "Quad.easeOut",
                onComplete: () => {
                  star.destroy();
                  const index = this.celebrateParticles.indexOf(star);
                  if (index >= 0) this.celebrateParticles.splice(index, 1);
                },
              });
            }
          }

          private playCelebrate(
            characterId: CharacterId,
            selectedCharacter: CharacterId,
            reducedMotion: boolean,
          ) {
            this.stopCelebrate();
            const figure = this.figures.get(characterId);
            if (!figure) return;

            this.celebrating = true;
            this.celebratingCharacter = characterId;
            const { frame, base } = figure;
            const restScale = characterId === selectedCharacter ? 1.08 : 1;

            if (reducedMotion) {
              base.setTint(0xfff4c7);
              this.time.delayedCall(160, () => {
                base.clearTint();
                this.celebrating = false;
                this.celebratingCharacter = null;
              });
              return;
            }

            const sparkleY = frame.y - this.figureSize * 0.42;
            this.spawnSparkles(frame.x, sparkleY);

            this.celebrateTween = this.tweens.add({
              targets: frame,
              scaleX: restScale * 1.07,
              scaleY: restScale * 1.07,
              y: frame.y - 10,
              duration: 360,
              yoyo: true,
              ease: "Sine.easeInOut",
              onComplete: () => {
                frame.setScale(restScale);
                this.celebrating = false;
                this.celebratingCharacter = null;
              },
            });
          }

          /** Keeps the world coherent in a portrait viewport without letterboxing. */
          layoutScene() {
            const width = this.scale.width;
            const height = this.scale.height;
            const cover = Math.max(width / 1280, height / 720);
            const compact = width < 620;
            this.backdrop.setPosition(width / 2, height / 2).setScale(cover);
            this.shade.setDisplaySize(width, height);
            this.figureSize = compact
              ? Math.max(
                  122,
                  Math.min(168, Math.min(width * 0.42, height * 0.27)),
                )
              : Math.max(
                  156,
                  Math.min(250, Math.min(width / 4.2, height / 2.72)),
                );
            const titleScale = compact ? Math.max(0.68, width / 500) : 1;
            this.titleBox
              .setPosition(24 + 75 * titleScale, 20 + 22 * titleScale)
              .setScale(titleScale);
            this.title
              .setPosition(24 + 75 * titleScale, 20 + 22 * titleScale)
              .setFontSize(`${20 * titleScale}px`);
            const cameoSize = compact ? 43 : 64;
            cameos.forEach((cameo, index) => {
              const figure = this.cameoFigures.get(cameo.id)!;
              const x = compact ? width * 0.86 : width - 55 - index * 78;
              const y = compact ? 56 + index * 74 : 82;
              figure.portrait
                .setPosition(x, y)
                .setDisplaySize(cameoSize, cameoSize);
              figure.hit
                .setPosition(x, y)
                .setSize(cameoSize * 1.3, cameoSize * 1.45);
              figure.label
                .setPosition(x, y + cameoSize * 0.66)
                .setFontSize(`${compact ? 10 : 12}px`);
            });
            ranchPlacementZones.forEach((zone) => {
              const target = this.placementTargets.get(zone.id)!;
              target
                .setPosition(width * zone.anchor.x, height * zone.anchor.y)
                .setSize(
                  width * zone.footprint.width,
                  height * zone.footprint.height,
                );
              const decor = this.decorSprites.get(zone.id);
              if (decor)
                decor
                  .setPosition(width * zone.anchor.x, height * zone.anchor.y)
                  .setDisplaySize(
                    Math.min(
                      width * zone.footprint.width * 1.5,
                      height * zone.footprint.height * 1.9,
                    ),
                    Math.min(
                      width * zone.footprint.width * 1.5,
                      height * zone.footprint.height * 1.9,
                    ),
                  );
            });
            this.figures.forEach(
              ({ frame, base, hit, label, layers, nx, ny }, characterId) => {
                const compactPosition: Record<
                  CharacterId,
                  { x: number; y: number }
                > = {
                  essma: { x: 0.27, y: 0.48 },
                  juancito: { x: 0.73, y: 0.48 },
                  tori: { x: 0.27, y: 0.74 },
                  anita: { x: 0.73, y: 0.74 },
                };
                const compactFriend = compactPosition[characterId];
                const x = width * (compact ? compactFriend.x : nx);
                const y = compact
                  ? height * compactFriend.y
                  : Math.min(
                      height - 120,
                      Math.max(height * 0.64, height * ny - 20),
                    );
                frame.setPosition(x, y);
                base.setDisplaySize(this.figureSize, this.figureSize);
                layers.forEach((layer) =>
                  layer.setDisplaySize(this.figureSize, this.figureSize),
                );
                hit
                  .setPosition(x, y)
                  .setSize(this.figureSize * 1.16, this.figureSize * 1.3);
                label
                  .setPosition(x, y - this.figureSize * 0.58)
                  .setOrigin(0.5, 1.0)
                  .setFontSize(`${Math.max(12, this.figureSize * 0.11)}px`);
              },
            );
          }

          updateDecor(layout: RanchLayout) {
            this.decorSprites.forEach((sprite) => sprite.destroy());
            this.decorSprites.clear();
            layout.placements.forEach((placement) => {
              const zone = ranchPlacementZones.find(
                (entry) => entry.id === placement.zoneId,
              );
              const decor = ranchDecor.find(
                (entry) => entry.id === placement.decorId,
              );
              if (!zone || !decor) return;
              // Patio objects inherit an authored ground order from their y anchor.
              const sprite = this.add
                .image(
                  this.scale.width * zone.anchor.x,
                  this.scale.height * zone.anchor.y,
                  `decor:${decor.id}`,
                )
                .setDepth(500 + Math.round(zone.anchor.y * 100));
              this.decorSprites.set(zone.id, sprite);
            });
            this.layoutScene();
          }

          updateSnapshot(snapshot: SceneSnapshot) {
            this.pulse?.stop();
            const scenarioKey = `scenario:${snapshot.layout.activeScenarioId ?? "patio-central"}`;
            if (this.textures.exists(scenarioKey)) {
              this.backdrop.setTexture(scenarioKey);
            }
            const scenarioDef = ranchScenarios.find(
              (s) => s.id === (snapshot.layout.activeScenarioId ?? "patio-central"),
            );
            if (scenarioDef && this.title) {
              this.title.setText(scenarioDef.locale["es-MX"].name);
            }
            this.updateDecor(snapshot.layout);
            ranchPlacementZones.forEach((zone) => {
              const target = this.placementTargets.get(zone.id)!;
              const canPlace =
                !!snapshot.selectedDecorId &&
                ranchDecor
                  .find((decor) => decor.id === snapshot.selectedDecorId)
                  ?.compatibleZoneIds.includes(zone.id);
              target.setVisible(Boolean(snapshot.decorating && canPlace));
            });
            this.figures.forEach(({ frame, layers }, characterId) => {
              layers.forEach((layer) => layer.destroy());
              layers.length = 0;
              resolveAppearance(
                snapshot.appearance,
                characterId,
              ).layers.forEach((item) => {
                const textureKey = `wearable:${item.id}`;
                if (!this.textures.exists(textureKey)) return;
                const layer = this.add
                  .image(0, 0, textureKey)
                  .setDisplaySize(this.figureSize, this.figureSize);
                if (item.slot === "hair" && item.zIndex < 20)
                  frame.addAt(layer, 0);
                else frame.add(layer);
                layers.push(layer);
              });
              if (
                !(
                  this.celebrating &&
                  characterId === this.celebratingCharacter
                )
              ) {
                frame.setScale(
                  characterId === snapshot.selectedCharacter ? 1.08 : 1,
                );
              }
            });
            const celebrate = snapshot.celebrateCharacter ?? null;
            if (celebrate && celebrate !== this.previousCelebrateCharacter) {
              this.playCelebrate(
                celebrate,
                snapshot.selectedCharacter,
                snapshot.reducedMotion,
              );
            }
            this.previousCelebrateCharacter = celebrate;
            if (!snapshot.reducedMotion && !snapshot.celebrateCharacter) {
              const selected = this.figures.get(
                snapshot.selectedCharacter,
              )?.frame;
              if (selected)
                this.pulse = this.tweens.add({
                  targets: selected,
                  scale: 1.12,
                  duration: 1000,
                  yoyo: true,
                  repeat: -1,
                  ease: "Sine.easeInOut",
                });
            }
          }

          shutdown() {
            this.stopCelebrate();
            this.events.off("ranch:update", this.updateSnapshot, this);
            this.scale.off("resize", this.layoutScene, this);
          }
        }

        const game = new Phaser.Game({
          type: Phaser.AUTO,
          parent: host,
          width: 1280,
          height: 720,
          backgroundColor: "#75412b",
          scene: RanchoScene,
          scale: { mode: Phaser.Scale.RESIZE },
          // Keep input on the canvas only so React chips (friends / Decorar)
          // are not also interpreted as world hits on characters below.
          input: { activePointers: 1, windowEvents: false },
          banner: false,
        });
        gameRef.current = game;
      })
      .catch(() => host.setAttribute("data-load-error", "true"));

    return () => {
      cancelled = true;
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
    // The Phaser instance must survive state updates; snapshots are emitted below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    gameRef.current?.events.emit("ranch:update", {
      appearance,
      layout,
      reducedMotion,
      selectedCharacter,
      decorating,
      selectedDecorId,
      celebrateCharacter,
    } satisfies SceneSnapshot);
  }, [
    appearance,
    layout,
    reducedMotion,
    selectedCharacter,
    decorating,
    selectedDecorId,
    celebrateCharacter,
  ]);

  return (
    <div className="phaser-ranch-shell">
      <div
        className="phaser-ranch"
        ref={hostRef}
        aria-label="Escena interactiva del Rancho de Essma"
      />
      {(!decorating || selectedDecorId) && (
        <nav
          className="scene-accessibility"
          aria-label="Controles del Rancho de Essma"
        >
          <p className="scene-control-prompt">
            {decorating ? "Toca un lugar." : "Toca un amigo."}
          </p>
          {!decorating &&
            friends.map(({ id }) => (
              <button
                className="scene-character-control"
                key={id}
                type="button"
                data-character-id={id}
                onPointerDown={(event) => event.stopPropagation()}
                onClick={() =>
                  onEvent({ type: "choose-character", character: id })
                }
              >
                {
                  characters.find((character) => character.id === id)?.locale[
                    "es-MX"
                  ].name
                }
              </button>
            ))}
          {!decorating &&
            cameos.map((cameo) => (
              <button
                className="scene-cameo-control"
                key={cameo.id}
                type="button"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={() => onEvent({ type: "show-story", story: cameo.id })}
              >
                {cameo.id === "loro"
                  ? "Loro"
                  : cameo.id === "oso"
                    ? "Oso"
                    : "Capi"}
              </button>
            ))}
          {decorating &&
            ranchPlacementZones
              .filter((zone) =>
                ranchDecor
                  .find((decor) => decor.id === selectedDecorId)
                  ?.compatibleZoneIds.includes(zone.id),
              )
              .map((zone) => (
                <button
                  className="scene-placement-control"
                  key={zone.id}
                  type="button"
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={() =>
                    onEvent({ type: "choose-placement-zone", zoneId: zone.id })
                  }
                >
                  {zone.locale["es-MX"].name}
                </button>
              ))}
        </nav>
      )}
      <p className="scene-load-error" role="status">
        No pudimos abrir el rancho en este navegador. Aún puedes vestir a los
        amigos.
      </p>
    </div>
  );
}
