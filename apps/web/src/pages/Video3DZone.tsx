import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAudioStore } from "../store/audioStore";
import * as THREE from "three";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  ArrowLeft,
  Sparkles,
  Film
} from "lucide-react";

interface Video3DZoneProps {
  onBackTo3DAlbum: () => void;
}

export const Video3DZone: React.FC<Video3DZoneProps> = ({ onBackTo3DAlbum }) => {
  const { currentTrack, queue, nextTrack, prevTrack } = useAudioStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesCanvasRef = useRef<HTMLCanvasElement>(null);

  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [ambilightColor, setAmbilightColor] = useState("rgba(99, 102, 241, 0.45)");
  const [showControls, setShowControls] = useState(true);

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Derive video URL
  const activeVideoUrl = currentTrack?.videoUrl || (currentTrack ? `https://media.postlain.com/videos/01.%20Elegie%20-%20MCK.mkv` : "");

  // Native Pure Three.js 60fps Ambient Particles System (Zero Bundle Overhead)
  useEffect(() => {
    const canvas = particlesCanvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: false,
      powerPreference: "high-performance"
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 15;

    const count = 3000;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const colorA = new THREE.Color("#6366f1");
    const colorB = new THREE.Color("#ec4899");

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const radius = 10 + Math.random() * 35;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      pos[i3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i3 + 2] = radius * Math.cos(phi) - 10;

      const mixed = colorA.clone().lerp(colorB, Math.random());
      col[i3] = mixed.r;
      col[i3 + 1] = mixed.g;
      col[i3 + 2] = mixed.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(col, 3));

    const material = new THREE.PointsMaterial({
      size: 0.12,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    let animId: number;
    const animate = () => {
      points.rotation.y += 0.001;
      points.rotation.x += 0.0005;
      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  // Real-time Ambilight extraction loop
  useEffect(() => {
    let animId: number;
    const extractAmbilight = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video && canvas && !video.paused && !video.ended && video.readyState >= 2) {
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (ctx) {
          ctx.drawImage(video, 0, 0, 16, 9);
          try {
            const frameData = ctx.getImageData(0, 0, 16, 9).data;
            let r = 0, g = 0, b = 0;
            const count = frameData.length / 4;
            for (let i = 0; i < frameData.length; i += 4) {
              r += frameData[i];
              g += frameData[i + 1];
              b += frameData[i + 2];
            }
            r = Math.round(r / count);
            g = Math.round(g / count);
            b = Math.round(b / count);
            setAmbilightColor(`rgba(${r}, ${g}, ${b}, 0.55)`);
          } catch {
            // fallback
          }
        }
      }
      animId = requestAnimationFrame(extractAmbilight);
    };

    animId = requestAnimationFrame(extractAmbilight);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Sync Video Controls
  const handleTogglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsVideoPlaying(true);
    } else {
      video.pause();
      setIsVideoPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (video) {
      setCurrentTime(video.currentTime);
      setDuration(video.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = parseFloat(e.target.value);
    const video = videoRef.current;
    if (video) {
      video.currentTime = target;
      setCurrentTime(target);
    }
  };

  const handleToggleMute = () => {
    const video = videoRef.current;
    if (video) {
      video.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      if (val === 0) {
        setIsMuted(true);
      } else if (isMuted) {
        setIsMuted(false);
      }
    }
  };

  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = Math.floor(secs % 60);
    return `${mins}:${remainder < 10 ? "0" : ""}${remainder}`;
  };

  // Auto-hide controls on inactivity
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isVideoPlaying) setShowControls(false);
    }, 3500);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      style={{
        position: "relative",
        width: "100vw",
        minHeight: "100dvh",
        backgroundColor: "#000000",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10
      }}
    >
      {/* Background Pure Three.js 60fps Particles Canvas */}
      <canvas
        ref={particlesCanvasRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
          pointerEvents: "none"
        }}
      />

      {/* Hidden Offscreen Canvas for Ambilight Extraction */}
      <canvas ref={canvasRef} width={16} height={9} style={{ display: "none" }} />

      {/* Dynamic Ambilight Backlight Halo */}
      <div
        style={{
          position: "absolute",
          width: "min(88vw, 1100px)",
          height: "min(55vw, 620px)",
          borderRadius: "32px",
          background: ambilightColor,
          filter: "blur(75px)",
          opacity: 0.85,
          zIndex: 1,
          transition: "background 0.35s ease-out",
          pointerEvents: "none"
        }}
      />

      {/* Top Header Bar */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              padding: "24px 32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              zIndex: 30,
              background: "linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, transparent 100%)"
            }}
          >
            {/* Back Button */}
            <button
              onClick={onBackTo3DAlbum}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 20px",
                borderRadius: "999px",
                backgroundColor: "rgba(255, 255, 255, 0.08)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                color: "#ffffff",
                fontSize: "0.88rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
            >
              <ArrowLeft size={16} />
              Quay lại 3D Album
            </button>

            {/* Video Badges */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 14px",
                  borderRadius: "999px",
                  backgroundColor: "rgba(99, 102, 241, 0.2)",
                  border: "1px solid rgba(99, 102, 241, 0.4)",
                  color: "#a5b4fc",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  letterSpacing: "0.08em"
                }}
              >
                <Film size={13} />
                4K MASTER MKV
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 14px",
                  borderRadius: "999px",
                  backgroundColor: "rgba(236, 72, 153, 0.2)",
                  border: "1px solid rgba(236, 72, 153, 0.4)",
                  color: "#f472b6",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  letterSpacing: "0.08em"
                }}
              >
                <Sparkles size={13} />
                AMBILIGHT 60FPS
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main 3D Cinema Video Screen Container */}
      <motion.div
        initial={{ scale: 0.94, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: "relative",
          width: "min(88vw, 1100px)",
          aspectRatio: "16 / 9",
          borderRadius: "24px",
          overflow: "hidden",
          backgroundColor: "#050505",
          boxShadow: `0 0 60px ${ambilightColor}, 0 24px 60px rgba(0,0,0,0.9)`,
          border: "1px solid rgba(255, 255, 255, 0.12)",
          zIndex: 20
        }}
      >
        {/* Custom Clean HTML5 Video Element (100% Zero YouTube Branding) */}
        <video
          ref={videoRef}
          src={activeVideoUrl}
          playsInline
          autoPlay
          onTimeUpdate={handleTimeUpdate}
          onEnded={nextTrack}
          onClick={handleTogglePlay}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            cursor: "pointer"
          }}
        />

        {/* Center Big Play/Pause Splash Icon on Click */}
        {!isVideoPlaying && (
          <div
            onClick={handleTogglePlay}
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(0,0,0,0.45)",
              backdropFilter: "blur(8px)",
              cursor: "pointer"
            }}
          >
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                backgroundColor: "rgba(255, 255, 255, 0.18)",
                backdropFilter: "blur(24px)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff"
              }}
            >
              <Play size={36} style={{ marginLeft: "4px" }} />
            </div>
          </div>
        )}

        {/* Bespoke Liquid Frosted Glass Video Controls Dock */}
        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                padding: "24px 28px 20px",
                background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.6) 60%, transparent 100%)",
                display: "flex",
                flexDirection: "column",
                gap: "14px",
                zIndex: 40
              }}
            >
              {/* Timeline Scrubber */}
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.8rem", fontFamily: "monospace", minWidth: "40px" }}>
                  {formatTime(currentTime)}
                </span>
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  style={{
                    flex: 1,
                    height: "4px",
                    borderRadius: "999px",
                    accentColor: "#6366f1",
                    cursor: "pointer"
                  }}
                />
                <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.8rem", fontFamily: "monospace", minWidth: "40px" }}>
                  {formatTime(duration)}
                </span>
              </div>

              {/* Bottom Row Controls */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                {/* Track Info */}
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ color: "#ffffff", fontWeight: 700, fontSize: "1.05rem" }}>
                    {currentTrack?.title || "MCK Music Video"}
                  </span>
                  <span style={{ color: "rgba(255, 255, 255, 0.55)", fontSize: "0.82rem" }}>
                    {currentTrack?.artist || "MCK"} • {currentTrack?.album || "HVL"}
                  </span>
                </div>

                {/* Media Playback Buttons */}
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <button
                    onClick={prevTrack}
                    style={{
                      background: "none",
                      border: "none",
                      color: "rgba(255,255,255,0.8)",
                      cursor: "pointer"
                    }}
                  >
                    <SkipBack size={20} />
                  </button>
                  <button
                    onClick={handleTogglePlay}
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "50%",
                      backgroundColor: "#ffffff",
                      color: "#000000",
                      border: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer"
                    }}
                  >
                    {isVideoPlaying ? <Pause size={20} /> : <Play size={20} style={{ marginLeft: "2px" }} />}
                  </button>
                  <button
                    onClick={nextTrack}
                    style={{
                      background: "none",
                      border: "none",
                      color: "rgba(255,255,255,0.8)",
                      cursor: "pointer"
                    }}
                  >
                    <SkipForward size={20} />
                  </button>
                </div>

                {/* Volume & Fullscreen Actions */}
                <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
                  {/* Volume Slider */}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <button
                      onClick={handleToggleMute}
                      style={{ background: "none", border: "none", color: "#ffffff", cursor: "pointer" }}
                    >
                      {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                    </button>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      style={{ width: "70px", height: "3px", accentColor: "#ffffff", cursor: "pointer" }}
                    />
                  </div>

                  {/* Fullscreen Button */}
                  <button
                    onClick={handleToggleFullscreen}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#ffffff",
                      cursor: "pointer"
                    }}
                  >
                    {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Video3DZone;
