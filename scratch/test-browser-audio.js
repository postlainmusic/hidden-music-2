const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

async function testAudioPlayback() {
  console.log('--- STARTING REAL BROWSER AUDIO TEST ---');
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

  const networkLogs = [];
  const consoleLogs = [];

  page.on('console', (msg) => {
    consoleLogs.push(`[CONSOLE ${msg.type().toUpperCase()}] ${msg.text()}`);
  });

  page.on('pageerror', (err) => {
    consoleLogs.push(`[PAGE ERROR] ${err.toString()}`);
  });

  page.on('response', (response) => {
    const url = response.url();
    if (url.includes('.flac') || url.includes('/api/stream') || url.includes('postlain')) {
      networkLogs.push({
        url: url.substring(0, 80),
        status: response.status(),
        statusText: response.statusText(),
        headers: response.headers()
      });
    }
  });

  console.log('Navigating to https://hidden-music-web.pages.dev ...');
  await page.goto('https://hidden-music-web.pages.dev', { waitUntil: 'networkidle2', timeout: 30000 });
  console.log('Page loaded successfully.');

  // Inspect initial audio state
  const initialAudio = await page.evaluate(() => {
    const audio = document.querySelector('audio');
    if (!audio) return { exists: false };
    return {
      exists: true,
      src: audio.src,
      paused: audio.paused,
      currentTime: audio.currentTime,
      duration: audio.duration,
      readyState: audio.readyState,
      networkState: audio.networkState,
      error: audio.error ? { code: audio.error.code, message: audio.error.message } : null
    };
  });
  console.log('Initial Audio State:', JSON.stringify(initialAudio, null, 2));

  // Find and click the play button
  console.log('Clicking the Play button...');
  const playButton = await page.$('button');
  if (playButton) {
    await playButton.click();
    console.log('Clicked first button on page.');
  }

  // Poll currentTime for 5 seconds to observe actual playback progression
  console.log('Observing audio progression over 5 seconds...');
  const timeline = [];
  for (let i = 0; i < 10; i++) {
    await new Promise((r) => setTimeout(r, 500));
    const state = await page.evaluate(() => {
      const audio = document.querySelector('audio');
      if (!audio) return { exists: false };
      return {
        currentTime: audio.currentTime,
        paused: audio.paused,
        readyState: audio.readyState,
        duration: audio.duration,
        bufferedLength: audio.buffered.length > 0 ? audio.buffered.end(0) : 0,
        error: audio.error ? { code: audio.error.code, message: audio.error.message } : null
      };
    });
    timeline.push({ t: (i + 1) * 0.5, state });
  }

  console.log('Playback Timeline:', JSON.stringify(timeline, null, 2));
  console.log('Network Logs:', JSON.stringify(networkLogs, null, 2));
  console.log('Console Logs:', JSON.stringify(consoleLogs, null, 2));

  const screenshotPath = 'C:\\Users\\Admin\\.gemini\\antigravity-ide\\brain\\1482833c-11a0-4d10-9b01-a7de00ff4892\\real_browser_test.png';
  await page.screenshot({ path: screenshotPath, fullPage: false });
  console.log('Saved screenshot to:', screenshotPath);

  await browser.close();
  console.log('--- TEST FINISHED ---');
}

testAudioPlayback().catch((err) => {
  console.error('Test script failed:', err);
  process.exit(1);
});
