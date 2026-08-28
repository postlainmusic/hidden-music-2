import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Disc3,
  Layers,
  Compass,
  ArrowRight,
  Flame,
  ChevronRight,
  Info
} from "lucide-react";
import { useAudioStore } from "../store/audioStore";

// Mock Vault Discography Albums
const VAULT_ALBUMS = [
  {
    id: "album-hvl",
    title: "HVL (99%)",
    artist: "MCK",
    coverUrl: "https://media.postlain.com/covers/HVL_Album_Cover.jpg",
    trackCount: 30,
    year: "2023",
    genre: "Hip-Hop / R&B",
    description: "Album phòng thu đầu tay mang tính bước ngoặt của MCK, gồm 30 ca khúc được mastering Lossless chuẩn Studio.",
    color: "#6366f1"
  },
  {
    id: "album-live",
    title: "99% Live Concert",
    artist: "MCK & Friends",
    coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80",
    trackCount: 12,
    year: "2024",
    genre: "Live Performance",
    description: "Toàn bộ trải nghiệm sân khấu bùng nổ trực tiếp với dàn nhạc sống giao hưởng kết hợp trap beat.",
    color: "#ec4899"
  },
  {
    id: "album-demos",
    title: "Unreleased Vault EP",
    artist: "MCK",
    coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80",
    trackCount: 8,
    year: "2025",
    genre: "Acoustic / Demo",
    description: "Những bản thu âm nháp mộc mạc và giai điệu nguyên bản chưa từng được công bố trên các nền tảng streaming.",
    color: "#06b6d4"
  },
  {
    id: "album-beats",
    title: "Instrumental Editions",
    artist: "Various Producers",
    coverUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80",
    trackCount: 15,
    year: "2024",
    genre: "Beats / Instrumental",
    description: "Bộ sưu tập beat gốc chất lượng cao cho các nghệ sĩ và nhà sản xuất âm nhạc tự do sáng tạo.",
    color: "#10b981"
  }
];

// Showcase Top Hits for Section 1 (Best Play showcase list - strictly for visual display)
const BEST_PLAY_SHOWCASE = [
  { rank: "01", title: "01. Elegie", artist: "MCK", duration: "3:18", genre: "Hip-Hop / Rap", plays: "2.4M" },
  { rank: "02", title: "02. IDK", artist: "MCK", duration: "3:35", genre: "Melodic Rap", plays: "4.8M" },
  { rank: "03", title: "05. Baby (feat. marzuz)", artist: "MCK ft. marzuz", duration: "3:50", genre: "Alternative R&B", plays: "6.1M" },
  { rank: "04", title: "07. Mắt Môi Tay Chân", artist: "MCK ft. Tage", duration: "3:05", genre: "Drill / Trap", plays: "3.2M" },
  { rank: "05", title: "20. Xa Xôi (feat. Obito)", artist: "MCK ft. Obito", duration: "3:42", genre: "Melodic Rap", plays: "5.5M" }
];

export const HomePage: React.FC = () => {
  const { currentUser } = useAudioStore();
  const [selectedAlbumModal, setSelectedAlbumModal] = useState<any | null>(null);

  const handleAlbumClick = (album: any) => {
    // Per User Instruction: Do NOT play music here. Prepare 3D Transition modal / notification.
    setSelectedAlbumModal(album);
  };

  return (
    <main style={{ maxWidth: "1280px", margin: "0 auto", padding: "32px 24px 120px" }}>
      {/* ─────────────────────────────────────────────────────────────────────────
          SECTION 1: HERO BANNER CHÀO MỪNG & BEST PLAY SHOWCASE
      ────────────────────────────────────────────────────────────────────────── */}
      <section style={{ marginBottom: "80px" }}>
        {/* Welcome Top Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}
        >
          <div
            className="glass-pill"
            style={{
              padding: "6px 14px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              color: "var(--accent-primary)",
              fontWeight: 600,
              fontSize: "0.85rem"
            }}
          >
            <Sparkles size={15} color="var(--accent-primary)" />
            <span>Xin chào, {currentUser?.name || "Người nghe Vault"} 👋</span>
          </div>
        </motion.div>

        {/* Hero Grid: Left Featured Album + Right Best Play List */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
            gap: "32px",
            alignItems: "stretch"
          }}
        >
          {/* Featured Album Hero Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="glass-panel"
            style={{
              padding: "36px",
              borderRadius: "32px",
              position: "relative",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              minHeight: "420px",
              background: "linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)",
              border: "1px solid rgba(255, 255, 255, 0.12)"
            }}
          >
            {/* Ambient Background Glow */}
            <div
              style={{
                position: "absolute",
                top: "-40px",
                right: "-40px",
                width: "220px",
                height: "220px",
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, transparent 70%)",
                filter: "blur(30px)",
                pointerEvents: "none"
              }}
            />

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                <span
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    letterSpacing: "1.5px",
                    textTransform: "uppercase",
                    padding: "4px 10px",
                    borderRadius: "6px",
                    background: "rgba(99, 102, 241, 0.2)",
                    color: "#a5b4fc",
                    border: "1px solid rgba(99, 102, 241, 0.3)"
                  }}
                >
                  ALBUM TIÊU BIỂU
                </span>
                <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>• 2023 • 30 Ca Khúc</span>
              </div>

              <h1
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "2.5rem",
                  fontWeight: 800,
                  lineHeight: 1.1,
                  marginBottom: "8px",
                  background: "linear-gradient(135deg, #ffffff 50%, rgba(255,255,255,0.7) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent"
                }}
              >
                HVL (99%)
              </h1>
              <p style={{ fontSize: "1.2rem", fontWeight: 600, color: "var(--accent-secondary)", marginBottom: "16px" }}>
                MCK
              </p>

              <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: 1.6, maxWidth: "420px" }}>
                Tuyển tập kiệt tác âm nhạc định hình phong cách Melodic Rap & R&B đương đại. Toàn bộ 30 bài hát được lưu trữ dạng Lossless FLAC chất lượng phòng thu gốc.
              </p>
            </div>

            {/* Bottom Details & 3D Teaser Trigger */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "28px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                  <Disc3 size={16} color="var(--accent-primary)" />
                  <span>Lossless 24-bit</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                  <Layers size={16} color="var(--accent-secondary)" />
                  <span>3D Audio Space</span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => handleAlbumClick(VAULT_ALBUMS[0])}
                className="apple-btn-primary"
                style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 22px" }}
              >
                <span>Xem Album</span>
                <ArrowRight size={16} />
              </motion.button>
            </div>
          </motion.div>

          {/* Best Play Showcase Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="glass-panel"
            style={{
              padding: "32px",
              borderRadius: "32px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between"
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Flame size={20} color="#f43f5e" />
                  <h2 style={{ fontSize: "1.25rem", fontWeight: 700 }}>Best Play Showcase</h2>
                </div>
                <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", background: "rgba(255,255,255,0.06)", padding: "3px 8px", borderRadius: "6px" }}>
                  Top Lượt Nghe
                </span>
              </div>

              {/* Showcase Track Rows */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {BEST_PLAY_SHOWCASE.map((track) => (
                  <div
                    key={track.rank}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 14px",
                      borderRadius: "14px",
                      background: "rgba(255, 255, 255, 0.03)",
                      border: "1px solid rgba(255, 255, 255, 0.05)",
                      transition: "background 0.2s ease"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--text-muted)", width: "20px" }}>
                        {track.rank}
                      </span>
                      <div>
                        <p style={{ fontSize: "0.92rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: "2px" }}>
                          {track.title}
                        </p>
                        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                          {track.artist} • <span style={{ color: "var(--accent-primary)" }}>{track.genre}</span>
                        </p>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "14px", color: "var(--text-muted)", fontSize: "0.82rem" }}>
                      <span>{track.plays} lượt nghe</span>
                      <span>{track.duration}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "20px", color: "var(--text-muted)", fontSize: "0.8rem" }}>
              <Info size={14} />
              <span>Dữ liệu thống kê lượt nghe được đồng bộ từ Vault Discography</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────
          SECTION 2: BỘ SƯU TẬP ALBUMS CỦA VAULT (VAULT ALBUMS GRID)
      ────────────────────────────────────────────────────────────────────────── */}
      <section style={{ marginBottom: "80px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <Disc3 size={20} color="var(--accent-primary)" />
              <h2 style={{ fontSize: "1.75rem", fontWeight: 800 }}>Bộ Sưu Tập Albums</h2>
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem" }}>
              Danh mục các đĩa nhạc và dự án âm thanh độc quyền trong Hidden Music Vault
            </p>
          </div>
          <span className="glass-pill" style={{ padding: "6px 14px", fontSize: "0.82rem", color: "var(--text-muted)" }}>
            4 Albums
          </span>
        </div>

        {/* Albums Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))",
            gap: "24px"
          }}
        >
          {VAULT_ALBUMS.map((album, idx) => (
            <motion.div
              key={album.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              whileHover={{ y: -6, scale: 1.02 }}
              onClick={() => handleAlbumClick(album)}
              className="glass-panel"
              style={{
                padding: "20px",
                borderRadius: "24px",
                cursor: "pointer",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                overflow: "hidden"
              }}
            >
              <div>
                {/* Album Cover Art */}
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    aspectRatio: "1/1",
                    borderRadius: "16px",
                    overflow: "hidden",
                    marginBottom: "16px",
                    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)"
                  }}
                >
                  <img
                    src={album.coverUrl}
                    alt={album.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                  {/* Subtle Vinyl Label */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: "10px",
                      left: "10px",
                      background: "rgba(0, 0, 0, 0.65)",
                      backdropFilter: "blur(8px)",
                      padding: "3px 8px",
                      borderRadius: "6px",
                      fontSize: "0.72rem",
                      fontWeight: 600,
                      color: "#ffffff"
                    }}
                  >
                    {album.trackCount} Tracks
                  </div>
                </div>

                {/* Album Title & Artist */}
                <h3 style={{ fontSize: "1.15rem", fontWeight: 700, marginBottom: "4px", color: "var(--text-primary)" }}>
                  {album.title}
                </h3>
                <p style={{ fontSize: "0.85rem", color: "var(--accent-secondary)", fontWeight: 600, marginBottom: "8px" }}>
                  {album.artist} • {album.year}
                </p>
                <p
                  style={{
                    fontSize: "0.82rem",
                    color: "var(--text-muted)",
                    lineHeight: 1.5,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden"
                  }}
                >
                  {album.description}
                </p>
              </div>

              {/* Action Button */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: "16px",
                  paddingTop: "12px",
                  borderTop: "1px solid rgba(255, 255, 255, 0.06)"
                }}
              >
                <span style={{ fontSize: "0.78rem", color: "var(--accent-primary)", fontWeight: 600 }}>
                  Không gian 3D
                </span>
                <ChevronRight size={16} color="var(--text-muted)" />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────
          SECTION 3: GIỚI THIỆU TÍNH NĂNG EXPLORE (EXPLORE TEASER)
      ────────────────────────────────────────────────────────────────────────── */}
      <section>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass-panel"
          style={{
            padding: "44px 36px",
            borderRadius: "32px",
            background: "linear-gradient(135deg, rgba(6, 182, 212, 0.08) 0%, rgba(99, 102, 241, 0.05) 100%)",
            border: "1px solid rgba(6, 182, 212, 0.2)",
            position: "relative",
            overflow: "hidden"
          }}
        >
          {/* Ambient Glow */}
          <div
            style={{
              position: "absolute",
              top: "-50px",
              left: "-50px",
              width: "250px",
              height: "250px",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(6, 182, 212, 0.3) 0%, transparent 70%)",
              filter: "blur(40px)",
              pointerEvents: "none"
            }}
          />

          <div style={{ position: "relative", zIndex: 2, maxWidth: "680px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "12px" }}>
              <Compass size={18} color="#06b6d4" />
              <span style={{ fontSize: "0.8rem", fontWeight: 700, letterSpacing: "1.5px", color: "#06b6d4", textTransform: "uppercase" }}>
                TÍNH NĂNG SẮP RA MẮT
              </span>
            </div>

            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "2rem",
                fontWeight: 800,
                lineHeight: 1.2,
                marginBottom: "12px",
                background: "linear-gradient(135deg, #ffffff 40%, #a5f3fc 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}
            >
              Explore Universe: Khám Phá Âm Nhạc Mở Rộng
            </h2>

            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "24px" }}>
              Không gian tìm kiếm và kết nối âm nhạc không giới hạn. Tự do tìm kiếm nghệ sĩ, khám phá các bản phối độc bản và kết nối thư viện YouTube Music vào Vault của bạn.
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
              <div className="glass-pill" style={{ padding: "8px 16px", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                🚀 Đang phát triển
              </div>
              <div className="glass-pill" style={{ padding: "8px 16px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                🎧 AI Music Curation
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────
          ALBUM 3D PREVIEW NOTIFICATION MODAL
      ────────────────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedAlbumModal && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 90,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(0, 0, 0, 0.7)",
              backdropFilter: "blur(16px)",
              padding: "20px"
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass-panel"
              style={{
                width: "100%",
                maxWidth: "460px",
                padding: "36px",
                borderRadius: "28px",
                textAlign: "center",
                position: "relative"
              }}
            >
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "18px",
                  background: "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px"
                }}
              >
                <Layers size={30} color="#ffffff" />
              </div>

              <h3 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: "8px" }}>
                {selectedAlbumModal.title}
              </h3>
              <p style={{ fontSize: "0.92rem", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "24px" }}>
                Không gian 3D của album này đang được chuẩn bị để tích hợp ở bước tiếp theo theo kế hoạch. Nhạc sẽ chỉ bắt đầu phát khi bạn tiến vào không gian 3D!
              </p>

              <button
                onClick={() => setSelectedAlbumModal(null)}
                className="apple-btn-primary"
                style={{ width: "100%", padding: "12px", fontSize: "0.95rem" }}
              >
                Đã hiểu
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
};
