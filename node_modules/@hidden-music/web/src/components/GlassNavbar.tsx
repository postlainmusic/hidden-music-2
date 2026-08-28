import React from "react";
import { useAudioStore } from "../store/audioStore";
import { Search, Disc3, Sparkles, User, LogOut, Radio, Compass, Layers } from "lucide-react";
import { motion } from "framer-motion";

export const GlassNavbar: React.FC = () => {
  const { currentUser, setLoginModalOpen, logoutUser } = useAudioStore();

  return (
    <header
      style={{
        position: "sticky",
        top: "16px",
        zIndex: 50,
        margin: "0 auto",
        maxWidth: "1280px",
        padding: "0 16px"
      }}
    >
      <nav
        className="glass-panel"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 20px",
          height: "64px"
        }}
      >
        {/* Brand Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}>
          <motion.div
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 16px var(--glow-color)"
            }}
          >
            <Disc3 size={22} color="#ffffff" />
          </motion.div>
          <div>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "1.1rem",
                letterSpacing: "-0.03em",
                background: "linear-gradient(to right, #ffffff, rgba(255,255,255,0.75))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}
            >
              HIDDEN MUSIC
            </span>
            <span
              style={{
                fontSize: "0.68rem",
                marginLeft: "6px",
                padding: "2px 6px",
                borderRadius: "6px",
                background: "rgba(255,255,255,0.08)",
                color: "var(--accent-primary)",
                fontWeight: 600,
                border: "1px solid rgba(255,255,255,0.12)"
              }}
            >
              STUDIO
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <button
            className="glass-pill"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "7px 16px",
              fontSize: "0.88rem",
              color: "var(--text-primary)",
              border: "none",
              cursor: "pointer",
              background: "rgba(255, 255, 255, 0.12)",
              borderColor: "rgba(255, 255, 255, 0.25)"
            }}
          >
            <Compass size={16} color="var(--accent-primary)" />
            <span>Khám phá</span>
          </button>
          <button
            className="glass-pill"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "7px 16px",
              fontSize: "0.88rem",
              color: "var(--text-secondary)",
              border: "none",
              cursor: "pointer"
            }}
          >
            <Radio size={16} />
            <span>Radio</span>
          </button>
          <button
            className="glass-pill"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "7px 16px",
              fontSize: "0.88rem",
              color: "var(--text-muted)",
              border: "none",
              cursor: "default"
            }}
          >
            <Layers size={16} />
            <span>3D Zone</span>
            <span style={{ fontSize: "0.65rem", padding: "1px 5px", background: "rgba(236, 72, 153, 0.2)", color: "#f472b6", borderRadius: "4px" }}>
              Phase 4
            </span>
          </button>
        </div>

        {/* Right Search & User Profile */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Quick Search */}
          <div
            className="glass-pill"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 14px",
              width: "200px"
            }}
          >
            <Search size={15} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Tìm bài hát, nghệ sĩ..."
              style={{
                background: "transparent",
                border: "none",
                color: "var(--text-primary)",
                fontSize: "0.84rem",
                outline: "none",
                width: "100%"
              }}
            />
          </div>

          {/* User Auth Trigger */}
          {currentUser ? (
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                className="glass-pill"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "4px 12px 4px 4px"
                }}
              >
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  style={{ width: "28px", height: "28px", borderRadius: "50%", objectFit: "cover" }}
                />
                <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>{currentUser.name}</span>
                <Sparkles size={13} color="var(--accent-secondary)" />
              </div>
              <button
                onClick={logoutUser}
                className="glass-pill"
                title="Đăng xuất"
                style={{
                  padding: "8px",
                  color: "var(--text-muted)",
                  border: "none",
                  cursor: "pointer"
                }}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setLoginModalOpen(true)}
              className="apple-btn-primary"
              style={{ padding: "8px 18px", fontSize: "0.88rem" }}
            >
              <User size={16} />
              <span>Đăng nhập</span>
            </motion.button>
          )}
        </div>
      </nav>
    </header>
  );
};
