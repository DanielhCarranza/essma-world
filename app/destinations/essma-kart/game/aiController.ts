import { KartController, KartInputs } from './kartController';
import { TrackData } from './trackData';

export class AIController {
  private kart: KartController;
  private trackData: TrackData;
  private targetWaypointIndex = 0;
  private apexOffset = (Math.random() - 0.5) * 4.0; // Dynamic racing line offset

  constructor(kart: KartController, trackData: TrackData) {
    this.kart = kart;
    this.trackData = trackData;
  }

  public getInputs(playerProgress: number = 0): KartInputs {
    const pos = this.kart.state.position;
    const spline = this.trackData.spline;

    // Find current target waypoint on racing line with apex offset
    let target = spline[this.targetWaypointIndex];
    let dist = Math.hypot(target.x - pos.x, target.z - pos.z);

    if (dist < 18.0) {
      this.targetWaypointIndex = (this.targetWaypointIndex + 1) % spline.length;
      target = spline[this.targetWaypointIndex];
      // Slightly shift apex offset periodically
      if (Math.random() < 0.3) {
        this.apexOffset = (Math.random() - 0.5) * 3.5;
      }
    }

    // Steering toward target with slight offset
    const targetX = target.x + Math.cos(this.targetWaypointIndex) * this.apexOffset;
    const targetZ = target.z + Math.sin(this.targetWaypointIndex) * this.apexOffset;

    const angleToTarget = Math.atan2(-(targetX - pos.x), -(targetZ - pos.z));
    let angleDiff = angleToTarget - this.kart.state.rotationY;

    // Normalize angle
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

    const steer = Math.max(-1, Math.min(1, angleDiff * 1.8));

    // Sharp turn -> drift
    const drift = Math.abs(angleDiff) > 0.55;

    // Rubberbanding & Adaptive speed adjustment
    const aiProgress = this.kart.state.splineProgress;
    const progressDiff = playerProgress - aiProgress;

    let accelerate = true;
    if (progressDiff > 100) {
      // Behind player -> catch up boost!
      if (Math.random() < 0.1 && this.kart.state.boostTimer <= 0) {
        this.kart.state.boostTimer = 0.8;
      }
    } else if (progressDiff < -150) {
      // Too far ahead -> normalize pace slightly
      accelerate = Math.random() > 0.15;
    }

    // Tactical item usage logic (boost immediately, shell/banana near targets)
    let useItem = false;
    if (this.kart.state.currentItem !== 'none') {
      const item = this.kart.state.currentItem;
      if (item === 'lightning_boost' || item === 'coin' || item === 'heart_shield') {
        useItem = true; // Use instantly
      } else {
        useItem = Math.random() < 0.03;
      }
    }

    return {
      accelerate,
      reverse: false,
      steer,
      drift,
      useItem,
      respawn: false,
    };
  }
}

