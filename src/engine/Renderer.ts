/**
 * DOOM 2.5D Software Raycaster & Span Renderer
 * Features DDA raycasting, perspective-correct floor/ceiling rendering, depth-buffered sprites, and weapon viewmodels.
 */

import { Framebuffer } from './Framebuffer';
import { Camera } from './Camera';
import { GameMap } from '../world/Map';
import { AssetGenerator } from '../assets/AssetGenerator';
import { Entity } from '../entities/Entity';
import { Player } from '../entities/Player';
import { Lighting } from './Lighting';

export class Renderer {
  public readonly framebuffer: Framebuffer;
  private assetGen: AssetGenerator;

  constructor(width: number = 320, height: number = 200) {
    this.framebuffer = new Framebuffer(width, height);
    this.assetGen = AssetGenerator.get();
  }

  /**
   * Renders the complete 3D scene: Sky -> Floors/Ceilings -> Walls -> Sprites -> Weapons -> Post-Tints.
   */
  public render(
    camera: Camera,
    map: GameMap,
    entities: Entity[],
    player: Player,
    gameTime: number
  ): void {
    const fb = this.framebuffer;
    fb.clear(0xff000000);

    // 1. Render Skybox
    this.renderSky(camera, map.skyTexture);

    // 2. Render Floor & Ceiling Spans
    this.renderFloorsAndCeilings(camera, map);

    // 3. Render Walls (DDA Raycaster)
    this.renderWalls(camera, map, gameTime);

    // 4. Render 2.5D Sprites (Enemies, Pickups, Projectiles, Particles)
    this.renderSprites(camera, entities, map);

    // 5. Render Weapon Viewmodel in player's hands
    this.renderWeaponViewmodel(player, camera);

    // 6. Apply Screen Color Tints (Damage Red, Bonus Gold)
    if (player.damageTint > 0) {
      fb.applyColorTint(240, 20, 20, player.damageTint);
    }
    if (player.bonusTint > 0) {
      fb.applyColorTint(240, 220, 40, player.bonusTint);
    }
    if (player.isBerserk) {
      fb.applyColorTint(200, 10, 10, 0.15); // Constant subtle fury tint
    }
  }

  // ==========================================
  // 1. SKYBOX
  // ==========================================
  private renderSky(camera: Camera, skyTexName: string): void {
    const skyTex = this.assetGen.getTexture(skyTexName) || this.assetGen.getTexture('SKY1');
    if (!skyTex) return;

    const fb = this.framebuffer;
    const skyOffset = Math.floor((camera.angle / (Math.PI * 2)) * skyTex.width * 2) % skyTex.width;
    const horizonY = Math.floor(fb.height / 2 + camera.pitch);

    for (let y = 0; y < Math.min(fb.height, horizonY); y++) {
      const texY = Math.floor((y / fb.height) * skyTex.height) % skyTex.height;
      for (let x = 0; x < fb.width; x++) {
        const texX = (Math.floor((x / fb.width) * skyTex.width) + skyOffset + skyTex.width) % skyTex.width;
        fb.setPixel(x, y, skyTex.pixels[texY * skyTex.width + texX]);
      }
    }
  }

  // ==========================================
  // 2. FLOORS & CEILINGS (Span Buffer)
  // ==========================================
  private renderFloorsAndCeilings(camera: Camera, map: GameMap): void {
    const fb = this.framebuffer;
    const halfH = fb.height / 2 + camera.pitch;

    const dirX = camera.getDirX();
    const dirY = camera.getDirY();
    const planeX = camera.getPlaneX();
    const planeY = camera.getPlaneY();

    const rayDirX0 = dirX - planeX;
    const rayDirY0 = dirY - planeY;
    const rayDirX1 = dirX + planeX;
    const rayDirY1 = dirY + planeY;

    const posZ = 0.5 * fb.height + camera.bobAmount * fb.height;

    // Floor rendering (from horizon downwards)
    for (let y = Math.max(0, Math.floor(halfH)); y < fb.height; y++) {
      const p = y - halfH;
      if (p <= 0) continue;

      const rowDistance = posZ / p;
      const floorStepX = (rowDistance * (rayDirX1 - rayDirX0)) / fb.width;
      const floorStepY = (rowDistance * (rayDirY1 - rayDirY0)) / fb.width;

      let floorX = camera.x + rowDistance * rayDirX0;
      let floorY = camera.y + rowDistance * rayDirY0;

      for (let x = 0; x < fb.width; x++) {
        const cellX = Math.floor(floorX);
        const cellY = Math.floor(floorY);

        const sec = map.getSector(cellX, cellY);
        const light = Lighting.calculateDistanceLight(sec.lightLevel, rowDistance);

        const tex = this.assetGen.getTexture(sec.floorTex) || this.assetGen.getTexture('FLAT14');
        if (tex) {
          const tx = Math.floor(Math.abs(floorX * tex.width)) % tex.width;
          const ty = Math.floor(Math.abs(floorY * tex.height)) % tex.height;
          const pixel = tex.pixels[ty * tex.width + tx];
          fb.setPixel(x, y, Lighting.applyLight(pixel, light));
        }

        floorX += floorStepX;
        floorY += floorStepY;
      }
    }
  }

  // ==========================================
  // 3. WALLS (DDA Raycaster)
  // ==========================================
  private renderWalls(camera: Camera, map: GameMap, gameTime: number): void {
    const fb = this.framebuffer;
    const dirX = camera.getDirX();
    const dirY = camera.getDirY();
    const planeX = camera.getPlaneX();
    const planeY = camera.getPlaneY();

    for (let x = 0; x < fb.width; x++) {
      const cameraFracX = (2 * x) / fb.width - 1; // -1 to +1
      const rayDirX = dirX + planeX * cameraFracX;
      const rayDirY = dirY + planeY * cameraFracX;

      let mapX = Math.floor(camera.x);
      let mapY = Math.floor(camera.y);

      const deltaDistX = Math.abs(1 / (rayDirX || 0.00001));
      const deltaDistY = Math.abs(1 / (rayDirY || 0.00001));

      let stepX: number;
      let stepY: number;
      let sideDistX: number;
      let sideDistY: number;

      if (rayDirX < 0) {
        stepX = -1;
        sideDistX = (camera.x - mapX) * deltaDistX;
      } else {
        stepX = 1;
        sideDistX = (mapX + 1.0 - camera.x) * deltaDistX;
      }

      if (rayDirY < 0) {
        stepY = -1;
        sideDistY = (camera.y - mapY) * deltaDistY;
      } else {
        stepY = 1;
        sideDistY = (mapY + 1.0 - camera.y) * deltaDistY;
      }

      let hit = false;
      let side = 0; // 0 = X wall, 1 = Y wall
      let wallTexName = 'STARG1';
      let doorOpenProgress = 0;

      let steps = 0;
      while (!hit && steps < 64) {
        steps++;
        if (sideDistX < sideDistY) {
          sideDistX += deltaDistX;
          mapX += stepX;
          side = 0;
        } else {
          sideDistY += deltaDistY;
          mapY += stepY;
          side = 1;
        }

        const wall = map.getWall(mapX, mapY);
        if (wall !== null) {
          const door = map.getDoor(mapX, mapY);
          if (door) {
            doorOpenProgress = door.openProgress;
            // If door is partially or fully open, ray might pass through
            if (doorOpenProgress < 0.9) {
              hit = true;
              wallTexName = door.wallTex;
            }
          } else {
            hit = true;
            wallTexName = wall;
          }
        }
      }

      if (hit) {
        let perpWallDist: number;
        if (side === 0) {
          perpWallDist = (mapX - camera.x + (1 - stepX) / 2) / rayDirX;
        } else {
          perpWallDist = (mapY - camera.y + (1 - stepY) / 2) / rayDirY;
        }

        perpWallDist = Math.max(0.1, perpWallDist);

        // Height of line on screen
        const lineHeight = Math.floor(fb.height / perpWallDist);
        const pitchOffset = camera.pitch + camera.bobAmount * fb.height;
        let drawStart = -lineHeight / 2 + fb.height / 2 + pitchOffset;
        let drawEnd = lineHeight / 2 + fb.height / 2 + pitchOffset;

        // If door is opening upwards, slide the top boundary up
        if (doorOpenProgress > 0) {
          drawStart += lineHeight * doorOpenProgress;
        }

        // Texture coordinate calculation
        let wallHitX: number;
        if (side === 0) {
          wallHitX = camera.y + perpWallDist * rayDirY;
        } else {
          wallHitX = camera.x + perpWallDist * rayDirX;
        }
        wallHitX -= Math.floor(wallHitX);

        const tex = this.assetGen.getTexture(wallTexName) || this.assetGen.getTexture('STARG1')!;
        let texX = Math.floor(wallHitX * tex.width);
        if ((side === 0 && rayDirX > 0) || (side === 1 && rayDirY < 0)) {
          texX = tex.width - texX - 1;
        }

        const sec = map.getSector(mapX, mapY);
        let secLight = Lighting.getSpecialLight(sec.type as any, sec.lightLevel, gameTime);
        if (side === 1) secLight *= 0.8; // Authentic shadow on North/South walls

        fb.drawTexturedVerticalStripe(x, drawStart, drawEnd, tex, texX, secLight, perpWallDist);
      }
    }
  }

  // ==========================================
  // 4. SPRITES (Billboards)
  // ==========================================
  private renderSprites(camera: Camera, entities: Entity[], map: GameMap): void {
    const fb = this.framebuffer;

    // Calculate distance and filter active entities
    const visibleEntities = entities.filter((e) => e.isAlive);
    visibleEntities.forEach((e) => e.updateDistance(camera.x, camera.y));

    // Sort far-to-near (Painter's algorithm)
    visibleEntities.sort((a, b) => b.distanceToCamera - a.distanceToCamera);

    const dirX = camera.getDirX();
    const dirY = camera.getDirY();
    const planeX = camera.getPlaneX();
    const planeY = camera.getPlaneY();

    const invDet = 1.0 / (planeX * dirY - dirX * planeY);

    visibleEntities.forEach((sprite) => {
      const spriteX = sprite.x - camera.x;
      const spriteY = sprite.y - camera.y;

      // Transform sprite with inverse camera matrix
      const transformX = invDet * (dirY * spriteX - dirX * spriteY);
      const transformY = invDet * (-planeY * spriteX + planeX * spriteY); // Depth into screen

      if (transformY > 0.2) { // In front of camera
        const spriteScreenX = Math.floor((fb.width / 2) * (1 + transformX / transformY));
        const pitchOffset = camera.pitch + camera.bobAmount * fb.height;
        const spriteScreenY = Math.floor(fb.height / 2 + (fb.height / transformY) * 0.5 + pitchOffset);

        const scale = (fb.height / transformY) * (1 / 48) * sprite.scale;

        const tex = this.assetGen.getSprite(sprite.spriteName);
        if (tex) {
          const sec = map.getSector(Math.floor(sprite.x), Math.floor(sprite.y));
          fb.drawSprite(tex, spriteScreenX, spriteScreenY, scale, scale, sec.lightLevel, transformY);
        }
      }
    });
  }

  // ==========================================
  // 5. WEAPON VIEWMODEL
  // ==========================================
  private renderWeaponViewmodel(player: Player, camera: Camera): void {
    const fb = this.framebuffer;
    const w = player.currentWeapon;
    const isFiring = player.muzzleFlashTimer > 0;
    const spriteName = isFiring ? w.fireSprite : w.idleSprite;

    const tex = this.assetGen.getSprite(spriteName);
    if (!tex) return;

    const centerX = fb.width / 2 + Math.sin(camera.bobPhase) * 6.0;
    const recoilOffset = isFiring ? 8 : 0;
    const centerY = fb.height + camera.bobAmount * 40.0 + recoilOffset;

    fb.drawViewmodel(tex, centerX, centerY, 1.4, isFiring);
  }
}
