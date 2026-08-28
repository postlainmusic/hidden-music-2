import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ArrowRight } from "lucide-react";
import { useAudioStore, DEFAULT_TRACKS, Track } from "../store/audioStore";

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

interface MobileHomePageProps {
  onExploreClick?: () => void;
}

export const MobileHomePage: React.FC<MobileHomePageProps> = ({ onExploreClick }) => {
  const { currentTrack, playTrack, favoritedTrackIds, toggleFavoriteTrack } = useAudioStore();
  
  // Active Section: 0 = Section 1, 1 = Section 2, 2 = Section 3
  const [activeSection, setActiveSection] = useState<number>(0);
  const [selectedAlbumModal, setSelectedAlbumModal] = useState<string | null>(null);
  const [carouselIndex, setCarouselIndex] = useState<number>(0);

  // Section 1 Internal States:
  // - "fadeIn": 0s - 0.4s (fade in at center)
  // - "bursting": 0.4s - 1.1s (aura burst glow at center)
  // - "resting_initial": 1.1s - 2.1s (rest at center for 1.0s)
  // - "settled": 2.1s+ (slid up to top + tracks slid down)
  // - "returning_center": tracks sucking in (0.7s) + album sliding back to center (0.7s) + halo fading out completely
  // - "resting_center": resting still at dead-center for 0.5s with zero glow
  const [sec1State, setSec1State] = useState<"fadeIn" | "bursting" | "resting_initial" | "settled" | "returning_center" | "resting_center">("fadeIn");
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  const touchStartY = useRef<number>(0);

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

    // Lập tức cho bìa trượt lên đỉnh mượt mà trong 1.0s và các track bung mở xuống dưới trong 1.0s
    setTimeout(() => {
      setSec1State("settled");
      setTimeout(() => {
        setIsAnimating(false);
      }, 1000);
    }, 50);
  };

  // Touch Swipe Gesture Handler
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (isAnimating) return;
      const deltaY = touchStartY.current - e.changedTouches[0].clientY;

      if (deltaY > 38) {
        // Vuốt lên (Next Section)
        if (activeSection === 0 && sec1State === "settled") {
          handleTransition1To2();
        } else if (activeSection === 1) {
          setIsAnimating(true);
          setActiveSection(2);
          setTimeout(() => setIsAnimating(false), 500);
        }
      } else if (deltaY < -38) {
        // Vuốt xuống (Prev Section)
        if (activeSection === 1) {
          handleTransition2To1();
        } else if (activeSection === 2) {
          setIsAnimating(true);
          setActiveSection(1);
          setTimeout(() => setIsAnimating(false), 500);
        }
      }
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [activeSection, sec1State, isAnimating]);

  const handleTrackSelect = (track: Track) => {
    playTrack(track);
  };

  return (
    <main
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100dvh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "#ffffff",
        zIndex: 1,
        paddingTop: "max(62px, env(safe-area-inset-top, 62px))",
        paddingBottom: "max(72px, env(safe-area-inset-bottom, 72px))",
        paddingLeft: "16px",
        paddingRight: "16px"
      }}
    >
      {/* ─────────────────────────────────────────────────────────────────────
          SECTION 1 (ACTIVE === 0)
      ────────────────────────────────────────────────────────────────────── */}
      {activeSection === 0 && (
        <div
          style={{
            width: "100%",
            maxWidth: "340px",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: sec1State === "settled" ? "space-between" : "center",
            alignItems: "center",
            gap: "12px",
            padding: "6px 0",
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
                  inset: "-18px",
                  borderRadius: "36px",
                  pointerEvents: "none",
                  zIndex: 0
                }}
              />

              {/* Bìa Album ở tâm */}
              <motion.div
                layoutId="mobile-album-hero"
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
                  width: "min(84vw, 290px)",
                  height: "min(84vw, 290px)",
                  borderRadius: "28px",
                  overflow: "hidden",
                  boxShadow: "0 25px 70px rgba(0, 0, 0, 0.95), 0 0 45px rgba(255, 255, 255, 0.35)",
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

          {/* TRẠNG THÁI ĐÃ TRƯỢT LÊN ĐỈNH (settled) */}
          {sec1State === "settled" && (
            <>
              {/* Top: Bìa album trượt lên đỉnh chậm rãi 1.0s */}
              <motion.div
                layoutId="mobile-album-hero"
                initial={{ y: 80, scale: 1.25, opacity: 0.9 }}
                animate={{ y: 0, scale: 1, opacity: 1 }}
                exit={{ y: 80, scale: 1.25, opacity: 0.9 }}
                transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => setSelectedAlbumModal("HVL (99%)")}
                style={{
                  width: "160px",
                  height: "160px",
                  borderRadius: "24px",
                  overflow: "hidden",
                  flexShrink: 0,
                  boxShadow: "0 14px 35px rgba(0, 0, 0, 0.85), 0 0 25px rgba(255, 255, 255, 0.2)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  cursor: "pointer",
                  background: "#18181b",
                  marginTop: "2px"
                }}
              >
                <img
                  src="https://media.postlain.com/covers/HVL_Album_Cover.jpg"
                  alt="HVL (99%)"
                  loading="eager"
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
              </motion.div>

              {/* Bottom: 5 Tracks trượt xuống dưới bìa đĩa 1.0s */}
              <motion.div
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -60, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } }}
                transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "7px",
                  flex: 1,
                  width: "100%",
                  justifyContent: "center"
                }}
              >
                {BEST_PLAY_TRACKS.map((track, idx) => {
                  const isFav = favoritedTrackIds.includes(track.id);
                  const isCurrent = currentTrack?.id === track.id;

                  return (
                    <motion.div
                      key={track.id}
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
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
                        padding: "10px 14px",
                        borderRadius: "16px",
                        background: isCurrent
                          ? "rgba(255, 255, 255, 0.12)"
                          : "rgba(255, 255, 255, 0.04)",
                        border: isCurrent
                          ? "1px solid rgba(255, 255, 255, 0.3)"
                          : "1px solid rgba(255, 255, 255, 0.07)",
                        boxShadow: isCurrent ? "0 4px 16px rgba(255, 255, 255, 0.15)" : "none",
                        cursor: "pointer",
                        transition: "all 0.2s ease"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0, flex: 1 }}>
                        <span
                          style={{
                            fontSize: "0.8rem",
                            fontWeight: 700,
                            color: isCurrent ? "#ffffff" : "rgba(255, 255, 255, 0.4)",
                            width: "18px",
                            textAlign: "center"
                          }}
                        >
                          {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                        </span>

                        <div style={{ minWidth: 0, flex: 1 }}>
                          <p
                            style={{
                              fontSize: "0.88rem",
                              fontWeight: isCurrent ? 700 : 600,
                              color: "#ffffff",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis"
                            }}
                          >
                            {track.title}
                          </p>
                          <p
                            style={{
                              fontSize: "0.72rem",
                              color: "rgba(255, 255, 255, 0.5)",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis"
                            }}
                          >
                            {track.artist}
                          </p>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
                        <span style={{ fontSize: "0.75rem", color: "rgba(255, 255, 255, 0.4)" }}>
                          {formatDuration(track.duration)}
                        </span>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavoriteTrack(track.id);
                          }}
                          style={{
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            padding: "6px",
                            display: "flex",
                            alignItems: "center"
                          }}
                        >
                          <Heart
                            size={15}
                            color={isFav ? "#ffffff" : "rgba(255, 255, 255, 0.35)"}
                            fill={isFav ? "#ffffff" : "none"}
                          />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>

              {/* Swipe hint */}
              <div style={{ textAlign: "center", opacity: 0.35, fontSize: "0.7rem", letterSpacing: "0.08em" }}>
                VUỐT LÊN ĐỂ TIẾP TỤC
              </div>
            </>
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
            {/* Pure Album Artwork with shared layoutId matching Section 1 center exactly */}
            <motion.div
              layoutId="mobile-album-hero"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.45}
              onDragEnd={(_, info) => {
                if (info.offset.x < -35) {
                  setCarouselIndex(1);
                } else if (info.offset.x > 35) {
                  setCarouselIndex(0);
                }
              }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelectedAlbumModal("HVL (99%)")}
              style={{
                width: "min(84vw, 290px)",
                height: "min(84vw, 290px)",
                borderRadius: "28px",
                overflow: "hidden",
                boxShadow: "0 28px 70px rgba(0, 0, 0, 0.95), 0 0 1px 2px rgba(255, 255, 255, 0.3)",
                background: "#18181b",
                position: "relative",
                cursor: "grab",
                zIndex: 1
              }}
            >
              <img
                src="https://media.postlain.com/covers/HVL_Album_Cover.jpg"
                alt="HVL (99%)"
                loading="eager"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  pointerEvents: "none",
                  display: "block"
                }}
              />
            </motion.div>

            {/* Absolute Positioned Pagination Dots */}
            <div
              style={{
                position: "absolute",
                bottom: "-42px",
                left: 0,
                right: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                zIndex: 1
              }}
            >
              <motion.div
                onClick={() => setCarouselIndex(0)}
                animate={{
                  width: carouselIndex === 0 ? "24px" : "8px",
                  background: carouselIndex === 0 ? "#ffffff" : "rgba(255, 255, 255, 0.25)"
                }}
                transition={{ duration: 0.3 }}
                style={{ height: "8px", borderRadius: "999px", cursor: "pointer" }}
              />
              <motion.div
                onClick={() => setCarouselIndex(1)}
                animate={{
                  width: carouselIndex === 1 ? "24px" : "8px",
                  background: carouselIndex === 1 ? "#ffffff" : "rgba(255, 255, 255, 0.25)"
                }}
                transition={{ duration: 0.3 }}
                style={{ height: "8px", borderRadius: "999px", cursor: "pointer" }}
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
          key="mobile-section-3"
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.88 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{
            width: "100%",
            maxWidth: "360px",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "20px",
            textAlign: "center"
          }}
        >
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={onExploreClick}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              width: "100%",
              maxWidth: "320px",
              padding: "18px 24px",
              fontSize: "0.95rem",
              fontWeight: 800,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              borderRadius: "999px",
              background: "#ffffff",
              color: "#000000",
              border: "none",
              boxShadow: "0 8px 30px rgba(255, 255, 255, 0.4)",
              cursor: "pointer"
            }}
          >
            <span>CHUYỂN QUA EXPLORE</span>
            <ArrowRight size={18} />
          </motion.button>

          <p style={{ fontSize: "0.78rem", color: "rgba(255, 255, 255, 0.5)", lineHeight: 1.5 }}>
            Khám phá không gian âm thanh lossless mở rộng
          </p>
        </motion.div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────
          MOBILE 3D PREVIEW MODAL
      ────────────────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedAlbumModal && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 300,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(0, 0, 0, 0.88)",
              backdropFilter: "blur(20px)",
              padding: "20px"
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              style={{
                width: "100%",
                maxWidth: "360px",
                padding: "28px 24px",
                borderRadius: "28px",
                textAlign: "center",
                background: "rgba(24, 24, 27, 0.95)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                boxShadow: "0 20px 50px rgba(0, 0, 0, 0.9)"
              }}
            >
              <h3 style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: "10px" }}>
                {selectedAlbumModal}
              </h3>

              <p style={{ fontSize: "0.85rem", color: "rgba(255, 255, 255, 0.6)", lineHeight: 1.6, marginBottom: "24px" }}>
                Không gian 3D đang được kết nối. Âm nhạc sẽ được giải mã lossless khi bạn bước vào không gian trải nghiệm.
              </p>

              <button
                onClick={() => setSelectedAlbumModal(null)}
                style={{
                  width: "100%",
                  padding: "14px",
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  borderRadius: "14px",
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
