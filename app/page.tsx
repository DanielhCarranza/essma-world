"use client";

import { ChangeEvent, CSSProperties, useEffect, useRef, useState } from "react";
import RanchScene, { RanchEvent } from "./ranch-scene";
import { cameos, CharacterId, getWearable, wearables } from "./lib/game-catalog";
import { canEquip, createStarterProfile, PlayerProfile, validateAndMigrateProfile } from "./lib/player-profile";
import { readSavedProfile, writeSavedProfile } from "./lib/profile-store";
import WorldMap from "./world-map";
import DressUpPanel from "./dress-up-panel";

type Screen = "map" | "ranch" | "dress";
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
    if (!musicRef.current) { musicRef.current = new Audio("/assets/audio/v1/ranch-loop.wav"); musicRef.current.loop = true; musicRef.current.volume = 0.18; }
    if (!ambienceRef.current) { ambienceRef.current = new Audio("/assets/audio/v1/ambience.wav"); ambienceRef.current.loop = true; ambienceRef.current.volume = 0.08; }
    void musicRef.current.play().catch(() => undefined);
    void ambienceRef.current.play().catch(() => undefined);
  };
  useEffect(() => { if (!settings.music) { musicRef.current?.pause(); ambienceRef.current?.pause(); } }, [settings.music]);
  useEffect(() => () => { musicRef.current?.pause(); ambienceRef.current?.pause(); }, []);
  return { play, startMusic };
}

export default function Home() {
  const [screen, setScreen] = useState<Screen>("map");
  const [selected, setSelected] = useState<CharacterId>("essma");
  const [profile, setProfile] = useState<PlayerProfile>(() => createStarterProfile());
  const [hydrated, setHydrated] = useState(false);
  const [notice, setNotice] = useState("");
  const [showFirstPlayGuide, setShowFirstPlayGuide] = useState(true);
  const [activeCameo, setActiveCameo] = useState<"loro" | "oso" | "capybara" | null>(null);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [holdProgress, setHoldProgress] = useState(0);
  const [pendingImport, setPendingImport] = useState<PlayerProfile | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastFocusRef = useRef<HTMLElement | null>(null);
  const { play, startMusic } = useSound(profile.settings);

  useEffect(() => {
    readSavedProfile().then((saved) => {
      if (saved) { setProfile(saved); }
    }).catch(() => setNotice("Tu estilo se guardará cuando este dispositivo esté listo.")).finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (hydrated) void writeSavedProfile(profile).catch(() => setNotice("No pudimos guardar todavía. Puedes seguir jugando."));
  }, [hydrated, profile]);

  useEffect(() => {
    if (!dialog) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") closeDialog(); };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  });

  function openDialog(next: Exclude<Dialog, null>, trigger?: HTMLElement) { lastFocusRef.current = trigger ?? document.activeElement as HTMLElement; setDialog(next); }
  function closeDialog() { setDialog(null); setPendingImport(null); setHoldProgress(0); requestAnimationFrame(() => lastFocusRef.current?.focus()); }
  function updateProfile(update: (current: PlayerProfile) => PlayerProfile) { setProfile((current) => ({ ...update(current), updatedAt: new Date().toISOString() })); }

  function openRanch() { setScreen("ranch"); setShowFirstPlayGuide(false); setNotice("¡Elige un amigo!"); play("confirm"); }
  function openDress(character: CharacterId) { setSelected(character); setScreen("dress"); setNotice(""); play("confirm"); }
  function handleRanchEvent(event: RanchEvent) {
    if (event.type === "choose-character") return openDress(event.character);
    if (event.story === "map") {
      setScreen("map");
      setNotice("");
      play("confirm");
      return;
    }
    setNotice(cameoMessages[event.story]);
    if (event.story === "loro" || event.story === "oso" || event.story === "capybara") setActiveCameo(event.story);
    if (event.story === "flowers") play("confirm");
  }
  function equip(itemId: string) {
    const item = getWearable(itemId);
    if (!item || !canEquip(profile, selected, item.slot, itemId)) return;
    updateProfile((current) => ({ ...current, appearance: { ...current.appearance, [selected]: { ...current.appearance[selected], [item.slot]: itemId } } }));
    setNotice("¡Qué bonito!");
    play("confirm");
  }
  function toggleSetting(key: keyof PlayerProfile["settings"]) {
    if (key === "music" && !profile.settings.music) startMusic();
    updateProfile((current) => ({ ...current, settings: { ...current.settings, [key]: !current.settings[key] } }));
  }
  function exportBackup() {
    const blob = new Blob([JSON.stringify(profile, null, 2)], { type: "application/json" });
    const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = "essma-world-respaldo.json"; link.click(); URL.revokeObjectURL(link.href);
    setNotice("El respaldo está listo. Guárdalo con una persona adulta."); closeDialog();
  }
  async function importBackup(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; event.target.value = ""; if (!file) return;
    try { const result = validateAndMigrateProfile(JSON.parse(await file.text())); if (!result.ok) throw new Error(result.reason); setPendingImport(result.profile); setDialog("confirm-import"); }
    catch { setNotice("Ese archivo no es un respaldo compatible de Essma World. Tu estilo actual sigue seguro."); }
  }
  function replaceWithBackup() { if (!pendingImport) return; setProfile(pendingImport); setNotice("¡El respaldo está listo para jugar!"); play("confirm"); closeDialog(); }
  function startAdultHold() {
    const started = performance.now();
    let frame = 0;
    const advance = (now: number) => { const progress = Math.min(1, (now - started) / 2000); setHoldProgress(progress); if (progress >= 1) { setDialog("adult"); return; } frame = requestAnimationFrame(advance); };
    frame = requestAnimationFrame(advance);
    const stop = () => { cancelAnimationFrame(frame); setHoldProgress(0); window.removeEventListener("pointerup", stop); window.removeEventListener("pointercancel", stop); };
    window.addEventListener("pointerup", stop, { once: true }); window.addEventListener("pointercancel", stop, { once: true });
  }

  return <main className={`game-shell ${profile.settings.reducedMotion ? "reduce-motion" : ""}`}>
    {screen === "map" ? <WorldMap initialWelcome={showFirstPlayGuide} onEnterRanch={openRanch} onOpenSettings={() => openDialog("settings")} /> : <>
      <header className="topbar"><button className="brand" onClick={() => setScreen("map")} aria-label="Ver el mapa de Essma World"><span>ESSMA</span><small>WORLD</small></button><div className="topbar-right"><button className="sun-chip" onClick={() => setScreen("map")}>⌂ Mapa</button><button className="round-button" onClick={(event) => openDialog("settings", event.currentTarget)} aria-label="Abrir ajustes">⚙</button></div></header>
      <section className={`play-area ${screen === "dress" ? "is-dressing" : ""}`}>
        {screen === "ranch" && <div className="ranch-stage"><RanchScene appearance={profile.appearance} selectedCharacter={selected} reducedMotion={profile.settings.reducedMotion} onEvent={handleRanchEvent} /></div>}
        {screen === "dress" && <section className="dress-room" aria-label="Vestir"><DressUpPanel characterId={selected} appearance={profile.appearance} unlockedItemIds={profile.unlocks.itemIds} onEquip={equip} onBack={() => setScreen("ranch")} onDone={() => { setScreen("ranch"); setNotice("¡Qué bonito!"); play("confirm"); }} onChooseCharacter={openDress} /></section>}
      </section>
      <nav className="quick-actions" aria-label="Acciones principales"><button onClick={() => setScreen("map")}><span aria-hidden="true">🗺</span><small>Mapa</small></button><button onClick={() => setScreen("ranch")}><span aria-hidden="true">⌂</span><small>Rancho</small></button><button onClick={() => openDress(selected)}><span aria-hidden="true">👗</span><small>Vestir</small></button><button onClick={(event) => openDialog("collection", event.currentTarget)}><span aria-hidden="true">🎒</span><small>Cosas</small></button></nav>
    </>}
    {notice && <aside className="message-card" aria-live="polite"><span>✦</span><p>{notice}</p></aside>}
    {screen !== "map" && activeCameo && <aside className="cameo-card" aria-label={cameos.find((cameo) => cameo.id === activeCameo)?.asset.alt}><img src={cameos.find((cameo) => cameo.id === activeCameo)?.asset.runtimePath} alt="" /><p>{cameos.find((cameo) => cameo.id === activeCameo)?.locale["es-MX"].name}</p></aside>}
    {dialog && <div className="modal-backdrop" role="presentation" onMouseDown={closeDialog}><section className="settings-card" role="dialog" aria-modal="true" aria-label={dialog === "collection" ? "Colección" : dialog === "adult" ? "Opciones para adultos" : "Ajustes"} onMouseDown={(event) => event.stopPropagation()}>
      {dialog === "settings" && <><div className="settings-heading"><div><p>RANCHO DE ESSMA</p><h2>Ajustes</h2></div><button onClick={closeDialog} aria-label="Cerrar ajustes">×</button></div><label><span>🎵 Música</span><input type="checkbox" checked={profile.settings.music} onChange={() => toggleSetting("music")} /></label><label><span>🔔 Sonidos</span><input type="checkbox" checked={profile.settings.sfx} onChange={() => toggleSetting("sfx")} /></label><label><span>🌙 Movimiento suave</span><input type="checkbox" checked={profile.settings.reducedMotion} onChange={() => toggleSetting("reducedMotion")} /></label><div className="backup-box"><p><b>Opciones para adultos</b><br />Los respaldos pueden reemplazar los estilos guardados en este dispositivo.</p><button className="adult-entry" onPointerDown={startAdultHold} onKeyDown={(event) => { if (event.key === " ") startAdultHold(); }} onKeyUp={() => setHoldProgress(0)} style={{ "--hold": holdProgress } as CSSProperties}>Mantén presionado 2 segundos</button></div></>}
      {dialog === "adult" && <><div className="settings-heading"><div><p>SOLO PARA PERSONAS ADULTAS</p><h2>Respaldos</h2></div><button onClick={closeDialog} aria-label="Cerrar">×</button></div><p>Un respaldo guarda los looks y ajustes en un archivo. Abrir uno no envía información a ningún lugar, pero puede reemplazar el estilo de este dispositivo.</p><div className="adult-actions"><button onClick={exportBackup}>⇩ Guardar respaldo</button><button onClick={() => inputRef.current?.click()}>⇧ Abrir respaldo</button></div><input ref={inputRef} type="file" accept="application/json" onChange={importBackup} hidden /></>}
      {dialog === "confirm-import" && <><h2>¿Reemplazar el estilo guardado?</h2><p>Revisamos el archivo antes de abrir esta pregunta. Si continúas, los looks y ajustes actuales de este dispositivo serán reemplazados.</p><div className="adult-actions"><button onClick={replaceWithBackup}>Sí, reemplazar</button><button onClick={closeDialog}>No, conservar lo actual</button></div></>}
      {dialog === "collection" && <><div className="settings-heading"><div><p>TESOROS DEL RANCHO</p><h2>Colección</h2></div><button onClick={closeDialog} aria-label="Cerrar colección">×</button></div><p>{profile.unlocks.itemIds.length} de {wearables.length} prendas iniciales disponibles.</p><ul className="collection-list">{wearables.map((item) => <li key={item.id}>{profile.unlocks.itemIds.includes(item.id) ? "✓" : "○"} {item.locale["es-MX"].name}</li>)}</ul></>}
    </section></div>}
  </main>;
}
