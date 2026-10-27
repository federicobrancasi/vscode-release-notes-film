// The day's episode (episode/episode.json, written by scripts/episode.mjs from the engine project and its film.json):
// the day, its merges, and each change with what it shows. Every string on screen comes from here.
import episode from '../episode/episode.json';

export type Mark = {rect: number[]; visible: number[][]};
/** A recording made with the engine (prs demo), as an mp4 at the window's 1280×720, and the marks its demo followed. */
export type RecordingVisual = {kind: 'recording'; demo: string; src: string; fps: number; viewport: number[]; duration: number; from: number; marks: Record<string, Mark>};
/** A scene of the library (src/scenes), drawn from its params. */
export type SceneVisual = {kind: 'scene'; name: string; params: Record<string, unknown>};
/** How the film shows a change: where a recording starts, what changed in it, the lens's block, and the drawn scene's sync words. */
export type Motion = {
  /** A recording: the second it starts at (its demo's narration start, less the line's lead, when not given). */
  from?: number;
  /** A recording: the demo's marks that show what changed (default: all of them). */
  hero?: string[];
  /** The block the lens frames, whole (window px), and optionally its magnification, set by hand. */
  loupe?: {block: number[]; mag?: number};
  /** A drawn scene's events, each on a word of its line: {swap: 'GitHub'} (src/voice.ts wordFv). */
  sync?: Record<string, string>;
};
export type Change = {
  rank: number;
  number: number;
  url: string;
  author: string;
  /** The pull request's title (the day's merges show it). */
  title: string;
  headline: string;
  eyebrow: string | null;
  say: string;
  visual: RecordingVisual | SceneVisual;
  motion: Motion | null;
  /** The caption's small line in place of "eyebrow · #number" (the scene library's reel). */
  label?: string;
};
export type Episode = {
  date: string;
  dateLong: string;
  dateShort: string;
  build: {name: string; version: string} | null;
  merged: {window: string[]; items: {n: number; t: string; at: string}[]} | null;
  intro: {say: string};
  changes: Change[];
};

export const EP = episode as unknown as Episode;
export const CHANGES = EP.changes;

/** "01" … "10". */
export const two = (n: number) => String(n).padStart(2, '0');
