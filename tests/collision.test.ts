import { describe, it, expect } from 'vitest';
import { Collision } from '../src/world/Collision';
import { Levels } from '../src/world/Levels';

describe('Collision & Line of Sight System', () => {
  const map = Levels.getE1M1();

  it('should detect wall collisions and resolve sliding positions', () => {
    // Starting spawn in open space
    const openRes = Collision.checkCollision(3.5, 3.5, 0.35, map);
    expect(openRes.collided).toBe(false);
    expect(openRes.x).toBeCloseTo(3.5);
    expect(openRes.y).toBeCloseTo(3.5);

    // Position directly overlapping the center armor pillar at (5, 5)
    const wallRes = Collision.checkCollision(5.1, 5.1, 0.35, map);
    expect(wallRes.collided).toBe(true);
  });

  it('should allow no-clip movement without collision resolution', () => {
    const noClipRes = Collision.checkCollision(0.1, 0.1, 0.35, map, true);
    expect(noClipRes.collided).toBe(false);
    expect(noClipRes.x).toBe(0.1);
    expect(noClipRes.y).toBe(0.1);
  });

  it('should calculate DDA raycast line of sight across open rooms', () => {
    // Line of sight in open room (3.5, 3.5) to (4.0, 4.0)
    const hasLOS = Collision.hasLineOfSight(3.5, 3.5, 4.0, 4.0, map);
    expect(hasLOS).toBe(true);

    // Line of sight blocked by wall at (5, 5)
    const blockedLOS = Collision.hasLineOfSight(3.5, 5.0, 6.5, 5.0, map);
    expect(blockedLOS).toBe(false);
  });
});
