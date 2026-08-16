"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useGameStore } from './store/gameStore';
import { GameEngine } from './game/gameEngine';
import { TitleScreen } from './components/TitleScreen';
import { CharacterSelect } from './components/CharacterSelect';
import { Garage } from './components/Garage';
import { HUD } from './components/HUD';
import { ResultsModal } from './components/ResultsModal';
import { SettingsModal } from './components/SettingsModal';
import { audio } from './game/audioEngine';
import { ESSMA_KART_GLB_PATH } from './game/gltfLoader';

export interface EssmaKartAppProps {
  onExit: () => void;
  onUnsupported?: () => void;
  context?: {
    settings: {
      music: boolean;
      sfx: boolean;
      reducedMotion: boolean;
    };
  };
}

export default function App({ onExit, onUnsupported, context }: EssmaKartAppProps) {
  const { status, save, selectedTrack, isPaused, togglePause } = useGameStore();
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const gameEngineRef = useRef<GameEngine | null>(null);

  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    void fetch(ESSMA_KART_GLB_PATH);
  }, []);

  useEffect(() => {
    if (context?.settings) {
      const { save: currentSave, updateSettings } = useGameStore.getState();
      const existing = currentSave.settings;
      const musicVolume = context.settings.music ? (existing.musicVolume || 0.7) : 0;
      const sfxVolume = context.settings.sfx ? (existing.sfxVolume || 0.8) : 0;
      const reducedMotion = context.settings.reducedMotion;

      updateSettings({ musicVolume, sfxVolume, reducedMotion });
      audio.setVolumes(musicVolume, sfxVolume);
    }

    return () => {
      audio.stopEngine();
      audio.stopMusic();
    };
  }, [context?.settings?.music, context?.settings?.sfx, context?.settings?.reducedMotion]);

  // Initialize or re-create game engine when status changes to 'grid' or 'racing'
  useEffect(() => {
    if ((status === 'grid' || status === 'racing') && canvasContainerRef.current) {
      if (gameEngineRef.current) {
        gameEngineRef.current.dispose();
      }

      let engine: GameEngine;
      try {
        engine = new GameEngine(
          canvasContainerRef.current,
          save.selectedCharacter,
          save.selectedKart,
          selectedTrack
        );
      } catch {
        onUnsupported?.();
        return;
      }
      gameEngineRef.current = engine;
      engine.start();

      const handleResize = () => {
        if (canvasContainerRef.current && gameEngineRef.current) {
          gameEngineRef.current.resize(
            canvasContainerRef.current.clientWidth,
            canvasContainerRef.current.clientHeight
          );
        }
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        engine.dispose();
        gameEngineRef.current = null;
      };
    }
  }, [status, save.selectedCharacter, save.selectedKart, selectedTrack, onUnsupported]);

  // Global key shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && (status === 'grid' || status === 'racing')) {
        togglePause();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status, togglePause]);

  return (
    <div className="relative w-full h-screen bg-slate-950 overflow-hidden font-sans">
      {/* 1. Main Views */}
      {status === 'title' && (
        <TitleScreen onOpenSettings={() => setShowSettings(true)} />
      )}

      {status === 'select' && (
        <div className="w-full h-full overflow-y-auto bg-gradient-to-b from-amber-950 via-stone-900 to-amber-950">
          <CharacterSelect />
        </div>
      )}

      {status === 'garage' && <Garage />}

      {/* 2. 3D WebGL Canvas View */}
      {(status === 'grid' || status === 'racing' || status === 'finishing') && (
        <div className="relative w-full h-full">
          <div ref={canvasContainerRef} className="w-full h-full" />
          <HUD
            onUseItem={() => {
              window.dispatchEvent(new KeyboardEvent('keydown', { key: 'e' }));
            }}
            onDrift={(holding) => {
              window.dispatchEvent(
                new KeyboardEvent(holding ? 'keydown' : 'keyup', { key: 'Shift' })
              );
            }}
            onSteer={(dir) => {
              if (dir > 0) {
                window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
                window.dispatchEvent(new KeyboardEvent('keyup', { key: 'd' }));
              } else if (dir < 0) {
                window.dispatchEvent(new KeyboardEvent('keydown', { key: 'd' }));
                window.dispatchEvent(new KeyboardEvent('keyup', { key: 'a' }));
              } else {
                window.dispatchEvent(new KeyboardEvent('keyup', { key: 'a' }));
                window.dispatchEvent(new KeyboardEvent('keyup', { key: 'd' }));
              }
            }}
            onAccelerate={(holding) => {
              window.dispatchEvent(
                new KeyboardEvent(holding ? 'keydown' : 'keyup', { key: 'w' })
              );
            }}
          />
        </div>
      )}

      {/* 3. Results Modal */}
      {status === 'results' && <ResultsModal />}

      {/* 4. Pause Overlay */}
      {isPaused && (status === 'grid' || status === 'racing') && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 select-none">
          <div className="bg-[#FBF3DC] border-8 border-[#78350F] rounded-3xl p-6 max-w-md w-full flex flex-col items-center gap-4 shadow-2xl">
            <div className="bg-[#78350F] text-[#FEF08A] py-2 px-6 rounded-2xl border-2 border-[#D97706] w-full text-center">
              <h3 className="text-2xl font-black italic tracking-wider">CARRERA PAUSADA ⏸️</h3>
            </div>

            {/* Consejos de Campeón Card (Matching Reference Image 4) */}
            <div className="bg-amber-100/90 border-2 border-amber-300 rounded-2xl p-4 w-full text-left space-y-2">
              <h4 className="font-black text-xs text-amber-950 uppercase tracking-widest flex items-center gap-1.5">
                🏆 CONSEJOS DE CAMPEÓN:
              </h4>
              <div className="space-y-1.5 text-[11px] text-stone-800 font-extrabold">
                <p>🍌 <span className="text-amber-900 font-black">USA OBJETOS:</span> En el momento correcto, puede cambiar la carrera a tu favor.</p>
                <p>⭐ <span className="text-amber-900 font-black">CONOCE LA PISTA:</span> Aprende los atajos y cada curva para dominarla.</p>
                <p>🐾 <span className="text-amber-900 font-black">AMIGOS:</span> ¡Compite limpio y diviértete a máxima velocidad!</p>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 w-full">
              <button
                onClick={togglePause}
                className="w-full bg-amber-500 hover:bg-amber-400 text-amber-950 font-black text-lg py-3 rounded-2xl border-2 border-amber-300 shadow-[0_4px_0_#92400E] active:translate-y-1 transition-all"
              >
                REANUDAR CARRERA 🚀
              </button>
              <button
                onClick={() => {
                  togglePause();
                  onExit();
                }}
                className="w-full bg-stone-800 hover:bg-stone-700 text-stone-100 font-black text-sm py-2.5 rounded-2xl border-2 border-stone-600 transition-all"
              >
                SALIR AL MENÚ PRINCIPAL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Modals */}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  );
}
