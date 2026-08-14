/**
 * Classic DOOM Status Bar (STBAR) Component
 * Renders Ammo, Health, Armor, Weapon Slots, Keycards, and Animated Doomguy Face.
 */

import { Player } from '../entities/Player';
import { DoomFace } from './DoomFace';

export class StatusBar {
  public doomFace: DoomFace;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;

  constructor() {
    this.doomFace = new DoomFace();
    if (typeof document !== 'undefined') {
      this.canvas = document.createElement('canvas');
      this.canvas.width = 320;
      this.canvas.height = 32;
      this.ctx = this.canvas.getContext('2d');
    }
  }

  public update(delta: number): void {
    this.doomFace.update(delta);
  }

  public render(player: Player): HTMLCanvasElement | null {
    if (!this.canvas && typeof document !== 'undefined') {
      this.canvas = document.createElement('canvas');
      this.canvas.width = 320;
      this.canvas.height = 32;
      this.ctx = this.canvas.getContext('2d');
    }
    if (!this.canvas || !this.ctx) return null;

    const ctx = this.ctx;
    ctx.imageSmoothingEnabled = false;

    // 1. STBAR Metallic Bevel Background
    ctx.fillStyle = '#222226';
    ctx.fillRect(0, 0, 320, 32);

    // Bevel borders
    ctx.fillStyle = '#3a3a42';
    ctx.fillRect(0, 0, 320, 2);
    ctx.fillRect(0, 0, 2, 32);
    ctx.fillStyle = '#111114';
    ctx.fillRect(0, 30, 320, 2);
    ctx.fillRect(318, 0, 2, 32);

    // Inset panel cutouts
    this.drawPanel(ctx, 4, 3, 40, 26); // Ammo
    this.drawPanel(ctx, 48, 3, 58, 26); // Health
    this.drawPanel(ctx, 110, 3, 46, 26); // Arms
    this.drawPanel(ctx, 160, 3, 30, 26); // Doomguy Face
    this.drawPanel(ctx, 194, 3, 58, 26); // Armor
    this.drawPanel(ctx, 256, 3, 14, 26); // Keycards
    this.drawPanel(ctx, 274, 3, 42, 26); // Ammo Table

    // 2. Labels & Numbers
    ctx.font = 'bold 8px monospace';
    ctx.fillStyle = '#b03020';
    ctx.fillText('AMMO', 8, 11);
    ctx.fillText('HEALTH', 52, 11);
    ctx.fillText('ARMS', 114, 11);
    ctx.fillText('ARMOR', 198, 11);

    // Ammo Count
    ctx.font = 'bold 13px monospace';
    ctx.fillStyle = '#e0c030';
    const curAmmo = player.currentWeapon.ammoType === 'NONE' ? '--' : player.ammo[player.currentWeapon.ammoType].toString();
    ctx.fillText(curAmmo, 10, 25);

    // Health %
    ctx.fillStyle = player.health <= 25 ? '#ff2020' : '#e0c030';
    ctx.fillText(`${Math.ceil(player.health)}%`, 54, 25);

    // Armor %
    ctx.fillStyle = player.armorType === 'BLUE' ? '#40a0ff' : '#e0c030';
    ctx.fillText(`${Math.ceil(player.armor)}%`, 200, 25);

    // Arms Weapon Indicators (1 2 3 4 5 6 7)
    ctx.font = 'bold 7px monospace';
    const slots = [2, 3, 4, 5, 6, 7];
    slots.forEach((s, idx) => {
      const col = idx % 3;
      const row = Math.floor(idx / 3);
      const px = 114 + col * 12;
      const py = 19 + row * 8;

      const hasWeapon = Array.from(player.inventoryWeapons).some((wId) => player.currentWeapon.slot === s || s <= 3 || wId === player.currentWeapon.id);
      ctx.fillStyle = hasWeapon ? '#e0c030' : '#44444c';
      ctx.fillText(s.toString(), px, py);
    });

    // Keycard Badges (Blue, Red, Yellow)
    if (player.hasBlueKey) {
      ctx.fillStyle = '#3080ff';
      ctx.fillRect(258, 6, 10, 6);
    }
    if (player.hasRedKey) {
      ctx.fillStyle = '#ff3030';
      ctx.fillRect(258, 14, 10, 6);
    }
    if (player.hasYellowKey) {
      ctx.fillStyle = '#ffe030';
      ctx.fillRect(258, 22, 10, 6);
    }

    // Ammo Table (Bullets, Shells, Rockets, Cells)
    ctx.font = '6px monospace';
    ctx.fillStyle = '#aaaaaa';
    ctx.fillText(`B:${player.ammo.BULLETS}/${player.maxAmmo.BULLETS}`, 276, 9);
    ctx.fillText(`S:${player.ammo.SHELLS}/${player.maxAmmo.SHELLS}`, 276, 16);
    ctx.fillText(`R:${player.ammo.ROCKETS}/${player.maxAmmo.ROCKETS}`, 276, 23);
    ctx.fillText(`C:${player.ammo.CELLS}/${player.maxAmmo.CELLS}`, 276, 30);

    // 3. Render Doomguy Face in center frame
    const faceTex = this.doomFace.getCurrentFace(player);
    if (faceTex && typeof document !== 'undefined') {
      const faceCanvas = document.createElement('canvas');
      faceCanvas.width = faceTex.width;
      faceCanvas.height = faceTex.height;
      const fctx = faceCanvas.getContext('2d');
      if (fctx) {
        const imgData = fctx.createImageData(faceTex.width, faceTex.height);
        const u32 = new Uint32Array(imgData.data.buffer);
        u32.set(faceTex.pixels);
        fctx.putImageData(imgData, 0, 0);
        ctx.drawImage(faceCanvas, 163, 4, 24, 24);
      }
    }

    return this.canvas;
  }

  private drawPanel(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
    ctx.fillStyle = '#101014';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = '#08080a';
    ctx.fillRect(x, y, w, 1);
    ctx.fillRect(x, y, 1, h);
    ctx.fillStyle = '#303038';
    ctx.fillRect(x, y + h - 1, w, 1);
    ctx.fillRect(x + w - 1, y, 1, h);
  }
}
