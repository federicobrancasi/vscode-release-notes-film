# Review sheets from stills: one PNG per sheet, its title on top, its stills two per row at half size, each with its
# label under it. Input: a JSON {sheets: [{out, title, tiles: [{file, label}]}]} (scripts/review.mjs writes it).
import json
import sys
import textwrap

from PIL import Image, ImageDraw, ImageFont

TW, TH, LABEL, GAP, HEAD = 960, 540, 54, 10, 56


def font(size):
    for name in ("/System/Library/Fonts/SFNS.ttf", "/System/Library/Fonts/Helvetica.ttc", "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"):
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            continue
    return ImageFont.load_default(size=size)


spec = json.load(open(sys.argv[1]))
f_title, f_label = font(24), font(17)
for sheet in spec["sheets"]:
    tiles = sheet["tiles"]
    rows = (len(tiles) + 1) // 2
    W = 2 * TW + 3 * GAP
    H = HEAD + rows * (TH + LABEL + GAP) + GAP
    img = Image.new("RGB", (W, H), (22, 23, 26))
    d = ImageDraw.Draw(img)
    d.text((GAP + 4, 14), sheet["title"][:170], fill=(255, 255, 255), font=f_title)
    for i, t in enumerate(tiles):
        x = GAP + (i % 2) * (TW + GAP)
        y = HEAD + (i // 2) * (TH + LABEL + GAP)
        im = Image.open(t["file"]).convert("RGB").resize((TW, TH), Image.LANCZOS)
        img.paste(im, (x, y))
        for j, line in enumerate(textwrap.wrap(t["label"], 104)[:2]):
            d.text((x + 4, y + TH + 6 + j * 22), line, fill=(255, 214, 10) if j == 0 else (220, 220, 220), font=f_label)
    img.save(sheet["out"])
    print(sheet["out"])
