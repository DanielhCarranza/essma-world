import { WheelId, GliderId, PaintId } from './content/customizations';

export type CharacterId = 'essma' | 'juancito' | 'tori' | 'anita';
export type KartId = 'heart' | 'lightning' | 'acorn' | 'butterfly';
export type ItemType = 'heart_shield' | 'lightning_boost' | 'cactus_ball' | 'banana' | 'shell' | 'coin' | 'none';

export interface KartStats {
  topSpeed: number; // Max speed units
  acceleration: number; // Accel rate
  handling: number; // Steering sharpness
  driftGrip: number; // Stability during drift
  weight: number; // Bump resilience
  boostPower: number; // Turbo multiplier
}

export interface CharacterDef {
  id: CharacterId;
  name: string;
  tagline: string;
  defaultKart: KartId;
  color: string;
  secondaryColor: string;
  icon: string;
  stats: KartStats;
  specialDescription: string;
}

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface RacerState {
  id: string;
  characterId: CharacterId;
  kartId: KartId;
  isAI: boolean;
  position: Vector3D;
  velocity: Vector3D;
  rotationY: number;
  pitch: number;
  roll: number;
  speed: number;
  steerAngle: number;
  
  // Drift logic
  isDrifting: boolean;
  driftDirection: -1 | 0 | 1;
  driftTime: number;
  miniTurboLevel: number; // 0: none, 1: blue, 2: orange
  boostTimer: number;

  // Race progress
  lap: number;
  checkpointIndex: number;
  splineProgress: number; // 0 to 1 along track
  raceRank: number; // 1 to 4
  finished: boolean;
  finishTime: number;

  // Status effects
  currentItem: ItemType;
  hasShield: boolean;
  shieldTimer: number;
  spinoutTimer: number;
  offroadTimer: number;
  wrongWay: boolean;
  
  // Stats
  coinsCollected: number;
}

export type RaceStatus = 'title' | 'select' | 'garage' | 'grid' | 'countdown' | 'racing' | 'finishing' | 'results';

export interface SaveData {
  version: number;
  coins: number;
  unlockedKarts: KartId[];
  unlockedCharacters: CharacterId[];
  unlockedWheels: WheelId[];
  unlockedGliders: GliderId[];
  unlockedPaints: PaintId[];
  bestLapTimes: Record<string, number>;
  selectedCharacter: CharacterId;
  selectedKart: KartId;
  selectedWheel: WheelId;
  selectedGlider: GliderId;
  selectedPaint: PaintId;
  settings: {
    musicVolume: number;
    sfxVolume: number;
    autoAccelerate: boolean;
    touchControls: boolean;
    quality: 'low' | 'medium' | 'high';
    reducedMotion: boolean;
    steeringAssist: boolean;
  };
}

export interface TrackPoint {
  x: number;
  y: number;
  z: number;
  width: number;
}

export interface ItemBox {
  id: string;
  position: Vector3D;
  active: boolean;
  respawnTimer: number;
}

export interface TacoCoin {
  id: string;
  position: Vector3D;
  collected: boolean;
  respawnTimer: number;
}

export interface Projectile {
  id: string;
  type: ItemType;
  position: Vector3D;
  velocity: Vector3D;
  ownerId: string;
  lifetime: number;
}

export interface QAParams {
  track?: string;
  character?: CharacterId;
  lap?: number;
  position?: number;
  item?: ItemType;
  quality?: 'low' | 'medium' | 'high';
  seed?: number;
  godMode?: boolean;
}
