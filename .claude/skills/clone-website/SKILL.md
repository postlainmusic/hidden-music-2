---
name: clone-website
description: Reverse-engineers, inspects, and faithfully reproduces web layouts, animations, design tokens, and components from reference URLs.
---

# 🌐 Website Cloner & Reverse-Engineering Skill

## 🎯 Purpose
Use this skill when you need to:
1. Inspect live reference websites (DOM structure, design tokens, typography, layout grids).
2. Extract CSS colors, font families, keyframe animations, and asset URLs.
3. Recreate faithful, high-fidelity components matching the reference aesthetics.

## 🛠️ Execution Protocol

### Step 1: Layout & Asset Extraction
- Fetch the target HTML / CSS and parse font families, color palettes, spacing rhythm, and layout structure.
- Identify core UI components (Navbar, Hero, Grid Cards, Visualizer, Floating Dock, Footer).

### Step 2: Design Token Harmonization
- Map extracted colors to semantic design tokens:
  - Background: Deep Dark Canvas (`#000000` / `#050505` / `#090a0f`)
  - Accent / Primary: Dynamic theme gradients (Indigo, Violet, Cyan, Rose)
  - Surface: Liquid Frosted Glass (`rgba(255, 255, 255, 0.05)` with `backdrop-filter: blur(24px)`)
  - Border: Specular edges (`rgba(255, 255, 255, 0.12)`)

### Step 3: High-Fidelity Implementation
- Implement using modern React 19 + TypeScript + Tailwind CSS / Vanilla CSS.
- Add micro-animations, hover states, and smooth spring physics using Framer Motion.
- Ensure 100% mobile responsiveness (375px, 768px, 1024px, 1440px).

### Step 4: Verification & QA
- Visually verify rendered layout, check console for zero hydration mismatches, and validate audio/video streaming.
