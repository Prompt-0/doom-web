/**
 * Master Asset Generator & Cache for DOOM Engine
 * Orchestrates texture generation, sprite compilation, facial expressions, and provides high-speed lookup.
 */

import { TextureBuilder, TextureData } from './TextureBuilder';
import { SpriteBuilder } from './SpriteBuilder';
import { FaceBuilder } from './FaceBuilder';

export class AssetGenerator {
  private static instance: AssetGenerator | null = null;
  private textures: Map<string, TextureData> = new Map();
  private sprites: Map<string, TextureData> = new Map();
  private faces: Map<string, TextureData> = new Map();
  private isInitialized: boolean = false;

  private constructor() {}

  public static get(): AssetGenerator {
    if (!AssetGenerator.instance) {
      AssetGenerator.instance = new AssetGenerator();
      AssetGenerator.instance.initialize();
    }
    return AssetGenerator.instance;
  }

  public initialize(): void {
    if (this.isInitialized) return;

    // 1. Generate Wall & Flat Textures
    this.textures = TextureBuilder.generateAll();

    // 2. Generate Sprite Catalog (Weapons, Monsters, Projectiles, Pickups, FX)
    this.sprites = SpriteBuilder.generateAllSprites();

    // 3. Generate Doomguy Faces
    this.faces = FaceBuilder.generateAllFaces();

    this.isInitialized = true;
  }

  public getTexture(name: string): TextureData | undefined {
    return this.textures.get(name);
  }

  public getSprite(name: string): TextureData | undefined {
    return this.sprites.get(name);
  }

  public getFace(name: string): TextureData | undefined {
    return this.faces.get(name);
  }

  public getAllTextures(): Map<string, TextureData> {
    return this.textures;
  }

  public getAllSprites(): Map<string, TextureData> {
    return this.sprites;
  }

  public getAllFaces(): Map<string, TextureData> {
    return this.faces;
  }

  /**
   * Updates animated liquid textures (Nukage, Lava) based on game clock
   */
  public updateLiquids(time: number): void {
    this.textures.set('NUKAGE', TextureBuilder.buildNukage(64, 64, time));
    this.textures.set('LAVA', TextureBuilder.buildLava(64, 64, time));
  }
}
