import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { CHARACTERS, KARTS } from '../content/characters';
import { ALL_TRACKS } from '../game/trackData';
import { CharacterId, KartId } from '../types';
import { ArrowLeft, Play, Sparkles, MapPin, Star, UserCheck, Trophy, Info } from 'lucide-react';
import { audio } from '../game/audioEngine';
import { Kart3DPreview } from './Kart3DPreview';
import { TrackCardImage } from './TrackCardImage';

export const CharacterSelect: React.FC = () => {
  const { save, selectedTrack, selectTrack, selectCharacter, selectKart, setStatus } = useGameStore();
  const [viewMode, setViewMode] = useState<'showroom' | 'roster' | 'items'>('roster');

  const activeTrackObj = ALL_TRACKS.find((t) => t.id === selectedTrack) || ALL_TRACKS[0];
  const selectedCharDef = CHARACTERS[save.selectedCharacter];
  const selectedKartDef = KARTS[save.selectedKart];

  const handleSelectCharacter = (charId: CharacterId) => {
    audio.init();
    audio.playCoin();
    selectCharacter(charId);
    selectKart(CHARACTERS[charId].defaultKart);
  };

  const handleSelectKart = (kartId: KartId) => {
    audio.init();
    audio.playCoin();
    selectKart(kartId);
  };

  const handleTrackClick = (id: string) => {
    audio.init();
    audio.playCoin();
    selectTrack(id);
  };

  const handleStartRace = () => {
    audio.init();
    audio.playBoost();
    setStatus('grid');
  };

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-amber-950 via-stone-900 to-amber-950 text-stone-900 flex flex-col justify-between p-3 md:p-5 select-none overflow-y-auto">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between w-full max-w-6xl mx-auto z-10 gap-2">
        <button
          onClick={() => setStatus('title')}
          className="bg-amber-950/90 hover:bg-amber-900 border-2 border-amber-500/50 text-amber-200 px-4 py-2 rounded-2xl flex items-center gap-2 font-bold shadow-lg transition-transform active:scale-95 text-xs md:text-sm"
        >
          <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
          Volver
        </button>

        {/* View Mode Toggle Buttons */}
        <div className="flex items-center bg-amber-950/90 border-2 border-amber-500/60 p-1 rounded-2xl shadow-xl gap-1">
          <button
            onClick={() => setViewMode('roster')}
            className={`px-3 py-1.5 rounded-xl font-black text-xs md:text-sm transition-all flex items-center gap-1.5 ${
              viewMode === 'roster'
                ? 'bg-amber-400 text-amber-950 shadow-md scale-105'
                : 'text-amber-200 hover:text-amber-100'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            AMIGOS ROSTER 🐾
          </button>
          <button
            onClick={() => setViewMode('showroom')}
            className={`px-3 py-1.5 rounded-xl font-black text-xs md:text-sm transition-all flex items-center gap-1.5 ${
              viewMode === 'showroom'
                ? 'bg-amber-400 text-amber-950 shadow-md scale-105'
                : 'text-amber-200 hover:text-amber-100'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            GARAGE 3D ⚙️
          </button>
          <button
            onClick={() => setViewMode('items')}
            className={`px-3 py-1.5 rounded-xl font-black text-xs md:text-sm transition-all flex items-center gap-1.5 ${
              viewMode === 'items'
                ? 'bg-amber-400 text-amber-950 shadow-md scale-105'
                : 'text-amber-200 hover:text-amber-100'
            }`}
          >
            <Info className="w-4 h-4" />
            ELEMENTOS 🍌
          </button>
        </div>

        <div className="hidden md:flex items-center gap-2 bg-amber-950/80 px-3 py-1.5 rounded-2xl border border-amber-500/40 text-amber-300 text-xs font-bold">
          <span>🪙 {save.coins}</span>
        </div>
      </div>

      {/* VIEW 1: 4-RACER AMIGOS ROSTER (Reference Image 2) */}
      {viewMode === 'roster' && (
        <div className="w-full max-w-6xl mx-auto bg-[#FBF3DC] border-8 border-[#78350F] rounded-3xl p-4 md:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.8)] my-auto z-10 flex flex-col gap-4">
          {/* Wooden Header Banner */}
          <div className="bg-[#78350F] text-[#FEF08A] py-2 px-6 rounded-2xl border-4 border-[#D97706] text-center shadow-md flex items-center justify-between">
            <span className="text-xl">🏁</span>
            <h2 className="text-lg md:text-2xl font-black tracking-wider uppercase italic">
              KARTS DE LOS AMIGOS 🐾
            </h2>
            <span className="text-xl">🏁</span>
          </div>

          {/* 4 Racer Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {(Object.keys(CHARACTERS) as CharacterId[]).map((charId) => {
              const char = CHARACTERS[charId];
              const kart = KARTS[char.defaultKart];
              const isSelected = save.selectedCharacter === charId;

              return (
                <div
                  key={charId}
                  onClick={() => handleSelectCharacter(charId)}
                  className={`bg-stone-100 border-4 rounded-2xl p-3 flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.02] shadow-md relative ${
                    isSelected
                      ? 'border-amber-500 ring-4 ring-amber-400 bg-amber-50/90 shadow-xl'
                      : 'border-stone-300 hover:border-amber-400'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute -top-3 -right-2 bg-amber-500 text-amber-950 font-black text-[10px] px-2 py-0.5 rounded-full border border-amber-200 shadow">
                      SELECCIONADO ✓
                    </div>
                  )}

                  <div>
                    {/* Header: Circle Avatar + Name Badge */}
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="w-10 h-10 rounded-full border-2 border-stone-800 flex items-center justify-center text-xl shadow"
                        style={{ backgroundColor: char.color }}
                      >
                        {char.icon}
                      </div>
                      <div>
                        <h3 className="font-black text-sm uppercase text-stone-900 tracking-wide">{char.name}</h3>
                        <span className="text-[10px] font-extrabold text-stone-600 block">{kart.name}</span>
                      </div>
                    </div>

                    {/* 3D Live Kart Box */}
                    <div className="relative rounded-xl border-2 border-amber-700/30 overflow-hidden mb-2">
                      <Kart3DPreview
                        kartId={char.defaultKart}
                        characterId={charId}
                        className="w-full h-32 rounded-xl"
                      />
                    </div>

                    {/* Character Quote */}
                    <p className="text-[10px] font-extrabold text-amber-900 italic text-center bg-amber-200/50 p-1.5 rounded-xl border border-amber-300/60 mb-2 min-h-[36px] flex items-center justify-center">
                      "{char.tagline}"
                    </p>

                    {/* Stat Bars */}
                    <div className="space-y-1 bg-stone-200/70 p-2 rounded-xl border border-stone-300 text-[9px] font-black">
                      <div className="flex justify-between text-stone-700">
                        <span>VELOCIDAD</span>
                        <span className="text-amber-900">{char.stats.topSpeed}</span>
                      </div>
                      <div className="w-full h-1.5 bg-stone-300 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500" style={{ width: `${char.stats.topSpeed}%` }} />
                      </div>

                      <div className="flex justify-between text-stone-700">
                        <span>ACELERACIÓN</span>
                        <span className="text-amber-900">{char.stats.acceleration}</span>
                      </div>
                      <div className="w-full h-1.5 bg-stone-300 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500" style={{ width: `${char.stats.acceleration}%` }} />
                      </div>

                      <div className="flex justify-between text-stone-700">
                        <span>MANEJO</span>
                        <span className="text-amber-900">{char.stats.handling}</span>
                      </div>
                      <div className="w-full h-1.5 bg-stone-300 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500" style={{ width: `${char.stats.handling}%` }} />
                      </div>

                      <div className="flex justify-between text-stone-700">
                        <span>TURBO</span>
                        <span className="text-amber-900">{char.stats.boostPower}</span>
                      </div>
                      <div className="w-full h-1.5 bg-stone-300 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500" style={{ width: `${char.stats.boostPower}%` }} />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectCharacter(charId);
                    }}
                    className={`w-full mt-3 py-1.5 rounded-xl font-black text-xs transition-all shadow ${
                      isSelected
                        ? 'bg-amber-500 text-amber-950 border border-amber-300'
                        : 'bg-stone-800 text-stone-200 hover:bg-stone-700'
                    }`}
                  >
                    {isSelected ? '✓ CORREDOR LISTO' : 'ELEGIR CORREDOR'}
                  </button>
                </div>
              );
            })}
          </div>

          <p className="text-center text-xs font-black text-amber-950 uppercase tracking-wide">
            CADA KART TIENE SU ESTILO. ¿CUÁL ES EL TUYO? 🐾
          </p>
        </div>
      )}

      {/* VIEW 2: 3D SHOWROOM GARAGE (Detailed customization) */}
      {viewMode === 'showroom' && (
        <div className="w-full max-w-6xl mx-auto bg-[#FBF3DC] border-8 border-[#78350F] rounded-3xl p-4 md:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col md:flex-row gap-6 items-center my-auto z-10">
          <div className="w-full md:w-1/2 flex flex-col items-center">
            <div
              className="w-full px-4 py-2 rounded-2xl text-white font-extrabold flex items-center justify-between shadow-md mb-3"
              style={{ backgroundColor: selectedCharDef.color }}
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">{selectedCharDef.icon}</span>
                <span className="text-lg font-black uppercase">{selectedCharDef.name}</span>
              </div>
              <span className="text-xs bg-black/20 px-3 py-1 rounded-full">{selectedKartDef.name}</span>
            </div>

            <div className="w-full relative">
              <Kart3DPreview
                kartId={save.selectedKart}
                characterId={save.selectedCharacter}
                className="w-full h-56 md:h-64 rounded-2xl border-4 border-amber-700/40 shadow-inner"
              />
            </div>

            <p className="text-xs font-extrabold text-amber-950 italic text-center mt-3 bg-amber-200/60 px-4 py-1.5 rounded-full border border-amber-300">
              "{selectedCharDef.tagline}"
            </p>
          </div>

          <div className="w-full md:w-1/2 flex flex-col justify-between h-full space-y-4">
            <div>
              <span className="text-xs font-black text-amber-900 uppercase tracking-widest block mb-2">
                1. CORREDOR:
              </span>
              <div className="grid grid-cols-4 gap-2">
                {(Object.keys(CHARACTERS) as CharacterId[]).map((charId) => {
                  const char = CHARACTERS[charId];
                  const isSelected = save.selectedCharacter === charId;
                  return (
                    <button
                      key={charId}
                      onClick={() => handleSelectCharacter(charId)}
                      className={`p-2 rounded-2xl border-3 transition-all flex flex-col items-center justify-center gap-1 shadow-sm ${
                        isSelected
                          ? 'border-amber-600 bg-amber-200/90 shadow-md ring-2 ring-amber-500 scale-105'
                          : 'border-stone-300 bg-stone-100/80 hover:border-amber-400'
                      }`}
                    >
                      <span className="text-2xl">{char.icon}</span>
                      <span className="text-[11px] font-black text-stone-900 uppercase">{char.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <span className="text-xs font-black text-amber-900 uppercase tracking-widest block mb-2">
                2. KART:
              </span>
              <div className="grid grid-cols-4 gap-2">
                {(Object.keys(KARTS) as KartId[]).map((kartId) => {
                  const k = KARTS[kartId];
                  const isSelected = save.selectedKart === kartId;
                  return (
                    <button
                      key={kartId}
                      onClick={() => handleSelectKart(kartId)}
                      className={`p-2 rounded-2xl border-2 transition-all flex items-center justify-center gap-1.5 ${
                        isSelected
                          ? 'border-amber-600 bg-amber-300/80 font-black text-amber-950 shadow-sm ring-2 ring-amber-500'
                          : 'border-stone-300 bg-stone-100/80 text-stone-700 hover:border-amber-400 font-bold'
                      }`}
                    >
                      <span className="text-lg">{k.icon}</span>
                      <span className="text-[11px] truncate">{k.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-stone-100/90 border-2 border-stone-300 rounded-2xl p-3 space-y-1.5">
              {[
                { label: 'VELOCIDAD', val: selectedCharDef.stats.topSpeed },
                { label: 'ACELERACIÓN', val: selectedCharDef.stats.acceleration },
                { label: 'MANEJO', val: selectedCharDef.stats.handling },
                { label: 'TURBO BOOST', val: selectedCharDef.stats.boostPower },
              ].map((s) => (
                <div key={s.label} className="flex items-center text-[10px] font-extrabold gap-2">
                  <span className="w-24 text-stone-700">{s.label}</span>
                  <div className="flex-1 h-2.5 bg-stone-200 rounded-full overflow-hidden border border-stone-300">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${s.val}%`, backgroundColor: selectedCharDef.color }}
                    />
                  </div>
                  <span className="w-6 text-right text-amber-900">{s.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: TRACK ITEMS GUIDE (Reference Image 3 - ELEMENTOS EN PISTA) */}
      {viewMode === 'items' && (
        <div className="w-full max-w-6xl mx-auto bg-[#FBF3DC] border-8 border-[#78350F] rounded-3xl p-4 md:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.8)] my-auto z-10 flex flex-col gap-4">
          <div className="bg-[#78350F] text-[#FEF08A] py-2 px-6 rounded-2xl border-4 border-[#D97706] text-center shadow-md flex items-center justify-between">
            <span className="text-xl">🍌</span>
            <h2 className="text-lg md:text-2xl font-black tracking-wider uppercase italic">
              ELEMENTOS EN PISTA 🎁
            </h2>
            <span className="text-xl">⚡</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { name: 'Plátano', icon: '🍌', desc: 'Resbala a los karts que vengan detrás.' },
              { name: 'Caparazón', icon: '🐚', desc: 'Proyectil teledirigido contra rivales.' },
              { name: 'Caja Sorpresa', icon: '🎁', desc: 'Trampa señuelo en medio del camino.' },
              { name: 'Turbo Nitro', icon: '🧪', desc: 'Aceleración máxima instantánea.' },
              { name: 'Moneda de Oro', icon: '🪙', desc: 'Aumenta tu velocidad máxima acumulada.' },
              { name: 'Rayo Eléctrico', icon: '⚡', desc: 'Encoge y frena a todos los oponentes.' },
            ].map((item) => (
              <div key={item.name} className="bg-stone-100 border-3 border-stone-300 rounded-2xl p-3 flex flex-col items-center text-center shadow-sm">
                <span className="text-3xl mb-1">{item.icon}</span>
                <h4 className="font-black text-xs text-amber-950 uppercase mb-1">{item.name}</h4>
                <p className="text-[10px] font-extrabold text-stone-600 leading-tight">{item.desc}</p>
              </div>
            ))}
          </div>

          <p className="text-center text-xs font-black text-amber-950 uppercase tracking-wide">
            ¡DIVERSIÓN, AMISTAD Y VELOCIDAD EN CADA CARRERA! 🐾
          </p>
        </div>
      )}

      {/* TRACK SELECTION BOTTOM STRIP (Always visible) */}
      <div className="w-full max-w-6xl mx-auto bg-stone-900/90 border-4 border-amber-500/60 rounded-2xl p-3 shadow-xl z-10 my-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-amber-400" />
            SELECCIONA PISTA ({activeTrackObj.name.toUpperCase()} - {'⭐'.repeat(activeTrackObj.difficultyStars)})
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {ALL_TRACKS.map((t) => {
            const isSelected = selectedTrack === t.id;
            return (
              <button
                key={t.id}
                onClick={() => handleTrackClick(t.id)}
                className="text-left transition-transform active:scale-95 focus:outline-none"
              >
                <TrackCardImage track={t} isSelected={isSelected} className="w-full h-16 md:h-20" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Play Start CTA Button */}
      <div className="w-full max-w-6xl mx-auto z-10">
        <button
          onClick={handleStartRace}
          className="w-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-amber-950 font-black text-xl md:text-2xl py-3.5 rounded-2xl shadow-[0_6px_0_#92400E] active:translate-y-1 transition-all flex items-center justify-center gap-3 border-4 border-amber-200"
        >
          <Play className="w-7 h-7 fill-amber-950" />
          ¡CORRER EN {activeTrackObj.name.toUpperCase()}! 🚀
        </button>
      </div>
    </div>
  );
};

