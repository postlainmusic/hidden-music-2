import React, { useState, useEffect, useRef } from "react";
import { useAudioStore } from "../store/audioStore";
import { dualDeckAudioEngine, ProgressState } from "../audio/DualDeckAudioEngine";
import {
  Play,
  Pause,
  Loader2,
  SkipBack,
  SkipForward,
  ChevronDown,
  Heart,
  Volume2,
  VolumeX,
  Mic2,
  Disc3
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SyncedLyricsView } from "./SyncedLyricsView";
import { studioBeatEngine } from "../audio/StudioBeatEngine";

export const MobilePlayerDock: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    isBuffering,
    duration,
    volume,
    isMuted,
    favoritedTrackIds,
    togglePlay,
    nextTrack,
    prevTrack,
    seek,
    setVolume,
    toggleMute,
    toggleFavoriteTrack,
    getFrequencyData
  } = useAudioStore();

  const [isFullOpen, setIsFullOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"cover" | "lyrics">("cover");
  const [isDraggingSeeker, setIsDraggingSeeker] = useState(false);
  const [dragSeekTime, setDragSeekTime] = useState<number | null>(null);

  const visualizerRef = useRef<HTMLCanvasElement | null>(null);
  const miniProgressBarRef = useRef<HTMLDivElement | null>(null);
  const fullPlayedProgressBarRef = useRef<HTMLDivElement | null>(null);
  const fullBufferedProgressBarRef = useRef<HTMLDivElement | null>(null);
  const fullCurrentTimeRef = useRef<HTMLSpanElement | null>(null);
  const fullDurationRef = useRef<HTMLSpanElement | null>(null);
  const fullSliderRef = useRef<HTMLInputElement | null>(null);
  const mobileHalationRef = useRef<HTMLDivElement | null>(null);
  const mobileCoverCardRef = useRef<HTMLDivElement | null>(null);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || !isFinite(seconds) || seconds < 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Direct Ref High-Frequency Progress Subscription (60fps on mobile without React lag)
  useEffect(() => {
    const unsubscribe = dualDeckAudioEngine.subscribeProgress((state: ProgressState) => {
      if (fullSliderRef.current && state.duration > 0) {
        fullSliderRef.current.max = String(state.duration);
      }

      if (isDraggingSeeker) return;

      if (miniProgressBarRef.current) {
        miniProgressBarRef.current.style.width = `${state.progressPercent}%`;
      }
      if (fullPlayedProgressBarRef.current) {
        fullPlayedProgressBarRef.current.style.width = `${state.progressPercent}%`;
      }
      if (fullBufferedProgressBarRef.current) {
        fullBufferedProgressBarRef.current.style.width = `${state.bufferedPercent}%`;
      }
      if (fullCurrentTimeRef.current) {
        fullCurrentTimeRef.current.textContent = formatTime(state.currentTime);
      }
      if (fullDurationRef.current) {
        fullDurationRef.current.textContent = formatTime(state.duration);
      }
      if (fullSliderRef.current) {
        fullSliderRef.current.value = String(state.currentTime);
      }
    });

    return () => unsubscribe();
  }, [isDraggingSeeker]);

  // 60fps Vault-Style Halation Flare & Beat Pulse on Mobile Cover
  useEffect(() => {
    let animId: number;

    const loop = () => {
      const beatState = studioBeatEngine.getBeatState();

      if (mobileHalationRef.current && isPlaying) {
        const kickVal = Math.max(beatState.kickImpact, beatState.kickRollIntensity);
        const subVal = beatState.subImpact;
        const opacity = Math.min(0.85, 0.25 + kickVal * 0.55 + subVal * 0.25);
        const scale = 1.0 + kickVal * 0.08 + subVal * 0.04;
        mobileHalationRef.current.style.opacity = String(opacity);
        mobileHalationRef.current.style.transform = `scale(${scale.toFixed(3)})`;
      }

      if (mobileCoverCardRef.current && isPlaying) {
        if (beatState.isSnareHit) {
          mobileCoverCardRef.current.style.borderColor = "rgba(255, 255, 255, 0.85)";
          mobileCoverCardRef.current.style.boxShadow = "0 30px 80px rgba(0, 0, 0, 0.95), 0 0 30px rgba(255, 255, 255, 0.6)";
        } else if (beatState.isKickHit || beatState.isKickRoll) {
          mobileCoverCardRef.current.style.borderColor = "rgba(239, 68, 68, 0.85)";
          mobileCoverCardRef.current.style.boxShadow = "0 30px 80px rgba(0, 0, 0, 0.95), 0 0 30px rgba(239, 68, 68, 0.75)";
        } else {
          mobileCoverCardRef.current.style.borderColor = "rgba(220, 38, 38, 0.45)";
          mobileCoverCardRef.current.style.boxShadow = "0 25px 60px rgba(0, 0, 0, 0.95), 0 0 20px rgba(185, 28, 28, 0.4)";
        }
      }

      animId = requestAnimationFrame(loop);
    };

    if (isFullOpen && activeTab === "cover") {
      loop();
    }

    return () => cancelAnimationFrame(animId);
  }, [isFullOpen, activeTab, isPlaying]);

  // Live Sound Waveform Visualizer on Mini Dock
  useEffect(() => {
    const canvas = visualizerRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;

    const draw = () => {
      const freqData = isPlaying ? getFrequencyData() : new Uint8Array(8);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barCount = 8;
      const barWidth = 2.5;
      const gap = 2;
      const totalWidth = barCount * (barWidth + gap);
      const startX = (canvas.width - totalWidth) / 2;

      for (let i = 0; i < barCount; i++) {
        const value = isPlaying
          ? freqData[i % freqData.length] / 255
          : 0.15 + Math.sin(Date.now() * 0.003 + i) * 0.08;
        const barHeight = Math.max(2, value * canvas.height * 0.85);
        const x = startX + i * (barWidth + gap);
        const y = canvas.height - barHeight;

        const gradient = ctx.createLinearGradient(0, y, 0, canvas.height);
        gradient.addColorStop(0, "#ffffff");
        gradient.addColorStop(1, "rgba(255, 255, 255, 0.4)");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 1.5);
        ctx.fill();
      }

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => cancelAnimationFrame(animId);
  }, [isPlaying, getFrequencyData]);

  if (!currentTrack) return null;

  const isFav = favoritedTrackIds.includes(currentTrack.id);
  const effectiveDuration = duration || currentTrack.duration || 180;

  return (
    <>
      {/* ─────────────────────────────────────────────────────────────────────
          TIER 1: MINI FLOATING GLASS CAPSULE (58px) AT BOTTOM
      ────────────────────────────────────────────────────────────────────── */}
      <div
        style={{
          position: "fixed",
          bottom: "max(14px, env(safe-area-inset-bottom, 14px))",
          left: "14px",
          right: "14px",
          zIndex: 80,
          display: "flex",
          justifyContent: "center",
          pointerEvents: "none"
        }}
      >
        <motion.div
          initial={{ y: 80, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 80, opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 280, damping: 24 }}
          onClick={() => setIsFullOpen(true)}
          style={{
            width: "100%",
            maxWidth: "480px",
            height: "58px",
            borderRadius: "999px",
            background: "rgba(18, 18, 20, 0.78)",
            backdropFilter: "blur(24px) saturate(190%)",
            WebkitBackdropFilter: "blur(24px) saturate(190%)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            boxShadow: "0 16px 40px rgba(0, 0, 0, 0.85), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 10px 0 8px",
            gap: "10px",
            pointerEvents: "auto",
            cursor: "pointer",
            position: "relative",
            overflow: "hidden"
          }}
        >
          {/* Real-time Mini Top Progress Line */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "2px",
              background: "rgba(255, 255, 255, 0.15)"
            }}
          >
            <div
              ref={miniProgressBarRef}
              style={{
                height: "100%",
                width: "0%",
                background: "linear-gradient(90deg, #ffffff, #94a3b8)",
                boxShadow: "0 0 6px #ffffff"
              }}
            />
          </div>

          {/* Left: Rotating Mini Artwork + Info */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0, flex: 1 }}>
            <div style={{ position: "relative", flexShrink: 0 }}>
              <motion.img
                animate={{ rotate: isPlaying ? 360 : 0 }}
                transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.6)"
                }}
              />
              {isPlaying && (
                <div
                  style={{
                    position: "absolute",
                    inset: "38%",
                    borderRadius: "50%",
                    background: "#000000",
                    border: "1px solid rgba(255, 255, 255, 0.4)"
                  }}
                />
              )}
            </div>

            <div style={{ minWidth: 0, flex: 1, paddingRight: "4px" }}>
              <h4
                style={{
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  color: "#ffffff",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  lineHeight: 1.2
                }}
              >
                {currentTrack.title}
              </h4>
              <p
                style={{
                  fontSize: "0.72rem",
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

          {/* Right: Soundwave + Play Button */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
            <canvas ref={visualizerRef} width={40} height={18} />

            <button
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
              }}
              aria-label={isPlaying ? "Tạm dừng" : "Phát"}
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: "#ffffff",
                border: "none",
                color: "#000000",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 2px 10px rgba(255, 255, 255, 0.4)",
                flexShrink: 0
              }}
            >
              {isBuffering ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                >
                  <Loader2 size={16} color="#000000" />
                </motion.div>
              ) : isPlaying ? (
                <Pause size={16} fill="#000000" />
              ) : (
                <Play size={16} fill="#000000" style={{ marginLeft: "2px" }} />
              )}
            </button>
          </div>
        </motion.div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────
          TIER 2: FULL-SCREEN NOW PLAYING MODAL (WITH VAULT GLOW & SYNCED LYRICS)
      ────────────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isFullOpen && (
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.4}
            onDragEnd={(_, info) => {
              if (info.offset.y > 100 || info.velocity.y > 500) {
                setIsFullOpen(false);
              }
            }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 250,
              background: "linear-gradient(180deg, rgba(12, 12, 16, 0.98) 0%, rgba(3, 3, 5, 0.99) 100%)",
              backdropFilter: "blur(36px)",
              WebkitBackdropFilter: "blur(36px)",
              paddingTop: "max(14px, env(safe-area-inset-top, 14px))",
              paddingBottom: "max(20px, env(safe-area-inset-bottom, 20px))",
              paddingLeft: "20px",
              paddingRight: "20px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              color: "#ffffff"
            }}
          >
            {/* Header / Dismiss Bar */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
              <div
                style={{
                  width: "40px",
                  height: "5px",
                  borderRadius: "999px",
                  background: "rgba(255, 255, 255, 0.3)",
                  marginBottom: "12px"
                }}
              />

              <div
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between"
                }}
              >
                {/* Dismiss Button */}
                <button
                  onClick={() => setIsFullOpen(false)}
                  style={{
                    background: "rgba(255, 255, 255, 0.08)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    borderRadius: "50%",
                    width: "36px",
                    height: "36px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#ffffff",
                    cursor: "pointer"
                  }}
                >
                  <ChevronDown size={20} />
                </button>

                {/* Mode Switcher: Cover vs Lyrics */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    background: "rgba(255, 255, 255, 0.08)",
                    borderRadius: "999px",
                    padding: "3px",
                    border: "1px solid rgba(255, 255, 255, 0.12)"
                  }}
                >
                  <button
                    onClick={() => setActiveTab("cover")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      padding: "4px 12px",
                      borderRadius: "999px",
                      border: "none",
                      fontSize: "0.74rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      background: activeTab === "cover" ? "#ffffff" : "transparent",
                      color: activeTab === "cover" ? "#000000" : "rgba(255, 255, 255, 0.6)",
                      transition: "all 0.2s ease"
                    }}
                  >
                    <Disc3 size={12} />
                    <span>Bìa</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("lyrics")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      padding: "4px 12px",
                      borderRadius: "999px",
                      border: "none",
                      fontSize: "0.74rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      background: activeTab === "lyrics" ? "#ffffff" : "transparent",
                      color: activeTab === "lyrics" ? "#000000" : "rgba(255, 255, 255, 0.6)",
                      transition: "all 0.2s ease"
                    }}
                  >
                    <Mic2 size={12} />
                    <span>Lời bài hát</span>
                  </button>
                </div>

                <div style={{ width: "36px" }} />
              </div>
            </div>

            {/* Middle: Either Vault-Style Halation Album Cover OR Synced Lyrics */}
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                margin: "12px 0",
                position: "relative",
                minHeight: 0,
                overflow: "hidden"
              }}
            >
              {activeTab === "cover" ? (
                <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {/* Blazing Crimson Halation Backlight Bloom (Just like in 3D Vault) */}
                  <div
                    ref={mobileHalationRef}
                    style={{
                      position: "absolute",
                      inset: "-35px",
                      borderRadius: "26px",
                      background: "radial-gradient(circle, rgba(239, 68, 68, 0.95) 0%, rgba(185, 28, 28, 0.65) 45%, rgba(127, 29, 29, 0.25) 70%, transparent 85%)",
                      filter: "blur(40px)",
                      pointerEvents: "none",
                      opacity: 0.35,
                      transition: "opacity 0.08s ease, transform 0.08s ease"
                    }}
                  />

                  <div
                    ref={mobileCoverCardRef}
                    style={{
                      width: "min(66vw, 250px)",
                      height: "min(66vw, 250px)",
                      borderRadius: "22px",
                      overflow: "hidden",
                      boxShadow: "0 25px 60px rgba(0, 0, 0, 0.95), 0 0 20px rgba(185, 28, 28, 0.4)",
                      border: "2px solid rgba(220, 38, 38, 0.45)",
                      position: "relative",
                      transition: "border-color 0.08s ease, box-shadow 0.08s ease"
                    }}
                  >
                    <img
                      src={currentTrack.coverUrl}
                      alt={currentTrack.title}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block"
                      }}
                    />
                  </div>
                </div>
              ) : (
                /* Unclipped Smooth Synced Lyrics View */
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    maxHeight: "min(46vh, 340px)",
                    position: "relative",
                    borderRadius: "18px",
                    overflow: "hidden"
                  }}
                >
                  <SyncedLyricsView onSeek={(t) => seek(t)} />
                </div>
              )}
            </div>

            {/* Bottom Controls Area */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", width: "100%" }}>
              {/* Title & Favorite */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                <div style={{ minWidth: 0 }}>
                  <h2
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: 800,
                      lineHeight: 1.2,
                      marginBottom: "3px",
                      color: "#ffffff",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis"
                    }}
                  >
                    {currentTrack.title}
                  </h2>
                  <p style={{ fontSize: "0.85rem", color: "rgba(255, 255, 255, 0.6)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {currentTrack.artist} • {currentTrack.album}
                  </p>
                </div>

                <button
                  onClick={() => toggleFavoriteTrack(currentTrack.id)}
                  style={{
                    background: isFav ? "rgba(239, 68, 68, 0.2)" : "rgba(255, 255, 255, 0.08)",
                    border: isFav ? "1px solid rgba(239, 68, 68, 0.5)" : "1px solid rgba(255, 255, 255, 0.15)",
                    borderRadius: "50%",
                    width: "40px",
                    height: "40px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    flexShrink: 0
                  }}
                >
                  <Heart size={18} color={isFav ? "#ef4444" : "rgba(255,255,255,0.6)"} fill={isFav ? "#ef4444" : "none"} />
                </button>
              </div>

              {/* Scrubber Range Bar */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ position: "relative", display: "flex", alignItems: "center", width: "100%" }}>
                  <input
                    ref={fullSliderRef}
                    type="range"
                    min={0}
                    max={currentTrack.duration || 180}
                    defaultValue={0}
                    onMouseDown={() => setIsDraggingSeeker(true)}
                    onTouchStart={() => setIsDraggingSeeker(true)}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setDragSeekTime(val);
                      const activeAudio = dualDeckAudioEngine.getActiveAudio();
                      const realDur = (activeAudio && activeAudio.duration && isFinite(activeAudio.duration) && activeAudio.duration > 0)
                        ? activeAudio.duration
                        : currentTrack.duration || 180;
                      if (fullCurrentTimeRef.current) {
                        fullCurrentTimeRef.current.textContent = formatTime(val);
                      }
                      if (fullPlayedProgressBarRef.current && realDur > 0) {
                        fullPlayedProgressBarRef.current.style.width = `${Math.min(100, (val / realDur) * 100)}%`;
                      }
                    }}
                    onMouseUp={() => {
                      setIsDraggingSeeker(false);
                      if (dragSeekTime !== null) {
                        const activeAudio = dualDeckAudioEngine.getActiveAudio();
                        const realDur = (activeAudio && activeAudio.duration && isFinite(activeAudio.duration) && activeAudio.duration > 0)
                          ? activeAudio.duration
                          : currentTrack.duration || 180;
                        const clamped = Math.max(0, Math.min(realDur - 0.25, dragSeekTime));
                        seek(clamped);
                        setDragSeekTime(null);
                      }
                    }}
                    onTouchEnd={() => {
                      setIsDraggingSeeker(false);
                      if (dragSeekTime !== null) {
                        const activeAudio = dualDeckAudioEngine.getActiveAudio();
                        const realDur = (activeAudio && activeAudio.duration && isFinite(activeAudio.duration) && activeAudio.duration > 0)
                          ? activeAudio.duration
                          : currentTrack.duration || 180;
                        const clamped = Math.max(0, Math.min(realDur - 0.25, dragSeekTime));
                        seek(clamped);
                        setDragSeekTime(null);
                      }
                    }}
                    style={{ zIndex: 3, height: "24px", cursor: "pointer", opacity: 0 }}
                  />

                  {/* Buffered Translucent Cache Bar */}
                  <div
                    ref={fullBufferedProgressBarRef}
                    style={{
                      position: "absolute",
                      left: 0,
                      height: "4px",
                      borderRadius: "999px",
                      background: "rgba(255, 255, 255, 0.25)",
                      width: "0%",
                      pointerEvents: "none",
                      zIndex: 1,
                      transition: "width 0.25s ease"
                    }}
                  />

                  {/* Active Played Progress Bar */}
                  <div
                    ref={fullPlayedProgressBarRef}
                    style={{
                      position: "absolute",
                      left: 0,
                      height: "4px",
                      borderRadius: "999px",
                      background: "linear-gradient(90deg, #ef4444, #f97316)",
                      width: "0%",
                      pointerEvents: "none",
                      boxShadow: "0 0 8px rgba(239, 68, 68, 0.8)",
                      zIndex: 2
                    }}
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.76rem", color: "rgba(255, 255, 255, 0.45)" }}>
                  <span ref={fullCurrentTimeRef}>0:00</span>
                  <span ref={fullDurationRef}>{formatTime(effectiveDuration)}</span>
                </div>
              </div>

              {/* Primary Playback Buttons */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "24px"
                }}
              >
                <button
                  onClick={prevTrack}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "rgba(255, 255, 255, 0.8)",
                    cursor: "pointer",
                    padding: "8px",
                    display: "flex",
                    alignItems: "center"
                  }}
                >
                  <SkipBack size={24} />
                </button>

                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={togglePlay}
                  style={{
                    width: "62px",
                    height: "62px",
                    borderRadius: "50%",
                    background: "#ffffff",
                    border: "none",
                    color: "#000000",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    boxShadow: "0 6px 24px rgba(255, 255, 255, 0.4)"
                  }}
                >
                  {isBuffering ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                      <Loader2 size={26} color="#000000" />
                    </motion.div>
                  ) : isPlaying ? (
                    <Pause size={26} fill="#000000" />
                  ) : (
                    <Play size={26} fill="#000000" style={{ marginLeft: "3px" }} />
                  )}
                </motion.button>

                <button
                  onClick={nextTrack}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "rgba(255, 255, 255, 0.8)",
                    cursor: "pointer",
                    padding: "8px",
                    display: "flex",
                    alignItems: "center"
                  }}
                >
                  <SkipForward size={24} />
                </button>
              </div>

              {/* Volume Slider Row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "0 6px",
                  opacity: 0.85
                }}
              >
                <button
                  onClick={toggleMute}
                  style={{ background: "transparent", border: "none", color: "rgba(255, 255, 255, 0.7)", cursor: "pointer", padding: "2px" }}
                >
                  {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>

                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={isMuted ? 0 : volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  style={{
                    flex: 1,
                    height: "4px",
                    accentColor: "#ef4444"
                  }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MobilePlayerDock;
