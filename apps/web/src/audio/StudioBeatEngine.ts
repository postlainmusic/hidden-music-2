/**
 * StudioBeatEngine.ts (V4 - 4096-Bin Multi-Band Transient & Dual-Gate Snare Intelligence)
 * 
 * Advanced Audio Signal Processing (DSP) & Rhythm Intelligence:
 * - 4096 FFT Bins (~10.76Hz per bin) for true Sub 20-70Hz, Kick 70-160Hz & Snare Isolation
 * - Dual-Band Snare Detection (180-380Hz Fundamental + 2.2kHz-5.5kHz Snap Crack)
 * - Spectral Flux Differential Onset Detection (dE/dt) for Mastered Audio
 * - 25ms Fast Damping Micro-Decay for 1/16 & 1/32 Rapid Kick Rolls
 * - Zero GC / 60fps-120fps Real-Time Micro-Buffers
 */

import { getGroundTruthProfile, GroundTruthTrackProfile } from "./hvlGroundTruthRhythmGrid";
import { dualDeckAudioEngine } from "./DualDeckAudioEngine";

export interface StudioBeatState {
  // Real-time detected tempo (BPM) & Tonality
  liveBpm: number;
  bpmConfidence: number;
  rootKey: string;
  firstBeatOffsetMs: number;
  isGroundTruthLocked: boolean;

  // Continuous Beat Phase Clock & Adaptive Breathing
  beatProgress: number;
  beatPhase: number;
  currentBeat: number;
  currentBar: number;
  beatInBar: number; // 1, 2, 3, or 4
  breathingPhase: number; // [0.0 - 1.0] Smooth sinusoidal envelope for chill songs
  isGentleMode: boolean;

  // Discrete Frame Triggers
  isBeatHit: boolean;
  isDownbeat: boolean;
  isSubHit: boolean;
  isKickHit: boolean;
  isGhostKickHit: boolean; // Subtle buried 808 sub-slide / ghost kick
  isKickRoll: boolean; // Rapid consecutive kick roll
  isSnareHit: boolean;
  isHihatHit: boolean;

  // Distinct Envelopes for Visual Layering [0.0 - 1.0]
  subImpact: number; // Deep Sub-Bass glow envelope (Neon Violet / Crimson)
  kickImpact: number; // Sharp Kick / 808 flash envelope (Ruby Red)
  ghostKickImpact: number; // Subtle micro-ripple envelope
  kickRollIntensity: number; // Rapid roll intensity [0.0 - 1.0]
  snareImpact: number; // Snare hit envelope [0.0 - 1.0] (Blinding Silver-White / Diamond)
  snareStrobe: number; // Decaying snare flash envelope
  hihatSparkle: number; // High-frequency diamond sparkle envelope
  vocalPresence: number; // Vocal / Lead melodic energy [0.0 - 1.0]
  downbeatPulse: number; // Phách 1 major pulse
  overallEnergy: number; // Macro energy level
  trebleEnergy: number; // Treble energy level

  // Granular Multi-Chromatic Frequency Bands [0.0 - 1.0]
  subBass: number; // 20 - 70 Hz (Neon Violet)
  kick: number; // 70 - 180 Hz (Ruby Red / Amber)
  upperBass: number; // 180 - 350 Hz (Snare Fundamental)
  lowMid: number; // 350 - 900 Hz
  vocalMid: number; // 900 - 3800 Hz (Cyan / Liquid Silver)
  snareCrack: number; // 2200 - 5500 Hz (Snare Snap)
  highTreble: number; // 5000 - 16000 Hz (Gold / Diamond)
}

export class StudioBeatEngine {
  private static instance: StudioBeatEngine;

  private frequencyData: Uint8Array<ArrayBuffer> | null = null;
  private prevSubEnergy = 0;
  private prevKickEnergy = 0;
  private prevSnareFundEnergy = 0;
  private prevSnareCrackEnergy = 0;
  private prevTrebleEnergy = 0;

  // Rolling Averages for Adaptive Dynamic Noise Gates
  private lowEndHistory: number[] = [];
  private snareFundHistory: number[] = [];
  private snareCrackHistory: number[] = [];
  private hihatHistory: number[] = [];
  private subIsolatedHistory: number[] = [];
  private readonly HISTORY_SIZE = 24;

  // Transient Timestamps & Roll Tracking
  private lastKickTime = 0;
  private lastSnareTime = 0;
  private lastHihatTime = 0;
  private lastGhostTime = 0;
  private recentKickIntervals: number[] = [];
  
  // Fast Micro-Decay Parameters (25ms - 100ms)
  private readonly KICK_MIN_INTERVAL_MS = 25;
  private readonly SNARE_MIN_INTERVAL_MS = 90;
  private readonly HIHAT_MIN_INTERVAL_MS = 30;

  // Active Track Profile
  private currentTrackProfile: GroundTruthTrackProfile | null = null;

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
    breathingPhase: 0,
    isGentleMode: false,

    isBeatHit: false,
    isDownbeat: false,
    isSubHit: false,
    isKickHit: false,
    isGhostKickHit: false,
    isKickRoll: false,
    isSnareHit: false,
    isHihatHit: false,

    subImpact: 0,
    kickImpact: 0,
    ghostKickImpact: 0,
    kickRollIntensity: 0,
    snareImpact: 0,
    snareStrobe: 0,
    hihatSparkle: 0,
    vocalPresence: 0,
    downbeatPulse: 0,
    overallEnergy: 0,
    trebleEnergy: 0,

    subBass: 0,
    kick: 0,
    upperBass: 0,
    lowMid: 0,
    vocalMid: 0,
    snareCrack: 0,
    highTreble: 0
  };

  private constructor() {}

  public static getInstance(): StudioBeatEngine {
    if (!StudioBeatEngine.instance) {
      StudioBeatEngine.instance = new StudioBeatEngine();
    }
    return StudioBeatEngine.instance;
  }

  public setTrack(trackIdOrTitle: string, fallbackBpm: number = 120): void {
    this.currentTrackProfile = getGroundTruthProfile(trackIdOrTitle);
    if (this.currentTrackProfile) {
      this.state.liveBpm = this.currentTrackProfile.bpm;
      this.state.rootKey = this.currentTrackProfile.rootKey;
      this.state.firstBeatOffsetMs = this.currentTrackProfile.firstBeatOffsetMs;
      this.state.isGroundTruthLocked = true;
    } else {
      this.state.liveBpm = fallbackBpm || 120;
      this.state.rootKey = "A";
      this.state.firstBeatOffsetMs = 0;
      this.state.isGroundTruthLocked = false;
    }

    // Reset transient histories
    this.lowEndHistory = [];
    this.snareFundHistory = [];
    this.snareCrackHistory = [];
    this.hihatHistory = [];
    this.subIsolatedHistory = [];
    this.recentKickIntervals = [];
  }

  public getByteFrequencyData(): Uint8Array {
    const analyser = dualDeckAudioEngine.getAnalyserNode();
    if (analyser) {
      if (!this.frequencyData || this.frequencyData.length !== analyser.frequencyBinCount) {
        this.frequencyData = new Uint8Array(analyser.frequencyBinCount);
      }
      analyser.getByteFrequencyData(this.frequencyData);
      return this.frequencyData;
    }

    if (!this.frequencyData) {
      this.frequencyData = new Uint8Array(32);
    }
    this.frequencyData.fill(0);
    return this.frequencyData;
  }

  public getFrequencyData(): Uint8Array {
    return this.getByteFrequencyData();
  }

  public update(): StudioBeatState {
    return this.getBeatState();
  }

  public getBeatState(): StudioBeatState {
    const now = performance.now();
    const audio = dualDeckAudioEngine.getActiveAudio();
    const isPlaying = audio && !audio.paused && !audio.ended;
    const currentTimeSec = audio ? audio.currentTime : 0;

    let rawSub20_70 = 0;
    let rawKick70_180 = 0;
    let rawBass180_350 = 0;
    let rawMid350_900 = 0;
    let rawVocal900_3800 = 0;
    let rawSnareCrack2k_5k = 0;
    let rawTreble5k_16k = 0;
    let rawOverall = 0;
    let hasSignal = false;

    const analyser = dualDeckAudioEngine.getAnalyserNode();

    if (analyser && isPlaying) {
      if (!this.frequencyData || this.frequencyData.length !== analyser.frequencyBinCount) {
        this.frequencyData = new Uint8Array(analyser.frequencyBinCount);
      }

      try {
        analyser.getByteFrequencyData(this.frequencyData);

        const binCount = analyser.frequencyBinCount;
        const sampleRate = 44100;
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

        // 1. Precise 4096-Bin Multi-Band Isolated Spectrum (~10.7Hz/bin)
        rawSub20_70 = getAverageInRange(20, 70);
        rawKick70_180 = getAverageInRange(70, 180);
        rawBass180_350 = getAverageInRange(180, 380); // Snare Fundamental
        rawMid350_900 = getAverageInRange(350, 900);
        rawVocal900_3800 = getAverageInRange(900, 3800);
        rawSnareCrack2k_5k = getAverageInRange(2200, 5500); // Snare Snap Crack
        rawTreble5k_16k = getAverageInRange(5000, 16000);

        rawOverall = (
          rawSub20_70 * 0.30 +
          rawKick70_180 * 0.28 +
          rawBass180_350 * 0.14 +
          rawVocal900_3800 * 0.16 +
          rawTreble5k_16k * 0.12
        );

        if (rawOverall > 0.005) {
          hasSignal = true;
        }
      } catch {}
    }

    // Continuous Beat Clock
    const bpm = this.state.liveBpm || 120;
    const beatPeriod = 60 / bpm;
    const elapsedSinceFirstBeat = Math.max(0, currentTimeSec - (this.state.firstBeatOffsetMs / 1000));
    const beatPhase = (elapsedSinceFirstBeat % beatPeriod) / beatPeriod;
    const totalBeats = Math.floor(elapsedSinceFirstBeat / beatPeriod);
    const beatInBar = (totalBeats % 4) + 1;

    // Smooth Sinusoidal Breathing Clock for Calm / Gentle passages
    const breathingCycle = (currentTimeSec % 4.0) / 4.0;
    this.state.breathingPhase = (Math.sin(breathingCycle * Math.PI * 2) + 1.0) * 0.5;

    this.state.beatProgress = beatPhase;
    this.state.beatPhase = (beatPhase - 0.5) * Math.PI * 2;
    this.state.currentBeat = totalBeats;
    this.state.currentBar = Math.floor(totalBeats / 4);
    this.state.beatInBar = beatInBar;

    let isKickHit = false;
    let isGhostKickHit = false;
    let isKickRoll = false;
    let isSnareHit = false;
    let isSubHit = false;
    let isHihatHit = false;

    if (hasSignal && isPlaying) {
      // 1. Nonlinear Expansion on Sub-Band (E^1.4)
      const expandedSub = Math.pow(rawSub20_70, 1.4);
      this.subIsolatedHistory.push(expandedSub);
      if (this.subIsolatedHistory.length > this.HISTORY_SIZE) this.subIsolatedHistory.shift();
      const avgSub = this.subIsolatedHistory.reduce((a, b) => a + b, 0) / this.subIsolatedHistory.length;

      // 2. Rolling History for Kick & Snare
      const combinedLow = rawSub20_70 * 0.50 + rawKick70_180 * 0.50;
      this.lowEndHistory.push(combinedLow);
      if (this.lowEndHistory.length > this.HISTORY_SIZE) this.lowEndHistory.shift();
      const avgLow = this.lowEndHistory.reduce((a, b) => a + b, 0) / this.lowEndHistory.length;

      this.snareFundHistory.push(rawBass180_350);
      if (this.snareFundHistory.length > this.HISTORY_SIZE) this.snareFundHistory.shift();
      const avgSnareFund = this.snareFundHistory.reduce((a, b) => a + b, 0) / this.snareFundHistory.length;

      this.snareCrackHistory.push(rawSnareCrack2k_5k);
      if (this.snareCrackHistory.length > this.HISTORY_SIZE) this.snareCrackHistory.shift();
      const avgSnareCrack = this.snareCrackHistory.reduce((a, b) => a + b, 0) / this.snareCrackHistory.length;

      this.hihatHistory.push(rawTreble5k_16k);
      if (this.hihatHistory.length > this.HISTORY_SIZE) this.hihatHistory.shift();
      const avgHihat = this.hihatHistory.reduce((a, b) => a + b, 0) / this.hihatHistory.length;

      // 3. Spectral Flux (First-Order Difference dE/dt)
      const subFlux = Math.max(0, rawSub20_70 - this.prevSubEnergy);
      const kickFlux = Math.max(0, rawKick70_180 - this.prevKickEnergy);
      const snareFundFlux = Math.max(0, rawBass180_350 - this.prevSnareFundEnergy);
      const snareCrackFlux = Math.max(0, rawSnareCrack2k_5k - this.prevSnareCrackEnergy);
      const trebleFlux = Math.max(0, rawTreble5k_16k - this.prevTrebleEnergy);

      this.prevSubEnergy = rawSub20_70;
      this.prevKickEnergy = rawKick70_180;
      this.prevSnareFundEnergy = rawBass180_350;
      this.prevSnareCrackEnergy = rawSnareCrack2k_5k;
      this.prevTrebleEnergy = rawTreble5k_16k;

      // 4. Heavy Kick & Rapid Kick Roll Detection (Fast 25ms Damping Window)
      const timeSinceLastKick = now - this.lastKickTime;
      const isFastConsecutive = timeSinceLastKick >= this.KICK_MIN_INTERVAL_MS && timeSinceLastKick < 160;
      const kickThreshold = isFastConsecutive ? avgLow * 1.06 : avgLow * 1.15;

      if ((combinedLow > kickThreshold || kickFlux > 0.04) && combinedLow > 0.035 && timeSinceLastKick >= this.KICK_MIN_INTERVAL_MS) {
        isKickHit = true;
        this.lastKickTime = now;
        this.state.kickImpact = 1.0;

        this.recentKickIntervals.push(timeSinceLastKick);
        if (this.recentKickIntervals.length > 5) this.recentKickIntervals.shift();

        if (isFastConsecutive) {
          isKickRoll = true;
          this.state.kickRollIntensity = Math.min(1.0, this.state.kickRollIntensity + 0.45);
        }
      }

      // 5. Ghost Kick / Buried Sub-Slide
      const timeSinceLastGhost = now - this.lastGhostTime;
      if (!isKickHit && (expandedSub > avgSub * 1.04 || subFlux > 0.02) && timeSinceLastGhost > 45) {
        isGhostKickHit = true;
        this.lastGhostTime = now;
        this.state.ghostKickImpact = Math.min(0.75, expandedSub * 1.6 + subFlux * 2.0);
      }

      // 6. Snare Dual-Band Detection (180-380Hz Body + 2.2k-5.5kHz Snap)
      const timeSinceLastSnare = now - this.lastSnareTime;
      const combinedSnareFlux = snareFundFlux * 0.45 + snareCrackFlux * 0.55;
      const combinedSnarePower = rawBass180_350 * 0.45 + rawSnareCrack2k_5k * 0.55;
      const avgSnareTotal = avgSnareFund * 0.45 + avgSnareCrack * 0.55;

      if (
        (combinedSnarePower > avgSnareTotal * 1.16 || combinedSnareFlux > 0.045) &&
        combinedSnarePower > 0.04 &&
        timeSinceLastSnare >= this.SNARE_MIN_INTERVAL_MS
      ) {
        isSnareHit = true;
        this.lastSnareTime = now;
        this.state.snareImpact = 1.0;
        this.state.snareStrobe = 1.0;
      }

      // 7. Hi-hat / Shimmer Detection
      const timeSinceLastHihat = now - this.lastHihatTime;
      if ((rawTreble5k_16k > avgHihat * 1.25 || trebleFlux > 0.05) && rawTreble5k_16k > 0.04 && timeSinceLastHihat >= this.HIHAT_MIN_INTERVAL_MS) {
        isHihatHit = true;
        this.lastHihatTime = now;
        this.state.hihatSparkle = 1.0;
      }

      isSubHit = rawSub20_70 > avgSub * 1.08 && rawSub20_70 > 0.05;
      if (isSubHit) {
        this.state.subImpact = Math.min(1.0, this.state.subImpact + rawSub20_70 * 0.85);
      }
    } else {
      // Fallback ground-truth pulse
      if (beatPhase < 0.12 && isPlaying) {
        isKickHit = true;
        this.state.kickImpact = 0.85;
      }
      if (Math.abs(beatPhase - 0.5) < 0.10 && isPlaying) {
        isSnareHit = true;
        this.state.snareImpact = 0.85;
        this.state.snareStrobe = 0.85;
      }
    }

    // Decay Envelopes per frame
    this.state.kickImpact *= 0.84;
    this.state.subImpact *= 0.90;
    this.state.ghostKickImpact *= 0.86;
    this.state.kickRollIntensity *= 0.82;
    this.state.snareImpact *= 0.80;
    this.state.snareStrobe *= 0.78;
    this.state.hihatSparkle *= 0.78;

    // Macro Bands
    this.state.subBass = rawSub20_70;
    this.state.kick = rawKick70_180;
    this.state.upperBass = rawBass180_350;
    this.state.lowMid = rawMid350_900;
    this.state.vocalMid = rawVocal900_3800;
    this.state.snareCrack = rawSnareCrack2k_5k;
    this.state.highTreble = rawTreble5k_16k;
    this.state.overallEnergy = rawOverall;
    this.state.trebleEnergy = rawTreble5k_16k;

    this.state.vocalPresence = Math.min(1.0, rawVocal900_3800 * 1.8);
    this.state.isBeatHit = isKickHit || isSnareHit;
    this.state.isDownbeat = isKickHit && beatInBar === 1;
    this.state.isKickHit = isKickHit;
    this.state.isGhostKickHit = isGhostKickHit;
    this.state.isKickRoll = isKickRoll;
    this.state.isSnareHit = isSnareHit;
    this.state.isSubHit = isSubHit;
    this.state.isHihatHit = isHihatHit;
    this.state.isGentleMode = rawOverall < 0.08 && isPlaying;

    return this.state;
  }
}

export const studioBeatEngine = StudioBeatEngine.getInstance();
