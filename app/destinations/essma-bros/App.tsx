"use client";

import React, { useState, useCallback, useEffect } from 'react';
import GameView from './game/GameView';
import { audioEngine } from './game/audio';

const ASSETS = {
  essma: '/assets/destinations/essma-bros/v1/essma.jpg',
  juancito: '/assets/destinations/essma-bros/v1/juancito.jpg',
  tori: '/assets/destinations/essma-bros/v1/tori.jpg',
  anita: '/assets/destinations/essma-bros/v1/anita.jpg',
  taquito: '/assets/destinations/essma-bros/v1/taquito.jpg',
  cow: '/assets/destinations/essma-bros/v1/cow.jpg',
  bgDesert: '/assets/destinations/essma-bros/v1/bg-desert.jpg',
  bgMine: '/assets/destinations/essma-bros/v1/bg-mine.jpg',
  bgBoss: '/assets/destinations/essma-bros/v1/bg-boss.jpg',
  coverLandscape: '/assets/destinations/essma-bros/v1/cover.png',
  coverPortrait: '/assets/destinations/essma-bros/v1/cover-portrait.jpg',
} as const;

const CHARACTERS = [
  { id: 'essma', name: 'Essma', src: ASSETS.essma, ability: 'Double Jump & Lasso' },
  { id: 'juancito', name: 'Juancito', src: ASSETS.juancito, ability: 'Speed & Sombrero Throw' },
  { id: 'tori', name: 'Tori', src: ASSETS.tori, ability: 'Wall Slide & Cactus Slide' },
  { id: 'anita', name: 'Anita', src: ASSETS.anita, ability: 'High Jump, Glide & Maraca Shake' },
];

export type EssmaBrosAppProps = {
  onExit: () => void;
  context?: {
    settings: {
      music: boolean;
      sfx: boolean;
      reducedMotion: boolean;
    };
  };
};

export default function App({ onExit: _onExit, context }: EssmaBrosAppProps) {
  const [selectedChar, setSelectedChar] = useState(CHARACTERS[0]);
  const [score, setScore] = useState(0);
  const [tacos, setTacos] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    audioEngine.setEnabled({
      music: context?.settings.music ?? true,
      sfx: context?.settings.sfx ?? true,
    });
    return () => {
      audioEngine.stopBGM();
    };
  }, [context?.settings.music, context?.settings.sfx]);

  const handleScoreChange = useCallback((newScore: number, newTacos: number) => {
    setScore(newScore);
    setTacos(newTacos);
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden font-sans select-none bg-gradient-to-b from-[#38bdf8] via-[#0284c7] to-[#ea580c] text-white">
      
      {/* 1. Fullscreen Main Game Viewport */}
      <div className="absolute inset-0 w-full h-full z-0">
        <GameView 
          playerImageSrc={selectedChar.src} 
          characterId={selectedChar.id} 
          enemyImageSrc={ASSETS.taquito} 
          cowImageSrc={ASSETS.cow} 
          bgImageSrc={ASSETS.bgDesert} 
          mineBgImageSrc={ASSETS.bgMine} 
          bossBgImageSrc={ASSETS.bgBoss} 
          onScoreChange={handleScoreChange} 
        />
      </div>

      {/* 2. Fullscreen Title / Cover Screen */}
      {!gameStarted && (
        <div className="absolute inset-0 z-50 flex flex-col justify-end items-center p-6 md:p-12 bg-black animate-fade-in overflow-hidden">
          <img 
            src={ASSETS.coverLandscape} 
            alt="Essma Bros Official Game Cover" 
            className="absolute inset-0 w-full h-full object-cover object-center select-none pointer-events-none" 
          />

          <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />

          <div className="relative z-10 mb-4 md:mb-8">
            <button
              onClick={() => setGameStarted(true)}
              className="px-12 py-4 md:px-16 md:py-5 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-gray-950 font-black text-2xl md:text-4xl rounded-full shadow-[0_0_40px_rgba(250,204,21,1)] border-4 border-yellow-200 hover:scale-110 active:scale-95 transition-all uppercase tracking-widest flex items-center gap-3 animate-bounce cursor-pointer"
            >
              <span>🎮</span>
              <span>JUGAR</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. Ultra-Compact Floating HUD Pills */}
      {gameStarted && (
        <header className="absolute top-2.5 left-2.5 right-2.5 z-20 pointer-events-none flex flex-wrap items-center justify-between gap-2 max-w-[1400px] mx-auto">
          
          <div className="pointer-events-auto flex items-center gap-2 bg-black/30 backdrop-blur-md border border-white/20 rounded-full px-3 py-1 shadow-lg shrink-0">
            <button 
              onClick={() => setGameStarted(false)}
              className="text-lg md:text-xl font-black italic tracking-wider text-yellow-300 uppercase hover:text-white transition-colors"
              style={{ textShadow: '1.5px 1.5px 0px #DC2626, 2px 2px 0px #000' }}
              title="Return to Cover Menu"
            >
              ESSMA BROS.
            </button>
            <span className="px-2 py-0.5 text-[9px] font-mono font-black bg-yellow-400 text-gray-950 rounded-full shadow-sm uppercase tracking-wider">
              1-1
            </span>
          </div>

          <div className="pointer-events-auto flex items-center gap-1.5 bg-black/35 backdrop-blur-md border border-white/25 rounded-2xl p-1.5 px-2.5 shadow-xl shrink-0">
            <div className="flex items-center gap-1.5">
              {CHARACTERS.map((char) => (
                <button
                  key={char.id}
                  onClick={() => setSelectedChar(char)}
                  title={`${char.name}: ${char.ability}`}
                  className={`flex flex-col items-center justify-center px-2 py-1 rounded-xl transition-all ${
                    selectedChar.id === char.id
                      ? 'bg-gradient-to-b from-yellow-400 to-amber-400 text-gray-950 font-black shadow-[0_0_12px_rgba(250,204,21,0.8)] ring-2 ring-yellow-300 scale-105'
                      : 'bg-black/40 border border-white/15 text-gray-200 hover:bg-white/20 hover:text-white font-medium hover:border-white/40'
                  }`}
                >
                  <div className={`w-9 h-9 md:w-10 md:h-10 rounded-full overflow-hidden shrink-0 transition-transform ${
                    selectedChar.id === char.id ? 'border-2 border-gray-950 bg-white/60' : 'border border-white/50 bg-white/30'
                  }`}>
                    <img src={char.src} alt={char.name} className="w-full h-full object-cover mix-blend-multiply" />
                  </div>
                  <span className="text-[10px] md:text-[11px] leading-tight mt-0.5 tracking-tight">{char.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pointer-events-auto relative flex items-center gap-2 bg-black/30 backdrop-blur-md border border-white/20 rounded-full px-3 py-1 shadow-lg shrink-0">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-400 rotate-12 rounded-full border-b border-yellow-600 shadow-sm"></div>
              <span className="text-xs font-black tracking-wider text-yellow-300 font-mono">x{tacos}</span>
            </div>

            <div className="w-px h-3 bg-white/20"></div>

            <span className="text-xs font-black font-mono tracking-wider text-white">
              {score.toString().padStart(6, '0')}
            </span>

            <button
              onClick={() => setShowControls(!showControls)}
              className="p-0.5 px-2 bg-white/20 hover:bg-white/30 border border-white/30 rounded-full text-[11px] font-bold transition-all flex items-center gap-1 text-white shadow active:scale-95"
            >
              🎮 <span className="hidden sm:inline">Controls</span>
            </button>

            {showControls && (
              <div className="pointer-events-auto absolute top-10 right-0 z-40 bg-black/90 backdrop-blur-2xl border border-white/25 rounded-2xl p-3.5 shadow-2xl text-xs text-gray-200 flex flex-col gap-2 w-64 animate-fade-in">
                <div className="flex justify-between items-center border-b border-white/15 pb-1 font-black text-yellow-300 tracking-wider">
                  <span>🎮 GAME CONTROLS</span>
                  <button onClick={() => setShowControls(false)} className="text-gray-400 hover:text-white text-sm font-bold">✕</button>
                </div>
                <p className="flex justify-between items-center"><span>Move:</span> <strong className="text-white bg-white/10 px-1.5 py-0.5 rounded text-[11px]">Arrow Keys / A, D</strong></p>
                <p className="flex justify-between items-center"><span>Jump:</span> <strong className="text-white bg-white/10 px-1.5 py-0.5 rounded text-[11px]">Space / Up / W</strong></p>
                <p className="flex justify-between items-center"><span>Special:</span> <strong className="text-white bg-white/10 px-1.5 py-0.5 rounded text-[11px]">X / Shift</strong></p>
                <p className="flex justify-between items-center"><span>Pipe / Door:</span> <strong className="text-white bg-white/10 px-1.5 py-0.5 rounded text-[11px]">Down Arrow / S</strong></p>
              </div>
            )}
          </div>

        </header>
      )}

    </div>
  );
}
