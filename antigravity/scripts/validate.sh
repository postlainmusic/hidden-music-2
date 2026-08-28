#!/usr/bin/env bash
# Validation Script for Hybrid Web Application (2D React + 3D WebGL)

set -e

echo "========================================================"
echo " Starting Hybrid WebGL Architecture & Budget Validation "
echo "========================================================"

# 1. Check 3D Asset Sizes
if [ -d "./public/models" ]; then
  echo "--> Checking 3D asset budgets in ./public/models..."
  python antigravity/scripts/process_data.py --assets-dir ./public/models
else
  echo "--> ./public/models directory not found (skipping asset audit)."
fi

# 2. Check for continuous frameloop anti-patterns in source code
if [ -d "./src" ]; then
  echo "--> Auditing R3F Canvas frameloop configs in ./src..."
  if grep -rn "frameloop=\"always\"" ./src; then
    echo "⚠️ Warning: Found static scenes with frameloop='always'. Prefer frameloop='demand'."
  else
    echo "✓ Frameloop configuration passed."
  fi

  # 3. Check for dispose hooks
  echo "--> Verifying scene unmount cleanup patterns..."
  if grep -rn "useSceneDispose" ./src || grep -rn "dispose()" ./src; then
    echo "✓ Resource disposal routines detected."
  else
    echo "⚠️ Warning: No explicit dispose() routines detected in 3D scene files."
  fi
fi

echo "========================================================"
echo " Validation complete! "
echo "========================================================"
