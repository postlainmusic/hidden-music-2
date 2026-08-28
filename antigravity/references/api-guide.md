# Technical Reference: Hybrid 2D React + 3D WebGL (R3F & GSAP)

This guide contains production-ready code patterns for implementing the "Half-in-Half" hybrid architecture.

---

## 1. Optimized R3F Canvas Setup (Demand-Driven)

```tsx
import React, { useRef, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { AdaptiveDpr, Preload } from "@react-three/drei";
import * as THREE from "three";

interface SceneCanvasProps {
  isInteracting?: boolean;
  children: React.ReactNode;
}

export const ImmersiveCanvas: React.FC<SceneCanvasProps> = ({ isInteracting, children }) => {
  return (
    <div className="canvas-container" style={{ width: "100%", height: "100%", position: "absolute" }}>
      <Canvas
        frameloop={isInteracting ? "always" : "demand"}
        dpr={[1, 1.75]} // Clamped DPR to balance fidelity and performance
        gl={{
          antialias: true,
          powerPreference: "high-performance",
          alpha: true,
          stencil: false,
          depth: true
        }}
        camera={{ position: [0, 0, 5], fov: 45 }}
      >
        <AdaptiveDpr pixelated />
        <Preload all />
        {children}
      </Canvas>
    </div>
  );
};
```

---

## 2. GSAP Camera & Spatial Motion Controller

```tsx
import { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export const SpatialCameraRig = () => {
  const { camera, invalidate } = useThree();
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    // Sync GSAP timeline with camera motion
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: "#experience-scroll-container",
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
        onUpdate: () => {
          // Manually trigger frame rendering during scrub
          invalidate();
        }
      }
    });

    tl.to(camera.position, { x: 2, y: 1, z: 3, ease: "power2.inOut" })
      .to(camera.rotation, { y: Math.PI / 4, ease: "power2.inOut" }, "<");

    timelineRef.current = tl;

    return () => {
      // Clean up GSAP instances
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [camera, invalidate]);

  return null;
};
```

---

## 3. Draco GLTF Asset Loading & Texture Optimization

```tsx
import { useGLTF } from "@react-three/drei";
import { GLTF } from "three-stdlib";

// Configure Draco decoder path (bundled in public/draco)
useGLTF.setDecoderPath("/draco/");

export const AlbumModel: React.FC<{ url: string }> = ({ url }) => {
  const { scene } = useGLTF(url, true); // true enables Draco compression

  return <primitive object={scene} />;
};

// Preload assets for seamless route transitions
export const preloadAlbumScene = (url: string) => {
  useGLTF.preload(url, true);
};
```

---

## 4. Memory Lifecycle Management & Scene Disposal

```tsx
import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

export const useSceneDispose = () => {
  const { scene, gl } = useThree();

  useEffect(() => {
    return () => {
      // Recursive disposal of all geometries, materials, and textures
      scene.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;

        if (object.geometry) {
          object.geometry.dispose();
        }

        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach((mat) => disposeMaterial(mat));
          } else {
            disposeMaterial(object.material);
          }
        }
      });

      // Clear render cache
      gl.renderLists.dispose();
    };
  }, [scene, gl]);
};

function disposeMaterial(material: THREE.Material) {
  material.dispose();
  for (const key of Object.keys(material)) {
    const value = (material as any)[key];
    if (value && typeof value === "object" && "minFilter" in value) {
      // Dispose Three.js texture
      (value as THREE.Texture).dispose();
    }
  }
}
```

---

## 5. Graceful Degradation & GPU Tier Detection

```tsx
import React, { useState, useEffect } from "react";

export const useDeviceTier = () => {
  const [isLowTier, setIsLowTier] = useState(false);

  useEffect(() => {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

    if (!gl) {
      setIsLowTier(true);
      return;
    }

    const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : "";

    // Check for low-power mobile or software renderers
    const isWeakGPU = /SwiftShader|llvmpipe|Mali-400|Adreno 3/i.test(renderer);
    const isMobileDevice = /Mobi|Android|iPhone/i.test(navigator.userAgent);

    setIsLowTier(isWeakGPU || (isMobileDevice && window.devicePixelRatio < 2));
  }, []);

  return { isLowTier };
};
```
