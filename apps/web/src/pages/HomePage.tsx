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

const MARBLE_STEPS = [0, 1, 2, -2, -1];

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

  // Section 2 Revolver Index (0..4) - Luôn khởi tạo là 0 (Bìa 1 HVL)
  const [revolverIndex, setRevolverIndex] = useState<number>(0);
  const [dragOffset, setDragOffset] = useState<number>(0);

  // Section 1 Internal States
  const [sec1State, setSec1State] = useState<"initial_center" | "settled" | "closing_center" | "resting_handover">("initial_center");
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  const isScrollingRef = useRef(false);
  const touchStartYRef = useRef(0);
  const touchStartXRef = useRef(0);
  const isTouchInsideCarousel = useRef<boolean>(false);

  // Flow nhịp chuẩn: Vào trang -> Bìa Fade In ở giữa (0.4s) -> Nghỉ 1.5s -> Trượt sang trái và 5 bài hát Fade In
  useEffect(() => {
    setSec1State("initial_center");

    const settleTimer = setTimeout(() => {
      setSec1State("settled");
    }, 1500);

    return () => {
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

  // Forward Transition: Section 1 ➔ Section 2 (2.0s slow graceful collapse ➔ 0.5s rest ➔ Section 2 Bìa 1)
  const handleTransition1To2 = () => {
    if (isTransitioning || sec1State !== "settled") return;
    setIsTransitioning(true);

    // Bước 1: 5 tracks Fade Out hoàn toàn và đưa bìa về tâm êm đềm trong 2.0s
    setSec1State("closing_center");

    // Bước 2: Sau 2.0s, bước vào khoảng nghỉ tĩnh tại tâm 0.5s
    setTimeout(() => {
      setSec1State("resting_handover");

      // Bước 3: Sau khoảng nghỉ 0.5s, đổi sang Section 2
      setTimeout(() => {
        setRevolverIndex(0);
        setActiveSection(1);
        setIsTransitioning(false);
      }, 500);
    }, 2000);
  };

  // Reverse Transition: Section 2 ➔ Section 1 (2.0s simultaneous slide out)
  const handleTransition2To1 = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);

    setActiveSection(0);
    setSec1State("closing_center");

    setTimeout(() => {
      setSec1State("settled");
      setTimeout(() => {
        setIsTransitioning(false);
      }, 2000);
    }, 50);
  };

  // Fixed Viewport Screen Switching on Wheel, Keydown, and Touch
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (isScrollingRef.current || isTransitioning) return;

      if (activeSection === 1) {
        const target = e.target as HTMLElement | null;
        if (target && target.closest(".carousel-interactive-zone")) {
          // Lăn chuột ngang hoặc lăn chuột dọc nhẹ trong khu vực đĩa -> xoay đúng 1 track tuần tự
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
      if (isScrollingRef.current || isTransitioning) return;

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
      if (isScrollingRef.current || isTransitioning) return;
      const deltaY = touchStartYRef.current - e.changedTouches[0].clientY;
      const deltaX = touchStartXRef.current - e.changedTouches[0].clientX;

      if (activeSection === 1 && isTouchInsideCarousel.current) {
        if (Math.abs(deltaX) > 10 || Math.abs(deltaY) < 80 || Math.abs(deltaY) < Math.abs(deltaX) * 2.5) {
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
  }, [activeSection, sec1State, isTransitioning]);

  const totalSlots = 5;
  const getSlot = (offset: number) => {
    const idx = (revolverIndex + offset + totalSlots * 10) % totalSlots;
    return { slot: REVOLVER_SLOTS[idx] };
  };

  const currentMarbleStep = MARBLE_STEPS[revolverIndex] ?? 0;
  const marbleBaseX = currentMarbleStep * 28;

  const isSettled = sec1State === "settled";

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
        zIndex: 1,
        background: "#000000"
      }}
    >
      {/* Background Metallic Sheen Glow */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: activeSection === 1 ? 1 : 0.2 }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
        className="metallic-sheen-glow"
        style={{ pointerEvents: "none" }}
      />

      {/* ─────────────────────────────────────────────────────────────────────
          SECTION 1: KHỞI TẠO CHUẨN XÁC (CHỈ HIỆN BÌA TẠI TÂM LÚC ĐẦU)
      ────────────────────────────────────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: activeSection === 0 ? 1 : 0,
          pointerEvents: activeSection === 0 ? "auto" : "none",
          transition: "opacity 0.4s ease-in-out",
          zIndex: activeSection === 0 ? 10 : 1
        }}
      >
        {/* Left Album Artwork (Mở màn ở tâm, chỉ lướt sang trái khi settled) */}
        <motion.div
          initial={{ opacity: 0, x: 0, scale: 1 }}
          animate={{
            opacity: 1,
            x: isSettled ? -230 : 0,
            scale: 1
          }}
          transition={{ duration: 2.0, ease: [0.16, 1, 0.3, 1] }}
          whileHover={isSettled ? { scale: 1.02 } : {}}
          onClick={() => {
            if (isSettled) handleAlbumClick("HVL (99%)");
          }}
          style={{
            position: "absolute",
            width: "360px",
            height: "360px",
            borderRadius: "32px",
            overflow: "hidden",
            boxShadow: isSettled
              ? "0 30px 80px rgba(0, 0, 0, 0.9), 0 0 1px 1px rgba(255, 255, 255, 0.25)"
              : "0 30px 80px rgba(0, 0, 0, 0.95), 0 0 1px 1px rgba(255, 255, 255, 0.3)",
            border: "1px solid rgba(255, 255, 255, 0.25)",
            cursor: isSettled ? "pointer" : "default",
            background: "#18181b",
            zIndex: 10
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

        {/* Right 5 Tracks List (BẮT BUỘC ẨN LÚC ĐẦU, CHỈ HIỆN KHI SETTLED) */}
        <div
          style={{
            position: "absolute",
            left: "calc(50% + 20px)",
            width: "100%",
            maxWidth: "480px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            opacity: isSettled ? 1 : 0,
            pointerEvents: isSettled ? "auto" : "none",
            transition: "opacity 1.6s ease-in-out",
            zIndex: 5
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
              </div>
            );
          })}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────
          SECTION 2: BẮT BUỘC ẨN LÚC ĐẦU (OPACITY 0 IN CSS)
      ────────────────────────────────────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          opacity: activeSection === 1 ? 1 : 0,
          pointerEvents: activeSection === 1 ? "auto" : "none",
          transition: "opacity 0.4s ease-in-out",
          zIndex: activeSection === 1 ? 10 : 1
        }}
      >
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
          {/* ── 3D INFINITE REVOLVER: 3 VISIBLE CARDS ── */}
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
                  const offsetVal = info.offset.x;
                  const velocity = info.velocity.x;

                  if (offsetVal < -30 || velocity < -120) {
                    setRevolverIndex((prev) => (prev + 1) % totalSlots);
                  } else if (offsetVal > 30 || velocity > 120) {
                    setRevolverIndex((prev) => (prev - 1 + totalSlots) % totalSlots);
                  }
                }}
                whileTap={isCenter ? { scale: 0.98 } : {}}
                onClick={() => {
                  if (isCenter) {
                    setSelectedAlbumModal(slot.title);
                  } else if (offset === 1) {
                    setRevolverIndex((prev) => (prev + 1) % totalSlots);
                  } else if (offset === -1) {
                    setRevolverIndex((prev) => (prev - 1 + totalSlots) % totalSlots);
                  }
                }}
                animate={{
                  x: (offset === 0 ? 0 : offset === -1 ? -260 : 260) + dragOffset * (isCenter ? 0.35 : 0.25),
                  scale: offset === 0 ? 1.0 : 0.82,
                  opacity: offset === 0 ? 1.0 : 0.45,
                  filter: offset === 0 ? "blur(0px)" : "blur(3px)",
                  zIndex: offset === 0 ? 10 : 5
                }}
                transition={{ type: "spring", stiffness: 260, damping: 26, mass: 0.7 }}
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

          {/* ── 5-POINT MAGNETIC ROLLING MARBLE CAPSULE ───────────────────── */}
          <div
            style={{
              position: "absolute",
              bottom: "-54px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "150px", // 5 nấc đều: -56px, -28px, 0px, +28px, +56px
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
            <motion.div
              animate={{
                x: Math.max(-60, Math.min(60, marbleBaseX - dragOffset * 0.1))
              }}
              transition={{ type: "spring", stiffness: 260, damping: 26, mass: 0.7 }}
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

      {/* ─────────────────────────────────────────────────────────────────────
          SECTION 3: BẮT BUỘC ẨN LÚC ĐẦU
      ────────────────────────────────────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 24px",
          opacity: activeSection === 2 ? 1 : 0,
          pointerEvents: activeSection === 2 ? "auto" : "none",
          transition: "opacity 0.45s ease-in-out",
          zIndex: activeSection === 2 ? 10 : 1
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
      </div>

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
