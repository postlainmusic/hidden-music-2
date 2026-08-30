import React from "react";
import { motion } from "framer-motion";
import { SquareVinylSleeve } from "./SquareVinylSleeve";
import { VaultSlot } from "../../store/audioStore";

interface SleeveCarouselRevolverProps {
  isVisible: boolean;
  slots: VaultSlot[];
  revolverIndex: number;
  dragOffset?: number;
  onSelectSlot: (offset: number) => void;
  onOpenVault: (slot: VaultSlot) => void;
}

export const SleeveCarouselRevolver: React.FC<SleeveCarouselRevolverProps> = ({
  isVisible,
  slots,
  revolverIndex,
  dragOffset = 0,
  onSelectSlot,
  onOpenVault
}) => {
  const totalSlots = slots.length > 0 ? slots.length : 5;

  const getSlot = (offset: number) => {
    const idx = (revolverIndex + offset + totalSlots * 10) % totalSlots;
    return { slot: slots[idx] || { id: `slot-${idx}`, title: `VAULT SLOT 0${idx + 1}`, status: "locked", cover_url: "" } };
  };

  if (!isVisible) return null;

  return (
    <>
      {/* ── LEFT & RIGHT WING SLEEVES (FADE & SCALE) ── */}
      {[-1, 1].map((offset) => {
        const { slot } = getSlot(offset);
        const isPlaceholder = slot.status !== "live" || !slot.cover_url;

        return (
          <motion.div
            key={`wing-${slot.id}-${offset}`}
            initial={{ opacity: 0 }}
            onClick={() => onSelectSlot(offset)}
            animate={{
              x: offset === -1 ? -250 + dragOffset * 0.25 : 250 + dragOffset * 0.25,
              scale: 0.82,
              opacity: 0.45,
              filter: "blur(2px) brightness(0.6)",
              zIndex: 5
            }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "absolute",
              cursor: "pointer",
              userSelect: "none"
            }}
          >
            <SquareVinylSleeve
              coverUrl={slot.cover_url}
              title={slot.title}
              size={280}
              isPlaceholder={isPlaceholder}
              isActive={false}
            />
          </motion.div>
        );
      })}

      {/* ── CENTER ACTIVE SLEEVE ── */}
      {(() => {
        const { slot } = getSlot(0);
        const isPlaceholder = slot.status !== "live" || !slot.cover_url;

        return (
          <motion.div
            key={`center-${slot.id}`}
            onClick={() => {
              if (slot.status === "live") {
                onOpenVault(slot);
              }
            }}
            animate={{
              x: dragOffset * 0.35,
              scale: 1,
              opacity: 1,
              filter: "none",
              zIndex: 10
            }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "absolute",
              cursor: slot.status === "live" ? "pointer" : "default",
              userSelect: "none"
            }}
          >
            <SquareVinylSleeve
              coverUrl={slot.cover_url}
              title={slot.title}
              size={280}
              isPlaceholder={isPlaceholder}
              isActive={true}
            />
          </motion.div>
        );
      })()}
    </>
  );
};

export default SleeveCarouselRevolver;
