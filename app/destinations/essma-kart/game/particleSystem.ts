import * as THREE from 'three';
import { Vector3D } from '../types';

interface Particle {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
  isSkidMark?: boolean;
}

export class ParticleSystem {
  private group = new THREE.Group();
  private particles: Particle[] = [];

  // Reusable Geometries & Materials
  private particleGeo = new THREE.SphereGeometry(0.12, 5, 5);
  private skidGeo = new THREE.PlaneGeometry(0.35, 0.7);

  private sparkBlueMat = new THREE.MeshBasicMaterial({ color: 0x38BDF8 });
  private sparkOrangeMat = new THREE.MeshBasicMaterial({ color: 0xF59E0B });
  private sparkPurpleMat = new THREE.MeshBasicMaterial({ color: 0xEC4899 });

  private flameMats = [
    new THREE.MeshBasicMaterial({ color: 0x38BDF8 }),
    new THREE.MeshBasicMaterial({ color: 0xF59E0B }),
    new THREE.MeshBasicMaterial({ color: 0xEF4444 }),
  ];

  private dustMat = new THREE.MeshBasicMaterial({ color: 0xD97706, transparent: true, opacity: 0.6 });
  private skidMat = new THREE.MeshBasicMaterial({ color: 0x1E293B, transparent: true, opacity: 0.6, side: THREE.DoubleSide });

  private MAX_PARTICLES = 100;

  constructor(scene: THREE.Scene) {
    scene.add(this.group);
  }

  public emitDriftSparks(pos: Vector3D, level: number) {
    if (this.particles.length >= this.MAX_PARTICLES) return;

    const mat = level === 3 ? this.sparkPurpleMat : level === 2 ? this.sparkOrangeMat : this.sparkBlueMat;

    for (let i = 0; i < 2; i++) {
      const mesh = new THREE.Mesh(this.particleGeo, mat);
      mesh.position.set(
        pos.x + (Math.random() - 0.5) * 0.8,
        pos.y + 0.2,
        pos.z + (Math.random() - 0.5) * 0.8
      );

      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 3,
        Math.random() * 2.5 + 1,
        (Math.random() - 0.5) * 3
      );

      this.group.add(mesh);
      this.particles.push({ mesh, velocity: vel, life: 0, maxLife: 0.22 });
    }
  }

  public emitBoostFlames(pos: Vector3D) {
    if (this.particles.length >= this.MAX_PARTICLES) return;

    const mat = this.flameMats[Math.floor(Math.random() * this.flameMats.length)];

    for (let i = 0; i < 2; i++) {
      const mesh = new THREE.Mesh(this.particleGeo, mat);
      mesh.scale.setScalar(1.4);
      mesh.position.set(
        pos.x + (Math.random() - 0.5) * 0.4,
        pos.y + 0.3,
        pos.z + (Math.random() - 0.5) * 0.4
      );

      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 1.5,
        Math.random() * 1.5,
        (Math.random() - 0.5) * 1.5
      );

      this.group.add(mesh);
      this.particles.push({ mesh, velocity: vel, life: 0, maxLife: 0.28 });
    }
  }

  public emitOffroadDust(pos: Vector3D) {
    if (this.particles.length >= this.MAX_PARTICLES) return;

    const mesh = new THREE.Mesh(this.particleGeo, this.dustMat);
    mesh.scale.setScalar(1.8);
    mesh.position.set(pos.x, pos.y + 0.1, pos.z);

    const vel = new THREE.Vector3(
      (Math.random() - 0.5) * 2,
      Math.random() * 1.2,
      (Math.random() - 0.5) * 2
    );

    this.group.add(mesh);
    this.particles.push({ mesh, velocity: vel, life: 0, maxLife: 0.3 });
  }

  public emitSkidMark(pos: Vector3D, rotY: number) {
    if (this.particles.length >= this.MAX_PARTICLES) return;

    const mesh = new THREE.Mesh(this.skidGeo, this.skidMat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.rotation.z = rotY;
    mesh.position.set(pos.x, pos.y + 0.05, pos.z);

    this.group.add(mesh);
    this.particles.push({
      mesh,
      velocity: new THREE.Vector3(0, 0, 0),
      life: 0,
      maxLife: 2.2, // Fades away clean
      isSkidMark: true,
    });
  }

  public update(delta: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += delta;

      if (!p.isSkidMark) {
        p.mesh.position.addScaledVector(p.velocity, delta);
        const scale = 1 - p.life / p.maxLife;
        p.mesh.scale.setScalar(Math.max(0, scale * 1.4));
      }

      if (p.life >= p.maxLife) {
        this.group.remove(p.mesh);
        this.particles.splice(i, 1);
      }
    }
  }

  public dispose() {
    this.particles.forEach((p) => this.group.remove(p.mesh));
    this.particles = [];
    this.particleGeo.dispose();
    this.skidGeo.dispose();
    this.sparkBlueMat.dispose();
    this.sparkOrangeMat.dispose();
    this.sparkPurpleMat.dispose();
    this.flameMats.forEach((m) => m.dispose());
    this.dustMat.dispose();
    this.skidMat.dispose();
  }
}

