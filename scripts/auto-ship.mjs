import { execSync } from 'child_process';

const run = (cmd, description) => {
  console.log(`\n🚀 [${description}] Executing: ${cmd}`);
  try {
    execSync(cmd, { stdio: 'inherit', shell: true });
    console.log(`✅ [${description}] Success!`);
  } catch (error) {
    console.error(`❌ [${description}] Failed:`, error.message);
    process.exit(1);
  }
};

const commitMsg = process.argv.slice(2).join(' ') || `chore(release): auto deploy & sync ${new Date().toISOString()}`;

console.log('=============================================');
console.log('🎵 HIDDEN MUSIC 2 — AUTO BUILD & SHIP PIPELINE');
console.log('=============================================');

// 1. Build Monorepo (Web + API)
run('npm run build', '1/4 Build Monorepo (Vite & Typescript)');

// 2. Deploy Web to Cloudflare Pages
run('npx wrangler pages deploy apps/web/dist --project-name=hidden-music-web', '2/4 Deploy to Cloudflare Pages');

// 3. Deploy API to Cloudflare Workers
run('cd apps/api && npx wrangler deploy', '3/4 Deploy API Worker');

// 4. Git Stage, Commit & Push
run('git add .', '4/4 Git Stage All');
try {
  execSync(`git commit -m "${commitMsg}"`, { stdio: 'inherit', shell: true });
  console.log('✅ Git committed.');
} catch (e) {
  console.log('ℹ️ No new changes to commit.');
}
run('git push origin main', '4/4 Git Push to Origin Main');

console.log('\n🎉 ALL DONE! Live Web & Worker API updated, Git synced seamlessly.\n');
