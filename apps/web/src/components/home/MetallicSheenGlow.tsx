import React from "react";
import { motion } from "framer-motion";

interface MetallicSheenGlowProps {
  isVisible: boolean;
}

export const MetallicSheenGlow: React.FC<MetallicSheenGlowProps> = ({ isVisible }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{
        opacity: isVisible ? 0.35 : 0,
        scale: isVisible ? 1 : 0.8
      }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      style={{
        position: "absolute",
        width: "480px",
        height: "480px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(255, 255, 255, 0.12) 0%, rgba(99, 102, 241, 0.08) 35%, rgba(0, 0, 0, 0) 70%)",
        filter: "blur(40px)",
        pointerEvents: "none",
        zIndex: 0
      }}
    />
  );
};

export default MetallicSheenGlow;
