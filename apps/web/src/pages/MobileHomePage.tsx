import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
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
  { id: "hvl", slotNumber: 1, title: "HVL (99%)", artist: "MCK • 30 Tracks", isReal: true, coverUrl: "/covers/HVL_Album_Cover.webp" }, // Index 0 (Bìa 1 - Tâm)
  { id: "slot-2", slotNumber: 2, title: "VAULT SLOT 02", artist: "Lossless Ready", isReal: false }, // Index 1 (Bìa 2)
  { id: "slot-3", slotNumber: 3, title: "VAULT SLOT 03", artist: "Lossless Ready", isReal: false }, // Index 2 (Bìa 3 - Sát rìa phải)
  { id: "slot-4", slotNumber: 4, title: "VAULT SLOT 04", artist: "Lossless Ready", isReal: false }, // Index 3 (Bìa 4 - Sát rìa trái)
  { id: "slot-5", slotNumber: 5, title: "VAULT SLOT 05", artist: "Lossless Ready", isReal: false }, // Index 4 (Bìa 5)
];

const formatDuration = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
};

interface MobileHomePageProps {
  onExploreClick?: () => void;
  onOpen3D?: () => void;
}

export const MobileHomePage: React.FC<MobileHomePageProps> = ({ onExploreClick, onOpen3D }) => {
  const { currentTrack, playTrack, favoritedTrackIds, toggleFavoriteTrack } = useAudioStore();
  
  // Active Section: 0 = Section 1, 1 = Section 2, 2 = Section 3
  const [activeSection, setActiveSection] = useState<number>(0);
  
  // Section 1 State: "center" (Bìa nằm giữa) | "revealed" (Bìa trượt lên + 5 bài hát)
  const [sec1Stage, setSec1Stage] = useState<"center" | "revealed">("center");
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [isCenteringForVault, setIsCenteringForVault] = useState<boolean>(false);

  // Section 2 Revolver Index (0..4)
  const [revolverIndex, setRevolverIndex] = useState<number>(0);
  const [dragOffset, setDragOffset] = useState<number>(0);

  const touchStartY = useRef<number>(0);
  const touchStartX = useRef<number>(0);
  const isTouchInsideCarousel = useRef<boolean>(false);

  const toggleFavorite = (e: React.MouseEvent, trackId: string) => {
    e.stopPropagation();
    toggleFavoriteTrack(trackId);
  };

  const handleAlbumClick = () => {
    if (isTransitioning || isCenteringForVault) return;

    if (activeSection === 0 && sec1Stage === "revealed") {
      setIsCenteringForVault(true);
      setSec1Stage("center"); // Lướt bìa về tâm

      setTimeout(() => {
        if (onOpen3D) {
          onOpen3D();
        }
        setIsCenteringForVault(false);
      }, 700);
    } else {
      if (onOpen3D) {
        onOpen3D();
      }
    }
  };

  const handleTrackSelect = (track: Track) => {
    playTrack(track);
    if (onOpen3D) {
      onOpen3D();
    }
  };

  const handleScrollDown = () => {
    if (isTransitioning || isCenteringForVault) return;

    if (activeSection === 0) {
      if (sec1Stage === "center") {
        // Bước 1: Trượt lên mở 5 bài hát
        setIsTransitioning(true);
        setSec1Stage("revealed");
        setTimeout(() => setIsTransitioning(false), 500);
      } else {
        // Bước 2: Trả bìa về Center trước, sau đó mở wings chuyển qua Section 2
        setIsTransitioning(true);
        setSec1Stage("center");

        setTimeout(() => {
          setRevolverIndex(0);
          setActiveSection(1);
          setTimeout(() => setIsTransitioning(false), 450);
        }, 650);
      }
    } else if (activeSection === 1) {
      setIsTransitioning(true);
      setActiveSection(2);
      setTimeout(() => setIsTransitioning(false), 500);
    }
  };

  const handleScrollUp = () => {
    if (isTransitioning || isCenteringForVault) return;

    if (activeSection === 2) {
      setIsTransitioning(true);
      setActiveSection(1);
      setTimeout(() => setIsTransitioning(false), 500);
    } else if (activeSection === 1) {
      setIsTransitioning(true);
      setActiveSection(0);
      setSec1Stage("center");
      setRevolverIndex(0);
      setTimeout(() => setIsTransitioning(false), 600);
    } else if (activeSection === 0 && sec1Stage === "revealed") {
      setIsTransitioning(true);
      setSec1Stage("center");
      setTimeout(() => setIsTransitioning(false), 500);
    }
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
      if (isTransitioning || isCenteringForVault) return;
      const deltaY = touchStartY.current - e.changedTouches[0].clientY;
      const deltaX = touchStartX.current - e.changedTouches[0].clientX;

      if (activeSection === 1 && isTouchInsideCarousel.current) {
        if (Math.abs(deltaX) > 15 || Math.abs(deltaY) < 90 || Math.abs(deltaY) < Math.abs(deltaX) * 2.5) {
          return;
        }
      }

      if (deltaY > 55) {
        handleScrollDown();
      } else if (deltaY < -55) {
        handleScrollUp();
      }
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [activeSection, sec1Stage, isTransitioning, isCenteringForVault]);

  const totalSlots = 5;
  const getSlot = (offset: number) => {
    const idx = (revolverIndex + offset + totalSlots * 10) % totalSlots;
    return { slot: REVOLVER_SLOTS[idx] };
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
        zIndex: 1,
        background: "transparent",
        padding: "0 16px"
      }}
    >
      {/* ─────────────────────────────────────────────────────────────────────
          MOBILE UNIFIED STAGE CONTAINER
      ────────────────────────────────────────────────────────────────────── */}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "420px",
          height: "min(80vh, 560px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          opacity: activeSection === 2 ? 0 : 1,
          pointerEvents: activeSection === 2 ? "none" : "auto",
          transition: "opacity 0.4s ease-in-out"
        }}
      >
        {/* SECTION 2 WINGS: LEFT & RIGHT MINI COVERS */}
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
                x: offset === -1 ? -120 + dragOffset * 0.25 : 120 + dragOffset * 0.25,
                scale: 0.72,
                opacity: isSection2 ? 0.4 : 0,
                filter: "blur(2.5px)",
                pointerEvents: isSection2 ? "auto" : "none"
              }}
              transition={{ type: "spring", stiffness: 240, damping: 26 }}
              style={{
                position: "absolute",
                top: "14%",
                width: "220px",
                height: "220px",
                borderRadius: "22px",
                overflow: "hidden",
                boxShadow: "0 12px 30px rgba(0, 0, 0, 0.8)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                background: "#18181b",
                zIndex: 5
              }}
            >
              {slot.isReal ? (
                <img src={slot.coverUrl} alt={slot.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Disc3 size={32} color="rgba(255, 255, 255, 0.3)" />
                </div>
              )}
            </motion.div>
          );
        })}

        {/* PERSISTENT MAIN CENTER CARD */}
        {(() => {
          const { slot } = getSlot(0);
          const isSection2 = activeSection === 1;

          return (
            <motion.div
              layoutId="mobile-album-cover"
              drag={isSection2 ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.4}
              onDrag={(_, info) => {
                if (isSection2) setDragOffset(info.offset.x);
              }}
              onDragEnd={(_, info) => {
                setDragOffset(0);
                if (info.offset.x < -30 || info.velocity.x < -120) {
                  setRevolverIndex((prev) => (prev + 1) % totalSlots);
                } else if (info.offset.x > 30 || info.velocity.x > 120) {
                  setRevolverIndex((prev) => (prev - 1 + totalSlots) % totalSlots);
                }
              }}
              onClick={handleAlbumClick}
              animate={{
                y: activeSection === 0 && sec1Stage === "revealed" && !isCenteringForVault ? -145 : 0,
                scale: activeSection === 0 && sec1Stage === "revealed" && !isCenteringForVault ? 0.78 : 1.0,
                x: dragOffset * 0.35,
                opacity: 1.0
              }}
              transition={{
                y: { duration: 0.65, ease: [0.16, 1, 0.3, 1] },
                scale: { duration: 0.45, ease: "easeOut" }
              }}
              style={{
                position: "absolute",
                top: activeSection === 0 && sec1Stage === "revealed" && !isCenteringForVault ? "10%" : "22%",
                width: "min(68vw, 260px)",
                height: "min(68vw, 260px)",
                borderRadius: "24px",
                overflow: "hidden",
                cursor: "pointer",
                boxShadow: "0 20px 60px rgba(0, 0, 0, 0.95), 0 0 1px 2px rgba(255, 255, 255, 0.3)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                background: "#18181b",
                zIndex: 10
              }}
            >
              {slot.isReal ? (
                <img src={slot.coverUrl} alt={slot.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Disc3 size={40} color="rgba(255, 255, 255, 0.3)" />
                </div>
              )}
            </motion.div>
          );
        })()}

        {/* SECTION 1: 5 TRACKS LIST ON MOBILE */}
        <motion.div
          animate={{
            opacity: activeSection === 0 && sec1Stage === "revealed" && !isCenteringForVault ? 1 : 0,
            y: activeSection === 0 && sec1Stage === "revealed" && !isCenteringForVault ? 110 : 150,
            pointerEvents: activeSection === 0 && sec1Stage === "revealed" && !isCenteringForVault ? "auto" : "none"
          }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          style={{
            position: "absolute",
            width: "100%",
            maxWidth: "340px",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
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
                  padding: "8px 12px",
                  borderRadius: "14px",
                  background: isCurrent ? "rgba(255, 255, 255, 0.14)" : "rgba(255, 255, 255, 0.04)",
                  border: isCurrent ? "1px solid rgba(255, 255, 255, 0.35)" : "1px solid rgba(255, 255, 255, 0.08)",
                  cursor: "pointer"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0, flex: 1 }}>
                  <span style={{ fontSize: "0.76rem", fontWeight: 700, color: isCurrent ? "#ffffff" : "rgba(255,255,255,0.4)" }}>
                    {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                  </span>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{ fontSize: "0.82rem", fontWeight: isCurrent ? 700 : 600, color: "#ffffff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {track.title}
                    </p>
                    <p style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.5)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {track.artist}
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)" }}>
                    {formatDuration(track.duration)}
                  </span>
                  <button onClick={(e) => toggleFavorite(e, track.id)} style={{ background: "transparent", border: "none", padding: "2px" }}>
                    <Heart size={14} color={isFav ? "#ffffff" : "rgba(255,255,255,0.35)"} fill={isFav ? "#ffffff" : "none"} />
                  </button>
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* SECTION 2: 5-POINT INTERACTIVE CAPSULE ON MOBILE */}
        <motion.div
          animate={{
            opacity: activeSection === 1 ? 1 : 0,
            y: activeSection === 1 ? 130 : 160,
            pointerEvents: activeSection === 1 ? "auto" : "none"
          }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          style={{
            position: "absolute",
            width: "150px",
            height: "30px",
            borderRadius: "999px",
            background: "rgba(18, 18, 22, 0.75)",
            border: "1px solid rgba(255, 255, 255, 0.20)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 10px",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.7), inset 0 1px 1px rgba(255, 255, 255, 0.25)",
            zIndex: 20
          }}
        >
          {[0, 1, 2, 3, 4].map((slotIdx) => {
            const isSelected = revolverIndex === slotIdx;
            return (
              <button
                key={slotIdx}
                onClick={(e) => {
                  e.stopPropagation();
                  setRevolverIndex(slotIdx);
                }}
                style={{
                  position: "relative",
                  width: "22px",
                  height: "22px",
                  borderRadius: "50%",
                  background: "transparent",
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  padding: 0
                }}
              >
                <span
                  style={{
                    width: isSelected ? "7px" : "4.5px",
                    height: isSelected ? "7px" : "4.5px",
                    borderRadius: "50%",
                    background: isSelected ? "#ffffff" : "rgba(255, 255, 255, 0.3)",
                    boxShadow: isSelected ? "0 0 8px rgba(255, 255, 255, 0.9)" : "none",
                    transition: "all 0.25s ease"
                  }}
                />

                {isSelected && (
                  <motion.span
                    layoutId="active-marble-indicator-mobile"
                    transition={{ type: "spring", stiffness: 350, damping: 28 }}
                    style={{
                      position: "absolute",
                      inset: "1px",
                      borderRadius: "50%",
                      border: "1.5px solid rgba(255, 255, 255, 0.8)",
                      pointerEvents: "none"
                    }}
                  />
                )}
              </button>
            );
          })}
        </motion.div>
      </div>

      {/* SECTION 3: MOBILE EXPLORE UNIVERSE */}
      <motion.div
        animate={{
          opacity: activeSection === 2 ? 1 : 0,
          y: activeSection === 2 ? 0 : 40,
          pointerEvents: activeSection === 2 ? "auto" : "none"
        }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px 20px",
          textAlign: "center",
          zIndex: 10
        }}
      >
        <h2 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "12px", letterSpacing: "0.04em" }}>
          EXPLORE UNIVERSE
        </h2>
        <p style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "0.85rem", maxWidth: "340px", marginBottom: "28px", lineHeight: 1.5 }}>
          Không gian âm nhạc mở rộng đang được kết nối với hệ sinh thái streaming chất lượng phòng thu độc quyền.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%", maxWidth: "260px" }}>
          <button
            onClick={() => handleAlbumClick()}
            style={{
              padding: "12px 24px",
              borderRadius: "999px",
              background: "#ffffff",
              color: "#000000",
              fontWeight: 800,
              fontSize: "0.9rem",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px"
            }}
          >
            <span>Vào 3D Vault (HVL)</span>
            <ArrowRight size={15} />
          </button>
          <button
            onClick={() => {
              setActiveSection(0);
              setSec1Stage("center");
            }}
            style={{
              padding: "12px 24px",
              borderRadius: "999px",
              background: "rgba(255, 255, 255, 0.08)",
              color: "#ffffff",
              fontWeight: 700,
              fontSize: "0.9rem",
              border: "1px solid rgba(255, 255, 255, 0.18)",
              cursor: "pointer"
            }}
          >
            Quay lại Showcase
          </button>
        </div>
      </motion.div>
    </main>
  );
};

export default MobileHomePage;
