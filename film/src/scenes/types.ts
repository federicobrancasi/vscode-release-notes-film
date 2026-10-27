import type React from 'react';

// A scene of the library: a piece of VS Code drawn at the recordings' 1280×720, from the change's params, acting the
// change out. `f` counts frames since the window appeared; the lens is on the block at ARRIVE (src/beats.ts).

export type Rect = [number, number, number, number];
/** When a scene's event happens (frames since the window appeared): on its sync word, else `fallback`, never before `min`. */
export type Ev = (name: string, fallback: number, min?: number) => number;
/** The day the film is about, for what the drawn UI dates (a menu bar's clock, a calendar tile). */
export type Day = {weekday: string; month: string; day: number; year: number; m: number};
/**
 * What a scene knows of its change: when its events happen (`ev`), whether an event is on a word of the line (`has`:
 * an event that takes the block away, a click that closes a dialog, happens only then), and the day.
 */
export type SceneCtx = {ev: Ev; has: (name: string) => boolean; day: Day};
export type SceneCue = {at: number; sfx: string; volume: number};
export type Drawn = {
  Component: React.FC<{f: number; D: number}>;
  /** The lens: the block it frames, whole (window px); a magnification set by hand; when it drops (default: arrival). */
  loupe: {block: Rect; mag?: number; at?: number};
  /** Sounds, at frames since the window appeared. */
  cues: SceneCue[];
  /** A window (the film draws its traffic lights) or a whole screen (a desktop: it draws its own). */
  chrome: 'window' | 'screen';
};
export type Params = Record<string, unknown>;
export type SceneMake = (params: Params, ctx: SceneCtx) => Drawn;
