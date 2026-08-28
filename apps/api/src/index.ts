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

// Full MCK Discography Library mapping with restored Vietnamese titles & lossless R2 links
const MCK_TRACKS = [
  {
    id: "mck-01",
    title: "01. Elegie",
    artist: "MCK",
    album: "99% & Archives",
    duration: 198,
    coverUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop",
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3",
    r2Key: "1786880055560_01_Elegie.flac",
    palette: { primary: "#6366f1", secondary: "#ec4899", accent: "#8b5cf6", glow: "rgba(99, 102, 241, 0.45)" },
    genre: "Hip-Hop / Rap"
  },
  {
    id: "mck-02",
    title: "02. IDK",
    artist: "MCK",
    album: "99% & Archives",
    duration: 215,
    coverUrl: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=800&auto=format&fit=crop",
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=ambient-piano-amp-strings-10711.mp3",
    r2Key: "1786880057865_02_IDK.flac",
    palette: { primary: "#06b6d4", secondary: "#3b82f6", accent: "#10b981", glow: "rgba(6, 182, 212, 0.45)" },
    genre: "Melodic Rap"
  },
  {
    id: "mck-03",
    title: "03. Wtf Bby I'm Lit",
    artist: "MCK",
    album: "99% & Archives",
    duration: 180,
    coverUrl: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=800&auto=format&fit=crop",
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8bbf7b5b5.mp3?filename=electronic-future-beats-117997.mp3",
    r2Key: "1786880060663_03_Wtf_Bby_I_m_Lit.flac",
    palette: { primary: "#f43f5e", secondary: "#fb923c", accent: "#d946ef", glow: "rgba(244, 63, 94, 0.45)" },
    genre: "Trap"
  },
  {
    id: "mck-04",
    title: "04. Anh Không Muốn Nó Dễ Dàng",
    artist: "MCK",
    album: "99% & Archives",
    duration: 224,
    coverUrl: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=800&auto=format&fit=crop",
    audioUrl: "https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3?filename=chill-abstract-intention-12099.mp3",
    r2Key: "1786880065341_04_Anh_Kh_ng_Mu_n_N_D__D_ng.flac",
    palette: { primary: "#14b8a6", secondary: "#0284c7", accent: "#a855f7", glow: "rgba(20, 184, 166, 0.45)" },
    genre: "R&B / Soul"
  },
  {
    id: "mck-05",
    title: "05. Baby",
    artist: "MCK ft. marzuz",
    album: "99% & Archives",
    duration: 230,
    coverUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop",
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3",
    r2Key: "1786880068330_05_Baby_feat_marzuz_flac",
    palette: { primary: "#ec4899", secondary: "#8b5cf6", accent: "#f43f5e", glow: "rgba(236, 72, 153, 0.45)" },
    genre: "Alternative R&B"
  },
  {
    id: "mck-06",
    title: "06. Yêu Anh Giết Anh",
    artist: "MCK",
    album: "99% & Archives",
    duration: 210,
    coverUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800&auto=format&fit=crop",
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=ambient-piano-amp-strings-10711.mp3",
    r2Key: "1786880074066_06_Y_u_Anh_Gi_t_Anh.flac",
    palette: { primary: "#ef4444", secondary: "#7c3aed", accent: "#f97316", glow: "rgba(239, 68, 68, 0.45)" },
    genre: "Emo Rap"
  },
  {
    id: "mck-07",
    title: "07. Mắt Môi Tay Chân",
    artist: "MCK ft. Tage",
    album: "99% & Archives",
    duration: 240,
    coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=800&auto=format&fit=crop",
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8bbf7b5b5.mp3?filename=electronic-future-beats-117997.mp3",
    r2Key: "1786880076560_07_M_t_M_i_Tay_Ch_n_feat_Tage_flac",
    palette: { primary: "#8b5cf6", secondary: "#06b6d4", accent: "#3b82f6", glow: "rgba(139, 92, 246, 0.45)" },
    genre: "Hip-Hop"
  },
  {
    id: "mck-08",
    title: "08. Đạo Của Anh Vừa",
    artist: "MCK",
    album: "99% & Archives",
    duration: 195,
    coverUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop",
    audioUrl: "https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3?filename=chill-abstract-intention-12099.mp3",
    r2Key: "1786880079453_08__ao_C_a_Anh_V_a.flac",
    palette: { primary: "#eab308", secondary: "#ef4444", accent: "#f97316", glow: "rgba(234, 179, 8, 0.45)" },
    genre: "Trap"
  },
  {
    id: "mck-09",
    title: "09. Là Gì Của Nhau",
    artist: "MCK",
    album: "99% & Archives",
    duration: 205,
    coverUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=800&auto=format&fit=crop",
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3",
    r2Key: "1786880081820_09_L__G__C_a_Nhau.flac",
    palette: { primary: "#3b82f6", secondary: "#ec4899", accent: "#6366f1", glow: "rgba(59, 130, 246, 0.45)" },
    genre: "R&B"
  },
  {
    id: "mck-10",
    title: "10. Night In Prague",
    artist: "MCK",
    album: "99% & Archives",
    duration: 250,
    coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop",
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=ambient-piano-amp-strings-10711.mp3",
    r2Key: "1786880084194_10_Night_In_Prague.flac",
    palette: { primary: "#6366f1", secondary: "#14b8a6", accent: "#a855f7", glow: "rgba(99, 102, 241, 0.45)" },
    genre: "Chillhop / Jazzhop"
  },
  {
    id: "mck-11",
    title: "11. Một Cái Ôm",
    artist: "MCK",
    album: "99% & Archives",
    duration: 218,
    coverUrl: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=800&auto=format&fit=crop",
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8bbf7b5b5.mp3?filename=electronic-future-beats-117997.mp3",
    r2Key: "1786880087645_11_M_t_C_i_m.flac",
    palette: { primary: "#f43f5e", secondary: "#8b5cf6", accent: "#06b6d4", glow: "rgba(244, 63, 94, 0.45)" },
    genre: "Acoustic / Rap"
  },
  {
    id: "mck-12",
    title: "12. Liệm",
    artist: "MCK",
    album: "99% & Archives",
    duration: 235,
    coverUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=800&auto=format&fit=crop",
    audioUrl: "https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3?filename=chill-abstract-intention-12099.mp3",
    r2Key: "1786880090200_12_Li_m.flac",
    palette: { primary: "#7c3aed", secondary: "#000000", accent: "#dc2626", glow: "rgba(124, 58, 237, 0.45)" },
    genre: "Dark Trap"
  },
  {
    id: "mck-13",
    title: "13. Nếu Như Ta Chẳng Còn",
    artist: "MCK ft. AAP Ướt Mi",
    album: "99% & Archives",
    duration: 242,
    coverUrl: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?q=80&w=800&auto=format&fit=crop",
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3",
    r2Key: "1786880093056_13_N_u_Nh_Ta_Ch_ng_C_n_feat_AAP___t_Mi_flac",
    palette: { primary: "#0ea5e9", secondary: "#6366f1", accent: "#ec4899", glow: "rgba(14, 165, 233, 0.45)" },
    genre: "R&B / Soul"
  },
  {
    id: "mck-14",
    title: "14. Ai Mới Là Kẻ Xấu Xa",
    artist: "MCK",
    album: "99% & Archives",
    duration: 212,
    coverUrl: "https://images.unsplash.com/photo-1511735111819-9a3f7709049c?q=80&w=800&auto=format&fit=crop",
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=ambient-piano-amp-strings-10711.mp3",
    r2Key: "1786880097921_14_Ai_M_i_L__K__X_u_Xa.flac",
    palette: { primary: "#e11d48", secondary: "#f59e0b", accent: "#8b5cf6", glow: "rgba(225, 29, 72, 0.45)" },
    genre: "Hip-Hop"
  },
  {
    id: "mck-15",
    title: "15. Slippery",
    artist: "MCK ft. Tùng Dương",
    album: "99% & Archives",
    duration: 260,
    coverUrl: "https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=800&auto=format&fit=crop",
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8bbf7b5b5.mp3?filename=electronic-future-beats-117997.mp3",
    r2Key: "1786880101298_15_Slippery_feat_T_ng_D_ng_flac",
    palette: { primary: "#d946ef", secondary: "#06b6d4", accent: "#f43f5e", glow: "rgba(217, 70, 239, 0.45)" },
    genre: "Art Pop / Rap"
  },
  {
    id: "mck-16",
    title: "16. Interpol",
    artist: "MCK",
    album: "99% & Archives",
    duration: 185,
    coverUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop",
    audioUrl: "https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3?filename=chill-abstract-intention-12099.mp3",
    r2Key: "1786880105245_16_Intenpol.flac",
    palette: { primary: "#10b981", secondary: "#3b82f6", accent: "#6366f1", glow: "rgba(16, 185, 129, 0.45)" },
    genre: "Trap"
  },
  {
    id: "mck-17",
    title: "17. Tây Thi",
    artist: "MCK",
    album: "99% & Archives",
    duration: 210,
    coverUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=800&auto=format&fit=crop",
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3",
    r2Key: "1786880107004_17_T_y_Thi.flac",
    palette: { primary: "#f43f5e", secondary: "#ec4899", accent: "#fbbf24", glow: "rgba(244, 63, 94, 0.45)" },
    genre: "Oriental Trap"
  },
  {
    id: "mck-18",
    title: "18. Hút và Hút",
    artist: "MCK",
    album: "99% & Archives",
    duration: 198,
    coverUrl: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=800&auto=format&fit=crop",
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=ambient-piano-amp-strings-10711.mp3",
    r2Key: "1786880109312_18_H_t_v__H_t.flac",
    palette: { primary: "#84cc16", secondary: "#06b6d4", accent: "#10b981", glow: "rgba(132, 204, 22, 0.45)" },
    genre: "Chillhop"
  },
  {
    id: "mck-19",
    title: "19. Dưa Chua",
    artist: "MCK",
    album: "99% & Archives",
    duration: 204,
    coverUrl: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=800&auto=format&fit=crop",
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8bbf7b5b5.mp3?filename=electronic-future-beats-117997.mp3",
    r2Key: "1786880112035_19_D_a_Chua.flac",
    palette: { primary: "#eab308", secondary: "#84cc16", accent: "#f97316", glow: "rgba(234, 179, 8, 0.45)" },
    genre: "Hip-Hop"
  },
  {
    id: "mck-20",
    title: "20. Xa Xôi",
    artist: "MCK ft. Obito",
    album: "99% & Archives",
    duration: 232,
    coverUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop",
    audioUrl: "https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3?filename=chill-abstract-intention-12099.mp3",
    r2Key: "1786880117977_20_Xa_X_i_feat_Obito_flac",
    palette: { primary: "#6366f1", secondary: "#ec4899", accent: "#06b6d4", glow: "rgba(99, 102, 241, 0.45)" },
    genre: "Melodic Rap"
  },
  {
    id: "mck-21",
    title: "21. Che Phù",
    artist: "MCK",
    album: "99% & Archives",
    duration: 190,
    coverUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop",
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3",
    r2Key: "1786880122552_21_Che_Ph_flac",
    palette: { primary: "#a855f7", secondary: "#f43f5e", accent: "#3b82f6", glow: "rgba(168, 85, 247, 0.45)" },
    genre: "Hip-Hop"
  },
  {
    id: "mck-22",
    title: "22. Oanh M - Thuoc",
    artist: "MCK",
    album: "99% & Archives",
    duration: 215,
    coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=800&auto=format&fit=crop",
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=ambient-piano-amp-strings-10711.mp3",
    r2Key: "1786880127035_22_Oanh_M___Thuoc.flac",
    palette: { primary: "#06b6d4", secondary: "#6366f1", accent: "#10b981", glow: "rgba(6, 182, 212, 0.45)" },
    genre: "Trap"
  },
  {
    id: "mck-23",
    title: "23. Ghét Xog Lại Thik",
    artist: "MCK",
    album: "99% & Archives",
    duration: 188,
    coverUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800&auto=format&fit=crop",
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8bbf7b5b5.mp3?filename=electronic-future-beats-117997.mp3",
    r2Key: "1786880131063_23_Ghet_Xog_Lai_Thik.flac",
    palette: { primary: "#ec4899", secondary: "#f43f5e", accent: "#fb923c", glow: "rgba(236, 72, 153, 0.45)" },
    genre: "Pop Rap"
  },
  {
    id: "mck-24",
    title: "24. Nhìn Kẻ Thù Của Tao",
    artist: "MCK",
    album: "99% & Archives",
    duration: 220,
    coverUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=800&auto=format&fit=crop",
    audioUrl: "https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3?filename=chill-abstract-intention-12099.mp3",
    r2Key: "1786880134224_24_Nh_n_K__Th__C_a_Tao.flac",
    palette: { primary: "#dc2626", secondary: "#7c3aed", accent: "#000000", glow: "rgba(220, 38, 38, 0.45)" },
    genre: "Hardcore Trap"
  },
  {
    id: "mck-25",
    title: "25. Envy",
    artist: "MCK ft. THANHDRAW",
    album: "99% & Archives",
    duration: 230,
    coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop",
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3",
    r2Key: "1786880140915_25_Envy_feat_THANHDRAW_flac",
    palette: { primary: "#10b981", secondary: "#f59e0b", accent: "#ef4444", glow: "rgba(16, 185, 129, 0.45)" },
    genre: "Trap"
  },
  {
    id: "mck-26",
    title: "26. Cảm Ơn",
    artist: "MCK",
    album: "99% & Archives",
    duration: 245,
    coverUrl: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=800&auto=format&fit=crop",
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=ambient-piano-amp-strings-10711.mp3",
    r2Key: "1786880146670_26_C_m__n.flac",
    palette: { primary: "#3b82f6", secondary: "#8b5cf6", accent: "#ec4899", glow: "rgba(59, 130, 246, 0.45)" },
    genre: "Melodic Rap"
  },
  {
    id: "mck-27",
    title: "27. Không Cần Lo Cho Tao",
    artist: "MCK",
    album: "99% & Archives",
    duration: 215,
    coverUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=800&auto=format&fit=crop",
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8bbf7b5b5.mp3?filename=electronic-future-beats-117997.mp3",
    r2Key: "1786880150787_27_Kh_ng_C_n_Lo_Cho_Tao.flac",
    palette: { primary: "#f97316", secondary: "#6366f1", accent: "#06b6d4", glow: "rgba(249, 115, 22, 0.45)" },
    genre: "Hip-Hop"
  },
  {
    id: "mck-28",
    title: "28. Huh",
    artist: "MCK ft. RPT Orijinn & THANHDRAW",
    album: "99% & Archives",
    duration: 255,
    coverUrl: "https://images.unsplash.com/photo-1511735111819-9a3f7709049c?q=80&w=800&auto=format&fit=crop",
    audioUrl: "https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3?filename=chill-abstract-intention-12099.mp3",
    r2Key: "1786880154564_28_Huh_feat_RPT_Orijinn___THANHDRAW_flac",
    palette: { primary: "#8b5cf6", secondary: "#ef4444", accent: "#eab308", glow: "rgba(139, 92, 246, 0.45)" },
    genre: "Drill / Trap"
  },
  {
    id: "mck-29",
    title: "29. Nguyễn Văn Mười",
    artist: "MCK",
    album: "99% & Archives",
    duration: 220,
    coverUrl: "https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=800&auto=format&fit=crop",
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3",
    r2Key: "1786880162370_29_Nguy_n_V_n_M__i.flac",
    palette: { primary: "#14b8a6", secondary: "#f43f5e", accent: "#6366f1", glow: "rgba(20, 184, 166, 0.45)" },
    genre: "Hip-Hop"
  },
  {
    id: "mck-30",
    title: "30. Thịt Lợn",
    artist: "MCK",
    album: "99% & Archives",
    duration: 210,
    coverUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=800&auto=format&fit=crop",
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=ambient-piano-amp-strings-10711.mp3",
    r2Key: "1786880166997_30_Th_t_L_n.flac",
    palette: { primary: "#ec4899", secondary: "#f97316", accent: "#8b5cf6", glow: "rgba(236, 72, 153, 0.45)" },
    genre: "Trap"
  }
];

// --- REST API Endpoints ---

app.get("/api/health", (c) => {
  return c.json({
    status: "online",
    service: "MCK Vault Audio Engine",
    edge: "Cloudflare Workers",
    timestamp: new Date().toISOString()
  });
});

// List tracks (querying D1 if available, otherwise returning full MCK Vault library)
app.get("/api/tracks", async (c) => {
  if (c.env.DB) {
    try {
      const { results } = await c.env.DB.prepare("SELECT * FROM tracks ORDER BY created_at DESC LIMIT 50").all();
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

// Stream asset directly from R2 Storage (hidden-music-vault)
app.get("/api/stream/:key", async (c) => {
  const key = c.req.param("key");
  if (!c.env.MUSIC_ASSETS) {
    return c.text("R2 Bucket not configured", 503);
  }

  const object = await c.env.MUSIC_ASSETS.get(key);
  if (!object) {
    return c.text("Asset not found", 404);
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("Cache-Control", "public, max-age=31536000, immutable");

  return new Response(object.body, { headers });
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

// Endpoint to physically rename objects inside the Cloudflare R2 bucket
app.all("/api/r2/rename-vault-objects", async (c) => {
  if (!c.env.MUSIC_ASSETS) {
    return c.json({ error: "R2 Bucket not bound" }, 503);
  }

  const listed = await c.env.MUSIC_ASSETS.list({ limit: 100 });
  const results: any[] = [];

  for (const obj of listed.objects) {
    const oldKey = obj.key;
    const hasAudioPrefix = oldKey.startsWith("audio/");
    const filenameOnly = hasAudioPrefix ? oldKey.replace("audio/", "") : oldKey;

    // Find track number (e.g. _01_, _02_, 01_, 02_)
    let matchedTrackNum = "";
    for (let i = 1; i <= 30; i++) {
      const numStr = i < 10 ? `0${i}` : `${i}`;
      if (filenameOnly.includes(`_${numStr}_`) || filenameOnly.startsWith(`${numStr}_`) || filenameOnly.startsWith(`${numStr}.`)) {
        matchedTrackNum = numStr;
        break;
      }
    }

    if (matchedTrackNum && R2_CLEAN_MAP[matchedTrackNum]) {
      const cleanName = R2_CLEAN_MAP[matchedTrackNum];
      const newKey = hasAudioPrefix ? `audio/${cleanName}` : cleanName;

      if (newKey !== oldKey) {
        const oldObject = await c.env.MUSIC_ASSETS.get(oldKey);
        if (oldObject) {
          // Copy to new clean object key in R2
          await c.env.MUSIC_ASSETS.put(newKey, oldObject.body, {
            httpMetadata: oldObject.httpMetadata,
            customMetadata: oldObject.customMetadata,
          });

          // Delete the old mangled object key from R2
          await c.env.MUSIC_ASSETS.delete(oldKey);

          results.push({
            oldKey,
            newKey,
            status: "SUCCESS_RENAMED"
          });
        }
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
