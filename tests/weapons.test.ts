import { describe, it, expect } from 'vitest';
import { Arsenal } from '../src/weapons/Arsenal';
import { Player } from '../src/entities/Player';

describe('Weapons & Arsenal Mechanics', () => {
  it('should define all 9 iconic DOOM weapons with valid stats', () => {
    expect(Arsenal.WEAPONS.FIST).toBeDefined();
    expect(Arsenal.WEAPONS.CHAINSAW).toBeDefined();
    expect(Arsenal.WEAPONS.PISTOL).toBeDefined();
    expect(Arsenal.WEAPONS.SHOTGUN).toBeDefined();
    expect(Arsenal.WEAPONS.SUPER_SHOTGUN).toBeDefined();
    expect(Arsenal.WEAPONS.CHAINGUN).toBeDefined();
    expect(Arsenal.WEAPONS.ROCKET_LAUNCHER).toBeDefined();
    expect(Arsenal.WEAPONS.PLASMA_RIFLE).toBeDefined();
    expect(Arsenal.WEAPONS.BFG_9000).toBeDefined();

    expect(Arsenal.WEAPONS.BFG_9000.ammoCost).toBe(40);
    expect(Arsenal.WEAPONS.SHOTGUN.ammoCost).toBe(1);
    expect(Arsenal.WEAPONS.SUPER_SHOTGUN.ammoCost).toBe(2);
  });

  it('should handle player inventory, ammo additions, and armor absorption', () => {
    const player = new Player(3.5, 3.5);

    // Initial state
    expect(player.health).toBe(100);
    expect(player.inventoryWeapons.has('PISTOL')).toBe(true);
    expect(player.inventoryWeapons.has('FIST')).toBe(true);
    expect(player.inventoryWeapons.has('BFG_9000')).toBe(false);

    // Add BFG
    const isNew = player.addWeapon('BFG_9000');
    expect(isNew).toBe(true);
    expect(player.inventoryWeapons.has('BFG_9000')).toBe(true);
    expect(player.currentWeapon.id).toBe('BFG_9000');

    // Add Ammo
    player.addAmmo('CELLS', 80);
    expect(player.ammo.CELLS).toBe(80);

    // Armor absorption
    player.addArmor(100, 'BLUE');
    expect(player.armor).toBe(100);
    expect(player.armorType).toBe('BLUE');

    // Take 40 damage: Blue armor absorbs 50% = 20, health takes 20
    player.takeDamage(40);
    expect(player.armor).toBe(80);
    expect(player.health).toBe(80);
  });
});
