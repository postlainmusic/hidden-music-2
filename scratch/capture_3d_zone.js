const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

async function run() {
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

  function send(method, params = {}) {
    return new Promise((resolve) => {
      const id = messageId++;
      pending.set(id, resolve);
      proc.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n');
    });
  }

  await send('initialize', {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: { name: 'test3d', version: '1.0.0' }
  });
  await send('notifications/initialized', {});

  const pageId = 1;
  await send('tools/call', {
    name: 'navigate_page',
    arguments: { pageId, url: 'http://localhost:5173' }
  });

  await new Promise(r => setTimeout(r, 4000));

  // Authenticate and reload directly into 3D zone or click 3D zone
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
      }`
    }
  });

  await new Promise(r => setTimeout(r, 4000));

  // Click on Album Cover in Section 1 to enter 3D Scene
  await send('tools/call', {
    name: 'evaluate_script',
    arguments: {
      pageId,
      function: `() => {
        // Find album cover or track item to trigger 3D Zone
        const cover = document.querySelector('img[src*="HVL_Album_Cover"]');
        if (cover) {
          cover.click();
          return "Clicked album cover";
        }
        const firstTrack = document.querySelector('[data-track-id], .track-item, button');
        if (firstTrack) {
          firstTrack.click();
          return "Clicked track";
        }
        return "Not found";
      }`
    }
  });

  await new Promise(r => setTimeout(r, 4000));

  // Capture 3D Zone
  const screen = await send('tools/call', {
    name: 'take_screenshot',
    arguments: { pageId, format: 'png' }
  });

  if (screen.result?.content) {
    for (const item of screen.result.content) {
      if (item.type === 'image' && item.data) {
        fs.writeFileSync(path.join(__dirname, 'screen_4_full_3d_zone.png'), Buffer.from(item.data, 'base64'));
        console.log('Saved scratch/screen_4_full_3d_zone.png');
      }
    }
  }

  proc.kill();
}

run().catch(console.error);
