/**
 * Monster Bestiary Catalog & Factory
 */

import { Enemy, MonsterStats } from './Enemy';

export class Bestiary {
  public static readonly STATS: Record<string, MonsterStats> = {
    zombie: {
      name: 'Zombieman',
      maxHealth: 20,
      speed: 1.4,
      meleeDamage: 5,
      rangedDamage: 8,
      attackRange: 14.0,
      attackCooldown: 1.8,
      painChance: 0.8,
      spritePrefix: 'MONSTER_ZOMBIE',
      hasRanged: true,
      projectileType: 'PROJ_IMP_FIREBALL',
      points: 100,
    },
    shotgunner: {
      name: 'Shotgun Guy',
      maxHealth: 30,
      speed: 1.5,
      meleeDamage: 8,
      rangedDamage: 18,
      attackRange: 12.0,
      attackCooldown: 1.6,
      painChance: 0.7,
      spritePrefix: 'MONSTER_ZOMBIE',
      hasRanged: true,
      projectileType: 'PROJ_IMP_FIREBALL',
      points: 150,
    },
    imp: {
      name: 'Imp',
      maxHealth: 60,
      speed: 1.8,
      meleeDamage: 12,
      rangedDamage: 14,
      attackRange: 15.0,
      attackCooldown: 1.4,
      painChance: 0.6,
      spritePrefix: 'MONSTER_IMP',
      hasRanged: true,
      projectileType: 'PROJ_IMP_FIREBALL',
      points: 200,
    },
    pinky: {
      name: 'Pinky Demon',
      maxHealth: 150,
      speed: 3.2,
      meleeDamage: 22,
      rangedDamage: 0,
      attackRange: 1.6,
      attackCooldown: 0.8,
      painChance: 0.35,
      spritePrefix: 'MONSTER_PINKY',
      hasRanged: false,
      points: 300,
    },
    caco: {
      name: 'Cacodemon',
      maxHealth: 400,
      speed: 2.0,
      meleeDamage: 25,
      rangedDamage: 28,
      attackRange: 18.0,
      attackCooldown: 1.5,
      painChance: 0.4,
      spritePrefix: 'MONSTER_CACO',
      hasRanged: true,
      projectileType: 'PROJ_CACO_BALL',
      points: 600,
    },
    baron: {
      name: 'Baron of Hell',
      maxHealth: 1000,
      speed: 2.2,
      meleeDamage: 40,
      rangedDamage: 45,
      attackRange: 20.0,
      attackCooldown: 1.2,
      painChance: 0.2,
      spritePrefix: 'MONSTER_BARON',
      hasRanged: true,
      projectileType: 'PROJ_BARON_BALL',
      points: 1500,
    },
  };

  public static spawn(type: string, x: number, y: number): Enemy {
    const stats = this.STATS[type] || this.STATS.imp;
    return new Enemy(x, y, stats);
  }
}
