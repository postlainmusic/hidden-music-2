import React from "react";
import { motion } from "framer-motion";

interface MagneticMarbleIndicatorProps {
  isVisible: boolean;
  totalSlots?: number;
  activeIndex: number;
  onSelectIndex: (index: number) => void;
}

export const MagneticMarbleIndicator: React.FC<MagneticMarbleIndicatorProps> = ({
  isVisible,
  totalSlots = 5,
  activeIndex,
  onSelectIndex
}) => {
  return (
    <div
      style={{
        position: "absolute",
        bottom: "-44px",
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
        zIndex: 25
      }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{
          opacity: isVisible ? 1 : 0,
          y: isVisible ? 0 : 15
        }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        style={{
          width: "160px",
          height: "32px",
          borderRadius: "999px",
          background: "rgba(18, 18, 22, 0.75)",
          border: "1px solid rgba(255, 255, 255, 0.20)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 12px",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.7), inset 0 1px 1px rgba(255, 255, 255, 0.25)",
          pointerEvents: isVisible ? "auto" : "none"
        }}
      >
        {Array.from({ length: totalSlots }).map((_, slotIdx) => {
          const isSelected = activeIndex === slotIdx;
          return (
            <button
              key={slotIdx}
              onClick={(e) => {
                e.stopPropagation();
                onSelectIndex(slotIdx);
              }}
              style={{
                position: "relative",
                width: "24px",
                height: "24px",
                borderRadius: "50%",
                background: "transparent",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                padding: 0
              }}
            >
              {/* Background Slot Dot */}
              <span
                style={{
                  width: isSelected ? "8px" : "5px",
                  height: isSelected ? "8px" : "5px",
                  borderRadius: "50%",
                  background: isSelected ? "#ffffff" : "rgba(255, 255, 255, 0.3)",
                  boxShadow: isSelected ? "0 0 10px rgba(255, 255, 255, 0.9)" : "none",
                  transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)"
                }}
              />

              {/* Active Glowing Marble Ring */}
              {isSelected && (
                <motion.span
                  layoutId="active-marble-indicator"
                  transition={{ type: "spring", stiffness: 350, damping: 28 }}
                  style={{
                    position: "absolute",
                    inset: "2px",
                    borderRadius: "50%",
                    border: "1.5px solid rgba(255, 255, 255, 0.8)",
                    pointerEvents: "none"
                  }}
                />
              )}
            </button>
          );
        })}
      </motion.div>
    </div>
  );
};

export default MagneticMarbleIndicator;
