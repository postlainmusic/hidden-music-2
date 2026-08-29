import https from 'https';
import fs from 'fs';

const BASE_URL = 'https://hiddenmusic.postlain.com';
const CDN_URL = 'https://media.postlain.com/audio';
const API_URL = 'https://hidden-music-api.postlain-music.workers.dev/api/stream';

console.log('=== RUNNING DEEP PERFORMANCE & NETWORK AUDIT ===\n');

function measureUrl(url, headers = {}) {
  return new Promise((resolve) => {
    const start = performance.now();
    const req = https.get(url, { headers }, (res) => {
      const ttfb = performance.now() - start;
      let size = 0;
      res.on('data', chunk => size += chunk.length);
      res.on('end', () => {
        const total = performance.now() - start;
        resolve({
          url,
          status: res.statusCode,
          ttfb: Math.round(ttfb),
          total: Math.round(total),
          size,
          headers: res.headers,
          cache: res.headers['cf-cache-status'] || res.headers['x-cache'] || 'NONE',
          acceptRanges: res.headers['accept-ranges'],
          contentRange: res.headers['content-range']
        });
      });
    });

    req.on('error', err => {
      resolve({
        url,
        status: 'ERROR',
        ttfb: -1,
        total: -1,
        size: 0,
        error: err.message
      });
    });

    req.setTimeout(10000, () => {
      req.destroy();
      resolve({
        url,
        status: 'TIMEOUT',
        ttfb: 10000,
        total: 10000,
        size: 0
      });
    });
  });
}

async function runAudit() {
  console.log('--- 1. WEB ASSETS PERFORMANCE ---');
  const page = await measureUrl(BASE_URL);
  console.log(`HTML Page: ${page.status} | TTFB: ${page.ttfb}ms | Load: ${page.total}ms | Size: ${page.size}B | CF: ${page.cache}`);

  const cover = await measureUrl('https://media.postlain.com/covers/HVL_Album_Cover.jpg');
  console.log(`Album Cover: ${cover.status} | TTFB: ${cover.ttfb}ms | Load: ${cover.total}ms | Size: ${cover.size}B | CF: ${cover.cache}`);

  console.log('\n--- 2. AUDIO STREAMING BENCHMARK (ALL 30 TRACKS - INITIAL MOOV PROBE) ---');
  
  const storeContent = fs.readFileSync('apps/web/src/store/audioStore.ts', 'utf8');
  const lines = storeContent.split('\n').filter(l => l.includes('audioUrl:'));
  const tracks = lines.map((l, i) => {
    const match = l.match(/\/audio\/([^`,]+)/);
    return {
      id: i + 1,
      file: match ? decodeURIComponent(match[1].replace(/`$/, '')) : ''
    };
  }).filter(t => t.file.length > 0);

  const results = [];
  for (const t of tracks) {
    const streamUrl = `${CDN_URL}/${encodeURIComponent(t.file)}`;
    const res = await measureUrl(streamUrl, { Range: 'bytes=0-32767' });
    results.push({ ...t, ...res });
    const icon = res.status === 206 ? '⚡' : '❌';
    console.log(`[${t.id.toString().padStart(2, '0')}] ${icon} Status: ${res.status} | TTFB: ${res.ttfb}ms | 32KB Probe: ${res.total}ms | Cache: ${res.cache} | ${t.file}`);
  }

  console.log('\n--- 3. TIMELINE SEEKING SIMULATION (RANDOM MID-POINT RANGE REQUESTS) ---');
  const testSeekTracks = [tracks[0], tracks[4], tracks[9], tracks[14], tracks[19], tracks[24], tracks[29]].filter(Boolean);
  for (const t of testSeekTracks) {
    const seekUrl = `${CDN_URL}/${encodeURIComponent(t.file)}`;
    // Seek to 3MB offset
    const seekRes = await measureUrl(seekUrl, { Range: 'bytes=3000000-3500000' });
    console.log(`Seek Test Track #${t.id} (${t.file.substring(0, 20)}...): Status: ${seekRes.status} | TTFB: ${seekRes.ttfb}ms | 500KB Chunk: ${seekRes.total}ms | Range: ${seekRes.contentRange}`);
  }

  // Summary Metrics
  const avgTtfb = Math.round(results.reduce((acc, r) => acc + (r.ttfb > 0 ? r.ttfb : 0), 0) / results.length);
  const avgProbe = Math.round(results.reduce((acc, r) => acc + (r.total > 0 ? r.total : 0), 0) / results.length);
  const cacheHitCount = results.filter(r => r.cache === 'HIT').length;

  console.log('\n=== AUDIT SUMMARY ===');
  console.log(`Total Tracks Audited: ${results.length}/30`);
  console.log(`HTTP 206 Success Rate: ${(results.filter(r => r.status === 206).length / results.length * 100).toFixed(1)}%`);
  console.log(`Cloudflare Edge Cache Hit Rate: ${((cacheHitCount / results.length) * 100).toFixed(1)}% (${cacheHitCount}/${results.length})`);
  console.log(`Average TTFB: ${avgTtfb}ms`);
  console.log(`Average Initial Metadata Probe (32KB): ${avgProbe}ms`);
}

runAudit();
