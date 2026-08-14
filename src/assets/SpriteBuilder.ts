/**
 * Procedural Sprite Builder for DOOM Engine
 * Generates pixel art sprites for Weapons, Monsters, Projectiles, Pickups, and Effects.
 */

import { rgba, TextureData } from './TextureBuilder';

export class SpriteBuilder {
  /**
   * Generates the entire sprite catalog
   */
  public static generateAllSprites(): Map<string, TextureData> {
    const sprites = new Map<string, TextureData>();

    // 1. Weapons
    this.buildWeaponSprites(sprites);

    // 2. Monsters
    this.buildMonsterSprites(sprites);

    // 3. Projectiles
    this.buildProjectileSprites(sprites);

    // 4. Pickups
    this.buildPickupSprites(sprites);

    // 5. Effects & Explosions
    this.buildEffectSprites(sprites);

    return sprites;
  }

  // ==========================================
  // 1. WEAPON VIEWMODELS
  // ==========================================
  private static buildWeaponSprites(sprites: Map<string, TextureData>): void {
    const w = 120, h = 90;

    // Fist
    sprites.set('WEAPON_FIST_IDLE', this.createViewmodel(w, h, (x, y) => {
      // Left hand brass knuckle / gloved fist at bottom left
      const dx = x - 60, dy = y - 75;
      if (dx * dx * 1.2 + dy * dy < 28 * 28 && y >= 50) {
        if (y > 75) return rgba(130, 85, 60); // Glove leather
        if (y >= 68 && y <= 74) return rgba(180, 180, 190); // Brass/steel knuckles
        return rgba(210, 150, 120); // Skin
      }
      return 0;
    }, 'WEAPON_FIST_IDLE'));

    sprites.set('WEAPON_FIST_PUNCH', this.createViewmodel(w, h, (x, y) => {
      // Punching forward into center
      const dx = x - 60, dy = y - 48;
      if (dx * dx + dy * dy < 32 * 32) {
        if (y >= 40 && y <= 48 && x >= 42 && x <= 78) return rgba(220, 220, 230); // Knuckles forward
        if (y > 55) return rgba(130, 85, 60);
        return rgba(220, 160, 130);
      }
      return 0;
    }, 'WEAPON_FIST_PUNCH'));

    // Pistol
    sprites.set('WEAPON_PISTOL_IDLE', this.createViewmodel(w, h, (x, y) => {
      // Hand holding pistol in center
      // Gun barrel
      if (x >= 54 && x <= 66 && y >= 32 && y <= 62) {
        const shade = (x === 54 || y === 32) ? 140 : (x === 66) ? 50 : 90;
        return rgba(shade, shade + 5, shade + 10);
      }
      // Hand & Grip
      if (x >= 50 && x <= 70 && y >= 62 && y <= 90) {
        return rgba(200, 145, 115);
      }
      return 0;
    }, 'WEAPON_PISTOL_IDLE'));

    sprites.set('WEAPON_PISTOL_FIRE', this.createViewmodel(w, h, (x, y) => {
      // Muzzle flash at top of barrel
      const dx = x - 60, dy = y - 24;
      if (dx * dx + dy * dy < 14 * 14) {
        return rgba(255, 230, 80); // Bright orange/yellow flash
      }
      if (x >= 54 && x <= 66 && y >= 36 && y <= 66) {
        return rgba(110, 115, 120);
      }
      if (x >= 50 && x <= 70 && y >= 66 && y <= 90) {
        return rgba(200, 145, 115);
      }
      return 0;
    }, 'WEAPON_PISTOL_FIRE'));

    // Shotgun
    sprites.set('WEAPON_SHOTGUN_IDLE', this.createViewmodel(w, h, (x, y) => {
      // Pump shotgun barrel & wooden forend
      if (x >= 53 && x <= 67 && y >= 25 && y <= 55) {
        const isSteel = (x === 53 || x === 67) ? 40 : 120;
        return rgba(isSteel, isSteel, isSteel + 10);
      }
      // Wooden forend
      if (x >= 50 && x <= 70 && y >= 55 && y <= 72) {
        return rgba(130, 65, 30);
      }
      // Hands
      if (x >= 45 && x <= 75 && y >= 72 && y <= 90) {
        return rgba(195, 140, 110);
      }
      return 0;
    }, 'WEAPON_SHOTGUN_IDLE'));

    sprites.set('WEAPON_SHOTGUN_FIRE', this.createViewmodel(w, h, (x, y) => {
      // Giant shotgun muzzle flash
      const dx = x - 60, dy = y - 16;
      if (dx * dx * 0.8 + dy * dy < 22 * 22) {
        return (dx * dx + dy * dy < 10 * 10) ? rgba(255, 255, 200) : rgba(255, 160, 30);
      }
      if (x >= 53 && x <= 67 && y >= 28 && y <= 58) return rgba(110, 110, 120);
      if (x >= 50 && x <= 70 && y >= 58 && y <= 75) return rgba(130, 65, 30);
      if (x >= 45 && x <= 75 && y >= 75 && y <= 90) return rgba(195, 140, 110);
      return 0;
    }, 'WEAPON_SHOTGUN_FIRE'));

    // Super Shotgun (Double Barrel)
    sprites.set('WEAPON_SSG_IDLE', this.createViewmodel(w, h, (x, y) => {
      // Two wide steel barrels side-by-side
      if (x >= 48 && x <= 72 && y >= 26 && y <= 60) {
        if (x === 60) return rgba(30, 30, 35); // Seam between barrels
        return (x === 48 || x === 72) ? rgba(60, 60, 70) : rgba(140, 140, 150);
      }
      // Dark Walnut Stock & Hands
      if (x >= 44 && x <= 76 && y >= 60 && y <= 90) {
        return (x >= 52 && x <= 68 && y <= 75) ? rgba(100, 45, 20) : rgba(190, 135, 105);
      }
      return 0;
    }, 'WEAPON_SSG_IDLE'));

    sprites.set('WEAPON_SSG_FIRE', this.createViewmodel(w, h, (x, y) => {
      // Colossal twin muzzle explosion
      const dx1 = x - 54, dx2 = x - 66, dy = y - 14;
      if (dx1 * dx1 + dy * dy < 20 * 20 || dx2 * dx2 + dy * dy < 20 * 20) {
        return rgba(255, 200, 50);
      }
      if (x >= 48 && x <= 72 && y >= 28 && y <= 62) return rgba(120, 120, 130);
      if (x >= 44 && x <= 76 && y >= 62 && y <= 90) return rgba(190, 135, 105);
      return 0;
    }, 'WEAPON_SSG_FIRE'));

    // Chaingun
    sprites.set('WEAPON_CHAINGUN_IDLE', this.createViewmodel(w, h, (x, y) => {
      // Circular 6-barrel cluster
      const dx = x - 60, dy = y - 40;
      if (dx * dx + dy * dy <= 18 * 18) {
        if (x % 6 <= 1 && y % 6 <= 1) return rgba(20, 20, 25); // Barrel holes
        return rgba(110, 115, 120);
      }
      if (x >= 42 && x <= 78 && y >= 56 && y <= 90) {
        return rgba(70, 75, 80); // Heavy frame
      }
      return 0;
    }, 'WEAPON_CHAINGUN_IDLE'));

    sprites.set('WEAPON_CHAINGUN_FIRE', this.createViewmodel(w, h, (x, y) => {
      const dx = x - 60, dy = y - 26;
      if (dx * dx + dy * dy < 18 * 18) {
        return rgba(255, 220, 40);
      }
      const bdx = x - 60, bdy = y - 42;
      if (bdx * bdx + bdy * bdy <= 18 * 18) return rgba(130, 135, 140);
      if (x >= 42 && x <= 78 && y >= 58 && y <= 90) return rgba(70, 75, 80);
      return 0;
    }, 'WEAPON_CHAINGUN_FIRE'));

    // Rocket Launcher
    sprites.set('WEAPON_ROCKET_IDLE', this.createViewmodel(w, h, (x, y) => {
      // Big green launcher tube
      if (x >= 46 && x <= 74 && y >= 20 && y <= 75) {
        if (x <= 48 || x >= 72 || y <= 23) return rgba(40, 50, 40);
        return rgba(70, 105, 70);
      }
      // Target scope & Hands
      if (x >= 38 && x <= 46 && y >= 30 && y <= 45) return rgba(30, 30, 30);
      if (x >= 40 && x <= 80 && y >= 75 && y <= 90) return rgba(190, 135, 105);
      return 0;
    }, 'WEAPON_ROCKET_IDLE'));

    // Plasma Rifle
    sprites.set('WEAPON_PLASMA_IDLE', this.createViewmodel(w, h, (x, y) => {
      // Tech sci-fi housing with blue energy coils
      if (x >= 48 && x <= 72 && y >= 24 && y <= 70) {
        // Glowing blue coils
        if (y % 8 <= 3 && x >= 52 && x <= 68) return rgba(40, 180, 255);
        return rgba(80, 85, 90);
      }
      if (x >= 44 && x <= 76 && y >= 70 && y <= 90) return rgba(180, 130, 100);
      return 0;
    }, 'WEAPON_PLASMA_IDLE'));

    // BFG 9000
    sprites.set('WEAPON_BFG_IDLE', this.createViewmodel(w, h, (x, y) => {
      // Massive superweapon with emerald plasma vents
      if (x >= 38 && x <= 82 && y >= 20 && y <= 75) {
        // Center green sphere chamber
        const dx = x - 60, dy = y - 45;
        if (dx * dx + dy * dy <= 12 * 12) return rgba(50, 255, 60);
        return rgba(55, 65, 55);
      }
      if (x >= 35 && x <= 85 && y >= 75 && y <= 90) return rgba(180, 130, 100);
      return 0;
    }, 'WEAPON_BFG_IDLE'));
  }

  // ==========================================
  // 2. MONSTER SPRITES
  // ==========================================
  private static buildMonsterSprites(sprites: Map<string, TextureData>): void {
    const s = 48; // Standard monster sprite size

    // ZOMBIEMAN (Trooper)
    sprites.set('MONSTER_ZOMBIE_WALK_1', this.createMonsterSprite(s, s, 'zombie', 0));
    sprites.set('MONSTER_ZOMBIE_WALK_2', this.createMonsterSprite(s, s, 'zombie', 1));
    sprites.set('MONSTER_ZOMBIE_ATTACK', this.createMonsterSprite(s, s, 'zombie', 2));
    sprites.set('MONSTER_ZOMBIE_PAIN', this.createMonsterSprite(s, s, 'zombie', 3));
    sprites.set('MONSTER_ZOMBIE_DEATH', this.createMonsterSprite(s, s, 'zombie', 4));

    // IMP (Brown demon with spikes)
    sprites.set('MONSTER_IMP_WALK_1', this.createMonsterSprite(s, s, 'imp', 0));
    sprites.set('MONSTER_IMP_WALK_2', this.createMonsterSprite(s, s, 'imp', 1));
    sprites.set('MONSTER_IMP_ATTACK', this.createMonsterSprite(s, s, 'imp', 2));
    sprites.set('MONSTER_IMP_PAIN', this.createMonsterSprite(s, s, 'imp', 3));
    sprites.set('MONSTER_IMP_DEATH', this.createMonsterSprite(s, s, 'imp', 4));

    // PINKY DEMON (Pink charging brute)
    sprites.set('MONSTER_PINKY_WALK_1', this.createMonsterSprite(s, s, 'pinky', 0));
    sprites.set('MONSTER_PINKY_WALK_2', this.createMonsterSprite(s, s, 'pinky', 1));
    sprites.set('MONSTER_PINKY_ATTACK', this.createMonsterSprite(s, s, 'pinky', 2));
    sprites.set('MONSTER_PINKY_PAIN', this.createMonsterSprite(s, s, 'pinky', 3));
    sprites.set('MONSTER_PINKY_DEATH', this.createMonsterSprite(s, s, 'pinky', 4));

    // CACODEMON (Red floating one-eyed demon)
    sprites.set('MONSTER_CACO_FLOAT_1', this.createMonsterSprite(s, s, 'caco', 0));
    sprites.set('MONSTER_CACO_FLOAT_2', this.createMonsterSprite(s, s, 'caco', 1));
    sprites.set('MONSTER_CACO_ATTACK', this.createMonsterSprite(s, s, 'caco', 2));
    sprites.set('MONSTER_CACO_PAIN', this.createMonsterSprite(s, s, 'caco', 3));
    sprites.set('MONSTER_CACO_DEATH', this.createMonsterSprite(s, s, 'caco', 4));

    // BARON OF HELL (Boss goat demon)
    const bSize = 64;
    sprites.set('MONSTER_BARON_WALK_1', this.createMonsterSprite(bSize, bSize, 'baron', 0));
    sprites.set('MONSTER_BARON_WALK_2', this.createMonsterSprite(bSize, bSize, 'baron', 1));
    sprites.set('MONSTER_BARON_ATTACK', this.createMonsterSprite(bSize, bSize, 'baron', 2));
    sprites.set('MONSTER_BARON_PAIN', this.createMonsterSprite(bSize, bSize, 'baron', 3));
    sprites.set('MONSTER_BARON_DEATH', this.createMonsterSprite(bSize, bSize, 'baron', 4));
  }

  // ==========================================
  // 3. PROJECTILES
  // ==========================================
  private static buildProjectileSprites(sprites: Map<string, TextureData>): void {
    const pSize = 24;

    // Imp Fireball
    sprites.set('PROJ_IMP_FIREBALL', this.createViewmodel(pSize, pSize, (x, y) => {
      const dx = x - 12, dy = y - 12;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d <= 9) {
        if (d <= 4) return rgba(255, 255, 200);
        if (d <= 7) return rgba(255, 160, 20);
        return rgba(200, 50, 10);
      }
      return 0;
    }, 'PROJ_IMP_FIREBALL'));

    // Cacodemon Lightning Orb
    sprites.set('PROJ_CACO_BALL', this.createViewmodel(pSize, pSize, (x, y) => {
      const dx = x - 12, dy = y - 12;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d <= 9) {
        if (d <= 4) return rgba(255, 255, 255);
        if (d <= 7) return rgba(80, 180, 255);
        return rgba(220, 40, 60);
      }
      return 0;
    }, 'PROJ_CACO_BALL'));

    // Baron Toxic Green Plasma Ball
    sprites.set('PROJ_BARON_BALL', this.createViewmodel(pSize, pSize, (x, y) => {
      const dx = x - 12, dy = y - 12;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d <= 10) {
        if (d <= 4) return rgba(230, 255, 230);
        if (d <= 8) return rgba(40, 255, 60);
        return rgba(10, 140, 30);
      }
      return 0;
    }, 'PROJ_BARON_BALL'));

    // Player Rocket
    sprites.set('PROJ_ROCKET', this.createViewmodel(pSize, pSize, (x, y) => {
      if (x >= 6 && x <= 18 && y >= 9 && y <= 15) {
        if (x >= 15) return rgba(200, 30, 30); // Warhead
        return rgba(120, 120, 130); // Body
      }
      if (x <= 6 && y >= 10 && y <= 14) return rgba(255, 180, 20); // Exhaust fire
      return 0;
    }, 'PROJ_ROCKET'));

    // Player Blue Plasma
    sprites.set('PROJ_PLASMA', this.createViewmodel(pSize, pSize, (x, y) => {
      const dx = x - 12, dy = y - 12;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d <= 8) {
        if (d <= 3) return rgba(240, 250, 255);
        return rgba(40, 160, 255);
      }
      return 0;
    }, 'PROJ_PLASMA'));

    // BFG 9000 Giant Green Orb
    const bfgSize = 32;
    sprites.set('PROJ_BFG_ORB', this.createViewmodel(bfgSize, bfgSize, (x, y) => {
      const dx = x - 16, dy = y - 16;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d <= 14) {
        if (d <= 5) return rgba(255, 255, 255);
        if (d <= 10) return rgba(60, 255, 80);
        return rgba(20, 160, 30);
      }
      return 0;
    }, 'PROJ_BFG_ORB'));
  }

  // ==========================================
  // 4. PICKUPS & ITEMS
  // ==========================================
  private static buildPickupSprites(sprites: Map<string, TextureData>): void {
    const k = 28;

    // Medikit (+25% HP)
    sprites.set('PICKUP_MEDIKIT', this.createViewmodel(k, k, (x, y) => {
      if (x >= 4 && x <= 23 && y >= 6 && y <= 22) {
        // Red cross
        if ((x >= 12 && x <= 15 && y >= 9 && y <= 19) || (y >= 12 && y <= 15 && x >= 7 && x <= 20)) {
          return rgba(220, 30, 30);
        }
        return rgba(230, 230, 235); // White case
      }
      return 0;
    }, 'PICKUP_MEDIKIT'));

    // Stimpack (+10% HP)
    sprites.set('PICKUP_STIMPACK', this.createViewmodel(k, k, (x, y) => {
      if (x >= 7 && x <= 20 && y >= 8 && y <= 22) {
        if (x >= 12 && x <= 15 && y >= 11 && y <= 18) return rgba(220, 30, 30);
        return rgba(220, 220, 220);
      }
      return 0;
    }, 'PICKUP_STIMPACK'));

    // Green Armor (100%)
    sprites.set('PICKUP_ARMOR_GREEN', this.createViewmodel(k, k, (x, y) => {
      const dx = (x - 14) / 9, dy = (y - 14) / 10;
      if (dx * dx + dy * dy <= 1.0 && y >= 6 && y <= 23) {
        return (x === 14 || y === 10) ? rgba(80, 220, 80) : rgba(40, 140, 40);
      }
      return 0;
    }, 'PICKUP_ARMOR_GREEN'));

    // Blue MegaArmor (200%)
    sprites.set('PICKUP_ARMOR_BLUE', this.createViewmodel(k, k, (x, y) => {
      const dx = (x - 14) / 9, dy = (y - 14) / 10;
      if (dx * dx + dy * dy <= 1.0 && y >= 6 && y <= 23) {
        return (x === 14 || y === 10) ? rgba(120, 200, 255) : rgba(30, 90, 230);
      }
      return 0;
    }, 'PICKUP_ARMOR_BLUE'));

    // Keycards (Blue, Red, Yellow)
    sprites.set('KEY_BLUE', this.buildKeycard(k, 30, 110, 255));
    sprites.set('KEY_RED', this.buildKeycard(k, 240, 30, 30));
    sprites.set('KEY_YELLOW', this.buildKeycard(k, 255, 210, 20));

    // Ammo Box & Shells
    sprites.set('PICKUP_CLIP', this.createViewmodel(k, k, (x, y) => {
      if (x >= 8 && x <= 19 && y >= 10 && y <= 22) return rgba(180, 160, 40);
      return 0;
    }, 'PICKUP_CLIP'));

    sprites.set('PICKUP_SHELLS', this.createViewmodel(k, k, (x, y) => {
      if (x >= 6 && x <= 21 && y >= 12 && y <= 22) {
        return (x % 5 <= 1) ? rgba(210, 180, 30) : rgba(180, 30, 30);
      }
      return 0;
    }, 'PICKUP_SHELLS'));

    sprites.set('PICKUP_ROCKET', this.createViewmodel(k, k, (x, y) => {
      if (x >= 9 && x <= 18 && y >= 6 && y <= 22) return rgba(180, 50, 40);
      return 0;
    }, 'PICKUP_ROCKET'));

    sprites.set('PICKUP_CELL', this.createViewmodel(k, k, (x, y) => {
      if (x >= 8 && x <= 19 && y >= 8 && y <= 22) {
        return (y % 4 <= 1) ? rgba(40, 180, 255) : rgba(60, 65, 70);
      }
      return 0;
    }, 'PICKUP_CELL'));

    // Berserk Pack
    sprites.set('PICKUP_BERSERK', this.createViewmodel(k, k, (x, y) => {
      if (x >= 4 && x <= 23 && y >= 6 && y <= 22) {
        if ((x >= 12 && x <= 15 && y >= 9 && y <= 19) || (y >= 12 && y <= 15 && x >= 7 && x <= 20)) {
          return rgba(255, 30, 30);
        }
        return rgba(30, 30, 35); // Black case
      }
      return 0;
    }, 'PICKUP_BERSERK'));
  }

  // ==========================================
  // 5. EFFECTS & EXPLOSIONS
  // ==========================================
  private static buildEffectSprites(sprites: Map<string, TextureData>): void {
    const eSize = 36;
    for (let f = 1; f <= 3; f++) {
      sprites.set(`EXPLOSION_FRAME_${f}`, this.createViewmodel(eSize, eSize, (x, y) => {
        const dx = x - 18, dy = y - 18;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const radius = f * 5.5;
        if (dist <= radius) {
          if (dist <= radius * 0.4) return rgba(255, 255, 200);
          if (dist <= radius * 0.75) return rgba(255, 140, 20);
          return rgba(180, 40, 10, 200);
        }
        return 0;
      }, `EXPLOSION_FRAME_${f}`));
    }
  }

  // Helper to build keycard sprite
  private static buildKeycard(k: number, r: number, g: number, b: number): TextureData {
    return this.createViewmodel(k, k, (x, y) => {
      if (x >= 6 && x <= 21 && y >= 8 && y <= 20) {
        // Metallic card chip
        if (x >= 10 && x <= 14 && y >= 11 && y <= 15) return rgba(240, 220, 100);
        return rgba(r, g, b);
      }
      return 0;
    }, `KEY_${r > 200 ? 'RED' : g > 150 ? 'YELLOW' : 'BLUE'}`);
  }

  // Helper for viewmodels
  private static createViewmodel(
    w: number,
    h: number,
    colorFn: (x: number, y: number) => number,
    name: string
  ): TextureData {
    const pixels = new Uint32Array(w * h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        pixels[y * w + x] = colorFn(x, y);
      }
    }
    return { name, width: w, height: h, pixels };
  }

  // Helper for monster frame rendering
  private static createMonsterSprite(
    w: number,
    h: number,
    type: 'zombie' | 'imp' | 'pinky' | 'caco' | 'baron',
    frame: number // 0=walk1, 1=walk2, 2=attack, 3=pain, 4=death
  ): TextureData {
    const pixels = new Uint32Array(w * h);
    const cx = w / 2, cy = h / 2;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        pixels[y * w + x] = 0; // Transparent default

        if (frame === 4) {
          // Dead / gib puddle on ground
          const dx = (x - cx) / (w * 0.4);
          const dy = (y - (h - 10)) / (h * 0.15);
          if (dx * dx + dy * dy <= 1.0) {
            pixels[y * w + x] = rgba(160, 20, 20); // Gory remains
          }
          continue;
        }

        const legOffset = (frame === 1) ? 2 : 0;
        const isAttacking = (frame === 2);
        const isPain = (frame === 3);

        if (type === 'imp') {
          // Brown demonic body
          const dx = (x - cx) / (w * 0.28);
          const dy = (y - cy) / (h * 0.38);
          if (dx * dx + dy * dy <= 1.0) {
            if (isPain) {
              pixels[y * w + x] = rgba(200, 80, 80);
            } else {
              // Glowing red eyes
              if (y >= cy - 8 && y <= cy - 6 && (x === cx - 3 || x === cx + 3)) {
                pixels[y * w + x] = rgba(255, 30, 30);
              } else {
                pixels[y * w + x] = rgba(120, 75, 45); // Brown skin
              }
            }
          }
          // Claws / Attack fireball in hand
          if (isAttacking && y >= cy - 10 && y <= cy && (x <= cx - 10 || x >= cx + 10)) {
            pixels[y * w + x] = rgba(255, 180, 40); // Fireball casting
          }
        } else if (type === 'zombie') {
          // Green military armor + rifle
          const dx = (x - cx) / (w * 0.25);
          const dy = (y - cy) / (h * 0.35);
          if (dx * dx + dy * dy <= 1.0) {
            if (isPain) pixels[y * w + x] = rgba(180, 60, 60);
            else if (y < cy - 6) pixels[y * w + x] = rgba(190, 140, 110); // Face
            else pixels[y * w + x] = rgba(70, 110, 60); // Green uniform
          }
          // Rifle in hands
          if (x >= cx - 2 && x <= cx + 12 && y >= cy - 2 && y <= cy + 6) {
            pixels[y * w + x] = rgba(40, 40, 45);
          }
        } else if (type === 'pinky') {
          // Pink quadruped demon brute
          const dx = (x - (cx + legOffset)) / (w * 0.35);
          const dy = (y - cy) / (h * 0.32);
          if (dx * dx + dy * dy <= 1.0) {
            if (isPain) pixels[y * w + x] = rgba(220, 100, 100);
            else if (y < cy - 2 && x > cx) pixels[y * w + x] = rgba(240, 240, 240); // Sharp teeth
            else pixels[y * w + x] = rgba(215, 120, 135); // Pink muscular hide
          }
        } else if (type === 'caco') {
          // Floating red one-eyed sphere
          const dx = (x - cx) / (w * 0.38);
          const dy = (y - cy) / (h * 0.38);
          if (dx * dx + dy * dy <= 1.0) {
            // Giant central green eye
            const eyeDist = Math.sqrt((x - cx) * (x - cx) + (y - (cy - 4)) * (y - (cy - 4)));
            if (eyeDist <= 5) {
              pixels[y * w + x] = (eyeDist <= 2) ? rgba(20, 20, 20) : rgba(40, 240, 120);
            } else if (isAttacking && y >= cy + 2 && y <= cy + 10 && Math.abs(x - cx) <= 8) {
              pixels[y * w + x] = rgba(80, 180, 255); // Lightning orb charging in mouth
            } else {
              pixels[y * w + x] = isPain ? rgba(255, 120, 120) : rgba(190, 35, 35); // Crimson sphere
            }
          }
        } else if (type === 'baron') {
          // Huge red-torso goat-legged boss
          const dx = (x - cx) / (w * 0.32);
          const dy = (y - cy) / (h * 0.42);
          if (dx * dx + dy * dy <= 1.0) {
            // Obsidian horns on head
            if (y <= cy - 18 && (Math.abs(x - cx) >= 8 && Math.abs(x - cx) <= 18)) {
              pixels[y * w + x] = rgba(30, 30, 35);
            } else if (y > cy + 4) {
              pixels[y * w + x] = rgba(130, 100, 70); // Brown goat legs
            } else {
              pixels[y * w + x] = isPain ? rgba(255, 140, 140) : rgba(210, 45, 45); // Red upper torso
            }
          }
          // Green plasma casting
          if (isAttacking && (x <= cx - 14 || x >= cx + 14) && y >= cy - 10 && y <= cy + 6) {
            pixels[y * w + x] = rgba(40, 255, 60);
          }
        }
      }
    }

    return { name: `MONSTER_${type.toUpperCase()}_${frame}`, width: w, height: h, pixels };
  }
}
