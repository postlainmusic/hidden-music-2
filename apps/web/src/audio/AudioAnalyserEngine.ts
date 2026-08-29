// 🔬 Hardware-Accelerated Real-Time Web Audio 5-Band Frequency Engine

export interface AudioFrequencyBands {
  subBass: number;      // 20 - 90 Hz
  kick: number;         // 90 - 220 Hz
  lowMid: number;       // 220 - 600 Hz
  vocalMid: number;     // 600 - 3000 Hz
  highTreble: number;   // 3000 - 16000 Hz
  overallEnergy: number;// 0.0 - 1.0
  isBeat: boolean;
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
    isBeat: false,
  };

  private energyHistory: number[] = [];
  private readonly HISTORY_SIZE = 30;

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
        this.analyser.smoothingTimeConstant = 0.75;
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
          console.warn("Audio source node connection:", e);
        }
      }
    } catch (err) {
      console.warn("AudioAnalyserEngine attach notice:", err);
    }
  }

  /**
   * Resume AudioContext on any user gesture
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
   * Extract 5 granular real frequency bands + beat detection
   */
  public getBands(): AudioFrequencyBands {
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
      const rawTreble = getAverageInRange(3000, 16000);
      const rawOverall = (rawSub * 0.35 + rawKick * 0.25 + rawLowMid * 0.15 + rawVocal * 0.15 + rawTreble * 0.1);

      if (rawOverall > 0.01) {
        this.energyHistory.push(rawKick + rawSub);
        if (this.energyHistory.length > this.HISTORY_SIZE) {
          this.energyHistory.shift();
        }
        const avgEnergy = this.energyHistory.reduce((a, b) => a + b, 0) / this.energyHistory.length;
        const isInstantBeat = (rawKick + rawSub) > avgEnergy * 1.25 && (rawKick + rawSub) > 0.25;

        const lerp = (curr: number, target: number, attack = 0.55, decay = 0.15) => {
          const rate = target > curr ? attack : decay;
          return curr + (target - curr) * rate;
        };

        this.smoothedBands.subBass = lerp(this.smoothedBands.subBass, rawSub, 0.7, 0.18);
        this.smoothedBands.kick = lerp(this.smoothedBands.kick, rawKick, 0.8, 0.2);
        this.smoothedBands.lowMid = lerp(this.smoothedBands.lowMid, rawLowMid, 0.5, 0.15);
        this.smoothedBands.vocalMid = lerp(this.smoothedBands.vocalMid, rawVocal, 0.5, 0.15);
        this.smoothedBands.highTreble = lerp(this.smoothedBands.highTreble, rawTreble, 0.6, 0.18);
        this.smoothedBands.overallEnergy = lerp(this.smoothedBands.overallEnergy, rawOverall, 0.6, 0.18);
        this.smoothedBands.isBeat = isInstantBeat;

        return this.smoothedBands;
      }
    }

    // Decay to 0 when paused or idle
    this.smoothedBands.subBass *= 0.85;
    this.smoothedBands.kick *= 0.85;
    this.smoothedBands.lowMid *= 0.85;
    this.smoothedBands.vocalMid *= 0.85;
    this.smoothedBands.highTreble *= 0.85;
    this.smoothedBands.overallEnergy *= 0.85;
    this.smoothedBands.isBeat = false;
    return this.smoothedBands;
  }
}

export const audioAnalyserEngine = AudioAnalyserEngine.getInstance();
