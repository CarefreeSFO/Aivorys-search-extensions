#!/usr/bin/env bash
#
# generate-icons.sh
# ==================
# Converts the Aivorys Search SVG icons into PNGs required by browser
# extensions, then copies them into the Firefox and Firefox-Android
# icon directories.
#
# Prerequisites (install ONE of the following):
#   - rsvg-convert  (librsvg2-bin)     -- lightweight, recommended
#   - Inkscape      (inkscape)         -- full vector editor
#   - ImageMagick   (imagemagick)      -- general-purpose converter
#
# Usage:
#   chmod +x scripts/generate-icons.sh
#   ./scripts/generate-icons.sh              # auto-detect converter
#   ./scripts/generate-icons.sh --tool rsvg  # force a specific tool
#   ./scripts/generate-icons.sh --tool inkscape
#   ./scripts/generate-icons.sh --tool magick

set -euo pipefail

# ---------- paths ----------------------------------------------------------
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CHROME_ICONS="$REPO_ROOT/extensions/chrome/icons"
FIREFOX_ICONS="$REPO_ROOT/extensions/firefox/icons"
FIREFOX_ANDROID_ICONS="$REPO_ROOT/extensions/firefox-android/icons"
SIZES=(16 32 48 128)

# ---------- argument parsing -----------------------------------------------
FORCE_TOOL=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --tool) FORCE_TOOL="$2"; shift 2 ;;
    -h|--help)
      echo "Usage: $0 [--tool rsvg|inkscape|magick]"
      exit 0
      ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
done

# ---------- tool detection -------------------------------------------------
detect_tool() {
  if [[ -n "$FORCE_TOOL" ]]; then
    echo "$FORCE_TOOL"
    return
  fi
  if command -v rsvg-convert &>/dev/null; then
    echo "rsvg"
  elif command -v inkscape &>/dev/null; then
    echo "inkscape"
  elif command -v magick &>/dev/null || command -v convert &>/dev/null; then
    echo "magick"
  else
    echo ""
  fi
}

TOOL="$(detect_tool)"

if [[ -z "$TOOL" ]]; then
  cat <<'INSTALL_HELP'
ERROR: No supported SVG-to-PNG converter found.

Install one of the following:

  Debian / Ubuntu:
    sudo apt-get install librsvg2-bin      # provides rsvg-convert (recommended)
    sudo apt-get install inkscape          # full Inkscape
    sudo apt-get install imagemagick       # provides convert / magick

  macOS (Homebrew):
    brew install librsvg
    brew install inkscape
    brew install imagemagick

  Fedora / RHEL:
    sudo dnf install librsvg2-tools
    sudo dnf install inkscape
    sudo dnf install ImageMagick

Then re-run this script.
INSTALL_HELP
  exit 1
fi

echo "Using converter: $TOOL"

# ---------- conversion functions -------------------------------------------
convert_rsvg() {
  local svg="$1" png="$2" size="$3"
  rsvg-convert -w "$size" -h "$size" "$svg" -o "$png"
}

convert_inkscape() {
  local svg="$1" png="$2" size="$3"
  # Inkscape >= 1.0 CLI syntax
  inkscape "$svg" --export-type=png --export-filename="$png" \
           --export-width="$size" --export-height="$size" 2>/dev/null
}

convert_magick() {
  local svg="$1" png="$2" size="$3"
  local cmd="convert"
  command -v magick &>/dev/null && cmd="magick"
  $cmd -background none -density 300 -resize "${size}x${size}" "$svg" "$png"
}

# ---------- step 1: generate PNGs from SVGs --------------------------------
echo ""
echo "==> Converting SVGs to PNGs in $CHROME_ICONS ..."
for size in "${SIZES[@]}"; do
  svg="$CHROME_ICONS/icon-${size}.svg"
  png="$CHROME_ICONS/icon-${size}.png"

  if [[ ! -f "$svg" ]]; then
    echo "  SKIP  icon-${size}.svg (not found)"
    continue
  fi

  echo -n "  icon-${size}.svg -> icon-${size}.png ... "
  "convert_${TOOL}" "$svg" "$png" "$size"
  echo "done"
done

# ---------- step 2: copy icons to Firefox directories ----------------------
echo ""
echo "==> Copying icons to Firefox extension directory ..."
mkdir -p "$FIREFOX_ICONS"
for size in "${SIZES[@]}"; do
  for ext in svg png; do
    src="$CHROME_ICONS/icon-${size}.${ext}"
    if [[ -f "$src" ]]; then
      cp "$src" "$FIREFOX_ICONS/"
      echo "  copied icon-${size}.${ext}"
    fi
  done
done

echo ""
echo "==> Copying icons to Firefox-Android extension directory ..."
mkdir -p "$FIREFOX_ANDROID_ICONS"
for size in "${SIZES[@]}"; do
  for ext in svg png; do
    src="$CHROME_ICONS/icon-${size}.${ext}"
    if [[ -f "$src" ]]; then
      cp "$src" "$FIREFOX_ANDROID_ICONS/"
      echo "  copied icon-${size}.${ext}"
    fi
  done
done

# ---------- done -----------------------------------------------------------
echo ""
echo "All done. Icon files:"
echo ""
for dir in "$CHROME_ICONS" "$FIREFOX_ICONS" "$FIREFOX_ANDROID_ICONS"; do
  echo "  $dir/"
  ls -1 "$dir"/icon-*.{svg,png} 2>/dev/null | while read -r f; do
    echo "    $(basename "$f")"
  done
done
echo ""
