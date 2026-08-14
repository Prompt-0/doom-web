/**
 * Vector Automap (TAB) Overlay
 * Renders discovered walls, doors, keys, player arrow, and cheat monster positions.
 */

import { GameMap } from '../world/Map';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';

export class Automap {
  public isVisible: boolean = false;
  public showAll: boolean = false; // IDDT cheat reveal
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;

  constructor() {
    if (typeof document !== 'undefined') {
      this.canvas = document.createElement('canvas');
      this.canvas.width = 320;
      this.canvas.height = 200;
      this.ctx = this.canvas.getContext('2d');
    }
  }

  public toggle(): void {
    this.isVisible = !this.isVisible;
  }

  public render(map: GameMap, player: Player, enemies: Enemy[]): HTMLCanvasElement | null {
    if (!this.canvas && typeof document !== 'undefined') {
      this.canvas = document.createElement('canvas');
      this.canvas.width = 320;
      this.canvas.height = 200;
      this.ctx = this.canvas.getContext('2d');
    }
    if (!this.canvas || !this.ctx) return null;

    const ctx = this.ctx;
    ctx.imageSmoothingEnabled = false;

    // Dark grid background
    ctx.fillStyle = '#0a0a0c';
    ctx.fillRect(0, 0, 320, 200);

    const tileSize = 7;
    const offsetX = Math.floor(160 - player.x * tileSize);
    const offsetY = Math.floor(100 - player.y * tileSize);

    // Draw Subtle Grid Lines
    ctx.strokeStyle = '#151518';
    ctx.lineWidth = 1;
    for (let x = 0; x < map.width; x++) {
      ctx.beginPath();
      ctx.moveTo(offsetX + x * tileSize, offsetY);
      ctx.lineTo(offsetX + x * tileSize, offsetY + map.height * tileSize);
      ctx.stroke();
    }
    for (let y = 0; y < map.height; y++) {
      ctx.beginPath();
      ctx.moveTo(offsetX, offsetY + y * tileSize);
      ctx.lineTo(offsetX + map.width * tileSize, offsetY + y * tileSize);
      ctx.stroke();
    }

    // Draw Walls & Doors
    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        const isDiscovered = map.discovered[y][x] || this.showAll;
        if (!isDiscovered) continue;

        const wall = map.getWall(x, y);
        const door = map.getDoor(x, y);

        const screenX = offsetX + x * tileSize;
        const screenY = offsetY + y * tileSize;

        if (door) {
          // Key door colors
          if (door.requiredKey === 'RED') ctx.fillStyle = '#ff3030';
          else if (door.requiredKey === 'BLUE') ctx.fillStyle = '#3080ff';
          else if (door.requiredKey === 'YELLOW') ctx.fillStyle = '#ffe030';
          else ctx.fillStyle = '#ff8020';

          ctx.fillRect(screenX, screenY, tileSize, tileSize);
        } else if (wall !== null) {
          ctx.fillStyle = '#777780';
          ctx.fillRect(screenX, screenY, tileSize, tileSize);
        } else {
          const sec = map.getSector(x, y);
          if (sec.type === 'hazard_nukage') {
            ctx.fillStyle = '#103010';
            ctx.fillRect(screenX, screenY, tileSize, tileSize);
          } else if (sec.type === 'hazard_lava') {
            ctx.fillStyle = '#301010';
            ctx.fillRect(screenX, screenY, tileSize, tileSize);
          } else if (sec.type === 'exit') {
            ctx.fillStyle = '#208040';
            ctx.fillRect(screenX, screenY, tileSize, tileSize);
          }
        }
      }
    }

    // Draw Enemy Markers (if IDDT cheat is enabled)
    if (this.showAll) {
      enemies.forEach((enemy) => {
        if (!enemy.isAlive) return;
        const ex = offsetX + enemy.x * tileSize;
        const ey = offsetY + enemy.y * tileSize;
        ctx.fillStyle = '#ff2020';
        ctx.beginPath();
        ctx.arc(ex, ey, 2.5, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // Draw Player Arrow in center
    const px = offsetX + player.x * tileSize;
    const py = offsetY + player.y * tileSize;
    const angle = player.camera.angle;

    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(angle);

    ctx.fillStyle = '#30ff30';
    ctx.beginPath();
    ctx.moveTo(6, 0);
    ctx.lineTo(-4, -4);
    ctx.lineTo(-2, 0);
    ctx.lineTo(-4, 4);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Map Header Label
    ctx.font = 'bold 9px monospace';
    ctx.fillStyle = '#e0c030';
    ctx.fillText(`${map.name} - AUTOMAP (TAB)`, 8, 14);

    return this.canvas;
  }
}
