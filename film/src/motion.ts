// Motion laws. Every value is a pure function of the frame: no state, no timers, no Math.random (use hash/vnoise).
// The laws were measured on a reference film at 29.97 fps; they're evaluated in continuous time, so they hold at any fps.
//   entrances settle: a fast snap, then a soft landing      exits accelerate into the cut
//   holds keep breathing (a slow push), nothing freezes      pops follow a measured 5-step curve
import {FPS} from './beats';

const REF_FPS = 30000 / 1001;
const toRef = (frames: number) => (frames * REF_FPS) / FPS;

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Settle law: 39% of the distance on the first reference frame, the rest decays 22% per reference frame. */
const settleRef = (n: number) => {
  if (n <= 0) return 0;
  if (n < 1) return 0.39 * n;
  return 1 - 0.61 * Math.pow(0.78, n - 1);
};

/** 0 → 1 settle progress; `f0` is the first moving frame. */
export const settle = (frame: number, f0: number) => settleRef(toRef(frame - f0 + 1));

/** Value a → b with the settle law. */
export const settleTo = (frame: number, f0: number, a: number, b: number) => lerp(a, b, settle(frame, f0));

/** Accelerating exit: displacement after `frame - f0` frames, starting at v0 px per reference frame, growing k× per reference frame. */
export const accel = (frame: number, f0: number, v0: number, k = 1.5) => {
  const n = toRef(frame - f0 + 1);
  if (n <= 0) return 0;
  return (v0 * (Math.pow(k, n) - 1)) / (k - 1);
};

/** Slow continuous push so holds never freeze: scale gained per reference frame (0.0006–0.0012). */
export const push = (frame: number, rate = 0.0008) => 1 + rate * toRef(frame);

/** The measured pop: scale 0.47 → 0.72 → 0.86 → 0.95 → 1 per reference frame from f0; 0 before it. */
const POP = [0.47, 0.72, 0.86, 0.95, 1];
export const pop = (frame: number, f0: number) => {
  if (frame < f0) return 0;
  const x = clamp(toRef(frame - f0), 0, POP.length - 1);
  const i = Math.floor(x);
  const t = x - i;
  return lerp(POP[i], POP[Math.min(i + 1, POP.length - 1)], t);
};

/** Ease-out glide for cameras and long moves: fast start, soft landing over `len` frames. */
export const glide = (frame: number, f0: number, len = 36) => {
  const t = clamp((frame - f0) / len);
  return 1 - Math.pow(1 - t, 3);
};

/** Characters typed by `frame`: the first on fFirst, the last on fLast (a type tick on every frame that adds some). */
export const typeOn = (frame: number, fFirst: number, fLast: number, n: number) => {
  if (frame < fFirst) return 0;
  if (frame >= fLast) return n;
  return Math.round((n * (frame - fFirst + 1)) / (fLast - fFirst + 1));
};

/** Deterministic hash noise in [0, 1). */
export const hash = (n: number, seed = 0) => {
  let x = Math.imul((n | 0) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(seed | 0, 0xc2b2ae35);
  x ^= x >>> 16;
  x = Math.imul(x, 0x7feb352d);
  x ^= x >>> 15;
  x = Math.imul(x, 0x846ca68b);
  x ^= x >>> 16;
  return (x >>> 0) / 4294967296;
};

/** Smooth deterministic value noise in [-1, 1]. */
export const vnoise = (x: number, seed = 0) => {
  const i = Math.floor(x);
  const t = x - i;
  const s = t * t * (3 - 2 * t);
  return lerp(hash(i, seed), hash(i + 1, seed), s) * 2 - 1;
};

/**
 * Measured motion as dense per-frame data: values[i] belongs to frame f0 + i (linear between frames, clamped at the
 * ends). Use it when you copy a move from a reference film; never fill sparse keys with straight lines.
 */
export const table = (f0: number, values: number[]) => (frame: number) => {
  const x = clamp(frame - f0, 0, values.length - 1);
  const i = Math.floor(x);
  const t = x - i;
  return t === 0 ? values[i] : lerp(values[i], values[Math.min(i + 1, values.length - 1)], t);
};
