import React, { useEffect, useRef } from "react";
import { studioBeatEngine } from "../audio/StudioBeatEngine";
import { useAudioStore } from "../store/audioStore";

const hexToRgb = (hex?: string): { r: number; g: number; b: number } => {
  if (!hex || !hex.startsWith("#")) return { r: 99, g: 102, b: 241 };
  const clean = hex.replace("#", "");
  if (clean.length === 3) {
    return {
      r: parseInt(clean[0] + clean[0], 16),
      g: parseInt(clean[1] + clean[1], 16),
      b: parseInt(clean[2] + clean[2], 16)
    };
  }
  if (clean.length >= 6) {
    return {
      r: parseInt(clean.substring(0, 2), 16),
      g: parseInt(clean.substring(2, 4), 16),
      b: parseInt(clean.substring(4, 6), 16)
    };
  }
  return { r: 99, g: 102, b: 241 };
};

export const MeshGradientBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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

    // Dynamic Multi-Chromatic Nebula Fluid Orbs
    const orbs = [
      { x: width * 0.25, y: height * 0.30, vx: 0.28, vy: 0.22, baseRadius: width * 0.42, role: "primary" },
      { x: width * 0.75, y: height * 0.35, vx: -0.25, vy: 0.26, baseRadius: width * 0.48, role: "secondary" },
      { x: width * 0.50, y: height * 0.75, vx: 0.22, vy: -0.22, baseRadius: width * 0.52, role: "accent" },
      { x: width * 0.20, y: height * 0.80, vx: -0.18, vy: -0.20, baseRadius: width * 0.38, role: "vocal" }
    ];

    let t = 0;
    let smoothEnergy = 0.15;

    const render = () => {
      t += 0.006;

      const beat = studioBeatEngine.getBeatState();
      const currentTrack = useAudioStore.getState().currentTrack;
      const palette = currentTrack?.palette;

      const colorPrimary = hexToRgb(palette?.primary || "#6366f1");
      const colorSecondary = hexToRgb(palette?.secondary || "#a855f7");
      const colorAccent = hexToRgb(palette?.accent || "#ec4899");

      // Dynamic Audio Energy Inflation
      smoothEnergy += (beat.overallEnergy - smoothEnergy) * 0.12;
      const bassBoost = beat.subBass * 0.45 + beat.kickImpact * 0.35;
      const vocalBloom = beat.vocalPresence * 0.25;

      // Base Deep Cinematic Dark
      ctx.fillStyle = "#05060a";
      ctx.fillRect(0, 0, width, height);

      // Render Dynamic Nebula Fluid Orbs
      orbs.forEach((orb, i) => {
        const speedMultiplier = 1.0 + smoothEnergy * 1.5;
        orb.x += (orb.vx + Math.sin(t * 1.2 + i * 1.5) * 0.7) * speedMultiplier;
        orb.y += (orb.vy + Math.cos(t * 1.1 + i * 1.3) * 0.7) * speedMultiplier;

        if (orb.x < -orb.baseRadius * 0.3) orb.vx = Math.abs(orb.vx);
        if (orb.x > width + orb.baseRadius * 0.3) orb.vx = -Math.abs(orb.vx);
        if (orb.y < -orb.baseRadius * 0.3) orb.vy = Math.abs(orb.vy);
        if (orb.y > height + orb.baseRadius * 0.3) orb.vy = -Math.abs(orb.vy);

        let rgb = colorPrimary;
        let alphaBase = 0.18;

        if (orb.role === "secondary") {
          rgb = colorSecondary;
          alphaBase = 0.16;
        } else if (orb.role === "accent") {
          rgb = colorAccent;
          alphaBase = 0.15;
        } else if (orb.role === "vocal") {
          rgb = { r: 56, g: 189, b: 248 }; // Cyan shimmer
          alphaBase = 0.12 + vocalBloom * 0.18;
        }

        const dynamicRadius = orb.baseRadius * (1.0 + bassBoost * 0.35 + Math.sin(t * 2 + i) * 0.05);
        const dynamicAlpha = Math.min(0.55, alphaBase + bassBoost * 0.22 + smoothEnergy * 0.15);

        const gradient = ctx.createRadialGradient(
          orb.x,
          orb.y,
          0,
          orb.x,
          orb.y,
          dynamicRadius
        );

        gradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${dynamicAlpha.toFixed(3)})`);
        gradient.addColorStop(0.35, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${(dynamicAlpha * 0.55).toFixed(3)})`);
        gradient.addColorStop(0.70, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${(dynamicAlpha * 0.18).toFixed(3)})`);
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, dynamicRadius, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

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

export default MeshGradientBackground;
