"use client";

import { create } from 'zustand';
import { CharacterId, KartId, ItemType, RaceStatus, SaveData, QAParams, Vector3D } from '../types';

import { WheelId, GliderId, PaintId } from '../content/customizations';

const DEFAULT_SAVE: SaveData = {
  version: 1,
  coins: 45,
  unlockedKarts: ['heart', 'lightning', 'acorn', 'butterfly'],
  unlockedCharacters: ['essma', 'juancito', 'tori', 'anita'],
  unlockedWheels: ['standard', 'offroad', 'slick'],
  unlockedGliders: ['standard_wing', 'heart_glider'],
  unlockedPaints: ['original', 'neon_glow', 'sunset_gold'],
  bestLapTimes: {
    sonora: 48.5,
  },
  selectedCharacter: 'essma',
  selectedKart: 'heart',
  selectedWheel: 'standard',
  selectedGlider: 'standard_wing',
  selectedPaint: 'original',
  settings: {
    musicVolume: 0.7,
    sfxVolume: 0.8,
    autoAccelerate: false,
    touchControls: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    quality: 'high',
    reducedMotion: false,
    steeringAssist: true,
  },
};

function loadSave(): SaveData {
  try {
    const raw = localStorage.getItem('essma_kart_save');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.version === 1) return { ...DEFAULT_SAVE, ...parsed };
    }
  } catch (e) {
    console.error('Failed to load save:', e);
  }
  return DEFAULT_SAVE;
}

function parseUrlQAParams(): QAParams {
  const url = new URLSearchParams(window.location.search);
  const character = (url.get('character') as CharacterId) || undefined;
  const item = (url.get('item') as ItemType) || undefined;
  const quality = (url.get('quality') as 'low' | 'medium' | 'high') || undefined;
  const lap = url.get('lap') ? parseInt(url.get('lap')!, 10) : undefined;
  const position = url.get('position') ? parseInt(url.get('position')!, 10) : undefined;
  const seed = url.get('seed') ? parseInt(url.get('seed')!, 10) : undefined;
  const godMode = url.get('god') === '1' || url.get('god') === 'true';

  return { track: url.get('track') || undefined, character, item, quality, lap, position, seed, godMode };
}

interface GameStoreState {
  save: SaveData;
  status: RaceStatus;
  qaParams: QAParams;
  debugOpen: boolean;
  
  // Race live telemetry
  currentLap: number;
  totalLaps: number;
  playerRank: number;
  playerSpeed: number;
  playerItem: ItemType;
  playerCoins: number;
  raceTime: number;
  currentLapTime: number;
  lastLapTime: number;
  wrongWay: boolean;
  countdownValue: number | string; // 3, 2, 1, GO!
  playerPosition: Vector3D;
  playerRotationY: number;
  aiPositions: Vector3D[];
  
  // Controls & UI
  isPaused: boolean;
  showTouchOverlay: boolean;
  fps: number;
  
  selectedTrack: string;
  
  // Actions
  setStatus: (status: RaceStatus) => void;
  selectCharacter: (charId: CharacterId) => void;
  selectKart: (kartId: KartId) => void;
  selectWheel: (wheelId: WheelId) => void;
  selectGlider: (gliderId: GliderId) => void;
  selectPaint: (paintId: PaintId) => void;
  unlockItem: (category: 'wheel' | 'glider' | 'paint', itemId: string, price: number) => boolean;
  selectTrack: (trackId: string) => void;
  updateSettings: (newSettings: Partial<SaveData['settings']>) => void;
  addCoins: (amount: number) => void;
  saveBestTime: (track: string, time: number) => void;
  
  // Live Telemetry updaters
  updateRaceState: (data: Partial<{
    currentLap: number;
    playerRank: number;
    playerSpeed: number;
    playerItem: ItemType;
    playerCoins: number;
    raceTime: number;
    currentLapTime: number;
    lastLapTime: number;
    wrongWay: boolean;
    countdownValue: number | string;
    playerPosition: Vector3D;
    playerRotationY: number;
    aiPositions: Vector3D[];
    fps: number;
  }>) => void;
  
  togglePause: () => void;
  toggleDebug: () => void;
  resetRace: () => void;
}

export const useGameStore = create<GameStoreState>((set, get) => {
  const initialSave = loadSave();
  const qa = parseUrlQAParams();

  // If QA params specify character or quality, update initial
  if (qa.character) initialSave.selectedCharacter = qa.character;
  if (qa.quality) initialSave.settings.quality = qa.quality;

  return {
    save: initialSave,
    status: qa.track || qa.lap ? 'grid' : 'title',
    qaParams: qa,
    debugOpen: false,
    selectedTrack: qa.track || 'sonora',

    currentLap: qa.lap || 1,
    totalLaps: 3,
    playerRank: qa.position || 4,
    playerSpeed: 0,
    playerItem: qa.item || 'none',
    playerCoins: 0,
    raceTime: 0,
    currentLapTime: 0,
    lastLapTime: 0,
    wrongWay: false,
    countdownValue: 3,
    playerPosition: { x: 0, y: 0, z: 0 },
    playerRotationY: 0,
    aiPositions: [],

    isPaused: false,
    showTouchOverlay: initialSave.settings.touchControls,
    fps: 60,

    setStatus: (status) => set({ status }),
    selectCharacter: (charId) => {
      const { save } = get();
      const updated = { ...save, selectedCharacter: charId };
      localStorage.setItem('essma_kart_save', JSON.stringify(updated));
      set({ save: updated });
    },
    selectKart: (kartId) => {
      const { save } = get();
      const updated = { ...save, selectedKart: kartId };
      localStorage.setItem('essma_kart_save', JSON.stringify(updated));
      set({ save: updated });
    },
    selectWheel: (wheelId) => {
      const { save } = get();
      const updated = { ...save, selectedWheel: wheelId };
      localStorage.setItem('essma_kart_save', JSON.stringify(updated));
      set({ save: updated });
    },
    selectGlider: (gliderId) => {
      const { save } = get();
      const updated = { ...save, selectedGlider: gliderId };
      localStorage.setItem('essma_kart_save', JSON.stringify(updated));
      set({ save: updated });
    },
    selectPaint: (paintId) => {
      const { save } = get();
      const updated = { ...save, selectedPaint: paintId };
      localStorage.setItem('essma_kart_save', JSON.stringify(updated));
      set({ save: updated });
    },
    unlockItem: (category, itemId, price) => {
      const { save } = get();
      if (save.coins < price) return false;
      
      const updated = { ...save, coins: save.coins - price };
      if (category === 'wheel') updated.unlockedWheels = [...updated.unlockedWheels, itemId as WheelId];
      if (category === 'glider') updated.unlockedGliders = [...updated.unlockedGliders, itemId as GliderId];
      if (category === 'paint') updated.unlockedPaints = [...updated.unlockedPaints, itemId as PaintId];
      
      localStorage.setItem('essma_kart_save', JSON.stringify(updated));
      set({ save: updated });
      return true;
    },
    selectTrack: (trackId) => set({ selectedTrack: trackId }),
    updateSettings: (newSettings) => {
      const { save } = get();
      const updated = { ...save, settings: { ...save.settings, ...newSettings } };
      localStorage.setItem('essma_kart_save', JSON.stringify(updated));
      set({ save: updated, showTouchOverlay: updated.settings.touchControls });
    },
    addCoins: (amount) => {
      const { save } = get();
      const updated = { ...save, coins: save.coins + amount };
      localStorage.setItem('essma_kart_save', JSON.stringify(updated));
      set({ save: updated });
    },
    saveBestTime: (track, time) => {
      const { save } = get();
      const currentBest = save.bestLapTimes[track] || 999;
      if (time < currentBest) {
        const updated = {
          ...save,
          bestLapTimes: { ...save.bestLapTimes, [track]: time },
        };
        localStorage.setItem('essma_kart_save', JSON.stringify(updated));
        set({ save: updated });
      }
    },

    updateRaceState: (data) => set((state) => ({ ...state, ...data })),
    togglePause: () => set((state) => ({ isPaused: !state.isPaused })),
    toggleDebug: () => set((state) => ({ debugOpen: !state.debugOpen })),
    resetRace: () => set({
      currentLap: 1,
      playerRank: 4,
      playerSpeed: 0,
      playerItem: 'none',
      playerCoins: 0,
      raceTime: 0,
      currentLapTime: 0,
      wrongWay: false,
      countdownValue: 3,
      isPaused: false,
      status: 'grid',
    }),
  };
});
