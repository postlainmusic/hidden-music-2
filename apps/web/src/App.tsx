import React, { useEffect, useState } from "react";
import { MeshGradientBackground } from "./components/MeshGradientBackground";
import { GlassNavbar } from "./components/GlassNavbar";
import { VaultGate } from "./components/VaultGate";
import { HomePage } from "./pages/HomePage";
import { MobileHomePage } from "./pages/MobileHomePage";
import { Album3DZone } from "./pages/Album3DZone";
import { FloatingPlayerDock } from "./components/FloatingPlayerDock";
import { MobilePlayerDock } from "./components/MobilePlayerDock";
import { useAudioStore } from "./store/audioStore";
import { useIsMobile } from "./hooks/useIsMobile";

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"vault" | "explore" | "3d">("vault");
  const { currentUser, initAudioEngine } = useAudioStore();
  const isMobile = useIsMobile();

  useEffect(() => {
    initAudioEngine();
  }, [initAudioEngine]);

  return (
    <div style={{ position: "relative", minHeight: "100dvh", width: "100vw", overflowX: "hidden", backgroundColor: "#000000" }}>
      {/* 1. Mandatory Google Login Vault Gate */}
      {!currentUser ? (
        <>
          <MeshGradientBackground />
          <VaultGate />
        </>
      ) : activeTab === "3d" ? (
        /* 2. Full 3D Immersion Zone (WebGL Universe + Album Cover + 30 Tracks + Playbar) */
        <Album3DZone onBackToVault={() => setActiveTab("vault")} />
      ) : (
        /* 3. Standard Vault & Explore Browse Experience */
        <>
          <MeshGradientBackground />
          <GlassNavbar activeTab={activeTab === "explore" ? "explore" : "vault"} onTabChange={setActiveTab} />

          {activeTab === "vault" ? (
            isMobile ? (
              <MobileHomePage
                onExploreClick={() => setActiveTab("explore")}
                onOpen3D={() => setActiveTab("3d")}
              />
            ) : (
              <HomePage
                onExploreClick={() => setActiveTab("explore")}
                onOpen3D={() => setActiveTab("3d")}
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
                  onClick={() => setActiveTab("3d")}
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
                  onClick={() => setActiveTab("vault")}
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
        </>
      )}
    </div>
  );
};

export default App;
