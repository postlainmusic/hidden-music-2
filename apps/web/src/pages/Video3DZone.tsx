import React, { useEffect, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAudioStore, Track } from "../store/audioStore";
import { dualDeckAudioEngine } from "../audio/DualDeckAudioEngine";
import { useIsMobile } from "../hooks/useIsMobile";
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
  ListMusic,
  Loader2,
  X
} from "lucide-react";

interface Video3DZoneProps {
  onBackTo3DAlbum: () => void;
}

export const Video3DZone: React.FC<Video3DZoneProps> = ({ onBackTo3DAlbum }) => {
  const { currentTrack, queue } = useAudioStore();
  const isMobile = useIsMobile();

  // Local Video Track State (Completely decoupled from Audio FLAC streaming)
  const [selectedVideoTrack, setSelectedVideoTrack] = useState<Track>(() => currentTrack || queue[0]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesCanvasRef = useRef<HTMLCanvasElement>(null);

  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [isVideoBuffering, setIsVideoBuffering] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [ambilightColor, setAmbilightColor] = useState("rgba(99, 102, 241, 0.45)");
  const [showControls, setShowControls] = useState(true);
  const [isQueueOpen, setIsQueueOpen] = useState(false);

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 1. STRICT ISOLATION: Silence Background Audio Engine completely on Mount
  useEffect(() => {
    dualDeckAudioEngine.pause();

    return () => {
      if (videoRef.current) {
        try {
          videoRef.current.pause();
        } catch {}
      }
    };
  }, []);

  // Derive Video URL with safe URL encoding
  const activeVideoUrl = useMemo(() => {
    if (selectedVideoTrack?.videoUrl) return selectedVideoTrack.videoUrl;
    if (selectedVideoTrack?.title) {
      return `https://media.postlain.com/videos/${encodeURIComponent(selectedVideoTrack.title)}%20-%20MCK.mkv`;
    }
    return `https://media.postlain.com/videos/01.%20Elegie%20-%20MCK.mkv`;
  }, [selectedVideoTrack]);

  // Handle Video Selection from Queue (ZERO FLAC DOWNLOAD)
  const handleSelectVideo = (track: Track) => {
    setSelectedVideoTrack(track);
    useAudioStore.setState({ currentTrack: track });
    dualDeckAudioEngine.pause();
    setIsVideoBuffering(false);
    if (videoRef.current) {
      videoRef.current.src = track.videoUrl || `https://media.postlain.com/videos/${encodeURIComponent(track.title)}%20-%20MCK.mkv`;
      videoRef.current.play().catch(() => {});
    }
    if (isMobile) setIsQueueOpen(false);
  };

  const handleNextVideo = () => {
    const currentIndex = queue.findIndex((t) => t.id === selectedVideoTrack.id);
    const nextIndex = (currentIndex + 1) % queue.length;
    handleSelectVideo(queue[nextIndex]);
  };

  const handlePrevVideo = () => {
    const currentIndex = queue.findIndex((t) => t.id === selectedVideoTrack.id);
    const prevIndex = (currentIndex - 1 + queue.length) % queue.length;
    handleSelectVideo(queue[prevIndex]);
  };

  // 2. High-Performance Lightweight Three.js Ambient Particles (Zero Lag)
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
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 15;

    const count = 1000;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    const colorA = new THREE.Color("#6366f1");
    const colorB = new THREE.Color("#ec4899");
    const colorC = new THREE.Color("#06b6d4");

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const radius = 8 + Math.random() * 30;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      pos[i3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i3 + 2] = radius * Math.cos(phi) - 8;

      const mixed = colorA.clone().lerp(Math.random() > 0.5 ? colorB : colorC, Math.random());
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
    let lastTime = performance.now();

    const animate = (now: number) => {
      const delta = (now - lastTime) * 0.001;
      lastTime = now;

      points.rotation.y += delta * 0.04;
      points.rotation.x += delta * 0.02;

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);

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

  // 3. Throttled Ambilight extraction loop (Runs every 400ms to save CPU)
  useEffect(() => {
    const interval = setInterval(() => {
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
          } catch {}
        }
      }
    }, 400);

    return () => clearInterval(interval);
  }, []);

  // Video Controls
  const handleTogglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
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
      if (video.readyState >= 2 && isVideoBuffering) {
        setIsVideoBuffering(false);
      }
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

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isVideoPlaying && !isQueueOpen) setShowControls(false);
    }, 3500);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onClick={() => {
        if (!showControls) setShowControls(true);
      }}
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
      {/* Background Pure Three.js Ambient Particles Canvas */}
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
      <motion.div
        animate={{
          x: isQueueOpen && !isMobile ? 160 : 0,
          scale: isQueueOpen ? (isMobile ? 0.92 : 0.82) : 1
        }}
        transition={{ type: "spring", damping: 26, stiffness: 220 }}
        style={{
          position: "absolute",
          width: isMobile ? "94vw" : "min(86vw, 1080px)",
          aspectRatio: "16 / 9",
          borderRadius: "32px",
          background: ambilightColor,
          filter: isMobile ? "blur(40px)" : "blur(80px)",
          opacity: 0.85,
          zIndex: 1,
          pointerEvents: "none"
        }}
      />

      {/* ── TOP HEADER BAR ── */}
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
              padding: isMobile ? "16px 20px" : "24px 36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              zIndex: 50,
              background: "linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, transparent 100%)"
            }}
          >
            {/* Back to 3D Album */}
            <button
              onClick={onBackTo3DAlbum}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: isMobile ? "8px 14px" : "10px 18px",
                borderRadius: "999px",
                backgroundColor: "rgba(255, 255, 255, 0.08)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                color: "#ffffff",
                fontSize: isMobile ? "0.78rem" : "0.85rem",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
            >
              <ArrowLeft size={15} />
              <span>Quay lại 3D Album</span>
            </button>

            {/* Video Queue Toggle Button */}
            <button
              onClick={() => setIsQueueOpen(!isQueueOpen)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: isMobile ? "8px 14px" : "10px 18px",
                borderRadius: "999px",
                backgroundColor: isQueueOpen ? "rgba(99, 102, 241, 0.35)" : "rgba(255, 255, 255, 0.08)",
                backdropFilter: "blur(20px)",
                border: isQueueOpen ? "1px solid #6366f1" : "1px solid rgba(255, 255, 255, 0.15)",
                color: isQueueOpen ? "#a5b4fc" : "#ffffff",
                fontSize: isMobile ? "0.78rem" : "0.85rem",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
            >
              <ListMusic size={15} />
              <span>{isQueueOpen ? "Đóng Hàng Đợi" : `Hàng Đợi Video (${queue.length})`}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── LEFT SLIDE-OUT VIDEO QUEUE DRAWER ── */}
      <AnimatePresence>
        {isQueueOpen && (
          <motion.div
            initial={{ x: "-100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "-100%", opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              bottom: 0,
              width: isMobile ? "85vw" : "360px",
              backgroundColor: "rgba(10, 10, 16, 0.88)",
              backdropFilter: "blur(30px)",
              borderRight: "1px solid rgba(255, 255, 255, 0.12)",
              boxShadow: "20px 0 50px rgba(0, 0, 0, 0.8)",
              zIndex: 60,
              display: "flex",
              flexDirection: "column",
              padding: "24px 20px"
            }}
          >
            {/* Drawer Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: "16px", borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800, color: "#ffffff" }}>
                  Hàng Đợi Video
                </h3>
                <p style={{ margin: "2px 0 0", fontSize: "0.74rem", color: "rgba(255, 255, 255, 0.5)" }}>
                  {queue.length} Video phòng thu độc quyền
                </p>
              </div>
              <button
                onClick={() => setIsQueueOpen(false)}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  color: "rgba(255, 255, 255, 0.6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer"
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Video List Items */}
            <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px", marginTop: "16px" }}>
              {queue.map((track, idx) => {
                const isCurrent = track.id === selectedVideoTrack?.id;
                return (
                  <div
                    key={track.id}
                    onClick={() => handleSelectVideo(track)}
                    style={{
                      padding: "10px 12px",
                      borderRadius: "12px",
                      backgroundColor: isCurrent ? "rgba(99, 102, 241, 0.22)" : "rgba(255, 255, 255, 0.03)",
                      border: isCurrent ? "1px solid #6366f1" : "1px solid rgba(255, 255, 255, 0.06)",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                  >
                    <span style={{ fontSize: "0.75rem", fontWeight: 800, color: isCurrent ? "#a5b4fc" : "rgba(255,255,255,0.4)", width: "20px" }}>
                      {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                    </span>

                    <img
                      src={track.coverUrl}
                      alt={track.title}
                      style={{ width: "38px", height: "38px", borderRadius: "8px", objectFit: "cover" }}
                    />

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ fontSize: "0.84rem", fontWeight: 700, color: isCurrent ? "#ffffff" : "rgba(255, 255, 255, 0.8)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {track.title}
                        </span>
                      </div>
                      <span style={{ fontSize: "0.72rem", color: "rgba(255, 255, 255, 0.45)" }}>
                        {track.artist}
                      </span>
                    </div>

                    {isCurrent && (
                      <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#34d399", boxShadow: "0 0 8px #34d399" }} />
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MAIN 3D CINEMA VIDEO SCREEN CONTAINER ── */}
      <motion.div
        animate={{
          x: isQueueOpen && !isMobile ? 160 : 0,
          y: isQueueOpen && isMobile ? -60 : 0,
          scale: isQueueOpen ? (isMobile ? 0.92 : 0.82) : 1
        }}
        transition={{ type: "spring", damping: 26, stiffness: 220 }}
        style={{
          position: "relative",
          width: isMobile ? "94vw" : "min(86vw, 1080px)",
          aspectRatio: "16 / 9",
          borderRadius: isMobile ? "18px" : "24px",
          overflow: "hidden",
          backgroundColor: "#050505",
          boxShadow: `0 0 60px ${ambilightColor}, 0 24px 60px rgba(0,0,0,0.9)`,
          border: "1px solid rgba(255, 255, 255, 0.12)",
          zIndex: 20
        }}
      >
        {/* Custom Clean HTML5 Video Element */}
        <video
          ref={videoRef}
          src={activeVideoUrl}
          playsInline
          autoPlay
          onWaiting={() => setIsVideoBuffering(true)}
          onPlaying={() => setIsVideoBuffering(false)}
          onCanPlay={() => setIsVideoBuffering(false)}
          onLoadedData={() => setIsVideoBuffering(false)}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleNextVideo}
          onClick={handleTogglePlay}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            cursor: "pointer"
          }}
        />

        {/* ── SUBTLE CORNER BUFFERING INDICATOR (NON-BLOCKING) ── */}
        <AnimatePresence>
          {isVideoBuffering && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              style={{
                position: "absolute",
                top: "18px",
                right: "18px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 12px",
                borderRadius: "20px",
                backgroundColor: "rgba(10, 10, 16, 0.8)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                zIndex: 35,
                pointerEvents: "none"
              }}
            >
              <Loader2 size={14} color="#a5b4fc" className="animate-spin" />
              <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "rgba(255, 255, 255, 0.75)" }}>
                Đang nạp buffer...
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── TOP-LEFT VIDEO TITLE OVERLAY ── */}
        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onClick={() => setIsQueueOpen(!isQueueOpen)}
              style={{
                position: "absolute",
                top: isMobile ? "12px" : "18px",
                left: isMobile ? "12px" : "18px",
                zIndex: 35,
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "8px 14px",
                borderRadius: "12px",
                backgroundColor: "rgba(10, 10, 16, 0.7)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                cursor: "pointer"
              }}
            >
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: isVideoPlaying && !isVideoBuffering ? "#34d399" : "#f59e0b" }} />
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ color: "#ffffff", fontWeight: 800, fontSize: isMobile ? "0.78rem" : "0.88rem", letterSpacing: "0.02em" }}>
                  {selectedVideoTrack?.title || "MCK Music Video"}
                </span>
                <span style={{ color: "rgba(255, 255, 255, 0.55)", fontSize: "0.7rem" }}>
                  {selectedVideoTrack?.artist || "MCK"} • {selectedVideoTrack?.album || "HVL"}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Center Big Play/Pause Splash Icon on Pause */}
        {!isVideoPlaying && !isVideoBuffering && (
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
              cursor: "pointer",
              zIndex: 30
            }}
          >
            <div
              style={{
                width: isMobile ? "64px" : "80px",
                height: isMobile ? "64px" : "80px",
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
              <Play size={isMobile ? 28 : 36} style={{ marginLeft: "4px" }} />
            </div>
          </div>
        )}

        {/* ── BESPOKE BOTTOM CONTROL DOCK ── */}
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
                padding: isMobile ? "14px 16px 12px" : "20px 28px 18px",
                background: "linear-gradient(to top, rgba(0,0,0,0.94) 0%, rgba(0,0,0,0.6) 60%, transparent 100%)",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                zIndex: 40
              }}
            >
              {/* Timeline Scrubber */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.78rem", fontFamily: "monospace", minWidth: "36px" }}>
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
                <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.78rem", fontFamily: "monospace", minWidth: "36px" }}>
                  {formatTime(duration)}
                </span>
              </div>

              {/* Bottom Row Controls */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center" }}>
                {/* Left: Queue Quick Button */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <button
                    onClick={() => setIsQueueOpen(!isQueueOpen)}
                    style={{
                      background: "rgba(255, 255, 255, 0.08)",
                      border: "1px solid rgba(255, 255, 255, 0.12)",
                      borderRadius: "8px",
                      padding: "5px 10px",
                      color: "#ffffff",
                      fontSize: "0.74rem",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      cursor: "pointer"
                    }}
                  >
                    <ListMusic size={13} />
                    <span>30 Videos</span>
                  </button>
                </div>

                {/* Center Media Playback Controls */}
                <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "12px" : "18px" }}>
                  <button
                    onClick={handlePrevVideo}
                    style={{
                      background: "none",
                      border: "none",
                      color: "rgba(255,255,255,0.85)",
                      cursor: "pointer",
                      padding: "4px"
                    }}
                  >
                    <SkipBack size={isMobile ? 18 : 22} />
                  </button>

                  <button
                    onClick={handleTogglePlay}
                    style={{
                      width: isMobile ? "38px" : "46px",
                      height: isMobile ? "38px" : "46px",
                      borderRadius: "50%",
                      backgroundColor: "#ffffff",
                      color: "#000000",
                      border: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      boxShadow: "0 4px 20px rgba(255, 255, 255, 0.35)"
                    }}
                  >
                    {isVideoPlaying ? <Pause size={isMobile ? 18 : 22} /> : <Play size={isMobile ? 18 : 22} style={{ marginLeft: "2px" }} />}
                  </button>

                  <button
                    onClick={handleNextVideo}
                    style={{
                      background: "none",
                      border: "none",
                      color: "rgba(255,255,255,0.85)",
                      cursor: "pointer",
                      padding: "4px"
                    }}
                  >
                    <SkipForward size={isMobile ? 18 : 22} />
                  </button>
                </div>

                {/* Right: Volume & Fullscreen Actions */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: isMobile ? "10px" : "16px" }}>
                  {!isMobile && (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <button
                        onClick={handleToggleMute}
                        style={{ background: "none", border: "none", color: "#ffffff", cursor: "pointer", padding: "4px" }}
                      >
                        {isMuted || volume === 0 ? <VolumeX size={17} /> : <Volume2 size={17} />}
                      </button>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.05}
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        style={{ width: "65px", height: "3px", accentColor: "#ffffff", cursor: "pointer" }}
                      />
                    </div>
                  )}

                  <button
                    onClick={handleToggleFullscreen}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#ffffff",
                      cursor: "pointer",
                      padding: "4px"
                    }}
                  >
                    {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
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
