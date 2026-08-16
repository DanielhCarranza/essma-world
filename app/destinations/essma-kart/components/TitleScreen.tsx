"use client";

import React from 'react';
import { useGameStore } from '../store/gameStore';
import { Play, Settings } from 'lucide-react';
import { audio } from '../game/audioEngine';

interface TitleScreenProps {
  onOpenSettings: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({ onOpenSettings }) => {
  const { setStatus } = useGameStore();

  const handleStart = () => {
    audio.init();
    audio.playBoost();
    setStatus('select');
  };

  return (
    <div className="relative w-full h-screen flex flex-col justify-between p-4 md:p-8 select-none overflow-hidden font-sans">
      {/* 1. Full-Screen Cover Background Image Asset */}
      <img
        src="/assets/destinations/essma-kart/v1/cover.jpg"
        alt="Essma Kart Cover Background"
        className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none z-0"
      />

      {/* Subtle overlay gradient at the very bottom for button contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none z-10" />

      {/* 2. Top-Right Settings Quick Action Icon */}
      <div className="relative z-20 flex items-center justify-end gap-2.5 w-full max-w-6xl mx-auto pt-2">
        <button
          onClick={onOpenSettings}
          className="bg-amber-950/80 hover:bg-amber-900 text-amber-200 p-3 rounded-xl border-2 border-amber-400/80 shadow-lg backdrop-blur-md transition-transform active:scale-95 hover:scale-105"
          title="Opciones"
        >
          <Settings className="w-5 h-5 text-amber-300" />
        </button>
      </div>

      {/* 3. Wooden Signpost Menu & Bottom Action */}
      <div className="relative z-20 flex flex-col items-center justify-end mb-4 md:mb-6 w-full max-w-xl mx-auto text-center gap-3">
        {/* Wooden Post Sign Options (PISTAS, PERSONAJES, KARTS, AVENTURA) */}
        <div className="flex flex-wrap justify-center gap-2 mb-2">
          {['PISTAS', 'PERSONAJES', 'KARTS', 'AVENTURA'].map((tab) => (
            <button
              key={tab}
              onClick={handleStart}
              className="bg-[#78350F] hover:bg-[#92400E] text-[#FEF08A] font-black text-xs md:text-sm px-4 py-1.5 rounded-xl border-2 border-[#D97706] shadow-md transition-all hover:scale-105 active:scale-95"
            >
              {tab} 🐾
            </button>
          ))}
        </div>

        {/* STYLED "¡CORRER!" BUTTON */}
        <button
          onClick={handleStart}
          className="w-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-amber-950 font-black text-2xl md:text-3xl py-3.5 px-6 rounded-2xl shadow-[0_8px_0_#78350F] active:translate-y-1.5 active:shadow-[0_2px_0_#78350F] transition-all flex items-center justify-center gap-3 border-4 border-amber-200 cursor-pointer group hover:scale-105"
        >
          <div className="w-10 h-10 bg-amber-950 rounded-xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
            <Play className="w-6 h-6 fill-amber-300 text-amber-300 ml-0.5" />
          </div>
          <span className="tracking-widest uppercase italic drop-shadow-[0_2px_0_rgba(254,240,138,0.8)]">
            ¡CORRER!
          </span>
          <span className="text-2xl group-hover:translate-x-1 transition-transform">🏎️</span>
        </button>
      </div>

      {/* 4. "HECHO CON ❤️ EN SONORA" Plaque (Lower Right - matching Image 1) */}
      <div className="absolute bottom-3 right-3 z-20 bg-amber-950/90 text-amber-200 font-extrabold text-[10px] md:text-xs px-3.5 py-1.5 rounded-xl border-2 border-amber-500/60 shadow-lg flex items-center gap-1.5 backdrop-blur-sm pointer-events-none">
        <span>HECHO CON ❤️ EN SONORA</span>
        <span>🌵</span>
      </div>
    </div>
  );
};
