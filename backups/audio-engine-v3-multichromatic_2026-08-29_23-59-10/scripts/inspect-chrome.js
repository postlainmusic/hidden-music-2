import http from 'http';

http.get('http://127.0.0.1:9222/json/list', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const list = JSON.parse(data);
      console.log(`\n🎉 SUCCESSFULLY CONNECTED TO REAL CHROME! (${list.length} pages/targets detected)\n`);
      list.forEach((t, i) => {
        console.log(`[${i + 1}] Type: ${t.type.padEnd(8)} | Title: ${t.title}`);
        console.log(`    URL: ${t.url}`);
        console.log(`    WebSocket Debugger: ${t.webSocketDebuggerUrl}\n`);
      });
    } catch (err) {
      console.log('Raw output:', data);
    }
  });
}).on('error', (err) => {
  console.error('Connection failed:', err.message);
});
