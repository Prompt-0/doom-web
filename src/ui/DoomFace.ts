/**
 * Dynamic Doomguy Face Controller
 * Manages look animations, damage grimaces, weapon smirks, and god mode.
 */

import { AssetGenerator } from '../assets/AssetGenerator';
import { TextureData } from '../assets/TextureBuilder';
import { Player } from '../entities/Player';

export class DoomFace {
  private assetGen: AssetGenerator;
  private lookDir: 'straight' | 'left' | 'right' = 'straight';
  private lookTimer: number = 2.0;
  private grinTimer: number = 0;
  private ouchTimer: number = 0;

  constructor() {
    this.assetGen = AssetGenerator.get();
  }

  public triggerGrin(): void {
    this.grinTimer = 1.4;
  }

  public triggerOuch(): void {
    this.ouchTimer = 0.5;
  }

  public update(delta: number): void {
    if (this.grinTimer > 0) this.grinTimer -= delta;
    if (this.ouchTimer > 0) this.ouchTimer -= delta;

    this.lookTimer -= delta;
    if (this.lookTimer <= 0) {
      // Pick random glance
      const rand = Math.random();
      if (rand < 0.6) this.lookDir = 'straight';
      else if (rand < 0.8) this.lookDir = 'left';
      else this.lookDir = 'right';

      this.lookTimer = 1.0 + Math.random() * 2.5;
    }
  }

  public getCurrentFace(player: Player): TextureData | undefined {
    if (player.health <= 0) {
      return this.assetGen.getFace('STF_DEAD');
    }

    if (player.isGodMode) {
      return this.assetGen.getFace('STF_GODMODE');
    }

    // Determine health bracket
    let tier = 100;
    if (player.health >= 80) tier = 100;
    else if (player.health >= 60) tier = 80;
    else if (player.health >= 40) tier = 60;
    else if (player.health >= 20) tier = 40;
    else tier = 20;

    if (this.ouchTimer > 0) {
      return this.assetGen.getFace(`STF_OUCH_${tier}`);
    }

    if (this.grinTimer > 0) {
      return this.assetGen.getFace(`STF_GRIN_${tier}`);
    }

    const dirStr = this.lookDir.toUpperCase();
    return this.assetGen.getFace(`STF_${dirStr}_${tier}`);
  }
}
