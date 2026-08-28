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
  
  // Section 2 Revolver Index (0..4)
  const [revolverIndex, setRevolverIndex] = useState<number>(0);
  const [dragOffset, setDragOffset] = useState<number>(0);

  // Section 1 Internal States
  const [sec1State, setSec1State] = useState<"initial_center" | "settled" | "closing_center" | "resting_handover">("initial_center");
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  const touchStartY = useRef<number>(0);
  const touchStartX = useRef<number>(0);
  const isTouchInsideCarousel = useRef<boolean>(false);

  // Flow nhịp chuẩn: Vào trang -> Bìa Fade In ở giữa (0.4s) -> Nghỉ 1.5s -> Trượt lên và 5 bài hát Fade In
  useEffect(() => {
    setSec1State("initial_center");

    const settleTimer = setTimeout(() => {
      setSec1State("settled");
    }, 1500);

    return () => {
      clearTimeout(settleTimer);
    };
  }, []);

  // Chuyển cảnh 1 -> 2 mượt mà
  const handleTransition1To2 = () => {
    if (isTransitioning || sec1State !== "settled") return;
    setIsTransitioning(true);

    // Bước 1: 5 tracks Fade out và bìa trở về tâm êm ái trong 2.0s
    setSec1State("closing_center");

    // Bước 2: Bìa dừng tại tâm 0.5s
    setTimeout(() => {
      setSec1State("resting_handover");

      // Bước 3: Chuyển Section 2
      setTimeout(() => {
        setRevolverIndex(0);
        setActiveSection(1);
        setIsTransitioning(false);
      }, 500);
    }, 2000);
  };

  // Chuyển cảnh ngược lại 2 -> 1
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
        if (activeSection === 0 && sec1State === "settled") {
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
  }, [activeSection, sec1State, isTransitioning]);

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
        alignItems: "center",
        justifyContent: "center",
        color: "#ffffff",
        zIndex: 1,
        background: "transparent"
      }}
    >
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
        {/* Top Album Artwork (Mở màn ở tâm, chỉ lướt lên khi settled) */}
        <motion.div
          initial={{ opacity: 0, y: 0, scale: 1 }}
          animate={{
            opacity: 1,
            y: isSettled ? -135 : 0,
            scale: isSettled ? 0.58 : 1
          }}
          transition={{ duration: 2.0, ease: [0.16, 1, 0.3, 1] }}
          onClick={() => {
            if (isSettled) setSelectedAlbumModal("HVL (99%)");
          }}
          style={{
            position: "absolute",
            width: "min(76vw, 280px)",
            height: "min(76vw, 280px)",
            borderRadius: "28px",
            overflow: "hidden",
            boxShadow: isSettled
              ? "0 14px 35px rgba(0, 0, 0, 0.85), 0 0 20px rgba(255, 255, 255, 0.2)"
              : "0 28px 70px rgba(0, 0, 0, 0.95), 0 0 1px 2px rgba(255, 255, 255, 0.3)",
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

        {/* Bottom 5 Tracks List (BẮT BUỘC ẨN LÚC ĐẦU, CHỈ HIỆN KHI SETTLED) */}
        <div
          style={{
            position: "absolute",
            top: "calc(50% - 35px)",
            width: "100%",
            maxWidth: "340px",
            padding: "0 16px",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
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
        {/* Localized metallic sheen glow behind cards in Section 2 */}
        <div className="metallic-sheen-glow" />

        {/* Carousel Interactive Container */}
        <div
          className="carousel-interactive-zone"
          style={{
            position: "relative",
            width: "100%",
            maxWidth: "420px",
            height: "min(76vw, 280px)",
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
                  x: (offset === 0 ? 0 : offset === -1 ? -165 : 165) + dragOffset * (isCenter ? 0.35 : 0.25),
                  scale: offset === 0 ? 1.0 : 0.8,
                  opacity: offset === 0 ? 1.0 : 0.45,
                  filter: offset === 0 ? "blur(0px)" : "blur(2.5px)",
                  zIndex: offset === 0 ? 10 : 5
                }}
                transition={{ type: "spring", stiffness: 260, damping: 26, mass: 0.7 }}
                style={{
                  position: "absolute",
                  width: "min(76vw, 280px)",
                  height: "min(76vw, 280px)",
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
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "20px",
          textAlign: "center",
          padding: "0 20px",
          opacity: activeSection === 2 ? 1 : 0,
          pointerEvents: activeSection === 2 ? "auto" : "none",
          transition: "opacity 0.45s ease-in-out",
          zIndex: activeSection === 2 ? 10 : 1
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
