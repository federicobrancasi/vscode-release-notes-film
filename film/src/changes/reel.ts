import type React from 'react';
import {ARRIVE} from '../beats';
import type {Change, RecordingVisual} from '../episode';
import {clamp} from '../motion';
import {SCENES} from '../scenes';
import type {Day, Rect, SceneCtx, SceneCue} from '../scenes/types';

// A reel: the changes in the order they're shown, each with its shot (a recording, or a drawn scene of the library),
// where it starts and how long it is. The film's reel is the day's episode; the library's gallery has its own.

/** The lens of a change: the block it frames, whole; a hand-set magnification; when it drops (frames since the window appeared). */
export type LoupeShot = {block: Rect; mag?: number; at: number};
export type Shot = {
  kind: 'recording' | 'drawn';
  loupe: LoupeShot;
  /** A window (traffic lights drawn on it) or a whole screen (a desktop). */
  chrome: 'window' | 'screen';
  /** A drawn scene (frames since the window appeared, and how long it's shown). */
  Drawn?: React.FC<{f: number; D: number}>;
  /** A drawn scene's sounds (frames since the window appeared). */
  cues: SceneCue[];
};
export type Reel = {
  changes: Change[];
  shots: Shot[];
  N: number;
  /** Frames from the first change's start to change k's. */
  start: (k: number) => number;
  /** Change k's length in frames. */
  D: (k: number) => number;
};

/** The lens drops a few frames before the show arrives. */
export const LOUPE_AT = ARRIVE - 4;

/** The union of a recording's hero marks (motion.hero, else every mark of its demo), padded, in window px. */
const recordingHero = (c: Change, v: RecordingVisual): Rect => {
  const k = 1280 / v.viewport[0];
  const names = c.motion?.hero ?? Object.keys(v.marks);
  const marks = names.map((n) => v.marks[n]).filter(Boolean);
  if (!marks.length) return [320, 180, 640, 360];
  const pad = 18;
  const x0 = Math.min(...marks.map((m) => m.rect[0] * k)) - pad;
  const y0 = Math.min(...marks.map((m) => m.rect[1] * k)) - pad;
  const x1 = Math.max(...marks.map((m) => (m.rect[0] + m.rect[2]) * k)) + pad;
  const y1 = Math.max(...marks.map((m) => (m.rect[1] + m.rect[3]) * k)) + pad;
  return [x0, y0, x1 - x0, y1 - y0];
};

/**
 * A recording's lens: motion.loupe.block, else its hero padded and at least 300×200 (so a lone button never gets a lens
 * of its own), inside the window.
 */
const recordingLoupe = (c: Change, v: RecordingVisual): LoupeShot => {
  const given = c.motion?.loupe;
  if (given?.block?.length === 4) return {block: given.block as Rect, mag: given.mag, at: LOUPE_AT};
  const [x, y, w, h] = recordingHero(c, v);
  const W = Math.min(1280, Math.max(300, w + 44));
  const H = Math.min(720, Math.max(200, h + 44));
  return {block: [clamp(x + w / 2 - W / 2, 0, 1280 - W), clamp(y + h / 2 - H / 2, 0, 720 - H), W, H], at: LOUPE_AT};
};

export const shotOf = (c: Change, ctx: Omit<SceneCtx, 'day'>, day: Day): Shot => {
  if (c.visual.kind === 'recording') return {kind: 'recording', loupe: recordingLoupe(c, c.visual), cues: [], chrome: 'window'};
  const make = SCENES[c.visual.name];
  if (!make) throw new Error(`the library has no scene "${c.visual.name}" (change ${c.rank})`);
  const d = make(c.visual.params, {...ctx, day});
  // A lens set in the episode wins over the scene's own.
  const given = c.motion?.loupe;
  const loupe = given?.block?.length === 4 ? {block: given.block as Rect, mag: given.mag} : d.loupe;
  return {kind: 'drawn', loupe: {...loupe, at: d.loupe.at ?? LOUPE_AT}, cues: d.cues, chrome: d.chrome, Drawn: d.Component};
};

/** A reel of `changes`, shown in `scenes` (their starts and lengths in frames), each drawn scene's events from `ctxOf`. */
export const makeReel = (changes: Change[], scenes: {from: number; durationInFrames: number}[], ctxOf: (c: Change) => Omit<SceneCtx, 'day'>, day: Day): Reel => ({
  changes,
  shots: changes.map((c) => shotOf(c, ctxOf(c), day)),
  N: changes.length,
  start: (k) => scenes[k].from - scenes[0].from,
  D: (k) => scenes[k].durationInFrames,
});

/** The day of a date (YYYY-MM-DD), for what the drawn UI dates. */
export const dayOf = (date: string): Day => {
  const d = new Date(`${date}T12:00:00Z`);
  const part = (o: Intl.DateTimeFormatOptions) => d.toLocaleDateString('en-US', {...o, timeZone: 'UTC'});
  return {weekday: part({weekday: 'short'}), month: part({month: 'short'}), day: d.getUTCDate(), year: d.getUTCFullYear(), m: d.getUTCMonth() + 1};
};
