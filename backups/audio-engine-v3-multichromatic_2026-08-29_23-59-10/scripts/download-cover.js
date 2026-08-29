import https from 'https';
import fs from 'fs';
import path from 'path';

const publicCoversDir = path.resolve('apps/web/public/covers');
if (!fs.existsSync(publicCoversDir)) {
  fs.mkdirSync(publicCoversDir, { recursive: true });
}

const targetJpg = path.join(publicCoversDir, 'HVL_Album_Cover.jpg');
const targetWebp = path.join(publicCoversDir, 'HVL_Album_Cover.webp');

console.log('Downloading HVL_Album_Cover from CDN to local public/covers/...');

const file = fs.createWriteStream(targetJpg);
https.get('https://media.postlain.com/covers/HVL_Album_Cover.jpg', (res) => {
  res.pipe(file);
  file.on('finish', () => {
    file.close();
    console.log('✅ Saved:', targetJpg, `(${fs.statSync(targetJpg).size} bytes)`);
    // Also copy to webp alias so both paths are available locally
    fs.copyFileSync(targetJpg, targetWebp);
    console.log('✅ Created:', targetWebp);
  });
}).on('error', (err) => {
  console.error('❌ Download error:', err.message);
});
