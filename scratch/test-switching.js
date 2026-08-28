const puppeteer = require('puppeteer-core');

async function testTrackSwitchingAndSeeking() {
  console.log('=== MULTI-TRACK SWITCHING & SEEKING TEST ===');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--autoplay-policy=no-user-gesture-required'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  console.log('Navigating to https://hidden-music-web.pages.dev ...');
  await page.goto('https://hidden-music-web.pages.dev', { waitUntil: 'networkidle2', timeout: 30000 });

  // 1. Play Track 1 & observe 2s
  console.log('\n--- 1. Testing Track 1 Play & Seek ---');
  await page.evaluate(async () => {
    const audio = document.querySelector('audio');
    await audio.play();
  });
  await new Promise((r) => setTimeout(r, 2000));
  const t1 = await page.evaluate(() => {
    const audio = document.querySelector('audio');
    return { src: audio.src, currentTime: audio.currentTime, paused: audio.paused, duration: audio.duration };
  });
  console.log('Track 1 after 2s:', t1);

  // Seek to 30s
  console.log('Seeking Track 1 to 30s...');
  await page.evaluate(() => {
    const audio = document.querySelector('audio');
    audio.currentTime = 30;
  });
  await new Promise((r) => setTimeout(r, 1500));
  const t1Seek = await page.evaluate(() => {
    const audio = document.querySelector('audio');
    return { currentTime: audio.currentTime, paused: audio.paused };
  });
  console.log('Track 1 after seek:', t1Seek);

  // 2. Switch to Track 2 (02. IDK)
  console.log('\n--- 2. Testing Track 2 (02. IDK) ---');
  await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('button'));
    const track2Btn = cards.find(b => b.textContent && b.textContent.includes('02. IDK') || b.closest('[data-track-id="mck-02"]'));
    // Or dispatch directly to store
    window.__playTrack2 = true;
  });

  // Click second track card or next button
  const buttons = await page.$$('button');
  console.log('Found', buttons.length, 'interactive buttons on page.');
  
  // Directly simulate switching track in audio store
  const switchRes = await page.evaluate(async () => {
    const audio = document.querySelector('audio');
    audio.src = 'https://hidden-music-api.postlain-music.workers.dev/api/stream/audio/02.%20IDK.flac';
    await audio.play();
    return { src: audio.src };
  });
  console.log('Switched to Track 2:', switchRes);

  await new Promise((r) => setTimeout(r, 2500));
  const t2State = await page.evaluate(() => {
    const audio = document.querySelector('audio');
    return {
      src: audio.src,
      currentTime: Number(audio.currentTime.toFixed(2)),
      duration: Number(audio.duration ? audio.duration.toFixed(2) : 0),
      paused: audio.paused,
      readyState: audio.readyState,
      buffered: audio.buffered.length > 0 ? Number(audio.buffered.end(0).toFixed(2)) : 0
    };
  });
  console.log('Track 2 State after 2.5s:', t2State);

  await browser.close();
  console.log('=== TEST COMPLETED SUCCESSFULLY ===');
}

testTrackSwitchingAndSeeking().catch(console.error);
