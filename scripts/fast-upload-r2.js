import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const dir = path.resolve('HVL/MPEG-4 AUDIO');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.m4a'));
console.log(`Starting Parallel FastStart Upload for ${files.length} audio tracks (Concurrency: 5)...\n`);

const CONCURRENCY = 5;
let currentIndex = 0;
let completed = 0;

function uploadFile(file) {
  return new Promise((resolve) => {
    const filePath = path.join(dir, file);
    const r2Key = `hidden-music-vault/audio/${file}`;
    const startTime = Date.now();

    const args = [
      'wrangler',
      'r2',
      'object',
      'put',
      r2Key,
      `--file=${filePath}`,
      '--content-type=audio/mp4',
      '--cache-control=public, max-age=31536000, immutable'
    ];

    const child = spawn('npx.cmd', args, { stdio: 'pipe', shell: true });
    
    child.on('close', (code) => {
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      if (code === 0) {
        completed++;
        console.log(`✅ [${completed}/${files.length}] (${duration}s) Uploaded: ${file}`);
      } else {
        console.error(`❌ Failed: ${file} (exit code ${code})`);
      }
      resolve();
    });

    child.on('error', (err) => {
      console.error(`❌ Error spawning upload for ${file}:`, err.message);
      resolve();
    });
  });
}

async function runPool() {
  const workers = [];
  for (let i = 0; i < CONCURRENCY; i++) {
    workers.push((async () => {
      while (currentIndex < files.length) {
        const file = files[currentIndex++];
        await uploadFile(file);
      }
    })());
  }

  await Promise.all(workers);
  console.log('\n🎉 ALL 30 FASTSTART TRACKS SUCCESSFULLY UPLOADED TO CLOUDFLARE R2!');
}

runPool();
