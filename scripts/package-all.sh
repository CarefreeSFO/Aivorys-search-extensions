#!/bin/bash
# Aivorys Search Extensions - Build & Package Script
# Usage: ./scripts/package-all.sh

set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DIST="$ROOT/dist"

echo "=== Aivorys Search Extensions - Packaging ==="
echo ""

# Clean dist
rm -rf "$DIST"
mkdir -p "$DIST"

# ---------- Chrome / Brave / Edge (Manifest V3) ----------
echo "[1/4] Packaging Chrome extension..."
CHROME_DIR="$ROOT/extensions/chrome"

# Verify icons exist (warn if not)
if [ ! -f "$CHROME_DIR/icons/icon-128.png" ]; then
  echo "  WARNING: PNG icons not found in $CHROME_DIR/icons/"
  echo "  Run ./scripts/generate-icons.sh first, or add PNG icons manually."
  echo "  Packaging will continue but the extension won't load without icons."
fi

cd "$CHROME_DIR"
zip -r "$DIST/aivorys-search-chrome-v1.0.0.zip" . \
  -x "*.DS_Store" -x "__MACOSX/*" -x "*.git*"
echo "  -> dist/aivorys-search-chrome-v1.0.0.zip"

# Chrome zip also works for Brave and Edge
cp "$DIST/aivorys-search-chrome-v1.0.0.zip" "$DIST/aivorys-search-brave-v1.0.0.zip"
cp "$DIST/aivorys-search-chrome-v1.0.0.zip" "$DIST/aivorys-search-edge-v1.0.0.zip"
echo "  -> Copied for Brave and Edge"

# ---------- Firefox Desktop (Manifest V2) ----------
echo "[2/4] Packaging Firefox extension..."
FIREFOX_DIR="$ROOT/extensions/firefox"

cd "$FIREFOX_DIR"
zip -r "$DIST/aivorys-search-firefox-v1.0.0.xpi" . \
  -x "*.DS_Store" -x "__MACOSX/*" -x "*.git*"
echo "  -> dist/aivorys-search-firefox-v1.0.0.xpi"

# ---------- Firefox Android (Manifest V2) ----------
echo "[3/4] Packaging Firefox Android extension..."
ANDROID_DIR="$ROOT/extensions/firefox-android"

cd "$ANDROID_DIR"
zip -r "$DIST/aivorys-search-firefox-android-v1.0.0.xpi" . \
  -x "*.DS_Store" -x "__MACOSX/*" -x "*.git*"
echo "  -> dist/aivorys-search-firefox-android-v1.0.0.xpi"

# ---------- PWA ----------
echo "[4/4] Packaging PWA..."
PWA_DIR="$ROOT/pwa"

cd "$PWA_DIR"
zip -r "$DIST/aivorys-search-pwa-v1.0.0.zip" . \
  -x "*.DS_Store" -x "__MACOSX/*" -x "*.git*"
echo "  -> dist/aivorys-search-pwa-v1.0.0.zip"

echo ""
echo "=== Build complete! ==="
echo ""
echo "Output files in $DIST/:"
ls -lh "$DIST/"
echo ""
echo "Next steps:"
echo "  Chrome Web Store : Upload aivorys-search-chrome-v1.0.0.zip"
echo "  Firefox AMO      : Upload aivorys-search-firefox-v1.0.0.xpi"
echo "  Firefox Android  : Upload aivorys-search-firefox-android-v1.0.0.xpi"
echo "  Edge Add-ons     : Upload aivorys-search-edge-v1.0.0.zip"
echo "  Brave             : Uses Chrome Web Store listing"
echo "  PWA              : Deploy pwa/ directory to search.aivorysdev.com"
