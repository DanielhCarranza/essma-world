"use client";

import { useMemo, useState } from "react";
import {
  ranchDecor,
  ranchPlacementZones,
  RanchPlacementZoneId,
} from "./lib/game-catalog";
import type { RanchLayout } from "./lib/player-profile";
import styles from "./ranch-decorator.module.css";

export type RanchDecoratorIntent =
  | { type: "place-decor"; decorId: string; zoneId: RanchPlacementZoneId }
  | { type: "remove-decor"; zoneId: RanchPlacementZoneId }
  | { type: "undo-decor" }
  | { type: "reset-decor" };

type RanchDecoratorProps = {
  layout: RanchLayout;
  unlockedDecorIds: readonly string[];
  reducedMotion: boolean;
  selectedDecorId: string | null;
  onIntent: (intent: RanchDecoratorIntent) => void;
  onDone: () => void;
  onSelectedDecorChange?: (decorId: string | null) => void;
};

export default function RanchDecorator({
  layout,
  unlockedDecorIds,
  reducedMotion,
  selectedDecorId,
  onIntent,
  onDone,
  onSelectedDecorChange,
}: RanchDecoratorProps) {
  const [selectedZoneId, setSelectedZoneId] =
    useState<RanchPlacementZoneId | null>(null);
  const unlocked = useMemo(() => new Set(unlockedDecorIds), [unlockedDecorIds]);
  const selectedDecor =
    ranchDecor.find((decor) => decor.id === selectedDecorId) ?? null;
  const compatibleZones = selectedDecor
    ? ranchPlacementZones.filter((zone) =>
        selectedDecor.compatibleZoneIds.includes(zone.id),
      )
    : [];

  function chooseDecor(decorId: string) {
    onSelectedDecorChange?.(decorId);
    const decor = ranchDecor.find((entry) => entry.id === decorId);
    if (!decor) return;
    const targetZoneId =
      decor.compatibleZoneIds.find(
        (zoneId) => !layout.placements.some((p) => p.zoneId === zoneId),
      ) ?? decor.compatibleZoneIds[0];

    if (targetZoneId) {
      onIntent({ type: "place-decor", decorId, zoneId: targetZoneId });
      setSelectedZoneId(targetZoneId);
    }
  }

  function chooseZone(zoneId: RanchPlacementZoneId) {
    setSelectedZoneId(zoneId);
    if (!selectedDecorId) return;
    onIntent({ type: "place-decor", decorId: selectedDecorId, zoneId });
  }

  function removeSelected() {
    if (selectedZoneId)
      onIntent({ type: "remove-decor", zoneId: selectedZoneId });
  }

  return (
    <aside
      className={`${styles.decorator} ${reducedMotion ? styles.reducedMotion : ""}`}
      aria-label="Decorar el patio"
    >
      <div className={styles.grip} aria-hidden="true" />
      <header className={styles.header}>
        <div>
          <span>MI PATIO</span>
          <h2>Decora</h2>
        </div>
        <button className={styles.doneButton} type="button" onClick={onDone}>
          ¡Listo! ✓
        </button>
      </header>

      <section className={styles.catalog} aria-label="Elige una decoración">
        <div className={styles.sectionHeading}>
          <h3>Toca o arrastra</h3>
          <span>{selectedDecor ? selectedDecor.locale["es-MX"].name : ""}</span>
        </div>
        <div className={styles.decorGrid}>
          {ranchDecor.map((decor) => {
            const isLocked = !unlocked.has(decor.id);
            const isSelected = decor.id === selectedDecorId;
            return (
              <button
                className={`${styles.decorCard} ${isSelected ? styles.selected : ""}`}
                type="button"
                key={decor.id}
                aria-pressed={isSelected}
                aria-label={
                  isLocked
                    ? `${decor.locale["es-MX"].name}, todavía no disponible`
                    : `Elegir ${decor.locale["es-MX"].name}`
                }
                disabled={isLocked}
                draggable={!isLocked}
                onDragStart={(e) => e.dataTransfer.setData("text/plain", decor.id)}
                onClick={() => chooseDecor(decor.id)}
              >
                <img
                  src={decor.asset.thumbnailPath}
                  alt=""
                  loading="lazy"
                  draggable={false}
                />
                <span>{decor.locale["es-MX"].name}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className={styles.zoneSection} aria-label="Elige un lugar">
        <div className={styles.sectionHeading}>
          <h3>Coloca</h3>
          <span>{selectedDecor ? "Toca una luz" : "Elige algo"}</span>
        </div>
        <div className={styles.zoneGrid}>
          {compatibleZones.map((zone) => {
            const occupied = layout.placements.some(
              (placement) => placement.zoneId === zone.id,
            );
            const isSelected = zone.id === selectedZoneId;
            return (
              <button
                className={`${styles.zoneButton} ${isSelected ? styles.zoneSelected : ""} ${occupied ? styles.occupied : ""}`}
                type="button"
                key={zone.id}
                onClick={() => chooseZone(zone.id)}
                aria-pressed={isSelected}
              >
                <span className={styles.zoneIcon} aria-hidden="true" />
                {zone.locale["es-MX"].name}
              </button>
            );
          })}
        </div>
      </section>

      <div className={styles.actions} aria-label="Acciones de decoración">
        <button
          type="button"
          onClick={removeSelected}
          disabled={!selectedZoneId}
        >
          Quitar
        </button>
        <button type="button" onClick={() => onIntent({ type: "undo-decor" })}>
          Deshacer
        </button>
        <button type="button" onClick={() => onIntent({ type: "reset-decor" })}>
          Reiniciar
        </button>
      </div>
      <span className={styles.status} aria-live="polite">
        {selectedDecor
          ? `Elegiste ${selectedDecor.locale["es-MX"].name}`
          : "Elige una decoración"}
      </span>
    </aside>
  );
}
