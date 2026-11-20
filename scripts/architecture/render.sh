#!/usr/bin/env bash
#
# Render the Structurizr workspace(s) in not-for-publishing/architecture to SVG.
#
# Each *.dsl file at the top level of the source folder is treated as a
# workspace (files pulled in with !include should live in a sub-folder so they
# are not rendered on their own). Every view becomes
#   public/diagrams/architecture/<view-key>.svg
# plus a matching <view-key>-key.svg legend.
#
# Uses the official Structurizr image with its browser-based (Playwright)
# renderer, so the only local requirement is Docker.
#
# Usage: ./scripts/architecture/render.sh   (or: bun run diagrams)

set -euo pipefail

IMAGE="${STRUCTURIZR_IMAGE:-structurizr/structurizr:2026.10.26-playwright}"

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SRC="$ROOT/not-for-publishing/architecture"
OUT="$ROOT/public/diagrams/architecture"

shopt -s nullglob
workspaces=("$SRC"/*.dsl)
if [ ${#workspaces[@]} -eq 0 ]; then
  echo "No .dsl workspaces found in $SRC" >&2
  exit 1
fi

# Start clean so views that were renamed or deleted don't linger.
rm -rf "$OUT"
mkdir -p "$OUT"

for ws in "${workspaces[@]}"; do
  name="$(basename "$ws")"
  echo "Rendering $name"
  docker run --rm \
    --user "$(id -u):$(id -g)" \
    -e HOME=/tmp \
    -v "$SRC:/workspace:ro" \
    -v "$OUT:/output" \
    "$IMAGE" \
    export -workspace "/workspace/$name" -format svg -output /output
done

# Docker can create files as 0600; make sure the Pages artifact can read them.
chmod 644 "$OUT"/*.svg

# The exported root <svg> has a fixed pixel width/height in its style
# attribute, which stops it scaling down when shown via <img>. Drop those
# (the width/height attributes and viewBox still give the aspect ratio).
for f in "$OUT"/*.svg; do
  sed -E -i.bak '1s/(<svg[^>]*style="[^"]*)width: *[0-9.]+px; *height: *[0-9.]+px; */\1/' "$f"
  rm -f "$f.bak"
done

echo "Wrote $(ls "$OUT" | wc -l | tr -d ' ') SVG(s) to ${OUT#"$ROOT/"}"
