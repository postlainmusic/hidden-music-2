const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

async function run() {
  const proc = spawn('npx', ['-y', 'chrome-devtools-mcp@latest', '--auto-connect'], {
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

  function send(method, params = {}) {
    return new Promise((resolve) => {
      const id = messageId++;
      const req = {
        jsonrpc: '2.0',
        id,
        method,
        params
      };
      pending.set(id, resolve);
      proc.stdin.write(JSON.stringify(req) + '\n');
    });
  }

  // 1. Initialize
  console.log('1. Initializing MCP connection to Chrome...');
  await send('initialize', {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: { name: 'Antigravity-Agent', version: '1.0.0' }
  });
  await send('notifications/initialized', {});

  // 2. List or create page
  console.log('2. Listing active browser pages...');
  const pagesRes = await send('tools/call', {
    name: 'list_pages',
    arguments: {}
  });
  console.log('Pages list result:', JSON.stringify(pagesRes.result, null, 2));

  let pageId = null;
  // If there's an existing page, use it or create a new page
  if (pagesRes.result?.content) {
    try {
      const text = pagesRes.result.content[0]?.text;
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed) && parsed.length > 0) {
        pageId = parsed[0].id || parsed[0].pageId;
      }
    } catch (e) {}
  }

  if (!pageId) {
    console.log('Opening new page for https://hiddenmusic.postlain.com...');
    const newPageRes = await send('tools/call', {
      name: 'new_page',
      arguments: { url: 'https://hiddenmusic.postlain.com' }
    });
    console.log('New page response:', JSON.stringify(newPageRes.result, null, 2));
    try {
      const text = newPageRes.result?.content?.[0]?.text;
      const parsed = JSON.parse(text);
      pageId = parsed.id || parsed.pageId;
    } catch (e) {}
  } else {
    console.log(`Navigating page (${pageId}) to https://hiddenmusic.postlain.com...`);
    const navRes = await send('tools/call', {
      name: 'navigate_page',
      arguments: { pageId, url: 'https://hiddenmusic.postlain.com' }
    });
    console.log('Navigation response:', JSON.stringify(navRes.result, null, 2));
  }

  // Wait 4 seconds for full React hydration, shaders & audio context init
  console.log('Waiting 4s for page hydration & 3D canvas render...');
  await new Promise(r => setTimeout(r, 4000));

  // 3. Inspect Console Messages
  console.log('3. Inspecting browser console logs...');
  const logsRes = await send('tools/call', {
    name: 'list_console_messages',
    arguments: { pageId }
  });
  console.log('Console logs:', JSON.stringify(logsRes.result, null, 2));

  // 4. Evaluate Page DOM & Audio State
  console.log('4. Evaluating live DOM, audio player & layout state...');
  const evalRes = await send('tools/call', {
    name: 'evaluate_script',
    arguments: {
      pageId,
      function: `() => {
        const audio = document.querySelector('audio');
        const googleBtn = document.querySelector('#google-signin-btn');
        const canvasList = document.querySelectorAll('canvas');
        const root = document.querySelector('#root');
        
        return {
          title: document.title,
          url: window.location.href,
          rootChildCount: root ? root.children.length : 0,
          hasAudioElement: !!audio,
          audioSrc: audio ? audio.src : null,
          audioDuration: audio ? audio.duration : null,
          audioPaused: audio ? audio.paused : null,
          canvasCount: canvasList.length,
          hasGoogleSignIn: !!googleBtn,
          bodyBackground: window.getComputedStyle(document.body).backgroundColor,
          windowSize: { width: window.innerWidth, height: window.innerHeight }
        };
      }`
    }
  });
  console.log('DOM & Audio Evaluation Result:', JSON.stringify(evalRes.result, null, 2));

  // 5. Take Screenshot
  console.log('5. Taking live screenshot...');
  const screenRes = await send('tools/call', {
    name: 'take_screenshot',
    arguments: { pageId, format: 'png' }
  });

  if (screenRes.result?.content) {
    for (const item of screenRes.result.content) {
      if (item.type === 'image' && item.data) {
        const outPath = path.join(__dirname, 'live_experience.png');
        fs.writeFileSync(outPath, Buffer.from(item.data, 'base64'));
        console.log(`Saved screenshot to ${outPath}`);
      }
    }
  }

  // 6. Test User Experience Flow: Simulate User State
  console.log('6. Testing authenticated Vault state & 3D Immersion flow...');
  const loginTestRes = await send('tools/call', {
    name: 'evaluate_script',
    arguments: {
      pageId,
      function: `() => {
        const mockUser = {
          id: "usr_google_explorer",
          email: "explorer@hiddenmusic.app",
          name: "Vault Explorer",
          avatarUrl: "https://media.postlain.com/covers/HVL_Album_Cover.jpg"
        };
        localStorage.setItem("vault_user", JSON.stringify(mockUser));
        window.location.reload();
        return "Reloaded with authenticated user state";
      }`
    }
  });
  console.log('Login trigger result:', JSON.stringify(loginTestRes.result, null, 2));

  // Wait 4s after reload
  console.log('Waiting 4s for reloaded Vault page...');
  await new Promise(r => setTimeout(r, 4000));

  // 7. Evaluate Authenticated Flow & 3D Shaders
  console.log('7. Evaluating Authenticated Vault Experience...');
  const authEvalRes = await send('tools/call', {
    name: 'evaluate_script',
    arguments: {
      pageId,
      function: `() => {
        const trackCards = document.querySelectorAll('[data-track-id], button, .track-item');
        const audio = document.querySelector('audio');
        const playerDock = document.querySelector('.player-dock, [role="region"], nav');
        
        return {
          currentUrl: window.location.href,
          storageUser: localStorage.getItem("vault_user"),
          audioSrc: audio ? audio.src : null,
          audioPaused: audio ? audio.paused : null,
          renderedCanvases: document.querySelectorAll('canvas').length,
          buttonsCount: document.querySelectorAll('button').length
        };
      }`
    }
  });
  console.log('Authenticated Experience Result:', JSON.stringify(authEvalRes.result, null, 2));

  // 8. Capture Authenticated Screenshot
  console.log('8. Capturing Authenticated Vault Screenshot...');
  const authScreenRes = await send('tools/call', {
    name: 'take_screenshot',
    arguments: { pageId, format: 'png' }
  });

  if (authScreenRes.result?.content) {
    for (const item of authScreenRes.result.content) {
      if (item.type === 'image' && item.data) {
        const outPath = path.join(__dirname, 'live_vault_authenticated.png');
        fs.writeFileSync(outPath, Buffer.from(item.data, 'base64'));
        console.log(`Saved screenshot to ${outPath}`);
      }
    }
  }

  console.log('=== TEST COMPLETED SUCCESSFULLY ===');
  proc.kill();
}

run().catch(console.error);
