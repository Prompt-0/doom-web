/**
 * Procedural Pixel-Art Texture Builder for DOOM Engine
 * Generates authentic 64x64 and 128x128 pixel textures for walls, flats, doors, liquids, and skies.
 */

export interface TextureData {
  name: string;
  width: number;
  height: number;
  pixels: Uint32Array; // ABGR (0xAABBGGRR) format for high-speed direct canvas/buffer blitting
}

// Helper to create ABGR 32-bit color
export function rgba(r: number, g: number, b: number, a: number = 255): number {
  return ((a & 0xff) << 24) | ((b & 0xff) << 16) | ((g & 0xff) << 8) | (r & 0xff);
}

// Pseudo-random deterministic noise
function hash(x: number, y: number, seed: number = 1337): number {
  let n = Math.sin(x * 12.9898 + y * 78.233 + seed * 43758.5453) * 43758.5453;
  return n - Math.floor(n);
}

export class TextureBuilder {
  /**
   * Generates all core textures for the engine
   */
  public static generateAll(): Map<string, TextureData> {
    const textures = new Map<string, TextureData>();

    textures.set('STARG1', this.buildStarg1(64, 64));
    textures.set('COMP01', this.buildComp01(64, 64));
    textures.set('COMP02', this.buildComp02(64, 64));
    textures.set('BRICK01', this.buildBrick01(64, 64));
    textures.set('STONE2', this.buildStone2(64, 64));
    textures.set('METAL1', this.buildMetal1(64, 64));
    textures.set('TEKGREN', this.buildTekgren(64, 64));
    textures.set('WOOD1', this.buildWood1(64, 64));
    textures.set('DOOR3', this.buildDoor3(64, 64));
    textures.set('KEYDOOR_R', this.buildKeyDoor(64, 64, 230, 30, 30));
    textures.set('KEYDOOR_B', this.buildKeyDoor(64, 64, 30, 100, 255));
    textures.set('KEYDOOR_Y', this.buildKeyDoor(64, 64, 255, 200, 20));
    textures.set('FLAT14', this.buildFlat14(64, 64));
    textures.set('FLOOR01', this.buildFloor01(64, 64));
    textures.set('CEIL5_1', this.buildCeil5_1(64, 64));
    textures.set('NUKAGE', this.buildNukage(64, 64, 0));
    textures.set('LAVA', this.buildLava(64, 64, 0));
    textures.set('SKY1', this.buildSky1(256, 128));

    return textures;
  }

  // STARG1: Classic grey sci-fi paneling with rivets and seams
  public static buildStarg1(w: number, h: number): TextureData {
    const pixels = new Uint32Array(w * h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const noise = hash(x, y, 42) * 16 - 8;
        let base = 120 + noise;

        // Bevel borders
        const isBorderX = x === 0 || x === w - 1 || x === Math.floor(w / 2);
        const isBorderY = y === 0 || y === h - 1 || y === Math.floor(h / 2);

        if (isBorderX || isBorderY) {
          base -= 50;
        } else if (x === 1 || y === 1 || x === Math.floor(w / 2) + 1 || y === Math.floor(h / 2) + 1) {
          base += 30;
        }

        // Rivets at intersections
        const isRivet =
          (x === 4 || x === w - 5 || x === Math.floor(w / 2) - 4 || x === Math.floor(w / 2) + 4) &&
          (y === 4 || y === h - 5 || y === Math.floor(h / 2) - 4 || y === Math.floor(h / 2) + 4);

        if (isRivet) {
          base = 40;
        } else if (
          (x === 5 || x === w - 4 || x === Math.floor(w / 2) - 3) &&
          (y === 5 || y === h - 4 || y === Math.floor(h / 2) - 3)
        ) {
          base += 60;
        }

        const c = Math.max(20, Math.min(240, Math.floor(base)));
        pixels[y * w + x] = rgba(c, c + 2, c + 5);
      }
    }
    return { name: 'STARG1', width: w, height: h, pixels };
  }

  // COMP01: Computer terminal with blinking monitors, data tapes, LEDs
  public static buildComp01(w: number, h: number): TextureData {
    const pixels = new Uint32Array(w * h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let r = 70, g = 75, b = 80;
        const noise = (hash(x, y, 99) - 0.5) * 10;
        r += noise; g += noise; b += noise;

        // Main CRT screen (top left)
        if (x >= 6 && x <= 32 && y >= 6 && y <= 28) {
          const isScreenEdge = x === 6 || x === 32 || y === 6 || y === 28;
          if (isScreenEdge) {
            r = 30; g = 30; b = 35;
          } else {
            // Glowing green phosphor terminal text lines
            const isTextLine = (y % 4 === 0) && (hash(x, y, 12) > 0.35);
            if (isTextLine) {
              r = 40; g = 255; b = 80;
            } else {
              r = 10; g = 40 + (y % 2) * 10; b = 20;
            }
          }
        }

        // Secondary Oscilloscope / Radar screen (top right)
        if (x >= 38 && x <= 58 && y >= 6 && y <= 28) {
          const isEdge = x === 38 || x === 58 || y === 6 || y === 28;
          if (isEdge) {
            r = 30; g = 30; b = 35;
          } else {
            const dx = x - 48, dy = y - 17;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (Math.abs(dist - 7) < 0.8 || Math.abs(dist - 3) < 0.8 || (dx === 0 || dy === 0)) {
              r = 60; g = 180; b = 255;
            } else {
              r = 10; g = 25; b = 45;
            }
          }
        }

        // Blinking LED matrix (bottom left)
        if (x >= 6 && x <= 32 && y >= 36 && y <= 56) {
          const gridX = Math.floor((x - 6) / 4);
          const gridY = Math.floor((y - 36) / 4);
          const isLed = ((x - 6) % 4 <= 2) && ((y - 36) % 4 <= 2);
          if (isLed) {
            const ledType = (gridX + gridY * 7) % 5;
            if (ledType === 0) { r = 255; g = 40; b = 40; } // Red
            else if (ledType === 1) { r = 40; g = 255; b = 60; } // Green
            else if (ledType === 2) { r = 255; g = 220; b = 30; } // Yellow
            else if (ledType === 3) { r = 40; g = 140; b = 255; } // Blue
            else { r = 20; g = 30; b = 20; } // Off
          } else {
            r = 30; g = 30; b = 30;
          }
        }

        // Cable conduit / venting (bottom right)
        if (x >= 38 && x <= 58 && y >= 36 && y <= 56) {
          if (y % 4 === 0) {
            r = 25; g = 25; b = 30;
          } else {
            r = 100; g = 105; b = 110;
          }
        }

        pixels[y * w + x] = rgba(Math.min(255, Math.max(0, r)), Math.min(255, Math.max(0, g)), Math.min(255, Math.max(0, b)));
      }
    }
    return { name: 'COMP01', width: w, height: h, pixels };
  }

  // COMP02: Tech diagnostic panel with vertical wire harnesses
  public static buildComp02(w: number, h: number): TextureData {
    const pixels = new Uint32Array(w * h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let r = 80, g = 80, b = 85;
        // Wires
        if (x === 12 || x === 16) { r = 220; g = 40; b = 40; } // Red wire
        else if (x === 20 || x === 24) { r = 40; g = 120; b = 240; } // Blue wire
        else if (x === 28 || x === 32) { r = 240; g = 200; b = 30; } // Yellow wire
        else if (x >= 40 && x <= 56 && y >= 10 && y <= 54) {
          // Warning panel
          const isStripes = ((x + y) % 8) < 4;
          if (isStripes) { r = 240; g = 180; b = 20; }
          else { r = 20; g = 20; b = 25; }
        }

        pixels[y * w + x] = rgba(r, g, b);
      }
    }
    return { name: 'COMP02', width: w, height: h, pixels };
  }

  // BRICK01: Classic weathered red/brown DOOM bricks
  public static buildBrick01(w: number, h: number): TextureData {
    const pixels = new Uint32Array(w * h);
    const brickH = 8;
    const brickW = 16;

    for (let y = 0; y < h; y++) {
      const row = Math.floor(y / brickH);
      const isMortarY = (y % brickH === 0);
      const xOffset = (row % 2) * (brickW / 2);

      for (let x = 0; x < w; x++) {
        const adjustedX = (x + xOffset) % w;
        const isMortarX = (adjustedX % brickW === 0);

        if (isMortarY || isMortarX) {
          // Dark mortar
          pixels[y * w + x] = rgba(45, 40, 35);
        } else {
          const noise = hash(x, y, 77) * 35 - 17;
          const shade = ((y % brickH) === 1 || (adjustedX % brickW) === 1) ? 25 : 0;
          const r = Math.min(255, Math.max(0, 140 + noise + shade));
          const g = Math.min(255, Math.max(0, 55 + noise * 0.7 + shade * 0.5));
          const b = Math.min(255, Math.max(0, 40 + noise * 0.5 + shade * 0.3));
          pixels[y * w + x] = rgba(r, g, b);
        }
      }
    }
    return { name: 'BRICK01', width: w, height: h, pixels };
  }

  // STONE2: Medieval dungeon grey/green stone blocks
  public static buildStone2(w: number, h: number): TextureData {
    const pixels = new Uint32Array(w * h);
    const blockH = 16;
    const blockW = 32;

    for (let y = 0; y < h; y++) {
      const row = Math.floor(y / blockH);
      const isMortarY = (y % blockH === 0);
      const xOffset = (row % 2) * (blockW / 2);

      for (let x = 0; x < w; x++) {
        const adjustedX = (x + xOffset) % w;
        const isMortarX = (adjustedX % blockW === 0);

        if (isMortarY || isMortarX) {
          pixels[y * w + x] = rgba(30, 32, 30);
        } else {
          const noise = hash(x, y, 88) * 30 - 15;
          const moss = hash(x, y, 101) > 0.7 ? 20 : 0;
          const base = 90 + noise;
          const r = Math.min(255, Math.max(0, base - 5));
          const g = Math.min(255, Math.max(0, base + moss));
          const b = Math.min(255, Math.max(0, base - 10));
          pixels[y * w + x] = rgba(r, g, b);
        }
      }
    }
    return { name: 'STONE2', width: w, height: h, pixels };
  }

  // METAL1: Industrial hazard rusted metal with caution stripes
  public static buildMetal1(w: number, h: number): TextureData {
    const pixels = new Uint32Array(w * h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let r = 110, g = 110, b = 115;
        const noise = (hash(x, y, 55) - 0.5) * 25;
        const rust = hash(x, y, 31) > 0.65 ? 25 : 0;

        r += noise + rust;
        g += noise - rust * 0.4;
        b += noise - rust * 0.7;

        // Diagonal caution hazard stripe along middle band
        if (y >= 24 && y <= 40) {
          const stripe = ((x + y) % 16) < 8;
          if (stripe) {
            r = 230; g = 190; b = 20;
          } else {
            r = 25; g = 25; b = 30;
          }
        }

        // Panel borders and heavy bolts
        if (x === 0 || x === w - 1 || y === 0 || y === h - 1) {
          r -= 50; g -= 50; b -= 50;
        }

        pixels[y * w + x] = rgba(Math.min(255, Math.max(0, r)), Math.min(255, Math.max(0, g)), Math.min(255, Math.max(0, b)));
      }
    }
    return { name: 'METAL1', width: w, height: h, pixels };
  }

  // TEKGREN: Tech-base olive/green composite panels
  public static buildTekgren(w: number, h: number): TextureData {
    const pixels = new Uint32Array(w * h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const noise = hash(x, y, 66) * 16 - 8;
        let r = 60 + noise, g = 95 + noise, b = 65 + noise;

        if (x % 32 === 0 || y % 32 === 0) {
          r -= 30; g -= 30; b -= 30;
        } else if (x % 32 === 1 || y % 32 === 1) {
          r += 20; g += 20; b += 20;
        }

        // Hydraulic strut in center
        if (x >= 28 && x <= 36) {
          r = 130 + noise; g = 130 + noise; b = 140 + noise;
        }

        pixels[y * w + x] = rgba(Math.min(255, Math.max(0, r)), Math.min(255, Math.max(0, g)), Math.min(255, Math.max(0, b)));
      }
    }
    return { name: 'TEKGREN', width: w, height: h, pixels };
  }

  // WOOD1: Dark oak/gothic wood planks
  public static buildWood1(w: number, h: number): TextureData {
    const pixels = new Uint32Array(w * h);
    const plankW = 16;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const isSeam = (x % plankW === 0);
        if (isSeam) {
          pixels[y * w + x] = rgba(30, 18, 10);
        } else {
          const grain = Math.sin(y * 0.4 + hash(x, y, 15) * 2) * 15;
          const noise = hash(x, y, 22) * 10;
          const r = Math.min(255, Math.max(0, 110 + grain + noise));
          const g = Math.min(255, Math.max(0, 65 + grain * 0.7 + noise * 0.5));
          const b = Math.min(255, Math.max(0, 35 + grain * 0.4 + noise * 0.3));
          pixels[y * w + x] = rgba(r, g, b);
        }
      }
    }
    return { name: 'WOOD1', width: w, height: h, pixels };
  }

  // DOOR3: Heavy steel blast door with center hatch
  public static buildDoor3(w: number, h: number): TextureData {
    const pixels = new Uint32Array(w * h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let r = 100, g = 105, b = 110;
        const noise = (hash(x, y, 123) - 0.5) * 10;
        r += noise; g += noise; b += noise;

        // Vertical door track groove
        if (x <= 4 || x >= w - 5) {
          r = 40; g = 40; b = 45;
        }

        // Center split line
        if (x === Math.floor(w / 2) || x === Math.floor(w / 2) - 1) {
          r = 20; g = 20; b = 25;
        }

        // Horizontal reinforcement bars
        if (y % 16 === 0 || y % 16 === 15) {
          r -= 35; g -= 35; b -= 35;
        }

        // Center yellow warning bar
        if (y >= 26 && y <= 38 && x >= 12 && x <= w - 13) {
          const stripe = ((x + y) % 8) < 4;
          if (stripe) { r = 240; g = 200; b = 20; }
          else { r = 30; g = 30; b = 30; }
        }

        pixels[y * w + x] = rgba(Math.min(255, Math.max(0, r)), Math.min(255, Math.max(0, g)), Math.min(255, Math.max(0, b)));
      }
    }
    return { name: 'DOOR3', width: w, height: h, pixels };
  }

  // Keycard-locked door with glowing color indicators
  public static buildKeyDoor(w: number, h: number, keyR: number, keyG: number, keyB: number): TextureData {
    const base = this.buildDoor3(w, h);
    const pixels = new Uint32Array(base.pixels);

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        // Glowing keycard slot and lights
        if (x >= 6 && x <= 10 && y >= 20 && y <= 44) {
          pixels[y * w + x] = rgba(keyR, keyG, keyB);
        }
        if (x >= w - 11 && x <= w - 7 && y >= 20 && y <= 44) {
          pixels[y * w + x] = rgba(keyR, keyG, keyB);
        }
      }
    }
    return { name: `KEYDOOR_${keyR > 200 ? 'R' : keyG > 150 ? 'Y' : 'B'}`, width: w, height: h, pixels };
  }

  // FLAT14: High-tech floor tiles
  public static buildFlat14(w: number, h: number): TextureData {
    const pixels = new Uint32Array(w * h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const noise = hash(x, y, 71) * 14 - 7;
        let base = 85 + noise;

        const tileX = x % 32;
        const tileY = y % 32;
        if (tileX === 0 || tileY === 0 || tileX === 31 || tileY === 31) {
          base -= 35;
        } else if (tileX === 1 || tileY === 1) {
          base += 20;
        }

        const c = Math.max(20, Math.min(240, Math.floor(base)));
        pixels[y * w + x] = rgba(c, c, c + 4);
      }
    }
    return { name: 'FLAT14', width: w, height: h, pixels };
  }

  // FLOOR01: Dark metallic floor grid
  public static buildFloor01(w: number, h: number): TextureData {
    const pixels = new Uint32Array(w * h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const isGrid = (x % 8 === 0) || (y % 8 === 0);
        if (isGrid) {
          pixels[y * w + x] = rgba(30, 30, 35);
        } else {
          const noise = hash(x, y, 83) * 12;
          pixels[y * w + x] = rgba(60 + noise, 60 + noise, 65 + noise);
        }
      }
    }
    return { name: 'FLOOR01', width: w, height: h, pixels };
  }

  // CEIL5_1: Industrial ceiling with light fixture
  public static buildCeil5_1(w: number, h: number): TextureData {
    const pixels = new Uint32Array(w * h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let r = 50, g = 50, b = 55;
        // Central fluorescent fixture
        if (x >= 20 && x <= 44 && y >= 20 && y <= 44) {
          if (x === 20 || x === 44 || y === 20 || y === 44) {
            r = 30; g = 30; b = 30;
          } else {
            r = 230; g = 240; b = 255;
          }
        }
        pixels[y * w + x] = rgba(r, g, b);
      }
    }
    return { name: 'CEIL5_1', width: w, height: h, pixels };
  }

  // NUKAGE: Animated toxic green radioactive sludge
  public static buildNukage(w: number, h: number, time: number = 0): TextureData {
    const pixels = new Uint32Array(w * h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const wave1 = Math.sin((x * 0.1) + (y * 0.1) + time * 3.0);
        const wave2 = Math.cos((x * 0.15) - (y * 0.08) + time * 2.0);
        const val = (wave1 + wave2) * 0.5;

        const bubble = hash(x + Math.floor(time * 5), y, 99) > 0.96 ? 60 : 0;
        const g = Math.min(255, Math.max(0, 170 + val * 45 + bubble));
        const r = Math.min(255, Math.max(0, 40 + val * 20));
        const b = Math.min(255, Math.max(0, 20 + val * 10));

        pixels[y * w + x] = rgba(r, g, b);
      }
    }
    return { name: 'NUKAGE', width: w, height: h, pixels };
  }

  // LAVA: Animated molten magma
  public static buildLava(w: number, h: number, time: number = 0): TextureData {
    const pixels = new Uint32Array(w * h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const wave = Math.sin(x * 0.08 + time * 2) * Math.cos(y * 0.08 - time * 1.5);
        const crust = hash(x, y, 44) > 0.65;

        if (crust) {
          pixels[y * w + x] = rgba(60, 20, 15);
        } else {
          const r = Math.min(255, 220 + wave * 35);
          const g = Math.min(255, Math.max(0, 90 + wave * 60));
          const b = Math.min(255, Math.max(0, 20));
          pixels[y * w + x] = rgba(r, g, b);
        }
      }
    }
    return { name: 'LAVA', width: w, height: h, pixels };
  }

  // SKY1: Phobos mountains & starry twilight horizon
  public static buildSky1(w: number, h: number): TextureData {
    const pixels = new Uint32Array(w * h);
    for (let y = 0; y < h; y++) {
      const grad = y / h;
      for (let x = 0; x < w; x++) {
        // Twilight sky gradient (dark red/orange to deep purple/black)
        let r = Math.floor(100 * (1 - grad) + 15 * grad);
        let g = Math.floor(30 * (1 - grad) + 10 * grad);
        let b = Math.floor(50 * (1 - grad) + 25 * grad);

        // Mountain ridge silhouette
        const mtn1 = Math.sin(x * 0.03) * 20 + Math.cos(x * 0.07) * 12 + 75;
        const mtn2 = Math.sin(x * 0.05 + 2) * 15 + 85;

        if (y >= mtn1) {
          r = 35; g = 18; b = 18; // Mountain color
        }
        if (y >= mtn2) {
          r = 20; g = 10; b = 12; // Foreground mountain
        }

        // Red Moon in sky
        const dx = x - 60, dy = y - 30;
        if (dx * dx + dy * dy <= 12 * 12) {
          r = 220; g = 80; b = 60;
        }

        // Stars
        if (y < 65 && hash(x, y, 777) > 0.985) {
          r = 255; g = 240; b = 220;
        }

        pixels[y * w + x] = rgba(r, g, b);
      }
    }
    return { name: 'SKY1', width: w, height: h, pixels };
  }
}
