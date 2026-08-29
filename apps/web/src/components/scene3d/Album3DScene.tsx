import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { useAudioStore } from "../../store/audioStore";
import { audioAnalyserEngine } from "../../audio/AudioAnalyserEngine";
import {
  GenreParticleVertexShader,
  GenreParticleFragmentShader,
} from "./shaders/GenreParticleShaders";
import {
  GrainHalationVertexShader,
  GrainHalationFragmentShader,
} from "./shaders/GrainHalationShaders";

export const Album3DScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { currentTrack, isPlaying } = useAudioStore();

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
    const container = containerRef.current;
    if (!container) return;

    // ─────────────────────────────────────────────────────────────
    // 1. THREE.JS ENGINE SETUP
    // ─────────────────────────────────────────────────────────────
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    const isMobile = width < 768;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#050508");

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, isMobile ? 11.0 : 8.5);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
      stencil: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    container.appendChild(renderer.domElement);

    // ─────────────────────────────────────────────────────────────
    // 2. STUDIO LIGHTING RIG
    // ─────────────────────────────────────────────────────────────
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 3.0);
    keyLight.position.set(5, 8, 6);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x8b5cf6, 4.5);
    rimLight.position.set(-6, -4, -4);
    scene.add(rimLight);

    // ─────────────────────────────────────────────────────────────
    // 3. GENRE-DRIVEN AUDIO REACTIVE PARTICLE SYSTEM (15,000 PARTICLES)
    // ─────────────────────────────────────────────────────────────
    const particleCount = isMobile ? 9000 : 15000;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);
    const randomVecs = new Float32Array(particleCount * 3);
    const phases = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const radius = 1.0 + Math.pow(Math.random(), 1.3) * 16.0;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      scales[i] = Math.random() * 1.8 + 0.9;
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
    // 4. CENTRAL GLOWING AUDIO-REACTIVE SHOCKWAVE AURA RING
    // ─────────────────────────────────────────────────────────────
    const ringGeo = new THREE.RingGeometry(2.2, 4.6, 64);
    const ringMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uKick;
        uniform float uSubBass;
        uniform vec3 uColor;
        varying vec2 vUv;

        void main() {
          vec2 centered = vUv - vec2(0.5);
          float dist = length(centered) * 2.0;
          float ring = smoothstep(0.4, 0.7, dist) * smoothstep(1.0, 0.75, dist);
          float pulse = (0.2 + uKick * 0.8 + uSubBass * 0.5);
          float alpha = ring * pulse * 0.65;
          gl_FragColor = vec4(uColor + vec3(uKick * 0.3), alpha);
        }
      `,
      uniforms: {
        uTime: { value: 0 },
        uKick: { value: 0 },
        uSubBass: { value: 0 },
        uColor: { value: new THREE.Color(currentTrack?.palette?.primary || "#6366f1") }
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    });

    const auraRing = new THREE.Mesh(ringGeo, ringMat);
    auraRing.position.set(0, 0, -1.0);
    scene.add(auraRing);

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
        uGrainIntensity: { value: 0.05 },
        uHalationIntensity: { value: 0.55 },
        uChromaticAberration: { value: 0.0 },
        uVignetteIntensity: { value: 0.8 },
      },
      depthWrite: false,
      depthTest: false,
    });

    const postQuad = new THREE.Mesh(postGeo, postMaterial);
    postScene.add(postQuad);

    // ─────────────────────────────────────────────────────────────
    // 6. 60FPS RENDER LOOP WITH REAL-TIME AUDIO BAND REACTIVITY
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

      // Update Aura Ring
      ringMat.uniforms.uTime.value = elapsedTime;
      ringMat.uniforms.uKick.value = bands.kick;
      ringMat.uniforms.uSubBass.value = bands.subBass;
      const ringScale = 1.0 + bands.kick * 0.25 + Math.sin(elapsedTime * 2.0) * 0.05;
      auraRing.scale.set(ringScale, ringScale, 1.0);
      auraRing.rotation.z += 0.005;

      // Sub-Bass Driven Chromatic Aberration Shockwave
      postMaterial.uniforms.uTime.value = elapsedTime;
      postMaterial.uniforms.uChromaticAberration.value = bands.subBass * 0.75;

      // Render Scene to Target, then render Post Quad to Screen
      renderer.setRenderTarget(renderTarget);
      renderer.render(scene, camera);

      renderer.setRenderTarget(null);
      renderer.render(postScene, postCamera);
    };

    animate();

    // ─────────────────────────────────────────────────────────────
    // 7. RESIZE LISTENER
    // ─────────────────────────────────────────────────────────────
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;

      camera.aspect = w / h;
      camera.position.z = w < 768 ? 11.0 : 8.5;
      camera.updateProjectionMatrix();

      renderer.setSize(w, h);
      renderTarget.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    // ─────────────────────────────────────────────────────────────
    // 8. CLEANUP & VRAM DISPOSAL
    // ─────────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);

      particleGeo.dispose();
      particleMaterial.dispose();
      ringGeo.dispose();
      ringMat.dispose();
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
        zIndex: 0,
        backgroundColor: "#050508",
        overflow: "hidden",
        pointerEvents: "none",
      }}
    />
  );
};
