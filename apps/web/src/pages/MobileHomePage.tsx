import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ArrowRight } from "lucide-react";
import { useAudioStore, Track, VaultSlot } from "../store/audioStore";
import { SquareVinylSleeve } from "../components/home/SquareVinylSleeve";
import { MagneticMarbleIndicator } from "../components/home/MagneticMarbleIndicator";
import { MetallicSheenGlow } from "../components/home/MetallicSheenGlow";

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
    vaultSlots,
    queue
  } = useAudioStore();

  const [activeSection, setActiveSection] = useState<number>(0);
  const [sec1Stage, setSec1Stage] = useState<"center" | "revealed">("center");
  const [isCenteringForVault, setIsCenteringForVault] = useState<boolean>(false);
  const [revolverIndex, setRevolverIndex] = useState<number>(2);

  const touchStartY = useRef<number>(0);
  const touchStartX = useRef<number>(0);
  const hasTouchMovedRef = useRef<boolean>(false);

  const displayTracks = topFavoriteTracks && topFavoriteTracks.length > 0
    ? topFavoriteTracks
    : queue.slice(0, 5);

  const activeSlots: VaultSlot[] = vaultSlots && vaultSlots.length >= 5
    ? vaultSlots.slice(0, 5)
    : [
        { id: "slot-4", slot_number: 4, title: "VAULT SLOT 04", artist: "Lossless Ready", cover_url: "", status: "locked" },
        { id: "slot-5", slot_number: 5, title: "VAULT SLOT 05", artist: "Lossless Ready", cover_url: "", status: "locked" },
        { id: "slot-1", slot_number: 1, title: "HVL (99%)", artist: "MCK • 30 Tracks", cover_url: HVL_COVER, status: "live" },
        { id: "slot-2", slot_number: 2, title: "VAULT SLOT 02", artist: "Lossless Ready", cover_url: "", status: "coming_soon" },
        { id: "slot-3", slot_number: 3, title: "VAULT SLOT 03", artist: "Lossless Ready", cover_url: "", status: "locked" }
      ];

  const handleAlbumClick = (slot?: VaultSlot) => {
    if (hasTouchMovedRef.current) return;
    if (slot && slot.status !== "live") return;

    if (activeSection === 0 && sec1Stage === "revealed") {
      setIsCenteringForVault(true);
      setSec1Stage("center");
      setTimeout(() => {
        if (onOpen3D) onOpen3D();
        setIsCenteringForVault(false);
      }, 700);
    } else if (activeSection === 0 && sec1Stage === "center") {
      setSec1Stage("revealed");
    } else {
      if (onOpen3D) onOpen3D();
    }
  };

  const handleTrackSelect = (track: Track) => {
    if (hasTouchMovedRef.current) return;
    playTrack(track);
    if (onOpen3D) onOpen3D();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchStartX.current = e.touches[0].clientX;
    hasTouchMovedRef.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const dx = Math.abs(e.touches[0].clientX - touchStartX.current);
    const dy = Math.abs(e.touches[0].clientY - touchStartY.current);
    if (dx > 8 || dy > 8) hasTouchMovedRef.current = true;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const deltaY = touchStartY.current - e.changedTouches[0].clientY;
    if (Math.abs(deltaY) > 40) {
      if (deltaY > 0) {
        // Swipe up
        if (activeSection === 0) {
          if (sec1Stage === "center") setSec1Stage("revealed");
          else {
            setSec1Stage("center");
            setActiveSection(1);
          }
        } else if (activeSection === 1) {
          setActiveSection(2);
        }
      } else {
        // Swipe down
        if (activeSection === 2) {
          setActiveSection(1);
        } else if (activeSection === 1) {
          setActiveSection(0);
          setSec1Stage("revealed");
        } else if (activeSection === 0 && sec1Stage === "revealed") {
          setSec1Stage("center");
        }
      }
    }
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
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
        padding: "60px 20px 80px",
        overflow: "hidden",
        userSelect: "none"
      }}
    >
      <AnimatePresence mode="wait">
        {/* ── SECTION 1: MINIMAL ALBUM SHOWCASE ── */}
        {activeSection === 0 && (
          <motion.div
            key="mob-sec-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ width: "100%", maxWidth: "340px", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}
          >
            <motion.div
              animate={{ y: sec1Stage === "revealed" ? -20 : 0 }}
              transition={{ duration: isCenteringForVault ? 0.7 : 0.5, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => handleAlbumClick(activeSlots[2])}
            >
              <SquareVinylSleeve
                coverUrl={HVL_COVER}
                title="HVL (99%)"
                size={230}
                isActive={true}
              />
            </motion.div>

            {sec1Stage === "revealed" && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ width: "100%", display: "flex", flexDirection: "column", gap: "6px" }}
              >
                {displayTracks.slice(0, 4).map((track, i) => {
                  const isFav = favoritedTrackIds.includes(track.id);
                  const isPlayingThis = isPlaying && currentTrack?.id === track.id;

                  return (
                    <div
                      key={track.id || i}
                      onClick={() => handleTrackSelect(track)}
                      style={{
                        padding: "8px 12px",
                        borderRadius: "10px",
                        backgroundColor: isPlayingThis ? "rgba(255, 255, 255, 0.08)" : "rgba(255, 255, 255, 0.03)",
                        backdropFilter: "blur(16px)",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0, flex: 1 }}>
                        <span style={{ fontSize: "0.7rem", color: "rgba(255, 255, 255, 0.4)", fontWeight: 700 }}>0{i + 1}</span>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <p style={{ margin: 0, fontSize: "0.82rem", fontWeight: 600, color: "#ffffff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {track.title}
                          </p>
                          <p style={{ margin: 0, fontSize: "0.68rem", color: "rgba(255, 255, 255, 0.4)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {track.artist}
                          </p>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "0.7rem", color: "rgba(255, 255, 255, 0.35)" }}>{formatDuration(track.duration)}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavoriteTrack(track.id);
                          }}
                          style={{ background: "none", border: "none", color: isFav ? "#ffffff" : "rgba(255,255,255,0.3)" }}
                        >
                          <Heart size={13} fill={isFav ? "#ffffff" : "none"} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ── SECTION 2: 3D COVER FLOW (PURE SLEEVES) ── */}
        {activeSection === 1 && (
          <motion.div
            key="mob-sec-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ width: "100%", maxWidth: "340px", display: "flex", flexDirection: "column", alignItems: "center", gap: "24px", position: "relative" }}
          >
            <MetallicSheenGlow isVisible={true} />

            <div
              onClick={() => handleAlbumClick(activeSlots[revolverIndex])}
              style={{ position: "relative", zIndex: 10 }}
            >
              <SquareVinylSleeve
                coverUrl={activeSlots[revolverIndex]?.cover_url}
                title={activeSlots[revolverIndex]?.title}
                size={240}
                isPlaceholder={activeSlots[revolverIndex]?.status !== "live" || !activeSlots[revolverIndex]?.cover_url}
                isActive={true}
              />
            </div>

            {/* 5-Dot Indicator */}
            <div style={{ position: "relative", zIndex: 10 }}>
              <MagneticMarbleIndicator
                isVisible={true}
                totalSlots={5}
                activeIndex={revolverIndex}
                onSelectIndex={(idx) => setRevolverIndex(idx)}
              />
            </div>
          </motion.div>
        )}

        {/* ── SECTION 3: EXPLORE UNIVERSE ── */}
        {activeSection === 2 && (
          <motion.div
            key="mob-sec-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{ width: "100%", maxWidth: "300px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "16px" }}
          >
            <h3 style={{ fontSize: "1.8rem", fontWeight: 800, margin: 0, letterSpacing: "0.06em" }}>EXPLORE UNIVERSE</h3>
            <p style={{ fontSize: "0.82rem", color: "rgba(255, 255, 255, 0.55)", margin: 0, lineHeight: 1.5 }}>
              Không gian âm nhạc mở rộng đang được kết nối với hệ sinh thái streaming độc quyền.
            </p>
            <button
              onClick={() => handleAlbumClick(activeSlots[2])}
              style={{
                padding: "12px 28px",
                borderRadius: "999px",
                background: "#ffffff",
                color: "#000000",
                fontWeight: 800,
                fontSize: "0.88rem",
                border: "none",
                marginTop: "8px",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              <span>Vào 3D Vault</span>
              <ArrowRight size={15} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MobileHomePage;
