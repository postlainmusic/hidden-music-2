import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Disc3, Sparkles, Sliders, CheckCircle2, Music2, Eye } from "lucide-react";
import { DynamicSection } from "../../store/audioStore";

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
  albums,
  allTracks,
  onSave
}) => {
  if (!isOpen || !section) return null;

  const [title, setTitle] = useState(section.title || "");
  const [config, setConfig] = useState<any>(section.config || {});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setTitle(section.title || "");
    setConfig(section.config || {});
  }, [section]);

  const templateType = section.template_type;

  // Selected Album Tracks (if template requires album)
  const selectedAlbumId = config.album_id || (albums[0]?.id || "hvl-99");
  const albumTracks = allTracks.filter((t) => (t.albumId || t.album_id) === selectedAlbumId);
  const displayTracks = albumTracks.length > 0 ? albumTracks : allTracks.slice(0, 5);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(config, title);
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
          backgroundColor: "rgba(0, 0, 0, 0.85)",
          backdropFilter: "blur(20px)",
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
            maxWidth: "760px",
            maxHeight: "90vh",
            overflowY: "auto",
            backgroundColor: "#0b0b12",
            borderRadius: "24px",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            boxShadow: "0 24px 60px rgba(0, 0, 0, 0.9), 0 0 40px rgba(99, 102, 241, 0.2)",
            padding: "28px",
            display: "flex",
            flexDirection: "column",
            gap: "20px"
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255, 255, 255, 0.08)", paddingBottom: "16px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Sliders size={18} color="#a5b4fc" />
                <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 900, color: "#ffffff" }}>
                  Tùy Chỉnh Element: {section.title}
                </h2>
              </div>
              <p style={{ margin: "4px 0 0", fontSize: "0.78rem", color: "rgba(255, 255, 255, 0.5)" }}>
                Template: <span style={{ color: "#818cf8", fontWeight: 700 }}>{templateType}</span> • Tinh chỉnh trực quan các thành phần UI
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                backgroundColor: "rgba(255, 255, 255, 0.06)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
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

          {/* Section General Title */}
          <div>
            <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "rgba(255, 255, 255, 0.75)" }}>
              Tiêu Đề Section (Tên Nhận Diện)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "rgba(255, 255, 255, 0.75)" }}>
                    1. Gán Bản Phát Hành (Album / Single / EP)
                  </label>
                  <select
                    value={selectedAlbumId}
                    onChange={(e) => setConfig({ ...config, album_id: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "10px",
                      backgroundColor: "#161622",
                      border: "1px solid rgba(255, 255, 255, 0.15)",
                      color: "#ffffff",
                      marginTop: "6px"
                    }}
                  >
                    {albums.map((alb) => (
                      <option key={alb.id} value={alb.id}>
                        {alb.title} ({alb.artist} • {alb.type?.toUpperCase() || "ALBUM"})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "rgba(255, 255, 255, 0.75)" }}>
                    2. Phong Cách Vỏ Đĩa (Sleeve Element Style)
                  </label>
                  <select
                    value={config.sleeve_style || "foil_shrinkwrap"}
                    onChange={(e) => setConfig({ ...config, sleeve_style: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "10px",
                      backgroundColor: "#161622",
                      border: "1px solid rgba(255, 255, 255, 0.15)",
                      color: "#ffffff",
                      marginTop: "6px"
                    }}
                  >
                    <option value="foil_shrinkwrap">Bìa Màng Co Bạc Kim Loại (Shrinkwrapped Foil)</option>
                    <option value="naked_vinyl">Đĩa Vinyl Trần Đen Bóng (Naked Vinyl)</option>
                    <option value="hologram_glass">Vỏ Mica Nhựa Trong Suốt (Hologram Glass)</option>
                  </select>
                </div>
              </div>

              {/* Element 2: 5 Tracks Selection for Minimal Tracklist Overlay */}
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
                    3. Chọn 5 Bài Hát Hiển Thị Trong Bảng Nổi (Minimal Tracklist Overlay 01..05)
                  </label>
                  <span style={{ fontSize: "0.72rem", color: "rgba(255, 255, 255, 0.45)" }}>
                    Đã chọn 5 slot
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
                          onChange={(e) => setConfig({ ...config, [`slot_track_${slotIdx}`]: e.target.value })}
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
                          {albumTracks.map((t, idx) => (
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

              {/* Element 3: Ambient Glow & 3D Parameters */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "rgba(255, 255, 255, 0.75)" }}>
                    4. Bảng Màu Hào Quang (Metallic Ambient Glow)
                  </label>
                  <select
                    value={config.glow_preset || "indigo"}
                    onChange={(e) => setConfig({ ...config, glow_preset: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "10px",
                      backgroundColor: "#161622",
                      border: "1px solid rgba(255, 255, 255, 0.15)",
                      color: "#ffffff",
                      marginTop: "6px"
                    }}
                  >
                    <option value="indigo">Indigo Aura (Mặc định MCK)</option>
                    <option value="magenta">Magenta / Cyber Neon</option>
                    <option value="emerald">Emerald / Lossless Green</option>
                    <option value="gold">Gold Master / Vinyl Shine</option>
                    <option value="monochrome">Monochrome Titanium / Dark Silver</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "rgba(255, 255, 255, 0.75)" }}>
                    5. Tốc Độ Xoay & Nghiêng 3D Vinyl
                  </label>
                  <select
                    value={config.spin_speed || "normal"}
                    onChange={(e) => setConfig({ ...config, spin_speed: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "10px",
                      backgroundColor: "#161622",
                      border: "1px solid rgba(255, 255, 255, 0.15)",
                      color: "#ffffff",
                      marginTop: "6px"
                    }}
                  >
                    <option value="slow">Êm Ái (Chậm - 60s/vòng)</option>
                    <option value="normal">Tiêu Chuẩn (Vừa - 30s/vòng)</option>
                    <option value="fast">Năng Động (Nhanh - 15s/vòng)</option>
                    <option value="static">Cố Định Không Xoay (Static 3D Case)</option>
                  </select>
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
                Cấu hình trực quan 5 Vault Slots trên vòng xoay 3D Revolver (Slot 1 mặc định tâm giữa #3):
              </p>

              {[1, 2, 3, 4, 5].map((slotNumber) => {
                const isCenter = slotNumber === 1;
                return (
                  <div
                    key={slotNumber}
                    style={{
                      padding: "12px 16px",
                      borderRadius: "12px",
                      backgroundColor: isCenter ? "rgba(99, 102, 241, 0.15)" : "rgba(255, 255, 255, 0.03)",
                      border: isCenter ? "1px solid #6366f1" : "1px solid rgba(255, 255, 255, 0.08)",
                      display: "grid",
                      gridTemplateColumns: "100px 1fr 140px 120px",
                      alignItems: "center",
                      gap: "12px"
                    }}
                  >
                    <span style={{ fontSize: "0.78rem", fontWeight: 800, color: isCenter ? "#a5b4fc" : "rgba(255,255,255,0.6)" }}>
                      Slot #{slotNumber} {isCenter ? "(Tâm #3)" : ""}
                    </span>

                    <input
                      type="text"
                      placeholder={`Tiêu đề Slot ${slotNumber}`}
                      value={config[`slot_${slotNumber}_title`] || (isCenter ? "HVL (99%)" : `VAULT SLOT 0${slotNumber}`)}
                      onChange={(e) => setConfig({ ...config, [`slot_${slotNumber}_title`]: e.target.value })}
                      style={{ padding: "6px 10px", borderRadius: "8px", backgroundColor: "#161622", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: "0.8rem" }}
                    />

                    <input
                      type="text"
                      placeholder="Badge (Master Lossless)"
                      value={config[`slot_${slotNumber}_badge`] || (isCenter ? "Master Lossless" : "Locked")}
                      onChange={(e) => setConfig({ ...config, [`slot_${slotNumber}_badge`]: e.target.value })}
                      style={{ padding: "6px 10px", borderRadius: "8px", backgroundColor: "#161622", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: "0.8rem" }}
                    />

                    <select
                      value={config[`slot_${slotNumber}_status`] || (isCenter ? "live" : "locked")}
                      onChange={(e) => setConfig({ ...config, [`slot_${slotNumber}_status`]: e.target.value })}
                      style={{ padding: "6px 10px", borderRadius: "8px", backgroundColor: "#161622", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: "0.8rem" }}
                    >
                      <option value="live">Live (Mở)</option>
                      <option value="coming_soon">Coming Soon</option>
                      <option value="locked">Locked (Khóa)</option>
                    </select>
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
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "rgba(255, 255, 255, 0.75)" }}>Tiêu Đề Banner (Headline)</label>
                <input
                  type="text"
                  value={config.headline || ""}
                  onChange={(e) => setConfig({ ...config, headline: e.target.value })}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", backgroundColor: "#161622", border: "1px solid rgba(255, 255, 255, 0.12)", color: "#fff", marginTop: "4px" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "rgba(255, 255, 255, 0.75)" }}>Mô Tả / Tagline Phụ</label>
                <input
                  type="text"
                  value={config.subheadline || ""}
                  onChange={(e) => setConfig({ ...config, subheadline: e.target.value })}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", backgroundColor: "#161622", border: "1px solid rgba(255, 255, 255, 0.12)", color: "#fff", marginTop: "4px" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "rgba(255, 255, 255, 0.75)" }}>URL Ảnh / Video Banner 16:9 Cinema</label>
                <input
                  type="text"
                  value={config.banner_url || ""}
                  onChange={(e) => setConfig({ ...config, banner_url: e.target.value })}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", backgroundColor: "#161622", border: "1px solid rgba(255, 255, 255, 0.12)", color: "#fff", marginTop: "4px" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "rgba(255, 255, 255, 0.75)" }}>Bài Hát Kích Hoạt (Linked Track)</label>
                  <select
                    value={config.track_id || allTracks[0]?.id || ""}
                    onChange={(e) => setConfig({ ...config, track_id: e.target.value })}
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
                    onChange={(e) => setConfig({ ...config, cta_text: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", backgroundColor: "#161622", border: "1px solid rgba(255, 255, 255, 0.12)", color: "#fff", marginTop: "4px" }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════════════
              TEMPLATE 4: ARTIST SPOTLIGHT
          ══════════════════════════════════════════════════════════════════════════ */}
          {templateType === "artist_spotlight" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "rgba(255, 255, 255, 0.75)" }}>Tên Nghệ Sĩ</label>
                  <input
                    type="text"
                    value={config.artist_name || "MCK"}
                    onChange={(e) => setConfig({ ...config, artist_name: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", backgroundColor: "#161622", border: "1px solid rgba(255, 255, 255, 0.12)", color: "#fff", marginTop: "4px" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "rgba(255, 255, 255, 0.75)" }}>URL Avatar / Ảnh Chân Dung</label>
                  <input
                    type="text"
                    value={config.avatar_url || ""}
                    onChange={(e) => setConfig({ ...config, avatar_url: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", backgroundColor: "#161622", border: "1px solid rgba(255, 255, 255, 0.12)", color: "#fff", marginTop: "4px" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "rgba(255, 255, 255, 0.75)" }}>Tiểu Sử & Triết Lý Âm Nhạc</label>
                <textarea
                  rows={3}
                  value={config.bio || ""}
                  onChange={(e) => setConfig({ ...config, bio: e.target.value })}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", backgroundColor: "#161622", border: "1px solid rgba(255, 255, 255, 0.12)", color: "#fff", marginTop: "4px" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "rgba(255, 255, 255, 0.75)" }}>Single / Track Tiêu Biểu</label>
                  <select
                    value={config.featured_track_id || allTracks[0]?.id || ""}
                    onChange={(e) => setConfig({ ...config, featured_track_id: e.target.value })}
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
                    value={config.social_link || ""}
                    placeholder="https://open.spotify.com/artist/..."
                    onChange={(e) => setConfig({ ...config, social_link: e.target.value })}
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
                <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "rgba(255, 255, 255, 0.75)" }}>Tiêu Đề MV / Video</label>
                <input
                  type="text"
                  value={config.title || ""}
                  onChange={(e) => setConfig({ ...config, title: e.target.value })}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", backgroundColor: "#161622", border: "1px solid rgba(255, 255, 255, 0.12)", color: "#fff", marginTop: "4px" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "rgba(255, 255, 255, 0.75)" }}>URL Nguồn Video 4K MKV / MP4 / YouTube</label>
                <input
                  type="text"
                  value={config.video_url || ""}
                  onChange={(e) => setConfig({ ...config, video_url: e.target.value })}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", backgroundColor: "#161622", border: "1px solid rgba(255, 255, 255, 0.12)", color: "#fff", marginTop: "4px" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "rgba(255, 255, 255, 0.75)" }}>Đèn Hào Quang Ambilight</label>
                  <select
                    value={config.ambilight_intensity || "high"}
                    onChange={(e) => setConfig({ ...config, ambilight_intensity: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", backgroundColor: "#161622", border: "1px solid rgba(255, 255, 255, 0.12)", color: "#fff", marginTop: "4px" }}
                  >
                    <option value="high">Sáng Mạnh (Rực rỡ Cinema)</option>
                    <option value="medium">Vừa Phải (Dịu nhẹ)</option>
                    <option value="none">Tắt Đèn Hào Quang</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "rgba(255, 255, 255, 0.75)" }}>Đạo Diễn / Sản Xuất Tag</label>
                  <input
                    type="text"
                    value={config.director_tag || "PostLain Cinema 4K Master"}
                    onChange={(e) => setConfig({ ...config, director_tag: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", backgroundColor: "#161622", border: "1px solid rgba(255, 255, 255, 0.12)", color: "#fff", marginTop: "4px" }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════════════
              TEMPLATE 6: EDITORIAL PRESS & MAGAZINE
          ══════════════════════════════════════════════════════════════════════════ */}
          {templateType === "editorial_press" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "rgba(255, 255, 255, 0.75)" }}>Câu Trích Dẫn Đánh Giá (Magazine Pull Quote)</label>
                <textarea
                  rows={3}
                  value={config.quote || ""}
                  onChange={(e) => setConfig({ ...config, quote: e.target.value })}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", backgroundColor: "#161622", border: "1px solid rgba(255, 255, 255, 0.12)", color: "#fff", marginTop: "4px" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "rgba(255, 255, 255, 0.75)" }}>Tên Tạp Chí / Nguồn Báo</label>
                  <input
                    type="text"
                    value={config.source || "PostLain Editorial"}
                    onChange={(e) => setConfig({ ...config, source: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", backgroundColor: "#161622", border: "1px solid rgba(255, 255, 255, 0.12)", color: "#fff", marginTop: "4px" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "rgba(255, 255, 255, 0.75)" }}>Tác Giả / Nhà Phê Bình</label>
                  <input
                    type="text"
                    value={config.author || "Senior Music Critic"}
                    onChange={(e) => setConfig({ ...config, author: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", backgroundColor: "#161622", border: "1px solid rgba(255, 255, 255, 0.12)", color: "#fff", marginTop: "4px" }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════════════
              TEMPLATE 7: EXPLORE UNIVERSE GATEWAY
          ══════════════════════════════════════════════════════════════════════════ */}
          {templateType === "explore_universe" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "rgba(255, 255, 255, 0.75)" }}>Tiêu Đề Cổng Vũ Trụ</label>
                <input
                  type="text"
                  value={config.headline || "EXPLORE UNIVERSE"}
                  onChange={(e) => setConfig({ ...config, headline: e.target.value })}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", backgroundColor: "#161622", border: "1px solid rgba(255, 255, 255, 0.12)", color: "#fff", marginTop: "4px" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "rgba(255, 255, 255, 0.75)" }}>Mô Tả Không Gian Mở Rộng</label>
                <textarea
                  rows={2}
                  value={config.subtext || "Không gian âm nhạc mở rộng đang được kết nối với hệ sinh thái streaming độc quyền."}
                  onChange={(e) => setConfig({ ...config, subtext: e.target.value })}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", backgroundColor: "#161622", border: "1px solid rgba(255, 255, 255, 0.12)", color: "#fff", marginTop: "4px" }}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "12px", borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "18px", marginTop: "10px" }}>
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
                padding: "10px 24px",
                borderRadius: "12px",
                backgroundColor: "#6366f1",
                border: "none",
                color: "#ffffff",
                fontSize: "0.85rem",
                fontWeight: 800,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 4px 20px rgba(99, 102, 241, 0.45)"
              }}
            >
              {isSaving ? <Sparkles size={16} className="animate-spin" /> : <Save size={16} />}
              <span>Lưu Cấu Hình Element Vào D1</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SectionElementEditorModal;
