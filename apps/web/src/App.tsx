import React, { useEffect, useRef, useState } from "react";
import { MeshGradientBackground } from "./components/MeshGradientBackground";
import { GlassNavbar } from "./components/GlassNavbar";
import { VaultGate } from "./components/VaultGate";
import { HomePage } from "./pages/HomePage";
import { MobileHomePage } from "./pages/MobileHomePage";
import { Album3DZone } from "./pages/Album3DZone";
import { audioAnalyserEngine } from "./audio/AudioAnalyserEngine";
import { useAudioStore } from "./store/audioStore";
import { useIsMobile } from "./hooks/useIsMobile";

export const App: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [activeTab, setActiveTab] = useState<"vault" | "explore" | "3d">("vault");
  const { currentTrack, isPlaying, volume, isMuted, currentUser, setAudioElement, nextTrack, initAudioEngine } = useAudioStore();
  const isMobile = useIsMobile();

  useEffect(() => {
    initAudioEngine();
    if (audioRef.current) {
      setAudioElement(audioRef.current);
      audioAnalyserEngine.attachAudioElement(audioRef.current);
    }
  }, [initAudioEngine, setAudioElement]);

  // Volume & Mute synchronizer
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
      audioRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  // Proven HTML5 Audio Player Controller (Play/Pause/Track switch)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack?.audioUrl) return;

    if (isPlaying) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          if (err?.name !== "AbortError") {
            console.warn("Audio play notice:", err);
            useAudioStore.setState({ isPlaying: false, isBuffering: false });
          }
        });
      }
    } else {
      audio.pause();
    }
  }, [isPlaying, currentTrack?.audioUrl]);

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
        </>
      )}

      {/* 4. Primary Global HTML5 Lossless Audio Engine */}
      <audio
        ref={audioRef}
        src={currentTrack?.audioUrl || undefined}
        crossOrigin="anonymous"
        preload="metadata"
        playsInline
        onPlay={() => useAudioStore.setState({ isPlaying: true })}
        onPause={() => useAudioStore.setState({ isPlaying: false })}
        onWaiting={() => useAudioStore.setState({ isBuffering: true })}
        onSeeking={() => useAudioStore.setState({ isBuffering: true })}
        onSeeked={() => useAudioStore.setState({ isBuffering: false })}
        onPlaying={() => useAudioStore.setState({ isPlaying: true, isBuffering: false })}
        onCanPlay={() => useAudioStore.setState({ isBuffering: false })}
        onCanPlayThrough={() => useAudioStore.setState({ isBuffering: false })}
        onTimeUpdate={(e) => {
          const cur = e.currentTarget.currentTime;
          useAudioStore.setState({
            currentTime: cur,
            isBuffering: false,
            isPlaying: !e.currentTarget.paused
          });
        }}
        onDurationChange={(e) => {
          if (e.currentTarget.duration && !isNaN(e.currentTarget.duration) && e.currentTarget.duration > 0) {
            useAudioStore.setState({ duration: Math.round(e.currentTarget.duration) });
          }
        }}
        onLoadedMetadata={(e) => {
          if (e.currentTarget.duration && !isNaN(e.currentTarget.duration) && e.currentTarget.duration > 0) {
            useAudioStore.setState({ duration: Math.round(e.currentTarget.duration) });
          }
        }}
        onEnded={() => nextTrack()}
        onError={(e) => {
          console.warn("Audio element playback error:", e);
          useAudioStore.setState({ isBuffering: false });
        }}
        style={{ display: "none" }}
      />
    </div>
  );
};

export default App;
