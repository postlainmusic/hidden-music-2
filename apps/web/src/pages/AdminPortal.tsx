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
  UserX,
  Disc3,
  FolderPlus,
  Settings,
  FolderOpen
} from "lucide-react";
import { useAudioStore, Track, HomeSection, VaultSlot, SectionTemplateType, Album, ReleaseType, DEFAULT_TRACKS } from "../store/audioStore";
import { useIsMobile } from "../hooks/useIsMobile";

const API_BASE = "https://hidden-music-api.postlain-music.workers.dev";
const R2_BASE = "https://media.postlain.com";
const HVL_COVER = "https://media.postlain.com/covers/HVL_Album_Cover.jpg";

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
      cover_url: HVL_COVER,
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
      banner_url: HVL_COVER,
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
      avatar_url: HVL_COVER,
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

  // Active Deck State
  const [activeDeck, setActiveDeck] = useState<"sections" | "media" | "releases" | "audience" | "infra">("releases");

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

  // Ingestion Bay State
  const [externalUrl, setExternalUrl] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);

  // Modals State
  const [isNewAlbumModalOpen, setIsNewAlbumModalOpen] = useState(false);
  const [isNewTrackModalOpen, setIsNewTrackModalOpen] = useState(false);
  const [isNewSectionModalOpen, setIsNewSectionModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<HomeSection | null>(null);
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
    genre: "Hip-Hop / Rap"
  });

  const [trackForm, setTrackForm] = useState<{
    id: string;
    title: string;
    artist: string;
    duration_sec: number;
    audio_url: string;
    video_url: string;
    bpm: number;
    genre: string;
    lyrics_synced: string;
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

  const waveformCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const token = typeof window !== "undefined" ? localStorage.getItem("vault_token") : null;

  // Show auto-dismiss status toast
  const showToast = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // Fetch initial Admin Data
  const fetchAdminData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [albumsRes, usersRes, statsRes, filesRes] = await Promise.all([
        fetch(`${API_BASE}/api/albums`),
        fetch(`${API_BASE}/api/admin/users`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/api/admin/stats/overview`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/api/admin/r2/files`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      const [albumsData, usersData, statsData, filesData] = await Promise.all([
        albumsRes.json(),
        usersRes.json(),
        statsRes.json(),
        filesRes.json()
      ]);

      if (albumsData.success && albumsData.albums) {
        setAdminAlbums(albumsData.albums);
        if (albumsData.albums.length > 0 && !selectedAlbumId) {
          setSelectedAlbumId(albumsData.albums[0].id);
        }
      }
      if (usersData.success && usersData.users) setAdminUsers(usersData.users);
      if (statsData.success && statsData.stats) setAdminStats(statsData.stats);
      if (filesData.success && filesData.files) setR2Files(filesData.files);
    } catch (err) {
      console.warn("Fetch admin data notice:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Tracks for Selected Album
  const fetchAlbumTracks = async (albumId: string) => {
    if (!albumId) return;
    try {
      const res = await fetch(`${API_BASE}/api/albums/${albumId}/tracks`);
      const data = await res.json();
      if (data.success && Array.isArray(data.tracks) && data.tracks.length > 0) {
        const mapped: Track[] = data.tracks.map((t: any) => ({
          id: t.id,
          album_id: t.album_id || albumId,
          title: t.title,
          artist: t.artist || "MCK",
          album: t.album || "HVL",
          duration: t.duration_sec || t.duration || 200,
          coverUrl: t.cover_url || t.coverUrl || HVL_COVER,
          audioUrl: t.audio_url || t.audioUrl,
          videoUrl: t.video_url || t.videoUrl,
          r2Key: t.r2_key || t.r2Key,
          bpm: t.bpm || 120,
          genre: t.genre || t.mood_tier || "Melodic Rap",
          lyricsSynced: t.lyrics_synced || t.lyricsSynced || "",
          palette: typeof t.palette_json === "string" ? JSON.parse(t.palette_json) : t.palette || { primary: "#6366f1", secondary: "#ec4899", accent: "#8b5cf6", glow: "rgba(99, 102, 241, 0.45)" }
        }));
        setSelectedAlbumTracks(mapped);
      } else {
        // Fallback to /api/tracks if album_id tracks is empty
        const allRes = await fetch(`${API_BASE}/api/tracks`);
        const allData = await allRes.json();
        if (allData.success && Array.isArray(allData.tracks)) {
          const filtered = allData.tracks.filter((t: any) => !t.album_id || t.album_id === albumId || albumId === "hvl-99");
          const mapped: Track[] = filtered.map((t: any) => ({
            id: t.id,
            album_id: t.album_id || albumId,
            title: t.title,
            artist: t.artist || "MCK",
            album: t.album || "HVL",
            duration: t.duration_sec || t.duration || 200,
            coverUrl: t.cover_url || t.coverUrl || HVL_COVER,
            audioUrl: t.audio_url || t.audioUrl,
            videoUrl: t.video_url || t.videoUrl,
            r2Key: t.r2_key || t.r2Key,
            bpm: t.bpm || 120,
            genre: t.genre || t.mood_tier || "Melodic Rap",
            lyricsSynced: t.lyrics_synced || t.lyricsSynced || "",
            palette: typeof t.palette_json === "string" ? JSON.parse(t.palette_json) : t.palette || { primary: "#6366f1", secondary: "#ec4899", accent: "#8b5cf6", glow: "rgba(99, 102, 241, 0.45)" }
          }));
          setSelectedAlbumTracks(mapped);
        }
      }
    } catch (err) {
      console.warn("Fetch album tracks notice:", err);
    }
  };

  useEffect(() => {
    if (token && (currentUser?.role === "admin" || ["postlainmusic@gmail.com", "postlain.music@gmail.com", "studionopu@gmail.com"].includes(currentUser?.email || ""))) {
      fetchAdminData();
    }
    loadSections();
    loadAlbums();
  }, [token, currentUser]);

  useEffect(() => {
    if (selectedAlbumId) {
      fetchAlbumTracks(selectedAlbumId);
    }
  }, [selectedAlbumId]);

  // Waveform visualization canvas
  useEffect(() => {
    const canvas = waveformCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = (canvas.width = canvas.parentElement?.clientWidth || 600);
    const height = (canvas.height = 80);

    ctx.clearRect(0, 0, width, height);
    const slices = 100;
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

  // 1. Seed D1 with 30 HVL Tracks
  const handleSeedHvl = async () => {
    setLoading(true);
    showToast("Đang đồng bộ Album HVL (99%) và 30 Lossless Tracks vào Cloudflare D1 Database...");
    const res = await seedHvlToD1();
    setLoading(false);
    if (res.success) {
      showToast(res.message);
      await fetchAdminData();
      if (selectedAlbumId === "hvl-99") {
        await fetchAlbumTracks("hvl-99");
      }
    } else {
      showToast(`Lỗi: ${res.message}`);
    }
  };

  // 2. Create Album / Single / EP
  const handleCreateAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!albumForm.title.trim()) {
      showToast("Vui lòng nhập tên Album/Single/EP");
      return;
    }
    const albumId = albumForm.id.trim() || `alb_${Date.now()}`;
    try {
      const res = await fetch(`${API_BASE}/api/admin/albums`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...albumForm,
          id: albumId
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Đã tạo ${albumForm.type.toUpperCase()} thành công: ${albumForm.title}`);
        setIsNewAlbumModalOpen(false);
        setAlbumForm({
          id: "",
          title: "",
          artist: "MCK",
          cover_url: HVL_COVER,
          type: "album",
          release_year: new Date().getFullYear(),
          genre: "Hip-Hop / Rap"
        });
        await fetchAdminData();
        setSelectedAlbumId(albumId);
      } else {
        showToast(data.error || "Lỗi tạo Album");
      }
    } catch (err: any) {
      showToast(err.message || "Lỗi kết nối tạo Album");
    }
  };

  // 3. Delete Album
  const handleDeleteAlbum = async (albumId: string, title: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa bản phát hành "${title}" và toàn bộ các bài hát bên trong?`)) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/albums/${albumId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Đã xóa "${title}" thành công!`);
        await fetchAdminData();
        setSelectedAlbumId("hvl-99");
      }
    } catch (err) {
      showToast("Lỗi xóa Album");
    }
  };

  // 4. Create or Update Track in Selected Album
  const handleSaveTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackForm.title.trim() || !trackForm.audio_url.trim()) {
      showToast("Vui lòng nhập tiêu đề bài hát và link audio");
      return;
    }
    const trackId = editingTrack ? editingTrack.id : trackForm.id.trim() || `track_${Date.now()}`;
    const targetAlbum = adminAlbums.find((a) => a.id === selectedAlbumId) || { cover_url: HVL_COVER, title: "HVL" };

    try {
      const isEdit = !!editingTrack;
      const url = isEdit ? `${API_BASE}/api/admin/tracks/${editingTrack.id}` : `${API_BASE}/api/admin/tracks`;
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          id: trackId,
          album_id: selectedAlbumId,
          title: trackForm.title,
          artist: trackForm.artist,
          duration_sec: trackForm.duration_sec,
          audio_url: trackForm.audio_url,
          video_url: trackForm.video_url || null,
          cover_url: targetAlbum.cover_url || HVL_COVER,
          bpm: trackForm.bpm,
          genre: trackForm.genre,
          lyrics_synced: trackForm.lyrics_synced
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(isEdit ? "Đã cập nhật bài hát thành công!" : "Đã thêm bài hát vào bản phát hành!");
        setIsNewTrackModalOpen(false);
        setEditingTrack(null);
        setTrackForm({
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
        await fetchAlbumTracks(selectedAlbumId);
        loadTracks();
      } else {
        showToast(data.error || "Lỗi lưu bài hát");
      }
    } catch (err: any) {
      showToast(err.message || "Lỗi kết nối");
    }
  };

  // 5. Delete Track
  const handleDeleteTrack = async (trackId: string, title: string) => {
    if (!window.confirm(`Xóa bài hát "${title}" khỏi bản phát hành?`)) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/tracks/${trackId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        showToast("Đã xóa bài hát!");
        await fetchAlbumTracks(selectedAlbumId);
        loadTracks();
      }
    } catch (err) {
      showToast("Lỗi xóa bài hát");
    }
  };

  // 6. Inline Save Track Title
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
        await fetchAlbumTracks(selectedAlbumId);
      }
    } catch (err) {
      showToast("Lỗi lưu bài hát");
    }
  };

  // 7. Dynamic Sections Actions
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
      showToast("Lỗi thêm section");
    }
  };

  const handleMoveSection = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const newSections = [...sections];
    const temp = newSections[index];
    newSections[index] = newSections[targetIndex];
    newSections[targetIndex] = temp;

    const reorderItems = newSections.map((s, idx) => ({ id: s.id, order_index: idx + 1 }));

    try {
      const res = await fetch(`${API_BASE}/api/admin/sections/reorder`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ items: reorderItems })
      });
      const data = await res.json();
      if (data.success) {
        loadSections();
      }
    } catch (err) {
      showToast("Lỗi sắp xếp section");
    }
  };

  // 8. Ingestion Extract
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
        setExtractedData(data);
        setTrackForm((prev) => ({
          ...prev,
          title: data.title || prev.title,
          artist: data.artist || prev.artist,
          audio_url: data.audioUrl || prev.audio_url,
          video_url: data.videoUrl || prev.video_url
        }));
        showToast(`Đã bóc tách thành công từ ${data.platform.toUpperCase()}!`);
      }
    } catch (err) {
      showToast("Lỗi trích xuất metadata từ link ngoài");
    } finally {
      setIsExtracting(false);
    }
  };

  // 9. Users & Access Management
  const handleUpdateUserRole = async (userId: string, role: "admin" | "vip" | "free") => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${userId}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ role })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Đã nâng cấp vai trò người dùng thành: ${role.toUpperCase()}`);
        fetchAdminData();
      }
    } catch (err) {
      showToast("Lỗi cập nhật vai trò người dùng");
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "banned" : "active";
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${userId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Đã ${newStatus === "banned" ? "khóa" : "mở khóa"} người dùng!`);
        fetchAdminData();
      }
    } catch (err) {
      showToast("Lỗi cập nhật trạng thái");
    }
  };

  // 10. Purge Edge Cache & Backup
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

  const isAdmin =
    currentUser?.role === "admin" ||
    ["postlainmusic@gmail.com", "postlain.music@gmail.com", "studionopu@gmail.com"].includes(currentUser?.email || "");

  const activeAlbum = adminAlbums.find((a) => a.id === selectedAlbumId) || adminAlbums[0] || {
    id: "hvl-99",
    title: "HVL (99%)",
    artist: "MCK",
    type: "album",
    cover_url: HVL_COVER,
    genre: "Hip-Hop / Rap",
    release_year: 2024
  };

  if (!currentUser || !isAdmin) {
    return (
      <div
        className="admin-scroll-viewport"
        style={{
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
              justifyContent: "center"
            }}
          >
            <Shield size={28} color="#6366f1" />
          </div>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 800, margin: 0 }}>VAULT MONOLITH MATRIX</h2>
          <p style={{ color: "rgba(255, 255, 255, 0.55)", fontSize: "0.85rem", margin: 0, lineHeight: 1.5 }}>
            Khu vực Quản trị Hệ thống Yêu cầu Quyền Admin.
          </p>
          <div style={{ padding: "10px", borderRadius: "12px", backgroundColor: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#fca5a5", fontSize: "0.78rem" }}>
            Tài khoản (<strong>{currentUser?.email || "Chưa đăng nhập"}</strong>) chưa có quyền truy cập.
          </div>
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
            Quay lại Vault
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="admin-scroll-viewport"
      style={{
        backgroundColor: "#030305",
        color: "#ffffff",
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
              backgroundColor: "rgba(10, 11, 16, 0.95)",
              backdropFilter: "blur(24px)",
              border: "1px solid rgba(99, 102, 241, 0.5)",
              color: "#ffffff",
              fontSize: "0.88rem",
              fontWeight: 600,
              boxShadow: "0 0 30px rgba(99, 102, 241, 0.4)",
              zIndex: 1000,
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
          padding: "16px 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          background: "rgba(10, 11, 16, 0.85)",
          backdropFilter: "blur(24px)",
          position: "sticky",
          top: 0,
          zIndex: 40
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
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
            <h1 style={{ fontSize: "1.2rem", fontWeight: 800, letterSpacing: "0.04em", margin: 0 }}>
              VAULT MONOLITH MATRIX
            </h1>
            <span style={{ fontSize: "0.72rem", color: "rgba(255, 255, 255, 0.45)" }}>
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
            title="Tải lại dữ liệu"
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
          padding: "14px 20px",
          background: "rgba(5, 5, 8, 0.75)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
          overflowX: "auto",
          position: "sticky",
          top: "65px",
          zIndex: 35,
          backdropFilter: "blur(20px)"
        }}
      >
        {[
          { id: "releases", label: "Releases & Tracklists (D1)", icon: Disc3 },
          { id: "sections", label: "Dynamic Sections Studio", icon: Layout },
          { id: "media", label: "Ingestion & Waveform Bay", icon: Upload },
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
                padding: "9px 16px",
                borderRadius: "12px",
                backgroundColor: isActive ? "rgba(99, 102, 241, 0.22)" : "rgba(255, 255, 255, 0.04)",
                border: `1px solid ${isActive ? "rgba(99, 102, 241, 0.6)" : "rgba(255, 255, 255, 0.08)"}`,
                color: isActive ? "#ffffff" : "rgba(255, 255, 255, 0.6)",
                fontSize: "0.82rem",
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
      <div style={{ flex: 1, padding: "24px 28px 60px", maxWidth: "1440px", width: "100%", margin: "0 auto" }}>
        
        {/* ====================================================================
            DECK 1: RELEASES & TRACKLISTS MATRIX (HIERARCHICAL RELEASES -> TRACKS)
        ===================================================================== */}
        {activeDeck === "releases" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Header & Main Actions */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
              <div>
                <h2 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: "4px", display: "flex", alignItems: "center", gap: "10px" }}>
                  <Disc3 size={24} color="#6366f1" />
                  Quy Trình Quản Trị: Album / Single / EP ➔ Tracklist
                </h2>
                <p style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: "0.85rem", margin: 0 }}>
                  Quản lý phân cấp chuẩn: Tạo bản phát hành (Album/Single/EP) trước, sau đó thêm và quản lý các bài hát trực tiếp bên trong.
                </p>
              </div>

              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <button
                  onClick={handleSeedHvl}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 18px",
                    borderRadius: "999px",
                    background: "rgba(16, 185, 129, 0.15)",
                    border: "1px solid rgba(16, 185, 129, 0.4)",
                    color: "#34d399",
                    fontWeight: 700,
                    fontSize: "0.84rem",
                    cursor: "pointer"
                  }}
                >
                  <Sparkles size={16} />
                  ⚡ Đồng bộ 30 bài HVL vào D1
                </button>

                <button
                  onClick={() => setIsNewAlbumModalOpen(true)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 20px",
                    borderRadius: "999px",
                    background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
                    border: "none",
                    color: "#ffffff",
                    fontWeight: 700,
                    fontSize: "0.84rem",
                    cursor: "pointer",
                    boxShadow: "0 0 20px rgba(99, 102, 241, 0.4)"
                  }}
                >
                  <Plus size={16} />
                  Tạo Bản Phát Hành Mới
                </button>
              </div>
            </div>

            {/* 2-Column Hierarchical Studio Layout */}
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "360px 1fr", gap: "24px", alignItems: "start" }}>
              
              {/* LEFT COLUMN: Releases / Albums List */}
              <div
                style={{
                  backgroundColor: "rgba(10, 11, 16, 0.7)",
                  backdropFilter: "blur(20px)",
                  borderRadius: "20px",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  padding: "18px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "rgba(255, 255, 255, 0.7)" }}>
                    DANH SÁCH BẢN PHÁT HÀNH ({adminAlbums.length})
                  </span>
                  <button
                    onClick={() => setIsNewAlbumModalOpen(true)}
                    style={{ background: "none", border: "none", color: "#6366f1", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "0.78rem", fontWeight: 700 }}
                  >
                    <Plus size={14} /> Thêm
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {adminAlbums.map((album) => {
                    const isSelected = selectedAlbumId === album.id;
                    const typeColor = album.type === "ep" ? "#f59e0b" : album.type === "single" ? "#a855f7" : "#06b6d4";
                    return (
                      <div
                        key={album.id}
                        onClick={() => setSelectedAlbumId(album.id)}
                        style={{
                          padding: "12px 14px",
                          borderRadius: "14px",
                          backgroundColor: isSelected ? "rgba(99, 102, 241, 0.18)" : "rgba(255, 255, 255, 0.03)",
                          border: `1px solid ${isSelected ? "rgba(99, 102, 241, 0.5)" : "rgba(255, 255, 255, 0.06)"}`,
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          cursor: "pointer",
                          transition: "all 0.2s ease"
                        }}
                      >
                        <img
                          src={album.cover_url || HVL_COVER}
                          alt={album.title}
                          style={{ width: "48px", height: "48px", borderRadius: "10px", objectFit: "cover", backgroundColor: "#000000" }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
                            <span
                              style={{
                                padding: "2px 6px",
                                borderRadius: "4px",
                                backgroundColor: `${typeColor}22`,
                                border: `1px solid ${typeColor}66`,
                                color: typeColor,
                                fontSize: "0.65rem",
                                fontWeight: 800
                              }}
                            >
                              {(album.type || "album").toUpperCase()}
                            </span>
                            <span style={{ fontSize: "0.72rem", color: "rgba(255, 255, 255, 0.4)" }}>
                              {album.release_year || 2024}
                            </span>
                          </div>
                          <h4 style={{ margin: 0, fontSize: "0.9rem", fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {album.title}
                          </h4>
                          <span style={{ fontSize: "0.75rem", color: "rgba(255, 255, 255, 0.45)" }}>
                            {album.artist} • {album.track_count || selectedAlbumTracks.length || 0} bài hát
                          </span>
                        </div>

                        {album.id !== "hvl-99" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteAlbum(album.id, album.title);
                            }}
                            style={{ background: "none", border: "none", color: "rgba(255, 255, 255, 0.3)", cursor: "pointer", padding: "4px" }}
                            title="Xóa Release"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* RIGHT COLUMN: Selected Album Inspector & Tracklist */}
              <div
                style={{
                  backgroundColor: "rgba(10, 11, 16, 0.7)",
                  backdropFilter: "blur(20px)",
                  borderRadius: "20px",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  padding: "24px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px"
                }}
              >
                {/* Active Album Banner */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "18px 20px",
                    borderRadius: "16px",
                    backgroundColor: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    flexWrap: "wrap",
                    gap: "16px"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <img
                      src={activeAlbum.cover_url || HVL_COVER}
                      alt={activeAlbum.title}
                      style={{ width: "72px", height: "72px", borderRadius: "14px", objectFit: "cover", boxShadow: "0 8px 24px rgba(0,0,0,0.5)" }}
                    />
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                        <span
                          style={{
                            padding: "3px 8px",
                            borderRadius: "6px",
                            backgroundColor: "rgba(99, 102, 241, 0.2)",
                            border: "1px solid rgba(99, 102, 241, 0.4)",
                            color: "#a5b4fc",
                            fontSize: "0.72rem",
                            fontWeight: 800
                          }}
                        >
                          {(activeAlbum.type || "album").toUpperCase()}
                        </span>
                        <span style={{ fontSize: "0.8rem", color: "rgba(255, 255, 255, 0.4)" }}>
                          Năm {activeAlbum.release_year || 2024} • Thể loại: {activeAlbum.genre || "Hip-Hop / Rap"}
                        </span>
                      </div>
                      <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800 }}>{activeAlbum.title}</h3>
                      <span style={{ fontSize: "0.82rem", color: "rgba(255, 255, 255, 0.55)" }}>
                        Nghệ sĩ: {activeAlbum.artist} • Tổng: {selectedAlbumTracks.length} bài hát Lossless
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setEditingTrack(null);
                      setTrackForm({
                        id: "",
                        title: "",
                        artist: activeAlbum.artist || "MCK",
                        duration_sec: 200,
                        audio_url: "",
                        video_url: "",
                        bpm: 120,
                        genre: activeAlbum.genre || "Melodic Rap",
                        lyrics_synced: ""
                      });
                      setIsNewTrackModalOpen(true);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "10px 18px",
                      borderRadius: "999px",
                      background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
                      border: "none",
                      color: "#ffffff",
                      fontWeight: 700,
                      fontSize: "0.84rem",
                      cursor: "pointer"
                    }}
                  >
                    <Plus size={16} />
                    Thêm Bài Hát Vào Bản Phát Hành
                  </button>
                </div>

                {/* Tracklist Inside Release */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {selectedAlbumTracks.length === 0 ? (
                    <div style={{ padding: "40px 20px", textAlign: "center", color: "rgba(255,255,255,0.4)" }}>
                      Chưa có bài hát nào trong bản phát hành này. Nhấn "Thêm Bài Hát" hoặc "Đồng bộ HVL vào D1".
                    </div>
                  ) : (
                    selectedAlbumTracks.map((track, idx) => {
                      const isCurrentPlaying = isPlaying && currentTrack?.id === track.id;
                      return (
                        <div
                          key={track.id || idx}
                          style={{
                            padding: "12px 18px",
                            borderRadius: "14px",
                            backgroundColor: isCurrentPlaying ? "rgba(99, 102, 241, 0.15)" : "rgba(255, 255, 255, 0.03)",
                            border: `1px solid ${isCurrentPlaying ? "rgba(99, 102, 241, 0.4)" : "rgba(255, 255, 255, 0.06)"}`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: "14px",
                            transition: "all 0.2s ease"
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "14px", flex: 1, minWidth: 0 }}>
                            {/* Play Preview Button */}
                            <button
                              onClick={() => {
                                if (isCurrentPlaying) {
                                  togglePlay();
                                } else {
                                  playTrack(track);
                                }
                              }}
                              style={{
                                width: "36px",
                                height: "36px",
                                borderRadius: "50%",
                                backgroundColor: isCurrentPlaying ? "#6366f1" : "rgba(255, 255, 255, 0.08)",
                                border: "none",
                                color: "#ffffff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer"
                              }}
                            >
                              {isCurrentPlaying ? <Pause size={15} /> : <Play size={15} style={{ marginLeft: "2px" }} />}
                            </button>

                            {/* Track Details & Inline Edit */}
                            <div style={{ flex: 1, minWidth: 0 }}>
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
                                  style={{ margin: 0, fontSize: "0.92rem", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                                  title="Click đúp để sửa tên nhanh"
                                >
                                  {track.title}
                                </h4>
                              )}
                              <span style={{ fontSize: "0.75rem", color: "rgba(255, 255, 255, 0.45)" }}>
                                {track.artist} • {track.genre || "Lossless"} • BPM: {track.bpm || 120}
                              </span>
                            </div>
                          </div>

                          {/* Badges & Action Controls */}
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <span
                              style={{
                                padding: "4px 8px",
                                borderRadius: "999px",
                                backgroundColor: "rgba(99, 102, 241, 0.15)",
                                border: "1px solid rgba(99, 102, 241, 0.3)",
                                color: "#a5b4fc",
                                fontSize: "0.7rem",
                                fontWeight: 700
                              }}
                            >
                              {track.videoUrl ? "4K MKV + FLAC" : "LOSSLESS FLAC"}
                            </span>

                            <button
                              onClick={() => {
                                setEditingTrack(track);
                                setTrackForm({
                                  id: track.id,
                                  title: track.title,
                                  artist: track.artist,
                                  duration_sec: track.duration || 200,
                                  audio_url: track.audioUrl,
                                  video_url: track.videoUrl || "",
                                  bpm: track.bpm || 120,
                                  genre: track.genre || "Melodic Rap",
                                  lyrics_synced: track.lyricsSynced || ""
                                });
                                setIsNewTrackModalOpen(true);
                              }}
                              style={{ background: "none", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer" }}
                              title="Sửa chi tiết bài hát"
                            >
                              <Edit2 size={15} />
                            </button>

                            <button
                              onClick={() => handleDeleteTrack(track.id, track.title)}
                              style={{ background: "none", border: "none", color: "rgba(239, 68, 68, 0.6)", cursor: "pointer" }}
                              title="Xóa bài hát"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ====================================================================
            DECK 2: DYNAMIC SECTIONS STUDIO & LIVE PREVIEW
        ===================================================================== */}
        {activeDeck === "sections" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Header & Controls */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
              <div>
                <h2 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: "4px" }}>
                  Dynamic Home Sections Studio (1..N)
                </h2>
                <p style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: "0.85rem", margin: 0 }}>
                  Thêm, xóa, sắp xếp và tùy biến cấu hình 7 template section xuất hiện trên Trang Chủ theo thứ tự bất kỳ.
                </p>
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  onClick={() => setShowLivePreview(!showLivePreview)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 18px",
                    borderRadius: "999px",
                    backgroundColor: showLivePreview ? "rgba(236, 72, 153, 0.2)" : "rgba(255, 255, 255, 0.08)",
                    border: `1px solid ${showLivePreview ? "#ec4899" : "rgba(255, 255, 255, 0.15)"}`,
                    color: showLivePreview ? "#f472b6" : "#ffffff",
                    fontSize: "0.84rem",
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                >
                  <Eye size={16} />
                  {showLivePreview ? "Tắt Live Preview" : "Bật Live Preview"}
                </button>

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
                    fontWeight: 700,
                    fontSize: "0.84rem",
                    cursor: "pointer"
                  }}
                >
                  <Plus size={16} />
                  Thêm Section Mới
                </button>
              </div>
            </div>

            {/* Split Screen Layout */}
            <div style={{ display: "grid", gridTemplateColumns: showLivePreview ? "1fr 1fr" : "1fr", gap: "24px" }}>
              {/* Sections List */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {sections.map((section, idx) => (
                  <div
                    key={section.id}
                    style={{
                      padding: "16px 20px",
                      borderRadius: "16px",
                      backgroundColor: "rgba(10, 11, 16, 0.75)",
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
                          width: "28px",
                          height: "28px",
                          borderRadius: "8px",
                          backgroundColor: "rgba(99, 102, 241, 0.2)",
                          color: "#a5b4fc",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.8rem",
                          fontWeight: 800
                        }}
                      >
                        {idx + 1}
                      </span>
                      <div>
                        <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700 }}>{section.title}</h4>
                        <span style={{ fontSize: "0.72rem", color: "rgba(255, 255, 255, 0.4)" }}>
                          TEMPLATE: {section.template_type.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      {/* Reorder Buttons */}
                      <button
                        onClick={() => handleMoveSection(idx, "up")}
                        disabled={idx === 0}
                        style={{ background: "none", border: "none", color: idx === 0 ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.6)", cursor: idx === 0 ? "default" : "pointer" }}
                      >
                        <ChevronUp size={16} />
                      </button>
                      <button
                        onClick={() => handleMoveSection(idx, "down")}
                        disabled={idx === sections.length - 1}
                        style={{ background: "none", border: "none", color: idx === sections.length - 1 ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.6)", cursor: idx === sections.length - 1 ? "default" : "pointer" }}
                      >
                        <ChevronDown size={16} />
                      </button>

                      {/* Enable / Disable Toggle */}
                      <button
                        onClick={() => handleToggleSection(section)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "8px",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          backgroundColor: section.is_enabled ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)",
                          border: `1px solid ${section.is_enabled ? "rgba(16, 185, 129, 0.4)" : "rgba(239, 68, 68, 0.4)"}`,
                          color: section.is_enabled ? "#34d399" : "#f87171",
                          cursor: "pointer"
                        }}
                      >
                        {section.is_enabled ? "Đang Bật" : "Đang Tắt"}
                      </button>

                      {/* Delete Section */}
                      <button
                        onClick={() => handleDeleteSection(section.id)}
                        style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer" }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Live Preview Panel */}
              {showLivePreview && (
                <div
                  style={{
                    backgroundColor: "rgba(5, 5, 8, 0.8)",
                    borderRadius: "20px",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    padding: "20px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "14px"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>
                      Live Preview ({previewDevice.toUpperCase()})
                    </span>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        onClick={() => setPreviewDevice("desktop")}
                        style={{ background: "none", border: "none", color: previewDevice === "desktop" ? "#6366f1" : "rgba(255,255,255,0.4)", cursor: "pointer" }}
                      >
                        <Monitor size={18} />
                      </button>
                      <button
                        onClick={() => setPreviewDevice("mobile")}
                        style={{ background: "none", border: "none", color: previewDevice === "mobile" ? "#6366f1" : "rgba(255,255,255,0.4)", cursor: "pointer" }}
                      >
                        <Smartphone size={18} />
                      </button>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "600px", overflowY: "auto" }}>
                    {sections
                      .filter((s) => s.is_enabled)
                      .map((sec, i) => (
                        <div
                          key={sec.id}
                          style={{
                            padding: "16px",
                            borderRadius: "12px",
                            backgroundColor: "rgba(255, 255, 255, 0.04)",
                            border: "1px solid rgba(255, 255, 255, 0.08)"
                          }}
                        >
                          <span style={{ fontSize: "0.7rem", color: "#a5b4fc", fontWeight: 700 }}>
                            SECTION {i + 1} • {sec.template_type}
                          </span>
                          <h5 style={{ margin: "4px 0 0", fontSize: "0.9rem" }}>{sec.title}</h5>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ====================================================================
            DECK 3: INGESTION & WAVEFORM BAY
        ===================================================================== */}
        {activeDeck === "media" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div>
              <h2 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: "4px" }}>
                Ingestion & Waveform Bay
              </h2>
              <p style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: "0.85rem", margin: 0 }}>
                Trích xuất metadata tự động từ YouTube/SoundCloud và nạp trực tiếp vào Album đã chọn.
              </p>
            </div>

            {/* Target Album Selector for Ingestion */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>Nạp vào Album:</span>
              <select
                value={selectedAlbumId}
                onChange={(e) => setSelectedAlbumId(e.target.value)}
                style={{
                  padding: "8px 14px",
                  borderRadius: "10px",
                  backgroundColor: "#000000",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  color: "#ffffff",
                  fontSize: "0.85rem",
                  fontWeight: 700
                }}
              >
                {adminAlbums.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.title} ({a.artist})
                  </option>
                ))}
              </select>
            </div>

            {/* URL Ingestion Form */}
            <div
              style={{
                padding: "24px",
                borderRadius: "20px",
                backgroundColor: "rgba(10, 11, 16, 0.75)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                display: "flex",
                flexDirection: "column",
                gap: "16px"
              }}
            >
              <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700 }}>
                1. Auto-Fetch Metadata từ External URL (YouTube / SoundCloud / Zing MP3)
              </h3>
              <div style={{ display: "flex", gap: "12px" }}>
                <input
                  type="text"
                  placeholder="https://www.youtube.com/watch?v=... hoặc SoundCloud URL"
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                  style={{
                    flex: 1,
                    padding: "12px 18px",
                    borderRadius: "12px",
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    color: "#ffffff",
                    fontSize: "0.88rem"
                  }}
                />
                <button
                  onClick={handleExtractMetadata}
                  disabled={isExtracting}
                  style={{
                    padding: "12px 24px",
                    borderRadius: "12px",
                    background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
                    border: "none",
                    color: "#ffffff",
                    fontWeight: 700,
                    cursor: isExtracting ? "default" : "pointer"
                  }}
                >
                  {isExtracting ? "Đang Bóc Tách..." : "Bóc Tách Metadata"}
                </button>
              </div>

              {/* Real-time Waveform Canvas Preview */}
              <div style={{ marginTop: "12px" }}>
                <span style={{ fontSize: "0.78rem", color: "rgba(255, 255, 255, 0.4)", marginBottom: "8px", display: "block" }}>
                  Real-time 2048-slice Audio Waveform Visualizer
                </span>
                <div style={{ padding: "12px", borderRadius: "14px", backgroundColor: "#000000", border: "1px solid rgba(255, 255, 255, 0.1)" }}>
                  <canvas ref={waveformCanvasRef} style={{ width: "100%", height: "80px", display: "block" }} />
                </div>
              </div>
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

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: "20px" }}>
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

      {/* MODAL 1: Create New Album / Single / EP */}
      <AnimatePresence>
        {isNewAlbumModalOpen && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              backdropFilter: "blur(20px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1100,
              padding: "20px"
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              style={{
                width: "min(92vw, 540px)",
                maxHeight: "90vh",
                overflowY: "auto",
                backgroundColor: "#0a0b10",
                borderRadius: "24px",
                border: "1px solid rgba(99, 102, 241, 0.4)",
                boxShadow: "0 24px 60px rgba(0,0,0,0.9)",
                padding: "28px",
                display: "flex",
                flexDirection: "column",
                gap: "20px"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800 }}>Tạo Bản Phát Hành Mới</h3>
                <button
                  onClick={() => setIsNewAlbumModalOpen(false)}
                  style={{ background: "none", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer", fontSize: "1.1rem" }}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateAlbum} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                  <label style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.6)", display: "block", marginBottom: "4px" }}>
                    Loại Bản Phát Hành
                  </label>
                  <select
                    value={albumForm.type}
                    onChange={(e) => setAlbumForm({ ...albumForm, type: e.target.value as any })}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "10px",
                      backgroundColor: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      color: "#ffffff",
                      fontSize: "0.85rem"
                    }}
                  >
                    <option value="album">ALBUM (Album phòng thu nhiều bài)</option>
                    <option value="ep">EP (Đĩa mở rộng 3-6 bài)</option>
                    <option value="single">SINGLE (Đĩa đơn 1-2 bài)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.6)", display: "block", marginBottom: "4px" }}>
                    Tiêu Đề Bản Phát Hành *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: HVL (99%) hoặc Thủ Đô Cypher"
                    value={albumForm.title}
                    onChange={(e) => setAlbumForm({ ...albumForm, title: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "10px",
                      backgroundColor: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      color: "#ffffff",
                      fontSize: "0.85rem"
                    }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.6)", display: "block", marginBottom: "4px" }}>
                      Nghệ Sĩ
                    </label>
                    <input
                      type="text"
                      value={albumForm.artist}
                      onChange={(e) => setAlbumForm({ ...albumForm, artist: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: "10px",
                        backgroundColor: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.15)",
                        color: "#ffffff",
                        fontSize: "0.85rem"
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.6)", display: "block", marginBottom: "4px" }}>
                      Năm Phát Hành
                    </label>
                    <input
                      type="number"
                      value={albumForm.release_year}
                      onChange={(e) => setAlbumForm({ ...albumForm, release_year: parseInt(e.target.value) || 2024 })}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: "10px",
                        backgroundColor: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.15)",
                        color: "#ffffff",
                        fontSize: "0.85rem"
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.6)", display: "block", marginBottom: "4px" }}>
                    Thể Loại Âm Nhạc
                  </label>
                  <input
                    type="text"
                    value={albumForm.genre}
                    onChange={(e) => setAlbumForm({ ...albumForm, genre: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "10px",
                      backgroundColor: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      color: "#ffffff",
                      fontSize: "0.85rem"
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.6)", display: "block", marginBottom: "4px" }}>
                    Đường Dẫn Bìa (Cover Image URL / R2)
                  </label>
                  <input
                    type="text"
                    value={albumForm.cover_url}
                    onChange={(e) => setAlbumForm({ ...albumForm, cover_url: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "10px",
                      backgroundColor: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      color: "#ffffff",
                      fontSize: "0.85rem"
                    }}
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    marginTop: "8px",
                    padding: "12px",
                    borderRadius: "12px",
                    background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
                    border: "none",
                    color: "#ffffff",
                    fontWeight: 700,
                    fontSize: "0.9rem",
                    cursor: "pointer"
                  }}
                >
                  Tạo Bản Phát Hành Ngay
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: Add or Edit Track in Selected Album */}
      <AnimatePresence>
        {isNewTrackModalOpen && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              backdropFilter: "blur(20px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1100,
              padding: "20px"
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              style={{
                width: "min(92vw, 560px)",
                maxHeight: "90vh",
                overflowY: "auto",
                backgroundColor: "#0a0b10",
                borderRadius: "24px",
                border: "1px solid rgba(99, 102, 241, 0.4)",
                boxShadow: "0 24px 60px rgba(0,0,0,0.9)",
                padding: "28px",
                display: "flex",
                flexDirection: "column",
                gap: "18px"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800 }}>
                  {editingTrack ? "Chỉnh Sửa Bài Hát" : `Thêm Bài Hát Vào ${activeAlbum.title}`}
                </h3>
                <button
                  onClick={() => setIsNewTrackModalOpen(false)}
                  style={{ background: "none", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer", fontSize: "1.1rem" }}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveTrack} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.6)", display: "block", marginBottom: "4px" }}>
                    Tên Bài Hát (kèm số thứ tự) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: 01. Elegie hoặc 02. IDK"
                    value={trackForm.title}
                    onChange={(e) => setTrackForm({ ...trackForm, title: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "10px",
                      backgroundColor: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      color: "#ffffff",
                      fontSize: "0.85rem"
                    }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.6)", display: "block", marginBottom: "4px" }}>
                      Nghệ Sĩ
                    </label>
                    <input
                      type="text"
                      value={trackForm.artist}
                      onChange={(e) => setTrackForm({ ...trackForm, artist: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: "10px",
                        backgroundColor: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.15)",
                        color: "#ffffff",
                        fontSize: "0.85rem"
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.6)", display: "block", marginBottom: "4px" }}>
                      Thời Lượng (Giây)
                    </label>
                    <input
                      type="number"
                      value={trackForm.duration_sec}
                      onChange={(e) => setTrackForm({ ...trackForm, duration_sec: parseInt(e.target.value) || 200 })}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: "10px",
                        backgroundColor: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.15)",
                        color: "#ffffff",
                        fontSize: "0.85rem"
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.6)", display: "block", marginBottom: "4px" }}>
                    Audio FLAC / Stream URL (Cloudflare R2) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="https://media.postlain.com/audio/01. Elegie.flac"
                    value={trackForm.audio_url}
                    onChange={(e) => setTrackForm({ ...trackForm, audio_url: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "10px",
                      backgroundColor: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      color: "#ffffff",
                      fontSize: "0.85rem"
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.6)", display: "block", marginBottom: "4px" }}>
                    Video MKV 4K URL (Tùy chọn)
                  </label>
                  <input
                    type="text"
                    placeholder="https://media.postlain.com/videos/01. Elegie - MCK.mkv"
                    value={trackForm.video_url}
                    onChange={(e) => setTrackForm({ ...trackForm, video_url: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "10px",
                      backgroundColor: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      color: "#ffffff",
                      fontSize: "0.85rem"
                    }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.6)", display: "block", marginBottom: "4px" }}>
                      BPM
                    </label>
                    <input
                      type="number"
                      value={trackForm.bpm}
                      onChange={(e) => setTrackForm({ ...trackForm, bpm: parseInt(e.target.value) || 120 })}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: "10px",
                        backgroundColor: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.15)",
                        color: "#ffffff",
                        fontSize: "0.85rem"
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.6)", display: "block", marginBottom: "4px" }}>
                      Thể Loại
                    </label>
                    <input
                      type="text"
                      value={trackForm.genre}
                      onChange={(e) => setTrackForm({ ...trackForm, genre: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: "10px",
                        backgroundColor: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.15)",
                        color: "#ffffff",
                        fontSize: "0.85rem"
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.6)", display: "block", marginBottom: "4px" }}>
                    Lời Bài Hát Đồng Bộ (Synced LRC String)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="[00:12.30]Lời bài hát dòng 1..."
                    value={trackForm.lyrics_synced}
                    onChange={(e) => setTrackForm({ ...trackForm, lyrics_synced: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "10px",
                      backgroundColor: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      color: "#ffffff",
                      fontSize: "0.82rem",
                      fontFamily: "monospace"
                    }}
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    marginTop: "8px",
                    padding: "12px",
                    borderRadius: "12px",
                    background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
                    border: "none",
                    color: "#ffffff",
                    fontWeight: 700,
                    fontSize: "0.9rem",
                    cursor: "pointer"
                  }}
                >
                  {editingTrack ? "Lưu Thay Đổi" : "Thêm Vào Tracklist"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: Add New Section from 7 Presets */}
      <AnimatePresence>
        {isNewSectionModalOpen && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              backdropFilter: "blur(20px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1100,
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
                  Chọn Template Cho Section Mới (Trang Chủ)
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
