import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAudioStore, Track } from "../store/audioStore";
import { dualDeckAudioEngine } from "../audio/DualDeckAudioEngine";
import { extractYouTubeId, youTubeAudioBridge, isYouTubeSource } from "../audio/YouTubeBridge";
import { useIsMobile } from "../hooks/useIsMobile";
import { MeshGradientBackground, RGBColor } from "../components/MeshGradientBackground";
import { sendTelemetryLog } from "../utils/telemetry";
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
  Heart,
  Sparkles
} from "lucide-react";

interface Video3DZoneProps {
  onBackTo3DAlbum: () => void;
}

const SPEED_OPTIONS = [0.75, 1.0, 1.25, 1.5, 2.0];

export const Video3DZone: React.FC<Video3DZoneProps> = ({ onBackTo3DAlbum }) => {
  const { currentTrack, queue, favoritedTrackIds, toggleFavoriteTrack, selectedAlbum } = useAudioStore();
  const isMobile = useIsMobile();

  // Local Video Track State
  const [selectedTrack, setSelectedTrack] = useState<Track>(() => currentTrack || queue[0]);
  const [filterMode, setFilterMode] = useState<"release" | "all">("release");

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const cinemaStageRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const isYouTube = Boolean(extractYouTubeId(selectedTrack?.videoUrl || selectedTrack?.audioUrl));
  const youtubeId = extractYouTubeId(selectedTrack?.videoUrl || selectedTrack?.audioUrl);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isBuffering, setIsBuffering] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.9);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(true);

  // Dynamic 4-Point Ambilight Palette extracted from Video Frames / Track Palette
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

  // Release filtered tracks
  const releaseTracks = useMemo(() => {
    return queue.filter((t) => {
      if (selectedAlbum?.id) return t.album_id === selectedAlbum.id;
      if (selectedAlbum?.title) return t.album?.toLowerCase() === selectedAlbum.title.toLowerCase();
      if (selectedTrack?.album_id) return t.album_id === selectedTrack.album_id;
      if (selectedTrack?.album) return t.album?.toLowerCase() === selectedTrack.album.toLowerCase();
      return true;
    });
  }, [queue, selectedAlbum, selectedTrack]);

  const displayedVideoTracks = filterMode === "release" && releaseTracks.length > 0 ? releaseTracks : queue;
  const releaseTitle = selectedAlbum?.title || selectedTrack?.album || "HVL (99%)";

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
      youTubeAudioBridge.pause();
    };
  }, []);

  // Sync with Headless YouTube Audio Bridge (0% iframe visual on page)
  useEffect(() => {
    if (isYouTube && youtubeId) {
      youTubeAudioBridge.playTrack(youtubeId);
      youTubeAudioBridge.setVolume(isMuted ? 0 : volume);
      setIsPlaying(true);

      const unsubProgress = youTubeAudioBridge.onProgress((cur, dur) => {
        if (!isDraggingSeekerRef.current) {
          setCurrentTime(cur);
        }
        if (dur > 0) {
          setDuration(dur);
        }
      });

      const unsubState = youTubeAudioBridge.onStateChange((playing) => {
        setIsPlaying(playing);
      });

      const unsubBuffer = youTubeAudioBridge.onBuffering((buffering) => {
        setIsBuffering(buffering);
      });

      return () => {
        unsubProgress();
        unsubState();
        unsubBuffer();
        youTubeAudioBridge.pause();
      };
    }
  }, [isYouTube, youtubeId]);

  // Ambilight sync for YouTube video sources (from track palette)
  useEffect(() => {
    if (isYouTube && selectedTrack?.palette) {
      const p = selectedTrack.palette;
      const hexToRgb = (hex: string) => {
        const res = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return res ? { r: parseInt(res[1], 16), g: parseInt(res[2], 16), b: parseInt(res[3], 16) } : { r: 99, g: 102, b: 241 };
      };
      const c1 = hexToRgb(p.primary || "#6366f1");
      const c2 = hexToRgb(p.secondary || "#ec4899");
      const c3 = hexToRgb(p.accent || "#8b5cf6");
      const c4 = { r: 20, g: 24, b: 35 };
      setAmbilightColors([c1, c2, c3, c4]);
      setDominantAmbilightHex(p.glow || `rgba(${c1.r}, ${c1.g}, ${c1.b}, 0.55)`);
    }
  }, [isYouTube, selectedTrack]);

  // Format canonical direct video stream URL
  const videoStreamUrl = useMemo(() => {
    if (isYouTube) return "";
    if (selectedTrack?.videoUrl && !isYouTubeSource(selectedTrack.videoUrl)) return selectedTrack.videoUrl;
    if (selectedTrack?.album_id === "hvl-99" || selectedTrack?.album === "HVL") {
      return `https://media.postlain.com/videos/${encodeURIComponent(selectedTrack.title)}%20-%20MCK.mkv`;
    }
    return "";
  }, [selectedTrack, isYouTube]);

  // Format MM:SS
  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds) || seconds < 0) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Play / Pause toggle
  const togglePlay = useCallback(() => {
    if (isYouTube) {
      if (isPlaying) {
        youTubeAudioBridge.pause();
        setIsPlaying(false);
      } else {
        youTubeAudioBridge.resume();
        setIsPlaying(true);
      }
      return;
    }
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [isYouTube, isPlaying]);

  // Cross-Platform & 16:9 Cinema Frame Fullscreen toggle
  const toggleFullscreen = useCallback(async () => {
    try {
      const doc = document as any;
      const elem = cinemaStageRef.current as any;
      const videoElem = videoRef.current as any;

      if (!doc.fullscreenElement && !doc.webkitFullscreenElement && !doc.mozFullScreenElement && !doc.msFullscreenElement) {
        if (elem?.requestFullscreen) {
          await elem.requestFullscreen();
        } else if (elem?.webkitRequestFullscreen) {
          await elem.webkitRequestFullscreen();
        } else if (elem?.mozRequestFullScreen) {
          await elem.mozRequestFullScreen();
        } else if (elem?.msRequestFullscreen) {
          await elem.msRequestFullscreen();
        } else if (videoElem?.webkitEnterFullscreen) {
          videoElem.webkitEnterFullscreen();
        }
        setIsFullscreen(true);
      } else {
        if (doc.exitFullscreen) {
          await doc.exitFullscreen();
        } else if (doc.webkitExitFullscreen) {
          await doc.webkitExitFullscreen();
        } else if (doc.mozCancelFullScreen) {
          await doc.mozCancelFullScreen();
        } else if (doc.msExitFullscreen) {
          await doc.msExitFullscreen();
        }
        setIsFullscreen(false);
      }
    } catch (err) {
      console.warn("Fullscreen error notice:", err);
    }
  }, []);

  // Fullscreen change listener
  useEffect(() => {
    const handleFsChange = () => {
      const doc = document as any;
      const isFs = Boolean(doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement || doc.msFullscreenElement);
      setIsFullscreen(isFs);
    };

    document.addEventListener("fullscreenchange", handleFsChange);
    document.addEventListener("webkitfullscreenchange", handleFsChange);
    document.addEventListener("mozfullscreenchange", handleFsChange);
    document.addEventListener("MSFullscreenChange", handleFsChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFsChange);
      document.removeEventListener("webkitfullscreenchange", handleFsChange);
      document.removeEventListener("mozfullscreenchange", handleFsChange);
      document.removeEventListener("MSFullscreenChange", handleFsChange);
    };
  }, []);

  const toggleMute = () => {
    if (isYouTube) {
      if (isMuted) {
        youTubeAudioBridge.setVolume(volume);
        setIsMuted(false);
      } else {
        youTubeAudioBridge.setVolume(0);
        setIsMuted(true);
      }
      return;
    }
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
    sendTelemetryLog({
      eventType: "play_track",
      titleVi: `🎬 Bắt đầu phát Video MV 4K: "${track.title}" (${track.artist || "MCK"})`,
      severity: "info",
      details: {
        trackTitle: track.title,
        videoUrl: track.videoUrl,
        quality: "4K Master"
      }
    });
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
    if (isYouTube) {
      youTubeAudioBridge.seekTo(newTime);
    } else if (videoRef.current) {
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

      if (xRatio < 0.45) {
        const targetTime = Math.max(0, currentTime - 10);
        if (isYouTube) {
          youTubeAudioBridge.seekTo(targetTime);
          setCurrentTime(targetTime);
        } else if (videoRef.current) {
          videoRef.current.currentTime = targetTime;
        }
        setSeekFeedback("backward");
        setTimeout(() => setSeekFeedback(null), 700);
      } else if (xRatio > 0.55) {
        const targetTime = Math.min(duration, currentTime + 10);
        if (isYouTube) {
          youTubeAudioBridge.seekTo(targetTime);
          setCurrentTime(targetTime);
        } else if (videoRef.current) {
          videoRef.current.currentTime = targetTime;
        }
        setSeekFeedback("forward");
        setTimeout(() => setSeekFeedback(null), 700);
      }
    } else {
      handleUserActivity();
    }
  };

  // Extract Real-time 4-Point Ambilight Palette from Video Frame
  useEffect(() => {
    if (isYouTube) return;
    const interval = setInterval(() => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video && canvas && !video.paused && !video.ended && video.readyState >= 2) {
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (ctx) {
          try {
            ctx.drawImage(video, 0, 0, 16, 9);
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
  }, [isYouTube]);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const isFav = selectedTrack ? favoritedTrackIds.includes(selectedTrack.id) : false;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleUserActivity}
      onClick={handleUserActivity}
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100dvh",
        maxHeight: "100dvh",
        backgroundColor: "#000000",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        zIndex: 9999,
        userSelect: "none"
      }}
    >
      {/* ─────────────────────────────────────────────────────────────────────
          AMBILIGHT SHADER & CANVAS PROJECTION
      ────────────────────────────────────────────────────────────────────── */}
      <MeshGradientBackground
        customColors={ambilightColors}
        speed={0.0035}
        distortion={0.5}
        blendSteps={4}
      />
      <canvas ref={canvasRef} width="16" height="9" style={{ display: "none" }} />

      {/* ─────────────────────────────────────────────────────────────────────
          1. TOP NAVIGATION & HEADER
      ────────────────────────────────────────────────────────────────────── */}
      <div
        style={{
          width: "100%",
          maxWidth: isMobile ? "100vw" : "1080px",
          padding: isMobile ? "16px 16px 10px 16px" : "24px 24px 12px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          zIndex: 40
        }}
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBackTo3DAlbum}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 16px",
            borderRadius: "9999px",
            backgroundColor: "rgba(255, 255, 255, 0.08)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            color: "#ffffff",
            fontSize: "0.82rem",
            fontWeight: 700,
            cursor: "pointer"
          }}
        >
          <ArrowLeft size={16} />
          <span>3D Album</span>
        </motion.button>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span
            style={{
              padding: "4px 10px",
              borderRadius: "9999px",
              backgroundColor: "rgba(236, 72, 153, 0.2)",
              border: "1px solid rgba(236, 72, 153, 0.4)",
              color: "#f472b6",
              fontSize: "0.68rem",
              fontWeight: 800,
              letterSpacing: "0.08em"
            }}
          >
            4K CINEMA
          </span>
          <span style={{ fontSize: "0.82rem", color: "rgba(255, 255, 255, 0.6)", fontWeight: 600 }}>
            {releaseTitle} ({displayedVideoTracks.length} Videos)
          </span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────
          2. MAIN 16:9 CINEMA VIDEO PLAYER (ZERO YOUTUBE IFRAME OVERLAY)
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
          ref={cinemaStageRef}
          onClick={handleVideoTouch}
          style={{
            position: "relative",
            width: isMobile ? "100vw" : "100%",
            aspectRatio: "16 / 9",
            borderRadius: isFullscreen ? "0px" : (isMobile ? "0px" : "24px"),
            overflow: "hidden",
            backgroundColor: "#050505",
            boxShadow: `0 0 50px ${dominantAmbilightHex}, 0 20px 50px rgba(0,0,0,0.9)`,
            border: isFullscreen || isMobile ? "none" : "1px solid rgba(255, 255, 255, 0.12)",
            cursor: "pointer"
          }}
        >
          {isYouTube ? (
            <div
              style={{
                width: "100%",
                height: "100%",
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                background: "#050508"
              }}
            >
              {/* Blurred Ambient Background Artwork */}
              <div
                style={{
                  position: "absolute",
                  inset: -20,
                  backgroundImage: `url(${selectedTrack?.cover || "/covers/HVL_Album_Cover.webp"})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  filter: "blur(30px) brightness(0.35) contrast(1.2)",
                  transform: isPlaying ? "scale(1.08)" : "scale(1)",
                  transition: "transform 10s ease-out"
                }}
              />

              {/* Radial gradient spotlight */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: `radial-gradient(circle at center, transparent 30%, rgba(5,5,8,0.85) 90%)`,
                  pointerEvents: "none"
                }}
              />

              {/* Center Artwork Canvas with Vinyl Disc Peeking */}
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 2,
                  transform: isMobile ? "scale(0.85)" : "scale(1)"
                }}
              >
                {/* Vinyl Record Behind Sleeve */}
                <motion.div
                  animate={{ rotate: isPlaying ? 360 : 0 }}
                  transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                  style={{
                    position: "absolute",
                    right: isPlaying ? "-40px" : "-10px",
                    width: isMobile ? "160px" : "220px",
                    height: isMobile ? "160px" : "220px",
                    borderRadius: "50%",
                    background: "radial-gradient(circle, #1a1a24 0%, #08080c 60%, #000000 100%)",
                    border: "2px solid rgba(255,255,255,0.15)",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.8)",
                    transition: "right 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <div
                    style={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "50%",
                      backgroundImage: `url(${selectedTrack?.cover || "/covers/HVL_Album_Cover.webp"})`,
                      backgroundSize: "cover",
                      border: "2px solid rgba(255,255,255,0.3)"
                    }}
                  />
                </motion.div>

                {/* Album Cover Art */}
                <div
                  style={{
                    position: "relative",
                    width: isMobile ? "160px" : "220px",
                    height: isMobile ? "160px" : "220px",
                    borderRadius: "16px",
                    overflow: "hidden",
                    border: "1.5px solid rgba(255, 255, 255, 0.25)",
                    boxShadow: "0 20px 50px rgba(0,0,0,0.9), 0 0 30px rgba(99, 102, 241, 0.3)",
                    zIndex: 2
                  }}
                >
                  <img
                    src={selectedTrack?.cover || "/covers/HVL_Album_Cover.webp"}
                    alt={selectedTrack?.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
              </div>

              {/* Visualizer Badge */}
              <div
                style={{
                  position: "absolute",
                  top: isMobile ? "12px" : "20px",
                  left: isMobile ? "14px" : "24px",
                  zIndex: 10,
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "4px 10px",
                  borderRadius: "999px",
                  background: "rgba(0, 0, 0, 0.6)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  color: "#ffffff",
                  fontSize: "0.68rem",
                  fontWeight: 800,
                  letterSpacing: "0.06em",
                  pointerEvents: "none"
                }}
              >
                <Sparkles size={11} color="#a5b4fc" />
                <span>STUDIO CINEMA VISUALIZER</span>
              </div>
            </div>
          ) : (
            <video
              ref={videoRef}
              key={videoStreamUrl}
              src={videoStreamUrl}
              preload="auto"
              crossOrigin="anonymous"
              playsInline={true}
              controls={false}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onWaiting={() => setIsBuffering(true)}
              onPlaying={() => setIsBuffering(false)}
              onCanPlay={() => setIsBuffering(false)}
              onError={() => {
                // Graceful auto-recovery for network stalls or range reconnects
                if (videoRef.current && currentTime > 0) {
                  const resumeAt = currentTime;
                  videoRef.current.src = videoStreamUrl;
                  videoRef.current.currentTime = resumeAt;
                  videoRef.current.play().catch(() => {});
                }
              }}
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
          )}

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
            padding: isMobile ? "10px 16px 6px" : "14px 0 8px",
            display: "flex",
            flexDirection: "column",
            gap: "8px"
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
            <div style={{ minWidth: 0 }}>
              <h2 style={{ margin: 0, fontSize: isMobile ? "1.05rem" : "1.25rem", fontWeight: 800, color: "#ffffff", letterSpacing: "0.02em" }}>
                {selectedTrack?.title}
              </h2>
              <p style={{ margin: "3px 0 0", fontSize: "0.82rem", color: "rgba(255, 255, 255, 0.55)", fontWeight: 600 }}>
                {selectedTrack?.artist || "MCK"} • {releaseTitle}
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button
                onClick={() => selectedTrack?.id && toggleFavoriteTrack(selectedTrack.id)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "999px",
                  backgroundColor: isFav ? "rgba(239, 68, 68, 0.2)" : "rgba(255, 255, 255, 0.08)",
                  border: isFav ? "1px solid rgba(239, 68, 68, 0.5)" : "1px solid rgba(255, 255, 255, 0.15)",
                  color: isFav ? "#ef4444" : "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  cursor: "pointer"
                }}
              >
                <Heart size={13} fill={isFav ? "#ef4444" : "none"} />
                <span>{isFav ? "Đã Thích" : "Thích"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────
          3. SCROLLABLE VIDEO PLAYLIST TRAY (INTERNAL SCROLL ONLY)
      ────────────────────────────────────────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          width: "100%",
          maxWidth: isMobile ? "100vw" : "1080px",
          padding: isMobile ? "6px 16px 36px" : "8px 24px 40px",
          overflowY: "auto",
          overflowX: "hidden",
          WebkitOverflowScrolling: "touch",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          zIndex: 30
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px", paddingBottom: "4px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <ListMusic size={17} color="#ec4899" />
            <span style={{ fontSize: "0.88rem", fontWeight: 800, color: "#ffffff", letterSpacing: "0.03em" }}>
              DANH SÁCH VIDEO ({displayedVideoTracks.length})
            </span>
          </div>

          {/* Filter Pills: Release vs All Videos */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <button
              onClick={() => setFilterMode("release")}
              style={{
                padding: "3px 10px",
                borderRadius: "999px",
                border: filterMode === "release" ? "1px solid #ec4899" : "1px solid rgba(255,255,255,0.12)",
                backgroundColor: filterMode === "release" ? "rgba(236, 72, 153, 0.2)" : "rgba(255,255,255,0.04)",
                color: filterMode === "release" ? "#f472b6" : "rgba(255,255,255,0.6)",
                fontSize: "0.72rem",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
            >
              {releaseTitle} ({releaseTracks.length})
            </button>
            <button
              onClick={() => setFilterMode("all")}
              style={{
                padding: "3px 10px",
                borderRadius: "999px",
                border: filterMode === "all" ? "1px solid #6366f1" : "1px solid rgba(255,255,255,0.12)",
                backgroundColor: filterMode === "all" ? "rgba(99, 102, 241, 0.2)" : "rgba(255,255,255,0.04)",
                color: filterMode === "all" ? "#818cf8" : "rgba(255,255,255,0.6)",
                fontSize: "0.72rem",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
            >
              Tất cả ({queue.length})
            </button>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {displayedVideoTracks.map((track, idx) => {
            const isCurrent = track.id === selectedTrack?.id;

            return (
              <div
                key={track.id || idx}
                onClick={() => handleSelectTrack(track)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
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
                    width: isMobile ? "90px" : "110px",
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
                      fontSize: "0.62rem",
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
                      fontSize: "0.85rem",
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
                    <span style={{ fontSize: "0.72rem", color: "rgba(255, 255, 255, 0.45)" }}>
                      {track.artist || "MCK"}
                    </span>
                    {isCurrent && (
                      <span
                        style={{
                          padding: "1px 6px",
                          borderRadius: "4px",
                          backgroundColor: "rgba(52, 211, 153, 0.2)",
                          color: "#34d399",
                          fontSize: "0.62rem",
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
  );
};

export default Video3DZone;
