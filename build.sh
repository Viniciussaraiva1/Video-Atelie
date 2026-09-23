#!/usr/bin/env bash
# Rebuilds output/atelie-digital-como-funciona.mp4 from source.
#   needs: node + playwright (chromium), python3 (numpy, scipy), ffmpeg
set -euo pipefail
cd "$(dirname "$0")"
FFMPEG="${FFMPEG:-ffmpeg}"
FPS="${FPS:-60}"
WORKERS="${WORKERS:-4}"
mkdir -p build output

echo "▸ rendering frames (${FPS} fps, ${WORKERS} workers)"
FFMPEG="$FFMPEG" node render/render.js --out build --fps "$FPS" --workers "$WORKERS"

echo "▸ composing score + sound design"
python3 music/compose.py build/cues.json build

echo "▸ joining segments and mastering audio (-14 LUFS, -1.5 dBTP)"
"$FFMPEG" -y -loglevel error -f concat -safe 0 -i build/segments.txt -c copy build/video.mp4
"$FFMPEG" -y -loglevel error -i build/video.mp4 -i build/mix.wav \
  -map 0:v -map 1:a -c:v copy \
  -af "loudnorm=I=-14:TP=-1.5:LRA=7" -ar 48000 -c:a aac -b:a 320k \
  -shortest -movflags +faststart output/atelie-digital-como-funciona.mp4
echo "✓ output/atelie-digital-como-funciona.mp4"
