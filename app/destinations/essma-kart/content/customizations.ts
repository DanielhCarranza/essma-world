export type WheelId = 'standard' | 'offroad' | 'slick' | 'golden';
export type GliderId = 'standard_wing' | 'heart_glider' | 'solar_wings' | 'diamond_glider';
export type PaintId = 'original' | 'neon_glow' | 'sunset_gold' | 'cyber_purple';

export interface CustomizationItem<T extends string> {
  id: T;
  name: string;
  description: string;
  icon: string;
  price: number;
  statBonus: {
    topSpeed?: number;
    acceleration?: number;
    handling?: number;
    driftGrip?: number;
    weight?: number;
  };
  colorHex?: number;
}

export const WHEELS: Record<WheelId, CustomizationItem<WheelId>> = {
  standard: {
    id: 'standard',
    name: 'Sonora Standard',
    description: 'Balanced rubber tires built for all-around street and dirt racing.',
    icon: '🛞',
    price: 0,
    statBonus: {},
  },
  offroad: {
    id: 'offroad',
    name: 'Desert Off-Roader',
    description: 'Heavy treaded tires for superior sand and grass drift grip.',
    icon: '🚙',
    price: 30,
    statBonus: { driftGrip: +8, handling: +5, topSpeed: -2 },
  },
  slick: {
    id: 'slick',
    name: 'Racing Slicks',
    description: 'Low-profile smooth compound maximizing high-speed track acceleration.',
    icon: '🏎️',
    price: 50,
    statBonus: { topSpeed: +6, acceleration: +6, driftGrip: -4 },
  },
  golden: {
    id: 'golden',
    name: 'Gold Rim Deluxe',
    description: 'Prestige 24K gold rims that shine under the desert sun.',
    icon: '🌟',
    price: 100,
    statBonus: { topSpeed: +4, acceleration: +4, handling: +4 },
    colorHex: 0xF59E0B,
  },
};

export const GLIDERS: Record<GliderId, CustomizationItem<GliderId>> = {
  standard_wing: {
    id: 'standard_wing',
    name: 'Standard Hang Glider',
    description: 'Reliable fabric wing for steady jump ramp descents.',
    icon: '🪂',
    price: 0,
    statBonus: {},
  },
  heart_glider: {
    id: 'heart_glider',
    name: 'Heart Spark Wing',
    description: 'Charming pink glider with glowing heart particle trails.',
    icon: '💖',
    price: 40,
    statBonus: { acceleration: +5, handling: +5 },
  },
  solar_wings: {
    id: 'solar_wings',
    name: 'Solar Flare Glider',
    description: 'Aerodynamic gold wings absorbing sunlight for extra jump boost.',
    icon: '☀️',
    price: 60,
    statBonus: { topSpeed: +5, weight: +5 },
  },
  diamond_glider: {
    id: 'diamond_glider',
    name: 'Crystal Diamond Wing',
    description: 'Prismatic crystal structure carved from Cueva de Cristales.',
    icon: '💎',
    price: 120,
    statBonus: { topSpeed: +8, acceleration: +4 },
  },
};

export const PAINTS: Record<PaintId, CustomizationItem<PaintId>> = {
  original: {
    id: 'original',
    name: 'Factory Classic',
    description: 'Original vibrant character body finish.',
    icon: '🎨',
    price: 0,
    statBonus: {},
  },
  neon_glow: {
    id: 'neon_glow',
    name: 'Sonora Neon Glow',
    description: 'High-visibility neon green coat with fluorescent highlights.',
    icon: '🟢',
    price: 35,
    statBonus: { handling: +4 },
    colorHex: 0x22C55E,
  },
  sunset_gold: {
    id: 'sunset_gold',
    name: 'Sonoran Sunset Gold',
    description: 'Warm metallic orange finish reflecting the desert horizon.',
    icon: '🌅',
    price: 60,
    statBonus: { topSpeed: +5 },
    colorHex: 0xF97316,
  },
  cyber_purple: {
    id: 'cyber_purple',
    name: 'Cyber Violet Shimmer',
    description: 'Deep iridescent purple finish that glimmers during speed boosts.',
    icon: '🔮',
    price: 90,
    statBonus: { acceleration: +5, driftGrip: +5 },
    colorHex: 0xA855F7,
  },
};
