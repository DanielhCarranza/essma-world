import * as THREE from 'three';
import { Vector3D } from '../types';

export interface ClosestRoadInfo {
  roadY: number;
  distanceToCenter: number;
  closestPoint: THREE.Vector3;
  tangent: THREE.Vector3;
  t: number;
  sampleIndex: number;
  totalSamples: number;
  isOnRoad: boolean;
  isOffroad: boolean;
}

export class SplinePath {
  public curve: THREE.CatmullRomCurve3;
  private samples: { point: THREE.Vector3; tangent: THREE.Vector3; t: number }[] = [];

  constructor(splinePoints: Vector3D[], sampleCount = 600) {
    const points = splinePoints.map((p) => new THREE.Vector3(p.x, p.y, p.z));
    this.curve = new THREE.CatmullRomCurve3(points, true, 'catmullrom', 0.5);

    for (let i = 0; i < sampleCount; i++) {
      const t = i / sampleCount;
      const point = this.curve.getPointAt(t);
      const tangent = this.curve.getTangentAt(t).normalize();
      this.samples.push({ point, tangent, t });
    }
  }

  public getClosestInfo(pos: { x: number; y: number; z: number }): ClosestRoadInfo {
    let minDistSq = Infinity;
    let closestIndex = 0;

    for (let i = 0; i < this.samples.length; i++) {
      const sp = this.samples[i].point;
      const dx = pos.x - sp.x;
      const dz = pos.z - sp.z;
      const distSq = dx * dx + dz * dz;
      if (distSq < minDistSq) {
        minDistSq = distSq;
        closestIndex = i;
      }
    }

    const closest = this.samples[closestIndex];
    const distanceToCenter = Math.sqrt(minDistSq);

    // Track width is 24.0m (half = 12.0m) + 2.0m curb = 14.0m radius
    const isOnRoad = distanceToCenter <= 14.0;
    const isOffroad = distanceToCenter > 14.0;

    return {
      roadY: closest.point.y,
      distanceToCenter,
      closestPoint: closest.point,
      tangent: closest.tangent,
      t: closest.t,
      sampleIndex: closestIndex,
      totalSamples: this.samples.length,
      isOnRoad,
      isOffroad,
    };
  }
}
