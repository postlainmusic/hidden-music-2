import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Disc3, Sparkles, Sliders, CheckCircle2, Music2, Eye, Shield, Film, BookOpen, Globe, UserCheck, Flame } from "lucide-react";
import { DynamicSection } from "../../store/audioStore";

const HVL_COVER = "/covers/HVL_Album_Cover.webp";

// Pre-defined Artist profiles with authentic metadata
const ARTIST_PRESETS = [
  {
    name: "MCK (Nghiêm Vũ Hoàng Long)",
    avatarUrl: "https://media.postlain.com/covers/HVL_Album_Cover.jpg",
    bio: "Nghệ sĩ Melodic Rap / R&B tiên phong với phong cách âm nhạc đậm chất cảm xúc, khai phóng kỷ nguyên streaming Lossless 24-bit.",
    spotifyUrl: "https://open.spotify.com/artist/7z5G9P5y7gLqM2Hw6R0G4l",
    badge: "Verified Master Artist"
  },
  {
    name: "PostLain (Hidden Music Vault)",
    avatarUrl: "https://media.postlain.com/covers/HVL_Album_Cover.jpg",
    bio: "Hệ sinh thái âm thanh phòng thu Lossless độc quyền, kết nối nghệ sĩ và khán giả qua không gian 3D tương tác thế hệ mới.",
    spotifyUrl: "https://open.spotify.com/artist/postlain",
    badge: "Vault Original Label"
  },
  {
    name: "Tage",
    avatarUrl: "https://media.postlain.com/covers/HVL_Album_Cover.jpg",
    bio: "Rapper đầy nội lực với flow sắc bén, kết hợp cùng MCK trong siêu phẩm Mắt Môi Tay Chân.",
    spotifyUrl: "https://open.spotify.com/artist/tage",
    badge: "Featured Master"
  },
  {
    name: "marzuz",
    avatarUrl: "https://media.postlain.com/covers/HVL_Album_Cover.jpg",
    bio: "Giọng ca Alternative R&B đầy mê hoặc, tạo nên nét chấm phá dịu êm trong bản thu Baby.",
    spotifyUrl: "https://open.spotify.com/artist/marzuz",
    badge: "Featured Vocalist"
  },
  {
    name: "Obito",
    avatarUrl: "https://media.postlain.com/covers/HVL_Album_Cover.jpg",
    bio: "Nghệ sĩ đa tài với giai điệu bắt tai, đồng hành cùng MCK trong bản hit Xa Xôi.",
    spotifyUrl: "https://open.spotify.com/artist/obito",
    badge: "Featured Master"
  },
  {
    name: "THANHDRAW",
    avatarUrl: "https://media.postlain.com/covers/HVL_Album_Cover.jpg",
    bio: "Năng lượng bùng nổ, khuấy đảo nhịp điệu cùng MCK và RPT Orijinn trong Huh và Envy.",
    spotifyUrl: "https://open.spotify.com/artist/thanhdraw",
    badge: "Featured Energy"
  }
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  section: DynamicSection | null;
  albums: any[];
  allTracks: any[];
  onSave: (updatedConfig: any, title: string) => Promise<void>;
}

export const SectionElementEditorModal: React.FC<Props> = ({
  isOpen,
  onClose,
  section,
  albums = [],
  allTracks = [],
  onSave
}) => {
  if (!isOpen || !section) return null;

  const [title, setTitle] = useState(section.title || "");
  const [config, setConfig] = useState<any>(section.config || {});
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setTitle(section.title || "");
    const parsedConfig = typeof section.config === "string"
      ? JSON.parse(section.config)
      : (section.config || {});
    setConfig(parsedConfig);
    setHasChanges(false);
  }, [section]);

  const updateField = (key: string, val: any) => {
    setConfig((prev: any) => ({ ...prev, [key]: val }));
    setHasChanges(true);
  };

  const templateType = section.template_type;

  // Resolved Album & Tracks
  const selectedAlbumId = config.album_id || (albums[0]?.id || "hvl-99");
  const selectedAlbumObj = albums.find((a) => a.id === selectedAlbumId) || albums[0];
  const albumTracks = allTracks.filter((t) => (t.albumId || t.album_id) === selectedAlbumId);
  const displayTracks = albumTracks.length > 0 ? albumTracks : allTracks;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(config, title);
      setHasChanges(false);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.88)",
          backdropFilter: "blur(24px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 100000,
          padding: "20px"
        }}
      >
        <motion.div
          initial={{ scale: 0.94, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 10 }}
          style={{
            width: "100%",
            maxWidth: "820px",
            height: "90vh",
            maxHeight: "90vh",
            backgroundColor: "#0b0b12",
            borderRadius: "24px",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            boxShadow: "0 24px 60px rgba(0, 0, 0, 0.9), 0 0 40px rgba(99, 102, 241, 0.25)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden"
          }}
        >
          {/* ── 1. STICKY TOP HEADER WITH QUICK SAVE BUTTON ── */}
          <div
            style={{
              padding: "20px 28px",
              borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: "rgba(14, 14, 22, 0.95)",
              backdropFilter: "blur(20px)",
              flexShrink: 0,
              zIndex: 10
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Sliders size={18} color="#a5b4fc" />
                <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 900, color: "#ffffff" }}>
                  Tùy Chỉnh Element: {section.title}
                </h2>
                <span
                  style={{
                    padding: "3px 8px",
                    borderRadius: "6px",
                    backgroundColor: hasChanges ? "rgba(245, 158, 11, 0.2)" : "rgba(16, 185, 129, 0.15)",
                    border: hasChanges ? "1px solid rgba(245, 158, 11, 0.4)" : "1px solid rgba(16, 185, 129, 0.3)",
                    color: hasChanges ? "#fbbf24" : "#34d399",
                    fontSize: "0.68rem",
                    fontWeight: 800
                  }}
                >
                  {hasChanges ? "🟡 Có thay đổi chưa lưu" : "🟢 Đã đồng bộ D1"}
                </span>
              </div>
              <p style={{ margin: "4px 0 0", fontSize: "0.76rem", color: "rgba(255, 255, 255, 0.5)" }}>
                Template: <span style={{ color: "#818cf8", fontWeight: 700 }}>{templateType}</span> • 100% Cấu hình chuyên sâu bằng Dropdown có sẵn
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <button
                onClick={handleSave}
                disabled={isSaving}
                style={{
                  padding: "8px 18px",
                  borderRadius: "10px",
                  backgroundColor: "#6366f1",
                  border: "none",
                  color: "#ffffff",
                  fontSize: "0.82rem",
                  fontWeight: 800,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  boxShadow: "0 4px 15px rgba(99, 102, 241, 0.4)"
                }}
              >
                {isSaving ? <Sparkles size={14} className="animate-spin" /> : <Save size={14} />}
                <span>Lưu Ngay</span>
              </button>

              <button
                onClick={onClose}
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  color: "rgba(255, 255, 255, 0.6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer"
                }}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* ── 2. SCROLLABLE FORM BODY (WITH CLEAN MINIMALIST SCROLLBAR) ── */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "24px 28px",
              display: "flex",
              flexDirection: "column",
              gap: "20px"
            }}
          >
            {/* Section General Title */}
            <div>
              <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "rgba(255, 255, 255, 0.75)" }}>
                Tiêu Đề Section (Tên Nhận Diện Trên Trang Chủ)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setHasChanges(true);
                }}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  backgroundColor: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  color: "#ffffff",
                  fontSize: "0.88rem",
                  marginTop: "6px"
                }}
              />
            </div>

            {/* ══════════════════════════════════════════════════════════════════════════
                TEMPLATE 1: ALBUM SHOWCASE ELEMENTS
            ══════════════════════════════════════════════════════════════════════════ */}
            {templateType === "album_showcase" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                {/* Element 1: Album Selection */}
                <div style={{ padding: "16px", borderRadius: "14px", backgroundColor: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.08)", display: "flex", alignItems: "center", gap: "16px" }}>
                  <img
                    src={config.cover_url || selectedAlbumObj?.cover_url || HVL_COVER}
                    alt="Album Cover Preview"
                    onError={(e) => { e.currentTarget.src = HVL_COVER; }}
                    style={{ width: "68px", height: "68px", borderRadius: "12px", objectFit: "cover", border: "1px solid rgba(255, 255, 255, 0.2)" }}
                  />
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#a5b4fc" }}>
                      1. Gán Bản Phát Hành Cho Showcase (Album / Single / EP từ D1)
                    </label>
                    <select
                      value={config.album_id || selectedAlbumId}
                      onChange={(e) => {
                        const alb = albums.find((a) => a.id === e.target.value);
                        if (alb) {
                          setConfig((prev: any) => ({
                            ...prev,
                            album_id: alb.id,
                            title: alb.title,
                            artist: alb.artist,
                            cover_url: alb.cover_url
                          }));
                          setHasChanges(true);
                        }
                      }}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: "10px",
                        backgroundColor: "#161622",
                        border: "1px solid rgba(255, 255, 255, 0.15)",
                        color: "#ffffff",
                        marginTop: "6px",
                        fontSize: "0.85rem",
                        fontWeight: 600
                      }}
                    >
                      {albums.map((alb) => (
                        <option key={alb.id} value={alb.id}>
                          {alb.title} ({alb.artist} • {alb.type?.toUpperCase() || "ALBUM"})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Element 2: Sleeve Style, Ambient Glow & 3D Speed */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "rgba(255, 255, 255, 0.75)" }}>
                      2. Phong Cách Vỏ Đĩa
                    </label>
                    <select
                      value={config.sleeve_style || "foil_shrinkwrap"}
                      onChange={(e) => updateField("sleeve_style", e.target.value)}
                      style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", backgroundColor: "#161622", border: "1px solid rgba(255, 255, 255, 0.15)", color: "#ffffff", marginTop: "6px", fontSize: "0.8rem" }}
                    >
                      <option value="foil_shrinkwrap">Màng Co Bạc (Shrinkwrapped Foil)</option>
                      <option value="naked_vinyl">Đĩa Than Trần (Naked Vinyl)</option>
                      <option value="hologram_glass">Vỏ Mica Trong Suốt (Hologram Glass)</option>
                      <option value="gold_master">Vàng Hoàng Kim (Gold Master)</option>
                      <option value="vintage_matte">Giấy Bìa Mờ (Vintage Matte Paper)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "rgba(255, 255, 255, 0.75)" }}>
                      3. Bảng Màu Hào Quang
                    </label>
                    <select
                      value={config.glow_preset || "indigo"}
                      onChange={(e) => updateField("glow_preset", e.target.value)}
                      style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", backgroundColor: "#161622", border: "1px solid rgba(255, 255, 255, 0.15)", color: "#ffffff", marginTop: "6px", fontSize: "0.8rem" }}
                    >
                      <option value="indigo">Indigo Aura (Tím MCK)</option>
                      <option value="magenta">Magenta / Cyber Neon (Hồng)</option>
                      <option value="emerald">Emerald / Lossless Green (Lục Bảo)</option>
                      <option value="gold">Gold Master / Vinyl Shine (Vàng)</option>
                      <option value="monochrome">Monochrome Titanium (Đơn Sắc Bạc)</option>
                      <option value="cyber_cyan">Cyber Cyan (Xanh Điện Biên)</option>
                      <option value="crimson_red">Crimson Blood (Đỏ Ma Mị)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "rgba(255, 255, 255, 0.75)" }}>
                      4. Tốc Độ Xoay 3D
                    </label>
                    <select
                      value={config.spin_speed || "normal"}
                      onChange={(e) => updateField("spin_speed", e.target.value)}
                      style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", backgroundColor: "#161622", border: "1px solid rgba(255, 255, 255, 0.15)", color: "#ffffff", marginTop: "6px", fontSize: "0.8rem" }}
                    >
                      <option value="slow">Êm Ái (Chậm - 60s/vòng)</option>
                      <option value="normal">Tiêu Chuẩn (Vừa - 30s/vòng)</option>
                      <option value="fast">Năng Động (Nhanh - 15s/vòng)</option>
                      <option value="static">Cố Định Không Xoay</option>
                    </select>
                  </div>
                </div>

                {/* Element 3: 5 Tracks Selection for Minimal Tracklist Overlay */}
                <div
                  style={{
                    padding: "16px",
                    borderRadius: "14px",
                    backgroundColor: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <label style={{ fontSize: "0.82rem", fontWeight: 800, color: "#a5b4fc" }}>
                      5. Chọn 5 Bài Hát Hiển Thị Trong Bảng Nổi (Minimal Tracklist Overlay 01..05)
                    </label>
                    <span style={{ fontSize: "0.72rem", color: "rgba(255, 255, 255, 0.45)" }}>
                      {displayTracks.length} bài hát khả dụng
                    </span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {[1, 2, 3, 4, 5].map((slotIdx) => {
                      const currentTrackId = config[`slot_track_${slotIdx}`] || displayTracks[slotIdx - 1]?.id || "";
                      return (
                        <div key={slotIdx} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#6366f1", width: "24px" }}>
                            0{slotIdx}
                          </span>
                          <select
                            value={currentTrackId}
                            onChange={(e) => updateField(`slot_track_${slotIdx}`, e.target.value)}
                            style={{
                              flex: 1,
                              padding: "8px 12px",
                              borderRadius: "8px",
                              backgroundColor: "#161622",
                              border: "1px solid rgba(255, 255, 255, 0.1)",
                              color: "#ffffff",
                              fontSize: "0.82rem"
                            }}
                          >
                            {displayTracks.map((t, idx) => (
                              <option key={t.id} value={t.id}>
                                {idx + 1}. {t.title} ({t.artist})
                              </option>
                            ))}
                          </select>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════════════
                TEMPLATE 2: 3D COVER FLOW 5 SLOTS
            ══════════════════════════════════════════════════════════════════════════ */}
            {templateType === "cover_flow" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <p style={{ margin: 0, fontSize: "0.8rem", color: "#a5b4fc", fontWeight: 700 }}>
                  ⚡ Cấu hình 5 Vault Slots trên vòng xoay 3D Revolver (Chọn Album có sẵn trong D1 hoặc tùy biến):
                </p>

                {[1, 2, 3, 4, 5].map((slotNumber) => {
                  const isCenter = slotNumber === 1;
                  const slotKey = `slot_${slotNumber}`;
                  const currentAlbumId = config[`${slotKey}_album_id`] || (isCenter ? "hvl-99" : "");
                  const currentCover = config[`${slotKey}_cover`] || (isCenter ? HVL_COVER : "");
                  const currentTitle = config[`${slotKey}_title`] || (isCenter ? "HVL (99%)" : `VAULT SLOT 0${slotNumber}`);
                  const currentArtist = config[`${slotKey}_artist`] || (isCenter ? "MCK" : "Lossless Ready");
                  const currentBadge = config[`${slotKey}_badge`] || (isCenter ? "Master Lossless" : "Locked");
                  const currentStatus = config[`${slotKey}_status`] || (isCenter ? "live" : "locked");

                  return (
                    <div
                      key={slotNumber}
                      style={{
                        padding: "14px",
                        borderRadius: "14px",
                        backgroundColor: isCenter ? "rgba(99, 102, 241, 0.12)" : "rgba(255, 255, 255, 0.03)",
                        border: isCenter ? "1px solid #6366f1" : "1px solid rgba(255, 255, 255, 0.08)",
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ fontSize: "0.8rem", fontWeight: 800, color: isCenter ? "#a5b4fc" : "#cbd5e1" }}>
                            Slot #{slotNumber} {isCenter ? "(Đĩa Tâm Giữa #3)" : ""}
                          </span>
                          {isCenter && (
                            <span style={{ padding: "2px 6px", borderRadius: "4px", backgroundColor: "#6366f1", color: "#ffffff", fontSize: "0.62rem", fontWeight: 800 }}>
                              HERO SLOT
                            </span>
                          )}
                        </div>

                        {/* Status Dropdown */}
                        <select
                          value={currentStatus}
                          onChange={(e) => updateField(`${slotKey}_status`, e.target.value)}
                          style={{
                            padding: "4px 8px",
                            borderRadius: "6px",
                            backgroundColor: "#161622",
                            border: "1px solid rgba(255, 255, 255, 0.15)",
                            color: currentStatus === "live" ? "#34d399" : currentStatus === "coming_soon" ? "#fbbf24" : "rgba(255, 255, 255, 0.5)",
                            fontSize: "0.72rem",
                            fontWeight: 700
                          }}
                        >
                          <option value="live">Live (Đang Mở)</option>
                          <option value="coming_soon">Coming Soon (Sắp Ra Mắt)</option>
                          <option value="locked">Locked (Khóa)</option>
                        </select>
                      </div>

                      {/* Quick Dropdown: Pick from existing D1 Albums/Singles */}
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        {currentCover ? (
                          <img
                            src={currentCover}
                            alt={`Slot ${slotNumber} Cover`}
                            onError={(e) => { e.currentTarget.src = HVL_COVER; }}
                            style={{ width: "44px", height: "44px", borderRadius: "8px", objectFit: "cover", border: "1px solid rgba(255, 255, 255, 0.15)" }}
                          />
                        ) : (
                          <div style={{ width: "44px", height: "44px", borderRadius: "8px", backgroundColor: "rgba(255, 255, 255, 0.05)", border: "1px dashed rgba(255, 255, 255, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.4)" }}>
                            <Disc3 size={18} />
                          </div>
                        )}

                        <div style={{ flex: 1 }}>
                          <select
                            value={currentAlbumId}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (!val) {
                                setConfig((prev: any) => ({
                                  ...prev,
                                  [`${slotKey}_album_id`]: "",
                                  [`${slotKey}_title`]: `VAULT SLOT 0${slotNumber}`,
                                  [`${slotKey}_artist`]: "Lossless Ready",
                                  [`${slotKey}_cover`]: "",
                                  [`${slotKey}_badge`]: "Locked",
                                  [`${slotKey}_status`]: "locked"
                                }));
                              } else {
                                const alb = albums.find((a) => a.id === val);
                                if (alb) {
                                  setConfig((prev: any) => ({
                                    ...prev,
                                    [`${slotKey}_album_id`]: alb.id,
                                    [`${slotKey}_title`]: alb.title,
                                    [`${slotKey}_artist`]: alb.artist,
                                    [`${slotKey}_cover`]: alb.cover_url,
                                    [`${slotKey}_badge`]: alb.type === "single" ? "Single Lossless" : "Master Lossless",
                                    [`${slotKey}_status`]: "live"
                                  }));
                                }
                              }
                              setHasChanges(true);
                            }}
                            style={{
                              width: "100%",
                              padding: "8px 12px",
                              borderRadius: "8px",
                              backgroundColor: "#161622",
                              border: "1px solid rgba(255, 255, 255, 0.15)",
                              color: "#ffffff",
                              fontSize: "0.82rem",
                              fontWeight: 600
                            }}
                          >
                            <option value="">[Chọn Bản Phát Hành Có Sẵn Trong D1...]</option>
                            {albums.map((alb) => (
                              <option key={alb.id} value={alb.id}>
                                {alb.title} • {alb.artist} ({alb.type?.toUpperCase() || "ALBUM"})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Detail inputs */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                        <input
                          type="text"
                          placeholder="Tên Bản Thu"
                          value={currentTitle}
                          onChange={(e) => updateField(`${slotKey}_title`, e.target.value)}
                          style={{ padding: "7px 10px", borderRadius: "8px", backgroundColor: "#161622", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: "0.78rem" }}
                        />
                        <input
                          type="text"
                          placeholder="Nghệ Sĩ"
                          value={currentArtist}
                          onChange={(e) => updateField(`${slotKey}_artist`, e.target.value)}
                          style={{ padding: "7px 10px", borderRadius: "8px", backgroundColor: "#161622", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: "0.78rem" }}
                        />
                        <input
                          type="text"
                          placeholder="Huy Hiệu (Master Lossless)"
                          value={currentBadge}
                          onChange={(e) => updateField(`${slotKey}_badge`, e.target.value)}
                          style={{ padding: "7px 10px", borderRadius: "8px", backgroundColor: "#161622", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: "0.78rem" }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════════════
                TEMPLATE 3: HERO MUSIC BANNER
            ══════════════════════════════════════════════════════════════════════════ */}
            {templateType === "hero_banner" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {/* Quick autofill from D1 Album */}
                <div style={{ padding: "12px", borderRadius: "10px", backgroundColor: "rgba(99, 102, 241, 0.1)", border: "1px solid rgba(99, 102, 241, 0.3)" }}>
                  <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#a5b4fc" }}>
                    ⚡ Tự Động Nạp Dữ Liệu Từ Album / Single Có Sẵn Trong D1:
                  </label>
                  <select
                    onChange={(e) => {
                      const alb = albums.find((a) => a.id === e.target.value);
                      if (alb) {
                        setConfig((prev: any) => ({
                          ...prev,
                          headline: alb.title,
                          subheadline: `Bản phát hành ${alb.type?.toUpperCase()} mới nhất từ ${alb.artist}. Chất lượng Lossless phòng thu 24-bit.`,
                          banner_url: alb.cover_url,
                          badge_text: `BẢN PHÁT HÀNH ${alb.type?.toUpperCase() || "MỚI"}`
                        }));
                        setHasChanges(true);
                      }
                    }}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", backgroundColor: "#161622", border: "1px solid rgba(255, 255, 255, 0.15)", color: "#ffffff", marginTop: "4px", fontSize: "0.8rem" }}
                  >
                    <option value="">-- Chọn Release Để Nạp Nhanh --</option>
                    {albums.map((alb) => (
                      <option key={alb.id} value={alb.id}>
                        {alb.title} ({alb.artist} • {alb.type?.toUpperCase()})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "rgba(255, 255, 255, 0.75)" }}>Tiêu Đề Banner (Headline)</label>
                  <input
                    type="text"
                    value={config.headline || ""}
                    onChange={(e) => updateField("headline", e.target.value)}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", backgroundColor: "#161622", border: "1px solid rgba(255, 255, 255, 0.12)", color: "#fff", marginTop: "4px" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "rgba(255, 255, 255, 0.75)" }}>Mô Tả / Tagline Phụ</label>
                  <input
                    type="text"
                    value={config.subheadline || ""}
                    onChange={(e) => updateField("subheadline", e.target.value)}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", backgroundColor: "#161622", border: "1px solid rgba(255, 255, 255, 0.12)", color: "#fff", marginTop: "4px" }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "rgba(255, 255, 255, 0.75)" }}>Bài Hát Kích Hoạt (Linked Track)</label>
                    <select
                      value={config.track_id || allTracks[0]?.id || ""}
                      onChange={(e) => updateField("track_id", e.target.value)}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", backgroundColor: "#161622", border: "1px solid rgba(255, 255, 255, 0.12)", color: "#fff", marginTop: "4px" }}
                    >
                      {allTracks.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.title} ({t.artist})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "rgba(255, 255, 255, 0.75)" }}>Chữ Nút Hành Động (CTA Text)</label>
                    <input
                      type="text"
                      value={config.cta_text || "Nghe Ngay Master Lossless"}
                      onChange={(e) => updateField("cta_text", e.target.value)}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", backgroundColor: "#161622", border: "1px solid rgba(255, 255, 255, 0.12)", color: "#fff", marginTop: "4px" }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════════════
                TEMPLATE 4: ARTIST SPOTLIGHT (WITH PRE-FILLED ARTIST PROFILES)
            ══════════════════════════════════════════════════════════════════════════ */}
            {templateType === "artist_spotlight" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {/* 1. Quick Artist Preset Selector */}
                <div style={{ padding: "12px", borderRadius: "10px", backgroundColor: "rgba(99, 102, 241, 0.1)", border: "1px solid rgba(99, 102, 241, 0.3)" }}>
                  <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#a5b4fc" }}>
                    ⚡ Chọn Hồ Sơ Nghệ Sĩ Có Sẵn (Tự Động Nạp Avatar, Bio, Track):
                  </label>
                  <select
                    onChange={(e) => {
                      const preset = ARTIST_PRESETS.find((p) => p.name === e.target.value);
                      if (preset) {
                        setConfig((prev: any) => ({
                          ...prev,
                          artist_name: preset.name,
                          avatar_url: preset.avatarUrl,
                          bio: preset.bio,
                          spotify_url: preset.spotifyUrl,
                          artist_badge: preset.badge
                        }));
                        setHasChanges(true);
                      }
                    }}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", backgroundColor: "#161622", border: "1px solid rgba(255, 255, 255, 0.15)", color: "#ffffff", marginTop: "4px", fontSize: "0.8rem" }}
                  >
                    <option value="">-- Chọn Nghệ Sĩ Có Sẵn --</option>
                    {ARTIST_PRESETS.map((p) => (
                      <option key={p.name} value={p.name}>
                        {p.name} ({p.badge})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "rgba(255, 255, 255, 0.75)" }}>Tên Nghệ Sĩ</label>
                    <input
                      type="text"
                      value={config.artist_name || "MCK"}
                      onChange={(e) => updateField("artist_name", e.target.value)}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", backgroundColor: "#161622", border: "1px solid rgba(255, 255, 255, 0.12)", color: "#fff", marginTop: "4px" }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "rgba(255, 255, 255, 0.75)" }}>Huy Hiệu Nghệ Sĩ</label>
                    <input
                      type="text"
                      value={config.artist_badge || "Verified Master Artist"}
                      onChange={(e) => updateField("artist_badge", e.target.value)}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", backgroundColor: "#161622", border: "1px solid rgba(255, 255, 255, 0.12)", color: "#fff", marginTop: "4px" }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "rgba(255, 255, 255, 0.75)" }}>Tiểu Sử & Triết Lý Âm Nhạc</label>
                  <textarea
                    rows={3}
                    value={config.bio || ""}
                    onChange={(e) => updateField("bio", e.target.value)}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", backgroundColor: "#161622", border: "1px solid rgba(255, 255, 255, 0.12)", color: "#fff", marginTop: "4px" }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "rgba(255, 255, 255, 0.75)" }}>Single / Track Tiêu Biểu</label>
                    <select
                      value={config.featured_track_id || allTracks[0]?.id || ""}
                      onChange={(e) => updateField("featured_track_id", e.target.value)}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", backgroundColor: "#161622", border: "1px solid rgba(255, 255, 255, 0.12)", color: "#fff", marginTop: "4px" }}
                    >
                      {allTracks.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.title} ({t.artist})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "rgba(255, 255, 255, 0.75)" }}>Link Spotify / Social</label>
                    <input
                      type="text"
                      value={config.spotify_url || ""}
                      placeholder="https://open.spotify.com/artist/..."
                      onChange={(e) => updateField("spotify_url", e.target.value)}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", backgroundColor: "#161622", border: "1px solid rgba(255, 255, 255, 0.12)", color: "#fff", marginTop: "4px" }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════════════
                TEMPLATE 5: VIDEO PREMIERE PLAYER
            ══════════════════════════════════════════════════════════════════════════ */}
            {templateType === "video_premiere" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "rgba(255, 255, 255, 0.75)" }}>Chọn Video Master Từ Kho R2 / D1</label>
                  <select
                    value={config.track_id || allTracks[0]?.id || ""}
                    onChange={(e) => {
                      const tr = allTracks.find((t) => t.id === e.target.value);
                      if (tr) {
                        setConfig((prev: any) => ({
                          ...prev,
                          track_id: tr.id,
                          title: tr.title,
                          video_url: tr.videoUrl || `https://media.postlain.com/videos/01.%20Elegie%20-%20MCK.mkv`,
                          poster_url: tr.coverUrl
                        }));
                        setHasChanges(true);
                      }
                    }}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", backgroundColor: "#161622", border: "1px solid rgba(255, 255, 255, 0.15)", color: "#fff", marginTop: "4px" }}
                  >
                    {allTracks.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title} ({t.artist})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "rgba(255, 255, 255, 0.75)" }}>Đèn Hào Quang Ambilight</label>
                    <select
                      value={config.ambilight_intensity || "high"}
                      onChange={(e) => updateField("ambilight_intensity", e.target.value)}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", backgroundColor: "#161622", border: "1px solid rgba(255, 255, 255, 0.12)", color: "#fff", marginTop: "4px" }}
                    >
                      <option value="high">Sáng Rực Rỡ Cinema (Khuyên Dùng)</option>
                      <option value="medium">Dịu Nhẹ</option>
                      <option value="none">Tắt Đèn Hào Quang</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "rgba(255, 255, 255, 0.75)" }}>Tỷ Lệ Khung Hình</label>
                    <select
                      value={config.aspect_ratio || "16:9"}
                      onChange={(e) => updateField("aspect_ratio", e.target.value)}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", backgroundColor: "#161622", border: "1px solid rgba(255, 255, 255, 0.12)", color: "#fff", marginTop: "4px" }}
                    >
                      <option value="16:9">16:9 Tiêu Chuẩn</option>
                      <option value="21:9">21:9 Điện Ảnh Siêu Rộng</option>
                      <option value="4:3">4:3 Hoài Niệm (Vintage)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════════════
                TEMPLATE 6: EDITORIAL PRESS & MAGAZINE
            ══════════════════════════════════════════════════════════════════════════ */}
            {templateType === "editorial_press" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "rgba(255, 255, 255, 0.75)" }}>Tên Tạp Chí / Nguồn Báo</label>
                    <select
                      value={config.source || "Pitchfork"}
                      onChange={(e) => updateField("source", e.target.value)}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", backgroundColor: "#161622", border: "1px solid rgba(255, 255, 255, 0.12)", color: "#fff", marginTop: "4px" }}
                    >
                      <option value="Pitchfork">Pitchfork</option>
                      <option value="Rolling Stone VN">Rolling Stone VN</option>
                      <option value="Billboard Vietnam">Billboard Vietnam</option>
                      <option value="PostLain Editorial">PostLain Editorial</option>
                      <option value="NME Asia">NME Asia</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "rgba(255, 255, 255, 0.75)" }}>Điểm Số / Đánh Giá</label>
                    <select
                      value={config.rating || "10/10 Masterpiece"}
                      onChange={(e) => updateField("rating", e.target.value)}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", backgroundColor: "#161622", border: "1px solid rgba(255, 255, 255, 0.12)", color: "#fff", marginTop: "4px" }}
                    >
                      <option value="10/10 Masterpiece">10/10 Masterpiece</option>
                      <option value="9.9/10 Essential">9.9/10 Essential Listen</option>
                      <option value="5/5 Stars">⭐⭐⭐⭐⭐ 5/5 Stars</option>
                      <option value="Best New Album">Best New Album of the Year</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "rgba(255, 255, 255, 0.75)" }}>Câu Trích Dẫn Đánh Giá (Magazine Pull Quote)</label>
                  <textarea
                    rows={3}
                    value={config.quote || "Một kiệt tác âm thanh định hình lại chất lượng Melodic Rap tại Việt Nam với trải nghiệm 24-bit Lossless vô tiền khoáng hậu."}
                    onChange={(e) => updateField("quote", e.target.value)}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", backgroundColor: "#161622", border: "1px solid rgba(255, 255, 255, 0.12)", color: "#fff", marginTop: "4px" }}
                  />
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════════════
                TEMPLATE 7: EXPLORE UNIVERSE GATEWAY
            ══════════════════════════════════════════════════════════════════════════ */}
            {templateType === "explore_universe" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "rgba(255, 255, 255, 0.75)" }}>Phong Cách Không Gian 3D Vũ Trụ</label>
                  <select
                    value={config.universe_style || "deep_nebula"}
                    onChange={(e) => updateField("universe_style", e.target.value)}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", backgroundColor: "#161622", border: "1px solid rgba(255, 255, 255, 0.12)", color: "#fff", marginTop: "4px" }}
                  >
                    <option value="deep_nebula">Deep Nebula (Tinh Vân Tím Huyền Ảo)</option>
                    <option value="cyber_grid">Cyber Grid (Lưới Không Gian 3D Neon)</option>
                    <option value="starfield">Starfield (Dải Ngân Hà Sao Băng)</option>
                    <option value="audio_reactive">Audio Reactive Particles (Bụi Sóng Âm)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "rgba(255, 255, 255, 0.75)" }}>Tiêu Đề Cổng Vũ Trụ</label>
                  <input
                    type="text"
                    value={config.headline || "EXPLORE UNIVERSE"}
                    onChange={(e) => updateField("headline", e.target.value)}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", backgroundColor: "#161622", border: "1px solid rgba(255, 255, 255, 0.12)", color: "#fff", marginTop: "4px" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "rgba(255, 255, 255, 0.75)" }}>Mô Tả Không Gian Mở Rộng</label>
                  <textarea
                    rows={2}
                    value={config.subtext || "Không gian âm nhạc mở rộng đang được kết nối với hệ sinh thái streaming độc quyền."}
                    onChange={(e) => updateField("subtext", e.target.value)}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", backgroundColor: "#161622", border: "1px solid rgba(255, 255, 255, 0.12)", color: "#fff", marginTop: "4px" }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* ── 3. STICKY BOTTOM ACTION BAR (ALWAYS VISIBLE & PROMINENT) ── */}
          <div
            style={{
              padding: "16px 28px",
              borderTop: "1px solid rgba(255, 255, 255, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: "rgba(12, 12, 18, 0.96)",
              backdropFilter: "blur(24px)",
              flexShrink: 0,
              zIndex: 10
            }}
          >
            <span style={{ fontSize: "0.75rem", color: "rgba(255, 255, 255, 0.5)" }}>
              {hasChanges ? "⚠️ Có thay đổi chưa lưu • Nhấn nút bên phải để ghi đè vào D1" : "✨ Cấu hình đã được lưu đồng bộ"}
            </span>

            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <button
                onClick={onClose}
                style={{
                  padding: "10px 20px",
                  borderRadius: "12px",
                  backgroundColor: "rgba(255, 255, 255, 0.06)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  color: "#ffffff",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  cursor: "pointer"
                }}
              >
                Hủy
              </button>

              <button
                onClick={handleSave}
                disabled={isSaving}
                style={{
                  padding: "10px 26px",
                  borderRadius: "12px",
                  backgroundColor: "#6366f1",
                  border: "none",
                  color: "#ffffff",
                  fontSize: "0.88rem",
                  fontWeight: 800,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: "0 4px 20px rgba(99, 102, 241, 0.5)"
                }}
              >
                {isSaving ? <Sparkles size={16} className="animate-spin" /> : <Save size={16} />}
                <span>💾 Lưu Cấu Hình Element Vào D1</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SectionElementEditorModal;
