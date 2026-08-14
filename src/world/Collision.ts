/**
 * Collision & Line of Sight System
 * Handles circle-AABB wall collision, sliding response, and grid raycasting line-of-sight checks.
 */

import { GameMap } from './Map';

export interface CollisionResult {
  x: number;
  y: number;
  collided: boolean;
}

export class Collision {
  /**
   * Checks if an entity with radius `r` at `(x, y)` collides with walls or closed doors.
   */
  public static checkCollision(
    newX: number,
    newY: number,
    radius: number,
    map: GameMap,
    isNoClip: boolean = false
  ): CollisionResult {
    if (isNoClip) {
      return { x: newX, y: newY, collided: false };
    }

    let resolvedX = newX;
    let resolvedY = newY;
    let collided = false;

    // Check bounds
    if (newX < radius || newX >= map.width - radius || newY < radius || newY >= map.height - radius) {
      return {
        x: Math.max(radius, Math.min(map.width - radius, newX)),
        y: Math.max(radius, Math.min(map.height - radius, newY)),
        collided: true,
      };
    }

    // Check grid cells overlapping the bounding circle
    const minX = Math.floor(newX - radius);
    const maxX = Math.floor(newX + radius);
    const minY = Math.floor(newY - radius);
    const maxY = Math.floor(newY + radius);

    for (let gx = minX; gx <= maxX; gx++) {
      for (let gy = minY; gy <= maxY; gy++) {
        if (map.isSolid(gx, gy)) {
          // If circle center is strictly inside the cell
          if (newX >= gx && newX <= gx + 1 && newY >= gy && newY <= gy + 1) {
            collided = true;
            const distLeft = newX - gx;
            const distRight = gx + 1 - newX;
            const distTop = newY - gy;
            const distBottom = gy + 1 - newY;
            const minDist = Math.min(distLeft, distRight, distTop, distBottom);

            if (minDist === distLeft) resolvedX = gx - radius;
            else if (minDist === distRight) resolvedX = gx + 1 + radius;
            else if (minDist === distTop) resolvedY = gy - radius;
            else resolvedY = gy + 1 + radius;
            continue;
          }

          // Nearest point on AABB to circle center
          const closestX = Math.max(gx, Math.min(newX, gx + 1));
          const closestY = Math.max(gy, Math.min(newY, gy + 1));

          const dx = newX - closestX;
          const dy = newY - closestY;
          const distSq = dx * dx + dy * dy;

          if (distSq < radius * radius && distSq > 0.00001) {
            collided = true;
            const dist = Math.sqrt(distSq);
            const overlap = radius - dist;
            resolvedX += (dx / dist) * overlap;
            resolvedY += (dy / dist) * overlap;
          }
        }
      }
    }

    return { x: resolvedX, y: resolvedY, collided };
  }

  /**
   * Fast DDA Raycast Line of Sight check between two points
   */
  public static hasLineOfSight(x0: number, y0: number, x1: number, y1: number, map: GameMap): boolean {
    let dx = x1 - x0;
    let dy = y1 - y0;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 0.001) return true;

    dx /= dist;
    dy /= dist;

    let currX = Math.floor(x0);
    let currY = Math.floor(y0);
    const targetX = Math.floor(x1);
    const targetY = Math.floor(y1);

    const stepX = dx >= 0 ? 1 : -1;
    const stepY = dy >= 0 ? 1 : -1;

    const deltaDistX = Math.abs(1 / (dx || 0.00001));
    const deltaDistY = Math.abs(1 / (dy || 0.00001));

    let sideDistX = dx >= 0 ? (currX + 1.0 - x0) * deltaDistX : (x0 - currX) * deltaDistX;
    let sideDistY = dy >= 0 ? (currY + 1.0 - y0) * deltaDistY : (y0 - currY) * deltaDistY;

    let steps = 0;
    while ((currX !== targetX || currY !== targetY) && steps < 100) {
      steps++;
      if (sideDistX < sideDistY) {
        sideDistX += deltaDistX;
        currX += stepX;
      } else {
        sideDistY += deltaDistY;
        currY += stepY;
      }

      if (map.isSolid(currX, currY)) {
        return false;
      }
    }

    return true;
  }
}
