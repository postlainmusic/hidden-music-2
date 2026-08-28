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

// 6 Slots for Section 2: 1 Real Album + 5 Frosted Glass Cards
interface RevolverSlot {
  id: string;
  title: string;
  artist: string;
  isReal: boolean;
  coverUrl?: string;
}

const REVOLVER_SLOTS: RevolverSlot[] = [
  { id: "hvl", title: "HVL (99%)", artist: "MCK • 30 Tracks", isReal: true, coverUrl: "https://media.postlain.com/covers/HVL_Album_Cover.jpg" },
  { id: "slot-2", title: "VAULT SLOT 02", artist: "Lossless Ready", isReal: false },
  { id: "slot-3", title: "VAULT SLOT 03", artist: "Lossless Ready", isReal: false },
  { id: "slot-4", title: "VAULT SLOT 04", artist: "Lossless Ready", isReal: false },
  { id: "slot-5", title: "VAULT SLOT 05", artist: "Lossless Ready", isReal: false },
  { id: "slot-6", title: "VAULT SLOT 06", artist: "Lossless Ready", isReal: false },
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

  // Section 2 Revolver Index (0 to 5)
  const [revolverIndex, setRevolverIndex] = useState<number>(0);
  const [dragOffset, setDragOffset] = useState<number>(0);

  // Section 1 Internal States (Desktop)
  // - "fadeIn": 0s - 0.5s (fade in at center)
  // - "resting_initial": 0.5s - 2.0s (rest at center for 1.5s)
  // - "settled": 2.0s+ (slid left in 2.0s + tracks slid right in 2.0s)
  // - "returning_center": tracks sucking in (2.0s) + album sliding back to center (2.0s) (ZERO HALO)
  // - "resting_center": resting still at dead-center for 0.5s
  const [sec1State, setSec1State] = useState<"fadeIn" | "resting_initial" | "settled" | "returning_center" | "resting_center">("fadeIn");
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  const isScrollingRef = useRef(false);
  const touchStartYRef = useRef(0);

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

  // Forward Transition: Section 1 ➔ Section 2 (2.0s simultaneous collapse ➔ 0.5s rest ➔ Section 2)
  const handleTransition1To2 = () => {
    if (isAnimating) return;
    setIsAnimating(true);

    // Bước 1: 5 tracks thu vào bìa (2.0s) + Bìa trượt về tâm (2.0s) (Bỏ hoàn toàn hào quang)
    setSec1State("returning_center");

    // Bước 2: Sau 2.0s, bước vào khoảng nghỉ tĩnh tại tâm 0.5s
    setTimeout(() => {
      setSec1State("resting_center");

      // Bước 3: Sau khoảng nghỉ 0.5s (tổng 2.5s), đổi sang Section 2 mà KHÔNG BỊ CHỚP
      setTimeout(() => {
        setActiveSection(1);
        setIsAnimating(false);
      }, 500);
    }, 2000);
  };

  // Reverse Transition: Section 2 ➔ Section 1 (2.0s simultaneous slide out)
  const handleTransition2To1 = () => {
    if (isAnimating) return;
    setIsAnimating(true);

    // Đưa về Section 1 ở trạng thái tâm điểm (returning_center)
    setActiveSection(0);
    setSec1State("returning_center");

    // Lập tức cho bìa trượt sang trái mượt mà trong 2.0s và các track bung mở sang phải trong 2.0s
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

  // Section 2 Revolver Index Helper Functions
  const totalSlots = REVOLVER_SLOTS.length;
  const getSlot = (offset: number) => {
    const idx = (revolverIndex + offset + totalSlots * 10) % totalSlots;
    return { slot: REVOLVER_SLOTS[idx], index: idx };
  };

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
              {/* Bìa Album ở tâm thuần khiết (BỎ HOÀN TOÀN HÀO QUANG KHI CHUYỂN SECTION) */}
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

          {/* TRẠNG THÁI ĐÃ TRƯỢT SANG TRÁI (settled): Bìa bên trái (2.0s) + 5 tracks bên phải (2.0s) */}
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
              {/* Left: Bìa album trượt sang trái chậm rãi 2.0s */}
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

              {/* Right: 5 Tracks trượt sang phải 2.0s */}
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
          SECTION 2: INFINITE REVOLVER (3 VISIBLE SLOTS + 5 FROSTED GLASS CARDS)
                     & MAGNETIC ROLLING MARBLE CAPSULE
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

          {/* Edge Vignette Container */}
          <div
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
            {/* ── 3D INFINITE REVOLVER: 3 VISIBLE CARDS (LEFT, CENTER, RIGHT) ── */}
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
                    if (info.offset.x < -40) {
                      // Xoay sang đĩa tiếp theo (Next Revolver Slot)
                      setRevolverIndex((prev) => (prev + 1) % totalSlots);
                    } else if (info.offset.x > 40) {
                      // Xoay về đĩa trước (Prev Revolver Slot)
                      setRevolverIndex((prev) => (prev - 1 + totalSlots) % totalSlots);
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
                  transition={{ type: "spring", stiffness: 280, damping: 28 }}
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
                    /* 5 FROSTED GLASS TRANSLUCENT CARDS (SẴN SÀNG NẠP TRACK MỚI) */
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
                      {/* Translucent Vinyl Grooves chìm */}
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

            {/* ── MAGNETIC ROLLING MARBLE CAPSULE INDICATOR ─────────────────── */}
            <div
              style={{
                position: "absolute",
                bottom: "-54px",
                left: "50%",
                transform: "translateX(-50%)",
                width: "140px",
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
                zIndex: 20
              }}
            >
              {/* Viên bi kim loại lăn vô cực (Magnetic Rolling Marble) */}
              <motion.div
                animate={{
                  // Viên bi chắc chắn nằm ở giữa khi revolverIndex = 0, và dịch chuyển tương ứng khi xoay
                  x: ((revolverIndex % totalSlots) - (totalSlots - 1) / 2) * 14 + dragOffset * 0.15
                }}
                transition={{ type: "spring", stiffness: 320, damping: 24 }}
                style={{
                  width: "18px",
                  height: "18px",
                  borderRadius: "50%",
                  background: "radial-gradient(circle at 35% 35%, #ffffff 0%, #d4d4d8 60%, #71717a 100%)",
                  boxShadow: "0 0 12px rgba(255, 255, 255, 0.75), 0 2px 6px rgba(0, 0, 0, 0.8)",
                  border: "1px solid rgba(255, 255, 255, 0.9)"
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
