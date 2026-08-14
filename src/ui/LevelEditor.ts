/**
 * Interactive In-Engine 2D Level Editor & Custom Map Builder
 * Allows real-time tile drawing, monster/item placement, JSON export/import, and 1-click test play.
 */

import { GameMap } from '../world/Map';
import { Sector, DoorSector, KeyType } from '../world/Sector';

export type ToolType =
  | 'ERASE'
  | 'WALL_STARG1'
  | 'WALL_COMP01'
  | 'WALL_BRICK01'
  | 'WALL_STONE2'
  | 'WALL_METAL1'
  | 'WALL_TEKGREN'
  | 'DOOR'
  | 'KEYDOOR_RED'
  | 'KEYDOOR_BLUE'
  | 'KEYDOOR_YELLOW'
  | 'SECTOR_NUKAGE'
  | 'SECTOR_LAVA'
  | 'SECTOR_EXIT'
  | 'SPAWN_PLAYER'
  | 'SPAWN_ZOMBIE'
  | 'SPAWN_SHOTGUNNER'
  | 'SPAWN_IMP'
  | 'SPAWN_PINKY'
  | 'SPAWN_CACO'
  | 'SPAWN_BARON'
  | 'PICKUP_MEDIKIT'
  | 'PICKUP_SHOTGUN'
  | 'PICKUP_CHAINGUN'
  | 'PICKUP_ROCKET'
  | 'PICKUP_PLASMA'
  | 'PICKUP_BFG'
  | 'KEY_BLUE'
  | 'KEY_RED'
  | 'KEY_YELLOW';

export class LevelEditor {
  public isOpen: boolean = false;
  private width: number = 20;
  private height: number = 20;
  private walls: (string | null)[][];
  private sectorTypes: string[][];
  private doors: DoorSector[] = [];
  private playerSpawn: { x: number; y: number; angle: number } = { x: 2.5, y: 2.5, angle: 0 };
  private monsterSpawns: { type: string; x: number; y: number }[] = [];
  private itemSpawns: { type: string; x: number; y: number }[] = [];
  public currentTool: ToolType = 'WALL_STARG1';

  constructor() {
    this.walls = Array.from({ length: this.height }, () => Array.from({ length: this.width }, () => null));
    this.sectorTypes = Array.from({ length: this.height }, () => Array.from({ length: this.width }, () => 'normal'));

    // Create a perimeter room by default
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (x === 0 || x === this.width - 1 || y === 0 || y === this.height - 1) {
          this.walls[y][x] = 'STARG1';
        }
      }
    }
    this.monsterSpawns.push({ type: 'imp', x: 10.5, y: 10.5 });
    this.itemSpawns.push({ type: 'PICKUP_SHOTGUN', x: 5.5, y: 5.5 });
  }

  public applyTool(gridX: number, gridY: number): void {
    if (gridX < 0 || gridX >= this.width || gridY < 0 || gridY >= this.height) return;

    if (this.currentTool === 'ERASE') {
      this.walls[gridY][gridX] = null;
      this.sectorTypes[gridY][gridX] = 'normal';
      this.doors = this.doors.filter((d) => !(d.mapX === gridX && d.mapY === gridY));
      this.monsterSpawns = this.monsterSpawns.filter((m) => Math.floor(m.x) !== gridX || Math.floor(m.y) !== gridY);
      this.itemSpawns = this.itemSpawns.filter((i) => Math.floor(i.x) !== gridX || Math.floor(i.y) !== gridY);
    } else if (this.currentTool.startsWith('WALL_')) {
      const tex = this.currentTool.replace('WALL_', '');
      this.walls[gridY][gridX] = tex;
    } else if (this.currentTool === 'DOOR') {
      this.walls[gridY][gridX] = null;
      this.doors = this.doors.filter((d) => !(d.mapX === gridX && d.mapY === gridY));
      this.doors.push(new DoorSector(gridX, gridY, 'DOOR3', 'NONE'));
    } else if (this.currentTool.startsWith('KEYDOOR_')) {
      const key = this.currentTool.replace('KEYDOOR_', '') as KeyType;
      this.walls[gridY][gridX] = null;
      this.doors = this.doors.filter((d) => !(d.mapX === gridX && d.mapY === gridY));
      this.doors.push(new DoorSector(gridX, gridY, `KEYDOOR_${key[0]}`, key));
    } else if (this.currentTool.startsWith('SECTOR_')) {
      const secType = this.currentTool.replace('SECTOR_', '').toLowerCase();
      this.sectorTypes[gridY][gridX] = secType;
    } else if (this.currentTool === 'SPAWN_PLAYER') {
      this.playerSpawn = { x: gridX + 0.5, y: gridY + 0.5, angle: 0 };
    } else if (this.currentTool.startsWith('SPAWN_')) {
      const mType = this.currentTool.replace('SPAWN_', '').toLowerCase();
      this.monsterSpawns.push({ type: mType, x: gridX + 0.5, y: gridY + 0.5 });
    } else if (this.currentTool.startsWith('PICKUP_') || this.currentTool.startsWith('KEY_')) {
      this.itemSpawns.push({ type: this.currentTool, x: gridX + 0.5, y: gridY + 0.5 });
    }
  }

  public exportToGameMap(): GameMap {
    const sectors: Sector[][] = Array.from({ length: this.height }, (_, y) =>
      Array.from({ length: this.width }, (_, x) => {
        const sType = this.sectorTypes[y][x];
        let floorTex = 'FLAT14';
        let type: any = 'normal';

        if (sType === 'nukage') {
          floorTex = 'NUKAGE';
          type = 'hazard_nukage';
        } else if (sType === 'lava') {
          floorTex = 'LAVA';
          type = 'hazard_lava';
        } else if (sType === 'exit') {
          floorTex = 'FLAT14';
          type = 'exit';
        }

        return new Sector({
          id: y * this.width + x + 1,
          floorHeight: (type === 'hazard_nukage' || type === 'hazard_lava') ? -0.2 : 0,
          ceilingHeight: 1.0,
          floorTex,
          ceilTex: 'CEIL5_1',
          lightLevel: 0.9,
          type
        });
      })
    );

    return new GameMap({
      name: 'Custom User Level',
      width: this.width,
      height: this.height,
      walls: JSON.parse(JSON.stringify(this.walls)),
      sectors,
      doors: this.doors.map((d) => new DoorSector(d.mapX, d.mapY, d.wallTex, d.requiredKey)),
      playerSpawn: { ...this.playerSpawn },
      monsterSpawns: [...this.monsterSpawns],
      itemSpawns: [...this.itemSpawns],
      skyTexture: 'SKY1'
    });
  }

  public renderEditorCanvas(canvas: HTMLCanvasElement): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#141418';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const cellW = canvas.width / this.width;
    const cellH = canvas.height / this.height;

    // Grid lines
    ctx.strokeStyle = '#22222a';
    ctx.lineWidth = 1;
    for (let x = 0; x <= this.width; x++) {
      ctx.beginPath();
      ctx.moveTo(x * cellW, 0);
      ctx.lineTo(x * cellW, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y <= this.height; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * cellH);
      ctx.lineTo(canvas.width, y * cellH);
      ctx.stroke();
    }

    // Draw Sectors & Walls
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const sType = this.sectorTypes[y][x];
        const px = x * cellW;
        const py = y * cellH;

        if (sType === 'nukage') {
          ctx.fillStyle = '#155015';
          ctx.fillRect(px, py, cellW, cellH);
        } else if (sType === 'lava') {
          ctx.fillStyle = '#601515';
          ctx.fillRect(px, py, cellW, cellH);
        } else if (sType === 'exit') {
          ctx.fillStyle = '#208040';
          ctx.fillRect(px, py, cellW, cellH);
        }

        const wall = this.walls[y][x];
        if (wall) {
          ctx.fillStyle = '#777785';
          ctx.fillRect(px + 1, py + 1, cellW - 2, cellH - 2);
        }
      }
    }

    // Draw Doors
    this.doors.forEach((door) => {
      const px = door.mapX * cellW;
      const py = door.mapY * cellH;
      if (door.requiredKey === 'RED') ctx.fillStyle = '#ff2020';
      else if (door.requiredKey === 'BLUE') ctx.fillStyle = '#2080ff';
      else if (door.requiredKey === 'YELLOW') ctx.fillStyle = '#ffe020';
      else ctx.fillStyle = '#e08020';

      ctx.fillRect(px + 2, py + 2, cellW - 4, cellH - 4);
    });

    // Draw Player Spawn
    ctx.fillStyle = '#30ff30';
    ctx.beginPath();
    ctx.arc(this.playerSpawn.x * cellW, this.playerSpawn.y * cellH, cellW * 0.35, 0, Math.PI * 2);
    ctx.fill();

    // Draw Monsters
    this.monsterSpawns.forEach((m) => {
      ctx.fillStyle = '#ff4040';
      ctx.beginPath();
      ctx.arc(m.x * cellW, m.y * cellH, cellW * 0.3, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw Items
    this.itemSpawns.forEach((i) => {
      ctx.fillStyle = '#ffd030';
      ctx.fillRect(i.x * cellW - 3, i.y * cellH - 3, 6, 6);
    });
  }
}
