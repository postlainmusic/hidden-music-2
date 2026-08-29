import React, { useEffect, useRef, useState } from "react";
import { useAudioStore, Track, DEFAULT_TRACKS } from "../store/audioStore";
import { dualDeckAudioEngine, ProgressState } from "../audio/DualDeckAudioEngine";
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
  Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SyncedLyricsView } from "./SyncedLyricsView";
import { studioBeatEngine } from "../audio/StudioBeatEngine";

export const FloatingPlayerDock: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    isBuffering,
    duration,
    volume,
    isMuted,
    bassBoostEnabled,
    togglePlay,
    playTrack,
    nextTrack,
    prevTrack,
    seek,
    setVolume,
    toggleMute,
    toggleBassBoost,
    favoritedTrackIds,
    toggleFavoriteTrack
  } = useAudioStore();

  const [expandedMode, setExpandedMode] = useState<"none" | "lyrics" | "queue">("none");
  const [showVolumeSlider, setShowVolumeSlider] = useState<boolean>(false);
  const [shuffleMode, setShuffleMode] = useState<boolean>(false);
  const [repeatMode, setRepeatMode] = useState<"off" | "all" | "one">("off");
  const [hoverSeekTime, setHoverSeekTime] = useState<number | null>(null);
  const [hoverSeekPos, setHoverSeekPos] = useState<number>(0);
  const [isDraggingSeeker, setIsDraggingSeeker] = useState<boolean>(false);
  const [dragSeekTime, setDragSeekTime] = useState<number | null>(null);

  // Direct DOM Refs for 60fps Zero-GC Audio-Reactive Performance
  const dockContainerRef = useRef<HTMLDivElement | null>(null);
  const mainDockBarRef = useRef<HTMLDivElement | null>(null);
  const visualizerRef = useRef<HTMLCanvasElement | null>(null);
  const miniCoverRef = useRef<HTMLDivElement | null>(null);
  const currentTimeTextRef = useRef<HTMLSpanElement | null>(null);
  const durationTextRef = useRef<HTMLSpanElement | null>(null);
  const playedProgressBarRef = useRef<HTMLDivElement | null>(null);
  const bufferedProgressBarRef = useRef<HTMLDivElement | null>(null);
  const sliderInputRef = useRef<HTMLInputElement | null>(null);
  const topSpecularRef = useRef<HTMLDivElement | null>(null);

  const isFav = currentTrack ? favoritedTrackIds.includes(currentTrack.id) : false;

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || !isFinite(seconds) || seconds < 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

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

  // Direct Ref High-Frequency Progress Subscription (60fps without React state)
  useEffect(() => {
    const unsubscribe = dualDeckAudioEngine.subscribeProgress((state: ProgressState) => {
      if (isDraggingSeeker) return;

      if (currentTimeTextRef.current) {
        currentTimeTextRef.current.textContent = formatTime(state.currentTime);
      }
      if (durationTextRef.current) {
        durationTextRef.current.textContent = formatTime(state.duration);
      }
      if (playedProgressBarRef.current) {
        playedProgressBarRef.current.style.width = `${state.progressPercent}%`;
      }
      if (bufferedProgressBarRef.current) {
        bufferedProgressBarRef.current.style.width = `${state.bufferedPercent}%`;
      }
      if (sliderInputRef.current) {
        sliderInputRef.current.value = String(state.currentTime);
      }
    });

    return () => unsubscribe();
  }, [isDraggingSeeker]);

  // 60FPS Beat Pulse, Snare Strobe & Audio-Reactive Chớp Giật on Playdock
  useEffect(() => {
    let animId: number;
    const canvas = visualizerRef.current;
    const ctx = canvas?.getContext("2d");

    const loop = () => {
      const beatState = studioBeatEngine.getBeatState();

      // 1. Playdock Audio-Reactive Strobe & Border Chớp Giật
      if (mainDockBarRef.current) {
        if (beatState.isSnareHit || beatState.snareStrobe > 0.35) {
          // Snare Hit: Blinding Silver-White & Diamond Specular Flash
          mainDockBarRef.current.style.borderColor = "rgba(255, 255, 255, 0.95)";
          mainDockBarRef.current.style.boxShadow =
            "0 20px 60px rgba(0, 0, 0, 0.98), 0 0 35px rgba(255, 255, 255, 0.65), inset 0 0 15px rgba(255, 255, 255, 0.35)";
          if (topSpecularRef.current) topSpecularRef.current.style.opacity = "1.0";
        } else if (beatState.isKickHit || beatState.isKickRoll || beatState.kickImpact > 0.35) {
          // Kick / 808 Hit: Blazing Crimson Red Flash
          mainDockBarRef.current.style.borderColor = "rgba(239, 68, 68, 0.95)";
          mainDockBarRef.current.style.boxShadow =
            "0 20px 60px rgba(0, 0, 0, 0.98), 0 0 35px rgba(239, 68, 68, 0.65), inset 0 0 15px rgba(239, 68, 68, 0.25)";
          if (topSpecularRef.current) topSpecularRef.current.style.opacity = "0.75";
        } else if (beatState.subImpact > 0.25) {
          // Sub-Bass Glow
          mainDockBarRef.current.style.borderColor = "rgba(185, 28, 28, 0.65)";
          mainDockBarRef.current.style.boxShadow =
            "0 20px 50px rgba(0, 0, 0, 0.95), 0 0 25px rgba(185, 28, 28, 0.45)";
          if (topSpecularRef.current) topSpecularRef.current.style.opacity = "0.5";
        } else {
          mainDockBarRef.current.style.borderColor = isPlaying ? "rgba(239, 68, 68, 0.30)" : "rgba(255, 255, 255, 0.14)";
          mainDockBarRef.current.style.boxShadow =
            "0 20px 50px rgba(0, 0, 0, 0.95), 0 0 20px rgba(239, 68, 68, 0.12)";
          if (topSpecularRef.current) topSpecularRef.current.style.opacity = "0.35";
        }
      }

      // 2. Mini Cover Beat Reaction
      if (miniCoverRef.current) {
        if (beatState.isSnareHit) {
          miniCoverRef.current.style.transform = "scale(1.09)";
          miniCoverRef.current.style.boxShadow = "0 0 18px rgba(255, 255, 255, 0.9)";
        } else if (beatState.isKickHit || beatState.isKickRoll) {
          miniCoverRef.current.style.transform = "scale(1.08)";
          miniCoverRef.current.style.boxShadow = "0 0 16px rgba(239, 68, 68, 0.9)";
        } else if (beatState.isSubHit) {
          miniCoverRef.current.style.transform = "scale(1.04)";
          miniCoverRef.current.style.boxShadow = "0 0 14px rgba(185, 28, 28, 0.75)";
        } else {
          miniCoverRef.current.style.transform = "scale(1.0)";
          miniCoverRef.current.style.boxShadow = "0 4px 14px rgba(0,0,0,0.5)";
        }
      }

      // 3. Mini Equalizer Spectrum Canvas in Dock Center
      if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const bars = 10;
        const barWidth = 3;
        const gap = 3;
        const maxH = canvas.height;

        for (let i = 0; i < bars; i++) {
          const x = i * (barWidth + gap);
          let h = 3;
          if (isPlaying) {
            if (i < 3) h = Math.max(3, beatState.subImpact * maxH * 0.95);
            else if (i < 5) h = Math.max(3, beatState.kickImpact * maxH * 0.90);
            else if (i < 8) h = Math.max(3, (beatState.snareImpact * 0.6 + beatState.vocalPresence * 0.4) * maxH * 0.85);
            else h = Math.max(3, beatState.trebleEnergy * maxH * 0.80);
          }

          ctx.fillStyle = isPlaying
            ? i < 4
              ? "#ef4444"
              : beatState.isSnareHit
              ? "#ffffff"
              : "rgba(255, 255, 255, 0.85)"
            : "rgba(255, 255, 255, 0.25)";
          ctx.beginPath();
          ctx.roundRect(x, maxH - h, barWidth, h, 1.5);
          ctx.fill();
        }
      }

      animId = requestAnimationFrame(loop);
    };

    loop();
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  if (!currentTrack) return null;

  const effectiveDuration = duration && duration > 0 ? duration : currentTrack.duration;

  return (
    <div
      ref={dockContainerRef}
      style={{
        position: "fixed",
        bottom: "24px",
        left: 0,
        right: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        zIndex: 60,
        pointerEvents: "none",
        padding: "0 20px",
      }}
    >
      {/* ─────────────────────────────────────────────────────────────────────
          SEAMLESS UNIFIED SLIDING GLASS DRAWER (ATTACHED DIRECTLY TO DOCK)
      ────────────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {expandedMode !== "none" && (
          <motion.div
            initial={{ opacity: 0, y: 15, scaleY: 0.95 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: 15, scaleY: 0.95 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            style={{
              width: "min(860px, calc(100vw - 40px))",
              height: "min(440px, 52vh)",
              borderRadius: "28px 28px 12px 12px",
              background: "rgba(8, 9, 14, 0.95)",
              border: "1px solid rgba(239, 68, 68, 0.4)",
              borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
              boxShadow: "0 30px 80px rgba(0, 0, 0, 0.98), 0 0 40px rgba(239, 68, 68, 0.25)",
              backdropFilter: "blur(36px)",
              WebkitBackdropFilter: "blur(36px)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              pointerEvents: "auto",
              marginBottom: "-6px", // Seamlessly connects to main dock
              zIndex: 70,
              transformOrigin: "bottom center",
            }}
          >
            {/* Header Tabs: Lyrics vs Queue Switcher */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 20px",
                borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                background: "rgba(239, 68, 68, 0.04)",
              }}
            >
              {/* Tab Switcher */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <button
                  onClick={() => setExpandedMode("lyrics")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "6px 14px",
                    borderRadius: "999px",
                    background: expandedMode === "lyrics" ? "rgba(239, 68, 68, 0.25)" : "transparent",
                    border: expandedMode === "lyrics" ? "1px solid rgba(239, 68, 68, 0.6)" : "1px solid transparent",
                    color: expandedMode === "lyrics" ? "#ffffff" : "rgba(255, 255, 255, 0.5)",
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  <Mic2 size={14} color={expandedMode === "lyrics" ? "#ef4444" : "currentColor"} />
                  <span>Lời bài hát đồng bộ</span>
                </button>

                <button
                  onClick={() => setExpandedMode("queue")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "6px 14px",
                    borderRadius: "999px",
                    background: expandedMode === "queue" ? "rgba(239, 68, 68, 0.25)" : "transparent",
                    border: expandedMode === "queue" ? "1px solid rgba(239, 68, 68, 0.6)" : "1px solid transparent",
                    color: expandedMode === "queue" ? "#ffffff" : "rgba(255, 255, 255, 0.5)",
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  <ListMusic size={14} color={expandedMode === "queue" ? "#ef4444" : "currentColor"} />
                  <span>Danh sách phát (30 Tracks)</span>
                </button>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setExpandedMode("none")}
                style={{
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  borderRadius: "50%",
                  width: "28px",
                  height: "28px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffffff",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
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
                <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: "4px" }}>
                  {DEFAULT_TRACKS.map((track, idx) => {
                    const isCur = track.id === currentTrack.id;
                    const isTrackFav = favoritedTrackIds.includes(track.id);

                    return (
                      <div
                        key={track.id}
                        onClick={() => playTrack(track, { crossfade: true })}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "8px 14px",
                          borderRadius: "14px",
                          background: isCur ? "rgba(239, 68, 68, 0.18)" : "rgba(255, 255, 255, 0.02)",
                          border: isCur ? "1px solid rgba(239, 68, 68, 0.45)" : "1px solid transparent",
                          cursor: "pointer",
                          transition: "all 0.18s ease",
                        }}
                        onMouseEnter={(e) => {
                          if (!isCur) (e.currentTarget as HTMLElement).style.background = "rgba(255, 255, 255, 0.06)";
                        }}
                        onMouseLeave={(e) => {
                          if (!isCur) (e.currentTarget as HTMLElement).style.background = "rgba(255, 255, 255, 0.02)";
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0, flex: 1 }}>
                          <span
                            style={{
                              fontSize: "0.78rem",
                              fontWeight: 800,
                              color: isCur ? "#ef4444" : "rgba(255, 255, 255, 0.4)",
                              width: "22px",
                            }}
                          >
                            {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                          </span>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <p
                              style={{
                                fontSize: "0.85rem",
                                fontWeight: isCur ? 800 : 600,
                                color: isCur ? "#ffffff" : "rgba(255, 255, 255, 0.85)",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {track.title}
                            </p>
                            <p style={{ fontSize: "0.72rem", color: "rgba(255, 255, 255, 0.45)" }}>
                              {track.artist}
                            </p>
                          </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          {isCur && isPlaying && <Disc3 size={15} color="#ef4444" className="animate-spin" />}
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
                            <Heart
                              size={14}
                              color={isTrackFav ? "#ef4444" : "rgba(255, 255, 255, 0.3)"}
                              fill={isTrackFav ? "#ef4444" : "none"}
                            />
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
          MAIN FLOATING PLAYBAR DOCK (LUXURY GLASS CONTAINER WITH AUDIO PULSE)
      ────────────────────────────────────────────────────────────────────── */}
      <div
        ref={mainDockBarRef}
        style={{
          width: "100%",
          maxWidth: "860px",
          padding: "10px 20px",
          borderRadius: expandedMode !== "none" ? "12px 12px 26px 26px" : "26px",
          background: "rgba(10, 11, 16, 0.90)",
          border: "1px solid rgba(255, 255, 255, 0.16)",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.95), 0 0 25px rgba(239, 68, 68, 0.18)",
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          pointerEvents: "auto",
          position: "relative",
          overflow: "visible",
          transition: "border-radius 0.25s ease, border-color 0.08s ease, box-shadow 0.08s ease",
        }}
      >
        {/* Top Specular Reflection Glow Line */}
        <div
          ref={topSpecularRef}
          style={{
            position: "absolute",
            top: 0,
            left: "15%",
            right: "15%",
            height: "1px",
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.75), transparent)",
            pointerEvents: "none",
            opacity: 0.4,
            transition: "opacity 0.08s ease",
          }}
        />

        {/* 1. LEFT: FIXED-WIDTH LOCKED METADATA (220px STRICT) */}
        <div
          onClick={() => setExpandedMode((prev) => (prev === "lyrics" ? "none" : "lyrics"))}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            width: "220px",
            minWidth: "220px",
            maxWidth: "220px",
            flexShrink: 0,
            cursor: "pointer",
            overflow: "hidden",
          }}
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
              transition: "transform 0.08s ease-out, box-shadow 0.08s ease-out",
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
                  border: "1.5px solid rgba(239, 68, 68, 0.6)",
                  pointerEvents: "none",
                }}
              />
            )}
          </div>

          <div style={{ overflow: "hidden", flex: 1, minWidth: 0 }}>
            <h4
              style={{
                fontSize: "0.88rem",
                fontWeight: 800,
                color: "#ffffff",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                letterSpacing: "0.02em",
                margin: 0,
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
                  background: "#ef4444",
                  boxShadow: "0 0 6px #ef4444",
                  flexShrink: 0,
                }}
              />
              <p
                style={{
                  fontSize: "0.74rem",
                  color: "rgba(255, 255, 255, 0.55)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  margin: 0,
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
            }}
          >
            <Heart size={14} color={isFav ? "#ef4444" : "rgba(255,255,255,0.4)"} fill={isFav ? "#ef4444" : "none"} />
          </button>
        </div>

        {/* 2. CENTER: TRANSPORT CONTROLS & CLEAN CONTINUOUS LINE SCRUBBER */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "4px",
            flex: 1,
            minWidth: 0,
          }}
        >
          {/* Top Control Buttons Row */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            {/* Shuffle Button */}
            <button
              onClick={() => setShuffleMode((prev) => !prev)}
              style={{
                background: "transparent",
                border: "none",
                color: shuffleMode ? "#ef4444" : "rgba(255, 255, 255, 0.4)",
                cursor: "pointer",
                padding: "4px",
              }}
            >
              <Shuffle size={14} />
            </button>

            {/* Previous Track Button */}
            <button
              onClick={prevTrack}
              style={{
                background: "transparent",
                border: "none",
                color: "#ffffff",
                cursor: "pointer",
                padding: "4px",
              }}
            >
              <SkipBack size={17} />
            </button>

            {/* Primary Play / Pause Circle Button */}
            <button
              onClick={togglePlay}
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: "#ffffff",
                color: "#000000",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 0 16px rgba(255, 255, 255, 0.4)",
                transition: "transform 0.15s ease",
              }}
            >
              {isBuffering ? (
                <Loader2 size={18} className="animate-spin text-black" />
              ) : isPlaying ? (
                <Pause size={18} fill="#000000" />
              ) : (
                <Play size={18} fill="#000000" style={{ marginLeft: "2px" }} />
              )}
            </button>

            {/* Next Track Button */}
            <button
              onClick={nextTrack}
              style={{
                background: "transparent",
                border: "none",
                color: "#ffffff",
                cursor: "pointer",
                padding: "4px",
              }}
            >
              <SkipForward size={17} />
            </button>

            {/* Repeat Button */}
            <button
              onClick={handleToggleRepeat}
              style={{
                background: "transparent",
                border: "none",
                color: repeatMode !== "off" ? "#ef4444" : "rgba(255, 255, 255, 0.4)",
                cursor: "pointer",
                padding: "4px",
              }}
            >
              {repeatMode === "one" ? <Repeat1 size={14} /> : <Repeat size={14} />}
            </button>

            {/* Mini Visualizer Canvas */}
            <canvas ref={visualizerRef} width={75} height={18} style={{ marginLeft: "4px" }} />
          </div>

          {/* Clean Continuous Line Scrubber (No Chunk Waveform Ticks) */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%" }}>
            <span
              ref={currentTimeTextRef}
              style={{
                fontSize: "0.72rem",
                fontWeight: 700,
                color: "rgba(255, 255, 255, 0.45)",
                minWidth: "32px",
                textAlign: "right",
              }}
            >
              0:00
            </span>

            <div
              style={{
                position: "relative",
                flex: 1,
                display: "flex",
                alignItems: "center",
                height: "16px",
                cursor: "pointer",
              }}
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
                    bottom: "22px",
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
                    zIndex: 20,
                  }}
                >
                  {formatTime(hoverSeekTime)}
                </div>
              )}

              {/* Background Track Groove */}
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  height: "3.5px",
                  borderRadius: "999px",
                  background: "rgba(255, 255, 255, 0.12)",
                  pointerEvents: "none",
                }}
              />

              {/* Buffered Stream Progress Bar */}
              <div
                ref={bufferedProgressBarRef}
                style={{
                  position: "absolute",
                  left: 0,
                  height: "3.5px",
                  borderRadius: "999px",
                  background: "rgba(255, 255, 255, 0.25)",
                  width: "0%",
                  pointerEvents: "none",
                  zIndex: 1,
                  transition: "width 0.25s ease",
                }}
              />

              {/* Active Played Progress Bar */}
              <div
                ref={playedProgressBarRef}
                style={{
                  position: "absolute",
                  left: 0,
                  height: "3.5px",
                  borderRadius: "999px",
                  background: "linear-gradient(90deg, #ef4444, #f97316)",
                  width: "0%",
                  pointerEvents: "none",
                  boxShadow: "0 0 10px rgba(239, 68, 68, 0.8)",
                  zIndex: 2,
                }}
              />

              {/* Native Slider Input */}
              <input
                ref={sliderInputRef}
                type="range"
                min={0}
                max={effectiveDuration}
                defaultValue={0}
                onMouseDown={() => setIsDraggingSeeker(true)}
                onTouchStart={() => setIsDraggingSeeker(true)}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setDragSeekTime(val);
                  if (currentTimeTextRef.current) {
                    currentTimeTextRef.current.textContent = formatTime(val);
                  }
                  if (playedProgressBarRef.current && effectiveDuration > 0) {
                    playedProgressBarRef.current.style.width = `${(val / effectiveDuration) * 100}%`;
                  }
                }}
                onMouseUp={() => {
                  setIsDraggingSeeker(false);
                  if (dragSeekTime !== null) {
                    seek(dragSeekTime);
                    setDragSeekTime(null);
                  }
                }}
                onTouchEnd={() => {
                  setIsDraggingSeeker(false);
                  if (dragSeekTime !== null) {
                    seek(dragSeekTime);
                    setDragSeekTime(null);
                  }
                }}
                style={{ width: "100%", height: "16px", zIndex: 3, cursor: "pointer", opacity: 0 }}
              />
            </div>

            <span
              ref={durationTextRef}
              style={{
                fontSize: "0.72rem",
                fontWeight: 700,
                color: "rgba(255, 255, 255, 0.45)",
                minWidth: "32px",
              }}
            >
              {formatTime(effectiveDuration)}
            </span>
          </div>
        </div>

        {/* 3. RIGHT: TOOL BUTTONS & SEAMLESS INTEGRATED VOLUME (220px STRICT) */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            width: "220px",
            minWidth: "220px",
            maxWidth: "220px",
            flexShrink: 0,
            justifyContent: "flex-end",
            position: "relative",
          }}
        >
          {/* Punchy Sub-Bass Enhancer Toggle */}
          <button
            onClick={toggleBassBoost}
            title={bassBoostEnabled ? "Tắt Punchy Bass Boost" : "Bật Punchy Bass Boost (+5.5dB 70Hz)"}
            style={{
              background: bassBoostEnabled
                ? "linear-gradient(135deg, #ef4444, #b91c1c)"
                : "rgba(255, 255, 255, 0.08)",
              color: "#ffffff",
              border: bassBoostEnabled
                ? "1px solid rgba(239, 68, 68, 0.8)"
                : "1px solid rgba(255, 255, 255, 0.15)",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: bassBoostEnabled ? "0 0 14px rgba(239, 68, 68, 0.8)" : "none",
              transition: "all 0.25s ease",
            }}
          >
            <Zap size={14} fill={bassBoostEnabled ? "#ffffff" : "none"} />
          </button>

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
              transition: "all 0.2s ease",
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
              transition: "all 0.2s ease",
            }}
          >
            <ListMusic size={15} />
          </button>

          {/* Seamless Integrated Volume Slider Popover */}
          <div
            style={{ position: "relative" }}
            onMouseEnter={() => setShowVolumeSlider(true)}
            onMouseLeave={() => setShowVolumeSlider(false)}
          >
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
                transition: "all 0.2s ease",
              }}
            >
              {isMuted || volume === 0 ? (
                <VolumeX size={15} color="#ef4444" />
              ) : volume >= 0.5 ? (
                <Volume2 size={15} />
              ) : (
                <Volume1 size={15} />
              )}
            </button>

            {/* Seamless Docked Vertical Volume Slider */}
            <AnimatePresence>
              {showVolumeSlider && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    position: "absolute",
                    bottom: "38px",
                    right: "-2px",
                    padding: "12px 8px",
                    borderRadius: "18px",
                    background: "rgba(10, 11, 16, 0.96)",
                    border: "1px solid rgba(239, 68, 68, 0.4)",
                    boxShadow: "0 15px 40px rgba(0, 0, 0, 0.95), 0 0 20px rgba(239, 68, 68, 0.3)",
                    backdropFilter: "blur(28px)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "8px",
                    zIndex: 100,
                  }}
                >
                  <span style={{ fontSize: "0.70rem", fontWeight: 800, color: "#ffffff" }}>
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
                      height: "85px",
                      cursor: "pointer",
                      accentColor: "#ef4444",
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FloatingPlayerDock;
