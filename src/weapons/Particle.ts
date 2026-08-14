/**
 * Particle & Visual Effects System
 * Manages blood splatters, sparks, smoke trails, and explosions in 3D space.
 */

import { Entity } from '../entities/Entity';

export class Particle extends Entity {
  public lifetime: number;
  public maxLifetime: number;
  public color: number;
  public size: number;
  public isExplosion: boolean = false;
  public explosionFrame: number = 1;

  constructor(
    x: number,
    y: number,
    vx: number,
    vy: number,
    lifetime: number,
    color: number,
    size: number = 0.1,
    isExplosion: boolean = false
  ) {
    super(x, y, isExplosion ? 'EXPLOSION_FRAME_1' : 'PARTICLE_BLOOD', 0.1);
    this.vx = vx;
    this.vy = vy;
    this.lifetime = lifetime;
    this.maxLifetime = lifetime;
    this.color = color;
    this.size = size;
    this.isExplosion = isExplosion;
  }

  public update(delta: number): boolean {
    this.lifetime -= delta;
    if (this.lifetime <= 0) {
      this.isAlive = false;
      return false;
    }

    this.x += this.vx * delta;
    this.y += this.vy * delta;

    // Slow down over time
    this.vx *= 0.92;
    this.vy *= 0.92;

    if (this.isExplosion) {
      const progress = 1.0 - this.lifetime / this.maxLifetime;
      this.explosionFrame = Math.min(3, Math.floor(progress * 3) + 1);
      this.spriteName = `EXPLOSION_FRAME_${this.explosionFrame}`;
    }

    return true;
  }
}

export class ParticleManager {
  public particles: Particle[] = [];

  public spawnBlood(x: number, y: number, count: number = 8): void {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.5 + Math.random() * 2.0;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      const life = 0.3 + Math.random() * 0.4;
      this.particles.push(new Particle(x, y, vx, vy, life, 0xff0000aa, 0.08));
    }
  }

  public spawnExplosion(x: number, y: number): void {
    const explosion = new Particle(x, y, 0, 0, 0.45, 0xff20a0ff, 0.5, true);
    this.particles.push(explosion);

    // Add surrounding smoke & sparks
    for (let i = 0; i < 12; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.0 + Math.random() * 3.0;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      this.particles.push(new Particle(x, y, vx, vy, 0.4 + Math.random() * 0.3, 0xff888888, 0.1));
    }
  }

  public update(delta: number): void {
    this.particles = this.particles.filter((p) => p.update(delta));
  }
}
