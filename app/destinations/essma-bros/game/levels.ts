import { LevelData } from './types';

// Helper to create blocks easily
const createPlatform = (id: string, x: number, y: number, w: number, h: number, color = '#d4a373'): any => ({
  id, type: 'block', x, y, w, h, color
});

const createTaco = (id: string, x: number, y: number): any => ({
  id, type: 'taco', x, y, w: 20, h: 20, color: '#facc15'
});

export const DESERT_LEVEL: LevelData = {
  id: 'desert',
  name: 'Sonora Ranch',
  bgColor: '#f4a261', // Sunset orange / desert hue
  startX: 50,
  startY: 460,
  floorLevel: 700,
  lockCameraY: true,
  entities: [
    // Ground - sitting cleanly at y=520 with h=80 (so ground top is y=520)
    createPlatform('g1', 0, 520, 1500, 80, '#e76f51'), // Terracotta ground
    createPlatform('g2', 1700, 520, 1200, 80, '#e76f51'),
    createPlatform('g3', 3100, 520, 2500, 80, '#e76f51'), // goes to 5600
    
    // Platforms (spaced nicely)
    createPlatform('p1', 300, 380, 200, 20, '#5c4033'), // Wood-like color
    createPlatform('p2', 650, 270, 200, 20, '#5c4033'),
    createPlatform('p3', 1800, 380, 200, 20, '#5c4033'),
    createPlatform('p4', 2100, 240, 200, 20, '#5c4033'),
    createPlatform('p6', 3300, 380, 250, 20, '#5c4033'),
    createPlatform('p7', 3700, 240, 200, 20, '#5c4033'),
    createPlatform('p8', 4300, 380, 200, 20, '#5c4033'),
    createPlatform('p8_5', 4550, 320, 100, 20, '#5c4033'),
    
    // Wall / Barn
    createPlatform('w1', 4700, 370, 150, 150, '#9b2226'), // Red barn wall

    { id: 'pw1', type: 'powerup', powerupType: 'red_salsa', x: 2000, y: 330, w: 30, h: 30 },
    { id: 'pw2', type: 'powerup', powerupType: 'green_salsa', x: 3800, y: 190, w: 30, h: 30 },

    // Cacti (Spikes) - sitting on ground at y=520
    { id: 'c1', type: 'spike', x: 800, y: 460, w: 30, h: 60, color: '#2a9d8f' },
    { id: 'c2', type: 'spike', x: 1400, y: 460, w: 30, h: 60, color: '#2a9d8f' },
    { id: 'c3', type: 'spike', x: 2600, y: 460, w: 20, h: 60, color: '#2a9d8f' },

    { id: 'tw1', type: 'enemy', text: 'Tumbleweed', x: 1600, y: 480, w: 40, h: 40, speed: -150, facingRight: false },
    { id: 'tw2', type: 'enemy', text: 'Tumbleweed', x: 3000, y: 480, w: 40, h: 40, speed: -120, facingRight: false },

    // Enemies (Taquito and Cows)
    { id: 'e1', type: 'enemy', text: 'Taquito', x: 450, y: 445, w: 90, h: 75, color: '#8B4513', speed: 100, patrolStart: 250, patrolEnd: 800 },
    { id: 'e2', type: 'enemy', text: 'Cow', x: 1800, y: 480, w: 70, h: 40, color: '#fff', speed: 80, patrolStart: 1700, patrolEnd: 2400 },
    { id: 'e3', type: 'enemy', text: 'Cow', x: 3300, y: 480, w: 70, h: 40, color: '#fff', speed: 90, patrolStart: 3100, patrolEnd: 3900 },
    { id: 'e4', type: 'enemy', text: 'Taquito', x: 1100, y: 445, w: 90, h: 75, color: '#8B4513', speed: 110, patrolStart: 1050, patrolEnd: 1300 },
    { id: 'e5', type: 'enemy', text: 'Cow', x: 2700, y: 480, w: 70, h: 40, color: '#fff', speed: 100, patrolStart: 2500, patrolEnd: 2900 },
    { id: 'e6', type: 'enemy', text: 'Taquito', x: 4000, y: 445, w: 90, h: 75, color: '#8B4513', speed: 120, patrolStart: 3900, patrolEnd: 4500 },

    // More Cacti (Spikes)
    { id: 'c4', type: 'spike', x: 1150, y: 460, w: 30, h: 60, color: '#2a9d8f' },
    { id: 'c5', type: 'spike', x: 2250, y: 460, w: 30, h: 60, color: '#2a9d8f' },
    { id: 'c6', type: 'spike', x: 4500, y: 460, w: 30, h: 60, color: '#2a9d8f' },
    
    // Tacos
    createTaco('t1', 350, 330),
    createTaco('t2', 400, 330),
    createTaco('t3', 450, 330),
    createTaco('t4', 700, 220),
    createTaco('t5', 750, 220),
    createTaco('t6', 1850, 330),
    createTaco('t7', 2150, 190),
    createTaco('t8', 2200, 190),
    createTaco('t9', 3350, 330),
    createTaco('t10', 3400, 330),
    createTaco('t11', 3750, 190),
    createTaco('t12', 4200, 430),
    createTaco('t13', 4300, 430),
    
    // Portal to Mine Shaft (Cellar)
    { id: 'port1', type: 'portal', text: 'Cellar', x: 950, y: 420, w: 100, h: 100, color: '#333', portalTarget: 'mine', portalX: 150, portalY: 420 },
    
    // --- EXTENSION ---
    createPlatform('g4', 5300, 520, 2000, 80, '#e76f51'),
    createPlatform('g5', 7500, 520, 1000, 80, '#e76f51'),
    
    // Platforms
    createPlatform('p9', 5500, 380, 200, 20, '#5c4033'),
    createPlatform('p10', 5800, 240, 200, 20, '#5c4033'),
    createPlatform('p11', 6100, 380, 200, 20, '#5c4033'),
    createPlatform('p12', 6500, 280, 200, 20, '#5c4033'),
    createPlatform('p13', 6900, 220, 250, 20, '#5c4033'),
    createPlatform('p14', 7300, 380, 200, 20, '#5c4033'),
    
    // Spikes (Cacti)
    { id: 'c7', type: 'spike', x: 5600, y: 460, w: 30, h: 60, color: '#2a9d8f' },
    { id: 'c8', type: 'spike', x: 6200, y: 460, w: 30, h: 60, color: '#2a9d8f' },
    { id: 'c9', type: 'spike', x: 7000, y: 460, w: 30, h: 60, color: '#2a9d8f' },
    { id: 'c10', type: 'spike', x: 7400, y: 460, w: 30, h: 60, color: '#2a9d8f' },

    // Enemies
    { id: 'e7', type: 'enemy', text: 'Taquito', x: 5700, y: 445, w: 90, h: 75, color: '#8B4513', speed: 130, patrolStart: 5500, patrolEnd: 6000 },
    { id: 'e8', type: 'enemy', text: 'Cow', x: 6300, y: 480, w: 70, h: 40, color: '#fff', speed: 110, patrolStart: 6200, patrolEnd: 6800 },
    { id: 'e9', type: 'enemy', text: 'Taquito', x: 7100, y: 445, w: 90, h: 75, color: '#8B4513', speed: 140, patrolStart: 6900, patrolEnd: 7400 },

    // Carnivorous Plants
    { id: 'dplant1', type: 'plant', x: 5200, y: 420, w: 60, h: 100, color: '#2ecc71' },
    createPlatform('dpipe1', 5190, 420, 80, 100, '#1E8449'),

    { id: 'dplant2', type: 'plant', x: 6600, y: 420, w: 60, h: 100, color: '#2ecc71' },
    createPlatform('dpipe2', 6590, 420, 80, 100, '#1E8449'),

    // Extra Tacos
    createTaco('t14', 5550, 330),
    createTaco('t15', 5850, 190),
    createTaco('t16', 6150, 330),
    createTaco('t17', 6550, 230),
    createTaco('t18', 6950, 170),
    createTaco('t19', 7350, 330),
    
    // --- END EXTENSION ---

    { id: 'port_boss', type: 'portal', text: 'To Boss!', x: 8000, y: 370, w: 120, h: 150, color: '#333', portalTarget: 'boss', portalX: 100, portalY: 370 }
  ]
};

export const BOSS_LEVEL: LevelData = {
  id: 'boss',
  name: 'Capybara Kong',
  bgColor: '#2c3e50', // Night time
  startX: 100,
  startY: 460,
  floorLevel: 700,
  lockCameraY: true,
  entities: [
    createPlatform('bg1', 0, 520, 2500, 80, '#1E432B'), // Dark jungle green
    createPlatform('bp1', 300, 400, 150, 20, '#D4AF37'), // Gold / temple stone
    createPlatform('bp2', 600, 300, 150, 20, '#D4AF37'),
    createPlatform('bp3', 900, 200, 150, 20, '#D4AF37'),
    createPlatform('bp4', 1200, 300, 150, 20, '#D4AF37'),
    createPlatform('bp5', 1600, 400, 150, 20, '#D4AF37'),
    createPlatform('bp6', 1900, 250, 150, 20, '#D4AF37'),
    
    // Boss entity
    { id: 'boss1', type: 'boss', text: 'Capybara Kong', x: 1400, y: 220, w: 200, h: 300, color: '#8B4513', health: 10, speed: 80, patrolStart: 1200, patrolEnd: 1800 },
    
    // More Enemies
    { id: 'be1', type: 'enemy', text: 'Taquito', x: 700, y: 445, w: 90, h: 75, color: '#8B4513', speed: 120, patrolStart: 500, patrolEnd: 1100 },
    { id: 'be2', type: 'enemy', text: 'Cow', x: 1700, y: 480, w: 70, h: 40, color: '#fff', speed: 90, patrolStart: 1500, patrolEnd: 2100 },

    // Carnivorous Plants
    { id: 'bplant1', type: 'plant', x: 450, y: 420, w: 60, h: 100, color: '#2ecc71' },
    createPlatform('bpipe1', 440, 420, 80, 100, '#1E8449'),
    { id: 'bplant2', type: 'plant', x: 1050, y: 420, w: 60, h: 100, color: '#2ecc71' },
    createPlatform('bpipe2', 1040, 420, 80, 100, '#1E8449'),

    // Some tacos
    createTaco('bt1', 350, 350),
    createTaco('bt2', 650, 250),
    createTaco('bt3', 950, 150),
    createTaco('bt4', 1250, 250),
    createTaco('bt5', 1650, 350),
    createTaco('bt6', 1950, 200),
    
    // Win flag
    { id: 'goal', type: 'decoration', text: 'WIN', x: 2300, y: 370, w: 120, h: 150, color: '#FFD700' }
  ]
};

export const MINE_LEVEL: LevelData = {
  id: 'mine',
  name: 'Underground Cellar',
  bgColor: '#2b2b2b', // Dark cave
  startX: 150,
  startY: 460,
  floorLevel: 700,
  lockCameraY: true,
  entities: [
    createPlatform('mg1', 0, 520, 4500, 80, '#2c3e50'), // Darker ground for mine
    createPlatform('mp1', 350, 400, 150, 20, '#d35400'), // Orange/Wood color
    createPlatform('mp2', 650, 300, 150, 20, '#d35400'),
    createPlatform('mp3', 950, 200, 150, 20, '#d35400'),
    createPlatform('mp4', 1350, 300, 150, 20, '#d35400'),
    createPlatform('mp5', 1750, 400, 150, 20, '#d35400'),
    
    // Extension
    createPlatform('mp6', 2200, 380, 150, 20, '#d35400'),
    createPlatform('mp7', 2500, 280, 150, 20, '#d35400'),
    createPlatform('mp8', 2900, 200, 200, 20, '#d35400'),
    createPlatform('mp9', 3300, 320, 150, 20, '#d35400'),
    createPlatform('mp10', 3700, 400, 200, 20, '#d35400'),

    // Portal back up
    { id: 'port2', type: 'portal', text: 'Exit', x: 4200, y: 420, w: 100, h: 100, color: '#87CEEB', portalTarget: 'desert', portalX: 950, portalY: 420 },
    
    // Enemies
    { id: 'me1', type: 'enemy', text: 'Taquito', x: 900, y: 445, w: 90, h: 75, color: '#8B4513', speed: 120, patrolStart: 800, patrolEnd: 1400 },
    { id: 'me2', type: 'enemy', text: 'Cow', x: 1800, y: 480, w: 70, h: 40, color: '#fff', speed: 100, patrolStart: 1600, patrolEnd: 2100 },
    { id: 'me3', type: 'enemy', text: 'Taquito', x: 3400, y: 445, w: 90, h: 75, color: '#8B4513', speed: 140, patrolStart: 3200, patrolEnd: 3800 },
    { id: 'me4', type: 'enemy', text: 'Cow', x: 2600, y: 480, w: 70, h: 40, color: '#fff', speed: 110, patrolStart: 2500, patrolEnd: 3000 },
    { id: 'me5', type: 'enemy', text: 'Taquito', x: 1400, y: 445, w: 90, h: 75, color: '#8B4513', speed: 130, patrolStart: 1300, patrolEnd: 1700 },

    // Carnivorous Plants
    { id: 'plant1', type: 'plant', x: 1100, y: 420, w: 60, h: 100, color: '#2ecc71' },
    createPlatform('pipe1', 1090, 420, 80, 100, '#1E8449'),
    { id: 'plant2', type: 'plant', x: 2000, y: 420, w: 60, h: 100, color: '#2ecc71' },
    createPlatform('pipe2', 1990, 420, 80, 100, '#1E8449'),
    { id: 'plant3', type: 'plant', x: 3000, y: 420, w: 60, h: 100, color: '#2ecc71' },
    createPlatform('pipe3', 2990, 420, 80, 100, '#1E8449'),
    { id: 'plant4', type: 'plant', x: 3900, y: 420, w: 60, h: 100, color: '#2ecc71' },
    createPlatform('pipe4', 3890, 420, 80, 100, '#1E8449'),

    // Cacti / Spikes (Stalagmites)
    { id: 'ms1', type: 'spike', x: 500, y: 490, w: 40, h: 30, color: '#900' },
    { id: 'ms2', type: 'spike', x: 1500, y: 490, w: 40, h: 30, color: '#900' },
    { id: 'ms3', type: 'spike', x: 2700, y: 490, w: 40, h: 30, color: '#900' },
    { id: 'ms4', type: 'spike', x: 3200, y: 490, w: 40, h: 30, color: '#900' },
    { id: 'ms5', type: 'spike', x: 3600, y: 490, w: 40, h: 30, color: '#900' },
    
    // Tacos
    createTaco('mt1', 380, 350),
    createTaco('mt2', 680, 250),
    createTaco('mt3', 980, 150),
    createTaco('mt4', 1380, 250),
    createTaco('mt5', 1780, 350),
    createTaco('mt6', 1000, 470),
    createTaco('mt7', 1050, 470),
    createTaco('mt8', 2250, 330),
    createTaco('mt9', 2550, 230),
    createTaco('mt10', 2950, 150),
    createTaco('mt11', 3350, 270),
    createTaco('mt12', 3750, 350),
  ]
};
