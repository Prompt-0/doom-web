import { describe, it, expect } from 'vitest';
import { Cheats } from '../src/input/Cheats';
import { Player } from '../src/entities/Player';
import { Automap } from '../src/ui/Automap';

describe('DOOM Classic Cheat Codes', () => {
  it('should activate IDDQD God Mode on sequence typing', () => {
    const cheats = new Cheats();
    const player = new Player(3.5, 3.5);
    const automap = new Automap();
    let msg = '';

    const keys = ['i', 'd', 'd', 'q', 'd'];
    keys.forEach((k) => cheats.handleKeyPress(k, player, automap, (m) => (msg = m)));

    expect(player.isGodMode).toBe(true);
    expect(msg).toContain('DEGREELESSNESS MODE ON');
  });

  it('should activate IDKFA full ammo, weapons, and keycards', () => {
    const cheats = new Cheats();
    const player = new Player(3.5, 3.5);
    const automap = new Automap();

    const keys = ['i', 'd', 'k', 'f', 'a'];
    keys.forEach((k) => cheats.handleKeyPress(k, player, automap, () => {}));

    expect(player.hasBlueKey).toBe(true);
    expect(player.hasRedKey).toBe(true);
    expect(player.hasYellowKey).toBe(true);
    expect(player.inventoryWeapons.has('BFG_9000')).toBe(true);
    expect(player.ammo.BULLETS).toBe(player.maxAmmo.BULLETS);
    expect(player.ammo.CELLS).toBe(player.maxAmmo.CELLS);
    expect(player.armor).toBe(200);
  });

  it('should toggle IDCLIP no-clipping mode', () => {
    const cheats = new Cheats();
    const player = new Player(3.5, 3.5);
    const automap = new Automap();

    const keys = ['i', 'd', 'c', 'l', 'i', 'p'];
    keys.forEach((k) => cheats.handleKeyPress(k, player, automap, () => {}));

    expect(player.isNoClip).toBe(true);
  });
});
