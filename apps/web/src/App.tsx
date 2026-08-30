import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MeshGradientBackground } from "./components/MeshGradientBackground";
import { GlassNavbar } from "./components/GlassNavbar";
import { VaultGate } from "./components/VaultGate";
import { HomePage } from "./pages/HomePage";
import { MobileHomePage } from "./pages/MobileHomePage";
import { Album3DZone } from "./pages/Album3DZone";
import { Video3DZone } from "./pages/Video3DZone";
import { AdminPortal } from "./pages/AdminPortal";
import { FloatingPlayerDock } from "./components/FloatingPlayerDock";
import { MobilePlayerDock } from "./components/MobilePlayerDock";
import { useAudioStore } from "./store/audioStore";
import { useIsMobile } from "./hooks/useIsMobile";

export type MainTabType = "vault" | "explore" | "3d" | "video-3d" | "admin";

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<MainTabType>(() => {
    if (typeof window !== "undefined" && window.location.pathname.startsWith("/admin")) {
      return "admin";
    }
    return "vault";
  });

  const { currentUser, initAudioEngine } = useAudioStore();
  const isMobile = useIsMobile();

  useEffect(() => {
    initAudioEngine();
  }, [initAudioEngine]);

  // Sync tab with URL without page reload
  const handleTabChange = (tab: MainTabType) => {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      if (tab === "admin") {
        window.history.pushState({}, "", "/admin");
      } else if (window.location.pathname.startsWith("/admin")) {
        window.history.pushState({}, "", "/");
      }
    }
  };

  return (
    <div style={{ position: "relative", minHeight: "100dvh", width: "100vw", overflowX: "hidden", backgroundColor: "#000000" }}>
      {/* 1. Mandatory Google Login Vault Gate */}
      {!currentUser ? (
        <>
          <MeshGradientBackground />
          <VaultGate />
        </>
      ) : (
        <AnimatePresence mode="wait">
          {activeTab === "3d" ? (
            /* 2. Full 3D Immersion Zone (WebGL Universe + Album Cover + 30 Tracks + Playbar) */
            <Album3DZone
              key="3d-zone"
              onBackToVault={() => handleTabChange("vault")}
              onOpenVideo3D={() => handleTabChange("video-3d")}
            />
          ) : activeTab === "video-3d" ? (
            /* 3. 3D Cinema Space Video Zone with Real-time Ambilight */
            <Video3DZone
              key="video-3d-zone"
              onBackTo3DAlbum={() => handleTabChange("3d")}
            />
          ) : activeTab === "admin" ? (
            /* 4. Vault Monolith Matrix Admin Portal */
            <AdminPortal
              key="admin-portal"
              onBackToVault={() => handleTabChange("vault")}
            />
          ) : (
            /* 5. Standard Vault & Explore Browse Experience with Zero-Flash Seamless Transition */
            <motion.div
              key="vault-browse-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45, ease: "easeInOut" }}
              style={{ position: "relative", width: "100%", minHeight: "100dvh" }}
            >
              <MeshGradientBackground />
              <GlassNavbar
                activeTab={activeTab === "explore" ? "explore" : activeTab === "admin" ? "admin" : "vault"}
                onTabChange={(t) => handleTabChange(t as MainTabType)}
              />

              {activeTab === "vault" ? (
                isMobile ? (
                  <MobileHomePage
                    onExploreClick={() => handleTabChange("explore")}
                    onOpen3D={() => handleTabChange("3d")}
                  />
                ) : (
                  <HomePage
                    onExploreClick={() => handleTabChange("explore")}
                    onOpen3D={() => handleTabChange("3d")}
                  />
                )
              ) : (
                <div
                  style={{
                    minHeight: "100dvh",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "100px 24px",
                    textAlign: "center",
                    position: "relative",
                    zIndex: 10
                  }}
                >
                  <h2 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "16px", color: "#ffffff" }}>
                    EXPLORE UNIVERSE
                  </h2>
                  <p style={{ color: "rgba(255, 255, 255, 0.5)", maxWidth: "480px", marginBottom: "32px", lineHeight: 1.6 }}>
                    Không gian âm nhạc mở rộng đang được kết nối với hệ sinh thái streaming độc quyền.
                  </p>
                  <div style={{ display: "flex", gap: "16px" }}>
                    <button
                      onClick={() => handleTabChange("3d")}
                      style={{
                        padding: "12px 28px",
                        borderRadius: "999px",
                        background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
                        color: "#ffffff",
                        fontWeight: 700,
                        border: "none",
                        cursor: "pointer",
                        boxShadow: "0 0 24px rgba(99, 102, 241, 0.5)"
                      }}
                    >
                      Vào 3D Album Zone
                    </button>
                    <button
                      onClick={() => handleTabChange("vault")}
                      style={{
                        padding: "12px 28px",
                        borderRadius: "999px",
                        background: "#ffffff",
                        color: "#000000",
                        fontWeight: 700,
                        border: "none",
                        cursor: "pointer"
                      }}
                    >
                      Quay lại Vault
                    </button>
                  </div>
                </div>
              )}

              {/* Global Floating Player Dock across all Vault pages */}
              {isMobile ? <MobilePlayerDock /> : <FloatingPlayerDock />}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

export default App;
