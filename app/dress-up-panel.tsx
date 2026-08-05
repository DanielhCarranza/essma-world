"use client";

import { useMemo, useState } from "react";
import styles from "./dress-up-panel.module.css";
import {
  characters,
  CharacterId,
  getWearable,
  WearableDefinition,
  WearableSlot,
} from "./lib/game-catalog";
import { Appearance } from "./lib/player-profile";
import { resolveAppearance } from "./lib/appearance";

type Category = {
  slot: WearableSlot;
  label: string;
  icon: string;
};

const categoryForSlot: Record<WearableSlot, Omit<Category, "slot">> = {
  hair: { label: "Pelo", icon: "✦" },
  outfit: { label: "Ropa", icon: "👕" },
  shoes: { label: "Zapatos", icon: "👢" },
  accessory: { label: "Adorno", icon: "🌼" },
  head: { label: "Sombrero", icon: "🧢" },
  neck: { label: "Pañuelo", icon: "🧣" },
  body: { label: "Ropa", icon: "👕" },
};

export type DressUpPanelProps = {
  /** Friend currently shown in the large preview. */
  characterId: CharacterId;
  /** Full snapshot so the component can resolve the same layers as the ranch. */
  appearance: Appearance;
  /** The only pieces that may be displayed and equipped. */
  unlockedItemIds: readonly string[];
  /** Called only with a catalog-compatible, unlocked wearable ID. */
  onEquip: (itemId: string) => void;
  /** Returns safely to the ranch after choosing a look. */
  onDone: () => void;
  /** Returns without requiring any selection. */
  onBack: () => void;
  /** Optional character picker for hosts that keep all friends in one room. */
  onChooseCharacter?: (characterId: CharacterId) => void;
};

function CharacterPreview({
  characterId,
  appearance,
}: Pick<DressUpPanelProps, "characterId" | "appearance">) {
  const resolved = resolveAppearance(appearance, characterId);
  const [baseFailed, setBaseFailed] = useState(false);

  return (
    <div
      className={styles.previewArt}
      role="img"
      aria-label={resolved.character.asset.alt}
    >
      {resolved.layers
        .filter((item) => item.slot === "hair" && item.zIndex < 20)
        .map((item) => (
          <img
            key={item.id}
            className={styles.layer}
            style={{ zIndex: item.zIndex }}
            src={item.asset.runtimePath}
            alt=""
            onError={(event) => {
              event.currentTarget.hidden = true;
            }}
          />
        ))}
      {baseFailed ? (
        <span className={styles.fallback} aria-hidden="true">
          ✦
        </span>
      ) : (
        <img
          className={styles.base}
          style={{ zIndex: 20 }}
          src={resolved.character.asset.runtimePath}
          alt=""
          onError={() => setBaseFailed(true)}
        />
      )}
      {resolved.layers
        .filter((item) => item.slot !== "hair" || item.zIndex >= 20)
        .map((item) => (
          <img
            key={item.id}
            className={styles.layer}
            style={{ zIndex: item.zIndex }}
            src={item.asset.runtimePath}
            alt=""
            onError={(event) => {
              event.currentTarget.hidden = true;
            }}
          />
        ))}
    </div>
  );
}

function ItemButton({
  item,
  equipped,
  onEquip,
}: {
  item: WearableDefinition;
  equipped: boolean;
  onEquip: () => void;
}) {
  return (
    <button
      type="button"
      className={`${styles.item} ${equipped ? styles.itemSelected : ""}`}
      onClick={onEquip}
      aria-pressed={equipped}
      aria-label={`${item.locale["es-MX"].name}${equipped ? ", puesto" : ""}`}
    >
      <img
        src={item.asset.thumbnailPath}
        alt=""
        onError={(event) => {
          event.currentTarget.hidden = true;
        }}
      />
      <span>{item.locale["es-MX"].name}</span>
      {equipped && <b aria-hidden="true">✓</b>}
    </button>
  );
}

/**
 * A compact, controlled dress-up surface. It owns only presentation and the
 * active visual category; player persistence and profile mutation stay in the host.
 */
export default function DressUpPanel({
  characterId,
  appearance,
  unlockedItemIds,
  onEquip,
  onDone,
  onBack,
  onChooseCharacter,
}: DressUpPanelProps) {
  const character = characters.find((entry) => entry.id === characterId)!;
  const unlocked = useMemo(
    () =>
      unlockedItemIds
        .map(getWearable)
        .filter((item): item is WearableDefinition =>
          Boolean(item && item.target === characterId),
        ),
    [characterId, unlockedItemIds],
  );
  const categories = useMemo<Category[]>(
    () =>
      [...new Set(unlocked.map((item) => item.slot))].map((slot) => ({
        slot,
        ...categoryForSlot[slot],
      })),
    [unlocked],
  );
  const [activeSlot, setActiveSlot] = useState<WearableSlot | null>(null);
  const currentSlot = categories.some(
    (category) => category.slot === activeSlot,
  )
    ? activeSlot
    : categories[0]?.slot;
  const visibleItems = unlocked.filter((item) => item.slot === currentSlot);

  return (
    <section
      className={styles.panel}
      aria-label={`Vestir a ${character.locale["es-MX"].name}`}
    >
      <header className={styles.header}>
        <button
          type="button"
          className={styles.back}
          onClick={onBack}
          aria-label="Volver al rancho"
        >
          ← <span>Rancho</span>
        </button>
        <h1>Vestir a {character.locale["es-MX"].name}</h1>
        <button type="button" className={styles.done} onClick={onDone}>
          ¡Listo! <span aria-hidden="true">✓</span>
        </button>
      </header>

      {onChooseCharacter && (
        <nav className={styles.friends} aria-label="Elige un amigo">
          {characters.map((friend) => (
            <button
              type="button"
              key={friend.id}
              onClick={() => onChooseCharacter(friend.id)}
              aria-pressed={friend.id === characterId}
              className={friend.id === characterId ? styles.friendSelected : ""}
            >
              <img src={friend.asset.thumbnailPath} alt="" />
              <span>{friend.locale["es-MX"].name}</span>
            </button>
          ))}
        </nav>
      )}

      <div className={styles.content}>
        <section
          className={styles.preview}
          aria-label={`Vista de ${character.locale["es-MX"].name}`}
        >
          <span className={styles.sun} aria-hidden="true">
            ☀
          </span>
          <CharacterPreview characterId={characterId} appearance={appearance} />
        </section>
        <section className={styles.closet} aria-label="Ropita">
          <nav className={styles.categories} aria-label="Tipo de ropa">
            {categories.map((category) => (
              <button
                type="button"
                key={category.slot}
                onClick={() => setActiveSlot(category.slot)}
                aria-pressed={currentSlot === category.slot}
                className={
                  currentSlot === category.slot ? styles.categorySelected : ""
                }
              >
                <span aria-hidden="true">{category.icon}</span>
                {category.label}
              </button>
            ))}
          </nav>
          <div className={styles.items} aria-live="polite">
            {visibleItems.map((item) => (
              <ItemButton
                key={item.id}
                item={item}
                equipped={appearance[characterId][item.slot] === item.id}
                onEquip={() => onEquip(item.id)}
              />
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
