const puppeteer = require('puppeteer-core');

async function testVaultGateAndHomePage() {
  console.log('=== TESTING VAULT GATE & HOMEPAGE FLOW ===');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));

  await page.goto('https://hidden-music-web.pages.dev', { waitUntil: 'networkidle2' });

  console.log('Clicking Google Login button...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const googleBtn = btns.find(b => b.textContent && b.textContent.includes('Google'));
    if (googleBtn) {
      googleBtn.click();
    }
  });

  await new Promise(r => setTimeout(r, 3000));

  const homeState = await page.evaluate(() => {
    const text = document.body.innerText;
    const audio = document.querySelector('audio');
    return {
      fullTextSnippet: text.slice(0, 300),
      hasSection1: text.includes('HVL (99%)'),
      hasBestPlay: text.includes('Best Play Showcase'),
      hasSection2: text.includes('Bộ Sưu Tập Albums'),
      hasSection3: text.includes('Explore Universe'),
      isAudioPlaying: audio ? !audio.paused : false
    };
  });
  console.log('2. 3-Section Homepage Verification:', homeState);

  await browser.close();
}

testVaultGateAndHomePage().catch(console.error);
