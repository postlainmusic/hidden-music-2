import React from "react";
import { motion } from "framer-motion";
import { Play, Sparkles } from "lucide-react";
import { useAudioStore } from "../../store/audioStore";

interface HeroMusicBannerProps {
  headline?: string;
  subheadline?: string;
  bannerUrl?: string;
  trackId?: string;
  audioUrl?: string;
  ctaText?: string;
  badgeText?: string;
  onOpen3D?: () => void;
}

export const HeroMusicBanner: React.FC<HeroMusicBannerProps> = ({
  headline = "IDK - MCK (Official Single)",
  subheadline = "Thưởng thức bản Master Lossless 24-bit 96kHz độc quyền từ Album HVL (99%)",
  bannerUrl = "/covers/HVL_Album_Cover.webp",
  trackId = "mck-02",
  ctaText = "Nghe Ngay",
  badgeText = "BẢN PHÁT HÀNH MỚI",
  onOpen3D
}) => {
  const { playTrack, queue } = useAudioStore();

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    const targetTrack = queue.find((t) => t.id === trackId) || queue[0];
    if (targetTrack) {
      playTrack(targetTrack);
    }
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
        maxWidth: "880px",
        height: "360px",
        borderRadius: "24px",
        overflow: "hidden",
        display: "flex",
        alignItems: "flex-end",
        padding: "36px 40px",
        boxShadow: "0 24px 60px rgba(0, 0, 0, 0.9), 0 0 40px rgba(255, 255, 255, 0.08)",
        border: "1px solid rgba(255, 255, 255, 0.15)",
        background: "#08080c"
      }}
    >
      {/* Background Banner Backdrop Image */}
      <img
        src={bannerUrl}
        alt={headline}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          filter: "brightness(0.55) contrast(1.1)",
          zIndex: 0
        }}
      />

      {/* Cinematic Vignette & Ambient Gradient Overlays */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(0deg, rgba(5, 5, 8, 0.95) 0%, rgba(5, 5, 8, 0.4) 60%, rgba(5, 5, 8, 0.1) 100%)",
          zIndex: 1
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(circle at 80% 30%, rgba(99, 102, 241, 0.25) 0%, transparent 60%)",
          zIndex: 1,
          pointerEvents: "none"
        }}
      />

      {/* Foreground Content */}
      <div
        style={{
          position: "relative",
          zIndex: 5,
          maxWidth: "560px",
          display: "flex",
          flexDirection: "column",
          gap: "12px"
        }}
      >
        {/* Badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "5px 12px",
            borderRadius: "999px",
            background: "rgba(255, 255, 255, 0.12)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            color: "#ffffff",
            fontSize: "0.72rem",
            fontWeight: 800,
            letterSpacing: "0.08em",
            width: "fit-content"
          }}
        >
          <Sparkles size={12} color="#a5b4fc" />
          <span>{badgeText}</span>
        </div>

        {/* Headline Title */}
        <h1
          style={{
            margin: 0,
            fontSize: "2.1rem",
            fontWeight: 900,
            letterSpacing: "0.02em",
            color: "#ffffff",
            lineHeight: 1.15,
            textShadow: "0 4px 16px rgba(0, 0, 0, 0.6)"
          }}
        >
          {headline}
        </h1>

        {/* Subheadline / Artist Description */}
        <p
          style={{
            margin: 0,
            fontSize: "0.92rem",
            color: "rgba(255, 255, 255, 0.75)",
            lineHeight: 1.5,
            fontWeight: 400
          }}
        >
          {subheadline}
        </p>

        {/* CTA Play Button */}
        <div style={{ marginTop: "8px", display: "flex", alignItems: "center", gap: "16px" }}>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(255, 255, 255, 0.4)" }}
            whileTap={{ scale: 0.97 }}
            onClick={handlePlay}
            style={{
              padding: "12px 28px",
              borderRadius: "999px",
              background: "#ffffff",
              color: "#000000",
              fontWeight: 800,
              fontSize: "0.92rem",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.5)"
            }}
          >
            <Play size={16} fill="#000000" />
            <span>{ctaText}</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default HeroMusicBanner;
