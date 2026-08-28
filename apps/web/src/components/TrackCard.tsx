import React from "react";
import { Track, useAudioStore } from "../store/audioStore";
import { Play, Pause, BarChart2 } from "lucide-react";
import { motion } from "framer-motion";

interface TrackCardProps {
  track: Track;
  index: number;
}

export const TrackCard: React.FC<TrackCardProps> = ({ track, index }) => {
  const { currentTrack, isPlaying, playTrack, togglePlay } = useAudioStore();
  const isCurrent = currentTrack?.id === track.id;
  const isCurrentPlaying = isCurrent && isPlaying;

  const handlePlayClick = () => {
    if (isCurrent) {
      togglePlay();
    } else {
      playTrack(track);
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins}:${remainingSecs < 10 ? "0" : ""}${remainingSecs}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4, ease: "easeOut" }}
      className="glass-card"
      style={{
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
        borderColor: isCurrent ? "rgba(255, 255, 255, 0.35)" : "var(--glass-border)",
        background: isCurrent ? "rgba(255, 255, 255, 0.08)" : "rgba(255, 255, 255, 0.035)"
      }}
      onClick={handlePlayClick}
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
            backdropFilter: isCurrent ? "none" : "blur(0px)",
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
            {isCurrentPlaying ? (
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
              right: "10px",
              padding: "4px 8px",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              fontSize: "0.7rem",
              fontWeight: 700,
              background: "rgba(0,0,0,0.6)",
              borderColor: "rgba(255,255,255,0.3)"
            }}
          >
            <BarChart2 size={12} color="var(--accent-secondary)" />
            <span>{isCurrentPlaying ? "PLAYING" : "PAUSED"}</span>
          </div>
        )}
      </div>

      {/* Information */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
          <h4
            style={{
              fontSize: "1rem",
              fontWeight: 700,
              color: "#ffffff",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis"
            }}
          >
            {track.title}
          </h4>
          <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", flexShrink: 0 }}>
            {formatTime(track.duration)}
          </span>
        </div>

        <p
          style={{
            fontSize: "0.84rem",
            color: "var(--text-secondary)",
            marginTop: "3px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis"
          }}
        >
          {track.artist}
        </p>

        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "10px" }}>
          <span
            style={{
              fontSize: "0.7rem",
              padding: "3px 8px",
              borderRadius: "6px",
              background: "rgba(255, 255, 255, 0.06)",
              color: "var(--text-secondary)",
              border: "1px solid rgba(255, 255, 255, 0.08)"
            }}
          >
            {track.genre}
          </span>
          <span
            style={{
              fontSize: "0.7rem",
              padding: "3px 8px",
              borderRadius: "6px",
              background: "rgba(255, 255, 255, 0.04)",
              color: "var(--text-muted)"
            }}
          >
            {track.album}
          </span>
        </div>
      </div>
    </motion.div>
  );
};
