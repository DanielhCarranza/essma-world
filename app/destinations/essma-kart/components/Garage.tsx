import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useGameStore } from '../store/gameStore';
import { KARTS, CHARACTERS } from '../content/characters';
import { WHEELS, GLIDERS, PAINTS, WheelId, GliderId, PaintId } from '../content/customizations';
import { createKartModel } from '../game/proceduralModels';
import { tryLoadGlbKartModel } from '../game/gltfLoader';
import { KartId } from '../types';
import { ArrowLeft, Trophy, Lock, Check, Sparkles, Shield, Zap, Compass, Anchor } from 'lucide-react';
import { audio } from '../game/audioEngine';

type CategoryTab = 'kart' | 'wheel' | 'glider' | 'paint';

export const Garage: React.FC = () => {
  const { save, setStatus, selectKart, selectWheel, selectGlider, selectPaint, unlockItem, addCoins } = useGameStore();
  const [activeTab, setActiveTab] = useState<CategoryTab>('kart');
  const mountRef = useRef<HTMLDivElement>(null);

  // Calculate combined stats
  const baseStats = CHARACTERS[save.selectedCharacter]?.stats || {
    topSpeed: 85,
    acceleration: 85,
    handling: 85,
    driftGrip: 85,
    weight: 80,
    boostPower: 85,
  };

  const wheelBonus = WHEELS[save.selectedWheel]?.statBonus || {};
  const gliderBonus = GLIDERS[save.selectedGlider]?.statBonus || {};
  const paintBonus = PAINTS[save.selectedPaint]?.statBonus || {};

  const totalTopSpeed = Math.min(100, Math.max(20, baseStats.topSpeed + (wheelBonus.topSpeed || 0) + (gliderBonus.topSpeed || 0) + (paintBonus.topSpeed || 0)));
  const totalAccel = Math.min(100, Math.max(20, baseStats.acceleration + (wheelBonus.acceleration || 0) + (gliderBonus.acceleration || 0) + (paintBonus.acceleration || 0)));
  const totalHandling = Math.min(100, Math.max(20, baseStats.handling + (wheelBonus.handling || 0) + (gliderBonus.handling || 0) + (paintBonus.handling || 0)));
  const totalDriftGrip = Math.min(100, Math.max(20, baseStats.driftGrip + (wheelBonus.driftGrip || 0) + (gliderBonus.driftGrip || 0) + (paintBonus.driftGrip || 0)));

  // 3D Showroom Scene setup
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0F172A);

    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(3.5, 2.2, 4.5);
    camera.lookAt(0, 0.5, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // Showroom Lighting
    const ambientLight = new THREE.AmbientLight(0xF8FAFC, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xF59E0B, 1.5);
    dirLight.position.set(5, 8, 5);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0x38BDF8, 2, 10);
    pointLight.position.set(-3, 2, -3);
    scene.add(pointLight);

    // Showroom Pedestal Floor
    const pedestalGeo = new THREE.CylinderGeometry(2.5, 2.7, 0.2, 32);
    const pedestalMat = new THREE.MeshStandardMaterial({ color: 0x1E293B, roughness: 0.3, metalness: 0.5 });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.y = -0.1;
    pedestal.receiveShadow = true;
    scene.add(pedestal);

    // Create Kart Mesh with selected customization options
    const kartGroup = createKartModel(
      save.selectedKart,
      save.selectedCharacter,
      save.selectedWheel,
      save.selectedGlider,
      save.selectedPaint
    );
    scene.add(kartGroup);
    void tryLoadGlbKartModel(save.selectedKart, kartGroup);

    // Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      kartGroup.rotation.y += 0.008;
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
      if (renderer.domElement) container.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [save.selectedKart, save.selectedCharacter, save.selectedWheel, save.selectedGlider, save.selectedPaint]);

  const handleBuy = (category: 'wheel' | 'glider' | 'paint', id: string, price: number) => {
    audio.init();
    const success = unlockItem(category, id, price);
    if (success) {
      audio.playCoin();
      if (category === 'wheel') selectWheel(id as WheelId);
      if (category === 'glider') selectGlider(id as GliderId);
      if (category === 'paint') selectPaint(id as PaintId);
    } else {
      audio.playSpinout();
    }
  };

  return (
    <div className="relative w-full h-screen bg-slate-950 text-white flex flex-col justify-between p-4 md:p-6 select-none overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between w-full max-w-6xl mx-auto z-10">
        <button
          onClick={() => setStatus('title')}
          className="bg-slate-900 hover:bg-slate-800 border border-slate-700 px-4 py-2 rounded-2xl flex items-center gap-2 font-bold text-slate-300 transition-transform active:scale-95"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <h2 className="text-2xl md:text-3xl font-black text-amber-400 italic flex items-center gap-2 tracking-wide">
          <Trophy className="w-7 h-7 text-amber-400" />
          SONORA GARAGE & CUSTOMIZER
        </h2>
        <div className="bg-slate-900/90 border border-amber-500/40 rounded-2xl px-4 py-2 flex items-center gap-2 shadow-lg">
          <span className="text-xl">🌮</span>
          <span className="text-xl font-black text-amber-400">{save.coins}</span>
        </div>
      </div>

      {/* Main Center Content: 3D Canvas + Customizer Panel */}
      <div className="w-full max-w-6xl mx-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center my-2 overflow-hidden z-10">
        {/* Left: 3D Showroom Viewport */}
        <div className="lg:col-span-7 h-64 md:h-80 lg:h-full bg-slate-900/70 border border-slate-800 rounded-3xl relative overflow-hidden shadow-2xl flex flex-col justify-between p-4">
          <div ref={mountRef} className="absolute inset-0 w-full h-full" />

          <div className="relative z-10 flex items-center justify-between pointer-events-none">
            <span className="bg-slate-950/80 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-bold text-amber-400 flex items-center gap-1.5 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5" /> 3D Live Showroom
            </span>
          </div>

          {/* Stats Bar Panel Overlay */}
          <div className="relative z-10 bg-slate-950/80 border border-slate-800/80 backdrop-blur-md rounded-2xl p-3.5 space-y-2 max-w-md pointer-events-none">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-400 flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-amber-400" /> Top Speed</span>
              <span className="text-amber-400">{totalTopSpeed} / 100</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-amber-400 h-full transition-all duration-300" style={{ width: `${totalTopSpeed}%` }} />
            </div>

            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-400 flex items-center gap-1"><Compass className="w-3.5 h-3.5 text-sky-400" /> Acceleration</span>
              <span className="text-sky-400">{totalAccel} / 100</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-sky-400 h-full transition-all duration-300" style={{ width: `${totalAccel}%` }} />
            </div>

            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-400 flex items-center gap-1"><Anchor className="w-3.5 h-3.5 text-emerald-400" /> Drift Grip</span>
              <span className="text-emerald-400">{totalDriftGrip} / 100</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-400 h-full transition-all duration-300" style={{ width: `${totalDriftGrip}%` }} />
            </div>
          </div>
        </div>

        {/* Right: Customization Selector Panel */}
        <div className="lg:col-span-5 h-full bg-slate-900/80 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between overflow-hidden shadow-2xl">
          {/* Category Tabs */}
          <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-950/80 rounded-2xl border border-slate-800 text-xs font-bold">
            {(['kart', 'wheel', 'glider', 'paint'] as CategoryTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 rounded-xl capitalize transition-all ${
                  activeTab === tab ? 'bg-amber-500 text-slate-950 shadow-md font-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab}s
              </button>
            ))}
          </div>

          {/* Items Selector Grid */}
          <div className="flex-1 my-3 overflow-y-auto space-y-2.5 pr-1">
            {activeTab === 'kart' &&
              Object.entries(KARTS).map(([id, kart]) => {
                const isSelected = save.selectedKart === id;
                return (
                  <div
                    key={id}
                    onClick={() => {
                      audio.init();
                      audio.playCoin();
                      selectKart(id as KartId);
                    }}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500 text-white shadow-lg'
                        : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{kart.icon}</span>
                      <div>
                        <h4 className="font-bold text-sm">{kart.name}</h4>
                        <p className="text-xs text-slate-400">{kart.description}</p>
                      </div>
                    </div>
                    {isSelected && (
                      <span className="bg-amber-500 text-slate-950 px-2.5 py-1 rounded-full text-xs font-black flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Equipped
                      </span>
                    )}
                  </div>
                );
              })}

            {activeTab === 'wheel' &&
              Object.entries(WHEELS).map(([id, wheel]) => {
                const isUnlocked = save.unlockedWheels?.includes(id as WheelId);
                const isSelected = save.selectedWheel === id;
                return (
                  <div
                    key={id}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500 text-white shadow-lg'
                        : 'bg-slate-950/40 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{wheel.icon}</span>
                      <div>
                        <h4 className="font-bold text-sm">{wheel.name}</h4>
                        <p className="text-xs text-slate-400">{wheel.description}</p>
                      </div>
                    </div>

                    {isUnlocked ? (
                      isSelected ? (
                        <span className="bg-amber-500 text-slate-950 px-2.5 py-1 rounded-full text-xs font-black flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Equipped
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            audio.init();
                            audio.playCoin();
                            selectWheel(id as WheelId);
                          }}
                          className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-700"
                        >
                          Equip
                        </button>
                      )
                    ) : (
                      <button
                        onClick={() => handleBuy('wheel', id, wheel.price)}
                        className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 border border-amber-400 shadow-md"
                      >
                        <Lock className="w-3.5 h-3.5" /> Unlock 🌮 {wheel.price}
                      </button>
                    )}
                  </div>
                );
              })}

            {activeTab === 'glider' &&
              Object.entries(GLIDERS).map(([id, glider]) => {
                const isUnlocked = save.unlockedGliders?.includes(id as GliderId);
                const isSelected = save.selectedGlider === id;
                return (
                  <div
                    key={id}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500 text-white shadow-lg'
                        : 'bg-slate-950/40 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{glider.icon}</span>
                      <div>
                        <h4 className="font-bold text-sm">{glider.name}</h4>
                        <p className="text-xs text-slate-400">{glider.description}</p>
                      </div>
                    </div>

                    {isUnlocked ? (
                      isSelected ? (
                        <span className="bg-amber-500 text-slate-950 px-2.5 py-1 rounded-full text-xs font-black flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Equipped
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            audio.init();
                            audio.playCoin();
                            selectGlider(id as GliderId);
                          }}
                          className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-700"
                        >
                          Equip
                        </button>
                      )
                    ) : (
                      <button
                        onClick={() => handleBuy('glider', id, glider.price)}
                        className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 border border-amber-400 shadow-md"
                      >
                        <Lock className="w-3.5 h-3.5" /> Unlock 🌮 {glider.price}
                      </button>
                    )}
                  </div>
                );
              })}

            {activeTab === 'paint' &&
              Object.entries(PAINTS).map(([id, paint]) => {
                const isUnlocked = save.unlockedPaints?.includes(id as PaintId);
                const isSelected = save.selectedPaint === id;
                return (
                  <div
                    key={id}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500 text-white shadow-lg'
                        : 'bg-slate-950/40 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{paint.icon}</span>
                      <div>
                        <h4 className="font-bold text-sm">{paint.name}</h4>
                        <p className="text-xs text-slate-400">{paint.description}</p>
                      </div>
                    </div>

                    {isUnlocked ? (
                      isSelected ? (
                        <span className="bg-amber-500 text-slate-950 px-2.5 py-1 rounded-full text-xs font-black flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Equipped
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            audio.init();
                            audio.playCoin();
                            selectPaint(id as PaintId);
                          }}
                          className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-700"
                        >
                          Equip
                        </button>
                      )
                    ) : (
                      <button
                        onClick={() => handleBuy('paint', id, paint.price)}
                        className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 border border-amber-400 shadow-md"
                      >
                        <Lock className="w-3.5 h-3.5" /> Unlock 🌮 {paint.price}
                      </button>
                    )}
                  </div>
                );
              })}
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Collect coins in races to unlock all Sonora gear!</span>
            <button
              onClick={() => {
                audio.init();
                audio.playCoin();
                addCoins(25);
              }}
              className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-400 px-3 py-1.5 rounded-xl text-xs font-bold transition-transform active:scale-95"
            >
              + 25 Coins 🌮
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
