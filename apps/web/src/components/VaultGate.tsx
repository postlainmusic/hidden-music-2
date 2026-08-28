import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ShieldCheck, Disc3, AlertCircle, Loader2 } from "lucide-react";
import { useAudioStore } from "../store/audioStore";

const GOOGLE_CLIENT_ID = "269738854318-95pab6qb8fmjv4q676s3jeu643e7291p.apps.googleusercontent.com";

declare global {
  interface Window {
    google?: any;
  }
}

export const VaultGate: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const googleBtnContainerRef = useRef<HTMLDivElement>(null);
  const loginUser = useAudioStore((s) => s.loginUser);

  // 100% Real Google Identity Services (GIS) integration (Zero Mock)
  useEffect(() => {
    const handleCredentialResponse = async (response: any) => {
      if (!response.credential) {
        setError("Không nhận được mã xác thực từ Google");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const res = await fetch("https://hidden-music-api.postlain-music.workers.dev/api/auth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ credential: response.credential })
        });

        const data = await res.json();
        if (data.success && data.user) {
          localStorage.setItem("vault_token", data.token);
          localStorage.setItem("vault_user", JSON.stringify(data.user));
          loginUser(data.user);
        } else {
          setError(data.error || "Xác thực Google thất bại trên máy chủ");
        }
      } catch (err: any) {
        setError(err.message || "Lỗi kết nối máy chủ xác thực Cloudflare Worker");
      } finally {
        setLoading(false);
      }
    };

    const initGoogleGSI = () => {
      if (typeof window !== "undefined" && window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true
          });

          if (googleBtnContainerRef.current) {
            googleBtnContainerRef.current.innerHTML = "";
            window.google.accounts.id.renderButton(googleBtnContainerRef.current, {
              type: "standard",
              theme: "filled_blue",
              size: "large",
              text: "signin_with",
              shape: "pill",
              logo_alignment: "left",
              width: 320
            });
          }

          // Optional Google One Tap Prompt
          window.google.accounts.id.prompt((notification: any) => {
            if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
              // Gracefully handle dismissed prompt
            }
          });
        } catch (e: any) {
          console.warn("Google GSI initialize notice:", e);
        }
      }
    };

    if (window.google?.accounts?.id) {
      initGoogleGSI();
    } else {
      const interval = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(interval);
          initGoogleGSI();
        }
      }, 200);
      return () => clearInterval(interval);
    }
  }, [loginUser]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(ellipse at center, rgba(15, 23, 42, 0.95) 0%, rgba(3, 7, 18, 0.99) 100%)",
        padding: "24px",
        backdropFilter: "blur(40px)"
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 24 }}
        style={{
          width: "100%",
          maxWidth: "460px",
          background: "linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          borderRadius: "32px",
          padding: "44px 36px",
          boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 40px rgba(99, 102, 241, 0.2)",
          textAlign: "center",
          position: "relative",
          overflow: "hidden"
        }}
      >
        {/* Ambient Top Glow */}
        <div
          style={{
            position: "absolute",
            top: "-80px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "240px",
            height: "160px",
            background: "radial-gradient(circle, rgba(99, 102, 241, 0.5) 0%, transparent 70%)",
            pointerEvents: "none"
          }}
        />

        {/* Brand Icon */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
          style={{
            width: "68px",
            height: "68px",
            borderRadius: "22px",
            background: "linear-gradient(135deg, #6366f1 0%, #ec4899 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
            boxShadow: "0 0 30px rgba(99, 102, 241, 0.5)"
          }}
        >
          <Disc3 size={36} color="#ffffff" />
        </motion.div>

        {/* Title */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
          <Sparkles size={16} color="#818cf8" />
          <span style={{ fontSize: "0.82rem", fontWeight: 700, letterSpacing: "2px", color: "#818cf8", textTransform: "uppercase" }}>
            Cổng truy cập Vault
          </span>
        </div>

        <h1
          style={{
            fontSize: "2rem",
            fontWeight: 800,
            lineHeight: 1.2,
            marginBottom: "12px",
            background: "linear-gradient(135deg, #ffffff 40%, rgba(255,255,255,0.7) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}
        >
          HIDDEN MUSIC
        </h1>

        <p style={{ fontSize: "0.95rem", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "32px" }}>
          Không gian âm nhạc nghệ thuật độc quyền. Đăng nhập bằng tài khoản Google chính thức để tiếp tục.
        </p>

        {/* Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              style={{
                background: "rgba(239, 68, 68, 0.15)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                color: "#fca5a5",
                fontSize: "0.85rem",
                padding: "12px 14px",
                borderRadius: "14px",
                marginBottom: "24px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                textAlign: "left"
              }}
            >
              <AlertCircle size={18} color="#ef4444" style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading Spinner */}
        {loading && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", margin: "20px 0", color: "#818cf8" }}>
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
              <Loader2 size={24} />
            </motion.div>
            <span style={{ fontSize: "0.92rem", fontWeight: 600 }}>Đang xác thực với máy chủ Google...</span>
          </div>
        )}

        {/* Official Real Google Sign-In Button Container */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            minHeight: "44px",
            margin: "8px 0 16px"
          }}
        >
          <div ref={googleBtnContainerRef} id="google-signin-btn" />
        </div>

        {/* Security Badge Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            marginTop: "24px",
            color: "var(--text-muted)",
            fontSize: "0.78rem"
          }}
        >
          <ShieldCheck size={15} color="#10b981" />
          <span>Xác thực chuẩn Google OAuth 2.0 • Lưu trữ Cloudflare D1</span>
        </div>
      </motion.div>
    </div>
  );
};
