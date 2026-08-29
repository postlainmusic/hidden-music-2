import { getGroundTruthProfile, GroundTruthTrackProfile } from "./hvlGroundTruthRhythmGrid";

export interface StudioBeatState {
  // Real-time detected tempo (BPM) & Ground-Truth Tonality
  liveBpm: number;
  bpmConfidence: number;     // 0.0 - 1.0
  rootKey: string;           // e.g. "C#", "D", "G#", "A"
  firstBeatOffsetMs: number; // e.g. 186ms
  isGroundTruthLocked: boolean; // True when locked to 96kHz Lossless FLAC grid

  // Continuous Beat Phase Clock
  beatProgress: number;  // 0.0 -> 1.0 within current beat
  beatPhase: number;     // -Math.PI -> +Math.PI
  currentBeat: number;   // Elapsed beat counter
  currentBar: number;    // Elapsed 4-beat bar counter (1-2-3-4 measure)
  beatInBar: number;     // 1, 2, 3, or 4

  // Discrete Frame Triggers (True only for 1 frame)
  isBeatHit: boolean;    // Hit on regular beat
  isDownbeat: boolean;   // Hit on Beat 1 of a 4-beat measure
  isSubHit: boolean;     // Hit on deep 808 rumble / sub-bass swell (20-65Hz)
  isKickHit: boolean;    // Hit on punchy kick drum / ghost kick (65-160Hz)
  isBassHit: boolean;    // Hit on melodic bassline / upper bass pluck (160-320Hz)
  isKickRoll: boolean;   // Hit on rapid 1/16th or 1/32th kick roll (50ms - 130ms)
  isSnareHit: boolean;   // Hit on crisp snare / clap / high transient

  // Distinct Envelopes for Visual Layering (Exponential Decay)
  subImpact: number;         // 0.0 - 1.0 (Deep sub-harmonic rumble & vibration)
  kickImpact: number;        // 0.0 - 1.0 (Sharp mechanical punch & shockwave)
  bassImpact: number;        // 0.0 - 1.0 (Melodic aura color swell & particle swirl)
  kickRollIntensity: number; // 0.0 - 1.0 (Accumulator for rapid rolls)
  snareFlash: number;        // 0.0 - 1.0 (Specular white halo & starlight sparkle)
  downbeatPulse: number;     // 0.0 - 1.0 (Expansive scene pulse)
  overallEnergy: number;     // 0.0 - 1.0 (Total spectrum energy)

  // Granular Frequency Bands (0.0 - 1.0)
  subBass: number;       // 20 - 65 Hz (Deep 808 Sub Rumble)
  kick: number;          // 65 - 160 Hz (Punchy Kick Transient)
  upperBass: number;     // 160 - 320 Hz (Melodic Bassline / Bass Plucks)
  lowMid: number;        // 320 - 800 Hz (Warmth / Instrumental Body)
  vocalMid: number;      // 800 - 3000 Hz (Lead Vocals / Presence)
  highTreble: number;    // 3000 - 16000 Hz (Air / Snare / Cymbals)
}

export class StudioBeatEngine {
  private static instance: StudioBeatEngine;

  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private currentAudioElement: HTMLAudioElement | null = null;

  // Pre-allocated typed arrays for zero-allocation 60fps loop
  private frequencyData: Uint8Array<ArrayBuffer> | null = null;
  private prevFrequencyData: Float32Array | null = null;
  private prevBandEnergy: Float32Array = new Float32Array(6);
  private bandVelocity: Float32Array = new Float32Array(6);

  // Independent Spectral Flux & History Buffers for Sub, Kick, Bass, Snare
  private subHistory: Float32Array = new Float32Array(35);
  private subHistoryIndex = 0;
  private kickHistory: Float32Array = new Float32Array(35);
  private kickHistoryIndex = 0;
  private bassHistory: Float32Array = new Float32Array(35);
  private bassHistoryIndex = 0;
  private snareHistory: Float32Array = new Float32Array(35);
  private snareHistoryIndex = 0;

  // Onset Timestamps for Live Inter-Onset Interval (IOI) Clustering
  private onsetTimestamps: number[] = [];
  private readonly MAX_ONSETS = 40;
  private bpmIntervalBuckets: Map<number, number> = new Map();

  // Timing & Cooldown Guards
  private lastSubTime = 0;
  private lastKickTime = 0;
  private lastBassTime = 0;
  private lastSnareTime = 0;
  private lastBeatTime = 0;
  private lastDownbeatTime = 0;

  // Micro-cooldowns
  private readonly SUB_COOLDOWN_MS = 90;
  private readonly KICK_MIN_COOLDOWN_MS = 50;  // Allows ultra-fast 1/32th rolls (up to 20 hits/sec)
  private readonly KICK_ROLL_WINDOW_MS = 140;
  private readonly BASS_COOLDOWN_MS = 80;
  private readonly SNARE_COOLDOWN_MS = 110;

  // Tempo & Phase-Locked Loop (PLL)
  private estimatedBpm = 128.0;
  private smoothedBpm = 128.0;
  private bpmConfidence = 0.5;
  private beatPhaseAcc = 0;
  private beatCounter = 0;
  private barCounter = 0;
  private lastEngineUpdateTime = 0;

  // Static Output State
  private state: StudioBeatState = {
    liveBpm: 128,
    bpmConfidence: 0.5,
    rootKey: "C",
    firstBeatOffsetMs: 0,
    isGroundTruthLocked: false,
    beatProgress: 0,
    beatPhase: 0,
    currentBeat: 0,
    currentBar: 0,
    beatInBar: 1,
    isBeatHit: false,
    isDownbeat: false,
    isSubHit: false,
    isKickHit: false,
    isBassHit: false,
    isKickRoll: false,
    isSnareHit: false,
    subImpact: 0,
    kickImpact: 0,
    bassImpact: 0,
    kickRollIntensity: 0,
    snareFlash: 0,
    downbeatPulse: 0,
    overallEnergy: 0,
    subBass: 0,
    kick: 0,
    upperBass: 0,
    lowMid: 0,
    vocalMid: 0,
    highTreble: 0,
  };

  private constructor() {}

  public static getInstance(): StudioBeatEngine {
    if (!StudioBeatEngine.instance) {
      StudioBeatEngine.instance = new StudioBeatEngine();
    }
    return StudioBeatEngine.instance;
  }

  /**
   * Connect HTML5 Audio Element to AudioContext & AnalyserNode
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
        this.analyser.fftSize = 2048;
        this.analyser.smoothingTimeConstant = 0.50; // Faster response to subtle ghost kicks
        this.analyser.minDecibels = -95;
        this.analyser.maxDecibels = -10;

        const binCount = this.analyser.frequencyBinCount;
        this.frequencyData = new Uint8Array(new ArrayBuffer(binCount));
        this.prevFrequencyData = new Float32Array(binCount);
      }

      if (!this.sourceNode && this.audioCtx && this.analyser) {
        try {
          this.sourceNode = this.audioCtx.createMediaElementSource(audioEl);
          this.sourceNode.connect(this.analyser);
          this.analyser.connect(this.audioCtx.destination);
        } catch (e) {
          console.warn("StudioBeatEngine: Media element connection note:", e);
        }
      }
    } catch (err) {
      console.warn("StudioBeatEngine attach error:", err);
    }
  }

  private activeGroundTruthProfile: GroundTruthTrackProfile | null = null;
  private lastGridBeatIdx = -1;

  public setTrack(trackIdOrTitle?: string | null): void {
    if (!trackIdOrTitle) {
      this.activeGroundTruthProfile = null;
      this.lastGridBeatIdx = -1;
      return;
    }
    this.activeGroundTruthProfile = getGroundTruthProfile(trackIdOrTitle);
    this.lastGridBeatIdx = -1;
    if (this.activeGroundTruthProfile) {
      this.estimatedBpm = this.activeGroundTruthProfile.bpm;
      this.smoothedBpm = this.activeGroundTruthProfile.bpm;
      this.bpmConfidence = 0.98;
      this.state.liveBpm = Math.round(this.activeGroundTruthProfile.bpm);
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
   * Main 60fps Real-Time Beat State Computation (Zero Memory Allocation)
   */
  public update(): StudioBeatState {
    const now = performance.now();
    const dt = this.lastEngineUpdateTime > 0 ? (now - this.lastEngineUpdateTime) / 1000 : 0.016;
    this.lastEngineUpdateTime = now;

    // Reset single-frame trigger flags
    this.state.isBeatHit = false;
    this.state.isDownbeat = false;
    this.state.isSubHit = false;
    this.state.isKickHit = false;
    this.state.isBassHit = false;
    this.state.isKickRoll = false;
    this.state.isSnareHit = false;

    // 0. GROUND-TRUTH 96kHz LOSSLESS BEAT GRID SYNCHRONIZATION
    if (this.currentAudioElement && this.activeGroundTruthProfile) {
      const currentTime = this.currentAudioElement.currentTime;
      this.state.isGroundTruthLocked = true;
      this.state.rootKey = this.activeGroundTruthProfile.rootKey;
      this.state.firstBeatOffsetMs = this.activeGroundTruthProfile.firstBeatOffsetMs;
      this.state.liveBpm = Math.round(this.activeGroundTruthProfile.bpm);
      this.state.bpmConfidence = 0.99;

      const grid = this.activeGroundTruthProfile.beatGrid;
      for (let i = Math.max(0, this.lastGridBeatIdx - 2); i < grid.length; i++) {
        const diff = currentTime - grid[i];
        if (Math.abs(diff) < 0.040 && i !== this.lastGridBeatIdx) {
          this.lastGridBeatIdx = i;
          this.state.isBeatHit = true;
          this.state.currentBeat = i + 1;
          this.state.beatInBar = (i % 4) + 1;
          if (this.state.beatInBar === 1) {
            this.state.isDownbeat = true;
            this.state.downbeatPulse = 1.0;
          }
          break;
        } else if (grid[i] > currentTime + 0.06) {
          break;
        }
      }

      const rolls = this.activeGroundTruthProfile.fastKickRolls;
      for (let i = 0; i < rolls.length; i++) {
        if (Math.abs(currentTime - rolls[i]) < 0.045) {
          this.state.isKickRoll = true;
          this.state.kickRollIntensity = Math.min(1.0, this.state.kickRollIntensity + 0.60);
          break;
        }
      }
    } else {
      this.state.isGroundTruthLocked = false;
    }

    if (!this.analyser || !this.frequencyData || !this.prevFrequencyData) {
      this.decayState();
      return this.state;
    }

    this.analyser.getByteFrequencyData(this.frequencyData);

    const binCount = this.analyser.frequencyBinCount;
    const sampleRate = this.audioCtx ? this.audioCtx.sampleRate : 44100;
    const binHz = sampleRate / (binCount * 2);

    // ─────────────────────────────────────────────────────────────
    // 1. EXTRACT 6 GRANULAR SUB-BANDS WITH ISOLATED SUB / KICK / BASS
    // ─────────────────────────────────────────────────────────────
    const getBandAverage = (minHz: number, maxHz: number): number => {
      const startBin = Math.max(0, Math.floor(minHz / binHz));
      const endBin = Math.min(binCount - 1, Math.ceil(maxHz / binHz));
      if (startBin >= endBin) return (this.frequencyData![startBin] || 0) / 255;

      let sum = 0;
      for (let i = startBin; i <= endBin; i++) {
        sum += this.frequencyData![i];
      }
      return sum / ((endBin - startBin + 1) * 255);
    };

    // Granular Low-End Frequency Isolation:
    const rawSub = getBandAverage(20, 65);       // Deep 808 Rumble & Sub Swell
    const rawKick = getBandAverage(65, 160);     // Punchy Kick Drum Transients
    const rawBass = getBandAverage(160, 320);    // Melodic Upper Bass / 808 Harmonics
    const rawLowMid = getBandAverage(320, 800);  // Body & Warmth
    const rawVocal = getBandAverage(800, 3000);  // Lead Vocals & Presence
    const rawSnare = getBandAverage(1000, 4500); // Snare / Claps
    const rawTreble = getBandAverage(3000, 16000);// Air / Cymbals

    const rawOverall = rawSub * 0.25 + rawKick * 0.25 + rawBass * 0.15 + rawLowMid * 0.12 + rawVocal * 0.13 + rawTreble * 0.10;

    // Calculate Band First-Derivative Velocity (dE/dt)
    this.bandVelocity[0] = (rawSub - this.prevBandEnergy[0]) / Math.max(0.001, dt);
    this.bandVelocity[1] = (rawKick - this.prevBandEnergy[1]) / Math.max(0.001, dt);
    this.bandVelocity[2] = (rawBass - this.prevBandEnergy[2]) / Math.max(0.001, dt);
    this.bandVelocity[3] = (rawLowMid - this.prevBandEnergy[3]) / Math.max(0.001, dt);
    this.bandVelocity[4] = (rawVocal - this.prevBandEnergy[4]) / Math.max(0.001, dt);
    this.bandVelocity[5] = (rawTreble - this.prevBandEnergy[5]) / Math.max(0.001, dt);

    this.prevBandEnergy[0] = rawSub;
    this.prevBandEnergy[1] = rawKick;
    this.prevBandEnergy[2] = rawBass;
    this.prevBandEnergy[3] = rawLowMid;
    this.prevBandEnergy[4] = rawVocal;
    this.prevBandEnergy[5] = rawTreble;

    // ─────────────────────────────────────────────────────────────
    // 2. MULTI-CHANNEL TRANSIENT DETECTION: SEPARATED SUB / KICK / BASS
    // ─────────────────────────────────────────────────────────────
    if (rawOverall > 0.003) {
      // A. SUB-BASS TRANSIENT DETECTOR (20 - 65 Hz)
      this.subHistory[this.subHistoryIndex % this.subHistory.length] = rawSub;
      this.subHistoryIndex++;
      let subSum = 0;
      for (let i = 0; i < this.subHistory.length; i++) subSum += this.subHistory[i];
      const avgSub = subSum / this.subHistory.length;

      const timeSinceLastSub = now - this.lastSubTime;
      const subThreshold = Math.max(0.025, avgSub * 1.12);
      const isSubOnset = (rawSub > subThreshold || (this.bandVelocity[0] > 0.9 && rawSub > 0.02)) &&
                         (timeSinceLastSub > this.SUB_COOLDOWN_MS);

      if (isSubOnset) {
        this.state.isSubHit = true;
        this.lastSubTime = now;
        this.state.subImpact = Math.min(1.0, rawSub * 2.2 + 0.3);
      }

      // B. PUNCHY KICK & FAST KICK ROLL DETECTOR (65 - 160 Hz)
      // Uses Adaptive Ghost-Kick Sensitivity for soft & close hits
      this.kickHistory[this.kickHistoryIndex % this.kickHistory.length] = rawKick;
      this.kickHistoryIndex++;
      let kickSum = 0;
      const kLen = this.kickHistory.length;
      for (let i = 0; i < kLen; i++) kickSum += this.kickHistory[i];
      const avgKick = kickSum / kLen;

      let kickVarSum = 0;
      for (let i = 0; i < kLen; i++) {
        const d = this.kickHistory[i] - avgKick;
        kickVarSum += d * d;
      }
      const kickStdDev = Math.sqrt(kickVarSum / kLen);

      const timeSinceLastKick = now - this.lastKickTime;

      // Adaptive dynamic floor: if close to previous hit (50-180ms), relax threshold by 25% for ghost notes
      const isGhostWindow = timeSinceLastKick >= this.KICK_MIN_COOLDOWN_MS && timeSinceLastKick <= 180;
      const thresholdRelaxation = isGhostWindow ? 0.75 : 1.0;
      const kickThreshold = Math.max(0.020, (avgKick + kickStdDev * 0.85) * thresholdRelaxation);

      const isKickOnset = (rawKick > kickThreshold || (this.bandVelocity[1] > 0.95 && rawKick > 0.022)) &&
                          (timeSinceLastKick > this.KICK_MIN_COOLDOWN_MS);

      if (isKickOnset) {
        this.state.isKickHit = true;
        this.lastKickTime = now;

        // Check if this is a FAST KICK ROLL (subsequent hit within 50ms - 140ms)
        if (timeSinceLastKick <= this.KICK_ROLL_WINDOW_MS) {
          this.state.isKickRoll = true;
          this.state.kickRollIntensity = Math.min(1.0, this.state.kickRollIntensity + 0.50);
        }

        this.state.kickImpact = Math.min(1.0, Math.max(0.65, rawKick * 2.0));
        this.recordOnset(now);
      }

      // C. UPPER BASS / MELODIC BASSLINE DETECTOR (160 - 320 Hz)
      this.bassHistory[this.bassHistoryIndex % this.bassHistory.length] = rawBass;
      this.bassHistoryIndex++;
      let bassSum = 0;
      for (let i = 0; i < this.bassHistory.length; i++) bassSum += this.bassHistory[i];
      const avgBass = bassSum / this.bassHistory.length;

      const timeSinceLastBass = now - this.lastBassTime;
      const bassThreshold = Math.max(0.028, avgBass * 1.15);
      const isBassOnset = (rawBass > bassThreshold || (this.bandVelocity[2] > 1.1 && rawBass > 0.025)) &&
                          (timeSinceLastBass > this.BASS_COOLDOWN_MS);

      if (isBassOnset) {
        this.state.isBassHit = true;
        this.lastBassTime = now;
        this.state.bassImpact = Math.min(1.0, rawBass * 2.0 + 0.2);
      }

      // D. SNARE / TRANSIENT DETECTOR (1000 - 4500 Hz)
      this.snareHistory[this.snareHistoryIndex % this.snareHistory.length] = rawSnare;
      this.snareHistoryIndex++;
      let snareSum = 0;
      for (let i = 0; i < this.snareHistory.length; i++) snareSum += this.snareHistory[i];
      const avgSnare = snareSum / this.snareHistory.length;

      const timeSinceLastSnare = now - this.lastSnareTime;
      const isSnareOnset = (rawSnare > avgSnare * 1.20 && rawSnare > 0.05) &&
                           (timeSinceLastSnare > this.SNARE_COOLDOWN_MS);

      if (isSnareOnset) {
        this.state.isSnareHit = true;
        this.lastSnareTime = now;
        this.state.snareFlash = 1.0;
      }

      // ─────────────────────────────────────────────────────────────
      // 3. PHASE-LOCKED LOOP (PLL) & CONTINUOUS TIME SYNCHRONIZATION
      // ─────────────────────────────────────────────────────────────
      this.updateLiveTempoAndPhase(now, dt);

      // Smooth Frequency Bands
      const lerp = (curr: number, target: number, att = 0.85, dec = 0.20) => {
        const rate = target > curr ? att : dec;
        return curr + (target - curr) * rate;
      };

      this.state.subBass = lerp(this.state.subBass, rawSub, 0.90, 0.22);
      this.state.kick = lerp(this.state.kick, rawKick, 0.90, 0.25);
      this.state.upperBass = lerp(this.state.upperBass, rawBass, 0.80, 0.20);
      this.state.lowMid = lerp(this.state.lowMid, rawLowMid, 0.60, 0.18);
      this.state.vocalMid = lerp(this.state.vocalMid, rawVocal, 0.60, 0.18);
      this.state.highTreble = lerp(this.state.highTreble, rawTreble, 0.70, 0.20);
      this.state.overallEnergy = lerp(this.state.overallEnergy, rawOverall, 0.70, 0.20);

      // Distinct Exponential Decay Rates for Each Layer
      this.state.subImpact *= 0.88;        // Sub-bass lingers slightly longer for deep vibration feel
      this.state.kickImpact *= 0.78;       // Kick snaps back fast for punchy crispness
      this.state.bassImpact *= 0.85;       // Melodic bass smoothly flows
      this.state.kickRollIntensity *= 0.86;// Rolls decay progressively
      this.state.snareFlash *= 0.75;       // Snare flashes and disappears quickly
      this.state.downbeatPulse *= 0.82;

      return this.state;
    }

    this.decayState();
    return this.state;
  }

  /**
   * Record Onset Timestamp and Compute Inter-Onset Intervals (IOI)
   */
  private recordOnset(timestamp: number): void {
    this.onsetTimestamps.push(timestamp);
    if (this.onsetTimestamps.length > this.MAX_ONSETS) {
      this.onsetTimestamps.shift();
    }

    const count = this.onsetTimestamps.length;
    if (count < 6) return;

    this.bpmIntervalBuckets.clear();

    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < Math.min(count, i + 5); j++) {
        const interval = this.onsetTimestamps[j] - this.onsetTimestamps[i];
        if (interval < 250 || interval > 1500) continue;

        let bpm = 60000 / interval;
        while (bpm < 65) bpm *= 2;
        while (bpm > 190) bpm /= 2;

        const roundedBpm = Math.round(bpm);
        const weight = (this.bpmIntervalBuckets.get(roundedBpm) || 0) + (1.0 / (j - i));
        this.bpmIntervalBuckets.set(roundedBpm, weight);
      }
    }

    let bestBpm = this.estimatedBpm;
    let maxWeight = 0;

    this.bpmIntervalBuckets.forEach((weight, bpm) => {
      if (weight > maxWeight) {
        maxWeight = weight;
        bestBpm = bpm;
      }
    });

    if (maxWeight > 2.0) {
      this.estimatedBpm = bestBpm;
      this.bpmConfidence = Math.min(1.0, maxWeight / 8.0);
    }
  }

  /**
   * Update Continuous Phase-Locked Loop (PLL) Beat Clock
   */
  private updateLiveTempoAndPhase(now: number, dt: number): void {
    this.smoothedBpm += (this.estimatedBpm - this.smoothedBpm) * 0.05;
    this.state.liveBpm = Math.round(this.smoothedBpm);
    this.state.bpmConfidence = this.bpmConfidence;

    const beatIntervalSec = 60.0 / Math.max(40, this.smoothedBpm);
    const beatFrequency = 1.0 / beatIntervalSec;

    this.beatPhaseAcc += beatFrequency * dt;

    if (this.beatPhaseAcc >= 1.0) {
      this.beatPhaseAcc -= 1.0;
      this.beatCounter++;
      this.state.isBeatHit = true;
      this.lastBeatTime = now;

      const beatInBar = (this.beatCounter % 4) + 1;
      this.state.beatInBar = beatInBar;

      if (beatInBar === 1) {
        this.barCounter++;
        this.state.isDownbeat = true;
        this.state.downbeatPulse = 1.0;
        this.lastDownbeatTime = now;
      }
    }

    this.state.beatProgress = Math.max(0, Math.min(1, this.beatPhaseAcc));
    this.state.beatPhase = (this.beatPhaseAcc * Math.PI * 2) - Math.PI;
    this.state.currentBeat = this.beatCounter;
    this.state.currentBar = this.barCounter;
  }

  /**
   * Decay Envelopes when audio is silent or paused
   */
  private decayState(): void {
    this.state.subBass *= 0.85;
    this.state.kick *= 0.85;
    this.state.upperBass *= 0.85;
    this.state.lowMid *= 0.85;
    this.state.vocalMid *= 0.85;
    this.state.highTreble *= 0.85;
    this.state.overallEnergy *= 0.85;
    this.state.subImpact *= 0.85;
    this.state.kickImpact *= 0.75;
    this.state.bassImpact *= 0.82;
    this.state.kickRollIntensity *= 0.85;
    this.state.snareFlash *= 0.75;
    this.state.downbeatPulse *= 0.80;
  }

  /**
   * Get raw byte frequency array for canvas waveform bars
   */
  public getByteFrequencyData(): Uint8Array {
    if (this.analyser && this.frequencyData) {
      this.analyser.getByteFrequencyData(this.frequencyData);
      return this.frequencyData;
    }
    return new Uint8Array(32);
  }

  /**
   * Directly get the current beat state
   */
  public getBeatState(): StudioBeatState {
    return this.update();
  }
}

export const studioBeatEngine = StudioBeatEngine.getInstance();
