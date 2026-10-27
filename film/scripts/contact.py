# A contact sheet of a rendered film: one frame per moment (scripts/moments.mjs picks them; deliver passes them), four
# across, each labelled. Usage: contact.py <video> <moments.json> <out.png> [title]
import json
import subprocess
import sys

from PIL import Image, ImageDraw, ImageFont

TW, TH, LABEL, GAP, HEAD, COLS = 480, 270, 30, 8, 48, 4


def font(size):
    for name in ("/System/Library/Fonts/SFNS.ttf", "/System/Library/Fonts/Helvetica.ttc", "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"):
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            continue
    return ImageFont.load_default(size=size)


video, spec, out = sys.argv[1:4]
title = sys.argv[4] if len(sys.argv) > 4 else ""
tiles = json.load(open(spec))
fps = 60
rows = (len(tiles) + COLS - 1) // COLS
img = Image.new("RGB", (COLS * (TW + GAP) + GAP, HEAD + rows * (TH + LABEL + GAP) + GAP), (18, 19, 22))
d = ImageDraw.Draw(img)
d.text((GAP + 2, 12), title, fill=(255, 255, 255), font=font(22))
f = font(15)
for i, t in enumerate(tiles):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{t['frame'] / fps:.4f}", "-i", video, "-frames:v", "1", "-vf", f"scale={TW}:{TH}:flags=lanczos", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], capture_output=True, check=True).stdout
    x = GAP + (i % COLS) * (TW + GAP)
    y = HEAD + (i // COLS) * (TH + LABEL + GAP)
    img.paste(Image.frombytes("RGB", (TW, TH), raw), (x, y))
    d.text((x + 2, y + TH + 6), t["label"][:62], fill=(230, 230, 230), font=f)
img.save(out)
print(out)
