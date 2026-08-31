import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";

const CD_SLEEVE_PLACEHOLDER = "/textures/cd_sleeve_placeholder.png";

interface SquareVinylSleeveProps extends HTMLMotionProps<"div"> {
  coverUrl?: string | null;
  title?: string;
  size?: number | string;
  isPlaceholder?: boolean;
  isActive?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  children?: React.ReactNode;
}

export const SquareVinylSleeve: React.FC<SquareVinylSleeveProps> = ({
  coverUrl,
  title = "Vinyl Sleeve",
  size = 280,
  isPlaceholder = false,
  isActive = false,
  onClick,
  style,
  children,
  ...props
}) => {
  // If coverUrl is missing, empty, or marked as placeholder, fallback to authentic CD shrinkwrap sleeve
  const displayImage = !coverUrl || isPlaceholder || coverUrl.trim() === ""
    ? CD_SLEEVE_PLACEHOLDER
    : coverUrl;

  const sizePx = typeof size === "number" ? `${size}px` : size;

  return (
    <motion.div
      onClick={onClick}
      style={{
        position: "relative",
        width: sizePx,
        height: sizePx,
        minWidth: sizePx,
        minHeight: sizePx,
        borderRadius: "10px",
        overflow: "hidden",
        backgroundColor: "#030305",
        boxShadow: isActive
          ? "0 24px 60px rgba(0, 0, 0, 0.9), 0 0 35px rgba(255, 255, 255, 0.1)"
          : "0 16px 40px rgba(0, 0, 0, 0.8)",
        border: isActive
          ? "1px solid rgba(255, 255, 255, 0.2)"
          : "1px solid rgba(255, 255, 255, 0.08)",
        cursor: onClick ? "pointer" : "default",
        userSelect: "none",
        flexShrink: 0,
        ...style
      }}
      {...props}
    >
      {/* Pure 1:1 Sleeve Image */}
      <img
        src={displayImage}
        alt={title}
        draggable={false}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
          filter: isPlaceholder ? "contrast(1.05) brightness(0.95)" : "none"
        }}
        onError={(e) => {
          // If custom cover fails to load, gracefully fallback to CD sleeve texture
          (e.target as HTMLImageElement).src = CD_SLEEVE_PLACEHOLDER;
        }}
      />

      {/* Subtle Specular Plastic/Vinyl Sheen Overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0) 50%, rgba(0, 0, 0, 0.25) 100%)",
          pointerEvents: "none"
        }}
      />

      {children}
    </motion.div>
  );
};

export default SquareVinylSleeve;
