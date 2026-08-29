import React, { useEffect, useRef } from "react";
import { useAudioStore } from "../store/audioStore";
import { audioAnalyserEngine } from "../audio/AudioAnalyserEngine";

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

    // 4 Dynamic Floating Ambient Orbs
    const orbs = [
      { x: width * 0.25, y: height * 0.3, vx: 0.4, vy: 0.3, radius: width * 0.45, color: currentTrack?.palette.primary || "#6366f1" },
      { x: width * 0.75, y: height * 0.35, vx: -0.35, vy: 0.35, radius: width * 0.5, color: currentTrack?.palette.secondary || "#ec4899" },
      { x: width * 0.5, y: height * 0.75, vx: 0.3, vy: -0.3, radius: width * 0.55, color: currentTrack?.palette.accent || "#8b5cf6" },
      { x: width * 0.2, y: height * 0.8, vx: -0.25, vy: -0.25, radius: width * 0.4, color: currentTrack?.palette.primary || "#06b6d4" }
    ];

    let t = 0;

    const render = () => {
      t += 0.008;

      // Pure deep obsidian canvas
      ctx.fillStyle = "#050508";
      ctx.fillRect(0, 0, width, height);

      const bands = audioAnalyserEngine.getBands();
      const beatBoost = isPlaying ? bands.kick * 0.35 + bands.subBass * 0.25 : 0;

      // Update palette colors dynamically
      if (currentTrack) {
        orbs[0].color = currentTrack.palette.primary;
        orbs[1].color = currentTrack.palette.secondary;
        orbs[2].color = currentTrack.palette.accent;
        orbs[3].color = currentTrack.palette.glow;
      }

      ctx.globalCompositeOperation = "screen";

      // Render dynamic fluid ambient light orbs
      orbs.forEach((orb, i) => {
        orb.x += orb.vx * (1 + beatBoost * 1.5) + Math.sin(t + i * 1.5) * 0.8;
        orb.y += orb.vy * (1 + beatBoost * 1.5) + Math.cos(t + i * 1.2) * 0.8;

        if (orb.x < -orb.radius * 0.3) orb.vx = Math.abs(orb.vx);
        if (orb.x > width + orb.radius * 0.3) orb.vx = -Math.abs(orb.vx);
        if (orb.y < -orb.radius * 0.3) orb.vy = Math.abs(orb.vy);
        if (orb.y > height + orb.radius * 0.3) orb.vy = -Math.abs(orb.vy);

        const currentRadius = orb.radius * (1 + beatBoost * 0.25 + Math.sin(t * 2 + i) * 0.05);

        const gradient = ctx.createRadialGradient(
          orb.x,
          orb.y,
          0,
          orb.x,
          orb.y,
          currentRadius
        );

        const alpha = isPlaying ? 0.32 + beatBoost * 0.25 : 0.18;
        gradient.addColorStop(0, orb.color + Math.floor(alpha * 255).toString(16).padStart(2, "0"));
        gradient.addColorStop(0.5, orb.color + Math.floor(alpha * 0.4 * 255).toString(16).padStart(2, "0"));
        gradient.addColorStop(1, "transparent");

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
    <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          filter: "blur(50px)",
          transform: "scale(1.08)",
          opacity: 0.95,
        }}
      />
    </div>
  );
};
