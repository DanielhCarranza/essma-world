"use client";

import { ChangeEvent, CSSProperties, useEffect, useRef, useState } from "react";
import RanchScene, { RanchEvent } from "./ranch-scene";
import {
  cameos,
  CharacterId,
  getWearable,
  ranchDecor,
  wearables,
} from "./lib/game-catalog";
import {
  canEquip,
  canPlaceRanchDecor,
  createStarterProfile,
  placeRanchDecor,
  PlayerProfile,
  RanchLayout,
  removeRanchDecor,
  resetRanchLayout,
  selectRanchScenario,
  undoRanchDecor,
  validateAndMigrateProfile,
} from "./lib/player-profile";
import { readSavedProfile, writeSavedProfile } from "./lib/profile-store";
import WorldMap from "./world-map";
import DressUpPanel from "./dress-up-panel";
import RanchDecorator, { RanchDecoratorIntent } from "./ranch-decorator";
import RanchScenarioSelector from "./ranch-scenario-selector";
import { GardenActivity, GARDEN_REWARD_IDS } from "./garden-activity";
import { CareActivity, CARE_REWARD_IDS } from "./care-activity";
import { applyMiniGameResult, type MiniGameResult } from "./mini-game";
import DestinationShell from "./destination-shell";
import { DESTINATION_REWARD_IDS, type DestinationId } from "./lib/destinations";

type Screen = "map" | "ranch" | "dress" | "destination";
type Dialog = "settings" | "collection" | "adult" | "confirm-import" | null;

const cameoMessages = {
  map: "¡Al mapa!",
  flowers: "¡Flores bonitas!",
  loro: "¡Loro viene pronto!",
  oso: "¡Oso viene pronto!",
  capybara: "¡Capi viene pronto!",
} as const;

function useSound(settings: PlayerProfile["settings"]) {
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const ambienceRef = useRef<HTMLAudioElement | null>(null);
  const play = (name: "confirm" | "cancel") => {
    if (!settings.sfx) return;
    const audio = new Audio(`/assets/audio/v1/${name}.wav`);
    audio.volume = 0.42;
    void audio.play().catch(() => undefined);
  };
  const startMusic = () => {
    if (!musicRef.current) {
      musicRef.current = new Audio("/assets/audio/v1/ranch-loop.wav");
      musicRef.current.loop = true;
      musicRef.current.volume = 0.18;
    }
    if (!ambienceRef.current) {
      ambienceRef.current = new Audio("/assets/audio/v1/ambience.wav");
      ambienceRef.current.loop = true;
      ambienceRef.current.volume = 0.08;
    }
    void musicRef.current.play().catch(() => undefined);
    void ambienceRef.current.play().catch(() => undefined);
  };
  useEffect(() => {
    if (!settings.music) {
      musicRef.current?.pause();
      ambienceRef.current?.pause();
    }
  }, [settings.music]);
  useEffect(
    () => () => {
      musicRef.current?.pause();
      ambienceRef.current?.pause();
    },
    [],
  );
  const pauseMusic = () => {
    musicRef.current?.pause();
    ambienceRef.current?.pause();
  };
  return { play, startMusic, pauseMusic };
}

const STABLE_STARTER_DATE = "2026-08-04T00:00:00.000Z";

export default function Home() {
  const [screen, setScreen] = useState<Screen>("map");
  const [selected, setSelected] = useState<CharacterId>("essma");
  const [profile, setProfile] = useState<PlayerProfile>(() =>
    createStarterProfile(STABLE_STARTER_DATE),
  );
  const [hydrated, setHydrated] = useState(false);
  const [notice, setNotice] = useState("");
  const [showFirstPlayGuide, setShowFirstPlayGuide] = useState(true);
  const [activeCameo, setActiveCameo] = useState<
    "loro" | "oso" | "capybara" | null
  >(null);
  const [decorating, setDecorating] = useState(false);
  const [selectedDecorId, setSelectedDecorId] = useState<string | null>(null);
  const [decorHistory, setDecorHistory] = useState<RanchLayout[]>([]);
  const [showGardenActivity, setShowGardenActivity] = useState(false);
  const [showCareActivity, setShowCareActivity] = useState(false);
  const [careCelebrate, setCareCelebrate] = useState<CharacterId | null>(null);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [holdProgress, setHoldProgress] = useState(0);
  const [pendingImport, setPendingImport] = useState<PlayerProfile | null>(
    null,
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const lastFocusRef = useRef<HTMLElement | null>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const adultHoldFrameRef = useRef<number | null>(null);
  const { play, startMusic, pauseMusic } = useSound(profile.settings);
  const [activeDestinationId, setActiveDestinationId] =
    useState<DestinationId | null>(null);

  async function handleGardenFinish(result: MiniGameResult) {
    setShowGardenActivity(false);
    if (result.status !== "completed") return;

    const miniGamePlayer = {
      profileId: profile.profileId,
      unlockedIds: [...profile.unlocks.itemIds, ...profile.unlocks.decorIds],
    };
    const policy = {
      allowedUnlockIds: new Set<string>(GARDEN_REWARD_IDS),
    };
    const applyRes = await applyMiniGameResult(
      miniGamePlayer,
      result,
      policy,
      {
        save: async (nextPlayer) => {
          updateProfile((current) => {
            const newItemIds = nextPlayer.unlockedIds.filter((id) =>
              getWearable(id),
            );
            const newDecorIds = nextPlayer.unlockedIds.filter((id) =>
              ranchDecor.some((d) => d.id === id),
            );
            return {
              ...current,
              unlocks: {
                ...current.unlocks,
                itemIds: Array.from(
                  new Set([...current.unlocks.itemIds, ...newItemIds]),
                ),
                decorIds: Array.from(
                  new Set([...current.unlocks.decorIds, ...newDecorIds]),
                ),
              },
            };
          });
        },
      },
    );

    if (applyRes.status === "saved" && applyRes.awardedIds.length > 0) {
      setNotice("¡Nuevo regalo desbloqueado en tu colección!");
      play("confirm");
    }
  }

  async function handleCareFinish(result: MiniGameResult) {
    setShowCareActivity(false);
    if (result.status !== "completed") return;

    const miniGamePlayer = {
      profileId: profile.profileId,
      unlockedIds: [...profile.unlocks.itemIds, ...profile.unlocks.decorIds],
    };
    const policy = {
      allowedUnlockIds: new Set<string>(CARE_REWARD_IDS),
    };
    const applyRes = await applyMiniGameResult(
      miniGamePlayer,
      result,
      policy,
      {
        save: async (nextPlayer) => {
          updateProfile((current) => {
            const newItemIds = nextPlayer.unlockedIds.filter((id) =>
              getWearable(id),
            );
            const newDecorIds = nextPlayer.unlockedIds.filter((id) =>
              ranchDecor.some((d) => d.id === id),
            );
            return {
              ...current,
              unlocks: {
                ...current.unlocks,
                itemIds: Array.from(
                  new Set([...current.unlocks.itemIds, ...newItemIds]),
                ),
                decorIds: Array.from(
                  new Set([...current.unlocks.decorIds, ...newDecorIds]),
                ),
              },
            };
          });
        },
      },
    );

    if (applyRes.status === "saved" && applyRes.awardedIds.length > 0) {
      setNotice("¡Nuevo adorno!");
      play("confirm");
      setCareCelebrate("juancito");
      window.setTimeout(() => setCareCelebrate(null), 1800);
    }
  }

  useEffect(() => {
    readSavedProfile()
      .then((saved) => {
        if (saved) {
          setProfile(saved);
        }
      })
      .catch(() =>
        setNotice("Tu estilo se guardará cuando este dispositivo esté listo."),
      )
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (hydrated)
      void writeSavedProfile(profile).catch(() =>
        setNotice("No pudimos guardar todavía. Puedes seguir jugando."),
      );
  }, [hydrated, profile]);

  useEffect(() => {
    if (!dialog) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (adultHoldFrameRef.current !== null) {
          cancelAnimationFrame(adultHoldFrameRef.current);
          adultHoldFrameRef.current = null;
        }
        setDialog(null);
        setPendingImport(null);
        setHoldProgress(0);
        requestAnimationFrame(() => lastFocusRef.current?.focus());
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable.at(-1)!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    const focusFrame = requestAnimationFrame(() => {
      dialogRef.current
        ?.querySelector<HTMLElement>("button, input, [tabindex]")
        ?.focus();
    });
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [dialog]);

  function openDialog(next: Exclude<Dialog, null>, trigger?: HTMLElement) {
    lastFocusRef.current = trigger ?? (document.activeElement as HTMLElement);
    setDialog(next);
  }
  function closeDialog() {
    cancelAdultHold();
    setDialog(null);
    setPendingImport(null);
    setHoldProgress(0);
    requestAnimationFrame(() => lastFocusRef.current?.focus());
  }
  function updateProfile(update: (current: PlayerProfile) => PlayerProfile) {
    setProfile((current) => ({
      ...update(current),
      updatedAt: new Date().toISOString(),
    }));
  }

  function openRanch() {
    setActiveDestinationId(null);
    setScreen("ranch");
    setDecorating(false);
    setSelectedDecorId(null);
    setShowFirstPlayGuide(false);
    setNotice("");
    if (profile.settings.music) startMusic();
    play("confirm");
  }

  function openDestination(id: DestinationId) {
    setActiveDestinationId(id);
    setScreen("destination");
    setShowFirstPlayGuide(false);
    setNotice("");
    pauseMusic();
    play("confirm");
  }

  async function handleDestinationFinish(result: MiniGameResult) {
    const miniGamePlayer = {
      profileId: profile.profileId,
      unlockedIds: [...profile.unlocks.itemIds, ...profile.unlocks.decorIds],
    };
    await applyMiniGameResult(
      miniGamePlayer,
      result,
      { allowedUnlockIds: new Set(DESTINATION_REWARD_IDS) },
      {
        save: async (nextPlayer) => {
          updateProfile((current) => {
            const newItemIds = nextPlayer.unlockedIds.filter((id) =>
              getWearable(id),
            );
            const newDecorIds = nextPlayer.unlockedIds.filter((id) =>
              ranchDecor.some((d) => d.id === id),
            );
            return {
              ...current,
              unlocks: {
                ...current.unlocks,
                itemIds: Array.from(
                  new Set([...current.unlocks.itemIds, ...newItemIds]),
                ),
                decorIds: Array.from(
                  new Set([...current.unlocks.decorIds, ...newDecorIds]),
                ),
              },
            };
          });
        },
      },
    );

    setActiveDestinationId(null);
    setScreen("map");
    if (result.status === "failed") {
      setNotice("No se pudo abrir el juego.");
      play("cancel");
      return;
    }
    play("confirm");
  }
  function openDress(character: CharacterId) {
    setSelected(character);
    setDecorating(false);
    setSelectedDecorId(null);
    setScreen("dress");
    setNotice("");
    play("confirm");
  }
  function openDecorator() {
    setScreen("ranch");
    setDecorating(true);
    setSelectedDecorId(null);
    setDecorHistory([]);
    setNotice("");
    play("confirm");
  }
  function handleRanchEvent(event: RanchEvent) {
    if (event.type === "choose-character") {
      if (!decorating) openDress(event.character);
      return;
    }
    if (event.type === "choose-placement-zone") {
      if (
        !decorating ||
        !selectedDecorId ||
        !canPlaceRanchDecor(profile, selectedDecorId, event.zoneId)
      )
        return;
      const next = placeRanchDecor(
        profile.ranchLayout,
        selectedDecorId,
        event.zoneId,
      );
      if (!next) return;
      setDecorHistory((history) => [...history, profile.ranchLayout]);
      updateProfile((current) => ({ ...current, ranchLayout: next }));
      setSelectedDecorId(null);
      setNotice("Quedó bonito");
      play("confirm");
      return;
    }
    if (event.story === "map") {
      setScreen("map");
      setNotice("");
      play("confirm");
      return;
    }
    setNotice(cameoMessages[event.story]);
    if (
      event.story === "loro" ||
      event.story === "oso" ||
      event.story === "capybara"
    )
      setActiveCameo(event.story);
    if (event.story === "flowers") play("confirm");
  }
  function handleDecorIntent(intent: RanchDecoratorIntent) {
    if (intent.type === "undo-decor") {
      const previous = decorHistory.at(-1);
      if (!previous) return;
      const next = undoRanchDecor(previous);
      if (!next) return;
      setDecorHistory((history) => history.slice(0, -1));
      updateProfile((current) => ({ ...current, ranchLayout: next }));
      play("cancel");
      return;
    }
    if (intent.type === "reset-decor") {
      if (profile.ranchLayout.placements.length === 0) return;
      setDecorHistory((history) => [...history, profile.ranchLayout]);
      updateProfile((current) => ({
        ...current,
        ranchLayout: resetRanchLayout(),
      }));
      setSelectedDecorId(null);
      play("cancel");
      return;
    }
    if (intent.type === "remove-decor") {
      const next = removeRanchDecor(profile.ranchLayout, intent.zoneId);
      if (
        !next ||
        next.placements.length === profile.ranchLayout.placements.length
      )
        return;
      setDecorHistory((history) => [...history, profile.ranchLayout]);
      updateProfile((current) => ({ ...current, ranchLayout: next }));
      play("cancel");
      return;
    }
    if (!canPlaceRanchDecor(profile, intent.decorId, intent.zoneId)) return;
    const next = placeRanchDecor(
      profile.ranchLayout,
      intent.decorId,
      intent.zoneId,
    );
    if (!next) return;
    setDecorHistory((history) => [...history, profile.ranchLayout]);
    updateProfile((current) => ({ ...current, ranchLayout: next }));
    setSelectedDecorId(null);
    setNotice("Quedó bonito");
    play("confirm");
  }
  function equip(itemId: string) {
    const item = getWearable(itemId);
    if (!item) return;
    const currentEquipped = profile.appearance[selected][item.slot];
    const nextItemId = currentEquipped === itemId ? "" : itemId;

    if (nextItemId && !canEquip(profile, selected, item.slot, nextItemId)) return;

    updateProfile((current) => ({
      ...current,
      appearance: {
        ...current.appearance,
        [selected]: { ...current.appearance[selected], [item.slot]: nextItemId },
      },
    }));
    setNotice(nextItemId ? "¡Qué bonito!" : "Ropita quitada");
    play("confirm");
  }
  function toggleSetting(key: keyof PlayerProfile["settings"]) {
    if (key === "music" && !profile.settings.music) startMusic();
    updateProfile((current) => ({
      ...current,
      settings: { ...current.settings, [key]: !current.settings[key] },
    }));
  }
  function exportBackup() {
    const blob = new Blob([JSON.stringify(profile, null, 2)], {
      type: "application/json",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "essma-world-respaldo.json";
    link.click();
    URL.revokeObjectURL(link.href);
    setNotice("El respaldo está listo. Guárdalo con una persona adulta.");
    closeDialog();
  }
  async function importBackup(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const result = validateAndMigrateProfile(JSON.parse(await file.text()));
      if (!result.ok) throw new Error(result.reason);
      setPendingImport(result.profile);
      setDialog("confirm-import");
    } catch {
      setNotice(
        "Ese archivo no es un respaldo compatible de Essma World. Tu estilo actual sigue seguro.",
      );
    }
  }
  function replaceWithBackup() {
    if (!pendingImport) return;
    setProfile(pendingImport);
    setNotice("¡El respaldo está listo para jugar!");
    play("confirm");
    closeDialog();
  }
  function startAdultHold() {
    cancelAdultHold();
    let started: number | null = null;
    const advance = (now: number) => {
      if (started === null) started = now;
      const progress = Math.min(1, (now - started) / 2000);
      setHoldProgress(progress);
      if (progress >= 1) {
        adultHoldFrameRef.current = null;
        setDialog("adult");
        return;
      }
      adultHoldFrameRef.current = requestAnimationFrame(advance);
    };
    adultHoldFrameRef.current = requestAnimationFrame(advance);
  }
  function cancelAdultHold() {
    if (adultHoldFrameRef.current !== null) {
      cancelAnimationFrame(adultHoldFrameRef.current);
      adultHoldFrameRef.current = null;
    }
    setHoldProgress(0);
  }

  return (
    <main
      className={`game-shell ${profile.settings.reducedMotion ? "reduce-motion" : ""}`}
    >
      {screen === "map" ? (
        <WorldMap
          initialWelcome={showFirstPlayGuide}
          onEnterRanch={openRanch}
          onEnterDestination={openDestination}
          onOpenSettings={() => openDialog("settings")}
        />
      ) : screen === "destination" && activeDestinationId ? (
        <DestinationShell
          key={activeDestinationId}
          destinationId={activeDestinationId}
          context={{
            player: {
              profileId: profile.profileId,
              unlockedIds: [
                ...profile.unlocks.itemIds,
                ...profile.unlocks.decorIds,
              ],
            },
            settings: profile.settings,
            locale: "es-MX",
          }}
          onFinish={handleDestinationFinish}
        />
      ) : (
        <>
          <header className="topbar">
            <button
              className="brand"
              onClick={() => setScreen("map")}
              aria-label="Ver el mapa de Essma World"
            >
              <span>ESSMA</span>
              <small>WORLD</small>
            </button>
            <div className="topbar-right">
              <button className="sun-chip" onClick={() => setScreen("map")}>
                ⌂ Mapa
              </button>
              <button
                className="round-button"
                onClick={(event) => openDialog("settings", event.currentTarget)}
                aria-label="Abrir ajustes"
              >
                ⚙
              </button>
            </div>
          </header>
          <section
            className={`play-area ${screen === "dress" ? "is-dressing" : ""}`}
          >
            {screen === "ranch" && (
              <div className="ranch-stage">
                <RanchScene
                  appearance={profile.appearance}
                  layout={profile.ranchLayout}
                  selectedCharacter={selected}
                  reducedMotion={profile.settings.reducedMotion}
                  decorating={decorating}
                  selectedDecorId={selectedDecorId}
                  celebrateCharacter={careCelebrate}
                  onEvent={handleRanchEvent}
                />
                {decorating && (
                  <RanchDecorator
                    layout={profile.ranchLayout}
                    unlockedDecorIds={profile.unlocks.decorIds}
                    reducedMotion={profile.settings.reducedMotion}
                    selectedDecorId={selectedDecorId}
                    onIntent={handleDecorIntent}
                    onSelectedDecorChange={setSelectedDecorId}
                    onDone={() => {
                      setDecorating(false);
                      setSelectedDecorId(null);
                      setNotice("Mi patio");
                      play("confirm");
                    }}
                  />
                )}
                {!decorating && (
                  <>
                    <div className="ranch-scenario-bar flex justify-center w-full my-2">
                      <RanchScenarioSelector
                        activeScenarioId={
                          profile.ranchLayout.activeScenarioId ?? "patio-central"
                        }
                        onSelectScenario={(scenarioId) => {
                          updateProfile((current) => {
                            const nextLayout = selectRanchScenario(
                              current.ranchLayout,
                              scenarioId,
                            );
                            if (!nextLayout) return current;
                            return {
                              ...current,
                              ranchLayout: nextLayout,
                            };
                          });
                          play("confirm");
                        }}
                      />
                    </div>
                    <div className="ranch-action-bar">
                      <button
                        className="decorate-launch"
                        type="button"
                        onPointerDown={(event) => event.stopPropagation()}
                        onClick={openDecorator}
                      >
                        <span aria-hidden="true">🌼</span>
                        <b>Decorar</b>
                      </button>
                      <button
                        className="decorate-launch garden-launch"
                        type="button"
                        onPointerDown={(event) => event.stopPropagation()}
                        onClick={() => setShowGardenActivity(true)}
                      >
                        <span aria-hidden="true">🌱</span>
                        <b>Jardín</b>
                      </button>
                      <button
                        className="decorate-launch care-launch"
                        type="button"
                        onPointerDown={(event) => event.stopPropagation()}
                        onClick={() => setShowCareActivity(true)}
                      >
                        <span aria-hidden="true">🐾</span>
                        <b>Cuidar</b>
                      </button>
                    </div>
                  </>
                )}
                {showGardenActivity && (
                  <GardenActivity
                    context={{
                      player: {
                        profileId: profile.profileId,
                        unlockedIds: [
                          ...profile.unlocks.itemIds,
                          ...profile.unlocks.decorIds,
                        ],
                      },
                      settings: profile.settings,
                      locale: "es-MX",
                    }}
                    onFinish={handleGardenFinish}
                  />
                )}
                {showCareActivity && (
                  <CareActivity
                    context={{
                      player: {
                        profileId: profile.profileId,
                        unlockedIds: [
                          ...profile.unlocks.itemIds,
                          ...profile.unlocks.decorIds,
                        ],
                      },
                      settings: profile.settings,
                      locale: "es-MX",
                    }}
                    onFinish={handleCareFinish}
                  />
                )}
              </div>
            )}
            {screen === "dress" && (
              <section className="dress-room" aria-label="Vestir">
                <DressUpPanel
                  key={selected}
                  characterId={selected}
                  appearance={profile.appearance}
                  unlockedItemIds={profile.unlocks.itemIds}
                  onEquip={equip}
                  onBack={() => setScreen("ranch")}
                  onDone={() => {
                    setScreen("ranch");
                    setNotice("¡Qué bonito!");
                    play("confirm");
                  }}
                  onChooseCharacter={openDress}
                />
              </section>
            )}
          </section>
        </>
      )}
      {notice && (
        <aside className="message-card" aria-live="polite" onClick={() => setNotice("")}>
          <span>✦</span>
          <p>{notice}</p>
          <button
            type="button"
            className="notice-close"
            onClick={(e) => {
              e.stopPropagation();
              setNotice("");
            }}
            aria-label="Cerrar aviso"
          >
            ×
          </button>
        </aside>
      )}
      {screen !== "map" && activeCameo && (
        <aside
          className="cameo-card"
          onClick={() => setActiveCameo(null)}
          aria-label={
            cameos.find((cameo) => cameo.id === activeCameo)?.asset.alt
          }
        >
          <img
            src={
              cameos.find((cameo) => cameo.id === activeCameo)?.asset
                .runtimePath
            }
            alt=""
          />
          <p>
            {
              cameos.find((cameo) => cameo.id === activeCameo)?.locale["es-MX"]
                .name
            }
          </p>
          <button
            type="button"
            className="cameo-close"
            onClick={(e) => {
              e.stopPropagation();
              setActiveCameo(null);
            }}
            aria-label="Cerrar historia"
          >
            ×
          </button>
        </aside>
      )}
      {dialog && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={closeDialog}
        >
          <section
            ref={dialogRef}
            className="settings-card"
            role="dialog"
            aria-modal="true"
            tabIndex={-1}
            aria-label={
              dialog === "collection"
                ? "Colección"
                : dialog === "adult"
                  ? "Opciones para adultos"
                  : "Ajustes"
            }
            onMouseDown={(event) => event.stopPropagation()}
          >
            {dialog === "settings" && (
              <>
                <div className="settings-heading">
                  <div>
                    <p>RANCHO DE ESSMA</p>
                    <h2>Ajustes</h2>
                  </div>
                  <button onClick={closeDialog} aria-label="Cerrar ajustes">
                    ×
                  </button>
                </div>
                <label>
                  <span>🎵 Música</span>
                  <input
                    type="checkbox"
                    checked={profile.settings.music}
                    onChange={() => toggleSetting("music")}
                  />
                </label>
                <label>
                  <span>🔔 Sonidos</span>
                  <input
                    type="checkbox"
                    checked={profile.settings.sfx}
                    onChange={() => toggleSetting("sfx")}
                  />
                </label>
                <label>
                  <span>🌙 Menos movimiento</span>
                  <input
                    type="checkbox"
                    checked={profile.settings.reducedMotion}
                    onChange={() => toggleSetting("reducedMotion")}
                  />
                </label>
                <button
                  className="collection-entry"
                  type="button"
                  onClick={() => setDialog("collection")}
                >
                  <span aria-hidden="true">🎒</span>
                  <b>Mis cosas</b>
                  <small>
                    {profile.unlocks.itemIds.length +
                      profile.unlocks.decorIds.length}
                  </small>
                </button>
                <div className="backup-box">
                  <p>
                    <b>Opciones para adultos</b>
                    <br />
                    Los respaldos pueden reemplazar los estilos guardados en
                    este dispositivo.
                  </p>
                  <button
                    className="adult-entry"
                    onPointerDown={startAdultHold}
                    onPointerUp={cancelAdultHold}
                    onPointerCancel={cancelAdultHold}
                    onPointerLeave={cancelAdultHold}
                    onKeyDown={(event) => {
                      if (event.key === " " && !event.repeat) {
                        event.preventDefault();
                        startAdultHold();
                      }
                    }}
                    onKeyUp={(event) => {
                      if (event.key === " ") cancelAdultHold();
                    }}
                    onBlur={cancelAdultHold}
                    style={{ "--hold": holdProgress } as CSSProperties}
                  >
                    Mantén presionado 2 segundos
                  </button>
                </div>
              </>
            )}
            {dialog === "adult" && (
              <>
                <div className="settings-heading">
                  <div>
                    <p>SOLO PARA PERSONAS ADULTAS</p>
                    <h2>Respaldos</h2>
                  </div>
                  <button onClick={closeDialog} aria-label="Cerrar">
                    ×
                  </button>
                </div>
                <p>
                  Un respaldo guarda los looks y ajustes en un archivo. Abrir
                  uno no envía información a ningún lugar, pero puede reemplazar
                  el estilo de este dispositivo.
                </p>
                <div className="adult-actions">
                  <button onClick={exportBackup}>⇩ Guardar respaldo</button>
                  <button onClick={() => inputRef.current?.click()}>
                    ⇧ Abrir respaldo
                  </button>
                </div>
                <input
                  ref={inputRef}
                  type="file"
                  accept="application/json"
                  onChange={importBackup}
                  hidden
                />
              </>
            )}
            {dialog === "confirm-import" && (
              <>
                <h2>¿Reemplazar el estilo guardado?</h2>
                <p>
                  Revisamos el archivo antes de abrir esta pregunta. Si
                  continúas, los looks y ajustes actuales de este dispositivo
                  serán reemplazados.
                </p>
                <div className="adult-actions">
                  <button onClick={replaceWithBackup}>Sí, reemplazar</button>
                  <button onClick={closeDialog}>No, conservar lo actual</button>
                </div>
              </>
            )}
            {dialog === "collection" && (
              <>
                <div className="settings-heading">
                  <div>
                    <p>TESOROS DEL RANCHO</p>
                    <h2>Colección</h2>
                  </div>
                  <button onClick={closeDialog} aria-label="Cerrar colección">
                    ×
                  </button>
                </div>
                <p>
                  {profile.unlocks.itemIds.length} prendas y{" "}
                  {profile.unlocks.decorIds.length} decoraciones.
                </p>
                <ul className="collection-list">
                  {[
                    ...wearables.filter(
                      (item) => item.unlock.type !== "pending-art",
                    ),
                    ...ranchDecor,
                  ].map((item) => (
                    <li key={item.id}>
                      {profile.unlocks.itemIds.includes(item.id) ||
                      profile.unlocks.decorIds.includes(item.id)
                        ? "✓"
                        : "○"}{" "}
                      {item.locale["es-MX"].name}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
