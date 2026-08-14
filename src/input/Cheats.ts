/**
 * Classic DOOM Cheat Code Parser
 * Listens for iconic keystroke sequences: IDDQD, IDKFA, IDCLIP, IDBEHOLDS, IDDT, IDFA.
 */

import { Player } from '../entities/Player';
import { Automap } from '../ui/Automap';
import { Arsenal, WeaponId } from '../weapons/Arsenal';

export class Cheats {
  private buffer: string = '';
  private maxBufferLen: number = 10;

  public handleKeyPress(
    key: string,
    player: Player,
    automap: Automap,
    onCheatTriggered: (msg: string) => void
  ): boolean {
    if (key.length !== 1) return false;

    this.buffer += key.toUpperCase();
    if (this.buffer.length > this.maxBufferLen) {
      this.buffer = this.buffer.slice(this.buffer.length - this.maxBufferLen);
    }

    // IDDQD: God Mode
    if (this.buffer.endsWith('IDDQD')) {
      player.isGodMode = !player.isGodMode;
      player.health = 100;
      onCheatTriggered(player.isGodMode ? 'DEGREELESSNESS MODE ON (GOD MODE)' : 'DEGREELESSNESS MODE OFF');
      return true;
    }

    // IDKFA: Very Happy Ammo (All Weapons, Keys & Ammo)
    if (this.buffer.endsWith('IDKFA')) {
      player.hasBlueKey = true;
      player.hasRedKey = true;
      player.hasYellowKey = true;
      Object.keys(Arsenal.WEAPONS).forEach((wId) => player.inventoryWeapons.add(wId as WeaponId));
      player.ammo.BULLETS = player.maxAmmo.BULLETS;
      player.ammo.SHELLS = player.maxAmmo.SHELLS;
      player.ammo.ROCKETS = player.maxAmmo.ROCKETS;
      player.ammo.CELLS = player.maxAmmo.CELLS;
      player.armor = 200;
      player.armorType = 'BLUE';
      onCheatTriggered('VERY HAPPY AMMO ADDED (ALL WEAPONS & KEYS)');
      return true;
    }

    // IDFA: Full Ammo & Weapons without keys
    if (this.buffer.endsWith('IDFA')) {
      Object.keys(Arsenal.WEAPONS).forEach((wId) => player.inventoryWeapons.add(wId as WeaponId));
      player.ammo.BULLETS = player.maxAmmo.BULLETS;
      player.ammo.SHELLS = player.maxAmmo.SHELLS;
      player.ammo.ROCKETS = player.maxAmmo.ROCKETS;
      player.ammo.CELLS = player.maxAmmo.CELLS;
      player.armor = 200;
      player.armorType = 'BLUE';
      onCheatTriggered('FULL AMMO ADDED');
      return true;
    }

    // IDCLIP: No-Clip
    if (this.buffer.endsWith('IDCLIP') || this.buffer.endsWith('IDSPISPOPD')) {
      player.isNoClip = !player.isNoClip;
      onCheatTriggered(player.isNoClip ? 'NO CLIPPING MODE ON' : 'NO CLIPPING MODE OFF');
      return true;
    }

    // IDBEHOLDS: Berserk Fury
    if (this.buffer.endsWith('IDBEHOLDS')) {
      player.isBerserk = !player.isBerserk;
      onCheatTriggered(player.isBerserk ? 'BERSERK STRENGTH ACTIVATED!' : 'BERSERK DEACTIVATED');
      return true;
    }

    // IDDT: Automap Reveal
    if (this.buffer.endsWith('IDDT')) {
      automap.showAll = !automap.showAll;
      onCheatTriggered(automap.showAll ? 'FULL AUTOMAP REVEALED' : 'NORMAL AUTOMAP RESTORED');
      return true;
    }

    return false;
  }
}
