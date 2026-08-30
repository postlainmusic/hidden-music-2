import React from "react";
import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import { SquareVinylSleeve } from "./SquareVinylSleeve";

interface EditorialPressCardProps {
  quote?: string;
  source?: string;
  author?: string;
  coverUrl?: string;
}

export const EditorialPressCard: React.FC<EditorialPressCardProps> = ({
  quote = "HVL (99%) là đỉnh cao âm thanh phòng thu Lossless thuần khiết, định nghĩa lại toàn bộ chuẩn mực Melodic Rap Việt Nam.",
  source = "ROLLING STONE ASIA",
  author = "Trưởng ban Biên tập Âm nhạc",
  coverUrl = "/covers/HVL_Album_Cover.webp"
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "800px",
        borderRadius: "24px",
        background: "rgba(18, 18, 24, 0.7)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "1px solid rgba(255, 255, 255, 0.12)",
        boxShadow: "0 24px 60px rgba(0, 0, 0, 0.85), 0 0 30px rgba(255, 255, 255, 0.04)",
        padding: "36px 40px",
        display: "flex",
        alignItems: "center",
        gap: "36px",
        zIndex: 5
      }}
    >
      {/* Album Sleeve on Left */}
      <SquareVinylSleeve
        coverUrl={coverUrl}
        title="Editorial Feature Sleeve"
        size={200}
        isActive={false}
      />

      {/* Editorial Content on Right */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "rgba(255, 255, 255, 0.4)" }}>
          <Quote size={20} />
          <span style={{ fontSize: "0.74rem", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            {source}
          </span>
        </div>

        <blockquote
          style={{
            margin: 0,
            fontSize: "1.18rem",
            fontStyle: "italic",
            lineHeight: 1.6,
            color: "#ffffff",
            fontWeight: 500,
            letterSpacing: "0.01em"
          }}
        >
          "{quote}"
        </blockquote>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "24px", height: "1px", background: "rgba(255, 255, 255, 0.3)" }} />
          <span style={{ fontSize: "0.78rem", color: "rgba(255, 255, 255, 0.5)", fontWeight: 600 }}>
            {author}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default EditorialPressCard;
