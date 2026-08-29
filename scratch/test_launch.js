const { spawn } = require('child_process');

async function testWithArgs(args) {
  console.log(`\n=== Testing with args: ${args.join(' ')} ===`);
  return new Promise((resolve) => {
    const proc = spawn('npx', ['-y', 'chrome-devtools-mcp@latest', ...args], {
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
        console.log('STDERR:', s);
      }
    });

    function send(method, params = {}) {
      return new Promise((res) => {
        const id = messageId++;
        pending.set(id, res);
        proc.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n');
      });
    }

    (async () => {
      await send('initialize', {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'test', version: '1.0.0' }
      });
      await send('notifications/initialized', {});

      const pagesRes = await send('tools/call', { name: 'list_pages', arguments: {} });
      console.log('list_pages result:', JSON.stringify(pagesRes.result, null, 2));

      proc.kill();
      resolve();
    })().catch(e => {
      console.error(e);
      proc.kill();
      resolve();
    });
  });
}

async function main() {
  // Test 1: with --isolated (launches clean local Chromium)
  await testWithArgs(['--isolated']);
}

main();
