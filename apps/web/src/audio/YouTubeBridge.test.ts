import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import {
  youTubeAudioBridge,
  extractYouTubeId,
  isYouTubeSource,
} from "./YouTubeBridge.ts";

describe("YouTubeBridge", () => {
  let originalPlayer: any;

  beforeEach(() => {
    originalPlayer = (youTubeAudioBridge as any).player;
  });

  afterEach(() => {
    (youTubeAudioBridge as any).player = originalPlayer;
  });

  describe("getCurrentTime()", () => {
    it("should return 0 when player is null or undefined", () => {
      (youTubeAudioBridge as any).player = null;
      assert.strictEqual(youTubeAudioBridge.getCurrentTime(), 0);

      (youTubeAudioBridge as any).player = undefined;
      assert.strictEqual(youTubeAudioBridge.getCurrentTime(), 0);
    });

    it("should return 0 when player does not have getCurrentTime function", () => {
      (youTubeAudioBridge as any).player = {};
      assert.strictEqual(youTubeAudioBridge.getCurrentTime(), 0);

      (youTubeAudioBridge as any).player = { getCurrentTime: "not a function" };
      assert.strictEqual(youTubeAudioBridge.getCurrentTime(), 0);
    });

    it("should return the current time when player.getCurrentTime() succeeds", () => {
      (youTubeAudioBridge as any).player = {
        getCurrentTime: () => 42.5,
      };
      assert.strictEqual(youTubeAudioBridge.getCurrentTime(), 42.5);
    });

    it("should return 0 when player.getCurrentTime() returns 0 or falsy values", () => {
      (youTubeAudioBridge as any).player = {
        getCurrentTime: () => 0,
      };
      assert.strictEqual(youTubeAudioBridge.getCurrentTime(), 0);

      (youTubeAudioBridge as any).player = {
        getCurrentTime: () => null,
      };
      assert.strictEqual(youTubeAudioBridge.getCurrentTime(), 0);

      (youTubeAudioBridge as any).player = {
        getCurrentTime: () => undefined,
      };
      assert.strictEqual(youTubeAudioBridge.getCurrentTime(), 0);

      (youTubeAudioBridge as any).player = {
        getCurrentTime: () => NaN,
      };
      assert.strictEqual(youTubeAudioBridge.getCurrentTime(), 0);
    });

    it("should catch errors thrown by player.getCurrentTime() and return 0", () => {
      (youTubeAudioBridge as any).player = {
        getCurrentTime: () => {
          throw new Error("Player unmounted or API error");
        },
      };
      assert.strictEqual(youTubeAudioBridge.getCurrentTime(), 0);
    });
  });

  describe("getDuration()", () => {
    it("should return 0 when player is null", () => {
      (youTubeAudioBridge as any).player = null;
      assert.strictEqual(youTubeAudioBridge.getDuration(), 0);
    });

    it("should return duration when player.getDuration() succeeds", () => {
      (youTubeAudioBridge as any).player = {
        getDuration: () => 210.5,
      };
      assert.strictEqual(youTubeAudioBridge.getDuration(), 210.5);
    });

    it("should catch errors thrown by player.getDuration() and return 0", () => {
      (youTubeAudioBridge as any).player = {
        getDuration: () => {
          throw new Error("Internal player error");
        },
      };
      assert.strictEqual(youTubeAudioBridge.getDuration(), 0);
    });
  });

  describe("extractYouTubeId", () => {
    it("should extract 11-character YouTube IDs correctly across various URL formats", () => {
      assert.strictEqual(
        extractYouTubeId("https://www.youtube.com/watch?v=dQw4w9WgXcQ"),
        "dQw4w9WgXcQ"
      );
      assert.strictEqual(
        extractYouTubeId("https://youtu.be/dQw4w9WgXcQ"),
        "dQw4w9WgXcQ"
      );
      assert.strictEqual(
        extractYouTubeId("https://www.youtube.com/embed/dQw4w9WgXcQ"),
        "dQw4w9WgXcQ"
      );
      assert.strictEqual(
        extractYouTubeId("https://www.youtube.com/v/dQw4w9WgXcQ"),
        "dQw4w9WgXcQ"
      );
    });

    it("should return null for invalid, empty, or missing inputs", () => {
      assert.strictEqual(extractYouTubeId("invalid-url"), null);
      assert.strictEqual(extractYouTubeId(""), null);
      assert.strictEqual(extractYouTubeId(undefined), null);
    });
  });

  describe("isYouTubeSource", () => {
    it("should return true for standard YouTube URLs", () => {
      assert.strictEqual(
        isYouTubeSource("https://www.youtube.com/watch?v=dQw4w9WgXcQ"),
        true
      );
      assert.strictEqual(
        isYouTubeSource("http://www.youtube.com/watch?v=dQw4w9WgXcQ"),
        true
      );
      assert.strictEqual(
        isYouTubeSource("https://youtube.com/watch?v=dQw4w9WgXcQ"),
        true
      );
    });

    it("should return true for mobile and music subdomains", () => {
      assert.strictEqual(
        isYouTubeSource("https://m.youtube.com/watch?v=dQw4w9WgXcQ"),
        true
      );
      assert.strictEqual(
        isYouTubeSource("https://music.youtube.com/watch?v=dQw4w9WgXcQ"),
        true
      );
    });

    it("should return true for shortened youtu.be links", () => {
      assert.strictEqual(
        isYouTubeSource("https://youtu.be/dQw4w9WgXcQ"),
        true
      );
      assert.strictEqual(
        isYouTubeSource("http://youtu.be/dQw4w9WgXcQ?t=30"),
        true
      );
    });

    it("should return true for embed and player URLs", () => {
      assert.strictEqual(
        isYouTubeSource("https://www.youtube.com/embed/dQw4w9WgXcQ"),
        true
      );
      assert.strictEqual(
        isYouTubeSource("https://www.youtube.com/v/dQw4w9WgXcQ"),
        true
      );
    });

    it("should return true for URLs with extra query parameters", () => {
      assert.strictEqual(
        isYouTubeSource("https://www.youtube.com/watch?v=dQw4w9WgXcQ&feature=shared"),
        true
      );
      assert.strictEqual(
        isYouTubeSource("https://www.youtube.com/watch?list=PL12345&v=dQw4w9WgXcQ&t=100s"),
        true
      );
    });

    it("should return false for non-YouTube audio or video URLs", () => {
      assert.strictEqual(
        isYouTubeSource("https://media.postlain.com/audio/song.flac"),
        false
      );
      assert.strictEqual(
        isYouTubeSource("https://vimeo.com/123456789"),
        false
      );
      assert.strictEqual(
        isYouTubeSource("https://soundcloud.com/artist/track"),
        false
      );
    });

    it("should return false for invalid, empty, or undefined input", () => {
      assert.strictEqual(isYouTubeSource(undefined), false);
      assert.strictEqual(isYouTubeSource(""), false);
      assert.strictEqual(isYouTubeSource("   "), false);
      assert.strictEqual(isYouTubeSource("invalid-string-not-a-url"), false);
    });
  });
});
