import React from "react";
import { Track, useAudioStore } from "../store/audioStore";
import { dualDeckAudioEngine } from "../audio/DualDeckAudioEngine";
import { Play, Pause, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface TrackCardProps {
  track: Track;
  index: number;
}

export const TrackCard: React.FC<TrackCardProps> = ({ track, index }) => {
  const { currentTrack, isPlaying, isBuffering, playTrack, togglePlay, getTrackWaveform } = useAudioStore();
  const isCurrent = currentTrack?.id === track.id;
  const isCurrentPlaying = isCurrent && isPlaying;
  const isCurrentBuffering = isCurrent && isBuffering;

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrent) {
      togglePlay();
    } else {
      playTrack(track, { crossfade: true });
    }
  };

  const handleHoverWarmup = () => {
    dualDeckAudioEngine.warmupTrack(track.audioUrl);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins}:${remainingSecs < 10 ? "0" : ""}${remainingSecs}`;
  };

  const waveformPeaks = getTrackWaveform(track.id, track.genre, track.duration);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.35, ease: "easeOut" }}
      className="glass-card"
      style={{
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
        borderColor: isCurrent ? "rgba(255, 255, 255, 0.35)" : "var(--glass-border)",
        background: isCurrent ? "rgba(255, 255, 255, 0.08)" : "rgba(255, 255, 255, 0.035)"
      }}
      onClick={handlePlayClick}
      onMouseEnter={handleHoverWarmup}
      onTouchStart={handleHoverWarmup}
    >
      {/* Cover Art Container */}
      <div
        style={{
          position: "relative",
          width: "100%",
          paddingTop: "100%",
          borderRadius: "14px",
          overflow: "hidden",
          background: "#12141c"
        }}
      >
        <img
          src={track.coverUrl}
          alt={track.title}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "transform 0.4s ease"
          }}
        />

        {/* Liquid Glass Overlay on Hover / Active */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: isCurrent
              ? "linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.7) 100%)"
              : "rgba(0,0,0,0.25)",
            transition: "all 0.3s ease",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <motion.div
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 24px rgba(0,0,0,0.5), 0 0 20px " + track.palette.glow
            }}
          >
            {isCurrentBuffering ? (
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                <Loader2 size={20} color="#090a0f" />
              </motion.div>
            ) : isCurrentPlaying ? (
              <Pause size={20} fill="#090a0f" color="#090a0f" />
            ) : (
              <Play size={20} fill="#090a0f" color="#090a0f" style={{ marginLeft: "3px" }} />
            )}
          </motion.div>
        </div>

        {/* Live Audio Indicator Pill */}
        {isCurrent && (
          <div
            className="glass-pill"
            style={{
              position: "absolute",
              top: "10px",
              left: "10px",
              padding: "4px 8px",
              fontSize: "0.7rem",
              fontWeight: 800,
              background: "rgba(0, 0, 0, 0.65)",
              borderColor: track.palette.primary,
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.5)"
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "#10b981",
                boxShadow: "0 0 6px #10b981"
              }}
            />
            <span>{isCurrentPlaying ? "PLAYING" : "PAUSED"}</span>
          </div>
        )}
      </div>

      {/* Metadata & Instant Mini Waveform */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
          <h3
            style={{
              fontSize: "0.95rem",
              fontWeight: 800,
              color: isCurrent ? "#ffffff" : "rgba(255, 255, 255, 0.9)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              letterSpacing: "0.01em"
            }}
          >
            {track.title}
          </h3>
          <span
            style={{
              fontSize: "0.75rem",
              color: "rgba(255, 255, 255, 0.45)",
              fontWeight: 600,
              flexShrink: 0
            }}
          >
            {formatTime(track.duration)}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <p
            style={{
              fontSize: "0.78rem",
              color: "rgba(255, 255, 255, 0.55)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis"
            }}
          >
            {track.artist}
          </p>

          {track.bpm && (
            <span
              style={{
                fontSize: "0.68rem",
                fontWeight: 700,
                color: "rgba(255, 255, 255, 0.35)",
                letterSpacing: "0.04em"
              }}
            >
              {track.bpm} BPM
            </span>
          )}
        </div>

        {/* Instant Mini Waveform Preview (24 bars) */}
        <div
          style={{
            height: "12px",
            display: "flex",
            alignItems: "center",
            gap: "2px",
            opacity: isCurrent ? 0.85 : 0.35,
            marginTop: "2px"
          }}
        >
          {waveformPeaks.slice(0, 24).map((p, pIdx) => (
            <div
              key={pIdx}
              style={{
                flex: 1,
                height: `${Math.max(15, p * 100)}%`,
                borderRadius: "1px",
                background: isCurrent ? track.palette.primary : "#ffffff"
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};
