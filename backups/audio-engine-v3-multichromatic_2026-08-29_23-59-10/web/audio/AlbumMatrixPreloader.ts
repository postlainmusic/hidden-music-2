/**
 * AlbumMatrixPreloader.ts
 * 
 * Multi-Release Waveform Matrix & Metadata Engine
 * Supports any Album, EP, Single, or Playlist.
 * Provides instant 100-sample peak waveforms (0ms) and caches dynamic tracks.
 */

export interface TrackWaveformMatrix {
  trackId: string;
  peaks: number[]; // 100 normalized amplitude points [0.0 - 1.0]
  bpm?: number;
  duration: number;
}

// Deterministic, high-fidelity waveform peak generator for any track/genre
function generateRealisticWaveform(seed: number, genre: string = "Hip-Hop", duration: number = 210): number[] {
  const points = 100;
  const peaks: number[] = new Array(points);
  
  const isTrap = genre.toLowerCase().includes("trap") || genre.toLowerCase().includes("drill");
  const isRnB = genre.toLowerCase().includes("r&b") || genre.toLowerCase().includes("soul");
  const isInterlude = duration < 120;

  for (let i = 0; i < points; i++) {
    const progress = i / points;
    
    // Intro & Outro taper
    let envelope = 1.0;
    if (progress < 0.08) {
      envelope = Math.sin((progress / 0.08) * (Math.PI / 2));
    } else if (progress > 0.92) {
      envelope = Math.sin(((1.0 - progress) / 0.08) * (Math.PI / 2));
    }

    // Dynamic verse/chorus structure
    let macroDynamics = 0.65;
    if (progress > 0.25 && progress < 0.45) macroDynamics = 0.95; // Chorus 1
    if (progress > 0.45 && progress < 0.60) macroDynamics = 0.70; // Verse 2
    if (progress > 0.60 && progress < 0.88) macroDynamics = 1.00; // Climax / Chorus 2
    if (isInterlude) macroDynamics = 0.80;

    // High frequency variations (drum transients & syllable peaks)
    const pseudoRand = Math.sin(seed * 997 + i * 13.37) * 0.5 + 0.5;
    const rhythmPulse = Math.sin(i * 0.8) * 0.15;
    const transient = Math.pow(pseudoRand, isTrap ? 1.5 : 2.0);

    let val = (macroDynamics * (0.35 + transient * 0.55) + rhythmPulse) * envelope;
    if (isRnB) val *= 0.88;
    peaks[i] = Math.max(0.08, Math.min(1.0, parseFloat(val.toFixed(3))));
  }

  return peaks;
}

class AlbumMatrixRegistry {
  private static instance: AlbumMatrixRegistry;
  private cache: Map<string, number[]> = new Map();

  private constructor() {}

  public static getInstance(): AlbumMatrixRegistry {
    if (!AlbumMatrixRegistry.instance) {
      AlbumMatrixRegistry.instance = new AlbumMatrixRegistry();
    }
    return AlbumMatrixRegistry.instance;
  }

  public getTrackWaveform(trackId: string, genre: string = "Hip-Hop", duration: number = 210): number[] {
    if (this.cache.has(trackId)) {
      return this.cache.get(trackId)!;
    }

    // Generate deterministic hash seed from trackId
    let seed = 42;
    for (let i = 0; i < trackId.length; i++) {
      seed = (seed * 31 + trackId.charCodeAt(i)) & 0xffffff;
    }

    const waveform = generateRealisticWaveform(seed, genre, duration);
    this.cache.set(trackId, waveform);
    return waveform;
  }

  public setCustomWaveform(trackId: string, peaks: number[]): void {
    this.cache.set(trackId, peaks);
  }
}

export const albumMatrixRegistry = AlbumMatrixRegistry.getInstance();
