/**
 * GameMap Grid Representation & Dynamic Sector Manager
 */

import { Sector, DoorSector, KeyType } from './Sector';

export interface MapDataConfig {
  name: string;
  width: number;
  height: number;
  walls: (string | null)[][]; // Matrix of wall texture names or null
  sectors: Sector[][]; // Matrix of sector references
  doors: DoorSector[];
  playerSpawn: { x: number; y: number; angle: number };
  monsterSpawns: { type: string; x: number; y: number }[];
  itemSpawns: { type: string; x: number; y: number }[];
  skyTexture: string;
}

export class GameMap {
  public name: string;
  public readonly width: number;
  public readonly height: number;
  public walls: (string | null)[][];
  public sectors: Sector[][];
  public doors: Map<string, DoorSector> = new Map();
  public doorList: DoorSector[] = [];
  public playerSpawn: { x: number; y: number; angle: number };
  public monsterSpawns: { type: string; x: number; y: number }[];
  public itemSpawns: { type: string; x: number; y: number }[];
  public skyTexture: string;
  public discovered: boolean[][]; // For Automap rendering

  constructor(config: MapDataConfig) {
    this.name = config.name;
    this.width = config.width;
    this.height = config.height;
    this.walls = config.walls;
    this.sectors = config.sectors;
    this.playerSpawn = config.playerSpawn;
    this.monsterSpawns = config.monsterSpawns;
    this.itemSpawns = config.itemSpawns;
    this.skyTexture = config.skyTexture || 'SKY1';

    // Register doors
    this.doorList = config.doors;
    config.doors.forEach((door) => {
      this.doors.set(`${door.mapX},${door.mapY}`, door);
    });

    // Initialize discovery grid for Automap
    this.discovered = Array.from({ length: this.height }, () =>
      Array.from({ length: this.width }, () => false)
    );
  }

  public isSolid(x: number, y: number): boolean {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return true;
    const wall = this.walls[y][x];
    if (wall !== null) return true;

    const door = this.doors.get(`${x},${y}`);
    if (door && !door.isWalkable()) return true;

    return false;
  }

  public getWall(x: number, y: number): string | null {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return 'STARG1';
    const door = this.doors.get(`${x},${y}`);
    if (door) {
      return door.wallTex;
    }
    return this.walls[y][x];
  }

  public getDoor(x: number, y: number): DoorSector | null {
    return this.doors.get(`${x},${y}`) || null;
  }

  public getSector(x: number, y: number): Sector {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return new Sector({
        id: 0,
        floorHeight: 0,
        ceilingHeight: 1,
        floorTex: 'FLAT14',
        ceilTex: 'CEIL5_1',
        lightLevel: 1.0,
        type: 'normal'
      });
    }
    return this.sectors[y][x];
  }

  public markDiscovered(x: number, y: number): void {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      this.discovered[y][x] = true;
    }
  }

  public update(delta: number): void {
    this.doorList.forEach((door) => door.update(delta));
  }

  /**
   * Activates use on a target grid cell (Open door, push button, flip exit switch)
   */
  public interact(
    x: number,
    y: number,
    hasKeyFn: (key: KeyType) => boolean
  ): { success: boolean; message?: string; isExit?: boolean } {
    const door = this.doors.get(`${x},${y}`);
    if (door) {
      return door.activate(hasKeyFn);
    }

    const sec = this.getSector(x, y);
    if (sec.type === 'exit') {
      return { success: true, message: 'ENTERING TELEPORTER / LEVEL COMPLETE', isExit: true };
    }

    return { success: false };
  }
}
