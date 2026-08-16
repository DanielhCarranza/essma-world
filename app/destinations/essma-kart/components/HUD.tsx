import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { motion, AnimatePresence } from 'motion/react';
import { Pause, Shield, Zap, CircleAlert, Sparkles } from 'lucide-react';
import { ItemType } from '../types';
import { Minimap } from './Minimap';
import { audio } from '../game/audioEngine';
import { ALL_TRACKS } from '../game/trackData';

interface HUDProps {
  onUseItem: () => void;
  onDrift: (holding: boolean) => void;
  onSteer: (dir: number) => void;
  onAccelerate: (holding: boolean) => void;
}

const ROULETTE_ICONS = ['🍌', '🌵', '⚡', '🛡️', '🌮'];

export const HUD: React.FC<HUDProps> = ({ onUseItem, onDrift, onSteer, onAccelerate }) => {
  const currentLap = useGameStore((s) => s.currentLap);
  const totalLaps = useGameStore((s) => s.totalLaps);
  const playerRank = useGameStore((s) => s.playerRank);
  const playerSpeed = useGameStore((s) => s.playerSpeed);
  const playerItem = useGameStore((s) => s.playerItem);
  const playerCoins = useGameStore((s) => s.playerCoins);
  const wrongWay = useGameStore((s) => s.wrongWay);
  const countdownValue = useGameStore((s) => s.countdownValue);
  const showTouchOverlay = useGameStore((s) => s.showTouchOverlay);
  const togglePause = useGameStore((s) => s.togglePause);
  const selectedTrack = useGameStore((s) => s.selectedTrack);

  const activeTrackObj = ALL_TRACKS.find((t) => t.id === selectedTrack) || ALL_TRACKS[0];

  const [rouletteActive, setRouletteActive] = useState(false);
  const [rouletteIndex, setRouletteIndex] = useState(0);

  // Trigger roulette animation when an item is collected
  useEffect(() => {
    if (playerItem !== 'none') {
      setRouletteActive(true);
      let count = 0;
      const interval = setInterval(() => {
        count += 1;
        setRouletteIndex((prev) => (prev + 1) % ROULETTE_ICONS.length);
        if (count % 2 === 0) audio.playCoin();
        if (count >= 10) {
          clearInterval(interval);
          setRouletteActive(false);
          audio.playBoost();
        }
      }, 90);
      return () => clearInterval(interval);
    } else {
      setRouletteActive(false);
    }
  }, [playerItem]);

  const getRankSuffix = (rank: number) => {
    if (rank === 1) return 'st';
    if (rank === 2) return 'nd';
    if (rank === 3) return 'rd';
    return 'th';
  };

  const getItemIcon = (item: ItemType) => {
    if (rouletteActive) {
      return <span className="text-3xl animate-spin">{ROULETTE_ICONS[rouletteIndex]}</span>;
    }
    if (item === 'heart_shield') return <Shield className="w-8 h-8 text-pink-400 animate-pulse" />;
    if (item === 'lightning_boost') return <Zap className="w-8 h-8 text-yellow-300 animate-bounce" />;
    if (item === 'cactus_ball') return <span className="text-3xl">🌵</span>;
    if (item === 'banana') return <span className="text-3xl animate-bounce">🍌</span>;
    return <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Empty</span>;
  };

  const isHighSpeed = playerSpeed > 32;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 select-none z-10 overflow-hidden">
      {/* High-Speed Radial Motion Lines VFX */}
      {isHighSpeed && (
        <div className="absolute inset-0 pointer-events-none z-0 opacity-40 mix-blend-screen bg-[radial-gradient(circle_at_center,_transparent_40%,_rgba(255,255,255,0.8)_100%)] animate-pulse" />
      )}
      {/* 3... 2... 1... GO! Countdown Banner */}
      <AnimatePresence>
        {countdownValue && (
          <motion.div
            initial={{ scale: 0.2, opacity: 0 }}
            animate={{ scale: 1.2, opacity: 1 }}
            exit={{ scale: 2, opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <span className="text-7xl md:text-9xl font-black text-amber-400 drop-shadow-[0_8px_0_rgba(0,0,0,0.8)] tracking-wider italic">
              {countdownValue}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header Bar */}
      <div className="flex items-center justify-between w-full">
        {/* Placement Badge & Lap Counter */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-900/90 backdrop-blur border-2 border-amber-400 rounded-2xl px-4 py-2 flex items-baseline gap-1 shadow-lg">
            <span className="text-3xl md:text-4xl font-black text-amber-400">{playerRank}</span>
            <span className="text-base font-extrabold text-amber-200">{getRankSuffix(playerRank)}</span>
          </div>

          <div className="bg-slate-900/90 backdrop-blur border-2 border-slate-700 rounded-2xl px-3.5 py-1.5 flex flex-col">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold">Lap</span>
            <span className="text-xl font-black text-white">{currentLap} / {totalLaps}</span>
          </div>
        </div>

        {/* Center Track Name Plaque */}
        <div className="hidden sm:flex items-center gap-2 bg-[#78350F] border-2 border-amber-400/80 px-4 py-1.5 rounded-full shadow-xl">
          <span className="text-amber-300 font-black text-xs uppercase tracking-wider italic">
            🏁 {activeTrackObj.name}
          </span>
        </div>

        {/* Item Slot & Pause Button */}
        <div className="flex items-center gap-3 pointer-events-auto">
          {/* Item Box Slot */}
          <button
            onClick={onUseItem}
            className={`w-16 h-16 md:w-20 md:h-20 bg-slate-900/90 border-4 rounded-2xl flex items-center justify-center transition-transform active:scale-95 shadow-xl ${
              playerItem !== 'none' ? 'border-amber-400 bg-amber-500/20' : 'border-slate-700'
            }`}
          >
            {getItemIcon(playerItem)}
          </button>

          {/* Pause Toggle */}
          <button
            onClick={togglePause}
            className="w-12 h-12 bg-slate-900/80 hover:bg-slate-800 border-2 border-slate-700 rounded-xl flex items-center justify-center text-white shadow-lg"
          >
            <Pause className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Wrong Direction Alert */}
      {wrongWay && (
        <div className="self-center bg-red-600/90 text-white px-6 py-2 rounded-2xl font-black text-xl flex items-center gap-2 animate-bounce border-2 border-white shadow-2xl">
          <CircleAlert className="w-6 h-6" />
          WRONG DIRECTION!
        </div>
      )}

      {/* Bottom Bar: Coins, Minimap & Speedometer */}
      <div className="flex items-end justify-between w-full">
        {/* Left Side: Coins & Minimap */}
        <div className="flex flex-col md:flex-row items-start md:items-end gap-3">
          <div className="bg-slate-900/80 backdrop-blur border-2 border-amber-500/50 rounded-2xl px-4 py-2 flex items-center gap-2">
            <span className="text-2xl">🌮</span>
            <span className="text-2xl font-black text-amber-400">{playerCoins}</span>
          </div>

          <Minimap />
        </div>

        {/* Speedometer */}
        <div className="bg-slate-900/80 backdrop-blur border-2 border-slate-700 rounded-2xl px-5 py-2 flex flex-col items-end">
          <span className="text-3xl font-black text-sky-400 tracking-tight">{playerSpeed} <span className="text-sm font-bold text-slate-400">KM/H</span></span>
        </div>
      </div>

      {/* Touch Overlay Controls for Mobile */}
      {showTouchOverlay && (
        <div className="absolute inset-x-0 bottom-6 px-6 flex items-center justify-between pointer-events-auto">
          {/* Steering Pad */}
          <div className="flex gap-3">
            <button
              onMouseDown={() => onSteer(1)}
              onMouseUp={() => onSteer(0)}
              onTouchStart={() => onSteer(1)}
              onTouchEnd={() => onSteer(0)}
              className="w-16 h-16 bg-slate-800/80 active:bg-amber-500/80 border-2 border-slate-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl"
            >
              ◀
            </button>
            <button
              onMouseDown={() => onSteer(-1)}
              onMouseUp={() => onSteer(0)}
              onTouchStart={() => onSteer(-1)}
              onTouchEnd={() => onSteer(0)}
              className="w-16 h-16 bg-slate-800/80 active:bg-amber-500/80 border-2 border-slate-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl"
            >
              ▶
            </button>
          </div>

          {/* Action Buttons (Drift & Drive) */}
          <div className="flex gap-3">
            <button
              onMouseDown={() => onDrift(true)}
              onMouseUp={() => onDrift(false)}
              onTouchStart={() => onDrift(true)}
              onTouchEnd={() => onDrift(false)}
              className="w-16 h-16 bg-pink-600/80 active:bg-pink-500 border-2 border-pink-400 rounded-2xl flex items-center justify-center text-white font-extrabold text-sm shadow-xl"
            >
              DRIFT
            </button>
            <button
              onMouseDown={() => onAccelerate(true)}
              onMouseUp={() => onAccelerate(false)}
              onTouchStart={() => onAccelerate(true)}
              onTouchEnd={() => onAccelerate(false)}
              className="w-16 h-16 bg-amber-500/80 active:bg-amber-400 border-2 border-amber-300 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-xl"
            >
              GO!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
