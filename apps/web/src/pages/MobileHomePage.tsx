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

// Exact 5 Slots Layout: Bìa 1 ở giữa, sang phải là Bìa 2 & 3, sang trái là Bìa 5 & 4
interface RevolverSlot {
  id: string;
  slotNumber: number;
  title: string;
  artist: string;
  isReal: boolean;
  coverUrl?: string;
}

const REVOLVER_SLOTS: RevolverSlot[] = [
  { id: "hvl", slotNumber: 1, title: "HVL (99%)", artist: "MCK • 30 Tracks", isReal: true, coverUrl: "https://media.postlain.com/covers/HVL_Album_Cover.jpg" }, // Bìa 1 (Tâm ban đầu)
  { id: "slot-2", slotNumber: 2, title: "VAULT SLOT 02", artist: "Lossless Ready", isReal: false }, // Bìa 2 (Bên phải Bìa 1)
  { id: "slot-3", slotNumber: 3, title: "VAULT SLOT 03", artist: "Lossless Ready", isReal: false }, // Bìa 3 (Sát rìa phải)
  { id: "slot-4", slotNumber: 4, title: "VAULT SLOT 04", artist: "Lossless Ready", isReal: false }, // Bìa 4 (Sát rìa trái)
  { id: "slot-5", slotNumber: 5, title: "VAULT SLOT 05", artist: "Lossless Ready", isReal: false }, // Bìa 5 (Bên trái Bìa 1)
];

// Mapping từ slot index (0..4) sang vị trí bậc trên thanh bi (-2..+2)
// Index 0 (Bìa 1) -> 0 (Tâm)
// Index 1 (Bìa 2) -> +1 (Giữa tâm và rìa phải)
// Index 2 (Bìa 3) -> +2 (Sát rìa phải)
// Index 3 (Bìa 4) -> -2 (Sát rìa trái)
// Index 4 (Bìa 5) -> -1 (Giữa tâm và rìa trái)
const SLOT_TO_MARBLE_STEP = [0, 1, 2, -2, -1];

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
  
  // Section 2 Revolver Index (0 to 4) - Luôn khởi tạo là 0 (Bìa 1 HVL)
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

  // Forward Transition: Section 1 ➔ Section 2 (Bìa 1 HVL luôn là bìa trung tâm khi xuất hiện)
  const handleTransition1To2 = () => {
    if (isAnimating) return;
    setIsAnimating(true);

    // Bước 1: 5 tracks thu vào bìa (2.0s) + Bìa trượt về tâm (2.0s) (Zero Halo)
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

  // Touch Swipe Gesture Handler for Section Snapping (With Strict Zone Filtering in Section 2)
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
      touchStartX.current = e.touches[0].clientX;

      // Kiểm tra xem vị trí chạm có nằm trong khu vực tương tác của Carousel Section 2 hay không
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

      // Trong Section 2: Nếu vuốt bắt đầu từ khu vực trung tâm Carousel, KHÔNG cho dính chuyển section trừ khi cố tình vuốt dọc cực mạnh ở ngoài
      if (activeSection === 1 && isTouchInsideCarousel.current) {
        if (Math.abs(deltaX) > 15 || Math.abs(deltaY) < 75 || Math.abs(deltaY) < Math.abs(deltaX) * 2) {
          return; // Bỏ qua vuốt dọc để tránh gián đoạn tương tác đĩa & thanh bi
        }
      }

      if (deltaY > 50) {
        // Vuốt lên (Next Section)
        if (activeSection === 0 && sec1State === "settled") {
          handleTransition1To2();
        } else if (activeSection === 1) {
          setIsAnimating(true);
          setActiveSection(2);
          setTimeout(() => setIsAnimating(false), 500);
        }
      } else if (deltaY < -50) {
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

  // Section 2 5-Slot Helper Functions
  const totalSlots = 5;
  const getSlot = (offset: number) => {
    const idx = (revolverIndex + offset + totalSlots * 10) % totalSlots;
    return { slot: REVOLVER_SLOTS[idx] };
  };

  const handleTrackSelect = (track: Track) => {
    playTrack(track);
  };

  // Tính toán vị trí của viên bi: 5 bậc đều nhau với bước nhảy 24px (-48px, -24px, 0px, +24px, +48px)
  const currentMarbleStep = SLOT_TO_MARBLE_STEP[revolverIndex] ?? 0;
  const marbleBaseX = currentMarbleStep * 24; // Sát rìa trái là -48px, Sát rìa phải là +48px

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
          SECTION 1: PURE ARTWORK (CINEMATIC TIMING + 2.0s SIMULTANEOUS COLLAPSE)
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
          {/* TRẠNG THÁI Ở TÂM: fadeIn | resting_initial (1.5s) | returning_center (2.0s) | resting_center (0.5s) */}
          {sec1State !== "settled" && (
            <div
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <motion.div
                layoutId="mobile-album-hero"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: sec1State === "fadeIn" ? 0.5 : 2.0,
                  ease: [0.16, 1, 0.3, 1]
                }}
                style={{
                  width: "min(84vw, 290px)",
                  height: "min(84vw, 290px)",
                  borderRadius: "28px",
                  overflow: "hidden",
                  boxShadow: "0 28px 70px rgba(0, 0, 0, 0.95), 0 0 1px 2px rgba(255, 255, 255, 0.3)",
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
              <motion.div
                layoutId="mobile-album-hero"
                initial={{ y: 80, scale: 1.25, opacity: 0.9 }}
                animate={{ y: 0, scale: 1, opacity: 1 }}
                exit={{ y: 80, scale: 1.25, opacity: 0.9 }}
                transition={{ duration: 2.0, ease: [0.16, 1, 0.3, 1] }}
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

              <motion.div
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -60, transition: { duration: 2.0, ease: [0.16, 1, 0.3, 1] } }}
                transition={{ duration: 2.0, ease: [0.16, 1, 0.3, 1] }}
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
                        duration: 1.8,
                        delay: 0.06 * idx,
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

              <div style={{ textAlign: "center", opacity: 0.35, fontSize: "0.7rem", letterSpacing: "0.08em" }}>
                VUỐT LÊN ĐỂ TIẾP TỤC
              </div>
            </>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────
          SECTION 2: 5-SLOT INFINITE REVOLVER (INERTIA SWIPE & MAGNETIC MARBLE)
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
              height: "min(84vw, 290px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              touchAction: "pan-x" // Khóa thao tác vuốt dọc trên vùng này
            }}
          >
            {/* ── 3D INFINITE REVOLVER: 3 VISIBLE CARDS (LEFT = Bìa 5, CENTER = Bìa 1, RIGHT = Bìa 2) ── */}
            {[-1, 0, 1].map((offset) => {
              const { slot } = getSlot(offset);
              const isCenter = offset === 0;

              return (
                <motion.div
                  key={`${slot.id}-${offset}`}
                  drag={isCenter ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.45}
                  onDrag={(_, info) => {
                    if (isCenter) setDragOffset(info.offset.x);
                  }}
                  onDragEnd={(_, info) => {
                    setDragOffset(0);
                    const velocity = info.velocity.x;
                    const offsetVal = info.offset.x;

                    // Tính quán tính vuốt: Vuốt mạnh (flick) trượt 2 nấc, vuốt vừa trượt 1 nấc, luôn neo ở 1 trong 5 điểm
                    let steps = 0;
                    if (Math.abs(velocity) > 650 || Math.abs(offsetVal) > 130) {
                      steps = velocity < 0 || offsetVal < -100 ? 2 : -2;
                    } else if (Math.abs(velocity) > 180 || Math.abs(offsetVal) > 25) {
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
                    } else if (offset === -1) {
                      setRevolverIndex((prev) => (prev - 1 + totalSlots) % totalSlots);
                    } else if (offset === 1) {
                      setRevolverIndex((prev) => (prev + 1) % totalSlots);
                    }
                  }}
                  animate={{
                    x: offset === 0 ? 0 : offset === -1 ? -175 : 175,
                    scale: offset === 0 ? 1.0 : 0.8,
                    opacity: offset === 0 ? 1.0 : 0.45,
                    filter: offset === 0 ? "blur(0px)" : "blur(2.5px)",
                    zIndex: offset === 0 ? 10 : 5
                  }}
                  transition={{ type: "spring", stiffness: 260, damping: 26 }}
                  style={{
                    position: "absolute",
                    width: "min(84vw, 290px)",
                    height: "min(84vw, 290px)",
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

            {/* ── 5-POINT MAGNETIC ROLLING MARBLE CAPSULE INDICATOR ─────────── */}
            <div
              style={{
                position: "absolute",
                bottom: "-48px",
                left: "50%",
                transform: "translateX(-50%)",
                width: "130px", // 5 nấc: -48px, -24px, 0px, +24px, +48px (Viên bi 16px ôm sát rìa)
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
              {/* 5 Vạch khắc siêu tinh tế biểu thị 5 điểm neo */}
              {[-48, -24, 0, 24, 48].map((xPos) => (
                <div
                  key={xPos}
                  style={{
                    position: "absolute",
                    left: `calc(50% + ${xPos}px)`,
                    transform: "translateX(-50%)",
                    width: "2px",
                    height: "6px",
                    borderRadius: "1px",
                    background: "rgba(255, 255, 255, 0.15)",
                    pointerEvents: "none"
                  }}
                />
              ))}

              {/* Viên bi kim loại lăn vô cực: Bìa 1 ở giữa (0px), Bìa 3 sát rìa phải (+48px), Bìa 4 sát rìa trái (-48px) */}
              <motion.div
                animate={{
                  x: Math.max(-52, Math.min(52, marbleBaseX + dragOffset * 0.12))
                }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
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
