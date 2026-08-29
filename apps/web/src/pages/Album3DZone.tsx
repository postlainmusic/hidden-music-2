import React, { useState } from "react";
import { ArrowLeft, Play, Pause, Heart, ListMusic, X } from "lucide-react";
import { useAudioStore, Track, DEFAULT_TRACKS } from "../store/audioStore";
import { Album3DScene } from "../components/scene3d/Album3DScene";
import { FloatingPlayerDock } from "../components/FloatingPlayerDock";
import { MobilePlayerDock } from "../components/MobilePlayerDock";
import { useIsMobile } from "../hooks/useIsMobile";

interface Album3DZoneProps {
  onBackToVault: () => void;
}

const formatDuration = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
};

export const Album3DZone: React.FC<Album3DZoneProps> = ({ onBackToVault }) => {
  const { currentTrack, isPlaying, playTrack, togglePlay, favoritedTrackIds, toggleFavoriteTrack } = useAudioStore();
  const isMobile = useIsMobile();
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(!isMobile);

  const handleTrackClick = (track: Track) => {
    if (currentTrack?.id === track.id) {
      togglePlay();
    } else {
      playTrack(track);
    }
  };

  const toggleFavorite = (e: React.MouseEvent, trackId: string) => {
    e.stopPropagation();
    toggleFavoriteTrack(trackId);
  };

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100dvh",
        width: "100vw",
        backgroundColor: "#050508",
        overflow: "hidden",
      }}
    >
      {/* 1. Full-Screen WebGL 3D Audio-Reactive Universe & Floating 3D Vinyl */}
      <Album3DScene />

      {/* 2. Minimalist Top Bar (Back Button + Mobile Drawer Toggle) */}
      <div
        style={{
          position: "fixed",
          top: "24px",
          left: "24px",
          right: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          zIndex: 30,
          pointerEvents: "none",
        }}
      >
        <button
          onClick={onBackToVault}
          style={{
            pointerEvents: "auto",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 16px",
            borderRadius: "999px",
            background: "rgba(255, 255, 255, 0.08)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            color: "#ffffff",
            fontSize: "0.82rem",
            fontWeight: 700,
            cursor: "pointer",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            transition: "all 0.2s ease",
          }}
        >
          <ArrowLeft size={15} />
          <span>Vault</span>
        </button>

        {isMobile && (
          <button
            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
            style={{
              pointerEvents: "auto",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 14px",
              borderRadius: "999px",
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              color: "#ffffff",
              fontSize: "0.8rem",
              fontWeight: 700,
              cursor: "pointer",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
            }}
          >
            {isDrawerOpen ? <X size={15} /> : <ListMusic size={15} />}
            <span>{isDrawerOpen ? "Đóng" : "30 Tracks"}</span>
          </button>
        )}
      </div>

      {/* 3. Non-Blocking Spatial Frosted Glass Track Drawer (Right Side on Desktop / Slide Sheet on Mobile) */}
      {isDrawerOpen && (
        <aside
          style={{
            position: "fixed",
            top: isMobile ? "76px" : "24px",
            right: isMobile ? "12px" : "24px",
            bottom: isMobile ? "120px" : "110px",
            width: isMobile ? "calc(100vw - 24px)" : "320px",
            zIndex: 25,
            borderRadius: "24px",
            background: "rgba(10, 11, 16, 0.65)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.7)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Scrollable List of 30 Tracks */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "12px 8px",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            {DEFAULT_TRACKS.map((track, idx) => {
              const isCurrent = currentTrack?.id === track.id;
              const isFav = favoritedTrackIds.includes(track.id);

              return (
                <div
                  key={track.id}
                  onClick={() => handleTrackClick(track)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 12px",
                    borderRadius: "14px",
                    background: isCurrent
                      ? "rgba(255, 255, 255, 0.15)"
                      : "transparent",
                    border: isCurrent
                      ? "1px solid rgba(255, 255, 255, 0.25)"
                      : "1px solid transparent",
                    cursor: "pointer",
                    transition: "background 0.18s ease",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        width: "22px",
                        height: "22px",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: isCurrent ? "#ffffff" : "transparent",
                        color: isCurrent ? "#000000" : "rgba(255, 255, 255, 0.4)",
                        flexShrink: 0,
                      }}
                    >
                      {isCurrent && isPlaying ? (
                        <Pause size={10} fill="#000000" />
                      ) : isCurrent ? (
                        <Play size={10} fill="#000000" style={{ marginLeft: "1px" }} />
                      ) : (
                        <span style={{ fontSize: "0.72rem", fontWeight: 700 }}>
                          {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                        </span>
                      )}
                    </div>

                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p
                        style={{
                          fontSize: "0.82rem",
                          fontWeight: isCurrent ? 700 : 500,
                          color: isCurrent ? "#ffffff" : "rgba(255, 255, 255, 0.85)",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {track.title}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
                    <span style={{ fontSize: "0.72rem", color: "rgba(255, 255, 255, 0.35)" }}>
                      {formatDuration(track.duration)}
                    </span>

                    <button
                      onClick={(e) => toggleFavorite(e, track.id)}
                      style={{
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        padding: "2px",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <Heart
                        size={13}
                        color={isFav ? "#f43f5e" : "rgba(255, 255, 255, 0.25)"}
                        fill={isFav ? "#f43f5e" : "none"}
                      />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>
      )}

      {/* 4. Bottom Playbar Dock */}
      {isMobile ? <MobilePlayerDock /> : <FloatingPlayerDock />}
    </div>
  );
};
