import React from "react";
import { useAudioStore } from "../store/audioStore";
import { Disc3, LogOut, Compass, Database, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { useIsMobile } from "../hooks/useIsMobile";

interface GlassNavbarProps {
  activeTab?: "vault" | "explore" | "admin";
  onTabChange?: (tab: "vault" | "explore" | "admin") => void;
}

export const GlassNavbar: React.FC<GlassNavbarProps> = ({
  activeTab = "vault",
  onTabChange
}) => {
  const { currentUser, logoutUser } = useAudioStore();
  const isMobile = useIsMobile();
  const isAdmin = currentUser?.email === "postlainmusic@gmail.com" || currentUser?.role === "admin";

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: "transparent",
        padding: isMobile ? "0 14px" : "0 clamp(16px, 4vw, 36px)",
        paddingTop: "max(8px, env(safe-area-inset-top, 8px))",
        height: isMobile ? "60px" : "72px",
        display: "flex",
        alignItems: "center",
        pointerEvents: "auto"
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1600px",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "8px"
        }}
      >
        {/* ── GÓC TRÁI: ICON + TÊN WEB (ẨN CHỮ TRÊN MÀN HÌNH NHỎ ĐỂ KHÔNG BỊ TRÀN) ── */}
        <div
          onClick={() => onTabChange?.("vault")}
          style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", flexShrink: 0 }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 24, ease: "linear" }}
            style={{
              width: isMobile ? "32px" : "36px",
              height: isMobile ? "32px" : "36px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #ffffff 0%, #71717a 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 12px rgba(255, 255, 255, 0.15)",
              flexShrink: 0
            }}
          >
            <Disc3 size={isMobile ? 18 : 20} color="#000000" />
          </motion.div>

          {!isMobile && (
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: "1.05rem",
                letterSpacing: "0.08em",
                color: "#ffffff",
                whiteSpace: "nowrap"
              }}
            >
              HIDDEN MUSIC
            </span>
          )}
        </div>

        {/* ── CHÍNH GIỮA: NÚT CHUYỂN VAULT / KHÁM PHÁ ──────────────────────── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "rgba(255, 255, 255, 0.08)",
            borderRadius: "999px",
            padding: "3px",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            flexShrink: 0
          }}
        >
          <button
            onClick={() => onTabChange?.("vault")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: isMobile ? "4px" : "6px",
              padding: isMobile ? "5px 12px" : "6px 18px",
              borderRadius: "999px",
              fontSize: isMobile ? "0.78rem" : "0.86rem",
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
              transition: "all 0.2s ease",
              background: activeTab === "vault" ? "#ffffff" : "transparent",
              color: activeTab === "vault" ? "#000000" : "rgba(255, 255, 255, 0.6)"
            }}
          >
            <Database size={isMobile ? 12 : 14} />
            <span>Vault</span>
          </button>

          <button
            onClick={() => onTabChange?.("explore")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: isMobile ? "4px" : "6px",
              padding: isMobile ? "5px 12px" : "6px 18px",
              borderRadius: "999px",
              fontSize: isMobile ? "0.78rem" : "0.86rem",
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
              transition: "all 0.2s ease",
              background: activeTab === "explore" ? "#ffffff" : "transparent",
              color: activeTab === "explore" ? "#000000" : "rgba(255, 255, 255, 0.6)"
            }}
          >
            <Compass size={isMobile ? 12 : 14} />
            <span>Khám phá</span>
          </button>

          {isAdmin && (
            <button
              onClick={() => onTabChange?.("admin")}
              title="Vault Monolith Matrix"
              style={{
                display: "flex",
                alignItems: "center",
                gap: isMobile ? "4px" : "6px",
                padding: isMobile ? "5px 12px" : "6px 16px",
                borderRadius: "999px",
                fontSize: isMobile ? "0.78rem" : "0.86rem",
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
                transition: "all 0.2s ease",
                background: activeTab === "admin"
                  ? "linear-gradient(135deg, #6366f1 0%, #ec4899 100%)"
                  : "rgba(99, 102, 241, 0.15)",
                color: "#ffffff",
                boxShadow: activeTab === "admin" ? "0 0 15px rgba(99, 102, 241, 0.5)" : "none"
              }}
            >
              <Shield size={isMobile ? 12 : 14} color={activeTab === "admin" ? "#ffffff" : "#a5b4fc"} />
              <span>Admin</span>
            </button>
          )}
        </div>

        {/* ── GÓC PHẢI: AVATAR PROFILE + LOGOUT ───────────────────────────── */}
        <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "8px" : "12px", flexShrink: 0 }}>
          {currentUser?.avatarUrl ? (
            <img
              src={currentUser.avatarUrl}
              alt="Profile Avatar"
              style={{
                width: isMobile ? "30px" : "34px",
                height: isMobile ? "30px" : "34px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "1px solid rgba(255, 255, 255, 0.25)",
                flexShrink: 0
              }}
            />
          ) : (
            <div
              style={{
                width: isMobile ? "30px" : "34px",
                height: isMobile ? "30px" : "34px",
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                flexShrink: 0
              }}
            >
              <span style={{ fontSize: "0.75rem", fontWeight: 700 }}>
                {currentUser?.email?.charAt(0).toUpperCase() || "U"}
              </span>
            </div>
          )}

          <button
            onClick={logoutUser}
            title="Đăng xuất"
            style={{
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "50%",
              width: isMobile ? "30px" : "34px",
              height: isMobile ? "30px" : "34px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "rgba(255, 255, 255, 0.7)",
              cursor: "pointer",
              transition: "all 0.2s ease",
              flexShrink: 0
            }}
          >
            <LogOut size={isMobile ? 13 : 15} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default GlassNavbar;
