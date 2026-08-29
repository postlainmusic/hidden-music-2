import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Play, Pause, Heart, RotateCcw } from "lucide-react";
import { useAudioStore, Track, DEFAULT_TRACKS } from "../store/audioStore";
import { FloatingPlayerDock } from "../components/FloatingPlayerDock";
import { MobilePlayerDock } from "../components/MobilePlayerDock";
import { useIsMobile } from "../hooks/useIsMobile";
import { audioAnalyserEngine } from "../audio/AudioAnalyserEngine";

interface Album3DZoneProps {
  onBackToVault: () => void;
}

const hexToRgb = (hex?: string): { r: number; g: number; b: number } => {
  if (!hex || !hex.startsWith("#")) return { r: 99, g: 102, b: 241 };
  const clean = hex.replace("#", "");
  if (clean.length === 3) {
    return {
      r: parseInt(clean[0] + clean[0], 16),
      g: parseInt(clean[1] + clean[1], 16),
      b: parseInt(clean[2] + clean[2], 16),
    };
  }
  if (clean.length >= 6) {
    return {
      r: parseInt(clean.substring(0, 2), 16),
      g: parseInt(clean.substring(2, 4), 16),
      b: parseInt(clean.substring(4, 6), 16),
    };
  }
  return { r: 99, g: 102, b: 241 };
};

const formatDuration = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
};

export const Album3DZone: React.FC<Album3DZoneProps> = ({ onBackToVault }) => {
  const { currentTrack, isPlaying, playTrack, togglePlay, favoritedTrackIds, toggleFavoriteTrack } = useAudioStore();
  const isMobile = useIsMobile();
  
  // Mobile In-Place Flip State (290x290 square)
  const [isMobileFlipped, setIsMobileFlipped] = useState<boolean>(false);
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cardWrapperRef = useRef<HTMLDivElement | null>(null);
  const auraGlowRef = useRef<HTMLDivElement | null>(null);
  const redKickAuraRef = useRef<HTMLDivElement | null>(null);
  const snareHaloRef = useRef<HTMLDivElement | null>(null);
  const frontCardRef = useRef<HTMLDivElement | null>(null);

  const mousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Mouse tilt tracking (Desktop only)
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isMobile) return;
    const { innerWidth, innerHeight } = window;
    mousePos.current = {
      x: (e.clientX / innerWidth - 0.5) * 16,
      y: (e.clientY / innerHeight - 0.5) * -16,
    };
  };

  // High-Performance 60fps Render Loop for Ambient Canvas & Direct DOM Styles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    let shockwaveRadius = 0;
    let snareRadius = 0;

    const render = () => {
      const bands = audioAnalyserEngine.getBands();
      const primaryRgb = hexToRgb(currentTrack?.palette?.primary || "#6366f1");
      const accentRgb = hexToRgb(currentTrack?.palette?.accent || "#8b5cf6");

      const kickImpact = bands.kickImpact;
      const snareFlash = bands.snareFlash;
      const energy = bands.subBass * 0.5 + bands.kick * 0.35 + bands.lowMid * 0.15;

      // ─────────────────────────────────────────────────────────────
      // 1. RENDER VOLUMETRIC AMBIENT DEPTH ON CANVAS (Z-INDEX 0)
      // ─────────────────────────────────────────────────────────────
      // Deep obsidian base
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      ctx.globalCompositeOperation = "screen";

      // A. Main Center Ambient Light Field (Breathing with track palette)
      const baseRadius = Math.min(width, height) * (0.45 + energy * 0.25);
      const ambientGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, baseRadius);
      const alpha = isPlaying ? 0.35 + energy * 0.40 : 0.18;

      ambientGrad.addColorStop(0, `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, ${alpha})`);
      ambientGrad.addColorStop(0.45, `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, ${alpha * 0.5})`);
      ambientGrad.addColorStop(0.80, `rgba(20, 25, 45, ${alpha * 0.15})`);
      ambientGrad.addColorStop(1, "rgba(0, 0, 0, 0)");

      ctx.fillStyle = ambientGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius, 0, Math.PI * 2);
      ctx.fill();

      // B. Dynamic CRIMSON RED Shockwave Blast on Bass/Kick Hits
      if (kickImpact > 0.05) {
        shockwaveRadius = Math.min(width, height) * (0.35 + (1.0 - kickImpact) * 0.45);
        const redGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, shockwaveRadius);
        const redAlpha = kickImpact * 0.65;

        redGrad.addColorStop(0, `rgba(239, 68, 68, ${redAlpha})`);
        redGrad.addColorStop(0.4, `rgba(225, 29, 72, ${redAlpha * 0.5})`);
        redGrad.addColorStop(0.8, `rgba(180, 20, 50, ${redAlpha * 0.15})`);
        redGrad.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.fillStyle = redGrad;
        ctx.beginPath();
        ctx.arc(centerX, centerY, shockwaveRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      // C. Radiant Specular White Halo Burst on Snare Hits
      if (snareFlash > 0.05) {
        snareRadius = Math.min(width, height) * (0.28 + (1.0 - snareFlash) * 0.35);
        const snareGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, snareRadius);
        const snareAlpha = snareFlash * 0.55;

        snareGrad.addColorStop(0, `rgba(255, 255, 255, ${snareAlpha})`);
        snareGrad.addColorStop(0.5, `rgba(210, 230, 255, ${snareAlpha * 0.3})`);
        snareGrad.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.fillStyle = snareGrad;
        ctx.beginPath();
        ctx.arc(centerX, centerY, snareRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalCompositeOperation = "source-over";

      // ─────────────────────────────────────────────────────────────
      // 2. DIRECT ZERO-LAG DOM UPDATES ON ALBUM COVER (Z-INDEX 20)
      // ─────────────────────────────────────────────────────────────
      if (cardWrapperRef.current) {
        const scale = 1.0 + kickImpact * 0.065;
        const tiltX = mousePos.current.y;
        const tiltY = mousePos.current.x;
        cardWrapperRef.current.style.transform = `scale(${scale}) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
      }

      // Synesthesia Ambient Aura Glow behind card
      if (auraGlowRef.current) {
        auraGlowRef.current.style.opacity = `${isPlaying ? 0.65 + energy * 0.35 : 0.25}`;
      }

      // Punchy Red Kick Shockwave Aura
      if (redKickAuraRef.current) {
        redKickAuraRef.current.style.opacity = `${kickImpact > 0.05 ? kickImpact * 0.95 : 0}`;
      }

      // Snare Specular Halo
      if (snareHaloRef.current) {
        snareHaloRef.current.style.opacity = `${snareFlash > 0.05 ? snareFlash * 0.90 : 0}`;
      }

      // Front Card Dynamic Border & Shadow
      if (frontCardRef.current) {
        if (kickImpact > 0.25) {
          frontCardRef.current.style.borderColor = `rgba(239, 68, 68, ${0.6 + kickImpact * 0.4})`;
          frontCardRef.current.style.boxShadow = `0 30px 90px rgba(0, 0, 0, 0.95), 0 0 ${40 + kickImpact * 60}px rgba(239, 68, 68, 0.85)`;
        } else if (snareFlash > 0.30) {
          frontCardRef.current.style.borderColor = `rgba(255, 255, 255, ${0.7 + snareFlash * 0.3})`;
          frontCardRef.current.style.boxShadow = `0 30px 90px rgba(0, 0, 0, 0.95), 0 0 ${35 + snareFlash * 45}px rgba(255, 255, 255, 0.75)`;
        } else {
          frontCardRef.current.style.borderColor = isPlaying ? (currentTrack?.palette?.primary || "#6366f1") : "rgba(255, 255, 255, 0.25)";
          frontCardRef.current.style.boxShadow = `0 30px 90px rgba(0, 0, 0, 0.95), 0 0 ${20 + energy * 30}px ${currentTrack?.palette?.glow || "rgba(99, 102, 241, 0.45)"}`;
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animId);
    };
  }, [currentTrack, isPlaying]);

  const handleMobileCardClick = () => {
    if (isMobile) {
      setIsMobileFlipped(!isMobileFlipped);
    } else {
      togglePlay();
    }
  };

  const handleTrackClick = (e: React.MouseEvent, track: Track) => {
    e.stopPropagation();
    if (currentTrack?.id === track.id) {
      togglePlay();
    } else {
      playTrack(track);
    }
  };

  const toggleFavorite = (e: React.MouseEvent, trackId: string) => {
    e.stopPropagation();
    toggleFavoriteTrack(trackId);
  };

  // Dimensions matching Section 1 homepage exactly
  const cardSize = isMobile ? 290 : 330;
  const borderRadius = isMobile ? "28px" : "30px";

  const palette = currentTrack?.palette || {
    primary: "#6366f1",
    secondary: "#ec4899",
    accent: "#8b5cf6",
    glow: "rgba(99, 102, 241, 0.45)",
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      style={{
        position: "relative",
        minHeight: "100dvh",
        width: "100vw",
        backgroundColor: "#000000",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* ─────────────────────────────────────────────────────────────────────
          1. 60FPS HARDWARE-ACCELERATED VOLUMETRIC AMBIENT CANVAS (No WebGL)
      ────────────────────────────────────────────────────────────────────── */}
      <canvas
        ref={canvasRef}
        style={{
          position: "fixed",
          inset: 0,
          width: "100vw",
          height: "100dvh",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Cinematic Vignette Overlay */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "radial-gradient(circle at center, transparent 35%, rgba(0, 0, 0, 0.82) 100%)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* ─────────────────────────────────────────────────────────────────────
          2. MINIMALIST TOP BAR: BACK TO VAULT
      ────────────────────────────────────────────────────────────────────── */}
      <div
        style={{
          position: "fixed",
          top: "24px",
          left: "24px",
          zIndex: 40,
        }}
      >
        <button
          onClick={onBackToVault}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 18px",
            borderRadius: "999px",
            background: "rgba(255, 255, 255, 0.08)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            color: "#ffffff",
            fontSize: "0.82rem",
            fontWeight: 700,
            cursor: "pointer",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            transition: "all 0.2s ease",
          }}
        >
          <ArrowLeft size={15} />
          <span>Vault</span>
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────
          3. CENTER-STAGE ALBUM COVER & DYNAMIC VOLUMETRIC GLOW AURA
      ────────────────────────────────────────────────────────────────────── */}
      <motion.div
        ref={cardWrapperRef}
        layoutId="album-hero-cover"
        style={{
          position: "relative",
          zIndex: 20,
          width: `${cardSize}px`,
          height: `${cardSize}px`,
          perspective: 1000,
          transform: "scale(1)",
          transition: "transform 0.08s ease-out",
        }}
      >
        {/* A. Broad Volumetric Synesthesia Aura (Glows & changes color with track) */}
        <div
          ref={auraGlowRef}
          style={{
            position: "absolute",
            inset: "-45px",
            borderRadius: "65px",
            background: `radial-gradient(circle, ${palette.primary} 0%, ${palette.accent} 45%, transparent 75%)`,
            filter: "blur(50px)",
            opacity: 0.45,
            transition: "opacity 0.2s ease, background 0.6s ease",
            zIndex: 1,
            pointerEvents: "none",
          }}
        />

        {/* B. Punchy CRIMSON RED Aura Shockwave on Bass/Kick Hits */}
        <div
          ref={redKickAuraRef}
          style={{
            position: "absolute",
            inset: "-60px",
            borderRadius: "75px",
            background: "radial-gradient(circle, rgba(239, 68, 68, 0.95) 0%, rgba(225, 29, 72, 0.65) 45%, transparent 75%)",
            filter: "blur(42px)",
            opacity: 0,
            zIndex: 2,
            pointerEvents: "none",
            transition: "opacity 0.05s ease-out",
          }}
        />

        {/* C. Radiant Specular White/Silver Halo on Snare Hits */}
        <div
          ref={snareHaloRef}
          style={{
            position: "absolute",
            inset: "-30px",
            borderRadius: "55px",
            background: "radial-gradient(circle, rgba(255, 255, 255, 0.95) 0%, rgba(200, 225, 255, 0.45) 50%, transparent 75%)",
            filter: "blur(24px)",
            opacity: 0,
            zIndex: 3,
            pointerEvents: "none",
            transition: "opacity 0.05s ease-out",
          }}
        />

        {/* D. Main Cover Container (Supports 3D In-Place Flip on Mobile) */}
        <motion.div
          onClick={handleMobileCardClick}
          animate={{ rotateY: isMobile && isMobileFlipped ? 180 : 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          style={{
            width: "100%",
            height: "100%",
            position: "relative",
            transformStyle: "preserve-3d",
            cursor: "pointer",
            zIndex: 10,
          }}
        >
          {/* Front Face: High-Res Album Cover Artwork */}
          <div
            ref={frontCardRef}
            style={{
              position: "absolute",
              inset: 0,
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              borderRadius: borderRadius,
              overflow: "hidden",
              border: `1px solid ${palette.primary}`,
              boxShadow: `0 30px 90px rgba(0, 0, 0, 0.95), 0 0 25px ${palette.glow}`,
              background: "#121318",
              transition: "border-color 0.08s ease, box-shadow 0.08s ease",
            }}
          >
            <img
              src={currentTrack?.coverUrl || "https://media.postlain.com/covers/HVL_Album_Cover.jpg"}
              alt="HVL Album Cover"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />

            {/* Specular Light Glare Gradient Overlay */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, transparent 40%, rgba(255, 255, 255, 0.05) 100%)",
                pointerEvents: "none",
              }}
            />

            {/* Mobile Touch Hint */}
            {isMobile && (
              <div
                style={{
                  position: "absolute",
                  bottom: "12px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  padding: "5px 12px",
                  borderRadius: "999px",
                  background: "rgba(0, 0, 0, 0.75)",
                  border: "1px solid rgba(255, 255, 255, 0.25)",
                  color: "#ffffff",
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  backdropFilter: "blur(14px)",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  pointerEvents: "none",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.6)",
                }}
              >
                <RotateCcw size={11} />
                <span>Chạm xem 30 bài</span>
              </div>
            )}
          </div>

          {/* Back Face (Mobile In-Place 290x290 Scrollable Tracklist) */}
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
                border: "1px solid rgba(255, 255, 255, 0.22)",
                boxShadow: "0 30px 80px rgba(0, 0, 0, 0.95)",
                background: "rgba(10, 11, 16, 0.94)",
                backdropFilter: "blur(32px)",
                WebkitBackdropFilter: "blur(32px)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Back Face Header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 14px",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                  background: "rgba(255, 255, 255, 0.04)",
                }}
              >
                <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#ffffff" }}>
                  30 Tracks (HVL)
                </span>
                <span style={{ fontSize: "0.68rem", color: "rgba(255, 255, 255, 0.45)" }}>
                  Chạm để lật lại
                </span>
              </div>

              {/* Scrollable Tracks inside exact same 290x290 square box */}
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
                        background: isCurrent ? "rgba(255, 255, 255, 0.15)" : "transparent",
                        border: isCurrent ? "1px solid rgba(255, 255, 255, 0.25)" : "1px solid transparent",
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
                            background: isCurrent ? "#ffffff" : "transparent",
                            color: isCurrent ? "#000000" : "rgba(255, 255, 255, 0.4)",
                            flexShrink: 0,
                          }}
                        >
                          {isCurrent && isPlaying ? (
                            <Pause size={9} fill="#000000" />
                          ) : isCurrent ? (
                            <Play size={9} fill="#000000" style={{ marginLeft: "1px" }} />
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
                            color={isFav ? "#f43f5e" : "rgba(255, 255, 255, 0.25)"}
                            fill={isFav ? "#f43f5e" : "none"}
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
    </div>
  );
};
