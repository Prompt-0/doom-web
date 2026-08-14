/**
 * Web Audio API Procedural Sound Synthesizer
 * Generates 100% native retro sound effects with zero external audio assets.
 */

export class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;

  constructor() {}

  public init(): void {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 0.3, this.ctx.currentTime);
    }
  }

  public play(soundName: string): void {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;

    switch (soundName) {
      // Pistol / Chaingun Fire
      case 'DSPISTOL': {
        this.createNoiseBurst(0.12, 1200, 0.4);
        this.createOscTone('sawtooth', 300, 80, 0.1, 0.5);
        break;
      }

      // Shotgun Fire
      case 'DSSHOTGN': {
        this.createNoiseBurst(0.25, 800, 0.8);
        this.createOscTone('square', 140, 40, 0.2, 0.7);
        break;
      }

      // Super Shotgun Blast
      case 'DSSG': {
        this.createNoiseBurst(0.4, 600, 1.0);
        this.createOscTone('sawtooth', 120, 30, 0.35, 0.9);
        break;
      }

      // Rocket Fire
      case 'DSFIRRKT': {
        this.createOscTone('sine', 180, 500, 0.35, 0.6);
        this.createNoiseBurst(0.3, 400, 0.5);
        break;
      }

      // Explosion
      case 'DSEXPLO': {
        this.createNoiseBurst(0.65, 350, 1.0);
        this.createOscTone('square', 90, 20, 0.5, 0.8);
        break;
      }

      // Plasma Rifle Fire
      case 'DSPLASMA': {
        this.createOscTone('sawtooth', 850, 150, 0.12, 0.5);
        break;
      }

      // BFG 9000 Charge / Blast
      case 'DSBFG': {
        this.createOscTone('sine', 150, 950, 0.75, 0.7);
        break;
      }

      // Chainsaw Motor
      case 'DSSAWFUL': {
        this.createOscTone('sawtooth', 80, 140, 0.15, 0.4);
        break;
      }

      // Claw / Damage Hit
      case 'DSCLAW': {
        this.createNoiseBurst(0.1, 1500, 0.4);
        this.createOscTone('triangle', 200, 50, 0.15, 0.4);
        break;
      }

      // Player OOF / Grunt
      case 'DSOOF': {
        this.createOscTone('sine', 120, 45, 0.2, 0.6);
        break;
      }

      // Item Pickup Chime
      case 'DSITEMUP': {
        this.createChime(1200, 1600, 0.15);
        break;
      }

      // Weapon / Key Pickup
      case 'DSWPNUP': {
        this.createChime(800, 1400, 0.25);
        break;
      }

      // Door Open / Close
      case 'DSDOROPN': {
        this.createOscTone('sawtooth', 60, 45, 0.6, 0.4);
        this.createNoiseBurst(0.5, 300, 0.3);
        break;
      }

      default:
        break;
    }
  }

  private createNoiseBurst(duration: number, cutoff: number, volume: number): void {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(cutoff, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + duration);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    whiteNoise.start();
  }

  private createOscTone(
    type: OscillatorType,
    startFreq: number,
    endFreq: number,
    duration: number,
    volume: number
  ): void {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(startFreq, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(Math.max(10, endFreq), this.ctx.currentTime + duration);

    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  private createChime(freq1: number, freq2: number, duration: number): void {
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq1, t);
    osc.frequency.setValueAtTime(freq2, t + duration * 0.5);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + duration);
  }
}
