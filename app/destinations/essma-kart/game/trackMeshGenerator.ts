import * as THREE from 'three';
import { Vector3D } from '../types';

export interface TrackMeshResult {
  trackMesh: THREE.Mesh;
  curbMesh: THREE.Mesh;
  shoulderMesh: THREE.Mesh;
  decorationsGroup: THREE.Group;
}

export function buildProceduralTrackRibbon(
  splinePoints: Vector3D[],
  theme: 'day' | 'night' | 'cave'
): TrackMeshResult {
  const isNight = theme === 'night';
  const isCave = theme === 'cave';

  // 1. Create CatmullRomCurve3
  const curvePoints = splinePoints.map((p) => new THREE.Vector3(p.x, p.y, p.z));
  const curve = new THREE.CatmullRomCurve3(curvePoints, true, 'catmullrom', 0.5);

  const SAMPLES = 320;
  const TRACK_WIDTH = 24.0; // 24 meters wide arcade track
  const CURB_WIDTH = 2.0;   // 2 meters curb
  const SHOULDER_WIDTH = 4.0; // 4 meters shoulder

  // Arrays for Track Surface
  const trackVerts: number[] = [];
  const trackNorms: number[] = [];
  const trackUvs: number[] = [];
  const trackColors: number[] = [];
  const trackIndices: number[] = [];

  // Arrays for Curbs
  const curbVerts: number[] = [];
  const curbNorms: number[] = [];
  const curbColors: number[] = [];
  const curbIndices: number[] = [];

  // Arrays for Shoulders
  const shoulderVerts: number[] = [];
  const shoulderNorms: number[] = [];
  const shoulderColors: number[] = [];
  const shoulderIndices: number[] = [];

  const decorationsGroup = new THREE.Group();

  const up = new THREE.Vector3(0, 1, 0);

  for (let i = 0; i <= SAMPLES; i++) {
    const t = i / SAMPLES;
    const center = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t).normalize();

    // Right vector orthogonal to tangent and world UP
    let right = new THREE.Vector3().crossVectors(tangent, up).normalize();
    if (right.lengthSq() < 0.001) {
      right = new THREE.Vector3(1, 0, 0);
    }
    const normal = new THREE.Vector3().crossVectors(right, tangent).normalize();

    // Half widths
    const halfTrack = TRACK_WIDTH * 0.5;

    // Track surface vertices
    const pLeft = center.clone().addScaledVector(right, -halfTrack);
    const pRight = center.clone().addScaledVector(right, halfTrack);

    // Keep track surface slightly above terrain to prevent z-fighting
    pLeft.y += 0.15;
    pRight.y += 0.15;

    trackVerts.push(pLeft.x, pLeft.y, pLeft.z);
    trackVerts.push(pRight.x, pRight.y, pRight.z);

    trackNorms.push(normal.x, normal.y, normal.z);
    trackNorms.push(normal.x, normal.y, normal.z);

    const v = t * 40; // Repeats
    trackUvs.push(0, v);
    trackUvs.push(1, v);

    // Colors: Finish line checkering at t ~ 0
    const isFinishLine = t < 0.015 || t > 0.985;
    let r = isNight ? 0.15 : 0.22;
    let g = isNight ? 0.20 : 0.25;
    let b = isNight ? 0.28 : 0.30;

    if (isFinishLine) {
      r = 0.9; g = 0.9; b = 0.9;
    }

    trackColors.push(r, g, b, r, g, b);

    // Curbs (Red & White alternating stripes)
    const pCurbLeftOuter = pLeft.clone().addScaledVector(right, -CURB_WIDTH);
    const pCurbRightOuter = pRight.clone().addScaledVector(right, CURB_WIDTH);
    pCurbLeftOuter.y += 0.08;
    pCurbRightOuter.y += 0.08;

    const curbColorIndex = Math.floor(t * 80) % 2;
    const cr = curbColorIndex === 0 ? 0.93 : 0.95;
    const cg = curbColorIndex === 0 ? 0.20 : 0.95;
    const cb = curbColorIndex === 0 ? 0.25 : 0.95;

    curbVerts.push(pCurbLeftOuter.x, pCurbLeftOuter.y, pCurbLeftOuter.z);
    curbVerts.push(pLeft.x, pLeft.y, pLeft.z);
    curbVerts.push(pRight.x, pRight.y, pRight.z);
    curbVerts.push(pCurbRightOuter.x, pCurbRightOuter.y, pCurbRightOuter.z);

    for (let c = 0; c < 4; c++) {
      curbNorms.push(normal.x, normal.y, normal.z);
      curbColors.push(cr, cg, cb);
    }

    // Shoulders (Sandy dirt)
    const pShoulderLeft = pCurbLeftOuter.clone().addScaledVector(right, -SHOULDER_WIDTH);
    const pShoulderRight = pCurbRightOuter.clone().addScaledVector(right, SHOULDER_WIDTH);
    pShoulderLeft.y = Math.max(0.02, pShoulderLeft.y - 0.2);
    pShoulderRight.y = Math.max(0.02, pShoulderRight.y - 0.2);

    const sr = isNight ? 0.12 : isCave ? 0.10 : 0.70;
    const sg = isNight ? 0.15 : isCave ? 0.35 : 0.42;
    const sb = isNight ? 0.30 : isCave ? 0.60 : 0.20;

    shoulderVerts.push(pShoulderLeft.x, pShoulderLeft.y, pShoulderLeft.z);
    shoulderVerts.push(pCurbLeftOuter.x, pCurbLeftOuter.y, pCurbLeftOuter.z);
    shoulderVerts.push(pCurbRightOuter.x, pCurbRightOuter.y, pCurbRightOuter.z);
    shoulderVerts.push(pShoulderRight.x, pShoulderRight.y, pShoulderRight.z);

    for (let s = 0; s < 4; s++) {
      shoulderNorms.push(0, 1, 0);
      shoulderColors.push(sr, sg, sb);
    }

    // Support pillars for elevated bridge/hill sections
    if (center.y > 2.5 && i % 12 === 0) {
      const pillarGeo = new THREE.CylinderGeometry(0.8, 1.2, center.y, 8);
      const pillarMat = new THREE.MeshStandardMaterial({ color: 0x78350F, roughness: 0.8 });
      const pillar = new THREE.Mesh(pillarGeo, pillarMat);
      pillar.position.set(center.x, center.y / 2, center.z);
      pillar.castShadow = true;
      decorationsGroup.add(pillar);
    }
  }

  // Generate Indices
  for (let i = 0; i < SAMPLES; i++) {
    const row1 = i * 2;
    const row2 = (i + 1) * 2;

    trackIndices.push(row1, row2, row1 + 1);
    trackIndices.push(row1 + 1, row2, row2 + 1);

    const cRow1 = i * 4;
    const cRow2 = (i + 1) * 4;

    // Left curb quad
    curbIndices.push(cRow1, cRow2, cRow1 + 1);
    curbIndices.push(cRow1 + 1, cRow2, cRow2 + 1);

    // Right curb quad
    curbIndices.push(cRow1 + 2, cRow2 + 2, cRow1 + 3);
    curbIndices.push(cRow1 + 3, cRow2 + 2, cRow2 + 3);

    // Shoulder quads
    shoulderIndices.push(cRow1, cRow2, cRow1 + 1);
    shoulderIndices.push(cRow1 + 1, cRow2, cRow2 + 1);
    shoulderIndices.push(cRow1 + 2, cRow2 + 2, cRow1 + 3);
    shoulderIndices.push(cRow1 + 3, cRow2 + 2, cRow2 + 3);
  }

  // Create Geometries
  const trackGeo = new THREE.BufferGeometry();
  trackGeo.setAttribute('position', new THREE.Float32BufferAttribute(trackVerts, 3));
  trackGeo.setAttribute('normal', new THREE.Float32BufferAttribute(trackNorms, 3));
  trackGeo.setAttribute('uv', new THREE.Float32BufferAttribute(trackUvs, 2));
  trackGeo.setAttribute('color', new THREE.Float32BufferAttribute(trackColors, 3));
  trackGeo.setIndex(trackIndices);

  const curbGeo = new THREE.BufferGeometry();
  curbGeo.setAttribute('position', new THREE.Float32BufferAttribute(curbVerts, 3));
  curbGeo.setAttribute('normal', new THREE.Float32BufferAttribute(curbNorms, 3));
  curbGeo.setAttribute('color', new THREE.Float32BufferAttribute(curbColors, 3));
  curbGeo.setIndex(curbIndices);

  const shoulderGeo = new THREE.BufferGeometry();
  shoulderGeo.setAttribute('position', new THREE.Float32BufferAttribute(shoulderVerts, 3));
  shoulderGeo.setAttribute('normal', new THREE.Float32BufferAttribute(shoulderNorms, 3));
  shoulderGeo.setAttribute('color', new THREE.Float32BufferAttribute(shoulderColors, 3));
  shoulderGeo.setIndex(shoulderIndices);

  // Materials
  const trackMat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.7,
    metalness: 0.1,
    side: THREE.DoubleSide,
  });

  const curbMat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.5,
    side: THREE.DoubleSide,
  });

  const shoulderMat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.9,
    side: THREE.DoubleSide,
  });

  const trackMesh = new THREE.Mesh(trackGeo, trackMat);
  trackMesh.receiveShadow = true;

  const curbMesh = new THREE.Mesh(curbGeo, curbMat);
  curbMesh.receiveShadow = true;

  const shoulderMesh = new THREE.Mesh(shoulderGeo, shoulderMat);
  shoulderMesh.receiveShadow = true;

  return { trackMesh, curbMesh, shoulderMesh, decorationsGroup };
}
