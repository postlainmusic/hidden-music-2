import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Disc3, AlertCircle, Loader2 } from "lucide-react";
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
              theme: "filled_black",
              size: "large",
              text: "signin_with",
              shape: "pill",
              logo_alignment: "left",
              width: 300
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
        background: "rgba(0, 0, 0, 0.95)",
        padding: "24px",
        backdropFilter: "blur(30px)"
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{
          width: "100%",
          maxWidth: "440px",
          background: "linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.01) 100%)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          borderRadius: "32px",
          padding: "44px 36px",
          boxShadow: "0 30px 70px rgba(0, 0, 0, 0.9), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
          textAlign: "center",
          position: "relative",
          overflow: "hidden"
        }}
      >
        {/* Monochromatic Brand Icon */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "20px",
            background: "linear-gradient(135deg, #ffffff 0%, #52525b 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
            boxShadow: "0 0 24px rgba(255, 255, 255, 0.15)"
          }}
        >
          <Disc3 size={34} color="#000000" />
        </motion.div>

        <h1
          style={{
            fontSize: "1.8rem",
            fontWeight: 800,
            lineHeight: 1.2,
            marginBottom: "12px",
            color: "#ffffff",
            letterSpacing: "0.05em"
          }}
        >
          HIDDEN MUSIC
        </h1>

        <p style={{ fontSize: "0.92rem", color: "rgba(255, 255, 255, 0.55)", lineHeight: 1.6, marginBottom: "32px" }}>
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
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", margin: "20px 0", color: "#ffffff" }}>
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
              <Loader2 size={22} />
            </motion.div>
            <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>Đang xác thực với máy chủ Google...</span>
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
            color: "rgba(255, 255, 255, 0.35)",
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
