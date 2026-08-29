import React, { useState } from "react";
import { useAudioStore } from "../store/audioStore";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, User, Sparkles, ArrowRight, ShieldCheck, Disc } from "lucide-react";

export const LoginModal: React.FC = () => {
  const { isLoginModalOpen, setLoginModalOpen, loginUser } = useAudioStore();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      loginUser({
        id: "usr-" + Math.random().toString(36).substring(2, 9),
        name: name || (email.split("@")[0] ? email.split("@")[0] : "Sound Explorer"),
        email: email || "user@hiddenmusic.app",
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop",
        membershipTier: "Pro Studio Member"
      });
      setIsLoading(false);
    }, 600);
  };

  const handleGuestLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      loginUser({
        id: "guest-01",
        name: "Khách Trải Nghiệm",
        email: "guest@hiddenmusic.app",
        avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop",
        membershipTier: "Guest VIP"
      });
      setIsLoading(false);
    }, 400);
  };

  return (
    <AnimatePresence>
      {isLoginModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px"
          }}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLoginModalOpen(false)}
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(4, 5, 8, 0.72)",
              backdropFilter: "blur(16px)"
            }}
          />

          {/* Liquid Glass Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="glass-panel"
            style={{
              width: "100%",
              maxWidth: "440px",
              padding: "32px",
              zIndex: 10,
              background: "rgba(18, 20, 29, 0.85)",
              border: "1px solid rgba(255, 255, 255, 0.18)",
              boxShadow: "0 30px 80px rgba(0, 0, 0, 0.7), 0 0 40px var(--glow-color)"
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "14px",
                    background: "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 6px 20px var(--glow-color)"
                  }}
                >
                  <Disc size={24} color="#ffffff" />
                </div>
                <div>
                  <h3 style={{ fontSize: "1.3rem", fontWeight: 700 }}>
                    {tab === "login" ? "Chào mừng trở lại" : "Tạo tài khoản mới"}
                  </h3>
                  <p style={{ fontSize: "0.84rem", color: "var(--text-muted)", marginTop: "2px" }}>
                    Khám phá âm nhạc chất lượng cao trên Edge
                  </p>
                </div>
              </div>

              <button
                onClick={() => setLoginModalOpen(false)}
                className="glass-pill"
                style={{
                  padding: "8px",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  display: "flex"
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Tab Switcher */}
            <div
              style={{
                display: "flex",
                background: "rgba(255, 255, 255, 0.05)",
                padding: "4px",
                borderRadius: "14px",
                marginBottom: "24px",
                border: "1px solid rgba(255, 255, 255, 0.08)"
              }}
            >
              <button
                type="button"
                onClick={() => setTab("login")}
                style={{
                  flex: 1,
                  padding: "8px 0",
                  fontSize: "0.88rem",
                  fontWeight: 600,
                  border: "none",
                  borderRadius: "10px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  background: tab === "login" ? "rgba(255, 255, 255, 0.16)" : "transparent",
                  color: tab === "login" ? "#ffffff" : "var(--text-muted)",
                  boxShadow: tab === "login" ? "0 2px 8px rgba(0,0,0,0.2)" : "none"
                }}
              >
                Đăng nhập
              </button>
              <button
                type="button"
                onClick={() => setTab("register")}
                style={{
                  flex: 1,
                  padding: "8px 0",
                  fontSize: "0.88rem",
                  fontWeight: 600,
                  border: "none",
                  borderRadius: "10px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  background: tab === "register" ? "rgba(255, 255, 255, 0.16)" : "transparent",
                  color: tab === "register" ? "#ffffff" : "var(--text-muted)",
                  boxShadow: tab === "register" ? "0 2px 8px rgba(0,0,0,0.2)" : "none"
                }}
              >
                Đăng ký
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {tab === "register" && (
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: "6px" }}>
                    Họ và tên
                  </label>
                  <div
                    className="glass-pill"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "10px 14px",
                      borderRadius: "14px"
                    }}
                  >
                    <User size={16} color="var(--text-muted)" />
                    <input
                      type="text"
                      required
                      placeholder="Nguyễn Văn A"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      style={{
                        background: "transparent",
                        border: "none",
                        outline: "none",
                        color: "#fff",
                        width: "100%",
                        fontSize: "0.9rem"
                      }}
                    />
                  </div>
                </div>
              )}

              <div>
                <label style={{ display: "block", fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: "6px" }}>
                  Email
                </label>
                <div
                  className="glass-pill"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px 14px",
                    borderRadius: "14px"
                  }}
                >
                  <Mail size={16} color="var(--text-muted)" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      background: "transparent",
                      border: "none",
                      outline: "none",
                      color: "#fff",
                      width: "100%",
                      fontSize: "0.9rem"
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: "6px" }}>
                  Mật khẩu
                </label>
                <div
                  className="glass-pill"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px 14px",
                    borderRadius: "14px"
                  }}
                >
                  <Lock size={16} color="var(--text-muted)" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      background: "transparent",
                      border: "none",
                      outline: "none",
                      color: "#fff",
                      width: "100%",
                      fontSize: "0.9rem"
                    }}
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="apple-btn-primary"
                style={{
                  width: "100%",
                  justifyContent: "center",
                  padding: "12px",
                  fontSize: "0.95rem",
                  marginTop: "6px"
                }}
              >
                <span>{isLoading ? "Đang xử lý..." : tab === "login" ? "Đăng nhập ngay" : "Tạo tài khoản"}</span>
                <ArrowRight size={16} />
              </motion.button>
            </form>

            {/* Divider */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                margin: "20px 0 16px 0",
                color: "var(--text-muted)",
                fontSize: "0.78rem"
              }}
            >
              <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.1)" }} />
              <span>HOẶC</span>
              <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.1)" }} />
            </div>

            {/* Instant Guest Demo Login */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={handleGuestLogin}
              className="apple-btn-secondary"
              style={{
                width: "100%",
                justifyContent: "center",
                padding: "11px",
                fontSize: "0.88rem"
              }}
            >
              <Sparkles size={16} color="var(--accent-secondary)" />
              <span>Trải nghiệm nhanh không cần mật khẩu</span>
            </motion.button>

            {/* Footer Trust */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                marginTop: "20px",
                fontSize: "0.74rem",
                color: "var(--text-muted)"
              }}
            >
              <ShieldCheck size={14} color="#10b981" />
              <span>Bảo mật bởi Cloudflare Edge D1 & JWT</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
