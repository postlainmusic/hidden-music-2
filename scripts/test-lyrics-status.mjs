import https from 'https';
import fs from 'fs';

const code = fs.readFileSync('apps/web/src/store/audioStore.ts', 'utf8');
const titles = [...code.matchAll(/title:\s*"([^"]+)"/g)].map(m => m[1]);

console.log('Total titles found in audioStore:', titles.length);

async function run() {
  for (const title of titles) {
    const enc = encodeURIComponent(title) + '.lrc';
    await new Promise((resolve) => {
      https.get('https://media.postlain.com/lyrics/' + enc, (res) => {
        console.log(`${title} --> ${res.statusCode}`);
        resolve();
      }).on('error', (e) => {
        console.log(`${title} --> ERROR: ${e.message}`);
        resolve();
      });
    });
  }
}

run();
