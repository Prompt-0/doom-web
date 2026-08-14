/**
 * DOOM (1993) Web Recreation & Retro FPS Engine Entry Point
 */

import { AssetGenerator } from './assets/AssetGenerator';
import { Renderer } from './engine/Renderer';
import { StatusBar } from './ui/StatusBar';
import { Automap } from './ui/Automap';
import { Menu } from './ui/Menu';
import { LevelEditor, ToolType } from './ui/LevelEditor';
import { SoundEngine } from './audio/SoundEngine';
import { SynthMusic } from './audio/SynthMusic';
import { Cheats } from './input/Cheats';
import { InputManager } from './input/InputManager';
import { ParticleManager } from './weapons/Particle';
import { GameMap } from './world/Map';
import { Levels } from './world/Levels';
import { Player } from './entities/Player';
import { Enemy } from './entities/Enemy';
import { Bestiary } from './entities/Bestiary';
import { Projectile } from './entities/Projectile';
import { Pickup, PickupType } from './entities/Pickup';

export class DoomGame {
  // Canvases & DOM
  private viewportCanvas: HTMLCanvasElement;
  private statusbarCanvas: HTMLCanvasElement;
  private messageBanner: HTMLElement;
  private crtOverlay: HTMLElement;
  private editorModal: HTMLElement;
  private editorCanvas: HTMLCanvasElement;

  // Engine Subsystems
  private assetGen: AssetGenerator;
  private renderer: Renderer;
  private statusBar: StatusBar;
  private automap: Automap;
  private menu: Menu;
  private editor: LevelEditor;
  private soundEngine: SoundEngine;
  private synthMusic: SynthMusic;
  private cheats: Cheats;
  private input: InputManager;
  private particles: ParticleManager;

  // Game World State
  private map: GameMap;
  private player: Player;
  private enemies: Enemy[] = [];
  private projectiles: Projectile[] = [];
  private pickups: Pickup[] = [];
  private lastTime: number = 0;
  private gameTime: number = 0;
  private messageTimer: number = 0;
  private isAudioMuted: boolean = false;
  private isCrtEnabled: boolean = true;

  constructor() {
    this.viewportCanvas = document.getElementById('viewport-canvas') as HTMLCanvasElement;
    this.statusbarCanvas = document.getElementById('statusbar-canvas') as HTMLCanvasElement;
    this.messageBanner = document.getElementById('message-banner') as HTMLElement;
    this.crtOverlay = document.getElementById('crt-overlay') as HTMLElement;
    this.editorModal = document.getElementById('editor-modal') as HTMLElement;
    this.editorCanvas = document.getElementById('editor-canvas') as HTMLCanvasElement;

    // 1. Initialize Asset Generator & Audio
    this.assetGen = AssetGenerator.get();
    this.soundEngine = new SoundEngine();
    this.synthMusic = new SynthMusic();

    // 2. Initialize Engine & UI Systems
    this.renderer = new Renderer(320, 200);
    this.statusBar = new StatusBar();
    this.automap = new Automap();
    this.cheats = new Cheats();
    this.input = new InputManager();
    this.particles = new ParticleManager();
    this.editor = new LevelEditor();

    // 3. Initialize Map & Player
    this.map = Levels.getE1M1();
    this.player = new Player(this.map.playerSpawn.x, this.map.playerSpawn.y, this.map.playerSpawn.angle);

    // 4. Menu & Callbacks
    this.menu = new Menu({
      onStartGame: (level, difficulty) => this.loadLevel(level, difficulty),
      onOpenEditor: () => this.openEditor(),
      onToggleAudio: () => this.toggleAudio(),
    });

    this.setupUIHandlers();
    this.setupCheats();
    this.input.attachCanvas(this.viewportCanvas);

    // 5. Start Game Loop
    this.loadLevel('E1M1', 2);
    requestAnimationFrame((t) => this.loop(t));
  }

  private setupUIHandlers(): void {
    // CRT Button
    const btnCrt = document.getElementById('btn-crt');
    btnCrt?.addEventListener('click', () => {
      this.isCrtEnabled = !this.isCrtEnabled;
      this.crtOverlay.style.display = this.isCrtEnabled ? 'block' : 'none';
      if (btnCrt) {
        btnCrt.textContent = `CRT FILTER: ${this.isCrtEnabled ? 'ON' : 'OFF'}`;
        btnCrt.classList.toggle('active', this.isCrtEnabled);
      }
    });

    // Audio Button
    const btnAudio = document.getElementById('btn-audio');
    btnAudio?.addEventListener('click', () => this.toggleAudio());

    // Menu Button
    const btnMenu = document.getElementById('btn-menu');
    btnMenu?.addEventListener('click', () => {
      this.menu.isOpen = !this.menu.isOpen;
    });

    // Editor Button
    const btnEditor = document.getElementById('btn-editor');
    btnEditor?.addEventListener('click', () => this.openEditor());

    // Close Editor
    const btnCloseEditor = document.getElementById('btn-close-editor');
    btnCloseEditor?.addEventListener('click', () => {
      this.editorModal.style.display = 'none';
    });

    // Test Map
    const btnTestMap = document.getElementById('btn-test-map');
    btnTestMap?.addEventListener('click', () => {
      this.map = this.editor.exportToGameMap();
      this.respawnWorld();
      this.editorModal.style.display = 'none';
      this.menu.isOpen = false;
      this.logMessage('TESTING CUSTOM LEVEL');
    });

    // Export Map
    const btnExport = document.getElementById('btn-export-map');
    btnExport?.addEventListener('click', () => {
      const customMap = this.editor.exportToGameMap();
      const json = JSON.stringify(customMap, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'doom_custom_level.json';
      a.click();
    });

    // Editor Palette Buttons
    const paletteButtons = document.querySelectorAll('.palette-btn');
    paletteButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        paletteButtons.forEach((b) => b.classList.remove('selected'));
        const target = e.currentTarget as HTMLElement;
        target.classList.add('selected');
        const tool = target.getAttribute('data-tool') as ToolType;
        if (tool) this.editor.currentTool = tool;
      });
    });

    // Editor Canvas Drawing Interaction
    let isDrawing = false;
    this.editorCanvas.addEventListener('mousedown', (e) => {
      isDrawing = true;
      this.handleEditorClick(e);
    });
    this.editorCanvas.addEventListener('mousemove', (e) => {
      if (isDrawing) this.handleEditorClick(e);
    });
    window.addEventListener('mouseup', () => {
      isDrawing = false;
    });
  }

  private handleEditorClick(e: MouseEvent): void {
    const rect = this.editorCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const gridX = Math.floor((x / rect.width) * 20);
    const gridY = Math.floor((y / rect.height) * 20);
    this.editor.applyTool(gridX, gridY);
    this.editor.renderEditorCanvas(this.editorCanvas);
  }

  private openEditor(): void {
    this.editorModal.style.display = 'flex';
    this.editor.renderEditorCanvas(this.editorCanvas);
  }

  private toggleAudio(): void {
    this.isAudioMuted = !this.isAudioMuted;
    this.soundEngine.setMuted(this.isAudioMuted);
    this.synthMusic.setMuted(this.isAudioMuted);
    if (!this.isAudioMuted) {
      this.soundEngine.init();
      this.synthMusic.start();
    }
    const btnAudio = document.getElementById('btn-audio');
    if (btnAudio) {
      btnAudio.textContent = `AUDIO: ${this.isAudioMuted ? 'OFF' : 'ON'}`;
      btnAudio.classList.toggle('active', !this.isAudioMuted);
    }
  }

  private setupCheats(): void {
    this.input.onKeyPress = (key) => {
      if (this.menu.isOpen) {
        this.menu.handleInput(key);
      } else {
        this.cheats.handleKeyPress(key, this.player, this.automap, (msg) => {
          this.logMessage(msg);
          this.soundEngine.play('DSITEMUP');
        });
      }
    };
  }

  public loadLevel(levelName: 'E1M1' | 'E1M2' | 'E1M8' | 'CUSTOM', difficulty: number = 2): void {
    if (levelName === 'E1M1') this.map = Levels.getE1M1();
    else if (levelName === 'E1M2') this.map = Levels.getE1M2();
    else if (levelName === 'E1M8') this.map = Levels.getE1M8();
    else this.map = this.editor.exportToGameMap();

    this.respawnWorld(difficulty);
    this.logMessage(`ENTERING ${this.map.name}`);
    if (!this.isAudioMuted) {
      this.synthMusic.start();
    }
  }

  private respawnWorld(difficulty: number = 2): void {
    this.player = new Player(this.map.playerSpawn.x, this.map.playerSpawn.y, this.map.playerSpawn.angle);
    // Scale enemy count/health by difficulty
    this.enemies = this.map.monsterSpawns.map((s) => {
      const enemy = Bestiary.spawn(s.type, s.x, s.y);
      if (difficulty >= 3) enemy.health = Math.floor(enemy.health * 1.25);
      return enemy;
    });
    this.pickups = this.map.itemSpawns.map((s) => new Pickup(s.x, s.y, s.type as PickupType));
    this.projectiles = [];
    this.particles.particles = [];
  }

  public logMessage(msg: string): void {
    this.messageBanner.textContent = msg;
    this.messageBanner.style.opacity = '1.0';
    this.messageTimer = 3.0; // Show for 3 seconds
  }

  private loop(timestamp: number): void {
    if (!this.lastTime) this.lastTime = timestamp;
    const delta = Math.min(0.1, (timestamp - this.lastTime) / 1000);
    this.lastTime = timestamp;
    this.gameTime += delta;

    // Update message timer
    if (this.messageTimer > 0) {
      this.messageTimer -= delta;
      if (this.messageTimer <= 0) {
        this.messageBanner.style.opacity = '0';
      }
    }

    // Update animated liquid textures (Nukage, Lava)
    this.assetGen.updateLiquids(this.gameTime);

    const inputState = this.input.poll();

    // Toggle Automap
    if (inputState.toggleMap) {
      this.automap.toggle();
    }
    // Toggle Menu
    if (inputState.toggleMenu) {
      this.menu.isOpen = !this.menu.isOpen;
    }

    // ==========================================
    // GAMEPLAY UPDATE
    // ==========================================
    if (!this.menu.isOpen && this.player.isAlive) {
      // 1. Update Map Doors & Lifts
      this.map.update(delta);

      // 2. Update Player
      this.player.update(
        delta,
        inputState,
        this.map,
        this.enemies,
        (proj) => this.projectiles.push(proj),
        (snd) => this.soundEngine.play(snd),
        (x, y) => this.particles.spawnBlood(x, y),
        (msg) => this.logMessage(msg)
      );

      // 3. Update Enemy AI
      this.enemies.forEach((enemy) => {
        enemy.updateAI(
          delta,
          this.player,
          this.map,
          (proj) => this.projectiles.push(proj),
          (damage) => {
            this.player.takeDamage(damage, enemy, (s) => this.soundEngine.play(s));
            this.statusBar.doomFace.triggerOuch();
          }
        );
      });

      // 4. Update Projectiles
      this.projectiles = this.projectiles.filter((p) => {
        const alive = p.update(delta, this.map);
        if (!alive) {
          // Impact explosion
          this.particles.spawnExplosion(p.x, p.y);
          this.soundEngine.play('DSEXPLO');

          // Splash Damage calculation
          if (p.splashRadius > 0) {
            this.enemies.forEach((e) => {
              const dist = Math.sqrt((e.x - p.x) ** 2 + (e.y - p.y) ** 2);
              if (dist <= p.splashRadius) {
                const dmg = Math.floor(p.damage * (1 - dist / p.splashRadius));
                e.takeDamage(dmg, p.isPlayerOwned ? this.player : null);
                this.particles.spawnBlood(e.x, e.y);
              }
            });
            // Player splash damage
            const pDist = Math.sqrt((this.player.x - p.x) ** 2 + (this.player.y - p.y) ** 2);
            if (pDist <= p.splashRadius) {
              const pDmg = Math.floor(p.damage * (1 - pDist / p.splashRadius));
              this.player.takeDamage(pDmg, null, (s) => this.soundEngine.play(s));
            }
          }
          return false;
        }

        // Direct Entity Hits
        if (p.isPlayerOwned) {
          for (const enemy of this.enemies) {
            if (enemy.isAlive) {
              const dist = Math.sqrt((enemy.x - p.x) ** 2 + (enemy.y - p.y) ** 2);
              if (dist < enemy.radius + p.radius) {
                enemy.takeDamage(p.damage, this.player);
                this.particles.spawnBlood(enemy.x, enemy.y);
                this.particles.spawnExplosion(p.x, p.y);
                this.soundEngine.play('DSEXPLO');
                return false;
              }
            }
          }
        } else {
          // Monster projectile hitting player
          const dist = Math.sqrt((this.player.x - p.x) ** 2 + (this.player.y - p.y) ** 2);
          if (dist < this.player.radius + p.radius) {
            this.player.takeDamage(p.damage, null, (s) => this.soundEngine.play(s));
            this.statusBar.doomFace.triggerOuch();
            this.particles.spawnBlood(this.player.x, this.player.y);
            return false;
          }
        }

        return true;
      });

      // 5. Update Pickups & Check Player Collection
      this.pickups = this.pickups.filter((item) => {
        item.update(delta);
        const dist = Math.sqrt((item.x - this.player.x) ** 2 + (item.y - this.player.y) ** 2);
        if (dist < 0.6) {
          let pickedUp = false;

          switch (item.type) {
            case 'PICKUP_MEDIKIT':
              pickedUp = this.player.addHealth(25, 100);
              if (pickedUp) this.logMessage('PICKED UP A MEDIKIT (+25% HEALTH)');
              break;
            case 'PICKUP_STIMPACK':
              pickedUp = this.player.addHealth(10, 100);
              if (pickedUp) this.logMessage('PICKED UP A STIMPACK (+10% HEALTH)');
              break;
            case 'PICKUP_POTION':
              pickedUp = this.player.addHealth(1, 200);
              if (pickedUp) this.logMessage('PICKED UP A HEALTH BONUS (+1%)');
              break;
            case 'PICKUP_ARMOR_GREEN':
              pickedUp = this.player.addArmor(100, 'GREEN');
              if (pickedUp) this.logMessage('PICKED UP GREEN SECURITY ARMOR (100%)');
              break;
            case 'PICKUP_ARMOR_BLUE':
              pickedUp = this.player.addArmor(200, 'BLUE');
              if (pickedUp) this.logMessage('PICKED UP BLUE COMBAT MEGAARMOR (200%)');
              break;
            case 'KEY_BLUE':
              this.player.hasBlueKey = true;
              pickedUp = true;
              this.logMessage('FOUND A BLUE KEYCARD');
              break;
            case 'KEY_RED':
              this.player.hasRedKey = true;
              pickedUp = true;
              this.logMessage('FOUND A RED KEYCARD');
              break;
            case 'KEY_YELLOW':
              this.player.hasYellowKey = true;
              pickedUp = true;
              this.logMessage('FOUND A YELLOW KEYCARD');
              break;
            case 'PICKUP_CLIP':
              pickedUp = this.player.addAmmo('BULLETS', 10);
              if (pickedUp) this.logMessage('PICKED UP AN AMMO CLIP');
              break;
            case 'PICKUP_SHELLS':
              pickedUp = this.player.addAmmo('SHELLS', 4);
              if (pickedUp) this.logMessage('PICKED UP 4 SHOTGUN SHELLS');
              break;
            case 'PICKUP_ROCKET':
              pickedUp = this.player.addAmmo('ROCKETS', 2);
              if (pickedUp) this.logMessage('PICKED UP 2 ROCKETS');
              break;
            case 'PICKUP_CELL':
              pickedUp = this.player.addAmmo('CELLS', 20);
              if (pickedUp) this.logMessage('PICKED UP AN ENERGY CELL');
              break;
            case 'PICKUP_BERSERK':
              this.player.isBerserk = true;
              this.player.health = 100;
              pickedUp = true;
              this.logMessage('BERSERK PACK ACQUIRED! 10X MELEE DAMAGE!');
              this.statusBar.doomFace.triggerGrin();
              break;
            case 'PICKUP_SHOTGUN':
              pickedUp = this.player.addWeapon('SHOTGUN');
              this.player.addAmmo('SHELLS', 8);
              this.logMessage('YOU GOT THE SHOTGUN!');
              this.statusBar.doomFace.triggerGrin();
              break;
            case 'PICKUP_CHAINGUN':
              pickedUp = this.player.addWeapon('CHAINGUN');
              this.player.addAmmo('BULLETS', 20);
              this.logMessage('YOU GOT THE CHAINGUN!');
              this.statusBar.doomFace.triggerGrin();
              break;
            case 'PICKUP_ROCKET_LAUNCHER':
              pickedUp = this.player.addWeapon('ROCKET_LAUNCHER');
              this.player.addAmmo('ROCKETS', 4);
              this.logMessage('YOU GOT THE ROCKET LAUNCHER!');
              this.statusBar.doomFace.triggerGrin();
              break;
            case 'PICKUP_PLASMA_RIFLE':
              pickedUp = this.player.addWeapon('PLASMA_RIFLE');
              this.player.addAmmo('CELLS', 40);
              this.logMessage('YOU GOT THE PLASMA RIFLE!');
              this.statusBar.doomFace.triggerGrin();
              break;
            case 'PICKUP_BFG':
              pickedUp = this.player.addWeapon('BFG_9000');
              this.player.addAmmo('CELLS', 80);
              this.logMessage('OH YES! YOU GOT THE BFG 9000!');
              this.statusBar.doomFace.triggerGrin();
              break;
          }

          if (pickedUp) {
            this.soundEngine.play(item.type.startsWith('KEY_') || item.type.startsWith('PICKUP_SHOTGUN') ? 'DSWPNUP' : 'DSITEMUP');
            return false;
          }
        }
        return true;
      });

      // 6. Update Particles
      this.particles.update(delta);

      // 7. Update Status Bar
      this.statusBar.update(delta);
    }

    // ==========================================
    // RENDERING PIPELINE
    // ==========================================
    const vCtx = this.viewportCanvas.getContext('2d');
    const sCtx = this.statusbarCanvas.getContext('2d');

    if (vCtx) {
      if (this.automap.isVisible) {
        // Render Automap
        const mapCanvas = this.automap.render(this.map, this.player, this.enemies);
        if (mapCanvas) {
          vCtx.drawImage(mapCanvas, 0, 0, this.viewportCanvas.width, this.viewportCanvas.height);
        }
      } else {
        // Render 3D Raycasted World
        const allEntities = [...this.enemies, ...this.pickups, ...this.projectiles, ...this.particles.particles];
        this.renderer.render(this.player.camera, this.map, allEntities, this.player, this.gameTime);
        this.renderer.framebuffer.renderToCanvas(vCtx, this.viewportCanvas.width, this.viewportCanvas.height);
      }

      // Render Title Menu Overlay if Open
      if (this.menu.isOpen) {
        this.menu.render(this.viewportCanvas);
      }
    }

    if (sCtx) {
      // Render Status Bar STBAR
      const stbarCanvas = this.statusBar.render(this.player);
      if (stbarCanvas) {
        sCtx.drawImage(stbarCanvas, 0, 0, this.statusbarCanvas.width, this.statusbarCanvas.height);
      }
    }

    requestAnimationFrame((t) => this.loop(t));
  }
}

// Bootstrap on DOM load
window.addEventListener('DOMContentLoaded', () => {
  new DoomGame();
});
