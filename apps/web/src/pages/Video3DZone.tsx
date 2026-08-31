import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAudioStore, Track } from "../store/audioStore";
import { dualDeckAudioEngine } from "../audio/DualDeckAudioEngine";
import { useIsMobile } from "../hooks/useIsMobile";
import { MeshGradientBackground, RGBColor } from "../components/MeshGradientBackground";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  ArrowLeft,
  ListMusic,
  Disc3,
  RotateCcw,
  RotateCw,
  Heart
} from "lucide-react";

interface Video3DZoneProps {
  onBackTo3DAlbum: () => void;
}

const SPEED_OPTIONS = [0.75, 1.0, 1.25, 1.5, 2.0];

export const Video3DZone: React.FC<Video3DZoneProps> = ({ onBackTo3DAlbum }) => {
  const { currentTrack, queue, favoritedTrackIds, toggleFavoriteTrack } = useAudioStore();
  const isMobile = useIsMobile();

  // Local Video Track State
  const [selectedTrack, setSelectedTrack] = useState<Track>(() => currentTrack || queue[0]);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isBuffering, setIsBuffering] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume] = useState<number>(0.9);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(true);

  // Dynamic 4-Point Ambilight Palette extracted from Video Frames
  const [ambilightColors, setAmbilightColors] = useState<RGBColor[]>([
    { r: 99, g: 102, b: 241 },   // Indigo
    { r: 236, g: 72, b: 153 },   // Pink
    { r: 168, g: 85, b: 247 },   // Purple
    { r: 59, g: 130, b: 246 }    // Blue
  ]);
  const [dominantAmbilightHex, setDominantAmbilightHex] = useState<string>("rgba(99, 102, 241, 0.5)");

  // Double-tap seek ripple feedback state
  const [seekFeedback, setSeekFeedback] = useState<"backward" | "forward" | null>(null);
  const lastTapTimeRef = useRef<number>(0);

  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDraggingSeekerRef = useRef<boolean>(false);

  // Audio pause on Video Zone mount
  useEffect(() => {
    dualDeckAudioEngine.pause();
    useAudioStore.setState({ isPlaying: false });

    return () => {
      if (videoRef.current) {
        try {
          videoRef.current.pause();
          videoRef.current.src = "";
        } catch {}
      }
    };
  }, []);

  // Format canonical video stream URL
  const videoStreamUrl = useMemo(() => {
    if (selectedTrack?.videoUrl) return selectedTrack.videoUrl;
    if (selectedTrack?.title) {
      return `https://media.postlain.com/videos/${encodeURIComponent(selectedTrack.title)}%20-%20MCK.mkv`;
    }
    return `https://media.postlain.com/videos/01.%20Elegie%20-%20MCK.mkv`;
  }, [selectedTrack]);

  // Format MM:SS
  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds) || seconds < 0) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Play / Pause toggle
  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  // Fullscreen toggle
  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch {}
  }, []);

  const toggleMute = () => {
    if (!videoRef.current) return;
    if (isMuted) {
      videoRef.current.muted = false;
      videoRef.current.volume = volume || 0.8;
      setIsMuted(false);
    } else {
      videoRef.current.muted = true;
      setIsMuted(true);
    }
  };

  // Cycle Speed
  const handleCycleSpeed = () => {
    const currIdx = SPEED_OPTIONS.indexOf(playbackRate);
    const nextRate = SPEED_OPTIONS[(currIdx + 1) % SPEED_OPTIONS.length] || 1.0;
    setPlaybackRate(nextRate);
    if (videoRef.current) {
      videoRef.current.playbackRate = nextRate;
    }
  };

  // Track switching
  const handleSelectTrack = (track: Track) => {
    setSelectedTrack(track);
    setIsBuffering(false);
    setIsPlaying(false);
  };

  const handleNextTrack = () => {
    const currentIndex = queue.findIndex((t) => t.id === selectedTrack.id);
    const nextIndex = (currentIndex + 1) % queue.length;
    handleSelectTrack(queue[nextIndex]);
  };

  // Timeline Seeker
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  };

  // Auto-hide controls (2.5s)
  const handleUserActivity = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        if (!isDraggingSeekerRef.current) {
          setShowControls(false);
        }
      }, 2500);
    }
  }, [isPlaying]);

  // Double-tap to Seek -10s / +10s on Video
  const handleVideoTouch = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    const now = Date.now();
    const timeDiff = now - lastTapTimeRef.current;
    lastTapTimeRef.current = now;

    if (timeDiff < 300) {
      // Double tap detected
      const rect = e.currentTarget.getBoundingClientRect();
      const clientX = "touches" in e ? (e as any).changedTouches?.[0]?.clientX || 0 : (e as any).clientX;
      const xRatio = (clientX - rect.left) / rect.width;

      if (videoRef.current) {
        if (xRatio < 0.45) {
          videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
          setSeekFeedback("backward");
          setTimeout(() => setSeekFeedback(null), 700);
        } else if (xRatio > 0.55) {
          videoRef.current.currentTime = Math.min(duration, videoRef.current.currentTime + 10);
          setSeekFeedback("forward");
          setTimeout(() => setSeekFeedback(null), 700);
        }
      }
    } else {
      handleUserActivity();
    }
  };

  // Extract Real-time 4-Point Ambilight Palette from Video Frame
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

            // Sample 4 quadrants for organic mesh gradient
            const q1 = { r: Math.min(255, r + 30), g: Math.max(0, g - 20), b: Math.max(0, b - 10) };
            const q2 = { r: Math.max(0, r - 30), g: Math.max(0, g - 10), b: Math.min(255, b + 40) };
            const q3 = { r: Math.max(0, r - 10), g: Math.min(255, g + 30), b: Math.max(0, b - 20) };
            const q4 = { r: Math.min(255, r + 20), g: Math.min(255, g + 20), b: Math.min(255, b + 20) };

            setAmbilightColors([q1, q2, q3, q4]);
            setDominantAmbilightHex(`rgba(${r}, ${g}, ${b}, 0.55)`);
          } catch {}
        }
      }
    }, 400);

    return () => clearInterval(interval);
  }, []);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const isFav = selectedTrack ? favoritedTrackIds.includes(selectedTrack.id) : false;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleUserActivity}
      onClick={handleUserActivity}
      style={{
        position: "relative",
        width: "100vw",
        minHeight: "100dvh",
        backgroundColor: "#000000",
        overflowX: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        zIndex: 10,
        color: "#ffffff"
      }}
    >
      {/* ─────────────────────────────────────────────────────────────────────
          1. DYNAMIC AMBILIGHT MESH GRADIENT BACKGROUND
      ────────────────────────────────────────────────────────────────────── */}
      <MeshGradientBackground customColors={ambilightColors} intensity={1.2} />

      {/* Hidden Offscreen Canvas for Ambilight extraction */}
      <canvas ref={canvasRef} width={16} height={9} style={{ display: "none" }} />

      {/* ── TOP HEADER BAR ── */}
      <div
        style={{
          width: "100%",
          maxWidth: "1100px",
          padding: isMobile ? "16px 16px 8px" : "20px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          zIndex: 40
        }}
      >
        <button
          onClick={onBackTo3DAlbum}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 16px",
            borderRadius: "999px",
            backgroundColor: "rgba(255, 255, 255, 0.08)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            color: "#ffffff",
            fontSize: "0.82rem",
            fontWeight: 700,
            cursor: "pointer",
            transition: "all 0.2s ease"
          }}
        >
          <ArrowLeft size={15} />
          <span>3D Album</span>
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span
            style={{
              padding: "4px 10px",
              borderRadius: "999px",
              backgroundColor: "rgba(236, 72, 153, 0.15)",
              border: "1px solid rgba(236, 72, 153, 0.35)",
              color: "#f472b6",
              fontSize: "0.74rem",
              fontWeight: 800
            }}
          >
            4K CINEMA
          </span>
          <span style={{ fontSize: "0.82rem", color: "rgba(255, 255, 255, 0.6)", fontWeight: 600 }}>
            HVL (30 Videos)
          </span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────
          2. MAIN 16:9 CINEMA VIDEO PLAYER
      ────────────────────────────────────────────────────────────────────── */}
      <div
        style={{
          width: "100%",
          maxWidth: isMobile ? "100vw" : "1080px",
          padding: isMobile ? "0" : "0 24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          zIndex: 30
        }}
      >
        <div
          onClick={handleVideoTouch}
          style={{
            position: "relative",
            width: isMobile ? "100vw" : "100%",
            aspectRatio: "16 / 9",
            borderRadius: isMobile ? "0px" : "24px",
            overflow: "hidden",
            backgroundColor: "#050505",
            boxShadow: `0 0 50px ${dominantAmbilightHex}, 0 20px 50px rgba(0,0,0,0.9)`,
            border: isMobile ? "none" : "1px solid rgba(255, 255, 255, 0.12)",
            cursor: "pointer"
          }}
        >
          <video
            ref={videoRef}
            key={videoStreamUrl}
            src={videoStreamUrl}
            preload="metadata"
            playsInline={true}
            controls={false}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onWaiting={() => setIsBuffering(true)}
            onPlaying={() => setIsBuffering(false)}
            onCanPlay={() => setIsBuffering(false)}
            onTimeUpdate={() => {
              if (videoRef.current && !isDraggingSeekerRef.current) {
                setCurrentTime(videoRef.current.currentTime);
              }
            }}
            onLoadedMetadata={() => {
              if (videoRef.current) {
                setDuration(videoRef.current.duration);
                videoRef.current.volume = volume;
                videoRef.current.muted = isMuted;
                videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
              }
            }}
            onEnded={() => {
              setIsPlaying(false);
              handleNextTrack();
            }}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover"
            }}
          />

          {isBuffering && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(0, 0, 0, 0.35)",
                pointerEvents: "none",
                zIndex: 32
              }}
            >
              <Disc3 size={44} color="#ffffff" className="animate-spin text-opacity-80" />
            </div>
          )}

          {/* Double-tap Seek Feedback */}
          <AnimatePresence>
            {seekFeedback === "backward" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  position: "absolute",
                  left: "15%",
                  top: "50%",
                  transform: "translateY(-50%)",
                  padding: "16px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(0,0,0,0.65)",
                  backdropFilter: "blur(12px)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "4px",
                  zIndex: 35
                }}
              >
                <RotateCcw size={26} color="#ffffff" />
                <span style={{ fontSize: "0.75rem", fontWeight: 800 }}>-10s</span>
              </motion.div>
            )}

            {seekFeedback === "forward" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  position: "absolute",
                  right: "15%",
                  top: "50%",
                  transform: "translateY(-50%)",
                  padding: "16px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(0,0,0,0.65)",
                  backdropFilter: "blur(12px)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "4px",
                  zIndex: 35
                }}
              >
                <RotateCw size={26} color="#ffffff" />
                <span style={{ fontSize: "0.75rem", fontWeight: 800 }}>+10s</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Controls Overlay */}
          <AnimatePresence>
            {(showControls || !isPlaying) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.4) 100%)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  padding: isMobile ? "12px 14px" : "18px 24px",
                  zIndex: 30
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleUserActivity();
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#ec4899", boxShadow: "0 0 10px #ec4899" }} />
                    <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#ffffff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "240px" }}>
                      {selectedTrack?.title}
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCycleSpeed();
                    }}
                    style={{
                      padding: "4px 10px",
                      borderRadius: "6px",
                      backgroundColor: "rgba(255, 255, 255, 0.12)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      color: "#ffffff",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      cursor: "pointer"
                    }}
                  >
                    {playbackRate}x
                  </button>
                </div>

                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePlay();
                  }}
                  style={{
                    alignSelf: "center",
                    width: isMobile ? "54px" : "64px",
                    height: isMobile ? "54px" : "64px",
                    borderRadius: "50%",
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255, 255, 255, 0.4)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#ffffff",
                    cursor: "pointer"
                  }}
                >
                  {isPlaying ? <Pause size={isMobile ? 24 : 28} /> : <Play size={isMobile ? 24 : 28} style={{ marginLeft: "3px" }} />}
                </div>

                <div>
                  <div style={{ position: "relative", marginBottom: "8px" }}>
                    <div
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: 0,
                        right: 0,
                        height: "4px",
                        transform: "translateY(-50%)",
                        backgroundColor: "rgba(255, 255, 255, 0.2)",
                        borderRadius: "999px"
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${progressPercent}%`,
                          background: "linear-gradient(90deg, #6366f1, #ec4899)",
                          borderRadius: "999px"
                        }}
                      />
                    </div>

                    <input
                      type="range"
                      min={0}
                      max={duration || 100}
                      step={0.1}
                      value={currentTime}
                      onChange={handleSeek}
                      onMouseDown={() => { isDraggingSeekerRef.current = true; }}
                      onMouseUp={() => { isDraggingSeekerRef.current = false; }}
                      onTouchStart={() => { isDraggingSeekerRef.current = true; }}
                      onTouchEnd={() => { isDraggingSeekerRef.current = false; }}
                      style={{
                        position: "relative",
                        width: "100%",
                        height: "16px",
                        opacity: 0,
                        cursor: "pointer",
                        zIndex: 10
                      }}
                    />
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "0.78rem", color: "rgba(255, 255, 255, 0.75)", fontWeight: 700 }}>
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>

                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleMute();
                        }}
                        style={{ background: "none", border: "none", color: "#ffffff", cursor: "pointer" }}
                      >
                        {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFullscreen();
                        }}
                        style={{ background: "none", border: "none", color: "#ffffff", cursor: "pointer" }}
                      >
                        {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Video Info */}
        <div
          style={{
            width: "100%",
            padding: isMobile ? "14px 16px 8px" : "18px 0 12px",
            display: "flex",
            flexDirection: "column",
            gap: "10px"
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
            <div style={{ minWidth: 0 }}>
              <h2 style={{ margin: 0, fontSize: isMobile ? "1.1rem" : "1.35rem", fontWeight: 800, color: "#ffffff", letterSpacing: "0.02em" }}>
                {selectedTrack?.title}
              </h2>
              <p style={{ margin: "4px 0 0", fontSize: "0.85rem", color: "rgba(255, 255, 255, 0.55)", fontWeight: 600 }}>
                {selectedTrack?.artist || "MCK"} • Album HVL (99%)
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button
                onClick={() => selectedTrack?.id && toggleFavoriteTrack(selectedTrack.id)}
                style={{
                  padding: "8px 14px",
                  borderRadius: "999px",
                  backgroundColor: isFav ? "rgba(239, 68, 68, 0.2)" : "rgba(255, 255, 255, 0.08)",
                  border: isFav ? "1px solid rgba(239, 68, 68, 0.5)" : "1px solid rgba(255, 255, 255, 0.15)",
                  color: isFav ? "#ef4444" : "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  cursor: "pointer"
                }}
              >
                <Heart size={14} fill={isFav ? "#ef4444" : "none"} />
                <span>{isFav ? "Đã Thích" : "Thích"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* YouTube-Style Playlist Queue */}
        <div
          style={{
            width: "100%",
            padding: isMobile ? "0 16px 80px" : "8px 0 60px",
            display: "flex",
            flexDirection: "column",
            gap: "12px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: "4px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <ListMusic size={18} color="#ec4899" />
              <span style={{ fontSize: "0.92rem", fontWeight: 800, color: "#ffffff", letterSpacing: "0.04em" }}>
                DANH SÁCH PHÁT VIDEO ({queue.length})
              </span>
            </div>
            <span style={{ fontSize: "0.75rem", color: "rgba(255, 255, 255, 0.45)", fontWeight: 600 }}>
              Chất lượng 4K Master
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {queue.map((track, idx) => {
              const isCurrent = track.id === selectedTrack?.id;

              return (
                <div
                  key={track.id || idx}
                  onClick={() => handleSelectTrack(track)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    padding: "8px 12px",
                    borderRadius: "14px",
                    backgroundColor: isCurrent ? "rgba(99, 102, 241, 0.22)" : "rgba(255, 255, 255, 0.03)",
                    border: isCurrent ? "1px solid rgba(168, 85, 247, 0.6)" : "1px solid rgba(255, 255, 255, 0.06)",
                    cursor: "pointer",
                    transition: "all 0.2s ease"
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      width: isMobile ? "96px" : "120px",
                      aspectRatio: "16 / 9",
                      borderRadius: "8px",
                      overflow: "hidden",
                      backgroundColor: "#111118",
                      flexShrink: 0
                    }}
                  >
                    <img
                      src={track.coverUrl || "/covers/HVL_Album_Cover.webp"}
                      alt={track.title}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        bottom: "3px",
                        right: "4px",
                        padding: "1px 5px",
                        borderRadius: "4px",
                        backgroundColor: "rgba(0, 0, 0, 0.75)",
                        fontSize: "0.65rem",
                        fontWeight: 700,
                        color: "#ffffff"
                      }}
                    >
                      {formatTime(track.duration)}
                    </div>
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span
                      style={{
                        fontSize: "0.88rem",
                        fontWeight: 700,
                        color: isCurrent ? "#ffffff" : "rgba(255, 255, 255, 0.85)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "block"
                      }}
                    >
                      {track.title}
                    </span>

                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "3px" }}>
                      <span style={{ fontSize: "0.75rem", color: "rgba(255, 255, 255, 0.45)" }}>
                        {track.artist || "MCK"}
                      </span>
                      {isCurrent && (
                        <span
                          style={{
                            padding: "1px 6px",
                            borderRadius: "4px",
                            backgroundColor: "rgba(52, 211, 153, 0.2)",
                            color: "#34d399",
                            fontSize: "0.65rem",
                            fontWeight: 800
                          }}
                        >
                          ĐANG PHÁT
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Video3DZone;
