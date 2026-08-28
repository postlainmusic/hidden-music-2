const puppeteer = require('puppeteer-core');

async function testRealBrowserAudio() {
  console.log('=== RUNNING REAL GOOGLE CHROME LIVE AUDIO TEST ===');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--autoplay-policy=no-user-gesture-required',
      '--disable-features=AudioServiceOutOfProcess'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  const consoleLogs = [];
  const networkLogs = [];

  page.on('console', (msg) => consoleLogs.push(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', (err) => consoleLogs.push(`[ERROR] ${err.toString()}`));

  page.on('response', (response) => {
    const url = response.url();
    if (url.includes('.flac') || url.includes('media.postlain.com')) {
      networkLogs.push({
        url: url.substring(0, 70),
        status: response.status(),
        cfCache: response.headers()['cf-cache-status'],
        contentRange: response.headers()['content-range'],
        contentLength: response.headers()['content-length']
      });
    }
  });

  console.log('Navigating to https://hidden-music-web.pages.dev ...');
  await page.goto('https://hidden-music-web.pages.dev', { waitUntil: 'networkidle2', timeout: 30000 });

  // Trigger play by directly calling playTrack in browser context or clicking play button
  console.log('Triggering audio playback in browser...');
  const playResult = await page.evaluate(async () => {
    const audio = document.querySelector('audio');
    if (!audio) return { error: 'No audio tag found' };

    try {
      audio.currentTime = 0;
      await audio.play();
      return {
        success: true,
        src: audio.src,
        paused: audio.paused
      };
    } catch (err) {
      return {
        success: false,
        error: err.name + ': ' + err.message
      };
    }
  });
  console.log('Play Call Result:', JSON.stringify(playResult, null, 2));

  // Monitor timeline over 6 seconds
  console.log('Monitoring audio progress over 6 seconds...');
  const progression = [];
  for (let i = 0; i < 12; i++) {
    await new Promise((r) => setTimeout(r, 500));
    const state = await page.evaluate(() => {
      const audio = document.querySelector('audio');
      if (!audio) return null;
      return {
        currentTime: Number(audio.currentTime.toFixed(2)),
        duration: Number(audio.duration ? audio.duration.toFixed(2) : 0),
        paused: audio.paused,
        readyState: audio.readyState,
        buffered: audio.buffered.length > 0 ? Number(audio.buffered.end(0).toFixed(2)) : 0
      };
    });
    progression.push({ timeSec: (i + 1) * 0.5, state });
  }

  console.log('Audio Progress Timeline:', JSON.stringify(progression, null, 2));
  console.log('Network Logs:', JSON.stringify(networkLogs, null, 2));
  console.log('Console Logs:', JSON.stringify(consoleLogs, null, 2));

  await page.screenshot({ path: 'C:\\Users\\Admin\\.gemini\\antigravity-ide\\brain\\1482833c-11a0-4d10-9b01-a7de00ff4892\\real_chrome_progress.png' });
  console.log('Captured screenshot to real_chrome_progress.png');

  await browser.close();
  console.log('=== TEST COMPLETED ===');
}

testRealBrowserAudio().catch(console.error);
