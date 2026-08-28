---
name: project-manager
description: Master Project Manager & Chief AI Orchestrator. Always activate first to analyze user intent, break down requirements, and coordinate all workspace tools, sub-agents, and domain skills (Graphify, UI/UX Pro Max, Performance Optimization, TDD, DevOps) to deliver verified, auto-deployed solutions.
---

# 🏛️ Master Project Manager & Chief AI Orchestrator

## 🎯 Purpose & Core Responsibility
This skill acts as the **Central Command & Control Unit** for the entire codebase. Whenever a prompt is received, this skill is read first to:
1. **Deconstruct User Intent**: Accurately classify the task type (Architecture, Streaming/Performance, UI/UX, Bug Fix, DevOps, Security).
2. **Skill & Tool Dispatch**: Automatically select and orchestrate the best matching skills, CLI utilities, and sub-agents.
3. **Execution Loop**: Enforce systematic execution (Analyze ➔ Plan ➔ Implement ➔ Verify ➔ Deploy ➔ Auto-Push).

---

## 🧭 Multi-Skill Dispatch Matrix

| Task Domain | Primary Skills Dispatched | Actions & Tools |
| :--- | :--- | :--- |
| **Codebase & Architecture** | `graphify`, `architecture`, `api-and-interface-design` | Query `graph.json`, navigate callflows, avoid redundant file reads. |
| **UI/UX & Visual Design** | `ui-ux-pro-max`, `frontend-ui-engineering`, `ui-styling`, `design-system` | Apply Liquid Glass, Apple HIG, responsive breakpoints, BM25 palettes, zero-clipping typography. |
| **Audio/Video & Streaming Performance** | `performance-optimization`, `observability-and-instrumentation` | Optimize TTFB, HTTP 206 Byte-Range, edge caching (`immutable`), native pre-buffering. |
| **Systematic Bug Diagnostics** | `debugging-and-error-recovery`, `doubt-driven-development` | Root-cause analysis, reproducible isolation, eliminate regressions before patching. |
| **Code Quality & Verification** | `code-review-and-quality`, `test-driven-development` | Multi-axis adversarial review, TypeScript validation, build integrity. |
| **Deployment & Git Sync** | `shipping-and-launch`, `git-workflow-and-versioning` | Automated `npm run build:web`, Cloudflare Pages/Worker deployment, git commit & push. |

---

## ⚡ Standard Operating Protocol (SOP)

### Step 1: Deep Intent Analysis & Root Cause Identification
- Do NOT make assumptions on vague symptoms.
- Inspect network headers, runtime state, and relevant graph nodes.
- Cross-reference with existing architecture in `graphify-out/graph.json`.

### Step 2: Optimal Skill Selection
- If UI is requested ➔ Load `ui-ux-pro-max` guidance for styling and accessibility.
- If audio latency is reported ➔ Load `performance-optimization` to verify CDN cache headers, browser decoder state, and Range requests.
- If an architectural change is needed ➔ Load `spec-driven-development` and update implementation plan.

### Step 3: Atomic Implementation
- Make focused, high-precision code modifications.
- Preserve backward compatibility and existing working functionality.

### Step 4: Verification & Autonomous Deployment (Auto-Push Policy)
- Run TypeScript build check: `npm run build:web`.
- Deploy to Cloudflare infrastructure: `npx wrangler pages deploy apps/web/dist --project-name=hidden-music-web` (and `npx wrangler deploy` for API).
- Stage, commit with conventional commit message, and push to GitHub `main` branch.
- Summarize results clearly with actionable user feedback.
