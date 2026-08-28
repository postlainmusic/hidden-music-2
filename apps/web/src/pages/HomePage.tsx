import React, { useState } from "react";
import { useAudioStore } from "../store/audioStore";
import { TrackCard } from "../components/TrackCard";
import { Play, Pause, Sparkles, Flame, Cloud, Server, Zap } from "lucide-react";
import { motion } from "framer-motion";

export const HomePage: React.FC = () => {
  const { queue, currentTrack, isPlaying, playTrack, togglePlay } = useAudioStore();
  const [selectedGenre, setSelectedGenre] = useState<string>("Tất cả");

  const genres = ["Tất cả", "Ambient Synthwave", "Lo-Fi Cinematic", "Future Bass", "Chillout Electronic"];

  const filteredTracks = selectedGenre === "Tất cả"
    ? queue
    : queue.filter((t) => t.genre === selectedGenre);

  const featuredTrack = currentTrack || queue[0];

  return (
    <main
      style={{
        maxWidth: "1280px",
        margin: "0 auto",
        padding: "24px 16px 140px 16px",
        display: "flex",
        flexDirection: "column",
        gap: "40px"
      }}
    >
      {/* 🌟 Apple Glass Hero Spotlight Banner */}
      {featuredTrack && (
        <motion.section
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="glass-panel"
          style={{
            padding: "40px",
            display: "grid",
            gridTemplateColumns: "1fr 340px",
            gap: "36px",
            alignItems: "center",
            overflow: "hidden",
            position: "relative"
          }}
        >
          {/* Dynamic Background Reflection */}
          <div
            style={{
              position: "absolute",
              top: "-50%",
              right: "-10%",
              width: "450px",
              height: "450px",
              borderRadius: "50%",
              background: `radial-gradient(circle, ${featuredTrack.palette.primary} 0%, transparent 70%)`,
              filter: "blur(70px)",
              opacity: 0.45,
              pointerEvents: "none"
            }}
          />

          {/* Left Hero Details */}
          <div style={{ position: "relative", zIndex: 2 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <span
                className="glass-pill"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  padding: "4px 10px",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: "var(--accent-secondary)"
                }}
              >
                <Flame size={13} />
                <span>NỔI BẬT HÔM NAY</span>
              </span>

              <span
                className="glass-pill"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "4px 10px",
                  fontSize: "0.75rem",
                  color: "var(--text-secondary)"
                }}
              >
                <Sparkles size={12} color="var(--accent-primary)" />
                <span>Spatial Audio 24-bit</span>
              </span>
            </div>

            <h1
              style={{
                fontSize: "2.8rem",
                fontWeight: 800,
                lineHeight: 1.1,
                marginBottom: "12px",
                background: "linear-gradient(135deg, #ffffff 40%, rgba(255,255,255,0.7) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}
            >
              {featuredTrack.title}
            </h1>

            <p style={{ fontSize: "1.15rem", color: "var(--text-secondary)", marginBottom: "24px" }}>
              {featuredTrack.artist} • <span style={{ color: "var(--text-muted)" }}>{featuredTrack.album}</span>
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  if (featuredTrack.id === currentTrack?.id) {
                    togglePlay();
                  } else {
                    playTrack(featuredTrack);
                  }
                }}
                className="apple-btn-primary"
                style={{ padding: "14px 28px", fontSize: "1rem" }}
              >
                {featuredTrack.id === currentTrack?.id && isPlaying ? (
                  <Pause size={18} fill="#ffffff" />
                ) : (
                  <Play size={18} fill="#ffffff" />
                )}
                <span>{featuredTrack.id === currentTrack?.id && isPlaying ? "Tạm dừng phát" : "Nghe ngay"}</span>
              </motion.button>

              <button className="apple-btn-secondary" style={{ padding: "14px 24px", fontSize: "0.95rem" }}>
                <span>Thêm vào thư viện</span>
              </button>
            </div>
          </div>

          {/* Right Hero Cinematic Artwork */}
          <div style={{ position: "relative", zIndex: 2, display: "flex", justifyContent: "center" }}>
            <motion.div
              whileHover={{ scale: 1.03, rotate: 1 }}
              transition={{ duration: 0.4 }}
              style={{
                width: "100%",
                maxWidth: "320px",
                aspectRatio: "1/1",
                borderRadius: "24px",
                overflow: "hidden",
                boxShadow: "0 20px 50px rgba(0,0,0,0.6), 0 0 35px var(--glow-color)",
                border: "1px solid rgba(255,255,255,0.2)",
                position: "relative"
              }}
            >
              <img
                src={featuredTrack.coverUrl}
                alt={featuredTrack.title}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.6) 100%)"
                }}
              />
            </motion.div>
          </div>
        </motion.section>
      )}

      {/* 🏷️ Genre Filter Tabs */}
      <section style={{ display: "flex", alignItems: "center", gap: "10px", overflowX: "auto", paddingBottom: "6px" }}>
        {genres.map((g) => {
          const isSelected = selectedGenre === g;
          return (
            <button
              key={g}
              onClick={() => setSelectedGenre(g)}
              className="glass-pill"
              style={{
                padding: "8px 18px",
                fontSize: "0.88rem",
                fontWeight: isSelected ? 700 : 500,
                color: isSelected ? "#ffffff" : "var(--text-secondary)",
                background: isSelected ? "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))" : "rgba(255, 255, 255, 0.05)",
                borderColor: isSelected ? "rgba(255,255,255,0.3)" : "var(--glass-border)",
                boxShadow: isSelected ? "0 4px 16px var(--glow-color)" : "none",
                cursor: "pointer",
                whiteSpace: "nowrap"
              }}
            >
              {g}
            </button>
          );
        })}
      </section>

      {/* 🎵 Trending Releases Grid */}
      <section>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <div>
            <h2 style={{ fontSize: "1.6rem", fontWeight: 800 }}>Tuyển tập phát hành mới</h2>
            <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", marginTop: "2px" }}>
              Âm thanh lossless tinh tế hòa quyện hiệu ứng Liquid Mesh Gradient
            </p>
          </div>
          <span style={{ fontSize: "0.85rem", color: "var(--accent-primary)", fontWeight: 600, cursor: "pointer" }}>
            Xem tất cả ({filteredTracks.length})
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
            gap: "20px"
          }}
        >
          {filteredTracks.map((track, i) => (
            <TrackCard key={track.id} track={track} index={i} />
          ))}
        </div>
      </section>

      {/* ⚡ Cloudflare Ecosystem & Edge Architecture Feature Card */}
      <section
        className="glass-panel"
        style={{
          padding: "32px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "24px"
        }}
      >
        <div style={{ display: "flex", gap: "14px" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              background: "rgba(6, 182, 212, 0.15)",
              border: "1px solid rgba(6, 182, 212, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}
          >
            <Cloud size={22} color="#06b6d4" />
          </div>
          <div>
            <h4 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "4px" }}>Cloudflare Pages & R2</h4>
            <p style={{ fontSize: "0.84rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
              Phân phối giao diện Frontend tĩnh và streaming audio chất lượng cao tức thì qua 300+ Edge locations toàn cầu.
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "14px" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              background: "rgba(236, 72, 153, 0.15)",
              border: "1px solid rgba(236, 72, 153, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}
          >
            <Server size={22} color="#ec4899" />
          </div>
          <div>
            <h4 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "4px" }}>Hono Workers & D1 DB</h4>
            <p style={{ fontSize: "0.84rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
              Cơ sở dữ liệu SQLite Serverless phản hồi dưới 10ms, lưu trữ playlist và phiên đăng nhập an toàn.
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "14px" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              background: "rgba(99, 102, 241, 0.15)",
              border: "1px solid rgba(99, 102, 241, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}
          >
            <Zap size={22} color="#6366f1" />
          </div>
          <div>
            <h4 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "4px" }}>Gemini Spark MCP Ready</h4>
            <p style={{ fontSize: "0.84rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
              Tích hợp sẵn endpoint `/mcp` theo chuẩn Model Context Protocol kết nối liền mạch với Google Gemini Spark.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};
