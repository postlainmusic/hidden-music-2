const titles = [
  "01. Elegie.m4a",
  "02. IDK.m4a",
  "03. Wtf Bby I_m Lit.m4a",
  "04. Anh Kh%C3%B4ng Mu%E1%BB%91n N%C3%B3 D%E1%BB%85 D%C3%A0ng.m4a",
  "05. Baby (feat.%20marzuz).m4a",
  "06. Y%C3%AAu Anh Gi%E1%BA%BFt Anh.m4a",
  "07. M%E1%BA%AFt M%C3%B4i Tay Ch%C3%A2n (feat.%20Tage).m4a",
  "08. %C4%90ao C%E1%BB%A7a Anh V%E1%BB%ABa.m4a",
  "09. L%C3%A0 G%C3%AC C%E1%BB%A7a Nhau.m4a",
  "10. Night In Prague.m4a",
  "11. M%E1%BB%99t C%C3%A1i %C3%94m.m4a",
  "12. Li%E1%BB%87m.m4a",
  "13. N%E1%BA%BFu Nh%C6%B0 Ta Ch%E1%BA%B3ng C%C3%B2n (feat.%20AAP %C6%AF%E1%BB%9Bt Mi).m4a",
  "14. Ai M%E1%BB%9Bi L%C3%A0 K%E1%BA%BB X%E1%BA%A5u Xa.m4a",
  "15. Slippery (feat.%20T%C3%B9ng D%C6%B0%C6%A1ng).m4a",
  "16. Intenpol.m4a",
  "17. T%C3%A2y Thi.m4a",
  "18. H%C3%BAt v%C3%A0 H%C3%BAt.m4a",
  "19. D%C6%B0a Chua.m4a",
  "20. Xa X%C3%B4i (feat.%20Obito).m4a",
  "21. Che Ph%E1%BB%A7.m4a",
  "22. Oanh M %3D Thuoc.m4a",
  "23. Ghet Xog Lai Thik.m4a",
  "24. Nh%C3%ACn K%E1%BA%BB Th%C3%B9 C%E1%BB%A7a Tao.m4a",
  "25. Envy (feat.%20THANHDRAW).m4a",
  "26. C%E1%BA%A3m %C6%A0n.m4a",
  "27. M%E1%BA%A5t K%E1%BA%BFt N%E1%BB%91i (feat.%20Trung Tr%E1%BA%A7n).m4a",
  "28. 2AM.m4a",
  "29. Ch%C3%ACm S%C3%A2u (feat.%20Trung Tr%E1%BA%A7n).m4a",
  "30. Va V%C3%A0o Giai %C4%90i%E1%BB%87u N%C3%A0y.m4a"
];

const base = "https://media.postlain.com/audio/";

async function testAll() {
  console.log("Testing 30 track URLs on https://media.postlain.com/audio/:\n");
  for (let i = 0; i < titles.length; i++) {
    const t = titles[i];
    const url = base + t;
    try {
      const res = await globalThis.fetch(url, { headers: { Range: "bytes=0-100" } });
      const ok = res.status === 206 || res.status === 200;
      console.log(`[${i + 1}] ${decodeURIComponent(t)} => HTTP ${res.status} ${ok ? "✅ OK" : "❌ FAIL"}`);
    } catch (e) {
      console.log(`[${i + 1}] ${decodeURIComponent(t)} => ERROR ${e.message}`);
    }
  }
}

testAll();
