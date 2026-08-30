import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Play, Pause, Heart, RotateCcw, Film } from "lucide-react";
import { useAudioStore, Track, DEFAULT_TRACKS } from "../store/audioStore";
import { FloatingPlayerDock } from "../components/FloatingPlayerDock";
import { MobilePlayerDock } from "../components/MobilePlayerDock";
import { useIsMobile } from "../hooks/useIsMobile";
import { studioBeatEngine } from "../audio/StudioBeatEngine";

interface Album3DZoneProps {
  onBackToVault: () => void;
  onOpenVideo3D?: () => void;
}

const formatDuration = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
};

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
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
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

  // High-Performance 60fps/120fps Dark Gothic Atmosphere & Crimson Halation Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // 35mm Analog Film Grain Texture Generator
    const grainCanvas = document.createElement("canvas");
    grainCanvas.width = 128;
    grainCanvas.height = 128;
    const grainCtx = grainCanvas.getContext("2d");
    if (grainCtx) {
      const imgData = grainCtx.createImageData(128, 128);
      for (let i = 0; i < imgData.data.length; i += 4) {
        const val = Math.floor(Math.random() * 255);
        imgData.data[i] = val;
        imgData.data[i + 1] = val;
        imgData.data[i + 2] = val;
        imgData.data[i + 3] = 26; // Gritty 35mm film noise
      }
      grainCtx.putImageData(imgData, 0, 0);
    }
    const grainPattern = ctx.createPattern(grainCanvas, "repeat");

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    // Heavy Dark Gothic Volumetric Smoke Clouds
    const smokeClouds = [
      { x: width * 0.25, y: height * 0.35, vx: 0.18, vy: 0.14, radius: width * 0.45, color: { r: 185, g: 28, b: 28 } }, // Crimson Blood
      { x: width * 0.75, y: height * 0.40, vx: -0.15, vy: 0.18, radius: width * 0.50, color: { r: 153, g: 27, b: 27 } }, // Dark Red
      { x: width * 0.50, y: height * 0.70, vx: 0.12, vy: -0.16, radius: width * 0.55, color: { r: 67, g: 20, b: 7 } },   // Blood Amber
      { x: width * 0.20, y: height * 0.80, vx: -0.10, vy: -0.12, radius: width * 0.40, color: { r: 15, g: 23, b: 42 } }  // Obsidian Void
    ];

    let t = 0;

    const render = () => {
      t += 0.006;
      const beatState = studioBeatEngine.update();
      const subImpact = beatState.subImpact;
      const kickImpact = beatState.kickImpact;
      const kickRollIntensity = beatState.kickRollIntensity;
      const energy = beatState.overallEnergy;

      const centerX = width / 2;
      const centerY = height / 2;

      // ─────────────────────────────────────────────────────────────
      // 1. DARK GOTHIC ABYSS & VOLUMETRIC SMOKE
      // ─────────────────────────────────────────────────────────────
      ctx.fillStyle = "#030305";
      ctx.fillRect(0, 0, width, height);

      ctx.globalCompositeOperation = "screen";

      // Render Heavy Atmospheric Smoke Clouds
      smokeClouds.forEach((cloud, i) => {
        const speed = 1.0 + energy * 1.6;
        cloud.x += (cloud.vx + Math.sin(t * 1.1 + i * 1.5) * 0.6) * speed;
        cloud.y += (cloud.vy + Math.cos(t * 1.0 + i * 1.2) * 0.6) * speed;

        if (cloud.x < -cloud.radius * 0.3) cloud.vx = Math.abs(cloud.vx);
        if (cloud.x > width + cloud.radius * 0.3) cloud.vx = -Math.abs(cloud.vx);
        if (cloud.y < -cloud.radius * 0.3) cloud.vy = Math.abs(cloud.vy);
        if (cloud.y > height + cloud.radius * 0.3) cloud.vy = -Math.abs(cloud.vy);

        const dynamicRadius = cloud.radius * (0.90 + subImpact * 0.45 + kickImpact * 0.30);
        const dynamicAlpha = Math.min(0.48, 0.12 + subImpact * 0.25 + kickImpact * 0.20);

        const grad = ctx.createRadialGradient(cloud.x, cloud.y, 0, cloud.x, cloud.y, dynamicRadius);
        grad.addColorStop(0, `rgba(${cloud.color.r}, ${cloud.color.g}, ${cloud.color.b}, ${dynamicAlpha.toFixed(3)})`);
        grad.addColorStop(0.40, `rgba(${cloud.color.r}, ${cloud.color.g}, ${cloud.color.b}, ${(dynamicAlpha * 0.45).toFixed(3)})`);
        grad.addColorStop(0.80, `rgba(${cloud.color.r}, ${cloud.color.g}, ${cloud.color.b}, ${(dynamicAlpha * 0.10).toFixed(3)})`);
        grad.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cloud.x, cloud.y, dynamicRadius, 0, Math.PI * 2);
        ctx.fill();
      });

      // ─────────────────────────────────────────────────────────────
      // 2. VOLUMETRIC CRIMSON KICK & SILVER SNARE HALATION FLARES
      // ─────────────────────────────────────────────────────────────
      const effectiveKick = Math.max(kickImpact, kickRollIntensity);
      const snarePower = beatState.snareImpact || beatState.snareStrobe;

      // 2A. Snare Hit: Blinding Silver-White / Diamond Anamorphic Lens Flare
      if (snarePower > 0.15 && isPlaying) {
        const snareWidth = Math.min(width, height) * (1.1 + snarePower * 0.45);
        const snareGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, snareWidth * 0.5);
        const snareAlpha = Math.min(0.92, 0.45 + snarePower * 0.50);

        snareGrad.addColorStop(0, `rgba(255, 255, 255, ${snareAlpha.toFixed(3)})`);
        snareGrad.addColorStop(0.30, `rgba(224, 231, 255, ${(snareAlpha * 0.7).toFixed(3)})`);
        snareGrad.addColorStop(0.65, `rgba(165, 180, 252, ${(snareAlpha * 0.25).toFixed(3)})`);
        snareGrad.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.scale(1.8, 0.45); // Sharp widescreen anamorphic streak
        ctx.fillStyle = snareGrad;
        ctx.beginPath();
        ctx.arc(0, 0, snareWidth * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 2B. Kick / 808 Hit: Volumetric Crimson Red Halation Streak
      if (effectiveKick > 0.04 && isPlaying) {
        const streakWidth = Math.min(width, height) * (0.85 + effectiveKick * 0.40);
        const halationGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, streakWidth * 0.5);
        const halationAlpha = Math.min(0.85, 0.35 + effectiveKick * 0.50);

        halationGrad.addColorStop(0, `rgba(239, 68, 68, ${halationAlpha.toFixed(3)})`);
        halationGrad.addColorStop(0.35, `rgba(220, 38, 38, ${(halationAlpha * 0.6).toFixed(3)})`);
        halationGrad.addColorStop(0.70, `rgba(127, 29, 29, ${(halationAlpha * 0.15).toFixed(3)})`);
        halationGrad.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.scale(1.4, 0.65); // Anamorphic widescreen stretch
        ctx.fillStyle = halationGrad;
        ctx.beginPath();
        ctx.arc(0, 0, streakWidth * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // ─────────────────────────────────────────────────────────────
      // 3. 35mm ANALOG FILM GRAIN OVERLAY
      // ─────────────────────────────────────────────────────────────
      ctx.globalCompositeOperation = "source-over";
      if (grainPattern) {
        ctx.fillStyle = grainPattern;
        ctx.fillRect(0, 0, width, height);
      }

      // ─────────────────────────────────────────────────────────────
      // 4. ZERO-JITTER GOTHIC OBSIDIAN CARD INERTIA DYNAMICS
      // ─────────────────────────────────────────────────────────────
      if (cardWrapperRef.current) {
        // Subtle micro punch
        const scale = 1.0 + kickImpact * 0.035 + kickRollIntensity * 0.025 + snarePower * 0.02;
        const tiltX = mousePos.current.y + Math.sin(t * 1.5) * 0.8;
        const tiltY = mousePos.current.x + Math.cos(t * 1.2) * 0.8;
        cardWrapperRef.current.style.transform = `scale(${scale.toFixed(3)}) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg)`;
      }

      // Dark Crimson Halation Backlight
      if (halationBacklightRef.current) {
        const halationPower = Math.min(1.0, subImpact * 0.6 + effectiveKick * 0.85 + snarePower * 0.5);
        halationBacklightRef.current.style.opacity = `${isPlaying ? halationPower.toFixed(2) : "0.15"}`;
        halationBacklightRef.current.style.transform = `scale(${1.0 + effectiveKick * 0.15 + snarePower * 0.10})`;
      }

      // Cold Gothic Metallic Specular Sweep
      if (gothicSheenRef.current) {
        const sheenX = (Math.sin(t * 1.8) * 60 + 50).toFixed(1);
        const sheenOpacity = Math.min(1.0, (beatState.vocalPresence * 0.70) + (snarePower * 0.95));
        gothicSheenRef.current.style.opacity = `${isPlaying ? sheenOpacity.toFixed(2) : "0"}`;
        gothicSheenRef.current.style.transform = `translateX(${sheenX}%) skewX(-25deg)`;
      }

      // Front Card Gothic Obsidian Border & Snare / Kick Strobe Shadow
      if (frontCardRef.current) {
        if (beatState.isSnareHit || snarePower > 0.4) {
          // Snare Strobe: Crisp Diamond Silver-White
          frontCardRef.current.style.borderColor = "rgba(255, 255, 255, 0.98)";
          frontCardRef.current.style.boxShadow =
            "0 35px 90px rgba(0, 0, 0, 0.98), 0 0 50px rgba(255, 255, 255, 0.85), inset 0 0 25px rgba(255, 255, 255, 0.4)";
        } else if (beatState.isKickRoll || effectiveKick > 0.4) {
          frontCardRef.current.style.borderColor = "rgba(239, 68, 68, 0.95)";
          frontCardRef.current.style.boxShadow =
            "0 35px 90px rgba(0, 0, 0, 0.98), 0 0 45px rgba(239, 68, 68, 0.85), inset 0 0 20px rgba(239, 68, 68, 0.35)";
        } else if (subImpact > 0.3) {
          frontCardRef.current.style.borderColor = "rgba(185, 28, 28, 0.80)";
          frontCardRef.current.style.boxShadow =
            "0 35px 90px rgba(0, 0, 0, 0.98), 0 0 35px rgba(185, 28, 28, 0.65)";
        } else {
          frontCardRef.current.style.borderColor = isPlaying ? "rgba(220, 38, 38, 0.45)" : "rgba(255, 255, 255, 0.18)";
          frontCardRef.current.style.boxShadow = "0 35px 90px rgba(0, 0, 0, 0.98), 0 0 25px rgba(153, 27, 27, 0.40)";
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
          1. VOLUMETRIC CANVAS (DARK GOTHIC SMOKE + CRIMSON HALATION + FILM GRAIN)
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
