"use client";

import {
  ChangeEvent,
  CSSProperties,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type CharacterId = "essma" | "juancito" | "tori" | "anita";
type Slot = "hair" | "outfit" | "shoes" | "accessory" | "head" | "neck" | "body";

type Wearable = {
  id: string;
  target: CharacterId;
  slot: Slot;
  name: string;
  icon: string;
  color: string;
};

type Profile = {
  schemaVersion: 1;
  profileId: "local-primary";
  appearance: Record<CharacterId, Partial<Record<Slot, string>>>;
  settings: { music: boolean; sfx: boolean; reducedMotion: boolean };
};

const characters: Record<CharacterId, { name: string; kind: string; icon: string; color: string }> = {
  essma: { name: "Essma", kind: "Exploradora del rancho", icon: "🌻", color: "#ef8d46" },
  juancito: { name: "Juancito", kind: "Perrito de la pradera", icon: "🐿️", color: "#98a84a" },
  tori: { name: "Tori", kind: "Cacomixtle", icon: "🦝", color: "#5c8ba8" },
  anita: { name: "Anita", kind: "Vaquita", icon: "🐮", color: "#d87787" },
};

const wearables: Wearable[] = [
  { id: "wearable.essma.trenza-cobre", target: "essma", slot: "hair", name: "Trenza cobriza", icon: "🎀", color: "#9a4e32" },
  { id: "wearable.essma.vestido-girasol", target: "essma", slot: "outfit", name: "Vestido girasol", icon: "👗", color: "#f3b437" },
  { id: "wearable.essma.botitas-camino", target: "essma", slot: "shoes", name: "Botitas de camino", icon: "👢", color: "#83513b" },
  { id: "wearable.essma.diademita-flor", target: "essma", slot: "accessory", name: "Diademita de flor", icon: "🌸", color: "#d65a7d" },
  { id: "wearable.juancito.gorrito-aventurero", target: "juancito", slot: "head", name: "Gorrito aventurero", icon: "🧢", color: "#c47d2b" },
  { id: "wearable.juancito.chaleco-bolsitas", target: "juancito", slot: "body", name: "Chaleco con bolsitas", icon: "🦺", color: "#d59a43" },
  { id: "wearable.tori.panuelo-azul", target: "tori", slot: "neck", name: "Pañuelo azul", icon: "🔷", color: "#3477b9" },
  { id: "wearable.tori.gorrito-hojita", target: "tori", slot: "head", name: "Gorrito de hojita", icon: "🍃", color: "#548a48" },
  { id: "wearable.anita.chaleco-margarita", target: "anita", slot: "body", name: "Chaleco margarita", icon: "🌼", color: "#f0cd61" },
  { id: "wearable.anita.panuelo-rosa", target: "anita", slot: "neck", name: "Pañuelo rosa", icon: "🩷", color: "#d96284" },
];

const starterProfile = (): Profile => ({
  schemaVersion: 1,
  profileId: "local-primary",
  appearance: { essma: {}, juancito: {}, tori: {}, anita: {} },
  settings: { music: true, sfx: true, reducedMotion: false },
});

function openProfileDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("essma-world", 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains("profiles")) request.result.createObjectStore("profiles");
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function readProfile(): Promise<Profile | null> {
  const db = await openProfileDb();
  return new Promise((resolve, reject) => {
    const request = db.transaction("profiles", "readonly").objectStore("profiles").get("local-primary");
    request.onsuccess = () => resolve(isProfile(request.result) ? request.result : null);
    request.onerror = () => reject(request.error);
  });
}

async function writeProfile(profile: Profile) {
  const db = await openProfileDb();
  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction("profiles", "readwrite");
    transaction.objectStore("profiles").put(profile, "local-primary");
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

function isProfile(value: unknown): value is Profile {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<Profile>;
  return candidate.schemaVersion === 1 && candidate.profileId === "local-primary" && !!candidate.appearance && !!candidate.settings;
}

function slotLabel(slot: Slot) {
  return { hair: "Peinado", outfit: "Ropa", shoes: "Botitas", accessory: "Accesorios", head: "Cabeza", neck: "Cuello", body: "Cuerpo" }[slot];
}

function CharacterDoll({ character, appearance, compact = false }: { character: CharacterId; appearance: Partial<Record<Slot, string>>; compact?: boolean }) {
  const chosen = Object.values(appearance).map((id) => wearables.find((item) => item.id === id)).filter(Boolean) as Wearable[];
  const itemFor = (slot: Slot) => chosen.find((item) => item.slot === slot);
  const record = characters[character];
  return (
    <div className={`doll doll-${character} ${compact ? "doll-compact" : ""}`} aria-label={`${record.name}, ${record.kind}`}>
      <div className="doll-sun" />
      <div className="doll-head">{character === "essma" ? <><span className="essma-hair">〰〰</span><span className="essma-bow">🎀</span></> : <span className="animal-face">{record.icon}</span>}</div>
      {itemFor("head") && <span className="doll-item doll-head-item" style={{ background: itemFor("head")?.color }}>{itemFor("head")?.icon}</span>}
      {itemFor("hair") && <span className="doll-item doll-hair-item" style={{ background: itemFor("hair")?.color }}>{itemFor("hair")?.icon}</span>}
      <div className="doll-body" style={{ "--doll-color": record.color } as CSSProperties}>
        <span className="doll-base-icon">{character === "essma" ? "✦" : "♥"}</span>
      </div>
      {itemFor("outfit") && <span className="doll-item doll-outfit-item" style={{ background: itemFor("outfit")?.color }}>{itemFor("outfit")?.icon}</span>}
      {itemFor("body") && <span className="doll-item doll-outfit-item" style={{ background: itemFor("body")?.color }}>{itemFor("body")?.icon}</span>}
      {itemFor("neck") && <span className="doll-item doll-neck-item" style={{ background: itemFor("neck")?.color }}>{itemFor("neck")?.icon}</span>}
      {itemFor("accessory") && <span className="doll-item doll-accessory-item" style={{ background: itemFor("accessory")?.color }}>{itemFor("accessory")?.icon}</span>}
      {itemFor("shoes") && <span className="doll-item doll-shoes-item" style={{ background: itemFor("shoes")?.color }}>{itemFor("shoes")?.icon}</span>}
    </div>
  );
}

export default function Home() {
  const [screen, setScreen] = useState<"ranch" | "dress">("ranch");
  const [selected, setSelected] = useState<CharacterId>("essma");
  const [profile, setProfile] = useState<Profile>(starterProfile);
  const [hydrated, setHydrated] = useState(false);
  const [notice, setNotice] = useState("¡Hola, Essma! ¿A quién vestimos hoy?");
  const [showSettings, setShowSettings] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    readProfile().then((saved) => { if (saved) setProfile(saved); }).catch(() => setNotice("Tu estilo se guardará cuando este dispositivo esté listo.")).finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (hydrated) void writeProfile(profile).catch(() => setNotice("No pudimos guardar todavía. Puedes seguir jugando."));
  }, [profile, hydrated]);

  const selectedItems = useMemo(() => wearables.filter((item) => item.target === selected), [selected]);
  const availableSlots = useMemo(() => [...new Set(selectedItems.map((item) => item.slot))], [selectedItems]);

  function openDress(character: CharacterId) {
    setSelected(character);
    setScreen("dress");
    setNotice(`¡Vamos a vestir a ${characters[character].name}!`);
  }

  function equip(item: Wearable) {
    setProfile((current) => ({ ...current, appearance: { ...current.appearance, [item.target]: { ...current.appearance[item.target], [item.slot]: item.id } } }));
    setNotice(`¡Listo! A ${characters[item.target].name} le encanta su ${item.name.toLowerCase()}.`);
  }

  function resetLook() {
    setProfile((current) => ({ ...current, appearance: { ...current.appearance, [selected]: {} } }));
    setNotice(`El look de ${characters[selected].name} volvió a empezar.`);
  }

  function surprise() {
    const next: Partial<Record<Slot, string>> = {};
    availableSlots.forEach((slot) => {
      const choices = selectedItems.filter((item) => item.slot === slot);
      next[slot] = choices[Math.floor(Math.random() * choices.length)]?.id;
    });
    setProfile((current) => ({ ...current, appearance: { ...current.appearance, [selected]: next } }));
    setNotice("¡Qué sorpresa! Mira ese nuevo estilo.");
  }

  function exportBackup() {
    const blob = new Blob([JSON.stringify(profile, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "essma-world-respaldo.json";
    link.click();
    URL.revokeObjectURL(link.href);
    setNotice("Tu respaldo está listo.");
  }

  function importBackup(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const next = JSON.parse(String(reader.result));
        if (!isProfile(next)) throw new Error("invalid");
        if (window.confirm("¿Reemplazar el estilo guardado en este dispositivo?")) {
          setProfile(next);
          setNotice("¡El respaldo está listo para jugar!");
        }
      } catch { setNotice("Ese archivo no es un respaldo de Essma World."); }
    };
    reader.readAsText(file);
    event.target.value = "";
  }

  const toggleSetting = (key: keyof Profile["settings"]) => setProfile((current) => ({ ...current, settings: { ...current.settings, [key]: !current.settings[key] } }));

  return (
    <main className={`game-shell ${profile.settings.reducedMotion ? "reduce-motion" : ""}`}>
      <header className="topbar">
        <button className="brand" onClick={() => setScreen("ranch")} aria-label="Volver al Rancho de Essma"><span>ESSMA</span><small>WORLD</small></button>
        <div className="topbar-right"><span className="sun-chip">☀ Rancho de Essma</span><button className="round-button" onClick={() => setShowSettings(true)} aria-label="Abrir ajustes">⚙</button></div>
      </header>

      <section className={`play-area ${screen === "dress" ? "is-dressing" : ""}`}>
        <div className="ranch-stage" aria-hidden={screen === "dress"}>
          <div className="ranch-title"><span>UN DÍA BONITO EN EL</span><strong>Rancho de Essma</strong></div>
          <button className="story-spot spot-map" onClick={() => setNotice("En el granero hay un mapa antiguo. ¡Algún día nos llevará a una aventura!")}>✦ <span>El mapa</span></button>
          <button className="story-spot spot-cactus" onClick={() => setNotice("¡Mira las flores del desierto!")}>🌸 <span>Flores</span></button>
          <button className="story-spot spot-cameo" onClick={() => setNotice("¡Muy pronto conocerás a Loro Loco!")}>🦜 <span>Muy pronto</span></button>
          <div className="friend-trail" aria-label="Elige a un amigo para vestir">
            {(Object.keys(characters) as CharacterId[]).map((id) => <button key={id} className={`ranch-friend ${id === selected ? "is-selected" : ""}`} onClick={() => openDress(id)}><CharacterDoll character={id} appearance={profile.appearance[id]} compact /><span><b>{characters[id].name}</b><small>Vestir</small></span></button>)}
          </div>
        </div>

        {screen === "dress" && <section className="dress-room" aria-label="Vestir">
          <div className="dress-room-head"><button className="back-button" onClick={() => setScreen("ranch")}>← <span>Rancho</span></button><div><p>VESTIR</p><h1>{characters[selected].name}</h1></div><button className="done-button" onClick={() => setScreen("ranch")}>¡Listo! ✓</button></div>
          <div className="dress-grid">
            <aside className="friend-selector" aria-label="Elige a un amigo">{(Object.keys(characters) as CharacterId[]).map((id) => <button key={id} className={id === selected ? "selected" : ""} onClick={() => { setSelected(id); setNotice(`Ahora vestimos a ${characters[id].name}.`); }}><CharacterDoll character={id} appearance={profile.appearance[id]} compact /><span>{characters[id].name}</span></button>)}</aside>
            <section className="preview-card"><div className="sunbeam" /><CharacterDoll character={selected} appearance={profile.appearance[selected]} /><p>{characters[selected].kind}</p><div className="look-slots">{availableSlots.map((slot) => <span key={slot}>{slotLabel(slot)}</span>)}</div></section>
            <section className="closet" aria-label="Ropita y accesorios"><div className="closet-heading"><div><p>EL CLÓSET DE</p><h2>{characters[selected].name.toUpperCase()}</h2></div><button onClick={surprise}>✦ Sorpresa</button></div><div className="item-grid">{selectedItems.map((item) => { const equipped = profile.appearance[selected][item.slot] === item.id; return <button key={item.id} className={`item-card ${equipped ? "equipped" : ""}`} onClick={() => equip(item)} aria-pressed={equipped}><span className="item-icon" style={{ background: item.color }}>{item.icon}</span><span>{item.name}</span><small>{slotLabel(item.slot)}</small></button>; })}</div><div className="closet-footer"><button onClick={resetLook}>↺ Reiniciar</button><span>{hydrated ? "Guardado en este dispositivo" : "Preparando tu baúl…"}</span></div></section>
          </div>
        </section>}
      </section>

      <aside className="message-card" aria-live="polite"><span>✦</span><p>{notice}</p></aside>
      <nav className="quick-actions" aria-label="Acciones principales"><button onClick={() => setScreen("ranch")}>🏡 <span>Rancho</span></button><button onClick={() => openDress("essma")}>👗 <span>Vestir</span></button><button onClick={() => setNotice("Tu colección crecerá con futuras aventuras.")}>🎒 <span>Colección</span></button></nav>

      {showSettings && <div className="modal-backdrop" role="presentation" onMouseDown={() => setShowSettings(false)}><section className="settings-card" role="dialog" aria-modal="true" aria-label="Ajustes" onMouseDown={(event) => event.stopPropagation()}><div className="settings-heading"><div><p>RANCHO DE ESSMA</p><h2>Ajustes</h2></div><button onClick={() => setShowSettings(false)} aria-label="Cerrar ajustes">×</button></div><label><span>🎵 Música</span><input type="checkbox" checked={profile.settings.music} onChange={() => toggleSetting("music")} /></label><label><span>🔔 Sonidos</span><input type="checkbox" checked={profile.settings.sfx} onChange={() => toggleSetting("sfx")} /></label><label><span>🌙 Movimiento suave</span><input type="checkbox" checked={profile.settings.reducedMotion} onChange={() => toggleSetting("reducedMotion")} /></label><div className="backup-box"><p><b>Solo adultos</b><br />Guarda una copia de tus estilos en este dispositivo.</p><div><button onClick={exportBackup}>⇩ Guardar respaldo</button><button onClick={() => inputRef.current?.click()}>⇧ Abrir respaldo</button></div><input ref={inputRef} type="file" accept="application/json" onChange={importBackup} hidden /></div></section></div>}
    </main>
  );
}
