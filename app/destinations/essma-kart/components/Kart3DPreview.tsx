import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { CharacterId, KartId } from '../types';
import { createKartModel } from '../game/proceduralModels';
import { tryLoadGlbKartModel } from '../game/gltfLoader';

interface Kart3DPreviewProps {
  kartId: KartId;
  characterId: CharacterId;
  className?: string;
  autoRotate?: boolean;
}

export const Kart3DPreview: React.FC<Kart3DPreviewProps> = ({
  kartId,
  characterId,
  className = 'w-full h-36',
  autoRotate = true,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    
    // Soft transparent ambient background
    const camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.1, 50);
    camera.position.set(3.2, 2.0, 3.8);
    camera.lookAt(0, 0.4, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfbbf24, 1.8);
    dirLight.position.set(4, 6, 4);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0x38bdf8, 1.2, 10);
    pointLight.position.set(-3, 2, -2);
    scene.add(pointLight);

    // Pedestal
    const pedestalGeo = new THREE.CylinderGeometry(1.6, 1.8, 0.15, 24);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0x78350f,
      roughness: 0.4,
      metalness: 0.3,
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.y = -0.1;
    pedestal.receiveShadow = true;
    scene.add(pedestal);

    const kartGroup = createKartModel(kartId, characterId);
    scene.add(kartGroup);
    if (characterId === "essma" || kartId === "heart") {
      void tryLoadGlbKartModel(kartId, kartGroup);
    }

    let animId: number;
    let angle = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (autoRotate) {
        angle += 0.015;
        kartGroup.rotation.y = angle;
      }
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [kartId, characterId, autoRotate]);

  return (
    <div className={`relative overflow-hidden rounded-xl bg-gradient-to-b from-amber-100/50 to-amber-200/40 border border-amber-300/80 shadow-inner ${className}`}>
      <div ref={mountRef} className="w-full h-full" />
    </div>
  );
};
