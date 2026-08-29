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

const formatDuration = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
};

export const Album3DZone: React.FC<Album3DZoneProps> = ({ onBackToVault }) => {
  const { currentTrack, isPlaying, playTrack, togglePlay, favoritedTrackIds, toggleFavoriteTrack } = useAudioStore();
  const isMobile = useIsMobile();
  
  // Mobile Flip State (290x290 in-place square flip)
  const [isMobileFlipped, setIsMobileFlipped] = useState<boolean>(false);
  
  // Audio-reactive visual states (Transient Punch & Specular Halo)
  const [kickImpact, setKickImpact] = useState<number>(0);
  const [snareFlash, setSnareFlash] = useState<number>(0);
  const [ambientEnergy, setAmbientEnergy] = useState<number>(0);
  const [tilt, setTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const cardRef = useRef<HTMLDivElement | null>(null);

  // 60fps Loop for Transient Beat Detection & Ambient Depth
  useEffect(() => {
    let animId: number;

    const updateAudioEffects = () => {
      if (isPlaying) {
        const bands = audioAnalyserEngine.getBands();
        setKickImpact(bands.kickImpact);
        setSnareFlash(bands.snareFlash);
        setAmbientEnergy(bands.subBass * 0.4 + bands.kick * 0.4 + bands.lowMid * 0.2);
      } else {
        setKickImpact((prev) => prev * 0.85);
        setSnareFlash((prev) => prev * 0.85);
        setAmbientEnergy((prev) => prev * 0.85);
      }

      animId = requestAnimationFrame(updateAudioEffects);
    };

    animId = requestAnimationFrame(updateAudioEffects);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  // 3D Parallax Tilt Handler (Desktop only)
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isMobile) return;
    const { innerWidth, innerHeight } = window;
    const x = (e.clientX / innerWidth - 0.5) * 16;
    const y = (e.clientY / innerHeight - 0.5) * -16;
    setTilt({ x: y, y: x });
  };

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

  // Physical card scale: Snappy kick punch with clean rest period
  const currentScale = 1.0 + kickImpact * 0.06;

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
          1. CINEMATIC VOLUMETRIC AMBIENT DEPTH (No WebGL, Ultra-Lightweight)
      ────────────────────────────────────────────────────────────────────── */}
      {/* Center Deep Ambient Radial Glow breathing with track palette */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: `radial-gradient(ellipse at center, ${palette.primary}33 0%, ${palette.accent}18 45%, #000000 80%)`,
          opacity: isPlaying ? 0.35 + ambientEnergy * 0.45 : 0.20,
          transition: "opacity 0.25s ease-out",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Dynamic Red Shockwave Ambient Flash on Kick/Bass Impacts */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "radial-gradient(circle at center, rgba(239, 68, 68, 0.28) 0%, rgba(225, 29, 72, 0.12) 40%, transparent 75%)",
          opacity: kickImpact * 0.85,
          pointerEvents: "none",
          zIndex: 0,
          transition: "opacity 0.08s ease-out",
        }}
      />

      {/* Snare Specular Halo Flash across the screen */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "radial-gradient(circle at center, rgba(255, 255, 255, 0.18) 0%, rgba(240, 245, 255, 0.06) 45%, transparent 70%)",
          opacity: snareFlash * 0.9,
          pointerEvents: "none",
          zIndex: 0,
          transition: "opacity 0.06s ease-out",
        }}
      />

      {/* Cinematic Dark Vignette */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "radial-gradient(circle at center, transparent 35%, rgba(0, 0, 0, 0.85) 100%)",
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
      <div
        ref={cardRef}
        style={{
          position: "relative",
          zIndex: 20,
          width: `${cardSize}px`,
          height: `${cardSize}px`,
          perspective: 1000,
          transform: `scale(${currentScale}) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: "transform 0.10s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* A. Broad Volumetric Synesthesia Aura (Glows & changes color with track) */}
        <div
          style={{
            position: "absolute",
            inset: "-40px",
            borderRadius: "60px",
            background: `radial-gradient(circle, ${palette.primary}88 0%, ${palette.secondary}44 45%, transparent 70%)`,
            filter: "blur(45px)",
            opacity: isPlaying ? 0.75 + ambientEnergy * 0.35 : 0.35,
            transition: "opacity 0.25s ease, background 0.6s ease",
            zIndex: 1,
            pointerEvents: "none",
          }}
        />

        {/* B. Punchy CRIMSON RED Aura Shockwave on Bass/Kick Hits */}
        <div
          style={{
            position: "absolute",
            inset: "-55px",
            borderRadius: "70px",
            background: "radial-gradient(circle, rgba(239, 68, 68, 0.95) 0%, rgba(225, 29, 72, 0.65) 45%, transparent 75%)",
            filter: "blur(40px)",
            opacity: kickImpact > 0.05 ? kickImpact * 0.95 : 0,
            zIndex: 2,
            pointerEvents: "none",
            transition: "opacity 0.06s ease-out",
          }}
        />

        {/* C. Radiant Specular White/Silver Halo on Snare Hits */}
        <div
          style={{
            position: "absolute",
            inset: "-25px",
            borderRadius: "50px",
            background: "radial-gradient(circle, rgba(255, 255, 255, 0.95) 0%, rgba(200, 220, 255, 0.45) 50%, transparent 75%)",
            filter: "blur(20px)",
            opacity: snareFlash > 0.05 ? snareFlash * 0.9 : 0,
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
          {/* Front Face: High-Res Album Cover with Dynamic Color/Red Edge Specular */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              borderRadius: borderRadius,
              overflow: "hidden",
              border: kickImpact > 0.35
                ? "1.5px solid rgba(239, 68, 68, 0.9)"
                : `1px solid ${isPlaying ? palette.primary : "rgba(255, 255, 255, 0.25)"}`,
              boxShadow: kickImpact > 0.35
                ? "0 30px 90px rgba(0, 0, 0, 0.95), 0 0 35px rgba(239, 68, 68, 0.75)"
                : `0 30px 90px rgba(0, 0, 0, 0.95), 0 0 25px ${palette.glow}`,
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
      </div>

      {/* ─────────────────────────────────────────────────────────────────────
          4. BOTTOM PLAYBAR DOCK
      ────────────────────────────────────────────────────────────────────── */}
      {isMobile ? <MobilePlayerDock /> : <FloatingPlayerDock />}
    </div>
  );
};
