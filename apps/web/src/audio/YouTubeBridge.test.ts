import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { extractYouTubeId, isYouTubeSource } from "./YouTubeBridge.js";

describe("YouTubeBridge", () => {
  describe("extractYouTubeId", () => {
    it("returns null for undefined, null, or empty string", () => {
      assert.equal(extractYouTubeId(undefined), null);
      assert.equal(extractYouTubeId(""), null);
      assert.equal(extractYouTubeId(null as unknown as string), null);
    });

    it("extracts ID from standard watch URL", () => {
      assert.equal(
        extractYouTubeId("https://www.youtube.com/watch?v=dQw4w9WgXcQ"),
        "dQw4w9WgXcQ"
      );
      assert.equal(
        extractYouTubeId("http://youtube.com/watch?v=dQw4w9WgXcQ"),
        "dQw4w9WgXcQ"
      );
    });

    it("extracts ID from short URL (youtu.be)", () => {
      assert.equal(
        extractYouTubeId("https://youtu.be/dQw4w9WgXcQ"),
        "dQw4w9WgXcQ"
      );
    });

    it("extracts ID from embed URL", () => {
      assert.equal(
        extractYouTubeId("https://www.youtube.com/embed/dQw4w9WgXcQ"),
        "dQw4w9WgXcQ"
      );
    });

    it("extracts ID from /v/ and /e/ URLs", () => {
      assert.equal(
        extractYouTubeId("https://www.youtube.com/v/dQw4w9WgXcQ"),
        "dQw4w9WgXcQ"
      );
      assert.equal(
        extractYouTubeId("https://www.youtube.com/e/dQw4w9WgXcQ"),
        "dQw4w9WgXcQ"
      );
    });

    it("extracts ID from youtube-nocookie.com URL", () => {
      assert.equal(
        extractYouTubeId("https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"),
        "dQw4w9WgXcQ"
      );
    });

    it("extracts ID when additional query parameters exist", () => {
      assert.equal(
        extractYouTubeId("https://www.youtube.com/watch?v=dQw4w9WgXcQ&feature=shared&t=10s"),
        "dQw4w9WgXcQ"
      );
      assert.equal(
        extractYouTubeId("https://www.youtube.com/watch?list=PL12345&v=dQw4w9WgXcQ&index=1"),
        "dQw4w9WgXcQ"
      );
      assert.equal(
        extractYouTubeId("https://youtu.be/dQw4w9WgXcQ?t=120"),
        "dQw4w9WgXcQ"
      );
    });

    it("returns null for non-YouTube URLs", () => {
      assert.equal(extractYouTubeId("https://example.com/watch?v=dQw4w9WgXcQ"), null);
      assert.equal(extractYouTubeId("https://soundcloud.com/artist/track"), null);
      assert.equal(extractYouTubeId("https://vimeo.com/123456789"), null);
    });

    it("returns null for invalid or truncated YouTube URLs", () => {
      assert.equal(extractYouTubeId("https://www.youtube.com/watch?v=tooShort"), null);
      assert.equal(extractYouTubeId("https://youtu.be/"), null);
      assert.equal(extractYouTubeId("not a url"), null);
    });
  });

  describe("isYouTubeSource", () => {
    it("returns true for valid YouTube URLs", () => {
      assert.equal(isYouTubeSource("https://www.youtube.com/watch?v=dQw4w9WgXcQ"), true);
      assert.equal(isYouTubeSource("https://youtu.be/dQw4w9WgXcQ"), true);
    });

    it("returns false for non-YouTube URLs or invalid inputs", () => {
      assert.equal(isYouTubeSource("https://example.com"), false);
      assert.equal(isYouTubeSource(""), false);
      assert.equal(isYouTubeSource(undefined), false);
    });
  });
});
