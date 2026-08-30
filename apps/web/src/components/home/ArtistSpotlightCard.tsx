import React from "react";
import { motion } from "framer-motion";
import { Play, Disc, ExternalLink } from "lucide-react";
import { useAudioStore } from "../../store/audioStore";

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

  const handlePlayFeatured = (e: React.MouseEvent) => {
    e.stopPropagation();
    const track = queue.find((t) => t.id === featuredTrackId) || queue[0];
    if (track) playTrack(track);
    if (onOpen3D) onOpen3D();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "820px",
        borderRadius: "24px",
        background: "rgba(18, 18, 24, 0.7)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "1px solid rgba(255, 255, 255, 0.14)",
        boxShadow: "0 24px 60px rgba(0, 0, 0, 0.85), 0 0 35px rgba(255, 255, 255, 0.05)",
        padding: "36px 40px",
        display: "flex",
        alignItems: "center",
        gap: "36px",
        zIndex: 5
      }}
    >
      {/* Circular Artist Avatar / Portrait */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        <div
          style={{
            width: "180px",
            height: "180px",
            borderRadius: "50%",
            overflow: "hidden",
            border: "2px solid rgba(255, 255, 255, 0.25)",
            boxShadow: "0 12px 36px rgba(0, 0, 0, 0.7), 0 0 24px rgba(99, 102, 241, 0.3)"
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
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px", minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span
            style={{
              padding: "4px 10px",
              borderRadius: "999px",
              background: "rgba(99, 102, 241, 0.18)",
              border: "1px solid rgba(99, 102, 241, 0.35)",
              color: "#a5b4fc",
              fontSize: "0.72rem",
              fontWeight: 700,
              textTransform: "uppercase"
            }}
          >
            {genre}
          </span>
        </div>

        <h2
          style={{
            margin: 0,
            fontSize: "2rem",
            fontWeight: 900,
            letterSpacing: "0.04em",
            color: "#ffffff"
          }}
        >
          {artistName}
        </h2>

        <p
          style={{
            margin: 0,
            fontSize: "0.88rem",
            color: "rgba(255, 255, 255, 0.65)",
            lineHeight: 1.55
          }}
        >
          {bio}
        </p>

        {/* Featured Single Button & Socials */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "8px" }}>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handlePlayFeatured}
            style={{
              padding: "10px 20px",
              borderRadius: "14px",
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "0.84rem",
              fontWeight: 700,
              cursor: "pointer"
            }}
          >
            <Play size={14} fill="#ffffff" />
            <span>Nghe {featuredTrackTitle}</span>
          </motion.button>

          <div style={{ display: "flex", gap: "12px" }}>
            <a
              href={spotifyUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.06)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "rgba(255, 255, 255, 0.7)",
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
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.06)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "rgba(255, 255, 255, 0.7)",
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
