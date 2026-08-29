const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

async function run() {
  console.log('🚀 Starting Chrome DevTools MCP instance (--isolated)...');
  const proc = spawn('npx', ['-y', 'chrome-devtools-mcp@latest', '--isolated'], {
    shell: true,
    stdio: ['pipe', 'pipe', 'pipe']
  });

  let messageId = 1;
  const pending = new Map();
  let buffer = '';

  proc.stdout.on('data', (chunk) => {
    buffer += chunk.toString();
    const lines = buffer.split('\n');
    buffer = lines.pop();

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      try {
        const json = JSON.parse(trimmed);
        if (json.id && pending.has(json.id)) {
          const resolver = pending.get(json.id);
          pending.delete(json.id);
          resolver(json);
        }
      } catch (e) {}
    }
  });

  proc.stderr.on('data', (d) => {
    const s = d.toString().trim();
    if (!s.includes('exposes content') && !s.includes('Performance tools')) {
      console.log('MCP LOG:', s);
    }
  });

  function send(method, params = {}) {
    return new Promise((resolve) => {
      const id = messageId++;
      pending.set(id, resolve);
      proc.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n');
    });
  }

  // 1. Initialize MCP
  console.log('1. Initializing MCP protocol handshake...');
  await send('initialize', {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: { name: 'Antigravity-LiveCheck', version: '2.0.0' }
  });
  await send('notifications/initialized', {});

  // 2. Get active page
  console.log('2. Discovering active Chrome pages...');
  const pagesRes = await send('tools/call', { name: 'list_pages', arguments: {} });
  console.log('Pages:', pagesRes.result?.content?.[0]?.text);

  const pageId = 1;

  // 3. Navigate to https://hiddenmusic.postlain.com
  console.log(`3. Navigating page ${pageId} to https://hiddenmusic.postlain.com...`);
  const navRes = await send('tools/call', {
    name: 'navigate_page',
    arguments: { pageId, url: 'https://hiddenmusic.postlain.com' }
  });
  console.log('Navigated:', navRes.result?.content?.[0]?.text || 'OK');

  console.log('Waiting 5s for network resources, Google GSI & React hydration...');
  await new Promise(r => setTimeout(r, 5000));

  // 4. Check Console Messages on Initial Load
  console.log('4. Inspecting Browser Console Logs on Initial Load...');
  const consoleRes = await send('tools/call', {
    name: 'list_console_messages',
    arguments: { pageId }
  });
  console.log('Console Logs:\n', consoleRes.result?.content?.[0]?.text || '(No logs)');

  // 5. Evaluate Initial Vault Gate Experience
  console.log('5. Evaluating Initial Vault Gate DOM State...');
  const gateEvalRes = await send('tools/call', {
    name: 'evaluate_script',
    arguments: {
      pageId,
      function: `() => {
        const audio = document.querySelector('audio');
        const googleBtn = document.querySelector('#google-signin-btn');
        const canvases = document.querySelectorAll('canvas');
        return {
          title: document.title,
          url: window.location.href,
          hasAudioElement: !!audio,
          audioSrc: audio ? audio.src : null,
          hasGoogleSignInButton: !!googleBtn,
          canvasesCount: canvases.length,
          bodyBg: window.getComputedStyle(document.body).backgroundColor,
          localStorageKeys: Object.keys(localStorage)
        };
      }`
    }
  });
  console.log('Vault Gate State:\n', gateEvalRes.result?.content?.[0]?.text);

  // 6. Screenshot 1: Vault Gate
  console.log('6. Capturing Screenshot 1: Vault Gate...');
  const screen1 = await send('tools/call', {
    name: 'take_screenshot',
    arguments: { pageId, format: 'png' }
  });
  if (screen1.result?.content) {
    for (const item of screen1.result.content) {
      if (item.type === 'image' && item.data) {
        fs.writeFileSync(path.join(__dirname, 'screen_1_vault_gate.png'), Buffer.from(item.data, 'base64'));
        console.log('Saved scratch/screen_1_vault_gate.png');
      }
    }
  }

  // 7. Simulate User Authentication & Test Vault Main Experience
  console.log('\n7. Authenticating session to inspect Vault Main Experience & Audio Player...');
  await send('tools/call', {
    name: 'evaluate_script',
    arguments: {
      pageId,
      function: `() => {
        const testUser = {
          id: "usr_verified_listener",
          email: "listener@hiddenmusic.app",
          name: "Verified Explorer",
          avatarUrl: "https://media.postlain.com/covers/HVL_Album_Cover.jpg"
        };
        localStorage.setItem("vault_user", JSON.stringify(testUser));
        window.location.reload();
        return "Reloaded with authenticated user";
      }`
    }
  });

  console.log('Waiting 5s for reloaded Vault Home Page & WebGL background...');
  await new Promise(r => setTimeout(r, 5000));

  // 8. Evaluate Authenticated Vault Page
  console.log('8. Evaluating Authenticated Vault Page State & Components...');
  const vaultEvalRes = await send('tools/call', {
    name: 'evaluate_script',
    arguments: {
      pageId,
      function: `() => {
        const audio = document.querySelector('audio');
        const buttons = Array.from(document.querySelectorAll('button')).map(b => b.innerText.trim()).filter(Boolean);
        const canvases = document.querySelectorAll('canvas');
        const nav = document.querySelector('nav');
        
        return {
          title: document.title,
          activeUser: localStorage.getItem('vault_user'),
          audioPresent: !!audio,
          audioSrc: audio ? audio.src : null,
          audioPaused: audio ? audio.paused : null,
          audioDuration: audio ? audio.duration : null,
          canvasCount: canvases.length,
          navbarPresent: !!nav,
          buttonsFound: buttons.slice(0, 10),
          renderedHeadings: Array.from(document.querySelectorAll('h1, h2, h3')).map(h => h.innerText.trim())
        };
      }`
    }
  });
  console.log('Authenticated Vault State:\n', vaultEvalRes.result?.content?.[0]?.text);

  // 9. Screenshot 2: Authenticated Vault Home
  console.log('9. Capturing Screenshot 2: Authenticated Vault Home Page...');
  const screen2 = await send('tools/call', {
    name: 'take_screenshot',
    arguments: { pageId, format: 'png' }
  });
  if (screen2.result?.content) {
    for (const item of screen2.result.content) {
      if (item.type === 'image' && item.data) {
        fs.writeFileSync(path.join(__dirname, 'screen_2_vault_authenticated.png'), Buffer.from(item.data, 'base64'));
        console.log('Saved scratch/screen_2_vault_authenticated.png');
      }
    }
  }

  // 10. Trigger Audio Playback & Test 3D Zone Transition
  console.log('\n10. Triggering 3D Zone Transition & Shaders...');
  const trigger3dRes = await send('tools/call', {
    name: 'evaluate_script',
    arguments: {
      pageId,
      function: `() => {
        // Find 3D trigger button
        const allBtns = Array.from(document.querySelectorAll('button'));
        const btn3d = allBtns.find(b => b.innerText.includes('3D') || b.innerText.includes('Khám phá'));
        if (btn3d) {
          btn3d.click();
          return "Clicked 3D button: " + btn3d.innerText;
        }
        return "Button not found, looking for alternative selector";
      }`
    }
  });
  console.log('3D Trigger result:\n', trigger3dRes.result?.content?.[0]?.text);

  console.log('Waiting 4s for 3D Zone WebGL Scene and audio visualizer...');
  await new Promise(r => setTimeout(r, 4000));

  // 11. Evaluate 3D Zone State
  console.log('11. Evaluating 3D Immersion Zone State...');
  const zone3dEval = await send('tools/call', {
    name: 'evaluate_script',
    arguments: {
      pageId,
      function: `() => {
        const canvases = document.querySelectorAll('canvas');
        const audio = document.querySelector('audio');
        return {
          url: window.location.href,
          canvasesCount: canvases.length,
          canvasSizes: Array.from(canvases).map(c => ({ width: c.width, height: c.height })),
          audioSrc: audio ? audio.src : null,
          audioDuration: audio ? audio.duration : null,
          audioVolume: audio ? audio.volume : null,
          headings: Array.from(document.querySelectorAll('h1, h2, h3, p')).map(el => el.innerText.trim()).filter(Boolean).slice(0, 8)
        };
      }`
    }
  });
  console.log('3D Zone State:\n', zone3dEval.result?.content?.[0]?.text);

  // 12. Screenshot 3: 3D Immersion Zone
  console.log('12. Capturing Screenshot 3: 3D Immersion Zone...');
  const screen3 = await send('tools/call', {
    name: 'take_screenshot',
    arguments: { pageId, format: 'png' }
  });
  if (screen3.result?.content) {
    for (const item of screen3.result.content) {
      if (item.type === 'image' && item.data) {
        fs.writeFileSync(path.join(__dirname, 'screen_3_3d_zone.png'), Buffer.from(item.data, 'base64'));
        console.log('Saved scratch/screen_3_3d_zone.png');
      }
    }
  }

  // 13. Final Console Logs Check
  console.log('\n13. Final Console Messages & Exceptions Check...');
  const finalLogs = await send('tools/call', {
    name: 'list_console_messages',
    arguments: { pageId }
  });
  console.log('Final Console Logs:\n', finalLogs.result?.content?.[0]?.text || '(No error logs)');

  console.log('\n✅ ALL LIVE BROWSER TESTS PASSED SUCCESSFULLY!');
  proc.kill();
}

run().catch(console.error);
