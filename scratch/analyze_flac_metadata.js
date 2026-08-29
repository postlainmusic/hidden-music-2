import * as mm from "music-metadata";
import * as fs from "fs";
import * as path from "path";

const musicDir = "c:\\Users\\Admin\\Documents\\github\\hidden-music-2\\music";
const files = fs.readdirSync(musicDir).filter(f => f.endsWith(".flac"));

console.log(`Found ${files.length} FLAC files in ${musicDir}\n`);

async function run() {
  const results = [];
  for (const file of files) {
    const fullPath = path.join(musicDir, file);
    const stats = fs.statSync(fullPath);
    try {
      const metadata = await mm.parseFile(fullPath);
      const info = {
        file,
        sizeMb: (stats.size / (1024 * 1024)).toFixed(2),
        duration: metadata.format.duration ? metadata.format.duration.toFixed(2) : "unknown",
        sampleRate: metadata.format.sampleRate,
        bitsPerSample: metadata.format.bitsPerSample,
        numberOfChannels: metadata.format.numberOfChannels,
        bitrate: metadata.format.bitrate ? (metadata.format.bitrate / 1000).toFixed(0) + " kbps" : "lossless",
        title: metadata.common.title || file,
        artist: metadata.common.artist || "MCK",
        bpm: metadata.common.bpm || "unknown"
      };
      results.push(info);
      console.log(`🎵 [${file}] Duration: ${info.duration}s | ${info.sampleRate}Hz ${info.bitsPerSample}-bit | ${info.bitrate} | Size: ${info.sizeMb}MB`);
    } catch (err) {
      console.error(`Error parsing ${file}:`, err.message);
    }
  }

  fs.writeFileSync("scratch/flac_metadata_summary.json", JSON.stringify(results, null, 2));
  console.log(`\n✅ Saved summary to scratch/flac_metadata_summary.json`);
}

run();
