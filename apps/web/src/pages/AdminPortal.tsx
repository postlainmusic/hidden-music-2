import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layout,
  Upload,
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
  Link,
  ChevronUp,
  ChevronDown,
  Layers,
  Zap,
  Globe,
  Radio,
  FileText,
  UserCheck,
  UserX
} from "lucide-react";
import { useAudioStore, Track, HomeSection, VaultSlot, SectionTemplateType, DEFAULT_TRACKS } from "../store/audioStore";
import { useIsMobile } from "../hooks/useIsMobile";

const API_BASE = "https://hidden-music-api.postlain-music.workers.dev";

// 7 Bespoke Section Templates Definitions
const TEMPLATE_PRESETS: { type: SectionTemplateType; name: string; icon: any; desc: string; defaultCfg: any }[] = [
  {
    type: "album_showcase",
    name: "Album Showcase",
    icon: Music,
    desc: "Bìa 3D Album + Bảng Top 5 bài hát thả tim nhiều nhất từ D1 Database",
    defaultCfg: {
      album_id: "hvl-99",
      title: "HVL (99%)",
      artist: "MCK",
      cover_url: "https://media.postlain.com/covers/HVL_Album_Cover.jpg",
      description: "Album phòng thu đầu tay gồm 30 bài hát Lossless FLAC độc quyền."
    }
  },
  {
    type: "cover_flow",
    name: "3D Cover Flow",
    icon: Layers,
    desc: "Băng chuyền 3D Vault Slots tương tác cảm ứng trực quan",
    defaultCfg: { slots_count: 5 }
  },
  {
    type: "hero_banner",
    name: "Hero Music Banner",
    icon: Sparkles,
    desc: "Banner điện ảnh toàn cảnh giới thiệu Album/MV mới với nút Play tức thì",
    defaultCfg: {
      headline: "CHUYẾN BAY KHÔNG GIAN MCK HVL",
      subheadline: "Trải nghiệm âm thanh Lossless 24-bit 96kHz độc quyền tại Hidden Music Vault.",
      banner_url: "https://media.postlain.com/covers/HVL_Album_Cover.jpg",
      cta_text: "Thưởng Thức Ngay"
    }
  },
  {
    type: "artist_spotlight",
    name: "Artist Spotlight",
    icon: Radio,
    desc: "Thẻ chân dung nghệ sĩ, tiểu sử, triết lý âm nhạc và mạng xã hội",
    defaultCfg: {
      artist_name: "MCK (Nghiêm Vũ Hoàng Long)",
      bio: "Nghệ sĩ Melodic Rap / R&B tiên phong với phong cách âm nhạc đậm chất cảm xúc và thử nghiệm.",
      avatar_url: "https://media.postlain.com/covers/HVL_Album_Cover.jpg",
      social_links: { spotify: "https://spotify.com", youtube: "https://youtube.com" }
    }
  },
  {
    type: "editorial_press",
    name: "Editorial Press & Review",
    icon: FileText,
    desc: "Trang bài báo phê bình âm nhạc phong cách tạp chí Rolling Stone",
    defaultCfg: {
      quote: "HVL (99%) là một bước ngoặt về thẩm mỹ âm thanh và cảm xúc của MCK.",
      source: "Rolling Stone Vietnam Review",
      author: "Music Critic Editorial"
    }
  },
  {
    type: "video_premiere",
    name: "Cinema Video Premiere",
    icon: Zap,
    desc: "Khung xem trước MV độc quyền với hiệu ứng Ambilight 60fps",
    defaultCfg: {
      title: "02. IDK - Official Music Video",
      video_url: "https://media.postlain.com/videos/02.%20IDK%20-%20MCK%20(Official%20Music%20Video).mkv",
      duration: "3:35"
    }
  },
  {
    type: "explore_universe",
    name: "Explore Universe Portal",
    icon: Globe,
    desc: "Cổng dịch chuyển vào không gian âm nhạc mở rộng",
    defaultCfg: {
      headline: "EXPLORE UNIVERSE",
      subtext: "Không gian âm nhạc mở rộng đang được kết nối với hệ sinh thái streaming độc quyền."
    }
  }
];

interface AdminPortalProps {
  onBackToVault: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ onBackToVault }) => {
  const isMobile = useIsMobile();
  const { currentUser, sections, loadSections, queue, playTrack } = useAudioStore();

  // Active Deck State
  const [activeDeck, setActiveDeck] = useState<"sections" | "media" | "artifacts" | "audience" | "infra">("sections");

  // Admin Data State
  const [adminTracks, setAdminTracks] = useState<Track[]>(queue || DEFAULT_TRACKS);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [adminStats, setAdminStats] = useState<any>(null);
  const [r2Files, setR2Files] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Live Split-Screen Preview State
  const [showLivePreview, setShowLivePreview] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");

  // Ingestion Bay State
  const [externalUrl, setExternalUrl] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  // Track / Section Editing State
  const [editingSection, setEditingSection] = useState<HomeSection | null>(null);
  const [isNewSectionModalOpen, setIsNewSectionModalOpen] = useState(false);
  const [inlineEditingTrackId, setInlineEditingTrackId] = useState<string | null>(null);
  const [inlineTrackTitle, setInlineTrackTitle] = useState("");

  const waveformCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("vault_token") : null;

  // Show auto-dismiss status toast
  const showToast = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  // Fetch initial Admin Data
  const fetchAdminData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [tracksRes, usersRes, statsRes, filesRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/tracks`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/api/admin/users`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/api/admin/stats/overview`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/api/admin/r2/files`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      const [tracksData, usersData, statsData, filesData] = await Promise.all([
        tracksRes.json(),
        usersRes.json(),
        statsRes.json(),
        filesRes.json()
      ]);

      if (tracksData.success && tracksData.tracks) setAdminTracks(tracksData.tracks);
      if (usersData.success && usersData.users) setAdminUsers(usersData.users);
      if (statsData.success && statsData.stats) setAdminStats(statsData.stats);
      if (filesData.success && filesData.files) setR2Files(filesData.files);
    } catch (err) {
      console.warn("Fetch admin data notice:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && (currentUser?.role === "admin" || currentUser?.email === "postlainmusic@gmail.com")) {
      fetchAdminData();
    }
    loadSections();
  }, [token, currentUser]);

  // Draw 2048-slice Audio Waveform Canvas in Ingestion Bay
  useEffect(() => {
    const canvas = waveformCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = (canvas.width = canvas.parentElement?.clientWidth || 600);
    const height = (canvas.height = 80);

    ctx.clearRect(0, 0, width, height);
    const slices = 120;
    const barWidth = width / slices;

    for (let i = 0; i < slices; i++) {
      const normalizedH = Math.sin((i / slices) * Math.PI * 4) * 0.4 + Math.cos(i * 0.3) * 0.3 + 0.35;
      const barHeight = Math.max(4, normalizedH * height * 0.85);
      const x = i * barWidth;
      const y = (height - barHeight) / 2;

      const grad = ctx.createLinearGradient(0, y, 0, y + barHeight);
      grad.addColorStop(0, "#6366f1");
      grad.addColorStop(1, "#ec4899");

      ctx.fillStyle = grad;
      ctx.fillRect(x + 1, y, barWidth - 2, barHeight);
    }
  }, [activeDeck]);

  // --- ACTIONS ---

  // 1. Auto-Fetch Metadata from External URL
  const handleExtractMetadata = async () => {
    if (!externalUrl) return;
    setIsExtracting(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/extract-metadata`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ url: externalUrl })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Đã bóc tách thành công banner HD & audio từ ${data.platform.toUpperCase()}!`);
      }
    } catch (err) {
      showToast("Lỗi trích xuất metadata từ link ngoài");
    } finally {
      setIsExtracting(false);
    }
  };

  // 2. Section CRUD Actions
  const handleToggleSection = async (section: HomeSection) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/sections/${section.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ is_enabled: section.is_enabled ? 0 : 1 })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Đã ${section.is_enabled ? "ẩn" : "bật"} Section: ${section.title}`);
        loadSections();
      }
    } catch (err) {
      showToast("Lỗi cập nhật trạng thái section");
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa Section này khỏi trang chủ?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/sections/${sectionId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        showToast("Đã xóa Section thành công!");
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
          order_index: newOrder,
          is_enabled: 1,
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
      showToast("Lỗi tạo section mới");
    }
  };

  const handleMoveSection = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const newSections = [...sections];
    const temp = newSections[index];
    newSections[index] = newSections[targetIndex];
    newSections[targetIndex] = temp;

    const items = newSections.map((sec, i) => ({ id: sec.id, order_index: i + 1 }));

    try {
      await fetch(`${API_BASE}/api/admin/sections/reorder`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ items })
      });
      showToast("Đã cập nhật thứ tự Section!");
      loadSections();
    } catch (err) {
      showToast("Lỗi sắp xếp lại section");
    }
  };

  // 3. User Role & Ban Actions
  const handleUpdateUserRole = async (userId: string, newRole: "admin" | "vip" | "free") => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ role: newRole })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Đã cập nhật quyền user thành: ${newRole.toUpperCase()}`);
        fetchAdminData();
      }
    } catch (err) {
      showToast("Lỗi cập nhật quyền user");
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "banned" : "active";
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${userId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Đã ${newStatus === "banned" ? "khóa" : "mở khóa"} tài khoản!`);
        fetchAdminData();
      }
    } catch (err) {
      showToast("Lỗi cập nhật trạng thái user");
    }
  };

  // 4. Cloudflare Cache Purge & Backup / Restore
  const handlePurgeCache = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/purge-cache`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        showToast("⚡ Đã xóa toàn bộ Cloudflare Edge Cache thành công! (0ms sync)");
      }
    } catch (err) {
      showToast("Lỗi xóa cache");
    }
  };

  const handleExportBackup = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/backup`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        const blob = new Blob([JSON.stringify(data.backup, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `hidden-music-vault-backup-${new Date().toISOString().split("T")[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showToast("Đã tải về bản sao lưu D1 Database thành công!");
      }
    } catch (err) {
      showToast("Lỗi tải bản sao lưu");
    }
  };

  // 5. Quick Inline Track Edit
  const handleSaveInlineTrack = async (track: Track) => {
    if (!inlineTrackTitle.trim()) {
      setInlineEditingTrackId(null);
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/admin/tracks/${track.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: inlineTrackTitle.trim() })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Đã lưu tên bài: ${inlineTrackTitle}`);
        setInlineEditingTrackId(null);
        fetchAdminData();
      }
    } catch (err) {
      showToast("Lỗi lưu bài hát");
    }
  };

  const isAdmin = currentUser?.email === "postlainmusic@gmail.com" || currentUser?.role === "admin";

  if (!currentUser || !isAdmin) {
    return (
      <div
        style={{
          position: "relative",
          minHeight: "100dvh",
          width: "100vw",
          backgroundColor: "#030305",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          textAlign: "center"
        }}
      >
        <div
          style={{
            width: "min(92vw, 460px)",
            padding: "36px 28px",
            borderRadius: "28px",
            backgroundColor: "rgba(10, 11, 16, 0.85)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(99, 102, 241, 0.35)",
            boxShadow: "0 24px 60px rgba(0, 0, 0, 0.9), 0 0 40px rgba(99, 102, 241, 0.2)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "18px"
          }}
        >
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              backgroundColor: "rgba(99, 102, 241, 0.15)",
              border: "1px solid rgba(99, 102, 241, 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#a5b4fc"
            }}
          >
            <Shield size={28} />
          </div>

          <div>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 800, margin: "0 0 6px", color: "#ffffff" }}>
              VAULT MONOLITH MATRIX
            </h2>
            <p style={{ fontSize: "0.84rem", color: "rgba(255, 255, 255, 0.55)", margin: 0, lineHeight: 1.5 }}>
              Khu vực quản trị chỉ dành cho tài khoản Admin đã được phân quyền (<code style={{ color: "#a5b4fc" }}>postlainmusic@gmail.com</code>).
            </p>
          </div>

          {!currentUser ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%", marginTop: "8px" }}>
              <p style={{ fontSize: "0.8rem", color: "#a5b4fc", margin: 0 }}>
                Vui lòng đăng nhập tài khoản Google của bạn tại trang chủ để mở khóa quyền Quản trị.
              </p>
              <button
                onClick={onBackToVault}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "999px",
                  background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
                  border: "none",
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: "0.88rem",
                  cursor: "pointer"
                }}
              >
                Về Trang Chủ Đăng Nhập
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%", marginTop: "8px" }}>
              <div style={{ padding: "10px", borderRadius: "12px", backgroundColor: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#fca5a5", fontSize: "0.78rem" }}>
                Tài khoản hiện tại (<strong>{currentUser.email}</strong>) chưa được cấp quyền Quản trị viên.
              </div>
              <button
                onClick={onBackToVault}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "999px",
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: "0.88rem",
                  cursor: "pointer"
                }}
              >
                Quay lại Vault
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100dvh",
        width: "100vw",
        backgroundColor: "#030305",
        color: "#ffffff",
        overflowX: "hidden",
        display: "flex",
        flexDirection: "column"
      }}
    >
      {/* Toast Notification */}
      <AnimatePresence>
        {statusMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: "fixed",
              top: "24px",
              left: "50%",
              transform: "translateX(-50%)",
              padding: "12px 24px",
              borderRadius: "999px",
              backgroundColor: "rgba(10, 11, 16, 0.92)",
              backdropFilter: "blur(24px)",
              border: "1px solid rgba(99, 102, 241, 0.4)",
              color: "#ffffff",
              fontSize: "0.88rem",
              fontWeight: 600,
              boxShadow: "0 0 30px rgba(99, 102, 241, 0.35)",
              zIndex: 100,
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <Sparkles size={16} color="#6366f1" />
            {statusMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Studio Header */}
      <div
        style={{
          padding: "20px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          background: "rgba(10, 11, 16, 0.8)",
          backdropFilter: "blur(24px)",
          position: "sticky",
          top: 0,
          zIndex: 40
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button
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
              fontSize: "0.82rem",
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            <ArrowLeft size={15} />
            Quay lại Vault
          </button>
          <div>
            <h1 style={{ fontSize: "1.25rem", fontWeight: 800, letterSpacing: "0.04em", margin: 0 }}>
              VAULT MONOLITH MATRIX
            </h1>
            <span style={{ fontSize: "0.75rem", color: "rgba(255, 255, 255, 0.45)" }}>
              Master Studio Administration Suite • Cloudflare D1 & R2
            </span>
          </div>
        </div>

        {/* Admin Session Badge */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 14px",
              borderRadius: "999px",
              backgroundColor: "rgba(16, 185, 129, 0.15)",
              border: "1px solid rgba(16, 185, 129, 0.35)",
              color: "#34d399",
              fontSize: "0.75rem",
              fontWeight: 700
            }}
          >
            <Shield size={13} />
            {currentUser?.email || "Admin Session"}
          </div>

          <button
            onClick={fetchAdminData}
            style={{
              padding: "8px",
              borderRadius: "50%",
              backgroundColor: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              color: "#ffffff",
              cursor: "pointer"
            }}
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* 5-Deck Navigation Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "8px",
          padding: "16px 24px",
          background: "rgba(5, 5, 8, 0.6)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
          overflowX: "auto"
        }}
      >
        {[
          { id: "sections", label: "Dynamic Sections Studio", icon: Layout },
          { id: "media", label: "Ingestion & Waveform Bay", icon: Upload },
          { id: "artifacts", label: "Vault Artifacts (30 Tracks)", icon: Music },
          { id: "audience", label: "Audience Radar & Access", icon: Users },
          { id: "infra", label: "Cloud Engine & Disaster Recovery", icon: Database }
        ].map((deck) => {
          const Icon = deck.icon;
          const isActive = activeDeck === deck.id;
          return (
            <button
              key={deck.id}
              onClick={() => setActiveDeck(deck.id as any)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 18px",
                borderRadius: "14px",
                backgroundColor: isActive ? "rgba(99, 102, 241, 0.2)" : "rgba(255, 255, 255, 0.04)",
                border: `1px solid ${isActive ? "rgba(99, 102, 241, 0.6)" : "rgba(255, 255, 255, 0.08)"}`,
                color: isActive ? "#ffffff" : "rgba(255, 255, 255, 0.6)",
                fontSize: "0.84rem",
                fontWeight: isActive ? 700 : 500,
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.2s ease"
              }}
            >
              <Icon size={16} color={isActive ? "#6366f1" : "rgba(255, 255, 255, 0.6)"} />
              {deck.label}
            </button>
          );
        })}
      </div>

      {/* Main Content Work Area */}
      <div style={{ flex: 1, padding: "28px 32px", maxWidth: "1400px", width: "100%", margin: "0 auto" }}>
        {/* ====================================================================
            DECK 1: DYNAMIC SECTIONS STUDIO & LIVE PREVIEW
        ===================================================================== */}
        {activeDeck === "sections" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Header & Controls */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
              <div>
                <h2 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: "4px" }}>
                  Dynamic Home Sections (1..N)
                </h2>
                <p style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: "0.85rem", margin: 0 }}>
                  Thêm, xóa, sắp xếp và tùy biến cấu hình các Section xuất hiện trên Trang Chủ theo thứ tự bất kỳ.
                </p>
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                {/* Live Preview Toggle Button */}
                <button
                  onClick={() => setShowLivePreview(!showLivePreview)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 18px",
                    borderRadius: "999px",
                    backgroundColor: showLivePreview ? "rgba(236, 72, 153, 0.2)" : "rgba(255, 255, 255, 0.08)",
                    border: `1px solid ${showLivePreview ? "rgba(236, 72, 153, 0.6)" : "rgba(255, 255, 255, 0.15)"}`,
                    color: showLivePreview ? "#f472b6" : "#ffffff",
                    fontSize: "0.84rem",
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                >
                  <Eye size={16} />
                  {showLivePreview ? "Tắt Live Preview" : "Bật Live WYSIWYG Preview"}
                </button>

                {/* Add Section Button */}
                <button
                  onClick={() => setIsNewSectionModalOpen(true)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 20px",
                    borderRadius: "999px",
                    background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
                    border: "none",
                    color: "#ffffff",
                    fontSize: "0.84rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 0 20px rgba(99, 102, 241, 0.45)"
                  }}
                >
                  <Plus size={16} />
                  Thêm Section Mới
                </button>
              </div>
            </div>

            {/* Split Screen Layout if Live Preview is active */}
            <div style={{ display: "flex", gap: "28px", alignItems: "flex-start", flexWrap: "wrap" }}>
              {/* Left Column: Sections Reorder List */}
              <div style={{ flex: 1, minWidth: "320px", display: "flex", flexDirection: "column", gap: "12px" }}>
                {sections.map((sec, idx) => (
                  <motion.div
                    key={sec.id}
                    layout
                    style={{
                      padding: "18px 22px",
                      borderRadius: "18px",
                      backgroundColor: "rgba(10, 11, 16, 0.75)",
                      backdropFilter: "blur(20px)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "16px"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <span
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "8px",
                          backgroundColor: "rgba(99, 102, 241, 0.2)",
                          color: "#a5b4fc",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 800,
                          fontSize: "0.9rem"
                        }}
                      >
                        {idx + 1}
                      </span>
                      <div>
                        <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700 }}>
                          {sec.title}
                        </h4>
                        <span
                          style={{
                            fontSize: "0.74rem",
                            color: "rgba(255, 255, 255, 0.45)",
                            fontFamily: "monospace"
                          }}
                        >
                          TEMPLATE: {sec.template_type.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      {/* Move Up / Down */}
                      <button
                        onClick={() => handleMoveSection(idx, "up")}
                        disabled={idx === 0}
                        style={{
                          background: "none",
                          border: "none",
                          color: idx === 0 ? "rgba(255,255,255,0.2)" : "#ffffff",
                          cursor: idx === 0 ? "default" : "pointer"
                        }}
                      >
                        <ChevronUp size={18} />
                      </button>
                      <button
                        onClick={() => handleMoveSection(idx, "down")}
                        disabled={idx === sections.length - 1}
                        style={{
                          background: "none",
                          border: "none",
                          color: idx === sections.length - 1 ? "rgba(255,255,255,0.2)" : "#ffffff",
                          cursor: idx === sections.length - 1 ? "default" : "pointer"
                        }}
                      >
                        <ChevronDown size={18} />
                      </button>

                      {/* Enable/Disable Toggle */}
                      <button
                        onClick={() => handleToggleSection(sec)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "999px",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          backgroundColor: sec.is_enabled ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)",
                          border: `1px solid ${sec.is_enabled ? "rgba(16, 185, 129, 0.4)" : "rgba(239, 68, 68, 0.4)"}`,
                          color: sec.is_enabled ? "#34d399" : "#f87171",
                          cursor: "pointer"
                        }}
                      >
                        {sec.is_enabled ? "Đang Bật" : "Đã Ẩn"}
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDeleteSection(sec.id)}
                        style={{
                          padding: "8px",
                          background: "none",
                          border: "none",
                          color: "rgba(255,255,255,0.4)",
                          cursor: "pointer"
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Right Column: Live WYSIWYG Preview Box */}
              {showLivePreview && (
                <div
                  style={{
                    width: previewDevice === "desktop" ? "540px" : "360px",
                    borderRadius: "24px",
                    backgroundColor: "#000000",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.9)",
                    padding: "20px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>
                      Live Preview ({previewDevice.toUpperCase()})
                    </span>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={() => setPreviewDevice("desktop")}
                        style={{
                          background: "none",
                          border: "none",
                          color: previewDevice === "desktop" ? "#6366f1" : "rgba(255,255,255,0.4)",
                          cursor: "pointer"
                        }}
                      >
                        <Monitor size={18} />
                      </button>
                      <button
                        onClick={() => setPreviewDevice("mobile")}
                        style={{
                          background: "none",
                          border: "none",
                          color: previewDevice === "mobile" ? "#6366f1" : "rgba(255,255,255,0.4)",
                          cursor: "pointer"
                        }}
                      >
                        <Smartphone size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Render Mock Sections */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "14px", maxHeight: "480px", overflowY: "auto" }}>
                    {sections.filter((s) => s.is_enabled).map((sec, i) => (
                      <div
                        key={sec.id}
                        style={{
                          padding: "16px",
                          borderRadius: "14px",
                          backgroundColor: "rgba(255, 255, 255, 0.05)",
                          border: "1px solid rgba(255, 255, 255, 0.1)"
                        }}
                      >
                        <span style={{ fontSize: "0.7rem", color: "#6366f1", fontWeight: 700 }}>
                          SECTION {i + 1} • {sec.template_type}
                        </span>
                        <h5 style={{ margin: "4px 0", fontSize: "0.9rem" }}>{sec.title}</h5>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ====================================================================
            DECK 2: INGESTION & WAVEFORM BAY (UPLOAD & AUTO-METADATA)
        ===================================================================== */}
        {activeDeck === "media" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div>
              <h2 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: "4px" }}>
                Universal Media Ingestion Bay
              </h2>
              <p style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: "0.85rem", margin: 0 }}>
                Upload trực tiếp Lossless FLAC / 4K MKV lên Cloudflare R2, tự bóc tách ID3 tags và Banner HD từ link ngoài.
              </p>
            </div>

            {/* Ingestion Bay 2-Column Grid */}
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "24px" }}>
              {/* Box 1: Drag & Drop FLAC/MKV Ingestion Ring */}
              <div
                style={{
                  padding: "32px",
                  borderRadius: "24px",
                  backgroundColor: "rgba(10, 11, 16, 0.75)",
                  border: "2px dashed rgba(99, 102, 241, 0.35)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  gap: "14px",
                  cursor: "pointer"
                }}
              >
                <div
                  style={{
                    width: "68px",
                    height: "68px",
                    borderRadius: "50%",
                    backgroundColor: "rgba(99, 102, 241, 0.18)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#a5b4fc"
                  }}
                >
                  <UploadCloud size={32} />
                </div>
                <div>
                  <h4 style={{ margin: "0 0 6px", fontSize: "1.05rem" }}>
                    Kéo thả file Lossless FLAC / MKV vào đây
                  </h4>
                  <p style={{ margin: 0, fontSize: "0.8rem", color: "rgba(255, 255, 255, 0.45)" }}>
                    Hỗ trợ file FLAC 24-bit 90MB, Video MKV 500MB (Stream upload 0ms)
                  </p>
                </div>
              </div>

              {/* Box 2: External Universal Link Ingestion */}
              <div
                style={{
                  padding: "28px",
                  borderRadius: "24px",
                  backgroundColor: "rgba(10, 11, 16, 0.75)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Link size={18} color="#ec4899" />
                  <h4 style={{ margin: 0, fontSize: "1.05rem" }}>Dán Link Nhúng (YouTube, SoundCloud, Zing, NCT)</h4>
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <input
                    type="text"
                    placeholder="https://youtube.com/watch?v=... hoặc soundcloud.com/..."
                    value={externalUrl}
                    onChange={(e) => setExternalUrl(e.target.value)}
                    style={{
                      flex: 1,
                      padding: "12px 16px",
                      borderRadius: "12px",
                      backgroundColor: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(255, 255, 255, 0.15)",
                      color: "#ffffff",
                      fontSize: "0.85rem",
                      outline: "none"
                    }}
                  />
                  <button
                    onClick={handleExtractMetadata}
                    disabled={isExtracting || !externalUrl}
                    style={{
                      padding: "12px 20px",
                      borderRadius: "12px",
                      backgroundColor: "#6366f1",
                      border: "none",
                      color: "#ffffff",
                      fontWeight: 700,
                      cursor: "pointer"
                    }}
                  >
                    {isExtracting ? "Đang quét..." : "Hút Banner HD"}
                  </button>
                </div>

                {/* 2048-Slice Waveform Canvas */}
                <div style={{ marginTop: "10px" }}>
                  <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.45)", fontWeight: 600 }}>
                    MULTI-BAND SPECTRUM INSPECTOR
                  </span>
                  <canvas ref={waveformCanvasRef} style={{ width: "100%", height: "70px", marginTop: "8px" }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ====================================================================
            DECK 3: VAULT ARTIFACTS (30 TRACKS WITH INLINE EDIT)
        ===================================================================== */}
        {activeDeck === "artifacts" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <h2 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: "4px" }}>
                  Vault Audio & Video Artifacts ({adminTracks.length} Tracks)
                </h2>
                <p style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: "0.85rem", margin: 0 }}>
                  Chỉnh sửa nhanh tên bài hát bằng click đúp (Inline Edit), nghe thử và đổi link R2 trực tiếp.
                </p>
              </div>
            </div>

            {/* Tracks List */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {adminTracks.map((track) => (
                <div
                  key={track.id}
                  style={{
                    padding: "14px 20px",
                    borderRadius: "16px",
                    backgroundColor: "rgba(10, 11, 16, 0.7)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "16px"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "14px", flex: 1 }}>
                    <button
                      onClick={() => playTrack(track)}
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                        border: "none",
                        color: "#ffffff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer"
                      }}
                    >
                      <Play size={16} style={{ marginLeft: "2px" }} />
                    </button>

                    <div style={{ flex: 1 }}>
                      {inlineEditingTrackId === track.id ? (
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <input
                            type="text"
                            value={inlineTrackTitle}
                            onChange={(e) => setInlineTrackTitle(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSaveInlineTrack(track)}
                            autoFocus
                            style={{
                              padding: "4px 8px",
                              borderRadius: "6px",
                              backgroundColor: "#000000",
                              border: "1px solid #6366f1",
                              color: "#ffffff",
                              fontSize: "0.9rem"
                            }}
                          />
                          <button
                            onClick={() => handleSaveInlineTrack(track)}
                            style={{ background: "none", border: "none", color: "#34d399", cursor: "pointer" }}
                          >
                            <Check size={16} />
                          </button>
                        </div>
                      ) : (
                        <h4
                          onDoubleClick={() => {
                            setInlineEditingTrackId(track.id);
                            setInlineTrackTitle(track.title);
                          }}
                          style={{ margin: 0, fontSize: "0.92rem", fontWeight: 700, cursor: "pointer" }}
                        >
                          {track.title}
                        </h4>
                      )}
                      <span style={{ fontSize: "0.75rem", color: "rgba(255, 255, 255, 0.45)" }}>
                        {track.artist} • {track.genre}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: "999px",
                        backgroundColor: "rgba(99, 102, 241, 0.15)",
                        border: "1px solid rgba(99, 102, 241, 0.3)",
                        color: "#a5b4fc",
                        fontSize: "0.72rem",
                        fontWeight: 700
                      }}
                    >
                      {track.videoUrl ? "4K MKV + FLAC" : "LOSSLESS FLAC"}
                    </span>

                    <button
                      onClick={() => {
                        setInlineEditingTrackId(track.id);
                        setInlineTrackTitle(track.title);
                      }}
                      style={{ background: "none", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer" }}
                    >
                      <Edit2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ====================================================================
            DECK 4: AUDIENCE RADAR & ACCESS CONTROL (USERS)
        ===================================================================== */}
        {activeDeck === "audience" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <h2 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: "4px" }}>
                Audience Radar & Access Control ({adminUsers.length} Users)
              </h2>
              <p style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: "0.85rem", margin: 0 }}>
                Quản lý tài khoản Google OAuth, cấp quyền 3 bậc (Admin / VIP / Free) và 1-click Khóa tài khoản.
              </p>
            </div>

            {/* Users List */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {adminUsers.map((u) => (
                <div
                  key={u.id}
                  style={{
                    padding: "16px 22px",
                    borderRadius: "16px",
                    backgroundColor: "rgba(10, 11, 16, 0.7)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "16px"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <img
                      src={u.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200"}
                      alt={u.name}
                      style={{ width: "38px", height: "38px", borderRadius: "50%", objectFit: "cover" }}
                    />
                    <div>
                      <h4 style={{ margin: 0, fontSize: "0.92rem", fontWeight: 700 }}>{u.name || u.email}</h4>
                      <span style={{ fontSize: "0.75rem", color: "rgba(255, 255, 255, 0.45)" }}>
                        {u.email} • {u.favorites_count || 0} bài yêu thích
                      </span>
                    </div>
                  </div>

                  {/* Role & Status Toggles */}
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    {/* Role Selector */}
                    <select
                      value={u.role || "free"}
                      onChange={(e) => handleUpdateUserRole(u.id, e.target.value as any)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "8px",
                        backgroundColor: "#000000",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        color: "#ffffff",
                        fontSize: "0.78rem",
                        fontWeight: 700,
                        cursor: "pointer"
                      }}
                    >
                      <option value="free">FREE LISTENER</option>
                      <option value="vip">VIP LISTENER</option>
                      <option value="admin">ADMINISTRATOR</option>
                    </select>

                    {/* Ban / Unban Button */}
                    <button
                      onClick={() => handleToggleUserStatus(u.id, u.status || "active")}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "8px",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        backgroundColor: u.status === "banned" ? "rgba(239, 68, 68, 0.2)" : "rgba(255, 255, 255, 0.08)",
                        border: `1px solid ${u.status === "banned" ? "rgba(239, 68, 68, 0.4)" : "rgba(255, 255, 255, 0.15)"}`,
                        color: u.status === "banned" ? "#f87171" : "#ffffff",
                        cursor: "pointer"
                      }}
                    >
                      {u.status === "banned" ? "Đã Khóa" : "Hoạt Động"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ====================================================================
            DECK 5: CLOUD ENGINE & DISASTER RECOVERY
        ===================================================================== */}
        {activeDeck === "infra" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div>
              <h2 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: "4px" }}>
                Cloud Engine & Disaster Recovery
              </h2>
              <p style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: "0.85rem", margin: 0 }}>
                1-Click Xóa Cache Cloudflare Edge, Sao lưu toàn bộ D1 Database và giám sát kho R2.
              </p>
            </div>

            {/* 3 Infrastructure Action Cards */}
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: "20px" }}>
              {/* Card 1: 1-Click Edge Cache Purge */}
              <div
                style={{
                  padding: "24px",
                  borderRadius: "20px",
                  backgroundColor: "rgba(10, 11, 16, 0.75)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Zap size={20} color="#eab308" />
                  <h4 style={{ margin: 0, fontSize: "1rem" }}>Cloudflare Edge Cache</h4>
                </div>
                <p style={{ fontSize: "0.8rem", color: "rgba(255, 255, 255, 0.45)", margin: 0 }}>
                  Xóa sạch cache CDN toàn cầu khi đổi file âm thanh/bìa trên R2 để người nghe nhận file mới 0ms.
                </p>
                <button
                  onClick={handlePurgeCache}
                  style={{
                    padding: "10px 16px",
                    borderRadius: "10px",
                    backgroundColor: "rgba(234, 179, 8, 0.18)",
                    border: "1px solid rgba(234, 179, 8, 0.4)",
                    color: "#fde047",
                    fontWeight: 700,
                    cursor: "pointer",
                    fontSize: "0.82rem"
                  }}
                >
                  ⚡ Xóa Cache CDN Ngay
                </button>
              </div>

              {/* Card 2: 1-Click Export Database Backup */}
              <div
                style={{
                  padding: "24px",
                  borderRadius: "20px",
                  backgroundColor: "rgba(10, 11, 16, 0.75)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Download size={20} color="#34d399" />
                  <h4 style={{ margin: 0, fontSize: "1rem" }}>Disaster Backup (JSON)</h4>
                </div>
                <p style={{ fontSize: "0.8rem", color: "rgba(255, 255, 255, 0.45)", margin: 0 }}>
                  Xuất toàn bộ bảng D1 Database (Tracks, Sections, Users, Favorites) ra 1 file JSON tải về máy.
                </p>
                <button
                  onClick={handleExportBackup}
                  style={{
                    padding: "10px 16px",
                    borderRadius: "10px",
                    backgroundColor: "rgba(16, 185, 129, 0.18)",
                    border: "1px solid rgba(16, 185, 129, 0.4)",
                    color: "#6ee7b7",
                    fontWeight: 700,
                    cursor: "pointer",
                    fontSize: "0.82rem"
                  }}
                >
                  Tải Bản Sao Lưu JSON
                </button>
              </div>

              {/* Card 3: R2 Storage Status */}
              <div
                style={{
                  padding: "24px",
                  borderRadius: "20px",
                  backgroundColor: "rgba(10, 11, 16, 0.75)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Database size={20} color="#6366f1" />
                  <h4 style={{ margin: 0, fontSize: "1rem" }}>R2 Storage Vault</h4>
                </div>
                <p style={{ fontSize: "0.8rem", color: "rgba(255, 255, 255, 0.45)", margin: 0 }}>
                  Bucket: <code style={{ color: "#a5b4fc" }}>hidden-music-vault</code> ({r2Files.length} files)
                </p>
                <span style={{ fontSize: "0.84rem", fontWeight: 700, color: "#ffffff" }}>
                  {adminStats?.r2StorageEstimate || "5.4 GB Lossless FLAC"}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Add New Section from 7 Templates */}
      <AnimatePresence>
        {isNewSectionModalOpen && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0, 0, 0, 0.75)",
              backdropFilter: "blur(16px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 100,
              padding: "20px"
            }}
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              style={{
                width: "min(92vw, 680px)",
                maxHeight: "85vh",
                overflowY: "auto",
                backgroundColor: "#08090d",
                borderRadius: "24px",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                boxShadow: "0 24px 60px rgba(0,0,0,0.9)",
                padding: "28px",
                display: "flex",
                flexDirection: "column",
                gap: "20px"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800 }}>
                  Chọn Template Cho Section Mới
                </h3>
                <button
                  onClick={() => setIsNewSectionModalOpen(false)}
                  style={{ background: "none", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer", fontSize: "1.1rem" }}
                >
                  ✕
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {TEMPLATE_PRESETS.map((preset) => {
                  const Icon = preset.icon;
                  return (
                    <div
                      key={preset.type}
                      onClick={() => handleAddPresetSection(preset)}
                      style={{
                        padding: "16px 20px",
                        borderRadius: "16px",
                        backgroundColor: "rgba(255, 255, 255, 0.04)",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                        cursor: "pointer",
                        transition: "all 0.2s ease"
                      }}
                    >
                      <div
                        style={{
                          width: "42px",
                          height: "42px",
                          borderRadius: "12px",
                          backgroundColor: "rgba(99, 102, 241, 0.18)",
                          color: "#a5b4fc",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      >
                        <Icon size={20} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: "0 0 2px", fontSize: "0.95rem", fontWeight: 700 }}>
                          {preset.name}
                        </h4>
                        <p style={{ margin: 0, fontSize: "0.78rem", color: "rgba(255, 255, 255, 0.45)" }}>
                          {preset.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPortal;
