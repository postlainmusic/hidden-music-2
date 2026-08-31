import React from "react";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { Track } from "../../store/audioStore";

interface MinimalTracklistOverlayProps {
  tracks: Track[];
  isVisible: boolean;
  favoritedTrackIds: string[];
  currentTrackId?: string | null;
  isPlaying?: boolean;
  isMobile?: boolean;
  onTrackSelect: (track: Track) => void;
  onToggleFavorite: (e: React.MouseEvent, trackId: string) => void;
}

const formatDuration = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
};

export const MinimalTracklistOverlay: React.FC<MinimalTracklistOverlayProps> = ({
  tracks,
  isVisible,
  favoritedTrackIds,
  currentTrackId,
  isPlaying,
  isMobile = false,
  onTrackSelect,
  onToggleFavorite
}) => {
  const displayTracks = tracks.slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{
        opacity: isVisible ? 1 : 0,
        x: isMobile ? 0 : isVisible ? 130 : 0,
        y: isMobile ? (isVisible ? 0 : 15) : 0,
        pointerEvents: isVisible ? "auto" : "none"
      }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: isMobile ? "relative" : "absolute",
        width: isMobile ? "100%" : "320px",
        maxWidth: isMobile ? "340px" : "320px",
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        zIndex: 10,
        userSelect: "none",
        marginTop: isMobile ? "14px" : "0"
      }}
    >
      {displayTracks.map((track, i) => {
        const isFav = favoritedTrackIds.includes(track.id);
        const isPlayingThis = isPlaying && currentTrackId === track.id;

        return (
          <motion.div
            key={track.id || i}
            onClick={() => onTrackSelect(track)}
            whileHover={{ x: 3, backgroundColor: "rgba(255, 255, 255, 0.08)" }}
            whileTap={{ scale: 0.98 }}
            style={{
              padding: "10px 14px",
              borderRadius: "12px",
              backgroundColor: isPlayingThis ? "rgba(255, 255, 255, 0.08)" : "rgba(255, 255, 255, 0.03)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: isPlayingThis ? "1px solid rgba(255, 255, 255, 0.25)" : "1px solid rgba(255, 255, 255, 0.06)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              cursor: "pointer",
              transition: "border-color 0.2s ease, background-color 0.2s ease"
            }}
          >
            {/* Track Number & Title / Artist */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0, flex: 1 }}>
              <span
                style={{
                  fontSize: "0.72rem",
                  color: isPlayingThis ? "#ffffff" : "rgba(255, 255, 255, 0.4)",
                  fontWeight: 700,
                  fontVariantNumeric: "tabular-nums"
                }}
              >
                0{i + 1}
              </span>
              <div style={{ minWidth: 0, flex: 1 }}>
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.86rem",
                    fontWeight: isPlayingThis ? 700 : 500,
                    color: "#ffffff",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis"
                  }}
                >
                  {track.title}
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.72rem",
                    color: "rgba(255, 255, 255, 0.45)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis"
                  }}
                >
                  {track.artist}
                </p>
              </div>
            </div>

            {/* Duration & Heart Button */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
              <span style={{ fontSize: "0.74rem", color: "rgba(255, 255, 255, 0.35)", fontVariantNumeric: "tabular-nums" }}>
                {formatDuration(track.duration)}
              </span>

              <button
                onClick={(e) => onToggleFavorite(e, track.id)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: isFav ? "#ffffff" : "rgba(255, 255, 255, 0.3)"
                }}
              >
                <Heart size={14} fill={isFav ? "#ffffff" : "none"} color={isFav ? "#ffffff" : "currentColor"} />
              </button>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default MinimalTracklistOverlay;
