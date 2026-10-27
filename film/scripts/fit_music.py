# Fits the film's theme (assets/music/theme.flac, an original track made for it) to the edit in episode/timeline.json,
# so the music serves the picture: its drop lands on the first change (music.drop), and it ends on the beat nearest
# music.end with a reverb tail, so the last chord rings over the end card. Writes public/music/theme.wav. Run it every
# time the edit changes (npm run episode does): the drop and the ending move with the edit.
# Run: npm run music   (uv run … python scripts/fit_music.py)
import json
from pathlib import Path

import librosa
import numpy as np
from scipy.io import wavfile
from scipy.signal import fftconvolve

ROOT = Path(__file__).resolve().parent.parent
TL = json.loads((ROOT / "episode" / "timeline.json").read_text())
THEME = ROOT / "assets" / "music" / "theme.flac"
# Where the theme's drop is, in seconds (its biggest rise in energy, on a beat; measured once).
THEME_DROP = json.loads((ROOT / "assets" / "music" / "theme.json").read_text())["drop"]
TARGET = ROOT / "public" / TL["music"]["theme"]
SR = 48000

SPB = 60 / TL["bpm"]
STARTS, t = {}, 0.0
for s in TL["scenes"]:
    STARTS[s["id"]] = (t, t + s["beats"] * SPB)
    t += s["beats"] * SPB
FILM = t
MUSIC = TL["music"]
DROP_AT = STARTS[MUSIC["drop"]["scene"]][0] + MUSIC["drop"]["beat"] * SPB
END_AT = min(FILM - 0.5, STARTS[MUSIC["end"]["scene"]][0] + MUSIC["end"]["beat"] * SPB)


def envelope(y, sr, hop_s=0.05):
    hop = int(sr * hop_s)
    rms = librosa.feature.rms(y=y, frame_length=hop * 4, hop_length=hop)[0]
    return 20 * np.log10(rms + 1e-6), hop_s


def render(path, drop, dest):
    y, sr = librosa.load(path, sr=SR, mono=False)
    y = np.atleast_2d(y)
    shift = drop - DROP_AT
    y = y[:, int(shift * SR) :] if shift >= 0 else np.concatenate([np.zeros((y.shape[0], int(-shift * SR))), y], axis=1)
    mono = y.mean(axis=0)
    beats = librosa.beat.beat_track(y=librosa.resample(mono, orig_sr=SR, target_sr=22050), sr=22050, units="time", start_bpm=TL["bpm"], tightness=400)[1]
    db, hop_s = envelope(mono, SR)
    loud = np.where(db > -40)[0]
    content_end = (loud[-1] + 1) * hop_s if len(loud) else FILM
    target = min(END_AT, content_end - 0.25)
    cut = min(beats, key=lambda b: abs(b - target)) if len(beats) else target
    n_cut = int(cut * SR)
    length = int((FILM + 0.6) * SR)
    out = np.zeros((y.shape[0], length))
    dry = y[:, : min(n_cut, y.shape[1])].copy()
    fade = int(0.04 * SR)
    dry[:, -fade:] *= np.linspace(1, 0, fade)
    out[:, : dry.shape[1]] = dry[:, :length]
    # Reverb tail from the last 0.6 s so the final chord rings out over the end card.
    t = np.arange(int(3.0 * SR)) / SR
    ir = np.random.default_rng(3).standard_normal(len(t)) * np.exp(-t / 0.9)
    ir /= np.sqrt(np.sum(ir**2))
    send0 = max(0, n_cut - int(0.6 * SR))
    for ch in range(y.shape[0]):
        wet = fftconvolve(y[ch, send0:n_cut], ir)
        ramp = np.clip((np.arange(len(wet)) - int(0.5 * SR)) / (0.1 * SR), 0, 1)
        seg = wet * ramp * 0.5
        stop = min(length, send0 + len(seg))
        out[ch, send0:stop] += seg[: stop - send0]
    out[:, : int(0.01 * SR)] *= np.linspace(0, 1, int(0.01 * SR))
    out = out / (np.max(np.abs(out)) + 1e-9) * 0.89
    dest.parent.mkdir(parents=True, exist_ok=True)
    wavfile.write(dest, SR, (out.T * 32767).astype(np.int16))
    print(f"{dest.relative_to(ROOT)}: the theme's drop ({drop:.2f}s) on the first change ({DROP_AT:.2f}s), cut on the beat at {cut:.2f}s + tail; film {FILM:.1f}s")


if __name__ == "__main__":
    render(THEME, THEME_DROP, TARGET)
