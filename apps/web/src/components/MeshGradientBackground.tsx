import React, { useEffect, useRef } from "react";
import { studioBeatEngine } from "../audio/StudioBeatEngine";
import { dualDeckAudioEngine } from "../audio/DualDeckAudioEngine";

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

    // Visible Monochrome Fluid Aurora Orbs (Pure Silver, Deep Charcoal & Liquid White)
    const orbs = [
      { x: width * 0.2, y: height * 0.25, vx: 0.35, vy: 0.25, baseRadius: width * 0.45, baseAlpha: 0.24 },
      { x: width * 0.8, y: height * 0.35, vx: -0.3, vy: 0.3, baseRadius: width * 0.5, baseAlpha: 0.20 },
      { x: width * 0.5, y: height * 0.8, vx: 0.25, vy: -0.25, baseRadius: width * 0.55, baseAlpha: 0.22 },
      { x: width * 0.15, y: height * 0.85, vx: -0.2, vy: -0.2, baseRadius: width * 0.4, baseAlpha: 0.16 }
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
      const speedMultiplier = 1.0 + kickImpact * 1.5 + subImpact * 0.6;
      t += 0.005 * speedMultiplier;

      // Base deep black
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, width, height);

      // Render flowing monochrome silver-white gradient light (No RGB color tint)
      orbs.forEach((orb, i) => {
        orb.x += (orb.vx + Math.sin(t * 1.2 + i) * 0.6) * speedMultiplier;
        orb.y += (orb.vy + Math.cos(t * 1.1 + i * 1.3) * 0.6) * speedMultiplier;

        if (orb.x < -orb.baseRadius * 0.3) orb.vx = Math.abs(orb.vx);
        if (orb.x > width + orb.baseRadius * 0.3) orb.vx = -Math.abs(orb.vx);
        if (orb.y < -orb.baseRadius * 0.3) orb.vy = Math.abs(orb.vy);
        if (orb.y > height + orb.baseRadius * 0.3) orb.vy = -Math.abs(orb.vy);

        // Audio-reactive radius breathing and brightness modulation
        const dynamicRadius = orb.baseRadius * (1.0 + subImpact * 0.35 + kickImpact * 0.20 + snareImpact * 0.15);
        const dynamicAlpha = Math.min(0.55, orb.baseAlpha * (1.0 + kickImpact * 0.60 + snareImpact * 0.50 + subImpact * 0.30));

        const gradient = ctx.createRadialGradient(
          orb.x,
          orb.y,
          0,
          orb.x,
          orb.y,
          dynamicRadius
        );

        // Pure Monochrome Silver-White Gradient
        gradient.addColorStop(0, `rgba(255, 255, 255, ${dynamicAlpha.toFixed(3)})`);
        gradient.addColorStop(0.35, `rgba(200, 210, 225, ${(dynamicAlpha * 0.65).toFixed(3)})`);
        gradient.addColorStop(0.70, `rgba(110, 120, 135, ${(dynamicAlpha * 0.25).toFixed(3)})`);
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, dynamicRadius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Snare Hit: Pure Diamond / Silver Monochrome Shimmer Streak
      if (snareImpact > 0.20 && isPlaying) {
        ctx.save();
        ctx.translate(width * 0.5, height * 0.5);
        const shimmerGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, width * 0.7);
        const shimmerAlpha = Math.min(0.28, snareImpact * 0.30);
        shimmerGrad.addColorStop(0, `rgba(255, 255, 255, ${shimmerAlpha.toFixed(3)})`);
        shimmerGrad.addColorStop(0.5, `rgba(220, 230, 245, ${(shimmerAlpha * 0.4).toFixed(3)})`);
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
