# 🏛️ PROJECT CONSTITUTION & AI OPERATING DIRECTIVES

> **MANDATORY**: All agents and assistants operating in this repository must strictly adhere to the following 4-tier foundation rules across architecture, visual design, 3D rendering, audio streaming, and skill discipline.

---

## 1. ⚙️ ARCHITECTURAL STANDARDS & SYSTEM INVARIANTS

### Universal Invariants (Bất Biến Hệ Thống)
- **Layering & Canvas Invariant**: Background Canvas (`MeshGradientBackground` / WebGL) MUST remain at `zIndex: 0`. All pages and main containers MUST have `background: transparent`.
- **Static-First CSS Invariant**: All elements appearing after $t > 0$ MUST declare static inline CSS `style={{ opacity: 0, pointerEvents: "none" }}` to eliminate initial hydration flash (FOUC).
- **Geometric Bounding Invariant**: Horizontal layouts MUST be center-balanced with $W_{\text{total}} \le 85\%$ viewport width ($W \le 880\text{px}$ on desktop) to prevent horizontal overflow on $900\text{px}-1366\text{px}$ screens.
- **Apple-Grade Minimalism & Zero-Tech-Clutter Invariant**: Tuyệt đối KHÔNG tự ý chèn các đoạn text dư thừa, nhãn công nghệ/hạ tầng (ví dụ: "D1 Database", "R2 Storage", "Engine", các chuỗi debug/code-like) vào UI người dùng. Mọi giao diện phải giữ chuẩn tối giản sang trọng, sạch sẽ, tập trung 100% vào nghệ thuật và âm nhạc.

### Next.js 16 & React 19 Engineering
- **Strict Component Boundaries**: Explicitly declare `'use client'` at the top of interactive components. Keep leaf nodes client-side to minimize bundle size.
- **Zero Hydration Mismatches**: Never render client-only timestamps, random values, or `window`/`localStorage` state during initial SSR. Use `useEffect` or dedicated mounted guards.
- **Hook Cleanup Guarantees**: Every `useEffect` subscribing to event listeners, intervals, AnimationFrames, or Audio Contexts MUST return a cleanup function to prevent memory leaks.
- **State Synchronization**: Centralize global media and auth state inside Zustand stores with atomic selectors.

### Three.js & React Three Fiber (R3F) Lifecycle & Memory Management
- **Strict Resource Disposal**: Any created Three.js resource MUST be explicitly disposed when components unmount:
  ```ts
  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
      if (texture) texture.dispose();
    };
  }, []);
  ```
- **60fps Frame Budgeting**: Zero object instantiation (`new THREE.Vector3()`, `new THREE.Color()`) inside `useFrame` or render loops. Pre-allocate scratch vectors and reuse references.
- **No Primitive Toy Geometry**: Avoid basic untextured spheres/cubes for organic concepts. Use procedural noise shaders, GLTF/GLB models, custom instanced meshes, and studio-grade lighting (Three.js ACESFilmicToneMapping + PMREM).

### Tailwind CSS v4 & Apple Liquid Glass Design
- **OKLCH Color Spaces**: Use high-gamut OKLCH and semantic HSL tokens for smooth gradients and dark-mode depth.
- **Dark Mode First**: Base backgrounds default to `#000000`, `#050505`, and `#090a0f` with deep purple/indigo ambient glows (`rgba(99, 102, 241, 0.15)`).
- **Frosted Glass Tokens**: Layer `backdrop-filter: blur(24px)`, subtle borders (`rgba(255, 255, 255, 0.08)`), and inner specular highlights.

---

## 2. 🎵 AUDIO STREAMING & CLOUDFLARE R2 INFRASTRUCTURE

- **Lossless FLAC Streaming**: Audio files are 30MB–90MB Lossless FLAC stored in Cloudflare R2 bucket `hidden-music-vault`.
- **Native Byte-Range Requests**: All streaming endpoints must strictly honor HTTP `Range: bytes=start-end` and return `206 Partial Content`.
- **Edge Caching Policy**: Cache headers must be `Cache-Control: public, max-age=31536000, s-maxage=31536000, immutable` with `Accept-Ranges: bytes`.
- **DOM-Mounted Media Engine**: The primary `<audio>` player must remain mounted in the React DOM tree to prevent browser background throttling and ensure precise `timeupdate` synchronization.
- **Next-Track Pre-buffering**: Silently pre-buffer the upcoming track in the playlist using `<audio preload="auto" />` for 0ms transitions.

---

## 3. 🛡️ MANDATORY SKILL DISCIPLINE (ZERO IMPROVISATION)

- **Mandatory Skill Reading**: Before writing any code, the agent MUST explicitly call `view_file` on the corresponding `SKILL.md` file from `.agents/skills/`.
  - UI/UX ➔ `.agents/skills/ui-ux-pro-max/SKILL.md` + `frontend-ui-engineering/SKILL.md`
  - Non-trivial decisions ➔ `.agents/skills/doubt-driven-development/SKILL.md`
  - Audio/Performance ➔ `.agents/skills/performance-optimization/SKILL.md`
  - Debugging ➔ `.agents/skills/debugging-and-error-recovery/SKILL.md`
- **Follow SOP Checklists**: Skills are workflows, not suggestions. Execute the checklists step-by-step.

---

## 4. 🤖 AGENT ORCHESTRATION & AUTO-PUSH POLICY

- **Mandatory Root Evaluation**: Every agent turn MUST first read [PROJECT_MANAGER.md](file:///c:/Users/Admin/Documents/GitHub/hidden-music-2/PROJECT_MANAGER.md) and [AGENTS.md](file:///c:/Users/Admin/Documents/GitHub/hidden-music-2/AGENTS.md) at repository root.
- **Autonomous Delivery (Auto-Push)**:
  1. Build Web: `npm run build:web`
  2. Deploy Pages: `npx wrangler pages deploy apps/web/dist --project-name=hidden-music-web`
  3. Deploy Worker API: `cd apps/api; npx wrangler deploy` (when API changes)
  4. Git Sync: `git add . && git commit -m "..." && git push origin main`
