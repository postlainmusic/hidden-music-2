import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ArrowRight, Disc3, Sparkles } from "lucide-react";
import { useAudioStore, DEFAULT_TRACKS, Track } from "../store/audioStore";

const BEST_PLAY_TRACKS = [
  DEFAULT_TRACKS[0],  // 01. Elegie
  DEFAULT_TRACKS[1],  // 02. IDK
  DEFAULT_TRACKS[4],  // 05. Baby (feat. marzuz)
  DEFAULT_TRACKS[6],  // 07. Mắt Môi Tay Chân (feat. Tage)
  DEFAULT_TRACKS[19], // 20. Xa Xôi (feat. Obito)
];

// Thứ tự 5 Bìa: Bìa 1 ở giữa, trượt phải sang trái lần lượt: 1, 2, 3, 4, 5, 1, 2, 3, 4, 5... vô cực
interface RevolverSlot {
  id: string;
  slotNumber: number;
  title: string;
  artist: string;
  isReal: boolean;
  coverUrl?: string;
}

const REVOLVER_SLOTS: RevolverSlot[] = [
  { id: "hvl", slotNumber: 1, title: "HVL (99%)", artist: "MCK • 30 Tracks", isReal: true, coverUrl: "https://media.postlain.com/covers/HVL_Album_Cover.jpg" }, // Index 0 (Bìa 1 - Tâm)
  { id: "slot-2", slotNumber: 2, title: "VAULT SLOT 02", artist: "Lossless Ready", isReal: false }, // Index 1 (Bìa 2)
  { id: "slot-3", slotNumber: 3, title: "VAULT SLOT 03", artist: "Lossless Ready", isReal: false }, // Index 2 (Bìa 3 - Sát rìa phải)
  { id: "slot-4", slotNumber: 4, title: "VAULT SLOT 04", artist: "Lossless Ready", isReal: false }, // Index 3 (Bìa 4 - Sát rìa trái)
  { id: "slot-5", slotNumber: 5, title: "VAULT SLOT 05", artist: "Lossless Ready", isReal: false }, // Index 4 (Bìa 5)
];

// Vị trí con bi theo từng bìa:
// Bìa 1 (Idx 0) -> 0 (Tâm)
// Bìa 2 (Idx 1) -> +1 (Giữa tâm và rìa phải)
// Bìa 3 (Idx 2) -> +2 (Sát rìa phải)
// Bìa 4 (Idx 3) -> -2 (Sát rìa trái)
// Bìa 5 (Idx 4) -> -1 (Giữa tâm và rìa trái)
const MARBLE_STEPS = [0, 1, 2, -2, -1];

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
  
  // Section 2 Revolver Index (0..4) - Luôn khởi tạo là 0 (Bìa 1 HVL)
  const [revolverIndex, setRevolverIndex] = useState<number>(0);
  const [dragOffset, setDragOffset] = useState<number>(0);

  // Section 1 Internal States
  const [sec1State, setSec1State] = useState<"fadeIn" | "resting_initial" | "settled" | "returning_center" | "resting_center">("fadeIn");
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  const touchStartY = useRef<number>(0);
  const touchStartX = useRef<number>(0);
  const isTouchInsideCarousel = useRef<boolean>(false);

  // Initial Section 1 Sequence on Page Load (+1.5s initial rest)
  useEffect(() => {
    setSec1State("fadeIn");

    const restTimer = setTimeout(() => {
      setSec1State("resting_initial");
    }, 500);

    const settleTimer = setTimeout(() => {
      setSec1State("settled");
    }, 2000);

    return () => {
      clearTimeout(restTimer);
      clearTimeout(settleTimer);
    };
  }, []);

  // Forward Transition: Section 1 ➔ Section 2 (2.0s slow graceful collapse ➔ 0.5s rest ➔ Section 2 Bìa 1)
  const handleTransition1To2 = () => {
    if (isAnimating) return;
    setIsAnimating(true);

    // Bước 1: 5 tracks Fade Out hoàn toàn và đưa bìa về tâm êm đềm trong 2.0s
    setSec1State("returning_center");

    // Bước 2: Sau 2.0s, bước vào khoảng nghỉ tĩnh tại tâm 0.5s
    setTimeout(() => {
      setSec1State("resting_center");

      // Bước 3: Sau khoảng nghỉ 0.5s, đổi sang Section 2 và ĐẢM BẢO revolverIndex = 0 (Bìa 1 HVL)
      setTimeout(() => {
        setRevolverIndex(0);
        setActiveSection(1);
        setIsAnimating(false);
      }, 500);
    }, 2000);
  };

  // Reverse Transition: Section 2 ➔ Section 1 (2.0s simultaneous slide out)
  const handleTransition2To1 = () => {
    if (isAnimating) return;
    setIsAnimating(true);

    setActiveSection(0);
    setSec1State("returning_center");

    setTimeout(() => {
      setSec1State("settled");
      setTimeout(() => {
        setIsAnimating(false);
      }, 2000);
    }, 50);
  };

  // Touch Swipe Gesture Handler for Section Snapping
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
      touchStartX.current = e.touches[0].clientX;

      if (activeSection === 1) {
        const target = e.target as HTMLElement | null;
        if (target && target.closest(".carousel-interactive-zone")) {
          isTouchInsideCarousel.current = true;
        } else {
          isTouchInsideCarousel.current = false;
        }
      } else {
        isTouchInsideCarousel.current = false;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (isAnimating) return;
      const deltaY = touchStartY.current - e.changedTouches[0].clientY;
      const deltaX = touchStartX.current - e.changedTouches[0].clientX;

      // Trong Section 2: Nếu vuốt bắt đầu từ vùng Carousel, KHÔNG cho nhảy section
      if (activeSection === 1 && isTouchInsideCarousel.current) {
        if (Math.abs(deltaX) > 10 || Math.abs(deltaY) < 80 || Math.abs(deltaY) < Math.abs(deltaX) * 2.5) {
          return;
        }
      }

      if (deltaY > 50) {
        if (activeSection === 0 && sec1State === "settled") {
          handleTransition1To2();
        } else if (activeSection === 1) {
          setIsAnimating(true);
          setActiveSection(2);
          setTimeout(() => setIsAnimating(false), 500);
        }
      } else if (deltaY < -50) {
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

  // Section 2 5-Slot Helper Functions
  const totalSlots = 5;
  const getSlot = (offset: number) => {
    const idx = (revolverIndex + offset + totalSlots * 10) % totalSlots;
    return { slot: REVOLVER_SLOTS[idx] };
  };

  const handleTrackSelect = (track: Track) => {
    playTrack(track);
  };

  // Tính toán vị trí con bi: bước nhảy 24px (-48px, -24px, 0px, +24px, +48px)
  const currentMarbleStep = MARBLE_STEPS[revolverIndex] ?? 0;
  const marbleBaseX = currentMarbleStep * 24;

  const isSettled = sec1State === "settled";

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
        paddingTop: "max(56px, env(safe-area-inset-top, 56px))",
        paddingBottom: "max(64px, env(safe-area-inset-bottom, 64px))",
        paddingLeft: "16px",
        paddingRight: "16px"
      }}
    >
      {/* ─────────────────────────────────────────────────────────────────────
          SECTION 1: PURE FADE IN / FADE OUT FOR TRACKS (ZERO OVERLAP, ZERO JITTER)
      ────────────────────────────────────────────────────────────────────── */}
      {activeSection === 0 && (
        <div
          style={{
            width: "100%",
            maxWidth: "340px",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: isSettled ? "10px" : "0px",
            position: "relative"
          }}
        >
          {/* Top Album Artwork (Smooth layout transition from 280px to 154px) */}
          <motion.div
            layout
            transition={{ duration: 2.0, ease: [0.16, 1, 0.3, 1] }}
            onClick={() => {
              if (isSettled) setSelectedAlbumModal("HVL (99%)");
            }}
            style={{
              width: isSettled ? "154px" : "min(80vw, 280px)",
              height: isSettled ? "154px" : "min(80vw, 280px)",
              borderRadius: isSettled ? "22px" : "28px",
              overflow: "hidden",
              boxShadow: isSettled
                ? "0 12px 30px rgba(0, 0, 0, 0.85), 0 0 20px rgba(255, 255, 255, 0.2)"
                : "0 28px 70px rgba(0, 0, 0, 0.95), 0 0 1px 2px rgba(255, 255, 255, 0.3)",
              border: "1px solid rgba(255, 255, 255, 0.25)",
              flexShrink: 0,
              cursor: isSettled ? "pointer" : "default",
              background: "#18181b",
              zIndex: 2
            }}
          >
            <img
              src="https://media.postlain.com/covers/HVL_Album_Cover.jpg"
              alt="HVL (99%)"
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          </motion.div>

          {/* Bottom 5 Tracks List: THU VÀO = FADE OUT, HIỆN RA = FADE IN */}
          <AnimatePresence>
            {isSettled && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.6, ease: "easeInOut" }}
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  overflow: "hidden",
                  zIndex: 1
                }}
              >
                {BEST_PLAY_TRACKS.map((track, idx) => {
                  const isFav = favoritedTrackIds.includes(track.id);
                  const isCurrent = currentTrack?.id === track.id;

                  return (
                    <div
                      key={track.id}
                      onClick={() => handleTrackSelect(track)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "9px 12px",
                        borderRadius: "15px",
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
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0, flex: 1 }}>
                        <span
                          style={{
                            fontSize: "0.78rem",
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
                              fontSize: "0.85rem",
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
                              fontSize: "0.7rem",
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

                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                        <span style={{ fontSize: "0.72rem", color: "rgba(255, 255, 255, 0.4)" }}>
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
                            padding: "4px",
                            display: "flex",
                            alignItems: "center"
                          }}
                        >
                          <Heart
                            size={14}
                            color={isFav ? "#ffffff" : "rgba(255, 255, 255, 0.35)"}
                            fill={isFav ? "#ffffff" : "none"}
                          />
                        </button>
                      </div>
                    </div>
                  );
                })}

                <div style={{ textAlign: "center", opacity: 0.35, fontSize: "0.68rem", letterSpacing: "0.08em", marginTop: "2px" }}>
                  VUỐT LÊN ĐỂ TIẾP TỤC
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────
          SECTION 2: TRƯỢT TỪ PHẢI SANG TRÁI (1 ➔ 2 ➔ 3 ➔ 4 ➔ 5 ➔ 1 VÔ CỰC)
      ────────────────────────────────────────────────────────────────────── */}
      {activeSection === 1 && (
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            overflow: "hidden"
          }}
        >
          {/* Metallic Sheen Breathing Ambient Glow Background */}
          <div className="metallic-sheen-glow" />

          {/* Carousel Interactive Container */}
          <div
            className="carousel-interactive-zone"
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "420px",
              height: "min(80vw, 280px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              touchAction: "pan-x"
            }}
          >
            {/* ── 3D INFINITE REVOLVER: 3 VISIBLE CARDS ── */}
            {[-1, 0, 1].map((offset) => {
              const { slot } = getSlot(offset);
              const isCenter = offset === 0;

              return (
                <motion.div
                  key={`${slot.id}-${offset}`}
                  drag={isCenter ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.5}
                  onDrag={(_, info) => {
                    if (isCenter) setDragOffset(info.offset.x);
                  }}
                  onDragEnd={(_, info) => {
                    setDragOffset(0);
                    const velocity = info.velocity.x;
                    const offsetVal = info.offset.x;

                    // Chuẩn hóa logic vuốt:
                    // Trượt từ PHẢI sang TRÁI (Kéo tay sang trái: offsetVal < 0 hoặc velocity < 0) -> NEXT: 1 ➔ 2 ➔ 3 ➔ 4 ➔ 5 ➔ 1
                    // Trượt từ TRÁI sang PHẢI (Kéo tay sang phải: offsetVal > 0 hoặc velocity > 0) -> PREV: 1 ➔ 5 ➔ 4 ➔ 3 ➔ 2 ➔ 1
                    let steps = 0;
                    if (Math.abs(velocity) > 600 || Math.abs(offsetVal) > 120) {
                      steps = velocity < 0 || offsetVal < -100 ? 2 : -2;
                    } else if (Math.abs(velocity) > 160 || Math.abs(offsetVal) > 24) {
                      steps = velocity < 0 || offsetVal < 0 ? 1 : -1;
                    }

                    if (steps !== 0) {
                      setRevolverIndex((prev) => (prev + steps + 50) % totalSlots);
                    }
                  }}
                  whileTap={isCenter ? { scale: 0.98 } : {}}
                  onClick={() => {
                    if (isCenter) {
                      setSelectedAlbumModal(slot.title);
                    } else if (offset === 1) {
                      // Bấm vào đĩa bên phải để chuyển tiếp (Next)
                      setRevolverIndex((prev) => (prev + 1) % totalSlots);
                    } else if (offset === -1) {
                      // Bấm vào đĩa bên trái để quay lại (Prev)
                      setRevolverIndex((prev) => (prev - 1 + totalSlots) % totalSlots);
                    }
                  }}
                  animate={{
                    x: (offset === 0 ? 0 : offset === -1 ? -165 : 165) + dragOffset * (isCenter ? 0.45 : 0.35),
                    scale: offset === 0 ? 1.0 : 0.8,
                    opacity: offset === 0 ? 1.0 : 0.45,
                    filter: offset === 0 ? "blur(0px)" : "blur(2.5px)",
                    zIndex: offset === 0 ? 10 : 5
                  }}
                  transition={{ type: "spring", stiffness: 220, damping: 24, mass: 0.8 }}
                  style={{
                    position: "absolute",
                    width: "min(80vw, 280px)",
                    height: "min(80vw, 280px)",
                    borderRadius: "28px",
                    overflow: "hidden",
                    cursor: isCenter ? "grab" : "pointer",
                    boxShadow: isCenter
                      ? "0 28px 70px rgba(0, 0, 0, 0.95), 0 0 1px 2px rgba(255, 255, 255, 0.3)"
                      : "0 15px 35px rgba(0, 0, 0, 0.8)",
                    border: slot.isReal
                      ? "1px solid rgba(255, 255, 255, 0.3)"
                      : "1.5px solid rgba(255, 255, 255, 0.22)",
                    background: slot.isReal
                      ? "#18181b"
                      : "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.02) 100%)",
                    backdropFilter: slot.isReal ? "none" : "blur(20px)",
                    WebkitBackdropFilter: slot.isReal ? "none" : "blur(20px)"
                  }}
                >
                  {/* REAL ALBUM (HVL) */}
                  {slot.isReal ? (
                    <img
                      src={slot.coverUrl}
                      alt={slot.title}
                      loading="eager"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        pointerEvents: "none",
                        display: "block"
                      }}
                    />
                  ) : (
                    /* 4 FROSTED GLASS CARDS (BÌA 2, 3, 4, 5) */
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "12px",
                        padding: "20px",
                        position: "relative",
                        color: "#ffffff"
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          inset: "15%",
                          borderRadius: "50%",
                          border: "1px dashed rgba(255, 255, 255, 0.15)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      >
                        <Disc3 size={32} color="rgba(255, 255, 255, 0.3)" />
                      </div>

                      <div style={{ zIndex: 1, textAlign: "center", marginTop: "auto", marginBottom: "8px" }}>
                        <div
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            padding: "4px 10px",
                            borderRadius: "999px",
                            background: "rgba(255, 255, 255, 0.08)",
                            border: "1px solid rgba(255, 255, 255, 0.15)",
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            letterSpacing: "0.06em",
                            color: "rgba(255, 255, 255, 0.8)",
                            marginBottom: "4px"
                          }}
                        >
                          <Sparkles size={12} />
                          <span>{slot.title}</span>
                        </div>
                        <p style={{ fontSize: "0.7rem", color: "rgba(255, 255, 255, 0.45)" }}>
                          {slot.artist}
                        </p>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}

            {/* ── 5-POINT MAGNETIC ROLLING MARBLE CAPSULE ───────────────────── */}
            <div
              style={{
                position: "absolute",
                bottom: "-48px",
                left: "50%",
                transform: "translateX(-50%)",
                width: "130px", // 5 nấc đều: -48px, -24px, 0px, +24px, +48px
                height: "26px",
                borderRadius: "13px",
                background: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.18)",
                backdropFilter: "blur(14px)",
                WebkitBackdropFilter: "blur(14px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 8px 24px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.2)",
                zIndex: 20,
                overflow: "hidden"
              }}
            >
              <motion.div
                animate={{
                  x: Math.max(-52, Math.min(52, marbleBaseX - dragOffset * 0.12))
                }}
                transition={{ type: "spring", stiffness: 240, damping: 24, mass: 0.8 }}
                style={{
                  width: "16px",
                  height: "16px",
                  borderRadius: "50%",
                  background: "radial-gradient(circle at 35% 35%, #ffffff 0%, #d4d4d8 60%, #71717a 100%)",
                  boxShadow: "0 0 12px rgba(255, 255, 255, 0.75), 0 2px 6px rgba(0, 0, 0, 0.8)",
                  border: "1px solid rgba(255, 255, 255, 0.9)",
                  zIndex: 2
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────
          SECTION 3: LUXURY EXPLORE CALL-TO-ACTION
      ────────────────────────────────────────────────────────────────────── */}
      {activeSection === 2 && (
        <motion.div
          key="mobile-section-3"
          initial={{ opacity: 0, scale: 0.85, filter: "blur(8px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 0.85, filter: "blur(8px)", transition: { duration: 0.35 } }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
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
