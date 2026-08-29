import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Play, Pause, Heart, RotateCcw } from "lucide-react";
import { useAudioStore, Track, DEFAULT_TRACKS } from "../store/audioStore";
import { Album3DScene } from "../components/scene3d/Album3DScene";
import { MeshGradientBackground } from "../components/MeshGradientBackground";
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
  
  // Audio-reactive visual states
  const [kickScale, setKickScale] = useState<number>(1.0);
  const [discRotation, setDiscRotation] = useState<number>(0);
  const [tilt, setTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const cardRef = useRef<HTMLDivElement | null>(null);

  // 60fps Loop for Cover Beat Bounce & Vinyl Disc Rotation
  useEffect(() => {
    let animId: number;

    const updateVisuals = () => {
      const bands = audioAnalyserEngine.getBands();
      
      if (isPlaying) {
        // Kick & Sub-Bass bounce
        const targetScale = 1.0 + bands.kick * 0.05 + bands.subBass * 0.03;
        setKickScale((prev) => prev + (targetScale - prev) * 0.35);

        // Smooth Vinyl Disc Rotation
        setDiscRotation((prev) => (prev + 1.2 + bands.overallEnergy * 1.5) % 360);
      } else {
        setKickScale((prev) => prev + (1.0 - prev) * 0.15);
      }

      animId = requestAnimationFrame(updateVisuals);
    };

    animId = requestAnimationFrame(updateVisuals);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  // 3D Parallax Tilt Handler
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isMobile) return;
    const { innerWidth, innerHeight } = window;
    const x = (e.clientX / innerWidth - 0.5) * 20; // -10 to +10 deg
    const y = (e.clientY / innerHeight - 0.5) * -20;
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

  return (
    <div
      onMouseMove={handleMouseMove}
      style={{
        position: "relative",
        minHeight: "100dvh",
        width: "100vw",
        backgroundColor: "#050508",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* 1. Fluid Ambient Mesh Aurora Glow */}
      <MeshGradientBackground />

      {/* 2. Full-Screen High-Vibrancy WebGL 3D Audio-Reactive Background with Shockwaves */}
      <Album3DScene />

      {/* 3. Minimalist Top Bar: Back to Vault */}
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

      {/* 4. Dead-Center Interactive Album Cover + Peeking Vinyl Disc */}
      <div
        ref={cardRef}
        style={{
          position: "relative",
          zIndex: 20,
          width: `${cardSize}px`,
          height: `${cardSize}px`,
          perspective: 1000,
          transform: `scale(${kickScale}) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: "transform 0.12s ease-out",
        }}
      >
        {/* Dynamic Audio-Reactive Ambient Glow Drop-Shadow */}
        <div
          style={{
            position: "absolute",
            inset: "-20px",
            borderRadius: "40px",
            background: `radial-gradient(circle, ${palette.glow} 0%, transparent 70%)`,
            filter: "blur(30px)",
            opacity: isPlaying ? 0.95 : 0.45,
            transition: "opacity 0.3s ease",
            zIndex: 1,
            pointerEvents: "none",
          }}
        />

        {/* Physical Vinyl Disc (Slides out to the right on Desktop) */}
        {!isMobile && (
          <div
            style={{
              position: "absolute",
              top: "10px",
              right: isPlaying ? "-85px" : "-50px",
              width: `${cardSize - 20}px`,
              height: `${cardSize - 20}px`,
              borderRadius: "50%",
              background: "radial-gradient(circle, #1c1d24 0%, #0d0e12 55%, #181920 100%)",
              boxShadow: "0 15px 40px rgba(0, 0, 0, 0.9), inset 0 0 0 2px rgba(255, 255, 255, 0.08)",
              zIndex: 2,
              transform: `rotate(${discRotation}deg)`,
              transition: "right 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              pointerEvents: "none",
            }}
          >
            {/* Fine Concentric Vinyl Grooves */}
            <div
              style={{
                position: "absolute",
                inset: "18px",
                borderRadius: "50%",
                border: "1px dashed rgba(255, 255, 255, 0.12)",
                boxShadow: "inset 0 0 0 12px rgba(0,0,0,0.5), inset 0 0 0 28px rgba(255,255,255,0.03)",
              }}
            />
            {/* Center Label Inlaid Artwork */}
            <div
              style={{
                width: "90px",
                height: "90px",
                borderRadius: "50%",
                overflow: "hidden",
                border: "2px solid rgba(255, 255, 255, 0.3)",
                boxShadow: "0 0 12px rgba(0,0,0,0.8)",
              }}
            >
              <img
                src={currentTrack?.coverUrl || "https://media.postlain.com/covers/HVL_Album_Cover.jpg"}
                alt="Vinyl Label"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
          </div>
        )}

        {/* Main Cover Container (Supports 3D In-Place Flip on Mobile) */}
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
          {/* Front Face: High-Res Album Cover Artwork with Liquid Glass Rim */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              borderRadius: borderRadius,
              overflow: "hidden",
              border: `1px solid ${isPlaying ? palette.primary : "rgba(255, 255, 255, 0.25)"}`,
              boxShadow: `0 30px 80px rgba(0, 0, 0, 0.95), 0 0 24px ${palette.glow}`,
              background: "#121318",
              transition: "border-color 0.4s ease, box-shadow 0.4s ease",
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
                  background: "rgba(0, 0, 0, 0.72)",
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
                background: "rgba(10, 11, 16, 0.92)",
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

      {/* 5. Bottom Playbar Dock */}
      {isMobile ? <MobilePlayerDock /> : <FloatingPlayerDock />}
    </div>
  );
};
