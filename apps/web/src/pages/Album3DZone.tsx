import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Play, Pause, Heart, RotateCcw, Activity } from "lucide-react";
import { useAudioStore, Track, DEFAULT_TRACKS } from "../store/audioStore";
import { FloatingPlayerDock } from "../components/FloatingPlayerDock";
import { MobilePlayerDock } from "../components/MobilePlayerDock";
import { useIsMobile } from "../hooks/useIsMobile";
import { studioBeatEngine } from "../audio/StudioBeatEngine";

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
  const subRumbleAuraRef = useRef<HTMLDivElement | null>(null);
  const redKickAuraRef = useRef<HTMLDivElement | null>(null);
  const snareHaloRef = useRef<HTMLDivElement | null>(null);
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

    let kickShockwaveRadius = 0;
    let subShockwaveRadius = 0;
    let snareRadius = 0;

    const render = () => {
      const now = performance.now();
      const beatState = studioBeatEngine.update();
      const primaryRgb = hexToRgb(currentTrack?.palette?.primary || "#6366f1");
      const accentRgb = hexToRgb(currentTrack?.palette?.accent || "#8b5cf6");

      const subImpact = beatState.subImpact;
      const kickImpact = beatState.kickImpact;
      const bassImpact = beatState.bassImpact;
      const kickRollIntensity = beatState.kickRollIntensity;
      const snareFlash = beatState.snareFlash;
      const downbeatPulse = beatState.downbeatPulse;
      const energy = beatState.overallEnergy;

      // ─────────────────────────────────────────────────────────────
      // 1. RENDER VOLUMETRIC AMBIENT DEPTH ON CANVAS (Z-INDEX 1)
      // ─────────────────────────────────────────────────────────────
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      ctx.globalCompositeOperation = "screen";

      // A. Main Center Ambient Light Field (Breathing with track palette & melodic bass)
      const baseRadius = Math.min(width, height) * (0.45 + energy * 0.20 + bassImpact * 0.15 + downbeatPulse * 0.10);
      const ambientGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, baseRadius);
      const alpha = isPlaying ? 0.35 + energy * 0.30 + bassImpact * 0.20 : 0.18;

      ambientGrad.addColorStop(0, `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, ${alpha})`);
      ambientGrad.addColorStop(0.45, `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, ${alpha * 0.5})`);
      ambientGrad.addColorStop(0.80, `rgba(20, 25, 45, ${alpha * 0.15})`);
      ambientGrad.addColorStop(1, "rgba(0, 0, 0, 0)");

      ctx.fillStyle = ambientGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius, 0, Math.PI * 2);
      ctx.fill();

      // B. DEEP 808 SUB-BASS GRAVITATIONAL WAVE (20-65Hz: Deep Indigo & Obsidian Blue)
      if (subImpact > 0.04) {
        subShockwaveRadius = Math.min(width, height) * (0.45 + (1.0 - subImpact) * 0.50);
        const subGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, subShockwaveRadius);
        const subAlpha = subImpact * 0.70;

        subGrad.addColorStop(0, `rgba(79, 70, 229, ${subAlpha})`);
        subGrad.addColorStop(0.45, `rgba(30, 27, 75, ${subAlpha * 0.6})`);
        subGrad.addColorStop(0.85, `rgba(15, 23, 42, ${subAlpha * 0.2})`);
        subGrad.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.fillStyle = subGrad;
        ctx.beginPath();
        ctx.arc(centerX, centerY, subShockwaveRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      // C. PUNCHY KICK DRUM SHOCKWAVE (65-160Hz: Intense Crimson Red Laser)
      const effectiveKick = Math.max(kickImpact, kickRollIntensity);
      if (effectiveKick > 0.05) {
        kickShockwaveRadius = Math.min(width, height) * (0.30 + (1.0 - effectiveKick) * 0.45);
        const redGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, kickShockwaveRadius);
        const redAlpha = effectiveKick * 0.75;

        redGrad.addColorStop(0, `rgba(239, 68, 68, ${redAlpha})`);
        redGrad.addColorStop(0.35, `rgba(225, 29, 72, ${redAlpha * 0.55})`);
        redGrad.addColorStop(0.75, `rgba(180, 20, 50, ${redAlpha * 0.15})`);
        redGrad.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.fillStyle = redGrad;
        ctx.beginPath();
        ctx.arc(centerX, centerY, kickShockwaveRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      // D. RADIANT SPECULAR WHITE HALO (Snare / High Transients)
      if (snareFlash > 0.05) {
        snareRadius = Math.min(width, height) * (0.25 + (1.0 - snareFlash) * 0.35);
        const snareGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, snareRadius);
        const snareAlpha = snareFlash * 0.60;

        snareGrad.addColorStop(0, `rgba(255, 255, 255, ${snareAlpha})`);
        snareGrad.addColorStop(0.5, `rgba(210, 230, 255, ${snareAlpha * 0.35})`);
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
        // Direct scale punch on Kick + 808 sub-rumble vibration
        const scale = 1.0 + kickImpact * 0.085 + kickRollIntensity * 0.04 + downbeatPulse * 0.04;
        const subRumbleX = Math.sin(now * 0.040) * (subImpact * 3.5);
        const subRumbleY = Math.cos(now * 0.050) * (subImpact * 2.5);
        const tiltX = mousePos.current.y;
        const tiltY = mousePos.current.x;
        cardWrapperRef.current.style.transform = `translate3d(${subRumbleX}px, ${subRumbleY}px, 0) scale(${scale}) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
      }

      // Layer 1: Deep 808 Sub-Bass Obsidian Rumble Aura
      if (subRumbleAuraRef.current) {
        subRumbleAuraRef.current.style.opacity = `${subImpact > 0.04 ? subImpact * 0.95 : 0}`;
      }

      // Layer 2: Melodic Upper Bass Swell Aura
      if (auraGlowRef.current) {
        auraGlowRef.current.style.opacity = `${isPlaying ? 0.50 + bassImpact * 0.45 + energy * 0.20 : 0.25}`;
      }

      // Layer 3: Punchy Crimson Kick Flash Aura (Supports Fast Kick Rolls)
      if (redKickAuraRef.current) {
        redKickAuraRef.current.style.opacity = `${effectiveKick > 0.05 ? effectiveKick * 0.95 : 0}`;
      }

      // Layer 4: Snare Specular Halo
      if (snareHaloRef.current) {
        snareHaloRef.current.style.opacity = `${snareFlash > 0.05 ? snareFlash * 0.92 : 0}`;
      }

      // Front Card Dynamic Border & Shadow
      if (frontCardRef.current) {
        if (effectiveKick > 0.22) {
          frontCardRef.current.style.borderColor = `rgba(239, 68, 68, ${0.65 + effectiveKick * 0.35})`;
          frontCardRef.current.style.boxShadow = `0 30px 90px rgba(0, 0, 0, 0.95), 0 0 ${40 + effectiveKick * 60}px rgba(239, 68, 68, 0.88)`;
        } else if (subImpact > 0.25) {
          frontCardRef.current.style.borderColor = `rgba(99, 102, 241, ${0.60 + subImpact * 0.40})`;
          frontCardRef.current.style.boxShadow = `0 30px 90px rgba(0, 0, 0, 0.95), 0 0 ${35 + subImpact * 50}px rgba(79, 70, 229, 0.85)`;
        } else if (snareFlash > 0.28) {
          frontCardRef.current.style.borderColor = `rgba(255, 255, 255, ${0.75 + snareFlash * 0.25})`;
          frontCardRef.current.style.boxShadow = `0 30px 90px rgba(0, 0, 0, 0.95), 0 0 ${35 + snareFlash * 45}px rgba(255, 255, 255, 0.80)`;
        } else {
          frontCardRef.current.style.borderColor = isPlaying ? (currentTrack?.palette?.primary || "#6366f1") : "rgba(255, 255, 255, 0.25)";
          frontCardRef.current.style.boxShadow = `0 30px 90px rgba(0, 0, 0, 0.95), 0 0 ${20 + energy * 25 + bassImpact * 20}px ${currentTrack?.palette?.glow || "rgba(99, 102, 241, 0.45)"}`;
        }
      }

      // Live Ground-Truth Studio Audio HUD Updates
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
            pip.style.background = i === 0 ? "rgba(244, 63, 94, 1.0)" : "rgba(99, 102, 241, 1.0)";
            pip.style.boxShadow = i === 0 ? "0 0 10px rgba(244, 63, 94, 0.9)" : "0 0 8px rgba(99, 102, 241, 0.8)";
            pip.style.transform = "scale(1.35)";
          } else {
            pip.style.background = "rgba(255, 255, 255, 0.2)";
            pip.style.boxShadow = "none";
            pip.style.transform = "scale(1.0)";
          }
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
          1. 60FPS HARDWARE-ACCELERATED VOLUMETRIC AMBIENT LIGHT & KICK SHOCKWAVE (Z-INDEX 1)
      ────────────────────────────────────────────────────────────────────── */}
      <canvas
        ref={canvasRef}
        style={{
          position: "fixed",
          inset: 0,
          width: "100vw",
          height: "100dvh",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* Cinematic Vignette Overlay */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "radial-gradient(circle at center, transparent 35%, rgba(0, 0, 0, 0.82) 100%)",
          pointerEvents: "none",
          zIndex: 2,
        }}
      />

      {/* ─────────────────────────────────────────────────────────────────────
          2. TOP BAR: BACK TO VAULT (LEFT) & STUDIO AUDIO HUD (RIGHT)
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

      {/* Top-Right Studio Audio HUD */}
      <div
        style={{
          position: "fixed",
          top: "24px",
          right: "24px",
          zIndex: 40,
          display: "flex",
          alignItems: "center",
          gap: "10px",
          flexWrap: "wrap",
          justifyContent: "flex-end",
        }}
      >
        {/* Lossless 24-bit/96kHz Master Capsule */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "6px 14px",
            borderRadius: "999px",
            background: "rgba(10, 15, 30, 0.65)",
            border: "1px solid rgba(56, 189, 248, 0.35)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            color: "#38bdf8",
            fontSize: "0.74rem",
            fontWeight: 800,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            boxShadow: "0 0 15px rgba(56, 189, 248, 0.15)",
          }}
        >
          <Activity size={13} />
          <span>FLAC 24/96kHz Master</span>
        </div>

        {/* Live Ground-Truth BPM & Root Key Badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 14px",
            borderRadius: "999px",
            background: "rgba(255, 255, 255, 0.08)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            color: "#ffffff",
            fontSize: "0.78rem",
            fontWeight: 700,
          }}
        >
          <span ref={bpmTextRef}>128 BPM</span>
          <span style={{ opacity: 0.3 }}>|</span>
          <span ref={keyTextRef} style={{ color: "#a78bfa" }}>KEY: C</span>
        </div>

        {/* 4/4 Beat Grid Pips */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            padding: "6px 10px",
            borderRadius: "999px",
            background: "rgba(0, 0, 0, 0.55)",
            border: "1px solid rgba(255, 255, 255, 0.10)",
            backdropFilter: "blur(16px)",
          }}
        >
          {[1, 2, 3, 4].map((beatNum) => (
            <div
              key={beatNum}
              ref={(el) => { beatPipsRef.current[beatNum - 1] = el; }}
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.2)",
                transition: "all 0.08s ease-out",
              }}
            />
          ))}
        </div>
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

        {/* B. Deep 808 Sub-Bass Obsidian Rumble Aura (20-65Hz) */}
        <div
          ref={subRumbleAuraRef}
          style={{
            position: "absolute",
            inset: "-70px",
            borderRadius: "85px",
            background: "radial-gradient(circle, rgba(79, 70, 229, 0.85) 0%, rgba(30, 27, 75, 0.70) 50%, transparent 80%)",
            filter: "blur(60px)",
            opacity: 0,
            zIndex: 2,
            pointerEvents: "none",
            transition: "opacity 0.08s ease-out",
          }}
        />

        {/* C. Punchy CRIMSON RED Aura Shockwave on Kick Hits & Rolls (65-160Hz) */}
        <div
          ref={redKickAuraRef}
          style={{
            position: "absolute",
            inset: "-55px",
            borderRadius: "75px",
            background: "radial-gradient(circle, rgba(239, 68, 68, 0.95) 0%, rgba(225, 29, 72, 0.65) 45%, transparent 75%)",
            filter: "blur(40px)",
            opacity: 0,
            zIndex: 3,
            pointerEvents: "none",
            transition: "opacity 0.05s ease-out",
          }}
        />

        {/* D. Radiant Specular White/Silver Halo on Snare Hits */}
        <div
          ref={snareHaloRef}
          style={{
            position: "absolute",
            inset: "-30px",
            borderRadius: "55px",
            background: "radial-gradient(circle, rgba(255, 255, 255, 0.95) 0%, rgba(200, 225, 255, 0.45) 50%, transparent 75%)",
            filter: "blur(24px)",
            opacity: 0,
            zIndex: 4,
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
