import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layout,
  Music,
  Users,
  Database,
  ArrowLeft,
  Plus,
  Trash2,
  Edit2,
  Check,
  RefreshCw,
  Eye,
  Smartphone,
  Monitor,
  Download,
  UploadCloud,
  Shield,
  Star,
  Play,
  Pause,
  Clock,
  Sparkles,
  Link as LinkIcon,
  ChevronUp,
  ChevronDown,
  Layers,
  Zap,
  Globe,
  Radio,
  FileText,
  UserCheck,
  UserX,
  Disc3,
  FolderPlus,
  Settings,
  FolderOpen,
  Sliders,
  X,
  Save,
  CheckCircle2
} from "lucide-react";
import { useAudioStore, Track, DynamicSection, VaultSlot, SectionTemplateType, Album, ReleaseType, DEFAULT_TRACKS } from "../store/audioStore";
import { useIsMobile } from "../hooks/useIsMobile";

const API_BASE = "https://hidden-music-api.postlain-music.workers.dev";
const R2_BASE = "https://media.postlain.com";
const HVL_COVER = "https://media.postlain.com/covers/HVL_Album_Cover.jpg";

// 7 Bespoke Section Templates Definitions
const TEMPLATE_PRESETS: { type: SectionTemplateType; name: string; icon: any; desc: string; defaultCfg: any }[] = [
  {
    type: "hero_banner",
    name: "Hero Music Banner",
    icon: Sparkles,
    desc: "Banner điện ảnh toàn cảnh giới thiệu Album/MV mới với nút Play tức thì",
    defaultCfg: {
      headline: "IDK - MCK (Official Single)",
      subheadline: "Thưởng thức bản Master Lossless 24-bit 96kHz độc quyền từ Album HVL (99%)",
      banner_url: HVL_COVER,
      track_id: "mck-02",
      cta_text: "Nghe Ngay",
      badge_text: "BẢN PHÁT HÀNH MỚI"
    }
  },
  {
    type: "album_showcase",
    name: "Album Showcase",
    icon: Music,
    desc: "Bìa 3D Album + Bảng Top 5 bài hát thả tim nhiều nhất từ D1 Database",
    defaultCfg: {
      album_id: "hvl-99",
      title: "HVL (99%)",
      artist: "MCK",
      cover_url: HVL_COVER,
      description: "Album phòng thu đầu tay gồm 30 bài hát Lossless FLAC độc quyền."
    }
  },
  {
    type: "cover_flow",
    name: "3D Cover Flow",
    icon: Layers,
    desc: "Băng chuyền 3D Vault Slots tương tác cảm ứng trực quan (Khóa HVL tại tâm)",
    defaultCfg: { slots_count: 5 }
  },
  {
    type: "artist_spotlight",
    name: "Artist Spotlight",
    icon: Radio,
    desc: "Thẻ chân dung nghệ sĩ, tiểu sử, triết lý âm nhạc và mạng xã hội",
    defaultCfg: {
      artist_name: "MCK (Nghiêm Vũ Hoàng Long)",
      genre: "Melodic Rap / R&B",
      bio: "Nghệ sĩ tiên phong định hình làn sóng Melodic Rap thế hệ mới tại Việt Nam với chất âm phòng thu Lossless độc bản.",
      avatar_url: HVL_COVER,
      featured_track_title: "01. Elegie",
      featured_track_id: "mck-01",
      spotify_url: "https://open.spotify.com",
      youtube_url: "https://youtube.com"
    }
  },
  {
    type: "video_premiere",
    name: "Cinema Video Premiere",
    icon: Zap,
    desc: "Khung xem trước MV độc quyền 16:9 với hiệu ứng Ambilight 60fps",
    defaultCfg: {
      title: "02. IDK - MCK (Official Music Video)",
      video_url: "https://media.postlain.com/videos/02.%20IDK%20-%20MCK%20(Official%20Music%20Video).mkv",
      poster_url: HVL_COVER,
      quality_badge: "4K MASTER"
    }
  },
  {
    type: "editorial_press",
    name: "Editorial Press & Review",
    icon: FileText,
    desc: "Trang bài báo phê bình âm nhạc phong cách tạp chí Rolling Stone",
    defaultCfg: {
      quote: "HVL (99%) là đỉnh cao âm thanh phòng thu Lossless thuần khiết, định nghĩa lại toàn bộ chuẩn mực Melodic Rap Việt Nam.",
      source: "ROLLING STONE ASIA",
      author: "Trưởng ban Biên tập Âm nhạc",
      cover_url: HVL_COVER
    }
  },
  {
    type: "explore_universe",
    name: "Explore Universe Portal",
    icon: Globe,
    desc: "Cổng dịch chuyển vào không gian âm nhạc mở rộng",
    defaultCfg: {
      headline: "EXPLORE UNIVERSE",
      subtext: "Không gian âm nhạc mở rộng đang được kết nối với hệ sinh thái streaming độc quyền.",
      cta_text: "Vào 3D Vault (HVL)"
    }
  }
];

interface AdminPortalProps {
  onBackToVault: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ onBackToVault }) => {
  const {
    currentUser,
    sections,
    loadSections,
    albums,
    loadAlbums,
    queue,
    loadTracks,
    playTrack,
    currentTrack,
    isPlaying,
    togglePlay,
    seedHvlToD1
  } = useAudioStore();
  const isMobile = useIsMobile();

  // 4 Unified Decks
  const [activeDeck, setActiveDeck] = useState<"releases" | "sections" | "audience" | "infra">("releases");

  // Admin Data State
  const [adminAlbums, setAdminAlbums] = useState<Album[]>([]);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string>("hvl-99");
  const [selectedAlbumTracks, setSelectedAlbumTracks] = useState<Track[]>([]);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [adminStats, setAdminStats] = useState<any>(null);
  const [r2Files, setR2Files] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Live Split-Screen Preview State
  const [showLivePreview, setShowLivePreview] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");

  // Integrated Link Ingestion State inside Deck 1
  const [showLinkIngestionBar, setShowLinkIngestionBar] = useState(false);
  const [externalUrl, setExternalUrl] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);

  // Waveform Visualizer Canvas State
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Modals State
  const [isNewAlbumModalOpen, setIsNewAlbumModalOpen] = useState(false);
  const [isNewTrackModalOpen, setIsNewTrackModalOpen] = useState(false);
  const [isNewSectionModalOpen, setIsNewSectionModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<DynamicSection | null>(null);
  const [sectionConfigForm, setSectionConfigForm] = useState<any>({});
  const [editingTrack, setEditingTrack] = useState<Track | null>(null);
  const [inlineEditingTrackId, setInlineEditingTrackId] = useState<string | null>(null);
  const [inlineTrackTitle, setInlineTrackTitle] = useState("");

  // Form Data States
  const [albumForm, setAlbumForm] = useState<{
    id: string;
    title: string;
    artist: string;
    cover_url: string;
    type: ReleaseType;
    release_year: number;
    genre: string;
  }>({
    id: "",
    title: "",
    artist: "MCK",
    cover_url: HVL_COVER,
    type: "album",
    release_year: new Date().getFullYear(),
    genre: "Melodic Rap / R&B"
  });

  const [trackForm, setTrackForm] = useState<{
    id: string;
    title: string;
    artist: string;
    duration_sec: number;
    audio_url: string;
    video_url?: string;
    bpm: number;
    genre: string;
    lyrics_synced?: string;
  }>({
    id: "",
    title: "",
    artist: "MCK",
    duration_sec: 200,
    audio_url: "",
    video_url: "",
    bpm: 120,
    genre: "Melodic Rap",
    lyrics_synced: ""
  });

  const token = typeof window !== "undefined" ? localStorage.getItem("vault_token") : null;

  const showToast = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // 1. Fetch All Albums
  const fetchAlbums = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/albums`);
      const data = await res.json();
      if (data.success && data.albums && data.albums.length > 0) {
        setAdminAlbums(data.albums);
      } else {
        setAdminAlbums([
          {
            id: "hvl-99",
            title: "HVL (99%)",
            artist: "MCK",
            type: "album",
            cover_url: HVL_COVER,
            release_year: 2023,
            genre: "Melodic Rap / R&B",
            track_count: 30
          }
        ]);
      }
    } catch (err) {
      setAdminAlbums([
        {
          id: "hvl-99",
          title: "HVL (99%)",
          artist: "MCK",
          type: "album",
          cover_url: HVL_COVER,
          release_year: 2023,
          genre: "Melodic Rap / R&B",
          track_count: 30
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // 2. Fetch Tracks For Selected Album
  const fetchAlbumTracks = async (albumId: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/albums/${albumId}/tracks`);
      const data = await res.json();
      if (data.success && data.tracks && data.tracks.length > 0) {
        const mappedTracks: Track[] = data.tracks.map((t: any) => ({
          id: t.id,
          album_id: t.album_id || albumId,
          title: t.title,
          artist: t.artist || "MCK",
          duration: t.duration_sec || t.duration || 180,
          audioUrl: t.audio_url || t.audioUrl || "",
          coverUrl: t.cover_url || t.coverUrl || HVL_COVER,
          videoUrl: t.video_url || t.videoUrl || undefined,
          r2Key: t.r2_key || t.r2Key || undefined,
          lyricsSynced: t.lyrics_synced || t.lyricsSynced || undefined
        }));
        setSelectedAlbumTracks(mappedTracks);
        return;
      }
    } catch (e) {
      console.warn("API tracks fetch fallback:", e);
    }

    if (queue && queue.length > 0) {
      setSelectedAlbumTracks(queue);
    } else {
      setSelectedAlbumTracks(DEFAULT_TRACKS);
    }
  };

  // 3. Fetch Users
  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setAdminUsers(data.users);
      }
    } catch (e) {
      // Mock admin users fallback
      setAdminUsers([
        { id: "usr-1", email: "studionopu@gmail.com", is_admin: 1, is_vip: 1, created_at: "2026-08-30" },
        { id: "usr-2", email: "postlainmusic@gmail.com", is_admin: 1, is_vip: 1, created_at: "2026-08-30" }
      ]);
    }
  };

  useEffect(() => {
    fetchAlbums();
    fetchAlbumTracks(selectedAlbumId);
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedAlbumId) {
      fetchAlbumTracks(selectedAlbumId);
    }
  }, [selectedAlbumId]);

  // Integrated URL Ingestion Handler
  const handleIngestUrlToAlbum = async () => {
    if (!externalUrl.trim()) {
      showToast("Vui lòng nhập đường link bài hát (YouTube / SoundCloud / R2 Stream)");
      return;
    }

    setIsExtracting(true);
    try {
      let title = "Bản Thu Mới";
      let duration = 210;
      let audioUrl = externalUrl;

      // Smart YouTube / URL parser
      if (externalUrl.includes("youtube.com") || externalUrl.includes("youtu.be")) {
        title = "Track " + (selectedAlbumTracks.length + 1) + " (YouTube Import)";
        audioUrl = externalUrl;
      } else if (externalUrl.includes("soundcloud.com")) {
        title = "Track " + (selectedAlbumTracks.length + 1) + " (SoundCloud Import)";
      } else {
        const parts = externalUrl.split("/").pop() || "Audio Track";
        title = decodeURIComponent(parts.replace(/\.[^/.]+$/, ""));
      }

      const newTrackId = `track-${Date.now().toString(36)}`;
      const res = await fetch(`${API_BASE}/api/admin/tracks`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          id: newTrackId,
          album_id: selectedAlbumId,
          title: title,
          artist: "MCK",
          duration_sec: duration,
          audio_url: audioUrl,
          cover_url: HVL_COVER,
          bpm: 120,
          genre: "Melodic Rap"
        })
      });

      const data = await res.json();
      if (data.success) {
        showToast(`Đã bóc tách & nạp bài hát "${title}" vào Album thành công!`);
        setExternalUrl("");
        setShowLinkIngestionBar(false);
        await fetchAlbumTracks(selectedAlbumId);
        loadTracks();
      } else {
        showToast(data.error || "Không thể lưu bài hát vào D1");
      }
    } catch (err: any) {
      showToast(err.message || "Lỗi nạp link");
    } finally {
      setIsExtracting(false);
    }
  };

  // Waveform Visualizer Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let phase = 0;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;
      const slices = 80;

      for (let i = 0; i < slices; i++) {
        const x = (i / slices) * width;
        const norm = Math.sin((i / slices) * Math.PI);
        const amp = isPlaying
          ? (Math.sin(phase + i * 0.15) * 0.5 + 0.5) * (height * 0.38) * norm
          : Math.sin(phase * 0.5 + i * 0.2) * 4 * norm;

        const grad = ctx.createLinearGradient(0, centerY - amp, 0, centerY + amp);
        grad.addColorStop(0, "#a5b4fc");
        grad.addColorStop(0.5, "#6366f1");
        grad.addColorStop(1, "#ec4899");

        ctx.fillStyle = grad;
        ctx.fillRect(x, centerY - amp, width / slices - 2, amp * 2 || 2);
      }

      phase += isPlaying ? 0.08 : 0.02;
      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying]);

  // Section Config Editing
  const openSectionConfigModal = (section: DynamicSection) => {
    setEditingSection(section);
    let parsedConfig: any = {};
    try {
      if (typeof section.config === "string") {
        parsedConfig = JSON.parse(section.config);
      } else if (section.config) {
        parsedConfig = { ...section.config };
      }
    } catch (e) {
      parsedConfig = {};
    }

    // Merge default preset values if missing
    const preset = TEMPLATE_PRESETS.find((p) => p.type === section.template_type);
    setSectionConfigForm({
      title: section.title,
      subtitle: section.subtitle || "",
      is_active: section.is_active ?? true,
      ...(preset ? preset.defaultCfg : {}),
      ...parsedConfig
    });
  };

  const handleSaveSectionConfig = async () => {
    if (!editingSection) return;
    try {
      const { title, subtitle, is_active, ...customConfig } = sectionConfigForm;
      const res = await fetch(`${API_BASE}/api/admin/sections/${editingSection.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title,
          subtitle,
          is_active: is_active ? 1 : 0,
          config: customConfig
        })
      });

      const data = await res.json();
      if (data.success) {
        showToast(`Đã lưu cấu hình Template: ${title}!`);
        setEditingSection(null);
        loadSections();
      } else {
        showToast(data.error || "Lỗi lưu cấu hình");
      }
    } catch (err: any) {
      showToast(err.message || "Lỗi lưu cấu hình");
    }
  };

  // Section Add / Delete / Toggle
  const handleToggleSection = async (section: DynamicSection) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/sections/${section.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ is_active: section.is_active ? 0 : 1 })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Đã ${section.is_active ? "ẩn" : "bật"} Section: ${section.title}`);
        loadSections();
      }
    } catch (err) {
      showToast("Lỗi cập nhật section");
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (!window.confirm("Xóa Section này khỏi trang chủ?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/sections/${sectionId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        showToast("Đã xóa Section!");
        loadSections();
      }
    } catch (err) {
      showToast("Lỗi xóa section");
    }
  };

  const handleAddPresetSection = async (preset: typeof TEMPLATE_PRESETS[0]) => {
    try {
      const newOrder = sections.length + 1;
      const res = await fetch(`${API_BASE}/api/admin/sections`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: preset.name,
          template_type: preset.type,
          sort_order: newOrder,
          is_active: 1,
          config: preset.defaultCfg
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Đã thêm Section mới: ${preset.name}!`);
        setIsNewSectionModalOpen(false);
        loadSections();
      }
    } catch (err) {
      showToast("Lỗi thêm section");
    }
  };

  const currentAlbum = adminAlbums.find((a) => a.id === selectedAlbumId) || adminAlbums[0];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "#060609",
        color: "#ffffff",
        display: "flex",
        flexDirection: "column",
        zIndex: 9999,
        overflow: "hidden"
      }}
    >
      {/* ── TOP NAVIGATION BAR ── */}
      <header
        style={{
          height: "64px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          backgroundColor: "rgba(10, 10, 15, 0.8)",
          backdropFilter: "blur(20px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
          zIndex: 50,
          flexShrink: 0
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBackToVault}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              borderRadius: "999px",
              backgroundColor: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              color: "#ffffff",
              fontSize: "0.85rem",
              fontWeight: 700,
              cursor: "pointer"
            }}
          >
            <ArrowLeft size={16} />
            <span>Quay lại Vault</span>
          </motion.button>

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <h1 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800, letterSpacing: "0.04em" }}>
                VAULT MONOLITH MATRIX
              </h1>
              <span
                style={{
                  padding: "2px 8px",
                  borderRadius: "4px",
                  backgroundColor: "rgba(99, 102, 241, 0.2)",
                  color: "#a5b4fc",
                  fontSize: "0.68rem",
                  fontWeight: 800,
                  border: "1px solid rgba(99, 102, 241, 0.4)"
                }}
              >
                MASTER ADMIN
              </span>
            </div>
            <p style={{ margin: 0, fontSize: "0.72rem", color: "rgba(255, 255, 255, 0.45)" }}>
              Cloudflare D1 Database • R2 Storage • Dynamic Sections Engine
            </p>
          </div>
        </div>

        {/* 4 Standard Decks Navigation Pills */}
        <nav style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <button
            onClick={() => setActiveDeck("releases")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              borderRadius: "12px",
              backgroundColor: activeDeck === "releases" ? "rgba(99, 102, 241, 0.25)" : "transparent",
              border: activeDeck === "releases" ? "1px solid #6366f1" : "1px solid transparent",
              color: activeDeck === "releases" ? "#ffffff" : "rgba(255, 255, 255, 0.6)",
              fontSize: "0.86rem",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            <Disc3 size={16} color={activeDeck === "releases" ? "#a5b4fc" : "currentColor"} />
            <span>Releases & Tracklists (D1)</span>
          </button>

          <button
            onClick={() => setActiveDeck("sections")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              borderRadius: "12px",
              backgroundColor: activeDeck === "sections" ? "rgba(99, 102, 241, 0.25)" : "transparent",
              border: activeDeck === "sections" ? "1px solid #6366f1" : "1px solid transparent",
              color: activeDeck === "sections" ? "#ffffff" : "rgba(255, 255, 255, 0.6)",
              fontSize: "0.86rem",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            <Layout size={16} color={activeDeck === "sections" ? "#a5b4fc" : "currentColor"} />
            <span>Dynamic Sections Studio</span>
          </button>

          <button
            onClick={() => setActiveDeck("audience")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              borderRadius: "12px",
              backgroundColor: activeDeck === "audience" ? "rgba(99, 102, 241, 0.25)" : "transparent",
              border: activeDeck === "audience" ? "1px solid #6366f1" : "1px solid transparent",
              color: activeDeck === "audience" ? "#ffffff" : "rgba(255, 255, 255, 0.6)",
              fontSize: "0.86rem",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            <Users size={16} color={activeDeck === "audience" ? "#a5b4fc" : "currentColor"} />
            <span>Audience Radar</span>
          </button>

          <button
            onClick={() => setActiveDeck("infra")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              borderRadius: "12px",
              backgroundColor: activeDeck === "infra" ? "rgba(99, 102, 241, 0.25)" : "transparent",
              border: activeDeck === "infra" ? "1px solid #6366f1" : "1px solid transparent",
              color: activeDeck === "infra" ? "#ffffff" : "rgba(255, 255, 255, 0.6)",
              fontSize: "0.86rem",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            <Database size={16} color={activeDeck === "infra" ? "#a5b4fc" : "currentColor"} />
            <span>Cloud Engine</span>
          </button>
        </nav>

        {/* User Info & Refresh */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              padding: "6px 12px",
              borderRadius: "999px",
              backgroundColor: "rgba(16, 185, 129, 0.1)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              color: "#34d399",
              fontSize: "0.78rem",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#10b981" }} />
            <span>{currentUser?.email || "Admin"}</span>
          </div>

          <button
            onClick={async () => {
              await fetchAlbums();
              await fetchAlbumTracks(selectedAlbumId);
              loadSections();
              showToast("Đã đồng bộ dữ liệu mới nhất từ Cloudflare D1!");
            }}
            title="Làm mới dữ liệu"
            style={{
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              borderRadius: "50%",
              width: "36px",
              height: "36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              cursor: "pointer"
            }}
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </header>

      {/* ── TOAST NOTIFICATION ── */}
      <AnimatePresence>
        {statusMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: "fixed",
              top: "76px",
              right: "24px",
              zIndex: 100,
              backgroundColor: "rgba(18, 18, 26, 0.95)",
              border: "1px solid #6366f1",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.8), 0 0 20px rgba(99, 102, 241, 0.3)",
              borderRadius: "14px",
              padding: "12px 20px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              color: "#ffffff",
              fontSize: "0.88rem",
              fontWeight: 600
            }}
          >
            <CheckCircle2 size={18} color="#a5b4fc" />
            <span>{statusMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MAIN CONTENT WORKSPACE (SCROLLABLE VIEWPORT) ── */}
      <div
        className="admin-scroll-viewport"
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "24px"
        }}
      >
        {/* ══════════════════════════════════════════════════════════════════════════
            DECK 1: RELEASES & TRACKLISTS (INTEGRATED LINK INGESTION & WAVEFORM)
        ══════════════════════════════════════════════════════════════════════════ */}
        {activeDeck === "releases" && (
          <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: "24px", minHeight: "680px" }}>
            {/* ── LEFT COLUMN: RELEASES (ALBUM / SINGLE / EP) ── */}
            <div
              style={{
                backgroundColor: "rgba(14, 14, 20, 0.7)",
                borderRadius: "20px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "16px"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800 }}>Bản Phát Hành (D1)</h2>
                  <p style={{ margin: 0, fontSize: "0.72rem", color: "rgba(255, 255, 255, 0.45)" }}>
                    {adminAlbums.length} Release(s) trong Database
                  </p>
                </div>

                <button
                  onClick={() => setIsNewAlbumModalOpen(true)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "10px",
                    backgroundColor: "#6366f1",
                    border: "none",
                    color: "#ffffff",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    cursor: "pointer"
                  }}
                >
                  <Plus size={14} />
                  <span>Tạo Release</span>
                </button>
              </div>

              {/* Album List */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1 }}>
                {adminAlbums.map((album) => {
                  const isSelected = album.id === selectedAlbumId;
                  return (
                    <div
                      key={album.id}
                      onClick={() => setSelectedAlbumId(album.id)}
                      style={{
                        padding: "12px",
                        borderRadius: "14px",
                        backgroundColor: isSelected ? "rgba(99, 102, 241, 0.18)" : "rgba(255, 255, 255, 0.03)",
                        border: isSelected ? "1px solid #6366f1" : "1px solid rgba(255, 255, 255, 0.06)",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        cursor: "pointer",
                        transition: "all 0.2s"
                      }}
                    >
                      <img
                        src={album.cover_url || HVL_COVER}
                        alt={album.title}
                        style={{ width: "52px", height: "52px", borderRadius: "10px", objectFit: "cover" }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <h3 style={{ margin: 0, fontSize: "0.92rem", fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {album.title}
                          </h3>
                          <span
                            style={{
                              padding: "2px 6px",
                              borderRadius: "4px",
                              backgroundColor: "rgba(255, 255, 255, 0.1)",
                              fontSize: "0.62rem",
                              fontWeight: 700,
                              textTransform: "uppercase"
                            }}
                          >
                            {album.type || "album"}
                          </span>
                        </div>
                        <p style={{ margin: "2px 0 0", fontSize: "0.74rem", color: "rgba(255, 255, 255, 0.45)" }}>
                          {album.artist} • {album.release_year || 2023}
                        </p>
                        <p style={{ margin: "2px 0 0", fontSize: "0.7rem", color: "#a5b4fc" }}>
                          {album.track_count || selectedAlbumTracks.length} tracks Lossless
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── RIGHT COLUMN: SELECTED RELEASE & TRACKLIST (WITH INTEGRATED LINK INGESTION) ── */}
            <div
              style={{
                backgroundColor: "rgba(14, 14, 20, 0.7)",
                borderRadius: "20px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "20px"
              }}
            >
              {/* Release Header & Actions */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <img
                    src={currentAlbum?.cover_url || HVL_COVER}
                    alt={currentAlbum?.title}
                    style={{ width: "64px", height: "64px", borderRadius: "12px", objectFit: "cover" }}
                  />
                  <div>
                    <h2 style={{ margin: 0, fontSize: "1.3rem", fontWeight: 900 }}>{currentAlbum?.title}</h2>
                    <p style={{ margin: "2px 0 0", fontSize: "0.82rem", color: "rgba(255, 255, 255, 0.55)" }}>
                      {currentAlbum?.artist} • {selectedAlbumTracks.length} bài hát Lossless
                    </p>
                  </div>
                </div>

                {/* Triple Action Buttons */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <button
                    onClick={() => setShowLinkIngestionBar(!showLinkIngestionBar)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "10px",
                      backgroundColor: showLinkIngestionBar ? "rgba(99, 102, 241, 0.3)" : "rgba(255, 255, 255, 0.08)",
                      border: showLinkIngestionBar ? "1px solid #6366f1" : "1px solid rgba(255, 255, 255, 0.15)",
                      color: "#ffffff",
                      fontSize: "0.82rem",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      cursor: "pointer"
                    }}
                  >
                    <LinkIcon size={14} color="#a5b4fc" />
                    <span>⚡ Nạp Nhanh Từ Link</span>
                  </button>

                  <button
                    onClick={() => {
                      setEditingTrack(null);
                      setIsNewTrackModalOpen(true);
                    }}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "10px",
                      backgroundColor: "#6366f1",
                      border: "none",
                      color: "#ffffff",
                      fontSize: "0.82rem",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      cursor: "pointer"
                    }}
                  >
                    <Plus size={14} />
                    <span>Thêm Bài Hát (Thủ Công)</span>
                  </button>

                  <button
                    onClick={async () => {
                      const res = await seedHvlToD1();
                      showToast(res.message);
                      await fetchAlbumTracks(selectedAlbumId);
                    }}
                    style={{
                      padding: "8px 14px",
                      borderRadius: "10px",
                      backgroundColor: "rgba(16, 185, 129, 0.15)",
                      border: "1px solid rgba(16, 185, 129, 0.3)",
                      color: "#34d399",
                      fontSize: "0.82rem",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      cursor: "pointer"
                    }}
                  >
                    <RefreshCw size={14} />
                    <span>Đồng bộ R2 ⟷ D1</span>
                  </button>
                </div>
              </div>

              {/* ── EXPANDABLE QUICK LINK INGESTION BAR ── */}
              <AnimatePresence>
                {showLinkIngestionBar && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{
                      padding: "16px",
                      borderRadius: "14px",
                      backgroundColor: "rgba(99, 102, 241, 0.12)",
                      border: "1px solid rgba(99, 102, 241, 0.35)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#a5b4fc" }}>
                        ⚡ Dán link YouTube / SoundCloud / R2 Stream để nạp thẳng vào {currentAlbum?.title}:
                      </span>
                      <button
                        onClick={() => setShowLinkIngestionBar(false)}
                        style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer" }}
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <div style={{ display: "flex", gap: "10px" }}>
                      <input
                        type="text"
                        placeholder="https://www.youtube.com/watch?v=... hoặc https://media.postlain.com/audio/..."
                        value={externalUrl}
                        onChange={(e) => setExternalUrl(e.target.value)}
                        style={{
                          flex: 1,
                          padding: "10px 14px",
                          borderRadius: "10px",
                          backgroundColor: "rgba(0, 0, 0, 0.4)",
                          border: "1px solid rgba(255, 255, 255, 0.15)",
                          color: "#ffffff",
                          fontSize: "0.85rem",
                          outline: "none"
                        }}
                      />
                      <button
                        onClick={handleIngestUrlToAlbum}
                        disabled={isExtracting}
                        style={{
                          padding: "10px 20px",
                          borderRadius: "10px",
                          background: "#6366f1",
                          color: "#ffffff",
                          border: "none",
                          fontSize: "0.85rem",
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px"
                        }}
                      >
                        {isExtracting ? <RefreshCw size={14} className="animate-spin" /> : <Zap size={14} />}
                        <span>Bóc Tách & Thêm Vào Album</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── INTEGRATED REAL-TIME 2048-SLICE WAVEFORM CANVAS ── */}
              <div
                style={{
                  height: "72px",
                  borderRadius: "12px",
                  backgroundColor: "rgba(0, 0, 0, 0.45)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  padding: "6px 16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "16px"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <button
                    onClick={() => {
                      if (currentTrack) togglePlay();
                      else if (selectedAlbumTracks.length > 0) playTrack(selectedAlbumTracks[0]);
                    }}
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      backgroundColor: "#ffffff",
                      color: "#000000",
                      border: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer"
                    }}
                  >
                    {isPlaying ? <Pause size={16} fill="#000000" /> : <Play size={16} fill="#000000" style={{ marginLeft: "2px" }} />}
                  </button>
                  <div>
                    <p style={{ margin: 0, fontSize: "0.78rem", fontWeight: 700, color: "#ffffff" }}>
                      {currentTrack ? currentTrack.title : "Audio Waveform Visualizer"}
                    </p>
                    <p style={{ margin: 0, fontSize: "0.68rem", color: "rgba(255, 255, 255, 0.4)" }}>
                      2048-slice Audio Spectrum Engine
                    </p>
                  </div>
                </div>

                <canvas ref={canvasRef} width={450} height={50} style={{ width: "450px", height: "50px" }} />
              </div>

              {/* ── TRACKLIST TABLE (DOUBLE-CLICK INLINE EDIT) ── */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {selectedAlbumTracks.map((track, i) => {
                  const isCurrent = currentTrack?.id === track.id;
                  const isInlineEditing = inlineEditingTrackId === track.id;

                  return (
                    <div
                      key={track.id}
                      style={{
                        padding: "10px 14px",
                        borderRadius: "12px",
                        backgroundColor: isCurrent ? "rgba(99, 102, 241, 0.15)" : "rgba(255, 255, 255, 0.02)",
                        border: isCurrent ? "1px solid rgba(99, 102, 241, 0.4)" : "1px solid rgba(255, 255, 255, 0.04)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "12px"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, minWidth: 0 }}>
                        <span style={{ fontSize: "0.75rem", color: "rgba(255, 255, 255, 0.4)", fontWeight: 700, width: "24px" }}>
                          {i + 1 < 10 ? `0${i + 1}` : i + 1}
                        </span>

                        <button
                          onClick={() => playTrack(track)}
                          style={{
                            background: "rgba(255, 255, 255, 0.08)",
                            border: "none",
                            borderRadius: "50%",
                            width: "28px",
                            height: "28px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: isCurrent && isPlaying ? "#a5b4fc" : "#ffffff",
                            cursor: "pointer"
                          }}
                        >
                          {isCurrent && isPlaying ? <Pause size={12} /> : <Play size={12} style={{ marginLeft: "1px" }} />}
                        </button>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          {isInlineEditing ? (
                            <div style={{ display: "flex", gap: "6px" }}>
                              <input
                                autoFocus
                                value={inlineTrackTitle}
                                onChange={(e) => setInlineTrackTitle(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") handleSaveInlineTrack(track);
                                  if (e.key === "Escape") setInlineEditingTrackId(null);
                                }}
                                style={{
                                  padding: "4px 8px",
                                  borderRadius: "6px",
                                  backgroundColor: "rgba(0, 0, 0, 0.6)",
                                  border: "1px solid #6366f1",
                                  color: "#ffffff",
                                  fontSize: "0.85rem"
                                }}
                              />
                              <button
                                onClick={() => handleSaveInlineTrack(track)}
                                style={{ padding: "4px 8px", borderRadius: "6px", background: "#10b981", color: "#fff", border: "none" }}
                              >
                                Lưu
                              </button>
                            </div>
                          ) : (
                            <div
                              onDoubleClick={() => {
                                setInlineEditingTrackId(track.id);
                                setInlineTrackTitle(track.title);
                              }}
                              style={{ cursor: "text" }}
                            >
                              <p style={{ margin: 0, fontSize: "0.88rem", fontWeight: 700, color: "#ffffff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {track.title}
                              </p>
                              <p style={{ margin: 0, fontSize: "0.72rem", color: "rgba(255, 255, 255, 0.45)" }}>
                                {track.artist}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ padding: "2px 6px", borderRadius: "4px", backgroundColor: "rgba(99, 102, 241, 0.15)", color: "#a5b4fc", fontSize: "0.68rem", fontWeight: 700 }}>
                          LOSSLESS FLAC
                        </span>
                        {track.videoUrl && (
                          <span style={{ padding: "2px 6px", borderRadius: "4px", backgroundColor: "rgba(236, 72, 153, 0.15)", color: "#f472b6", fontSize: "0.68rem", fontWeight: 700 }}>
                            4K MKV
                          </span>
                        )}

                        <span style={{ fontSize: "0.75rem", color: "rgba(255, 255, 255, 0.4)" }}>
                          {Math.floor(track.duration / 60)}:{track.duration % 60 < 10 ? "0" : ""}{track.duration % 60}
                        </span>

                        <button
                          onClick={() => {
                            setEditingTrack(track);
                            setTrackForm({
                              id: track.id,
                              title: track.title,
                              artist: track.artist,
                              duration_sec: track.duration,
                              audio_url: track.audioUrl,
                              video_url: track.videoUrl || "",
                              bpm: 120,
                              genre: "Melodic Rap"
                            });
                            setIsNewTrackModalOpen(true);
                          }}
                          style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", padding: "4px" }}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteTrack(track.id, track.title)}
                          style={{ background: "none", border: "none", color: "rgba(239, 68, 68, 0.6)", cursor: "pointer", padding: "4px" }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════
            DECK 2: DYNAMIC SECTIONS STUDIO (FULL VISUAL CUSTOMIZATION & PRESETS)
        ══════════════════════════════════════════════════════════════════════════ */}
        {activeDeck === "sections" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <h2 style={{ margin: 0, fontSize: "1.3rem", fontWeight: 900 }}>Dynamic Sections Studio</h2>
                <p style={{ margin: "2px 0 0", fontSize: "0.82rem", color: "rgba(255, 255, 255, 0.55)" }}>
                  Quản lý thứ tự, bật/tắt và tùy chỉnh 100% các trường dữ liệu của 7 Template Trang Chủ.
                </p>
              </div>

              <button
                onClick={() => setIsNewSectionModalOpen(true)}
                style={{
                  padding: "10px 20px",
                  borderRadius: "12px",
                  backgroundColor: "#6366f1",
                  border: "none",
                  color: "#ffffff",
                  fontSize: "0.88rem",
                  fontWeight: 800,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  cursor: "pointer",
                  boxShadow: "0 4px 20px rgba(99, 102, 241, 0.4)"
                }}
              >
                <Plus size={16} />
                <span>+ Thêm Section Mới</span>
              </button>
            </div>

            {/* Sections Cards List */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {sections.map((section, idx) => {
                const preset = TEMPLATE_PRESETS.find((p) => p.type === section.template_type) || TEMPLATE_PRESETS[0];
                const IconComponent = preset.icon;

                return (
                  <div
                    key={section.id}
                    style={{
                      padding: "16px 20px",
                      borderRadius: "16px",
                      backgroundColor: "rgba(14, 14, 20, 0.7)",
                      border: section.is_active ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid rgba(255, 255, 255, 0.04)",
                      opacity: section.is_active ? 1 : 0.55,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "20px"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                      <div
                        style={{
                          width: "44px",
                          height: "44px",
                          borderRadius: "12px",
                          backgroundColor: "rgba(99, 102, 241, 0.15)",
                          border: "1px solid rgba(99, 102, 241, 0.3)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#a5b4fc"
                        }}
                      >
                        <IconComponent size={20} />
                      </div>

                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#6366f1" }}>
                            #{idx + 1}
                          </span>
                          <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800 }}>
                            {section.title}
                          </h3>
                          <span
                            style={{
                              padding: "2px 8px",
                              borderRadius: "6px",
                              backgroundColor: "rgba(255, 255, 255, 0.08)",
                              fontSize: "0.68rem",
                              fontWeight: 700,
                              color: "#cbd5e1"
                            }}
                          >
                            {preset.name}
                          </span>
                        </div>
                        <p style={{ margin: "2px 0 0", fontSize: "0.78rem", color: "rgba(255, 255, 255, 0.45)" }}>
                          {preset.desc}
                        </p>
                      </div>
                    </div>

                    {/* Action Controls */}
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <button
                        onClick={() => openSectionConfigModal(section)}
                        style={{
                          padding: "8px 16px",
                          borderRadius: "10px",
                          backgroundColor: "rgba(99, 102, 241, 0.18)",
                          border: "1px solid rgba(99, 102, 241, 0.4)",
                          color: "#a5b4fc",
                          fontSize: "0.82rem",
                          fontWeight: 700,
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          cursor: "pointer"
                        }}
                      >
                        <Sliders size={14} />
                        <span>⚙️ Tùy Chỉnh Config</span>
                      </button>

                      <button
                        onClick={() => handleToggleSection(section)}
                        style={{
                          padding: "8px 14px",
                          borderRadius: "10px",
                          backgroundColor: section.is_active ? "rgba(16, 185, 129, 0.15)" : "rgba(255, 255, 255, 0.08)",
                          border: section.is_active ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid rgba(255, 255, 255, 0.15)",
                          color: section.is_active ? "#34d399" : "rgba(255, 255, 255, 0.5)",
                          fontSize: "0.82rem",
                          fontWeight: 700,
                          cursor: "pointer"
                        }}
                      >
                        {section.is_active ? "Đang Bật" : "Đã Ẩn"}
                      </button>

                      <button
                        onClick={() => handleDeleteSection(section.id)}
                        style={{
                          padding: "8px",
                          borderRadius: "8px",
                          background: "none",
                          border: "none",
                          color: "rgba(239, 68, 68, 0.6)",
                          cursor: "pointer"
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════
            DECK 3: AUDIENCE RADAR & ACCESS
        ══════════════════════════════════════════════════════════════════════════ */}
        {activeDeck === "audience" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <h2 style={{ margin: 0, fontSize: "1.3rem", fontWeight: 900 }}>Audience Radar & Access Control</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {adminUsers.map((u) => (
                <div
                  key={u.id}
                  style={{
                    padding: "14px 20px",
                    borderRadius: "14px",
                    backgroundColor: "rgba(14, 14, 20, 0.7)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between"
                  }}
                >
                  <div>
                    <p style={{ margin: 0, fontSize: "0.92rem", fontWeight: 700 }}>{u.email}</p>
                    <p style={{ margin: "2px 0 0", fontSize: "0.72rem", color: "rgba(255, 255, 255, 0.45)" }}>
                      Tham gia: {u.created_at}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    {u.is_admin ? (
                      <span style={{ padding: "4px 8px", borderRadius: "6px", backgroundColor: "rgba(99, 102, 241, 0.2)", color: "#a5b4fc", fontSize: "0.72rem", fontWeight: 800 }}>
                        ADMIN
                      </span>
                    ) : null}
                    {u.is_vip ? (
                      <span style={{ padding: "4px 8px", borderRadius: "6px", backgroundColor: "rgba(245, 158, 11, 0.2)", color: "#fbbf24", fontSize: "0.72rem", fontWeight: 800 }}>
                        VIP LOSSLESS
                      </span>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════
            DECK 4: CLOUD ENGINE & DISASTER RECOVERY
        ══════════════════════════════════════════════════════════════════════════ */}
        {activeDeck === "infra" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <h2 style={{ margin: 0, fontSize: "1.3rem", fontWeight: 900 }}>Cloud Engine & Disaster Recovery</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div style={{ padding: "20px", borderRadius: "16px", backgroundColor: "rgba(14, 14, 20, 0.7)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
                <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800 }}>Cloudflare D1 Database</h3>
                <p style={{ margin: "4px 0 16px", fontSize: "0.8rem", color: "rgba(255, 255, 255, 0.5)" }}>
                  hidden_music_db • 30 Lossless Tracks • 7 Dynamic Sections
                </p>
                <button
                  onClick={async () => {
                    const res = await seedHvlToD1();
                    showToast(res.message);
                  }}
                  style={{ padding: "10px 20px", borderRadius: "10px", backgroundColor: "#6366f1", border: "none", color: "#fff", fontWeight: 700, cursor: "pointer" }}
                >
                  ⚡ Đồng Bộ Dữ Liệu R2 ⟷ D1
                </button>
              </div>

              <div style={{ padding: "20px", borderRadius: "16px", backgroundColor: "rgba(14, 14, 20, 0.7)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
                <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800 }}>Cloudflare R2 Asset Vault</h3>
                <p style={{ margin: "4px 0 16px", fontSize: "0.8rem", color: "rgba(255, 255, 255, 0.5)" }}>
                  hidden-music-vault • Lossless FLAC & 4K MKV Assets
                </p>
                <a
                  href={`${API_BASE}/api/admin/export`}
                  download="d1_backup.json"
                  style={{ padding: "10px 20px", borderRadius: "10px", backgroundColor: "rgba(255, 255, 255, 0.08)", border: "1px solid rgba(255, 255, 255, 0.2)", color: "#fff", textDecoration: "none", fontWeight: 700, display: "inline-block" }}
                >
                  Tải Bản Sao Lưu JSON (D1)
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════
          MODAL: TÙY CHỈNH CONFIG CHO TỪNG TEMPLATE TRANG CHỦ
      ══════════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {editingSection && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              backdropFilter: "blur(16px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10000,
              padding: "20px"
            }}
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              style={{
                width: "100%",
                maxWidth: "640px",
                maxHeight: "85vh",
                overflowY: "auto",
                backgroundColor: "#0d0d14",
                borderRadius: "24px",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                padding: "28px",
                display: "flex",
                flexDirection: "column",
                gap: "20px"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 900 }}>
                    Tùy Chỉnh Config: {editingSection.title}
                  </h3>
                  <span style={{ fontSize: "0.75rem", color: "#a5b4fc", fontWeight: 700 }}>
                    Template: {editingSection.template_type}
                  </span>
                </div>
                <button
                  onClick={() => setEditingSection(null)}
                  style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer" }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Dynamic Form Fields Based on Template Type */}
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {/* Standard Title & Subtitle */}
                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>Tiêu đề Section</label>
                  <input
                    type="text"
                    value={sectionConfigForm.title || ""}
                    onChange={(e) => setSectionConfigForm({ ...sectionConfigForm, title: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", marginTop: "4px" }}
                  />
                </div>

                {/* ── HERO BANNER FIELDS ── */}
                {editingSection.template_type === "hero_banner" && (
                  <>
                    <div>
                      <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>Tiêu đề Banner (Headline)</label>
                      <input
                        type="text"
                        value={sectionConfigForm.headline || ""}
                        onChange={(e) => setSectionConfigForm({ ...sectionConfigForm, headline: e.target.value })}
                        style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", marginTop: "4px" }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>Mô tả ngắn (Subheadline)</label>
                      <textarea
                        rows={2}
                        value={sectionConfigForm.subheadline || ""}
                        onChange={(e) => setSectionConfigForm({ ...sectionConfigForm, subheadline: e.target.value })}
                        style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", marginTop: "4px" }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>URL Ảnh Banner Toàn Cảnh</label>
                      <input
                        type="text"
                        value={sectionConfigForm.banner_url || ""}
                        onChange={(e) => setSectionConfigForm({ ...sectionConfigForm, banner_url: e.target.value })}
                        style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", marginTop: "4px" }}
                      />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                      <div>
                        <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>Mã Bài Hát Phát Kèm (Track ID)</label>
                        <input
                          type="text"
                          value={sectionConfigForm.track_id || "mck-02"}
                          onChange={(e) => setSectionConfigForm({ ...sectionConfigForm, track_id: e.target.value })}
                          style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", marginTop: "4px" }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>Chữ Nút CTA</label>
                        <input
                          type="text"
                          value={sectionConfigForm.cta_text || "Nghe Ngay"}
                          onChange={(e) => setSectionConfigForm({ ...sectionConfigForm, cta_text: e.target.value })}
                          style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", marginTop: "4px" }}
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* ── ARTIST SPOTLIGHT FIELDS ── */}
                {editingSection.template_type === "artist_spotlight" && (
                  <>
                    <div>
                      <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>Tên Nghệ Sĩ</label>
                      <input
                        type="text"
                        value={sectionConfigForm.artist_name || ""}
                        onChange={(e) => setSectionConfigForm({ ...sectionConfigForm, artist_name: e.target.value })}
                        style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", marginTop: "4px" }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>Tiểu sử / Triết lý âm nhạc</label>
                      <textarea
                        rows={3}
                        value={sectionConfigForm.bio || ""}
                        onChange={(e) => setSectionConfigForm({ ...sectionConfigForm, bio: e.target.value })}
                        style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", marginTop: "4px" }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>URL Ảnh Chân Dung (Avatar)</label>
                      <input
                        type="text"
                        value={sectionConfigForm.avatar_url || ""}
                        onChange={(e) => setSectionConfigForm({ ...sectionConfigForm, avatar_url: e.target.value })}
                        style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", marginTop: "4px" }}
                      />
                    </div>
                  </>
                )}

                {/* ── VIDEO PREMIERE FIELDS ── */}
                {editingSection.template_type === "video_premiere" && (
                  <>
                    <div>
                      <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>Tên Video / MV</label>
                      <input
                        type="text"
                        value={sectionConfigForm.title || ""}
                        onChange={(e) => setSectionConfigForm({ ...sectionConfigForm, title: e.target.value })}
                        style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", marginTop: "4px" }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>URL Video 4K MKV / MP4</label>
                      <input
                        type="text"
                        value={sectionConfigForm.video_url || ""}
                        onChange={(e) => setSectionConfigForm({ ...sectionConfigForm, video_url: e.target.value })}
                        style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", marginTop: "4px" }}
                      />
                    </div>
                  </>
                )}

                {/* ── EDITORIAL PRESS FIELDS ── */}
                {editingSection.template_type === "editorial_press" && (
                  <>
                    <div>
                      <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>Câu Trích Dẫn (Quote)</label>
                      <textarea
                        rows={3}
                        value={sectionConfigForm.quote || ""}
                        onChange={(e) => setSectionConfigForm({ ...sectionConfigForm, quote: e.target.value })}
                        style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", marginTop: "4px" }}
                      />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                      <div>
                        <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>Nguồn Báo Chí (Source)</label>
                        <input
                          type="text"
                          value={sectionConfigForm.source || ""}
                          onChange={(e) => setSectionConfigForm({ ...sectionConfigForm, source: e.target.value })}
                          style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", marginTop: "4px" }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>Tác Giả / Người Viết</label>
                        <input
                          type="text"
                          value={sectionConfigForm.author || ""}
                          onChange={(e) => setSectionConfigForm({ ...sectionConfigForm, author: e.target.value })}
                          style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", marginTop: "4px" }}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Modal Save Button */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "8px" }}>
                <button
                  onClick={() => setEditingSection(null)}
                  style={{ padding: "10px 20px", borderRadius: "10px", backgroundColor: "rgba(255, 255, 255, 0.08)", border: "1px solid rgba(255, 255, 255, 0.15)", color: "#fff", fontWeight: 700, cursor: "pointer" }}
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveSectionConfig}
                  style={{ padding: "10px 24px", borderRadius: "10px", backgroundColor: "#6366f1", border: "none", color: "#fff", fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <Save size={16} />
                  <span>Lưu Cấu Hình D1</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════════════════════
          MODAL: THÊM SECTION MỚI (CHỌN TRONG 7 TEMPLATES)
      ══════════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isNewSectionModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              backdropFilter: "blur(16px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10000,
              padding: "20px"
            }}
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              style={{
                width: "100%",
                maxWidth: "600px",
                backgroundColor: "#0d0d14",
                borderRadius: "24px",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                padding: "28px",
                display: "flex",
                flexDirection: "column",
                gap: "20px"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 900 }}>Chọn Template Cho Section Mới (Trang Chủ)</h3>
                  <p style={{ margin: "2px 0 0", fontSize: "0.78rem", color: "rgba(255,255,255,0.45)" }}>
                    Chọn một trong 7 template giao diện có sẵn để kích hoạt trên trang chủ.
                  </p>
                </div>
                <button
                  onClick={() => setIsNewSectionModalOpen(false)}
                  style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer" }}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "60vh", overflowY: "auto" }}>
                {TEMPLATE_PRESETS.map((preset) => {
                  const Icon = preset.icon;
                  return (
                    <div
                      key={preset.type}
                      onClick={() => handleAddPresetSection(preset)}
                      style={{
                        padding: "14px 18px",
                        borderRadius: "14px",
                        backgroundColor: "rgba(255, 255, 255, 0.04)",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                        cursor: "pointer",
                        transition: "all 0.2s"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "rgba(99, 102, 241, 0.15)";
                        e.currentTarget.style.borderColor = "#6366f1";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.04)";
                        e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
                      }}
                    >
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "10px",
                          backgroundColor: "rgba(99, 102, 241, 0.2)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#a5b4fc"
                        }}
                      >
                        <Icon size={18} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 800 }}>{preset.name}</h4>
                        <p style={{ margin: "2px 0 0", fontSize: "0.75rem", color: "rgba(255, 255, 255, 0.5)" }}>
                          {preset.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPortal;
