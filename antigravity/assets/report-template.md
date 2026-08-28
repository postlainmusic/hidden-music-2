# Architectural & Performance Audit Report

**Project:** Hybrid 2D React + 3D WebGL ("Half-in-Half")  
**Target Route / Scene:** `{{route_or_scene_name}}`  
**Date of Audit:** `{{audit_date}}`  
**Auditor / Agent:** `{{auditor_name}}`  

---

## 1. Executive Summary

- **Architecture Compliance:** `[ PASS | NEEDS ATTENTION | FAIL ]`
- **Asset Budget Compliance:** `[ PASS | FAIL ]`
- **Memory Disposal Verification:** `[ PASS | FAIL ]`

> [!NOTE]
> Brief description of the audited route, 2D/3D components, and visual/audio experience.

---

## 2. 3D Asset Budget Checklist (< 2MB Target)

| Asset File | Format | Draco Compressed? | File Size | Status (<2MB) | Pre-baked Lighting? |
| :--- | :---: | :---: | :---: | :---: | :---: |
| `{{asset_1_path}}` | `.glb` | `[Yes/No]` | `{{size_mb}} MB` | `[OK / OVER_BUDGET]` | `[Yes/No]` |
| `{{asset_2_path}}` | `.glb` | `[Yes/No]` | `{{size_mb}} MB` | `[OK / OVER_BUDGET]` | `[Yes/No]` |

---

## 3. Render Loop & Performance Metrics

| Metric | Target | Actual Measurement | Result |
| :--- | :---: | :---: | :---: |
| **Render Loop Mode** | On-Demand (`frameloop="demand"`) | `{{render_mode}}` | `[PASS / FAIL]` |
| **Average FPS (Desktop)** | >= 60 FPS | `{{avg_fps_desktop}}` | `[PASS / FAIL]` |
| **Draw Calls per Frame** | < 50 | `{{draw_calls}}` | `[PASS / WARN]` |
| **Triangle / Poly Count** | < 100,000 | `{{tri_count}}` | `[PASS / WARN]` |
| **DPR Clamping Range** | `[1, 2]` | `{{dpr_setting}}` | `[PASS / FAIL]` |

---

## 4. Lifecycle & Memory Leak Verification

- [ ] **Scene Traversal Disposal:** All geometries, materials, and textures are explicitly disposed on route unmount.
- [ ] **GSAP Teardown:** All GSAP timelines, ScrollTrigger instances, and tickers are `.kill()`ed upon exit.
- [ ] **WebGL Context Count:** Verifying that navigating back and forth across routes does not increment context allocations or trigger `CONTEXT_LOST`.
- [ ] **2D Fallback Pipeline:** Graceful degradation verified on low-power devices / disabled WebGL environments.

---

## 5. Action Items & Recommendations

1. `{{action_item_1}}`
2. `{{action_item_2}}`
