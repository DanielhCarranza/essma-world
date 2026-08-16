import React, { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { ALL_TRACKS } from '../game/trackData';
import confetti from 'canvas-confetti';
import { RotateCcw, Home, Sparkles } from 'lucide-react';
import { audio } from '../game/audioEngine';

export const ResultsModal: React.FC = () => {
  const { playerRank, playerCoins, selectedTrack, setStatus, resetRace } = useGameStore();

  const activeTrackObj = ALL_TRACKS.find((t) => t.id === selectedTrack) || ALL_TRACKS[0];

  useEffect(() => {
    audio.playBoost();
    if (playerRank <= 2) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
    }
  }, [playerRank]);

  const handleAgain = () => {
    audio.init();
    audio.playBoost();
    resetRace();
  };

  const handleHome = () => {
    audio.init();
    audio.playCoin();
    setStatus('title');
  };

  const getRankText = (rank: number) => {
    if (rank === 1) return { title: '1º LUGAR — ¡VICTORIA!', medal: '🥇', color: 'text-amber-400' };
    if (rank === 2) return { title: '2º LUGAR — ¡PODIO!', medal: '🥈', color: 'text-slate-300' };
    if (rank === 3) return { title: '3º LUGAR — ¡PODIO!', medal: '🥉', color: 'text-amber-600' };
    return { title: '4º LUGAR FINISH!', medal: '🏎️', color: 'text-slate-400' };
  };

  const res = getRankText(playerRank);

  return (
    <div className="fixed inset-0 bg-stone-950/90 backdrop-blur-md flex items-center justify-center p-4 z-50 select-none overflow-y-auto">
      <div className="bg-[#FBF3DC] border-4 border-[#78350F] rounded-3xl p-6 md:p-8 max-w-md w-full flex flex-col items-center text-center shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
        <span className="text-7xl mb-2 drop-shadow-md">{res.medal}</span>
        <h2 className={`text-3xl font-black italic mb-1 ${res.color}`}>{res.title}</h2>
        <p className="text-amber-900 font-extrabold text-sm mb-4">
          CARRERA DE {activeTrackObj.name.toUpperCase()} FINALIZADA
        </p>

        <div className="w-full bg-amber-950 text-amber-200 border-2 border-amber-600 rounded-2xl p-4 flex items-center justify-around mb-4 shadow-inner">
          <div className="flex flex-col items-center">
            <span className="text-[11px] font-extrabold text-amber-400 uppercase tracking-wide">MONEDAS TACO</span>
            <span className="text-2xl font-black text-amber-300">🌮 +{playerCoins + (5 - playerRank) * 10}</span>
          </div>
          <div className="w-0.5 h-10 bg-amber-700/60" />
          <div className="flex flex-col items-center">
            <span className="text-[11px] font-extrabold text-amber-400 uppercase tracking-wide">TROFEOS</span>
            <span className="text-2xl font-black text-sky-300">+{ (5 - playerRank) * 100 }</span>
          </div>
        </div>

        {/* Consejos de Campeón Banner (matching Image 4 reference) */}
        <div className="w-full bg-amber-900/10 border-2 border-amber-400/40 rounded-2xl p-3 mb-5 text-left">
          <div className="flex items-center gap-1.5 font-black text-xs text-amber-900 uppercase mb-2">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>CONSEJOS DE CAMPEÓN 🏁</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-[10px] text-amber-950 font-bold text-center">
            <div className="bg-amber-100 p-2 rounded-xl border border-amber-300">
              <span className="text-base block mb-0.5">🍌</span>
              <span>USA OBJETOS</span>
            </div>
            <div className="bg-amber-100 p-2 rounded-xl border border-amber-300">
              <span className="text-base block mb-0.5">⭐</span>
              <span>CONOCE LA PISTA</span>
            </div>
            <div className="bg-amber-100 p-2 rounded-xl border border-amber-300">
              <span className="text-base block mb-0.5">🐾</span>
              <span>AYUDA A TU EQUIPO</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={handleAgain}
            className="w-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-amber-950 font-black text-xl py-3.5 rounded-2xl shadow-[0_6px_0_#92400E] active:translate-y-1 transition-all flex items-center justify-center gap-2 border-2 border-amber-200"
          >
            <RotateCcw className="w-5 h-5" />
            CORRER OTRA VEZ
          </button>
          <button
            onClick={handleHome}
            className="w-full bg-amber-950 hover:bg-amber-900 text-amber-200 font-extrabold py-3 rounded-2xl border-2 border-amber-700 flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            MENÚ PRINCIPAL
          </button>
        </div>
      </div>
    </div>
  );
};
