import { describe, it, expect } from "vitest";
import { getGroundTruthProfile, groundTruthRhythmRegistry } from "./hvlGroundTruthRhythmGrid";

describe("hvlGroundTruthRhythmGrid - getGroundTruthProfile", () => {
  describe("Falsy and empty query handling", () => {
    it("returns null when query is undefined", () => {
      expect(getGroundTruthProfile()).toBeNull();
    });

    it("returns null when query is null", () => {
      expect(getGroundTruthProfile(null)).toBeNull();
    });

    it("returns null when query is an empty string", () => {
      expect(getGroundTruthProfile("")).toBeNull();
    });

    it("returns null when query is whitespace only", () => {
      expect(getGroundTruthProfile("   ")).toBeNull();
      expect(getGroundTruthProfile("\t\n")).toBeNull();
    });
  });

  describe("Direct filename match", () => {
    it("matches exact filename key", () => {
      const profile = getGroundTruthProfile("01. Elegie.flac");
      expect(profile).not.toBeNull();
      expect(profile?.filename).toBe("01. Elegie.flac");
      expect(profile?.trackId).toBe("01");
    });

    it("matches exact filename for another track", () => {
      const profile = getGroundTruthProfile("02. IDK.flac");
      expect(profile).not.toBeNull();
      expect(profile?.filename).toBe("02. IDK.flac");
      expect(profile?.trackId).toBe("02");
    });
  });

  describe("Search by track ID or title substring", () => {
    it("matches by track ID", () => {
      const profile = getGroundTruthProfile("01");
      expect(profile).not.toBeNull();
      expect(profile?.trackId).toBe("01");
    });

    it("matches by title substring in lower case", () => {
      const profile = getGroundTruthProfile("elegie");
      expect(profile).not.toBeNull();
      expect(profile?.trackId).toBe("01");
    });

    it("matches by title substring in mixed case with extra whitespace", () => {
      const profile = getGroundTruthProfile("  eLeGiE  ");
      expect(profile).not.toBeNull();
      expect(profile?.trackId).toBe("01");
    });

    it("matches when query includes the track ID substring", () => {
      const profile = getGroundTruthProfile("track_02_audio");
      expect(profile).not.toBeNull();
      expect(profile?.trackId).toBe("02");
    });

    it("matches partial title for multi-word track title", () => {
      const profile = getGroundTruthProfile("wtf bby");
      expect(profile).not.toBeNull();
      expect(profile?.trackId).toBe("03");
    });
  });

  describe("Non-matching query handling", () => {
    it("returns null for non-existent track query", () => {
      expect(getGroundTruthProfile("non_existent_track_xyz_999")).toBeNull();
    });
  });

  describe("Profile structure verification", () => {
    it("returns a complete GroundTruthTrackProfile with all expected fields", () => {
      const profile = getGroundTruthProfile("01. Elegie.flac");
      expect(profile).toBeDefined();
      if (!profile) return;

      expect(typeof profile.trackId).toBe("string");
      expect(typeof profile.filename).toBe("string");
      expect(typeof profile.duration).toBe("number");
      expect(typeof profile.bpm).toBe("number");
      expect(typeof profile.rootKey).toBe("string");
      expect(typeof profile.firstBeatOffsetMs).toBe("number");
      expect(typeof profile.totalBeats).toBe("number");
      expect(Array.isArray(profile.beatGrid)).toBe(true);
      expect(Array.isArray(profile.fastKickRolls)).toBe(true);
      expect(profile.lowEndBalance).toBeDefined();
      expect(typeof profile.lowEndBalance.subEnergy).toBe("number");
      expect(typeof profile.lowEndBalance.kickEnergy).toBe("number");
      expect(typeof profile.lowEndBalance.bassEnergy).toBe("number");
    });
  });

  describe("groundTruthRhythmRegistry export", () => {
    it("exports the registry object containing ground truth track profiles", () => {
      expect(groundTruthRhythmRegistry).toBeDefined();
      expect(Object.keys(groundTruthRhythmRegistry).length).toBeGreaterThan(0);
      expect(groundTruthRhythmRegistry["01. Elegie.flac"]).toBeDefined();
    });
  });
});
