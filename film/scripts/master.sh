#!/usr/bin/env bash
# The film's master, made so a compositor glitch can't ship (Chrome's GPU compositor occasionally draws a layer late or
# not at all in a long render, and nothing in a single render shows it):
#   1. three renders of the film: two with the music only, one narrated (the picture is the same);
#   2. the frames the three disagree on, each rendered again as a fresh still (scripts/stills.mjs): a still is rendered
#      on its own, with nothing carried over from earlier frames, so it is the frame as written;
#   3. the vote (scripts/vote-master.py): for every frame, the renders' version; where they disagree, the one closest to
#      its still; re-encoded once (x264 CRF 12, BT.709), with the finalized audio (−14 LUFS, true peak ≤ −1 dBTP);
#   4. the review package (scripts/review.py) of each cut against the edit: 9 checks.
# Run: npm run master [-- --4k]
#   → out/VSCode-Changelog-<date>-1080p60.mp4 (narrated) and -music-1080p60.mp4, or -4K.mp4
set -euo pipefail
cd "$(dirname "$0")/.."
scale=1
size=1080p60
while [ $# -gt 0 ]; do
  case "$1" in
    --4k) scale=2; size=4K ;;
    *) echo "master: unknown argument $1" >&2; exit 1 ;;
  esac
  shift
done
date=$(node -e 'console.log(require("./episode/episode.json").date)')
work="out/master/$date-$size"
rm -rf "$work"
mkdir -p "$work"
# A private temp folder: each render's bundle is a copy of public/.
export TMPDIR
TMPDIR=$(mktemp -d "${TMPDIR:-/tmp}/cf-master-XXXX")
trap 'rm -rf "$TMPDIR"' EXIT
render() {
  local file=$1 voice=$2
  # Chrome's page can crash in a long render ("Page crashed!"): a render that fails is made again, once.
  for attempt in 1 2; do
    echo "== render $(basename "$file" .mp4) (scale $scale, voice $voice, attempt $attempt)"
    if npx remotion render Film "$file" --scale="$scale" --crf=14 --audio-bitrate=320k --color-space=bt709 --pixel-format=yuv420p --concurrency=4 --log=error \
      --props="{\"voice\":$voice}"; then
      return 0
    fi
    echo "master: render $(basename "$file" .mp4) failed (attempt $attempt)" >&2
  done
  return 1
}
render "$work/a.mp4" false
render "$work/b.mp4" false
render "$work/c.mp4" true
node scripts/finalize.mjs "$work/a.mp4" "$work/audio-music.mp4"
node scripts/finalize.mjs "$work/c.mp4" "$work/audio-narrated.mp4"
vote() { uv run --python 3.12 --with numpy==2.5.4 --with pillow==13.0.0 python scripts/vote-master.py "$@"; }
frames=$(vote --disputed "$work/a.mp4" "$work/b.mp4" "$work/c.mp4")
truth=()
if [ -n "$frames" ]; then
  echo "== fresh stills of the frames the renders disagree on: $frames"
  node scripts/stills.mjs "$work/truth" "$(echo "$frames" | tr ' ' ',')" --scale="$scale" >/dev/null
  truth=(--truth "$work/truth")
fi
narrated="out/VSCode-Changelog-$date-$size.mp4"
music="out/VSCode-Changelog-$date-music-$size.mp4"
vote "$narrated" --audio "$work/audio-narrated.mp4" ${truth[@]+"${truth[@]}"} "$work/a.mp4" "$work/b.mp4" "$work/c.mp4"
vote "$music" --audio "$work/audio-music.mp4" ${truth[@]+"${truth[@]}"} "$work/a.mp4" "$work/b.mp4" "$work/c.mp4"
review() { uv run --python 3.12 --with pillow==13.0.0 --with numpy==2.5.4 python scripts/review.py "$1" | tail -3; }
review "$narrated"
review "$music"
echo "master: $narrated, $music"
