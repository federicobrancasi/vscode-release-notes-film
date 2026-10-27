# Master by vote: builds a film's master from three (or more) independent renders of the same code, frame by frame,
# keeping for every frame a version that at least two renders agree on. Chrome's GPU compositor occasionally draws a
# layer late or not at all in a long render, and a glitch can repeat in two renders on the same frame, so a majority
# isn't proof: with `--truth DIR`, every frame the renders disagree on is settled against a fresh still of that frame
# (DIR/<anything>-NNNN.png, from scripts/stills.mjs at the render's scale). A still is rendered on its
# own, with nothing carried over from earlier frames, so it is the frame as written. The render closest to it is kept.
# The frames are compared and passed through as decoded YUV (no RGB round trip, so the colour is exactly the render's)
# and re-encoded once at the build's quality (x264 CRF 12, BT.709 tags); the audio is copied from `--audio` (the
# finalized master), untouched.
# Run: uv run --python 3.12 --with numpy --with pillow python scripts/vote-master.py OUT.mp4 --audio MASTER.mp4 [--truth DIR] A.mp4 B.mp4 C.mp4
#      … vote-master.py --disputed A.mp4 B.mp4 C.mp4   (only lists the frames the renders disagree on, to render stills of)
# scripts/master.sh (npm run master) runs the whole procedure.
import json
import re
import subprocess
import sys
from pathlib import Path

import numpy as np

BLOCK, LIMIT = 120, 3.0  # mean |Δ| on luma per 120 px block

args = sys.argv[1:]
disputed = "--disputed" in args
if disputed:
    args.remove("--disputed")
    out, audio, truth_dir, renders = None, None, None, args
    if len(renders) < 2:
        sys.exit("give at least two renders")
else:
    out = args[0]
    audio = args[args.index("--audio") + 1]
    truth_dir = args[args.index("--truth") + 1] if "--truth" in args else None
    renders = [a for i, a in enumerate(args[1:], 1) if a not in ("--audio", "--truth") and args[i - 1] not in ("--audio", "--truth")]
    if len(renders) < 3 and not truth_dir:
        sys.exit("give at least three renders (or two and --truth)")
truth = {}
if truth_dir:
    for f in Path(truth_dir).glob("*.png"):
        m = re.search(r"(\d+)\.png$", f.name)
        if m:
            truth[int(m.group(1))] = f

probe = json.loads(subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height,r_frame_rate,nb_frames", "-of", "json", renders[0]], capture_output=True, check=True).stdout)["streams"][0]
W, H, RATE = probe["width"], probe["height"], probe["r_frame_rate"]
SIZE = W * H * 3 // 2
decoders = [subprocess.Popen(["ffmpeg", "-v", "error", "-i", r, "-f", "rawvideo", "-pix_fmt", "yuv420p", "-"], stdout=subprocess.PIPE) for r in renders]
encoder = None if disputed else subprocess.Popen(
    ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "yuv420p", "-s", f"{W}x{H}", "-r", RATE,
     "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-color_range", "tv", "-i", "-", "-i", audio, "-map", "0:v", "-map", "1:a", "-map_metadata", "1",
     "-c:v", "libx264", "-preset", "slow", "-crf", "12", "-pix_fmt", "yuv420p", "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-color_range", "tv",
     # the same BT.709 tags as the renders, written into the stream itself as well as the container
     "-bsf:v", "h264_metadata=colour_primaries=1:transfer_characteristics=1:matrix_coefficients=1:video_full_range_flag=0",
     "-c:a", "copy", "-movflags", "+faststart", out],
    stdin=subprocess.PIPE,
)


def luma(buf: bytes) -> np.ndarray:
    y = np.frombuffer(buf, np.uint8, count=W * H).reshape(H, W)
    h, w = (H // BLOCK) * BLOCK, (W // BLOCK) * BLOCK
    return y[:h, :w].astype(np.float32)


def agree(a: np.ndarray, b: np.ndarray) -> bool:
    h, w = a.shape
    return float(np.abs(a - b).reshape(h // BLOCK, BLOCK, w // BLOCK, BLOCK).mean(axis=(1, 3)).max()) <= LIMIT


def still_luma(path: Path) -> np.ndarray:
    """A still's luma as the encoder makes it from RGB: BT.709, limited range."""
    from PIL import Image

    rgb = np.asarray(Image.open(path).convert("RGB"), dtype=np.float32)
    y = 16 + 219 * (0.2126 * rgb[..., 0] + 0.7152 * rgb[..., 1] + 0.0722 * rgb[..., 2]) / 255
    h, w = (H // BLOCK) * BLOCK, (W // BLOCK) * BLOCK
    return y[:h, :w]


def worst(a: np.ndarray, b: np.ndarray) -> float:
    h, w = a.shape
    return float(np.abs(a - b).reshape(h // BLOCK, BLOCK, w // BLOCK, BLOCK).mean(axis=(1, 3)).max())


n, split, unresolved, settled = 0, [], [], []
while True:
    bufs = [d.stdout.read(SIZE) for d in decoders]
    if any(len(b) < SIZE for b in bufs):
        break
    ys = [luma(b) for b in bufs]
    everyone = all(agree(ys[0], y) for y in ys[1:])
    pick = 0
    if not everyone:
        split.append(n)
        if n in truth:
            t = still_luma(truth[n])
            d = [worst(y, t) for y in ys]
            pick = int(np.argmin(d))
            settled.append((n, "ABCDEFGH"[pick], round(d[pick], 1)))
            if d[pick] > 4 * LIMIT:
                unresolved.append(n)
        else:
            pick = -1
            for i in range(len(bufs)):
                if any(agree(ys[i], ys[j]) for j in range(len(bufs)) if j != i):
                    pick = i
                    break
            if pick < 0:
                unresolved.append(n)
                pick = 0
    if encoder:
        encoder.stdin.write(bufs[pick])
    n += 1
for d in decoders:
    d.wait()
if disputed:
    print(" ".join(map(str, split)))
    sys.exit(0)
encoder.stdin.close()
encoder.wait()
print(f"{out}: {n} frames; the renders disagreed on {len(split)}" + (f": {split[:40]}" if split else ""))
if settled:
    print("  settled against fresh stills (frame, render kept, its worst block vs the still): " + ", ".join(f"{a} {b} {c}" for a, b, c in settled))
print(f"  {len(unresolved)} unresolved" + (f": {unresolved[:20]}" if unresolved else ""))
sys.exit(1 if unresolved or encoder.returncode else 0)
