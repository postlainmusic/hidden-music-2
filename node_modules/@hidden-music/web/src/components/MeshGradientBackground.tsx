import React, { useEffect, useRef } from "react";
import { useAudioStore } from "../store/audioStore";

export const MeshGradientBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const currentTrack = useAudioStore((state) => state.currentTrack);
  const isPlaying = useAudioStore((state) => state.isPlaying);
  const getFrequencyData = useAudioStore((state) => state.getFrequencyData);

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

    // Dynamic floating gradient orbs
    const orbs = [
      { x: width * 0.2, y: height * 0.25, vx: 0.4, vy: 0.3, radius: width * 0.4, color: currentTrack?.palette.primary || "#6366f1" },
      { x: width * 0.8, y: height * 0.3, vx: -0.3, vy: 0.4, radius: width * 0.45, color: currentTrack?.palette.secondary || "#ec4899" },
      { x: width * 0.5, y: height * 0.8, vx: 0.35, vy: -0.3, radius: width * 0.5, color: currentTrack?.palette.accent || "#8b5cf6" },
      { x: width * 0.15, y: height * 0.85, vx: -0.25, vy: -0.2, radius: width * 0.35, color: currentTrack?.palette.primary || "#06b6d4" }
    ];

    let t = 0;

    const render = () => {
      t += 0.006;
      ctx.fillStyle = "#08090d";
      ctx.fillRect(0, 0, width, height);

      // Get audio frequency kick to pulse orbs with music rhythm
      const freqData = isPlaying ? getFrequencyData() : new Uint8Array(32);
      const bassEnergy = freqData.length > 0 ? (freqData[1] + freqData[2] + freqData[3]) / (3 * 255) : 0;

      // Update palette colors dynamically
      if (currentTrack) {
        orbs[0].color = currentTrack.palette.primary;
        orbs[1].color = currentTrack.palette.secondary;
        orbs[2].color = currentTrack.palette.accent;
        orbs[3].color = currentTrack.palette.primary;
      }

      // Draw and move orbs
      orbs.forEach((orb, i) => {
        orb.x += orb.vx * (1 + bassEnergy * 1.5) + Math.sin(t + i) * 0.5;
        orb.y += orb.vy * (1 + bassEnergy * 1.5) + Math.cos(t + i * 1.2) * 0.5;

        // Bounce off bounds
        if (orb.x < -width * 0.2 || orb.x > width * 1.2) orb.vx *= -1;
        if (orb.y < -height * 0.2 || orb.y > height * 1.2) orb.vy *= -1;

        const pulseRadius = orb.radius * (1 + bassEnergy * 0.15 + Math.sin(t * 2 + i) * 0.05);

        const gradient = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, pulseRadius);
        gradient.addColorStop(0, orb.color + "99"); // 60% opacity center
        gradient.addColorStop(0.5, orb.color + "33"); // 20% opacity mid
        gradient.addColorStop(1, "transparent");

        ctx.globalCompositeOperation = "screen";
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, pulseRadius, 0, Math.PI * 2);
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
  }, [currentTrack, isPlaying, getFrequencyData]);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
      {/* Mesh Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          filter: "blur(60px)",
          transform: "scale(1.1)",
          opacity: 0.78,
          transition: "filter 0.5s ease"
        }}
      />

      {/* Apple Subtle Noise Grain Texture */}
      <svg
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          opacity: 0.035,
          mixBlendMode: "overlay",
          pointerEvents: "none"
        }}
      >
        <filter id="noiseFilter">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noiseFilter)" />
      </svg>

      {/* Dark Vignette Overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at center, transparent 30%, rgba(8, 9, 13, 0.75) 100%)"
        }}
      />
    </div>
  );
};
