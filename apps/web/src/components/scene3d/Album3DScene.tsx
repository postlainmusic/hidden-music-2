import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { useAudioStore } from "../../store/audioStore";
import { studioBeatEngine } from "../../audio/StudioBeatEngine";
import {
  GenreParticleVertexShader,
  GenreParticleFragmentShader,
} from "./shaders/GenreParticleShaders";

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

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, isMobile ? 10.5 : 8.5);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true, // Transparent canvas so ambient mesh shows through seamlessly
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    container.appendChild(renderer.domElement);

    // ─────────────────────────────────────────────────────────────
    // 2. DYNAMIC 3D NEBULA BACKGROUND PLANE
    // ─────────────────────────────────────────────────────────────
    const bgGeo = new THREE.PlaneGeometry(30, 20);
    const bgMat = new THREE.ShaderMaterial({
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
        uniform int uMoodTier;
        varying vec2 vUv;

        void main() {
          vec2 uv = vUv - vec2(0.5);
          float dist = length(uv);

          vec3 colA = vec3(0.04, 0.05, 0.12);
          vec3 colB = vec3(0.12, 0.08, 0.22);
          vec3 colC = vec3(0.02, 0.02, 0.04);

          if (uMoodTier == 0) {
            // Chill / Poetic: Indigo & Soft Lavender Mist
            colA = vec3(0.08, 0.10, 0.24);
            colB = vec3(0.18, 0.12, 0.32);
          } else if (uMoodTier == 1) {
            // Cosmic / Ambient: Deep Sapphire & Emerald Nebula
            colA = vec3(0.05, 0.15, 0.28);
            colB = vec3(0.06, 0.22, 0.18);
          } else {
            // Trap / Cyber: Laser Violet & Obsidian Shockwave
            colA = vec3(0.18, 0.05, 0.30);
            colB = vec3(0.08, 0.18, 0.32);
          }

          float wave = sin(uv.x * 3.0 + uTime * 0.4) * cos(uv.y * 2.5 + uTime * 0.3);
          vec3 mixed = mix(colA, colB, wave * 0.5 + 0.5);
          mixed = mix(mixed, colC, smoothstep(0.1, 0.85, dist));

          // Audio Kick pulse in center
          mixed += colA * (uKick * 0.35 + uSubBass * 0.25) * smoothstep(0.6, 0.0, dist);

          gl_FragColor = vec4(mixed, 0.88);
        }
      `,
      uniforms: {
        uTime: { value: 0 },
        uKick: { value: 0 },
        uSubBass: { value: 0 },
        uMoodTier: { value: getMoodTier(currentTrack?.genre, currentTrack?.title) },
      },
      depthWrite: false,
    });

    const bgMesh = new THREE.Mesh(bgGeo, bgMat);
    bgMesh.position.set(0, 0, -5.0);
    scene.add(bgMesh);

    // ─────────────────────────────────────────────────────────────
    // 3. GENRE-DRIVEN AUDIO REACTIVE PARTICLE SYSTEM (15,000 PARTICLES)
    // ─────────────────────────────────────────────────────────────
    const particleCount = isMobile ? 6000 : 15000;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);
    const randomVecs = new Float32Array(particleCount * 3);
    const phases = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const radius = 1.0 + Math.pow(Math.random(), 1.25) * 15.0;
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
        uUpperBass: { value: 0 },
        uVocalMid: { value: 0 },
        uHighTreble: { value: 0 },
        uSubImpact: { value: 0 },
        uKickImpact: { value: 0 },
        uBassImpact: { value: 0 },
        uKickRoll: { value: 0 },
        uDownbeatPulse: { value: 0 },
        uSnareFlash: { value: 0 },
        uBeatProgress: { value: 0 },
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
    const ringGeo = new THREE.RingGeometry(2.0, 4.8, 64);
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
        uniform float uDownbeat;
        uniform vec3 uColor;
        varying vec2 vUv;

        void main() {
          vec2 centered = vUv - vec2(0.5);
          float dist = length(centered) * 2.0;
          float ring = smoothstep(0.35, 0.65, dist) * smoothstep(1.0, 0.70, dist);
          float pulse = (0.35 + uKick * 0.95 + uSubBass * 0.6 + uDownbeat * 0.8);
          float alpha = ring * pulse * 0.75;
          gl_FragColor = vec4(uColor + vec3(uKick * 0.4 + uDownbeat * 0.5), alpha);
        }
      `,
      uniforms: {
        uTime: { value: 0 },
        uKick: { value: 0 },
        uSubBass: { value: 0 },
        uDownbeat: { value: 0 },
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
    // 5. 60FPS RENDER LOOP (REAL-TIME AUDIO SPECTRUM UPDATES)
    // ─────────────────────────────────────────────────────────────
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();
      const beatState = studioBeatEngine.update();
      const moodTier = getMoodTier(currentTrack?.genre, currentTrack?.title);

      // Background Nebula Shader Update (Reacts deeply to 808 Sub-Bass)
      bgMat.uniforms.uTime.value = elapsedTime;
      bgMat.uniforms.uKick.value = beatState.kickImpact;
      bgMat.uniforms.uSubBass.value = beatState.subImpact;
      bgMat.uniforms.uMoodTier.value = moodTier;

      // Particle Shader Uniforms Update (Distinct Channels)
      particleMaterial.uniforms.uTime.value = elapsedTime;
      particleMaterial.uniforms.uSubBass.value = beatState.subBass;
      particleMaterial.uniforms.uKick.value = beatState.kick;
      particleMaterial.uniforms.uUpperBass.value = beatState.upperBass;
      particleMaterial.uniforms.uVocalMid.value = beatState.vocalMid;
      particleMaterial.uniforms.uHighTreble.value = beatState.highTreble;
      particleMaterial.uniforms.uSubImpact.value = beatState.subImpact;
      particleMaterial.uniforms.uKickImpact.value = beatState.kickImpact;
      particleMaterial.uniforms.uBassImpact.value = beatState.subImpact;
      particleMaterial.uniforms.uKickRoll.value = beatState.kickRollIntensity;
      particleMaterial.uniforms.uDownbeatPulse.value = beatState.downbeatPulse;
      particleMaterial.uniforms.uSnareFlash.value = beatState.snareImpact || beatState.snareStrobe;
      particleMaterial.uniforms.uBeatProgress.value = beatState.beatProgress;
      particleMaterial.uniforms.uMoodTier.value = moodTier;

      // Aura Shockwave Ring Update
      ringMat.uniforms.uTime.value = elapsedTime;
      ringMat.uniforms.uKick.value = beatState.kickImpact;
      ringMat.uniforms.uSubBass.value = beatState.subImpact;
      ringMat.uniforms.uDownbeat.value = beatState.downbeatPulse;
      const ringScale = 1.0 + beatState.kickImpact * 0.55 + beatState.subImpact * 0.35 + beatState.downbeatPulse * 0.30;
      auraRing.scale.set(ringScale, ringScale, 1.0);
      auraRing.rotation.z += 0.008;

      renderer.render(scene, camera);
    };

    animate();

    // ─────────────────────────────────────────────────────────────
    // 6. RESIZE LISTENER
    // ─────────────────────────────────────────────────────────────
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;

      camera.aspect = w / h;
      camera.position.z = w < 768 ? 10.5 : 8.5;
      camera.updateProjectionMatrix();

      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    // ─────────────────────────────────────────────────────────────
    // 7. CLEANUP & VRAM DISPOSAL (AGENTS.MD COMPLIANCE)
    // ─────────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);

      bgGeo.dispose();
      bgMat.dispose();
      particleGeo.dispose();
      particleMaterial.dispose();
      ringGeo.dispose();
      ringMat.dispose();
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
        overflow: "hidden",
        pointerEvents: "none",
      }}
    />
  );
};
