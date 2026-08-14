/**
 * Universal Input Manager
 * Handles keyboard bindings, pointer lock mouse look, mouse clicks, and touch events.
 */

export interface InputState {
  forward: number;
  strafe: number;
  turn: number;
  mouseDeltaX: number;
  mouseDeltaY: number;
  shoot: boolean;
  use: boolean;
  weaponSlot?: number;
  toggleMap: boolean;
  toggleMenu: boolean;
}

export class InputManager {
  private keys: Set<string> = new Set();
  private mouseDeltaX: number = 0;
  private mouseDeltaY: number = 0;
  private isMouseDown: boolean = false;
  private isPointerLocked: boolean = false;
  private queuedWeaponSlot?: number;
  private queuedToggleMap: boolean = false;
  private queuedToggleMenu: boolean = false;
  private targetCanvas: HTMLCanvasElement | null = null;
  public onKeyPress?: (key: string) => void;

  constructor() {
    this.setupListeners();
  }

  public attachCanvas(canvas: HTMLCanvasElement): void {
    this.targetCanvas = canvas;
    canvas.addEventListener('click', () => {
      if (!this.isPointerLocked) {
        canvas.requestPointerLock?.();
      }
    });
  }

  private setupListeners(): void {
    window.addEventListener('keydown', (e) => {
      this.keys.add(e.code);

      if (this.onKeyPress) {
        this.onKeyPress(e.key);
      }

      if (e.code === 'Tab') {
        e.preventDefault();
        this.queuedToggleMap = true;
      }
      if (e.code === 'Escape') {
        this.queuedToggleMenu = true;
      }

      // 1 to 7 weapon shortcuts
      if (e.code.startsWith('Digit')) {
        const slot = parseInt(e.code.replace('Digit', ''), 10);
        if (slot >= 1 && slot <= 7) {
          this.queuedWeaponSlot = slot;
        }
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.code);
    });

    window.addEventListener('mousedown', (e) => {
      if (e.button === 0) this.isMouseDown = true;
    });

    window.addEventListener('mouseup', (e) => {
      if (e.button === 0) this.isMouseDown = false;
    });

    window.addEventListener('mousemove', (e) => {
      if (document.pointerLockElement === this.targetCanvas) {
        this.isPointerLocked = true;
        this.mouseDeltaX += e.movementX;
        this.mouseDeltaY += e.movementY;
      } else {
        this.isPointerLocked = false;
      }
    });

    document.addEventListener('pointerlockchange', () => {
      this.isPointerLocked = document.pointerLockElement === this.targetCanvas;
    });

    window.addEventListener('wheel', (e) => {
      if (e.deltaY < 0) {
        // Next weapon
        this.queuedWeaponSlot = ((this.queuedWeaponSlot || 1) % 7) + 1;
      } else if (e.deltaY > 0) {
        this.queuedWeaponSlot = ((this.queuedWeaponSlot || 2) - 2 + 7) % 7 + 1;
      }
    });
  }

  public poll(): InputState {
    let forward = 0;
    let strafe = 0;
    let turn = 0;

    if (this.keys.has('KeyW') || this.keys.has('ArrowUp')) forward += 1;
    if (this.keys.has('KeyS') || this.keys.has('ArrowDown')) forward -= 1;
    if (this.keys.has('KeyA')) strafe -= 1;
    if (this.keys.has('KeyD')) strafe += 1;

    // Arrow keys turning if mouse not locked
    if (this.keys.has('ArrowLeft')) turn -= 1;
    if (this.keys.has('ArrowRight')) turn += 1;

    const use = this.keys.has('KeyE') || this.keys.has('Space');
    const shoot = this.isMouseDown || this.keys.has('ControlLeft') || this.keys.has('KeyF');

    const state: InputState = {
      forward,
      strafe,
      turn,
      mouseDeltaX: this.mouseDeltaX,
      mouseDeltaY: this.mouseDeltaY,
      shoot,
      use,
      weaponSlot: this.queuedWeaponSlot,
      toggleMap: this.queuedToggleMap,
      toggleMenu: this.queuedToggleMenu,
    };

    // Reset single-frame delta queues
    this.mouseDeltaX = 0;
    this.mouseDeltaY = 0;
    this.queuedWeaponSlot = undefined;
    this.queuedToggleMap = false;
    this.queuedToggleMenu = false;

    return state;
  }
}
