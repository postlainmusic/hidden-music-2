import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useAudioStore } from "../../store/audioStore";
import { audioAnalyserEngine } from "../../audio/AudioAnalyserEngine";
import { createFloatingVinylArtifact } from "./FloatingVinylArtifact";
import {
  GenreParticleVertexShader,
  GenreParticleFragmentShader,
} from "./shaders/GenreParticleShaders";
import {
  GrainHalationVertexShader,
  GrainHalationFragmentShader,
} from "./shaders/GrainHalationShaders";

interface Album3DSceneProps {
  onExit?: () => void;
}

export const Album3DScene: React.FC<Album3DSceneProps> = ({ onExit }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { currentTrack, isPlaying } = useAudioStore();
  const [moodName, setMoodName] = useState<string>("Atmospheric Flow");

  // Determine Mood Tier based on current track genre/title
  const getMoodTier = (genre?: string, title?: string): number => {
    const g = (genre || "").toLowerCase();
    const t = (title || "").toLowerCase();

    if (g.includes("trap") || g.includes("drill") || g.includes("hardcore") || t.includes("mắt môi") || t.includes("idk")) {
      return 2; // Tier 2: Trap / Cybernetic Warp / High Energy
    }
    if (g.includes("r&b") || g.includes("acoustic") || g.includes("chill") || g.includes("jazz") || t.includes("elegie") || t.includes("xa xôi")) {
      return 0; // Tier 0: Chill / Poetic / Romantic / Melancholic
    }
    return 1; // Tier 1: Cosmic / Ambient / Mystical
  };

  useEffect(() => {
    const tier = getMoodTier(currentTrack?.genre, currentTrack?.title);
    if (tier === 0) setMoodName("Bioluminescent Mist • Chill & Poetic");
    else if (tier === 1) setMoodName("Cosmic Nebula • Ambient Universe");
    else setMoodName("Cybernetic Shockwave • High Energy Warp");
  }, [currentTrack]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // ─────────────────────────────────────────────────────────────
    // 1. THREE.JS ENGINE SETUP
    // ─────────────────────────────────────────────────────────────
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#050508");

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 8.5);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
      stencil: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // ─────────────────────────────────────────────────────────────
    // 2. STUDIO LIGHTING RIG
    // ─────────────────────────────────────────────────────────────
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.4);
    keyLight.position.set(5, 8, 6);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x8b5cf6, 3.5);
    rimLight.position.set(-6, -4, -4);
    scene.add(rimLight);

    // ─────────────────────────────────────────────────────────────
    // 3. GENRE-DRIVEN AUDIO REACTIVE PARTICLE SYSTEM (20,000 PARTICLES)
    // ─────────────────────────────────────────────────────────────
    const particleCount = 20000;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);
    const randomVecs = new Float32Array(particleCount * 3);
    const phases = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      // Golden Spiral distribution in 3D sphere
      const radius = 1.5 + Math.pow(Math.random(), 1.5) * 14.0;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      scales[i] = Math.random() * 1.5 + 0.8;
      randomVecs[i * 3] = (Math.random() - 0.5) * 2;
      randomVecs[i * 3 + 1] = (Math.random() - 0.5) * 2;
      randomVecs[i * 3 + 2] = (Math.random() - 0.5) * 2;
      phases[i] = Math.random() * Math.PI * 2;
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute("aScale", new THREE.BufferAttribute(scales, 1));
    particleGeo.setAttribute("aRandomVec", new THREE.BufferAttribute(randomVecs, 3));
    particleGeo.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));

    const particleMaterial = new THREE.ShaderMaterial({
      vertexShader: GenreParticleVertexShader,
      fragmentShader: GenreParticleFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uSubBass: { value: 0 },
        uKick: { value: 0 },
        uVocalMid: { value: 0 },
        uHighTreble: { value: 0 },
        uMoodTier: { value: getMoodTier(currentTrack?.genre, currentTrack?.title) },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const particleSystem = new THREE.Points(particleGeo, particleMaterial);
    scene.add(particleSystem);

    // ─────────────────────────────────────────────────────────────
    // 4. FLOATING 3D VINYL ARTIFACT (HIGH-CONTRAST PBR)
    // ─────────────────────────────────────────────────────────────
    const vinylArtifact = createFloatingVinylArtifact(
      currentTrack?.coverUrl || "https://media.postlain.com/covers/HVL_Album_Cover.jpg"
    );
    scene.add(vinylArtifact.group);

    // ─────────────────────────────────────────────────────────────
    // 5. CINEMATIC 35MM POST-PROCESSING (GRAIN, HALATION, BLOOM)
    // ─────────────────────────────────────────────────────────────
    const renderTarget = new THREE.WebGLRenderTarget(width, height, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
    });

    const postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const postScene = new THREE.Scene();
    const postGeo = new THREE.PlaneGeometry(2, 2);

    const postMaterial = new THREE.ShaderMaterial({
      vertexShader: GrainHalationVertexShader,
      fragmentShader: GrainHalationFragmentShader,
      uniforms: {
        tDiffuse: { value: renderTarget.texture },
        uTime: { value: 0 },
        uGrainIntensity: { value: 0.08 },      // Subtle 35mm film grain
        uHalationIntensity: { value: 0.65 },   // Warm edge glow
        uChromaticAberration: { value: 0.0 },  // Dynamically driven by Sub-Bass
        uVignetteIntensity: { value: 0.95 },
      },
      depthWrite: false,
      depthTest: false,
    });

    const postQuad = new THREE.Mesh(postGeo, postMaterial);
    postScene.add(postQuad);

    // ─────────────────────────────────────────────────────────────
    // 6. INTERACTION STATE & MOUSE PARALLAX
    // ─────────────────────────────────────────────────────────────
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let targetRotation = { x: 0.35, y: 0.6 };
    let currentRotation = { x: 0.35, y: 0.6 };
    let mouseParallax = { x: 0, y: 0 };

    const handlePointerDown = (e: PointerEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handlePointerMove = (e: PointerEvent) => {
      const normX = (e.clientX / width) * 2 - 1;
      const normY = -(e.clientY / height) * 2 + 1;
      mouseParallax.x = normX * 0.4;
      mouseParallax.y = normY * 0.3;

      if (isDragging) {
        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;

        targetRotation.y += deltaX * 0.008;
        targetRotation.x += deltaY * 0.008;

        previousMousePosition = { x: e.clientX, y: e.clientY };
      }
    };

    const handlePointerUp = () => {
      isDragging = false;
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    // ─────────────────────────────────────────────────────────────
    // 7. PRE-ALLOCATED SCRATCH BUFFERS & 60FPS RENDER LOOP
    // ─────────────────────────────────────────────────────────────
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();
      const bands = audioAnalyserEngine.getBands(isPlaying);

      // Update Particle Shaders Uniforms
      particleMaterial.uniforms.uTime.value = elapsedTime;
      particleMaterial.uniforms.uSubBass.value = bands.subBass;
      particleMaterial.uniforms.uKick.value = bands.kick;
      particleMaterial.uniforms.uVocalMid.value = bands.vocalMid;
      particleMaterial.uniforms.uHighTreble.value = bands.highTreble;
      particleMaterial.uniforms.uMoodTier.value = getMoodTier(currentTrack?.genre, currentTrack?.title);

      // Free-Floating Vinyl Motion & Audio-Reactive Rotation
      if (isPlaying) {
        vinylArtifact.discMesh.rotation.y += 0.035 + bands.overallEnergy * 0.025;
      }
      
      // Floating oscillation in 3D space
      const floatY = Math.sin(elapsedTime * 1.2) * 0.25 + bands.kick * 0.15;
      const floatX = Math.cos(elapsedTime * 0.8) * 0.2;
      vinylArtifact.group.position.set(floatX, floatY, 0);

      // Elastic rotation interpolation (Smooth damping)
      currentRotation.x += (targetRotation.x - currentRotation.x) * 0.08;
      currentRotation.y += (targetRotation.y - currentRotation.y) * 0.08;
      vinylArtifact.group.rotation.x = currentRotation.x + mouseParallax.y;
      vinylArtifact.group.rotation.y = currentRotation.y + mouseParallax.x;

      // Disc pulse on Kick/Bass
      const discScale = 1.0 + bands.kick * 0.08;
      vinylArtifact.discMesh.scale.set(discScale, discScale, discScale);

      // Sub-Bass Driven Chromatic Aberration Shockwave
      postMaterial.uniforms.uTime.value = elapsedTime;
      postMaterial.uniforms.uChromaticAberration.value = bands.subBass * 0.85;

      // Render Scene to Target, then render Post Quad to Screen
      renderer.setRenderTarget(renderTarget);
      renderer.render(scene, camera);

      renderer.setRenderTarget(null);
      renderer.render(postScene, postCamera);
    };

    animate();

    // ─────────────────────────────────────────────────────────────
    // 8. RESIZE LISTENER
    // ─────────────────────────────────────────────────────────────
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;

      camera.aspect = w / h;
      camera.updateProjectionMatrix();

      renderer.setSize(w, h);
      renderTarget.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    // ─────────────────────────────────────────────────────────────
    // 9. CLEANUP & VRAM DISPOSAL (AGENTS.MD COMPLIANCE)
    // ─────────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("resize", handleResize);

      // Strict resource disposal
      vinylArtifact.dispose();
      particleGeo.dispose();
      particleMaterial.dispose();
      postGeo.dispose();
      postMaterial.dispose();
      renderTarget.dispose();
      renderer.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [currentTrack, isPlaying]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100dvh",
        zIndex: 50,
        backgroundColor: "#050508",
        overflow: "hidden",
        cursor: "grab",
      }}
    >
      {/* Top Floating Glass Badge: Genre Mood Indicator */}
      <div
        style={{
          position: "absolute",
          top: "28px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 60,
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "10px 22px",
          borderRadius: "999px",
          background: "rgba(255, 255, 255, 0.06)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.6)",
          color: "#ffffff",
          fontSize: "0.84rem",
          fontWeight: 700,
          letterSpacing: "0.06em",
          pointerEvents: "none",
        }}
      >
        <span
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: "#10b981",
            boxShadow: "0 0 10px #10b981",
          }}
        />
        <span>{moodName}</span>
      </div>

      {/* Exit Button */}
      {onExit && (
        <button
          onClick={onExit}
          style={{
            position: "absolute",
            top: "28px",
            right: "28px",
            zIndex: 60,
            padding: "10px 20px",
            borderRadius: "999px",
            background: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            backdropFilter: "blur(20px)",
            color: "#ffffff",
            fontSize: "0.85rem",
            fontWeight: 700,
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
        >
          Trở Về Vault
        </button>
      )}
    </div>
  );
};
