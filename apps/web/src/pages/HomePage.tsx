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
  Heart,
  PlusCircle,
  Radio,
  Music,
  Lock
} from "lucide-react";
import { useAudioStore, DEFAULT_TRACKS } from "../store/audioStore";

// Real MCK Top Showcase Tracks extracted directly from the verified 30-track library
const BEST_PLAY_TRACKS = [
  DEFAULT_TRACKS[0],  // 01. Elegie
  DEFAULT_TRACKS[1],  // 02. IDK
  DEFAULT_TRACKS[4],  // 05. Baby (feat. marzuz)
  DEFAULT_TRACKS[6],  // 07. Mắt Môi Tay Chân (feat. Tage)
  DEFAULT_TRACKS[19], // 20. Xa Xôi (feat. Obito)
];

const formatDuration = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
};

export const HomePage: React.FC = () => {
  const { currentUser, favoritedTrackIds, toggleFavoriteTrack } = useAudioStore();
  const [selectedAlbumModal, setSelectedAlbumModal] = useState<string | null>(null);

  const toggleFavorite = (e: React.MouseEvent, trackId: string) => {
    e.stopPropagation();
    toggleFavoriteTrack(trackId);
  };

  const handleAlbumClick = (albumName: string) => {
    // Strictly display 3D space transition preparation modal (Zero music autoplay on homepage)
    setSelectedAlbumModal(albumName);
  };

  return (
    <main style={{ maxWidth: "1280px", margin: "0 auto", padding: "36px 20px 140px" }}>
      {/* ─────────────────────────────────────────────────────────────────────────
          SECTION 1: BENTO GRID BẤT ĐỐI XỨNG (HERO ALBUM & BEST PLAY SHOWCASE)
      ────────────────────────────────────────────────────────────────────────── */}
      <section style={{ marginBottom: "88px" }}>
        {/* Personalized Welcome Badge */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}
        >
          <div
            className="glass-pill"
            style={{
              padding: "6px 16px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "#a5b4fc",
              fontWeight: 600,
              fontSize: "0.86rem",
              border: "1px solid rgba(99, 102, 241, 0.25)",
              background: "rgba(99, 102, 241, 0.1)"
            }}
          >
            <Sparkles size={15} color="#818cf8" />
            <span>Xin chào, {currentUser?.name || "Người nghe Vault"} 👋</span>
          </div>
        </motion.div>

        {/* Asymmetrical Bento Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(12, 1fr)",
            gap: "24px",
            alignItems: "stretch"
          }}
        >
          {/* ── BENTO LEFT: FEATURED ALBUM HVL (99%) (7 Cols) ───────────────────── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="glass-panel"
            style={{
              gridColumn: "span 7",
              padding: "36px 32px",
              borderRadius: "32px",
              position: "relative",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              minHeight: "440px",
              background: "linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              boxShadow: "inset 0 1px 1px 0 rgba(255, 255, 255, 0.15), 0 20px 40px rgba(0, 0, 0, 0.6)"
            }}
          >
            {/* Ambient Background Radial Glow */}
            <div
              style={{
                position: "absolute",
                top: "-60px",
                right: "-60px",
                width: "280px",
                height: "280px",
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, rgba(236, 72, 153, 0.15) 50%, transparent 70%)",
                filter: "blur(40px)",
                pointerEvents: "none"
              }}
            />

            {/* Top Badge & Vinyl Visual */}
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      letterSpacing: "1.5px",
                      textTransform: "uppercase",
                      padding: "4px 10px",
                      borderRadius: "8px",
                      background: "rgba(99, 102, 241, 0.2)",
                      color: "#a5b4fc",
                      border: "1px solid rgba(99, 102, 241, 0.35)"
                    }}
                  >
                    ALBUM TIÊU BIỂU
                  </span>
                  <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>• 2023 • 30 Ca Khúc</span>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "4px 10px",
                    borderRadius: "8px",
                    background: "rgba(16, 185, 129, 0.15)",
                    border: "1px solid rgba(16, 185, 129, 0.3)",
                    color: "#34d399",
                    fontSize: "0.74rem",
                    fontWeight: 700
                  }}
                >
                  <Disc3 size={13} />
                  <span>FLAC LOSSLESS</span>
                </div>
              </div>

              {/* Album Art & Titles in Flex */}
              <div style={{ display: "flex", gap: "24px", alignItems: "center", marginBottom: "20px" }}>
                {/* 3D Vinyl Sliding Effect */}
                <div style={{ position: "relative", width: "130px", height: "130px", flexShrink: 0 }}>
                  {/* Vinyl Disc behind cover */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 18, ease: "linear" }}
                    style={{
                      position: "absolute",
                      top: 0,
                      right: "-18px",
                      width: "130px",
                      height: "130px",
                      borderRadius: "50%",
                      background: "radial-gradient(circle, #18181b 0%, #09090b 45%, #27272a 50%, #09090b 55%, #18181b 100%)",
                      boxShadow: "0 8px 24px rgba(0, 0, 0, 0.7)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      zIndex: 1
                    }}
                  >
                    <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: "#6366f1", border: "4px solid #09090b" }} />
                  </motion.div>

                  {/* Album Cover Art */}
                  <img
                    src="https://media.postlain.com/covers/HVL_Album_Cover.jpg"
                    alt="HVL (99%) Cover"
                    style={{
                      position: "relative",
                      zIndex: 2,
                      width: "130px",
                      height: "130px",
                      borderRadius: "18px",
                      objectFit: "cover",
                      boxShadow: "0 12px 30px rgba(0, 0, 0, 0.8)",
                      border: "1px solid rgba(255, 255, 255, 0.15)"
                    }}
                  />
                </div>

                <div>
                  <h1
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "2.4rem",
                      fontWeight: 800,
                      lineHeight: 1.1,
                      marginBottom: "6px",
                      background: "linear-gradient(135deg, #ffffff 50%, rgba(255,255,255,0.7) 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent"
                    }}
                  >
                    HVL (99%)
                  </h1>
                  <p style={{ fontSize: "1.15rem", fontWeight: 700, color: "#ec4899", marginBottom: "8px" }}>
                    MCK
                  </p>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", lineHeight: 1.5, maxWidth: "380px" }}>
                    Kiệt tác phòng thu Melodic Rap & R&B đầu tay của MCK. Toàn bộ 30 ca khúc được mastering Lossless nguyên bản.
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Specs & 3D Space Button */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingTop: "20px",
                borderTop: "1px solid rgba(255, 255, 255, 0.08)"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-secondary)", fontSize: "0.82rem" }}>
                  <Layers size={15} color="#818cf8" />
                  <span>3D Spatial Soundscape</span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.04, boxShadow: "0 0 24px rgba(99, 102, 241, 0.5)" }}
                whileTap={{ scale: 0.96 }}
                onClick={() => handleAlbumClick("HVL (99%)")}
                className="apple-btn-primary"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "12px 24px",
                  fontSize: "0.92rem",
                  borderRadius: "16px"
                }}
              >
                <span>Khám phá Không gian 3D</span>
                <ArrowRight size={16} />
              </motion.button>
            </div>
          </motion.div>

          {/* ── BENTO RIGHT: BEST PLAY SHOWCASE (5 Cols) ─────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="glass-panel"
            style={{
              gridColumn: "span 5",
              padding: "28px 24px",
              borderRadius: "32px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              background: "linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%)",
              border: "1px solid rgba(255, 255, 255, 0.12)"
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Flame size={20} color="#f43f5e" />
                  <h2 style={{ fontSize: "1.15rem", fontWeight: 700 }}>Best Play Showcase</h2>
                </div>
                <span
                  style={{
                    fontSize: "0.72rem",
                    color: "var(--text-muted)",
                    background: "rgba(255,255,255,0.06)",
                    padding: "3px 8px",
                    borderRadius: "6px"
                  }}
                >
                  Xếp Hạng Yêu Thích
                </span>
              </div>

              {/* 5 Real Best Play Tracks List */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {BEST_PLAY_TRACKS.map((track, idx) => {
                  const isFav = favoritedTrackIds.includes(track.id);
                  return (
                    <div
                      key={track.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "8px 12px",
                        borderRadius: "14px",
                        background: "rgba(255, 255, 255, 0.03)",
                        border: "1px solid rgba(255, 255, 255, 0.05)",
                        transition: "all 0.2s ease"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
                        <span
                          style={{
                            fontSize: "0.85rem",
                            fontWeight: 800,
                            color: idx === 0 ? "#f43f5e" : idx === 1 ? "#ec4899" : "var(--text-muted)",
                            width: "18px",
                            textAlign: "center"
                          }}
                        >
                          {idx + 1}
                        </span>

                        <div style={{ minWidth: 0 }}>
                          <p
                            style={{
                              fontSize: "0.88rem",
                              fontWeight: 600,
                              color: "var(--text-primary)",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              maxWidth: "160px"
                            }}
                          >
                            {track.title}
                          </p>
                          <p style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                            {track.artist}
                          </p>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span
                          style={{
                            fontSize: "0.68rem",
                            fontWeight: 600,
                            padding: "2px 6px",
                            borderRadius: "6px",
                            background: "rgba(99, 102, 241, 0.12)",
                            color: track.palette.primary,
                            border: `1px solid ${track.palette.primary}40`
                          }}
                        >
                          {track.genre}
                        </span>

                        <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", minWidth: "32px", textAlign: "right" }}>
                          {formatDuration(track.duration)}
                        </span>

                        {/* Favorite Heart Button */}
                        <button
                          onClick={(e) => toggleFavorite(e, track.id)}
                          style={{
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            padding: "2px",
                            display: "flex",
                            alignItems: "center"
                          }}
                          title={isFav ? "Bỏ yêu thích" : "Yêu thích"}
                        >
                          <Heart
                            size={15}
                            color={isFav ? "#f43f5e" : "var(--text-muted)"}
                            fill={isFav ? "#f43f5e" : "none"}
                          />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "16px", color: "var(--text-muted)", fontSize: "0.76rem" }}>
              <Sparkles size={13} color="#818cf8" />
              <span>Dữ liệu bảng xếp hạng được cập nhật từ hệ thống yêu thích</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────
          SECTION 2: BỘ SƯU TẬP ALBUMS CỦA VAULT (REAL DATA ONLY - 0 FAKE ALBUMS)
      ────────────────────────────────────────────────────────────────────────── */}
      <section style={{ marginBottom: "88px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <Disc3 size={20} color="#818cf8" />
              <h2 style={{ fontSize: "1.65rem", fontWeight: 800 }}>Bộ Sưu Tập Albums</h2>
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
              Danh mục các đĩa nhạc chính thức trong Hidden Music Vault
            </p>
          </div>
          <span className="glass-pill" style={{ padding: "6px 14px", fontSize: "0.82rem", color: "var(--text-muted)" }}>
            1 Album Chính Thức
          </span>
        </div>

        {/* 2-Column Grid: 1 Real Album + 1 Future Vault Ingestion Placeholder */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "24px"
          }}
        >
          {/* Card 1: Official Real Album HVL (99%) */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -6, scale: 1.01 }}
            onClick={() => handleAlbumClick("HVL (99%)")}
            className="glass-panel"
            style={{
              padding: "24px",
              borderRadius: "28px",
              cursor: "pointer",
              position: "relative",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              background: "linear-gradient(135deg, rgba(255, 255, 255, 0.07) 0%, rgba(255, 255, 255, 0.02) 100%)",
              overflow: "hidden"
            }}
          >
            <div>
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: "16/9",
                  borderRadius: "18px",
                  overflow: "hidden",
                  marginBottom: "18px",
                  boxShadow: "0 10px 25px rgba(0, 0, 0, 0.6)"
                }}
              >
                <img
                  src="https://media.postlain.com/covers/HVL_Album_Cover.jpg"
                  alt="Album HVL"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: "12px",
                    left: "12px",
                    background: "rgba(0, 0, 0, 0.75)",
                    backdropFilter: "blur(8px)",
                    padding: "4px 10px",
                    borderRadius: "8px",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    color: "#34d399",
                    border: "1px solid rgba(52, 211, 153, 0.3)"
                  }}
                >
                  ● ĐANG HOẠT ĐỘNG
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--text-primary)" }}>
                  HVL (99%)
                </h3>
                <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>2023</span>
              </div>

              <p style={{ fontSize: "0.9rem", color: "#ec4899", fontWeight: 700, marginBottom: "8px" }}>
                MCK • 30 Ca Khúc
              </p>

              <p style={{ fontSize: "0.84rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
                Đĩa nhạc phòng thu độc quyền với toàn bộ 30 tệp FLAC Lossless được lưu trữ và tối ưu hóa giải mã byte-range trên Cloudflare R2 Vault.
              </p>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: "20px",
                paddingTop: "14px",
                borderTop: "1px solid rgba(255, 255, 255, 0.06)"
              }}
            >
              <span style={{ fontSize: "0.82rem", color: "#818cf8", fontWeight: 700 }}>
                Khám phá Không gian 3D
              </span>
              <ChevronRight size={18} color="var(--text-muted)" />
            </div>
          </motion.div>

          {/* Card 2: Future Album Ingestion from Admin Portal (Zero Fake Data) */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-panel"
            style={{
              padding: "24px",
              borderRadius: "28px",
              position: "relative",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              border: "1px dashed rgba(255, 255, 255, 0.18)",
              background: "linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%)"
            }}
          >
            <div>
              <div
                style={{
                  width: "100%",
                  aspectRatio: "16/9",
                  borderRadius: "18px",
                  background: "rgba(255, 255, 255, 0.02)",
                  border: "1px dashed rgba(255, 255, 255, 0.1)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  marginBottom: "18px"
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "16px",
                    background: "rgba(99, 102, 241, 0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <PlusCircle size={24} color="#818cf8" />
                </div>
                <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontWeight: 600 }}>
                  Vault Ingestion Pipeline
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text-secondary)" }}>
                  Dự Án Mới Sắp Ra Mắt
                </h3>
                <span className="glass-pill" style={{ padding: "2px 8px", fontSize: "0.7rem", color: "var(--text-muted)" }}>
                  Sắp mở
                </span>
              </div>

              <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", fontWeight: 600, marginBottom: "8px" }}>
                Đang chuẩn bị dữ liệu
              </p>

              <p style={{ fontSize: "0.84rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
                Dữ liệu các album và đĩa nhạc tiếp theo sẽ được đồng bộ và cập nhật thực tế từ hệ thống quản trị (Admin Portal) trong tương lai.
              </p>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginTop: "20px",
                paddingTop: "14px",
                borderTop: "1px solid rgba(255, 255, 255, 0.06)",
                color: "var(--text-muted)",
                fontSize: "0.8rem"
              }}
            >
              <Lock size={14} />
              <span>Chờ cập nhật từ Admin Portal</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────
          SECTION 3: INTERACTIVE SPACE PORTAL (EXPLORE UNIVERSE TEASER)
      ────────────────────────────────────────────────────────────────────────── */}
      <section>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass-panel"
          style={{
            padding: "48px 36px",
            borderRadius: "36px",
            background: "linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(99, 102, 241, 0.06) 50%, rgba(236, 72, 153, 0.08) 100%)",
            border: "1px solid rgba(6, 182, 212, 0.25)",
            position: "relative",
            overflow: "hidden"
          }}
        >
          {/* Multi-layered Cosmic Portal Rings */}
          <div
            style={{
              position: "absolute",
              top: "-80px",
              right: "-60px",
              width: "360px",
              height: "360px",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(6, 182, 212, 0.35) 0%, rgba(99, 102, 241, 0.2) 45%, transparent 70%)",
              filter: "blur(50px)",
              pointerEvents: "none"
            }}
          />

          <div style={{ position: "relative", zIndex: 2, maxWidth: "720px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "8px",
                  background: "rgba(6, 182, 212, 0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <Compass size={16} color="#06b6d4" />
              </div>
              <span style={{ fontSize: "0.8rem", fontWeight: 700, letterSpacing: "1.5px", color: "#06b6d4", textTransform: "uppercase" }}>
                INTERACTIVE SPACE PORTAL
              </span>
            </div>

            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "2.2rem",
                fontWeight: 800,
                lineHeight: 1.15,
                marginBottom: "14px",
                background: "linear-gradient(135deg, #ffffff 30%, #a5f3fc 70%, #c084fc 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}
            >
              Explore Universe: Vũ Trụ Âm Nhạc Mở Rộng
            </h2>

            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "28px" }}>
              Cổng không gian tương tác kết nối âm nhạc mở rộng. Tự do tìm kiếm nghệ sĩ indie, khám phá các bản phối độc bản và mở rộng không gian giải trí của bạn với công nghệ streaming độ trễ cực thấp.
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
              <div
                className="glass-pill"
                style={{
                  padding: "8px 16px",
                  fontSize: "0.85rem",
                  color: "#06b6d4",
                  fontWeight: 600,
                  border: "1px solid rgba(6, 182, 212, 0.3)"
                }}
              >
                🪐 Không gian vũ trụ đang xây dựng
              </div>
              <div
                className="glass-pill"
                style={{
                  padding: "8px 16px",
                  fontSize: "0.85rem",
                  color: "var(--text-muted)"
                }}
              >
                🎧 YouTube Music Bridge Engine
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────
          ALBUM 3D PREVIEW TRANSITION MODAL (NO MUSIC AUTOPLAY)
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
              background: "rgba(0, 0, 0, 0.75)",
              backdropFilter: "blur(20px)",
              padding: "20px"
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              className="glass-panel"
              style={{
                width: "100%",
                maxWidth: "480px",
                padding: "36px 32px",
                borderRadius: "32px",
                textAlign: "center",
                position: "relative",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                boxShadow: "0 25px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(99, 102, 241, 0.3)"
              }}
            >
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "20px",
                  background: "linear-gradient(135deg, #6366f1 0%, #ec4899 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                  boxShadow: "0 0 30px rgba(99, 102, 241, 0.5)"
                }}
              >
                <Layers size={32} color="#ffffff" />
              </div>

              <h3 style={{ fontSize: "1.45rem", fontWeight: 800, marginBottom: "8px" }}>
                {selectedAlbumModal}
              </h3>

              <p style={{ fontSize: "0.92rem", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "28px" }}>
                Không gian 3D tương tác của album đang được thiết lập. Theo đúng quy tắc thiết kế, âm nhạc sẽ chỉ bắt đầu được nạp và phát khi bạn chính thức bước vào không gian 3D của album!
              </p>

              <button
                onClick={() => setSelectedAlbumModal(null)}
                className="apple-btn-primary"
                style={{ width: "100%", padding: "14px", fontSize: "0.95rem", borderRadius: "16px" }}
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
