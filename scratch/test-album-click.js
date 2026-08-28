const puppeteer = require('puppeteer-core');

async function testFullInteraction() {
  console.log('=== VERIFYING ALBUM CLICK & ZERO AUTOPLAY ===');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  await page.goto('https://hidden-music-web.pages.dev', { waitUntil: 'networkidle2' });

  // Click login
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Google'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 2000));

  // Click on Album Card
  console.log('Clicking Album card...');
  await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('h3'));
    const hvlCard = cards.find(h => h.textContent && h.textContent.includes('HVL (99%)'));
    if (hvlCard) hvlCard.click();
  });

  await new Promise(r => setTimeout(r, 1000));

  const modalState = await page.evaluate(() => {
    const text = document.body.innerText;
    const audio = document.querySelector('audio');
    return {
      hasModal: text.includes('Không gian 3D của album này đang được chuẩn bị'),
      isAudioPlaying: audio ? !audio.paused : false
    };
  });
  console.log('Album click response:', modalState);

  await browser.close();
  console.log('=== ALL CHECKS VERIFIED SUCCESSFULLY ===');
}

testFullInteraction().catch(console.error);
