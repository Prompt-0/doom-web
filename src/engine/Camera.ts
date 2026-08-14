/**
 * Player 3D Camera System
 * Handles position, yaw direction, pitch tilt, field of view, and dynamic headbobbing.
 */

export class Camera {
  public x: number;
  public y: number;
  public angle: number; // In radians (0 to 2*PI)
  public pitch: number; // Vertical tilt in pixels (-60 to +60)
  public fov: number; // Field of View (e.g. 75 degrees = ~1.309 rad)
  public height: number; // Base eye level (0.5 = normal standing)
  public bobAmount: number = 0;
  public bobPhase: number = 0;

  constructor(x: number = 2.5, y: number = 2.5, angle: number = 0) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.pitch = 0;
    this.fov = (75 * Math.PI) / 180;
    this.height = 0.5;
  }

  public updateBob(speed: number, delta: number): void {
    if (speed > 0.01) {
      this.bobPhase += delta * 12.0;
      this.bobAmount = Math.sin(this.bobPhase) * 0.04;
    } else {
      this.bobAmount *= 0.85; // Decay smoothly to 0
    }
  }

  public rotate(deltaAngle: number): void {
    this.angle += deltaAngle;
    // Normalize to 0 .. 2*PI
    while (this.angle < 0) this.angle += Math.PI * 2;
    while (this.angle >= Math.PI * 2) this.angle -= Math.PI * 2;
  }

  public setPitch(deltaPitch: number): void {
    this.pitch = Math.max(-60, Math.min(60, this.pitch + deltaPitch));
  }

  public getDirX(): number {
    return Math.cos(this.angle);
  }

  public getDirY(): number {
    return Math.sin(this.angle);
  }

  public getPlaneX(): number {
    // Perpendicular camera plane vector scaled by FOV tangent
    return -Math.sin(this.angle) * Math.tan(this.fov / 2);
  }

  public getPlaneY(): number {
    return Math.cos(this.angle) * Math.tan(this.fov / 2);
  }
}
