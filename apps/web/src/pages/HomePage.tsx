import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ArrowRight } from "lucide-react";
import { useAudioStore, DEFAULT_TRACKS, Track } from "../store/audioStore";

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
  const { currentTrack, playTrack, favoritedTrackIds, toggleFavoriteTrack } = useAudioStore();
  
  // Active Section: 0 = Section 1, 1 = Section 2, 2 = Section 3
  const [activeSection, setActiveSection] = useState(0);
  const [selectedAlbumModal, setSelectedAlbumModal] = useState<string | null>(null);
  const [activeCarouselIndex, setActiveCarouselIndex] = useState(0);

  // Section 1 Internal States (Desktop)
  // - "fadeIn": 0s - 0.4s (fade in at center)
  // - "bursting": 0.4s - 1.1s (aura burst glow at center)
  // - "resting_initial": 1.1s - 2.1s (rest at center for 1.0s)
  // - "settled": 2.1s+ (slid left + tracks slid right)
  // - "returning_center": tracks sucking in (0.7s) + album sliding back to center (0.7s) + halo fading out completely
  // - "resting_center": resting still at dead-center for 0.5s with zero glow
  const [sec1State, setSec1State] = useState<"fadeIn" | "bursting" | "resting_initial" | "settled" | "returning_center" | "resting_center">("fadeIn");
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  const isScrollingRef = useRef(false);
  const touchStartYRef = useRef(0);

  // Initial Section 1 Sequence on Page Load
  useEffect(() => {
    setSec1State("fadeIn");

    const burstTimer = setTimeout(() => {
      setSec1State("bursting");
    }, 400);

    const restTimer = setTimeout(() => {
      setSec1State("resting_initial");
    }, 1100);

    const settleTimer = setTimeout(() => {
      setSec1State("settled");
    }, 2100);

    return () => {
      clearTimeout(burstTimer);
      clearTimeout(restTimer);
      clearTimeout(settleTimer);
    };
  }, []);

  const toggleFavorite = (e: React.MouseEvent, trackId: string) => {
    e.stopPropagation();
    toggleFavoriteTrack(trackId);
  };

  const handleAlbumClick = (albumName: string) => {
    setSelectedAlbumModal(albumName);
  };

  const handleTrackSelect = (track: Track) => {
    playTrack(track);
  };

  // Forward Transition: Section 1 ➔ Section 2
  const handleTransition1To2 = () => {
    if (isAnimating) return;
    setIsAnimating(true);

    // Bước 1: 5 tracks thu vào bìa (0.7s) + Bìa trượt về tâm (0.7s) + Hào quang fade out 100%
    setSec1State("returning_center");

    // Bước 2: Sau 0.7s, bước vào khoảng nghỉ tĩnh tại tâm 0.5s
    setTimeout(() => {
      setSec1State("resting_center");

      // Bước 3: Sau khoảng nghỉ 0.5s (tổng 1.2s), đổi sang Section 2 mà KHÔNG BỊ CHỚP
      setTimeout(() => {
        setActiveSection(1);
        setIsAnimating(false);
      }, 500);
    }, 700);
  };

  // Reverse Transition: Section 2 ➔ Section 1
  const handleTransition2To1 = () => {
    if (isAnimating) return;
    setIsAnimating(true);

    // Đưa về Section 1 ở trạng thái tâm điểm (returning_center)
    setActiveSection(0);
    setSec1State("returning_center");

    // Lập tức cho bìa trượt sang trái mượt mà trong 1.0s và các track bung mở sang phải trong 1.0s
    setTimeout(() => {
      setSec1State("settled");
      setTimeout(() => {
        setIsAnimating(false);
      }, 1000);
    }, 50);
  };

  // Fixed Viewport Screen Switching on Wheel, Keydown, and Touch
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (isScrollingRef.current || isAnimating) return;

      if (e.deltaY > 25) {
        // Cuộn xuống ➔ Next Section
        if (activeSection === 0 && sec1State === "settled") {
          handleTransition1To2();
        } else if (activeSection === 1) {
          isScrollingRef.current = true;
          setActiveSection(2);
          setTimeout(() => {
            isScrollingRef.current = false;
          }, 600);
        }
      } else if (e.deltaY < -25) {
        // Cuộn lên ➔ Prev Section
        if (activeSection === 1) {
          handleTransition2To1();
        } else if (activeSection === 2) {
          isScrollingRef.current = true;
          setActiveSection(1);
          setTimeout(() => {
            isScrollingRef.current = false;
          }, 600);
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isScrollingRef.current || isAnimating) return;
      if (e.key === "ArrowDown" || e.key === "PageDown") {
        if (activeSection === 0 && sec1State === "settled") {
          handleTransition1To2();
        } else if (activeSection === 1) {
          isScrollingRef.current = true;
          setActiveSection(2);
          setTimeout(() => {
            isScrollingRef.current = false;
          }, 600);
        }
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        if (activeSection === 1) {
          handleTransition2To1();
        } else if (activeSection === 2) {
          isScrollingRef.current = true;
          setActiveSection(1);
          setTimeout(() => {
            isScrollingRef.current = false;
          }, 600);
        }
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartYRef.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (isScrollingRef.current || isAnimating) return;
      const deltaY = touchStartYRef.current - e.changedTouches[0].clientY;
      if (deltaY > 40) {
        if (activeSection === 0 && sec1State === "settled") {
          handleTransition1To2();
        } else if (activeSection === 1) {
          isScrollingRef.current = true;
          setActiveSection(2);
          setTimeout(() => {
            isScrollingRef.current = false;
          }, 600);
        }
      } else if (deltaY < -40) {
        if (activeSection === 1) {
          handleTransition2To1();
        } else if (activeSection === 2) {
          isScrollingRef.current = true;
          setActiveSection(1);
          setTimeout(() => {
            isScrollingRef.current = false;
          }, 600);
        }
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
  }, [activeSection, sec1State, isAnimating]);

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
      {/* ─────────────────────────────────────────────────────────────────────
          SECTION 1 (ACTIVE === 0)
      ────────────────────────────────────────────────────────────────────── */}
      {activeSection === 0 && (
        <div
          style={{
            width: "100%",
            maxWidth: "1120px",
            padding: "0 32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative"
          }}
        >
          {/* TRẠNG THÁI Ở TÂM: fadeIn | bursting | resting_initial | returning_center | resting_center */}
          {sec1State !== "settled" && (
            <div
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              {/* Vầng Hào Quang Aurora (Fade In lúc burst và Fade Out hoàn toàn trước khi nghỉ) */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                  opacity: sec1State === "bursting" || sec1State === "resting_initial" ? 1 : 0,
                  scale: sec1State === "bursting" || sec1State === "resting_initial" ? 1 : 0.95
                }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="aurora-burst-halo"
                style={{
                  position: "absolute",
                  inset: "-24px",
                  borderRadius: "44px",
                  pointerEvents: "none",
                  zIndex: 0
                }}
              />

              {/* Bìa Album ở tâm */}
              <motion.div
                layoutId="desktop-album-hero"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{
                  opacity: 1,
                  scale: 1
                }}
                transition={{
                  duration: sec1State === "fadeIn" ? 0.4 : 0.7,
                  ease: [0.16, 1, 0.3, 1]
                }}
                style={{
                  width: "360px",
                  height: "360px",
                  borderRadius: "32px",
                  overflow: "hidden",
                  boxShadow: "0 30px 80px rgba(0, 0, 0, 0.95), 0 0 50px rgba(255, 255, 255, 0.35)",
                  border: "1px solid rgba(255, 255, 255, 0.25)",
                  position: "relative",
                  zIndex: 1,
                  background: "#18181b"
                }}
              >
                <img
                  src="https://media.postlain.com/covers/HVL_Album_Cover.jpg"
                  alt="HVL (99%)"
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
              </motion.div>
            </div>
          )}

          {/* TRẠNG THÁI ĐÃ TRƯỢT SANG TRÁI (settled) */}
          {sec1State === "settled" && (
            <div
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "54px"
              }}
            >
              {/* Left: Bìa album trượt sang trái chậm rãi 1.0s */}
              <motion.div
                layoutId="desktop-album-hero"
                initial={{ x: 140, scale: 1.08, opacity: 0.9 }}
                animate={{ x: 0, scale: 1, opacity: 1 }}
                exit={{ x: 140, scale: 1.08, opacity: 0.9 }}
                transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ scale: 1.02 }}
                onClick={() => handleAlbumClick("HVL (99%)")}
                style={{
                  width: "360px",
                  height: "360px",
                  borderRadius: "32px",
                  overflow: "hidden",
                  boxShadow: "0 30px 80px rgba(0, 0, 0, 0.9), 0 0 1px 1px rgba(255, 255, 255, 0.25)",
                  cursor: "pointer",
                  background: "#18181b",
                  flexShrink: 0
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

              {/* Right: 5 Tracks trượt sang phải 1.0s */}
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -80, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } }}
                transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  width: "100%",
                  maxWidth: "520px"
                }}
              >
                {BEST_PLAY_TRACKS.map((track, idx) => {
                  const isFav = favoritedTrackIds.includes(track.id);
                  const isCurrent = currentTrack?.id === track.id;

                  return (
                    <motion.div
                      key={track.id}
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: 0.9,
                        delay: 0.05 * idx,
                        ease: [0.16, 1, 0.3, 1]
                      }}
                      onClick={() => handleTrackSelect(track)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "14px 20px",
                        borderRadius: "18px",
                        background: isCurrent
                          ? "rgba(255, 255, 255, 0.12)"
                          : "rgba(255, 255, 255, 0.04)",
                        border: isCurrent
                          ? "1px solid rgba(255, 255, 255, 0.35)"
                          : "1px solid rgba(255, 255, 255, 0.08)",
                        boxShadow: isCurrent ? "0 4px 20px rgba(255, 255, 255, 0.15)" : "none",
                        cursor: "pointer",
                        transition: "all 0.25s ease"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "16px", minWidth: 0 }}>
                        <span
                          style={{
                            fontSize: "0.88rem",
                            fontWeight: 700,
                            color: isCurrent ? "#ffffff" : "rgba(255, 255, 255, 0.4)",
                            width: "22px",
                            textAlign: "center"
                          }}
                        >
                          {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                        </span>

                        <div style={{ minWidth: 0 }}>
                          <p
                            style={{
                              fontSize: "0.98rem",
                              fontWeight: isCurrent ? 700 : 600,
                              color: "#ffffff",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis"
                            }}
                          >
                            {track.title}
                          </p>
                          <p style={{ fontSize: "0.8rem", color: "rgba(255, 255, 255, 0.5)" }}>
                            {track.artist}
                          </p>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <span style={{ fontSize: "0.85rem", color: "rgba(255, 255, 255, 0.4)" }}>
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
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────
          SECTION 2 (ACTIVE === 1) - DEAD CENTERED, ZERO FLASH
      ────────────────────────────────────────────────────────────────────── */}
      {activeSection === 1 && (
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%"
          }}
        >
          {/* Metallic Sheen Breathing Ambient Glow Background */}
          <div className="metallic-sheen-glow" />

          {/* Container for Album + Absolute Positioned Dots */}
          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            {/* Seamless Shared Layout Morphing Album Card (Exact Dead-Center) */}
            <motion.div
              layoutId="desktop-album-hero"
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
                boxShadow: "0 30px 80px rgba(0, 0, 0, 0.95), 0 0 1px 1px rgba(255, 255, 255, 0.3)",
                cursor: "grab",
                background: "#18181b",
                position: "relative",
                zIndex: 1
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

            {/* Absolute Positioned Pagination Dots */}
            <div
              style={{
                position: "absolute",
                bottom: "-48px",
                left: 0,
                right: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "12px",
                zIndex: 1
              }}
            >
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
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────
          SECTION 3 (ACTIVE === 2)
      ────────────────────────────────────────────────────────────────────── */}
      {activeSection === 2 && (
        <motion.div
          key="section-3"
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.88 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
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
