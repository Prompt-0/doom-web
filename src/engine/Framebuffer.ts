/**
 * High-Speed 320x200 Pixel Framebuffer & Z-Buffer
 * Provides direct 32-bit pixel array access and depth-buffered sprite/wall rasterization.
 */

import { TextureData } from '../assets/TextureBuilder';
import { Lighting } from './Lighting';

export class Framebuffer {
  public readonly width: number;
  public readonly height: number;
  public readonly pixels: Uint32Array;
  public readonly zBuffer: Float32Array;
  private readonly imageData: ImageData;
  private readonly uint8Clamped: Uint8ClampedArray;

  constructor(width: number = 320, height: number = 200) {
    this.width = width;
    this.height = height;
    this.imageData = new ImageData(width, height);
    this.uint8Clamped = this.imageData.data;
    this.pixels = new Uint32Array(this.uint8Clamped.buffer);
    this.zBuffer = new Float32Array(width);
  }

  public clear(color: number = 0xff000000): void {
    this.pixels.fill(color);
    this.zBuffer.fill(Infinity);
  }

  public setPixel(x: number, y: number, color: number): void {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      this.pixels[y * this.width + x] = color;
    }
  }

  public setPixelWithDepth(x: number, y: number, depth: number, color: number): void {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      if (depth < this.zBuffer[x]) {
        this.pixels[y * this.width + x] = color;
      }
    }
  }

  /**
   * Draws a vertical wall stripe with perspective-correct texture mapping, colormap lighting, and depth clipping.
   */
  public drawTexturedVerticalStripe(
    screenX: number,
    y0: number,
    y1: number,
    tex: TextureData,
    texX: number,
    lightLevel: number,
    depth: number
  ): void {
    if (screenX < 0 || screenX >= this.width) return;

    // Record Z-depth for this vertical screen column
    this.zBuffer[screenX] = depth;

    const wallHeight = y1 - y0;
    if (wallHeight <= 0) return;

    const startY = Math.max(0, Math.floor(y0));
    const endY = Math.min(this.height - 1, Math.floor(y1));

    const texW = tex.width;
    const texH = tex.height;
    const safeTexX = Math.floor(Math.abs(texX)) % texW;

    const dLight = Lighting.calculateDistanceLight(lightLevel, depth);

    for (let y = startY; y <= endY; y++) {
      const texY = Math.floor(((y - y0) / wallHeight) * texH) % texH;
      const safeTexY = Math.max(0, Math.min(texH - 1, texY));
      const texPixel = tex.pixels[safeTexY * texW + safeTexX];

      // Alpha mask check (ignore transparent pixels)
      if ((texPixel & 0xff000000) !== 0) {
        this.pixels[y * this.width + screenX] = Lighting.applyLight(texPixel, dLight);
      }
    }
  }

  /**
   * Draws a billboard 2.5D sprite with depth testing against the Z-buffer.
   */
  public drawSprite(
    sprite: TextureData,
    screenX: number,
    screenY: number,
    scaleX: number,
    scaleY: number,
    lightLevel: number,
    depth: number
  ): void {
    const sWidth = Math.floor(sprite.width * scaleX);
    const sHeight = Math.floor(sprite.height * scaleY);
    if (sWidth <= 0 || sHeight <= 0) return;

    const startX = Math.max(0, Math.floor(screenX - sWidth / 2));
    const endX = Math.min(this.width - 1, Math.floor(screenX + sWidth / 2));
    const startY = Math.max(0, Math.floor(screenY - sHeight));
    const endY = Math.min(this.height - 1, Math.floor(screenY));

    const dLight = Lighting.calculateDistanceLight(lightLevel, depth);

    for (let x = startX; x <= endX; x++) {
      // Z-Buffer occlusion check: only draw if sprite is closer than wall in this column
      if (depth >= this.zBuffer[x]) continue;

      const texX = Math.floor(((x - (screenX - sWidth / 2)) / sWidth) * sprite.width);
      if (texX < 0 || texX >= sprite.width) continue;

      for (let y = startY; y <= endY; y++) {
        const texY = Math.floor(((y - (screenY - sHeight)) / sHeight) * sprite.height);
        if (texY < 0 || texY >= sprite.height) continue;

        const pixel = sprite.pixels[texY * sprite.width + texX];
        if ((pixel & 0xff000000) !== 0) { // If not transparent
          this.pixels[y * this.width + x] = Lighting.applyLight(pixel, dLight);
        }
      }
    }
  }

  /**
   * Draws 2D UI / Viewmodel directly onto framebuffer without depth testing (e.g. player weapon in hand)
   */
  public drawViewmodel(
    sprite: TextureData,
    screenX: number,
    screenY: number,
    scale: number = 1.0,
    muzzleFlashBright: boolean = false
  ): void {
    const sWidth = Math.floor(sprite.width * scale);
    const sHeight = Math.floor(sprite.height * scale);

    const startX = Math.max(0, Math.floor(screenX - sWidth / 2));
    const endX = Math.min(this.width - 1, Math.floor(screenX + sWidth / 2));
    const startY = Math.max(0, Math.floor(screenY - sHeight));
    const endY = Math.min(this.height - 1, Math.floor(screenY));

    for (let x = startX; x <= endX; x++) {
      const texX = Math.floor(((x - (screenX - sWidth / 2)) / sWidth) * sprite.width);
      if (texX < 0 || texX >= sprite.width) continue;

      for (let y = startY; y <= endY; y++) {
        const texY = Math.floor(((y - (screenY - sHeight)) / sHeight) * sprite.height);
        if (texY < 0 || texY >= sprite.height) continue;

        const pixel = sprite.pixels[texY * sprite.width + texX];
        if ((pixel & 0xff000000) !== 0) {
          if (muzzleFlashBright) {
            this.pixels[y * this.width + x] = pixel;
          } else {
            this.pixels[y * this.width + x] = Lighting.applyLight(pixel, 1.0);
          }
        }
      }
    }
  }

  /**
   * Applies full-screen tint overlay (damage red, item gold, radsuit green)
   */
  public applyColorTint(r: number, g: number, b: number, intensity: number): void {
    if (intensity <= 0) return;
    const alpha = Math.min(0.8, Math.max(0, intensity));
    const invAlpha = 1.0 - alpha;

    for (let i = 0; i < this.pixels.length; i++) {
      const p = this.pixels[i];
      const curR = p & 0xff;
      const curG = (p >> 8) & 0xff;
      const curB = (p >> 16) & 0xff;

      const newR = Math.floor(curR * invAlpha + r * alpha);
      const newG = Math.floor(curG * invAlpha + g * alpha);
      const newB = Math.floor(curB * invAlpha + b * alpha);

      this.pixels[i] = (0xff << 24) | (newB << 16) | (newG << 8) | newR;
    }
  }

  /**
   * Blits internal pixel buffer directly to the target 2D canvas context
   */
  public renderToCanvas(ctx: CanvasRenderingContext2D, destWidth: number, destHeight: number): void {
    // Put ImageData on an offscreen canvas or scale directly
    ctx.imageSmoothingEnabled = false; // Authentic sharp nearest-neighbor retro pixel filtering
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = this.width;
    tempCanvas.height = this.height;
    const tempCtx = tempCanvas.getContext('2d');
    if (tempCtx) {
      tempCtx.putImageData(this.imageData, 0, 0);
      ctx.drawImage(tempCanvas, 0, 0, destWidth, destHeight);
    }
  }
}
