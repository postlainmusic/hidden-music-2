import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ArrowRight, Disc3, Sparkles, Play, Pause } from "lucide-react";
import { useAudioStore, Track } from "../store/audioStore";

const HVL_COVER = "/covers/HVL_Album_Cover.webp";

interface MobileHomePageProps {
  onExploreClick?: () => void;
  onOpen3D?: () => void;
}

const formatDuration = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
};

export const MobileHomePage: React.FC<MobileHomePageProps> = ({ onExploreClick, onOpen3D }) => {
  const {
    currentTrack,
    playTrack,
    isPlaying,
    favoritedTrackIds,
    toggleFavoriteTrack,
    topFavoriteTracks,
    sections,
    vaultSlots,
    queue
  } = useAudioStore();

  const enabledSections = sections && sections.length > 0
    ? sections.filter((s) => s.is_enabled === 1).sort((a, b) => a.order_index - b.order_index)
    : [
        {
          id: "sec-album-showcase",
          title: "HVL (99%) Showcase",
          template_type: "album_showcase" as const,
          order_index: 1,
          is_enabled: 1,
          config: {
            album_id: "hvl-99",
            title: "HVL (99%)",
            artist: "MCK",
            cover_url: HVL_COVER,
            description: "Album phòng thu đầu tay gồm 30 bài hát Lossless FLAC độc quyền."
          }
        },
        {
          id: "sec-cover-flow",
          title: "Vault Slots 3D Cover Flow",
          template_type: "cover_flow" as const,
          order_index: 2,
          is_enabled: 1,
          config: { slots_count: 5 }
        },
        {
          id: "sec-explore-universe",
          title: "Explore Universe Portal",
          template_type: "explore_universe" as const,
          order_index: 3,
          is_enabled: 1,
          config: {
            headline: "EXPLORE UNIVERSE",
            subtext: "Không gian âm nhạc mở rộng đang được kết nối với hệ sinh thái streaming độc quyền."
          }
        }
      ];

  const [activeSectionIndex, setActiveSectionIndex] = useState<number>(0);
  const [sec1Stage, setSec1Stage] = useState<"center" | "revealed">("center");
  const [revolverIndex, setRevolverIndex] = useState<number>(2);

  const touchStartY = useRef<number>(0);
  const displayTracks = topFavoriteTracks && topFavoriteTracks.length > 0 ? topFavoriteTracks : queue.slice(0, 5);
  const activeSection = enabledSections[activeSectionIndex] || enabledSections[0];

  const activeSlots = vaultSlots && vaultSlots.length >= 5
    ? vaultSlots.slice(0, 5)
    : [
        { id: "slot-4", slot_number: 4, title: "VAULT SLOT 04", artist: "Lossless Ready", cover_url: "", status: "locked" as const },
        { id: "slot-5", slot_number: 5, title: "VAULT SLOT 05", artist: "Lossless Ready", cover_url: "", status: "locked" as const },
        { id: "slot-1", slot_number: 1, title: "HVL (99%)", artist: "MCK • 30 Tracks", cover_url: HVL_COVER, status: "live" as const },
        { id: "slot-2", slot_number: 2, title: "VAULT SLOT 02", artist: "Lossless Ready", cover_url: "", status: "coming_soon" as const },
        { id: "slot-3", slot_number: 3, title: "VAULT SLOT 03", artist: "Lossless Ready", cover_url: "", status: "locked" as const }
      ];

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const deltaY = touchStartY.current - e.changedTouches[0].clientY;
    if (Math.abs(deltaY) > 40) {
      if (deltaY > 0) {
        // Swipe up
        if (activeSection.template_type === "album_showcase" && sec1Stage === "center") {
          setSec1Stage("revealed");
        } else if (activeSectionIndex < enabledSections.length - 1) {
          setSec1Stage("center");
          setActiveSectionIndex((prev) => prev + 1);
        }
      } else {
        // Swipe down
        if (activeSection.template_type === "album_showcase" && sec1Stage === "revealed") {
          setSec1Stage("center");
        } else if (activeSectionIndex > 0) {
          setActiveSectionIndex((prev) => prev - 1);
        }
      }
    }
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 20px 100px",
        overflow: "hidden"
      }}
    >
      {/* Navigation Indicators */}
      <div style={{ position: "fixed", right: "14px", top: "50%", transform: "translateY(-50%)", display: "flex", flexDirection: "column", gap: "8px", zIndex: 40 }}>
        {enabledSections.map((sec, i) => (
          <div
            key={sec.id || i}
            onClick={() => setActiveSectionIndex(i)}
            style={{
              width: i === activeSectionIndex ? "6px" : "4px",
              height: i === activeSectionIndex ? "20px" : "4px",
              borderRadius: "999px",
              backgroundColor: i === activeSectionIndex ? "#ffffff" : "rgba(255, 255, 255, 0.3)",
              transition: "all 0.3s ease"
            }}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* TEMPLATE 1: ALBUM SHOWCASE */}
        {activeSection.template_type === "album_showcase" && (
          <motion.div
            key="mob-sec-album"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{ width: "100%", maxWidth: "340px", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}
          >
            <motion.div
              animate={{ y: sec1Stage === "revealed" ? -15 : 0 }}
              onClick={() => {
                if (sec1Stage === "center") setSec1Stage("revealed");
                else if (onOpen3D) onOpen3D();
              }}
              style={{
                width: "220px",
                height: "280px",
                borderRadius: "20px",
                overflow: "hidden",
                boxShadow: "0 16px 40px rgba(0,0,0,0.8), 0 0 30px rgba(99, 102, 241, 0.3)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                display: "flex",
                flexDirection: "column"
              }}
            >
              <img src={activeSection.config?.cover_url || HVL_COVER} alt="Cover" style={{ width: "100%", height: "210px", objectFit: "cover" }} />
              <div style={{ flex: 1, padding: "10px 14px", background: "rgba(10, 10, 15, 0.9)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 800 }}>{activeSection.config?.title || "HVL (99%)"}</h4>
                <span style={{ fontSize: "0.72rem", color: "rgba(255, 255, 255, 0.5)" }}>{activeSection.config?.artist || "MCK"} • 30 Tracks</span>
              </div>
            </motion.div>

            {sec1Stage === "revealed" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ width: "100%", display: "flex", flexDirection: "column", gap: "6px" }}
              >
                {displayTracks.slice(0, 4).map((track, i) => (
                  <div
                    key={track.id || i}
                    onClick={() => {
                      playTrack(track);
                      if (onOpen3D) onOpen3D();
                    }}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "12px",
                      backgroundColor: "rgba(255, 255, 255, 0.06)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between"
                    }}
                  >
                    <span style={{ fontSize: "0.8rem", fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {track.title}
                    </span>
                    <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)" }}>{formatDuration(track.duration)}</span>
                  </div>
                ))}
              </motion.div>
            )}
          </motion.div>
        )}

        {/* TEMPLATE 2: COVER FLOW */}
        {activeSection.template_type === "cover_flow" && (
          <motion.div
            key="mob-sec-coverflow"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{ width: "100%", maxWidth: "340px", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}
          >
            <div
              onClick={() => {
                if (onOpen3D) onOpen3D();
              }}
              style={{
                width: "240px",
                height: "300px",
                borderRadius: "20px",
                overflow: "hidden",
                boxShadow: "0 20px 40px rgba(0,0,0,0.8), 0 0 30px rgba(99, 102, 241, 0.3)",
                border: "1px solid rgba(99, 102, 241, 0.4)",
                display: "flex",
                flexDirection: "column"
              }}
            >
              <img src={HVL_COVER} alt="Cover" style={{ width: "100%", height: "230px", objectFit: "cover" }} />
              <div style={{ flex: 1, padding: "10px 14px", background: "rgba(10, 10, 15, 0.9)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <span style={{ fontSize: "0.68rem", color: "#34d399", fontWeight: 800 }}>SLOT 01 • MASTER LOSSLESS</span>
                <h4 style={{ margin: "2px 0 0", fontSize: "0.95rem", fontWeight: 700 }}>HVL (99%)</h4>
              </div>
            </div>
          </motion.div>
        )}

        {/* OTHER TEMPLATES */}
        {activeSection.template_type !== "album_showcase" && activeSection.template_type !== "cover_flow" && (
          <motion.div
            key="mob-sec-other"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{
              width: "100%",
              maxWidth: "340px",
              padding: "28px 20px",
              borderRadius: "24px",
              backgroundColor: "rgba(10, 11, 16, 0.85)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "14px"
            }}
          >
            <h3 style={{ fontSize: "1.4rem", fontWeight: 800, margin: 0 }}>{activeSection.title}</h3>
            <p style={{ fontSize: "0.82rem", color: "rgba(255, 255, 255, 0.55)", margin: 0, lineHeight: 1.5 }}>
              {activeSection.config?.subheadline || activeSection.config?.bio || activeSection.config?.subtext || activeSection.config?.quote || "Nội dung đang được cập nhật từ Admin Studio."}
            </p>
            <button
              onClick={onOpen3D}
              style={{
                padding: "10px 24px",
                borderRadius: "999px",
                background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
                border: "none",
                color: "#ffffff",
                fontWeight: 700,
                fontSize: "0.84rem",
                marginTop: "6px"
              }}
            >
              Vào 3D Zone
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MobileHomePage;
