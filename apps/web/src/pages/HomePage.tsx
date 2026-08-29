import React, { useState, useEffect, useRef } from "react";
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
  const [activeSection, setActiveSection] = useState(0); // 0: Section 1, 1: Section 2, 2: Section 3
  const [activeCarouselIndex, setActiveCarouselIndex] = useState(0);
  const isScrollingRef = useRef(false);
  const touchStartYRef = useRef(0);

  const toggleFavorite = (e: React.MouseEvent, trackId: string) => {
    e.stopPropagation();
    toggleFavoriteTrack(trackId);
  };

  const handleAlbumClick = (albumName: string) => {
    setSelectedAlbumModal(albumName);
  };

  // Fixed Viewport Screen Switching on Wheel, Keydown, and Touch (Zero Scrollbar)
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (isScrollingRef.current) return;

      if (e.deltaY > 25) {
        // Scroll down ➔ Next Section
        isScrollingRef.current = true;
        setActiveSection((prev) => Math.min(prev + 1, 2));
        setTimeout(() => {
          isScrollingRef.current = false;
        }, 650);
      } else if (e.deltaY < -25) {
        // Scroll up ➔ Prev Section
        isScrollingRef.current = true;
        setActiveSection((prev) => Math.max(prev - 1, 0));
        setTimeout(() => {
          isScrollingRef.current = false;
        }, 650);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isScrollingRef.current) return;
      if (e.key === "ArrowDown" || e.key === "PageDown") {
        isScrollingRef.current = true;
        setActiveSection((prev) => Math.min(prev + 1, 2));
        setTimeout(() => {
          isScrollingRef.current = false;
        }, 650);
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        isScrollingRef.current = true;
        setActiveSection((prev) => Math.max(prev - 1, 0));
        setTimeout(() => {
          isScrollingRef.current = false;
        }, 650);
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartYRef.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (isScrollingRef.current) return;
      const deltaY = touchStartYRef.current - e.changedTouches[0].clientY;
      if (deltaY > 40) {
        isScrollingRef.current = true;
        setActiveSection((prev) => Math.min(prev + 1, 2));
        setTimeout(() => {
          isScrollingRef.current = false;
        }, 650);
      } else if (deltaY < -40) {
        isScrollingRef.current = true;
        setActiveSection((prev) => Math.max(prev - 1, 0));
        setTimeout(() => {
          isScrollingRef.current = false;
        }, 650);
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  return (
    <main
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#ffffff",
        zIndex: 1
      }}
    >
      <AnimatePresence mode="wait">
        {/* ─────────────────────────────────────────────────────────────────────
            SECTION 1 (ACTIVE === 0): EXPANDING ALBUM & STAGGERED TRACKLIST
        ────────────────────────────────────────────────────────────────────── */}
        {activeSection === 0 && (
          <motion.div
            key="section-1"
            initial={{ opacity: 0, scale: 0.92, filter: "blur(8px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{
              opacity: 0,
              scale: 0.94,
              y: -30,
              filter: "blur(8px)",
              transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
            }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            style={{
              width: "100%",
              maxWidth: "1080px",
              padding: "0 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <div
              style={{
                width: "100%",
                background: "linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: "36px",
                padding: "40px",
                boxShadow: "0 30px 70px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
                display: "grid",
                gridTemplateColumns: "repeat(12, 1fr)",
                gap: "48px",
                alignItems: "center"
              }}
            >
              {/* Left: Square Rounded Album Cover sliding in */}
              <motion.div
                initial={{ x: 60, scale: 1.04 }}
                animate={{ x: 0, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  gridColumn: "span 5",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center"
                }}
              >
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  onClick={() => handleAlbumClick("HVL (99%)")}
                  style={{
                    width: "100%",
                    maxWidth: "340px",
                    aspectRatio: "1/1",
                    borderRadius: "28px",
                    overflow: "hidden",
                    boxShadow: "0 20px 50px rgba(0, 0, 0, 0.85), 0 0 1px 1px rgba(255, 255, 255, 0.2)",
                    cursor: "pointer",
                    background: "#18181b"
                  }}
                >
                  <img
                    src="https://media.postlain.com/covers/HVL_Album_Cover.jpg"
                    alt="HVL (99%)"
                    loading="eager"
                    decoding="async"
                    fetchPriority="high"
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                </motion.div>
              </motion.div>

              {/* Right: Minimalist Tracklist with Stagger Animation */}
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  gridColumn: "span 7",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px"
                }}
              >
                {BEST_PLAY_TRACKS.map((track, idx) => {
                  const isFav = favoritedTrackIds.includes(track.id);
                  return (
                    <motion.div
                      key={track.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 * idx + 0.3 }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "12px 18px",
                        borderRadius: "16px",
                        background: "rgba(255, 255, 255, 0.03)",
                        border: "1px solid rgba(255, 255, 255, 0.07)",
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
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* ─────────────────────────────────────────────────────────────────────
            SECTION 2 (ACTIVE === 1): 3D COVER FLOW & SYNCHRONIZED DOTS
        ────────────────────────────────────────────────────────────────────── */}
        {activeSection === 1 && (
          <motion.div
            key="section-2"
            initial={{ opacity: 0, scale: 0.88, y: 40, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
            exit={{
              opacity: 0,
              scale: 1.15,
              y: -50,
              filter: "blur(10px)",
              transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
            }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            style={{
              width: "100%",
              maxWidth: "600px",
              padding: "0 24px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            {/* Draggable & Synchronized Album Card */}
            <motion.div
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.35}
              onDragEnd={(_, info) => {
                if (info.offset.x < -40) {
                  setActiveCarouselIndex(1);
                } else if (info.offset.x > 40) {
                  setActiveCarouselIndex(0);
                }
              }}
              whileHover={{ scale: 1.03 }}
              onClick={() => handleAlbumClick("HVL (99%)")}
              style={{
                width: "360px",
                height: "360px",
                borderRadius: "32px",
                overflow: "hidden",
                boxShadow: "0 30px 80px rgba(0, 0, 0, 0.95), 0 0 1px 1px rgba(255, 255, 255, 0.25)",
                cursor: "grab",
                marginBottom: "36px",
                background: "#18181b",
                position: "relative"
              }}
            >
              <img
                src="https://media.postlain.com/covers/HVL_Album_Cover.jpg"
                alt="HVL (99%)"
                loading="eager"
                decoding="async"
                fetchPriority="high"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                  pointerEvents: "none"
                }}
              />
            </motion.div>

            {/* Synchronized Pagination Dots */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <motion.div
                onClick={() => setActiveCarouselIndex(0)}
                animate={{
                  width: activeCarouselIndex === 0 ? "28px" : "10px",
                  background: activeCarouselIndex === 0 ? "#ffffff" : "rgba(255, 255, 255, 0.25)"
                }}
                transition={{ duration: 0.3 }}
                style={{
                  height: "10px",
                  borderRadius: "999px",
                  cursor: "pointer"
                }}
              />
              <motion.div
                onClick={() => setActiveCarouselIndex(1)}
                animate={{
                  width: activeCarouselIndex === 1 ? "28px" : "10px",
                  background: activeCarouselIndex === 1 ? "#ffffff" : "rgba(255, 255, 255, 0.25)"
                }}
                transition={{ duration: 0.3 }}
                style={{
                  height: "10px",
                  borderRadius: "999px",
                  cursor: "pointer"
                }}
              />
            </div>
          </motion.div>
        )}

        {/* ─────────────────────────────────────────────────────────────────────
            SECTION 3 (ACTIVE === 2): SINGLE LUXURY BUTTON WITH LUMINOUS HOVER
        ────────────────────────────────────────────────────────────────────── */}
        {activeSection === 2 && (
          <motion.div
            key="section-3"
            initial={{ opacity: 0, scale: 0.85, filter: "blur(12px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{
              opacity: 0,
              scale: 0.85,
              filter: "blur(12px)",
              transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
            }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 24px"
            }}
          >
            <motion.button
              initial={{ opacity: 0.4, scale: 0.98 }}
              whileHover={{
                opacity: 1,
                scale: 1.05,
                boxShadow: "0 0 50px rgba(255, 255, 255, 0.45)",
                background: "#ffffff",
                color: "#000000"
              }}
              whileTap={{ scale: 0.95 }}
              onClick={onExploreClick}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "14px",
                padding: "20px 52px",
                fontSize: "1.05rem",
                fontWeight: 800,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                borderRadius: "999px",
                background: "rgba(255, 255, 255, 0.08)",
                color: "#ffffff",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                backdropFilter: "blur(16px)",
                cursor: "pointer",
                transition: "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)"
              }}
            >
              <span>CHUYỂN QUA EXPLORE</span>
              <ArrowRight size={20} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

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
