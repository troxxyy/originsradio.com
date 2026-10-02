#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
source_video="$repo_root/assets/video/home-background-original.mp4"
output_dir="$repo_root/public/media/home"
media_version="${1:-v1}"

if [[ ! "$media_version" =~ ^v[0-9]+$ ]]; then
  echo 'Pass a media version such as v2.' >&2
  exit 1
fi

# Choose a new version when publishing changed content; these files are cached.
mkdir -p "$output_dir"
ffmpeg -hide_banner -loglevel error -i "$source_video" -map 0:v:0 -an \
  -vf 'scale=1280:720:flags=lanczos,fps=20,setsar=1' \
  -c:v libx264 -preset slow -crf 30 -maxrate 550k -bufsize 1100k \
  -pix_fmt yuv420p -movflags +faststart \
  "$output_dir/background-desktop-$media_version.mp4"
ffmpeg -hide_banner -loglevel error -i "$source_video" -map 0:v:0 -an \
  -vf 'scale=854:480:flags=lanczos,fps=20,setsar=1' \
  -c:v libx264 -preset slow -crf 30 -maxrate 320k -bufsize 640k \
  -pix_fmt yuv420p -movflags +faststart \
  "$output_dir/background-mobile-$media_version.mp4"
ffmpeg -hide_banner -loglevel error -ss 0 -i "$source_video" -frames:v 1 \
  -vf 'scale=1280:720:flags=lanczos' -q:v 4 -update 1 \
  "$output_dir/poster-$media_version.jpg"
