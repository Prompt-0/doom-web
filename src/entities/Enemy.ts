/**
 * DOOM Monster AI & Finite State Machine
 * Implements line-of-sight tracking, alert sound propagation, melee/ranged attacks, pain states, and monster infighting!
 */

import { Entity } from './Entity';
import { GameMap } from '../world/Map';
import { Collision } from '../world/Collision';
import { Projectile } from './Projectile';

export type MonsterState = 'IDLE' | 'CHASE' | 'ATTACK' | 'PAIN' | 'DEATH' | 'GIBBED';

export interface MonsterStats {
  name: string;
  maxHealth: number;
  speed: number;
  meleeDamage: number;
  rangedDamage: number;
  attackRange: number;
  attackCooldown: number;
  painChance: number; // 0.0 to 1.0
  spritePrefix: string;
  hasRanged: boolean;
  projectileType?: string;
  points: number;
}

export class Enemy extends Entity {
  public stats: MonsterStats;
  public health: number;
  public state: MonsterState = 'IDLE';
  public stateTimer: number = 0;
  public attackCooldownTimer: number = 0;
  public targetX: number = 0;
  public targetY: number = 0;
  public currentTarget: Entity | null = null;
  public walkFrame: number = 0;
  public walkTimer: number = 0;
  public isInfighting: boolean = false;

  constructor(x: number, y: number, stats: MonsterStats) {
    super(x, y, `${stats.spritePrefix}_WALK_1`, 0.4);
    this.stats = stats;
    this.health = stats.maxHealth;
  }

  public takeDamage(
    amount: number,
    attacker: Entity | null = null
  ): boolean {
    if (!this.isAlive) return false;

    this.health -= amount;

    // Retarget to attacker for monster infighting!
    if (attacker && attacker !== this) {
      this.currentTarget = attacker;
      this.state = 'CHASE';
    }

    if (this.health <= 0) {
      this.isAlive = false;
      if (amount > this.stats.maxHealth * 0.8) {
        this.state = 'GIBBED';
        this.spriteName = `${this.stats.spritePrefix}_DEATH`;
      } else {
        this.state = 'DEATH';
        this.spriteName = `${this.stats.spritePrefix}_DEATH`;
      }
      return true; // Monster died
    }

    // Pain state check
    if (Math.random() < this.stats.painChance && this.state !== 'ATTACK') {
      this.state = 'PAIN';
      this.stateTimer = 0.2;
      this.spriteName = `${this.stats.spritePrefix}_PAIN`;
    }

    return false;
  }

  public updateAI(
    delta: number,
    player: Entity,
    map: GameMap,
    onSpawnProjectile: (proj: Projectile) => void,
    onMeleePlayer: (damage: number) => void
  ): void {
    if (!this.isAlive) return;

    if (this.attackCooldownTimer > 0) {
      this.attackCooldownTimer -= delta;
    }

    const target = this.currentTarget || player;
    this.targetX = target.x;
    this.targetY = target.y;

    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const distToTarget = Math.sqrt(dx * dx + dy * dy);

    // =============================
    // STATE: IDLE
    // =============================
    if (this.state === 'IDLE') {
      // Check line of sight to player
      if (distToTarget < 12.0 && Collision.hasLineOfSight(this.x, this.y, this.targetX, this.targetY, map)) {
        this.state = 'CHASE';
      }
    }

    // =============================
    // STATE: PAIN
    // =============================
    else if (this.state === 'PAIN') {
      this.stateTimer -= delta;
      if (this.stateTimer <= 0) {
        this.state = 'CHASE';
      }
    }

    // =============================
    // STATE: ATTACK
    // =============================
    else if (this.state === 'ATTACK') {
      this.stateTimer -= delta;
      if (this.stateTimer <= 0) {
        // Execute attack!
        if (distToTarget <= 1.6) {
          // Melee hit
          if (target === player) {
            onMeleePlayer(this.stats.meleeDamage);
          } else if (target instanceof Enemy) {
            target.takeDamage(this.stats.meleeDamage, this);
          }
        } else if (this.stats.hasRanged && this.stats.projectileType) {
          // Spawn ranged fireball / plasma projectile
          const dirX = dx / (distToTarget || 1);
          const dirY = dy / (distToTarget || 1);
          onSpawnProjectile(
            new Projectile({
              x: this.x + dirX * 0.5,
              y: this.y + dirY * 0.5,
              dirX,
              dirY,
              speed: 8.0,
              damage: this.stats.rangedDamage,
              spriteName: this.stats.projectileType,
              isPlayerOwned: false
            })
          );
        }
        this.state = 'CHASE';
        this.attackCooldownTimer = this.stats.attackCooldown;
      }
    }

    // =============================
    // STATE: CHASE
    // =============================
    else if (this.state === 'CHASE') {
      const hasLOS = Collision.hasLineOfSight(this.x, this.y, this.targetX, this.targetY, map);

      // Check attack opportunity
      if (this.attackCooldownTimer <= 0 && hasLOS) {
        if (distToTarget <= 1.6) {
          // Trigger Melee Attack
          this.state = 'ATTACK';
          this.stateTimer = 0.3;
          this.spriteName = `${this.stats.spritePrefix}_ATTACK`;
          return;
        } else if (this.stats.hasRanged && distToTarget < this.stats.attackRange && Math.random() < 0.05) {
          // Trigger Ranged Attack
          this.state = 'ATTACK';
          this.stateTimer = 0.4;
          this.spriteName = `${this.stats.spritePrefix}_ATTACK`;
          return;
        }
      }

      // Movement towards target with obstacle sliding
      if (distToTarget > 0.8) {
        const moveDirX = dx / distToTarget;
        const moveDirY = dy / distToTarget;

        const nextX = this.x + moveDirX * this.stats.speed * delta;
        const nextY = this.y + moveDirY * this.stats.speed * delta;

        const col = Collision.checkCollision(nextX, nextY, this.radius, map);
        this.x = col.x;
        this.y = col.y;

        // Animate walk cycle
        this.walkTimer += delta * 6.0;
        this.walkFrame = Math.floor(this.walkTimer) % 2;
        this.spriteName = `${this.stats.spritePrefix}_WALK_${this.walkFrame + 1}`;
      }
    }
  }
}
