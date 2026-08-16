import * as THREE from 'three';
import { RacerState, Vector3D, ItemType, CharacterId, KartId } from '../types';
import { CHARACTERS } from '../content/characters';
import { TrackData } from './trackData';
import { SplinePath } from './splinePath';
import { audio } from './audioEngine';

export interface KartInputs {
  accelerate: boolean;
  reverse: boolean;
  steer: number; // -1 to 1
  drift: boolean;
  useItem: boolean;
  respawn: boolean;
}

export class KartController {
  public state: RacerState;
  private mesh: THREE.Group;
  private trackData: TrackData;
  private splinePath: SplinePath;
  private executedTrickInAir = false;

  constructor(id: string, characterId: CharacterId, kartId: KartId, isAI: boolean, startPos: Vector3D, trackData: TrackData) {
    this.trackData = trackData;
    this.splinePath = new SplinePath(trackData.spline);

    const initialRoadInfo = this.splinePath.getClosestInfo(startPos);
    const initialY = initialRoadInfo.distanceToCenter <= 14.0 ? initialRoadInfo.roadY + 0.15 : startPos.y;

    this.state = {
      id,
      characterId,
      kartId,
      isAI,
      position: { x: startPos.x, y: initialY, z: startPos.z },
      velocity: { x: 0, y: 0, z: 0 },
      rotationY: 0,
      pitch: 0,
      roll: 0,
      speed: 0,
      steerAngle: 0,
      isDrifting: false,
      driftDirection: 0,
      driftTime: 0,
      miniTurboLevel: 0,
      boostTimer: 0,
      lap: 1,
      checkpointIndex: 0,
      splineProgress: 0,
      raceRank: 4,
      finished: false,
      finishTime: 0,
      currentItem: 'none',
      hasShield: false,
      shieldTimer: 0,
      spinoutTimer: 0,
      offroadTimer: 0,
      wrongWay: false,
      coinsCollected: 0,
    };

    this.mesh = new THREE.Group();
    this.mesh.position.set(this.state.position.x, this.state.position.y, this.state.position.z);
  }

  public getMesh(): THREE.Group {
    return this.mesh;
  }

  public setMesh(mesh: THREE.Group) {
    this.mesh = mesh;
  }

  public update(delta: number, inputs: KartInputs): {
    triggeredItem: ItemType | null;
    collectedCoin: boolean;
    collectedItemBox: boolean;
    hitBoostPad: boolean;
    completedLap: boolean;
  } {
    let triggeredItem: ItemType | null = null;
    let collectedCoin = false;
    let collectedItemBox = false;
    let hitBoostPad = false;

    const stats = CHARACTERS[this.state.characterId].stats;

    // Handle Spinout stun
    if (this.state.spinoutTimer > 0) {
      this.state.spinoutTimer -= delta;
      this.state.speed *= 0.9;
      this.state.rotationY += delta * 12; // Spin around
      this.mesh.position.set(this.state.position.x, this.state.position.y, this.state.position.z);
      this.mesh.rotation.y = this.state.rotationY;
      return { triggeredItem, collectedCoin, collectedItemBox, hitBoostPad, completedLap: false };
    }

    // Boost timer
    if (this.state.boostTimer > 0) {
      this.state.boostTimer -= delta;
    }

    // Query continuous spline road surface
    const roadInfo = this.splinePath.getClosestInfo(this.state.position);

    // Calculate Ground Y Height
    let targetGroundY = 0;
    if (roadInfo.distanceToCenter <= 14.0) {
      targetGroundY = roadInfo.roadY + 0.15; // On track surface
    } else if (roadInfo.distanceToCenter > 18.0) {
      targetGroundY = 0.0; // Off-road terrain
    } else {
      const factor = (18.0 - roadInfo.distanceToCenter) / 4.0;
      targetGroundY = factor * (roadInfo.roadY + 0.15); // Smooth transition
    }

    // Y Vertical Gravity / Ground Snapping Physics
    if (this.state.position.y > targetGroundY + 0.1) {
      this.state.velocity.y -= 25.0 * delta;
      this.state.position.y += this.state.velocity.y * delta;
      if (this.state.position.y <= targetGroundY) {
        this.state.position.y = targetGroundY;
        this.state.velocity.y = 0;
      }
    } else {
      this.state.velocity.y = 0;
      this.state.position.y += (targetGroundY - this.state.position.y) * Math.min(1.0, delta * 15.0);
    }

    // Calculate Max Speed & Accel with Coin Bonus
    const coinBonus = 1.0 + Math.min(10, this.state.coinsCollected) * 0.015;
    const maxSpeed = (stats.topSpeed / 2.2) * (this.state.boostTimer > 0 ? 1.45 : 1.0) * coinBonus;
    const accelRate = (stats.acceleration / 10) * (this.state.boostTimer > 0 ? 2.2 : 1.0);

    // Off-road speed reduction using smooth spline distance
    const isOffroad = roadInfo.isOffroad;
    const speedCap = isOffroad ? maxSpeed * 0.45 : maxSpeed;

    // Acceleration / Braking & Pitch lean
    if (inputs.accelerate) {
      this.state.speed += accelRate * delta * 20;
      if (this.state.speed > speedCap) this.state.speed = speedCap;
      this.state.pitch += (0.08 - this.state.pitch) * delta * 5; // Slight pitch back
    } else if (inputs.reverse) {
      this.state.speed -= accelRate * delta * 15;
      if (this.state.speed < -maxSpeed * 0.4) this.state.speed = -maxSpeed * 0.4;
      this.state.pitch += (-0.12 - this.state.pitch) * delta * 5; // Dip front
    } else {
      this.state.speed *= 0.96; // Friction drag
    }

    // Steering & Drifting
    const steerFactor = (stats.handling / 80) * (Math.abs(this.state.speed) > 5 ? 1 : this.state.speed / 5);

    if (inputs.drift && Math.abs(this.state.speed) > 12 && !this.state.isDrifting && inputs.steer !== 0) {
      this.state.isDrifting = true;
      this.state.driftDirection = inputs.steer > 0 ? 1 : -1;
      this.state.driftTime = 0;
      this.state.velocity.y = 5.0; // Hop jump on drift start!
      this.state.position.y += 0.3;
    }

    if (this.state.isDrifting) {
      if (!inputs.drift || Math.abs(this.state.speed) < 8) {
        // Release drift -> Mini Turbo!
        if (this.state.miniTurboLevel > 0) {
          this.state.boostTimer = this.state.miniTurboLevel === 3 ? 3.2 : this.state.miniTurboLevel === 2 ? 2.0 : 1.0;
        }
        this.state.isDrifting = false;
        this.state.driftTime = 0;
        this.state.miniTurboLevel = 0;
      } else {
        this.state.driftTime += delta;
        const prevLevel = this.state.miniTurboLevel;
        if (this.state.driftTime > 3.6) this.state.miniTurboLevel = 3; // Purple Ultra Mini-Turbo
        else if (this.state.driftTime > 2.2) this.state.miniTurboLevel = 2; // Orange Super Mini-Turbo
        else if (this.state.driftTime > 1.0) this.state.miniTurboLevel = 1; // Blue Mini-Turbo

        if (this.state.miniTurboLevel > prevLevel && !this.state.isAI) {
          audio.playDriftStageCharge(this.state.miniTurboLevel);
        }

        // Drift sliding angle & roll tilt
        const driftSteer = inputs.steer * steerFactor * 1.5 + this.state.driftDirection * 0.85;
        this.state.rotationY += driftSteer * delta * 1.8;
        this.state.roll += (this.state.driftDirection * -0.22 - this.state.roll) * delta * 8;
      }
    } else {
      this.state.rotationY += inputs.steer * steerFactor * delta * 2.2;
      this.state.roll += (inputs.steer * -0.15 - this.state.roll) * delta * 6;
    }

    // Recover pitch/roll toward zero
    this.state.pitch *= 0.85;
    this.state.roll *= 0.88;

    // Move along facing vector
    const dirX = -Math.sin(this.state.rotationY);
    const dirZ = -Math.cos(this.state.rotationY);

    this.state.position.x += dirX * this.state.speed * delta;
    this.state.position.z += dirZ * this.state.speed * delta;

    // Elastic Track Wall Soft Deflection (keep karts on course without getting stuck)
    if (roadInfo.distanceToCenter > 16.5) {
      const overdist = roadInfo.distanceToCenter - 16.5;
      const pushX = (this.state.position.x - roadInfo.closestPoint.x) / roadInfo.distanceToCenter;
      const pushZ = (this.state.position.z - roadInfo.closestPoint.z) / roadInfo.distanceToCenter;
      this.state.position.x -= pushX * overdist * 0.8;
      this.state.position.z -= pushZ * overdist * 0.8;
      this.state.speed *= 0.85;
    }

    // Jump Ramp Trick System (Airborne trick flip)
    if (this.state.position.y > targetGroundY + 1.8) {
      if (inputs.drift) {
        this.executedTrickInAir = true;
        this.state.pitch += Math.PI * 5 * delta;
      }
    } else {
      if (this.executedTrickInAir) {
        this.executedTrickInAir = false;
        this.state.boostTimer = 1.5; // Landing trick boost!
        hitBoostPad = true;
      }
    }

    // Check Boost Pads
    this.trackData.boostPads.forEach((bp) => {
      const dx = this.state.position.x - bp.position.x;
      const dz = this.state.position.z - bp.position.z;
      if (Math.hypot(dx, dz) < 4.0) {
        this.state.boostTimer = 2.5;
        hitBoostPad = true;
      }
    });

    // Check Taco Coins
    this.trackData.tacoCoins.forEach((tc) => {
      if (!tc.collected) {
        const dx = this.state.position.x - tc.position.x;
        const dz = this.state.position.z - tc.position.z;
        if (Math.hypot(dx, dz) < 3.0) {
          tc.collected = true;
          tc.respawnTimer = 10.0;
          this.state.coinsCollected += 1;
          collectedCoin = true;
        }
      }
    });

    // Check Item Boxes
    this.trackData.itemBoxes.forEach((ib) => {
      if (ib.active && this.state.currentItem === 'none') {
        const dx = this.state.position.x - ib.position.x;
        const dz = this.state.position.z - ib.position.z;
        if (Math.hypot(dx, dz) < 3.5) {
          ib.active = false;
          ib.respawnTimer = 6.0;
          this.state.currentItem = this.getRandomItemByRank(this.state.raceRank);
          collectedItemBox = true;
        }
      }
    });

    // Handle Item Triggering
    if (inputs.useItem && this.state.currentItem !== 'none') {
      triggeredItem = this.state.currentItem;
      if (triggeredItem === 'lightning_boost') {
        this.state.boostTimer = 3.0;
      } else if (triggeredItem === 'heart_shield') {
        this.state.hasShield = true;
        this.state.shieldTimer = 12.0;
      }
      this.state.currentItem = 'none';
    }

    // Shield Timer
    if (this.state.hasShield) {
      this.state.shieldTimer -= delta;
      if (this.state.shieldTimer <= 0) this.state.hasShield = false;
    }

    // Update Mesh Transform
    this.mesh.position.set(this.state.position.x, this.state.position.y + this.state.pitch, this.state.position.z);
    this.mesh.rotation.y = this.state.rotationY;

    // Check Checkpoints & Spline Progress
    const completedLap = this.updateSplineProgress();

    return { triggeredItem, collectedCoin, collectedItemBox, hitBoostPad, completedLap };
  }

  public spinout() {
    if (this.state.hasShield) {
      this.state.hasShield = false; // Blocked by shield!
      return false;
    }
    this.state.spinoutTimer = 1.2;
    return true;
  }

  private getRandomItemByRank(rank: number): ItemType {
    const r = Math.random();
    if (rank === 1) {
      if (r < 0.3) return 'banana';
      if (r < 0.5) return 'coin';
      if (r < 0.8) return 'heart_shield';
      return 'cactus_ball';
    } else if (rank === 2 || rank === 3) {
      if (r < 0.25) return 'lightning_boost';
      if (r < 0.5) return 'shell';
      if (r < 0.7) return 'banana';
      if (r < 0.85) return 'cactus_ball';
      return 'coin';
    } else { // 4th place gets strong recovery items!
      if (r < 0.4) return 'lightning_boost';
      if (r < 0.8) return 'shell';
      return 'coin';
    }
  }

  private updateSplineProgress(): boolean {
    let completedLap = false;
    const roadInfo = this.splinePath.getClosestInfo(this.state.position);
    const spline = this.trackData.spline;

    // Checkpoint logic
    let closestCP = 0;
    let minD = 999;
    for (let i = 0; i < spline.length; i++) {
      const d = Math.hypot(this.state.position.x - spline[i].x, this.state.position.z - spline[i].z);
      if (d < minD) {
        minD = d;
        closestCP = i;
      }
    }

    const nextCP = (this.state.checkpointIndex + 1) % spline.length;
    if (closestCP === nextCP) {
      this.state.checkpointIndex = nextCP;
      if (nextCP === 0) {
        this.state.lap += 1;
        completedLap = true;
      }
    }

    this.state.splineProgress = (this.state.lap - 1) + roadInfo.t;
    return completedLap;
  }
}
