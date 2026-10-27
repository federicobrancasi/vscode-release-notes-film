// The edit, from the episode and its narration: episode/timeline.json. 120 BPM at 60 fps (a beat is 30 frames), every
// scene a whole number of beats, so every cut lands on the music. The opening (the logo, the merges, the top ten) and
// the end card have fixed lengths; each change lasts until its line ends plus a breath, and at least 10 beats (5 s) so
// what it shows has time to play.
//   node scripts/timeline.mjs
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BPM = 120;
const FPS = 60;
/** Frames into a change when its line starts (src/beats.ts VO_AT), and the breath after it ends. */
const VO_AT = 50;
const VO_TAIL = 20;
const MIN_BEATS = 10;

export function writeTimeline() {
  const episode = JSON.parse(fs.readFileSync(path.join(ROOT, 'episode', 'episode.json'), 'utf8'));
  const voice = JSON.parse(fs.readFileSync(path.join(ROOT, 'episode', 'voice.json'), 'utf8'));
  const fpb = (60 * FPS) / BPM;
  const beatsOf = (id) => {
    const l = voice.lines.find((x) => x.id === id);
    return l ? Math.max(MIN_BEATS, Math.ceil((VO_AT + Math.round((l.end - l.start) * 60) + VO_TAIL) / fpb)) : MIN_BEATS;
  };
  const scenes = [
    {id: 'logo', name: 'Logo reveal', beats: 5},
    {id: 'stream', name: `Stream · ${episode.merged?.items.length ?? 0} pull requests`, beats: 4},
    {id: 'top', name: `The top ${episode.changes.length}`, beats: 4},
    ...episode.changes.map((c) => ({id: `c${c.rank}`, name: `${c.rank} · #${c.number} ${c.headline}`, beats: beatsOf(`c${c.rank}`)})),
    {id: 'end', name: 'End card', beats: 5},
  ];
  const timeline = {
    title: `VS Code Changelog · ${episode.dateShort}`,
    fps: FPS,
    bpm: BPM,
    scenes,
    // The theme's drop lands on the first change; the music ends on the end card's fourth beat, ringing out.
    music: {theme: 'music/theme.wav', drop: {scene: 'c1', beat: 0}, end: {scene: 'end', beat: 4}},
  };
  fs.writeFileSync(path.join(ROOT, 'episode', 'timeline.json'), `${JSON.stringify(timeline, null, 2)}\n`);
  const total = scenes.reduce((n, s) => n + s.beats, 0);
  console.log(`episode/timeline.json: ${scenes.length} scenes, ${total} beats, ${((total * 60) / BPM).toFixed(1)} s`);
  return timeline;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) writeTimeline();
