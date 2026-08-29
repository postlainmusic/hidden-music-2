import { getGroundTruthProfile, GroundTruthTrackProfile } from "./hvlGroundTruthRhythmGrid";

export interface StudioBeatState {
  // Real-time detected tempo (BPM) & Ground-Truth Tonality
  liveBpm: number;
  bpmConfidence: number;
  rootKey: string;
  firstBeatOffsetMs: number;
  isGroundTruthLocked: boolean;

  // Continuous Beat Phase Clock
  beatProgress: number;
  beatPhase: number;
  currentBeat: number;
  currentBar: number;
  beatInBar: number; // 1, 2, 3, or 4

  // Discrete Frame Triggers
  isBeatHit: boolean;
  isDownbeat: boolean;
  isSubHit: boolean;
  isKickHit: boolean;
  isBassHit: boolean;
  isKickRoll: boolean;
  isSnareHit: boolean;

  // Distinct Envelopes for Visual Layering
  subImpact: number;
  kickImpact: number;
  bassImpact: number;
  kickRollIntensity: number;
  snareFlash: number;
  downbeatPulse: number;
  overallEnergy: number;

  // Granular Frequency Bands
  subBass: number;
  kick: number;
  upperBass: number;
  lowMid: number;
  vocalMid: number;
  highTreble: number;
}

export class StudioBeatEngine {
  private static instance: StudioBeatEngine;

  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private currentAudioElement: HTMLAudioElement | null = null;
  private frequencyData: Uint8Array<ArrayBuffer> | null = null;
  private timeDomainData: Uint8Array<ArrayBuffer> | null = null;

  // Rolling Averages for Adaptive Thresholding
  private lowEndHistory: number[] = [];
  private snareHistory: number[] = [];
  private readonly HISTORY_SIZE = 30;

  // Fast and Slow Energy Follower
  private fastEnergy: number = 0;
  private slowEnergy: number = 0;

  // Transient Timestamps
  private lastKickTime = 0;
  private lastSnareTime = 0;
  private lastBeatTime = 0;
  private readonly KICK_MIN_INTERVAL_MS = 60;  // Supports rapid trap kick rolls
  private readonly SNARE_MIN_INTERVAL_MS = 140;

  // Active Track Profile
  private currentTrackProfile: GroundTruthTrackProfile | null = null;
  private drumStartSec: number = 0;

  // Internal State
  private state: StudioBeatState = {
    liveBpm: 120,
    bpmConfidence: 0.9,
    rootKey: "C#",
    firstBeatOffsetMs: 180,
    isGroundTruthLocked: true,

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
        this.analyser.fftSize = 512;
        this.analyser.smoothingTimeConstant = 0.55;
        this.analyser.minDecibels = -90;
        this.analyser.maxDecibels = -10;
        this.frequencyData = new Uint8Array(new ArrayBuffer(this.analyser.frequencyBinCount));
        this.timeDomainData = new Uint8Array(new ArrayBuffer(this.analyser.fftSize));
      }

      if (!this.sourceNode && this.audioCtx && this.analyser) {
        try {
          this.sourceNode = this.audioCtx.createMediaElementSource(audioEl);
          this.sourceNode.connect(this.analyser);
          this.analyser.connect(this.audioCtx.destination);
        } catch (e) {
          console.warn("MediaElementAudioSourceNode connect notice:", e);
        }
      }
    } catch (err) {
      console.warn("StudioBeatEngine attach error:", err);
    }
  }

  public resumeContext(): void {
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      this.audioCtx.resume().catch(() => {});
    }
  }

  public setTrack(trackIdOrTitle: string): void {
    this.currentTrackProfile = getGroundTruthProfile(trackIdOrTitle);
    if (this.currentTrackProfile) {
      this.state.liveBpm = this.currentTrackProfile.bpm;
      this.state.rootKey = this.currentTrackProfile.rootKey;
      this.state.firstBeatOffsetMs = this.currentTrackProfile.firstBeatOffsetMs;
      this.state.isGroundTruthLocked = true;

      // Extract drum start section
      const titleLower = trackIdOrTitle.toLowerCase();
      if (titleLower.includes("elegie")) this.drumStartSec = 45.0;
      else if (titleLower.includes("idk")) this.drumStartSec = 13.5;
      else if (titleLower.includes("ai mới là")) this.drumStartSec = 8.0;
      else this.drumStartSec = 0.0;
    }
  }

  public getFrequencyData(): Uint8Array {
    if (this.analyser && this.frequencyData) {
      this.analyser.getByteFrequencyData(this.frequencyData);
      return this.frequencyData;
    }
    return new Uint8Array(32);
  }

  public update(): StudioBeatState {
    return this.getBeatState();
  }

  public getBeatState(): StudioBeatState {
    const now = performance.now();
    const audio = this.currentAudioElement;
    const isPlaying = audio && !audio.paused && !audio.ended;
    const currentTimeSec = audio ? audio.currentTime : 0;

    let rawSub = 0;
    let rawKick = 0;
    let rawBass = 0;
    let rawMid = 0;
    let rawSnare = 0;
    let rawTreble = 0;
    let rawOverall = 0;
    let hasSignal = false;

    if (this.analyser && this.frequencyData && isPlaying) {
      try {
        this.analyser.getByteFrequencyData(this.frequencyData);

        const binCount = this.analyser.frequencyBinCount;
        const sampleRate = this.audioCtx ? this.audioCtx.sampleRate : 44100;
        const binHz = sampleRate / (binCount * 2);

        const getAverageInRange = (minHz: number, maxHz: number): number => {
          const startBin = Math.max(0, Math.floor(minHz / binHz));
          const endBin = Math.min(binCount - 1, Math.ceil(maxHz / binHz));
          if (startBin >= endBin) return (this.frequencyData![startBin] || 0) / 255;

          let sum = 0;
          for (let i = startBin; i <= endBin; i++) {
            sum += this.frequencyData![i];
          }
          return sum / ((endBin - startBin + 1) * 255);
        };

        rawSub = getAverageInRange(20, 65);
        rawKick = getAverageInRange(65, 160);
        rawBass = getAverageInRange(160, 320);
        rawMid = getAverageInRange(320, 1000);
        rawSnare = getAverageInRange(1000, 3800);
        rawTreble = getAverageInRange(3800, 16000);

        rawOverall = rawSub * 0.35 + rawKick * 0.25 + rawBass * 0.15 + rawMid * 0.15 + rawTreble * 0.1;
        if (rawOverall > 0.005) {
          hasSignal = true;
        }
      } catch {}
    }

    // Fallback beat timing generator when signal is quiet or initializing
    const bpm = this.currentTrackProfile ? this.currentTrackProfile.bpm : 120;
    const beatPeriod = 60 / bpm;
    const elapsedSinceFirstBeat = Math.max(0, currentTimeSec - (this.state.firstBeatOffsetMs / 1000));
    const beatPhase = (elapsedSinceFirstBeat % beatPeriod) / beatPeriod;
    const totalBeats = Math.floor(elapsedSinceFirstBeat / beatPeriod);
    const beatInBar = (totalBeats % 4) + 1;

    this.state.beatProgress = beatPhase;
    this.state.beatPhase = (beatPhase - 0.5) * Math.PI * 2;
    this.state.currentBeat = totalBeats;
    this.state.currentBar = Math.floor(totalBeats / 4);
    this.state.beatInBar = beatInBar;

    let isKickHit = false;
    let isSnareHit = false;
    let isSubHit = false;
    const isDrummingSection = currentTimeSec >= this.drumStartSec;

    if (hasSignal && isPlaying) {
      const rawLowEnd = rawSub * 0.60 + rawKick * 0.40;

      this.lowEndHistory.push(rawLowEnd);
      if (this.lowEndHistory.length > this.HISTORY_SIZE) this.lowEndHistory.shift();
      const avgLowEnd = this.lowEndHistory.reduce((a, b) => a + b, 0) / this.lowEndHistory.length;

      this.snareHistory.push(rawSnare);
      if (this.snareHistory.length > this.HISTORY_SIZE) this.snareHistory.shift();
      const avgSnare = this.snareHistory.reduce((a, b) => a + b, 0) / this.snareHistory.length;

      // 1. Transient Kick Drum Trigger (65-160Hz) with adaptive flux
      const timeSinceLastKick = now - this.lastKickTime;
      const isRapidKick = timeSinceLastKick >= this.KICK_MIN_INTERVAL_MS && timeSinceLastKick < 200;
      const kickThreshold = isRapidKick ? avgLowEnd * 1.15 : avgLowEnd * 1.25;

      if (isDrummingSection && rawLowEnd > kickThreshold && rawLowEnd > 0.08 && timeSinceLastKick >= this.KICK_MIN_INTERVAL_MS) {
        isKickHit = true;
        this.lastKickTime = now;
        this.state.kickImpact = 1.0;
        if (isRapidKick) {
          this.state.kickRollIntensity = Math.min(1.0, this.state.kickRollIntensity + 0.35);
        }
      }

      // 2. Snare / High Transient Trigger (1000-3800Hz)
      const timeSinceLastSnare = now - this.lastSnareTime;
      if (isDrummingSection && rawSnare > avgSnare * 1.25 && rawSnare > 0.08 && timeSinceLastSnare >= this.SNARE_MIN_INTERVAL_MS) {
        isSnareHit = true;
        this.lastSnareTime = now;
        this.state.snareFlash = 1.0;
      }

      // 3. Sub-bass Rumbling Trigger (20-65Hz)
      if (rawSub > 0.35) {
        isSubHit = true;
        this.state.subImpact = Math.min(1.0, rawSub * 1.3);
      }

      const lerp = (curr: number, target: number, attack = 0.7, decay = 0.2) => {
        const rate = target > curr ? attack : decay;
        return curr + (target - curr) * rate;
      };

      this.state.subBass = lerp(this.state.subBass, rawSub, 0.85, 0.22);
      this.state.kick = lerp(this.state.kick, rawKick, 0.88, 0.22);
      this.state.upperBass = lerp(this.state.upperBass, rawBass, 0.75, 0.20);
      this.state.lowMid = lerp(this.state.lowMid, rawMid, 0.55, 0.15);
      this.state.vocalMid = lerp(this.state.vocalMid, rawSnare, 0.55, 0.15);
      this.state.highTreble = lerp(this.state.highTreble, rawTreble, 0.60, 0.18);
      this.state.overallEnergy = lerp(this.state.overallEnergy, rawOverall, 0.60, 0.18);
      this.state.bassImpact = lerp(this.state.bassImpact, rawBass * 1.2, 0.75, 0.18);
    } else if (isPlaying && isDrummingSection) {
      // Synthetic beat lock when audio context is silent or offline
      if (beatPhase < 0.12 && (now - this.lastBeatTime > 200)) {
        isKickHit = true;
        this.lastBeatTime = now;
        this.state.kickImpact = 0.95;
      }
      if (Math.abs(beatPhase - 0.5) < 0.10 && (now - this.lastSnareTime > 200)) {
        isSnareHit = true;
        this.lastSnareTime = now;
        this.state.snareFlash = 0.85;
      }
    }

    // Exponential Decay for punchy snap
    this.state.kickImpact *= 0.84;
    this.state.kickRollIntensity *= 0.88;
    this.state.snareFlash *= 0.78;
    this.state.subImpact *= 0.88;
    this.state.downbeatPulse *= 0.82;

    this.state.isKickHit = isKickHit;
    this.state.isSnareHit = isSnareHit;
    this.state.isSubHit = isSubHit;
    this.state.isBeatHit = isKickHit || (beatPhase < 0.10);
    this.state.isDownbeat = (beatInBar === 1 && beatPhase < 0.12);

    return this.state;
  }
}

export const studioBeatEngine = StudioBeatEngine.getInstance();
