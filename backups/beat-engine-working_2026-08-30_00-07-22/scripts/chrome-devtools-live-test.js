import http from 'http';

console.log('--- CONNECTING TO LIVE GOOGLE CHROME DEVTOOLS VIA CDP ---');

// 1. Get targets from Chrome Debug Port
http.get('http://127.0.0.1:9222/json', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const targets = JSON.parse(data);
      console.log(`Successfully queried Chrome DevTools! Found ${targets.length} targets:`);
      targets.forEach((t, i) => {
        console.log(`[${i + 1}] ${t.type.toUpperCase()}: ${t.title} (${t.url})`);
      });
    } catch (e) {
      console.log('DevTools raw response:', data);
    }
  });
}).on('error', (err) => {
  console.log('Error querying port 9222:', err.message);
});
