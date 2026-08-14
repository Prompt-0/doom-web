/**
 * Player Entity, Movement Physics, Inventory & Weapon Execution
 */

import { Entity } from './Entity';
import { Camera } from '../engine/Camera';
import { GameMap } from '../world/Map';
import { Collision } from '../world/Collision';
import { Arsenal, WeaponId, AmmoType, WeaponDef } from '../weapons/Arsenal';
import { Projectile } from './Projectile';
import { Enemy } from './Enemy';
import { KeyType } from '../world/Sector';

export class Player extends Entity {
  public camera: Camera;

  // Stats
  public health: number = 100;
  public maxHealth: number = 100;
  public armor: number = 0;
  public maxArmor: number = 100;
  public armorType: 'NONE' | 'GREEN' | 'BLUE' = 'NONE';
  public isGodMode: boolean = false;
  public isNoClip: boolean = false;
  public isBerserk: boolean = false;

  // Inventory & Keys
  public hasBlueKey: boolean = false;
  public hasRedKey: boolean = false;
  public hasYellowKey: boolean = false;

  // Ammo
  public ammo: Record<AmmoType, number> = {
    NONE: 0,
    BULLETS: 50,
    SHELLS: 0,
    ROCKETS: 0,
    CELLS: 0,
  };

  public maxAmmo: Record<AmmoType, number> = {
    NONE: 0,
    BULLETS: 200,
    SHELLS: 50,
    ROCKETS: 50,
    CELLS: 300,
  };

  // Weapons
  public inventoryWeapons: Set<WeaponId> = new Set(['FIST', 'PISTOL']);
  public currentWeapon: WeaponDef = Arsenal.WEAPONS.PISTOL;
  public attackCooldown: number = 0;
  public muzzleFlashTimer: number = 0;
  public bfgChargeTimer: number = 0;

  // Visual Screen Tints
  public damageTint: number = 0;
  public bonusTint: number = 0;

  // Kill & Secret Statistics
  public kills: number = 0;
  public totalMonsters: number = 0;
  public secretsFound: number = 0;
  public score: number = 0;

  // Movement speed constants
  public moveSpeed: number = 7.0;
  public rotSpeed: number = 2.8;

  constructor(x: number, y: number, angle: number = 0) {
    super(x, y, 'PLAYER', 0.35);
    this.camera = new Camera(x, y, angle);
  }

  public update(
    delta: number,
    input: {
      forward: number;
      strafe: number;
      turn: number;
      mouseDeltaX: number;
      mouseDeltaY: number;
      shoot: boolean;
      use: boolean;
      weaponSlot?: number;
    },
    map: GameMap,
    enemies: Enemy[],
    onSpawnProjectile: (p: Projectile) => void,
    onPlaySound: (snd: string) => void,
    onSpawnBlood: (x: number, y: number) => void,
    onLogMessage: (msg: string) => void
  ): void {
    // 1. Decay Screen Tints
    if (this.damageTint > 0) this.damageTint = Math.max(0, this.damageTint - delta * 2.5);
    if (this.bonusTint > 0) this.bonusTint = Math.max(0, this.bonusTint - delta * 3.0);
    if (this.muzzleFlashTimer > 0) this.muzzleFlashTimer -= delta;

    // 2. Weapon Refire Timer
    if (this.attackCooldown > 0) {
      this.attackCooldown -= delta;
    }

    // 3. Rotation (Keyboard + Mouse Look)
    if (input.turn !== 0) {
      this.camera.rotate(input.turn * this.rotSpeed * delta);
    }
    if (input.mouseDeltaX !== 0) {
      this.camera.rotate(input.mouseDeltaX * 0.003);
    }
    if (input.mouseDeltaY !== 0) {
      this.camera.setPitch(-input.mouseDeltaY * 0.4);
    }

    // 4. Movement Calculation
    const dirX = this.camera.getDirX();
    const dirY = this.camera.getDirY();
    const sideX = -dirY;
    const sideY = dirX;

    let moveX = dirX * input.forward + sideX * input.strafe;
    let moveY = dirY * input.forward + sideY * input.strafe;
    const moveLen = Math.sqrt(moveX * moveX + moveY * moveY);

    if (moveLen > 0.001) {
      moveX = (moveX / moveLen) * this.moveSpeed;
      moveY = (moveY / moveLen) * this.moveSpeed;

      const nextX = this.x + moveX * delta;
      const nextY = this.y + moveY * delta;

      const col = Collision.checkCollision(nextX, nextY, this.radius, map, this.isNoClip);
      this.x = col.x;
      this.y = col.y;
      this.camera.x = this.x;
      this.camera.y = this.y;

      // Update head bobbing
      this.camera.updateBob(this.moveSpeed, delta);
    } else {
      this.camera.updateBob(0, delta);
    }

    // Mark current sector and surroundings as discovered on Automap
    const pGridX = Math.floor(this.x);
    const pGridY = Math.floor(this.y);
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        map.markDiscovered(pGridX + dx, pGridY + dy);
      }
    }

    // 5. Environmental Hazard Check (Nukage / Lava)
    const currentSector = map.getSector(pGridX, pGridY);
    if (currentSector.type === 'hazard_nukage' && !this.isGodMode) {
      this.takeDamage(12 * delta, null, onPlaySound);
    } else if (currentSector.type === 'hazard_lava' && !this.isGodMode) {
      this.takeDamage(25 * delta, null, onPlaySound);
    }

    // 6. Weapon Switching
    if (input.weaponSlot !== undefined) {
      this.switchWeaponSlot(input.weaponSlot, onLogMessage);
    }

    // 7. Interactive Use ('E' / Spacebar)
    if (input.use) {
      const interactDist = 1.2;
      const checkX = Math.floor(this.x + dirX * interactDist);
      const checkY = Math.floor(this.y + dirY * interactDist);

      const result = map.interact(checkX, checkY, (key) => this.hasKey(key));
      if (result.message) {
        onLogMessage(result.message);
      }
      if (result.success) {
        onPlaySound('DSDOROPN');
      }
    }

    // 8. BFG Charge Up sequence
    if (this.bfgChargeTimer > 0) {
      this.bfgChargeTimer -= delta;
      if (this.bfgChargeTimer <= 0) {
        this.executeBfgBlast(dirX, dirY, onSpawnProjectile, onPlaySound, enemies, onSpawnBlood);
      }
    }

    // 9. Shooting / Weapon Trigger
    if (input.shoot && this.attackCooldown <= 0 && this.bfgChargeTimer <= 0) {
      this.fireCurrentWeapon(
        dirX,
        dirY,
        map,
        enemies,
        onSpawnProjectile,
        onPlaySound,
        onSpawnBlood,
        onLogMessage
      );
    }
  }

  public hasKey(key: KeyType): boolean {
    if (key === 'NONE') return true;
    if (key === 'BLUE') return this.hasBlueKey;
    if (key === 'RED') return this.hasRedKey;
    if (key === 'YELLOW') return this.hasYellowKey;
    return false;
  }

  public takeDamage(amount: number, _attacker: Entity | null = null, onPlaySound?: (s: string) => void): void {
    if (this.isGodMode || !this.isAlive) return;

    let actualDmg = amount;
    if (this.armor > 0) {
      const absorbRatio = this.armorType === 'BLUE' ? 0.5 : 0.33;
      const armorAbsorbed = Math.floor(actualDmg * absorbRatio);
      this.armor = Math.max(0, this.armor - armorAbsorbed);
      actualDmg -= armorAbsorbed;
    }

    this.health = Math.max(0, this.health - actualDmg);
    this.damageTint = Math.min(0.8, this.damageTint + actualDmg * 0.02);

    if (this.health <= 0) {
      this.isAlive = false;
      if (onPlaySound) onPlaySound('DSOOF');
    } else if (onPlaySound && Math.random() < 0.3) {
      onPlaySound('DSOOF');
    }
  }

  public addHealth(amount: number, maxCap: number = 100): boolean {
    if (this.health >= maxCap) return false;
    this.health = Math.min(maxCap, this.health + amount);
    this.bonusTint = 0.4;
    return true;
  }

  public addArmor(amount: number, type: 'GREEN' | 'BLUE'): boolean {
    const max = type === 'BLUE' ? 200 : 100;
    if (this.armor >= max && this.armorType === type) return false;
    this.armor = Math.min(max, this.armor + amount);
    this.armorType = type;
    this.bonusTint = 0.4;
    return true;
  }

  public addAmmo(type: AmmoType, amount: number): boolean {
    if (type === 'NONE') return false;
    if (this.ammo[type] >= this.maxAmmo[type]) return false;
    this.ammo[type] = Math.min(this.maxAmmo[type], this.ammo[type] + amount);
    this.bonusTint = 0.3;
    return true;
  }

  public addWeapon(id: WeaponId): boolean {
    const isNew = !this.inventoryWeapons.has(id);
    this.inventoryWeapons.add(id);
    this.currentWeapon = Arsenal.WEAPONS[id];
    this.bonusTint = 0.5;
    return isNew;
  }

  public switchWeaponSlot(slot: number, onLogMessage: (m: string) => void): void {
    const available = Array.from(this.inventoryWeapons)
      .map((wId) => Arsenal.WEAPONS[wId])
      .filter((w) => w.slot === slot);

    if (available.length === 0) return;

    if (available.length === 1) {
      this.currentWeapon = available[0];
      onLogMessage(`EQUIPPED ${this.currentWeapon.name}`);
    } else {
      // Toggle between multiple weapons in same slot (e.g. Fist/Chainsaw, Shotgun/SSG)
      const curIdx = available.findIndex((w) => w.id === this.currentWeapon.id);
      const nextWeapon = available[(curIdx + 1) % available.length];
      this.currentWeapon = nextWeapon;
      onLogMessage(`EQUIPPED ${this.currentWeapon.name}`);
    }
  }

  private fireCurrentWeapon(
    dirX: number,
    dirY: number,
    map: GameMap,
    enemies: Enemy[],
    onSpawnProjectile: (p: Projectile) => void,
    onPlaySound: (s: string) => void,
    onSpawnBlood: (x: number, y: number) => void,
    onLogMessage: (m: string) => void
  ): void {
    const w = this.currentWeapon;

    // Check Ammo
    if (w.ammoType !== 'NONE') {
      if (this.ammo[w.ammoType] < w.ammoCost) {
        onLogMessage('OUT OF AMMO!');
        return;
      }
      this.ammo[w.ammoType] -= w.ammoCost;
    }

    this.attackCooldown = w.refireTime;
    this.muzzleFlashTimer = w.flashDuration;
    onPlaySound(w.soundFire);

    // =============================
    // 1. MELEE (Fist / Chainsaw)
    // =============================
    if (w.id === 'FIST' || w.id === 'CHAINSAW') {
      const isBerserk = this.isBerserk || this.isGodMode;
      const baseDmg = w.id === 'FIST' ? (isBerserk ? 150 : 15) : 18;
      this.performHitscan(dirX, dirY, 1.8, 1, baseDmg, map, enemies, onSpawnBlood);
    }

    // =============================
    // 2. HITSCAN WEAPONS (Pistol, Shotgun, SSG, Chaingun)
    // =============================
    else if (w.id === 'PISTOL') {
      this.performHitscan(dirX, dirY, 30.0, 1, 12, map, enemies, onSpawnBlood);
    } else if (w.id === 'SHOTGUN') {
      this.performHitscanSpread(dirX, dirY, 25.0, 7, 10, 0.08, map, enemies, onSpawnBlood);
    } else if (w.id === 'SUPER_SHOTGUN') {
      this.performHitscanSpread(dirX, dirY, 20.0, 20, 12, 0.18, map, enemies, onSpawnBlood);
    } else if (w.id === 'CHAINGUN') {
      const spread = (Math.random() - 0.5) * 0.05;
      this.performHitscanSpread(dirX, dirY, 30.0, 1, 12, spread, map, enemies, onSpawnBlood);
    }

    // =============================
    // 3. PROJECTILE WEAPONS (Rocket, Plasma)
    // =============================
    else if (w.id === 'ROCKET_LAUNCHER') {
      onSpawnProjectile(
        new Projectile({
          x: this.x + dirX * 0.6,
          y: this.y + dirY * 0.6,
          dirX,
          dirY,
          speed: 16.0,
          damage: 120,
          splashRadius: 2.8,
          spriteName: 'PROJ_ROCKET',
          isPlayerOwned: true,
        })
      );
    } else if (w.id === 'PLASMA_RIFLE') {
      onSpawnProjectile(
        new Projectile({
          x: this.x + dirX * 0.5,
          y: this.y + dirY * 0.5,
          dirX,
          dirY,
          speed: 22.0,
          damage: 32,
          spriteName: 'PROJ_PLASMA',
          isPlayerOwned: true,
        })
      );
    }

    // =============================
    // 4. BFG 9000
    // =============================
    else if (w.id === 'BFG_9000') {
      this.bfgChargeTimer = 0.8; // 0.8s charge sequence before firing
      onLogMessage('BFG 9000 CHARGING...');
    }
  }

  private executeBfgBlast(
    dirX: number,
    dirY: number,
    onSpawnProjectile: (p: Projectile) => void,
    onPlaySound: (s: string) => void,
    enemies: Enemy[],
    onSpawnBlood: (x: number, y: number) => void
  ): void {
    onPlaySound('DSEXPLO');

    // Spawn massive BFG plasma orb
    onSpawnProjectile(
      new Projectile({
        x: this.x + dirX * 0.8,
        y: this.y + dirY * 0.8,
        dirX,
        dirY,
        speed: 15.0,
        damage: 450,
        splashRadius: 4.5,
        spriteName: 'PROJ_BFG_ORB',
        isPlayerOwned: true,
      })
    );

    // 40 secondary BFG cone tracer rays striking all enemies in player's field of view!
    enemies.forEach((enemy) => {
      if (!enemy.isAlive) return;
      const dx = enemy.x - this.x;
      const dy = enemy.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist <= 16.0) {
        const dot = (dx / dist) * dirX + (dy / dist) * dirY;
        if (dot > 0.45) { // Within ~60 degree view cone
          enemy.takeDamage(65 + Math.random() * 30, this);
          onSpawnBlood(enemy.x, enemy.y);
        }
      }
    });
  }

  private performHitscan(
    dirX: number,
    dirY: number,
    range: number,
    pellets: number,
    damagePerPellet: number,
    map: GameMap,
    enemies: Enemy[],
    onSpawnBlood: (x: number, y: number) => void
  ): void {
    enemies.forEach((enemy) => {
      if (!enemy.isAlive) return;
      const dx = enemy.x - this.x;
      const dy = enemy.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= range && Collision.hasLineOfSight(this.x, this.y, enemy.x, enemy.y, map)) {
        const dot = (dx / dist) * dirX + (dy / dist) * dirY;
        if (dot > 0.94) { // Hit within aiming cone
          const killed = enemy.takeDamage(damagePerPellet * pellets, this);
          onSpawnBlood(enemy.x, enemy.y);
          if (killed) {
            this.kills++;
            this.score += enemy.stats.points;
          }
        }
      }
    });
  }

  private performHitscanSpread(
    dirX: number,
    dirY: number,
    range: number,
    pellets: number,
    damagePerPellet: number,
    spreadAngle: number,
    map: GameMap,
    enemies: Enemy[],
    onSpawnBlood: (x: number, y: number) => void
  ): void {
    for (let p = 0; p < pellets; p++) {
      const spread = (Math.random() - 0.5) * spreadAngle * 2;
      const spreadDirX = dirX * Math.cos(spread) - dirY * Math.sin(spread);
      const spreadDirY = dirX * Math.sin(spread) + dirY * Math.cos(spread);
      this.performHitscan(spreadDirX, spreadDirY, range, 1, damagePerPellet, map, enemies, onSpawnBlood);
    }
  }
}
