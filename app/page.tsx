"use client";

import { ChangeEvent, CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import RanchScene, { RanchEvent } from "./ranch-scene";
import { cameos, characters, CharacterId, getWearable, wearables, WearableSlot } from "./lib/game-catalog";
import { Appearance, canEquip, createStarterProfile, PlayerProfile, validateAndMigrateProfile } from "./lib/player-profile";
import { readSavedProfile, writeSavedProfile } from "./lib/profile-store";
import { randomizeAppearance, resetAppearance, resolveAppearance } from "./lib/appearance";

type Screen = "ranch" | "dress";
type Dialog = "settings" | "collection" | "map" | "adult" | "confirm-import" | null;

const slotNames: Record<WearableSlot, string> = { hair: "Peinado", outfit: "Ropa", shoes: "Botitas", accessory: "Accesorio", head: "Cabeza", neck: "Cuello", body: "Cuerpo" };
const cameoMessages = {
  map: "En el granero hay un mapa antiguo. ¡Algún día nos llevará a una aventura!",
  flowers: "¡Mira las flores del desierto! Guardan colores para los días bonitos.",
  loro: "Loro Loco llega pronto con una historia alegre para el rancho.",
  oso: "Oso Taquito llegará pronto para compartir una merienda imaginaria.",
  capybara: "Capybara llegará pronto para descansar junto al arroyo.",
} as const;

function characterById(id: CharacterId) { return characters.find((character) => character.id === id)!; }

function CharacterArt({ characterId, appearance, compact = false }: { characterId: CharacterId; appearance: Appearance[CharacterId]; compact?: boolean }) {
  const resolved = resolveAppearance({ [characterId]: appearance } as Appearance, characterId);
  const character = resolved.character;
  const [baseFailed, setBaseFailed] = useState(false);
  const layers = resolved.layers;
  return <div className={`character-art ${compact ? "character-art-compact" : ""}`} role="img" aria-label={character.asset.alt}>
    {layers.map((item) => item!.slot === "hair" && <img key={item!.id} className="character-layer" style={{ zIndex: item!.zIndex }} src={item!.asset.runtimePath} alt="" />)}
    {!baseFailed ? <img className="character-base" style={{ zIndex: 20 }} src={character.asset.runtimePath} alt="" onError={() => setBaseFailed(true)} /> : <span className="character-fallback" aria-hidden="true">{characterId === "essma" ? "✦" : "♥"}</span>}
    {layers.map((item) => item!.slot !== "hair" && <img key={item!.id} className="character-layer" style={{ zIndex: item!.zIndex }} src={item!.asset.runtimePath} alt="" />)}
  </div>;
}

function useSound(settings: PlayerProfile["settings"]) {
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const ambienceRef = useRef<HTMLAudioElement | null>(null);
  const play = (name: "confirm" | "cancel") => {
    if (!settings.sfx) return;
    const audio = new Audio(`/assets/audio/v1/${name}.wav`);
    audio.volume = 0.42;
    void audio.play().catch(() => undefined);
  };
  const toggleMusic = () => {
    if (!settings.music) return;
    if (!musicRef.current) { musicRef.current = new Audio("/assets/audio/v1/ranch-loop.wav"); musicRef.current.loop = true; musicRef.current.volume = 0.18; }
    if (!ambienceRef.current) { ambienceRef.current = new Audio("/assets/audio/v1/ambience.wav"); ambienceRef.current.loop = true; ambienceRef.current.volume = 0.08; }
    void musicRef.current.play().catch(() => undefined);
    void ambienceRef.current.play().catch(() => undefined);
  };
  useEffect(() => { if (!settings.music) { musicRef.current?.pause(); ambienceRef.current?.pause(); } }, [settings.music]);
  useEffect(() => () => { musicRef.current?.pause(); ambienceRef.current?.pause(); }, []);
  return { play, toggleMusic };
}

export default function Home() {
  const [screen, setScreen] = useState<Screen>("ranch");
  const [selected, setSelected] = useState<CharacterId>("essma");
  const [profile, setProfile] = useState<PlayerProfile>(() => createStarterProfile());
  const [hydrated, setHydrated] = useState(false);
  const [notice, setNotice] = useState("¡Hola! Elige un amigo en el rancho para empezar a vestir.");
  const [showFirstPlayGuide, setShowFirstPlayGuide] = useState(true);
  const [activeCameo, setActiveCameo] = useState<"loro" | "oso" | "capybara" | null>(null);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [holdProgress, setHoldProgress] = useState(0);
  const [pendingImport, setPendingImport] = useState<PlayerProfile | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastFocusRef = useRef<HTMLElement | null>(null);
  const { play, toggleMusic } = useSound(profile.settings);

  useEffect(() => {
    readSavedProfile().then((saved) => {
      if (saved) { setProfile(saved); setNotice("¡Qué gusto verte de nuevo en el Rancho de Essma!"); }
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
  const selectedItems = useMemo(() => wearables.filter((item) => item.target === selected && profile.unlocks.itemIds.includes(item.id)), [profile.unlocks.itemIds, selected]);
  const availableSlots = useMemo(() => [...new Set(selectedItems.map((item) => item.slot))], [selectedItems]);

  function openDress(character: CharacterId) { setSelected(character); setScreen("dress"); setNotice(`¡Vamos a vestir a ${characterById(character).locale["es-MX"].name}!`); play("confirm"); }
  function handleRanchEvent(event: RanchEvent) {
    if (event.type === "choose-character") return openDress(event.character);
    if (event.story === "map") {
      setNotice("El mapa del granero guarda aventuras para otro día.");
      openDialog("map");
      play("confirm");
      return;
    }
    setNotice(cameoMessages[event.story]);
    if (event.story === "loro" || event.story === "oso" || event.story === "capybara") setActiveCameo(event.story);
    if (event.story === "map" || event.story === "flowers") play("confirm");
  }
  function equip(itemId: string) {
    const item = getWearable(itemId);
    if (!item || !canEquip(profile, selected, item.slot, itemId)) return;
    updateProfile((current) => ({ ...current, appearance: { ...current.appearance, [selected]: { ...current.appearance[selected], [item.slot]: itemId } } }));
    setNotice(`¡Listo! A ${characterById(selected).locale["es-MX"].name} le encanta ${item.locale["es-MX"].name.toLowerCase()}.`);
    play("confirm");
  }
  function resetLook() { updateProfile((current) => ({ ...current, appearance: resetAppearance(current.appearance, selected) })); setNotice(`El look de ${characterById(selected).locale["es-MX"].name} volvió a empezar.`); play("cancel"); }
  function surprise() {
    updateProfile((current) => ({ ...current, appearance: randomizeAppearance(current, selected) }));
    setNotice("¡Qué sorpresa! Mira ese nuevo estilo."); play("confirm");
  }
  function toggleSetting(key: keyof PlayerProfile["settings"]) { updateProfile((current) => ({ ...current, settings: { ...current.settings, [key]: !current.settings[key] } })); }
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
    <header className="topbar"><button className="brand" onClick={() => setScreen("ranch")} aria-label="Volver al Rancho de Essma"><span>ESSMA</span><small>WORLD</small></button><div className="topbar-right"><span className="sun-chip">☀ Rancho de Essma</span><button className="round-button" onClick={(event) => openDialog("settings", event.currentTarget)} aria-label="Abrir ajustes">⚙</button></div></header>
    <section className={`play-area ${screen === "dress" ? "is-dressing" : ""}`}>
      {screen === "ranch" && <div className="ranch-stage"><RanchScene appearance={profile.appearance} selectedCharacter={selected} reducedMotion={profile.settings.reducedMotion} onEvent={handleRanchEvent} />{showFirstPlayGuide && <aside className="first-play-guide" aria-label="Cómo jugar"><div><p>¡HOLA, ESSMA!</p><strong>¿A quién vestimos hoy?</strong><span>Toca a un amigo del rancho, elige su ropita y vuelve a verlo aquí.</span></div><div><button onClick={() => openDress("essma")}>Vestir a Essma</button><button className="guide-dismiss" onClick={() => setShowFirstPlayGuide(false)}>¡Vamos a explorar!</button></div></aside>}</div>}
      {screen === "dress" && <section className="dress-room" aria-label="Vestir"><div className="dress-room-head"><button className="back-button" onClick={() => setScreen("ranch")}>← <span>Rancho</span></button><div><p>VESTIR</p><h1>{characterById(selected).locale["es-MX"].name}</h1></div><button className="done-button" onClick={() => setScreen("ranch")}>¡Listo! ✓</button></div><div className="dress-grid"><aside className="friend-selector" aria-label="Elige a un amigo">{characters.map((character) => <button key={character.id} className={character.id === selected ? "selected" : ""} onClick={() => openDress(character.id)}><CharacterArt characterId={character.id} appearance={profile.appearance[character.id]} compact /><span>{character.locale["es-MX"].name}</span></button>)}</aside><section className="preview-card"><div className="sunbeam" /><CharacterArt characterId={selected} appearance={profile.appearance[selected]} /><p>{characterById(selected).locale["es-MX"].description}</p><div className="look-slots">{availableSlots.map((slot) => <span key={slot}>{slotNames[slot]}</span>)}</div></section><section className="closet" aria-label="Ropita y accesorios"><div className="closet-heading"><div><p>EL CLÓSET DE</p><h2>{characterById(selected).locale["es-MX"].name.toUpperCase()}</h2></div><button onClick={surprise}>✦ Sorpresa</button></div><div className="item-grid">{selectedItems.map((item) => { const equipped = profile.appearance[selected][item.slot] === item.id; return <button key={item.id} className={`item-card ${equipped ? "equipped" : ""}`} onClick={() => equip(item.id)} aria-pressed={equipped}><img src={item.asset.thumbnailPath} alt="" onError={(event) => { event.currentTarget.hidden = true; }} /><span>{item.locale["es-MX"].name}</span><small>{slotNames[item.slot]}</small></button>; })}</div><div className="closet-footer"><button onClick={resetLook}>↺ Reiniciar</button><span>{hydrated ? "Guardado en este dispositivo" : "Preparando tu baúl…"}</span></div></section></div></section>}
    </section>
    <aside className="message-card" aria-live="polite"><span>✦</span><p>{notice}</p></aside>
    {activeCameo && <aside className="cameo-card" aria-label={cameos.find((cameo) => cameo.id === activeCameo)?.asset.alt}><img src={cameos.find((cameo) => cameo.id === activeCameo)?.asset.runtimePath} alt="" /><p>{cameos.find((cameo) => cameo.id === activeCameo)?.locale["es-MX"].name}</p></aside>}
    <nav className="quick-actions" aria-label="Acciones principales"><button onClick={() => setScreen("ranch")}>🏡 <span>Rancho</span></button><button onClick={() => openDress("essma")}>👗 <span>Vestir</span></button><button onClick={(event) => openDialog("collection", event.currentTarget)}>🎒 <span>Colección ({profile.unlocks.itemIds.length}/{wearables.length})</span></button><button onClick={toggleMusic}>🎵 <span>Escuchar música</span></button></nav>
    {dialog && <div className="modal-backdrop" role="presentation" onMouseDown={closeDialog}><section className="settings-card" role="dialog" aria-modal="true" aria-label={dialog === "collection" ? "Colección" : dialog === "map" ? "El mapa del rancho" : dialog === "adult" ? "Opciones para adultos" : "Ajustes"} onMouseDown={(event) => event.stopPropagation()}>
      {dialog === "settings" && <><div className="settings-heading"><div><p>RANCHO DE ESSMA</p><h2>Ajustes</h2></div><button onClick={closeDialog} aria-label="Cerrar ajustes">×</button></div><label><span>🎵 Música</span><input type="checkbox" checked={profile.settings.music} onChange={() => toggleSetting("music")} /></label><label><span>🔔 Sonidos</span><input type="checkbox" checked={profile.settings.sfx} onChange={() => toggleSetting("sfx")} /></label><label><span>🌙 Movimiento suave</span><input type="checkbox" checked={profile.settings.reducedMotion} onChange={() => toggleSetting("reducedMotion")} /></label><div className="backup-box"><p><b>Opciones para adultos</b><br />Los respaldos pueden reemplazar los estilos guardados en este dispositivo.</p><button className="adult-entry" onPointerDown={startAdultHold} onKeyDown={(event) => { if (event.key === " ") startAdultHold(); }} onKeyUp={() => setHoldProgress(0)} style={{ "--hold": holdProgress } as CSSProperties}>Mantén presionado 2 segundos</button></div></>}
      {dialog === "adult" && <><div className="settings-heading"><div><p>SOLO PARA PERSONAS ADULTAS</p><h2>Respaldos</h2></div><button onClick={closeDialog} aria-label="Cerrar">×</button></div><p>Un respaldo guarda los looks y ajustes en un archivo. Abrir uno no envía información a ningún lugar, pero puede reemplazar el estilo de este dispositivo.</p><div className="adult-actions"><button onClick={exportBackup}>⇩ Guardar respaldo</button><button onClick={() => inputRef.current?.click()}>⇧ Abrir respaldo</button></div><input ref={inputRef} type="file" accept="application/json" onChange={importBackup} hidden /></>}
      {dialog === "confirm-import" && <><h2>¿Reemplazar el estilo guardado?</h2><p>Revisamos el archivo antes de abrir esta pregunta. Si continúas, los looks y ajustes actuales de este dispositivo serán reemplazados.</p><div className="adult-actions"><button onClick={replaceWithBackup}>Sí, reemplazar</button><button onClick={closeDialog}>No, conservar lo actual</button></div></>}
      {dialog === "collection" && <><div className="settings-heading"><div><p>TESOROS DEL RANCHO</p><h2>Colección</h2></div><button onClick={closeDialog} aria-label="Cerrar colección">×</button></div><p>{profile.unlocks.itemIds.length} de {wearables.length} prendas iniciales disponibles.</p><ul className="collection-list">{wearables.map((item) => <li key={item.id}>{profile.unlocks.itemIds.includes(item.id) ? "✓" : "○"} {item.locale["es-MX"].name}</li>)}</ul></>}
      {dialog === "map" && <><div className="settings-heading"><div><p>EL MAPA DEL GRANERO</p><h2>¿A dónde vamos?</h2></div><button onClick={closeDialog} aria-label="Cerrar el mapa">×</button></div><p>Hoy podemos jugar en el Rancho de Essma. Las demás aventuras estarán listas más adelante.</p><ul className="map-journal" aria-label="Lugares del mapa"><li className="map-place is-available"><span aria-hidden="true">🏡</span><div><b>Rancho de Essma</b><small>Disponible ahora</small></div><button onClick={closeDialog}>Seguir jugando</button></li><li className="map-place"><span aria-hidden="true">🌵</span><div><b>Desierto</b><small>Próximamente</small></div><em>🔒</em></li><li className="map-place"><span aria-hidden="true">🪅</span><div><b>Pueblo</b><small>Próximamente</small></div><em>🔒</em></li><li className="map-place"><span aria-hidden="true">💧</span><div><b>Oasis</b><small>Próximamente</small></div><em>🔒</em></li></ul></>}
    </section></div>}
  </main>;
}
