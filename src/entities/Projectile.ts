/**
 * Projectile System (Rockets, Fireballs, Plasma Bolts, BFG Orbs)
 */

import { Entity } from './Entity';
import { GameMap } from '../world/Map';

export interface ProjectileConfig {
  x: number;
  y: number;
  dirX: number;
  dirY: number;
  speed: number;
  damage: number;
  splashRadius?: number;
  spriteName: string;
  isPlayerOwned: boolean;
}

export class Projectile extends Entity {
  public dirX: number;
  public dirY: number;
  public speed: number;
  public damage: number;
  public splashRadius: number;
  public isPlayerOwned: boolean;
  public lifetime: number = 5.0; // 5 seconds max

  constructor(config: ProjectileConfig) {
    super(config.x, config.y, config.spriteName, 0.2);
    this.dirX = config.dirX;
    this.dirY = config.dirY;
    this.speed = config.speed;
    this.damage = config.damage;
    this.splashRadius = config.splashRadius || 0;
    this.isPlayerOwned = config.isPlayerOwned;
  }

  public update(delta: number, map: GameMap): boolean {
    this.lifetime -= delta;
    if (this.lifetime <= 0) {
      this.isAlive = false;
      return false;
    }

    const nextX = this.x + this.dirX * this.speed * delta;
    const nextY = this.y + this.dirY * this.speed * delta;

    // Check wall collision
    if (map.isSolid(Math.floor(nextX), Math.floor(nextY))) {
      this.isAlive = false;
      return false; // Impact with wall
    }

    this.x = nextX;
    this.y = nextY;
    return true;
  }
}
