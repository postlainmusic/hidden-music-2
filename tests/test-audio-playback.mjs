// Test verification of audio & video playback stream endpoints and state transition logic
import assert from "node:assert";

console.log("==================================================");
console.log("🎵 TESTING AUDIO & VIDEO STREAM NETWORK VERIFICATION");
console.log("==================================================");

const AUDIO_TRACKS = [
  "https://media.postlain.com/audio/01.%20Elegie.m4a",
  "https://media.postlain.com/audio/02.%20IDK.m4a",
  "https://media.postlain.com/audio/03.%20Wtf%20Bby%20I_m%20Lit.m4a",
  "https://media.postlain.com/audio/04.%20Anh%20Kh%C3%B4ng%20Mu%E1%BB%91n%20N%C3%B3%20D%E1%BB%85%20D%C3%A0ng.m4a",
  "https://media.postlain.com/audio/05.%20Baby%20(feat.%20marzuz).m4a"
];

const VIDEO_TRACKS = [
  "https://media.postlain.com/videos/01.%20Elegie%20-%20MCK.mkv",
  "https://media.postlain.com/videos/02.%20IDK%20-%20MCK%20(Official%20Music%20Video).mkv",
  "https://media.postlain.com/videos/03.%20Wtf%20Bby%20I'm%20Lit%20-%20MCK.mkv"
];

async function testStreams() {
  console.log("\n1. Testing Audio Stream Byte-Ranges & Cloudflare Edge Status:");
  for (const url of AUDIO_TRACKS) {
    const filename = url.split("/").pop();
    const res = await fetch(url, {
      headers: {
        Origin: "https://hiddenmusic.postlain.com",
        Range: "bytes=0-2048"
      }
    });

    console.log(` - [Audio] ${decodeURIComponent(filename)} => HTTP ${res.status}, CF-Cache: ${res.headers.get("cf-cache-status") || "NONE"}, Content-Type: ${res.headers.get("content-type")}, Content-Range: ${res.headers.get("content-range")}`);
    assert.strictEqual(res.status, 206, `Expected HTTP 206 for ${url}`);
    assert(res.headers.get("accept-ranges")?.includes("bytes") || res.headers.get("content-range"), `Expected Byte-Range support for ${url}`);
  }

  console.log("\n2. Testing Video 4K Stream Byte-Ranges & Cloudflare Edge Status:");
  for (const url of VIDEO_TRACKS) {
    const filename = url.split("/").pop();
    const res = await fetch(url, {
      headers: {
        Origin: "https://hiddenmusic.postlain.com",
        Range: "bytes=0-2048"
      }
    });

    console.log(` - [Video] ${decodeURIComponent(filename)} => HTTP ${res.status}, CF-Cache: ${res.headers.get("cf-cache-status") || "NONE"}, Content-Type: ${res.headers.get("content-type")}, Content-Range: ${res.headers.get("content-range")}`);
    assert.strictEqual(res.status, 206, `Expected HTTP 206 for ${url}`);
  }

  console.log("\n✅ All 8 Audio & Video Streams passed HTTP 206 Byte-Range Validation!");
}

testStreams().catch((err) => {
  console.error("❌ Test Failed:", err);
  process.exit(1);
});
