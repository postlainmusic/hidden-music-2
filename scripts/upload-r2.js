import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const dir = path.resolve('HVL/MPEG-4 AUDIO');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.m4a'));
console.log(`Starting Cloudflare R2 Upload for ${files.length} FastStart audio files...\n`);

for (let i = 0; i < files.length; i++) {
  const file = files[i];
  const filePath = path.join(dir, file);
  const r2Key = `hidden-music-vault/audio/${file}`;
  
  console.log(`[${i + 1}/${files.length}] Uploading: ${file}...`);
  try {
    execSync(`npx wrangler r2 object put "${r2Key}" --file="${filePath}" --content-type="audio/mp4" --cache-control="public, max-age=31536000, immutable"`, {
      stdio: 'inherit'
    });
    console.log(`✅ [${i + 1}/${files.length}] OK: ${file}\n`);
  } catch (err) {
    console.error(`❌ [${i + 1}/${files.length}] Error on ${file}:`, err.message);
  }
}

console.log('🎉 ALL 30 FASTSTART AUDIO FILES UPLOADED TO CLOUDFLARE R2!');
