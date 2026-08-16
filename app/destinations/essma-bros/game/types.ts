export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Entity extends Box {
  id: string;
  type: 'player' | 'enemy' | 'block' | 'spike' | 'portal' | 'decoration' | 'taco' | 'boss' | 'projectile' | 'plant' | 'attack' | 'powerup';
  vx: number;
  vy: number;
  speed?: number;
  portalTarget?: string; // ID of the level to go to
  portalX?: number; // X position in the new level
  portalY?: number; // Y position in the new level
  color?: string;
  text?: string;
  dead?: boolean;
  facingRight?: boolean;
  patrolStart?: number;
  patrolEnd?: number;
  characterId?: string;
  jumpCount?: number;
  health?: number;
  throwTimer?: number;
  lifeTime?: number;
  damage?: number;
  powerupType?: 'red_salsa' | 'green_salsa';
  activePowerup?: 'red_salsa' | 'green_salsa';
  powerupTimer?: number;
}

export interface LevelData {
  id: string;
  name: string;
  bgColor: string;
  entities: Omit<Entity, 'vx' | 'vy' | 'dead' | 'facingRight'>[];
  startX: number;
  startY: number;
  floorLevel: number; // for death plane
  lockCameraY?: boolean;
}
