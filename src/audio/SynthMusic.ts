/**
 * DOOM E1M1 "At Doom's Gate" Heavy Metal Synth Sequencer
 * Polyphonic bass guitar riff generator, drum machine, and melody sequencer in Web Audio.
 */

export class SynthMusic {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private isMuted: boolean = false;
  private timerId: number | null = null;
  private step: number = 0;
  private bpm: number = 135;
  private masterGain: GainNode | null = null;

  // Iconic E1M1 Riff Note Frequencies (E1, G1, Bb1, B1, C2, etc.)
  private bassNotes: (number | null)[] = [
    82.41, 82.41, 164.81, 82.41, 82.41, 146.83, 82.41, 82.41,
    130.81, 82.41, 82.41, 123.47, 82.41, 82.41, 116.54, 123.47,
  ];

  constructor() {}

  public init(): void {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 0.2, this.ctx.currentTime);
    }
  }

  public start(): void {
    if (this.isPlaying) return;
    this.init();
    this.isPlaying = true;
    this.step = 0;
    this.scheduleNextTick();
  }

  public stop(): void {
    this.isPlaying = false;
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  private scheduleNextTick(): void {
    if (!this.isPlaying) return;

    const stepDurationMs = (60 / this.bpm / 4) * 1000; // 16th notes
    this.playStep(this.step);
    this.step = (this.step + 1) % this.bassNotes.length;

    this.timerId = window.setTimeout(() => {
      this.scheduleNextTick();
    }, stepDurationMs);
  }

  private playStep(currentStep: number): void {
    if (this.isMuted || !this.ctx || !this.masterGain) return;

    const freq = this.bassNotes[currentStep];
    const t = this.ctx.currentTime;

    // 1. Heavy Distorted Bass Synth
    if (freq !== null) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, t);
      filter.frequency.exponentialRampToValueAtTime(150, t + 0.12);

      gain.gain.setValueAtTime(0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.13);
    }

    // 2. Drum Kick on steps 0, 4, 8, 12
    if (currentStep % 4 === 0) {
      this.playKick(t);
    }

    // 3. Snare on steps 4, 12
    if (currentStep === 4 || currentStep === 12) {
      this.playSnare(t);
    }

    // 4. Hi-Hat on every 2nd step
    if (currentStep % 2 === 0) {
      this.playHiHat(t);
    }
  }

  private playKick(t: number): void {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.15);

    gain.gain.setValueAtTime(0.6, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.16);
  }

  private playSnare(t: number): void {
    if (!this.ctx || !this.masterGain) return;
    const noiseBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.1, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < output.length; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1000, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    whiteNoise.start(t);
  }

  private playHiHat(t: number): void {
    if (!this.ctx || !this.masterGain) return;
    const noiseBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.04, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < output.length; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(5000, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    whiteNoise.start(t);
  }
}
