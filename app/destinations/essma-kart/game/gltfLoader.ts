import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const loader = new GLTFLoader();
const loadedCache = new Map<string, THREE.Group>();

/**
 * Checks for a custom .glb file in /public/models/ or /public/
 * e.g. /models/essma_kart.glb or /models/heart.glb
 * Automatically normalizes bounds, aligns pivot to bottom ground plane,
 * scales to standard kart size (length ~ 2.2m), and configures shadows & materials.
 */
export async function tryLoadGlbKartModel(
  kartId: string,
  targetGroup: THREE.Group
): Promise<boolean> {
  // Possible paths to look for GLB files in /public
  const possiblePaths = [
    `/models/${kartId}.glb`,
    `/models/${kartId}_kart.glb`,
    `/models/essma_kart.glb`,
    `/${kartId}.glb`,
    `/essma_kart.glb`
  ];

  for (const path of possiblePaths) {
    if (loadedCache.has(path)) {
      const cached = loadedCache.get(path)!.clone(true);
      targetGroup.clear();
      targetGroup.add(cached);
      return true;
    }

    try {
      // Check if file exists via HEAD request
      const response = await fetch(path, { method: 'HEAD' });
      if (response.ok) {
        return new Promise((resolve) => {
          loader.load(
            path,
            (gltf) => {
              const rawModel = gltf.scene;

              // Create a normalized wrapper group
              const normalizedWrapper = new THREE.Group();
              normalizedWrapper.name = `normalized_glb_${kartId}`;

              // Compute bounding box
              const box = new THREE.Box3().setFromObject(rawModel);
              const size = new THREE.Vector3();
              const center = new THREE.Vector3();
              box.getSize(size);
              box.getCenter(center);

              // Target kart dimensions in meters: length ~ 2.3m
              const targetLength = 2.3;
              const maxDim = Math.max(size.x, size.y, size.z);
              const scaleFactor = maxDim > 0 ? (targetLength / size.z) : 1;

              rawModel.scale.set(scaleFactor, scaleFactor, scaleFactor);

              // Re-compute center & bottom alignment after scaling
              const scaledBox = new THREE.Box3().setFromObject(rawModel);
              const scaledCenter = new THREE.Vector3();
              scaledBox.getCenter(scaledCenter);

              // Position rawModel so center is (0, yOffset, 0) with wheels touching Y=0
              rawModel.position.x = -scaledCenter.x;
              rawModel.position.z = -scaledCenter.z;
              rawModel.position.y = -scaledBox.min.y;

              // Configure meshes, shadows & PBR material properties
              rawModel.traverse((child) => {
                if ((child as THREE.Mesh).isMesh) {
                  child.castShadow = true;
                  child.receiveShadow = true;

                  const mesh = child as THREE.Mesh;
                  if (mesh.material) {
                    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
                    materials.forEach((mat) => {
                      if (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshPhysicalMaterial) {
                        mat.envMapIntensity = 1.2;
                        mat.needsUpdate = true;
                      }
                    });
                  }
                }
              });

              normalizedWrapper.add(rawModel);

              // Add Exhaust Boost Sockets at the rear bottom
              const boostSocketL = new THREE.Object3D();
              boostSocketL.name = 'socket_boost_L';
              boostSocketL.position.set(-0.35, 0.4, 1.15);

              const boostSocketR = new THREE.Object3D();
              boostSocketR.name = 'socket_boost_R';
              boostSocketR.position.set(0.35, 0.4, 1.15);

              normalizedWrapper.add(boostSocketL, boostSocketR);

              loadedCache.set(path, normalizedWrapper);
              targetGroup.clear();
              targetGroup.add(normalizedWrapper.clone(true));

              console.log(`Successfully loaded and normalized GLB model from: ${path}`);
              resolve(true);
            },
            undefined,
            (error) => {
              console.warn(`Failed to parse GLB at ${path}:`, error);
              resolve(false);
            }
          );
        });
      }
    } catch {
      // Ignore fetch errors, try next path
    }
  }

  return false;
}

