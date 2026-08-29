import React, { useEffect, useRef, useState } from "react";
import { useAudioStore, DEFAULT_TRACKS } from "../store/audioStore";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Heart, Sparkles, ListMusic, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const FloatingPlayerDock: React.FC = () => {
  const {
    currentTrack,
    queue,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    togglePlay,
    playTrack,
    nextTrack,
    prevTrack,
    seek,
    setVolume,
    toggleMute,
    favoritedTrackIds,
    toggleFavoriteTrack,
    getFrequencyData
  } = useAudioStore();

  const [isQueueOpen, setIsQueueOpen] = useState<boolean>(false);

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
        if (typeof ctx.roundRect === "function") {
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, 2);
          ctx.fill();
        } else {
          ctx.fillRect(x, y, barWidth, barHeight);
        }
      }

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => cancelAnimationFrame(animId);
  }, [isPlaying, getFrequencyData, currentTrack]);

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
      {/* 1. Floating Desktop Queue / Tracklist Popover Window */}
      <AnimatePresence>
        {isQueueOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            style={{
              position: "absolute",
              bottom: "76px",
              right: "24px",
              width: "360px",
              maxHeight: "440px",
              borderRadius: "22px",
              background: "rgba(10, 11, 16, 0.88)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              backdropFilter: "blur(28px)",
              WebkitBackdropFilter: "blur(28px)",
              boxShadow: "0 30px 80px rgba(0, 0, 0, 0.9), 0 0 1px 1px rgba(255, 255, 255, 0.1)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              pointerEvents: "auto",
              zIndex: 60
            }}
          >
            {/* Queue Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 18px",
                borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                background: "rgba(255, 255, 255, 0.02)"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <ListMusic size={16} color="#a5b4fc" />
                <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#ffffff" }}>
                  Danh sách phát (30 bài)
                </span>
              </div>
              <button
                onClick={() => setIsQueueOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "rgba(255, 255, 255, 0.6)",
                  cursor: "pointer",
                  padding: "4px",
                  display: "flex",
                  alignItems: "center"
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Queue 30 Tracks Scrollable List */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "8px",
                display: "flex",
                flexDirection: "column",
                gap: "2px"
              }}
            >
              {DEFAULT_TRACKS.map((track, idx) => {
                const isCurrent = currentTrack.id === track.id;
                const isFav = favoritedTrackIds.includes(track.id);

                return (
                  <div
                    key={track.id}
                    onClick={() => playTrack(track)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 12px",
                      borderRadius: "12px",
                      background: isCurrent ? "rgba(255, 255, 255, 0.12)" : "transparent",
                      border: isCurrent ? "1px solid rgba(255, 255, 255, 0.2)" : "1px solid transparent",
                      cursor: "pointer",
                      transition: "all 0.15s ease"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0, flex: 1 }}>
                      <div
                        style={{
                          width: "20px",
                          height: "20px",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: isCurrent ? "#ffffff" : "transparent",
                          color: isCurrent ? "#000000" : "rgba(255, 255, 255, 0.4)",
                          flexShrink: 0
                        }}
                      >
                        {isCurrent && isPlaying ? (
                          <Pause size={10} fill="#000000" />
                        ) : isCurrent ? (
                          <Play size={10} fill="#000000" style={{ marginLeft: "1px" }} />
                        ) : (
                          <span style={{ fontSize: "0.7rem", fontWeight: 700 }}>
                            {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                          </span>
                        )}
                      </div>

                      <div style={{ minWidth: 0, flex: 1 }}>
                        <p
                          style={{
                            fontSize: "0.8rem",
                            fontWeight: isCurrent ? 700 : 500,
                            color: isCurrent ? "#ffffff" : "rgba(255, 255, 255, 0.85)",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis"
                          }}
                        >
                          {track.title}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                      <span style={{ fontSize: "0.7rem", color: "rgba(255, 255, 255, 0.35)" }}>
                        {formatTime(track.duration)}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavoriteTrack(track.id);
                        }}
                        style={{
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          padding: "2px",
                          display: "flex",
                          alignItems: "center"
                        }}
                      >
                        <Heart
                          size={12}
                          color={isFav ? "#f43f5e" : "rgba(255, 255, 255, 0.25)"}
                          fill={isFav ? "#f43f5e" : "none"}
                        />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Main Glass Dock Bar */}
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
          <div style={{ position: "relative" }}>
            <motion.img
              animate={{ rotate: isPlaying ? 360 : 0 }}
              transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
              src={currentTrack.coverUrl}
              alt={currentTrack.title}
              style={{
                width: "46px",
                height: "46px",
                borderRadius: "12px",
                objectFit: "cover",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.5)"
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: 0 }}>
            <span
              style={{
                fontSize: "0.85rem",
                fontWeight: 700,
                color: "var(--text-primary)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "160px"
              }}
            >
              {currentTrack.title}
            </span>
            <span
              style={{
                fontSize: "0.75rem",
                color: "var(--text-secondary)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "160px"
              }}
            >
              {currentTrack.artist}
            </span>
          </div>

          <button
            onClick={() => toggleFavoriteTrack(currentTrack.id)}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "4px",
              marginLeft: "4px"
            }}
          >
            <Heart
              size={17}
              color={favoritedTrackIds.includes(currentTrack.id) ? "#f43f5e" : "var(--text-muted)"}
              fill={favoritedTrackIds.includes(currentTrack.id) ? "#f43f5e" : "none"}
            />
          </button>
        </div>

        {/* Center: Controls & Scrubber */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", flex: 1, maxWidth: "460px" }}>
          {/* Action Buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
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

            <button
              onClick={togglePlay}
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "#ffffff",
                color: "#000000",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 0 16px rgba(255,255,255,0.4)",
                transition: "transform 0.1s ease"
              }}
            >
              {isPlaying ? <Pause size={17} fill="#000000" /> : <Play size={17} fill="#000000" style={{ marginLeft: "2px" }} />}
            </button>

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
                style={{ zIndex: 2 }}
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

        {/* Right: Queue Popover Button + Lossless & Volume */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: "200px", justifyContent: "flex-end" }}>
          {/* Queue Window Toggle Button */}
          <button
            onClick={() => setIsQueueOpen(!isQueueOpen)}
            style={{
              background: isQueueOpen ? "rgba(255, 255, 255, 0.2)" : "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              color: isQueueOpen ? "#ffffff" : "var(--text-secondary)",
              cursor: "pointer",
              padding: "6px 10px",
              borderRadius: "999px",
              display: "flex",
              alignItems: "center",
              gap: "5px",
              fontSize: "0.75rem",
              fontWeight: 700,
              transition: "all 0.2s ease"
            }}
          >
            <ListMusic size={14} />
            <span>30 Bài</span>
          </button>

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
            <span>FLAC</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", width: "100px" }}>
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

      {/* Background Silent Next-Track Preloader */}
      {nextTrackItem && nextTrackItem.id !== currentTrack.id && (
        <audio src={nextTrackItem.audioUrl} preload="auto" style={{ display: "none" }} />
      )}
    </div>
  );
};
