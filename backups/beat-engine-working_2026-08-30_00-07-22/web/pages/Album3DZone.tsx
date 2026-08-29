import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Play, Pause, Heart, RotateCcw } from "lucide-react";
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

interface ShockwaveRipple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  speed: number;
  color: { r: number; g: number; b: number };
  width: number;
}

export const Album3DZone: React.FC<Album3DZoneProps> = ({ onBackToVault }) => {
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
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cardWrapperRef = useRef<HTMLDivElement | null>(null);
  const subAuraRef = useRef<HTMLDivElement | null>(null);
  const kickAuraRef = useRef<HTMLDivElement | null>(null);
  const vocalSheenRef = useRef<HTMLDivElement | null>(null);
  const hihatBorderRef = useRef<HTMLDivElement | null>(null);
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
      x: (e.clientX / innerWidth - 0.5) * 8, // Subtler micro-tilt
      y: (e.clientY / innerHeight - 0.5) * -8,
    };
  };

  // High-Performance 60fps/120fps Render Loop for Ambient Nebula Canvas & Liquid Glass Card
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

    // Active Concentric Radial Shockwave Ripples
    const ripples: ShockwaveRipple[] = [];

    // Background Nebula Orbs
    const nebulaOrbs = [
      { x: width * 0.30, y: height * 0.35, vx: 0.25, vy: 0.20, baseRadius: width * 0.40, role: "primary" },
      { x: width * 0.70, y: height * 0.40, vx: -0.22, vy: 0.24, baseRadius: width * 0.45, role: "secondary" },
      { x: width * 0.50, y: height * 0.70, vx: 0.18, vy: -0.20, baseRadius: width * 0.50, role: "accent" }
    ];

    let t = 0;
    let lastSpawnTime = 0;

    const render = () => {
      t += 0.006;
      const now = performance.now();
      const beatState = studioBeatEngine.update();
      const primaryRgb = hexToRgb(currentTrack?.palette?.primary || "#6366f1");
      const secondaryRgb = hexToRgb(currentTrack?.palette?.secondary || "#a855f7");
      const accentRgb = hexToRgb(currentTrack?.palette?.accent || "#ec4899");

      const subImpact = beatState.subImpact;
      const kickImpact = beatState.kickImpact;
      const ghostKickImpact = beatState.ghostKickImpact;
      const kickRollIntensity = beatState.kickRollIntensity;
      const snareFlash = beatState.snareFlash;
      const vocalPresence = beatState.vocalPresence;
      const hihatSparkle = beatState.hihatSparkle;
      const energy = beatState.overallEnergy;

      const centerX = width / 2;
      const centerY = height / 2;

      // ─────────────────────────────────────────────────────────────
      // 1. RENDER DYNAMIC NEBULA FLUID BACKGROUND (CANVAS Z-INDEX 1)
      // ─────────────────────────────────────────────────────────────
      ctx.fillStyle = "#05060a";
      ctx.fillRect(0, 0, width, height);

      ctx.globalCompositeOperation = "screen";

      // Render Floating Nebula Gradient Clouds
      nebulaOrbs.forEach((orb, i) => {
        const speed = 1.0 + energy * 1.2;
        orb.x += (orb.vx + Math.sin(t * 1.1 + i * 1.5) * 0.6) * speed;
        orb.y += (orb.vy + Math.cos(t * 1.0 + i * 1.2) * 0.6) * speed;

        if (orb.x < -orb.baseRadius * 0.2) orb.vx = Math.abs(orb.vx);
        if (orb.x > width + orb.baseRadius * 0.2) orb.vx = -Math.abs(orb.vx);
        if (orb.y < -orb.baseRadius * 0.2) orb.vy = Math.abs(orb.vy);
        if (orb.y > height + orb.baseRadius * 0.2) orb.vy = -Math.abs(orb.vy);

        const rgb = orb.role === "secondary" ? secondaryRgb : orb.role === "accent" ? accentRgb : primaryRgb;
        const dynamicRadius = orb.baseRadius * (0.9 + subImpact * 0.35 + energy * 0.25);
        const dynamicAlpha = Math.min(0.45, 0.16 + energy * 0.22 + subImpact * 0.18);

        const grad = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, dynamicRadius);
        grad.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${dynamicAlpha.toFixed(3)})`);
        grad.addColorStop(0.40, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${(dynamicAlpha * 0.5).toFixed(3)})`);
        grad.addColorStop(0.80, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${(dynamicAlpha * 0.12).toFixed(3)})`);
        grad.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, dynamicRadius, 0, Math.PI * 2);
        ctx.fill();
      });

      // ─────────────────────────────────────────────────────────────
      // 2. CONCENTRIC RADIAL SHOCKWAVE SYSTEM (KICK ROLLS & DROPS)
      // ─────────────────────────────────────────────────────────────
      // Spawn Ripple on Kick / Roll / Sub / Snare
      if (isPlaying) {
        if ((beatState.isKickHit || beatState.isKickRoll) && now - lastSpawnTime > 35) {
          lastSpawnTime = now;
          ripples.push({
            x: centerX,
            y: centerY,
            radius: isMobile ? 130 : 180,
            maxRadius: Math.max(width, height) * 0.85,
            alpha: Math.min(0.95, 0.55 + kickImpact * 0.40),
            speed: isMobile ? 7 : 11,
            color: beatState.isKickRoll ? { r: 244, g: 63, b: 94 } : { r: 239, g: 68, b: 68 },
            width: beatState.isKickRoll ? 3.5 : 2.5
          });
        } else if ((beatState.isSubHit || beatState.isGhostKickHit) && now - lastSpawnTime > 60) {
          lastSpawnTime = now;
          ripples.push({
            x: centerX,
            y: centerY,
            radius: isMobile ? 130 : 180,
            maxRadius: Math.max(width, height) * 0.65,
            alpha: Math.min(0.75, 0.35 + subImpact * 0.40),
            speed: isMobile ? 5 : 8,
            color: { r: 147, g: 51, b: 234 },
            width: 2.0
          });
        }
      }

      // Draw & Update Ripples
      for (let idx = ripples.length - 1; idx >= 0; idx--) {
        const r = ripples[idx];
        r.radius += r.speed;
        r.alpha *= 0.94; // Smooth fade-out

        if (r.alpha > 0.01 && r.radius < r.maxRadius) {
          ctx.strokeStyle = `rgba(${r.color.r}, ${r.color.g}, ${r.color.b}, ${r.alpha.toFixed(3)})`;
          ctx.lineWidth = r.width;
          ctx.beginPath();
          ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
          ctx.stroke();
        } else {
          ripples.splice(idx, 1);
        }
      }

      ctx.globalCompositeOperation = "source-over";

      // ─────────────────────────────────────────────────────────────
      // 3. ZERO-JITTER LIQUID GLASS INERTIA CARD DYNAMICS
      // ─────────────────────────────────────────────────────────────
      if (cardWrapperRef.current) {
        // Natural Gentle Breathing Scale (No violent shaking)
        let scale = 1.0;
        if (beatState.isGentleMode) {
          // Smooth sinusoidal breathing
          scale = 1.0 + beatState.breathingPhase * 0.018;
        } else {
          // Snappy micro-impact punch
          scale = 1.0 + kickImpact * 0.035 + ghostKickImpact * 0.015 + kickRollIntensity * 0.02;
        }

        // Smooth Inertia Tilt (No translation X/Y vibration)
        const tiltX = mousePos.current.y + Math.sin(t * 1.5) * 0.6;
        const tiltY = mousePos.current.x + Math.cos(t * 1.2) * 0.6;
        cardWrapperRef.current.style.transform = `scale(${scale}) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg)`;
      }

      // 4-Tier Chromatic Glass Lighting Layers
      // Tier 1: Sub-Bass Neon Violet Aura (20-70Hz)
      if (subAuraRef.current) {
        const subAlpha = Math.min(1.0, subImpact * 1.2 + ghostKickImpact * 0.6);
        subAuraRef.current.style.opacity = `${isPlaying ? subAlpha.toFixed(2) : "0.15"}`;
        subAuraRef.current.style.transform = `scale(${1.0 + subImpact * 0.12})`;
      }

      // Tier 2: Kick & Snare Ruby/Amber Flare (70-300Hz)
      if (kickAuraRef.current) {
        const kickAlpha = Math.max(kickImpact, kickRollIntensity);
        kickAuraRef.current.style.opacity = `${kickAlpha > 0.05 ? (kickAlpha * 0.95).toFixed(2) : "0"}`;
      }

      // Tier 3: Vocal / Melody Liquid Silver Specular Sheen (900-3800Hz)
      if (vocalSheenRef.current) {
        const sheenTranslate = (Math.sin(t * 2.0) * 50 + 50).toFixed(1);
        vocalSheenRef.current.style.opacity = `${isPlaying ? (vocalPresence * 0.85).toFixed(2) : "0"}`;
        vocalSheenRef.current.style.transform = `translateX(${sheenTranslate}%) skewX(-20deg)`;
      }

      // Tier 4: Hi-Hat Gold & Diamond Stardust Border (5k-16kHz)
      if (hihatBorderRef.current) {
        hihatBorderRef.current.style.opacity = `${hihatSparkle > 0.08 ? (hihatSparkle * 0.9).toFixed(2) : "0.15"}`;
      }

      // Front Card Specular Reflection & Border Glow
      if (frontCardRef.current) {
        if (beatState.isKickRoll) {
          frontCardRef.current.style.borderColor = "rgba(244, 63, 94, 0.85)";
          frontCardRef.current.style.boxShadow = "0 30px 80px rgba(0, 0, 0, 0.9), 0 0 35px rgba(244, 63, 94, 0.65)";
        } else if (kickImpact > 0.3) {
          frontCardRef.current.style.borderColor = "rgba(239, 68, 68, 0.75)";
          frontCardRef.current.style.boxShadow = "0 30px 80px rgba(0, 0, 0, 0.9), 0 0 30px rgba(239, 68, 68, 0.55)";
        } else if (subImpact > 0.3) {
          frontCardRef.current.style.borderColor = "rgba(139, 92, 246, 0.75)";
          frontCardRef.current.style.boxShadow = "0 30px 80px rgba(0, 0, 0, 0.9), 0 0 30px rgba(139, 92, 246, 0.55)";
        } else {
          frontCardRef.current.style.borderColor = isPlaying ? (currentTrack?.palette?.primary || "rgba(255, 255, 255, 0.3)") : "rgba(255, 255, 255, 0.18)";
          frontCardRef.current.style.boxShadow = `0 30px 80px rgba(0, 0, 0, 0.9), 0 0 25px ${currentTrack?.palette?.glow || "rgba(99, 102, 241, 0.35)"}`;
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
    playTrack(track, { crossfade: true });
  };

  const toggleFavorite = (e: React.MouseEvent, trackId: string) => {
    e.stopPropagation();
    toggleFavoriteTrack(trackId);
  };

  // Dimensions
  const cardSize = isMobile ? 290 : 380;
  const borderRadius = isMobile ? "24px" : "32px";

  return (
    <div
      onMouseMove={handleMouseMove}
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100dvh",
        backgroundColor: "#05060a",
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
          1. VOLUMETRIC CANVAS (NEBULA MESH + CONCENTRIC SHOCKWAVE RIPPLES)
      ────────────────────────────────────────────────────────────────────── */}
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* ─────────────────────────────────────────────────────────────────────
          2. TOP IMMERSIVE HUD (BACK TO VAULT + AUDIO METRICS)
      ────────────────────────────────────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          top: "24px",
          left: "24px",
          right: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
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
            background: "rgba(255, 255, 255, 0.08)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            color: "#ffffff",
            fontSize: "0.82rem",
            fontWeight: 700,
            cursor: "pointer",
            transition: "all 0.2s ease",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.5)",
          }}
        >
          <ArrowLeft size={15} />
          <span>Vault</span>
        </button>

        {/* Live Ground-Truth Rhythm Engine HUD */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 14px",
              borderRadius: "999px",
              background: "rgba(10, 11, 16, 0.75)",
              border: "1px solid rgba(56, 189, 248, 0.35)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              fontSize: "0.74rem",
              fontWeight: 700,
              color: "#38bdf8",
              boxShadow: "0 4px 16px rgba(56, 189, 248, 0.25)",
            }}
          >
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#38bdf8", boxShadow: "0 0 6px #38bdf8" }} />
            <span>MPEG-4 AUDIO</span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 14px",
              borderRadius: "999px",
              background: "rgba(10, 11, 16, 0.75)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              fontSize: "0.74rem",
              fontWeight: 700,
              color: "#ffffff",
            }}
          >
            <span ref={bpmTextRef}>120 BPM</span>
            <span style={{ color: "rgba(255, 255, 255, 0.3)" }}>|</span>
            <span ref={keyTextRef}>KEY: C#</span>
          </div>

          {/* 4-Beat Bar Indicator */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              padding: "6px 10px",
              borderRadius: "999px",
              background: "rgba(10, 11, 16, 0.75)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              backdropFilter: "blur(20px)",
            }}
          >
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                ref={(el) => {
                  beatPipsRef.current[i] = el;
                }}
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "rgba(255, 255, 255, 0.2)",
                  transition: "transform 0.08s ease, background 0.08s ease",
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────
          3. CENTERPIECE: 4-TIER CHROMATIC LIQUID GLASS ALBUM CARD
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
        {/* Tier 1: Sub-Bass Neon Violet Deep Aura */}
        <div
          ref={subAuraRef}
          style={{
            position: "absolute",
            inset: "-60px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(147, 51, 234, 0.85) 0%, rgba(99, 102, 241, 0.45) 45%, transparent 75%)",
            filter: "blur(48px)",
            pointerEvents: "none",
            opacity: 0.3,
            transition: "opacity 0.08s ease, transform 0.08s ease",
          }}
        />

        {/* Tier 2: Kick & Snare Ruby Flare */}
        <div
          ref={kickAuraRef}
          style={{
            position: "absolute",
            inset: "-35px",
            borderRadius: borderRadius,
            background: "radial-gradient(circle, rgba(244, 63, 94, 0.95) 0%, rgba(251, 146, 60, 0.55) 45%, transparent 80%)",
            filter: "blur(32px)",
            pointerEvents: "none",
            opacity: 0,
            transition: "opacity 0.04s ease",
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
          {/* Front Face: Album Artwork + Liquid Glass Layering */}
          <div
            ref={frontCardRef}
            style={{
              position: "absolute",
              inset: 0,
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              borderRadius: borderRadius,
              overflow: "hidden",
              border: "1.5px solid rgba(255, 255, 255, 0.25)",
              boxShadow: "0 30px 80px rgba(0, 0, 0, 0.9), 0 0 25px rgba(99, 102, 241, 0.35)",
              background: "rgba(15, 17, 26, 0.85)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              transition: "border-color 0.12s ease, box-shadow 0.12s ease",
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

            {/* Tier 3: Vocal / Melody Specular Sheen Highlight */}
            <div
              ref={vocalSheenRef}
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                width: "60%",
                left: "-30%",
                background: "linear-gradient(90deg, transparent 0%, rgba(56, 189, 248, 0.25) 35%, rgba(255, 255, 255, 0.45) 50%, rgba(56, 189, 248, 0.25) 65%, transparent 100%)",
                pointerEvents: "none",
                opacity: 0,
                mixBlendMode: "overlay",
              }}
            />

            {/* Tier 4: Hi-Hat Diamond Stardust Outer Rim */}
            <div
              ref={hihatBorderRef}
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: borderRadius,
                border: "1.5px solid rgba(253, 224, 71, 0.6)",
                boxShadow: "inset 0 0 16px rgba(253, 224, 71, 0.4)",
                pointerEvents: "none",
                opacity: 0,
                transition: "opacity 0.06s ease",
              }}
            />

            {/* Subtle Frosted Liquid Top Reflection */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(135deg, rgba(255, 255, 255, 0.18) 0%, transparent 45%, rgba(255, 255, 255, 0.05) 100%)",
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
                border: "1px solid rgba(255, 255, 255, 0.22)",
                boxShadow: "0 30px 80px rgba(0, 0, 0, 0.95)",
                background: "rgba(10, 11, 16, 0.94)",
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

export default Album3DZone;
