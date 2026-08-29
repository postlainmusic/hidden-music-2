// 🔬 High-Performance Web Audio API 5-Band Frequency Analyser Engine

export interface AudioFrequencyBands {
  subBass: number;      // 20 - 90 Hz (Physical space displacement, rumble, shockwaves)
  kick: number;         // 90 - 220 Hz (Beat bounce, disc hop, glow pulse)
  lowMid: number;       // 220 - 600 Hz (Aura bloom, bass guitar warmth)
  vocalMid: number;     // 600 - 3000 Hz (Aurora ribbons, melody waves)
  highTreble: number;   // 3000 - 16000 Hz (Stardust sparkle, micro-highlights)
  overallEnergy: number;// 0.0 - 1.0 overall normalized acoustic energy
  isBeat: boolean;      // Instantaneous transient beat spike detection
}

class AudioAnalyserEngine {
  private static instance: AudioAnalyserEngine;
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private currentAudioElement: HTMLAudioElement | null = null;
  private dataArray: Uint8Array<ArrayBuffer> | null = null;

  // EMA Lerped smoothing targets for 60fps jitter-free visualizer
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
  private readonly HISTORY_SIZE = 45;

  private constructor() {}

  public static getInstance(): AudioAnalyserEngine {
    if (!AudioAnalyserEngine.instance) {
      AudioAnalyserEngine.instance = new AudioAnalyserEngine();
    }
    return AudioAnalyserEngine.instance;
  }

  /**
   * Bind the HTML5 Audio element to Web Audio API graph
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

      if (this.audioCtx.state === "suspended") {
        const resumeCtx = () => {
          this.audioCtx?.resume();
          window.removeEventListener("click", resumeCtx);
          window.removeEventListener("touchstart", resumeCtx);
        };
        window.addEventListener("click", resumeCtx, { once: true });
        window.addEventListener("touchstart", resumeCtx, { once: true });
      }

      if (!this.analyser) {
        this.analyser = this.audioCtx.createAnalyser();
        this.analyser.fftSize = 2048;
        this.analyser.smoothingTimeConstant = 0.80;
        this.analyser.minDecibels = -90;
        this.analyser.maxDecibels = -10;
        this.dataArray = new Uint8Array(new ArrayBuffer(this.analyser.frequencyBinCount));
      }

      // Safe MediaElementSource creation (only once per audio element)
      if (!this.sourceNode && this.audioCtx && this.analyser) {
        try {
          this.sourceNode = this.audioCtx.createMediaElementSource(audioEl);
          this.sourceNode.connect(this.analyser);
          this.analyser.connect(this.audioCtx.destination);
        } catch (e) {
          console.warn("Web Audio MediaElementSource connection notice:", e);
        }
      }
    } catch (err) {
      console.warn("AudioAnalyserEngine initialization notice:", err);
    }
  }

  /**
   * Resume AudioContext if suspended by browser autoplay policy
   */
  public resumeContext(): void {
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }
  }

  /**
   * Extract 5 granular frequency bands + beat transient detection at 60fps
   */
  public getBands(isPlaying: boolean): AudioFrequencyBands {
    if (!isPlaying) {
      // Soft decay to 0 when paused
      this.smoothedBands.subBass *= 0.88;
      this.smoothedBands.kick *= 0.88;
      this.smoothedBands.lowMid *= 0.88;
      this.smoothedBands.vocalMid *= 0.88;
      this.smoothedBands.highTreble *= 0.88;
      this.smoothedBands.overallEnergy *= 0.88;
      this.smoothedBands.isBeat = false;
      return this.smoothedBands;
    }

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

      // Beat transient detection via sliding variance window
      this.energyHistory.push(rawKick + rawSub);
      if (this.energyHistory.length > this.HISTORY_SIZE) {
        this.energyHistory.shift();
      }
      const avgEnergy = this.energyHistory.reduce((a, b) => a + b, 0) / this.energyHistory.length;
      const isInstantBeat = (rawKick + rawSub) > avgEnergy * 1.32 && (rawKick + rawSub) > 0.35;

      // Transient-aware lerp: Attack fast (<16ms), decay smoothly
      const lerp = (curr: number, target: number, attack = 0.45, decay = 0.12) => {
        const rate = target > curr ? attack : decay;
        return curr + (target - curr) * rate;
      };

      this.smoothedBands.subBass = lerp(this.smoothedBands.subBass, rawSub, 0.6, 0.15);
      this.smoothedBands.kick = lerp(this.smoothedBands.kick, rawKick, 0.7, 0.18);
      this.smoothedBands.lowMid = lerp(this.smoothedBands.lowMid, rawLowMid, 0.4, 0.12);
      this.smoothedBands.vocalMid = lerp(this.smoothedBands.vocalMid, rawVocal, 0.4, 0.12);
      this.smoothedBands.highTreble = lerp(this.smoothedBands.highTreble, rawTreble, 0.5, 0.15);
      this.smoothedBands.overallEnergy = lerp(this.smoothedBands.overallEnergy, rawOverall, 0.5, 0.14);
      this.smoothedBands.isBeat = isInstantBeat;

      return this.smoothedBands;
    }

    // High-fidelity algorithmic simulation fallback if AudioContext is blocked by browser policy
    const t = Date.now() / 180;
    const synthBeat = Math.max(0, Math.sin(t * 1.2)) > 0.85;
    this.smoothedBands.subBass = (Math.sin(t * 0.9) * 0.5 + 0.5) * 0.7 + (synthBeat ? 0.3 : 0);
    this.smoothedBands.kick = synthBeat ? 0.95 : 0.25;
    this.smoothedBands.lowMid = (Math.cos(t * 0.7) * 0.5 + 0.5) * 0.55;
    this.smoothedBands.vocalMid = (Math.sin(t * 1.5) * 0.5 + 0.5) * 0.6;
    this.smoothedBands.highTreble = (Math.cos(t * 2.1) * 0.5 + 0.5) * 0.5;
    this.smoothedBands.overallEnergy = 0.65;
    this.smoothedBands.isBeat = synthBeat;

    return this.smoothedBands;
  }
}

export const audioAnalyserEngine = AudioAnalyserEngine.getInstance();
