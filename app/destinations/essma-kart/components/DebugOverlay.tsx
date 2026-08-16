import React from 'react';
import { useGameStore } from '../store/gameStore';
import { Wrench, X, Play, RefreshCw, Zap } from 'lucide-react';
import { ItemType, CharacterId } from '../types';

export const DebugOverlay: React.FC = () => {
  const {
    qaParams,
    toggleDebug,
    resetRace,
    setStatus,
    selectCharacter,
    updateRaceState,
  } = useGameStore();

  const handleForceItem = (item: ItemType) => {
    updateRaceState({ playerItem: item });
  };

  const handleForceCharacter = (char: CharacterId) => {
    selectCharacter(char);
  };

  const currentUrl = `${window.location.origin}${window.location.pathname}?track=sonora&character=essma&lap=3&position=1&item=heart_shield&seed=42&god=1`;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6 z-50 select-none">
      <div className="bg-slate-900 border border-amber-500/50 rounded-3xl p-6 max-w-lg w-full flex flex-col gap-5 text-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-black text-amber-400">DETERMINISTIC QA DEBUGGER</h3>
          </div>
          <button onClick={toggleDebug} className="p-1 hover:bg-slate-800 rounded-lg text-slate-400">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* URL Parameters Info */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
          <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Deterministic Test URL Fixture</span>
          <code className="text-xs text-amber-300 font-mono break-all">{currentUrl}</code>
        </div>

        {/* Quick Item Injections */}
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase block mb-2">Inject Item Slot</span>
          <div className="flex gap-2">
            {[
              { label: '💖 Heart Shield', type: 'heart_shield' as ItemType },
              { label: '⚡ Lightning Boost', type: 'lightning_boost' as ItemType },
              { label: '🌵 Cactus Ball', type: 'cactus_ball' as ItemType },
            ].map((btn) => (
              <button
                key={btn.type}
                onClick={() => handleForceItem(btn.type)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 py-2 rounded-xl text-xs font-extrabold text-amber-300"
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Force Character Switch */}
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase block mb-2">Force Driver Selection</span>
          <div className="grid grid-cols-4 gap-2">
            {(['essma', 'juancito', 'tori', 'anita'] as CharacterId[]).map((c) => (
              <button
                key={c}
                onClick={() => handleForceCharacter(c)}
                className="bg-slate-800 hover:bg-slate-700 border border-slate-700 py-2 rounded-xl text-xs font-bold text-white capitalize"
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Race Controls */}
        <div className="flex gap-3 border-t border-slate-800 pt-3">
          <button
            onClick={() => {
              resetRace();
              toggleDebug();
            }}
            className="flex-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            RESET RACE GRID
          </button>
          <button
            onClick={() => {
              setStatus('grid');
              toggleDebug();
            }}
            className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 rounded-xl text-sm"
          >
            TELEPORT TO START
          </button>
        </div>
      </div>
    </div>
  );
};
