import React, { useEffect, useRef } from "react";
import { useAudioStore } from "../store/audioStore";
import { audioAnalyserEngine } from "../audio/AudioAnalyserEngine";

const hexToRgb = (hex?: string): { r: number; g: number; b: number } => {
  if (!hex || !hex.startsWith("#")) {
    return { r: 160, g: 175, b: 220 }; // Fallback elegant silver indigo
  }
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
  return { r: 160, g: 175, b: 220 };
};

export const MeshGradientBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { currentTrack, isPlaying } = useAudioStore();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    // 4 Fluid Luminous Aurora Orbs
    const orbs = [
      { x: width * 0.25, y: height * 0.25, vx: 0.35, vy: 0.25, radius: width * 0.45, alpha: 0.28, hex: currentTrack?.palette.primary || "#6366f1" },
      { x: width * 0.75, y: height * 0.35, vx: -0.3, vy: 0.3, radius: width * 0.5, alpha: 0.24, hex: currentTrack?.palette.secondary || "#ec4899" },
      { x: width * 0.5, y: height * 0.8, vx: 0.25, vy: -0.25, radius: width * 0.55, alpha: 0.26, hex: currentTrack?.palette.accent || "#8b5cf6" },
      { x: width * 0.15, y: height * 0.85, vx: -0.2, vy: -0.2, radius: width * 0.4, alpha: 0.22, hex: currentTrack?.palette.primary || "#06b6d4" }
    ];

    let t = 0;

    const render = () => {
      t += 0.006;

      // Base deep obsidian
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, width, height);

      const bands = audioAnalyserEngine.getBands();
      const beatBoost = isPlaying ? bands.kick * 0.3 + bands.subBass * 0.2 : 0;

      // Update palette
      if (currentTrack) {
        orbs[0].hex = currentTrack.palette.primary;
        orbs[1].hex = currentTrack.palette.secondary;
        orbs[2].hex = currentTrack.palette.accent;
        orbs[3].hex = currentTrack.palette.primary;
      }

      ctx.globalCompositeOperation = "screen";

      // Render flowing gradient light
      orbs.forEach((orb, i) => {
        orb.x += orb.vx * (1 + beatBoost * 1.5) + Math.sin(t * 1.2 + i) * 0.7;
        orb.y += orb.vy * (1 + beatBoost * 1.5) + Math.cos(t * 1.1 + i * 1.3) * 0.7;

        if (orb.x < -orb.radius * 0.2) orb.vx = Math.abs(orb.vx);
        if (orb.x > width + orb.radius * 0.2) orb.vx = -Math.abs(orb.vx);
        if (orb.y < -orb.radius * 0.2) orb.vy = Math.abs(orb.vy);
        if (orb.y > height + orb.radius * 0.2) orb.vy = -Math.abs(orb.vy);

        const currentRadius = orb.radius * (1 + beatBoost * 0.2 + Math.sin(t * 2 + i) * 0.04);
        const rgb = hexToRgb(orb.hex);
        const dynamicAlpha = isPlaying ? orb.alpha * (1 + beatBoost * 0.8) : orb.alpha;

        const gradient = ctx.createRadialGradient(
          orb.x,
          orb.y,
          0,
          orb.x,
          orb.y,
          currentRadius
        );

        gradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${Math.min(1.0, dynamicAlpha)})`);
        gradient.addColorStop(0.45, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${Math.min(1.0, dynamicAlpha * 0.45)})`);
        gradient.addColorStop(0.8, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${Math.min(1.0, dynamicAlpha * 0.12)})`);
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, currentRadius, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalCompositeOperation = "source-over";

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [currentTrack, isPlaying]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0
      }}
    />
  );
};
