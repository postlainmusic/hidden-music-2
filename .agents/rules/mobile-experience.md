# 📱 MOBILE EXPERIENCE CONSTITUTION & RESPONSIVE DIRECTIVE

> **MANDATORY**: All frontend agents, designers, and developers working on `hidden-music-2` must strictly follow these rules to ensure an uncompromised, Awwwards-grade luxury experience on mobile devices (iOS Safari, Android Chrome, and mobile webviews).

---

## 1. 📐 VIEWPORT & GEOMETRY STANDARDS

- **Dynamic Viewport Height (`100dvh`)**: Never use hardcoded `100vh` on mobile components, as browser navigation chrome (URL bar, bottom toolbar) expands and contracts dynamically. Always use `100dvh` or `calc(var(--vh, 1vh) * 100)` with a fallback to prevent layout snapping and bottom clipping.
- **Zero Horizontal Overflow**: The root container and all child cards must strictly enforce `overflow-x: hidden; max-width: 100vw;`. Any component creating horizontal scroll jitter or accidental horizontal panning is strictly prohibited.
- **Hardware Safe-Area Insets**: All fixed headers, floating docks, and modal footers must incorporate CSS `env(safe-area-inset-*)`:
  ```css
  padding-top: max(16px, env(safe-area-inset-top));
  padding-bottom: max(16px, env(safe-area-inset-bottom));
  padding-left: max(16px, env(safe-area-inset-left));
  padding-right: max(16px, env(safe-area-inset-right));
  ```

---

## 2. 👆 TOUCH INTERACTION & GESTURE PHYSICS

- **Touch Target Threshold**: Every interactive element (buttons, tabs, track cards, icons) must have a minimum tap hit area of **$44 \times 44\text{px}$** ($48\text{dp}$ on Android).
- **Smooth Vertical Section Snapping**: Vertical section switches (Sections 1, 2, 3) must respond to intentional touch gestures with a velocity threshold ($\Delta Y > 35\text{px}$) and spring physics (`transition: { ease: [0.16, 1, 0.3, 1], duration: 0.65 }`).
- **No Tap Highlight Artifacts**: Eliminate default browser touch rectangles:
  ```css
  -webkit-tap-highlight-color: transparent;
  user-select: none;
  -webkit-user-select: none;
  ```
- **Haptic & Visual Feedback**: Provide subtle scale feedback on tap (`whileTap={{ scale: 0.96 }}`) within 80ms–120ms without shifting bounding geometry.

---

## 3. 🎨 VISUAL DESIGN & CHOREOGRAPHY ON MOBILE

- **Monochrome Fluid Aurora**: Maintain high-contrast deep black (`#000000`) and pearlescent specular highlights (`rgba(255, 255, 255, 0.15)`). Avoid heavy, unoptimized blur filters on lower-end mobile GPUs; clamp `backdrop-filter: blur(16px)` to `blur(24px)`.
- **Choreographed Section 1**:
  - Top: Album artwork scaled to fit vertical viewports ($160\text{px} - 200\text{px}$ square, rounded $24\text{px}$).
  - Bottom: 5 Best-Play tracks with staggered cascading animations ($0.08\text{s}$ delay increment), single-line truncated text, duration, and favorite heart buttons.
- **Choreographed Section 2**: 3D Cover Flow with direct touch-drag swipe elastic physics and synchronized indicator dots.
- **Choreographed Section 3**: Prominent "CHUYỂN QUA EXPLORE" button with subtle white glow breathing animation.

---

## 4. 🎵 MOBILE AUDIO DOCK & FULL-SCREEN NOW PLAYING

- **Two-Tier Architecture**:
  1. **Mini Floating Glass Capsule ($56\text{px}$)**: Fixed at bottom with safe-area spacing, rotating mini disc cover, track title, quick Play/Pause button, and live mini soundwave visualizer.
  2. **Full-Screen Now Playing Overlay**: Slides up seamlessly from bottom when the Mini Capsule is tapped. Contains full-size vinyl artwork, scrubber bar, volume controls, lossless badge, and swipe-down dismissal.
- **DOM Persistence**: The `<audio>` engine remains centrally mounted in `App.tsx` and synchronized across all views without unmounting or pausing during modal transitions.
