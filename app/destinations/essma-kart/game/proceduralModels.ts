import * as THREE from 'three';
import { CharacterId, KartId } from '../types';
import { WheelId, GliderId, PaintId, WHEELS, GLIDERS, PAINTS } from '../content/customizations';

// Helper to create simple Canvas Textures for stylized materials
export function createCheckeredTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, 128, 128);
  ctx.fillStyle = '#1E293B';
  ctx.fillRect(0, 0, 64, 64);
  ctx.fillRect(64, 64, 64, 64);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 1);
  return texture;
}

export function createTacoTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  // Golden Taco Shell
  ctx.fillStyle = '#F59E0B';
  ctx.beginPath();
  ctx.arc(64, 64, 50, 0, Math.PI);
  ctx.fill();

  // Green Lettuce & Red Tomato Fill
  ctx.fillStyle = '#22C55E';
  ctx.fillRect(20, 50, 88, 10);
  ctx.fillStyle = '#EF4444';
  ctx.fillRect(30, 45, 15, 8);
  ctx.fillRect(75, 45, 15, 8);

  return new THREE.CanvasTexture(canvas);
}

// --------------------------------------------------
// Kart & Character Model Generators
// --------------------------------------------------
export function createKartModel(
  kartId: KartId,
  characterId: CharacterId,
  wheelId: WheelId = 'standard',
  gliderId: GliderId = 'standard_wing',
  paintId: PaintId = 'original'
): THREE.Group {
  const group = new THREE.Group();

  // Custom paint override
  const customPaint = PAINTS[paintId];
  let bodyColor = 0x8B5CF6;
  if (customPaint && customPaint.colorHex) {
    bodyColor = customPaint.colorHex;
  } else if (kartId === 'heart') {
    bodyColor = 0xF43F5E; // Deep Pink
  } else if (kartId === 'lightning') {
    bodyColor = 0x2563EB; // Cobalt Blue
  } else if (kartId === 'acorn') {
    bodyColor = 0x15803D; // Forest Green
  } else if (kartId === 'butterfly') {
    bodyColor = 0x7E22CE; // Deep Purple
  }

  const bodyMat = new THREE.MeshStandardMaterial({
    color: bodyColor,
    roughness: 0.25,
    metalness: kartId === 'lightning' ? 0.4 : 0.15,
  });

  if (kartId === 'heart') {
    // ----------------------------------------------------
    // ESSMA'S KART CORAZÓN
    // ----------------------------------------------------
    // Main Chassis
    const chassisGeo = new THREE.BoxGeometry(1.5, 0.55, 2.3);
    const chassis = new THREE.Mesh(chassisGeo, bodyMat);
    chassis.position.y = 0.45;
    chassis.castShadow = true;
    group.add(chassis);

    // Front Big Quilted Heart Hood
    const heartShape = new THREE.Shape();
    heartShape.moveTo(0, 0.3);
    heartShape.bezierCurveTo(0, 0.3, -0.4, 0.8, -0.8, 0.4);
    heartShape.bezierCurveTo(-1.1, 0, -0.6, -0.5, 0, -1.0);
    heartShape.bezierCurveTo(0.6, -0.5, 1.1, 0, 0.8, 0.4);
    heartShape.bezierCurveTo(0.4, 0.8, 0, 0.3, 0, 0.3);

    const extrudeSettings = { depth: 0.3, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.08, bevelThickness: 0.08 };
    const heartGeo = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);
    const heartMat = new THREE.MeshStandardMaterial({ color: 0xFB7185, roughness: 0.2, metalness: 0.1 });
    const heartHood = new THREE.Mesh(heartGeo, heartMat);
    heartHood.rotation.x = -Math.PI / 2;
    heartHood.position.set(0, 0.7, -0.5);
    heartHood.scale.set(0.7, 0.7, 0.7);
    group.add(heartHood);

    // Paw Print Emblem on Hood
    const pawMat = new THREE.MeshStandardMaterial({ color: 0xFFEDD5, roughness: 0.3 });
    const pawPad = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 12), pawMat);
    pawPad.scale.set(1.2, 0.4, 1.0);
    pawPad.position.set(0, 0.82, -0.6);
    group.add(pawPad);

    for (let i = -1; i <= 1; i++) {
      const toe = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), pawMat);
      toe.position.set(i * 0.12, 0.83, -0.82);
      group.add(toe);
    }

    // Plush Quilted Interior Cushion
    const cushionMat = new THREE.MeshStandardMaterial({ color: 0xF472B6, roughness: 0.8 });
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.6, 0.8), cushionMat);
    seat.position.set(0, 0.75, 0.4);
    group.add(seat);

    // Rear Heart Bow
    const bowMat = new THREE.MeshStandardMaterial({ color: 0x2563EB, roughness: 0.3 });
    const bowCenter = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 12), bowMat);
    bowCenter.position.set(0, 1.25, 1.05);
    const bowL = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.6, 8), bowMat);
    bowL.rotation.z = Math.PI / 2;
    bowL.position.set(-0.35, 1.25, 1.05);
    const bowR = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.6, 8), bowMat);
    bowR.rotation.z = -Math.PI / 2;
    bowR.position.set(0.35, 1.25, 1.05);
    group.add(bowCenter, bowL, bowR);

  } else if (kartId === 'lightning') {
    // ----------------------------------------------------
    // JUANCITO'S KART RAYO
    // ----------------------------------------------------
    // Aerodynamic Blue Wedge
    const wedgeShape = new THREE.Shape();
    wedgeShape.moveTo(0, -1.3);
    wedgeShape.lineTo(-0.75, 1.1);
    wedgeShape.lineTo(0.75, 1.1);
    wedgeShape.closePath();

    const wedgeGeo = new THREE.ExtrudeGeometry(wedgeShape, { depth: 0.5, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.05 });
    const chassis = new THREE.Mesh(wedgeGeo, bodyMat);
    chassis.rotation.x = Math.PI / 2;
    chassis.position.set(0, 0.5, 0);
    chassis.castShadow = true;
    group.add(chassis);

    // Yellow 3D Lightning Bolts on Sides
    const boltMat = new THREE.MeshStandardMaterial({ color: 0xF59E0B, roughness: 0.1, metalness: 0.5, emissive: 0xD97706, emissiveIntensity: 0.3 });
    
    [-1, 1].forEach((side) => {
      const boltShape = new THREE.Shape();
      boltShape.moveTo(0, 0.4);
      boltShape.lineTo(0.3, 0);
      boltShape.lineTo(0.1, 0);
      boltShape.lineTo(0.4, -0.5);
      boltShape.lineTo(0.1, -0.2);
      boltShape.lineTo(0.25, -0.2);
      boltShape.lineTo(0, 0.4);

      const boltGeo = new THREE.ExtrudeGeometry(boltShape, { depth: 0.08, bevelEnabled: false });
      const boltMesh = new THREE.Mesh(boltGeo, boltMat);
      boltMesh.position.set(side * 0.78, 0.5, -0.2);
      boltMesh.scale.set(1.5, 1.5, 1.5);
      boltMesh.rotation.y = side === 1 ? Math.PI / 2 : -Math.PI / 2;
      group.add(boltMesh);
    });

    // Bucket Racing Seat
    const seatMat = new THREE.MeshStandardMaterial({ color: 0x1E293B, roughness: 0.6 });
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.7, 0.7), seatMat);
    seat.position.set(0, 0.7, 0.3);
    group.add(seat);

    // Dual Chrome Exhausts
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xE2E8F0, metalness: 0.9, roughness: 0.1 });
    [-0.3, 0.3].forEach((x) => {
      const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.6, 12), chromeMat);
      pipe.rotation.x = Math.PI / 3;
      pipe.position.set(x, 0.6, 1.15);
      group.add(pipe);
    });

  } else if (kartId === 'acorn') {
    // ----------------------------------------------------
    // TORI'S KART BEETLE / ACORN
    // ----------------------------------------------------
    // Rounded Beetle Dome Chassis
    const bodyGeo = new THREE.SphereGeometry(1.0, 16, 16);
    bodyGeo.scale(0.8, 0.6, 1.15);
    const chassis = new THREE.Mesh(bodyGeo, bodyMat);
    chassis.position.set(0, 0.6, 0);
    chassis.castShadow = true;
    group.add(chassis);

    // Cream Bumper & Fenders
    const fenderMat = new THREE.MeshStandardMaterial({ color: 0xFEF3C7, roughness: 0.4 });
    const fenderF = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.15, 16), fenderMat);
    fenderF.position.set(0, 0.35, -1.05);
    group.add(fenderF);

    // Antennae on Hood
    const antMat = new THREE.MeshStandardMaterial({ color: 0x15803D, metalness: 0.3 });
    [-0.2, 0.2].forEach((x) => {
      const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.6, 8), antMat);
      ant.rotation.x = -0.3;
      ant.position.set(x, 1.1, -0.6);

      const ball = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), fenderMat);
      ball.position.set(x, 1.38, -0.7);
      group.add(ant, ball);
    });

    // Paw emblem on hood
    const pawMat = new THREE.MeshStandardMaterial({ color: 0xF59E0B, roughness: 0.3 });
    const paw = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 12), pawMat);
    paw.scale.set(1.0, 0.3, 0.8);
    paw.position.set(0, 0.85, -0.85);
    group.add(paw);

  } else {
    // ----------------------------------------------------
    // ANITA'S KART MARIPOSA
    // ----------------------------------------------------
    // Violet Beetle Base
    const chassisGeo = new THREE.BoxGeometry(1.4, 0.5, 2.1);
    const chassis = new THREE.Mesh(chassisGeo, bodyMat);
    chassis.position.y = 0.45;
    chassis.castShadow = true;
    group.add(chassis);

    // Giant Butterfly Wing Side-Panels
    const wingMat = new THREE.MeshStandardMaterial({
      color: 0xC084FC,
      roughness: 0.3,
      emissive: 0xA855F7,
      emissiveIntensity: 0.2,
      side: THREE.DoubleSide,
    });

    [-1, 1].forEach((side) => {
      const wingGroup = new THREE.Group();
      
      const wingGeo1 = new THREE.CircleGeometry(0.8, 16, 0, Math.PI * 1.2);
      const wing1 = new THREE.Mesh(wingGeo1, wingMat);
      wing1.rotation.y = side * (Math.PI / 4);
      wing1.position.set(side * 0.7, 0.9, 0);

      const wingGeo2 = new THREE.CircleGeometry(0.55, 16, 0, Math.PI * 1.2);
      const wing2 = new THREE.Mesh(wingGeo2, wingMat);
      wing2.rotation.y = side * (Math.PI / 4);
      wing2.position.set(side * 0.7, 0.5, 0.6);

      // Yellow swirl accent on wings
      const swirlMat = new THREE.MeshStandardMaterial({ color: 0xFDE047 });
      const swirl = new THREE.Mesh(new THREE.RingGeometry(0.2, 0.3, 12), swirlMat);
      swirl.position.set(side * 0.72, 0.9, 0.05);
      swirl.rotation.y = side * (Math.PI / 4);

      wingGroup.add(wing1, wing2, swirl);
      group.add(wingGroup);
    });

    // Antennae on Bonnet
    [-0.2, 0.2].forEach((x) => {
      const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.5, 8), bodyMat);
      ant.position.set(x, 0.8, -0.8);
      ant.rotation.x = -0.4;
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), new THREE.MeshStandardMaterial({ color: 0xFDE047 }));
      bulb.position.set(x, 1.02, -0.9);
      group.add(ant, bulb);
    });
  }

  // ----------------------------------------------------
  // FOUR CUSTOM WHEELS
  // ----------------------------------------------------
  let wheelRadius = 0.36;
  let hubColor = 0xF59E0B;
  let tireColor = 0x1E293B;

  if (wheelId === 'offroad' || kartId === 'acorn') {
    wheelRadius = 0.42;
    tireColor = 0x0F172A;
    hubColor = 0xB45309; // Bronze
  } else if (wheelId === 'golden' || kartId === 'heart') {
    hubColor = 0xF59E0B;
  } else if (kartId === 'butterfly') {
    hubColor = 0xE879F9; // Flower Pink/Purple
  } else if (kartId === 'lightning') {
    hubColor = 0x84CC16; // Lime Gold
  }

  const wheelGeo = new THREE.CylinderGeometry(wheelRadius, wheelRadius, 0.3, 16);
  const wheelMat = new THREE.MeshStandardMaterial({ color: tireColor, roughness: 0.8 });
  const hubMat = new THREE.MeshStandardMaterial({ color: hubColor, roughness: 0.3, metalness: 0.6 });

  const wheelPositions = [
    { x: -0.88, z: -0.75 },
    { x: 0.88, z: -0.75 },
    { x: -0.88, z: 0.75 },
    { x: 0.88, z: 0.75 },
  ];

  wheelPositions.forEach((pos) => {
    const wheelGroup = new THREE.Group();
    const wheel = new THREE.Mesh(wheelGeo, wheelMat);
    wheel.rotation.z = Math.PI / 2;
    wheel.castShadow = true;
    wheelGroup.add(wheel);

    const hub = new THREE.Mesh(new THREE.CylinderGeometry(wheelRadius * 0.52, wheelRadius * 0.52, 0.32, 12), hubMat);
    hub.rotation.z = Math.PI / 2;
    wheelGroup.add(hub);

    wheelGroup.position.set(pos.x, wheelRadius, pos.z);
    group.add(wheelGroup);
  });

  // ----------------------------------------------------
  // DRIVER CHARACTER (ESSMA, JUANCITO, TORI, ANITA)
  // ----------------------------------------------------
  const driverGroup = new THREE.Group();
  driverGroup.position.set(0, 0.95, 0.2);

  if (characterId === 'essma') {
    // ESSMA: Fair skin tone, dark curly hair, signature blue hair bow
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xFFE3D8, roughness: 0.5 });
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 16), skinMat);
    driverGroup.add(head);

    // Dark Curly Hair
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x1A0D00, roughness: 0.9 });
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      const puff = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), hairMat);
      puff.position.set(Math.sin(angle) * 0.28, 0.1 + Math.cos(angle) * 0.15, -0.1 + Math.cos(angle) * 0.1);
      driverGroup.add(puff);
    }

    // Signature Blue Bow on top of head
    const bowMat = new THREE.MeshStandardMaterial({ color: 0x2563EB, roughness: 0.3 });
    const bowCenter = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), bowMat);
    bowCenter.position.set(0, 0.42, 0.1);
    const bowL = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.3, 8), bowMat);
    bowL.rotation.z = Math.PI / 2;
    bowL.position.set(-0.2, 0.42, 0.1);
    const bowR = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.3, 8), bowMat);
    bowR.rotation.z = -Math.PI / 2;
    bowR.position.set(0.2, 0.42, 0.1);
    driverGroup.add(bowCenter, bowL, bowR);

  } else if (characterId === 'juancito') {
    // JUANCITO: Ground squirrel with green bandana
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xD97706, roughness: 0.7 });
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.34, 16, 16), skinMat);
    driverGroup.add(head);

    // Cute Squirrel Ears
    const earMat = new THREE.MeshStandardMaterial({ color: 0x92400E, roughness: 0.7 });
    const earL = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.25, 8), earMat);
    earL.position.set(-0.25, 0.35, 0);
    const earR = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.25, 8), earMat);
    earR.position.set(0.25, 0.35, 0);
    driverGroup.add(earL, earR);

    // Green Bandana
    const bandanaMat = new THREE.MeshStandardMaterial({ color: 0x16A34A, roughness: 0.4 });
    const bandana = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.38, 0.15, 12), bandanaMat);
    bandana.position.set(0, -0.28, 0);
    driverGroup.add(bandana);

  } else if (characterId === 'tori') {
    // TORI: Ringtail cat with orange bandana
    const skinMat = new THREE.MeshStandardMaterial({ color: 0x78350F, roughness: 0.7 });
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.34, 16, 16), skinMat);
    driverGroup.add(head);

    const earMat = new THREE.MeshStandardMaterial({ color: 0x451A03, roughness: 0.6 });
    const earL = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.3, 8), earMat);
    earL.position.set(-0.26, 0.38, 0);
    const earR = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.3, 8), earMat);
    earR.position.set(0.26, 0.38, 0);
    driverGroup.add(earL, earR);

    const bandanaMat = new THREE.MeshStandardMaterial({ color: 0xEA580C, roughness: 0.4 });
    const bandana = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.38, 0.15, 12), bandanaMat);
    bandana.position.set(0, -0.28, 0);
    driverGroup.add(bandana);

  } else {
    // ANITA: Cute calf with horns & pink flower
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xFEF3C7, roughness: 0.6 });
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 16), skinMat);
    driverGroup.add(head);

    const hornMat = new THREE.MeshStandardMaterial({ color: 0xF59E0B, metalness: 0.5 });
    const hornL = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.22, 8), hornMat);
    hornL.position.set(-0.24, 0.38, 0);
    hornL.rotation.z = -0.3;
    const hornR = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.22, 8), hornMat);
    hornR.position.set(0.24, 0.38, 0);
    hornR.rotation.z = 0.3;
    driverGroup.add(hornL, hornR);

    const flowerMat = new THREE.MeshStandardMaterial({ color: 0xEC4899 });
    const flower = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), flowerMat);
    flower.position.set(-0.32, 0.28, 0.1);
    driverGroup.add(flower);

    const bandanaMat = new THREE.MeshStandardMaterial({ color: 0x8B5CF6, roughness: 0.4 });
    const bandana = new THREE.Mesh(new THREE.CylinderGeometry(0.37, 0.39, 0.15, 12), bandanaMat);
    bandana.position.set(0, -0.28, 0);
    driverGroup.add(bandana);
  }

  group.add(driverGroup);

  return group;
}

// --------------------------------------------------
// Track Objects (Saguaro, House, Bridge, Taco, Box, Arch)
// --------------------------------------------------

export function createSaguaroCactus(): THREE.Group {
  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: 0x15803D, roughness: 0.6 });

  // Main Trunk
  const trunkGeo = new THREE.CylinderGeometry(0.4, 0.45, 6, 12);
  const trunk = new THREE.Mesh(trunkGeo, mat);
  trunk.position.y = 3;
  trunk.castShadow = true;
  group.add(trunk);

  // Left Arm
  const armLeftHoriz = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 1.8, 10), mat);
  armLeftHoriz.rotation.z = Math.PI / 2;
  armLeftHoriz.position.set(-1.0, 3.5, 0);

  const armLeftVert = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 2.2, 10), mat);
  armLeftVert.position.set(-1.8, 4.4, 0);

  // Right Arm
  const armRightHoriz = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 1.8, 10), mat);
  armRightHoriz.rotation.z = -Math.PI / 2;
  armRightHoriz.position.set(1.0, 2.5, 0);

  const armRightVert = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 2.0, 10), mat);
  armRightVert.position.set(1.8, 3.3, 0);

  group.add(armLeftHoriz, armLeftVert, armRightHoriz, armRightVert);
  return group;
}

export function createTacoCoinModel(): THREE.Group {
  const group = new THREE.Group();
  const tacoGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.2, 16);
  const tacoMat = new THREE.MeshStandardMaterial({
    map: createTacoTexture(),
    metalness: 0.2,
    roughness: 0.4,
  });

  const mesh = new THREE.Mesh(tacoGeo, tacoMat);
  mesh.rotation.x = Math.PI / 2;
  mesh.castShadow = true;
  group.add(mesh);
  return group;
}

export function createItemBoxModel(): THREE.Group {
  const group = new THREE.Group();
  
  // Translucent Box
  const boxGeo = new THREE.BoxGeometry(1.6, 1.6, 1.6);
  const boxMat = new THREE.MeshStandardMaterial({
    color: 0xF59E0B,
    transparent: true,
    opacity: 0.85,
    roughness: 0.1,
    metalness: 0.5,
  });
  const box = new THREE.Mesh(boxGeo, boxMat);
  group.add(box);

  // Question mark / inner core
  const coreGeo = new THREE.OctahedronGeometry(0.6);
  const coreMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, emissive: 0xFBBF24, emissiveIntensity: 0.5 });
  const core = new THREE.Mesh(coreGeo, coreMat);
  group.add(core);

  return group;
}

export function createBoostPadModel(): THREE.Group {
  const group = new THREE.Group();
  const padGeo = new THREE.PlaneGeometry(5.0, 7.0);
  
  // Create neon arrow canvas texture
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#0284C7';
  ctx.fillRect(0, 0, 128, 128);

  ctx.fillStyle = '#38BDF8';
  ctx.beginPath();
  ctx.moveTo(64, 10);
  ctx.lineTo(110, 60);
  ctx.lineTo(85, 60);
  ctx.lineTo(85, 110);
  ctx.lineTo(43, 110);
  ctx.lineTo(43, 60);
  ctx.lineTo(18, 60);
  ctx.closePath();
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  const padMat = new THREE.MeshStandardMaterial({
    map: texture,
    emissive: 0x38BDF8,
    emissiveIntensity: 0.6,
    roughness: 0.2,
  });

  const mesh = new THREE.Mesh(padGeo, padMat);
  mesh.rotation.x = -Math.PI / 2;
  group.add(mesh);
  return group;
}

export function createStartFinishArch(): THREE.Group {
  const group = new THREE.Group();
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0xD97706, roughness: 0.8 });

  // Left Pillar
  const pillar1 = new THREE.Mesh(new THREE.BoxGeometry(2, 9, 2), stoneMat);
  pillar1.position.set(-10, 4.5, 0);

  // Right Pillar
  const pillar2 = new THREE.Mesh(new THREE.BoxGeometry(2, 9, 2), stoneMat);
  pillar2.position.set(10, 4.5, 0);

  // Top Beam
  const beam = new THREE.Mesh(new THREE.BoxGeometry(22, 2, 2), stoneMat);
  beam.position.set(0, 9, 0);

  // Banner Checkered
  const bannerGeo = new THREE.PlaneGeometry(18, 2);
  const bannerMat = new THREE.MeshBasicMaterial({ map: createCheckeredTexture(), side: THREE.DoubleSide });
  const banner = new THREE.Mesh(bannerGeo, bannerMat);
  banner.position.set(0, 7.2, 0);

  group.add(pillar1, pillar2, beam, banner);
  return group;
}

export function createWoodenBridge(): THREE.Group {
  const group = new THREE.Group();
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x78350F, roughness: 0.9 });

  // Planks
  for (let i = -10; i <= 10; i += 1.2) {
    const plank = new THREE.Mesh(new THREE.BoxGeometry(10, 0.4, 1.0), woodMat);
    plank.position.set(0, 0.2, i);
    group.add(plank);
  }

  // Railings
  const railMat = new THREE.MeshStandardMaterial({ color: 0x451A03, roughness: 0.9 });
  const railLeft = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.2, 22), railMat);
  railLeft.position.set(-4.8, 1.0, 0);

  const railRight = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.2, 22), railMat);
  railRight.position.set(4.8, 1.0, 0);

  group.add(railLeft, railRight);
  return group;
}

export function createSonoranHouse(): THREE.Group {
  const group = new THREE.Group();
  const wallMat = new THREE.MeshStandardMaterial({ color: 0xFEF3C7, roughness: 0.7 });
  const roofMat = new THREE.MeshStandardMaterial({ color: 0xEA580C, roughness: 0.6 });

  const body = new THREE.Mesh(new THREE.BoxGeometry(8, 6, 8), wallMat);
  body.position.y = 3;

  const roof = new THREE.Mesh(new THREE.ConeGeometry(6.5, 3, 4), roofMat);
  roof.position.y = 7.5;
  roof.rotation.y = Math.PI / 4;

  group.add(body, roof);
  return group;
}

export function createCactusBallModel(): THREE.Group {
  const group = new THREE.Group();
  const ballGeo = new THREE.SphereGeometry(0.8, 12, 12);
  const ballMat = new THREE.MeshStandardMaterial({ color: 0x16A34A, roughness: 0.5 });
  const ball = new THREE.Mesh(ballGeo, ballMat);

  // Red flower top
  const flowerGeo = new THREE.SphereGeometry(0.25, 8, 8);
  const flowerMat = new THREE.MeshStandardMaterial({ color: 0xDC2626 });
  const flower = new THREE.Mesh(flowerGeo, flowerMat);
  flower.position.y = 0.8;

  group.add(ball, flower);
  return group;
}

export function createHeartShieldModel(): THREE.Group {
  const group = new THREE.Group();
  const sphereGeo = new THREE.SphereGeometry(2.2, 16, 16);
  const sphereMat = new THREE.MeshStandardMaterial({
    color: 0xEC4899,
    transparent: true,
    opacity: 0.45,
    emissive: 0x38BDF8,
    emissiveIntensity: 0.4,
  });
  const sphere = new THREE.Mesh(sphereGeo, sphereMat);
  group.add(sphere);
  return group;
}

export function createBananaModel(): THREE.Group {
  const group = new THREE.Group();
  const bananaMat = new THREE.MeshStandardMaterial({ color: 0xFACC15, roughness: 0.3 });
  
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.4, 0, 0),
    new THREE.Vector3(-0.2, 0.3, 0),
    new THREE.Vector3(0.2, 0.3, 0),
    new THREE.Vector3(0.4, 0, 0),
  ]);
  
  const geo = new THREE.TubeGeometry(curve, 12, 0.15, 8, false);
  const banana = new THREE.Mesh(geo, bananaMat);
  group.add(banana);
  return group;
}

export function createPalmTreeModel(): THREE.Group {
  const group = new THREE.Group();

  // Curved trunk
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x854D0E, roughness: 0.8 });
  const trunkGeo = new THREE.CylinderGeometry(0.3, 0.5, 6, 8);
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.position.y = 3;
  trunk.rotation.z = 0.1;
  group.add(trunk);

  // Palm fronds
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x16A34A, roughness: 0.4, side: THREE.DoubleSide });
  for (let i = 0; i < 6; i++) {
    const leafGroup = new THREE.Group();
    const leafGeo = new THREE.PlaneGeometry(1.2, 3.5);
    const leaf = new THREE.Mesh(leafGeo, leafMat);
    leaf.position.set(0, 1.75, 0);
    leaf.rotation.x = 0.8;
    leafGroup.add(leaf);

    leafGroup.rotation.y = (i * Math.PI) / 3;
    leafGroup.position.set(0, 5.8, 0);
    group.add(leafGroup);
  }

  return group;
}

export function createCrystalModel(): THREE.Group {
  const group = new THREE.Group();
  const crystalMat = new THREE.MeshStandardMaterial({
    color: 0x38BDF8,
    emissive: 0x0284C7,
    emissiveIntensity: 0.8,
    roughness: 0.2,
    metalness: 0.3,
  });

  const mainShard = new THREE.Mesh(new THREE.ConeGeometry(1.5, 7, 5), crystalMat);
  mainShard.position.y = 3.5;

  const shard2 = new THREE.Mesh(new THREE.ConeGeometry(1.0, 5, 5), crystalMat);
  shard2.position.set(1.2, 2.5, 0.5);
  shard2.rotation.z = -0.4;

  const shard3 = new THREE.Mesh(new THREE.ConeGeometry(0.8, 4, 5), crystalMat);
  shard3.position.set(-1.0, 2.0, -0.6);
  shard3.rotation.z = 0.5;

  group.add(mainShard, shard2, shard3);
  return group;
}

export function createPapelPicadoModel(): THREE.Group {
  const group = new THREE.Group();

  // Two wooden poles on each side of the road
  const poleMat = new THREE.MeshStandardMaterial({ color: 0x78350F, roughness: 0.8 });
  const poleL = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 9, 8), poleMat);
  poleL.position.set(-10, 4.5, 0);

  const poleR = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 9, 8), poleMat);
  poleR.position.set(10, 4.5, 0);

  // String line across top
  const stringGeo = new THREE.CylinderGeometry(0.04, 0.04, 20, 6);
  const stringMat = new THREE.MeshBasicMaterial({ color: 0xFEF08A });
  const stringLine = new THREE.Mesh(stringGeo, stringMat);
  stringLine.rotation.z = Math.PI / 2;
  stringLine.position.set(0, 8.5, 0);

  group.add(poleL, poleR, stringLine);

  // Colorful bunting flag triangles hanging along string
  const flagColors = [0xEC4899, 0x38BDF8, 0xF59E0B, 0x16A34A, 0x8B5CF6, 0xEF4444];
  for (let i = 0; i < 12; i++) {
    const xPos = -9 + i * 1.6;
    const flagGeo = new THREE.ConeGeometry(0.6, 1.2, 3);
    const flagMat = new THREE.MeshStandardMaterial({
      color: flagColors[i % flagColors.length],
      side: THREE.DoubleSide,
      roughness: 0.4,
    });
    const flag = new THREE.Mesh(flagGeo, flagMat);
    flag.rotation.z = Math.PI; // upside down triangle
    flag.position.set(xPos, 7.8, 0);
    group.add(flag);
  }

  return group;
}

export function createWaterfallModel(): THREE.Group {
  const group = new THREE.Group();

  // Cascading blue water sheet
  const waterGeo = new THREE.PlaneGeometry(12, 16);
  const waterMat = new THREE.MeshStandardMaterial({
    color: 0x38BDF8,
    transparent: true,
    opacity: 0.8,
    roughness: 0.1,
    emissive: 0x0284C7,
    emissiveIntensity: 0.3,
    side: THREE.DoubleSide,
  });
  const waterfallMesh = new THREE.Mesh(waterGeo, waterMat);
  waterfallMesh.position.set(0, 8, 0);
  group.add(waterfallMesh);

  // Foam spray at bottom
  const foamGeo = new THREE.SphereGeometry(1.5, 8, 8);
  const foamMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0.7 });
  for (let i = -5; i <= 5; i += 2) {
    const foam = new THREE.Mesh(foamGeo, foamMat);
    foam.position.set(i, 0.5, 1);
    group.add(foam);
  }

  return group;
}

export function createRainbowModel(): THREE.Group {
  const group = new THREE.Group();

  // Semi-torus arch for rainbow
  const torusGeo = new THREE.TorusGeometry(18, 1.2, 8, 24, Math.PI);
  const rainbowMat = new THREE.MeshBasicMaterial({
    color: 0xFEF08A,
    transparent: true,
    opacity: 0.65,
    side: THREE.DoubleSide,
  });
  const rainbow = new THREE.Mesh(torusGeo, rainbowMat);
  rainbow.rotation.z = 0;
  group.add(rainbow);

  return group;
}

