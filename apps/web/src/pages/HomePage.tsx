import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAudioStore, Track, VaultSlot, DynamicSection } from "../store/audioStore";
import { SquareVinylSleeve } from "../components/home/SquareVinylSleeve";
import { MinimalTracklistOverlay } from "../components/home/MinimalTracklistOverlay";
import { SleeveCarouselRevolver } from "../components/home/SleeveCarouselRevolver";
import { MagneticMarbleIndicator } from "../components/home/MagneticMarbleIndicator";
import { MetallicSheenGlow } from "../components/home/MetallicSheenGlow";
import { MinimalExploreTrigger } from "../components/home/MinimalExploreTrigger";
import { HeroMusicBanner } from "../components/home/HeroMusicBanner";
import { ArtistSpotlightCard } from "../components/home/ArtistSpotlightCard";
import { VideoPremierePlayer } from "../components/home/VideoPremierePlayer";
import { EditorialPressCard } from "../components/home/EditorialPressCard";

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
    sections,
    queue
  } = useAudioStore();

  // Active enabled sections from D1 store, fallback to default 3 core sections
  const activeSections: DynamicSection[] = sections && sections.filter((s) => s.is_active).length > 0
    ? sections.filter((s) => s.is_active)
    : [
        { id: "sec-default-1", title: "Album Showcase", subtitle: "Top 5 Bài Hát", template_type: "album_showcase", sort_order: 1, is_active: true },
        { id: "sec-default-2", title: "3D Cover Flow", subtitle: "Băng chuyền 3D", template_type: "cover_flow", sort_order: 2, is_active: true },
        { id: "sec-default-3", title: "Explore Universe", subtitle: "3D Space", template_type: "explore_universe", sort_order: 3, is_active: true }
      ];

  const [activeSectionIndex, setActiveSectionIndex] = useState<number>(0);

  // Section 1 State: "center" (Bìa nằm giữa) | "revealed" (Bìa trượt sang trái + 5 bài hát bên phải)
  const [sec1Stage, setSec1Stage] = useState<"center" | "revealed">("center");
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [isCenteringForVault, setIsCenteringForVault] = useState<boolean>(false);

  // Section 2 Revolver Index: Khởi tạo 2 (HVL ở chính giữa thanh 5 điểm)
  const [revolverIndex, setRevolverIndex] = useState<number>(2);

  const isScrollingRef = useRef<boolean>(false);
  const touchStartYRef = useRef<number>(0);
  const touchStartXRef = useRef<number>(0);
  const hasTouchMovedRef = useRef<boolean>(false);

  // Top 5 display tracks
  const displayTracks = topFavoriteTracks && topFavoriteTracks.length > 0
    ? topFavoriteTracks
    : queue.slice(0, 5);

  // 5 Vault Slots arranged symmetrically: Slot 4 (0), Slot 5 (1), Slot 1 HVL (2 - Center), Slot 2 (3), Slot 3 (4)
  const activeSlots: VaultSlot[] = vaultSlots && vaultSlots.length >= 5
    ? [
        vaultSlots.find((s) => s.slot_number === 4) || vaultSlots[3],
        vaultSlots.find((s) => s.slot_number === 5) || vaultSlots[4],
        vaultSlots.find((s) => s.slot_number === 1) || vaultSlots[0],
        vaultSlots.find((s) => s.slot_number === 2) || vaultSlots[1],
        vaultSlots.find((s) => s.slot_number === 3) || vaultSlots[2]
      ]
    : [
        { id: "slot-4", slot_number: 4, title: "VAULT SLOT 04", artist: "Lossless Ready", cover_url: "", status: "locked" },
        { id: "slot-5", slot_number: 5, title: "VAULT SLOT 05", artist: "Lossless Ready", cover_url: "", status: "locked" },
        { id: "slot-1", slot_number: 1, title: "HVL (99%)", artist: "MCK • 30 Tracks", cover_url: HVL_COVER, status: "live" },
        { id: "slot-2", slot_number: 2, title: "VAULT SLOT 02", artist: "Lossless Ready", cover_url: "", status: "coming_soon" },
        { id: "slot-3", slot_number: 3, title: "VAULT SLOT 03", artist: "Lossless Ready", cover_url: "", status: "locked" }
      ];

  const currentSection = activeSections[activeSectionIndex] || activeSections[0];

  const handleAlbumClick = (slot?: VaultSlot) => {
    if (isTransitioning || isCenteringForVault) return;
    if (hasTouchMovedRef.current) return;

    if (slot && slot.status !== "live") return;

    if (currentSection.template_type === "album_showcase" && sec1Stage === "revealed") {
      setIsCenteringForVault(true);
      setSec1Stage("center");

      setTimeout(() => {
        if (onOpen3D) onOpen3D();
        setIsCenteringForVault(false);
      }, 700);
    } else if (currentSection.template_type === "album_showcase" && sec1Stage === "center") {
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

    if (currentSection.template_type === "album_showcase" && sec1Stage === "center") {
      setIsTransitioning(true);
      setSec1Stage("revealed");
      setTimeout(() => setIsTransitioning(false), 550);
      return;
    }

    if (activeSectionIndex < activeSections.length - 1) {
      setIsTransitioning(true);
      setSec1Stage("center");
      setActiveSectionIndex((prev) => prev + 1);
      setTimeout(() => setIsTransitioning(false), 600);
    }
  };

  const handleScrollUp = () => {
    if (isTransitioning || isCenteringForVault) return;

    if (activeSectionIndex > 0) {
      setIsTransitioning(true);
      const prevIdx = activeSectionIndex - 1;
      setActiveSectionIndex(prevIdx);
      if (activeSections[prevIdx]?.template_type === "album_showcase") {
        setSec1Stage("revealed");
      } else {
        setSec1Stage("center");
      }
      setTimeout(() => setIsTransitioning(false), 600);
      return;
    }

    if (currentSection.template_type === "album_showcase" && sec1Stage === "revealed") {
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
      if (currentSection.template_type === "cover_flow") {
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
  }, [activeSectionIndex, sec1Stage, isTransitioning, isCenteringForVault, activeSlots.length, currentSection.template_type]);

  // Parse config for active section
  let secConfig: any = {};
  try {
    if (typeof currentSection.config === "string") {
      secConfig = JSON.parse(currentSection.config);
    } else if (currentSection.config) {
      secConfig = currentSection.config;
    }
  } catch (e) {
    secConfig = {};
  }

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
          UNIFIED DYNAMIC STAGE CONTAINER: TỰ CÂN BẰNG ĐỐI XỨNG & ZERO OVERFLOW
      ────────────────────────────────────────────────────────────────────── */}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "880px",
          height: "380px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <AnimatePresence mode="wait">
          {/* ── 1. TEMPLATE: ALBUM SHOWCASE ── */}
          {currentSection.template_type === "album_showcase" && (
            <motion.div
              key={`template-showcase-${currentSection.id}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ position: "relative", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              {/* Sleeve Card: Shifts left when revealed */}
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
                  coverUrl={secConfig.cover_url || HVL_COVER}
                  title={secConfig.title || "HVL (99%)"}
                  size={280}
                  isActive={true}
                />
              </motion.div>

              {/* Minimal 5-Track Slide-Out Overlay */}
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
            </motion.div>
          )}

          {/* ── 2. TEMPLATE: 3D COVER FLOW (LOCKED HVL TO CENTER DOT #3) ── */}
          {currentSection.template_type === "cover_flow" && (
            <motion.div
              key={`template-coverflow-${currentSection.id}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ position: "relative", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <MetallicSheenGlow isVisible={true} />

              <SleeveCarouselRevolver
                isVisible={true}
                slots={activeSlots}
                revolverIndex={revolverIndex}
                onSelectSlot={(offset) => {
                  if (!hasTouchMovedRef.current) {
                    setRevolverIndex((prev) => (prev + offset + activeSlots.length) % activeSlots.length);
                  }
                }}
                onOpenVault={(slot) => handleAlbumClick(slot)}
              />

              {/* 5-Point Magnetic Marble Capsule: Dot 2 is strictly Slot 1 (HVL) */}
              <MagneticMarbleIndicator
                isVisible={true}
                totalSlots={5}
                activeIndex={revolverIndex}
                onSelectIndex={(idx) => setRevolverIndex(idx)}
              />
            </motion.div>
          )}

          {/* ── 3. TEMPLATE: HERO MUSIC BANNER ── */}
          {currentSection.template_type === "hero_banner" && (
            <HeroMusicBanner
              key={`template-hero-${currentSection.id}`}
              headline={secConfig.headline || currentSection.title}
              subheadline={secConfig.subheadline || currentSection.subtitle}
              bannerUrl={secConfig.banner_url || HVL_COVER}
              trackId={secConfig.track_id || "mck-02"}
              ctaText={secConfig.cta_text || "Nghe Ngay"}
              badgeText={secConfig.badge_text || "BẢN PHÁT HÀNH MỚI"}
              onOpen3D={onOpen3D}
            />
          )}

          {/* ── 4. TEMPLATE: ARTIST SPOTLIGHT ── */}
          {currentSection.template_type === "artist_spotlight" && (
            <ArtistSpotlightCard
              key={`template-artist-${currentSection.id}`}
              artistName={secConfig.artist_name || "MCK"}
              avatarUrl={secConfig.avatar_url || HVL_COVER}
              genre={secConfig.genre || "Melodic Rap / R&B"}
              bio={secConfig.bio || "Nghệ sĩ tiên phong định hình làn sóng Melodic Rap thế hệ mới tại Việt Nam với chất âm phòng thu Lossless độc bản."}
              featuredTrackTitle={secConfig.featured_track_title || "01. Elegie"}
              featuredTrackId={secConfig.featured_track_id || "mck-01"}
              spotifyUrl={secConfig.spotify_url || "https://open.spotify.com"}
              youtubeUrl={secConfig.youtube_url || "https://youtube.com"}
              onOpen3D={onOpen3D}
            />
          )}

          {/* ── 5. TEMPLATE: VIDEO PREMIERE ── */}
          {currentSection.template_type === "video_premiere" && (
            <VideoPremierePlayer
              key={`template-video-${currentSection.id}`}
              title={secConfig.title || currentSection.title}
              videoUrl={secConfig.video_url || "https://media.postlain.com/videos/02.%20IDK%20-%20MCK%20(Official%20Music%20Video).mkv"}
              posterUrl={secConfig.poster_url || HVL_COVER}
              qualityBadge={secConfig.quality_badge || "4K MASTER"}
            />
          )}

          {/* ── 6. TEMPLATE: EDITORIAL PRESS ── */}
          {currentSection.template_type === "editorial_press" && (
            <EditorialPressCard
              key={`template-press-${currentSection.id}`}
              quote={secConfig.quote || "HVL (99%) là đỉnh cao âm thanh phòng thu Lossless thuần khiết, định nghĩa lại toàn bộ chuẩn mực Melodic Rap Việt Nam."}
              source={secConfig.source || "ROLLING STONE ASIA"}
              author={secConfig.author || "Trưởng ban Biên tập Âm nhạc"}
              coverUrl={secConfig.cover_url || HVL_COVER}
            />
          )}

          {/* ── 7. TEMPLATE: EXPLORE UNIVERSE ── */}
          {currentSection.template_type === "explore_universe" && (
            <MinimalExploreTrigger
              key={`template-explore-${currentSection.id}`}
              isVisible={true}
              onEnter3D={() => handleAlbumClick(activeSlots[2])}
              onBackToShowcase={() => {
                setActiveSectionIndex(0);
                setSec1Stage("center");
              }}
            />
          )}
        </AnimatePresence>
      </div>

      {/* ── SUBTLE VERTICAL SECTION PAGINATION INDICATOR (RIGHT EDGE) ── */}
      {activeSections.length > 1 && (
        <div
          style={{
            position: "fixed",
            right: "24px",
            top: "50%",
            transform: "translateY(-50%)",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            zIndex: 30
          }}
        >
          {activeSections.map((sec, idx) => (
            <button
              key={sec.id || idx}
              onClick={() => {
                setActiveSectionIndex(idx);
                setSec1Stage("center");
              }}
              style={{
                width: activeSectionIndex === idx ? "20px" : "6px",
                height: "6px",
                borderRadius: "999px",
                background: activeSectionIndex === idx ? "#ffffff" : "rgba(255, 255, 255, 0.25)",
                boxShadow: activeSectionIndex === idx ? "0 0 10px rgba(255, 255, 255, 0.8)" : "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
                transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
              }}
              title={sec.title}
            />
          ))}
        </div>
      )}
    </main>
  );
};

export default HomePage;
