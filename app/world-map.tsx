"use client";

import { useEffect, useRef, useState } from "react";

import styles from "./world-map.module.css";

export type WorldMapProps = {
  /** Opens the only playable destination in this MVP. */
  onEnterRanch: () => void;
  /** Opens the app's existing grown-up settings entry point. */
  onOpenSettings: () => void;
  /** Shows a small, optional first-visit greeting without requiring reading. */
  initialWelcome?: boolean;
};

type FuturePlace =
  "desierto" | "pueblo" | "bosque" | "oasis" | "valle-de-flores";

const futurePlaces: ReadonlyArray<{ id: FuturePlace; label: string }> = [
  { id: "desierto", label: "Desierto" },
  { id: "pueblo", label: "Pueblo" },
  { id: "bosque", label: "Bosque" },
  { id: "oasis", label: "Oasis" },
  { id: "valle-de-flores", label: "Valle de flores" },
];

function LockMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M7.25 10V7.7a4.75 4.75 0 0 1 9.5 0V10"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.35"
        strokeLinecap="round"
      />
      <rect
        x="4.5"
        y="9.25"
        width="15"
        height="11.5"
        rx="2.3"
        fill="currentColor"
      />
      <path
        d="M12 13.1v3.85"
        fill="none"
        stroke="#fff5d4"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SettingsMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M12 8.3a3.7 3.7 0 1 0 0 7.4 3.7 3.7 0 0 0 0-7.4Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="m18.8 13.7 1.2 1.1-2.1 3.6-1.55-.53a7.6 7.6 0 0 1-1.64.95l-.32 1.6H10.3L10 18.8a7.6 7.6 0 0 1-1.66-.95l-1.53.53-2.12-3.6 1.22-1.1a7.7 7.7 0 0 1 0-1.9l-1.22-1.1 2.12-3.6 1.53.53A7.6 7.6 0 0 1 10 6.55l.3-1.6h4.12l.32 1.6c.59.24 1.13.56 1.64.95l1.55-.53 2.1 3.6-1.2 1.1a7.7 7.7 0 0 1 0 2.01Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.55"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * A single-screen map: its rich artwork communicates the destinations, while
 * semantic buttons keep every landmark available to keyboard and touch users.
 */
export default function WorldMap({
  onEnterRanch,
  onOpenSettings,
  initialWelcome = true,
}: WorldMapProps) {
  const [soonPlace, setSoonPlace] = useState<string | null>(null);
  const dismissTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (dismissTimer.current !== null) {
        window.clearTimeout(dismissTimer.current);
      }
    },
    [],
  );

  const announceSoon = (label: string) => {
    if (dismissTimer.current !== null) {
      window.clearTimeout(dismissTimer.current);
    }
    setSoonPlace(label);
    dismissTimer.current = window.setTimeout(() => setSoonPlace(null), 1800);
  };

  return (
    <section className={styles.map} aria-label="Mapa de Essma World">
      <header className={styles.header}>
        <div className={styles.logo} aria-label="Essma World">
          Essma World
        </div>
        <button
          className={styles.settings}
          type="button"
          onClick={onOpenSettings}
          aria-label="Ajustes"
        >
          <SettingsMark />
        </button>
      </header>

      <section className={styles.mapBody} aria-labelledby="world-map-title">
        <picture className={styles.art}>
          <source
            media="(max-width: 620px)"
            srcSet="/assets/world/v2/sonora-world-map-portrait-v2.png"
          />
          <img
            src="/assets/world/v2/sonora-world-map-landscape-v2.png"
            alt=""
          />
        </picture>
        <div className={styles.artShade} aria-hidden="true" />

        <div className={styles.titleBlock}>
          <p>{initialWelcome ? "¡Hola!" : "Mapa"}</p>
          <h1 id="world-map-title">Elige un lugar</h1>
        </div>

        <div className={styles.mapControls}>
          <button
            className={styles.ranch}
            type="button"
            onClick={onEnterRanch}
            aria-label="Entrar al Rancho de Essma"
          >
            <span className={styles.ranchSparkle} aria-hidden="true" />
            <span className={styles.ranchLabel}>Rancho</span>
            <span className={styles.ranchGo} aria-hidden="true">
              Vamos
            </span>
          </button>

          {futurePlaces.map((place) => (
            <button
              className={`${styles.futurePlace} ${styles[place.id]}`}
              key={place.id}
              type="button"
              aria-label={`${place.label}. Pronto.`}
              aria-describedby={
                soonPlace === place.label ? "world-map-soon" : undefined
              }
              onClick={() => announceSoon(place.label)}
            >
              <span className={styles.lock} aria-hidden="true">
                <LockMark />
              </span>
              <span>{place.label}</span>
            </button>
          ))}
        </div>

        <p className={styles.hint}>Toca el Rancho</p>
        <p
          id="world-map-soon"
          className={styles.liveMessage}
          role="status"
          aria-live="polite"
        >
          {soonPlace ? `${soonPlace}: pronto.` : ""}
        </p>
      </section>
    </section>
  );
}
