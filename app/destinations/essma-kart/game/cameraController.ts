import * as THREE from 'three';
import { Vector3D } from '../types';

export class CameraController {
  private camera: THREE.PerspectiveCamera;
  private currentPos = new THREE.Vector3();
  private currentLookAt = new THREE.Vector3();
  private shakeTimer = 0;

  constructor(camera: THREE.PerspectiveCamera) {
    this.camera = camera;
  }

  public triggerImpactShake() {
    this.shakeTimer = 0.4;
  }

  public update(
    kartPos: Vector3D,
    rotationY: number,
    speed: number,
    isBoosting: boolean,
    delta: number,
    driftDir: number = 0
  ) {
    // Offset target behind kart with drift apex angle shift
    const distance = 8.5 + (isBoosting ? 2.8 : 0);
    const height = 4.0;

    // Shift camera slightly outwards when drifting so player looks into the corner
    const driftOffsetX = driftDir !== 0 ? Math.cos(rotationY) * driftDir * 2.2 : 0;
    const driftOffsetZ = driftDir !== 0 ? -Math.sin(rotationY) * driftDir * 2.2 : 0;

    const targetX = kartPos.x + Math.sin(rotationY) * distance + driftOffsetX;
    const targetY = kartPos.y + height;
    const targetZ = kartPos.z + Math.cos(rotationY) * distance + driftOffsetZ;

    const targetLookX = kartPos.x - Math.sin(rotationY) * 2.5 - driftOffsetX * 0.5;
    const targetLookY = kartPos.y + 1.2;
    const targetLookZ = kartPos.z - Math.cos(rotationY) * 2.5 - driftOffsetZ * 0.5;

    // Smooth position interpolation
    this.currentPos.x += (targetX - this.currentPos.x) * delta * 7.5;
    this.currentPos.y += (targetY - this.currentPos.y) * delta * 7.5;
    this.currentPos.z += (targetZ - this.currentPos.z) * delta * 7.5;

    this.currentLookAt.x += (targetLookX - this.currentLookAt.x) * delta * 9.0;
    this.currentLookAt.y += (targetLookY - this.currentLookAt.y) * delta * 9.0;
    this.currentLookAt.z += (targetLookZ - this.currentLookAt.z) * delta * 9.0;

    // Camera shake
    let shakeOffset = new THREE.Vector3();
    if (this.shakeTimer > 0) {
      this.shakeTimer -= delta;
      const intensity = this.shakeTimer * 1.5;
      shakeOffset.set(
        (Math.random() - 0.5) * intensity,
        (Math.random() - 0.5) * intensity,
        (Math.random() - 0.5) * intensity
      );
    }

    this.camera.position.copy(this.currentPos).add(shakeOffset);
    this.camera.lookAt(this.currentLookAt);

    // Dynamic FOV with speed & boost pulse
    const baseFOV = 62;
    const speedFOV = Math.min(20, Math.abs(speed) * 0.4);
    const boostFOV = isBoosting ? 16 : 0;
    const targetFOV = baseFOV + speedFOV + boostFOV;
    
    this.camera.fov += (targetFOV - this.camera.fov) * delta * 6.0;
    this.camera.updateProjectionMatrix();
  }
}
