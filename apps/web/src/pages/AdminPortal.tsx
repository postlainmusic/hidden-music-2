import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layout,
  Music,
  Users,
  ArrowLeft,
  Plus,
  Trash2,
  RefreshCw,
  Download,
  Disc3,
  Sliders,
  X,
  CheckCircle2,
  Copy,
  FileSpreadsheet,
  Search,
  Activity,
  Radio,
  FileText,
  Globe,
  Zap,
  Sparkles
} from "lucide-react";
import { useAudioStore, Track, DynamicSection, SectionTemplateType, Album, ReleaseType, DEFAULT_TRACKS } from "../store/audioStore";
import { useIsMobile } from "../hooks/useIsMobile";
import SectionElementEditorModal from "../components/admin/SectionElementEditorModal";

const API_BASE = "https://hidden-music-api.postlain-music.workers.dev";
const HVL_COVER = "https://media.postlain.com/covers/HVL_Album_Cover.jpg";

// 7 Bespoke Section Templates Definitions
const TEMPLATE_PRESETS: { type: SectionTemplateType; name: string; icon: any; desc: string; defaultCfg: any }[] = [
  {
    type: "hero_banner",
    name: "Hero Music Banner",
    icon: Sparkles,
    desc: "Banner điện ảnh toàn cảnh giới thiệu Album/MV mới với nút Play tức thì",
    defaultCfg: {
      headline: "HVL (99%) - MCK",
      subheadline: "Thưởng thức bản Master Lossless 24-bit 96kHz độc quyền từ Album HVL (99%)",
      banner_url: HVL_COVER,
      track_id: "",
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
    icon: Layout,
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
    queue,
    updateSection
  } = useAudioStore();
  const isMobile = useIsMobile();

  // 4 Unified Decks
  const [activeDeck, setActiveDeck] = useState<"releases" | "sections" | "users" | "logs">("releases");

  // Admin Data State
  const [adminAlbums, setAdminAlbums] = useState<Album[]>([]);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string>("hvl-99");
  const [selectedAlbumTracks, setSelectedAlbumTracks] = useState<Track[]>([]);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");

  // Logs Studio State
  const [adminLogs, setAdminLogs] = useState<any[]>([]);
  const [logTypeFilter, setLogTypeFilter] = useState("all");
  const [logSeverityFilter] = useState("all");
  const [logSearchQuery] = useState("");
  const [isLiveStreamLogs, setIsLiveStreamLogs] = useState(false);
  const [selectedLogDetail, setSelectedLogDetail] = useState<any | null>(null);

  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Modals State
  const [isNewAlbumModalOpen, setIsNewAlbumModalOpen] = useState(false);
  const [isNewTrackModalOpen, setIsNewTrackModalOpen] = useState(false);
  const [isNewSectionModalOpen, setIsNewSectionModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<DynamicSection | null>(null);

  // Forms
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
  }>({
    id: "",
    title: "",
    artist: "MCK",
    duration_sec: 200,
    audio_url: "",
    video_url: ""
  });

  const [albumToDelete, setAlbumToDelete] = useState<any | null>(null);
  const [isDeletingAlbum, setIsDeletingAlbum] = useState<boolean>(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("vault_token") : null;

  const showToast = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const handleDeleteAlbum = async () => {
    if (!albumToDelete) return;
    setIsDeletingAlbum(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/albums/${albumToDelete.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || `Đã xóa bản phát hành "${albumToDelete.title}" thành công!`);
        setAlbumToDelete(null);
        if (selectedAlbumId === albumToDelete.id) {
          setSelectedAlbumId("hvl-99");
        }
        await fetchAlbums();
        fetchLogs();
      } else {
        showToast(`Lỗi: ${data.error || "Không thể xóa album"}`);
      }
    } catch (err: any) {
      showToast(`Lỗi kết nối: ${err.message}`);
    } finally {
      setIsDeletingAlbum(false);
    }
  };

  // 1. Fetch Albums
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
    } catch {
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

  // 2. Fetch Album Tracks
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
          r2Key: t.r2_key || t.r2Key,
          videoUrl: t.video_url || t.videoUrl,
          videoQuality: t.video_quality || "4K MASTER",
          audioBitrate: t.audio_bitrate || "24-BIT / 96kHz",
          lyrics_synced: t.lyrics_synced || "",
          bpm: t.bpm || 120,
          playCount: t.play_count || 0
        }));
        setSelectedAlbumTracks(mappedTracks);
      } else if (albumId === "hvl-99") {
        setSelectedAlbumTracks(queue.length > 0 ? queue : DEFAULT_TRACKS);
      } else {
        setSelectedAlbumTracks([]);
      }
    } catch {
      if (albumId === "hvl-99") {
        setSelectedAlbumTracks(queue.length > 0 ? queue : DEFAULT_TRACKS);
      } else {
        setSelectedAlbumTracks([]);
      }
    }
  };

  // 3. Fetch Users
  const fetchUsers = async () => {
    const adminFallback = [
      {
        id: currentUser?.id || "usr_admin_01",
        email: currentUser?.email || "admin@postlain.com",
        name: currentUser?.name || "System Admin",
        avatar_url: currentUser?.avatarUrl || HVL_COVER,
        role: "admin",
        status: "active",
        last_login_device: "System Console",
        last_ip: "127.0.0.1",
        created_at: new Date().toISOString(),
        favorites_count: 0
      }
    ];

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.users) && data.users.length > 0) {
        setAdminUsers(data.users);
      } else {
        setAdminUsers(adminFallback);
      }
    } catch {
      setAdminUsers(adminFallback);
    } finally {
      setLoading(false);
    }
  };

  // 4. Fetch Logs
  const fetchLogs = async () => {
    try {
      const params = new URLSearchParams();
      if (logTypeFilter !== "all") params.append("type", logTypeFilter);
      if (logSeverityFilter !== "all") params.append("severity", logSeverityFilter);
      if (logSearchQuery.trim()) params.append("q", logSearchQuery.trim());
      params.append("limit", "150");

      const res = await fetch(`${API_BASE}/api/admin/logs?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.logs) {
        setAdminLogs(data.logs);
      }
    } catch {}
  };

  useEffect(() => {
    fetchAlbums();
    fetchUsers();
    fetchLogs();
  }, []);

  useEffect(() => {
    if (selectedAlbumId) {
      fetchAlbumTracks(selectedAlbumId);
    }
  }, [selectedAlbumId]);

  // Live Stream Logs polling
  useEffect(() => {
    if (!isLiveStreamLogs || activeDeck !== "logs") return;
    const interval = setInterval(() => {
      fetchLogs();
    }, 3000);
    return () => clearInterval(interval);
  }, [isLiveStreamLogs, activeDeck, logTypeFilter, logSeverityFilter, logSearchQuery]);

  // User Actions
  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ role: newRole })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Đã đổi quyền thành: ${newRole.toUpperCase()}`);
        fetchUsers();
        fetchLogs();
      }
    } catch {
      showToast("Lỗi cập nhật quyền");
    }
  };

  const handleUpdateStatus = async (userId: string, newStatus: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${userId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Đã đổi trạng thái tài khoản: ${newStatus}`);
        fetchUsers();
        fetchLogs();
      }
    } catch {
      showToast("Lỗi cập nhật trạng thái");
    }
  };

  // 1-Click Copy AI Bug Report
  const handleCopyAiReport = () => {
    const errorLogs = adminLogs.filter((l) => l.severity === "error" || l.event_type === "client_error");
    const targetLogs = errorLogs.length > 0 ? errorLogs.slice(0, 10) : adminLogs.slice(0, 10);

    let report = `### 🚨 BÁO CÁO NHẬT KÝ & LỖI HỆ THỐNG (HIDDEN MUSIC VAULT)\n\n`;
    report += `**Thời gian tạo báo cáo:** ${new Date().toLocaleString("vi-VN")}\n`;
    report += `**Tổng số sự kiện:** ${adminLogs.length} | **Lỗi phát hiện:** ${errorLogs.length}\n\n`;
    report += `| Thời Gian | Mức Độ | Sự Kiện | Tóm Tắt (Tiếng Việt) | Người Dùng | Thiết Bị / IP |\n`;
    report += `| :--- | :--- | :--- | :--- | :--- | :--- |\n`;

    for (const log of targetLogs) {
      let details: any = {};
      try { details = JSON.parse(log.details_json || "{}"); } catch {}
      const dev = [details.device, details.os, details.browser].filter(Boolean).join(" / ") || details.ip || "N/A";
      report += `| ${log.created_at} | ${log.severity?.toUpperCase()} | ${log.event_type} | ${log.title_vi} | ${log.user_email} | ${dev} |\n`;
    }

    if (errorLogs.length > 0 && errorLogs[0].details_json) {
      report += `\n#### Chi tiết lỗi gần nhất:\n\`\`\`json\n${JSON.stringify(JSON.parse(errorLogs[0].details_json), null, 2)}\n\`\`\`\n`;
    }

    navigator.clipboard.writeText(report);
    showToast("📋 Đã sao chép Báo cáo Lỗi cho AI! Bạn có thể dán ngay vào hộp chat AI.");
  };

  // Export CSV
  const handleExportCsv = () => {
    window.open(`${API_BASE}/api/admin/logs?format=csv`, "_blank");
    showToast("📥 Đang tải file nhật ký CSV...");
  };

  // Clear Logs
  const handleClearLogs = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa toàn bộ lịch sử log?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/logs/clear`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        showToast("Đã xóa sạch nhật ký!");
        fetchLogs();
      }
    } catch {
      showToast("Lỗi xóa nhật ký");
    }
  };

  // Section Handlers
  const handleToggleSection = async (section: DynamicSection) => {
    const isCurrentlyActive = Boolean(section.is_active ?? section.is_enabled);
    const newActive = !isCurrentlyActive;
    updateSection(section.id, { is_active: newActive, is_enabled: newActive ? 1 : 0 });

    try {
      const res = await fetch(`${API_BASE}/api/admin/sections/${section.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ is_enabled: newActive ? 1 : 0, is_active: newActive })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Đã ${newActive ? "bật" : "ẩn"} Section: ${section.title}`);
        loadSections();
      }
    } catch {}
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
    } catch {}
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
          sort_order: newOrder,
          is_enabled: 1,
          is_active: true,
          config: preset.defaultCfg
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Đã thêm Section mới: ${preset.name}!`);
        setIsNewSectionModalOpen(false);
        loadSections();
      }
    } catch {}
  };

  // Add Album Submit
  const handleCreateAlbum = async () => {
    if (!albumForm.title.trim()) {
      showToast("Vui lòng nhập tên Album!");
      return;
    }
    const albumId = albumForm.id.trim() || `alb-${Date.now()}`;
    try {
      const res = await fetch(`${API_BASE}/api/albums`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          id: albumId,
          title: albumForm.title,
          artist: albumForm.artist,
          cover_url: albumForm.cover_url,
          type: albumForm.type,
          release_year: albumForm.release_year,
          genre: albumForm.genre
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast("Đã tạo Release mới thành công!");
        setIsNewAlbumModalOpen(false);
        fetchAlbums();
        setSelectedAlbumId(albumId);
      }
    } catch {
      showToast("Lỗi khi tạo Release");
    }
  };

  // Add Track Submit
  const handleCreateTrack = async () => {
    if (!trackForm.title.trim() || !trackForm.audio_url.trim()) {
      showToast("Vui lòng nhập tên bài hát và link audio!");
      return;
    }
    const trackId = trackForm.id.trim() || `trk-${Date.now()}`;
    try {
      const res = await fetch(`${API_BASE}/api/albums/${selectedAlbumId}/tracks`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          id: trackId,
          album_id: selectedAlbumId,
          title: trackForm.title,
          artist: trackForm.artist,
          duration_sec: trackForm.duration_sec,
          audio_url: trackForm.audio_url,
          video_url: trackForm.video_url
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast("Đã thêm bài hát mới vào Album!");
        setIsNewTrackModalOpen(false);
        fetchAlbumTracks(selectedAlbumId);
      }
    } catch {
      showToast("Lỗi khi thêm bài hát");
    }
  };

  const currentAlbum = adminAlbums.find((a) => a.id === selectedAlbumId) || adminAlbums[0];

  // Filtered Users
  const filteredUsers = adminUsers.filter((u) => {
    const matchSearch = (u.email || "").toLowerCase().includes(userSearchQuery.toLowerCase()) ||
                        (u.name || "").toLowerCase().includes(userSearchQuery.toLowerCase());
    const matchRole = userRoleFilter === "all" || u.role === userRoleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100dvh",
        backgroundColor: "#050508",
        zIndex: 100,
        display: "flex",
        flexDirection: "column",
        color: "#ffffff",
        overflow: "hidden"
      }}
    >
      {/* ── TOP HEADER BAR (APPLE-GRADE MINIMALISM) ── */}
      <header
        style={{
          padding: isMobile ? "12px 16px" : "16px 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          backgroundColor: "rgba(10, 10, 15, 0.85)",
          backdropFilter: "blur(20px)",
          zIndex: 50
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <button
            onClick={onBackToVault}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "7px 14px",
              borderRadius: "999px",
              backgroundColor: "rgba(255, 255, 255, 0.06)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              color: "#ffffff",
              fontSize: "0.82rem",
              fontWeight: 700,
              cursor: "pointer"
            }}
          >
            <ArrowLeft size={15} />
            <span>Vault</span>
          </button>

          {!isMobile && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "0.95rem", fontWeight: 800, letterSpacing: "0.02em" }}>
                Admin Studio
              </span>
            </div>
          )}
        </div>

        {/* 4 Unified Decks Navigation */}
        <nav style={{ display: "flex", alignItems: "center", gap: isMobile ? "4px" : "8px" }}>
          <button
            onClick={() => setActiveDeck("releases")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: isMobile ? "6px 10px" : "8px 16px",
              borderRadius: "10px",
              backgroundColor: activeDeck === "releases" ? "rgba(99, 102, 241, 0.25)" : "transparent",
              border: activeDeck === "releases" ? "1px solid #6366f1" : "1px solid transparent",
              color: activeDeck === "releases" ? "#ffffff" : "rgba(255, 255, 255, 0.6)",
              fontSize: isMobile ? "0.76rem" : "0.84rem",
              fontWeight: 700,
              cursor: "pointer"
            }}
          >
            <Disc3 size={15} color={activeDeck === "releases" ? "#a5b4fc" : "currentColor"} />
            <span>{isMobile ? "Bài Hát" : "Bài Hát & Bản Thu"}</span>
          </button>

          <button
            onClick={() => setActiveDeck("sections")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: isMobile ? "6px 10px" : "8px 16px",
              borderRadius: "10px",
              backgroundColor: activeDeck === "sections" ? "rgba(99, 102, 241, 0.25)" : "transparent",
              border: activeDeck === "sections" ? "1px solid #6366f1" : "1px solid transparent",
              color: activeDeck === "sections" ? "#ffffff" : "rgba(255, 255, 255, 0.6)",
              fontSize: isMobile ? "0.76rem" : "0.84rem",
              fontWeight: 700,
              cursor: "pointer"
            }}
          >
            <Layout size={15} color={activeDeck === "sections" ? "#a5b4fc" : "currentColor"} />
            <span>Giao Diện</span>
          </button>

          <button
            onClick={() => {
              setActiveDeck("users");
              fetchUsers();
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: isMobile ? "6px 10px" : "8px 16px",
              borderRadius: "10px",
              backgroundColor: activeDeck === "users" ? "rgba(99, 102, 241, 0.25)" : "transparent",
              border: activeDeck === "users" ? "1px solid #6366f1" : "1px solid transparent",
              color: activeDeck === "users" ? "#ffffff" : "rgba(255, 255, 255, 0.6)",
              fontSize: isMobile ? "0.76rem" : "0.84rem",
              fontWeight: 700,
              cursor: "pointer"
            }}
          >
            <Users size={15} color={activeDeck === "users" ? "#a5b4fc" : "currentColor"} />
            <span>Thành Viên</span>
          </button>

          <button
            onClick={() => {
              setActiveDeck("logs");
              fetchLogs();
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: isMobile ? "6px 10px" : "8px 16px",
              borderRadius: "10px",
              backgroundColor: activeDeck === "logs" ? "rgba(99, 102, 241, 0.25)" : "transparent",
              border: activeDeck === "logs" ? "1px solid #6366f1" : "1px solid transparent",
              color: activeDeck === "logs" ? "#ffffff" : "rgba(255, 255, 255, 0.6)",
              fontSize: isMobile ? "0.76rem" : "0.84rem",
              fontWeight: 700,
              cursor: "pointer"
            }}
          >
            <FileSpreadsheet size={15} color={activeDeck === "logs" ? "#a5b4fc" : "currentColor"} />
            <span>Nhật Ký</span>
          </button>
        </nav>

        {/* User Info & Refresh */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {!isMobile && (
            <div
              style={{
                padding: "5px 12px",
                borderRadius: "999px",
                backgroundColor: "rgba(16, 185, 129, 0.1)",
                border: "1px solid rgba(16, 185, 129, 0.25)",
                color: "#34d399",
                fontSize: "0.75rem",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#10b981" }} />
              <span>{currentUser?.email || "Admin"}</span>
            </div>
          )}

          <button
            onClick={async () => {
              await fetchAlbums();
              await fetchAlbumTracks(selectedAlbumId);
              loadSections();
              fetchUsers();
              fetchLogs();
              showToast("Đã đồng bộ dữ liệu mới nhất!");
            }}
            title="Làm mới dữ liệu"
            style={{
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              cursor: "pointer"
            }}
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
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
              top: "70px",
              right: "20px",
              zIndex: 200,
              backgroundColor: "rgba(18, 18, 26, 0.95)",
              border: "1px solid #6366f1",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.8)",
              borderRadius: "12px",
              padding: "10px 18px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "#ffffff",
              fontSize: "0.84rem",
              fontWeight: 600
            }}
          >
            <CheckCircle2 size={16} color="#a5b4fc" />
            <span>{statusMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MAIN SCROLLABLE CONTENT ── */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: isMobile ? "16px" : "24px",
          display: "flex",
          flexDirection: "column",
          gap: "20px"
        }}
      >
        {/* ══════════════════════════════════════════════════════════════════════════
            DECK 1: RELEASES & TRACKS STUDIO
        ══════════════════════════════════════════════════════════════════════════ */}
        {activeDeck === "releases" && (
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "340px 1fr", gap: "20px" }}>
            {/* Releases Column */}
            <div
              style={{
                backgroundColor: "rgba(14, 14, 20, 0.7)",
                borderRadius: "18px",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                padding: "18px",
                display: "flex",
                flexDirection: "column",
                gap: "14px"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "0.98rem", fontWeight: 800 }}>Bản Phát Hành</h3>
                  <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)" }}>
                    {adminAlbums.length} Album / Single
                  </span>
                </div>

                <button
                  onClick={() => setIsNewAlbumModalOpen(true)}
                  style={{
                    padding: "5px 10px",
                    borderRadius: "8px",
                    backgroundColor: "#6366f1",
                    border: "none",
                    color: "#ffffff",
                    fontSize: "0.76rem",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    cursor: "pointer"
                  }}
                >
                  <Plus size={13} />
                  <span>Tạo Mới</span>
                </button>
              </div>

              {/* Album List */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {adminAlbums.map((album) => {
                  const isSelected = album.id === selectedAlbumId;
                  return (
                    <div
                      key={album.id}
                      onClick={() => setSelectedAlbumId(album.id)}
                      style={{
                        padding: "10px",
                        borderRadius: "12px",
                        backgroundColor: isSelected ? "rgba(99, 102, 241, 0.18)" : "rgba(255, 255, 255, 0.03)",
                        border: isSelected ? "1px solid #6366f1" : "1px solid rgba(255, 255, 255, 0.06)",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        cursor: "pointer"
                      }}
                    >
                      <img
                        src={album.cover_url || HVL_COVER}
                        alt={album.title}
                        style={{ width: "44px", height: "44px", borderRadius: "8px", objectFit: "cover" }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{ margin: 0, fontSize: "0.88rem", fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {album.title}
                        </h4>
                        <span style={{ fontSize: "0.72rem", color: "rgba(255, 255, 255, 0.45)" }}>
                          {album.artist} • {album.type?.toUpperCase()}
                        </span>
                      </div>

                      {/* Delete Album Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setAlbumToDelete(album);
                        }}
                        title={`Xóa bản phát hành ${album.title}`}
                        style={{
                          padding: "6px",
                          borderRadius: "8px",
                          backgroundColor: "rgba(239, 68, 68, 0.12)",
                          border: "1px solid rgba(239, 68, 68, 0.25)",
                          color: "#ef4444",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          transition: "all 0.18s ease",
                          flexShrink: 0
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(239, 68, 68, 0.25)";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(239, 68, 68, 0.12)";
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tracks Column */}
            <div
              style={{
                backgroundColor: "rgba(14, 14, 20, 0.7)",
                borderRadius: "18px",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                padding: "18px",
                display: "flex",
                flexDirection: "column",
                gap: "14px"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800 }}>
                    {currentAlbum?.title} ({selectedAlbumTracks.length} bài hát)
                  </h3>
                  <span style={{ fontSize: "0.74rem", color: "rgba(255,255,255,0.45)" }}>
                    Lossless FLAC & 4K Cinema Streams
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <button
                    onClick={() => setIsNewTrackModalOpen(true)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "8px",
                      backgroundColor: "#6366f1",
                      border: "none",
                      color: "#ffffff",
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      cursor: "pointer"
                    }}
                  >
                    <Plus size={14} />
                    <span>Thêm Bài Hát</span>
                  </button>
                </div>
              </div>

              {/* Tracks List */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {selectedAlbumTracks.map((track, idx) => (
                  <div
                    key={track.id || idx}
                    style={{
                      padding: "10px 14px",
                      borderRadius: "10px",
                      backgroundColor: "rgba(255, 255, 255, 0.02)",
                      border: "1px solid rgba(255, 255, 255, 0.05)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "10px"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0, flex: 1 }}>
                      <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "rgba(255,255,255,0.4)", width: "20px" }}>
                        {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                      </span>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <p style={{ margin: 0, fontSize: "0.86rem", fontWeight: 700, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {track.title}
                        </p>
                        <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)" }}>
                          {track.artist}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "0.68rem", padding: "2px 6px", borderRadius: "4px", backgroundColor: "rgba(99, 102, 241, 0.15)", color: "#a5b4fc", fontWeight: 700 }}>
                        FLAC
                      </span>
                      {track.videoUrl && (
                        <span style={{ fontSize: "0.68rem", padding: "2px 6px", borderRadius: "4px", backgroundColor: "rgba(236, 72, 153, 0.15)", color: "#f472b6", fontWeight: 700 }}>
                          4K
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════
            DECK 2: DYNAMIC SECTIONS STUDIO
        ══════════════════════════════════════════════════════════════════════════ */}
        {activeDeck === "sections" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800 }}>Sections Trang Chủ</h3>
                <span style={{ fontSize: "0.74rem", color: "rgba(255,255,255,0.45)" }}>
                  Tùy chỉnh 7 template giao diện hiển thị trên trang chủ
                </span>
              </div>

              <button
                onClick={() => setIsNewSectionModalOpen(true)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "8px",
                  backgroundColor: "#6366f1",
                  border: "none",
                  color: "#ffffff",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  cursor: "pointer"
                }}
              >
                <Plus size={14} />
                <span>Thêm Section</span>
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {sections.map((sec, idx) => {
                const preset = TEMPLATE_PRESETS.find((p) => p.type === sec.template_type) || TEMPLATE_PRESETS[0];
                const Icon = preset.icon;

                return (
                  <div
                    key={sec.id || idx}
                    style={{
                      padding: "14px 18px",
                      borderRadius: "14px",
                      backgroundColor: "rgba(255, 255, 255, 0.03)",
                      border: "1px solid rgba(255, 255, 255, 0.06)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: "12px"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div
                        style={{
                          width: "38px",
                          height: "38px",
                          borderRadius: "10px",
                          backgroundColor: "rgba(99, 102, 241, 0.15)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#a5b4fc"
                        }}
                      >
                        <Icon size={18} />
                      </div>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontSize: "0.74rem", fontWeight: 800, color: "#6366f1" }}>#{idx + 1}</span>
                          <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 800 }}>{sec.title}</h4>
                          <span style={{ fontSize: "0.68rem", padding: "2px 6px", borderRadius: "4px", backgroundColor: "rgba(255,255,255,0.08)", color: "#cbd5e1" }}>
                            {preset.name}
                          </span>
                        </div>
                        <p style={{ margin: "2px 0 0", fontSize: "0.75rem", color: "rgba(255, 255, 255, 0.45)" }}>
                          {preset.desc}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <button
                        onClick={() => setEditingSection(sec)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "8px",
                          backgroundColor: "rgba(99, 102, 241, 0.15)",
                          border: "1px solid rgba(99, 102, 241, 0.35)",
                          color: "#a5b4fc",
                          fontSize: "0.76rem",
                          fontWeight: 700,
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                          cursor: "pointer"
                        }}
                      >
                        <Sliders size={13} />
                        <span>Sửa Element</span>
                      </button>

                      <button
                        onClick={() => handleToggleSection(sec)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "8px",
                          backgroundColor: sec.is_active ? "rgba(16, 185, 129, 0.15)" : "rgba(255, 255, 255, 0.06)",
                          border: sec.is_active ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid rgba(255, 255, 255, 0.12)",
                          color: sec.is_active ? "#34d399" : "rgba(255, 255, 255, 0.45)",
                          fontSize: "0.76rem",
                          fontWeight: 700,
                          cursor: "pointer"
                        }}
                      >
                        {sec.is_active ? "Bật" : "Ẩn"}
                      </button>

                      <button
                        onClick={() => handleDeleteSection(sec.id)}
                        style={{ background: "none", border: "none", color: "rgba(239, 68, 68, 0.6)", cursor: "pointer", padding: "6px" }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════
            DECK 3: USER & ROLES STUDIO
        ══════════════════════════════════════════════════════════════════════════ */}
        {activeDeck === "users" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800 }}>Quản Lý Thành Viên ({adminUsers.length})</h3>
                <span style={{ fontSize: "0.74rem", color: "rgba(255,255,255,0.45)" }}>
                  Phân quyền vai trò (Admin / VIP / Listener) và quản lý trạng thái tài khoản
                </span>
              </div>

              {/* Search & Filters */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "6px 12px",
                    borderRadius: "8px",
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.1)"
                  }}
                >
                  <Search size={14} color="rgba(255,255,255,0.4)" />
                  <input
                    type="text"
                    placeholder="Tìm email hoặc tên..."
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    style={{ background: "none", border: "none", color: "#fff", fontSize: "0.8rem", outline: "none", width: "160px" }}
                  />
                </div>

                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  style={{
                    padding: "6px 10px",
                    borderRadius: "8px",
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    color: "#fff",
                    fontSize: "0.8rem",
                    outline: "none"
                  }}
                >
                  <option value="all">Tất cả vai trò</option>
                  <option value="admin">Admin</option>
                  <option value="vip">VIP</option>
                  <option value="listener">Listener</option>
                </select>
              </div>
            </div>

            {/* Users Table */}
            <div
              style={{
                backgroundColor: "rgba(14, 14, 20, 0.7)",
                borderRadius: "16px",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                overflowX: "auto"
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.82rem" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)", backgroundColor: "rgba(255, 255, 255, 0.02)" }}>
                    <th style={{ padding: "12px 16px", fontWeight: 700, color: "rgba(255,255,255,0.6)" }}>Người Dùng</th>
                    <th style={{ padding: "12px 16px", fontWeight: 700, color: "rgba(255,255,255,0.6)" }}>Vai Trò (Role)</th>
                    <th style={{ padding: "12px 16px", fontWeight: 700, color: "rgba(255,255,255,0.6)" }}>Trạng Thái</th>
                    <th style={{ padding: "12px 16px", fontWeight: 700, color: "rgba(255,255,255,0.6)" }}>Thiết Bị / IP</th>
                    <th style={{ padding: "12px 16px", fontWeight: 700, color: "rgba(255,255,255,0.6)" }}>Lần Cuối</th>
                    <th style={{ padding: "12px 16px", fontWeight: 700, color: "rgba(255,255,255,0.6)" }}>Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.04)" }}
                    >
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt="" style={{ width: "32px", height: "32px", borderRadius: "50%" }} />
                          ) : (
                            <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "rgba(99, 102, 241, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
                              {(user.name || user.email || "U")[0].toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p style={{ margin: 0, fontWeight: 700, color: "#fff" }}>{user.name || "Chưa đặt tên"}</p>
                            <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.45)" }}>{user.email}</span>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: "12px 16px" }}>
                        <select
                          value={user.role || "listener"}
                          onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                          style={{
                            padding: "4px 8px",
                            borderRadius: "6px",
                            backgroundColor: user.role === "admin" ? "rgba(99, 102, 241, 0.2)" : user.role === "vip" ? "rgba(236, 72, 153, 0.2)" : "rgba(255, 255, 255, 0.06)",
                            border: "1px solid rgba(255, 255, 255, 0.15)",
                            color: user.role === "admin" ? "#a5b4fc" : user.role === "vip" ? "#f472b6" : "#cbd5e1",
                            fontSize: "0.78rem",
                            fontWeight: 700,
                            outline: "none"
                          }}
                        >
                          <option value="listener">Listener</option>
                          <option value="vip">VIP</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>

                      <td style={{ padding: "12px 16px" }}>
                        <span
                          style={{
                            padding: "3px 8px",
                            borderRadius: "999px",
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            backgroundColor: user.status === "active" ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                            color: user.status === "active" ? "#34d399" : "#f87171",
                            border: user.status === "active" ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid rgba(239, 68, 68, 0.3)"
                          }}
                        >
                          {user.status === "active" ? "Hoạt động" : "Tạm khóa"}
                        </span>
                      </td>

                      <td style={{ padding: "12px 16px", color: "rgba(255,255,255,0.55)", fontSize: "0.75rem" }}>
                        {user.last_ip || "Cloudflare Protected"}
                      </td>

                      <td style={{ padding: "12px 16px", color: "rgba(255,255,255,0.55)", fontSize: "0.75rem" }}>
                        {user.created_at ? new Date(user.created_at).toLocaleDateString("vi-VN") : "N/A"}
                      </td>

                      <td style={{ padding: "12px 16px" }}>
                        <button
                          onClick={() => handleUpdateStatus(user.id, user.status === "active" ? "suspended" : "active")}
                          style={{
                            padding: "4px 10px",
                            borderRadius: "6px",
                            backgroundColor: user.status === "active" ? "rgba(239, 68, 68, 0.15)" : "rgba(16, 185, 129, 0.15)",
                            border: "1px solid rgba(255, 255, 255, 0.12)",
                            color: user.status === "active" ? "#f87171" : "#34d399",
                            fontSize: "0.74rem",
                            fontWeight: 700,
                            cursor: "pointer"
                          }}
                        >
                          {user.status === "active" ? "Khóa" : "Mở Khóa"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════
            DECK 4: EXCEL-STYLE ACTIVITY & ERROR LOGS STUDIO
        ══════════════════════════════════════════════════════════════════════════ */}
        {activeDeck === "logs" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800 }}>Nhật Ký & Báo Cáo Lỗi ({adminLogs.length})</h3>
                <span style={{ fontSize: "0.74rem", color: "rgba(255,255,255,0.45)" }}>
                  Ghi nhận toàn bộ thao tác, đăng nhập, lượt phát nhạc và tự động phát hiện lỗi
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <button
                  onClick={handleCopyAiReport}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "7px 14px",
                    borderRadius: "8px",
                    backgroundColor: "rgba(99, 102, 241, 0.2)",
                    border: "1px solid #6366f1",
                    color: "#a5b4fc",
                    fontSize: "0.78rem",
                    fontWeight: 800,
                    cursor: "pointer"
                  }}
                >
                  <Copy size={13} />
                  <span>📋 Sao chép báo cáo lỗi cho AI</span>
                </button>

                <button
                  onClick={handleExportCsv}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "7px 14px",
                    borderRadius: "8px",
                    backgroundColor: "rgba(255, 255, 255, 0.06)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    color: "#ffffff",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                >
                  <Download size={13} />
                  <span>Xuất Excel / CSV</span>
                </button>

                <button
                  onClick={() => setIsLiveStreamLogs(!isLiveStreamLogs)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "7px 14px",
                    borderRadius: "8px",
                    backgroundColor: isLiveStreamLogs ? "rgba(16, 185, 129, 0.2)" : "rgba(255, 255, 255, 0.06)",
                    border: isLiveStreamLogs ? "1px solid #10b981" : "1px solid rgba(255, 255, 255, 0.15)",
                    color: isLiveStreamLogs ? "#34d399" : "rgba(255, 255, 255, 0.7)",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                >
                  <Activity size={13} className={isLiveStreamLogs ? "animate-pulse" : ""} />
                  <span>Live Stream</span>
                </button>

                <button
                  onClick={handleClearLogs}
                  style={{
                    padding: "7px 12px",
                    borderRadius: "8px",
                    backgroundColor: "rgba(239, 68, 68, 0.12)",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    color: "#f87171",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                >
                  Xóa Log
                </button>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "6px", borderBottom: "1px solid rgba(255, 255, 255, 0.08)", paddingBottom: "8px", overflowX: "auto" }}>
              {[
                { key: "all", label: "Tất Cả Sự Kiện" },
                { key: "login", label: "🔐 Đăng Nhập & Thiết Bị" },
                { key: "play_track", label: "🎵 Nghe Nhạc" },
                { key: "admin_action", label: "⚙️ Thao Tác Quản Trị" },
                { key: "client_error", label: "🚨 Lỗi & Bug" }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => {
                    setLogTypeFilter(tab.key);
                  }}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "6px",
                    backgroundColor: logTypeFilter === tab.key ? "rgba(99, 102, 241, 0.2)" : "transparent",
                    border: logTypeFilter === tab.key ? "1px solid #6366f1" : "1px solid transparent",
                    color: logTypeFilter === tab.key ? "#a5b4fc" : "rgba(255, 255, 255, 0.55)",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    whiteSpace: "nowrap"
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div
              style={{
                backgroundColor: "rgba(12, 12, 18, 0.8)",
                borderRadius: "14px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                overflowX: "auto"
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.8rem" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.12)", backgroundColor: "rgba(255, 255, 255, 0.04)" }}>
                    <th style={{ padding: "10px 14px", fontWeight: 700, color: "rgba(255,255,255,0.7)", width: "140px" }}>Thời Gian</th>
                    <th style={{ padding: "10px 14px", fontWeight: 700, color: "rgba(255,255,255,0.7)", width: "80px" }}>Mức Độ</th>
                    <th style={{ padding: "10px 14px", fontWeight: 700, color: "rgba(255,255,255,0.7)", width: "110px" }}>Loại</th>
                    <th style={{ padding: "10px 14px", fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>Tóm Tắt Sự Kiện (Tiếng Việt)</th>
                    <th style={{ padding: "10px 14px", fontWeight: 700, color: "rgba(255,255,255,0.7)", width: "160px" }}>Người Dùng</th>
                    <th style={{ padding: "10px 14px", fontWeight: 700, color: "rgba(255,255,255,0.7)", width: "160px" }}>Thiết Bị / IP</th>
                  </tr>
                </thead>
                <tbody>
                  {adminLogs.map((log) => {
                    let details: any = {};
                    try { details = JSON.parse(log.details_json || "{}"); } catch {}
                    const devInfo = [details.device, details.os, details.browser].filter(Boolean).join(" / ") || details.ip || "N/A";

                    return (
                      <tr
                        key={log.id}
                        onClick={() => setSelectedLogDetail(log)}
                        style={{
                          borderBottom: "1px solid rgba(255, 255, 255, 0.03)",
                          cursor: "pointer",
                          transition: "background-color 0.15s"
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.04)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                      >
                        <td style={{ padding: "10px 14px", color: "rgba(255,255,255,0.5)", fontFamily: "monospace", fontSize: "0.74rem" }}>
                          {log.created_at}
                        </td>

                        <td style={{ padding: "10px 14px" }}>
                          <span
                            style={{
                              padding: "2px 6px",
                              borderRadius: "4px",
                              fontSize: "0.68rem",
                              fontWeight: 800,
                              backgroundColor: log.severity === "error" ? "rgba(239, 68, 68, 0.2)" : log.severity === "warning" ? "rgba(245, 158, 11, 0.2)" : "rgba(59, 130, 246, 0.15)",
                              color: log.severity === "error" ? "#f87171" : log.severity === "warning" ? "#fbbf24" : "#93c5fd"
                            }}
                          >
                            {log.severity?.toUpperCase()}
                          </span>
                        </td>

                        <td style={{ padding: "10px 14px", color: "rgba(255,255,255,0.6)", fontSize: "0.74rem", fontWeight: 600 }}>
                          {log.event_type}
                        </td>

                        <td style={{ padding: "10px 14px", fontWeight: 600, color: "#ffffff" }}>
                          {log.title_vi}
                        </td>

                        <td style={{ padding: "10px 14px", color: "rgba(255,255,255,0.55)", fontSize: "0.75rem" }}>
                          {log.user_email}
                        </td>

                        <td style={{ padding: "10px 14px", color: "rgba(255,255,255,0.45)", fontSize: "0.74rem" }}>
                          {devInfo}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ── MODAL: LOG DETAILS INSPECTOR ── */}
      <AnimatePresence>
        {selectedLogDetail && (
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
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              style={{
                width: "100%",
                maxWidth: "640px",
                backgroundColor: "#0f0f18",
                borderRadius: "20px",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "16px"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h4 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800 }}>Chi Tiết Sự Kiện</h4>
                <button
                  onClick={() => setSelectedLogDetail(null)}
                  style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer" }}
                >
                  <X size={18} />
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "0.82rem" }}>
                <p style={{ margin: 0, color: "#ffffff", fontWeight: 700 }}>{selectedLogDetail.title_vi}</p>
                <span style={{ color: "rgba(255,255,255,0.45)" }}>Thời gian: {selectedLogDetail.created_at}</span>
                <span style={{ color: "rgba(255,255,255,0.45)" }}>Email: {selectedLogDetail.user_email}</span>
              </div>

              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "rgba(255,255,255,0.6)" }}>Dữ Liệu JSON Chi Tiết:</label>
                <pre
                  style={{
                    marginTop: "6px",
                    padding: "12px",
                    borderRadius: "10px",
                    backgroundColor: "rgba(0, 0, 0, 0.6)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    color: "#a5b4fc",
                    fontSize: "0.75rem",
                    overflowX: "auto",
                    maxHeight: "240px"
                  }}
                >
                  {JSON.stringify(JSON.parse(selectedLogDetail.details_json || "{}"), null, 2)}
                </pre>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MODAL: CREATE ALBUM ── */}
      <AnimatePresence>
        {isNewAlbumModalOpen && (
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
                maxWidth: "500px",
                backgroundColor: "#0d0d14",
                borderRadius: "20px",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "14px"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800 }}>Tạo Bản Phát Hành Mới</h3>
                <button
                  onClick={() => setIsNewAlbumModalOpen(false)}
                  style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer" }}
                >
                  <X size={18} />
                </button>
              </div>

              <div>
                <label style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.7)", fontWeight: 700 }}>Tên Album / Single *</label>
                <input
                  type="text"
                  placeholder="VD: HVL (99%)"
                  value={albumForm.title}
                  onChange={(e) => setAlbumForm({ ...albumForm, title: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", marginTop: "4px" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.7)", fontWeight: 700 }}>Nghệ Sĩ Trình Bày</label>
                <input
                  type="text"
                  value={albumForm.artist}
                  onChange={(e) => setAlbumForm({ ...albumForm, artist: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", marginTop: "4px" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.7)", fontWeight: 700 }}>URL Ảnh Bìa (Cover URL)</label>
                <input
                  type="text"
                  value={albumForm.cover_url}
                  onChange={(e) => setAlbumForm({ ...albumForm, cover_url: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", marginTop: "4px" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
                <button
                  onClick={() => setIsNewAlbumModalOpen(false)}
                  style={{ padding: "8px 16px", borderRadius: "8px", backgroundColor: "rgba(255,255,255,0.06)", border: "none", color: "#fff", cursor: "pointer" }}
                >
                  Hủy
                </button>
                <button
                  onClick={handleCreateAlbum}
                  style={{ padding: "8px 18px", borderRadius: "8px", backgroundColor: "#6366f1", border: "none", color: "#fff", fontWeight: 700, cursor: "pointer" }}
                >
                  Tạo Release
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MODAL: CREATE TRACK ── */}
      <AnimatePresence>
        {isNewTrackModalOpen && (
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
                maxWidth: "540px",
                backgroundColor: "#0d0d14",
                borderRadius: "20px",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "14px"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800 }}>Thêm Bài Hát Mới vào {currentAlbum?.title}</h3>
                <button
                  onClick={() => setIsNewTrackModalOpen(false)}
                  style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer" }}
                >
                  <X size={18} />
                </button>
              </div>

              <div>
                <label style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.7)", fontWeight: 700 }}>Tên Bài Hát *</label>
                <input
                  type="text"
                  placeholder="VD: 02. IDK"
                  value={trackForm.title}
                  onChange={(e) => setTrackForm({ ...trackForm, title: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", marginTop: "4px" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.7)", fontWeight: 700 }}>Đường dẫn Âm thanh (Audio Stream URL) *</label>
                <input
                  type="text"
                  placeholder="https://media.postlain.com/audio/02.%20IDK.flac"
                  value={trackForm.audio_url}
                  onChange={(e) => setTrackForm({ ...trackForm, audio_url: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", marginTop: "4px" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.7)", fontWeight: 700 }}>URL Video MV 4K (Tùy chọn)</label>
                <input
                  type="text"
                  placeholder="https://media.postlain.com/videos/02.%20IDK%20-%20MCK.mkv"
                  value={trackForm.video_url || ""}
                  onChange={(e) => setTrackForm({ ...trackForm, video_url: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", marginTop: "4px" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
                <button
                  onClick={() => setIsNewTrackModalOpen(false)}
                  style={{ padding: "8px 16px", borderRadius: "8px", backgroundColor: "rgba(255,255,255,0.06)", border: "none", color: "#fff", cursor: "pointer" }}
                >
                  Hủy
                </button>
                <button
                  onClick={handleCreateTrack}
                  style={{ padding: "8px 18px", borderRadius: "8px", backgroundColor: "#6366f1", border: "none", color: "#fff", fontWeight: 700, cursor: "pointer" }}
                >
                  Lưu Bài Hát
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MODAL: SECTION EDITOR ── */}
      <SectionElementEditorModal
        isOpen={!!editingSection}
        onClose={() => setEditingSection(null)}
        section={editingSection}
        albums={adminAlbums}
        allTracks={queue}
        onSave={async (newConfig, newTitle) => {
          if (!editingSection) return;
          try {
            const res = await fetch(`${API_BASE}/api/admin/sections/${editingSection.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
              body: JSON.stringify({ title: newTitle, config: newConfig })
            });
            const data = await res.json();
            if (data.success) {
              showToast(`Đã lưu cấu hình Element "${newTitle}"!`);
              loadSections();
            }
          } catch {}
        }}
      />

      {/* ── MODAL: ADD SECTION PRESET ── */}
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
                maxWidth: "580px",
                backgroundColor: "#0d0d14",
                borderRadius: "20px",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "16px"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 900 }}>Chọn Template Cho Section Mới</h3>
                <button
                  onClick={() => setIsNewSectionModalOpen(false)}
                  style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer" }}
                >
                  <X size={18} />
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "60vh", overflowY: "auto" }}>
                {TEMPLATE_PRESETS.map((preset) => {
                  const Icon = preset.icon;
                  return (
                    <div
                      key={preset.type}
                      onClick={() => handleAddPresetSection(preset)}
                      style={{
                        padding: "12px 16px",
                        borderRadius: "12px",
                        backgroundColor: "rgba(255, 255, 255, 0.04)",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        cursor: "pointer"
                      }}
                    >
                      <div style={{ width: "36px", height: "36px", borderRadius: "8px", backgroundColor: "rgba(99, 102, 241, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#a5b4fc" }}>
                        <Icon size={16} />
                      </div>
                      <div>
                        <h4 style={{ margin: 0, fontSize: "0.9rem", fontWeight: 700 }}>{preset.name}</h4>
                        <p style={{ margin: 0, fontSize: "0.72rem", color: "rgba(255, 255, 255, 0.45)" }}>{preset.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MODAL: CONFIRM DELETE ALBUM (ACCIDENTAL DATA LOSS PREVENTION) ── */}
      <AnimatePresence>
        {albumToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0, 0, 0, 0.85)",
              backdropFilter: "blur(18px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10000,
              padding: "20px"
            }}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              style={{
                width: "100%",
                maxWidth: "460px",
                backgroundColor: "#0f0e15",
                borderRadius: "20px",
                border: "1px solid rgba(239, 68, 68, 0.4)",
                boxShadow: "0 25px 60px rgba(0, 0, 0, 0.9), 0 0 30px rgba(239, 68, 68, 0.2)",
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "16px"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "42px", height: "42px", borderRadius: "10px", backgroundColor: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.35)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ef4444", flexShrink: 0 }}>
                  <Trash2 size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800, color: "#ffffff" }}>
                    Xác Nhận Xóa Bản Phát Hành?
                  </h3>
                  <span style={{ fontSize: "0.74rem", color: "rgba(255, 255, 255, 0.5)" }}>
                    Hành động này không thể hoàn tác
                  </span>
                </div>
              </div>

              <div style={{ padding: "12px 14px", borderRadius: "12px", backgroundColor: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
                <p style={{ margin: 0, fontSize: "0.85rem", color: "#ffffff", fontWeight: 700 }}>
                  {albumToDelete.title}
                </p>
                <p style={{ margin: "4px 0 0", fontSize: "0.75rem", color: "rgba(255, 255, 255, 0.6)" }}>
                  {albumToDelete.artist} • {albumToDelete.type?.toUpperCase()}
                </p>
                <p style={{ margin: "8px 0 0", fontSize: "0.72rem", color: "#f87171", lineHeight: 1.4 }}>
                  ⚠️ Khi xóa, toàn bộ các bài hát, video và lượt yêu thích liên quan của bản phát hành này trong hệ cơ sở dữ liệu sẽ bị xóa.
                </p>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "4px" }}>
                <button
                  disabled={isDeletingAlbum}
                  onClick={() => setAlbumToDelete(null)}
                  style={{
                    padding: "8px 18px",
                    borderRadius: "10px",
                    backgroundColor: "rgba(255, 255, 255, 0.06)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    color: "#ffffff",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  Hủy bỏ
                </button>
                <button
                  disabled={isDeletingAlbum}
                  onClick={handleDeleteAlbum}
                  style={{
                    padding: "8px 20px",
                    borderRadius: "10px",
                    backgroundColor: "#ef4444",
                    border: "none",
                    color: "#ffffff",
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    cursor: isDeletingAlbum ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    boxShadow: "0 4px 14px rgba(239, 68, 68, 0.45)",
                    opacity: isDeletingAlbum ? 0.6 : 1
                  }}
                >
                  <Trash2 size={14} />
                  <span>{isDeletingAlbum ? "Đang xóa..." : "Xác nhận Xóa"}</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPortal;
