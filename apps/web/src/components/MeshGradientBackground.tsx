import React, { useEffect, useRef } from "react";

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

    // Subtle monochrome light orbs (20% gray/white on pure black)
    const orbs = [
      { x: width * 0.25, y: height * 0.3, vx: 0.2, vy: 0.15, radius: width * 0.45, alpha: 0.04 },
      { x: width * 0.75, y: height * 0.4, vx: -0.15, vy: 0.2, radius: width * 0.5, alpha: 0.03 },
      { x: width * 0.5, y: height * 0.8, vx: 0.18, vy: -0.15, radius: width * 0.55, alpha: 0.035 }
    ];

    let t = 0;

    const render = () => {
      t += 0.003;
      // Pure deep black base
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, width, height);

      // Render subtle soft monochrome light
      orbs.forEach((orb, i) => {
        orb.x += orb.vx + Math.sin(t + i) * 0.3;
        orb.y += orb.vy + Math.cos(t + i * 1.1) * 0.3;

        if (orb.x < -orb.radius * 0.3) orb.vx = Math.abs(orb.vx);
        if (orb.x > width + orb.radius * 0.3) orb.vx = -Math.abs(orb.vx);
        if (orb.y < -orb.radius * 0.3) orb.vy = Math.abs(orb.vy);
        if (orb.y > height + orb.radius * 0.3) orb.vy = -Math.abs(orb.vy);

        const gradient = ctx.createRadialGradient(
          orb.x,
          orb.y,
          0,
          orb.x,
          orb.y,
          orb.radius
        );

        gradient.addColorStop(0, `rgba(255, 255, 255, ${orb.alpha})`);
        gradient.addColorStop(0.5, `rgba(180, 180, 180, ${orb.alpha * 0.5})`);
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
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
