import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useAudioStore, Track, VaultSlot } from "../store/audioStore";
import { SquareVinylSleeve } from "../components/home/SquareVinylSleeve";
import { MinimalTracklistOverlay } from "../components/home/MinimalTracklistOverlay";
import { SleeveCarouselRevolver } from "../components/home/SleeveCarouselRevolver";
import { MagneticMarbleIndicator } from "../components/home/MagneticMarbleIndicator";
import { MetallicSheenGlow } from "../components/home/MetallicSheenGlow";
import { MinimalExploreTrigger } from "../components/home/MinimalExploreTrigger";

const HVL_COVER = "/covers/HVL_Album_Cover.webp";

interface HomePageProps {
  onExploreClick?: () => void;
  onOpen3D?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onExploreClick, onOpen3D }) => {
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

  // Active Section: 0 = Section 1 (Album Showcase), 1 = Section 2 (3D Cover Flow), 2 = Section 3 (Explore Universe)
  const [activeSection, setActiveSection] = useState<number>(0);

  // Section 1 State: "center" (Bìa nằm giữa) | "revealed" (Bìa trượt sang trái + 5 bài hát bên phải)
  const [sec1Stage, setSec1Stage] = useState<"center" | "revealed">("center");
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [isCenteringForVault, setIsCenteringForVault] = useState<boolean>(false);

  // Section 2 Revolver Index: Khởi tạo 2 (HVL ở chính giữa thanh 5 điểm)
  const [revolverIndex, setRevolverIndex] = useState<number>(2);
  const [dragOffset, setDragOffset] = useState<number>(0);

  const isScrollingRef = useRef<boolean>(false);
  const touchStartYRef = useRef<number>(0);
  const touchStartXRef = useRef<number>(0);
  const hasTouchMovedRef = useRef<boolean>(false);
  const isTouchInsideCarousel = useRef<boolean>(false);

  // Top 5 display tracks
  const displayTracks = topFavoriteTracks && topFavoriteTracks.length > 0
    ? topFavoriteTracks
    : queue.slice(0, 5);

  // 5 Vault Slots (HVL ở vị trí số 3 - Index 2)
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
    if (isTransitioning || isCenteringForVault) return;
    if (hasTouchMovedRef.current) return;

    if (slot && slot.status !== "live") {
      return;
    }

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

  const handleScrollDown = () => {
    if (isTransitioning || isCenteringForVault) return;

    if (activeSection === 0) {
      if (sec1Stage === "center") {
        setIsTransitioning(true);
        setSec1Stage("revealed");
        setTimeout(() => setIsTransitioning(false), 550);
        return;
      }
      if (sec1Stage === "revealed") {
        setIsTransitioning(true);
        setSec1Stage("center");
        setActiveSection(1);
        setTimeout(() => setIsTransitioning(false), 600);
        return;
      }
    }

    if (activeSection === 1) {
      setIsTransitioning(true);
      setActiveSection(2);
      setTimeout(() => setIsTransitioning(false), 600);
    }
  };

  const handleScrollUp = () => {
    if (isTransitioning || isCenteringForVault) return;

    if (activeSection === 2) {
      setIsTransitioning(true);
      setActiveSection(1);
      setTimeout(() => setIsTransitioning(false), 600);
      return;
    }

    if (activeSection === 1) {
      setIsTransitioning(true);
      setActiveSection(0);
      setSec1Stage("revealed");
      setTimeout(() => setIsTransitioning(false), 600);
      return;
    }

    if (activeSection === 0 && sec1Stage === "revealed") {
      setIsTransitioning(true);
      setSec1Stage("center");
      setTimeout(() => setIsTransitioning(false), 550);
    }
  };

  // Keyboard, Wheel & Touch Listeners
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (Math.abs(e.deltaY) < 25 || isScrollingRef.current) return;

      isScrollingRef.current = true;
      if (e.deltaY > 0) handleScrollDown();
      else handleScrollUp();

      setTimeout(() => {
        isScrollingRef.current = false;
      }, 700);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeSection === 1) {
        if (e.key === "ArrowLeft") {
          setRevolverIndex((prev) => (prev - 1 + activeSlots.length) % activeSlots.length);
          return;
        } else if (e.key === "ArrowRight") {
          setRevolverIndex((prev) => (prev + 1) % activeSlots.length);
          return;
        }
      }

      if (e.key === "ArrowDown" || e.key === "PageDown") {
        handleScrollDown();
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        handleScrollUp();
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartYRef.current = e.touches[0].clientY;
      touchStartXRef.current = e.touches[0].clientX;
      hasTouchMovedRef.current = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const dx = Math.abs(e.touches[0].clientX - touchStartXRef.current);
      const dy = Math.abs(e.touches[0].clientY - touchStartYRef.current);
      if (dx > 8 || dy > 8) {
        hasTouchMovedRef.current = true;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (isTransitioning || isCenteringForVault) return;
      const deltaY = touchStartYRef.current - e.changedTouches[0].clientY;
      if (Math.abs(deltaY) > 50) {
        if (deltaY > 0) handleScrollDown();
        else handleScrollUp();
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [activeSection, sec1Stage, isTransitioning, isCenteringForVault, activeSlots.length]);

  return (
    <main
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#ffffff",
        zIndex: 1,
        background: "transparent",
        padding: "0 24px"
      }}
    >
      {/* ─────────────────────────────────────────────────────────────────────
          UNIFIED STAGE CONTAINER: TỰ CÂN BẰNG ĐỐI XỨNG & ZERO OVERFLOW
      ────────────────────────────────────────────────────────────────────── */}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "880px",
          height: "380px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: activeSection === 2 ? 0 : 1,
          pointerEvents: activeSection === 2 ? "none" : "auto",
          transition: "opacity 0.4s ease-in-out"
        }}
      >
        {/* Background Sheen Glow behind cards in Section 2 */}
        <MetallicSheenGlow isVisible={activeSection === 1} />

        {/* ── SECTION 2: 3D REVOLVER COVER FLOW (PURE SLEEVES ONLY) ── */}
        <SleeveCarouselRevolver
          isVisible={activeSection === 1}
          slots={activeSlots}
          revolverIndex={revolverIndex}
          dragOffset={dragOffset}
          onSelectSlot={(offset) => {
            if (!hasTouchMovedRef.current) {
              setRevolverIndex((prev) => (prev + offset + activeSlots.length) % activeSlots.length);
            }
          }}
          onOpenVault={(slot) => handleAlbumClick(slot)}
        />

        {/* ── SECTION 1: ALBUM SHOWCASE SLEEVE (CENTER TO REVEAL) ── */}
        {activeSection === 0 && (
          <motion.div
            animate={{
              x: sec1Stage === "revealed" ? -180 : 0
            }}
            transition={{
              duration: isCenteringForVault ? 0.7 : 0.6,
              ease: [0.16, 1, 0.3, 1]
            }}
            onClick={() => handleAlbumClick(activeSlots[2])}
            style={{
              position: "absolute",
              zIndex: 15,
              cursor: "pointer",
              userSelect: "none"
            }}
          >
            <SquareVinylSleeve
              coverUrl={HVL_COVER}
              title="HVL (99%)"
              size={280}
              isActive={true}
            />
          </motion.div>
        )}

        {/* ── SECTION 1: MINIMAL 5-TRACK OVERLAY (SLIDE OUT TO THE RIGHT) ── */}
        {activeSection === 0 && (
          <MinimalTracklistOverlay
            tracks={displayTracks}
            isVisible={sec1Stage === "revealed"}
            favoritedTrackIds={favoritedTrackIds}
            currentTrackId={currentTrack?.id}
            isPlaying={isPlaying}
            onTrackSelect={handleTrackSelect}
            onToggleFavorite={(e, trackId) => {
              e.stopPropagation();
              toggleFavoriteTrack(trackId);
            }}
          />
        )}

        {/* ── SECTION 2: 5-POINT MAGNETIC ROLLING MARBLE CAPSULE ── */}
        <MagneticMarbleIndicator
          isVisible={activeSection === 1}
          totalSlots={5}
          activeIndex={revolverIndex}
          onSelectIndex={(idx) => setRevolverIndex(idx)}
        />
      </div>

      {/* ─────────────────────────────────────────────────────────────────────
          SECTION 3: EXPLORE UNIVERSE VIEWPORT
      ────────────────────────────────────────────────────────────────────── */}
      <MinimalExploreTrigger
        isVisible={activeSection === 2}
        onEnter3D={() => handleAlbumClick(activeSlots[2])}
        onBackToShowcase={() => {
          setActiveSection(0);
          setSec1Stage("center");
        }}
      />
    </main>
  );
};

export default HomePage;
