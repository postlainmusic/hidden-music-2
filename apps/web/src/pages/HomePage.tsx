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
import { AdminLiveInspectorHUD } from "../components/home/AdminLiveInspectorHUD";
import { Sliders, Sparkles } from "lucide-react";

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
    queue,
    albums,
    currentUser
  } = useAudioStore();

  // Live In-Place Admin HUD State
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [activeEditingSection, setActiveEditingSection] = useState<DynamicSection | null>(null);

  // Active enabled sections from D1 store, fallback to default 3 core sections
  const activeSections: DynamicSection[] = sections && sections.filter((s) => Boolean(s.is_active ?? s.is_enabled)).length > 0
    ? sections.filter((s) => Boolean(s.is_active ?? s.is_enabled))
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

  // Resolve custom tracks for Showcase
  const customTrackIds = [
    secConfig.slot_track_1,
    secConfig.slot_track_2,
    secConfig.slot_track_3,
    secConfig.slot_track_4,
    secConfig.slot_track_5
  ].filter(Boolean);

  let showcaseTracks = displayTracks;
  if (customTrackIds.length > 0) {
    const resolved = customTrackIds.map((id: string) => queue.find((t) => t.id === id)).filter(Boolean) as Track[];
    if (resolved.length > 0) {
      showcaseTracks = resolved;
    }
  }

  const currentAlbumObj = albums.find((a) => a.id === secConfig.album_id);
  const albumCover = secConfig.cover_url || currentAlbumObj?.cover_url || HVL_COVER;
  const albumTitle = secConfig.title || currentAlbumObj?.title || "HVL (99%)";

  // Dynamic 5 Slots for 3D Cover Flow parsed directly from secConfig (or fallback to vaultSlots)
  const getDynamicSlot = (num: number): VaultSlot => {
    const key = `slot_${num}`;
    const albumId = secConfig[`${key}_album_id`];
    const matchedAlbum = albums.find((a) => a.id === albumId);
    const isCenter = num === 1;
    const fallbackVaultSlot = vaultSlots.find((s) => s.slot_number === num);

    return {
      id: `slot-${num}`,
      slot_number: num,
      album_id: albumId || fallbackVaultSlot?.album_id || (isCenter ? "hvl-99" : null),
      title: secConfig[`${key}_title`] || matchedAlbum?.title || fallbackVaultSlot?.title || (isCenter ? "HVL (99%)" : `VAULT SLOT 0${num}`),
      artist: secConfig[`${key}_artist`] || matchedAlbum?.artist || fallbackVaultSlot?.artist || (isCenter ? "MCK" : "Lossless Ready"),
      cover_url: secConfig[`${key}_cover`] || matchedAlbum?.cover_url || fallbackVaultSlot?.cover_url || (isCenter ? HVL_COVER : ""),
      badge: secConfig[`${key}_badge`] || fallbackVaultSlot?.badge || (isCenter ? "Master Lossless" : "Locked"),
      status: (secConfig[`${key}_status`] || fallbackVaultSlot?.status || (isCenter ? "live" : "locked")) as any
    };
  };

  const dynamicCoverFlowSlots: VaultSlot[] = [
    getDynamicSlot(4),
    getDynamicSlot(5),
    getDynamicSlot(1),
    getDynamicSlot(2),
    getDynamicSlot(3)
  ];

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
      {/* ── LIVE ADMIN QUICK INSPECTOR HUD (ONLY VISIBLE TO ADMIN) ── */}
      <AdminLiveInspectorHUD
        isEditMode={isEditMode}
        setIsEditMode={setIsEditMode}
        activeEditingSection={activeEditingSection}
        setActiveEditingSection={setActiveEditingSection}
      />

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
          justifyContent: "center",
          border: isEditMode ? "1px dashed rgba(99, 102, 241, 0.4)" : "none",
          borderRadius: "20px"
        }}
      >
        {/* Floating In-Place Section Element Edit Trigger */}
        {isEditMode && (
          <motion.button
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={() => setActiveEditingSection(currentSection)}
            style={{
              position: "absolute",
              top: "-42px",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 50,
              padding: "6px 16px",
              borderRadius: "9999px",
              backgroundColor: "#6366f1",
              border: "1px solid rgba(255, 255, 255, 0.4)",
              color: "#ffffff",
              fontSize: "0.78rem",
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              gap: "6px",
              cursor: "pointer",
              boxShadow: "0 4px 20px rgba(99, 102, 241, 0.6)"
            }}
          >
            <Sliders size={13} />
            <span>⚙️ Sửa Element: {currentSection.title}</span>
          </motion.button>
        )}

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
                  coverUrl={albumCover}
                  title={albumTitle}
                  size={280}
                  isActive={true}
                />
              </motion.div>

              {/* Minimal 5-Track Slide-Out Overlay */}
              <MinimalTracklistOverlay
                tracks={showcaseTracks}
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
                slots={dynamicCoverFlowSlots}
                revolverIndex={revolverIndex}
                onSelectSlot={(offset) => {
                  if (!hasTouchMovedRef.current) {
                    setRevolverIndex((prev) => (prev + offset + dynamicCoverFlowSlots.length) % dynamicCoverFlowSlots.length);
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
