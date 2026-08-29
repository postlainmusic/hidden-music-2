const { spawn } = require('child_process');

const proc = spawn('npx', ['-y', 'chrome-devtools-mcp@latest', '--auto-connect'], {
  shell: true,
  stdio: ['pipe', 'pipe', 'pipe']
});

proc.stdout.on('data', (d) => {
  console.log('STDOUT:', d.toString());
});

proc.stderr.on('data', (d) => {
  console.log('STDERR:', d.toString());
});

setTimeout(() => {
  console.log('Terminating test...');
  proc.kill();
}, 5000);
