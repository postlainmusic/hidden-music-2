import React, { useEffect } from "react";
import { MeshGradientBackground } from "./components/MeshGradientBackground";
import { GlassNavbar } from "./components/GlassNavbar";
import { FloatingPlayerDock } from "./components/FloatingPlayerDock";
import { LoginModal } from "./components/LoginModal";
import { HomePage } from "./pages/HomePage";
import { useAudioStore } from "./store/audioStore";

export const App: React.FC = () => {
  const initAudioEngine = useAudioStore((state) => state.initAudioEngine);

  useEffect(() => {
    initAudioEngine();
  }, [initAudioEngine]);

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
    </div>
  );
};

export default App;
