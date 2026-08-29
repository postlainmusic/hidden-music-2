import React, { useEffect, useRef } from "react";
import { MeshGradientBackground } from "./components/MeshGradientBackground";
import { GlassNavbar } from "./components/GlassNavbar";
import { FloatingPlayerDock } from "./components/FloatingPlayerDock";
import { VaultGate } from "./components/VaultGate";
import { HomePage } from "./pages/HomePage";
import { Album3DZone } from "./pages/Album3DZone";
import { useAudioStore } from "./store/audioStore";
import { studioBeatEngine } from "./audio/StudioBeatEngine";

export const App: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [activeTab, setActiveTab] = React.useState<"vault" | "explore" | "3d">("vault");
  const { currentTrack, isPlaying, volume, isMuted, currentUser, nextTrack } = useAudioStore();

  useEffect(() => {
    if (audioRef.current) {
      studioBeatEngine.attachAudioElement(audioRef.current);
    }
  }, []);

  useEffect(() => {
    if (currentTrack) {
      studioBeatEngine.setTrack(currentTrack.id || currentTrack.title);
    }
  }, [currentTrack]);

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
      studioBeatEngine.resumeContext();
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
    <div style={{ position: "relative", minHeight: "100vh", overflowX: "hidden", backgroundColor: "#000000" }}>
      {/* 1. Subtle Monochrome Background */}
      <MeshGradientBackground />

      {/* 2. Mandatory Google Login Vault Gate */}
      {!currentUser ? (
        <VaultGate />
      ) : activeTab === "3d" ? (
        /* 2. Full 3D Immersion Zone (WebGL Universe + Album Cover + 30 Tracks + Playbar) */
        <Album3DZone onBackToVault={() => setActiveTab("vault")} />
      ) : (
        <>
          {/* Frosted Glass Corner-to-Corner Navigation */}
          <GlassNavbar
            activeTab={activeTab === "explore" ? "explore" : "vault"}
            onTabChange={(tab) => setActiveTab(tab as "vault" | "explore")}
          />

          {/* Tab Content */}
          {activeTab === "vault" ? (
            <HomePage
              onExploreClick={() => setActiveTab("explore")}
              onOpen3D={() => setActiveTab("3d")}
            />
          ) : (
            <div
              style={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "100px 24px",
                textAlign: "center"
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

          {/* Floating Player Dock (Only shows when playing) */}
          {isPlaying && <FloatingPlayerDock />}
        </>
      )}

      {/* 6. Primary Global HTML5 Lossless Audio Engine (Proven Byte-Range Seeking Lifecycle) */}
      <audio
        ref={audioRef}
        src={currentTrack?.audioUrl || undefined}
        preload="metadata"
        playsInline
        crossOrigin="anonymous"
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
