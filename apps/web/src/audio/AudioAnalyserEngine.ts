// 🔬 Precision Web Audio 5-Band Engine with Transient Peak Punch & Rest Periods

export interface AudioFrequencyBands {
  subBass: number;       // 20 - 90 Hz
  kick: number;          // 90 - 220 Hz
  lowMid: number;        // 220 - 600 Hz
  vocalMid: number;      // 600 - 3000 Hz
  highTreble: number;    // 3000 - 16000 Hz
  overallEnergy: number; // 0.0 - 1.0
  kickImpact: number;    // 0.0 - 1.0 Punchy kick pulse with refractory rest window
  snareFlash: number;    // 0.0 - 1.0 Specular halo flash from snare hits
  isKickHit: boolean;    // Single frame trigger
  isSnareHit: boolean;   // Single frame trigger
}

class AudioAnalyserEngine {
  private static instance: AudioAnalyserEngine;
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private currentAudioElement: HTMLAudioElement | null = null;
  private dataArray: Uint8Array<ArrayBuffer> | null = null;

  // Smoothing buffers for 60fps jitter-free visualizer
  private smoothedBands: AudioFrequencyBands = {
    subBass: 0,
    kick: 0,
    lowMid: 0,
    vocalMid: 0,
    highTreble: 0,
    overallEnergy: 0,
    kickImpact: 0,
    snareFlash: 0,
    isKickHit: false,
    isSnareHit: false,
  };

  private energyHistory: number[] = [];
  private readonly HISTORY_SIZE = 40;

  // Transient Peak Timing Guards (Refractory Cooldowns)
  private lastKickTimestamp = 0;
  private lastSnareTimestamp = 0;
  private readonly KICK_COOLDOWN_MS = 210; // Rest period between heavy bass hits for max punch
  private readonly SNARE_COOLDOWN_MS = 170; // Rest period between snare claps

  private constructor() {}

  public static getInstance(): AudioAnalyserEngine {
    if (!AudioAnalyserEngine.instance) {
      AudioAnalyserEngine.instance = new AudioAnalyserEngine();
    }
    return AudioAnalyserEngine.instance;
  }

  /**
   * Connect HTML5 Audio Element to Web Audio Context and AnalyserNode
   */
  public attachAudioElement(audioEl: HTMLAudioElement): void {
    if (this.currentAudioElement === audioEl && this.sourceNode) {
      return;
    }

    this.currentAudioElement = audioEl;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      if (!this.audioCtx) {
        this.audioCtx = new AudioContextClass();
      }

      if (!this.analyser) {
        this.analyser = this.audioCtx.createAnalyser();
        this.analyser.fftSize = 256;
        this.analyser.smoothingTimeConstant = 0.70;
        this.analyser.minDecibels = -85;
        this.analyser.maxDecibels = -15;
        this.dataArray = new Uint8Array(new ArrayBuffer(this.analyser.frequencyBinCount));
      }

      if (!this.sourceNode && this.audioCtx && this.analyser) {
        try {
          this.sourceNode = this.audioCtx.createMediaElementSource(audioEl);
          this.sourceNode.connect(this.analyser);
          this.analyser.connect(this.audioCtx.destination);
        } catch (e) {
          console.warn("Audio source node connection notice:", e);
        }
      }
    } catch (err) {
      console.warn("AudioAnalyserEngine attach error:", err);
    }
  }

  /**
   * Resume AudioContext on user interaction
   */
  public resumeContext(): void {
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      this.audioCtx.resume().catch(() => {});
    }
  }

  /**
   * Get raw byte frequency array for canvas waveform bars
   */
  public getByteFrequencyData(): Uint8Array {
    if (this.analyser && this.dataArray) {
      this.analyser.getByteFrequencyData(this.dataArray);
      return this.dataArray;
    }
    return new Uint8Array(32);
  }

  /**
   * Extract 5 granular real frequency bands + transient punch with refractory rest
   */
  public getBands(): AudioFrequencyBands {
    const now = performance.now();

    if (this.analyser && this.dataArray) {
      this.analyser.getByteFrequencyData(this.dataArray);
      const binCount = this.analyser.frequencyBinCount;
      const sampleRate = this.audioCtx ? this.audioCtx.sampleRate : 44100;
      const binHz = sampleRate / (binCount * 2);

      const getAverageInRange = (minHz: number, maxHz: number): number => {
        const startBin = Math.max(0, Math.floor(minHz / binHz));
        const endBin = Math.min(binCount - 1, Math.ceil(maxHz / binHz));
        if (startBin >= endBin) return (this.dataArray![startBin] || 0) / 255;

        let sum = 0;
        for (let i = startBin; i <= endBin; i++) {
          sum += this.dataArray![i];
        }
        return sum / ((endBin - startBin + 1) * 255);
      };

      const rawSub = getAverageInRange(20, 90);
      const rawKick = getAverageInRange(90, 220);
      const rawLowMid = getAverageInRange(220, 600);
      const rawVocal = getAverageInRange(600, 3000);
      const rawSnare = getAverageInRange(1200, 4500);
      const rawTreble = getAverageInRange(3000, 16000);
      const rawLowEnd = rawSub * 0.6 + rawKick * 0.4;
      const rawOverall = (rawSub * 0.35 + rawKick * 0.25 + rawLowMid * 0.15 + rawVocal * 0.15 + rawTreble * 0.1);

      let isKickHit = false;
      let isSnareHit = false;

      if (rawOverall > 0.01) {
        this.energyHistory.push(rawLowEnd);
        if (this.energyHistory.length > this.HISTORY_SIZE) {
          this.energyHistory.shift();
        }
        const avgLowEnd = this.energyHistory.reduce((a, b) => a + b, 0) / this.energyHistory.length;

        // 1. Kick / Bass Transient with Cooldown Rest Window
        if (rawLowEnd > avgLowEnd * 1.35 && rawLowEnd > 0.28 && (now - this.lastKickTimestamp > this.KICK_COOLDOWN_MS)) {
          isKickHit = true;
          this.lastKickTimestamp = now;
          this.smoothedBands.kickImpact = 1.0;
        }

        // 2. Snare / Mid-High Transient Flash with Cooldown
        if (rawSnare > 0.38 && rawSnare > (this.smoothedBands.lowMid * 1.2) && (now - this.lastSnareTimestamp > this.SNARE_COOLDOWN_MS)) {
          isSnareHit = true;
          this.lastSnareTimestamp = now;
          this.smoothedBands.snareFlash = 1.0;
        }

        const lerp = (curr: number, target: number, attack = 0.65, decay = 0.18) => {
          const rate = target > curr ? attack : decay;
          return curr + (target - curr) * rate;
        };

        this.smoothedBands.subBass = lerp(this.smoothedBands.subBass, rawSub, 0.75, 0.2);
        this.smoothedBands.kick = lerp(this.smoothedBands.kick, rawKick, 0.8, 0.2);
        this.smoothedBands.lowMid = lerp(this.smoothedBands.lowMid, rawLowMid, 0.5, 0.15);
        this.smoothedBands.vocalMid = lerp(this.smoothedBands.vocalMid, rawVocal, 0.5, 0.15);
        this.smoothedBands.highTreble = lerp(this.smoothedBands.highTreble, rawTreble, 0.6, 0.18);
        this.smoothedBands.overallEnergy = lerp(this.smoothedBands.overallEnergy, rawOverall, 0.6, 0.18);

        // Exponential Decay for punchy impact release
        this.smoothedBands.kickImpact *= 0.86;
        this.smoothedBands.snareFlash *= 0.80;

        this.smoothedBands.isKickHit = isKickHit;
        this.smoothedBands.isSnareHit = isSnareHit;

        return this.smoothedBands;
      }
    }

    // Decay when paused
    this.smoothedBands.subBass *= 0.85;
    this.smoothedBands.kick *= 0.85;
    this.smoothedBands.lowMid *= 0.85;
    this.smoothedBands.vocalMid *= 0.85;
    this.smoothedBands.highTreble *= 0.85;
    this.smoothedBands.overallEnergy *= 0.85;
    this.smoothedBands.kickImpact *= 0.85;
    this.smoothedBands.snareFlash *= 0.85;
    this.smoothedBands.isKickHit = false;
    this.smoothedBands.isSnareHit = false;
    return this.smoothedBands;
  }
}

export const audioAnalyserEngine = AudioAnalyserEngine.getInstance();
