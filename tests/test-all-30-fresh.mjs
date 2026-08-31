import fs from "fs";

const raw = fs.readFileSync("scratch/tracks_fresh.json", "utf8").replace(/^\uFEFF/, "");
const data = JSON.parse(raw);

async function testAll() {
  console.log("==================================================");
  console.log("🎵 VERIFYING ALL 30 LOSSLESS / M4A TRACKS ON R2");
  console.log("==================================================");

  let okCount = 0;
  for (let i = 0; i < data.tracks.length; i++) {
    const t = data.tracks[i];
    const m4aUrl = t.audio_url.replace(".flac", ".m4a");
    try {
      const res = await fetch(m4aUrl, {
        headers: {
          Origin: "https://hiddenmusic.postlain.com",
          Range: "bytes=0-100"
        }
      });
      const ok = res.status === 206 || res.status === 200;
      if (ok) okCount++;
      console.log(`[${i + 1}] ${t.title} => HTTP ${res.status} ${ok ? "✅ OK" : "❌ FAIL"}`);
    } catch (e) {
      console.log(`[${i + 1}] ${t.title} => ERROR ${e.message}`);
    }
  }
  console.log(`\n🎉 Total Verified: ${okCount} / ${data.tracks.length}`);
}

testAll();
