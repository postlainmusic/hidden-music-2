// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  extractYouTubeId,
  isYouTubeSource,
  youTubeAudioBridge,
  loadYouTubeApi,
} from "./YouTubeBridge";

describe("YouTubeBridge URL Utilities", () => {
  it("should extract YouTube IDs correctly from various URL formats", () => {
    expect(extractYouTubeId("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe(
      "dQw4w9WgXcQ"
    );
    expect(extractYouTubeId("https://youtu.be/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    expect(extractYouTubeId("https://www.youtube.com/embed/dQw4w9WgXcQ")).toBe(
      "dQw4w9WgXcQ"
    );
    expect(
      extractYouTubeId(
        "https://www.youtube.com/watch?v=dQw4w9WgXcQ&feature=shared&t=30"
      )
    ).toBe("dQw4w9WgXcQ");
  });

  it("should return null for non-YouTube URLs or invalid input", () => {
    expect(extractYouTubeId(undefined)).toBeNull();
    expect(extractYouTubeId("")).toBeNull();
    expect(extractYouTubeId("https://media.postlain.com/audio/01.m4a")).toBeNull();
    expect(extractYouTubeId("https://example.com/watch?v=notayoutubeid")).toBeNull();
  });

  it("should correctly identify YouTube sources", () => {
    expect(isYouTubeSource("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe(true);
    expect(isYouTubeSource("https://youtu.be/dQw4w9WgXcQ")).toBe(true);
    expect(isYouTubeSource("https://media.postlain.com/audio/01.m4a")).toBe(false);
    expect(isYouTubeSource(undefined)).toBe(false);
  });
});

describe("YouTubeAudioBridge getDuration Error Handling", () => {
  beforeEach(() => {
    // Reset player state before each test
    (youTubeAudioBridge as any).player = null;
  });

  it("should return 0 when player is null or undefined", () => {
    (youTubeAudioBridge as any).player = null;
    expect(youTubeAudioBridge.getDuration()).toBe(0);

    (youTubeAudioBridge as any).player = undefined;
    expect(youTubeAudioBridge.getDuration()).toBe(0);
  });

  it("should return 0 when player is missing getDuration method", () => {
    (youTubeAudioBridge as any).player = {};
    expect(youTubeAudioBridge.getDuration()).toBe(0);
  });

  it("should return duration when player.getDuration() returns a valid number", () => {
    (youTubeAudioBridge as any).player = {
      getDuration: () => 180.5,
    };
    expect(youTubeAudioBridge.getDuration()).toBe(180.5);
  });

  it("should return 0 when player.getDuration() returns 0, NaN, null, or undefined", () => {
    (youTubeAudioBridge as any).player = { getDuration: () => 0 };
    expect(youTubeAudioBridge.getDuration()).toBe(0);

    (youTubeAudioBridge as any).player = { getDuration: () => NaN };
    expect(youTubeAudioBridge.getDuration()).toBe(0);

    (youTubeAudioBridge as any).player = { getDuration: () => null };
    expect(youTubeAudioBridge.getDuration()).toBe(0);

    (youTubeAudioBridge as any).player = { getDuration: () => undefined };
    expect(youTubeAudioBridge.getDuration()).toBe(0);
  });

  it("should catch player.getDuration() exceptions and safely fallback to 0", () => {
    (youTubeAudioBridge as any).player = {
      getDuration: () => {
        throw new Error("YouTube IFrame API Internal Exception: Player state invalid");
      },
    };

    // Ensure getDuration does not throw and returns fallback 0
    expect(() => youTubeAudioBridge.getDuration()).not.toThrow();
    expect(youTubeAudioBridge.getDuration()).toBe(0);
  });
});

describe("YouTubeAudioBridge getCurrentTime Error Handling", () => {
  beforeEach(() => {
    (youTubeAudioBridge as any).player = null;
  });

  it("should return 0 when player is null or missing getCurrentTime method", () => {
    (youTubeAudioBridge as any).player = null;
    expect(youTubeAudioBridge.getCurrentTime()).toBe(0);

    (youTubeAudioBridge as any).player = {};
    expect(youTubeAudioBridge.getCurrentTime()).toBe(0);
  });

  it("should return current time when player.getCurrentTime() returns a valid number", () => {
    (youTubeAudioBridge as any).player = {
      getCurrentTime: () => 45.2,
    };
    expect(youTubeAudioBridge.getCurrentTime()).toBe(45.2);
  });

  it("should catch player.getCurrentTime() exceptions and safely fallback to 0", () => {
    (youTubeAudioBridge as any).player = {
      getCurrentTime: () => {
        throw new TypeError("Cannot read property 'getCurrentTime' of null");
      },
    };

    expect(() => youTubeAudioBridge.getCurrentTime()).not.toThrow();
    expect(youTubeAudioBridge.getCurrentTime()).toBe(0);
  });
});

describe("YouTubeAudioBridge Player Actions Error Handling", () => {
  beforeEach(() => {
    (youTubeAudioBridge as any).player = null;
  });

  it("should handle thrown exception in pause() gracefully", () => {
    (youTubeAudioBridge as any).player = {
      pauseVideo: () => {
        throw new Error("IFrame detached");
      },
    };

    expect(() => youTubeAudioBridge.pause()).not.toThrow();
    expect(youTubeAudioBridge.getIsPlaying()).toBe(false);
  });

  it("should handle thrown exception in resume() gracefully", () => {
    (youTubeAudioBridge as any).player = {
      playVideo: () => {
        throw new Error("Autoplay blocked");
      },
    };

    expect(() => youTubeAudioBridge.resume()).not.toThrow();
  });

  it("should handle thrown exception in seekTo() gracefully", () => {
    (youTubeAudioBridge as any).player = {
      seekTo: () => {
        throw new Error("Seek range error");
      },
    };

    expect(() => youTubeAudioBridge.seekTo(30)).not.toThrow();
  });

  it("should handle thrown exception in setVolume() gracefully", () => {
    (youTubeAudioBridge as any).player = {
      setVolume: () => {
        throw new Error("Volume control restricted");
      },
    };

    expect(() => youTubeAudioBridge.setVolume(0.5)).not.toThrow();
  });
});
