"use client";

import styles from "./world-map.module.css";

export type WorldMapProps = {
  /** Opens the only playable destination in this MVP. */
  onEnterRanch: () => void;
  /** Opens the app's existing grown-up settings entry point. */
  onOpenSettings: () => void;
  /** Shows a small, optional first-visit greeting without requiring reading. */
  initialWelcome?: boolean;
};

type FuturePlace = "desierto" | "pueblo" | "bosque";

const futurePlaces: ReadonlyArray<{ id: FuturePlace; label: string; icon: string }> = [
  { id: "desierto", label: "Desierto", icon: "🌵" },
  { id: "pueblo", label: "Pueblo", icon: "🪅" },
  { id: "bosque", label: "Bosque", icon: "🌳" },
];

/**
 * The World Map is deliberately a navigation shell, not a travel system.
 * Only the Rancho can be entered; later regions remain visible as friendly,
 * focusable "pronto" landmarks so the child understands there is more world.
 */
export default function WorldMap({ onEnterRanch, onOpenSettings, initialWelcome = true }: WorldMapProps) {
  return (
    <section className={styles.map} aria-label="Mapa de Essma World">
      <header className={styles.header}>
        <div className={styles.logo} aria-label="Essma World">
          <span>ESSMA</span>
          <small>WORLD</small>
        </div>
        <button className={styles.settings} type="button" onClick={onOpenSettings} aria-label="Ajustes">
          <span aria-hidden="true">⚙</span>
        </button>
      </header>

      <section className={styles.mapBody} aria-labelledby="world-map-title">
        <div className={styles.skyDecoration} aria-hidden="true"><i /><i /><i /></div>
        <div className={styles.titleBlock}>
          <p>{initialWelcome ? "¡Hola, Essma!" : "Essma World"}</p>
          <h1 id="world-map-title">¿A dónde vamos?</h1>
        </div>

        <div className={styles.path} aria-hidden="true" />
        <button className={styles.ranch} type="button" onClick={onEnterRanch} aria-label="Entrar al Rancho de Essma">
          <span className={styles.ranchGlow} aria-hidden="true" />
          <span className={styles.ranchArt} aria-hidden="true"><i /><b>⌂</b></span>
          <strong>Rancho</strong>
          <small>¡Vamos!</small>
        </button>

        <div className={styles.futurePlaces} aria-label="Lugares que llegarán pronto">
          {futurePlaces.map((place) => (
            <button
              className={`${styles.futurePlace} ${styles[place.id]}`}
              key={place.id}
              type="button"
              aria-label={`${place.label}. Pronto.`}
              aria-disabled="true"
              onClick={(event) => event.preventDefault()}
            >
              <span className={styles.futureLandmark} aria-hidden="true">{place.icon}</span>
              <span>{place.label}</span>
              <small aria-hidden="true">🔒</small>
            </button>
          ))}
        </div>
      </section>

      <p className={styles.hint}><span aria-hidden="true">☝</span> Toca el Rancho</p>
    </section>
  );
}
