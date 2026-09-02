import React from "react";
import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import { SquareVinylSleeve } from "../media/SquareVinylSleeve";
import { useIsMobile } from "../../../hooks/useIsMobile";

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
  const isMobile = useIsMobile();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: "relative",
        width: "100%",
        maxWidth: isMobile ? "100%" : "800px",
        background: "transparent",
        border: "none",
        boxShadow: "none",
        padding: isMobile ? "10px 16px" : "20px 24px",
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        alignItems: "center",
        textAlign: isMobile ? "center" : "left",
        gap: isMobile ? "20px" : "36px",
        zIndex: 5
      }}
    >
      {/* Album Sleeve on Left */}
      <SquareVinylSleeve
        coverUrl={coverUrl}
        title="Editorial Feature Sleeve"
        size={isMobile ? 150 : 200}
        isActive={false}
      />

      {/* Editorial Content on Right */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: isMobile ? "center" : "flex-start",
          gap: "14px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "rgba(255, 255, 255, 0.5)" }}>
          <Quote size={18} />
          <span style={{ fontSize: "0.74rem", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            {source}
          </span>
        </div>

        <blockquote
          style={{
            margin: 0,
            fontSize: isMobile ? "1rem" : "1.18rem",
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
