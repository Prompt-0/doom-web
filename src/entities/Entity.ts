/**
 * Base Entity Class for DOOM
 */

export class Entity {
  public x: number;
  public y: number;
  public z: number;
  public vx: number = 0;
  public vy: number = 0;
  public vz: number = 0;
  public radius: number = 0.35;
  public height: number = 0.8;
  public isAlive: boolean = true;
  public spriteName: string;
  public scale: number = 1.0;
  public distanceToCamera: number = 0;

  constructor(x: number, y: number, spriteName: string, radius: number = 0.35) {
    this.x = x;
    this.y = y;
    this.z = 0;
    this.spriteName = spriteName;
    this.radius = radius;
  }

  public updateDistance(cameraX: number, cameraY: number): void {
    const dx = this.x - cameraX;
    const dy = this.y - cameraY;
    this.distanceToCamera = Math.sqrt(dx * dx + dy * dy);
  }
}
