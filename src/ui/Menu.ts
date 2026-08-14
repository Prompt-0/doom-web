/**
 * DOOM Menu & Title Screen Component
 */

export interface MenuCallbacks {
  onStartGame: (level: 'E1M1' | 'E1M2' | 'E1M8' | 'CUSTOM', difficulty: number) => void;
  onOpenEditor: () => void;
  onToggleAudio: () => void;
}

export class Menu {
  public isOpen: boolean = true;
  private selectedIndex: number = 0;
  private currentSubmenu: 'MAIN' | 'DIFFICULTY' | 'LEVELS' | 'CONTROLS' = 'MAIN';
  private selectedLevel: 'E1M1' | 'E1M2' | 'E1M8' | 'CUSTOM' = 'E1M1';
  private callbacks: MenuCallbacks;

  private mainItems = ['NEW GAME', 'SELECT LEVEL', 'LEVEL EDITOR', 'CONTROLS', 'MUTE AUDIO'];
  private difficultyItems = [
    "I'M TOO YOUNG TO DIE",
    'HEY, NOT TOO ROUGH',
    'HURT ME PLENTY',
    'ULTRA-VIOLENCE',
    'NIGHTMARE!',
  ];
  private levelItems = ['E1M1: HANGAR', 'E1M2: NUCLEAR PLANT', 'E1M8: PHOBOS ANOMALY', 'CUSTOM LEVEL'];

  constructor(callbacks: MenuCallbacks) {
    this.callbacks = callbacks;
  }

  public handleInput(key: string): void {
    if (!this.isOpen) return;

    if (key === 'ArrowUp' || key === 'KeyW') {
      this.selectedIndex = (this.selectedIndex - 1 + this.getItemCount()) % this.getItemCount();
    } else if (key === 'ArrowDown' || key === 'KeyS') {
      this.selectedIndex = (this.selectedIndex + 1) % this.getItemCount();
    } else if (key === 'Enter' || key === 'Space') {
      this.selectCurrent();
    } else if (key === 'Escape') {
      if (this.currentSubmenu !== 'MAIN') {
        this.currentSubmenu = 'MAIN';
        this.selectedIndex = 0;
      }
    }
  }

  private getItemCount(): number {
    if (this.currentSubmenu === 'MAIN') return this.mainItems.length;
    if (this.currentSubmenu === 'DIFFICULTY') return this.difficultyItems.length;
    if (this.currentSubmenu === 'LEVELS') return this.levelItems.length;
    return 1;
  }

  private selectCurrent(): void {
    if (this.currentSubmenu === 'MAIN') {
      if (this.selectedIndex === 0) {
        // New Game -> Difficulty
        this.currentSubmenu = 'DIFFICULTY';
        this.selectedIndex = 2; // Default Hurt Me Plenty
      } else if (this.selectedIndex === 1) {
        // Select Level
        this.currentSubmenu = 'LEVELS';
        this.selectedIndex = 0;
      } else if (this.selectedIndex === 2) {
        // Level Editor
        this.callbacks.onOpenEditor();
      } else if (this.selectedIndex === 3) {
        // Controls
        this.currentSubmenu = 'CONTROLS';
        this.selectedIndex = 0;
      } else if (this.selectedIndex === 4) {
        // Mute
        this.callbacks.onToggleAudio();
      }
    } else if (this.currentSubmenu === 'DIFFICULTY') {
      this.isOpen = false;
      this.callbacks.onStartGame(this.selectedLevel, this.selectedIndex);
    } else if (this.currentSubmenu === 'LEVELS') {
      const levels: ('E1M1' | 'E1M2' | 'E1M8' | 'CUSTOM')[] = ['E1M1', 'E1M2', 'E1M8', 'CUSTOM'];
      this.selectedLevel = levels[this.selectedIndex];
      this.currentSubmenu = 'DIFFICULTY';
      this.selectedIndex = 2;
    } else if (this.currentSubmenu === 'CONTROLS') {
      this.currentSubmenu = 'MAIN';
      this.selectedIndex = 0;
    }
  }

  public render(canvas: HTMLCanvasElement): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = 'rgba(10, 10, 12, 0.92)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Title Header
    ctx.textAlign = 'center';
    ctx.font = 'bold 36px monospace';
    ctx.fillStyle = '#b01010';
    ctx.fillText('D O O M', canvas.width / 2, 45);

    ctx.font = 'bold 10px monospace';
    ctx.fillStyle = '#e0a020';
    ctx.fillText('1993 RETRO FPS ENGINE & WEB RECREATION', canvas.width / 2, 62);

    ctx.fillStyle = '#555560';
    ctx.fillRect(40, 72, canvas.width - 80, 2);

    // Render Submenu Items
    if (this.currentSubmenu === 'MAIN') {
      this.mainItems.forEach((item, idx) => {
        const isSel = idx === this.selectedIndex;
        ctx.font = isSel ? 'bold 14px monospace' : '12px monospace';
        ctx.fillStyle = isSel ? '#ff3020' : '#cccccc';

        const text = isSel ? `> ${item} <` : item;
        ctx.fillText(text, canvas.width / 2, 105 + idx * 20);
      });
    } else if (this.currentSubmenu === 'DIFFICULTY') {
      ctx.font = 'bold 12px monospace';
      ctx.fillStyle = '#e0c030';
      ctx.fillText('SELECT SKILL LEVEL:', canvas.width / 2, 90);

      this.difficultyItems.forEach((item, idx) => {
        const isSel = idx === this.selectedIndex;
        ctx.font = isSel ? 'bold 13px monospace' : '11px monospace';
        ctx.fillStyle = isSel ? '#ff3020' : '#aaaaaa';

        const text = isSel ? `> ${item} <` : item;
        ctx.fillText(text, canvas.width / 2, 115 + idx * 18);
      });
    } else if (this.currentSubmenu === 'LEVELS') {
      ctx.font = 'bold 12px monospace';
      ctx.fillStyle = '#e0c030';
      ctx.fillText('CHOOSE MISSION:', canvas.width / 2, 90);

      this.levelItems.forEach((item, idx) => {
        const isSel = idx === this.selectedIndex;
        ctx.font = isSel ? 'bold 13px monospace' : '11px monospace';
        ctx.fillStyle = isSel ? '#ff3020' : '#aaaaaa';

        const text = isSel ? `> ${item} <` : item;
        ctx.fillText(text, canvas.width / 2, 115 + idx * 20);
      });
    } else if (this.currentSubmenu === 'CONTROLS') {
      ctx.font = 'bold 12px monospace';
      ctx.fillStyle = '#e0c030';
      ctx.fillText('MISSION BRIEFING & CONTROLS', canvas.width / 2, 90);

      ctx.font = '10px monospace';
      ctx.fillStyle = '#dddddd';
      ctx.fillText('WASD / ARROWS : Move & Strafe', canvas.width / 2, 112);
      ctx.fillText('MOUSE LOOK : Aim (Click for Pointer Lock)', canvas.width / 2, 126);
      ctx.fillText('LEFT CLICK / CTRL : Fire Weapon', canvas.width / 2, 140);
      ctx.fillText('SPACE / E : Open Doors & Switches', canvas.width / 2, 154);
      ctx.fillText('1 - 7 : Select Weapon Arsenal', canvas.width / 2, 168);
      ctx.fillText('TAB : Automap   |   ESC : Pause Menu', canvas.width / 2, 182);

      ctx.fillStyle = '#ff4040';
      ctx.fillText('[PRESS ENTER TO RETURN]', canvas.width / 2, 202);
    }
  }
}
