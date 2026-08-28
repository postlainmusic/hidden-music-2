import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ArrowRight, Disc3, Sparkles } from "lucide-react";
import { useAudioStore, DEFAULT_TRACKS, Track } from "../store/audioStore";

// Real 5 Best Play tracks extracted from verified MCK library
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

interface HomePageProps {
  onExploreClick?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onExploreClick }) => {
  const { currentTrack, playTrack, favoritedTrackIds, toggleFavoriteTrack } = useAudioStore();
  
  // Active Section: 0 = Section 1, 1 = Section 2, 2 = Section 3
  const [activeSection, setActiveSection] = useState(0);
  const [selectedAlbumModal, setSelectedAlbumModal] = useState<string | null>(null);

  // Section 2 Revolver Index (0 to 4) - Luôn khởi tạo là 0 (Bìa 1 HVL)
  const [revolverIndex, setRevolverIndex] = useState<number>(0);
  const [dragOffset, setDragOffset] = useState<number>(0);

  // Section 1 Internal States (Desktop)
  const [sec1State, setSec1State] = useState<"fadeIn" | "resting_initial" | "settled" | "returning_center" | "resting_center">("fadeIn");
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  const isScrollingRef = useRef(false);
  const touchStartYRef = useRef(0);
  const touchStartXRef = useRef(0);
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

  // Fixed Viewport Screen Switching on Wheel, Keydown, and Touch
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (isScrollingRef.current || isAnimating) return;

      // Trong Section 2: Nếu con trỏ chuột nằm trong khu vực Carousel thì ưu tiên cuộn ngang đổi đĩa
      if (activeSection === 1) {
        const target = e.target as HTMLElement | null;
        if (target && target.closest(".carousel-interactive-zone")) {
          // Lăn chuột ngang hoặc lăn chuột dọc nhẹ trong khu vực đĩa -> xoay đĩa theo quán tính
          if (Math.abs(e.deltaX) > 10 || Math.abs(e.deltaY) < 60) {
            if (e.deltaX > 20 || e.deltaY > 30) {
              setRevolverIndex((prev) => (prev + 1) % 5);
            } else if (e.deltaX < -20 || e.deltaY < -30) {
              setRevolverIndex((prev) => (prev - 1 + 5) % 5);
            }
            return;
          }
        }
      }

      if (e.deltaY > 35) {
        if (activeSection === 0 && sec1State === "settled") {
          handleTransition1To2();
        } else if (activeSection === 1) {
          isScrollingRef.current = true;
          setActiveSection(2);
          setTimeout(() => {
            isScrollingRef.current = false;
          }, 600);
        }
      } else if (e.deltaY < -35) {
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

      if (activeSection === 1) {
        if (e.key === "ArrowLeft") {
          setRevolverIndex((prev) => (prev - 1 + 5) % 5);
          return;
        } else if (e.key === "ArrowRight") {
          setRevolverIndex((prev) => (prev + 1) % 5);
          return;
        }
      }

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
      touchStartXRef.current = e.touches[0].clientX;

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
      if (isScrollingRef.current || isAnimating) return;
      const deltaY = touchStartYRef.current - e.changedTouches[0].clientY;
      const deltaX = touchStartXRef.current - e.changedTouches[0].clientX;

      if (activeSection === 1 && isTouchInsideCarousel.current) {
        if (Math.abs(deltaX) > 15 || Math.abs(deltaY) < 80 || Math.abs(deltaY) < Math.abs(deltaX) * 2) {
          return;
        }
      }

      if (deltaY > 50) {
        if (activeSection === 0 && sec1State === "settled") {
          handleTransition1To2();
        } else if (activeSection === 1) {
          isScrollingRef.current = true;
          setActiveSection(2);
          setTimeout(() => {
            isScrollingRef.current = false;
          }, 600);
        }
      } else if (deltaY < -50) {
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

  // Section 2 5-Slot Helper Functions
  const totalSlots = 5;
  const getSlot = (offset: number) => {
    const idx = (revolverIndex + offset + totalSlots * 10) % totalSlots;
    return { slot: REVOLVER_SLOTS[idx] };
  };

  // Tính toán vị trí của viên bi: 5 bậc đều nhau với bước nhảy 28px (-56px, -28px, 0px, +28px, +56px)
  const currentMarbleStep = SLOT_TO_MARBLE_STEP[revolverIndex] ?? 0;
  const marbleBaseX = currentMarbleStep * 28; // Sát rìa trái là -56px, Sát rìa phải là +56px

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
          SECTION 1: PURE ARTWORK (CINEMATIC TIMING + 2.0s SIMULTANEOUS COLLAPSE)
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
                layoutId="desktop-album-hero"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: sec1State === "fadeIn" ? 0.5 : 2.0,
                  ease: [0.16, 1, 0.3, 1]
                }}
                style={{
                  width: "360px",
                  height: "360px",
                  borderRadius: "32px",
                  overflow: "hidden",
                  boxShadow: "0 30px 80px rgba(0, 0, 0, 0.95), 0 0 1px 1px rgba(255, 255, 255, 0.3)",
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
              <motion.div
                layoutId="desktop-album-hero"
                initial={{ x: 140, scale: 1.08, opacity: 0.9 }}
                animate={{ x: 0, scale: 1, opacity: 1 }}
                exit={{ x: 140, scale: 1.08, opacity: 0.9 }}
                transition={{ duration: 2.0, ease: [0.16, 1, 0.3, 1] }}
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

              <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -80, transition: { duration: 2.0, ease: [0.16, 1, 0.3, 1] } }}
                transition={{ duration: 2.0, ease: [0.16, 1, 0.3, 1] }}
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
                        duration: 1.8,
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
              maxWidth: "800px",
              height: "360px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
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
                  dragElastic={0.4}
                  onDrag={(_, info) => {
                    if (isCenter) setDragOffset(info.offset.x);
                  }}
                  onDragEnd={(_, info) => {
                    setDragOffset(0);
                    const velocity = info.velocity.x;
                    const offsetVal = info.offset.x;

                    // Tính quán tính vuốt: Vuốt mạnh (flick) trượt 2 nấc, vuốt vừa trượt 1 nấc, luôn neo ở 1 trong 5 điểm
                    let steps = 0;
                    if (Math.abs(velocity) > 700 || Math.abs(offsetVal) > 140) {
                      steps = velocity < 0 || offsetVal < -110 ? 2 : -2;
                    } else if (Math.abs(velocity) > 200 || Math.abs(offsetVal) > 30) {
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
                    x: offset === 0 ? 0 : offset === -1 ? -260 : 260,
                    scale: offset === 0 ? 1.0 : 0.82,
                    opacity: offset === 0 ? 1.0 : 0.45,
                    filter: offset === 0 ? "blur(0px)" : "blur(3px)",
                    zIndex: offset === 0 ? 10 : 5
                  }}
                  transition={{ type: "spring", stiffness: 260, damping: 26 }}
                  style={{
                    position: "absolute",
                    width: "360px",
                    height: "360px",
                    borderRadius: "32px",
                    overflow: "hidden",
                    cursor: isCenter ? "grab" : "pointer",
                    boxShadow: isCenter
                      ? "0 30px 80px rgba(0, 0, 0, 0.95), 0 0 1px 2px rgba(255, 255, 255, 0.3)"
                      : "0 15px 40px rgba(0, 0, 0, 0.8)",
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
                      decoding="async"
                      fetchPriority="high"
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
                        gap: "16px",
                        padding: "24px",
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
                        <Disc3 size={48} color="rgba(255, 255, 255, 0.3)" />
                      </div>

                      <div style={{ zIndex: 1, textAlign: "center", marginTop: "auto", marginBottom: "12px" }}>
                        <div
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "6px 14px",
                            borderRadius: "999px",
                            background: "rgba(255, 255, 255, 0.08)",
                            border: "1px solid rgba(255, 255, 255, 0.15)",
                            fontSize: "0.82rem",
                            fontWeight: 700,
                            letterSpacing: "0.06em",
                            color: "rgba(255, 255, 255, 0.85)",
                            marginBottom: "6px"
                          }}
                        >
                          <Sparkles size={14} />
                          <span>{slot.title}</span>
                        </div>
                        <p style={{ fontSize: "0.78rem", color: "rgba(255, 255, 255, 0.45)" }}>
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
                bottom: "-54px",
                left: "50%",
                transform: "translateX(-50%)",
                width: "150px", // 5 nấc: -56px, -28px, 0px, +28px, +56px (Viên bi 18px ôm sát rìa)
                height: "28px",
                borderRadius: "14px",
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
              {[-56, -28, 0, 28, 56].map((xPos) => (
                <div
                  key={xPos}
                  style={{
                    position: "absolute",
                    left: `calc(50% + ${xPos}px)`,
                    transform: "translateX(-50%)",
                    width: "2px",
                    height: "7px",
                    borderRadius: "1px",
                    background: "rgba(255, 255, 255, 0.15)",
                    pointerEvents: "none"
                  }}
                />
              ))}

              {/* Viên bi kim loại lăn vô cực: Bìa 1 ở giữa (0px), Bìa 3 sát rìa phải (+56px), Bìa 4 sát rìa trái (-56px) */}
              <motion.div
                animate={{
                  x: Math.max(-60, Math.min(60, marbleBaseX + dragOffset * 0.12))
                }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                style={{
                  width: "18px",
                  height: "18px",
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
