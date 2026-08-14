/**
 * Sector & Dynamic Sector Mechanisms (Doors, Lifts, Crushers, Hazards)
 */

export type SectorType = 'normal' | 'flicker' | 'strobe_fast' | 'strobe_slow' | 'pulse' | 'hazard_nukage' | 'hazard_lava' | 'exit';
export type KeyType = 'NONE' | 'BLUE' | 'RED' | 'YELLOW';
export type DoorState = 'CLOSED' | 'OPENING' | 'OPEN' | 'CLOSING';

export interface SectorConfig {
  id: number;
  floorHeight: number; // 0.0 standard
  ceilingHeight: number; // 1.0 standard
  floorTex: string;
  ceilTex: string;
  lightLevel: number; // 0.0 to 1.0
  type: SectorType;
  tag?: number;
}

export class Sector {
  public id: number;
  public floorHeight: number;
  public ceilingHeight: number;
  public floorTex: string;
  public ceilTex: string;
  public lightLevel: number;
  public type: SectorType;
  public tag: number;

  constructor(config: SectorConfig) {
    this.id = config.id;
    this.floorHeight = config.floorHeight;
    this.ceilingHeight = config.ceilingHeight;
    this.floorTex = config.floorTex;
    this.ceilTex = config.ceilTex;
    this.lightLevel = config.lightLevel;
    this.type = config.type;
    this.tag = config.tag || 0;
  }
}

export class DoorSector {
  public mapX: number;
  public mapY: number;
  public wallTex: string;
  public requiredKey: KeyType;
  public state: DoorState = 'CLOSED';
  public openProgress: number = 0.0; // 0.0 (closed) to 1.0 (fully open)
  public speed: number = 1.6; // Open speed per sec
  public waitTime: number = 3.5; // Auto-close delay in seconds
  public timer: number = 0;

  constructor(mapX: number, mapY: number, wallTex: string = 'DOOR3', requiredKey: KeyType = 'NONE') {
    this.mapX = mapX;
    this.mapY = mapY;
    this.wallTex = wallTex;
    this.requiredKey = requiredKey;
  }

  public activate(hasKeyCallback: (key: KeyType) => boolean): { success: boolean; message?: string } {
    if (this.requiredKey !== 'NONE' && !hasKeyCallback(this.requiredKey)) {
      return { success: false, message: `YOU NEED A ${this.requiredKey} KEY TO OPEN THIS DOOR!` };
    }

    if (this.state === 'CLOSED' || this.state === 'CLOSING') {
      this.state = 'OPENING';
      return { success: true, message: 'DOOR OPENING' };
    }
    return { success: false };
  }

  public update(delta: number): void {
    if (this.state === 'OPENING') {
      this.openProgress += this.speed * delta;
      if (this.openProgress >= 1.0) {
        this.openProgress = 1.0;
        this.state = 'OPEN';
        this.timer = this.waitTime;
      }
    } else if (this.state === 'OPEN') {
      this.timer -= delta;
      if (this.timer <= 0) {
        this.state = 'CLOSING';
      }
    } else if (this.state === 'CLOSING') {
      this.openProgress -= this.speed * delta;
      if (this.openProgress <= 0.0) {
        this.openProgress = 0.0;
        this.state = 'CLOSED';
      }
    }
  }

  public isWalkable(): boolean {
    return this.openProgress > 0.75;
  }
}
