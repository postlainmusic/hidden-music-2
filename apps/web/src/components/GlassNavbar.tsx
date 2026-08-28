import React, { useState } from "react";
import { useAudioStore } from "../store/audioStore";
import { Disc3, LogOut, Compass, Database, ShieldCheck, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
  const [showProfileModal, setShowProfileModal] = useState(false);

  return (
    <>
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          background: isMobile ? "rgba(5, 5, 8, 0.75)" : "transparent",
          backdropFilter: isMobile ? "blur(20px) saturate(180%)" : "none",
          WebkitBackdropFilter: isMobile ? "blur(20px) saturate(180%)" : "none",
          paddingLeft: isMobile ? "12px" : "36px",
          paddingRight: isMobile ? "12px" : "36px",
          paddingTop: "max(8px, env(safe-area-inset-top, 8px))",
          paddingBottom: "8px",
          minHeight: isMobile ? "54px" : "72px",
          display: "flex",
          alignItems: "center",
          pointerEvents: "auto",
          borderBottom: isMobile ? "1px solid rgba(255, 255, 255, 0.1)" : "none"
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
            gap: isMobile ? "6px" : "16px"
          }}
        >
          {/* ── GÓC TRÁI: LOGO / BRAND ─────────────────────────────────────────── */}
          <div
            onClick={() => onTabChange?.("vault")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: isMobile ? "6px" : "12px",
              cursor: "pointer",
              flexShrink: 0
            }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 24, ease: "linear" }}
              style={{
                width: isMobile ? "32px" : "36px",
                height: isMobile ? "32px" : "36px",
                borderRadius: "9px",
                background: "linear-gradient(135deg, #ffffff 0%, #71717a 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 10px rgba(255, 255, 255, 0.15)",
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
                  fontSize: "1.1rem",
                  letterSpacing: "0.06em",
                  color: "#ffffff"
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
              padding: isMobile ? "2px" : "4px",
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
                padding: isMobile ? "4px 10px" : "6px 18px",
                borderRadius: "999px",
                fontSize: isMobile ? "0.75rem" : "0.86rem",
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
                padding: isMobile ? "4px 10px" : "6px 18px",
                borderRadius: "999px",
                fontSize: isMobile ? "0.75rem" : "0.86rem",
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

          {/* ── GÓC PHẢI: AVATAR PROFILE + NÚT ĐĂNG XUẤT (LUÔN HIỂN THỊ 100%) ─── */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: isMobile ? "6px" : "12px",
              flexShrink: 0
            }}
          >
            {/* User Avatar (Tap on mobile to open Profile Drawer) */}
            <div
              onClick={() => setShowProfileModal(true)}
              style={{ cursor: "pointer", position: "relative" }}
              title="Thông tin tài khoản"
            >
              {currentUser?.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt="Profile Avatar"
                  style={{
                    width: isMobile ? "32px" : "36px",
                    height: isMobile ? "32px" : "36px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "1.5px solid rgba(255, 255, 255, 0.4)",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.5)",
                    display: "block"
                  }}
                />
              ) : (
                <div
                  style={{
                    width: isMobile ? "32px" : "36px",
                    height: isMobile ? "32px" : "36px",
                    borderRadius: "50%",
                    background: "rgba(255, 255, 255, 0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1.5px solid rgba(255, 255, 255, 0.3)",
                    color: "#ffffff"
                  }}
                >
                  <span style={{ fontSize: isMobile ? "0.75rem" : "0.82rem", fontWeight: 700 }}>
                    {currentUser?.email?.[0]?.toUpperCase() || "U"}
                  </span>
                </div>
              )}

              {/* Online Green Indicator Dot */}
              <div
                style={{
                  position: "absolute",
                  bottom: "0px",
                  right: "0px",
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "#10b981",
                  border: "1.5px solid #000000"
                }}
              />
            </div>

            {/* Logout Action Button */}
            <button
              onClick={logoutUser}
              title="Đăng xuất"
              aria-label="Đăng xuất"
              style={{
                background: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                borderRadius: "50%",
                width: isMobile ? "32px" : "36px",
                height: isMobile ? "32px" : "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "rgba(255, 255, 255, 0.8)",
                transition: "all 0.2s ease",
                flexShrink: 0
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(239, 68, 68, 0.25)";
                e.currentTarget.style.color = "#ef4444";
                e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
                e.currentTarget.style.color = "rgba(255, 255, 255, 0.8)";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)";
              }}
            >
              <LogOut size={isMobile ? 15 : 16} />
            </button>
          </div>
        </div>
      </header>

      {/* ── PROFILE MODAL / DRAWER (XEM CHI TIẾT USER & ĐĂNG XUẤT) ─────────── */}
      <AnimatePresence>
        {showProfileModal && currentUser && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 350,
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
              background: "rgba(0, 0, 0, 0.8)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)"
            }}
            onClick={() => setShowProfileModal(false)}
          >
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 26, stiffness: 280 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "100%",
                maxWidth: "440px",
                background: "linear-gradient(180deg, rgba(24, 24, 28, 0.98) 0%, rgba(10, 10, 12, 1) 100%)",
                borderTop: "1px solid rgba(255, 255, 255, 0.15)",
                borderTopLeftRadius: "28px",
                borderTopRightRadius: "28px",
                padding: "24px 20px max(24px, env(safe-area-inset-bottom, 24px))",
                boxShadow: "0 -20px 60px rgba(0, 0, 0, 0.9)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "18px",
                color: "#ffffff"
              }}
            >
              {/* Top Handle */}
              <div
                style={{
                  width: "36px",
                  height: "4px",
                  borderRadius: "999px",
                  background: "rgba(255, 255, 255, 0.3)"
                }}
              />

              {/* Close Button Top-Right */}
              <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "rgba(255, 255, 255, 0.5)", letterSpacing: "0.08em" }}>
                  TÀI KHOẢN GOOGLE
                </span>
                <button
                  onClick={() => setShowProfileModal(false)}
                  style={{
                    background: "rgba(255, 255, 255, 0.08)",
                    border: "none",
                    borderRadius: "50%",
                    width: "32px",
                    height: "32px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#ffffff",
                    cursor: "pointer"
                  }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* User Avatar Large */}
              <div style={{ position: "relative", marginTop: "4px" }}>
                {currentUser.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt="Profile Large"
                    style={{
                      width: "72px",
                      height: "72px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "2px solid rgba(255, 255, 255, 0.4)",
                      boxShadow: "0 8px 24px rgba(0, 0, 0, 0.6)"
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "72px",
                      height: "72px",
                      borderRadius: "50%",
                      background: "rgba(255, 255, 255, 0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "2px solid rgba(255, 255, 255, 0.3)",
                      fontSize: "1.6rem",
                      fontWeight: 800
                    }}
                  >
                    {currentUser.email?.[0]?.toUpperCase() || "U"}
                  </div>
                )}
              </div>

              {/* User Info */}
              <div style={{ textAlign: "center" }}>
                <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#ffffff", marginBottom: "4px" }}>
                  {currentUser.name || "Explorer"}
                </h3>
                <p style={{ fontSize: "0.85rem", color: "rgba(255, 255, 255, 0.6)" }}>
                  {currentUser.email}
                </p>
              </div>

              {/* Membership Badge */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 14px",
                  borderRadius: "999px",
                  background: "rgba(16, 185, 129, 0.12)",
                  border: "1px solid rgba(16, 185, 129, 0.3)",
                  color: "#34d399",
                  fontSize: "0.78rem",
                  fontWeight: 700
                }}
              >
                <ShieldCheck size={14} color="#34d399" />
                <span>Verified Google Listener • D1 Synced</span>
              </div>

              {/* Logout Button */}
              <button
                onClick={() => {
                  setShowProfileModal(false);
                  logoutUser();
                }}
                style={{
                  width: "100%",
                  marginTop: "8px",
                  padding: "14px",
                  borderRadius: "16px",
                  background: "rgba(239, 68, 68, 0.15)",
                  border: "1px solid rgba(239, 68, 68, 0.35)",
                  color: "#fca5a5",
                  fontSize: "0.92rem",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  cursor: "pointer"
                }}
              >
                <LogOut size={16} />
                <span>Đăng xuất khỏi Vault</span>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
