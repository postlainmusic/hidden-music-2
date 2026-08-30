import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface MinimalExploreTriggerProps {
  isVisible: boolean;
  onEnter3D: () => void;
  onBackToShowcase: () => void;
}

export const MinimalExploreTrigger: React.FC<MinimalExploreTriggerProps> = ({
  isVisible,
  onEnter3D,
  onBackToShowcase
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{
        opacity: isVisible ? 1 : 0,
        y: isVisible ? 0 : 30,
        pointerEvents: isVisible ? "auto" : "none"
      }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "100px 24px",
        textAlign: "center",
        zIndex: 10
      }}
    >
      <h2
        style={{
          fontSize: "2.4rem",
          fontWeight: 800,
          marginBottom: "16px",
          letterSpacing: "0.06em",
          color: "#ffffff"
        }}
      >
        EXPLORE UNIVERSE
      </h2>
      <p
        style={{
          color: "rgba(255, 255, 255, 0.55)",
          maxWidth: "480px",
          marginBottom: "32px",
          lineHeight: 1.6,
          fontSize: "0.92rem"
        }}
      >
        Không gian âm nhạc mở rộng đang được kết nối với hệ sinh thái streaming chất lượng phòng thu độc quyền.
      </p>

      <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={onEnter3D}
          style={{
            padding: "13px 30px",
            borderRadius: "999px",
            background: "#ffffff",
            color: "#000000",
            fontWeight: 800,
            fontSize: "0.92rem",
            border: "none",
            cursor: "pointer",
            boxShadow: "0 8px 24px rgba(255, 255, 255, 0.25)",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >
          <span>Vào 3D Vault (HVL)</span>
          <ArrowRight size={16} />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.03, backgroundColor: "rgba(255, 255, 255, 0.12)" }}
          whileTap={{ scale: 0.97 }}
          onClick={onBackToShowcase}
          style={{
            padding: "13px 26px",
            borderRadius: "999px",
            background: "rgba(255, 255, 255, 0.06)",
            color: "#ffffff",
            fontWeight: 600,
            fontSize: "0.9rem",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            cursor: "pointer"
          }}
        >
          Quay lại Showcase
        </motion.button>
      </div>
    </motion.div>
  );
};

export default MinimalExploreTrigger;
