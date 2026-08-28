import React, { useEffect, useRef } from "react";
import { MeshGradientBackground } from "./components/MeshGradientBackground";
import { GlassNavbar } from "./components/GlassNavbar";
import { FloatingPlayerDock } from "./components/FloatingPlayerDock";
import { VaultGate } from "./components/VaultGate";
import { HomePage } from "./pages/HomePage";
import { useAudioStore } from "./store/audioStore";

export const App: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { currentTrack, isPlaying, volume, isMuted, currentUser, setAudioElement, nextTrack, initAudioEngine } = useAudioStore();

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
    <div style={{ position: "relative", minHeight: "100vh", overflowX: "hidden" }}>
      {/* 1. Apple Dynamic Mesh Gradient Background */}
      <MeshGradientBackground />

      {/* 2. Mandatory Google Login Vault Gate (Single Entrypoint) */}
      {!currentUser ? (
        <VaultGate />
      ) : (
        <>
          {/* Frosted Glass Top Navigation */}
          <GlassNavbar />

          {/* 3-Section Visual Showcase Discovery Experience */}
          <HomePage />

          {/* Floating Player Dock (Only shows when playing or inside 3D space) */}
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
