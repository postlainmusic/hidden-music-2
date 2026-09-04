import { exec, execSync } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const runAsync = async (cmd, description) => {
  console.log(`\n🚀 [${description}] Starting: ${cmd}`);
  const startTime = Date.now();
  try {
    const { stdout, stderr } = await execAsync(cmd, { shell: true });
    if (stdout.trim()) console.log(stdout.trim());
    if (stderr.trim()) console.warn(stderr.trim());
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ [${description}] Completed in ${duration}s!`);
  } catch (error) {
    console.error(`❌ [${description}] Failed:`, error.message);
    if (error.stdout) console.log(error.stdout);
    if (error.stderr) console.error(error.stderr);
    process.exit(1);
  }
};

const runSync = (cmd, description) => {
  console.log(`\n🚀 [${description}] Executing: ${cmd}`);
  const startTime = Date.now();
  try {
    execSync(cmd, { stdio: 'inherit', shell: true });
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ [${description}] Success in ${duration}s!`);
  } catch (error) {
    console.error(`❌ [${description}] Failed:`, error.message);
    process.exit(1);
  }
};

const commitMsg = process.argv.slice(2).join(' ') || `chore(release): auto deploy & sync ${new Date().toISOString()}`;

console.log('=============================================');
console.log('🎵 HIDDEN MUSIC 2 — PARALLEL AUTO BUILD & SHIP');
console.log('=============================================');

const totalStart = Date.now();

// 1. Parallel Build Monorepo (Web + API)
console.log('\n📦 Step 1: Parallel Monorepo Build (Web + API)');
await Promise.all([
  runAsync('npm run build:web', 'Build Web (Vite)'),
  runAsync('npm run build:api', 'Typecheck API (TSC)')
]);

// 2. Parallel Deploy (Pages + Worker API)
console.log('\n☁️ Step 2: Parallel Cloudflare Deployment');
await Promise.all([
  runAsync('npx wrangler pages deploy apps/web/dist --project-name=hidden-music-web', 'Deploy Web to Pages'),
  runAsync('cd apps/api && npx wrangler deploy', 'Deploy Worker API')
]);

// 3. Git Stage, Commit & Push
console.log('\n🐙 Step 3: Git Synchronization');
runSync('git add .', 'Git Stage All');
try {
  execSync(`git commit -m "${commitMsg}"`, { stdio: 'inherit', shell: true });
  console.log('✅ Git committed.');
} catch (e) {
  console.log('ℹ️ No new changes to commit.');
}
runSync('git push origin main', 'Git Push to Origin Main');

const totalDuration = ((Date.now() - totalStart) / 1000).toFixed(2);
console.log(`\n🎉 ALL DONE in ${totalDuration}s! Live Web & Worker API updated, Git synced seamlessly.\n`);
