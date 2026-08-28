import React, { useEffect, useRef } from "react";
import { MeshGradientBackground } from "./components/MeshGradientBackground";
import { GlassNavbar } from "./components/GlassNavbar";
import { FloatingPlayerDock } from "./components/FloatingPlayerDock";
import { MobilePlayerDock } from "./components/MobilePlayerDock";
import { VaultGate } from "./components/VaultGate";
import { HomePage } from "./pages/HomePage";
import { MobileHomePage } from "./pages/MobileHomePage";
import { useAudioStore } from "./store/audioStore";
import { useIsMobile } from "./hooks/useIsMobile";

export const App: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [activeTab, setActiveTab] = React.useState<"vault" | "explore">("vault");
  const { currentTrack, isPlaying, volume, isMuted, currentUser, setAudioElement, nextTrack, initAudioEngine } = useAudioStore();
  const isMobile = useIsMobile();

  useEffect(() => {
    initAudioEngine();
    if (audioRef.current) {
      setAudioElement(audioRef.current);
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
      {/* 1. Subtle Monochrome Background */}
      <MeshGradientBackground />

      {/* 2. Mandatory Google Login Vault Gate */}
      {!currentUser ? (
        <VaultGate />
      ) : (
        <>
          {/* Frosted Glass Corner-to-Corner Navigation */}
          <GlassNavbar activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Tab Content */}
          {activeTab === "vault" ? (
            isMobile ? (
              <MobileHomePage onExploreClick={() => setActiveTab("explore")} />
            ) : (
              <HomePage onExploreClick={() => setActiveTab("explore")} />
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
                textAlign: "center"
              }}
            >
              <h2 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "16px", color: "#ffffff" }}>
                EXPLORE UNIVERSE
              </h2>
              <p style={{ color: "rgba(255, 255, 255, 0.5)", maxWidth: "480px", marginBottom: "32px", lineHeight: 1.6 }}>
                Không gian âm nhạc mở rộng đang được kết nối với hệ sinh thái streaming độc quyền.
              </p>
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
          )}

          {/* Player Dock (Shows when playing) */}
          {isPlaying && (isMobile ? <MobilePlayerDock /> : <FloatingPlayerDock />)}
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
