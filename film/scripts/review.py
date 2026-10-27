# The review package for a rendered film: what a reviewer needs to judge it without scrubbing through it.
#   scenes.png        one row per scene: its first frame, a quarter, the middle, three quarters, its last frame
#   cuts.png          the two frames before and after every cut (flashes, holes, a cut that misses the beat's frame)
#   strips/<scene>.png the first second of each scene, every 4th frame (is the entrance a snap and a settle, or mush?)
#   audio.png         the soundtrack's spectrogram and loudness, with the cuts (red) and the detected hits (yellow)
#   safe-zones.png    vertical films: the middle of each scene with the platforms' own UI zones shaded
#   report.md         specs and the delivery checks (PASS/FAIL), the scene list, and what this can't check
# The scenes come from the edit (episode/timeline.json, or --timeline FILE), so the cuts, the frame count and the fps
# can be checked; --scenes FILE takes a scene list ({fps, scenes: [{id, name, from, to}]}); --timeline none detects the
# cuts (ffmpeg scdet), which misses match cuts and dissolves, and leaves the frame count and fps unchecked.
# Run: uv run --python 3.12 --with pillow --with numpy python scripts/review.py out/film.mp4 [--timeline F|none]
#      [--scenes F] [--out DIR]
import json
import math
import re
import subprocess
import sys
import tempfile
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
# Platform UI zones on a 1080×1920 frame (a vertical cut).
SAFE_9x16 = {"top": 250, "right": 150, "bottom": 430, "left": 72}


VALUE_FLAGS = {"--timeline", "--scenes", "--out"}


def arg_after(flag, default=None):
    return sys.argv[sys.argv.index(flag) + 1] if flag in sys.argv else default


def positionals():
    """The arguments that aren't flags or their values (the video can come first or last: npm appends it)."""
    args, out, i = sys.argv[1:], [], 0
    while i < len(args):
        if args[i] in VALUE_FLAGS:
            i += 2
            continue
        if not args[i].startswith("--"):
            out.append(args[i])
        i += 1
    return out


def run(args):
    return subprocess.run(args, capture_output=True, text=True)


def font(size):
    try:
        return ImageFont.load_default(size=size)
    except TypeError:  # Pillow < 10.1
        return ImageFont.load_default()


def label(img, text, size=16):
    d = ImageDraw.Draw(img)
    f = font(size)
    w = int(d.textlength(text, font=f)) + 12
    d.rectangle((0, 0, w, size + 8), fill=(0, 0, 0))
    d.text((6, 3), text, fill=(255, 220, 0), font=f)
    return img


def probe(path):
    out = json.loads(run(["ffprobe", "-v", "error", "-show_streams", "-show_format", "-of", "json", str(path)]).stdout)
    v = next((s for s in out["streams"] if s["codec_type"] == "video"), None)
    a = next((s for s in out["streams"] if s["codec_type"] == "audio"), None)
    num, den = (int(x) for x in v["r_frame_rate"].split("/"))
    count = run(["ffprobe", "-v", "error", "-count_packets", "-select_streams", "v:0", "-show_entries", "stream=nb_read_packets", "-of", "csv=p=0", str(path)]).stdout.strip()
    return {
        "w": v["width"], "h": v["height"], "fps": num / den, "frames": int(count or v.get("nb_frames", 0)),
        "codec": f"{v['codec_name']} {v.get('profile', '')}".strip(), "pix_fmt": v.get("pix_fmt"),
        "colour": "/".join(str(v.get(k, "?")) for k in ("color_space", "color_primaries", "color_transfer")),
        "duration": float(out["format"]["duration"]),
        "audio": None if a is None else {"codec": a["codec_name"], "rate": a.get("sample_rate"), "channels": a.get("channels"), "duration": float(a.get("duration", out["format"]["duration"]))},
    }


def loudness(path):
    err = run(["ffmpeg", "-hide_banner", "-nostats", "-i", str(path), "-vn", "-af", "ebur128=peak=true", "-f", "null", "-"]).stderr
    summary = err[err.rfind("Summary:"):]

    def grab(key):
        i = summary.find(key)
        return float(summary[i + len(key):].split()[0]) if i >= 0 else None

    return {"I": grab("I:"), "LRA": grab("LRA:"), "TP": grab("Peak:")}


def grab_frames(path, nums, tw, th):
    """Decode the video once and return {frame number: PIL image at tw × th}, for every frame asked for.

    The frames are streamed and picked here: a select expression with a term per frame breaks on a long film (ffmpeg
    rejects it, and every sheet comes out blank). Exits if any frame is missing, rather than reviewing blank tiles.
    """
    want = set(n for n in nums if n >= 0)
    if not want:
        return {}
    last, size, got = max(want), tw * th * 3, {}
    with tempfile.TemporaryFile() as err:
        proc = subprocess.Popen(["ffmpeg", "-v", "error", "-i", str(path), "-vf", f"scale={tw}:{th}:flags=area", "-fps_mode", "passthrough",
                                 "-frames:v", str(last + 1), "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE, stderr=err)
        n = 0
        while n <= last:
            buf = proc.stdout.read(size)
            if len(buf) < size:
                break
            if n in want:
                got[n] = Image.frombytes("RGB", (tw, th), buf)
            n += 1
        proc.stdout.close()
        proc.wait()
        err.seek(0)
        msg = err.read().decode(errors="replace").strip()
    missing = sorted(want - got.keys())
    if missing:
        sys.exit(f"review: decoded {len(got)} of {len(want)} sampled frames of {Path(path).name} (first missing: {missing[:5]}). {msg[:400]}")
    return got


def black_edges(im):
    """The sides of a frame with a pure-black band next to a lit picture: a plate panned or zoomed past its edge."""
    a = np.asarray(im.convert("L"), dtype=np.int16)
    found = []
    for side, lines in (("left", a.T), ("right", a.T[::-1]), ("top", a), ("bottom", a[::-1])):
        dark = np.percentile(lines, 99, axis=1) <= 10  # each line (a column or a row) black, grain and all
        run = len(dark) if dark.all() else int(np.argmin(dark))
        if 2 <= run < len(dark) // 4 and lines[run:run + 8].mean() > 25:
            found.append(side)
    return found


def detect_cuts(path, fps):
    err = run(["ffmpeg", "-hide_banner", "-nostats", "-i", str(path), "-vf", "scdet=threshold=12,metadata=print:file=-", "-an", "-f", "null", "-"])
    times = [float(m) for m in re.findall(r"lavfi\.scd\.time[=:]\s*([0-9.]+)", err.stdout + err.stderr)]
    return sorted(set(round(t * fps) for t in times))


def scenes_from(video, timeline, scenes_file, fps, frames):
    """(scenes, edit): the scenes in frames, and the edit they came from ({fps, source}), or None if detected."""
    if scenes_file:
        data = json.loads(Path(scenes_file).read_text())
        rate = data["fps"][0] / data["fps"][1] if isinstance(data["fps"], list) else data["fps"]
        if "scenes" in data:
            out = [{"id": s["id"], "name": s.get("name", s["id"]), "from": int(s["from"]), "to": int(s["to"])} for s in data["scenes"]]
        else:  # a template's timing.json: every shot runs from one cut to the frame before the next
            bounds = [0] + list(data["cuts"]) + [data["total"]]
            out = [{"id": f"s{i + 1:02d}", "name": f"shot {i + 1}", "from": a, "to": b} for i, (a, b) in enumerate(zip(bounds, bounds[1:]))]
        return out, {"fps": rate, "source": Path(scenes_file).name}
    if timeline and timeline.exists():
        tl = json.loads(timeline.read_text())
        beat = 60 / tl["bpm"] * tl["fps"]
        # Cuts rounded half up from the running beat count, exactly like src/timeline.ts (Python's round() is banker's).
        frame_at = lambda b: math.floor(b * beat + 0.5)  # noqa: E731
        out, b = [], 0.0
        for s in tl["scenes"]:
            out.append({"id": s["id"], "name": s.get("name", s["id"]), "from": frame_at(b), "to": frame_at(b + s["beats"])})
            b += s["beats"]
        return out, {"fps": tl["fps"], "source": timeline.name}
    cuts = [0] + [c for c in detect_cuts(video, fps) if 0 < c < frames] + [frames]
    return [{"id": f"s{i + 1:02d}", "name": f"shot {i + 1}", "from": a, "to": b} for i, (a, b) in enumerate(zip(cuts, cuts[1:])) if b > a], None


def sheet(rows, tw, th, gap=6):
    cols = max(len(r) for r in rows)
    img = Image.new("RGB", (cols * (tw + gap) + gap, len(rows) * (th + gap) + gap), (24, 24, 24))
    for y, row in enumerate(rows):
        for x, (im, text) in enumerate(row):
            if im is not None:
                img.paste(label(im.copy(), text), (gap + x * (tw + gap), gap + y * (th + gap)))
    return img


def spectrogram(path, scenes, fps, duration, out_png):
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-vn", "-ac", "1", "-ar", "16000", "-f", "s16le", "-"], capture_output=True).stdout
    y = np.frombuffer(pcm, dtype=np.int16).astype(np.float32) / 32768
    if len(y) < 2048:
        return []
    n, hop = 1024, 256
    win = np.hanning(n).astype(np.float32)
    frames = np.lib.stride_tricks.sliding_window_view(y, n)[::hop] * win
    mag = np.abs(np.fft.rfft(frames, axis=1)).T  # freq × time
    db = 20 * np.log10(mag + 1e-6)
    # Onsets: positive spectral flux, peaks above mean + 1.5 sd, at least 80 ms apart.
    flux = np.maximum(0, np.diff(mag, axis=1)).sum(axis=0)
    thr = flux.mean() + 1.5 * flux.std()
    onsets, last = [], -1e9
    for i in range(1, len(flux) - 1):
        t = (i + 1) * hop / 16000
        if flux[i] > thr and flux[i] >= flux[i - 1] and flux[i] >= flux[i + 1] and t - last > 0.08:
            onsets.append(t)
            last = t
    # Image: log-frequency spectrogram on top, loudness (RMS dB) below.
    W, H, LH = 1600, 300, 90
    rows = np.unique(np.logspace(np.log10(2), np.log10(db.shape[0] - 1), H).astype(int))[::-1]
    spec = db[rows]
    lo, hi = np.percentile(spec, 5), np.percentile(spec, 99.5)
    norm = np.clip((spec - lo) / (hi - lo + 1e-9), 0, 1)
    rgb = (np.stack([norm ** 0.8, norm ** 1.6, norm ** 3.0 * 0.6 + norm * 0.2], axis=-1) * 255).astype(np.uint8)
    img = Image.fromarray(rgb).resize((W, H))
    canvas = Image.new("RGB", (W, H + LH + 30), (16, 16, 16))
    canvas.paste(img, (0, 0))
    d = ImageDraw.Draw(canvas)
    rms = np.sqrt((frames ** 2).mean(axis=1))
    lvl = 20 * np.log10(rms + 1e-6)
    xs = np.linspace(0, W - 1, len(lvl))
    pts = [(x, H + LH - (np.clip((v + 60) / 60, 0, 1) * (LH - 6))) for x, v in zip(xs, lvl)]
    d.line(pts, fill=(140, 200, 255), width=1)
    to_x = lambda t: int(t / duration * (W - 1))  # noqa: E731
    for s in scenes[1:]:
        x = to_x(s["from"] / fps)
        d.line([(x, 0), (x, H + LH)], fill=(255, 60, 60), width=1)
    for t in onsets:
        d.line([(to_x(t), 0), (to_x(t), 10)], fill=(255, 220, 0), width=1)
    f = font(13)
    for sec in range(0, int(duration) + 1):
        x = to_x(sec)
        d.line([(x, H + LH), (x, H + LH + 6)], fill=(200, 200, 200))
        if sec % 2 == 0:
            d.text((x + 2, H + LH + 8), f"{sec}s", fill=(200, 200, 200), font=f)
    d.text((6, 4), "spectrogram (log frequency) · red: cuts · yellow: detected hits", fill=(255, 255, 255), font=f)
    d.text((6, H + 4), "loudness (RMS, -60…0 dB)", fill=(255, 255, 255), font=f)
    canvas.save(out_png)
    return onsets


if __name__ == "__main__":
    if not positionals():
        sys.exit("usage: scripts/review.py <video.mp4> [--timeline timeline.json|none] [--scenes scenes.json|timing.json] [--out out/review/<name>]")
    VIDEO = Path(positionals()[0]).resolve()
    OUT = Path(arg_after("--out", ROOT / "out" / "review" / VIDEO.stem)).resolve()
    (OUT / "strips").mkdir(parents=True, exist_ok=True)
    info = probe(VIDEO)
    fps, frames = info["fps"], info["frames"]
    tl_arg = arg_after("--timeline", ROOT / "episode" / "timeline.json")
    scenes, edit = scenes_from(VIDEO, None if str(tl_arg) == "none" else Path(tl_arg), arg_after("--scenes"), fps, frames)
    portrait, square = info["h"] > info["w"], info["h"] == info["w"]
    tw, th = (270, 480) if portrait else (360, 360) if square else (480, 270)

    wanted = []
    for s in scenes:
        a, b = s["from"], s["to"] - 1
        s["picks"] = [a + 2, round(a + (b - a) * 0.25), round((a + b) / 2), round(a + (b - a) * 0.75), b - 1]
        s["strip"] = list(range(a, min(b, a + round(fps)), max(1, round(fps / 15))))
        wanted += s["picks"] + s["strip"]
    cut_frames = [s["from"] for s in scenes[1:]]
    for c in cut_frames:
        wanted += [c - 2, c - 1, c, c + 1]
    imgs = grab_frames(VIDEO, [n for n in wanted if n < frames], tw, th)

    t = lambda n: f"{n / fps:.2f}s"  # noqa: E731
    sheet([[(imgs.get(n), f"{s['id']} · {n} · {t(n)}") for n in s["picks"]] for s in scenes], tw, th).save(OUT / "scenes.png")
    if cut_frames:
        sheet([[(imgs.get(n), f"{'cut ' if n == c else ''}{n}") for n in (c - 2, c - 1, c, c + 1)] for c in cut_frames], tw, th).save(OUT / "cuts.png")
    for s in scenes:
        sheet([[(imgs.get(n), f"+{n - s['from']}") for n in s["strip"]]], tw, th).save(OUT / "strips" / f"{s['id']}.png")
    if portrait:
        # The zones are in 1080×1920 px; the tiles are any 9:16 size (a 4K master too), so scale from 1080×1920.
        sx, sy = tw / 1080, th / 1920
        z = SAFE_9x16

        def zoned(n):
            im = imgs.get(n)
            if im is None:
                return None
            ov = Image.new("RGBA", im.size, (0, 0, 0, 0))
            d = ImageDraw.Draw(ov)
            for box in [(0, 0, tw, z["top"] * sy), (0, th - z["bottom"] * sy, tw, th), (0, 0, z["left"] * sx, th), (tw - z["right"] * sx, 0, tw, th)]:
                d.rectangle(box, fill=(255, 0, 80, 90))
            return Image.alpha_composite(im.convert("RGBA"), ov).convert("RGB")

        # Every pick of every scene, a row per scene: text that enters or exits late can cross a zone too.
        sheet([[(zoned(n), f"{s['id']} · {n}") for n in s["picks"]] for s in scenes], tw, th).save(OUT / "safe-zones.png")

    onsets = spectrogram(VIDEO, scenes, fps, info["duration"], OUT / "audio.png") if info["audio"] else []
    loud = loudness(VIDEO) if info["audio"] else {"I": None, "LRA": None, "TP": None}

    # Frozen scenes: none of a scene's five picks differs from its first (a clip that ran out, a hold that doesn't
    # breathe). A scene that starts and ends on the same empty ground but moves in between isn't frozen. "Differs"
    # looks at the most-changed pixels (99.9th percentile), so a slow push on a small mark over a flat field counts as
    # moving while encoding noise doesn't.
    frozen = []
    for s in scenes:
        picks = [np.asarray(imgs[n], dtype=np.int16) for n in s["picks"] if imgs.get(n) is not None]
        if len(picks) >= 2 and max(np.percentile(np.abs(f - picks[0]), 99.9) for f in picks[1:]) < 6:
            frozen.append(s["id"])

    # Black edges: a band of pure black along a side while the picture beside it is lit (a plate panned past its edge).
    edges = []
    for s in scenes:
        sides = sorted({side for n in s["picks"] if imgs.get(n) is not None for side in black_edges(imgs[n])})
        if sides:
            edges.append(f"{s['id']} ({', '.join(sides)})")

    checks = []
    if edit:
        expect = scenes[-1]["to"]
        checks.append((f"frame rate is the edit's {edit['fps']:g} fps ({edit['source']})", abs(fps - edit["fps"]) < 0.01, f"{fps:g} fps"))
        checks.append((f"frame count is the edit's {expect}", frames == expect, f"{frames} frames"))
    else:
        checks.append(("frame rate and count match the edit", None, "not checked: no edit given (--timeline or --scenes); the cuts were detected, which misses match cuts, dissolves and cuts between similar frames"))
    checks.append(("H.264, yuv420p (plays everywhere)", info["codec"].startswith("h264") and info["pix_fmt"] == "yuv420p", f"{info['codec']}, {info['pix_fmt']}"))
    checks.append(("colour tags set (players show the rendered colours)", "?" not in info["colour"] and "unknown" not in info["colour"], info["colour"]))
    a = info["audio"]
    checks.append(("audio present and as long as the video", a is not None and a["duration"] >= info["duration"] - 0.1, "none" if a is None else f"{a['codec']} {a['rate']} Hz × {a['channels']}, {a['duration']:.2f}s"))
    if a:
        checks.append(("loudness −14 ± 1 LUFS (streaming norm)", loud["I"] is not None and abs(loud["I"] + 14) <= 1, f"{loud['I']} LUFS"))
        checks.append(("true peak ≤ −1.0 dBTP", loud["TP"] is not None and loud["TP"] <= -1.0, f"{loud['TP']} dBTP"))
    checks.append(("no frozen scene (every scene changes across its picks)", not frozen, ", ".join(frozen) or "all move"))
    checks.append(("no black edges (a plate panned or zoomed past the frame)", not edges, "; ".join(edges) or "none"))

    lines = [f"# Review: {VIDEO.name}", "", "| | |", "|---|---|",
             f"| Video | {info['codec']}, {info['w']}×{info['h']}, {fps:g} fps, {frames} frames, {info['duration']:.2f} s, {info['pix_fmt']}, colour {info['colour']} |",
             "| Audio | " + ("none" if not a else f"{a['codec']}, {a['rate']} Hz, {a['channels']} ch, {a['duration']:.2f} s") + " |",
             f"| Loudness | {loud['I']} LUFS integrated, LRA {loud['LRA']} LU, true peak {loud['TP']} dBTP |",
             f"| Detected hits | {len(onsets)} (yellow ticks in audio.png) |", "", "## Checks", "", "| Check | Result | Measured |", "|---|---|---|"]
    lines += [f"| {name} | {'NOT CHECKED' if ok is None else 'PASS' if ok else '**FAIL**'} | {got} |" for name, ok, got in checks]
    lines += ["", "## Scenes", "", "| # | Scene | Frames | Time | Length |", "|---|---|---|---|---|"]
    lines += [f"| {i + 1} | {s['name']} | {s['from']}–{s['to'] - 1} | {s['from'] / fps:.2f}–{s['to'] / fps:.2f}s | {(s['to'] - s['from']) / fps:.2f}s |" for i, s in enumerate(scenes)]
    lines += ["", "## Files", "", "- `scenes.png`: one row per scene (first, ¼, ½, ¾, last frame)", "- `cuts.png`: two frames either side of every cut" if cut_frames else "",
              "- `strips/<scene>.png`: each scene's first second, every 4th frame", "- `audio.png`: spectrogram and loudness, cuts in red, hits in yellow" if a else "",
              "- `safe-zones.png`: platform UI zones shaded" if portrait else "", "", "## Not checked here",
              "", "- Sound is measured, not heard: listen to the mix, or check the hits line up with the cuts and events in `audio.png`.",
              "- Story, taste and brand: that's the review itself (npm run review, against style.md)."]
    (OUT / "report.md").write_text("\n".join(x for x in lines if x is not None) + "\n")
    failed = [n for n, ok, _ in checks if ok is False]
    unchecked = [n for n, ok, _ in checks if ok is None]
    passed = len(checks) - len(failed) - len(unchecked)
    where = OUT.relative_to(ROOT) if OUT.is_relative_to(ROOT) else OUT
    source = edit["source"] if edit else "detected cuts"
    print(f"review → {where}: {len(scenes)} scenes ({source}), {passed}/{len(checks)} checks pass" + (f", {len(unchecked)} not checked" if unchecked else ""))
    for n in failed:
        print(f"  FAIL {n}")
    for n in unchecked:
        print(f"  NOT CHECKED {n}")
    sys.exit(1 if failed else 0)
