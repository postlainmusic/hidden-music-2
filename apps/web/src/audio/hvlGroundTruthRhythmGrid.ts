import rhythmGridJson from "./hvlGroundTruthRhythmGrid.json";

export interface GroundTruthTrackProfile {
  trackId: string;
  filename: string;
  duration: number;
  bpm: number;
  rootKey: string;
  firstBeatOffsetMs: number;
  totalBeats: number;
  beatGrid: number[];
  fastKickRolls: number[];
  lowEndBalance: {
    subEnergy: number;
    kickEnergy: number;
    bassEnergy: number;
  };
}

const rhythmData = rhythmGridJson as Record<string, GroundTruthTrackProfile>;

/**
 * Match a track by ID, Title, or Filename to its ground-truth rhythm grid
 */
export function getGroundTruthProfile(query?: string | null): GroundTruthTrackProfile | null {
  if (!query) return null;

  const normalized = query.toLowerCase().trim();
  if (!normalized) return null;

  // 1. Direct filename match
  if (rhythmData[query]) return rhythmData[query];

  // 2. Search by track ID or title substring
  for (const [filename, profile] of Object.entries(rhythmData)) {
    if (filename.toLowerCase().includes(normalized) || 
        profile.trackId.toLowerCase() === normalized ||
        normalized.includes(profile.trackId)) {
      return profile;
    }
  }

  return null;
}

export const groundTruthRhythmRegistry = rhythmData;
