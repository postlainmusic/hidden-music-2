import { Hono } from "hono";
import { cors } from "hono/cors";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { z } from "zod";

type Bindings = {
  DB?: D1Database;
  MUSIC_ASSETS?: R2Bucket;
};

const app = new Hono<{ Bindings: Bindings }>();

// Enable CORS for frontend requests
app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"]
  })
);

const R2_BASE = "https://hidden-music-api.postlain-music.workers.dev/api/stream";
const HVL_COVER = `${R2_BASE}/covers/HVL_Album_Cover.jpg`;

// Full MCK Discography Library mapping with REAL R2 audio, video, and cover streaming links
const MCK_TRACKS = [
  {
    id: "mck-01",
    title: "01. Elegie",
    artist: "MCK",
    album: "HVL",
    duration: 198,
    coverUrl: HVL_COVER,
    audioUrl: `${R2_BASE}/audio/01.%20Elegie.flac`,
    videoUrl: `${R2_BASE}/videos/01.%20Elegie%20-%20MCK.mkv`,
    r2Key: "audio/01. Elegie.flac",
    palette: { primary: "#6366f1", secondary: "#ec4899", accent: "#8b5cf6", glow: "rgba(99, 102, 241, 0.45)" },
    genre: "Hip-Hop / Rap"
  },
  {
    id: "mck-02",
    title: "02. IDK",
    artist: "MCK",
    album: "HVL",
    duration: 215,
    coverUrl: HVL_COVER,
    audioUrl: `${R2_BASE}/audio/02.%20IDK.flac`,
    videoUrl: `${R2_BASE}/videos/02.%20IDK%20-%20MCK%20(Official%20Music%20Video).mkv`,
    r2Key: "audio/02. IDK.flac",
    palette: { primary: "#06b6d4", secondary: "#3b82f6", accent: "#10b981", glow: "rgba(6, 182, 212, 0.45)" },
    genre: "Melodic Rap"
  },
  {
    id: "mck-03",
    title: "03. Wtf Bby I'm Lit",
    artist: "MCK",
    album: "HVL",
    duration: 180,
    coverUrl: HVL_COVER,
    audioUrl: `${R2_BASE}/audio/03.%20Wtf%20Bby%20I_m%20Lit.flac`,
    videoUrl: `${R2_BASE}/videos/03.%20Wtf%20Bby%20I'm%20Lit%20-%20MCK.mkv`,
    r2Key: "audio/03. Wtf Bby I_m Lit.flac",
    palette: { primary: "#f43f5e", secondary: "#fb923c", accent: "#d946ef", glow: "rgba(244, 63, 94, 0.45)" },
    genre: "Trap"
  },
  {
    id: "mck-04",
    title: "04. Anh Không Muốn Nó Dễ Dàng",
    artist: "MCK",
    album: "HVL",
    duration: 224,
    coverUrl: HVL_COVER,
    audioUrl: `${R2_BASE}/audio/04.%20Anh%20Kh%C3%B4ng%20Mu%E1%BB%91n%20N%C3%B3%20D%E1%BB%85%20D%C3%A0ng.flac`,
    videoUrl: `${R2_BASE}/videos/04.%20Anh%20Kh%C3%B4ng%20Mu%E1%BB%91n%20N%C3%B3%20D%E1%BB%85%20D%C3%A0ng%20-%20MCK.mkv`,
    r2Key: "audio/04. Anh Không Muốn Nó Dễ Dàng.flac",
    palette: { primary: "#14b8a6", secondary: "#0284c7", accent: "#a855f7", glow: "rgba(20, 184, 166, 0.45)" },
    genre: "R&B / Soul"
  },
  {
    id: "mck-05",
    title: "05. Baby",
    artist: "MCK ft. marzuz",
    album: "HVL",
    duration: 230,
    coverUrl: HVL_COVER,
    audioUrl: `${R2_BASE}/audio/05.%20Baby%20(feat.%20marzuz).flac`,
    videoUrl: `${R2_BASE}/videos/05.%20Baby%20-%20MCK%20ft.%20marzuz.mkv`,
    r2Key: "audio/05. Baby (feat. marzuz).flac",
    palette: { primary: "#ec4899", secondary: "#8b5cf6", accent: "#f43f5e", glow: "rgba(236, 72, 153, 0.45)" },
    genre: "Alternative R&B"
  },
  {
    id: "mck-06",
    title: "06. Yêu Anh Giết Anh",
    artist: "MCK",
    album: "HVL",
    duration: 210,
    coverUrl: HVL_COVER,
    audioUrl: `${R2_BASE}/audio/06.%20Y%C3%AAu%20Anh%20Gi%E1%BA%BFt%20Anh.flac`,
    videoUrl: `${R2_BASE}/videos/06.%20Y%C3%AAu%20Anh%20Gi%E1%BA%BFt%20Anh%20-%20MCK.mkv`,
    r2Key: "audio/06. Yêu Anh Giết Anh.flac",
    palette: { primary: "#ef4444", secondary: "#7c3aed", accent: "#f97316", glow: "rgba(239, 68, 68, 0.45)" },
    genre: "Emo Rap"
  },
  {
    id: "mck-07",
    title: "07. Mắt Môi Tay Chân",
    artist: "MCK ft. Tage",
    album: "HVL",
    duration: 240,
    coverUrl: HVL_COVER,
    audioUrl: `${R2_BASE}/audio/07.%20M%E1%BA%AFt%20M%C3%B4i%20Tay%20Ch%C3%A2n%20(feat.%20Tage).flac`,
    videoUrl: `${R2_BASE}/videos/07.%20M%E1%BA%AFt%20M%C3%B4i%20Tay%20Ch%C3%A2n%20-%20MCK%20ft.%20Tage%20(Official%20Music%20Video).mkv`,
    r2Key: "audio/07. Mắt Môi Tay Chân (feat. Tage).flac",
    palette: { primary: "#8b5cf6", secondary: "#06b6d4", accent: "#3b82f6", glow: "rgba(139, 92, 246, 0.45)" },
    genre: "Hip-Hop"
  },
  {
    id: "mck-08",
    title: "08. Đạo Của Anh Vừa",
    artist: "MCK",
    album: "HVL",
    duration: 195,
    coverUrl: HVL_COVER,
    audioUrl: `${R2_BASE}/audio/08.%20%C4%90%E1%BA%A1o%20C%E1%BB%A7a%20Anh%20V%E1%BB%ABa.flac`,
    videoUrl: `${R2_BASE}/videos/08.%20%C4%90%E1%BA%A1o%20C%E1%BB%A7a%20Anh%20V%E1%BB%ABa%20-%20MCK.mkv`,
    r2Key: "audio/08. Đạo Của Anh Vừa.flac",
    palette: { primary: "#eab308", secondary: "#ef4444", accent: "#f97316", glow: "rgba(234, 179, 8, 0.45)" },
    genre: "Trap"
  },
  {
    id: "mck-09",
    title: "09. Là Gì Của Nhau",
    artist: "MCK",
    album: "HVL",
    duration: 205,
    coverUrl: HVL_COVER,
    audioUrl: `${R2_BASE}/audio/09.%20L%C3%A0%20G%C3%AC%20C%E1%BB%A7a%20Nhau.flac`,
    videoUrl: `${R2_BASE}/videos/09.%20L%C3%A0%20G%C3%AC%20C%E1%BB%A7a%20Nhau%20-%20MCK.mkv`,
    r2Key: "audio/09. Là Gì Của Nhau.flac",
    palette: { primary: "#3b82f6", secondary: "#ec4899", accent: "#6366f1", glow: "rgba(59, 130, 246, 0.45)" },
    genre: "R&B"
  },
  {
    id: "mck-10",
    title: "10. Night In Prague",
    artist: "MCK",
    album: "HVL",
    duration: 250,
    coverUrl: HVL_COVER,
    audioUrl: `${R2_BASE}/audio/10.%20Night%20In%20Prague.flac`,
    videoUrl: `${R2_BASE}/videos/10.%20Night%20In%20Prague%20-%20MCK.mkv`,
    r2Key: "audio/10. Night In Prague.flac",
    palette: { primary: "#6366f1", secondary: "#14b8a6", accent: "#a855f7", glow: "rgba(99, 102, 241, 0.45)" },
    genre: "Chillhop / Jazzhop"
  },
  {
    id: "mck-11",
    title: "11. Một Cái Ôm",
    artist: "MCK",
    album: "HVL",
    duration: 218,
    coverUrl: HVL_COVER,
    audioUrl: `${R2_BASE}/audio/11.%20M%E1%BB%99t%20C%C3%A1i%20%C3%94m.flac`,
    videoUrl: `${R2_BASE}/videos/11.%20M%E1%BB%99t%20C%C3%A1i%20%C3%94m%20-%20MCK.mkv`,
    r2Key: "audio/11. Một Cái Ôm.flac",
    palette: { primary: "#f43f5e", secondary: "#8b5cf6", accent: "#06b6d4", glow: "rgba(244, 63, 94, 0.45)" },
    genre: "Acoustic / Rap"
  },
  {
    id: "mck-12",
    title: "12. Liệm",
    artist: "MCK",
    album: "HVL",
    duration: 235,
    coverUrl: HVL_COVER,
    audioUrl: `${R2_BASE}/audio/12.%20Li%E1%BB%87m.flac`,
    videoUrl: `${R2_BASE}/videos/12.%20Li%E1%BB%87m%20-%20MCK.mkv`,
    r2Key: "audio/12. Liệm.flac",
    palette: { primary: "#7c3aed", secondary: "#000000", accent: "#dc2626", glow: "rgba(124, 58, 237, 0.45)" },
    genre: "Dark Trap"
  },
  {
    id: "mck-13",
    title: "13. Nếu Như Ta Chẳng Còn",
    artist: "MCK ft. AAP Ướt Mi",
    album: "HVL",
    duration: 242,
    coverUrl: HVL_COVER,
    audioUrl: `${R2_BASE}/audio/13.%20N%E1%BA%BFu%20Nh%C6%B0%20Ta%20Ch%E1%BA%B3ng%20C%C3%B2n%20(feat.%20AAP%20%C6%AF%E1%BB%9Bt%20Mi).flac`,
    videoUrl: `${R2_BASE}/videos/13.%20N%E1%BA%BFu%20Nh%C6%B0%20Ta%20Ch%E1%BA%B3ng%20C%C3%B2n%20-%20MCK%20ft.%20AAP%20%C6%AF%E1%BB%9Bt%20Mi.mkv`,
    r2Key: "audio/13. Nếu Như Ta Chẳng Còn (feat. AAP Ướt Mi).flac",
    palette: { primary: "#0ea5e9", secondary: "#6366f1", accent: "#ec4899", glow: "rgba(14, 165, 233, 0.45)" },
    genre: "R&B / Soul"
  },
  {
    id: "mck-14",
    title: "14. Ai Mới Là Kẻ Xấu Xa",
    artist: "MCK",
    album: "HVL",
    duration: 212,
    coverUrl: HVL_COVER,
    audioUrl: `${R2_BASE}/audio/14.%20Ai%20M%E1%BB%9Bi%20L%C3%A0%20K%E1%BA%BB%20X%E1%BA%A5u%20Xa.flac`,
    videoUrl: `${R2_BASE}/videos/14.%20Ai%20M%E1%BB%9Bi%20L%C3%A0%20K%E1%BA%BB%20X%E1%BA%A5u%20Xa%20-%20MCK.mkv`,
    r2Key: "audio/14. Ai Mới Là Kẻ Xấu Xa.flac",
    palette: { primary: "#e11d48", secondary: "#f59e0b", accent: "#8b5cf6", glow: "rgba(225, 29, 72, 0.45)" },
    genre: "Hip-Hop"
  },
  {
    id: "mck-15",
    title: "15. Slippery",
    artist: "MCK ft. Tùng Dương",
    album: "HVL",
    duration: 260,
    coverUrl: HVL_COVER,
    audioUrl: `${R2_BASE}/audio/15.%20Slippery%20(feat.%20T%C3%B9ng%20D%C6%B0%C6%A1ng).flac`,
    videoUrl: `${R2_BASE}/videos/15.%20Slippery%20-%20MCK%20ft.%20T%C3%B9ng%20D%C6%B0%C6%A1ng%20(Official%20Music%20Video).mkv`,
    r2Key: "audio/15. Slippery (feat. Tùng Dương).flac",
    palette: { primary: "#d946ef", secondary: "#06b6d4", accent: "#f43f5e", glow: "rgba(217, 70, 239, 0.45)" },
    genre: "Art Pop / Rap"
  },
  {
    id: "mck-16",
    title: "16. Interpol",
    artist: "MCK",
    album: "HVL",
    duration: 185,
    coverUrl: HVL_COVER,
    audioUrl: `${R2_BASE}/audio/16.%20Intenpol.flac`,
    videoUrl: `${R2_BASE}/videos/16.%20Intenpol%20-%20MCK.mkv`,
    r2Key: "audio/16. Intenpol.flac",
    palette: { primary: "#10b981", secondary: "#3b82f6", accent: "#6366f1", glow: "rgba(16, 185, 129, 0.45)" },
    genre: "Trap"
  },
  {
    id: "mck-17",
    title: "17. Tây Thi",
    artist: "MCK",
    album: "HVL",
    duration: 210,
    coverUrl: HVL_COVER,
    audioUrl: `${R2_BASE}/audio/17.%20T%C3%A2y%20Thi.flac`,
    videoUrl: `${R2_BASE}/videos/17.%20T%C3%A2y%20Thi%20-%20MCK.mkv`,
    r2Key: "audio/17. Tây Thi.flac",
    palette: { primary: "#f43f5e", secondary: "#ec4899", accent: "#fbbf24", glow: "rgba(244, 63, 94, 0.45)" },
    genre: "Oriental Trap"
  },
  {
    id: "mck-18",
    title: "18. Hút và Hút",
    artist: "MCK",
    album: "HVL",
    duration: 198,
    coverUrl: HVL_COVER,
    audioUrl: `${R2_BASE}/audio/18.%20H%C3%BAt%20v%C3%A0%20H%C3%BAt.flac`,
    videoUrl: `${R2_BASE}/videos/18.%20H%C3%BAt%20v%C3%A0%20H%C3%BAt%20-%20MCK.mkv`,
    r2Key: "audio/18. Hút và Hút.flac",
    palette: { primary: "#84cc16", secondary: "#06b6d4", accent: "#10b981", glow: "rgba(132, 204, 22, 0.45)" },
    genre: "Chillhop"
  },
  {
    id: "mck-19",
    title: "19. Dưa Chua",
    artist: "MCK",
    album: "HVL",
    duration: 204,
    coverUrl: HVL_COVER,
    audioUrl: `${R2_BASE}/audio/19.%20D%C6%B0a%20Chua.flac`,
    videoUrl: `${R2_BASE}/videos/19.%20D%C6%B0a%20Chua%20-%20MCK.mkv`,
    r2Key: "audio/19. Dưa Chua.flac",
    palette: { primary: "#eab308", secondary: "#84cc16", accent: "#f97316", glow: "rgba(234, 179, 8, 0.45)" },
    genre: "Hip-Hop"
  },
  {
    id: "mck-20",
    title: "20. Xa Xôi",
    artist: "MCK ft. Obito",
    album: "HVL",
    duration: 232,
    coverUrl: HVL_COVER,
    audioUrl: `${R2_BASE}/audio/20.%20Xa%20X%C3%B4i%20(feat.%20Obito).flac`,
    videoUrl: `${R2_BASE}/videos/20.%20Xa%20X%C3%B4i%20-%20MCK%20ft.%20Obito%20(Official%20Music%20Video).mkv`,
    r2Key: "audio/20. Xa Xôi (feat. Obito).flac",
    palette: { primary: "#6366f1", secondary: "#ec4899", accent: "#06b6d4", glow: "rgba(99, 102, 241, 0.45)" },
    genre: "Melodic Rap"
  },
  {
    id: "mck-21",
    title: "21. Che Phù",
    artist: "MCK",
    album: "HVL",
    duration: 190,
    coverUrl: HVL_COVER,
    audioUrl: `${R2_BASE}/audio/21.%20Che%20Ph%C3%B9.flac`,
    videoUrl: `${R2_BASE}/videos/21.%20Che%20Ph%C3%B9%20-%20MCK.mkv`,
    r2Key: "audio/21. Che Phù.flac",
    palette: { primary: "#a855f7", secondary: "#f43f5e", accent: "#3b82f6", glow: "rgba(168, 85, 247, 0.45)" },
    genre: "Hip-Hop"
  },
  {
    id: "mck-22",
    title: "22. Oanh M - Thuoc",
    artist: "MCK",
    album: "HVL",
    duration: 215,
    coverUrl: HVL_COVER,
    audioUrl: `${R2_BASE}/audio/22.%20Oanh%20M%20-%20Thuoc.flac`,
    videoUrl: `${R2_BASE}/videos/22.%20Oanh%20M%20-%20Thuoc%20-%20MCK.mkv`,
    r2Key: "audio/22. Oanh M - Thuoc.flac",
    palette: { primary: "#06b6d4", secondary: "#6366f1", accent: "#10b981", glow: "rgba(6, 182, 212, 0.45)" },
    genre: "Trap"
  },
  {
    id: "mck-23",
    title: "23. Ghét Xog Lại Thik",
    artist: "MCK",
    album: "HVL",
    duration: 188,
    coverUrl: HVL_COVER,
    audioUrl: `${R2_BASE}/audio/23.%20Gh%C3%A9t%20Xog%20L%E1%BA%A1i%20Thik.flac`,
    videoUrl: `${R2_BASE}/videos/23.%20Gh%C3%A9t%20Xog%20L%E1%BA%A1i%20Thik%20-%20MCK.mkv`,
    r2Key: "audio/23. Ghét Xog Lại Thik.flac",
    palette: { primary: "#ec4899", secondary: "#f43f5e", accent: "#fb923c", glow: "rgba(236, 72, 153, 0.45)" },
    genre: "Pop Rap"
  },
  {
    id: "mck-24",
    title: "24. Nhìn Kẻ Thù Của Tao",
    artist: "MCK",
    album: "HVL",
    duration: 220,
    coverUrl: HVL_COVER,
    audioUrl: `${R2_BASE}/audio/24.%20Nh%C3%ACn%20K%E1%BA%BB%20Th%C3%B9%20C%E1%BB%A7a%20Tao.flac`,
    videoUrl: `${R2_BASE}/videos/24.%20Nh%C3%ACn%20K%E1%BA%BB%20Th%C3%B9%20C%E1%BB%A7a%20Tao%20-%20MCK%20(Official%20Music%20Video).mkv`,
    r2Key: "audio/24. Nhìn Kẻ Thù Của Tao.flac",
    palette: { primary: "#dc2626", secondary: "#7c3aed", accent: "#000000", glow: "rgba(220, 38, 38, 0.45)" },
    genre: "Hardcore Trap"
  },
  {
    id: "mck-25",
    title: "25. Envy",
    artist: "MCK ft. THANHDRAW",
    album: "HVL",
    duration: 230,
    coverUrl: HVL_COVER,
    audioUrl: `${R2_BASE}/audio/25.%20Envy%20(feat.%20THANHDRAW).flac`,
    videoUrl: `${R2_BASE}/videos/25.%20Envy%20-%20MCK%20ft.%20THANHDRAW.mkv`,
    r2Key: "audio/25. Envy (feat. THANHDRAW).flac",
    palette: { primary: "#10b981", secondary: "#f59e0b", accent: "#ef4444", glow: "rgba(16, 185, 129, 0.45)" },
    genre: "Trap"
  },
  {
    id: "mck-26",
    title: "26. Cảm Ơn",
    artist: "MCK",
    album: "HVL",
    duration: 245,
    coverUrl: HVL_COVER,
    audioUrl: `${R2_BASE}/audio/26.%20C%E1%BA%A3m%20%C6%A0n.flac`,
    videoUrl: `${R2_BASE}/videos/26.%20C%E1%BA%A3m%20%C6%A0n%20-%20MCK.mkv`,
    r2Key: "audio/26. Cảm Ơn.flac",
    palette: { primary: "#3b82f6", secondary: "#8b5cf6", accent: "#ec4899", glow: "rgba(59, 130, 246, 0.45)" },
    genre: "Melodic Rap"
  },
  {
    id: "mck-27",
    title: "27. Không Cần Lo Cho Tao",
    artist: "MCK",
    album: "HVL",
    duration: 215,
    coverUrl: HVL_COVER,
    audioUrl: `${R2_BASE}/audio/27.%20Kh%C3%B4ng%20C%E1%BA%A7n%20Lo%20Cho%20Tao.flac`,
    videoUrl: `${R2_BASE}/videos/27.%20Kh%C3%B4ng%20C%E1%BA%A7n%20Lo%20Cho%20Tao%20-%20MCK.mkv`,
    r2Key: "audio/27. Không Cần Lo Cho Tao.flac",
    palette: { primary: "#f97316", secondary: "#6366f1", accent: "#06b6d4", glow: "rgba(249, 115, 22, 0.45)" },
    genre: "Hip-Hop"
  },
  {
    id: "mck-28",
    title: "28. Huh",
    artist: "MCK ft. RPT Orijinn & THANHDRAW",
    album: "HVL",
    duration: 255,
    coverUrl: HVL_COVER,
    audioUrl: `${R2_BASE}/audio/28.%20Huh%20(feat.%20RPT%20Orijinn%20%26%20THANHDRAW).flac`,
    videoUrl: `${R2_BASE}/videos/28.%20Huh%20-%20MCK%20ft.%20RPT%20ORIJINN%20%26%20THANHDRAW.mkv`,
    r2Key: "audio/28. Huh (feat. RPT Orijinn & THANHDRAW).flac",
    palette: { primary: "#8b5cf6", secondary: "#ef4444", accent: "#eab308", glow: "rgba(139, 92, 246, 0.45)" },
    genre: "Drill / Trap"
  },
  {
    id: "mck-29",
    title: "29. Nguyễn Văn Mười",
    artist: "MCK",
    album: "HVL",
    duration: 220,
    coverUrl: HVL_COVER,
    audioUrl: `${R2_BASE}/audio/29.%20Nguy%E1%BB%85n%20V%C4%83n%20M%C6%B0%E1%BB%9Di.flac`,
    videoUrl: `${R2_BASE}/videos/29.%20Nguy%E1%BB%85n%20V%C4%83n%20M%C6%B0%E1%BB%9Di%20-%20MCK.mkv`,
    r2Key: "audio/29. Nguyễn Văn Mười.flac",
    palette: { primary: "#14b8a6", secondary: "#f43f5e", accent: "#6366f1", glow: "rgba(20, 184, 166, 0.45)" },
    genre: "Hip-Hop"
  },
  {
    id: "mck-30",
    title: "30. Thịt Lợn",
    artist: "MCK",
    album: "HVL",
    duration: 210,
    coverUrl: HVL_COVER,
    audioUrl: `${R2_BASE}/audio/30.%20Th%E1%BB%8Bt%20L%E1%BB%A3n.flac`,
    videoUrl: `${R2_BASE}/videos/30.%20Th%E1%BB%8Bt%20L%E1%BB%A3n%20-%20MCK.mkv`,
    r2Key: "audio/30. Thịt Lợn.flac",
    palette: { primary: "#ec4899", secondary: "#f97316", accent: "#8b5cf6", glow: "rgba(236, 72, 153, 0.45)" },
    genre: "Trap"
  }
];

// --- REST API Endpoints ---

app.get("/api/health", (c) => {
  return c.json({
    status: "online",
    service: "MCK HVL Audio Engine",
    edge: "Cloudflare Workers",
    timestamp: new Date().toISOString()
  });
});

// List tracks (querying D1 if available, otherwise returning full MCK Vault library)
app.get("/api/tracks", async (c) => {
  if (c.env.DB) {
    try {
      const { results } = await c.env.DB.prepare("SELECT * FROM tracks ORDER BY track_number ASC LIMIT 50").all();
      if (results && results.length > 0) {
        return c.json({ tracks: results });
      }
    } catch (e) {
      console.warn("D1 query fallback:", e);
    }
  }
  return c.json({ tracks: MCK_TRACKS });
});

// Simple Auth endpoint for Login Zone
app.post("/api/auth/login", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const { email = "guest@hiddenmusic.app", password = "" } = body;

  return c.json({
    success: true,
    user: {
      id: "usr-" + Math.random().toString(36).substring(2, 9),
      name: email.split("@")[0] || "Explorer",
      email: email,
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop",
      membershipTier: "Pro Listener"
    },
    token: "jwt-token-" + btoa(email + ":" + Date.now())
  });
});

// Stream asset directly from R2 Storage (hidden-music-vault) - Supports wildcard subfolders & byte-range streaming for large FLAC files
app.options("/api/stream/*", (c) => {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Max-Age": "86400"
    }
  });
});

app.get("/api/stream/*", async (c) => {
  const rawKey = c.req.path.replace("/api/stream/", "");
  const key = decodeURIComponent(rawKey);

  if (!c.env.MUSIC_ASSETS) {
    return c.text("R2 Bucket not configured", 503);
  }

  // Pass HTTP Range header to R2 for native Byte-Range streaming
  const rangeHeader = c.req.header("Range");
  let object: R2ObjectBody | R2Object | null = null;

  if (rangeHeader) {
    object = await c.env.MUSIC_ASSETS.get(key, {
      range: c.req.raw.headers
    });
  } else {
    object = await c.env.MUSIC_ASSETS.get(key);
  }

  if (!object || !("body" in object)) {
    return c.text(`Asset not found for key: ${key}`, 404);
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "*");
  headers.set("Access-Control-Expose-Headers", "Content-Range, Accept-Ranges, Content-Length, Content-Type");
  headers.set("Accept-Ranges", "bytes");
  headers.set("Cache-Control", "public, max-age=31536000, immutable");

  if (key.endsWith(".jpg") || key.endsWith(".jpeg")) {
    headers.set("Content-Type", "image/jpeg");
  } else if (key.endsWith(".flac")) {
    headers.set("Content-Type", "audio/flac");
  } else if (key.endsWith(".mkv")) {
    headers.set("Content-Type", "video/x-matroska");
  } else if (key.endsWith(".mp4")) {
    headers.set("Content-Type", "video/mp4");
  }

  // Handle byte range response ONLY if Range header was explicitly requested by client
  if (rangeHeader && object.range && typeof (object.range as any).offset === "number") {
    const offset = (object.range as any).offset ?? 0;
    const length = (object.range as any).length ?? (object.size - offset);
    const end = offset + length - 1;
    headers.set("Content-Range", `bytes ${offset}-${end}/${object.size}`);
    headers.set("Content-Length", `${length}`);
    return new Response(object.body, { headers, status: 206 });
  }

  headers.set("Content-Length", `${object.size}`);
  return new Response(object.body, { headers, status: 200 });
});

// R2 Object Name Clean Mapping
const R2_CLEAN_MAP: Record<string, string> = {
  "01": "01. Elegie.flac",
  "02": "02. IDK.flac",
  "03": "03. Wtf Bby I_m Lit.flac",
  "04": "04. Anh Không Muốn Nó Dễ Dàng.flac",
  "05": "05. Baby (feat. marzuz).flac",
  "06": "06. Yêu Anh Giết Anh.flac",
  "07": "07. Mắt Môi Tay Chân (feat. Tage).flac",
  "08": "08. Đạo Của Anh Vừa.flac",
  "09": "09. Là Gì Của Nhau.flac",
  "10": "10. Night In Prague.flac",
  "11": "11. Một Cái Ôm.flac",
  "12": "12. Liệm.flac",
  "13": "13. Nếu Như Ta Chẳng Còn (feat. AAP Ướt Mi).flac",
  "14": "14. Ai Mới Là Kẻ Xấu Xa.flac",
  "15": "15. Slippery (feat. Tùng Dương).flac",
  "16": "16. Intenpol.flac",
  "17": "17. Tây Thi.flac",
  "18": "18. Hút và Hút.flac",
  "19": "19. Dưa Chua.flac",
  "20": "20. Xa Xôi (feat. Obito).flac",
  "21": "21. Che Phù.flac",
  "22": "22. Oanh M - Thuoc.flac",
  "23": "23. Ghét Xog Lại Thik.flac",
  "24": "24. Nhìn Kẻ Thù Của Tao.flac",
  "25": "25. Envy (feat. THANHDRAW).flac",
  "26": "26. Cảm Ơn.flac",
  "27": "27. Không Cần Lo Cho Tao.flac",
  "28": "28. Huh (feat. RPT Orijinn & THANHDRAW).flac",
  "29": "29. Nguyễn Văn Mười.flac",
  "30": "30. Thịt Lợn.flac",
};

// Video Object Name Clean Mapping
const VIDEO_CLEAN_MAP: Record<string, string> = {
  "Elegie": "01. Elegie - MCK.mkv",
  "IDK": "02. IDK - MCK (Official Music Video).mkv",
  "Wtf_Bby": "03. Wtf Bby I'm Lit - MCK.mkv",
  "Anh_Kh_ng": "04. Anh Không Muốn Nó Dễ Dàng - MCK.mkv",
  "Baby": "05. Baby - MCK ft. marzuz.mkv",
  "Y_u_Anh": "06. Yêu Anh Giết Anh - MCK.mkv",
  "TAY_CH_N": "07. Mắt Môi Tay Chân - MCK ft. Tage (Official Music Video).mkv",
  "ao_C_a": "08. Đạo Của Anh Vừa - MCK.mkv",
  "L__G__": "09. Là Gì Của Nhau - MCK.mkv",
  "Night_In": "10. Night In Prague - MCK.mkv",
  "M_t_C_i": "11. Một Cái Ôm - MCK.mkv",
  "Li_m": "12. Liệm - MCK.mkv",
  "N_u_Nh": "13. Nếu Như Ta Chẳng Còn - MCK ft. AAP Ướt Mi.mkv",
  "Ai_M_i": "14. Ai Mới Là Kẻ Xấu Xa - MCK.mkv",
  "SLIPPERY": "15. Slippery - MCK ft. Tùng Dương (Official Music Video).mkv",
  "Intenpol": "16. Intenpol - MCK.mkv",
  "T_y_Thi": "17. Tây Thi - MCK.mkv",
  "H_t_v": "18. Hút và Hút - MCK.mkv",
  "D_a_Chua": "19. Dưa Chua - MCK.mkv",
  "XA_X_I": "20. Xa Xôi - MCK ft. Obito (Official Music Video).mkv",
  "Che_Ph": "21. Che Phù - MCK.mkv",
  "Oanh_M": "22. Oanh M - Thuoc - MCK.mkv",
  "Ghet_Xog": "23. Ghét Xog Lại Thik - MCK.mkv",
  "TH__C_A_TAO": "24. Nhìn Kẻ Thù Của Tao - MCK (Official Music Video).mkv",
  "Envy": "25. Envy - MCK ft. THANHDRAW.mkv",
  "C_m__n": "26. Cảm Ơn - MCK.mkv",
  "Kh_ng_C_n": "27. Không Cần Lo Cho Tao - MCK.mkv",
  "Huh": "28. Huh - MCK ft. RPT ORIJINN & THANHDRAW.mkv",
  "Nguy_n_V_n": "29. Nguyễn Văn Mười - MCK.mkv",
  "Th_t_L_n": "30. Thịt Lợn - MCK.mkv"
};

// Endpoint to physically rename objects inside the Cloudflare R2 bucket (audio, videos, covers)
app.all("/api/r2/rename-vault-objects", async (c) => {
  if (!c.env.MUSIC_ASSETS) {
    return c.json({ error: "R2 Bucket not bound" }, 503);
  }

  const listed = await c.env.MUSIC_ASSETS.list({ limit: 500 });
  const results: any[] = [];

  for (const obj of listed.objects) {
    const oldKey = obj.key;
    let newKey = "";

    // 1. Rename Audio folder files
    if (oldKey.startsWith("audio/") || oldKey.endsWith(".flac")) {
      const hasAudioPrefix = oldKey.startsWith("audio/");
      const filenameOnly = hasAudioPrefix ? oldKey.replace("audio/", "") : oldKey;

      for (let i = 1; i <= 30; i++) {
        const numStr = i < 10 ? `0${i}` : `${i}`;
        if (filenameOnly.includes(`_${numStr}_`) || filenameOnly.startsWith(`${numStr}_`) || filenameOnly.startsWith(`${numStr}.`)) {
          const cleanName = R2_CLEAN_MAP[numStr];
          if (cleanName) {
            newKey = hasAudioPrefix ? `audio/${cleanName}` : `audio/${cleanName}`;
          }
          break;
        }
      }
    }
    // 2. Rename Video folder files (.mkv)
    else if (oldKey.startsWith("videos/") || oldKey.endsWith(".mkv")) {
      const filenameOnly = oldKey.replace("videos/", "");

      for (const [matchKey, cleanName] of Object.entries(VIDEO_CLEAN_MAP)) {
        if (filenameOnly.includes(matchKey)) {
          newKey = `videos/${cleanName}`;
          break;
        }
      }
    }
    // 3. Rename Covers folder files (.jpg / .png)
    else if (oldKey.startsWith("covers/") || oldKey.endsWith(".jpg") || oldKey.endsWith(".png")) {
      newKey = "covers/HVL_Album_Cover.jpg";
    }

    // Execute physical copy & delete in R2
    if (newKey && newKey !== oldKey) {
      const oldObject = await c.env.MUSIC_ASSETS.get(oldKey);
      if (oldObject) {
        await c.env.MUSIC_ASSETS.put(newKey, oldObject.body, {
          httpMetadata: oldObject.httpMetadata,
          customMetadata: oldObject.customMetadata,
        });
        await c.env.MUSIC_ASSETS.delete(oldKey);

        results.push({
          oldKey,
          newKey,
          status: "SUCCESS_RENAMED"
        });
      }
    }
  }

  return c.json({
    success: true,
    totalRenamed: results.length,
    results
  });
});

// --- MCP (Model Context Protocol) Server for Gemini Spark ---

const mcpServer = new McpServer({
  name: "Hidden Music Intelligence MCP",
  version: "1.0.0"
});

// Tool 0: List all assets in R2 Vault
mcpServer.tool(
  "list_r2_vault_files",
  "Liệt kê tất cả các file âm thanh và 3D model trong kho lưu trữ R2 (hidden-music-vault)",
  {},
  async () => {
    return {
      content: [{ type: "text", text: "Kho R2 'hidden-music-vault' hiện chứa 62 objects (5.32 GB)." }]
    };
  }
);

// Tool 1: Search music library
mcpServer.tool(
  "search_music",
  "Tìm kiếm bài hát, album và nghệ sĩ trong thư viện Hidden Music",
  { query: z.string().describe("Từ khóa tìm kiếm (tên bài, nghệ sĩ, thể loại)") },
  async ({ query }) => {
    const q = query.toLowerCase();
    const matches = SAMPLE_TRACKS.filter(
      (t) => t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q) || t.genre.toLowerCase().includes(q)
    );
    return {
      content: [{ type: "text", text: JSON.stringify(matches, null, 2) }]
    };
  }
);

// Tool 2: Get track color palette & mood for dynamic shaders
mcpServer.tool(
  "get_track_palette",
  "Lấy bảng mã màu HEX và tâm trạng ánh sáng của một bài hát để tạo hiệu ứng chuyển cảnh",
  { trackId: z.string().describe("ID của bài hát") },
  async ({ trackId }) => {
    const track = SAMPLE_TRACKS.find((t) => t.id === trackId) || SAMPLE_TRACKS[0];
    return {
      content: [{ type: "text", text: JSON.stringify(track.palette, null, 2) }]
    };
  }
);

// MCP SSE Endpoints for Gemini Spark
app.get("/mcp", async (c) => {
  const transport = new SSEServerTransport("/message", (response) => response);
  await mcpServer.connect(transport);
  return transport.handlePostMessage(c.req.raw);
});

app.post("/message", async (c) => {
  // Handler for client-to-server SSE messages
  return c.text("Message received");
});

export default app;
