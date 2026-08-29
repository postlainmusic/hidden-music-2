# 🛡️ MANDATORY SKILL DISCIPLINE & UNIVERSAL INVARIANTS

> **HIGHEST PRECEDENCE DIRECTIVE**: This rule governs all agent actions in this workspace.

---

## 1. 📖 MANDATORY SKILL DISCOVERY & READING (ZERO IMPROVISATION)
- **Do NOT guess or improvise**: Before implementing any code, you MUST use `view_file` to read the exact `SKILL.md` file from `.agents/skills/<skill_name>/SKILL.md`.
- **Workflow sequence**:
  - UI / Layout / Aesthetics ➔ Read `.agents/skills/ui-ux-pro-max/SKILL.md` and `.agents/skills/frontend-ui-engineering/SKILL.md`.
  - Non-trivial decisions / Stress-testing ➔ Read `.agents/skills/doubt-driven-development/SKILL.md`.
  - Audio / Video / Performance ➔ Read `.agents/skills/performance-optimization/SKILL.md`.
  - Bugs / Broken states ➔ Read `.agents/skills/debugging-and-error-recovery/SKILL.md`.

---

## 2. 🏛️ UNIVERSAL SYSTEM INVARIANTS (KHUNG BẤT BIẾN TOÀN CỤC)
Every component, page, or feature MUST strictly honor these 4 invariants:

1. **Layering & Canvas Invariant**:
   - `MeshGradientBackground` Canvas and WebGL scenes MUST remain at `zIndex: 0`.
   - All page roots (`<main>`, layout containers) MUST have `background: transparent`. NEVER assign opaque solid black backgrounds that occlude background canvases.
   - Glass Panels: `zIndex: 1-10` | Floating Dock: `zIndex: 150` | Modals: `zIndex: 200+`.

2. **Mount & Lifecycle Invariant (Static-First CSS Guard)**:
   - Any element that appears or animates after $t > 0$ MUST define static inline CSS `style={{ opacity: 0, pointerEvents: "none", ... }}` alongside `initial={{ opacity: 0 }}`.
   - NEVER let the browser paint default unstyled elements at $t = 0$ before React hydration.

3. **Geometric Bounding Box Invariant**:
   - Total width of horizontal layout units MUST satisfy $W_{\text{total}} \le 85\%$ of the target viewport.
   - For Desktop: Symmetrical center-balanced coordinates ($x: -200\text{px} \leftrightarrow x: +200\text{px}$), $W_{\text{total}} \le 880\text{px}$ to prevent horizontal overflow on $900\text{px} - 1366\text{px}$ screens.

4. **Media Engine Invariant**:
   - The primary `<audio>` engine in `App.tsx` remains permanently mounted in the React DOM tree.
   - Audio state changes are dispatched via Zustand store atomic selectors.

---

## 3. 🚀 PRE-DEPLOYMENT VERIFICATION GATE
Before running auto-push:
1. `npx tsc --noEmit` ➔ 0 TypeScript errors.
2. `npm run build:web` ➔ Bundle size < 450KB.
3. Pre-flight Blast-Radius Audit ➔ Confirm canvas visibility, $t=0$ purity, and responsive bounds.
