import fs from "fs";

const summary = JSON.parse(fs.readFileSync("scratch/flac_metadata_summary.json", "utf8"));
const base = "https://media.postlain.com/audio/";

async function testAll() {
  console.log("Testing exact 30 files from flac_metadata_summary.json:\n");
  let passed = 0;
  for (let i = 0; i < summary.length; i++) {
    const file = summary[i].file;
    const m4aFile = file.replace(".flac", ".m4a");
    const url = base + encodeURIComponent(m4aFile);
    try {
      const res = await fetch(url, { headers: { Range: "bytes=0-100" } });
      const ok = res.status === 206 || res.status === 200;
      if (ok) passed++;
      console.log(`[${i + 1}] ${m4aFile} => HTTP ${res.status} ${ok ? "✅ OK" : "❌ FAIL"}`);
    } catch (e) {
      console.log(`[${i + 1}] ${m4aFile} => ERROR ${e.message}`);
    }
  }
  console.log(`\n🎉 RESULT: ${passed} / ${summary.length} VALIDATED!`);
}

testAll();
