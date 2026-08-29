/**
 * StudioBeatEngine.ts (V3 - Luxury Multi-Band Transient & Adaptive Beat Engine)
 * 
 * Advanced Audio Signal Processing (DSP) & Rhythm Intelligence:
 * - 20-70Hz Sub-Bandpass Isolation + Nonlinear Dynamic Range Expansion (E^1.6)
 * - Spectral Flux Differential Onset Detection (dE/dt) for Mastered Audio
 * - 25ms Fast Damping Micro-Decay for 1/16 & 1/32 Rapid Kick Rolls
 * - Adaptive Gentle Sinusoidal Breathing Engine for Chill / Acoustic Songs
 * - Multi-Chromatic Frequency Bands (Sub-Bass, Kick/Snare, Vocal, Hi-hat)
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
  subImpact: number; // Deep Sub-Bass glow envelope
  kickImpact: number; // Sharp Kick / Snare flash envelope
  ghostKickImpact: number; // Subtle micro-ripple envelope
  kickRollIntensity: number; // Rapid roll intensity [0.0 - 1.0]
  snareFlash: number; // Snare flare envelope
  hihatSparkle: number; // High-frequency diamond sparkle envelope
  vocalPresence: number; // Vocal / Lead melodic energy [0.0 - 1.0]
  downbeatPulse: number; // Phách 1 major pulse
  overallEnergy: number; // Macro energy level

  // Granular Multi-Chromatic Frequency Bands [0.0 - 1.0]
  subBass: number; // 20 - 70 Hz (Neon Violet)
  kick: number; // 70 - 180 Hz (Ruby Red / Amber)
  upperBass: number; // 180 - 350 Hz
  lowMid: number; // 350 - 900 Hz
  vocalMid: number; // 900 - 3800 Hz (Cyan / Liquid Silver)
  highTreble: number; // 5000 - 16000 Hz (Gold / Diamond)
}

export class StudioBeatEngine {
  private static instance: StudioBeatEngine;

  private frequencyData: Uint8Array<ArrayBuffer> | null = null;
  private prevSubEnergy = 0;
  private prevKickEnergy = 0;
  private prevSnareEnergy = 0;
  private prevTrebleEnergy = 0;

  // Rolling Averages for Adaptive Dynamic Noise Gates
  private lowEndHistory: number[] = [];
  private snareHistory: number[] = [];
  private hihatHistory: number[] = [];
  private subIsolatedHistory: number[] = [];
  private readonly HISTORY_SIZE = 24;

  // Transient Timestamps & Roll Tracking
  private lastKickTime = 0;
  private lastSnareTime = 0;
  private lastHihatTime = 0;
  private lastGhostTime = 0;
  private recentKickIntervals: number[] = [];
  
  // Fast Micro-Decay Parameters (25ms - 35ms)
  private readonly KICK_MIN_INTERVAL_MS = 25;
  private readonly SNARE_MIN_INTERVAL_MS = 120;
  private readonly HIHAT_MIN_INTERVAL_MS = 30;

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
    snareFlash: 0,
    hihatSparkle: 0,
    vocalPresence: 0,
    downbeatPulse: 0,
    overallEnergy: 0,

    subBass: 0,
    kick: 0,
    upperBass: 0,
    lowMid: 0,
    vocalMid: 0,
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
    this.snareHistory = [];
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

        // 1. Precise Multi-Band Isolated Spectrum
        rawSub20_70 = getAverageInRange(20, 70);
        rawKick70_180 = getAverageInRange(70, 180);
        rawBass180_350 = getAverageInRange(180, 350);
        rawMid350_900 = getAverageInRange(350, 900);
        rawVocal900_3800 = getAverageInRange(900, 3800);
        rawTreble5k_16k = getAverageInRange(5000, 16000);

        rawOverall = (
          rawSub20_70 * 0.32 +
          rawKick70_180 * 0.28 +
          rawBass180_350 * 0.12 +
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
      // 1. Nonlinear Expansion on Sub-Band (E^1.6) to separate buried ghost sub/kicks
      const expandedSub = Math.pow(rawSub20_70, 1.4);
      this.subIsolatedHistory.push(expandedSub);
      if (this.subIsolatedHistory.length > this.HISTORY_SIZE) this.subIsolatedHistory.shift();
      const avgSub = this.subIsolatedHistory.reduce((a, b) => a + b, 0) / this.subIsolatedHistory.length;

      // 2. Rolling History for Kick & Transient Flux
      const combinedLow = rawSub20_70 * 0.50 + rawKick70_180 * 0.50;
      this.lowEndHistory.push(combinedLow);
      if (this.lowEndHistory.length > this.HISTORY_SIZE) this.lowEndHistory.shift();
      const avgLow = this.lowEndHistory.reduce((a, b) => a + b, 0) / this.lowEndHistory.length;

      this.snareHistory.push(rawVocal900_3800);
      if (this.snareHistory.length > this.HISTORY_SIZE) this.snareHistory.shift();
      const avgSnare = this.snareHistory.reduce((a, b) => a + b, 0) / this.snareHistory.length;

      this.hihatHistory.push(rawTreble5k_16k);
      if (this.hihatHistory.length > this.HISTORY_SIZE) this.hihatHistory.shift();
      const avgHihat = this.hihatHistory.reduce((a, b) => a + b, 0) / this.hihatHistory.length;

      // 3. Spectral Flux (First-Order Difference dE/dt)
      const subFlux = Math.max(0, rawSub20_70 - this.prevSubEnergy);
      const kickFlux = Math.max(0, rawKick70_180 - this.prevKickEnergy);
      const snareFlux = Math.max(0, rawVocal900_3800 - this.prevSnareEnergy);
      const trebleFlux = Math.max(0, rawTreble5k_16k - this.prevTrebleEnergy);

      this.prevSubEnergy = rawSub20_70;
      this.prevKickEnergy = rawKick70_180;
      this.prevSnareEnergy = rawVocal900_3800;
      this.prevTrebleEnergy = rawTreble5k_16k;

      // 4. Heavy Kick & Rapid Kick Roll Detection (Fast 25ms Damping Window)
      const timeSinceLastKick = now - this.lastKickTime;
      const isFastConsecutive = timeSinceLastKick >= this.KICK_MIN_INTERVAL_MS && timeSinceLastKick < 160;

      // Dynamic Threshold with Slope Spike
      const kickThreshold = isFastConsecutive ? avgLow * 1.06 : avgLow * 1.15;

      if ((combinedLow > kickThreshold || kickFlux > 0.04) && combinedLow > 0.035 && timeSinceLastKick >= this.KICK_MIN_INTERVAL_MS) {
        isKickHit = true;
        this.lastKickTime = now;
        this.state.kickImpact = 1.0;

        // Record roll interval
        this.recentKickIntervals.push(timeSinceLastKick);
        if (this.recentKickIntervals.length > 5) this.recentKickIntervals.shift();

        if (isFastConsecutive) {
          isKickRoll = true;
          this.state.kickRollIntensity = Math.min(1.0, this.state.kickRollIntensity + 0.45);
        }
      }

      // 5. Ghost Kick / Buried Sub-Slide Detection (Dual-Threshold Micro Onset)
      const timeSinceLastGhost = now - this.lastGhostTime;
      if (!isKickHit && (expandedSub > avgSub * 1.04 || subFlux > 0.02) && timeSinceLastGhost > 45) {
        isGhostKickHit = true;
        this.lastGhostTime = now;
        this.state.ghostKickImpact = Math.min(0.75, expandedSub * 1.6 + subFlux * 2.0);
      }

      // 6. Snare / Mid Claps (900-3800Hz)
      const timeSinceLastSnare = now - this.lastSnareTime;
      if ((rawVocal900_3800 > avgSnare * 1.15 || snareFlux > 0.04) && rawVocal900_3800 > 0.04 && timeSinceLastSnare >= this.SNARE_MIN_INTERVAL_MS) {
        isSnareHit = true;
        this.lastSnareTime = now;
        this.state.snareFlash = 1.0;
      }

      // 7. Hi-Hat / Cymbals (5k-16kHz)
      const timeSinceLastHihat = now - this.lastHihatTime;
      if ((rawTreble5k_16k > avgHihat * 1.18 || trebleFlux > 0.03) && rawTreble5k_16k > 0.03 && timeSinceLastHihat >= this.HIHAT_MIN_INTERVAL_MS) {
        isHihatHit = true;
        this.lastHihatTime = now;
        this.state.hihatSparkle = 1.0;
      }

      // 8. Sub-Bass Rumble
      if (rawSub20_70 > 0.15 || subFlux > 0.03) {
        isSubHit = true;
        this.state.subImpact = Math.min(1.0, rawSub20_70 * 1.8 + subFlux * 2.0);
      }

      // 9. Vocal / Lead Synth Energy
      this.state.vocalPresence = Math.min(1.0, rawVocal900_3800 * 1.8 + rawMid350_900 * 0.6);

      // Interpolation (Smoothing Attack & Decay)
      const lerp = (curr: number, target: number, attack = 0.7, decay = 0.2) => {
        const rate = target > curr ? attack : decay;
        return curr + (target - curr) * rate;
      };

      this.state.subBass = lerp(this.state.subBass, rawSub20_70, 0.88, 0.25);
      this.state.kick = lerp(this.state.kick, rawKick70_180, 0.90, 0.25);
      this.state.upperBass = lerp(this.state.upperBass, rawBass180_350, 0.75, 0.20);
      this.state.lowMid = lerp(this.state.lowMid, rawMid350_900, 0.60, 0.15);
      this.state.vocalMid = lerp(this.state.vocalMid, rawVocal900_3800, 0.70, 0.18);
      this.state.highTreble = lerp(this.state.highTreble, rawTreble5k_16k, 0.75, 0.22);
      this.state.overallEnergy = lerp(this.state.overallEnergy, rawOverall, 0.65, 0.18);

      // Detect Gentle / Calm Passage (Acoustic / Intro / Outro)
      this.state.isGentleMode = rawOverall < 0.10 && this.state.subBass < 0.15;
    } else if (isPlaying) {
      // High-Quality Synthetic Rhythm Fallback along Ground-Truth BPM Grid
      const isBeatOnset = beatPhase < 0.12;
      const isDownbeat = (beatInBar === 1 && isBeatOnset);
      const isSnareBeat = (beatInBar === 2 || beatInBar === 4) && Math.abs(beatPhase - 0.5) < 0.12;

      if (isBeatOnset && now - this.lastKickTime > 180) {
        isKickHit = true;
        this.lastKickTime = now;
        this.state.kickImpact = isDownbeat ? 1.0 : 0.85;
      }

      if (isSnareBeat && now - this.lastSnareTime > 180) {
        isSnareHit = true;
        this.lastSnareTime = now;
        this.state.snareFlash = 0.90;
      }

      this.state.subBass = 0.35 + Math.sin(beatPhase * Math.PI) * 0.45;
      this.state.subImpact = isDownbeat ? 0.9 : 0.45;
      this.state.isGentleMode = false;
    } else {
      this.state.isGentleMode = true;
    }

    // Exponential Damping
    this.state.kickImpact *= 0.80; // Fast decay for distinct kicks
    this.state.kickRollIntensity *= 0.85;
    this.state.ghostKickImpact *= 0.78;
    this.state.snareFlash *= 0.75;
    this.state.hihatSparkle *= 0.78;
    this.state.subImpact *= 0.86;
    this.state.downbeatPulse *= 0.80;

    this.state.isKickHit = isKickHit;
    this.state.isGhostKickHit = isGhostKickHit;
    this.state.isKickRoll = isKickRoll;
    this.state.isSnareHit = isSnareHit;
    this.state.isHihatHit = isHihatHit;
    this.state.isSubHit = isSubHit;
    this.state.isBeatHit = isKickHit || (beatPhase < 0.10);
    this.state.isDownbeat = (beatInBar === 1 && beatPhase < 0.12);

    return this.state;
  }
}

export const studioBeatEngine = StudioBeatEngine.getInstance();
