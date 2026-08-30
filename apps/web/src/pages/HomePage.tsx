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

// HVL đặt ở TÂM GIỮA (Index 2 - Điểm thứ 3 trên thanh 5 điểm)
const REVOLVER_SLOTS: RevolverSlot[] = [
  { id: "slot-4", slotNumber: 4, title: "VAULT SLOT 04", artist: "Lossless Ready", isReal: false }, // Index 0 (Sát trái)
  { id: "slot-5", slotNumber: 5, title: "VAULT SLOT 05", artist: "Lossless Ready", isReal: false }, // Index 1 (Trái)
  { id: "hvl", slotNumber: 1, title: "HVL (99%)", artist: "MCK • 30 Tracks", isReal: true, coverUrl: "/covers/HVL_Album_Cover.webp" }, // Index 2 (TÂM GIỮA)
  { id: "slot-2", slotNumber: 2, title: "VAULT SLOT 02", artist: "Lossless Ready", isReal: false }, // Index 3 (Phải)
  { id: "slot-3", slotNumber: 3, title: "VAULT SLOT 03", artist: "Lossless Ready", isReal: false }, // Index 4 (Sát phải)
];

const formatDuration = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
};

interface HomePageProps {
  onExploreClick?: () => void;
  onOpen3D?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onExploreClick, onOpen3D }) => {
  const { currentTrack, playTrack, favoritedTrackIds, toggleFavoriteTrack, topFavoriteTracks } = useAudioStore();
  const displayTracks = topFavoriteTracks && topFavoriteTracks.length > 0 ? topFavoriteTracks : BEST_PLAY_TRACKS;
  
  // Section Navigation: 0 = Section 1 (Tracklist), 1 = Section 2 (Carousel), 2 = Section 3 (Explore)
  const [activeSection, setActiveSection] = useState<number>(0);

  // Section 1 State: "center" (Bìa nằm giữa) | "revealed" (Bìa lệch trái + 5 bài hát)
  const [sec1Stage, setSec1Stage] = useState<"center" | "revealed">("center");
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [isCenteringForVault, setIsCenteringForVault] = useState<boolean>(false);

  // Section 2 Carousel Revolver Index: Khởi tạo 2 (HVL ở chính giữa thanh)
  const [revolverIndex, setRevolverIndex] = useState<number>(2);
  const [dragOffset, setDragOffset] = useState<number>(0);

  const isScrollingRef = useRef(false);
  const touchStartYRef = useRef(0);
  const touchStartXRef = useRef(0);
  const hasTouchMovedRef = useRef<boolean>(false);
  const isTouchInsideCarousel = useRef<boolean>(false);

  const toggleFavorite = (e: React.MouseEvent, trackId: string) => {
    e.stopPropagation();
    toggleFavoriteTrack(trackId);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // CLICK ALBUM COVER REACTIVE FLOW:
  // Chỉ slot.isReal (HVL) mới được vào 3D Vault! Các slot khác không redirect nhầm.
  // ─────────────────────────────────────────────────────────────────────────
  const handleAlbumClick = (slot?: RevolverSlot) => {
    if (isTransitioning || isCenteringForVault) return;
    if (hasTouchMovedRef.current) return;

    // Chặn tuyệt đối slot 2, 3, 4, 5 không vào Vault của HVL
    if (slot && !slot.isReal) {
      return;
    }

    if (activeSection === 0 && sec1Stage === "revealed") {
      setIsCenteringForVault(true);
      setSec1Stage("center"); // Lướt bìa về tâm

      setTimeout(() => {
        if (onOpen3D) {
          onOpen3D();
        }
        setIsCenteringForVault(false);
      }, 750); // Khoảng nghỉ react mượt mà sau khi bìa đã đáp trọn tại tâm
    } else {
      if (onOpen3D) {
        onOpen3D();
      }
    }
  };

  const handleTrackSelect = (track: Track) => {
    if (hasTouchMovedRef.current) return;
    playTrack(track);
    if (onOpen3D) {
      onOpen3D();
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // FLOW CHUYỂN CẢNH CUỘN TRANG (CHÍNH XÁC THEO YÊU CẦU):
  // Sec1 Center -> (Scroll down) -> Sec1 Revealed (Bìa trái + 5 bài)
  // Sec1 Revealed -> (Scroll down) -> Bìa trượt về Center trước -> Sau đó mở 2 cánh Sec2
  // ─────────────────────────────────────────────────────────────────────────
  const handleScrollDown = () => {
    if (isTransitioning || isCenteringForVault) return;

    if (activeSection === 0) {
      if (sec1Stage === "center") {
        // Bước 1: Mở ra (bìa trượt sang trái, 5 bài hiện)
        setIsTransitioning(true);
        setSec1Stage("revealed");
        setTimeout(() => setIsTransitioning(false), 500);
      } else {
        // Bước 2: Trả bìa về Center trước, sau đó mở wings chuyển qua Section 2
        setIsTransitioning(true);
        setSec1Stage("center"); // Trả bìa về tâm

        setTimeout(() => {
          setRevolverIndex(2); // HVL ở trung tâm
          setActiveSection(1); // Mở 2 cánh carousel
          setTimeout(() => setIsTransitioning(false), 450);
        }, 650);
      }
    } else if (activeSection === 1) {
      // Sec2 -> Sec3 (Explore)
      isScrollingRef.current = true;
      setActiveSection(2);
      setTimeout(() => {
        isScrollingRef.current = false;
      }, 600);
    }
  };

  const handleScrollUp = () => {
    if (isTransitioning || isCenteringForVault) return;

    if (activeSection === 2) {
      // Sec3 -> Sec2
      isScrollingRef.current = true;
      setActiveSection(1);
      setTimeout(() => {
        isScrollingRef.current = false;
      }, 600);
    } else if (activeSection === 1) {
      // Sec2 -> Sec1 (Thu cánh về và giữ bìa ở Center)
      setIsTransitioning(true);
      setActiveSection(0);
      setSec1Stage("center");
      setRevolverIndex(2);
      setTimeout(() => setIsTransitioning(false), 600);
    } else if (activeSection === 0 && sec1Stage === "revealed") {
      // Sec1 Revealed -> Sec1 Center (Thu 5 bài, trả bìa về giữa)
      setIsTransitioning(true);
      setSec1Stage("center");
      setTimeout(() => setIsTransitioning(false), 500);
    }
  };

  // Wheel, Keydown, and Touch Event Handling (Với Touch Threshold chống click nhầm khi vuốt)
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (isScrollingRef.current || isTransitioning || isCenteringForVault) return;

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
        handleScrollDown();
      } else if (e.deltaY < -35) {
        handleScrollUp();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isScrollingRef.current || isTransitioning || isCenteringForVault) return;

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
        handleScrollDown();
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        handleScrollUp();
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartYRef.current = e.touches[0].clientY;
      touchStartXRef.current = e.touches[0].clientX;
      hasTouchMovedRef.current = false;

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

    const handleTouchMove = (e: TouchEvent) => {
      const dx = Math.abs(e.touches[0].clientX - touchStartXRef.current);
      const dy = Math.abs(e.touches[0].clientY - touchStartYRef.current);
      if (dx > 8 || dy > 8) {
        hasTouchMovedRef.current = true;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (isTransitioning || isCenteringForVault) return;
      const deltaY = touchStartYRef.current - e.changedTouches[0].clientY;
      const deltaX = touchStartXRef.current - e.changedTouches[0].clientX;

      if (activeSection === 1 && isTouchInsideCarousel.current) {
        if (Math.abs(deltaX) > 10 || Math.abs(deltaY) < 80 || Math.abs(deltaY) < Math.abs(deltaX) * 2.5) {
          return;
        }
      }

      if (deltaY > 50) {
        handleScrollDown();
      } else if (deltaY < -50) {
        handleScrollUp();
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [activeSection, sec1Stage, isTransitioning, isCenteringForVault]);

  const totalSlots = 5;
  const getSlot = (offset: number) => {
    const idx = (revolverIndex + offset + totalSlots * 10) % totalSlots;
    return { slot: REVOLVER_SLOTS[idx] };
  };

  // Tính toán vị trí X của bìa trung tâm:
  // Section 1 "center": 0px (Tâm đối xứng)
  // Section 1 "revealed": -200px (Lệch trái để mở 5 bài bên phải)
  // Section 2: 0px (+ dragOffset khi người dùng kéo tay)
  const centerCardX = activeSection === 0
    ? (sec1Stage === "revealed" ? -200 : 0)
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
                if (isSection2 && !hasTouchMovedRef.current) {
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
              layoutId="album-hero-cover"
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
              whileHover={slot.isReal ? { scale: 1.02 } : {}}
              whileTap={isSection2 ? { scale: 0.98 } : {}}
              onClick={() => {
                handleAlbumClick(slot);
              }}
              animate={{
                x: centerCardX,
                scale: 1.0,
                opacity: 1.0
              }}
              transition={{
                x: { duration: 0.65, ease: [0.16, 1, 0.3, 1] },
                scale: { duration: 0.35, ease: "easeOut" },
                opacity: { duration: 0.35, ease: "easeOut" }
              }}
              style={{
                position: "absolute",
                width: "330px",
                height: "330px",
                borderRadius: "30px",
                overflow: "hidden",
                cursor: slot.isReal ? "pointer" : "default",
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
            opacity: activeSection === 0 && sec1Stage === "revealed" && !isCenteringForVault ? 1 : 0,
            x: activeSection === 0 && sec1Stage === "revealed" && !isCenteringForVault ? 200 : 220,
            pointerEvents: activeSection === 0 && sec1Stage === "revealed" && !isCenteringForVault ? "auto" : "none"
          }}
          transition={{ duration: 0.45, ease: "easeOut" }}
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
          {displayTracks.map((track, idx) => {
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

        {/* ── SECTION 2: 5-POINT INTERACTIVE MAGNETIC ROLLING MARBLE CAPSULE (HVL Ở TÂM ĐIỂM SỐ 3) ── */}
        <div
          style={{
            position: "absolute",
            bottom: "-44px",
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            pointerEvents: "none",
            zIndex: 25
          }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{
              opacity: activeSection === 1 ? 1 : 0,
              y: activeSection === 1 ? 0 : 15,
            }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            style={{
              width: "160px",
              height: "32px",
              borderRadius: "999px",
              background: "rgba(18, 18, 22, 0.75)",
              border: "1px solid rgba(255, 255, 255, 0.20)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 12px",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.7), inset 0 1px 1px rgba(255, 255, 255, 0.25)",
              pointerEvents: activeSection === 1 ? "auto" : "none",
            }}
          >
            {/* 5 Interactive Clickable Slots: Slot 4 (0), Slot 5 (1), HVL (2), Slot 2 (3), Slot 3 (4) */}
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
                    width: "24px",
                    height: "24px",
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
                  {/* Background Slot Dot */}
                  <span
                    style={{
                      width: isSelected ? "8px" : "5px",
                      height: isSelected ? "8px" : "5px",
                      borderRadius: "50%",
                      background: isSelected ? "#ffffff" : "rgba(255, 255, 255, 0.3)",
                      boxShadow: isSelected ? "0 0 10px rgba(255, 255, 255, 0.9)" : "none",
                      transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)"
                    }}
                  />

                  {/* Active Glowing Marble Ring */}
                  {isSelected && (
                    <motion.span
                      layoutId="active-marble-indicator"
                      transition={{ type: "spring", stiffness: 350, damping: 28 }}
                      style={{
                        position: "absolute",
                        inset: "2px",
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
      </div>

      {/* ─────────────────────────────────────────────────────────────────────
          SECTION 3: EXPLORE UNIVERSE VIEWPORT
      ────────────────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
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
          padding: "100px 24px",
          textAlign: "center",
          opacity: 0,
          pointerEvents: "none",
          zIndex: 10
        }}
      >
        <h2 style={{ fontSize: "2.4rem", fontWeight: 800, marginBottom: "16px", letterSpacing: "0.04em" }}>
          EXPLORE UNIVERSE
        </h2>
        <p style={{ color: "rgba(255, 255, 255, 0.6)", maxWidth: "520px", marginBottom: "36px", lineHeight: 1.6 }}>
          Không gian âm nhạc mở rộng đang được kết nối với hệ sinh thái streaming chất lượng phòng thu độc quyền.
        </p>
        <div style={{ display: "flex", gap: "16px" }}>
          <button
            onClick={() => handleAlbumClick(REVOLVER_SLOTS[2])}
            style={{
              padding: "14px 32px",
              borderRadius: "999px",
              background: "#ffffff",
              color: "#000000",
              fontWeight: 800,
              fontSize: "0.95rem",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 8px 24px rgba(255, 255, 255, 0.3)",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <span>Vào 3D Vault (HVL)</span>
            <ArrowRight size={16} />
          </button>
          <button
            onClick={() => {
              setActiveSection(0);
              setSec1Stage("center");
            }}
            style={{
              padding: "14px 28px",
              borderRadius: "999px",
              background: "rgba(255, 255, 255, 0.08)",
              color: "#ffffff",
              fontWeight: 700,
              fontSize: "0.95rem",
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

export default HomePage;
