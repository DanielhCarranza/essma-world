import React from 'react';
import { useGameStore } from '../store/gameStore';
import { X, Volume2, Monitor, Touchpad } from 'lucide-react';
import { audio } from '../game/audioEngine';

interface SettingsModalProps {
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const { save, updateSettings } = useGameStore();

  const handleMusicChange = (val: number) => {
    updateSettings({ musicVolume: val });
    audio.setVolumes(val, save.settings.sfxVolume);
  };

  const handleSFXChange = (val: number) => {
    updateSettings({ sfxVolume: val });
    audio.setVolumes(save.settings.musicVolume, val);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6 z-50 select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full flex flex-col gap-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h3 className="text-xl font-extrabold text-amber-400">SETTINGS</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-lg text-slate-400">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Volume Sliders */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between text-sm font-bold text-slate-300 mb-2">
              <span className="flex items-center gap-2"><Volume2 className="w-4 h-4 text-amber-400" /> Music Volume</span>
              <span>{Math.round(save.settings.musicVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={save.settings.musicVolume}
              onChange={(e) => handleMusicChange(parseFloat(e.target.value))}
              className="w-full accent-amber-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-sm font-bold text-slate-300 mb-2">
              <span className="flex items-center gap-2"><Volume2 className="w-4 h-4 text-amber-400" /> Sound Effects</span>
              <span>{Math.round(save.settings.sfxVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={save.settings.sfxVolume}
              onChange={(e) => handleSFXChange(parseFloat(e.target.value))}
              className="w-full accent-amber-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Controls & Assist */}
        <div className="space-y-3 border-t border-slate-800 pt-4">
          <label className="flex items-center justify-between text-sm font-bold text-slate-300 cursor-pointer">
            <span>Touch Screen Overlay</span>
            <input
              type="checkbox"
              checked={save.settings.touchControls}
              onChange={(e) => updateSettings({ touchControls: e.target.checked })}
              className="w-5 h-5 accent-amber-400 rounded cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between text-sm font-bold text-slate-300 cursor-pointer">
            <span>Auto-Accelerate</span>
            <input
              type="checkbox"
              checked={save.settings.autoAccelerate}
              onChange={(e) => updateSettings({ autoAccelerate: e.target.checked })}
              className="w-5 h-5 accent-amber-400 rounded cursor-pointer"
            />
          </label>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-black py-3 rounded-2xl"
        >
          SAVE & CLOSE
        </button>
      </div>
    </div>
  );
};
