import { Vector3D, ItemBox, TacoCoin } from '../types';

export interface BoostPad {
  id: string;
  position: Vector3D;
  rotationY: number;
}

export interface TrackData {
  id: string;
  name: string;
  description: string;
  theme: 'day' | 'night' | 'cave';
  difficultyStars: number;
  spline: Vector3D[];
  checkpoints: { position: Vector3D; radius: number }[];
  itemBoxes: ItemBox[];
  tacoCoins: TacoCoin[];
  boostPads: BoostPad[];
  decorations: { type: 'saguaro' | 'rock' | 'house' | 'arch' | 'bridge' | 'ranch_gate' | 'crystal' | 'palm_tree' | 'papel_picado' | 'waterfall' | 'rainbow'; position: Vector3D; scale?: number; rotationY?: number }[];
  startingGrid: Vector3D[];
}

// Sonora Desert track circuit (Radius approx 200m - 300m loop)
const SONORA_SPLINE: Vector3D[] = [
  { x: 0, y: 0, z: 0 },         // Start / Finish line
  { x: 30, y: 0, z: -80 },      // First right curve
  { x: 90, y: 0, z: -140 },     // Sweeping bend
  { x: 180, y: 2, z: -150 },    // Rise into Village
  { x: 250, y: 5, z: -110 },    // Village S-Curve entry
  { x: 280, y: 5, z: -40 },     // Village exit
  { x: 260, y: 3, z: 40 },      // Ranch wooden gate
  { x: 210, y: 0, z: 120 },     // Wooden Bridge ramp
  { x: 140, y: 8, z: 180 },     // Bridge over canyon peak
  { x: 50, y: 0, z: 220 },      // Dune jump descent
  { x: -60, y: 0, z: 230 },     // Dune sweeping left
  { x: -160, y: 0, z: 180 },    // Saguaro Forest hairpin entry
  { x: -220, y: 0, z: 100 },    // Hairpin apex
  { x: -200, y: 0, z: 10 },     // Desert Straight
  { x: -140, y: 0, z: -40 },    // Final chicane
  { x: -60, y: 0, z: -20 },     // Approach start/finish
];

export const SONORA_TRACK: TrackData = {
  id: 'desierto_sonora',
  name: 'Desierto de Sonora',
  description: 'Circuito soleado en el desierto con arcos de roca, cactus saguaro y salto de puente de madera.',
  theme: 'day',
  difficultyStars: 1,
  spline: SONORA_SPLINE,
  checkpoints: SONORA_SPLINE.map((p) => ({
    position: p,
    radius: 35,
  })),
  startingGrid: [
    { x: -4, y: 0, z: 15 },
    { x: 4, y: 0, z: 25 },
    { x: -4, y: 0, z: 35 },
    { x: 4, y: 0, z: 45 },
  ],
  itemBoxes: [
    { id: 'ib_1', position: { x: 40, y: 1.5, z: -90 }, active: true, respawnTimer: 0 },
    { id: 'ib_2', position: { x: 260, y: 6.5, z: -80 }, active: true, respawnTimer: 0 },
    { id: 'ib_3', position: { x: 150, y: 9.5, z: 175 }, active: true, respawnTimer: 0 },
    { id: 'ib_4', position: { x: -170, y: 1.5, z: 160 }, active: true, respawnTimer: 0 },
    { id: 'ib_5', position: { x: -190, y: 1.5, z: -10 }, active: true, respawnTimer: 0 },
  ],
  tacoCoins: [
    { id: 'tc_1', position: { x: 15, y: 0.5, z: -40 }, collected: false, respawnTimer: 0 },
    { id: 'tc_2', position: { x: 60, y: 0.5, z: -110 }, collected: false, respawnTimer: 0 },
    { id: 'tc_3', position: { x: 230, y: 4.5, z: -130 }, collected: false, respawnTimer: 0 },
    { id: 'tc_4', position: { x: 275, y: 5.5, z: -20 }, collected: false, respawnTimer: 0 },
    { id: 'tc_5', position: { x: 180, y: 5.5, z: 150 }, collected: false, respawnTimer: 0 },
    { id: 'tc_6', position: { x: 0, y: 0.5, z: 225 }, collected: false, respawnTimer: 0 },
    { id: 'tc_7', position: { x: -215, y: 0.5, z: 120 }, collected: false, respawnTimer: 0 },
    { id: 'tc_8', position: { x: -100, y: 0.5, z: -30 }, collected: false, respawnTimer: 0 },
  ],
  boostPads: [
    { id: 'bp_1', position: { x: 100, y: 0.1, z: -145 }, rotationY: Math.PI / 4 },
    { id: 'bp_2', position: { x: 110, y: 5.1, z: 195 }, rotationY: -Math.PI / 3 },
    { id: 'bp_3', position: { x: -200, y: 0.1, z: -20 }, rotationY: -Math.PI / 6 },
  ],
  decorations: [
    { type: 'arch', position: { x: 0, y: 0, z: 0 }, scale: 1.2, rotationY: 0 },
    { type: 'house', position: { x: 230, y: 5, z: -160 }, scale: 1.2, rotationY: 0.3 },
    { type: 'house', position: { x: 295, y: 5, z: -100 }, scale: 1.1, rotationY: -0.5 },
    { type: 'house', position: { x: 305, y: 5, z: -30 }, scale: 1.3, rotationY: -1.2 },
    { type: 'ranch_gate', position: { x: 250, y: 3, z: 50 }, scale: 1.3, rotationY: -0.4 },
    { type: 'bridge', position: { x: 175, y: 4, z: 150 }, scale: 1.5, rotationY: -0.8 },
    { type: 'saguaro', position: { x: -120, y: 0, z: 210 }, scale: 1.4 },
    { type: 'saguaro', position: { x: -180, y: 0, z: 220 }, scale: 1.8 },
    { type: 'saguaro', position: { x: -240, y: 0, z: 140 }, scale: 1.6 },
    { type: 'saguaro', position: { x: -250, y: 0, z: 60 }, scale: 2.0 },
    { type: 'saguaro', position: { x: -180, y: 0, z: -30 }, scale: 1.5 },
    { type: 'saguaro', position: { x: 20, y: 0, z: -100 }, scale: 1.3 },
    { type: 'rock', position: { x: 120, y: 0, z: -180 }, scale: 2.5 },
    { type: 'rock', position: { x: -80, y: 0, z: 260 }, scale: 3.0 },
    { type: 'rock', position: { x: -230, y: 0, z: 0 }, scale: 2.2 },
  ],
};

// Track 02: Pueblo del Cactus (Festive Mexican Town with Papel Picado, Archways & Cobblestone streets)
const PUEBLO_SPLINE: Vector3D[] = [
  { x: 0, y: 0, z: 0 },
  { x: 50, y: 0, z: -60 },
  { x: 130, y: 0, z: -90 },
  { x: 200, y: 2, z: -50 },
  { x: 220, y: 4, z: 30 },
  { x: 170, y: 3, z: 110 },
  { x: 90, y: 0, z: 150 },
  { x: -10, y: 0, z: 160 },
  { x: -90, y: 0, z: 130 },
  { x: -160, y: 0, z: 60 },
  { x: -180, y: 0, z: -30 },
  { x: -130, y: 0, z: -90 },
  { x: -60, y: 0, z: -50 },
];

export const PUEBLO_TRACK: TrackData = {
  id: 'pueblo_cactus',
  name: 'Pueblo del Cactus',
  description: 'Pueblo tradicional mexicano festivo con papel picado colgante, calles empedradas y arcos adornados.',
  theme: 'day',
  difficultyStars: 2,
  spline: PUEBLO_SPLINE,
  checkpoints: PUEBLO_SPLINE.map((p) => ({
    position: p,
    radius: 35,
  })),
  startingGrid: [
    { x: -4, y: 0, z: 15 },
    { x: 4, y: 0, z: 25 },
    { x: -4, y: 0, z: 35 },
    { x: 4, y: 0, z: 45 },
  ],
  itemBoxes: [
    { id: 'ib_pc1', position: { x: 60, y: 1.5, z: -70 }, active: true, respawnTimer: 0 },
    { id: 'ib_pc2', position: { x: 210, y: 3.5, z: -10 }, active: true, respawnTimer: 0 },
    { id: 'ib_pc3', position: { x: 80, y: 1.5, z: 150 }, active: true, respawnTimer: 0 },
    { id: 'ib_pc4', position: { x: -170, y: 1.5, z: 10 }, active: true, respawnTimer: 0 },
  ],
  tacoCoins: [
    { id: 'tc_pc1', position: { x: 25, y: 0.5, z: -30 }, collected: false, respawnTimer: 0 },
    { id: 'tc_pc2', position: { x: 160, y: 1.5, z: -80 }, collected: false, respawnTimer: 0 },
    { id: 'tc_pc3', position: { x: 190, y: 3.5, z: 70 }, collected: false, respawnTimer: 0 },
    { id: 'tc_pc4', position: { x: -40, y: 0.5, z: 160 }, collected: false, respawnTimer: 0 },
    { id: 'tc_pc5', position: { x: -150, y: 0.5, z: -70 }, collected: false, respawnTimer: 0 },
  ],
  boostPads: [
    { id: 'bp_pc1', position: { x: 100, y: 0.1, z: -85 }, rotationY: Math.PI / 3 },
    { id: 'bp_pc2', position: { x: 120, y: 0.1, z: 145 }, rotationY: -Math.PI / 2 },
    { id: 'bp_pc3', position: { x: -160, y: 0.1, z: -50 }, rotationY: -Math.PI / 4 },
  ],
  decorations: [
    { type: 'arch', position: { x: 0, y: 0, z: 0 }, scale: 1.2, rotationY: 0 },
    { type: 'papel_picado', position: { x: 0, y: 6, z: 10 }, scale: 1.5, rotationY: 0 },
    { type: 'papel_picado', position: { x: 100, y: 6, z: -80 }, scale: 1.5, rotationY: 0.5 },
    { type: 'papel_picado', position: { x: 180, y: 6, z: 100 }, scale: 1.5, rotationY: -0.5 },
    { type: 'house', position: { x: 180, y: 2, z: -90 }, scale: 1.3, rotationY: -0.2 },
    { type: 'house', position: { x: 230, y: 4, z: 50 }, scale: 1.2, rotationY: -1.0 },
    { type: 'house', position: { x: -110, y: 0, z: 160 }, scale: 1.4, rotationY: 0.5 },
    { type: 'ranch_gate', position: { x: 140, y: 1, z: 120 }, scale: 1.3, rotationY: -0.6 },
    { type: 'bridge', position: { x: -50, y: 0, z: 160 }, scale: 1.4, rotationY: -1.5 },
    { type: 'saguaro', position: { x: -140, y: 0, z: 100 }, scale: 1.6 },
    { type: 'saguaro', position: { x: -200, y: 0, z: -20 }, scale: 1.8 },
    { type: 'rock', position: { x: 80, y: 0, z: -120 }, scale: 2.8 },
  ],
};

// Track 03: Cueva del Coyote (Underground Crystal Mining Cavern)
const CUEVA_SPLINE: Vector3D[] = [
  { x: 0, y: 0, z: 0 },
  { x: 40, y: -2, z: -50 },
  { x: 100, y: -5, z: -110 },
  { x: 180, y: -8, z: -100 },
  { x: 220, y: -5, z: -20 },
  { x: 190, y: 0, z: 60 },
  { x: 120, y: 6, z: 120 }, // High crystal bridge jump
  { x: 20, y: 4, z: 140 },
  { x: -60, y: 0, z: 120 },
  { x: -130, y: -3, z: 60 },
  { x: -150, y: -2, z: -20 },
  { x: -90, y: 0, z: -60 },
];

export const CUEVA_TRACK: TrackData = {
  id: 'cueva_coyote',
  name: 'Cueva del Coyote',
  description: 'Mina subterránea misteriosa repleta de cristales azules brillantes, antorchas y rieles de vagoneta.',
  theme: 'cave',
  difficultyStars: 3,
  spline: CUEVA_SPLINE,
  checkpoints: CUEVA_SPLINE.map((p) => ({
    position: p,
    radius: 35,
  })),
  startingGrid: [
    { x: -4, y: 0, z: 15 },
    { x: 4, y: 0, z: 25 },
    { x: -4, y: 0, z: 35 },
    { x: 4, y: 0, z: 45 },
  ],
  itemBoxes: [
    { id: 'ib_cc1', position: { x: 50, y: -1.5, z: -60 }, active: true, respawnTimer: 0 },
    { id: 'ib_cc2', position: { x: 210, y: -4.5, z: -10 }, active: true, respawnTimer: 0 },
    { id: 'ib_cc3', position: { x: 110, y: 6.5, z: 125 }, active: true, respawnTimer: 0 },
    { id: 'ib_cc4', position: { x: -140, y: -2.5, z: 20 }, active: true, respawnTimer: 0 },
  ],
  tacoCoins: [
    { id: 'tc_cc1', position: { x: 20, y: -0.5, z: -30 }, collected: false, respawnTimer: 0 },
    { id: 'tc_cc2', position: { x: 140, y: -6.5, z: -110 }, collected: false, respawnTimer: 0 },
    { id: 'tc_cc3', position: { x: 170, y: 2.5, z: 80 }, collected: false, respawnTimer: 0 },
    { id: 'tc_cc4', position: { x: -20, y: 2.5, z: 135 }, collected: false, respawnTimer: 0 },
    { id: 'tc_cc5', position: { x: -110, y: -1.5, z: -40 }, collected: false, respawnTimer: 0 },
  ],
  boostPads: [
    { id: 'bp_cc1', position: { x: 80, y: -4.9, z: -100 }, rotationY: Math.PI / 4 },
    { id: 'bp_cc2', position: { x: 140, y: 6.1, z: 110 }, rotationY: -Math.PI / 3 },
    { id: 'bp_cc3', position: { x: -130, y: -2.9, z: 40 }, rotationY: -Math.PI / 6 },
  ],
  decorations: [
    { type: 'arch', position: { x: 0, y: 0, z: 0 }, scale: 1.2, rotationY: 0 },
    { type: 'crystal', position: { x: 60, y: -3, z: -80 }, scale: 2.0, rotationY: 0.5 },
    { type: 'crystal', position: { x: 190, y: -7, z: -120 }, scale: 2.5, rotationY: -0.8 },
    { type: 'crystal', position: { x: 230, y: -4, z: 20 }, scale: 2.2, rotationY: 1.2 },
    { type: 'crystal', position: { x: 90, y: 5, z: 140 }, scale: 2.8, rotationY: 0.2 },
    { type: 'crystal', position: { x: -80, y: -1, z: 140 }, scale: 2.1, rotationY: -1.5 },
    { type: 'crystal', position: { x: -160, y: -3, z: -30 }, scale: 2.4, rotationY: 0.9 },
    { type: 'rock', position: { x: 110, y: -5, z: -140 }, scale: 3.5 },
    { type: 'rock', position: { x: -100, y: -2, z: 160 }, scale: 3.0 },
  ],
};

// Track 04: Oasis Escondido (Lush Tropical Oasis with waterfalls, wooden bridges & palm trees)
const OASIS_SPLINE: Vector3D[] = [
  { x: 0, y: 0, z: 0 },
  { x: 60, y: 0, z: -50 },
  { x: 140, y: 0, z: -80 },
  { x: 210, y: 3, z: -30 },
  { x: 230, y: 5, z: 40 },  // Waterfall river bridge entry
  { x: 180, y: 4, z: 120 },
  { x: 100, y: 0, z: 160 },
  { x: 0, y: 0, z: 170 },
  { x: -90, y: 0, z: 140 },
  { x: -170, y: 0, z: 80 },
  { x: -210, y: 0, z: -10 },
  { x: -150, y: 0, z: -80 },
  { x: -70, y: 0, z: -50 },
];

export const OASIS_TRACK: TrackData = {
  id: 'oasis_escondido',
  name: 'Oasis Escondido',
  description: 'Paraíso tropical con cascadas cristalinas, puentes de madera, palmeras exóticas y arcoíris.',
  theme: 'day',
  difficultyStars: 4,
  spline: OASIS_SPLINE,
  checkpoints: OASIS_SPLINE.map((p) => ({
    position: p,
    radius: 35,
  })),
  startingGrid: [
    { x: -4, y: 0, z: 15 },
    { x: 4, y: 0, z: 25 },
    { x: -4, y: 0, z: 35 },
    { x: 4, y: 0, z: 45 },
  ],
  itemBoxes: [
    { id: 'ib_oe1', position: { x: 70, y: 1.5, z: -60 }, active: true, respawnTimer: 0 },
    { id: 'ib_oe2', position: { x: 220, y: 5.5, z: 10 }, active: true, respawnTimer: 0 },
    { id: 'ib_oe3', position: { x: 90, y: 1.5, z: 165 }, active: true, respawnTimer: 0 },
    { id: 'ib_oe4', position: { x: -180, y: 1.5, z: 30 }, active: true, respawnTimer: 0 },
  ],
  tacoCoins: [
    { id: 'tc_oe1', position: { x: 30, y: 0.5, z: -25 }, collected: false, respawnTimer: 0 },
    { id: 'tc_oe2', position: { x: 170, y: 0.5, z: -70 }, collected: false, respawnTimer: 0 },
    { id: 'tc_oe3', position: { x: 200, y: 4.5, z: 80 }, collected: false, respawnTimer: 0 },
    { id: 'tc_oe4', position: { x: -50, y: 0.5, z: 165 }, collected: false, respawnTimer: 0 },
    { id: 'tc_oe5', position: { x: -180, y: 0.5, z: -40 }, collected: false, respawnTimer: 0 },
  ],
  boostPads: [
    { id: 'bp_oe1', position: { x: 110, y: 0.1, z: -75 }, rotationY: Math.PI / 4 },
    { id: 'bp_oe2', position: { x: 190, y: 4.1, z: 100 }, rotationY: -Math.PI / 3 },
    { id: 'bp_oe3', position: { x: -190, y: 0.1, z: -30 }, rotationY: -Math.PI / 6 },
  ],
  decorations: [
    { type: 'arch', position: { x: 0, y: 0, z: 0 }, scale: 1.2, rotationY: 0 },
    { type: 'waterfall', position: { x: 230, y: 10, z: 40 }, scale: 2.0, rotationY: 0 },
    { type: 'rainbow', position: { x: 150, y: 25, z: 50 }, scale: 3.0, rotationY: 0.4 },
    { type: 'bridge', position: { x: 215, y: 4, z: 80 }, scale: 1.6, rotationY: -0.6 },
    { type: 'palm_tree', position: { x: 50, y: 0, z: -80 }, scale: 1.5 },
    { type: 'palm_tree', position: { x: 160, y: 0, z: -110 }, scale: 1.8 },
    { type: 'palm_tree', position: { x: 250, y: 3, z: 10 }, scale: 1.6 },
    { type: 'palm_tree', position: { x: 130, y: 0, z: 180 }, scale: 1.7 },
    { type: 'palm_tree', position: { x: -110, y: 0, z: 170 }, scale: 1.4 },
    { type: 'palm_tree', position: { x: -230, y: 0, z: 20 }, scale: 1.9 },
    { type: 'palm_tree', position: { x: -120, y: 0, z: -90 }, scale: 1.5 },
    { type: 'rock', position: { x: 180, y: 0, z: -130 }, scale: 2.8 },
    { type: 'rock', position: { x: -210, y: 0, z: 120 }, scale: 3.2 },
  ],
};

export const ALL_TRACKS: TrackData[] = [SONORA_TRACK, PUEBLO_TRACK, CUEVA_TRACK, OASIS_TRACK];

