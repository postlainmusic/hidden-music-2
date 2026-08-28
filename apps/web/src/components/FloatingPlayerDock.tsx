import React, { useEffect, useRef } from "react";
import { useAudioStore } from "../store/audioStore";
import { Play, Pause, Loader2, SkipBack, SkipForward, Volume2, VolumeX, Heart, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export const FloatingPlayerDock: React.FC = () => {
  const {
    currentTrack,
    queue,
    isPlaying,
    isBuffering,
    currentTime,
    duration,
    volume,
    isMuted,
    togglePlay,
    nextTrack,
    prevTrack,
    seek,
    setVolume,
    toggleMute,
    getFrequencyData
  } = useAudioStore();

  const currentIndex = currentTrack ? queue.findIndex((t) => t.id === currentTrack.id) : 0;
  const nextTrackItem = queue.length > 0 ? queue[(currentIndex + 1) % queue.length] : null;

  const visualizerRef = useRef<HTMLCanvasElement | null>(null);

  // Live Sound Waveform Visualizer on Canvas
  useEffect(() => {
    const canvas = visualizerRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;

    const draw = () => {
      const freqData = isPlaying ? getFrequencyData() : new Uint8Array(16);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barCount = 16;
      const barWidth = 3;
      const gap = 2;
      const totalWidth = barCount * (barWidth + gap);
      const startX = (canvas.width - totalWidth) / 2;

      for (let i = 0; i < barCount; i++) {
        const value = isPlaying ? freqData[i % freqData.length] / 255 : 0.15 + Math.sin(Date.now() * 0.003 + i) * 0.08;
        const barHeight = Math.max(3, value * canvas.height * 0.9);
        const x = startX + i * (barWidth + gap);
        const y = canvas.height - barHeight;

        const gradient = ctx.createLinearGradient(0, y, 0, canvas.height);
        gradient.addColorStop(0, currentTrack?.palette?.secondary || "#ec4899");
        gradient.addColorStop(1, currentTrack?.palette?.primary || "#6366f1");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => cancelAnimationFrame(animId);
  }, [isPlaying, getFrequencyData]);

  if (!currentTrack) return null;

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        left: 0,
        right: 0,
        zIndex: 50,
        display: "flex",
        justifyContent: "center",
        padding: "0 16px",
        pointerEvents: "none"
      }}
    >
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="glass-dock"
        style={{
          width: "100%",
          maxWidth: "960px",
          padding: "10px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          pointerEvents: "auto",
          position: "relative",
          overflow: "hidden"
        }}
      >
        {/* Subtle Top Specular Glow Line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "15%",
            right: "15%",
            height: "1px",
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)"
          }}
        />

        {/* Left: Track Information & Album Art */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px", minWidth: "220px" }}>
          {/* Animated Artwork */}
          <div style={{ position: "relative" }}>
            <motion.img
              animate={{ rotate: isPlaying ? 360 : 0 }}
              transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
              src={currentTrack.coverUrl}
              alt={currentTrack.title}
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                objectFit: "cover",
                boxShadow: "0 4px 14px rgba(0,0,0,0.5), 0 0 16px var(--glow-color)"
              }}
            />
            {isPlaying && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "12px",
                  border: "1.5px solid rgba(255,255,255,0.4)"
                }}
              />
            )}
          </div>

          <div style={{ overflow: "hidden" }}>
            <h4
              style={{
                fontSize: "0.92rem",
                fontWeight: 700,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                color: "#ffffff"
              }}
            >
              {currentTrack.title}
            </h4>
            <p
              style={{
                fontSize: "0.78rem",
                color: "var(--text-secondary)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis"
              }}
            >
              {currentTrack.artist}
            </p>
          </div>

          <button
            className="glass-pill"
            style={{
              padding: "6px",
              border: "none",
              color: "var(--text-muted)",
              cursor: "pointer",
              marginLeft: "4px"
            }}
          >
            <Heart size={15} />
          </button>
        </div>

        {/* Center: Controls & Scrubber */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", flex: 1, maxWidth: "460px" }}>
          {/* Button Row */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <button
              onClick={prevTrack}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--text-secondary)",
                cursor: "pointer",
                padding: "4px"
              }}
            >
              <SkipBack size={18} />
            </button>

            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={togglePlay}
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: "#ffffff",
                border: "none",
                color: "#090a0f",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 4px 18px var(--glow-color), 0 0 12px rgba(255,255,255,0.8)"
              }}
            >
              {isBuffering ? (
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                  <Loader2 size={18} color="#090a0f" />
                </motion.div>
              ) : isPlaying ? (
                <Pause size={18} fill="#090a0f" />
              ) : (
                <Play size={18} fill="#090a0f" style={{ marginLeft: "2px" }} />
              )}
            </motion.button>

            <button
              onClick={nextTrack}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--text-secondary)",
                cursor: "pointer",
                padding: "4px"
              }}
            >
              <SkipForward size={18} />
            </button>

            {/* Sound Waveform Visualizer */}
            <canvas ref={visualizerRef} width={80} height={20} style={{ marginLeft: "6px" }} />
          </div>

          {/* Scrubber Bar */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%" }}>
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", minWidth: "32px", textAlign: "right" }}>
              {formatTime(currentTime)}
            </span>

            <div style={{ position: "relative", flex: 1, display: "flex", alignItems: "center" }}>
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={(e) => seek(Number(e.target.value))}
                style={{
                  zIndex: 2
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  height: "4px",
                  borderRadius: "9999px",
                  background: "linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))",
                  width: `${progressPercent}%`,
                  pointerEvents: "none",
                  boxShadow: "0 0 8px var(--glow-color)"
                }}
              />
            </div>

            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", minWidth: "32px" }}>
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Right: Audio Quality & Volume */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: "180px", justifyContent: "flex-end" }}>
          <div
            className="glass-pill"
            style={{
              padding: "4px 8px",
              fontSize: "0.68rem",
              fontWeight: 700,
              color: "var(--accent-primary)",
              display: "flex",
              alignItems: "center",
              gap: "4px"
            }}
          >
            <Sparkles size={11} />
            <span>LOSSLESS</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", width: "110px" }}>
            <button
              onClick={toggleMute}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--text-secondary)",
                cursor: "pointer",
                padding: "2px"
              }}
            >
              {isMuted || volume === 0 ? <VolumeX size={17} /> : <Volume2 size={17} />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(Number(e.target.value))}
            />
          </div>
        </div>
      </motion.div>

      {/* Background Silent Next-Track Preloader (Pre-buffers the next track for 0ms transition) */}
      {nextTrackItem && nextTrackItem.id !== currentTrack.id && (
        <audio src={nextTrackItem.audioUrl} preload="auto" style={{ display: "none" }} />
      )}
    </div>
  );
};
