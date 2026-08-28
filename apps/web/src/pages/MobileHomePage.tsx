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

interface MobileHomePageProps {
  onExploreClick?: () => void;
}

export const MobileHomePage: React.FC<MobileHomePageProps> = ({ onExploreClick }) => {
  const { currentTrack, playTrack, favoritedTrackIds, toggleFavoriteTrack } = useAudioStore();
  
  // Active Section: 0 = Section 1, 1 = Section 2, 2 = Section 3
  const [activeSection, setActiveSection] = useState<number>(0);
  const [selectedAlbumModal, setSelectedAlbumModal] = useState<string | null>(null);
  
  // Section 1 Internal Settled State (starts center -> settles to top after 1.5s)
  const [isSec1Settled, setIsSec1Settled] = useState<boolean>(false);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  // Section 2 Revolver Index (0..4)
  const [revolverIndex, setRevolverIndex] = useState<number>(0);
  const [dragOffset, setDragOffset] = useState<number>(0);

  const touchStartY = useRef<number>(0);
  const touchStartX = useRef<number>(0);
  const isTouchInsideCarousel = useRef<boolean>(false);

  // Initial Sequence: Cover fades in at Center -> rests 1.5s -> glides up & 5 tracks fade in
  useEffect(() => {
    const settleTimer = setTimeout(() => {
      setIsSec1Settled(true);
    }, 1500);

    return () => clearTimeout(settleTimer);
  }, []);

  // Chuyển cảnh 1 -> 2 (Tracks fade out -> Bìa trượt về tâm -> Wings mở ra)
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

  // Chuyển cảnh 2 -> 1 (Wings thu lại -> Bìa trượt lên -> Tracks fade in)
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

  // Touch Gesture Handling
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
      if (isTransitioning) return;
      const deltaY = touchStartY.current - e.changedTouches[0].clientY;
      const deltaX = touchStartX.current - e.changedTouches[0].clientX;

      if (activeSection === 1 && isTouchInsideCarousel.current) {
        if (Math.abs(deltaX) > 15 || Math.abs(deltaY) < 90 || Math.abs(deltaY) < Math.abs(deltaX) * 2.5) {
          return;
        }
      }

      if (deltaY > 60) {
        if (activeSection === 0 && isSec1Settled) {
          handleTransition1To2();
        } else if (activeSection === 1) {
          setIsTransitioning(true);
          setActiveSection(2);
          setTimeout(() => setIsTransitioning(false), 500);
        }
      } else if (deltaY < -60) {
        if (activeSection === 1) {
          handleTransition2To1();
        } else if (activeSection === 2) {
          setIsTransitioning(true);
          setActiveSection(1);
          setTimeout(() => setIsTransitioning(false), 500);
        }
      }
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [activeSection, isSec1Settled, isTransitioning]);

  const totalSlots = 5;
  const getSlot = (offset: number) => {
    const idx = (revolverIndex + offset + totalSlots * 10) % totalSlots;
    return { slot: REVOLVER_SLOTS[idx] };
  };

  const handleTrackSelect = (track: Track) => {
    playTrack(track);
  };

  const currentMarbleStep = MARBLE_STEPS[revolverIndex] ?? 0;
  const marbleBaseX = currentMarbleStep * 24;

  const centerCardY = activeSection === 0
    ? (isSec1Settled ? -135 : 0)
    : 0;

  const centerCardScale = activeSection === 0
    ? (isSec1Settled ? 0.58 : 1.0)
    : 1.0;

  return (
    <main
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100dvh",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#ffffff",
        zIndex: 1,
        background: "transparent"
      }}
    >
      {/* ─────────────────────────────────────────────────────────────────────
          UNIFIED STAGE CONTAINER: ZERO UNMOUNTING, ZERO OVERLAPPING FLASH
      ────────────────────────────────────────────────────────────────────── */}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "420px",
          height: "100%",
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
                x: offset === -1 ? -165 + dragOffset * 0.25 : 165 + dragOffset * 0.25,
                scale: 0.8,
                opacity: isSection2 ? 0.45 : 0,
                filter: "blur(2.5px)",
                pointerEvents: isSection2 ? "auto" : "none"
              }}
              transition={{ type: "spring", stiffness: 240, damping: 26, mass: 0.8 }}
              style={{
                position: "absolute",
                width: "min(76vw, 280px)",
                height: "min(76vw, 280px)",
                borderRadius: "28px",
                overflow: "hidden",
                cursor: "pointer",
                boxShadow: "0 15px 35px rgba(0, 0, 0, 0.8)",
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
              whileTap={isSection2 ? { scale: 0.98 } : {}}
              onClick={() => {
                setSelectedAlbumModal(slot.title);
              }}
              animate={{
                x: isSection2 ? dragOffset * 0.35 : 0,
                y: centerCardY,
                scale: centerCardScale,
                opacity: 1.0
              }}
              transition={{
                y: { duration: 1.1, ease: [0.16, 1, 0.3, 1] },
                scale: { duration: 1.1, ease: [0.16, 1, 0.3, 1] },
                opacity: { duration: 0.4, ease: "easeOut" },
                x: { duration: 0.2, ease: "easeOut" }
              }}
              style={{
                position: "absolute",
                width: "min(76vw, 280px)",
                height: "min(76vw, 280px)",
                borderRadius: "28px",
                overflow: "hidden",
                cursor: isSection2 ? "grab" : isSec1Settled ? "pointer" : "default",
                boxShadow: isSection2
                  ? "0 28px 70px rgba(0, 0, 0, 0.95), 0 0 1px 2px rgba(255, 255, 255, 0.3)"
                  : isSec1Settled
                  ? "0 14px 35px rgba(0, 0, 0, 0.85), 0 0 20px rgba(255, 255, 255, 0.2)"
                  : "0 28px 70px rgba(0, 0, 0, 0.95), 0 0 1px 2px rgba(255, 255, 255, 0.3)",
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
        })()}

        {/* ── SECTION 1: 5 TRACKS LIST (BOTTOM HALF) ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{
            opacity: activeSection === 0 && isSec1Settled ? 1 : 0,
            y: activeSection === 0 && isSec1Settled ? 0 : 20,
            pointerEvents: activeSection === 0 && isSec1Settled ? "auto" : "none"
          }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{
            position: "absolute",
            top: "calc(50% - 35px)",
            width: "100%",
            maxWidth: "340px",
            padding: "0 16px",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
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

          <div style={{ textAlign: "center", opacity: 0.35, fontSize: "0.68rem", letterSpacing: "0.08em", marginTop: "4px" }}>
            VUỐT LÊN ĐỂ TIẾP TỤC
          </div>
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
            bottom: "calc(50% - 190px)",
            left: "50%",
            transform: "translateX(-50%)",
            width: "130px",
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
            opacity: 0,
            pointerEvents: "none",
            zIndex: 20,
            overflow: "hidden"
          }}
        >
          <motion.div
            animate={{
              x: Math.max(-52, Math.min(52, marbleBaseX - dragOffset * 0.1))
            }}
            transition={{ type: "spring", stiffness: 260, damping: 26, mass: 0.7 }}
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
        </motion.div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────
          SECTION 3: BẮT BUỘC ẨN LÚC ĐẦU
      ────────────────────────────────────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "20px",
          textAlign: "center",
          padding: "0 20px",
          opacity: activeSection === 2 ? 1 : 0,
          pointerEvents: activeSection === 2 ? "auto" : "none",
          transition: "opacity 0.45s ease-in-out",
          zIndex: 10
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
      </div>

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
