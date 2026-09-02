import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Play } from "lucide-react";

interface VideoPremierePlayerProps {
  title?: string;
  videoUrl?: string;
  posterUrl?: string;
  qualityBadge?: string;
}

export const VideoPremierePlayer: React.FC<VideoPremierePlayerProps> = ({
  title = "02. IDK - MCK (Official Music Video)",
  videoUrl = "https://media.postlain.com/videos/02.%20IDK%20-%20MCK%20(Official%20Music%20Video).mkv",
  posterUrl = "/covers/HVL_Album_Cover.webp",
  qualityBadge = "4K MASTER"
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = async () => {
      const isFullscreen =
        document.fullscreenElement === videoRef.current ||
        (document as any).webkitFullscreenElement === videoRef.current;

      try {
        if (isFullscreen) {
          // Khi vào fullscreen, tự động khóa hướng màn hình nằm ngang
          if (screen.orientation && (screen.orientation as any).lock) {
            await (screen.orientation as any).lock("landscape");
          }
        } else {
          // Khi thoát fullscreen, trả lại hướng màn hình tự do
          if (screen.orientation && screen.orientation.unlock) {
            screen.orientation.unlock();
          }
        }
      } catch (err) {
        // Một số trình duyệt chặn lock orientation nếu chưa đủ quyền hoặc không hỗ trợ
        console.warn("Screen orientation lock không khả dụng hoặc bị chặn:", err);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "680px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        zIndex: 5
      }}
    >
      {/* 16:9 Video Canvas Frame */}
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "16 / 9",
          borderRadius: "20px",
          overflow: "hidden",
          backgroundColor: "#050508",
          boxShadow: "0 24px 60px rgba(0, 0, 0, 0.9), 0 0 40px rgba(99, 102, 241, 0.15)",
          border: "1px solid rgba(255, 255, 255, 0.18)"
        }}
      >
        <video
          ref={videoRef}
          src={videoUrl}
          poster={posterUrl}
          controls={isPlaying}
          playsInline
          style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />

        {/* Floating Quality Badge */}
        <div
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            padding: "4px 10px",
            borderRadius: "6px",
            background: "rgba(0, 0, 0, 0.65)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            color: "#ffffff",
            fontSize: "0.68rem",
            fontWeight: 800,
            letterSpacing: "0.08em",
            pointerEvents: "none"
          }}
        >
          {qualityBadge}
        </div>

        {/* Center Play Overlay Trigger when not playing */}
        {!isPlaying && (
          <div
            onClick={togglePlay}
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(0, 0, 0, 0.35)",
              cursor: "pointer"
            }}
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.94 }}
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.85)",
                backdropFilter: "blur(12px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#000000",
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.6)"
              }}
            >
              <Play size={24} fill="#000000" style={{ marginLeft: "4px" }} />
            </motion.div>
          </div>
        )}
      </div>

      {/* Video Title bar */}
      <div
        style={{
          width: "100%",
          padding: "12px 6px 0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: "0.92rem",
            fontWeight: 700,
            color: "#ffffff",
            letterSpacing: "0.02em"
          }}
        >
          {title}
        </p>
      </div>
    </motion.div>
  );
};

export default VideoPremierePlayer;
