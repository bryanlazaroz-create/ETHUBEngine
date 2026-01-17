#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APK_PATH="${1:-$ROOT_DIR/android/app/build/outputs/apk/debug/app-debug.apk}"
LICENSE_PATH="$ROOT_DIR/../LICENSE"
OUT_DIR="$ROOT_DIR/dist"
ZIP_PATH="$OUT_DIR/PrimateProtocol-android12.zip"

if [ ! -f "$APK_PATH" ]; then
  echo "APK not found at $APK_PATH"
  echo "Build it first, then re-run:"
  echo "  npm run android:sync"
  echo "  (cd android && ./gradlew assembleDebug)"
  exit 1
fi

if [ ! -f "$LICENSE_PATH" ]; then
  echo "LICENSE not found at $LICENSE_PATH"
  exit 1
fi

mkdir -p "$OUT_DIR"
zip -j "$ZIP_PATH" "$APK_PATH" "$LICENSE_PATH"
echo "Wrote $ZIP_PATH"
