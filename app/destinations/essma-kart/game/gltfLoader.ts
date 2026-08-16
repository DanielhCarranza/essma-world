import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const loader = new GLTFLoader();
const loadedCache = new Map<string, THREE.Group>();

export const ESSMA_KART_GLB_PATH =
  "/assets/destinations/essma-kart/v1/essma-kart-model.glb?v=3";

/**
 * Loads the authored Essma Kart GLB when present, then normalizes scale,
 * grounds the pivot, and clones into the kart group. Procedural meshes stay
 * as the fallback if the file is missing or fails to parse.
 */
export async function tryLoadGlbKartModel(
  kartId: string,
  targetGroup: THREE.Group,
): Promise<boolean> {
  const possiblePaths = [ESSMA_KART_GLB_PATH];

  for (const path of possiblePaths) {
    if (loadedCache.has(path)) {
      targetGroup.clear();
      targetGroup.add(loadedCache.get(path)!.clone(true));
      return true;
    }

    const model = await loadNormalizedKart(path, kartId);
    if (!model) continue;
    loadedCache.set(path, model);
    targetGroup.clear();
    targetGroup.add(model.clone(true));
    return true;
  }

  return false;
}

function loadNormalizedKart(
  path: string,
  kartId: string,
): Promise<THREE.Group | null> {
  return new Promise((resolve) => {
    loader.load(
      path,
      (gltf) => {
        const rawModel = gltf.scene;
        const normalizedWrapper = new THREE.Group();
        normalizedWrapper.name = `normalized_glb_${kartId}`;

        const box = new THREE.Box3().setFromObject(rawModel);
        const size = new THREE.Vector3();
        box.getSize(size);
        const targetLength = 2.3;
        const scaleFactor = size.z > 0.001 ? targetLength / size.z : 1;
        rawModel.scale.setScalar(scaleFactor);
        rawModel.rotation.y = Math.PI;

        const scaledBox = new THREE.Box3().setFromObject(rawModel);
        const scaledCenter = new THREE.Vector3();
        scaledBox.getCenter(scaledCenter);
        rawModel.position.x = -scaledCenter.x;
        rawModel.position.z = -scaledCenter.z;
        rawModel.position.y = -scaledBox.min.y;

        rawModel.traverse((child) => {
          if (!(child as THREE.Mesh).isMesh) return;
          child.castShadow = true;
          child.receiveShadow = true;
          const mesh = child as THREE.Mesh;
          const materials = Array.isArray(mesh.material)
            ? mesh.material
            : [mesh.material];
          for (const mat of materials) {
            if (
              mat instanceof THREE.MeshStandardMaterial ||
              mat instanceof THREE.MeshPhysicalMaterial
            ) {
              mat.envMapIntensity = 1.2;
              mat.needsUpdate = true;
            }
          }
        });

        normalizedWrapper.add(rawModel);

        const boostSocketL = new THREE.Object3D();
        boostSocketL.name = "socket_boost_L";
        boostSocketL.position.set(-0.35, 0.4, 1.15);
        const boostSocketR = new THREE.Object3D();
        boostSocketR.name = "socket_boost_R";
        boostSocketR.position.set(0.35, 0.4, 1.15);
        normalizedWrapper.add(boostSocketL, boostSocketR);

        resolve(normalizedWrapper);
      },
      undefined,
      (error) => {
        console.warn(`Essma Kart GLB failed to load from ${path}`, error);
        resolve(null);
      },
    );
  });
}
