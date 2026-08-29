import React, { useEffect, useRef, useState, useCallback } from "react";
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
  X
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
    togglePlay,
    playTrack,
    nextTrack,
    prevTrack,
    seek,
    setVolume,
    toggleMute,
    favoritedTrackIds,
    toggleFavoriteTrack
  } = useAudioStore();

  const [expandedMode, setExpandedMode] = useState<"none" | "lyrics" | "queue">("none");
  const [showInlineVolume, setShowInlineVolume] = useState<boolean>(false);
  const [shuffleMode, setShuffleMode] = useState<boolean>(false);
  const [repeatMode, setRepeatMode] = useState<"off" | "all" | "one">("off");
  const [hoverSeekTime, setHoverSeekTime] = useState<number | null>(null);
  const [hoverSeekPos, setHoverSeekPos] = useState<number>(0);

  // Direct DOM Refs for 60fps Zero-GC Audio-Reactive Performance
  const dockContainerRef = useRef<HTMLDivElement | null>(null);
  const mainDockBarRef = useRef<HTMLDivElement | null>(null);
  const miniCoverRef = useRef<HTMLDivElement | null>(null);
  const currentTimeTextRef = useRef<HTMLSpanElement | null>(null);
  const durationTextRef = useRef<HTMLSpanElement | null>(null);
  const playedProgressBarRef = useRef<HTMLDivElement | null>(null);
  const bufferedProgressBarRef = useRef<HTMLDivElement | null>(null);
  const scrubberTrackRef = useRef<HTMLDivElement | null>(null);
  const topSpecularRef = useRef<HTMLDivElement | null>(null);

  // Scrubber Drag State
  const isDraggingSeekerRef = useRef<boolean>(false);
  const dragSeekTimeRef = useRef<number | null>(null);
  const latestDurationRef = useRef<number>(0);

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
      }
    };
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, []);

  // Direct Ref High-Frequency Progress Subscription (60fps without React state)
  useEffect(() => {
    const unsubscribe = dualDeckAudioEngine.subscribeProgress((state: ProgressState) => {
      if (state.duration && state.duration > 0) {
        latestDurationRef.current = state.duration;
      }

      if (isDraggingSeekerRef.current) return;

      if (currentTimeTextRef.current) {
        currentTimeTextRef.current.textContent = formatTime(state.currentTime);
      }
      if (durationTextRef.current) {
        durationTextRef.current.textContent = formatTime(state.duration);
      }
      if (playedProgressBarRef.current) {
        playedProgressBarRef.current.style.width = `${Math.min(100, Math.max(0, state.progressPercent))}%`;
      }
      if (bufferedProgressBarRef.current) {
        bufferedProgressBarRef.current.style.width = `${Math.min(100, Math.max(0, state.bufferedPercent))}%`;
      }
    });

    return () => unsubscribe();
  }, []);

  // Update duration ref on track change
  useEffect(() => {
    if (currentTrack) {
      latestDurationRef.current = currentTrack.duration || 0;
      if (durationTextRef.current) {
        durationTextRef.current.textContent = formatTime(currentTrack.duration);
      }
    }
  }, [currentTrack]);

  // 60FPS Beat Pulse, Snare Strobe & Audio-Reactive Chớp Giật on Playdock
  useEffect(() => {
    let animId: number;

    const loop = () => {
      const beatState = studioBeatEngine.getBeatState();

      // 1. Playdock Audio-Reactive Strobe & Border Chớp Giật on Entire Monolith Card
      if (mainDockBarRef.current) {
        if (beatState.isSnareHit || beatState.snareStrobe > 0.35) {
          // Snare Hit: Blinding Silver-White & Diamond Specular Flash
          mainDockBarRef.current.style.borderColor = "rgba(255, 255, 255, 0.95)";
          mainDockBarRef.current.style.boxShadow =
            "0 25px 70px rgba(0, 0, 0, 0.98), 0 0 35px rgba(255, 255, 255, 0.65), inset 0 0 15px rgba(255, 255, 255, 0.35)";
          if (topSpecularRef.current) topSpecularRef.current.style.opacity = "1.0";
        } else if (beatState.isKickHit || beatState.isKickRoll || beatState.kickImpact > 0.35) {
          // Kick / 808 Hit: Blazing Crimson Red Flash
          mainDockBarRef.current.style.borderColor = "rgba(239, 68, 68, 0.95)";
          mainDockBarRef.current.style.boxShadow =
            "0 25px 70px rgba(0, 0, 0, 0.98), 0 0 35px rgba(239, 68, 68, 0.65), inset 0 0 15px rgba(239, 68, 68, 0.25)";
          if (topSpecularRef.current) topSpecularRef.current.style.opacity = "0.75";
        } else if (beatState.subImpact > 0.25) {
          // Sub-Bass Glow
          mainDockBarRef.current.style.borderColor = "rgba(185, 28, 28, 0.65)";
          mainDockBarRef.current.style.boxShadow =
            "0 25px 60px rgba(0, 0, 0, 0.95), 0 0 25px rgba(185, 28, 28, 0.45)";
          if (topSpecularRef.current) topSpecularRef.current.style.opacity = "0.5";
        } else {
          mainDockBarRef.current.style.borderColor = isPlaying ? "rgba(239, 68, 68, 0.35)" : "rgba(255, 255, 255, 0.16)";
          mainDockBarRef.current.style.boxShadow =
            "0 25px 60px rgba(0, 0, 0, 0.95), 0 0 20px rgba(239, 68, 68, 0.15)";
          if (topSpecularRef.current) topSpecularRef.current.style.opacity = "0.35";
        }
      }

      // 2. Mini Cover Beat Reaction
      if (miniCoverRef.current) {
        if (beatState.isSnareHit) {
          miniCoverRef.current.style.transform = "scale(1.08)";
          miniCoverRef.current.style.boxShadow = "0 0 16px rgba(255, 255, 255, 0.9)";
        } else if (beatState.isKickHit || beatState.isKickRoll) {
          miniCoverRef.current.style.transform = "scale(1.07)";
          miniCoverRef.current.style.boxShadow = "0 0 14px rgba(239, 68, 68, 0.9)";
        } else if (beatState.isSubHit) {
          miniCoverRef.current.style.transform = "scale(1.03)";
          miniCoverRef.current.style.boxShadow = "0 0 12px rgba(185, 28, 28, 0.75)";
        } else {
          miniCoverRef.current.style.transform = "scale(1.0)";
          miniCoverRef.current.style.boxShadow = "0 4px 12px rgba(0,0,0,0.5)";
        }
      }

      animId = requestAnimationFrame(loop);
    };

    loop();
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  // ─────────────────────────────────────────────────────────────────────────
  // HIGH-PRECISION SCRUBBER TRACKING (GROUND-TRUTH AUDIO DURATION SYNCHRONIZED)
  // ─────────────────────────────────────────────────────────────────────────
  const getGroundTruthDuration = useCallback((): number => {
    const activeAudio = dualDeckAudioEngine.getActiveAudio();
    if (activeAudio && activeAudio.duration && !isNaN(activeAudio.duration) && isFinite(activeAudio.duration) && activeAudio.duration > 0) {
      return activeAudio.duration;
    }
    if (latestDurationRef.current > 0) return latestDurationRef.current;
    if (duration && duration > 0) return duration;
    return currentTrack?.duration || 1;
  }, [duration, currentTrack]);

  const calculateSeekTime = useCallback(
    (clientX: number): number => {
      if (!scrubberTrackRef.current) return 0;
      const rect = scrubberTrackRef.current.getBoundingClientRect();
      if (rect.width <= 0) return 0;
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const totalDur = getGroundTruthDuration();
      // Clamp to totalDur - 0.25 to prevent skipping to next track on extreme right click
      return Math.max(0, Math.min(Math.max(0, totalDur - 0.25), ratio * totalDur));
    },
    [getGroundTruthDuration]
  );

  const handleScrubberPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingSeekerRef.current = true;
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}

    const totalDur = getGroundTruthDuration();
    const targetSec = calculateSeekTime(e.clientX);
    dragSeekTimeRef.current = targetSec;

    if (currentTimeTextRef.current) {
      currentTimeTextRef.current.textContent = formatTime(targetSec);
    }
    if (playedProgressBarRef.current && totalDur > 0) {
      playedProgressBarRef.current.style.width = `${Math.max(0, Math.min(100, (targetSec / totalDur) * 100))}%`;
    }
  };

  const handleScrubberPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const totalDur = getGroundTruthDuration();
    const rect = scrubberTrackRef.current?.getBoundingClientRect();
    if (rect && rect.width > 0) {
      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      setHoverSeekPos(ratio * 100);
      setHoverSeekTime(Math.min(totalDur, ratio * totalDur));
    }

    if (isDraggingSeekerRef.current) {
      const targetSec = calculateSeekTime(e.clientX);
      dragSeekTimeRef.current = targetSec;

      if (currentTimeTextRef.current) {
        currentTimeTextRef.current.textContent = formatTime(targetSec);
      }
      if (playedProgressBarRef.current && totalDur > 0) {
        playedProgressBarRef.current.style.width = `${Math.max(0, Math.min(100, (targetSec / totalDur) * 100))}%`;
      }
    }
  };

  const handleScrubberPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingSeekerRef.current) {
      isDraggingSeekerRef.current = false;
      const targetSec = dragSeekTimeRef.current !== null ? dragSeekTimeRef.current : calculateSeekTime(e.clientX);
      if (!isNaN(targetSec) && isFinite(targetSec) && targetSec >= 0) {
        seek(targetSec);
      }
      dragSeekTimeRef.current = null;
    }
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  if (!currentTrack) return null;

  return (
    <div
      ref={dockContainerRef}
      style={{
        position: "fixed",
        bottom: "24px",
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        zIndex: 60,
        pointerEvents: "none",
        padding: "0 20px",
      }}
    >
      {/* ─────────────────────────────────────────────────────────────────────
          TRUE 100% UNIFIED MONOLITH LIQUID GLASS CARD CONTAINER
      ────────────────────────────────────────────────────────────────────── */}
      <motion.div
        ref={mainDockBarRef}
        layout
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        style={{
          width: "100%",
          maxWidth: "860px",
          borderRadius: "28px",
          background: "rgba(10, 11, 16, 0.94)",
          border: "1px solid rgba(255, 255, 255, 0.16)",
          boxShadow: "0 25px 60px rgba(0, 0, 0, 0.95), 0 0 25px rgba(239, 68, 68, 0.18)",
          backdropFilter: "blur(32px)",
          WebkitBackdropFilter: "blur(32px)",
          display: "flex",
          flexDirection: "column",
          pointerEvents: "auto",
          overflow: "hidden",
          position: "relative",
          transition: "border-color 0.08s ease, box-shadow 0.08s ease",
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

        {/* ─────────────────────────────────────────────────────────────────
            1. UPPER SECTION: EXPANDED LYRICS OR QUEUE (SEAMLESSLY INTEGRATED)
        ────────────────────────────────────────────────────────────────── */}
        <AnimatePresence initial={false}>
          {expandedMode !== "none" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "min(420px, 50vh)" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              style={{
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                background: "rgba(0, 0, 0, 0.25)",
              }}
            >
              {/* Header inside Monolith */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "14px 24px",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
                  background: "rgba(239, 68, 68, 0.03)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  {expandedMode === "lyrics" ? (
                    <>
                      <Mic2 size={15} color="#ef4444" />
                      <span style={{ fontSize: "0.82rem", fontWeight: 800, color: "#ffffff", letterSpacing: "0.03em" }}>
                        Lời bài hát đồng bộ
                      </span>
                    </>
                  ) : (
                    <>
                      <ListMusic size={15} color="#ef4444" />
                      <span style={{ fontSize: "0.82rem", fontWeight: 800, color: "#ffffff", letterSpacing: "0.03em" }}>
                        Danh sách phát (30 Tracks)
                      </span>
                    </>
                  )}
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
                                  margin: 0,
                                }}
                              >
                                {track.title}
                              </p>
                              <p style={{ fontSize: "0.72rem", color: "rgba(255, 255, 255, 0.45)", margin: "2px 0 0 0" }}>
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

        {/* ─────────────────────────────────────────────────────────────────
            2. LOWER SECTION: PLAYER CONTROLS (ALWAYS MOUNTED IN SAME CARD)
        ────────────────────────────────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 20px",
            gap: "16px",
            width: "100%",
          }}
        >
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
              overflow: "visible",
            }}
          >
            {/* Mini Album Cover with clean unclipped glow */}
            <div
              ref={miniCoverRef}
              style={{
                position: "relative",
                width: "44px",
                height: "44px",
                minWidth: "44px",
                minHeight: "44px",
                borderRadius: "12px",
                overflow: "hidden",
                flexShrink: 0,
                transition: "transform 0.08s ease-out, box-shadow 0.08s ease-out",
              }}
            >
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
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
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
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
                <Shuffle size={15} />
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
                <SkipBack size={18} />
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
                <SkipForward size={18} />
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
                {repeatMode === "one" ? <Repeat1 size={15} /> : <Repeat size={15} />}
              </button>
            </div>

            {/* Clean Continuous Line Scrubber */}
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
                ref={scrubberTrackRef}
                onPointerDown={handleScrubberPointerDown}
                onPointerMove={handleScrubberPointerMove}
                onPointerUp={handleScrubberPointerUp}
                onPointerLeave={() => setHoverSeekTime(null)}
                style={{
                  position: "relative",
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  height: "18px",
                  cursor: "pointer",
                  touchAction: "none",
                }}
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

          {/* 3. RIGHT: TOOL BUTTONS & SEAMLESS INLINE INTEGRATED VOLUME (220px STRICT) */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              width: "220px",
              minWidth: "220px",
              maxWidth: "220px",
              flexShrink: 0,
              justifyContent: "flex-end",
              position: "relative",
            }}
          >
            {/* Synced Lyrics Toggle Button */}
            <button
              onClick={() => setExpandedMode((prev) => (prev === "lyrics" ? "none" : "lyrics"))}
              title="Lời bài hát đồng bộ"
              style={{
                background: expandedMode === "lyrics" ? "#ffffff" : "rgba(255, 255, 255, 0.08)",
                color: expandedMode === "lyrics" ? "#000000" : "#ffffff",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                borderRadius: "50%",
                width: "34px",
                height: "34px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              <Mic2 size={16} />
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
                width: "34px",
                height: "34px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              <ListMusic size={16} />
            </button>

            {/* Seamless Inline Integrated Volume Control */}
            <div
              style={{ display: "flex", alignItems: "center", gap: "6px" }}
              onMouseEnter={() => setShowInlineVolume(true)}
              onMouseLeave={() => setShowInlineVolume(false)}
            >
              <AnimatePresence>
                {showInlineVolume && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 68 }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    style={{ display: "flex", alignItems: "center", overflow: "hidden" }}
                  >
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.01}
                      value={isMuted ? 0 : volume}
                      onChange={(e) => setVolume(Number(e.target.value))}
                      style={{
                        width: "65px",
                        height: "4px",
                        cursor: "pointer",
                        accentColor: "#ef4444",
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                onClick={() => {
                  setShowInlineVolume((prev) => !prev);
                }}
                onDoubleClick={toggleMute}
                title={`Âm lượng: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
                style={{
                  background: showInlineVolume ? "#ffffff" : "rgba(255, 255, 255, 0.08)",
                  color: showInlineVolume ? "#000000" : "#ffffff",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  borderRadius: "50%",
                  width: "34px",
                  height: "34px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX size={16} color="#ef4444" />
                ) : volume >= 0.5 ? (
                  <Volume2 size={16} />
                ) : (
                  <Volume1 size={16} />
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default FloatingPlayerDock;
