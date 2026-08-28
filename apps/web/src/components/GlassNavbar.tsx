import React, { useState, useEffect } from "react";
import { useAudioStore } from "../store/audioStore";
import { Disc3, LogOut, Compass, Database } from "lucide-react";
import { motion } from "framer-motion";

interface GlassNavbarProps {
  activeTab?: "vault" | "explore";
  onTabChange?: (tab: "vault" | "explore") => void;
}

export const GlassNavbar: React.FC<GlassNavbarProps> = ({
  activeTab = "vault",
  onTabChange
}) => {
  const { currentUser, logoutUser } = useAudioStore();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        transition: "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
        background: isScrolled
          ? "rgba(0, 0, 0, 0.75)"
          : "transparent",
        backdropFilter: isScrolled ? "blur(24px) saturate(180%)" : "none",
        WebkitBackdropFilter: isScrolled ? "blur(24px) saturate(180%)" : "none",
        borderBottom: isScrolled
          ? "1px solid rgba(255, 255, 255, 0.08)"
          : "1px solid transparent",
        padding: "0 36px",
        height: "72px",
        display: "flex",
        alignItems: "center"
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1600px",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}
      >
        {/* ── GÓC TRÁI: ICON + TÊN WEB ─────────────────────────────────────── */}
        <div
          onClick={() => onTabChange?.("vault")}
          style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 24, ease: "linear" }}
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #ffffff 0%, #71717a 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 12px rgba(255, 255, 255, 0.15)"
            }}
          >
            <Disc3 size={20} color="#000000" />
          </motion.div>

          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: "1.1rem",
              letterSpacing: "0.08em",
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
            background: "rgba(255, 255, 255, 0.06)",
            borderRadius: "999px",
            padding: "4px",
            border: "1px solid rgba(255, 255, 255, 0.1)"
          }}
        >
          <button
            onClick={() => onTabChange?.("vault")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 18px",
              borderRadius: "999px",
              fontSize: "0.86rem",
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
              transition: "all 0.2s ease",
              background: activeTab === "vault" ? "#ffffff" : "transparent",
              color: activeTab === "vault" ? "#000000" : "rgba(255, 255, 255, 0.6)"
            }}
          >
            <Database size={14} />
            <span>Vault</span>
          </button>

          <button
            onClick={() => onTabChange?.("explore")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 18px",
              borderRadius: "999px",
              fontSize: "0.86rem",
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
              transition: "all 0.2s ease",
              background: activeTab === "explore" ? "#ffffff" : "transparent",
              color: activeTab === "explore" ? "#000000" : "rgba(255, 255, 255, 0.6)"
            }}
          >
            <Compass size={14} />
            <span>Khám phá</span>
          </button>
        </div>

        {/* ── GÓC PHẢI: AVATAR PROFILE (BỎ TÊN) + SIGN OUT ─────────────────── */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          {currentUser?.avatarUrl ? (
            <img
              src={currentUser.avatarUrl}
              alt="Profile Avatar"
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "1px solid rgba(255, 255, 255, 0.25)"
              }}
            />
          ) : (
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid rgba(255, 255, 255, 0.2)"
              }}
            >
              <span style={{ fontSize: "0.82rem", fontWeight: 700 }}>
                {currentUser?.email?.[0]?.toUpperCase() || "U"}
              </span>
            </div>
          )}

          <button
            onClick={logoutUser}
            title="Đăng xuất"
            style={{
              background: "rgba(255, 255, 255, 0.06)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "50%",
              width: "36px",
              height: "36px",
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
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.06)";
              e.currentTarget.style.color = "rgba(255, 255, 255, 0.7)";
            }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};
