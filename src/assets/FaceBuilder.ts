/**
 * Procedural Doomguy Status Bar Face Generator
 * Renders authentic 24x29 pixel portraits for all health brackets, glance directions, evil grin, ouch, and god mode.
 */

import { rgba, TextureData } from './TextureBuilder';

export interface FaceFrame {
  name: string;
  data: TextureData;
}

export class FaceBuilder {
  public static generateAllFaces(): Map<string, TextureData> {
    const faces = new Map<string, TextureData>();
    const tiers = [100, 80, 60, 40, 20];

    // Generate normal glance directions for all 5 health tiers
    tiers.forEach((tier) => {
      faces.set(`STF_STRAIGHT_${tier}`, this.buildFace(tier, 'straight', false, false));
      faces.set(`STF_LEFT_${tier}`, this.buildFace(tier, 'left', false, false));
      faces.set(`STF_RIGHT_${tier}`, this.buildFace(tier, 'right', false, false));
      faces.set(`STF_OUCH_${tier}`, this.buildFace(tier, 'straight', true, false));
      faces.set(`STF_GRIN_${tier}`, this.buildFace(tier, 'straight', false, true));
    });

    // Dead face
    faces.set('STF_DEAD', this.buildDeadFace());
    // God mode face
    faces.set('STF_GODMODE', this.buildFace(100, 'straight', false, false, true));

    return faces;
  }

  public static buildFace(
    healthTier: number,
    lookDir: 'straight' | 'left' | 'right' = 'straight',
    isOuch: boolean = false,
    isGrin: boolean = false,
    isGodMode: boolean = false
  ): TextureData {
    const w = 24, h = 29;
    const pixels = new Uint32Array(w * h);

    // Palettes
    const skinBase = rgba(224, 172, 140);
    const skinShadow = rgba(184, 128, 100);
    const skinHighlight = rgba(240, 196, 170);
    const hair = rgba(90, 50, 30);
    const hairDark = rgba(60, 30, 15);
    const eyeWhite = rgba(240, 240, 245);
    const eyePupil = isGodMode ? rgba(255, 230, 50) : rgba(40, 90, 130);
    const blood = rgba(180, 20, 20);
    const darkBlood = rgba(120, 10, 10);
    const mouth = isGrin ? rgba(160, 40, 40) : rgba(80, 30, 30);

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        // Default transparent background for face cutout (matches STBAR grey)
        pixels[y * w + x] = 0x00000000;

        // Head shape mask (oval)
        const dx = (x - 12) / 8.5;
        const dy = (y - 15) / 11.5;
        if (dx * dx + dy * dy <= 1.0) {
          // Base skin
          let col = (x > 14) ? skinShadow : (x < 8) ? skinHighlight : skinBase;

          // Military flat-top hair (top)
          if (y <= 7 && x >= 5 && x <= 19) {
            col = (y === 0 || y === 1) ? hairDark : hair;
          }

          // Sideburns
          if (y <= 13 && (x === 4 || x === 19)) {
            col = hairDark;
          }

          // Eyebrows (y = 9)
          if (y === 9 && ((x >= 6 && x <= 10) || (x >= 14 && x <= 18))) {
            col = hairDark;
            if (isGrin || isOuch) {
              // Angled aggressive brows
              if (x === 10 || x === 14) col = skinBase;
            }
          }

          // Eyes (y = 11 to 12)
          // Left eye
          if ((y === 11 || y === 12) && x >= 7 && x <= 10) {
            col = eyeWhite;
            let pupilX = 9;
            if (lookDir === 'left') pupilX = 7;
            if (lookDir === 'right') pupilX = 10;
            if (x === pupilX) col = eyePupil;
          }
          // Right eye
          if ((y === 11 || y === 12) && x >= 14 && x <= 17) {
            col = eyeWhite;
            let pupilX = 15;
            if (lookDir === 'left') pupilX = 14;
            if (lookDir === 'right') pupilX = 17;
            if (x === pupilX) col = eyePupil;
          }

          // Nose (y = 14 to 17)
          if (y >= 14 && y <= 17 && x >= 11 && x <= 13) {
            col = (x === 13) ? skinShadow : skinHighlight;
          }

          // Mouth (y = 20 to 22)
          if (y >= 20 && y <= 22 && x >= 8 && x <= 16) {
            if (isGrin) {
              // Wicked smirk
              if (y === 20 && (x >= 9 && x <= 16)) col = mouth;
              if (y === 21 && (x >= 12 && x <= 16)) col = rgba(230, 230, 230); // Teeth
            } else if (isOuch) {
              // Open grimacing mouth
              if (x >= 9 && x <= 15) col = mouth;
              if (y === 20 && x >= 10 && x <= 14) col = rgba(220, 220, 220); // Top teeth
            } else {
              if (y === 20) col = mouth;
            }
          }

          // Chin cleft
          if (y === 24 && (x === 11 || x === 12)) {
            col = skinShadow;
          }

          // Damage Overlays (Blood and Bruises based on health tier)
          if (healthTier <= 80) {
            // Cut on forehead
            if (y === 6 && x >= 8 && x <= 10) col = blood;
          }
          if (healthTier <= 60) {
            // Bloody nose
            if (y >= 16 && y <= 19 && x === 12) col = blood;
            // Bruised cheek
            if (y >= 15 && y <= 17 && x >= 16 && x <= 18) col = rgba(140, 80, 110);
          }
          if (healthTier <= 40) {
            // Black eye (left)
            if (y >= 10 && y <= 13 && x >= 6 && x <= 10) col = rgba(100, 50, 90);
            // Blood drip down chin
            if (y >= 21 && y <= 26 && x === 10) col = darkBlood;
          }
          if (healthTier <= 20) {
            // Mangled blood splatters
            if ((y >= 5 && y <= 8 && x >= 13 && x <= 17) || (y >= 13 && y <= 18 && x >= 6 && x <= 9)) {
              col = darkBlood;
            }
          }

          pixels[y * w + x] = col;
        }
      }
    }

    return { name: `STF_${healthTier}`, width: w, height: h, pixels };
  }

  public static buildDeadFace(): TextureData {
    const w = 24, h = 29;
    const pixels = new Uint32Array(w * h);
    const skinDead = rgba(140, 150, 140);
    const hair = rgba(60, 30, 15);
    const darkBlood = rgba(100, 10, 10);

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        pixels[y * w + x] = 0x00000000;
        const dx = (x - 12) / 8.5;
        const dy = (y - 17) / 10.5; // Slumped down
        if (dx * dx + dy * dy <= 1.0) {
          let col = skinDead;
          if (y <= 10 && x >= 5 && x <= 19) col = hair;

          // Blank bleeding eye sockets
          if (y >= 13 && y <= 15 && ((x >= 7 && x <= 10) || (x >= 14 && x <= 17))) {
            col = darkBlood;
          }
          // Blood pooling on mouth/chin
          if (y >= 20 && y <= 27 && x >= 8 && x <= 16) {
            col = darkBlood;
          }

          pixels[y * w + x] = col;
        }
      }
    }
    return { name: 'STF_DEAD', width: w, height: h, pixels };
  }
}
