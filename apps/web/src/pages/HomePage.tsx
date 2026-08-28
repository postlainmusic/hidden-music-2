import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ArrowRight } from "lucide-react";
import { useAudioStore, DEFAULT_TRACKS } from "../store/audioStore";

// Real 5 Best Play tracks extracted from verified MCK library
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

interface HomePageProps {
  onExploreClick?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onExploreClick }) => {
  const { favoritedTrackIds, toggleFavoriteTrack } = useAudioStore();
  const [selectedAlbumModal, setSelectedAlbumModal] = useState<string | null>(null);
  const [activeCarouselIndex, setActiveCarouselIndex] = useState(0);

  const toggleFavorite = (e: React.MouseEvent, trackId: string) => {
    e.stopPropagation();
    toggleFavoriteTrack(trackId);
  };

  const handleAlbumClick = (albumName: string) => {
    setSelectedAlbumModal(albumName);
  };

  return (
    <main style={{ width: "100%", overflowX: "hidden", color: "#ffffff" }}>
      {/* ─────────────────────────────────────────────────────────────────────────
          SECTION 1 (100VH): AWWWARDS EXPANDING MOTION (CENTER COVER ➔ SLIDE LEFT)
      ────────────────────────────────────────────────────────────────────────── */}
      <section
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "100px 32px 60px",
          position: "relative"
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{
            width: "100%",
            maxWidth: "1080px",
            background: "linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "36px",
            padding: "40px",
            boxShadow: "0 30px 60px rgba(0, 0, 0, 0.9)",
            display: "grid",
            gridTemplateColumns: "repeat(12, 1fr)",
            gap: "48px",
            alignItems: "center"
          }}
        >
          {/* Left: Square Rounded Album Cover sliding in */}
          <motion.div
            initial={{ x: 120, scale: 1.05 }}
            animate={{ x: 0, scale: 1 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{
              gridColumn: "span 5",
              display: "flex",
              flexDirection: "column",
              alignItems: "center"
            }}
          >
            <div
              onClick={() => handleAlbumClick("HVL (99%)")}
              style={{
                width: "100%",
                maxWidth: "340px",
                aspectRatio: "1/1",
                borderRadius: "28px",
                overflow: "hidden",
                boxShadow: "0 20px 50px rgba(0, 0, 0, 0.8), 0 0 1px 1px rgba(255, 255, 255, 0.15)",
                cursor: "pointer",
                position: "relative"
              }}
            >
              <img
                src="https://media.postlain.com/covers/HVL_Album_Cover.jpg"
                alt="HVL (99%)"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
          </motion.div>

          {/* Right: Minimalist Tracklist revealing cleanly */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{
              gridColumn: "span 7",
              display: "flex",
              flexDirection: "column",
              gap: "14px"
            }}
          >
            {BEST_PLAY_TRACKS.map((track, idx) => {
              const isFav = favoritedTrackIds.includes(track.id);
              return (
                <div
                  key={track.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 18px",
                    borderRadius: "16px",
                    background: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid rgba(255, 255, 255, 0.06)",
                    transition: "all 0.25s ease"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "16px", minWidth: 0 }}>
                    <span
                      style={{
                        fontSize: "0.85rem",
                        fontWeight: 700,
                        color: "rgba(255, 255, 255, 0.4)",
                        width: "20px",
                        textAlign: "center"
                      }}
                    >
                      {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                    </span>

                    <div style={{ minWidth: 0 }}>
                      <p
                        style={{
                          fontSize: "0.95rem",
                          fontWeight: 600,
                          color: "#ffffff",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis"
                        }}
                      >
                        {track.title}
                      </p>
                      <p style={{ fontSize: "0.78rem", color: "rgba(255, 255, 255, 0.5)" }}>
                        {track.artist}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <span style={{ fontSize: "0.82rem", color: "rgba(255, 255, 255, 0.4)" }}>
                      {formatDuration(track.duration)}
                    </span>

                    <button
                      onClick={(e) => toggleFavorite(e, track.id)}
                      style={{
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        padding: "4px",
                        display: "flex",
                        alignItems: "center"
                      }}
                    >
                      <Heart
                        size={16}
                        color={isFav ? "#ffffff" : "rgba(255, 255, 255, 0.35)"}
                        fill={isFav ? "#ffffff" : "none"}
                      />
                    </button>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </motion.div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────
          SECTION 2 (100VH): PURE ALBUM COVER 3D COVER FLOW DRAGGABLE CAROUSEL
      ────────────────────────────────────────────────────────────────────────── */}
      <section
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px 32px",
          position: "relative"
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "720px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          {/* Draggable 3D Cover Flow Box */}
          <motion.div
            drag="x"
            dragConstraints={{ left: -100, right: 100 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ cursor: "grabbing" }}
            onDragEnd={(_, info) => {
              if (info.offset.x < -40) setActiveCarouselIndex((prev) => (prev + 1) % 2);
              if (info.offset.x > 40) setActiveCarouselIndex((prev) => (prev - 1 + 2) % 2);
            }}
            onClick={() => handleAlbumClick("HVL (99%)")}
            style={{
              width: "360px",
              height: "360px",
              borderRadius: "32px",
              overflow: "hidden",
              boxShadow: "0 30px 80px rgba(0, 0, 0, 0.95), 0 0 1px 1px rgba(255, 255, 255, 0.2)",
              cursor: "grab",
              marginBottom: "36px"
            }}
          >
            <img
              src="https://media.postlain.com/covers/HVL_Album_Cover.jpg"
              alt="HVL (99%)"
              style={{ width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none" }}
            />
          </motion.div>

          {/* Minimalist Motion Pagination Dots */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              onClick={() => setActiveCarouselIndex(0)}
              style={{
                width: activeCarouselIndex === 0 ? "24px" : "8px",
                height: "8px",
                borderRadius: "999px",
                background: activeCarouselIndex === 0 ? "#ffffff" : "rgba(255, 255, 255, 0.2)",
                transition: "all 0.3s ease",
                cursor: "pointer"
              }}
            />
            <div
              onClick={() => setActiveCarouselIndex(1)}
              style={{
                width: activeCarouselIndex === 1 ? "24px" : "8px",
                height: "8px",
                borderRadius: "999px",
                background: activeCarouselIndex === 1 ? "#ffffff" : "rgba(255, 255, 255, 0.2)",
                transition: "all 0.3s ease",
                cursor: "pointer"
              }}
            />
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────
          SECTION 3 (100VH): SINGLE LUXURY BUTTON TO SWITCH TO EXPLORE
      ────────────────────────────────────────────────────────────────────────── */}
      <section
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px 32px"
        }}
      >
        <motion.button
          whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(255, 255, 255, 0.25)" }}
          whileTap={{ scale: 0.95 }}
          onClick={onExploreClick}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "14px",
            padding: "20px 48px",
            fontSize: "1.1rem",
            fontWeight: 800,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            borderRadius: "999px",
            background: "#ffffff",
            color: "#000000",
            border: "none",
            cursor: "pointer",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.8)",
            transition: "all 0.3s ease"
          }}
        >
          <span>CHUYỂN QUA EXPLORE</span>
          <ArrowRight size={20} color="#000000" />
        </motion.button>
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
              zIndex: 200,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(0, 0, 0, 0.85)",
              backdropFilter: "blur(24px)",
              padding: "24px"
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              style={{
                width: "100%",
                maxWidth: "440px",
                padding: "36px 32px",
                borderRadius: "32px",
                textAlign: "center",
                background: "rgba(20, 20, 20, 0.9)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                boxShadow: "0 25px 60px rgba(0, 0, 0, 0.9)"
              }}
            >
              <h3 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: "12px" }}>
                {selectedAlbumModal}
              </h3>

              <p style={{ fontSize: "0.9rem", color: "rgba(255, 255, 255, 0.6)", lineHeight: 1.6, marginBottom: "28px" }}>
                Không gian 3D đang được chuẩn bị. Âm nhạc sẽ chỉ nạp và phát khi bước vào khu vực 3D của album.
              </p>

              <button
                onClick={() => setSelectedAlbumModal(null)}
                style={{
                  width: "100%",
                  padding: "14px",
                  fontSize: "0.92rem",
                  fontWeight: 700,
                  borderRadius: "16px",
                  background: "#ffffff",
                  color: "#000000",
                  border: "none",
                  cursor: "pointer"
                }}
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
