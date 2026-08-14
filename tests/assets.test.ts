import { describe, it, expect } from 'vitest';
import { AssetGenerator } from '../src/assets/AssetGenerator';
import { TextureBuilder } from '../src/assets/TextureBuilder';
import { FaceBuilder } from '../src/assets/FaceBuilder';
import { SpriteBuilder } from '../src/assets/SpriteBuilder';

describe('Asset Generation Pipeline', () => {
  it('should generate all core wall and flat textures with valid pixel buffers', () => {
    const textures = TextureBuilder.generateAll();
    expect(textures.size).toBeGreaterThan(10);
    expect(textures.has('STARG1')).toBe(true);
    expect(textures.has('COMP01')).toBe(true);
    expect(textures.has('BRICK01')).toBe(true);
    expect(textures.has('STONE2')).toBe(true);
    expect(textures.has('METAL1')).toBe(true);
    expect(textures.has('DOOR3')).toBe(true);
    expect(textures.has('FLAT14')).toBe(true);
    expect(textures.has('NUKAGE')).toBe(true);
    expect(textures.has('LAVA')).toBe(true);
    expect(textures.has('SKY1')).toBe(true);

    const starg1 = textures.get('STARG1')!;
    expect(starg1.width).toBe(64);
    expect(starg1.height).toBe(64);
    expect(starg1.pixels.length).toBe(64 * 64);
  });

  it('should generate all Doomguy status bar face frames across 5 health brackets', () => {
    const faces = FaceBuilder.generateAllFaces();
    expect(faces.has('STF_STRAIGHT_100')).toBe(true);
    expect(faces.has('STF_LEFT_80')).toBe(true);
    expect(faces.has('STF_RIGHT_60')).toBe(true);
    expect(faces.has('STF_OUCH_40')).toBe(true);
    expect(faces.has('STF_GRIN_20')).toBe(true);
    expect(faces.has('STF_DEAD')).toBe(true);
    expect(faces.has('STF_GODMODE')).toBe(true);

    const face100 = faces.get('STF_STRAIGHT_100')!;
    expect(face100.width).toBe(24);
    expect(face100.height).toBe(29);
    expect(face100.pixels.length).toBe(24 * 29);
  });

  it('should generate sprites for weapons, enemies, pickups, and projectiles', () => {
    const sprites = SpriteBuilder.generateAllSprites();
    // Weapons
    expect(sprites.has('WEAPON_PISTOL_IDLE')).toBe(true);
    expect(sprites.has('WEAPON_SHOTGUN_FIRE')).toBe(true);
    expect(sprites.has('WEAPON_SSG_IDLE')).toBe(true);
    expect(sprites.has('WEAPON_CHAINGUN_FIRE')).toBe(true);
    expect(sprites.has('WEAPON_BFG_IDLE')).toBe(true);

    // Monsters
    expect(sprites.has('MONSTER_IMP_WALK_1')).toBe(true);
    expect(sprites.has('MONSTER_ZOMBIE_ATTACK')).toBe(true);
    expect(sprites.has('MONSTER_PINKY_WALK_1')).toBe(true);
    expect(sprites.has('MONSTER_CACO_FLOAT_1')).toBe(true);
    expect(sprites.has('MONSTER_BARON_WALK_1')).toBe(true);

    // Projectiles & Pickups
    expect(sprites.has('PROJ_IMP_FIREBALL')).toBe(true);
    expect(sprites.has('PROJ_ROCKET')).toBe(true);
    expect(sprites.has('PROJ_BFG_ORB')).toBe(true);
    expect(sprites.has('PICKUP_MEDIKIT')).toBe(true);
    expect(sprites.has('KEY_BLUE')).toBe(true);
  });

  it('should initialize the master AssetGenerator singleton cache seamlessly', () => {
    const gen = AssetGenerator.get();
    expect(gen).toBeDefined();
    expect(gen.getTexture('STARG1')).toBeDefined();
    expect(gen.getSprite('WEAPON_SHOTGUN_IDLE')).toBeDefined();
    expect(gen.getFace('STF_DEAD')).toBeDefined();
  });
});
