import React from "react";
import { useAudioStore } from "../store/audioStore";
import { Disc3, LogOut, Compass, Database } from "lucide-react";
import { motion } from "framer-motion";
import { useIsMobile } from "../hooks/useIsMobile";

interface GlassNavbarProps {
  activeTab?: "vault" | "explore";
  onTabChange?: (tab: "vault" | "explore") => void;
}

export const GlassNavbar: React.FC<GlassNavbarProps> = ({
  activeTab = "vault",
  onTabChange
}) => {
  const { currentUser, logoutUser } = useAudioStore();
  const isMobile = useIsMobile();

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: isMobile ? "rgba(0, 0, 0, 0.4)" : "transparent",
        backdropFilter: isMobile ? "blur(16px)" : "none",
        WebkitBackdropFilter: isMobile ? "blur(16px)" : "none",
        paddingLeft: isMobile ? "14px" : "36px",
        paddingRight: isMobile ? "14px" : "36px",
        paddingTop: "max(8px, env(safe-area-inset-top, 8px))",
        paddingBottom: "8px",
        minHeight: isMobile ? "58px" : "72px",
        display: "flex",
        alignItems: "center",
        pointerEvents: "auto",
        borderBottom: isMobile ? "1px solid rgba(255, 255, 255, 0.08)" : "none"
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
          gap: isMobile ? "8px" : "16px"
        }}
      >
        {/* ── GÓC TRÁI: ICON + TÊN WEB ─────────────────────────────────────── */}
        <div
          onClick={() => onTabChange?.("vault")}
          style={{ display: "flex", alignItems: "center", gap: isMobile ? "8px" : "12px", cursor: "pointer", flexShrink: 0 }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 24, ease: "linear" }}
            style={{
              width: isMobile ? "30px" : "36px",
              height: isMobile ? "30px" : "36px",
              borderRadius: "8px",
              background: "linear-gradient(135deg, #ffffff 0%, #71717a 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 10px rgba(255, 255, 255, 0.15)"
            }}
          >
            <Disc3 size={isMobile ? 18 : 20} color="#000000" />
          </motion.div>

          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: isMobile ? "0.92rem" : "1.1rem",
              letterSpacing: "0.06em",
              color: "#ffffff"
            }}
          >
            HIDDEN MUSIC
          </span>
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
            flexShrink: 0
          }}
        >
          <button
            onClick={() => onTabChange?.("vault")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              padding: isMobile ? "4px 12px" : "6px 18px",
              borderRadius: "999px",
              fontSize: isMobile ? "0.78rem" : "0.86rem",
              fontWeight: 600,
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
              gap: "4px",
              padding: isMobile ? "4px 12px" : "6px 18px",
              borderRadius: "999px",
              fontSize: isMobile ? "0.78rem" : "0.86rem",
              fontWeight: 600,
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
        </div>

        {/* ── GÓC PHẢI: AVATAR PROFILE (BỎ TÊN) + SIGN OUT ─────────────────── */}
        <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "8px" : "14px", flexShrink: 0 }}>
          {currentUser?.avatarUrl ? (
            <img
              src={currentUser.avatarUrl}
              alt="Profile Avatar"
              style={{
                width: isMobile ? "30px" : "36px",
                height: isMobile ? "30px" : "36px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "1px solid rgba(255, 255, 255, 0.25)"
              }}
            />
          ) : (
            <div
              style={{
                width: isMobile ? "30px" : "36px",
                height: isMobile ? "30px" : "36px",
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid rgba(255, 255, 255, 0.2)"
              }}
            >
              <span style={{ fontSize: isMobile ? "0.75rem" : "0.82rem", fontWeight: 700 }}>
                {currentUser?.email?.[0]?.toUpperCase() || "U"}
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
              width: isMobile ? "30px" : "36px",
              height: isMobile ? "30px" : "36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "rgba(255, 255, 255, 0.7)",
              transition: "all 0.2s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(239, 68, 68, 0.2)";
              e.currentTarget.style.color = "#ef4444";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
              e.currentTarget.style.color = "rgba(255, 255, 255, 0.7)";
            }}
          >
            <LogOut size={isMobile ? 14 : 16} />
          </button>
        </div>
      </div>
    </header>
  );
};
