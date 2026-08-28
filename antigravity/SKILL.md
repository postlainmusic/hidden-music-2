---
name: hybrid-webgl-react-architect
description: >-
  Use this skill when designing, developing, or optimizing the hybrid 2D React + 3D WebGL
  music experience ("Half-in-Half" architecture). Enforces route segregation, React Three Fiber (R3F)
  on-demand rendering, GSAP camera transitions, Draco 3D asset budgets (<2MB), and memory disposal lifecycles.
---

# Hybrid WebGL + 2D React Architecture Runbook

This skill enforces the **"Half-in-Half"** progressive architecture separating utility-driven interfaces from immersive 3D environments.

---

## 1. Route Segregation & Tech Stack Matrix

```
                      ┌───────────────────────────────────────────────┐
                      │            Application Root Router            │
                      └───────────────────────┬───────────────────────┘
                                              │
                    ┌─────────────────────────┴─────────────────────────┐
                    ▼                                                   ▼
       ┌─────────────────────────────┐                    ┌─────────────────────────────┐
       │   Core / Auth / Home Routes │                    │  Album / Immersive Routes   │
       ├─────────────────────────────┤                    ├─────────────────────────────┤
       │ • Framework: React (SPA/SSR)│                    │ • Pure 3D Canvas (R3F/Drei) │
       │ • Motion: CSS & light GSAP  │                    │ • GSAP ScrollTrigger/Camera │
       │ • Canvas: Low-overhead      │                    │ • UI: 3D CSS accelerated    │
       │   ambient particle overlay  │                    │ • On-Demand Render Loop     │
       └─────────────────────────────┘                    └─────────────────────────────┘
```

---

## 2. Core Implementation Rules

### A. 3D Canvas & Render Loop Management
- **Demand-Based Rendering:** Always configure `<Canvas frameloop="demand">` on static or ambient views. Trigger `invalidate()` only during audio playback, camera pans, user interaction, or GSAP timeline updates.
- **DPR Clamping:** Restrict device pixel ratio to `dpr={[1, 2]}` to prevent GPU thermal throttling on high-DPI displays.

### B. Memory Lifecycle & Explicit Resource Cleanup
Every 3D route component **MUST** implement explicit cleanup on unmount:
1. Traverse scene graph and call `.dispose()` on all geometries, materials, and textures.
2. Terminate active GSAP ScrollTrigger instances and Ticker listeners.
3. Release WebGL contexts cleanly to avoid `CONTEXT_LOST` errors on route transitions.

### C. 3D Asset Budget & Constraints
- **File Format:** Binary GLTF (`.glb`) compressed with Draco.
- **Budget:** Strict maximum of **2MB per scene asset**.
- **Lighting:** Pre-baked ambient occlusion and shadow maps over costly real-time multi-light calculations.

### D. Graceful Degradation & Device Tiering
- Benchmark client GPU using `detect-gpu` or WebGL capability checks.
- On low-tier devices / mobile battery saver: Fall back to 2D CSS-only layout with static artwork overlays.

---

## 3. Standard Workflows

1. **Verify Asset Compliance:**
   Run the asset auditor script:
   ```bash
   python antigravity/scripts/process_data.py --assets-dir ./public/models
   ```
2. **Review Implementation Standards:**
   Consult [api-guide.md](file:///c:/Users/Admin/Documents/github/hidden-music-2/antigravity/references/api-guide.md) for code templates (R3F Canvas, GSAP Camera Rig, Cleanup hooks).
3. **Run Pre-Commit / Build Validation:**
   Execute [validate.sh](file:///c:/Users/Admin/Documents/github/hidden-music-2/antigravity/scripts/validate.sh) to verify bundle budgets and asset constraints.
4. **Generate Architectural Audit:**
   Fill out [report-template.md](file:///c:/Users/Admin/Documents/github/hidden-music-2/antigravity/assets/report-template.md) upon completing a scene or route.
