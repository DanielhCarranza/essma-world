import { Entity, Box, LevelData } from './types';

const GRAVITY = 900;
const MAX_FALL_SPEED = 600;
const JUMP_FORCE = -650;
const MOVE_SPEED = 250;

export class GameEngine {
  public player: Entity;
  public entities: Entity[];
  public level: LevelData;
  public camera: Box;
  public score = 0;
  public tacos = 0;
  
  public particles: {x: number, y: number, text: string, time: number, maxTime: number, vx?: number, vy: number, color: string}[] = [];
  
  public keys = { left: false, right: false, up: false, down: false, action: false };
  public keysPrev = { left: false, right: false, up: false, down: false, action: false };
  
  public onWin?: () => void;
  public onDie?: () => void;
  public onScoreChange?: (score: number, tacos: number) => void;
  public onPortal?: (target: string, x: number, y: number) => void;
  
  // Sound events
  public onJump?: () => void;
  public onTaco?: () => void;
  public onStomp?: () => void;

  public characterId: string;

  constructor(level: LevelData, characterId: string) {
    this.level = level;
    this.characterId = characterId;
    this.player = {
      id: 'player', type: 'player', characterId,
      x: level.startX, y: level.startY,
      w: 120, h: 120, // Keep aspect ratio square to avoid stretching, 3x bigger than 40x40
      vx: 0, vy: 0,
      jumpCount: 0,
      facingRight: true,
      color: '#00b4d8'
    };
    
    this.entities = level.entities.map(e => ({
      ...e, vx: 0, vy: 0, dead: false
    }));
    
    this.camera = { x: 0, y: 0, w: 800, h: 600 };
  }

  
  private performAttack() {
    const dir = this.player.facingRight ? 1 : -1;
    let attackEnt: any = null;
    
    if (this.player.activePowerup === 'red_salsa') {
      // Fireball
      attackEnt = {
        id: 'fireball_' + Math.random(), type: 'projectile',
        text: 'fireball',
        x: this.player.facingRight ? this.player.x + this.player.w : this.player.x - 30,
        y: this.player.y + 30, w: 30, h: 30,
        vx: dir * 800, vy: 0, lifeTime: 2, damage: 2, color: '#e74c3c' // Red fireball
      };
      this.onJump?.();
    } else if (this.characterId === 'essma') {
      // Lasso Spin - Short range melee
      attackEnt = {
        id: 'attack_' + Math.random(), type: 'attack',
        text: 'lasso',
        x: this.player.facingRight ? this.player.x + this.player.w : this.player.x - 60,
        y: this.player.y + 20, w: 60, h: 40,
        vx: 0, vy: 0, lifeTime: 0.2, damage: 1, color: '#f1c40f'
      };
      this.onJump?.();
    } else if (this.characterId === 'juancito') {
      // Sombrero Throw - Projectile
      attackEnt = {
        id: 'attack_' + Math.random(), type: 'projectile',
        text: 'sombrero',
        x: this.player.facingRight ? this.player.x + this.player.w : this.player.x - 40,
        y: this.player.y + 30, w: 40, h: 20,
        vx: dir * 600, vy: 0, lifeTime: 1.5, damage: 1, color: '#e67e22'
      };
      this.onJump?.();
    } else if (this.characterId === 'tori') {
      // Cactus Slide - Dash attack
      this.player.vx = dir * 800; // Boost speed
      attackEnt = {
        id: 'attack_' + Math.random(), type: 'attack',
        text: 'slide',
        x: this.player.facingRight ? this.player.x + this.player.w : this.player.x - 40,
        y: this.player.y + this.player.h - 30, w: 40, h: 30,
        vx: 0, vy: 0, lifeTime: 0.3, damage: 1, color: '#2ecc71'
      };
    } else if (this.characterId === 'anita') {
      // Maraca Shake - Sonic wave around her
      attackEnt = {
        id: 'attack_' + Math.random(), type: 'attack',
        text: 'maraca',
        x: this.player.x - 50,
        y: this.player.y - 50, w: this.player.w + 100, h: this.player.h + 100,
        vx: 0, vy: 0, lifeTime: 0.2, damage: 1, color: 'rgba(52, 152, 219, 0.5)'
      };
      this.onJump?.();
    }
    
    if (attackEnt) {
      this.entities.push(attackEnt);
    }
  }

  public update(dt: number) {
    if (this.player.dead) return;

    let moveSpeed = MOVE_SPEED;
    if (this.characterId === 'juancito') {
      moveSpeed = 400; // Faster run
    }
    if (this.player.activePowerup === 'green_salsa') {
      moveSpeed *= 2.5; // Massive speed boost
    }

    
    // Powerup timer
    if (this.player.powerupTimer !== undefined && this.player.powerupTimer > 0) {
      this.player.powerupTimer -= dt;
      if (this.player.powerupTimer <= 0) {
        this.player.activePowerup = undefined;
      }
    }

    // Player Horizontal Movement
    if (this.keys.left) {
      this.player.vx = -moveSpeed;
      this.player.facingRight = false;
    } else if (this.keys.right) {
      this.player.vx = moveSpeed;
      this.player.facingRight = true;
    } else {
      this.player.vx = 0;
    }

    // Apply Gravity
    let currentGravity = GRAVITY;
    if (this.characterId === 'tori' && this.keys.up) {
      currentGravity = -GRAVITY * 1.5; // Jetpack upward!
      
      // Add thrust particles
      if (Math.random() > 0.5) {
        this.particles.push({
          x: this.player.x + this.player.w / 2 + (Math.random() - 0.5) * 10,
          y: this.player.y + this.player.h,
          vx: (Math.random() - 0.5) * 50,
          vy: Math.random() * 50 + 50,
          time: 0,
          maxTime: 0.5,
          color: '#f97316', // orange
          text: '' // no text, just a colored square particle
        });
      }
    }
    
    this.player.vy += currentGravity * dt;
    if (this.player.vy > MAX_FALL_SPEED) this.player.vy = MAX_FALL_SPEED;

    // Move X
    this.player.x += this.player.vx * dt;
    this.handleCollisions(this.player, 'x');

    // Move Y
    this.player.y += this.player.vy * dt;
    const onGround = this.handleCollisions(this.player, 'y');

    if (onGround) {
      this.player.jumpCount = 0;
    }

    // Jump
    const canJump = onGround || (this.characterId === 'essma' && this.player.jumpCount === 1);
    
    // Check if the jump key was just pressed (need to prevent holding it from triggering double jump immediately)
    // We'll simplify this by checking if they are not already moving up very fast
    const isDoubleJump = !onGround && this.characterId === 'essma' && this.player.jumpCount === 1 && this.player.vy > -100;
    
    // For simplicity, let's just use regular key press logic. If they press UP, we jump. 
    // Wait, with simple keys, holding up will use double jump immediately. We need a 'key just pressed' logic.
    // Let's modify game view instead to pass down events? No, let's just do it here:
    // If we want a reliable double jump, we might just let it happen if they release and repress up. 
    // Let's just track if they release the key.
    
    if (this.keys.up && !this.keysPrev.up) {
       if (onGround) {
         this.player.vy = this.characterId === 'anita' ? JUMP_FORCE * 1.5 : JUMP_FORCE;
         this.player.jumpCount = 1;
         this.onJump?.();
       } else if (this.characterId === 'essma' && this.player.jumpCount === 1) {
         this.player.vy = JUMP_FORCE;
         this.player.jumpCount = 2;
         this.onJump?.();
       }
    }
    this.keysPrev.up = this.keys.up;

    // Portal
    if (this.keys.down && !this.keysPrev.down) {
      const portal = this.entities.find(e => e.type === 'portal' && this.isIntersecting(this.player, e));
      if (portal && portal.portalTarget) {
        this.onPortal?.(portal.portalTarget, portal.portalX || 0, portal.portalY || 0);
      }
    }
    this.keysPrev.down = this.keys.down;

    // Attacks
    if (this.keys.action && !this.keysPrev.action) {
      this.performAttack();
    }
    this.keysPrev.action = this.keys.action;


    // Goal
    const goal = this.entities.find(e => e.type === 'decoration' && e.text === 'WIN' && this.isIntersecting(this.player, e));
    if (goal) {
      this.onWin?.();
    }

    // Death plane
    if (this.player.y > this.level.floorLevel) {
      this.die();
    }

    
    // Update generic entities (projectiles, attacks, lifetime)
    for (const e of this.entities) {
      if (e.dead) continue;
      
      if (e.lifeTime !== undefined) {
        e.lifeTime -= dt;
        if (e.lifeTime <= 0) {
          e.dead = true;
          continue;
        }
      }
      
      if (e.type === 'projectile' || e.type === 'attack') {
        e.x += (e.vx || 0) * dt;
        e.y += (e.vy || 0) * dt;
        
        // Follow player if it's a melee attack and not a projectile
        if (e.type === 'attack') {
           if (this.characterId === 'essma') {
             e.x = this.player.facingRight ? this.player.x + this.player.w : this.player.x - e.w;
             e.y = this.player.y + 20;
           } else if (this.characterId === 'tori') {
             e.x = this.player.facingRight ? this.player.x + this.player.w : this.player.x - e.w;
             e.y = this.player.y + this.player.h - 30;
           } else if (this.characterId === 'anita') {
             e.x = this.player.x - 50;
             e.y = this.player.y - 50;
           }
        }

        // Check collision with enemies
        for (const enemy of this.entities) {
          if (!enemy.dead && (enemy.type === 'enemy' || enemy.type === 'boss' || enemy.type === 'plant') && this.isIntersecting(e, enemy)) {
            // Damage enemy
            enemy.health = (enemy.health || 1) - (e.damage || 1);
            if (enemy.health <= 0) {
              enemy.dead = true;
              this.score += 50;
              this.onScoreChange?.(this.score, this.tacos);
              this.particles.push({
                x: enemy.x + enemy.w/2, y: enemy.y, text: 'POW!',
                time: 0, maxTime: 1, vy: -50, color: '#f1c40f'
              });
            }
            if (e.type === 'projectile') {
              e.dead = true;
            }
          }
        }
      }
    }

    // Update enemies and items
    this.entities.forEach(e => {
      if (e.dead) return;
      
      
        if (e.type === 'powerup') {
          if (this.isIntersecting(this.player, e)) {
            e.dead = true;
            this.player.activePowerup = e.powerupType;
            this.player.powerupTimer = 10; // 10 seconds of powerup
            this.onTaco?.(); // reuse sound
            this.particles.push({
              x: e.x, y: e.y, text: e.powerupType === 'red_salsa' ? 'SPICY!' : 'DASH!',
              time: 0, maxTime: 1.5, vy: -50, color: e.powerupType === 'red_salsa' ? '#e74c3c' : '#2ecc71'
            });
          }
        }

        if (e.type === 'taco') {
        if (this.isIntersecting(this.player, e)) {
          e.dead = true;
          this.tacos += 1;
          this.score += 100;
          this.onScoreChange?.(this.score, this.tacos);
          this.onTaco?.();
          this.particles.push({
            x: e.x + e.w / 2, y: e.y, text: '+100',
            time: 0, maxTime: 1, vy: -50, color: '#facc15'
          });
        }
      } else if (e.type === 'enemy' || e.type === 'boss') {
        if (e.vx === 0) e.vx = e.speed || 100;
        
        // Boss throw logic
        if (e.type === 'boss') {
          if (e.throwTimer === undefined) e.throwTimer = 0;
          e.throwTimer += dt;
          if (e.throwTimer > 2) { // throw every 2 seconds
             e.throwTimer = 0;
             const p = {
               id: 'proj_' + Math.random(),
               type: 'projectile',
               x: e.x, y: e.y + 100,
               w: 30, h: 30,
               vx: e.vx > 0 ? 300 : -300, vy: -150,
               color: '#654321'
             } as any;
             this.entities.push(p);
          }
        }
        
        e.vy += GRAVITY * dt;
        
        const oldVx = e.vx;
        e.x += e.vx * dt;
        
        if (e.patrolStart !== undefined && e.patrolEnd !== undefined) {
          if (e.x < e.patrolStart) { e.x = e.patrolStart; e.vx = Math.abs(e.vx); }
          if (e.x + e.w > e.patrolEnd) { e.x = e.patrolEnd - e.w; e.vx = -Math.abs(e.vx); }
        }
        
        this.handleCollisions(e, 'x');
        // If hit wall, reverse direction for enemies and bosses
        if (e.vx === 0) {
          e.vx = -oldVx;
        }
        
        e.y += e.vy * dt;
        this.handleCollisions(e, 'y');

        // Player collision with enemy/boss
        const pHitbox = this.getHitbox(this.player);
        const eHitbox = this.getHitbox(e);

        if (this.isIntersectingBox(pHitbox, eHitbox)) {
          // Jump on head (player falling downwards and player feet touch upper area of enemy)
          const playerFeet = pHitbox.y + pHitbox.h;
          const enemyTop = eHitbox.y;

          if (this.player.vy > 0 && playerFeet - enemyTop < eHitbox.h * 0.65) {
            this.player.vy = JUMP_FORCE * 0.8; // Bounce
            this.onStomp?.();
            
            if (e.type === 'boss') {
               e.health = (e.health || 0) - 1;
               this.particles.push({
                 x: e.x + e.w / 2, y: e.y, text: '-1',
                 time: 0, maxTime: 1, vy: -50, color: '#ff0000'
               });
               if (e.health <= 0) {
                 e.dead = true;
                 this.score += 5000;
                 this.onScoreChange?.(this.score, this.tacos);
                 this.particles.push({
                   x: e.x + e.w / 2, y: e.y, text: '+5000',
                   time: 0, maxTime: 2, vy: -50, color: '#FFD700'
                 });
               }
            } else {
               e.dead = true;
               this.score += 200;
               this.onScoreChange?.(this.score, this.tacos);
               this.particles.push({
                 x: e.x + e.w / 2, y: e.y, text: '+200',
                 time: 0, maxTime: 1, vy: -50, color: '#ff4500'
               });
            }
          } else {
            this.die();
          }
        }
      } else if (e.type === 'projectile') {
        e.vy += GRAVITY * dt;
        e.x += e.vx * dt;
        e.y += e.vy * dt;
        
        // Let them bounce once if they hit ground, or just ignore terrain and go across
        // If they hit player, player dies
        if (this.isIntersecting(this.player, e)) {
          if (this.player.activePowerup === 'green_salsa') {
             e.dead = true;
             this.score += 50;
             this.onScoreChange?.(this.score, this.tacos);
          } else {
            this.die();
          }
        }
        // destroy if out of bounds (too low or too far left)
        if (e.y > this.level.floorLevel || e.x < 0) {
          e.dead = true;
        }
      } else if (e.type === 'plant') {
        if (e.vy === undefined || e.vy === 0) e.vy = 50; // initial speed
        if (e.patrolStart === undefined) e.patrolStart = e.y - 100; // top position
        if (e.patrolEnd === undefined) e.patrolEnd = e.y; // bottom position (hidden)
        
        e.y += e.vy * dt;
        if (e.vy > 0 && e.y >= e.patrolEnd) {
          e.y = e.patrolEnd;
          e.vy = -150; // fast up
        } else if (e.vy < 0 && e.y <= e.patrolStart) {
          e.y = e.patrolStart;
          e.vy = 50; // slow down
        }

        // Only kill if player touches the head (top 40px) to be generous, or whole body? Let's say whole body for simplicity.
        if (this.isIntersecting(this.player, e)) {
          if (this.player.activePowerup === 'green_salsa') {
             e.dead = true;
             this.score += 50;
             this.onScoreChange?.(this.score, this.tacos);
          } else {
            this.die();
          }
        }
      } else if (e.type === 'spike') {
        if (this.isIntersecting(this.player, e)) {
          if (this.player.activePowerup !== 'green_salsa') {
            this.die();
          }
        }
      }
    });

    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.time += dt;
      p.x += (p.vx || 0) * dt;
      p.y += p.vy * dt;
      if (p.time >= p.maxTime) {
        this.particles.splice(i, 1);
      }
    }

    // Update camera
    this.camera.x = this.player.x - this.camera.w / 2;
    if (this.level.lockCameraY) {
      this.camera.y = 0;
    } else {
      this.camera.y = this.player.y - this.camera.h / 2;
      if (this.camera.y < 0) this.camera.y = 0;
      if (this.camera.y > this.level.floorLevel - this.camera.h) {
        this.camera.y = this.level.floorLevel - this.camera.h;
      }
    }
    
    // Keep camera bounded on X
    if (this.camera.x < 0) this.camera.x = 0;
  }

  private die() {
    this.player.dead = true;
    this.onDie?.();
  }

  private isIntersectingBox(a: Box, b: Box): boolean {
    return a.x < b.x + b.w && a.x + a.w > b.x &&
           a.y < b.y + b.h && a.y + a.h > b.y;
  }

  public getHitbox(e: Entity | Box): Box {
    const type = (e as Entity).type;
    if (!type) return { x: e.x, y: e.y, w: e.w, h: e.h };

    if (type === 'player') {
      // 120x120 player entity. Visual character sprite is centered.
      // Inset 30% horizontally, 12% top, 8% bottom so player only dies on actual visual contact
      const padX = e.w * 0.30; // 36px left and right
      const padTop = e.h * 0.12; // 14.4px top
      const padBot = e.h * 0.08; // 9.6px bottom
      return {
        x: e.x + padX,
        y: e.y + padTop,
        w: e.w - padX * 2,
        h: e.h - padTop - padBot
      };
    }

    if (type === 'enemy' || type === 'boss') {
      // Inset 18% left/right, 12% top/bottom
      const padX = e.w * 0.18;
      const padY = e.h * 0.12;
      return {
        x: e.x + padX,
        y: e.y + padY,
        w: e.w - padX * 2,
        h: e.h - padY * 2
      };
    }

    if (type === 'plant') {
      // Carnivorous plant stem & head: inset 20% left/right, 12% top/bottom
      const padX = e.w * 0.20;
      const padY = e.h * 0.12;
      return {
        x: e.x + padX,
        y: e.y + padY,
        w: e.w - padX * 2,
        h: e.h - padY * 2
      };
    }

    if (type === 'spike') {
      // Cactus / spikes: inset 22% left/right, 10% top/bottom
      const padX = e.w * 0.22;
      const padY = e.h * 0.10;
      return {
        x: e.x + padX,
        y: e.y + padY,
        w: e.w - padX * 2,
        h: e.h - padY * 2
      };
    }

    if (type === 'projectile') {
      const padX = e.w * 0.15;
      const padY = e.h * 0.15;
      return {
        x: e.x + padX,
        y: e.y + padY,
        w: e.w - padX * 2,
        h: e.h - padY * 2
      };
    }

    if (type === 'taco' || type === 'powerup') {
      // Slightly expanded so collecting items feels snappy
      return {
        x: e.x - 6,
        y: e.y - 6,
        w: e.w + 12,
        h: e.h + 12
      };
    }

    return { x: e.x, y: e.y, w: e.w, h: e.h };
  }

  private isIntersecting(a: Entity | Box, b: Entity | Box): boolean {
    return this.isIntersectingBox(this.getHitbox(a), this.getHitbox(b));
  }

  private handleCollisions(entity: Entity, axis: 'x' | 'y'): boolean {
    let hit = false;
    for (const block of this.entities) {
      if (block.type !== 'block') continue;
      
      // Use physical bounding box for ground/platform standing
      if (this.isIntersectingBox(entity, block)) {
        if (axis === 'x') {
          if (entity.vx > 0) {
            entity.x = block.x - entity.w;
          } else if (entity.vx < 0) {
            entity.x = block.x + block.w;
          }
          if (block.type === 'block') entity.vx = 0;
        } else {
          if (entity.vy > 0) {
            entity.y = block.y - entity.h;
            hit = true;
          } else if (entity.vy < 0) {
            entity.y = block.y + block.h;
          }
          if (block.type === 'block') entity.vy = 0;
        }
      }
    }
    return hit;
  }
}
