/**
 * DOOM Episode 1: Knee-Deep in the Dead Level Definitions
 * Faithfully constructs E1M1 (Hangar), E1M2 (Nuclear Plant), and E1M8 (Phobos Anomaly).
 */

import { GameMap } from './Map';
import { Sector, DoorSector } from './Sector';

export class Levels {
  /**
   * Generates E1M1: Hangar
   */
  public static getE1M1(): GameMap {
    const w = 24, h = 24;
    const walls: (string | null)[][] = Array.from({ length: h }, () => Array.from({ length: w }, () => null));
    const sectors: Sector[][] = Array.from({ length: h }, () => Array.from({ length: w }, () => null as any));
    const doors: DoorSector[] = [];

    // Default sector
    const defaultSec = new Sector({ id: 1, floorHeight: 0, ceilingHeight: 1, floorTex: 'FLAT14', ceilTex: 'CEIL5_1', lightLevel: 0.9, type: 'normal' });
    const nukageSec = new Sector({ id: 2, floorHeight: -0.2, ceilingHeight: 1, floorTex: 'NUKAGE', ceilTex: 'CEIL5_1', lightLevel: 0.8, type: 'hazard_nukage' });
    const darkSec = new Sector({ id: 3, floorHeight: 0, ceilingHeight: 1, floorTex: 'FLOOR01', ceilTex: 'CEIL5_1', lightLevel: 0.6, type: 'flicker' });
    const exitSec = new Sector({ id: 4, floorHeight: 0, ceilingHeight: 1, floorTex: 'FLAT14', ceilTex: 'CEIL5_1', lightLevel: 1.0, type: 'exit' });

    // Outer perimeter walls
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        sectors[y][x] = defaultSec;
        if (x === 0 || x === w - 1 || y === 0 || y === h - 1) {
          walls[y][x] = 'STARG1';
        }
      }
    }

    // Room 1: Starting Hangar Area (x: 2..8, y: 2..8)
    for (let x = 2; x <= 8; x++) {
      walls[8][x] = 'TEKGREN';
    }
    for (let y = 2; y <= 8; y++) {
      walls[y][8] = 'TEKGREN';
    }
    // Armor pillar in center of starting room
    walls[5][5] = 'COMP01';

    // Door 1 to Corridor (x: 8, y: 5)
    walls[5][8] = null;
    doors.push(new DoorSector(8, 5, 'DOOR3', 'NONE'));

    // Corridor & Zigzag Nukage Hallway (x: 9..18, y: 3..11)
    for (let x = 9; x <= 18; x++) {
      walls[3][x] = 'STARG1';
      walls[11][x] = 'STARG1';
    }
    for (let y = 3; y <= 11; y++) {
      walls[y][18] = 'STARG1';
    }

    // Nukage hazard pool in hallway
    for (let y = 6; y <= 9; y++) {
      for (let x = 11; x <= 16; x++) {
        sectors[y][x] = nukageSec;
      }
    }

    // Zigzag safe walkway over nukage (x: 11..16)
    sectors[7][11] = defaultSec;
    sectors[7][12] = defaultSec;
    sectors[8][12] = defaultSec;
    sectors[8][13] = defaultSec;
    sectors[8][14] = defaultSec;
    sectors[7][14] = defaultSec;
    sectors[7][15] = defaultSec;
    sectors[7][16] = defaultSec;

    // Secret courtyard window wall
    walls[4][14] = 'METAL1';

    // Door 2: Blue Key Door to Exit Area (x: 18, y: 7)
    walls[7][18] = null;
    doors.push(new DoorSector(18, 7, 'KEYDOOR_B', 'BLUE'));

    // Room 3: Blue Keycard Alcove (x: 11..16, y: 12..16)
    for (let x = 11; x <= 16; x++) walls[16][x] = 'BRICK01';
    for (let y = 12; y <= 16; y++) walls[y][11] = 'BRICK01';
    walls[12][14] = null; // Entry to blue key alcove

    // Room 4: Exit Room (x: 19..22, y: 5..9)
    for (let y = 5; y <= 9; y++) {
      for (let x = 19; x <= 22; x++) {
        sectors[y][x] = darkSec;
      }
    }
    // Teleporter exit pad
    sectors[7][21] = exitSec;

    return new GameMap({
      name: 'E1M1: Hangar',
      width: w,
      height: h,
      walls,
      sectors,
      doors,
      playerSpawn: { x: 3.5, y: 3.5, angle: 0 },
      monsterSpawns: [
        { type: 'zombie', x: 6.5, y: 6.5 },
        { type: 'zombie', x: 10.5, y: 5.5 },
        { type: 'imp', x: 14.5, y: 5.5 },
        { type: 'shotgunner', x: 17.0, y: 9.0 },
        { type: 'zombie', x: 13.5, y: 14.5 },
        { type: 'imp', x: 20.5, y: 6.5 },
      ],
      itemSpawns: [
        { type: 'PICKUP_ARMOR_GREEN', x: 5.5, y: 6.5 },
        { type: 'PICKUP_SHOTGUN', x: 10.5, y: 4.0 },
        { type: 'PICKUP_SHELLS', x: 10.5, y: 4.5 },
        { type: 'KEY_BLUE', x: 14.5, y: 14.5 },
        { type: 'PICKUP_MEDIKIT', x: 16.5, y: 14.5 },
        { type: 'PICKUP_CLIP', x: 4.5, y: 3.5 },
        { type: 'PICKUP_POTION', x: 7.0, y: 3.5 },
        { type: 'PICKUP_POTION', x: 7.5, y: 3.5 },
        { type: 'PICKUP_BERSERK', x: 17.5, y: 4.0 },
      ],
      skyTexture: 'SKY1'
    });
  }

  /**
   * Generates E1M2: Nuclear Plant
   */
  public static getE1M2(): GameMap {
    const w = 24, h = 24;
    const walls: (string | null)[][] = Array.from({ length: h }, () => Array.from({ length: w }, () => null));
    const sectors: Sector[][] = Array.from({ length: h }, () => Array.from({ length: w }, () => null as any));
    const doors: DoorSector[] = [];

    const normSec = new Sector({ id: 1, floorHeight: 0, ceilingHeight: 1, floorTex: 'FLOOR01', ceilTex: 'CEIL5_1', lightLevel: 0.85, type: 'normal' });
    const strobeSec = new Sector({ id: 2, floorHeight: 0, ceilingHeight: 1, floorTex: 'FLAT14', ceilTex: 'CEIL5_1', lightLevel: 0.9, type: 'strobe_fast' });
    const nukageSec = new Sector({ id: 3, floorHeight: -0.2, ceilingHeight: 1, floorTex: 'NUKAGE', ceilTex: 'CEIL5_1', lightLevel: 0.7, type: 'hazard_nukage' });
    const exitSec = new Sector({ id: 4, floorHeight: 0, ceilingHeight: 1, floorTex: 'FLAT14', ceilTex: 'CEIL5_1', lightLevel: 1.0, type: 'exit' });

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        sectors[y][x] = normSec;
        if (x === 0 || x === w - 1 || y === 0 || y === h - 1) {
          walls[y][x] = 'METAL1';
        }
      }
    }

    // Computer Core Maze
    for (let y = 3; y <= 10; y++) {
      walls[y][6] = 'COMP01';
      walls[y][12] = 'COMP02';
      sectors[y][7] = strobeSec;
      sectors[y][11] = strobeSec;
    }
    walls[6][6] = null; // Walkway
    walls[7][12] = null; // Walkway

    // Red Keycard Door
    walls[14][10] = null;
    doors.push(new DoorSector(10, 14, 'KEYDOOR_R', 'RED'));

    // Acid vats in south zone
    for (let y = 15; y <= 20; y++) {
      for (let x = 4; x <= 18; x++) {
        sectors[y][x] = nukageSec;
      }
    }
    // Safe bridge across acid
    for (let y = 15; y <= 20; y++) {
      sectors[y][10] = normSec;
    }

    // Exit alcove
    sectors[21][10] = exitSec;

    return new GameMap({
      name: 'E1M2: Nuclear Plant',
      width: w,
      height: h,
      walls,
      sectors,
      doors,
      playerSpawn: { x: 3.5, y: 3.5, angle: 0 },
      monsterSpawns: [
        { type: 'imp', x: 8.5, y: 4.5 },
        { type: 'imp', x: 9.5, y: 8.5 },
        { type: 'pinky', x: 15.5, y: 6.5 },
        { type: 'shotgunner', x: 14.5, y: 11.5 },
        { type: 'caco', x: 10.5, y: 17.5 },
        { type: 'imp', x: 6.5, y: 18.5 },
      ],
      itemSpawns: [
        { type: 'PICKUP_CHAINGUN', x: 15.5, y: 4.0 },
        { type: 'PICKUP_CLIP', x: 15.5, y: 4.5 },
        { type: 'KEY_RED', x: 15.5, y: 10.5 },
        { type: 'PICKUP_MEDIKIT', x: 3.5, y: 10.5 },
        { type: 'PICKUP_ARMOR_BLUE', x: 10.5, y: 19.5 },
      ],
      skyTexture: 'SKY1'
    });
  }

  /**
   * Generates E1M8: Phobos Anomaly (Boss Arena)
   */
  public static getE1M8(): GameMap {
    const w = 24, h = 24;
    const walls: (string | null)[][] = Array.from({ length: h }, () => Array.from({ length: w }, () => null));
    const sectors: Sector[][] = Array.from({ length: h }, () => Array.from({ length: w }, () => null as any));
    const doors: DoorSector[] = [];

    const normSec = new Sector({ id: 1, floorHeight: 0, ceilingHeight: 1, floorTex: 'STONE2', ceilTex: 'CEIL5_1', lightLevel: 0.9, type: 'normal' });
    const lavaSec = new Sector({ id: 2, floorHeight: -0.2, ceilingHeight: 1, floorTex: 'LAVA', ceilTex: 'CEIL5_1', lightLevel: 1.0, type: 'hazard_lava' });
    const exitSec = new Sector({ id: 3, floorHeight: 0, ceilingHeight: 1, floorTex: 'FLAT14', ceilTex: 'CEIL5_1', lightLevel: 1.0, type: 'exit' });

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        sectors[y][x] = lavaSec; // Molten lava surrounds the central fortress
        if (x === 0 || x === w - 1 || y === 0 || y === h - 1) {
          walls[y][x] = 'BRICK01';
        }
      }
    }

    // Central Star-Shaped Platform (x: 5..19, y: 5..19)
    for (let y = 5; y <= 19; y++) {
      for (let x = 5; x <= 19; x++) {
        sectors[y][x] = normSec;
      }
    }

    // Gothic Stone Pillars
    walls[8][8] = 'STONE2';
    walls[8][16] = 'STONE2';
    walls[16][8] = 'STONE2';
    walls[16][16] = 'STONE2';

    // Gate door to boss chamber
    walls[5][12] = null;
    doors.push(new DoorSector(12, 5, 'DOOR3', 'NONE'));

    // Victory Exit Portal at top
    sectors[3][12] = exitSec;

    return new GameMap({
      name: 'E1M8: Phobos Anomaly',
      width: w,
      height: h,
      walls,
      sectors,
      doors,
      playerSpawn: { x: 12.0, y: 18.0, angle: -Math.PI / 2 },
      monsterSpawns: [
        { type: 'baron', x: 9.5, y: 10.5 },
        { type: 'baron', x: 14.5, y: 10.5 },
        { type: 'caco', x: 12.0, y: 8.5 },
        { type: 'pinky', x: 7.5, y: 14.5 },
        { type: 'pinky', x: 16.5, y: 14.5 },
      ],
      itemSpawns: [
        { type: 'PICKUP_ROCKET_LAUNCHER', x: 12.0, y: 16.0 },
        { type: 'PICKUP_PLASMA_RIFLE', x: 10.0, y: 16.0 },
        { type: 'PICKUP_BFG', x: 14.0, y: 16.0 },
        { type: 'PICKUP_ROCKET', x: 11.0, y: 17.0 },
        { type: 'PICKUP_CELL', x: 13.0, y: 17.0 },
        { type: 'PICKUP_MEDIKIT', x: 6.0, y: 18.0 },
        { type: 'PICKUP_MEDIKIT', x: 18.0, y: 18.0 },
        { type: 'PICKUP_ARMOR_BLUE', x: 12.0, y: 12.0 },
      ],
      skyTexture: 'SKY1'
    });
  }
}
