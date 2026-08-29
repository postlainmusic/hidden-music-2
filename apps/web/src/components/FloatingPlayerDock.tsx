import React, { useEffect, useRef, useState } from "react";
import { useAudioStore, Track, DEFAULT_TRACKS } from "../store/audioStore";
import {
  Play,
  Pause,
  Loader2,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  Volume1,
  VolumeX,
  ListMusic,
  Mic2,
  Heart,
  Disc3,
  X,
  Trash2,
  ChevronDown,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SyncedLyricsView } from "./SyncedLyricsView";
import { studioBeatEngine } from "../audio/StudioBeatEngine";

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

  const [expandedMode, setExpandedMode] = useState<"none" | "lyrics" | "queue">("none");
  const [showVolumeSlider, setShowVolumeSlider] = useState<boolean>(false);
  const [shuffleMode, setShuffleMode] = useState<boolean>(false);
  const [repeatMode, setRepeatMode] = useState<"off" | "all" | "one">("off");
  const [hoverSeekTime, setHoverSeekTime] = useState<number | null>(null);
  const [hoverSeekPos, setHoverSeekPos] = useState<number>(0);

  const dockContainerRef = useRef<HTMLDivElement | null>(null);
  const visualizerRef = useRef<HTMLCanvasElement | null>(null);
  const miniCoverRef = useRef<HTMLDivElement | null>(null);
  const volumeSliderRef = useRef<HTMLDivElement | null>(null);

  const isDraggingSeeker = useRef<boolean>(false);

  const isFav = currentTrack ? favoritedTrackIds.includes(currentTrack.id) : false;

  // Toggle Repeat: off -> all -> one -> off
  const handleToggleRepeat = () => {
    setRepeatMode((prev) => (prev === "off" ? "all" : prev === "all" ? "one" : "off"));
  };

  // Close drawers when clicking outside
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (dockContainerRef.current && !dockContainerRef.current.contains(e.target as Node)) {
        setExpandedMode("none");
        setShowVolumeSlider(false);
      }
    };
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, []);

  // 60FPS Beat Pulse on Mini Cover & Equalizer Canvas
  useEffect(() => {
    let animId: number;
    const canvas = visualizerRef.current;
    const ctx = canvas?.getContext("2d");

    const loop = () => {
      const beatState = studioBeatEngine.getBeatState();

      // Beat pulse on mini cover
      if (miniCoverRef.current) {
        if (beatState.isKickHit) {
          miniCoverRef.current.style.transform = "scale(1.08)";
          miniCoverRef.current.style.boxShadow = "0 0 16px rgba(239, 68, 68, 0.7)";
        } else if (beatState.isSubHit) {
          miniCoverRef.current.style.transform = "scale(1.04)";
          miniCoverRef.current.style.boxShadow = "0 0 14px rgba(99, 102, 241, 0.6)";
        } else {
          miniCoverRef.current.style.transform = "scale(1.0)";
          miniCoverRef.current.style.boxShadow = "0 4px 14px rgba(0,0,0,0.5)";
        }
      }

      // Draw 16-bar frequency equalizer
      if (canvas && ctx) {
        const freqData = isPlaying ? getFrequencyData() : new Uint8Array(16);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const barCount = 14;
        const barWidth = 3;
        const gap = 2;
        const totalWidth = barCount * (barWidth + gap);
        const startX = (canvas.width - totalWidth) / 2;

        for (let i = 0; i < barCount; i++) {
          const value = isPlaying ? freqData[i % freqData.length] / 255 : 0.12 + Math.sin(Date.now() * 0.003 + i) * 0.06;
          const barHeight = Math.max(3, value * canvas.height * 0.88);
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
      }

      animId = requestAnimationFrame(loop);
    };

    loop();
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, getFrequencyData, currentTrack]);

  if (!currentTrack) return null;

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || !isFinite(seconds) || seconds < 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const effectiveDuration = duration || currentTrack.duration || 180;
  const progressPercent = effectiveDuration > 0 ? (currentTime / effectiveDuration) * 100 : 0;

  return (
    <div
      ref={dockContainerRef}
      style={{
        position: "fixed",
        bottom: "20px",
        left: 0,
        right: 0,
        zIndex: 50,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "0 16px",
        pointerEvents: "none"
      }}
    >
      {/* ─────────────────────────────────────────────────────────────────────
          EXPANDED SLIDE-UP DRAWER (LYRICS & QUEUE)
      ────────────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {expandedMode !== "none" && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            style={{
              width: "100%",
              maxWidth: "880px",
              height: "320px",
              marginBottom: "12px",
              borderRadius: "28px",
              background: "rgba(10, 11, 16, 0.92)",
              border: "1px solid rgba(255, 255, 255, 0.16)",
              boxShadow: "0 25px 60px rgba(0, 0, 0, 0.95), 0 0 30px rgba(99, 102, 241, 0.15)",
              backdropFilter: "blur(32px)",
              WebkitBackdropFilter: "blur(32px)",
              pointerEvents: "auto",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              position: "relative"
            }}
          >
            {/* Drawer Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 20px",
                borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                background: "rgba(255, 255, 255, 0.02)"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {expandedMode === "lyrics" ? (
                  <>
                    <Mic2 size={16} color="#a78bfa" />
                    <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#ffffff", letterSpacing: "0.04em" }}>
                      LỜI BÀI HÁT ĐỒNG BỘ • {currentTrack.title}
                    </span>
                  </>
                ) : (
                  <>
                    <ListMusic size={16} color="#38bdf8" />
                    <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#ffffff", letterSpacing: "0.04em" }}>
                      DANH SÁCH PHÁT ({DEFAULT_TRACKS.length} TRACKS)
                    </span>
                  </>
                )}
              </div>

              <button
                onClick={() => setExpandedMode("none")}
                style={{
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "none",
                  borderRadius: "50%",
                  width: "28px",
                  height: "28px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffffff",
                  cursor: "pointer"
                }}
              >
                <X size={14} />
              </button>
            </div>

            {/* Drawer Content Body */}
            <div style={{ flex: 1, overflowY: "auto", position: "relative" }}>
              {expandedMode === "lyrics" ? (
                <SyncedLyricsView onSeek={(t) => seek(t)} />
              ) : (
                <div style={{ padding: "10px 14px", display: "flex", flexDirection: "column", gap: "4px" }}>
                  {DEFAULT_TRACKS.map((track, idx) => {
                    const isCur = track.id === currentTrack.id;
                    const isTrackFav = favoritedTrackIds.includes(track.id);

                    return (
                      <div
                        key={track.id}
                        onClick={() => playTrack(track)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "8px 14px",
                          borderRadius: "14px",
                          background: isCur ? "rgba(255, 255, 255, 0.12)" : "rgba(255, 255, 255, 0.02)",
                          border: isCur ? "1px solid rgba(255, 255, 255, 0.25)" : "1px solid transparent",
                          cursor: "pointer",
                          transition: "all 0.2s ease"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0, flex: 1 }}>
                          <span style={{ fontSize: "0.78rem", fontWeight: 700, color: isCur ? "#ffffff" : "rgba(255, 255, 255, 0.4)", width: "20px" }}>
                            {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                          </span>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <p style={{ fontSize: "0.85rem", fontWeight: isCur ? 800 : 600, color: isCur ? "#ffffff" : "rgba(255, 255, 255, 0.85)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {track.title}
                            </p>
                            <p style={{ fontSize: "0.72rem", color: "rgba(255, 255, 255, 0.45)" }}>{track.artist}</p>
                          </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          {isCur && isPlaying && <Disc3 size={15} color="#38bdf8" className="animate-spin" />}
                          <span style={{ fontSize: "0.74rem", color: "rgba(255, 255, 255, 0.4)" }}>
                            {formatTime(track.duration)}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavoriteTrack(track.id);
                            }}
                            style={{ background: "transparent", border: "none", cursor: "pointer", padding: "2px" }}
                          >
                            <Heart size={14} color={isTrackFav ? "#f43f5e" : "rgba(255, 255, 255, 0.3)"} fill={isTrackFav ? "#f43f5e" : "none"} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─────────────────────────────────────────────────────────────────────
          MAIN FLOATING PLAYBAR DOCK (LUXURY GLASS CONTAINER)
      ────────────────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        style={{
          width: "100%",
          maxWidth: "960px",
          padding: "10px 20px",
          borderRadius: "26px",
          background: "rgba(10, 11, 16, 0.88)",
          border: "1px solid rgba(255, 255, 255, 0.16)",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.95), 0 0 25px rgba(99, 102, 241, 0.18)",
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          pointerEvents: "auto",
          position: "relative",
          overflow: "visible"
        }}
      >
        {/* Top Specular Reflection Glow Line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "15%",
            right: "15%",
            height: "1px",
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent)",
            pointerEvents: "none"
          }}
        />

        {/* 1. LEFT: TRACK METADATA & AUDIO-REACTIVE MINI ARTWORK */}
        <div
          onClick={() => setExpandedMode((prev) => (prev === "lyrics" ? "none" : "lyrics"))}
          style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: "200px", maxWidth: "240px", cursor: "pointer" }}
        >
          <div
            ref={miniCoverRef}
            style={{
              position: "relative",
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              overflow: "hidden",
              flexShrink: 0,
              transition: "transform 0.08s ease-out, box-shadow 0.08s ease-out"
            }}
          >
            <img
              src={currentTrack.coverUrl}
              alt={currentTrack.title}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            {isPlaying && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "12px",
                  border: "1.5px solid rgba(255, 255, 255, 0.4)",
                  pointerEvents: "none"
                }}
              />
            )}
          </div>

          <div style={{ overflow: "hidden", minWidth: 0 }}>
            <h4
              style={{
                fontSize: "0.88rem",
                fontWeight: 800,
                color: "#ffffff",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                letterSpacing: "0.02em"
              }}
            >
              {currentTrack.title}
            </h4>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "#10b981",
                  boxShadow: "0 0 6px #10b981",
                  flexShrink: 0
                }}
              />
              <p
                style={{
                  fontSize: "0.74rem",
                  color: "rgba(255, 255, 255, 0.55)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis"
                }}
              >
                {currentTrack.artist}
              </p>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavoriteTrack(currentTrack.id);
            }}
            style={{
              background: "rgba(255, 255, 255, 0.06)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "50%",
              width: "28px",
              height: "28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              flexShrink: 0,
              marginLeft: "4px"
            }}
          >
            <Heart size={13} color={isFav ? "#f43f5e" : "rgba(255, 255, 255, 0.4)"} fill={isFav ? "#f43f5e" : "none"} />
          </button>
        </div>

        {/* 2. CENTER: CONTROLS & HOVER TIMELINE SCRUBBER */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", flex: 1, maxWidth: "480px" }}>
          {/* Controls Bar */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {/* Shuffle */}
            <button
              onClick={() => setShuffleMode((prev) => !prev)}
              title={shuffleMode ? "Tắt trộn bài" : "Bật trộn bài"}
              style={{
                background: shuffleMode ? "#ffffff" : "rgba(255, 255, 255, 0.06)",
                color: shuffleMode ? "#000000" : "rgba(255, 255, 255, 0.6)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: "50%",
                width: "28px",
                height: "28px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
            >
              <Shuffle size={13} />
            </button>

            {/* Prev Track */}
            <button
              onClick={prevTrack}
              title="Bài trước"
              style={{
                background: "rgba(255, 255, 255, 0.06)",
                color: "#ffffff",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: "50%",
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer"
              }}
            >
              <SkipBack size={15} />
            </button>

            {/* Main Play/Pause Button */}
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={togglePlay}
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "50%",
                background: "#ffffff",
                border: "none",
                color: "#090a0f",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 0 20px rgba(255, 255, 255, 0.5)"
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

            {/* Next Track */}
            <button
              onClick={nextTrack}
              title="Bài kế tiếp"
              style={{
                background: "rgba(255, 255, 255, 0.06)",
                color: "#ffffff",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: "50%",
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer"
              }}
            >
              <SkipForward size={15} />
            </button>

            {/* Repeat */}
            <button
              onClick={handleToggleRepeat}
              title={`Chế độ lặp: ${repeatMode}`}
              style={{
                background: repeatMode !== "off" ? "#ffffff" : "rgba(255, 255, 255, 0.06)",
                color: repeatMode !== "off" ? "#000000" : "rgba(255, 255, 255, 0.6)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: "50%",
                width: "28px",
                height: "28px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
            >
              {repeatMode === "one" ? <Repeat1 size={13} /> : <Repeat size={13} />}
            </button>

            {/* Mini Visualizer Canvas */}
            <canvas ref={visualizerRef} width={75} height={18} style={{ marginLeft: "4px" }} />
          </div>

          {/* Timeline & Scrubber with Hover Time Tooltip */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%" }}>
            <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "rgba(255, 255, 255, 0.45)", minWidth: "32px", textAlign: "right" }}>
              {formatTime(currentTime)}
            </span>

            <div
              style={{ position: "relative", flex: 1, display: "flex", alignItems: "center", padding: "4px 0", cursor: "pointer" }}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                setHoverSeekPos(ratio * 100);
                setHoverSeekTime(ratio * effectiveDuration);
              }}
              onMouseLeave={() => setHoverSeekTime(null)}
            >
              {/* Hover Timestamp Badge */}
              {hoverSeekTime !== null && (
                <div
                  style={{
                    position: "absolute",
                    bottom: "16px",
                    left: `${hoverSeekPos}%`,
                    transform: "translateX(-50%)",
                    padding: "2px 6px",
                    borderRadius: "6px",
                    background: "#090a0f",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    color: "#ffffff",
                    fontSize: "0.68rem",
                    fontWeight: 800,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.8)",
                    pointerEvents: "none",
                    zIndex: 20
                  }}
                >
                  {formatTime(hoverSeekTime)}
                </div>
              )}

              <input
                type="range"
                min={0}
                max={effectiveDuration}
                value={currentTime}
                onMouseDown={() => { isDraggingSeeker.current = true; }}
                onChange={(e) => {
                  seek(Number(e.target.value));
                }}
                onMouseUp={() => { isDraggingSeeker.current = false; }}
                style={{ width: "100%", height: "4px", zIndex: 2, cursor: "pointer" }}
              />

              <div
                style={{
                  position: "absolute",
                  left: 0,
                  height: "4px",
                  borderRadius: "999px",
                  background: `linear-gradient(90deg, ${currentTrack.palette?.primary || "#6366f1"}, ${currentTrack.palette?.secondary || "#ec4899"})`,
                  width: `${progressPercent}%`,
                  pointerEvents: "none",
                  boxShadow: "0 0 8px rgba(99, 102, 241, 0.6)"
                }}
              />
            </div>

            <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "rgba(255, 255, 255, 0.45)", minWidth: "32px" }}>
              {formatTime(effectiveDuration)}
            </span>
          </div>
        </div>

        {/* 3. RIGHT: TOOL BUTTONS & VERTICAL VOLUME SLIDER */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: "190px", justifyContent: "flex-end", position: "relative" }}>
          {/* Synced Lyrics Toggle Button */}
          <button
            onClick={() => setExpandedMode((prev) => (prev === "lyrics" ? "none" : "lyrics"))}
            title="Lời bài hát đồng bộ"
            style={{
              background: expandedMode === "lyrics" ? "#ffffff" : "rgba(255, 255, 255, 0.08)",
              color: expandedMode === "lyrics" ? "#000000" : "#ffffff",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
          >
            <Mic2 size={15} />
          </button>

          {/* Queue Drawer Toggle Button */}
          <button
            onClick={() => setExpandedMode((prev) => (prev === "queue" ? "none" : "queue"))}
            title="Danh sách phát"
            style={{
              background: expandedMode === "queue" ? "#ffffff" : "rgba(255, 255, 255, 0.08)",
              color: expandedMode === "queue" ? "#000000" : "#ffffff",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
          >
            <ListMusic size={15} />
          </button>

          {/* Vertical Volume Slider Toggle */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowVolumeSlider((prev) => !prev)}
              onDoubleClick={toggleMute}
              title={`Âm lượng: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
              style={{
                background: showVolumeSlider ? "#ffffff" : "rgba(255, 255, 255, 0.08)",
                color: showVolumeSlider ? "#000000" : "#ffffff",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                borderRadius: "50%",
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
            >
              {isMuted || volume === 0 ? <VolumeX size={15} color="#f43f5e" /> : volume >= 0.5 ? <Volume2 size={15} /> : <Volume1 size={15} />}
            </button>

            {/* Vertical Volume Slider Popup */}
            {showVolumeSlider && (
              <div
                ref={volumeSliderRef}
                style={{
                  position: "absolute",
                  bottom: "44px",
                  right: "-6px",
                  padding: "14px 10px",
                  borderRadius: "20px",
                  background: "rgba(10, 11, 16, 0.95)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  boxShadow: "0 15px 40px rgba(0, 0, 0, 0.9)",
                  backdropFilter: "blur(24px)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "10px",
                  zIndex: 100
                }}
              >
                <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "#ffffff" }}>
                  {Math.round((isMuted ? 0 : volume) * 100)}%
                </span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={isMuted ? 0 : volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  style={{
                    writingMode: "vertical-lr",
                    direction: "rtl",
                    width: "6px",
                    height: "90px",
                    cursor: "pointer"
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
