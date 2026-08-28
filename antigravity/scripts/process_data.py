#!/usr/bin/env python3
"""
3D Asset & Performance Budget Processor
Analyzes .glb / .gltf assets for the Hybrid WebGL architecture.
Enforces the <2MB file size budget and inspects Draco compression markers.
"""

import os
import sys
import json
import argparse
from pathlib import Path

MAX_BUDGET_BYTES = 2 * 1024 * 1024  # 2MB

def analyze_glb(file_path: Path):
    stat = file_path.stat()
    file_size_bytes = stat.st_size
    file_size_mb = file_size_bytes / (1024 * 1024)
    within_budget = file_size_bytes <= MAX_BUDGET_BYTES

    has_draco = False
    try:
        with open(file_path, "rb") as f:
            header = f.read(1024)
            # Check for Draco extension marker in GLTF binary chunk
            if b"KHR_draco_mesh_compression" in header or b"draco" in header.lower():
                has_draco = True
    except Exception as e:
        print(f"Warning reading {file_path}: {e}", file=sys.stderr)

    return {
        "file_name": file_path.name,
        "rel_path": str(file_path),
        "size_bytes": file_size_bytes,
        "size_mb": round(file_size_mb, 2),
        "within_budget": within_budget,
        "has_draco": has_draco,
        "status": "PASS" if (within_budget and has_draco) else "WARN" if within_budget else "FAIL"
    }

def main():
    parser = argparse.ArgumentParser(description="Analyze 3D assets against budget")
    parser.add_argument("--assets-dir", default="./public/models", help="Directory containing 3D assets")
    parser.add_argument("--json", action="store_true", help="Output results as JSON")
    args = parser.parse_args()

    assets_path = Path(args.assets_dir)
    if not assets_path.exists():
        print(f"Notice: Directory '{args.assets_dir}' does not exist yet. No models to inspect.")
        return

    glb_files = list(assets_path.glob("**/*.glb")) + list(assets_path.glob("**/*.gltf"))
    results = [analyze_glb(p) for p in glb_files]

    if args.json:
        print(json.dumps(results, indent=2))
    else:
        print("=== 3D Asset Budget Audit ===")
        print(f"Target Budget: < 2.00 MB | Total Assets: {len(results)}\n")
        for r in results:
            draco_tag = "✓ Draco" if r["has_draco"] else "✗ No Draco"
            status_tag = f"[{r['status']}]"
            print(f"{status_tag:8} {r['file_name']:<30} {r['size_mb']:>6.2f} MB  ({draco_tag})")

if __name__ == "__main__":
    main()
