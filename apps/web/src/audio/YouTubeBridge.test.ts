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

  describe("URL utilities", () => {
    it("should extract YouTube IDs correctly", () => {
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
      assert.strictEqual(extractYouTubeId("invalid-url"), null);
      assert.strictEqual(extractYouTubeId(""), null);
      assert.strictEqual(extractYouTubeId(undefined), null);
    });

    it("should identify YouTube sources correctly", () => {
      assert.strictEqual(
        isYouTubeSource("https://www.youtube.com/watch?v=dQw4w9WgXcQ"),
        true
      );
      assert.strictEqual(
        isYouTubeSource("https://media.postlain.com/audio/song.flac"),
        false
      );
      assert.strictEqual(isYouTubeSource(undefined), false);
    });
  });
});
