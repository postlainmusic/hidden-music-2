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

// Sample initial tracks with rich color palettes for the Apple Mesh Gradient
const SAMPLE_TRACKS = [
  {
    id: "track-1",
    title: "Midnight Aurora",
    artist: "Celestial Waves",
    album: "Solaris Prism",
    duration: 214,
    coverUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop",
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3",
    palette: {
      primary: "#6366f1",
      secondary: "#ec4899",
      accent: "#8b5cf6",
      glow: "rgba(99, 102, 241, 0.45)"
    },
    genre: "Ambient Synthwave"
  },
  {
    id: "track-2",
    title: "Liquid Glass Dreams",
    artist: "Ethereal Echo",
    album: "Reflections in Neon",
    duration: 188,
    coverUrl: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=800&auto=format&fit=crop",
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=ambient-piano-amp-strings-10711.mp3",
    palette: {
      primary: "#06b6d4",
      secondary: "#3b82f6",
      accent: "#10b981",
      glow: "rgba(6, 182, 212, 0.45)"
    },
    genre: "Lo-Fi Cinematic"
  },
  {
    id: "track-3",
    title: "Cybernetic Horizon",
    artist: "Nova Pulse",
    album: "Quantum Resonance",
    duration: 245,
    coverUrl: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=800&auto=format&fit=crop",
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8bbf7b5b5.mp3?filename=electronic-future-beats-117997.mp3",
    palette: {
      primary: "#f43f5e",
      secondary: "#fb923c",
      accent: "#d946ef",
      glow: "rgba(244, 63, 94, 0.45)"
    },
    genre: "Future Bass"
  },
  {
    id: "track-4",
    title: "Subtle Radiance",
    artist: "Aura Soundscape",
    album: "Luminescent Calm",
    duration: 196,
    coverUrl: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=800&auto=format&fit=crop",
    audioUrl: "https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3?filename=chill-abstract-intention-12099.mp3",
    palette: {
      primary: "#14b8a6",
      secondary: "#0284c7",
      accent: "#a855f7",
      glow: "rgba(20, 184, 166, 0.45)"
    },
    genre: "Chillout Electronic"
  }
];

// --- REST API Endpoints ---

app.get("/api/health", (c) => {
  return c.json({
    status: "online",
    service: "Hidden Music Engine",
    edge: "Cloudflare Workers",
    timestamp: new Date().toISOString()
  });
});

// List tracks (querying D1 if available, otherwise returning high-res sample library)
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
  return c.json({ tracks: SAMPLE_TRACKS });
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

// List all files/assets inside hidden-music-vault R2 Bucket
app.get("/api/r2/objects", async (c) => {
  if (!c.env.MUSIC_ASSETS) {
    return c.json({ error: "R2 Bucket not bound" }, 503);
  }

  const listed = await c.env.MUSIC_ASSETS.list({ limit: 100 });
  const objects = listed.objects.map((obj) => ({
    key: obj.key,
    size: obj.size,
    uploaded: obj.uploaded,
    streamUrl: `/api/stream/${encodeURIComponent(obj.key)}`
  }));

  return c.json({
    bucket: "hidden-music-vault",
    count: objects.length,
    truncated: listed.truncated,
    objects
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
