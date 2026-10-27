import React from 'react';
import {LAND, MORPH_AT} from '../beats';
import type {Cue} from '../cues';
import {clamp, lerp} from '../motion';
import type {Rect} from '../scenes/types';
import {TrafficLights} from '../ui/kit';
import {ChangeView, Stage, StageProps} from './Changes';
import {Pose, toScreen} from './pose';
import type {Reel, Shot} from './reel';

// Loupe: a Liquid Glass lens shows what changed. One lens per change, set once and never moving: it frames the whole
// block that changed (the episode's motion.loupe.block, or the drawn scene's), enlarged in place. Inside it is the same
// UI again (the same drawn scene, or the same recording at the same frame), magnified, so it's exact. The window stays
// still at the right of the frame, and the glass goes to wherever the block is. The lens always covers the block it
// shows (nothing is seen twice), stays inside the window (so it never covers the caption nor leaves the frame), and
// never shows past the window's edges. Nothing is drawn over the magnified UI, so it stays perfectly clean: the glass
// is a crisp rim, a light that runs once along it as the lens lands, and a shadow (no backdrop filter). It opens as an
// aperture over a copy aligned with the window under it (clear glass, so nothing shows twice), then magnifies.

/** The steady window's scale, and where it sits: at the right of the frame. */
export const LOUPE_SCALE = 1.06;
const SW = LOUPE_SCALE;
const WX = 1920 - 70 - 1280 * SW;
const WY = 64;
const STEADY: Pose = {cx: 640, cy: 360, s: SW, fx: WX + 640 * SW, fy: WY + 360 * SW, rx: 0, ry: 0, rz: 0};
/** The lens's largest size on screen, and the padding it keeps around its block. */
const LENS_MAX = {w: 1000, h: 640};
const PAD = {x: 60, y: 50};
/** How big a block is shown at most and at least (screen px per window px). */
const T_MIN = 1.4;
const T_MAX = 2.45;
/**
 * The lens: frames it takes to appear (opaque by then, its copy still aligned with the window under it), to open to its
 * size, to magnify (from when it's opaque), and for its rim light to run; the window's dim around it.
 */
const APPEAR = 5;
const OPEN = 18;
const FOCUS = 20;
const RIM = 40;
const DIM = 0.34;

const easeIO = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const center = (r: Rect): [number, number] => [r[0] + r[2] / 2, r[1] + r[3] / 2];
/** The same (flat) placement, described from window point (cx, cy). */
const reanchor = (p: Pose, cx: number, cy: number): Pose => ({...p, cx, cy, fx: p.fx + (cx - p.cx) * p.s, fy: p.fy + (cy - p.cy) * p.s});

export type Fit = {T: number; w: number; h: number};
/** How big the block shows in the lens (T: screen px per window px) and the lens's size on screen. */
export const fitOf = (shot: Shot): Fit => {
  const [, , w, h] = shot.loupe.block;
  if (shot.loupe.mag) {
    // A lens set by hand: that magnification of the steady window, exactly the block.
    const T = SW * shot.loupe.mag;
    return {T, w: w * T, h: h * T};
  }
  const T = clamp(Math.min((LENS_MAX.w - PAD.x) / w, (LENS_MAX.h - PAD.y) / h), T_MIN, T_MAX);
  return {T, w: Math.min(LENS_MAX.w, w * T + PAD.x), h: Math.min(LENS_MAX.h, h * T + PAD.y)};
};

/** v kept in [lo, hi] if it can be; else in [mustLo, mustHi] (covering the block wins), as near [lo, hi] as it gets. */
const place = (v: number, mustLo: number, mustHi: number, lo: number, hi: number) => {
  const a = Math.max(mustLo, lo);
  const b = Math.min(mustHi, hi);
  if (a <= b) return clamp(v, a, b);
  return hi < mustLo ? mustLo : mustHi;
};

/** The lens's place on screen (top-left) for the window at pose p. */
const lensBox = (shot: Shot, fit: Fit, p: Pose) => {
  const [x, y, w, h] = shot.loupe.block;
  const [bx0, by0] = toScreen(p, x, y);
  const [bx1, by1] = toScreen(p, x + w, y + h);
  const [wx0, wy0] = toScreen(p, 0, 0);
  const [wx1, wy1] = toScreen(p, 1280, 720);
  return {
    x: place((bx0 + bx1) / 2 - fit.w / 2, bx1 - fit.w, bx0, wx0, wx1 - fit.w),
    y: place((by0 + by1) / 2 - fit.h / 2, by1 - fit.h, by0, wy0, wy1 - fit.h),
  };
};

/** The lens on screen for window pose p, as the film places it (src/scenes' gallery and the check use it too). */
export const lensOnScreen = (shot: Shot, p: Pose) => {
  const fit = fitOf(shot);
  return {...lensBox(shot, fit, p), w: fit.w, h: fit.h};
};

/** The window's pose for change k (`fk` frames in, `D` long): still, but for a slow push around the block. */
export const steadyPose = (block: Rect, fk: number, D: number): Pose => {
  const [bx, by] = center(block);
  const steady = reanchor(STEADY, bx, by);
  const hold = clamp((fk - LAND) / Math.max(1, D - LAND));
  return reanchor({...steady, s: steady.s * (1 + 0.006 * hold)}, 640, 360);
};

export const makeLoupe = (reel: Reel): Stage => {
  const fits = reel.shots.map(fitOf);
  const pose = (k: number, fk: number, D: number): Pose => steadyPose(reel.shots[k].loupe.block, fk, D);

  const OnPlane: React.FC<StageProps> = ({shot, fv}) => {
    const on = clamp((fv - shot.loupe.at) / 16);
    return on > 0 ? <div style={{position: 'absolute', inset: 0, background: 'rgb(4, 6, 10)', opacity: DIM * on}} /> : null;
  };

  const Lens: React.FC<StageProps> = ({k, c, shot, fv, D, local, pose: p}) => {
    const at = shot.loupe.at;
    if (fv < at) return null;
    const fit = fits[k];
    const box = lensBox(shot, fit, p);
    const Dv = D - MORPH_AT;
    // The lens's centre on screen, and the window point under it.
    const lx = box.x + fit.w / 2;
    const ly = box.y + fit.h / 2;
    const under: [number, number] = [(lx - p.fx) / p.s + p.cx, (ly - p.fy) / p.s + p.cy];
    // It opens from its centre (a big lens more gently), with a touch of overshoot, like a drop landing.
    const big = clamp((fit.w * fit.h - 150000) / 450000);
    const from = lerp(0.8, 0.9, big);
    const u = clamp((fv - at) / OPEN) - 1;
    const open = from + (1 - from) * (1 + 2.2 * u * u * u + 1.2 * u * u);
    const w = fit.w * open;
    const h = fit.h * open;
    const R = Math.min(fit.h * 0.4, 56) * open;
    // Clear glass first: until it's opaque its copy is the window under it, exactly; then it magnifies onto the block.
    const focus = easeIO(clamp((fv - at - APPEAR) / FOCUS));
    const hold = clamp((fv - at - APPEAR - FOCUS) / Math.max(1, Dv - at - APPEAR - FOCUS));
    const T = fit.T * (1 + 0.02 * hold);
    const [bx, by] = center(shot.loupe.block);
    const ax = lerp(under[0], bx, focus);
    const ay = lerp(under[1], by, focus);
    const S = Math.exp(lerp(Math.log(p.s), Math.log(T), focus));
    // Inside the lens, the window's edges never show: the view stops at them.
    const tx = clamp(w / 2 - ax * S, w - 1280 * S, 0);
    const ty = clamp(h / 2 - ay * S, h - 720 * S, 0);
    // The light running once along the rim as it lands: a short bright dash with a soft glow, on the rim only.
    const run = clamp((fv - at - 4) / RIM);
    const runOn = run > 0 && run < 1 ? Math.sin(Math.PI * run) : 0;
    const offset = -(80 + 620 * (1 - Math.pow(1 - run, 3)));
    return (
      <div style={{position: 'absolute', left: lx - w / 2, top: ly - h / 2, width: w, height: h, opacity: clamp((fv - at) / APPEAR)}}>
        <div style={{position: 'absolute', inset: 0, borderRadius: R, overflow: 'hidden', background: '#121315', boxShadow: '0 34px 80px rgba(0,0,0,0.6), 0 10px 24px rgba(0,0,0,0.38), 0 0 0 1px rgba(0,0,0,0.5)'}}>
          <div style={{position: 'absolute', left: 0, top: 0, width: 1280, height: 720, transformOrigin: '0 0', transform: `translate(${tx}px, ${ty}px) scale(${S})`}}>
            <ChangeView c={c} shot={shot} fv={fv} Dv={Dv} played={fv - local} />
            {shot.chrome === 'window' ? <TrafficLights /> : null}
          </div>
        </div>
        {/* The rim: a crisp line of light around the glass and along its top edge, over nothing but its edge. */}
        <div style={{position: 'absolute', inset: 0, borderRadius: R, boxShadow: 'inset 0 0 0 1.5px rgba(255,255,255,0.42), inset 0 1px 0 rgba(255,255,255,0.5)'}} />
        {runOn > 0 ? (
          <svg width={w} height={h} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
            <rect x={0.75} y={0.75} width={w - 1.5} height={h - 1.5} rx={Math.max(0, R - 0.75)} fill="none" stroke="rgba(160,205,255,0.5)" strokeWidth={5} pathLength={1000} strokeDasharray="110 890" strokeDashoffset={offset} strokeLinecap="round" opacity={0.6 * runOn} style={{filter: 'blur(3px)'}} />
            <rect x={0.75} y={0.75} width={w - 1.5} height={h - 1.5} rx={Math.max(0, R - 0.75)} fill="none" stroke="#FFFFFF" strokeWidth={1.6} pathLength={1000} strokeDasharray="70 930" strokeDashoffset={offset - 20} strokeLinecap="round" opacity={0.95 * runOn} />
          </svg>
        ) : null}
      </div>
    );
  };

  return {
    pose,
    OnPlane,
    Over: Lens,
    captionShade: 'radial-gradient(ellipse 1250px 340px at 0% 100%, rgba(5,7,12,0.92) 0%, rgba(5,7,12,0.72) 42%, rgba(5,7,12,0) 80%)',
    cues: (k: number): Cue[] => [{at: MORPH_AT + reel.shots[k].loupe.at + 6, sfx: 'glass', volume: 0.24}],
  };
};
