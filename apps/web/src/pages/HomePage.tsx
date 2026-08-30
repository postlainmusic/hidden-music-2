import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ArrowRight, Disc3, Sparkles, Play, Pause, Radio, FileText, Zap, Globe, Layers, Music, ChevronRight } from "lucide-react";
import { useAudioStore, Track, HomeSection } from "../store/audioStore";

const R2_BASE = "https://media.postlain.com";
const HVL_COVER = "/covers/HVL_Album_Cover.webp";

interface HomePageProps {
  onExploreClick?: () => void;
  onOpen3D?: () => void;
}

const formatDuration = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
};

export const HomePage: React.FC<HomePageProps> = ({ onExploreClick, onOpen3D }) => {
  const {
    currentTrack,
    playTrack,
    isPlaying,
    togglePlay,
    favoritedTrackIds,
    toggleFavoriteTrack,
    topFavoriteTracks,
    sections,
    vaultSlots,
    queue
  } = useAudioStore();

  // Active enabled sections
  const enabledSections = sections && sections.length > 0
    ? sections.filter((s) => s.is_enabled === 1).sort((a, b) => a.order_index - b.order_index)
    : [
        {
          id: "sec-album-showcase",
          title: "HVL (99%) Showcase",
          template_type: "album_showcase" as const,
          order_index: 1,
          is_enabled: 1,
          config: {
            album_id: "hvl-99",
            title: "HVL (99%)",
            artist: "MCK",
            cover_url: HVL_COVER,
            description: "Album phòng thu đầu tay gồm 30 bài hát Lossless FLAC độc quyền."
          }
        },
        {
          id: "sec-cover-flow",
          title: "Vault Slots 3D Cover Flow",
          template_type: "cover_flow" as const,
          order_index: 2,
          is_enabled: 1,
          config: { slots_count: 5 }
        },
        {
          id: "sec-explore-universe",
          title: "Explore Universe Portal",
          template_type: "explore_universe" as const,
          order_index: 3,
          is_enabled: 1,
          config: {
            headline: "EXPLORE UNIVERSE",
            subtext: "Không gian âm nhạc mở rộng đang được kết nối với hệ sinh thái streaming độc quyền."
          }
        }
      ];

  const [activeSectionIndex, setActiveSectionIndex] = useState<number>(0);
  const [sec1Stage, setSec1Stage] = useState<"center" | "revealed">("center");
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [revolverIndex, setRevolverIndex] = useState<number>(2);

  const isScrollingRef = useRef(false);
  const touchStartYRef = useRef(0);

  const displayTracks = topFavoriteTracks && topFavoriteTracks.length > 0
    ? topFavoriteTracks
    : queue.slice(0, 5);

  const activeSection = enabledSections[activeSectionIndex] || enabledSections[0];

  // 5 Default Vault Slots if none loaded from API
  const activeSlots = vaultSlots && vaultSlots.length >= 5
    ? vaultSlots.slice(0, 5)
    : [
        { id: "slot-4", slot_number: 4, title: "VAULT SLOT 04", artist: "Lossless Ready", cover_url: "", status: "locked" as const },
        { id: "slot-5", slot_number: 5, title: "VAULT SLOT 05", artist: "Lossless Ready", cover_url: "", status: "locked" as const },
        { id: "slot-1", slot_number: 1, title: "HVL (99%)", artist: "MCK • 30 Tracks", cover_url: HVL_COVER, status: "live" as const },
        { id: "slot-2", slot_number: 2, title: "VAULT SLOT 02", artist: "Lossless Ready", cover_url: "", status: "coming_soon" as const },
        { id: "slot-3", slot_number: 3, title: "VAULT SLOT 03", artist: "Lossless Ready", cover_url: "", status: "locked" as const }
      ];

  // Navigation handlers
  const handleScrollDown = () => {
    if (isTransitioning) return;

    // Special sub-stage for album_showcase: first reveals tracks, then moves to next section
    if (activeSection.template_type === "album_showcase" && sec1Stage === "center") {
      setIsTransitioning(true);
      setSec1Stage("revealed");
      setTimeout(() => setIsTransitioning(false), 500);
      return;
    }

    if (activeSectionIndex < enabledSections.length - 1) {
      setIsTransitioning(true);
      if (sec1Stage === "revealed") {
        setSec1Stage("center");
      }
      setActiveSectionIndex((prev) => prev + 1);
      setTimeout(() => setIsTransitioning(false), 600);
    }
  };

  const handleScrollUp = () => {
    if (isTransitioning) return;

    if (activeSection.template_type === "album_showcase" && sec1Stage === "revealed") {
      setIsTransitioning(true);
      setSec1Stage("center");
      setTimeout(() => setIsTransitioning(false), 500);
      return;
    }

    if (activeSectionIndex > 0) {
      setIsTransitioning(true);
      setActiveSectionIndex((prev) => prev - 1);
      setTimeout(() => setIsTransitioning(false), 600);
    }
  };

  // Global scroll and key listener
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < 25 || isScrollingRef.current) return;
      isScrollingRef.current = true;
      if (e.deltaY > 0) {
        handleScrollDown();
      } else {
        handleScrollUp();
      }
      setTimeout(() => {
        isScrollingRef.current = false;
      }, 700);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "PageDown") {
        handleScrollDown();
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        handleScrollUp();
      } else if (activeSection.template_type === "cover_flow") {
        if (e.key === "ArrowLeft") {
          setRevolverIndex((prev) => (prev - 1 + activeSlots.length) % activeSlots.length);
        } else if (e.key === "ArrowRight") {
          setRevolverIndex((prev) => (prev + 1) % activeSlots.length);
        }
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartYRef.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const deltaY = touchStartYRef.current - e.changedTouches[0].clientY;
      if (Math.abs(deltaY) > 50) {
        if (deltaY > 0) handleScrollDown();
        else handleScrollUp();
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
  }, [activeSectionIndex, sec1Stage, isTransitioning, enabledSections]);

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
      {/* Dynamic Section Navigation Dots (1..N) */}
      <div
        style={{
          position: "fixed",
          right: "28px",
          top: "50%",
          transform: "translateY(-50%)",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          zIndex: 50
        }}
      >
        {enabledSections.map((sec, idx) => {
          const isActive = idx === activeSectionIndex;
          return (
            <button
              key={sec.id || idx}
              onClick={() => {
                setActiveSectionIndex(idx);
                setSec1Stage("center");
              }}
              title={sec.title}
              style={{
                width: isActive ? "24px" : "8px",
                height: "8px",
                borderRadius: "999px",
                backgroundColor: isActive ? "#ffffff" : "rgba(255, 255, 255, 0.25)",
                border: "none",
                cursor: "pointer",
                transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                boxShadow: isActive ? "0 0 12px rgba(255, 255, 255, 0.8)" : "none"
              }}
            />
          );
        })}
      </div>

      {/* Dynamic Section Render Area */}
      <AnimatePresence mode="wait">
        {/* TEMPLATE 1: ALBUM SHOWCASE */}
        {activeSection.template_type === "album_showcase" && (
          <motion.div
            key="sec-album-showcase"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "880px",
              height: "400px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            {/* Album Cover Card */}
            <motion.div
              animate={{
                x: sec1Stage === "revealed" ? -210 : 0
              }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => {
                if (sec1Stage === "center") {
                  setSec1Stage("revealed");
                } else if (onOpen3D) {
                  onOpen3D();
                }
              }}
              className="glass-card"
              style={{
                width: "280px",
                height: "360px",
                borderRadius: "24px",
                overflow: "hidden",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                position: "relative",
                boxShadow: "0 24px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(99, 102, 241, 0.35)",
                border: "1px solid rgba(255, 255, 255, 0.15)"
              }}
            >
              <img
                src={activeSection.config?.cover_url || HVL_COVER}
                alt={activeSection.config?.title || "HVL"}
                style={{ width: "100%", height: "280px", objectFit: "cover" }}
              />
              <div style={{ flex: 1, padding: "12px 18px", display: "flex", flexDirection: "column", justifyContent: "center", background: "rgba(10, 10, 15, 0.85)" }}>
                <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800 }}>{activeSection.config?.title || "HVL (99%)"}</h3>
                <span style={{ fontSize: "0.78rem", color: "rgba(255, 255, 255, 0.55)" }}>
                  {activeSection.config?.artist || "MCK"} • 30 Tracks FLAC
                </span>
              </div>
            </motion.div>

            {/* Slide-out Top 5 Tracks List */}
            <motion.div
              animate={{
                opacity: sec1Stage === "revealed" ? 1 : 0,
                x: sec1Stage === "revealed" ? 120 : 0,
                pointerEvents: sec1Stage === "revealed" ? "auto" : "none"
              }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position: "absolute",
                width: "360px",
                display: "flex",
                flexDirection: "column",
                gap: "8px"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "rgba(255, 255, 255, 0.6)" }}>
                  TOP BÀI HÁT THẢ TIM (D1)
                </span>
                <span style={{ fontSize: "0.72rem", color: "#a5b4fc", cursor: "pointer" }} onClick={onOpen3D}>
                  Xem 30 bài ➔
                </span>
              </div>

              {displayTracks.slice(0, 5).map((track, i) => {
                const isFav = favoritedTrackIds.includes(track.id);
                const isCur = isPlaying && currentTrack?.id === track.id;
                return (
                  <div
                    key={track.id || i}
                    onClick={() => {
                      playTrack(track);
                      if (onOpen3D) onOpen3D();
                    }}
                    style={{
                      padding: "10px 14px",
                      borderRadius: "14px",
                      backgroundColor: isCur ? "rgba(99, 102, 241, 0.2)" : "rgba(255, 255, 255, 0.05)",
                      border: `1px solid ${isCur ? "rgba(99, 102, 241, 0.5)" : "rgba(255, 255, 255, 0.08)"}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      cursor: "pointer",
                      backdropFilter: "blur(16px)"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                      <span style={{ fontSize: "0.75rem", color: "#a5b4fc", fontWeight: 700 }}>0{i + 1}</span>
                      <div style={{ minWidth: 0 }}>
                        <h4 style={{ margin: 0, fontSize: "0.86rem", fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {track.title}
                        </h4>
                        <span style={{ fontSize: "0.72rem", color: "rgba(255, 255, 255, 0.45)" }}>
                          {track.artist}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "0.72rem", color: "rgba(255, 255, 255, 0.4)" }}>
                        {formatDuration(track.duration)}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavoriteTrack(track.id);
                        }}
                        style={{ background: "none", border: "none", color: isFav ? "#ec4899" : "rgba(255, 255, 255, 0.3)", cursor: "pointer" }}
                      >
                        <Heart size={14} fill={isFav ? "#ec4899" : "none"} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </motion.div>
        )}

        {/* TEMPLATE 2: COVER FLOW VAULT CAROUSEL */}
        {activeSection.template_type === "cover_flow" && (
          <motion.div
            key="sec-cover-flow"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "880px",
              height: "400px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            {/* 3D Revolver Cover Flow Cards */}
            {[-2, -1, 0, 1, 2].map((offset) => {
              const idx = (revolverIndex + offset + activeSlots.length * 10) % activeSlots.length;
              const slot = activeSlots[idx];
              const isCenter = offset === 0;

              return (
                <motion.div
                  key={`${slot.id}-${offset}`}
                  onClick={() => {
                    if (isCenter) {
                      if (slot.status === "live" && onOpen3D) onOpen3D();
                    } else {
                      setRevolverIndex(idx);
                    }
                  }}
                  animate={{
                    x: offset * 180,
                    scale: isCenter ? 1 : 0.78 - Math.abs(offset) * 0.08,
                    opacity: isCenter ? 1 : 0.45 - Math.abs(offset) * 0.15,
                    zIndex: isCenter ? 10 : 5 - Math.abs(offset)
                  }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="glass-card"
                  style={{
                    position: "absolute",
                    width: "240px",
                    height: "320px",
                    borderRadius: "20px",
                    overflow: "hidden",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    boxShadow: isCenter ? "0 24px 60px rgba(0, 0, 0, 0.9), 0 0 40px rgba(99, 102, 241, 0.4)" : "none",
                    border: `1px solid ${isCenter ? "rgba(99, 102, 241, 0.5)" : "rgba(255, 255, 255, 0.08)"}`
                  }}
                >
                  <img
                    src={slot.cover_url || HVL_COVER}
                    alt={slot.title}
                    style={{ width: "100%", height: "240px", objectFit: "cover", filter: slot.status !== "live" ? "grayscale(80%) brightness(0.6)" : "none" }}
                  />
                  <div style={{ flex: 1, padding: "12px 14px", display: "flex", flexDirection: "column", justifyContent: "center", background: "rgba(10, 10, 15, 0.9)" }}>
                    <span style={{ fontSize: "0.68rem", color: slot.status === "live" ? "#34d399" : "#a5b4fc", fontWeight: 800 }}>
                      SLOT 0{slot.slot_number || 1} • {slot.status === "live" ? "MASTER LOSSLESS" : "LOSSLESS READY"}
                    </span>
                    <h4 style={{ margin: "2px 0 0", fontSize: "0.9rem", fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {slot.title}
                    </h4>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* TEMPLATE 3: HERO MUSIC BANNER */}
        {activeSection.template_type === "hero_banner" && (
          <motion.div
            key="sec-hero-banner"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            style={{
              width: "100%",
              maxWidth: "880px",
              padding: "40px 48px",
              borderRadius: "28px",
              background: "linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(236, 72, 153, 0.15) 100%)",
              backdropFilter: "blur(28px)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              boxShadow: "0 24px 60px rgba(0, 0, 0, 0.8), 0 0 50px rgba(99, 102, 241, 0.25)",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              textAlign: "left"
            }}
          >
            <span style={{ fontSize: "0.78rem", color: "#a5b4fc", fontWeight: 800, letterSpacing: "0.08em" }}>
              FEATURED CINEMATIC PREMIERE
            </span>
            <h2 style={{ fontSize: "2.2rem", fontWeight: 900, margin: 0, lineHeight: 1.2, letterSpacing: "-0.02em" }}>
              {activeSection.config?.headline || "CHUYẾN BAY KHÔNG GIAN MCK HVL"}
            </h2>
            <p style={{ fontSize: "0.95rem", color: "rgba(255, 255, 255, 0.65)", margin: 0, maxWidth: "600px", lineHeight: 1.6 }}>
              {activeSection.config?.subheadline || "Trải nghiệm âm thanh Lossless 24-bit 96kHz độc quyền tại Hidden Music Vault."}
            </p>
            <div style={{ display: "flex", gap: "16px", marginTop: "8px" }}>
              <button
                onClick={() => {
                  if (queue.length > 0) playTrack(queue[0]);
                  if (onOpen3D) onOpen3D();
                }}
                style={{
                  padding: "12px 28px",
                  borderRadius: "999px",
                  background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: "0 0 24px rgba(99, 102, 241, 0.5)"
                }}
              >
                <Play size={16} fill="#ffffff" />
                {activeSection.config?.cta_text || "Thưởng Thức Ngay"}
              </button>
            </div>
          </motion.div>
        )}

        {/* TEMPLATE 4: ARTIST SPOTLIGHT */}
        {activeSection.template_type === "artist_spotlight" && (
          <motion.div
            key="sec-artist-spotlight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            style={{
              width: "100%",
              maxWidth: "760px",
              padding: "36px 40px",
              borderRadius: "28px",
              backgroundColor: "rgba(10, 11, 16, 0.85)",
              backdropFilter: "blur(28px)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              display: "flex",
              alignItems: "center",
              gap: "28px"
            }}
          >
            <img
              src={activeSection.config?.avatar_url || HVL_COVER}
              alt="Artist"
              style={{ width: "130px", height: "130px", borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(99, 102, 241, 0.5)", boxShadow: "0 0 30px rgba(99, 102, 241, 0.3)" }}
            />
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: "0.75rem", color: "#34d399", fontWeight: 800, letterSpacing: "0.06em" }}>
                ARTIST SPOTLIGHT
              </span>
              <h3 style={{ fontSize: "1.6rem", fontWeight: 800, margin: "4px 0 8px" }}>
                {activeSection.config?.artist_name || "MCK (Nghiêm Vũ Hoàng Long)"}
              </h3>
              <p style={{ fontSize: "0.88rem", color: "rgba(255, 255, 255, 0.6)", margin: 0, lineHeight: 1.5 }}>
                {activeSection.config?.bio || "Nghệ sĩ Melodic Rap / R&B tiên phong với phong cách âm nhạc đậm chất cảm xúc và thử nghiệm."}
              </p>
            </div>
          </motion.div>
        )}

        {/* TEMPLATE 5: EDITORIAL PRESS */}
        {activeSection.template_type === "editorial_press" && (
          <motion.div
            key="sec-editorial-press"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            style={{
              width: "100%",
              maxWidth: "760px",
              padding: "40px",
              borderRadius: "28px",
              backgroundColor: "rgba(10, 11, 16, 0.85)",
              backdropFilter: "blur(28px)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "16px"
            }}
          >
            <span style={{ fontSize: "0.75rem", color: "#f472b6", fontWeight: 800, letterSpacing: "0.08em" }}>
              EDITORIAL REVIEW & CRITIC
            </span>
            <blockquote style={{ fontSize: "1.3rem", fontWeight: 600, fontStyle: "italic", margin: 0, lineHeight: 1.5, color: "#ffffff" }}>
              "{activeSection.config?.quote || "HVL (99%) là một bước ngoặt về thẩm mỹ âm thanh và cảm xúc của MCK."}"
            </blockquote>
            <span style={{ fontSize: "0.85rem", color: "rgba(255, 255, 255, 0.5)" }}>
              — {activeSection.config?.source || "Rolling Stone Vietnam Review"} ({activeSection.config?.author || "Music Critic"})
            </span>
          </motion.div>
        )}

        {/* TEMPLATE 6: VIDEO PREMIERE */}
        {activeSection.template_type === "video_premiere" && (
          <motion.div
            key="sec-video-premiere"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
            style={{
              width: "100%",
              maxWidth: "760px",
              borderRadius: "24px",
              overflow: "hidden",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              backgroundColor: "#000000",
              boxShadow: "0 24px 60px rgba(0, 0, 0, 0.9), 0 0 50px rgba(99, 102, 241, 0.3)"
            }}
          >
            <div style={{ position: "relative", width: "100%", paddingTop: "56.25%", backgroundColor: "#050508" }}>
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "14px",
                  background: "radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, rgba(0, 0, 0, 0.9) 80%)"
                }}
              >
                <button
                  onClick={() => {
                    if (onOpen3D) onOpen3D();
                  }}
                  style={{
                    width: "68px",
                    height: "68px",
                    borderRadius: "50%",
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "none",
                    color: "#000000",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    boxShadow: "0 0 30px rgba(255, 255, 255, 0.8)"
                  }}
                >
                  <Play size={28} fill="#000000" style={{ marginLeft: "4px" }} />
                </button>
                <h4 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800 }}>
                  {activeSection.config?.title || "02. IDK - Official Music Video"}
                </h4>
              </div>
            </div>
          </motion.div>
        )}

        {/* TEMPLATE 7: EXPLORE UNIVERSE */}
        {activeSection.template_type === "explore_universe" && (
          <motion.div
            key="sec-explore-universe"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
            style={{
              width: "100%",
              maxWidth: "600px",
              padding: "48px 36px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "20px"
            }}
          >
            <h2 style={{ fontSize: "2.4rem", fontWeight: 900, margin: 0, letterSpacing: "0.04em", color: "#ffffff" }}>
              {activeSection.config?.headline || "EXPLORE UNIVERSE"}
            </h2>
            <p style={{ color: "rgba(255, 255, 255, 0.55)", fontSize: "0.95rem", lineHeight: 1.6, margin: 0 }}>
              {activeSection.config?.subtext || "Không gian âm nhạc mở rộng đang được kết nối với hệ sinh thái streaming độc quyền."}
            </p>
            <div style={{ display: "flex", gap: "16px", marginTop: "8px" }}>
              <button
                onClick={onOpen3D}
                style={{
                  padding: "14px 32px",
                  borderRadius: "999px",
                  background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
                  color: "#ffffff",
                  fontWeight: 700,
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 0 30px rgba(99, 102, 241, 0.5)"
                }}
              >
                Vào 3D Album Zone
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
};

export default HomePage;
