/**
 * DOOM Lighting & Colormap Simulation
 * Implements diminishing sector lighting, distance fog, flickering and strobe light cycles.
 */

export class Lighting {
  public static readonly MIN_LIGHT: number = 0.15;
  public static readonly MAX_LIGHT: number = 1.0;
  public static readonly DIST_FACTOR: number = 0.08;

  /**
   * Calculates effective lighting factor (0.0 to 1.0) based on sector light level and ray distance.
   */
  public static calculateDistanceLight(sectorLight: number, distance: number): number {
    // DOOM style diminishing light formula
    const baseLight = Math.max(0.1, Math.min(1.0, sectorLight));
    const falloff = 1.0 / (1.0 + distance * this.DIST_FACTOR);
    return Math.max(this.MIN_LIGHT, Math.min(this.MAX_LIGHT, baseLight * falloff));
  }

  /**
   * Applies light multiplier directly to a 32-bit ABGR pixel value.
   */
  public static applyLight(pixel: number, light: number): number {
    if (light >= 0.99) return pixel;

    const a = (pixel >> 24) & 0xff;
    const b = (pixel >> 16) & 0xff;
    const g = (pixel >> 8) & 0xff;
    const r = pixel & 0xff;

    const nr = Math.floor(r * light);
    const ng = Math.floor(g * light);
    const nb = Math.floor(b * light);

    return (a << 24) | (nb << 16) | (ng << 8) | nr;
  }

  /**
   * Returns a dynamic light factor for special sector light effects (Flicker, Strobe, Pulse)
   */
  public static getSpecialLight(
    effect: 'normal' | 'flicker' | 'strobe_fast' | 'strobe_slow' | 'pulse' | 'glow',
    baseLight: number,
    time: number
  ): number {
    switch (effect) {
      case 'flicker': {
        const rnd = Math.sin(time * 25.0) * Math.cos(time * 43.0);
        return rnd > 0.3 ? baseLight : baseLight * 0.4;
      }
      case 'strobe_fast': {
        return (Math.floor(time * 8) % 2 === 0) ? baseLight : baseLight * 0.2;
      }
      case 'strobe_slow': {
        return (Math.floor(time * 2) % 2 === 0) ? baseLight : baseLight * 0.3;
      }
      case 'pulse': {
        const wave = 0.5 + 0.5 * Math.sin(time * 3.0);
        return baseLight * (0.5 + 0.5 * wave);
      }
      case 'glow': {
        const wave = 0.5 + 0.5 * Math.sin(time * 1.5);
        return baseLight * (0.7 + 0.3 * wave);
      }
      default:
        return baseLight;
    }
  }
}
