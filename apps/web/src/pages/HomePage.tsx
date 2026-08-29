import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
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
  const { currentTrack, playTrack, togglePlay, favoritedTrackIds, toggleFavoriteTrack } = useAudioStore();
  
  // Section Navigation: 0 = Section 1 (Tracklist), 1 = Section 2 (Carousel), 2 = Section 3 (Explore)
  const [activeSection, setActiveSection] = useState<number>(0);

  // Section 1 Internal Settled State (starts center -> settles to left after 1.5s)
  const [isSec1Settled, setIsSec1Settled] = useState<boolean>(false);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  // Section 2 Carousel Revolver Index (0..4)
  const [revolverIndex, setRevolverIndex] = useState<number>(0);
  const [dragOffset, setDragOffset] = useState<number>(0);

  const isScrollingRef = useRef(false);
  const touchStartYRef = useRef(0);
  const touchStartXRef = useRef(0);
  const isTouchInsideCarousel = useRef<boolean>(false);

  // Initial Sequence: Cover fades in at Center -> rests 1.5s -> glides left & 5 tracks fade in
  useEffect(() => {
    const settleTimer = setTimeout(() => {
      setIsSec1Settled(true);
    }, 1500);

    return () => clearTimeout(settleTimer);
  }, []);

  const toggleFavorite = (e: React.MouseEvent, trackId: string) => {
    e.stopPropagation();
    toggleFavoriteTrack(trackId);
  };

  const handleAlbumClick = (_albumName?: string) => {
    if (!currentTrack) {
      playTrack(DEFAULT_TRACKS[0]);
    } else {
      togglePlay();
    }
  };

  const handleTrackSelect = (track: Track) => {
    playTrack(track);
  };

  // Section 1 ➔ Section 2 (Tracks fade out 0.3s -> Album glides center 1.0s -> Wings open 0.4s)
  const handleTransition1To2 = () => {
    if (isTransitioning || !isSec1Settled) return;
    setIsTransitioning(true);

    setIsSec1Settled(false); // Trượt bìa về tâm

    setTimeout(() => {
      setRevolverIndex(0);
      setActiveSection(1);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 400);
    }, 1100);
  };

  // Section 2 ➔ Section 1 (Carousel wings close -> Album glides left -> Tracks fade in)
  const handleTransition2To1 = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);

    setRevolverIndex(0);
    setActiveSection(0);

    setTimeout(() => {
      setIsSec1Settled(true);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 1100);
    }, 200);
  };

  // Wheel, Keydown, and Touch Event Handling
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (isScrollingRef.current || isTransitioning) return;

      if (activeSection === 1) {
        const target = e.target as HTMLElement | null;
        if (target && target.closest(".carousel-interactive-zone")) {
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
        if (activeSection === 0 && isSec1Settled) {
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
        if (activeSection === 0 && isSec1Settled) {
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
      if (isTransitioning) return;
      const deltaY = touchStartYRef.current - e.changedTouches[0].clientY;
      const deltaX = touchStartXRef.current - e.changedTouches[0].clientX;

      if (activeSection === 1 && isTouchInsideCarousel.current) {
        if (Math.abs(deltaX) > 10 || Math.abs(deltaY) < 80 || Math.abs(deltaY) < Math.abs(deltaX) * 2.5) {
          return;
        }
      }

      if (deltaY > 50) {
        if (activeSection === 0 && isSec1Settled) {
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
  }, [activeSection, isSec1Settled, isTransitioning]);

  const totalSlots = 5;
  const getSlot = (offset: number) => {
    const idx = (revolverIndex + offset + totalSlots * 10) % totalSlots;
    return { slot: REVOLVER_SLOTS[idx] };
  };

  const currentMarbleStep = MARBLE_STEPS[revolverIndex] ?? 0;
  const marbleBaseX = currentMarbleStep * 28;

  // Tính toán vị trí X đối xứng, tự co giãn theo màn hình (Không bao giờ tràn viền)
  // Section 1: Album ở -200px (trái), Tracks ở +200px (phải) -> Tổng bề ngang 780px hoàn hảo
  // Section 2: Album ở tâm 0px
  const centerCardX = activeSection === 0
    ? (isSec1Settled ? -200 : 0)
    : dragOffset * 0.35;

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
        background: "transparent",
        padding: "0 24px"
      }}
    >
      {/* ─────────────────────────────────────────────────────────────────────
          UNIFIED STAGE CONTAINER: TỰ CÂN BẰNG ĐỐI XỨNG & ZERO OVERFLOW
      ────────────────────────────────────────────────────────────────────── */}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "880px",
          height: "380px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: activeSection === 2 ? 0 : 1,
          pointerEvents: activeSection === 2 ? "none" : "auto",
          transition: "opacity 0.4s ease-in-out"
        }}
      >
        {/* Localized metallic sheen glow behind cards in Section 2 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{
            opacity: activeSection === 1 ? 0.35 : 0,
            scale: activeSection === 1 ? 1 : 0.8
          }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="metallic-sheen-glow"
          style={{ opacity: 0, pointerEvents: "none" }}
        />

        {/* ── SECTION 2 WINGS: LEFT & RIGHT CARDS (FADE & SLIDE INTO PLACE) ── */}
        {[-1, 1].map((offset) => {
          const { slot } = getSlot(offset);
          const isSection2 = activeSection === 1;

          return (
            <motion.div
              key={`${slot.id}-${offset}`}
              initial={{ opacity: 0 }}
              onClick={() => {
                if (isSection2) {
                  setRevolverIndex((prev) => (prev + offset + totalSlots) % totalSlots);
                }
              }}
              animate={{
                x: offset === -1 ? -250 + dragOffset * 0.25 : 250 + dragOffset * 0.25,
                scale: 0.82,
                opacity: isSection2 ? 0.45 : 0,
                filter: "blur(3px)",
                pointerEvents: isSection2 ? "auto" : "none"
              }}
              transition={{ type: "spring", stiffness: 240, damping: 26, mass: 0.8 }}
              style={{
                position: "absolute",
                width: "330px",
                height: "330px",
                borderRadius: "30px",
                overflow: "hidden",
                cursor: "pointer",
                boxShadow: "0 15px 40px rgba(0, 0, 0, 0.8)",
                border: slot.isReal
                  ? "1px solid rgba(255, 255, 255, 0.3)"
                  : "1.5px solid rgba(255, 255, 255, 0.22)",
                background: slot.isReal
                  ? "#18181b"
                  : "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.02) 100%)",
                backdropFilter: slot.isReal ? "none" : "blur(20px)",
                WebkitBackdropFilter: slot.isReal ? "none" : "blur(20px)",
                opacity: 0,
                pointerEvents: "none",
                zIndex: 5
              }}
            >
              {slot.isReal ? (
                <img
                  src={slot.coverUrl}
                  alt={slot.title}
                  loading="eager"
                  style={{ width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none", display: "block" }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "14px",
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
                    <Disc3 size={44} color="rgba(255, 255, 255, 0.3)" />
                  </div>
                  <div style={{ zIndex: 1, textAlign: "center", marginTop: "auto", marginBottom: "10px" }}>
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "5px 12px",
                        borderRadius: "999px",
                        background: "rgba(255, 255, 255, 0.08)",
                        border: "1px solid rgba(255, 255, 255, 0.15)",
                        fontSize: "0.8rem",
                        fontWeight: 700,
                        letterSpacing: "0.06em",
                        color: "rgba(255, 255, 255, 0.85)",
                        marginBottom: "4px"
                      }}
                    >
                      <Sparkles size={13} />
                      <span>{slot.title}</span>
                    </div>
                    <p style={{ fontSize: "0.75rem", color: "rgba(255, 255, 255, 0.45)" }}>
                      {slot.artist}
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}

        {/* ── THE SINGLE PERSISTENT CENTER CARD (HVL OR CURRENT REVOLVER SLOT) ── */}
        {(() => {
          const { slot } = getSlot(0);
          const isSection2 = activeSection === 1;

          return (
            <motion.div
              drag={isSection2 ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.4}
              initial={{ opacity: 0, scale: 0.96 }}
              onDrag={(_, info) => {
                if (isSection2) setDragOffset(info.offset.x);
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
              whileHover={isSec1Settled && activeSection === 0 ? { scale: 1.02 } : {}}
              whileTap={isSection2 ? { scale: 0.98 } : {}}
              onClick={() => {
                handleAlbumClick(slot.title);
              }}
              animate={{
                x: centerCardX,
                scale: 1.0,
                opacity: 1.0
              }}
              transition={{
                x: { duration: 1.1, ease: [0.16, 1, 0.3, 1] },
                scale: { duration: 0.4, ease: "easeOut" },
                opacity: { duration: 0.4, ease: "easeOut" }
              }}
              style={{
                position: "absolute",
                width: "330px",
                height: "330px",
                borderRadius: "30px",
                overflow: "hidden",
                cursor: isSection2 ? "grab" : isSec1Settled ? "pointer" : "default",
                boxShadow: "0 30px 80px rgba(0, 0, 0, 0.95), 0 0 1px 2px rgba(255, 255, 255, 0.3)",
                border: slot.isReal
                  ? "1px solid rgba(255, 255, 255, 0.3)"
                  : "1.5px solid rgba(255, 255, 255, 0.22)",
                background: slot.isReal
                  ? "#18181b"
                  : "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.02) 100%)",
                backdropFilter: slot.isReal ? "none" : "blur(20px)",
                WebkitBackdropFilter: slot.isReal ? "none" : "blur(20px)",
                zIndex: 10
              }}
            >
              {slot.isReal ? (
                <img
                  src={slot.coverUrl}
                  alt={slot.title}
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                  style={{ width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none", display: "block" }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "14px",
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
                    <Disc3 size={44} color="rgba(255, 255, 255, 0.3)" />
                  </div>
                  <div style={{ zIndex: 1, textAlign: "center", marginTop: "auto", marginBottom: "10px" }}>
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "5px 12px",
                        borderRadius: "999px",
                        background: "rgba(255, 255, 255, 0.08)",
                        border: "1px solid rgba(255, 255, 255, 0.15)",
                        fontSize: "0.8rem",
                        fontWeight: 700,
                        letterSpacing: "0.06em",
                        color: "rgba(255, 255, 255, 0.85)",
                        marginBottom: "4px"
                      }}
                    >
                      <Sparkles size={13} />
                      <span>{slot.title}</span>
                    </div>
                    <p style={{ fontSize: "0.75rem", color: "rgba(255, 255, 255, 0.45)" }}>
                      {slot.artist}
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          );
        })()}

        {/* ── SECTION 1: 5 TRACKS LIST (RIGHT SIDE - THIẾT KẾ ĐỐI XỨNG CÂN BẰNG TÂM) ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{
            opacity: activeSection === 0 && isSec1Settled ? 1 : 0,
            x: activeSection === 0 && isSec1Settled ? 200 : 220,
            pointerEvents: activeSection === 0 && isSec1Settled ? "auto" : "none"
          }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{
            position: "absolute",
            width: "380px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            opacity: 0,
            pointerEvents: "none",
            zIndex: 6
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
                  padding: "10px 16px",
                  borderRadius: "16px",
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
                <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0, flex: 1 }}>
                  <span
                    style={{
                      fontSize: "0.82rem",
                      fontWeight: 700,
                      color: isCurrent ? "#ffffff" : "rgba(255, 255, 255, 0.4)",
                      width: "20px",
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
                        fontSize: "0.74rem",
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

                <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
                  <span style={{ fontSize: "0.78rem", color: "rgba(255, 255, 255, 0.4)" }}>
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
                      size={15}
                      color={isFav ? "#ffffff" : "rgba(255, 255, 255, 0.35)"}
                      fill={isFav ? "#ffffff" : "none"}
                    />
                  </button>
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* ── SECTION 2: 5-POINT MAGNETIC ROLLING MARBLE CAPSULE ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{
            opacity: activeSection === 1 ? 1 : 0,
            y: activeSection === 1 ? 0 : 20,
            pointerEvents: activeSection === 1 ? "auto" : "none"
          }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{
            position: "absolute",
            bottom: "-14px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "150px",
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
            opacity: 0,
            pointerEvents: "none",
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
        </motion.div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────
          SECTION 3 (ACTIVE === 2)
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
          zIndex: 10
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

    </main>
  );
};
