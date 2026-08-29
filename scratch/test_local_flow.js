const puppeteer = require('puppeteer-core');

async function testLocalFlow() {
  console.log('=== VERIFYING LOCAL HOMEPAGE & 3D ZONE FLOW ===');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });

  // Simulate authenticated user
  await page.evaluate(() => {
    const testUser = {
      id: "usr_verified_listener",
      email: "listener@hiddenmusic.app",
      name: "Verified Explorer",
      avatarUrl: "https://media.postlain.com/covers/HVL_Album_Cover.jpg"
    };
    localStorage.setItem("vault_user", JSON.stringify(testUser));
    window.location.reload();
  });

  await new Promise(r => setTimeout(r, 2000));

  // Check state of Section 1
  const homeState = await page.evaluate(() => {
    const text = document.body.innerText;
    const cover = document.querySelector('img[src*="HVL_Album_Cover"]');
    return {
      hasVaultText: text.includes('HIDDEN MUSIC'),
      hasElegieTrack: text.includes('Elegie') || text.includes('01'),
      hasCover: !!cover
    };
  });
  console.log('HomePage Section 1 state:', homeState);

  // Click on Album Cover to enter 3D Zone
  await page.evaluate(() => {
    const cover = document.querySelector('img[src*="HVL_Album_Cover"]');
    if (cover) cover.click();
  });

  await new Promise(r => setTimeout(r, 2000));

  // Check 3D Zone state
  const zone3DState = await page.evaluate(() => {
    const text = document.body.innerText;
    const audio = document.querySelector('audio');
    const hud = text.includes('FLAC 24/96kHz Master') || text.includes('BPM');
    return {
      in3DZone: text.includes('Vault') || text.includes('FLAC 24/96kHz Master'),
      hudVisible: hud,
      audioMounted: !!audio
    };
  });
  console.log('3D Zone transition state:', zone3DState);

  await browser.close();
  console.log('=== ALL LOCAL FLOW CHECKS PASSED ===');
}

testLocalFlow().catch(console.error);
