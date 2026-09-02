import { performance } from "perf_hooks";

// Generate sample backup data (30 tracks, typical album backup size)
function generateMockBackup(trackCount = 30) {
  const tracks = [];
  for (let i = 1; i <= trackCount; i++) {
    tracks.push({
      id: `track-${i}`,
      album_id: "hvl-99",
      title: `Track ${i}`,
      artist: "MCK",
      duration_sec: 200,
      audio_url: `https://media.postlain.com/audio/track-${i}.m4a`,
      video_url: null,
      cover_url: "https://media.postlain.com/covers/HVL_Album_Cover.jpg",
      r2_key: `audio/track-${i}.m4a`,
      video_type: "r2_master",
      video_quality: "4K MASTER",
      audio_bitrate: "24-BIT / 96kHz",
      lyrics_synced: "",
      bpm: 120,
      mood_tier: "melodic_ambient",
      palette_json: "{}"
    });
  }
  return { tracks };
}

// Simulated D1 database with simulated network latency per operation
class MockD1Database {
  constructor(latencyMs = 5) {
    this.latencyMs = latencyMs;
    this.executedQueries = [];
  }

  prepare(sql) {
    const db = this;
    return {
      sql,
      bind(...params) {
        return {
          sql,
          params,
          async run() {
            // Simulated per-query network round-trip delay to Cloudflare D1
            await new Promise((resolve) => setTimeout(resolve, db.latencyMs));
            db.executedQueries.push({ sql, params });
            return { success: true };
          }
        };
      }
    };
  }

  async batch(statements) {
    // Simulated batch operation: single round-trip for all statements
    await new Promise((resolve) => setTimeout(resolve, this.latencyMs));
    const results = [];
    for (const stmt of statements) {
      this.executedQueries.push({ sql: stmt.sql, params: stmt.params });
      results.push({ success: true });
    }
    return results;
  }
}

// Sequential implementation (Original N+1 code)
async function restoreTracksSequential(db, backup) {
  if (Array.isArray(backup.tracks)) {
    for (const t of backup.tracks) {
      await db.prepare(`
        INSERT OR REPLACE INTO tracks (
          id, album_id, title, artist, duration_sec, audio_url, video_url, cover_url, r2_key,
          video_type, video_quality, audio_bitrate, lyrics_synced, bpm, mood_tier, palette_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
        .bind(
          t.id, t.album_id || "hvl-99", t.title, t.artist || "MCK", t.duration_sec || 200,
          t.audio_url, t.video_url || null, t.cover_url || "https://media.postlain.com/covers/HVL_Album_Cover.jpg", t.r2_key || null,
          t.video_type || "r2_master", t.video_quality || "4K MASTER", t.audio_bitrate || "24-BIT / 96kHz",
          t.lyrics_synced || "", t.bpm || 120, t.mood_tier || "melodic_ambient", t.palette_json || "{}"
        )
        .run();
    }
  }
}

// Batched implementation (Optimized code)
async function restoreTracksBatched(db, backup) {
  if (Array.isArray(backup.tracks) && backup.tracks.length > 0) {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO tracks (
        id, album_id, title, artist, duration_sec, audio_url, video_url, cover_url, r2_key,
        video_type, video_quality, audio_bitrate, lyrics_synced, bpm, mood_tier, palette_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const trackBatch = backup.tracks.map((t) =>
      stmt.bind(
        t.id, t.album_id || "hvl-99", t.title, t.artist || "MCK", t.duration_sec || 200,
        t.audio_url, t.video_url || null, t.cover_url || "https://media.postlain.com/covers/HVL_Album_Cover.jpg", t.r2_key || null,
        t.video_type || "r2_master", t.video_quality || "4K MASTER", t.audio_bitrate || "24-BIT / 96kHz",
        t.lyrics_synced || "", t.bpm || 120, t.mood_tier || "melodic_ambient", t.palette_json || "{}"
      )
    );
    await db.batch(trackBatch);
  }
}

async function runBenchmark() {
  const trackCount = 30;
  const backup = generateMockBackup(trackCount);
  const latencyMs = 5; // standard simulated Cloudflare D1 query latency

  console.log(`--- Running Track Backup Restoration Benchmark (${trackCount} tracks, ${latencyMs}ms latency/roundtrip) ---`);

  // Baseline
  const dbSequential = new MockD1Database(latencyMs);
  const startSeq = performance.now();
  await restoreTracksSequential(dbSequential, backup);
  const durationSeq = performance.now() - startSeq;

  console.log(`Baseline (Sequential N+1 queries): ${durationSeq.toFixed(2)} ms (${dbSequential.executedQueries.length} queries)`);

  // Batched
  const dbBatched = new MockD1Database(latencyMs);
  const startBatch = performance.now();
  await restoreTracksBatched(dbBatched, backup);
  const durationBatch = performance.now() - startBatch;

  console.log(`Optimized (D1 Batch statement):   ${durationBatch.toFixed(2)} ms (${dbBatched.executedQueries.length} queries in 1 batch)`);

  const speedup = (durationSeq / durationBatch).toFixed(2);
  const savedMs = (durationSeq - durationBatch).toFixed(2);
  console.log(`\n⚡ Speedup: ${speedup}x faster (${savedMs} ms saved)`);

  // Validation
  if (dbSequential.executedQueries.length !== dbBatched.executedQueries.length) {
    throw new Error("Mismatch in number of executed queries!");
  }
}

runBenchmark().catch((err) => {
  console.error("Benchmark failed:", err);
  process.exit(1);
});
