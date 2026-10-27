import spansJson from '../episode/voice.json';
import {MORPH_AT, VO_AT} from './beats';
import {CHANGES} from './episode';
import {TL} from './timeline';

// The narration (episode/voice.json, the engine's voice of the film's lines, timed word by word): one short line as
// each change is shown, starting as its window lands, and the intro as the logo dives into the blue. No line over the
// end card: the music has it. The drawn changes act on the word of their line that names what they show.

export type Word = {w: string; a: number; b: number};
export type VoiceLine = {id: string; from: number; frames: number; start: number; end: number};
type Spans = {src: string; name: string | null; lines: {id: string; start: number; end: number; text: string; words?: Word[]}[]};
const spans = spansJson as Spans;
/** The intro starts as the logo dives into the blue, and ends before 01's title. */
const INTRO_AT = -8;

export const VOICE: {src: string; lines: VoiceLine[]} = {
  src: spans.src,
  lines: spans.lines
    .filter((l) => l.id === 'intro' || CHANGES.some((c) => `c${c.rank}` === l.id))
    .map((l) => {
      const from = l.id === 'intro' ? TL.sceneOf('stream').from + INTRO_AT : TL.sceneOf(l.id).from + VO_AT;
      return {id: l.id, from, frames: Math.round((l.end - l.start) * 60), start: l.start, end: l.end};
    }),
};

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9#]/g, '');
/**
 * Frames since change `id`'s window appeared (fv) when its line starts saying `word` (the first word that begins with
 * it, punctuation aside), or `fallback` when the line has no such word.
 */
export const wordFv = (id: string, word: string, fallback: number) => {
  const line = spans.lines.find((l) => l.id === id);
  const w = line?.words?.find((x) => norm(x.w).startsWith(norm(word)));
  return line && w ? VO_AT - MORPH_AT + Math.round((w.a - line.start) * 60) : fallback;
};
