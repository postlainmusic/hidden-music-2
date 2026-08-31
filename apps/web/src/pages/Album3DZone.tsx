import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Play, Pause, Heart, RotateCcw, Film } from "lucide-react";
import { useAudioStore, Track, DEFAULT_TRACKS } from "../store/audioStore";
import { FloatingPlayerDock } from "../components/FloatingPlayerDock";
import { MobilePlayerDock } from "../components/MobilePlayerDock";
import { useIsMobile } from "../hooks/useIsMobile";
import { studioBeatEngine } from "../audio/StudioBeatEngine";
import { MeshGradientBackground } from "../components/MeshGradientBackground";

interface Album3DZoneProps {
  onBackToVault: () => void;
  onOpenVideo3D?: () => void;
}

const formatDuration = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
};

// Dark Gothic Crimson Palette for HVL 3D Album Zone
const GOTHIC_CRIMSON_PALETTE = [
  { r: 239, g: 68, b: 68 },   // Crimson
  { r: 185, g: 28, b: 28 },   // Deep Dark Red
  { r: 90, g: 25, b: 35 },    // Blood Amber
  { r: 20, g: 24, b: 35 }     // Obsidian Void
];

export const Album3DZone: React.FC<Album3DZoneProps> = ({ onBackToVault, onOpenVideo3D }) => {
  const {
    currentTrack,
    isPlaying,
    playTrack,
    togglePlay,
    favoritedTrackIds,
    toggleFavoriteTrack
  } = useAudioStore();
  const isMobile = useIsMobile();
  
  // Mobile In-Place Flip State (290x290 square)
  const [isMobileFlipped, setIsMobileFlipped] = useState<boolean>(false);
  
  const cardWrapperRef = useRef<HTMLDivElement | null>(null);
  const halationBacklightRef = useRef<HTMLDivElement | null>(null);
  const gothicSheenRef = useRef<HTMLDivElement | null>(null);
  const frontCardRef = useRef<HTMLDivElement | null>(null);

  const bpmTextRef = useRef<HTMLSpanElement | null>(null);
  const keyTextRef = useRef<HTMLSpanElement | null>(null);
  const beatPipsRef = useRef<(HTMLDivElement | null)[]>([]);

  const mousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Mouse tilt tracking (Desktop only)
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isMobile) return;
    const { innerWidth, innerHeight } = window;
    mousePos.current = {
      x: (e.clientX / innerWidth - 0.5) * 10,
      y: (e.clientY / innerHeight - 0.5) * -10,
    };
  };

  // 60fps/120fps Studio Audio Beat Engine & Card Physics
  useEffect(() => {
    let animId: number;

    const render = () => {
      const beatState = studioBeatEngine.update();
      const subImpact = beatState.subImpact;
      const kickImpact = beatState.kickImpact;
      const energy = beatState.overallEnergy;

      // 1. Reactive 3D Card Dynamics & Mouse Tilt
      if (cardWrapperRef.current && !isMobile) {
        const tiltX = mousePos.current.y * 1.5;
        const tiltY = mousePos.current.x * 1.5;
        const kickScale = 1.0 + kickImpact * 0.04 + subImpact * 0.02;
        const floatY = Math.sin(Date.now() * 0.002) * 6;

        cardWrapperRef.current.style.transform = `translate3d(0, ${floatY}px, 0) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(${kickScale}, ${kickScale}, 1)`;
      }

      // 2. Halation Backlight Flare Pulse
      if (halationBacklightRef.current) {
        const flareOpacity = 0.25 + subImpact * 0.55 + kickImpact * 0.35;
        const flareScale = 1.0 + subImpact * 0.28 + kickImpact * 0.18;
        halationBacklightRef.current.style.opacity = `${Math.min(1.0, flareOpacity)}`;
        halationBacklightRef.current.style.transform = `scale(${flareScale})`;
      }

      // 3. Gothic Sheen Metal Edge Glow
      if (gothicSheenRef.current) {
        gothicSheenRef.current.style.opacity = `${Math.min(0.8, energy * 0.9)}`;
        gothicSheenRef.current.style.left = `${(Math.sin(Date.now() * 0.001) * 0.5 + 0.5) * 100}%`;
      }

      // 4. Front Card Reactive Glow Border
      if (frontCardRef.current) {
        if (kickImpact > 0.4) {
          frontCardRef.current.style.borderColor = "rgba(239, 68, 68, 0.90)";
          frontCardRef.current.style.boxShadow =
            "0 35px 90px rgba(0, 0, 0, 0.98), 0 0 40px rgba(239, 68, 68, 0.70), inset 0 0 18px rgba(239, 68, 68, 0.25)";
        } else if (subImpact > 0.3) {
          frontCardRef.current.style.borderColor = "rgba(185, 28, 28, 0.75)";
          frontCardRef.current.style.boxShadow =
            "0 35px 90px rgba(0, 0, 0, 0.98), 0 0 30px rgba(185, 28, 28, 0.55)";
        } else {
          frontCardRef.current.style.borderColor = isPlaying ? "rgba(220, 38, 38, 0.45)" : "rgba(255, 255, 255, 0.18)";
          frontCardRef.current.style.boxShadow = "0 35px 90px rgba(0, 0, 0, 0.98), 0 0 25px rgba(153, 27, 27, 0.35)";
        }
      }

      // 5. Studio Audio HUD Updates
      if (bpmTextRef.current) {
        bpmTextRef.current.textContent = `${beatState.liveBpm} BPM`;
      }
      if (keyTextRef.current) {
        keyTextRef.current.textContent = `KEY: ${beatState.rootKey || "C"}`;
      }
      for (let i = 0; i < 4; i++) {
        const pip = beatPipsRef.current[i];
        if (pip) {
          const isActive = beatState.beatInBar === i + 1;
          if (isActive) {
            pip.style.background = i === 0 ? "rgba(239, 68, 68, 1.0)" : "rgba(185, 28, 28, 1.0)";
            pip.style.boxShadow = i === 0 ? "0 0 12px rgba(239, 68, 68, 0.95)" : "0 0 8px rgba(185, 28, 28, 0.8)";
            pip.style.transform = "scale(1.4)";
          } else {
            pip.style.background = "rgba(255, 255, 255, 0.18)";
            pip.style.boxShadow = "none";
            pip.style.transform = "scale(1.0)";
          }
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [currentTrack, isPlaying, isMobile]);

  const handleCardClick = () => {
    if (isMobile) {
      setIsMobileFlipped((prev) => !prev);
    } else {
      togglePlay();
    }
  };

  const handleTrackClick = (e: React.MouseEvent, track: Track) => {
    e.stopPropagation();
    playTrack(track, { crossfade: false });
  };

  const toggleFavorite = (e: React.MouseEvent, trackId: string) => {
    e.stopPropagation();
    toggleFavoriteTrack(trackId);
  };

  // Dimensions
  const cardSize = isMobile ? 290 : 380;
  const borderRadius = isMobile ? "24px" : "32px";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45, ease: "easeInOut" }}
      onMouseMove={handleMouseMove}
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100dvh",
        backgroundColor: "#030305",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        userSelect: "none",
        zIndex: 50,
        perspective: "1200px",
      }}
    >
      {/* ─────────────────────────────────────────────────────────────────────
          1. DYNAMIC GOTHIC CRIMSON MESH GRADIENT BACKGROUND
      ────────────────────────────────────────────────────────────────────── */}
      <MeshGradientBackground customColors={GOTHIC_CRIMSON_PALETTE} intensity={1.1} />

      {/* ─────────────────────────────────────────────────────────────────────
          2. TOP IMMERSIVE BAR (BACK TO VAULT)
      ────────────────────────────────────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          top: "24px",
          left: "24px",
          zIndex: 30,
          pointerEvents: "auto",
        }}
      >
        <button
          onClick={onBackToVault}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 16px",
            borderRadius: "999px",
            background: "rgba(10, 11, 16, 0.85)",
            border: "1px solid rgba(239, 68, 68, 0.35)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            color: "#ffffff",
            fontSize: "0.82rem",
            fontWeight: 700,
            cursor: "pointer",
            transition: "all 0.2s ease",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.7)",
          }}
        >
          <ArrowLeft size={15} color="#ef4444" />
          <span>Vault</span>
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────
          2B. TOP-RIGHT IMMERSIVE BAR (SWITCH TO VIDEO 3D CINEMA ZONE)
      ────────────────────────────────────────────────────────────────────── */}
      {onOpenVideo3D && (
        <div
          style={{
            position: "absolute",
            top: "24px",
            right: "24px",
            zIndex: 30,
            pointerEvents: "auto",
          }}
        >
          <button
            onClick={onOpenVideo3D}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 18px",
              borderRadius: "999px",
              background: "linear-gradient(135deg, rgba(99, 102, 241, 0.35) 0%, rgba(236, 72, 153, 0.35) 100%)",
              border: "1px solid rgba(255, 255, 255, 0.25)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              color: "#ffffff",
              fontSize: "0.82rem",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.2s ease",
              boxShadow: "0 8px 24px rgba(99, 102, 241, 0.35)",
            }}
          >
            <Film size={15} color="#ec4899" />
            <span>Video 3D Zone</span>
          </button>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────
          3. CENTERPIECE: RAW GOTHIC OBSIDIAN CARD + CRIMSON HALATION BLOOM
      ────────────────────────────────────────────────────────────────────── */}
      <motion.div
        ref={cardWrapperRef}
        style={{
          position: "relative",
          width: `${cardSize}px`,
          height: `${cardSize}px`,
          zIndex: 20,
          cursor: "pointer",
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
        onClick={handleCardClick}
      >
        {/* Blazing Crimson Halation Backlight Flare */}
        <div
          ref={halationBacklightRef}
          style={{
            position: "absolute",
            inset: "-50px",
            borderRadius: borderRadius,
            background: "radial-gradient(circle, rgba(239, 68, 68, 0.95) 0%, rgba(185, 28, 28, 0.65) 45%, rgba(127, 29, 29, 0.25) 70%, transparent 85%)",
            filter: "blur(54px)",
            pointerEvents: "none",
            opacity: 0.3,
            transition: "opacity 0.06s ease, transform 0.06s ease",
          }}
        />

        {/* 3D Flip Card Container */}
        <motion.div
          animate={{ rotateY: isMobileFlipped ? 180 : 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          style={{
            width: "100%",
            height: "100%",
            position: "relative",
            transformStyle: "preserve-3d",
          }}
        >
          {/* Front Face: Gothic Album Artwork + Raw Metal Edge */}
          <div
            ref={frontCardRef}
            style={{
              position: "absolute",
              inset: 0,
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              borderRadius: borderRadius,
              overflow: "hidden",
              border: "2px solid rgba(220, 38, 38, 0.45)",
              boxShadow: "0 35px 90px rgba(0, 0, 0, 0.98), 0 0 30px rgba(185, 28, 28, 0.55)",
              background: "#08090d",
              transition: "border-color 0.08s ease, box-shadow 0.08s ease",
            }}
          >
            <img
              src={currentTrack?.coverUrl || "/covers/HVL_Album_Cover.webp"}
              alt="Album Cover"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />

            {/* Cold Metallic Gothic Specular Streak */}
            <div
              ref={gothicSheenRef}
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                width: "50%",
                left: "-25%",
                background: "linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.35) 50%, transparent 100%)",
                pointerEvents: "none",
                opacity: 0,
                mixBlendMode: "overlay",
              }}
            />

            {/* Top Raw Steel Vignette */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, transparent 40%, rgba(0, 0, 0, 0.75) 100%)",
                pointerEvents: "none",
              }}
            />

            {/* Mobile Touch Flip Hint */}
            {isMobile && (
              <div
                style={{
                  position: "absolute",
                  bottom: "12px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  padding: "5px 12px",
                  borderRadius: "999px",
                  background: "rgba(0, 0, 0, 0.85)",
                  border: "1px solid rgba(239, 68, 68, 0.45)",
                  color: "#ffffff",
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  backdropFilter: "blur(14px)",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  pointerEvents: "none",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.8)",
                }}
              >
                <RotateCcw size={11} color="#ef4444" />
                <span>Chạm xem 30 bài</span>
              </div>
            )}
          </div>

          {/* Back Face: Mobile In-Place 290x290 Scrollable Tracklist */}
          {isMobile && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
                borderRadius: borderRadius,
                overflow: "hidden",
                border: "1.5px solid rgba(239, 68, 68, 0.4)",
                boxShadow: "0 35px 90px rgba(0, 0, 0, 0.98)",
                background: "rgba(8, 9, 13, 0.96)",
                backdropFilter: "blur(32px)",
                WebkitBackdropFilter: "blur(32px)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 14px",
                  borderBottom: "1px solid rgba(239, 68, 68, 0.2)",
                  background: "rgba(239, 68, 68, 0.06)",
                }}
              >
                <span style={{ fontSize: "0.78rem", fontWeight: 800, color: "#ef4444" }}>
                  30 Tracks (HVL)
                </span>
                <span style={{ fontSize: "0.68rem", color: "rgba(255, 255, 255, 0.45)" }}>
                  Chạm để lật lại
                </span>
              </div>

              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "6px 8px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "3px",
                }}
              >
                {DEFAULT_TRACKS.map((track, idx) => {
                  const isCurrent = currentTrack?.id === track.id;
                  const isFav = favoritedTrackIds.includes(track.id);

                  return (
                    <div
                      key={track.id}
                      onClick={(e) => handleTrackClick(e, track)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "7px 10px",
                        borderRadius: "10px",
                        background: isCurrent ? "rgba(239, 68, 68, 0.18)" : "transparent",
                        border: isCurrent ? "1px solid rgba(239, 68, 68, 0.45)" : "1px solid transparent",
                        cursor: "pointer",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0, flex: 1 }}>
                        <div
                          style={{
                            width: "18px",
                            height: "18px",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: isCurrent ? "#ef4444" : "transparent",
                            color: isCurrent ? "#ffffff" : "rgba(255, 255, 255, 0.4)",
                            flexShrink: 0,
                          }}
                        >
                          {isCurrent && isPlaying ? (
                            <Pause size={9} fill="#ffffff" />
                          ) : isCurrent ? (
                            <Play size={9} fill="#ffffff" style={{ marginLeft: "1px" }} />
                          ) : (
                            <span style={{ fontSize: "0.65rem", fontWeight: 700 }}>
                              {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                            </span>
                          )}
                        </div>

                        <div style={{ minWidth: 0, flex: 1 }}>
                          <p
                            style={{
                              fontSize: "0.75rem",
                              fontWeight: isCurrent ? 700 : 500,
                              color: isCurrent ? "#ffffff" : "rgba(255, 255, 255, 0.85)",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {track.title}
                          </p>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                        <span style={{ fontSize: "0.68rem", color: "rgba(255, 255, 255, 0.35)" }}>
                          {formatDuration(track.duration)}
                        </span>
                        <button
                          onClick={(e) => toggleFavorite(e, track.id)}
                          style={{
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            padding: "2px",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <Heart
                            size={11}
                            color={isFav ? "#ef4444" : "rgba(255, 255, 255, 0.25)"}
                            fill={isFav ? "#ef4444" : "none"}
                          />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* ─────────────────────────────────────────────────────────────────────
          4. BOTTOM PLAYBAR DOCK
      ────────────────────────────────────────────────────────────────────── */}
      {isMobile ? <MobilePlayerDock /> : <FloatingPlayerDock />}
    </motion.div>
  );
};

export default Album3DZone;
