import * as THREE from 'three';
import { KartController, KartInputs } from './kartController';
import { AIController } from './aiController';
import { CameraController } from './cameraController';
import { ParticleSystem } from './particleSystem';
import { ALL_TRACKS, TrackData, SONORA_TRACK } from './trackData';
import { CHARACTERS } from '../content/characters';
import {
  createKartModel,
  createSaguaroCactus,
  createTacoCoinModel,
  createItemBoxModel,
  createBoostPadModel,
  createStartFinishArch,
  createWoodenBridge,
  createSonoranHouse,
  createCactusBallModel,
  createHeartShieldModel,
  createCrystalModel,
  createPalmTreeModel,
  createBananaModel,
  createPapelPicadoModel,
  createWaterfallModel,
  createRainbowModel,
} from './proceduralModels';
import { buildProceduralTrackRibbon } from './trackMeshGenerator';
import { SplinePath } from './splinePath';
import { CharacterId, KartId, Projectile, ItemType } from '../types';
import { audio } from './audioEngine';
import { useGameStore } from '../store/gameStore';

export class GameEngine {
  private container: HTMLDivElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private cameraController: CameraController;
  private particleSystem: ParticleSystem;

  private activeTrack: TrackData;

  private playerKart: KartController;
  private aiKarts: { kart: KartController; ai: AIController }[] = [];
  private allKarts: KartController[] = [];

  private itemBoxMeshes: { id: string; group: THREE.Group }[] = [];
  private tacoCoinMeshes: { id: string; group: THREE.Group }[] = [];
  private shieldMeshes: Map<string, THREE.Group> = new Map();

  private projectiles: { id: string; type: ItemType; mesh: THREE.Group; vel: THREE.Vector3; ownerId: string; life: number }[] = [];

  // Ghost Recording & Playback
  private ghostRecording: { t: number; x: number; y: number; z: number; rotY: number }[] = [];
  private ghostPlayback: { t: number; x: number; y: number; z: number; rotY: number }[] = [];
  private ghostMesh: THREE.Group | null = null;
  private ghostRecordTimer = 0;
  private raceTimeSeconds = 0;

  private isRunning = false;
  private animFrameId: number | null = null;
  private clock = new THREE.Clock();
  private hudSyncTimer = 0;
  private sunLight: THREE.DirectionalLight | null = null;

  // Keyboard input state
  private keys: Record<string, boolean> = {};

  constructor(container: HTMLDivElement, selectedChar: CharacterId, selectedKart: KartId, trackId?: string) {
    this.container = container;

    const requestedTrackId = trackId || useGameStore.getState().selectedTrack;
    this.activeTrack = ALL_TRACKS.find((t) => t.id === requestedTrackId) || SONORA_TRACK;

    // 1. Setup Three.js Scene
    this.scene = new THREE.Scene();

    const theme = this.activeTrack.theme;
    const isNight = theme === 'night';
    const isCave = theme === 'cave';
    
    const bgColor = isCave ? 0x0284C7 : isNight ? 0x0F172A : 0xFDBA74; // Cyan cave vs Night indigo vs Sunset orange
    this.scene.background = new THREE.Color(bgColor);
    this.scene.fog = new THREE.FogExp2(bgColor, isCave ? 0.004 : isNight ? 0.002 : 0.003);

    // Try loading 2D background environment panorama image from /public/tracks/ or reference images
    this.setupSkyDomeBackground(this.activeTrack.id);

    // 2. Camera & Renderer
    this.camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
    this.cameraController = new CameraController(this.camera);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;

    container.appendChild(this.renderer.domElement);

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(isNight ? 0x38BDF8 : 0xFFEDD5, isNight ? 0.6 : 0.85);
    this.scene.add(ambientLight);

    this.sunLight = new THREE.DirectionalLight(isNight ? 0x818CF8 : 0xFFF7ED, isNight ? 0.8 : 1.4);
    this.sunLight.position.set(60, 100, 40);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 1024;
    this.sunLight.shadow.mapSize.height = 1024;
    this.sunLight.shadow.camera.near = 5;
    this.sunLight.shadow.camera.far = 200;
    this.sunLight.shadow.camera.left = -60;
    this.sunLight.shadow.camera.right = 60;
    this.sunLight.shadow.camera.top = 60;
    this.sunLight.shadow.camera.bottom = -60;
    this.scene.add(this.sunLight);

    // 4. Particle System
    this.particleSystem = new ParticleSystem(this.scene);

    // 5. Build Environment & Track Surface
    this.buildTrackEnvironment();

    // 6. Spawn Player Kart
    const saveState = useGameStore.getState().save;
    const grid = this.activeTrack.startingGrid;
    this.playerKart = new KartController('player', selectedChar, selectedKart, false, grid[0], this.activeTrack);
    const playerMesh = createKartModel(
      selectedKart,
      selectedChar,
      saveState.selectedWheel,
      saveState.selectedGlider,
      saveState.selectedPaint
    );
    this.playerKart.setMesh(playerMesh);
    this.scene.add(playerMesh);
    this.allKarts.push(this.playerKart);

    // 6b. Spawn Ghost Kart if saved ghost exists
    try {
      const savedGhost = localStorage.getItem(`essma_kart_ghost_${this.activeTrack.id}`);
      if (savedGhost) {
        this.ghostPlayback = JSON.parse(savedGhost);
        if (this.ghostPlayback.length > 0) {
          this.ghostMesh = createKartModel(selectedKart, selectedChar);
          this.ghostMesh.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              mesh.material = new THREE.MeshStandardMaterial({
                color: 0x38BDF8,
                emissive: 0x0284C7,
                emissiveIntensity: 0.8,
                transparent: true,
                opacity: 0.45,
              });
            }
          });
          this.scene.add(this.ghostMesh);
        }
      }
    } catch (e) {
      console.warn('Could not load ghost replay:', e);
    }

    // 7. Spawn AI Racers
    const otherChars: CharacterId[] = (Object.keys(CHARACTERS) as CharacterId[]).filter((c) => c !== selectedChar);
    otherChars.forEach((charId, idx) => {
      const kartId = CHARACTERS[charId].defaultKart;
      const aiKart = new KartController(`ai_${idx}`, charId, kartId, true, grid[idx + 1], this.activeTrack);
      const aiMesh = createKartModel(kartId, charId);
      aiKart.setMesh(aiMesh);
      this.scene.add(aiMesh);

      const aiCtrl = new AIController(aiKart, this.activeTrack);
      this.aiKarts.push({ kart: aiKart, ai: aiCtrl });
      this.allKarts.push(aiKart);
    });

    // Snap Camera instantly behind player kart
    this.cameraController.update(this.playerKart.state.position, this.playerKart.state.rotationY, 0, false, 1.0);
    this.cameraController.update(this.playerKart.state.position, this.playerKart.state.rotationY, 0, false, 1.0);

    // Event listeners
    this.setupInputs();
  }

  private setupSkyDomeBackground(trackId: string) {
    const loader = new THREE.TextureLoader();
    const possiblePaths = [
      `/tracks/${trackId}_bg.jpg`,
      `/tracks/${trackId}_bg.png`,
      `/tracks/${trackId}.jpg`,
      `/tracks/${trackId}.png`,
      `/assets/destinations/essma-kart/v1/cars-and-environments.jpg`,
      `/assets/destinations/essma-kart/v1/cover.jpg`
    ];

    let loaded = false;
    for (const path of possiblePaths) {
      if (loaded) break;
      loader.load(
        path,
        (texture) => {
          if (loaded) return;
          loaded = true;
          texture.mapping = THREE.EquirectangularReflectionMapping;
          texture.colorSpace = THREE.SRGBColorSpace;

          // Build a large 360 sky sphere dome
          const skyGeo = new THREE.SphereGeometry(600, 32, 24);
          const skyMat = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.BackSide,
            depthWrite: false,
          });
          const skyDome = new THREE.Mesh(skyGeo, skyMat);
          skyDome.name = 'skyDome2DEnvironment';
          this.scene.add(skyDome);
          console.log(`Loaded 2D background atmosphere panorama from: ${path}`);
        },
        undefined,
        () => {
          // Ignore 404, fallback to gradient sky
        }
      );
    }
  }

  private buildTrackEnvironment() {
    const isNight = this.activeTrack.theme === 'night';
    // Ground Plane
    const groundGeo = new THREE.PlaneGeometry(1000, 1000);
    const groundMat = new THREE.MeshStandardMaterial({
      color: isNight ? 0x312E81 : 0xD97706, // Indigo grass vs Orange sand
      roughness: 0.9,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    ground.matrixAutoUpdate = false;
    ground.updateMatrix();
    this.scene.add(ground);

    // Build Paved Track Ribbon + Red & White Curbs + Sand Shoulders
    const { trackMesh, curbMesh, shoulderMesh, decorationsGroup } = buildProceduralTrackRibbon(
      this.activeTrack.spline,
      this.activeTrack.theme
    );

    trackMesh.matrixAutoUpdate = false;
    trackMesh.updateMatrix();
    curbMesh.matrixAutoUpdate = false;
    curbMesh.updateMatrix();
    shoulderMesh.matrixAutoUpdate = false;
    shoulderMesh.updateMatrix();

    decorationsGroup.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.matrixAutoUpdate = false;
        child.updateMatrix();
      }
    });

    this.scene.add(trackMesh);
    this.scene.add(curbMesh);
    this.scene.add(shoulderMesh);
    this.scene.add(decorationsGroup);

    const splinePath = new SplinePath(this.activeTrack.spline);

    // Spawn Boost Pads
    this.activeTrack.boostPads.forEach((bp) => {
      const pad = createBoostPadModel();
      const rInfo = splinePath.getClosestInfo(bp.position);
      const py = rInfo.distanceToCenter <= 16.0 ? rInfo.roadY + 0.16 : bp.position.y;
      pad.position.set(bp.position.x, py, bp.position.z);
      pad.rotation.y = bp.rotationY;
      this.scene.add(pad);
    });

    // Spawn Item Boxes
    this.activeTrack.itemBoxes.forEach((ib) => {
      const box = createItemBoxModel();
      const rInfo = splinePath.getClosestInfo(ib.position);
      const py = rInfo.distanceToCenter <= 16.0 ? rInfo.roadY + 1.5 : ib.position.y;
      box.position.set(ib.position.x, py, ib.position.z);
      ib.position.y = py;
      this.scene.add(box);
      this.itemBoxMeshes.push({ id: ib.id, group: box });
    });

    // Spawn Taco Coins
    this.activeTrack.tacoCoins.forEach((tc) => {
      const coin = createTacoCoinModel();
      const rInfo = splinePath.getClosestInfo(tc.position);
      const py = rInfo.distanceToCenter <= 16.0 ? rInfo.roadY + 0.8 : tc.position.y;
      coin.position.set(tc.position.x, py, tc.position.z);
      tc.position.y = py;
      this.scene.add(coin);
      this.tacoCoinMeshes.push({ id: tc.id, group: coin });
    });

    // Spawn Track Decorations
    this.activeTrack.decorations.forEach((dec) => {
      let model: THREE.Group | null = null;
      if (dec.type === 'saguaro') model = createSaguaroCactus();
      if (dec.type === 'arch') model = createStartFinishArch();
      if (dec.type === 'bridge') model = createWoodenBridge();
      if (dec.type === 'house') model = createSonoranHouse();
      if (dec.type === 'crystal') model = createCrystalModel();
      if (dec.type === 'palm_tree') model = createPalmTreeModel();
      if (dec.type === 'papel_picado') model = createPapelPicadoModel();
      if (dec.type === 'waterfall') model = createWaterfallModel();
      if (dec.type === 'rainbow') model = createRainbowModel();

      if (model) {
        const rInfo = splinePath.getClosestInfo(dec.position);
        const py = rInfo.distanceToCenter <= 16.0 ? rInfo.roadY : dec.position.y;
        model.position.set(dec.position.x, py, dec.position.z);
        if (dec.scale) model.scale.setScalar(dec.scale);
        if (dec.rotationY) model.rotation.y = dec.rotationY;
        this.scene.add(model);
      }
    });
  }

  private setupInputs() {
    window.addEventListener('keydown', (e) => { this.keys[e.key.toLowerCase()] = true; });
    window.addEventListener('keyup', (e) => { this.keys[e.key.toLowerCase()] = false; });
  }

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.clock.start();

    let countdownTime = 3;
    audio.playCountdown(false);

    const countdownInterval = setInterval(() => {
      countdownTime -= 1;
      if (countdownTime > 0) {
        audio.playCountdown(false);
        useGameStore.getState().updateRaceState({ countdownValue: countdownTime });
      } else {
        audio.playCountdown(true);
        useGameStore.getState().updateRaceState({ countdownValue: 'GO!' });
        audio.startMusic();
        clearInterval(countdownInterval);
        setTimeout(() => {
          useGameStore.getState().updateRaceState({ countdownValue: '' });
        }, 1200);
      }
    }, 1000);

    const loop = () => {
      if (!this.isRunning) return;
      this.animFrameId = requestAnimationFrame(loop);

      const delta = Math.min(this.clock.getDelta(), 0.1);
      this.update(delta);
      this.renderer.render(this.scene, this.camera);
    };

    loop();
  }

  private update(delta: number) {
    if (useGameStore.getState().isPaused) return;

    // 1. Gather Player Keyboard, Touch & Gamepad Inputs
    const gamepads = typeof navigator !== 'undefined' && navigator.getGamepads ? navigator.getGamepads() : [];
    const gp = gamepads[0];

    let gpSteer = 0;
    let gpAccelerate = false;
    let gpReverse = false;
    let gpDrift = false;
    let gpItem = false;

    if (gp) {
      if (Math.abs(gp.axes[0]) > 0.15) gpSteer = -gp.axes[0]; // Left/Right stick
      gpAccelerate = (gp.buttons[0]?.pressed || gp.buttons[7]?.value > 0.1); // A / RT
      gpReverse = (gp.buttons[1]?.pressed || gp.buttons[6]?.value > 0.1); // B / LT
      gpDrift = gp.buttons[5]?.pressed || gp.buttons[2]?.pressed; // RB / X
      gpItem = gp.buttons[4]?.pressed || gp.buttons[3]?.pressed; // LB / Y
    }

    const kbSteer = (this.keys['a'] || this.keys['arrowleft'] ? 1 : 0) - (this.keys['d'] || this.keys['arrowright'] ? 1 : 0);

    const playerInputs: KartInputs = {
      accelerate: this.keys['w'] || this.keys['arrowup'] || gpAccelerate || useGameStore.getState().save.settings.autoAccelerate,
      reverse: this.keys['s'] || this.keys['arrowdown'] || gpReverse,
      steer: Math.abs(gpSteer) > 0.1 ? gpSteer : kbSteer,
      drift: this.keys['shift'] || this.keys[' '] || gpDrift,
      useItem: this.keys['e'] || this.keys['control'] || gpItem,
      respawn: this.keys['r'],
    };

    // 2. Update Player Kart
    const pResult = this.playerKart.update(delta, playerInputs);

    if (pResult.triggeredItem) {
      this.handleItemUse(this.playerKart, pResult.triggeredItem);
    }
    if (pResult.collectedCoin) audio.playCoin();
    if (pResult.collectedItemBox) audio.playItemBox();
    if (pResult.completedLap) audio.playLapChime();
    if (pResult.hitBoostPad) {
      audio.playBoost();
      this.particleSystem.emitBoostFlames(this.playerKart.state.position);
    }

    // Audio engine pitch
    const speedNorm = Math.abs(this.playerKart.state.speed) / 40;
    audio.updateEngine(speedNorm, this.playerKart.state.isDrifting, this.playerKart.state.boostTimer > 0);

    // Particle emissions
    if (this.playerKart.state.isDrifting) {
      this.particleSystem.emitDriftSparks(this.playerKart.state.position, this.playerKart.state.miniTurboLevel);
      if (Math.random() < 0.2) audio.playDriftSpark();
    }
    if (this.playerKart.state.boostTimer > 0) {
      this.particleSystem.emitBoostFlames(this.playerKart.state.position);
    }

    // 3. Update AI Racers
    const playerProg = this.playerKart.state.splineProgress;
    this.aiKarts.forEach(({ kart, ai }) => {
      const aiInputs = ai.getInputs(playerProg);
      const aiRes = kart.update(delta, aiInputs);
      if (aiRes.triggeredItem) {
        this.handleItemUse(kart, aiRes.triggeredItem);
      }
    });

    // 4. Update Race Placements / Ranks
    this.allKarts.sort((a, b) => b.state.splineProgress - a.state.splineProgress);
    this.allKarts.forEach((k, rankIdx) => {
      k.state.raceRank = rankIdx + 1;
    });

    // 5. Update Spinning & Floating Item Boxes & Taco Coins Animations
    const time = this.clock.getElapsedTime();
    this.itemBoxMeshes.forEach(({ id, group }) => {
      const ibData = this.activeTrack.itemBoxes.find((i) => i.id === id);
      if (ibData) {
        if (!ibData.active) {
          ibData.respawnTimer -= delta;
          if (ibData.respawnTimer <= 0) ibData.active = true;
          group.visible = false;
        } else {
          group.visible = true;
          group.rotation.y += delta * 2.5;
          group.position.y = ibData.position.y + Math.sin(time * 3.5 + ibData.position.x) * 0.25;
        }
      }
    });

    this.tacoCoinMeshes.forEach(({ id, group }) => {
      const tcData = this.activeTrack.tacoCoins.find((t) => t.id === id);
      if (tcData) {
        if (tcData.collected) {
          tcData.respawnTimer -= delta;
          if (tcData.respawnTimer <= 0) tcData.collected = false;
          group.visible = false;
        } else {
          group.visible = true;
          group.rotation.y += delta * 3.5;
          group.position.y = tcData.position.y + Math.sin(time * 4.5 + tcData.position.x) * 0.18;
        }
      }
    });

    // 6. Update Projectiles & Banana Hazards
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      proj.life += delta;

      if (proj.type === 'banana') {
        proj.mesh.rotation.y += delta * 2;
      } else {
        proj.mesh.position.addScaledVector(proj.vel, delta);
        proj.mesh.rotation.x += delta * 10;
      }

      // Check hits with karts
      this.allKarts.forEach((k) => {
        // Owner immune to banana for first 1.2 seconds
        const isOwnerImmune = proj.type === 'banana' && k.state.id === proj.ownerId && proj.life < 1.2;
        if (!isOwnerImmune) {
          const dx = proj.mesh.position.x - k.state.position.x;
          const dz = proj.mesh.position.z - k.state.position.z;
          if (Math.hypot(dx, dz) < 2.5) {
            const hitSuccess = k.spinout();
            if (hitSuccess) {
              audio.playSpinout();
              if (k.state.id === 'player') this.cameraController.triggerImpactShake();
            }
            this.scene.remove(proj.mesh);
            this.projectiles.splice(i, 1);
          }
        }
      });

      const maxLife = proj.type === 'banana' ? 20.0 : 6.0;
      if (proj.life > maxLife) {
        this.scene.remove(proj.mesh);
        this.projectiles.splice(i, 1);
      }
    }

    // 7. Update Heart Shield Visuals & Drift/Boost Particles
    this.allKarts.forEach((k) => {
      // Emit drift sparks and skid marks
      if (k.state.isDrifting) {
        this.particleSystem.emitDriftSparks(k.state.position, k.state.miniTurboLevel);
        if (Math.random() < 0.4) {
          this.particleSystem.emitSkidMark(k.state.position, k.state.rotationY);
        }
      }
      // Emit boost flames
      if (k.state.boostTimer > 0) {
        this.particleSystem.emitBoostFlames(k.state.position);
      }

      let shieldMesh = this.shieldMeshes.get(k.state.id);
      if (k.state.hasShield) {
        if (!shieldMesh) {
          shieldMesh = createHeartShieldModel();
          this.scene.add(shieldMesh);
          this.shieldMeshes.set(k.state.id, shieldMesh);
        }
        shieldMesh.position.set(k.state.position.x, k.state.position.y + 0.5, k.state.position.z);
        shieldMesh.rotation.y += delta * 3;
      } else if (shieldMesh) {
        this.scene.remove(shieldMesh);
        this.shieldMeshes.delete(k.state.id);
      }
    });

    // 8. Ghost Recording & Playback
    this.raceTimeSeconds += delta;
    this.ghostRecordTimer += delta;

    if (this.ghostRecordTimer >= 0.08) {
      this.ghostRecordTimer = 0;
      this.ghostRecording.push({
        t: this.raceTimeSeconds,
        x: this.playerKart.state.position.x,
        y: this.playerKart.state.position.y,
        z: this.playerKart.state.position.z,
        rotY: this.playerKart.state.rotationY,
      });
    }

    if (this.ghostMesh && this.ghostPlayback.length > 0) {
      const frame = this.ghostPlayback.find((f) => f.t >= this.raceTimeSeconds) || this.ghostPlayback[this.ghostPlayback.length - 1];
      if (frame) {
        this.ghostMesh.position.set(frame.x, frame.y, frame.z);
        this.ghostMesh.rotation.y = frame.rotY;
      }
    }

    // 9. Update Particles & Camera
    this.particleSystem.update(delta);
    this.cameraController.update(
      this.playerKart.state.position,
      this.playerKart.state.rotationY,
      this.playerKart.state.speed,
      this.playerKart.state.boostTimer > 0,
      delta,
      this.playerKart.state.isDrifting ? this.playerKart.state.driftDirection : 0
    );

    // 10. Sync Live Store State for HUD (Throttled to 20 FPS for peak smoothness)
    this.hudSyncTimer += delta;
    if (this.hudSyncTimer >= 0.05) {
      this.hudSyncTimer = 0;
      useGameStore.getState().updateRaceState({
        currentLap: Math.min(3, this.playerKart.state.lap),
        playerRank: this.playerKart.state.raceRank,
        playerSpeed: Math.round(Math.abs(this.playerKart.state.speed) * 2.2),
        playerItem: this.playerKart.state.currentItem,
        playerCoins: this.playerKart.state.coinsCollected,
        raceTime: this.raceTimeSeconds,
        wrongWay: this.playerKart.state.wrongWay,
        playerPosition: { ...this.playerKart.state.position },
        playerRotationY: this.playerKart.state.rotationY,
        aiPositions: this.aiKarts.map((a) => ({ ...a.kart.state.position })),
      });
    }

    // Finish Race check
    if (this.playerKart.state.lap > 3) {
      const totalTime = this.raceTimeSeconds;
      const trackId = this.activeTrack.id;
      const currentBest = useGameStore.getState().save.bestLapTimes[trackId] || 999;

      if (totalTime < currentBest) {
        useGameStore.getState().saveBestTime(trackId, parseFloat(totalTime.toFixed(2)));
        try {
          localStorage.setItem(`essma_kart_ghost_${trackId}`, JSON.stringify(this.ghostRecording));
        } catch (e) {
          console.warn('Could not save ghost replay:', e);
        }
      }

      useGameStore.getState().setStatus('results');
      useGameStore.getState().addCoins(this.playerKart.state.coinsCollected + (5 - this.playerKart.state.raceRank) * 10);
      this.stop();
    }
  }

  private handleItemUse(kart: KartController, item: ItemType) {
    if (item === 'heart_shield') {
      audio.playShield();
    } else if (item === 'lightning_boost') {
      audio.playBoost();
      this.particleSystem.emitBoostFlames(kart.state.position);
    } else if (item === 'banana') {
      const mesh = createBananaModel();
      const dirX = -Math.sin(kart.state.rotationY);
      const dirZ = -Math.cos(kart.state.rotationY);
      // Place slightly behind kart
      mesh.position.set(
        kart.state.position.x - dirX * 2.5,
        kart.state.position.y + 0.1,
        kart.state.position.z - dirZ * 2.5
      );
      this.scene.add(mesh);
      this.projectiles.push({
        id: `banana_${Math.random()}`,
        type: 'banana',
        mesh,
        vel: new THREE.Vector3(0, 0, 0),
        ownerId: kart.state.id,
        life: 0,
      });
    } else if (item === 'cactus_ball' || item === 'shell') {
      const mesh = createCactusBallModel();
      mesh.position.set(kart.state.position.x, kart.state.position.y + 0.5, kart.state.position.z);

      const dirX = -Math.sin(kart.state.rotationY);
      const dirZ = -Math.cos(kart.state.rotationY);
      const speed = item === 'shell' ? 45 : 35;
      const vel = new THREE.Vector3(dirX * speed, 0, dirZ * speed);

      this.scene.add(mesh);
      this.projectiles.push({
        id: `proj_${Math.random()}`,
        type: item,
        mesh,
        vel,
        ownerId: kart.state.id,
        life: 0,
      });
      if (item === 'shell') audio.playBoost();
    } else if (item === 'coin') {
      kart.state.coinsCollected += 2;
      audio.playCoin();
      kart.state.boostTimer = 1.2;
    }
  }

  public resize(width: number, height: number) {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  public stop() {
    this.isRunning = false;
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    audio.stopEngine();
    audio.stopMusic();
  }

  public dispose() {
    this.stop();
    this.particleSystem.dispose();
    this.renderer.dispose();
  }
}
