import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ArrowRight, Disc3, Sparkles } from "lucide-react";
import { useAudioStore, DEFAULT_TRACKS, Track } from "../store/audioStore";

const BEST_PLAY_TRACKS = [
  DEFAULT_TRACKS[0],  // 01. Elegie
  DEFAULT_TRACKS[1],  // 02. IDK
  DEFAULT_TRACKS[4],  // 05. Baby (feat. marzuz)
  DEFAULT_TRACKS[6],  // 07. Mắt Môi Tay Chân (feat. Tage)
  DEFAULT_TRACKS[19], // 20. Xa Xôi (feat. Obito)
];

const formatDuration = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
};

interface MobileHomePageProps {
  onExploreClick?: () => void;
}

export const MobileHomePage: React.FC<MobileHomePageProps> = ({ onExploreClick }) => {
  const { currentTrack, playTrack, favoritedTrackIds, toggleFavoriteTrack } = useAudioStore();
  const [activeSection, setActiveSection] = useState<number>(0);
  const [selectedAlbumModal, setSelectedAlbumModal] = useState<string | null>(null);
  const [carouselIndex, setCarouselIndex] = useState<number>(0);

  // Burst animation state: 'bursting' (0s-0.7s at center) ➔ 'settled' (slid up to top + tracks unfolded)
  const [hasBurstPlayed, setHasBurstPlayed] = useState<boolean>(false);
  const [burstStage, setBurstStage] = useState<"bursting" | "settled">("bursting");

  const touchStartY = useRef<number>(0);
  const isSwiping = useRef<boolean>(false);

  // Trigger burst sequence on initial mount
  useEffect(() => {
    if (!hasBurstPlayed) {
      setBurstStage("bursting");
      const timer = setTimeout(() => {
        setBurstStage("settled");
        setHasBurstPlayed(true);
      }, 750);
      return () => clearTimeout(timer);
    } else {
      setBurstStage("settled");
    }
  }, [hasBurstPlayed]);

  // Vertical Touch Swipe Gesture Handling (100dvh Snapping)
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (isSwiping.current) return;
      const deltaY = touchStartY.current - e.changedTouches[0].clientY;

      if (deltaY > 38) {
        // Swipe up ➔ Next section
        isSwiping.current = true;
        setActiveSection((prev) => Math.min(prev + 1, 2));
        setTimeout(() => {
          isSwiping.current = false;
        }, 500);
      } else if (deltaY < -38) {
        // Swipe down ➔ Prev section
        isSwiping.current = true;
        setActiveSection((prev) => Math.max(prev - 1, 0));
        setTimeout(() => {
          isSwiping.current = false;
        }, 500);
      }
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  const handleTrackSelect = (track: Track) => {
    playTrack(track);
  };

  return (
    <main
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100dvh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "#ffffff",
        zIndex: 1,
        paddingTop: "max(62px, env(safe-area-inset-top, 62px))",
        paddingBottom: "max(72px, env(safe-area-inset-bottom, 72px))",
        paddingLeft: "16px",
        paddingRight: "16px"
      }}
    >
      <AnimatePresence mode="wait">
        {/* ─────────────────────────────────────────────────────────────────────
            SECTION 1: RADIANT BURST ➔ SLIDE UP ➔ CASCADING TOP TRACKS
        ────────────────────────────────────────────────────────────────────── */}
        {activeSection === 0 && (
          <motion.div
            key="mobile-section-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{
              opacity: 0,
              y: -20,
              filter: "blur(6px)",
              transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] }
            }}
            transition={{ duration: 0.5 }}
            style={{
              width: "100%",
              maxWidth: "430px",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: burstStage === "bursting" ? "center" : "space-between",
              alignItems: "center",
              gap: "12px",
              padding: "4px 0",
              position: "relative"
            }}
          >
            {/* GIAI ĐOẠN 1: BỪNG SÁNG TẠI TRUNG TÂM MÀN HÌNH (~0.7s) */}
            {burstStage === "bursting" && (
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "18px",
                  position: "relative"
                }}
              >
                {/* 360 Aurora Burst Halo Glowing Ring */}
                <div
                  className="aurora-burst-halo"
                  style={{
                    position: "absolute",
                    inset: "-16px",
                    borderRadius: "38px",
                    pointerEvents: "none",
                    zIndex: 0
                  }}
                />

                <motion.div
                  layoutId="album-cover-hero"
                  style={{
                    width: "min(68vw, 250px)",
                    height: "min(68vw, 250px)",
                    borderRadius: "32px",
                    overflow: "hidden",
                    boxShadow: "0 25px 70px rgba(0, 0, 0, 0.95), 0 0 40px rgba(255, 255, 255, 0.4)",
                    border: "2px solid rgba(255, 255, 255, 0.4)",
                    position: "relative",
                    zIndex: 1,
                    background: "#18181b"
                  }}
                >
                  <img
                    src="https://media.postlain.com/covers/HVL_Album_Cover.jpg"
                    alt="HVL (99%) Top Album"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "6px 14px",
                    borderRadius: "999px",
                    background: "rgba(255, 255, 255, 0.12)",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                    backdropFilter: "blur(12px)",
                    boxShadow: "0 4px 16px rgba(255, 255, 255, 0.2)"
                  }}
                >
                  <Sparkles size={14} color="#ffffff" />
                  <span style={{ fontSize: "0.82rem", fontWeight: 800, letterSpacing: "0.08em", color: "#ffffff" }}>
                    TOP ALBUM • HVL (99%)
                  </span>
                </motion.div>
              </motion.div>
            )}

            {/* GIAI ĐOẠN 2: TRƯỢT LÊN ĐỈNH VÀ SỔ 5 TRACKS XUỐNG DƯỚI */}
            {burstStage === "settled" && (
              <>
                {/* Top: Album Art Header Card */}
                <motion.div
                  layoutId="album-cover-hero-container"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    background: "linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    borderRadius: "22px",
                    padding: "12px",
                    boxShadow: "0 12px 30px rgba(0, 0, 0, 0.8)"
                  }}
                  onClick={() => setSelectedAlbumModal("HVL (99%)")}
                >
                  <motion.div
                    layoutId="album-cover-hero"
                    style={{
                      width: "74px",
                      height: "74px",
                      borderRadius: "16px",
                      overflow: "hidden",
                      flexShrink: 0,
                      boxShadow: "0 8px 20px rgba(0, 0, 0, 0.7)",
                      border: "1px solid rgba(255, 255, 255, 0.25)"
                    }}
                  >
                    <img
                      src="https://media.postlain.com/covers/HVL_Album_Cover.jpg"
                      alt="HVL (99%)"
                      loading="eager"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </motion.div>

                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
                      <span
                        style={{
                          fontSize: "0.68rem",
                          fontWeight: 700,
                          padding: "2px 6px",
                          borderRadius: "999px",
                          background: "#ffffff",
                          color: "#000000"
                        }}
                      >
                        TOP ALBUM
                      </span>
                      <span style={{ fontSize: "0.72rem", color: "rgba(255, 255, 255, 0.55)" }}>2023 • 30 Tracks</span>
                    </div>
                    <h3
                      style={{
                        fontSize: "1.1rem",
                        fontWeight: 800,
                        color: "#ffffff",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis"
                      }}
                    >
                      HVL (99%)
                    </h3>
                    <p style={{ fontSize: "0.82rem", color: "rgba(255, 255, 255, 0.65)" }}>MCK</p>
                  </div>

                  <div style={{ padding: "6px", color: "rgba(255, 255, 255, 0.5)" }}>
                    <Sparkles size={18} />
                  </div>
                </motion.div>

                {/* Bottom: Cascading 5 Best-Play Tracks */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -20, transition: { duration: 0.18 } }}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    flex: 1,
                    width: "100%",
                    justifyContent: "center"
                  }}
                >
                  {BEST_PLAY_TRACKS.map((track, idx) => {
                    const isFav = favoritedTrackIds.includes(track.id);
                    const isCurrent = currentTrack?.id === track.id;

                    return (
                      <motion.div
                        key={track.id}
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.45,
                          delay: 0.07 * idx + 0.1,
                          ease: [0.16, 1, 0.3, 1]
                        }}
                        onClick={() => handleTrackSelect(track)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "10px 14px",
                          borderRadius: "16px",
                          background: isCurrent
                            ? "rgba(255, 255, 255, 0.12)"
                            : "rgba(255, 255, 255, 0.04)",
                          border: isCurrent
                            ? "1px solid rgba(255, 255, 255, 0.3)"
                            : "1px solid rgba(255, 255, 255, 0.07)",
                          boxShadow: isCurrent ? "0 4px 16px rgba(255, 255, 255, 0.15)" : "none",
                          cursor: "pointer",
                          transition: "all 0.2s ease"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0, flex: 1 }}>
                          <span
                            style={{
                              fontSize: "0.8rem",
                              fontWeight: 700,
                              color: isCurrent ? "#ffffff" : "rgba(255, 255, 255, 0.4)",
                              width: "18px",
                              textAlign: "center"
                            }}
                          >
                            {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                          </span>

                          <div style={{ minWidth: 0, flex: 1 }}>
                            <p
                              style={{
                                fontSize: "0.88rem",
                                fontWeight: isCurrent ? 700 : 600,
                                color: "#ffffff",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis"
                              }}
                            >
                              {track.title}
                            </p>
                            <p
                              style={{
                                fontSize: "0.72rem",
                                color: "rgba(255, 255, 255, 0.5)",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis"
                              }}
                            >
                              {track.artist}
                            </p>
                          </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
                          <span style={{ fontSize: "0.75rem", color: "rgba(255, 255, 255, 0.4)" }}>
                            {formatDuration(track.duration)}
                          </span>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavoriteTrack(track.id);
                            }}
                            style={{
                              background: "transparent",
                              border: "none",
                              cursor: "pointer",
                              padding: "6px",
                              display: "flex",
                              alignItems: "center"
                            }}
                          >
                            <Heart
                              size={15}
                              color={isFav ? "#ffffff" : "rgba(255, 255, 255, 0.35)"}
                              fill={isFav ? "#ffffff" : "none"}
                            />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>

                {/* Swipe hint */}
                <div style={{ textAlign: "center", opacity: 0.35, fontSize: "0.7rem", letterSpacing: "0.08em" }}>
                  VUỐT LÊN ĐỂ TIẾP TỤC
                </div>
              </>
            )}
          </motion.div>
        )}

        {/* ─────────────────────────────────────────────────────────────────────
            SECTION 2: SEAMLESS MORPHED 3D COVER FLOW & ELASTIC DRAG
        ────────────────────────────────────────────────────────────────────── */}
        {activeSection === 1 && (
          <motion.div
            key="mobile-section-2"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{
              opacity: 0,
              scale: 1.1,
              y: -35,
              filter: "blur(8px)",
              transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] }
            }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            style={{
              width: "100%",
              maxWidth: "380px",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "24px"
            }}
          >
            {/* Morphing Album Card with shared layoutId */}
            <motion.div
              layoutId="album-cover-hero"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.45}
              onDragEnd={(_, info) => {
                if (info.offset.x < -35) {
                  setCarouselIndex(1);
                } else if (info.offset.x > 35) {
                  setCarouselIndex(0);
                }
              }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelectedAlbumModal("HVL (99%)")}
              style={{
                width: "min(76vw, 290px)",
                height: "min(76vw, 290px)",
                borderRadius: "28px",
                overflow: "hidden",
                boxShadow: "0 24px 60px rgba(0, 0, 0, 0.95), 0 0 1px 2px rgba(255, 255, 255, 0.25)",
                background: "#18181b",
                position: "relative",
                cursor: "grab"
              }}
            >
              <img
                src="https://media.postlain.com/covers/HVL_Album_Cover.jpg"
                alt="HVL (99%)"
                loading="eager"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  pointerEvents: "none"
                }}
              />

              <div
                style={{
                  position: "absolute",
                  bottom: "14px",
                  left: "14px",
                  right: "14px",
                  padding: "8px 12px",
                  borderRadius: "14px",
                  background: "rgba(0, 0, 0, 0.7)",
                  backdropFilter: "blur(12px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between"
                }}
              >
                <div>
                  <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "#ffffff" }}>HVL (99%)</h4>
                  <p style={{ fontSize: "0.7rem", color: "rgba(255, 255, 255, 0.6)" }}>MCK • 30 Bài hát</p>
                </div>
                <Disc3 size={20} color="#ffffff" />
              </div>
            </motion.div>

            {/* Pagination Indicator */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <motion.div
                onClick={() => setCarouselIndex(0)}
                animate={{
                  width: carouselIndex === 0 ? "24px" : "8px",
                  background: carouselIndex === 0 ? "#ffffff" : "rgba(255, 255, 255, 0.25)"
                }}
                transition={{ duration: 0.3 }}
                style={{ height: "8px", borderRadius: "999px", cursor: "pointer" }}
              />
              <motion.div
                onClick={() => setCarouselIndex(1)}
                animate={{
                  width: carouselIndex === 1 ? "24px" : "8px",
                  background: carouselIndex === 1 ? "#ffffff" : "rgba(255, 255, 255, 0.25)"
                }}
                transition={{ duration: 0.3 }}
                style={{ height: "8px", borderRadius: "999px", cursor: "pointer" }}
              />
            </div>
          </motion.div>
        )}

        {/* ─────────────────────────────────────────────────────────────────────
            SECTION 3: LUXURY EXPLORE CALL-TO-ACTION
        ────────────────────────────────────────────────────────────────────── */}
        {activeSection === 2 && (
          <motion.div
            key="mobile-section-3"
            initial={{ opacity: 0, scale: 0.85, filter: "blur(8px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.85, filter: "blur(8px)", transition: { duration: 0.35 } }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            style={{
              width: "100%",
              maxWidth: "360px",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "20px",
              textAlign: "center"
            }}
          >
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={onExploreClick}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "12px",
                width: "100%",
                maxWidth: "320px",
                padding: "18px 24px",
                fontSize: "0.95rem",
                fontWeight: 800,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                borderRadius: "999px",
                background: "#ffffff",
                color: "#000000",
                border: "none",
                boxShadow: "0 8px 30px rgba(255, 255, 255, 0.4)",
                cursor: "pointer"
              }}
            >
              <span>CHUYỂN QUA EXPLORE</span>
              <ArrowRight size={18} />
            </motion.button>

            <p style={{ fontSize: "0.78rem", color: "rgba(255, 255, 255, 0.5)", lineHeight: 1.5 }}>
              Khám phá không gian âm thanh lossless mở rộng
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─────────────────────────────────────────────────────────────────────────
          MOBILE 3D TRANSITION MODAL
      ────────────────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedAlbumModal && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 300,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(0, 0, 0, 0.88)",
              backdropFilter: "blur(20px)",
              padding: "20px"
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              style={{
                width: "100%",
                maxWidth: "360px",
                padding: "28px 24px",
                borderRadius: "28px",
                textAlign: "center",
                background: "rgba(24, 24, 27, 0.95)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                boxShadow: "0 20px 50px rgba(0, 0, 0, 0.9)"
              }}
            >
              <h3 style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: "10px" }}>
                {selectedAlbumModal}
              </h3>

              <p style={{ fontSize: "0.85rem", color: "rgba(255, 255, 255, 0.6)", lineHeight: 1.6, marginBottom: "24px" }}>
                Không gian 3D đang được kết nối. Âm nhạc sẽ được giải mã lossless khi bạn bước vào không gian trải nghiệm.
              </p>

              <button
                onClick={() => setSelectedAlbumModal(null)}
                style={{
                  width: "100%",
                  padding: "14px",
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  borderRadius: "14px",
                  background: "#ffffff",
                  color: "#000000",
                  border: "none",
                  cursor: "pointer"
                }}
              >
                Đã hiểu
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
};
