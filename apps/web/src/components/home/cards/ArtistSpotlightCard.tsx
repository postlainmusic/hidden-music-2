import React from "react";
import { motion } from "framer-motion";
import { Play, Disc, ExternalLink } from "lucide-react";
import { useAudioStore } from "../../../store/audioStore";
import { useIsMobile } from "../../../hooks/useIsMobile";

interface ArtistSpotlightCardProps {
  artistName?: string;
  avatarUrl?: string;
  genre?: string;
  bio?: string;
  featuredTrackTitle?: string;
  featuredTrackId?: string;
  spotifyUrl?: string;
  youtubeUrl?: string;
  onOpen3D?: () => void;
}

export const ArtistSpotlightCard: React.FC<ArtistSpotlightCardProps> = ({
  artistName = "MCK",
  avatarUrl = "/covers/HVL_Album_Cover.webp",
  genre = "Melodic Rap / R&B",
  bio = "Nghệ sĩ tiên phong định hình làn sóng Melodic Rap thế hệ mới tại Việt Nam với chất âm phòng thu Lossless độc bản.",
  featuredTrackTitle = "01. Elegie (Lossless Master)",
  featuredTrackId = "mck-01",
  spotifyUrl = "https://open.spotify.com",
  youtubeUrl = "https://youtube.com",
  onOpen3D
}) => {
  const { playTrack, queue } = useAudioStore();
  const isMobile = useIsMobile();

  const handlePlayFeatured = (e: React.MouseEvent) => {
    e.stopPropagation();
    const track = queue.find((t) => t.id === featuredTrackId) || queue[0];
    if (track) playTrack(track);
    if (onOpen3D) onOpen3D();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: "relative",
        width: "100%",
        maxWidth: isMobile ? "100%" : "820px",
        background: "transparent",
        border: "none",
        boxShadow: "none",
        padding: isMobile ? "10px 16px" : "20px 24px",
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        alignItems: "center",
        textAlign: isMobile ? "center" : "left",
        gap: isMobile ? "20px" : "40px",
        zIndex: 5
      }}
    >
      {/* Circular Artist Avatar / Portrait */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        <div
          style={{
            width: isMobile ? "140px" : "190px",
            height: isMobile ? "140px" : "190px",
            borderRadius: "50%",
            overflow: "hidden",
            border: "1.5px solid rgba(255, 255, 255, 0.2)",
            boxShadow: "0 0 45px rgba(99, 102, 241, 0.35), 0 16px 36px rgba(0, 0, 0, 0.8)"
          }}
        >
          <img
            src={avatarUrl}
            alt={artistName}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      </div>

      {/* Artist Details */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: isMobile ? "center" : "flex-start",
          gap: isMobile ? "10px" : "12px",
          minWidth: 0
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span
            style={{
              padding: "4px 12px",
              borderRadius: "999px",
              background: "rgba(99, 102, 241, 0.2)",
              border: "1px solid rgba(99, 102, 241, 0.4)",
              color: "#a5b4fc",
              fontSize: "0.72rem",
              fontWeight: 800,
              letterSpacing: "0.08em",
              textTransform: "uppercase"
            }}
          >
            {genre}
          </span>
        </div>

        <h2
          style={{
            margin: 0,
            fontSize: isMobile ? "1.65rem" : "2.2rem",
            fontWeight: 900,
            letterSpacing: "0.02em",
            color: "#ffffff",
            lineHeight: 1.2
          }}
        >
          {artistName}
        </h2>

        <p
          style={{
            margin: 0,
            fontSize: isMobile ? "0.82rem" : "0.9rem",
            color: "rgba(255, 255, 255, 0.65)",
            lineHeight: 1.55,
            maxWidth: isMobile ? "320px" : "540px"
          }}
        >
          {bio}
        </p>

        {/* Featured Single Button & Socials */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: isMobile ? "center" : "flex-start",
            gap: "14px",
            marginTop: "6px",
            width: "100%"
          }}
        >
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={handlePlayFeatured}
            style={{
              padding: "10px 22px",
              borderRadius: "999px",
              background: "rgba(255, 255, 255, 0.12)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.25)",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "0.84rem",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.4)"
            }}
          >
            <Play size={14} fill="#ffffff" />
            <span>Nghe {featuredTrackTitle}</span>
          </motion.button>

          <div style={{ display: "flex", gap: "10px" }}>
            <a
              href={spotifyUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "rgba(255, 255, 255, 0.75)",
                textDecoration: "none"
              }}
            >
              <Disc size={16} />
            </a>
            <a
              href={youtubeUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "rgba(255, 255, 255, 0.75)",
                textDecoration: "none"
              }}
            >
              <ExternalLink size={15} />
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ArtistSpotlightCard;
