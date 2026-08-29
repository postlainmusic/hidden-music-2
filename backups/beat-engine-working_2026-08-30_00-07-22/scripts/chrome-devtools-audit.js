// scripts/chrome-devtools-audit.js
const http = require("http");

async function checkChromeCdp() {
  console.log("🔍 Checking Chrome Remote Debugging Port 9222...");

  const req = http.get("http://127.0.0.1:9222/json", (res) => {
    let data = "";
    res.on("data", (chunk) => { data += chunk; });
    res.on("end", () => {
      try {
        const tabs = JSON.parse(data);
        console.log(`✅ Chrome connected successfully! Found ${tabs.length} tabs:`);
        tabs.forEach((t, i) => {
          console.log(`  [${i + 1}] ${t.title} (${t.url})`);
        });
      } catch (err) {
        console.log("Response:", data);
      }
    });
  });

  req.on("error", (e) => {
    console.log(`⚠️ Note: Chrome DevTools port 9222 is not actively listening on 127.0.0.1 (${e.message}).`);
    console.log("👉 On newer Chrome (130+), please open a new tab and visit 'chrome://inspect/#remote-debugging' to allow DevTools MCP connection.");
  });
}

checkChromeCdp();
