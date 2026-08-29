import React from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Play, Pause, Heart, Sparkles } from "lucide-react";
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
        overflowX: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* 1. Master WebGL 3D Audio-Reactive Background with 35mm Cinematic Shaders */}
      <Album3DScene />

      {/* 2. Sleek Top Navigation Bar */}
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "72px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 28px",
          zIndex: 40,
          background: "linear-gradient(to bottom, rgba(5, 5, 8, 0.8) 0%, rgba(5, 5, 8, 0) 100%)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
        }}
      >
        <button
          onClick={onBackToVault}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 18px",
            borderRadius: "999px",
            background: "rgba(255, 255, 255, 0.08)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            color: "#ffffff",
            fontSize: "0.85rem",
            fontWeight: 700,
            cursor: "pointer",
            backdropFilter: "blur(16px)",
            transition: "all 0.2s ease",
          }}
        >
          <ArrowLeft size={16} />
          <span>Quay lại Vault</span>
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              padding: "4px 12px",
              borderRadius: "999px",
              background: "rgba(99, 102, 241, 0.15)",
              border: "1px solid rgba(99, 102, 241, 0.35)",
              color: "#a5b4fc",
              fontSize: "0.75rem",
              fontWeight: 800,
              letterSpacing: "0.08em",
            }}
          >
            3D IMMERSION ZONE
          </div>
          <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#ffffff" }}>
            HVL (99%) • MCK
          </span>
        </div>
      </header>

      {/* 3. Main Central Stage: Album Cover (Left) + 30 Tracks List (Right) */}
      <main
        style={{
          position: "relative",
          zIndex: 10,
          flex: 1,
          width: "100%",
          maxWidth: "980px",
          margin: "0 auto",
          padding: isMobile ? "90px 16px 140px" : "100px 24px 130px",
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          alignItems: isMobile ? "center" : "flex-start",
          justifyContent: "center",
          gap: isMobile ? "28px" : "48px",
        }}
      >
        {/* Left Column: Bìa Album (Album Cover) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{
            width: isMobile ? "280px" : "340px",
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            position: isMobile ? "relative" : "sticky",
            top: isMobile ? "auto" : "110px",
          }}
        >
          <div
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: "1/1",
              borderRadius: "28px",
              overflow: "hidden",
              boxShadow: "0 30px 80px rgba(0, 0, 0, 0.95), 0 0 1px 2px rgba(255, 255, 255, 0.25)",
              border: "1px solid rgba(255, 255, 255, 0.25)",
              background: "#18181b",
            }}
          >
            <img
              src="https://media.postlain.com/covers/HVL_Album_Cover.jpg"
              alt="HVL Album Cover"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          </div>

          {/* Album Title & Metadata */}
          <div style={{ marginTop: "20px", textAlign: "center", width: "100%" }}>
            <h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#ffffff", marginBottom: "4px" }}>
              HVL (99%)
            </h1>
            <p style={{ fontSize: "0.85rem", color: "rgba(255, 255, 255, 0.6)", marginBottom: "12px" }}>
              MCK • 30 Lossless FLAC Tracks
            </p>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 14px",
                borderRadius: "999px",
                background: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "#10b981",
              }}
            >
              <Sparkles size={12} />
              <span>Studio Master 24-Bit / 48kHz</span>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Danh Sách Các Track (Tracklist) */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
          style={{
            flex: 1,
            width: "100%",
            maxWidth: "540px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              paddingBottom: "12px",
              borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
              marginBottom: "8px",
            }}
          >
            <span style={{ fontSize: "0.82rem", fontWeight: 800, color: "rgba(255, 255, 255, 0.5)", letterSpacing: "0.08em" }}>
              DANH SÁCH BÀI HÁT (30 TRACKS)
            </span>
            <span style={{ fontSize: "0.78rem", color: "rgba(255, 255, 255, 0.4)" }}>
              LOSSLESS FLAC
            </span>
          </div>

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
                  padding: "12px 18px",
                  borderRadius: "18px",
                  background: isCurrent
                    ? "rgba(255, 255, 255, 0.14)"
                    : "rgba(255, 255, 255, 0.04)",
                  border: isCurrent
                    ? "1px solid rgba(255, 255, 255, 0.35)"
                    : "1px solid rgba(255, 255, 255, 0.06)",
                  backdropFilter: "blur(14px)",
                  WebkitBackdropFilter: "blur(14px)",
                  boxShadow: isCurrent ? "0 8px 30px rgba(99, 102, 241, 0.25)" : "none",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "14px", minWidth: 0, flex: 1 }}>
                  {/* Track Number / Play state icon */}
                  <div
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: isCurrent ? "#ffffff" : "rgba(255, 255, 255, 0.06)",
                      color: isCurrent ? "#000000" : "rgba(255, 255, 255, 0.5)",
                      flexShrink: 0,
                    }}
                  >
                    {isCurrent && isPlaying ? (
                      <Pause size={13} fill="#000000" />
                    ) : isCurrent ? (
                      <Play size={13} fill="#000000" style={{ marginLeft: "2px" }} />
                    ) : (
                      <span style={{ fontSize: "0.75rem", fontWeight: 700 }}>
                        {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                      </span>
                    )}
                  </div>

                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p
                      style={{
                        fontSize: "0.9rem",
                        fontWeight: isCurrent ? 800 : 600,
                        color: isCurrent ? "#ffffff" : "rgba(255, 255, 255, 0.9)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {track.title}
                    </p>
                    <p
                      style={{
                        fontSize: "0.75rem",
                        color: "rgba(255, 255, 255, 0.45)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {track.artist} • {track.genre}
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "14px", flexShrink: 0 }}>
                  <span style={{ fontSize: "0.78rem", color: "rgba(255, 255, 255, 0.4)" }}>
                    {formatDuration(track.duration)}
                  </span>

                  <button
                    onClick={(e) => toggleFavorite(e, track.id)}
                    style={{
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      padding: "4px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Heart
                      size={15}
                      color={isFav ? "#f43f5e" : "rgba(255, 255, 255, 0.3)"}
                      fill={isFav ? "#f43f5e" : "none"}
                    />
                  </button>
                </div>
              </div>
            );
          })}
        </motion.div>
      </main>

      {/* 4. Master Floating Playbar Dock at the Bottom */}
      {isMobile ? <MobilePlayerDock /> : <FloatingPlayerDock />}
    </div>
  );
};
