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

    // Visible Monochrome Fluid Aurora Orbs (20%-30% contrast on deep black)
    const orbs = [
      { x: width * 0.2, y: height * 0.25, vx: 0.35, vy: 0.25, radius: width * 0.45, alpha: 0.22 },
      { x: width * 0.8, y: height * 0.35, vx: -0.3, vy: 0.3, radius: width * 0.5, alpha: 0.18 },
      { x: width * 0.5, y: height * 0.8, vx: 0.25, vy: -0.25, radius: width * 0.55, alpha: 0.20 },
      { x: width * 0.15, y: height * 0.85, vx: -0.2, vy: -0.2, radius: width * 0.4, alpha: 0.15 }
    ];

    let t = 0;

    const render = () => {
      t += 0.005;

      // Base black
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, width, height);

      // Render flowing monochrome silver-white gradient light
      orbs.forEach((orb, i) => {
        orb.x += orb.vx + Math.sin(t * 1.2 + i) * 0.6;
        orb.y += orb.vy + Math.cos(t * 1.1 + i * 1.3) * 0.6;

        if (orb.x < -orb.radius * 0.2) orb.vx = Math.abs(orb.vx);
        if (orb.x > width + orb.radius * 0.2) orb.vx = -Math.abs(orb.vx);
        if (orb.y < -orb.radius * 0.2) orb.vy = Math.abs(orb.vy);
        if (orb.y > height + orb.radius * 0.2) orb.vy = -Math.abs(orb.vy);

        const gradient = ctx.createRadialGradient(
          orb.x,
          orb.y,
          0,
          orb.x,
          orb.y,
          orb.radius
        );

        gradient.addColorStop(0, `rgba(255, 255, 255, ${orb.alpha})`);
        gradient.addColorStop(0.4, `rgba(180, 190, 205, ${orb.alpha * 0.6})`);
        gradient.addColorStop(0.7, `rgba(100, 110, 125, ${orb.alpha * 0.25})`);
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
