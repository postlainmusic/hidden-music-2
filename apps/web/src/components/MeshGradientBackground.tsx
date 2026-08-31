import React, { useEffect, useRef } from "react";
import { studioBeatEngine } from "../audio/StudioBeatEngine";
import { dualDeckAudioEngine } from "../audio/DualDeckAudioEngine";

export interface RGBColor {
  r: number;
  g: number;
  b: number;
}

export interface MeshGradientBackgroundProps {
  customColors?: RGBColor[];
  dominantHex?: string;
  intensity?: number;
}

// Convert Hex to RGB
function hexToRgb(hex: string): RGBColor {
  let clean = hex.replace("#", "");
  if (clean.length === 3) {
    clean = clean.split("").map((c) => c + c).join("");
  }
  const num = parseInt(clean, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

export const MeshGradientBackground: React.FC<MeshGradientBackgroundProps> = ({
  customColors,
  dominantHex,
  intensity = 1.0
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const targetColorsRef = useRef<RGBColor[]>([]);
  const currentColorsRef = useRef<RGBColor[]>([
    { r: 255, g: 255, b: 255 },
    { r: 200, g: 210, b: 230 },
    { r: 120, g: 130, b: 150 },
    { r: 80, g: 90, b: 110 }
  ]);

  // Update target colors when props change
  useEffect(() => {
    if (customColors && customColors.length > 0) {
      targetColorsRef.current = customColors;
    } else if (dominantHex) {
      const rgb = hexToRgb(dominantHex);
      targetColorsRef.current = [
        rgb,
        { r: Math.max(0, rgb.r - 40), g: Math.max(0, rgb.g - 40), b: Math.min(255, rgb.b + 50) },
        { r: Math.min(255, rgb.r + 40), g: Math.max(0, rgb.g - 20), b: Math.max(0, rgb.b - 30) },
        { r: Math.max(0, rgb.r - 60), g: Math.min(255, rgb.g + 30), b: Math.max(0, rgb.b - 50) }
      ];
    } else {
      targetColorsRef.current = [
        { r: 255, g: 255, b: 255 },
        { r: 200, g: 210, b: 225 },
        { r: 110, g: 120, b: 135 },
        { r: 60, g: 65, b: 75 }
      ];
    }
  }, [customColors, dominantHex]);

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

    // Visible Fluid Aurora Orbs
    const orbs = [
      { x: width * 0.2, y: height * 0.25, vx: 0.35, vy: 0.25, baseRadius: width * 0.45, baseAlpha: 0.28 },
      { x: width * 0.8, y: height * 0.35, vx: -0.3, vy: 0.3, baseRadius: width * 0.5, baseAlpha: 0.24 },
      { x: width * 0.5, y: height * 0.8, vx: 0.25, vy: -0.25, baseRadius: width * 0.55, baseAlpha: 0.26 },
      { x: width * 0.15, y: height * 0.85, vx: -0.2, vy: -0.2, baseRadius: width * 0.4, baseAlpha: 0.20 }
    ];

    let t = 0;

    const render = () => {
      const audio = dualDeckAudioEngine.getActiveAudio();
      const isPlaying = audio && !audio.paused && !audio.ended;
      const beatState = studioBeatEngine.getBeatState();

      const subImpact = isPlaying ? beatState.subImpact : 0;
      const kickImpact = isPlaying ? Math.max(beatState.kickImpact, beatState.kickRollIntensity) : 0;
      const snareImpact = isPlaying ? beatState.snareImpact || beatState.snareStrobe : 0;

      // Audio-reactive fluid flow velocity
      const speedMultiplier = (1.0 + kickImpact * 1.5 + subImpact * 0.6) * intensity;
      t += 0.005 * speedMultiplier;

      // Smooth color lerp (interpolation) towards target palette
      const targets = targetColorsRef.current;
      if (targets.length > 0) {
        for (let i = 0; i < 4; i++) {
          const target = targets[i % targets.length];
          const curr = currentColorsRef.current[i] || { r: 255, g: 255, b: 255 };
          curr.r += (target.r - curr.r) * 0.05;
          curr.g += (target.g - curr.g) * 0.05;
          curr.b += (target.b - curr.b) * 0.05;
          currentColorsRef.current[i] = curr;
        }
      }

      // Base deep black
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, width, height);

      // Render flowing fluid mesh gradients with dynamic reactive colors
      orbs.forEach((orb, i) => {
        orb.x += (orb.vx + Math.sin(t * 1.2 + i) * 0.6) * speedMultiplier;
        orb.y += (orb.vy + Math.cos(t * 1.1 + i * 1.3) * 0.6) * speedMultiplier;

        if (orb.x < -orb.baseRadius * 0.3) orb.vx = Math.abs(orb.vx);
        if (orb.x > width + orb.baseRadius * 0.3) orb.vx = -Math.abs(orb.vx);
        if (orb.y < -orb.baseRadius * 0.3) orb.vy = Math.abs(orb.vy);
        if (orb.y > height + orb.baseRadius * 0.3) orb.vy = -Math.abs(orb.vy);

        // Audio-reactive radius breathing and brightness modulation
        const dynamicRadius = orb.baseRadius * (1.0 + subImpact * 0.35 + kickImpact * 0.20 + snareImpact * 0.15);
        const dynamicAlpha = Math.min(0.65, orb.baseAlpha * intensity * (1.0 + kickImpact * 0.60 + snareImpact * 0.50 + subImpact * 0.30));

        const gradient = ctx.createRadialGradient(
          orb.x,
          orb.y,
          0,
          orb.x,
          orb.y,
          dynamicRadius
        );

        const c = currentColorsRef.current[i] || { r: 255, g: 255, b: 255 };
        const cr = Math.round(c.r);
        const cg = Math.round(c.g);
        const cb = Math.round(c.b);

        gradient.addColorStop(0, `rgba(${cr}, ${cg}, ${cb}, ${dynamicAlpha.toFixed(3)})`);
        gradient.addColorStop(0.4, `rgba(${Math.round(cr * 0.8)}, ${Math.round(cg * 0.8)}, ${Math.round(cb * 0.9)}, ${(dynamicAlpha * 0.65).toFixed(3)})`);
        gradient.addColorStop(0.75, `rgba(${Math.round(cr * 0.4)}, ${Math.round(cg * 0.4)}, ${Math.round(cb * 0.5)}, ${(dynamicAlpha * 0.25).toFixed(3)})`);
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, dynamicRadius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Snare Hit: Pure Shimmer Streak
      if (snareImpact > 0.20 && isPlaying) {
        ctx.save();
        ctx.translate(width * 0.5, height * 0.5);
        const shimmerGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, width * 0.7);
        const shimmerAlpha = Math.min(0.35, snareImpact * 0.30 * intensity);
        const c0 = currentColorsRef.current[0] || { r: 255, g: 255, b: 255 };
        shimmerGrad.addColorStop(0, `rgba(${Math.round(c0.r)}, ${Math.round(c0.g)}, ${Math.round(c0.b)}, ${shimmerAlpha.toFixed(3)})`);
        shimmerGrad.addColorStop(0.5, `rgba(${Math.round(c0.r * 0.8)}, ${Math.round(c0.g * 0.8)}, ${Math.round(c0.b * 0.9)}, ${(shimmerAlpha * 0.4).toFixed(3)})`);
        shimmerGrad.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.fillStyle = shimmerGrad;
        ctx.beginPath();
        ctx.arc(0, 0, width * 0.7, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [intensity]);

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
