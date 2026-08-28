import React, { useEffect, useRef } from "react";
import { MeshGradientBackground } from "./components/MeshGradientBackground";
import { GlassNavbar } from "./components/GlassNavbar";
import { FloatingPlayerDock } from "./components/FloatingPlayerDock";
import { LoginModal } from "./components/LoginModal";
import { HomePage } from "./pages/HomePage";
import { useAudioStore } from "./store/audioStore";

export const App: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { currentTrack, setAudioElement, nextTrack, initAudioEngine } = useAudioStore();

  useEffect(() => {
    initAudioEngine();
    if (audioRef.current) {
      setAudioElement(audioRef.current);
    }
  }, [initAudioEngine, setAudioElement]);

  return (
    <div style={{ position: "relative", minHeight: "100vh", overflowX: "hidden" }}>
      {/* 1. Apple Dynamic Mesh Gradient Background */}
      <MeshGradientBackground />

      {/* 2. Frosted Glass Top Navigation */}
      <GlassNavbar />

      {/* 3. Main Discovery Experience */}
      <HomePage />

      {/* 4. Apple Dynamic Island / Floating Music Dock */}
      <FloatingPlayerDock />

      {/* 5. Liquid Glass Login Modal */}
      <LoginModal />

      {/* 6. Primary Global HTML5 Lossless Audio Engine */}
      <audio
        ref={audioRef}
        src={currentTrack?.audioUrl}
        preload="auto"
        playsInline
        crossOrigin="anonymous"
        onPlay={() => useAudioStore.setState({ isPlaying: true })}
        onPause={() => useAudioStore.setState({ isPlaying: false })}
        onWaiting={() => useAudioStore.setState({ isBuffering: true })}
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
        onLoadedMetadata={(e) => {
          if (e.currentTarget.duration && !isNaN(e.currentTarget.duration)) {
            useAudioStore.setState({ duration: e.currentTarget.duration });
          }
        }}
        onEnded={() => nextTrack()}
        onError={() => {
          useAudioStore.setState({ isBuffering: false });
        }}
        style={{ display: "none" }}
      />
    </div>
  );
};

export default App;
