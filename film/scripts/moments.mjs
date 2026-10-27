// The film's key moments, in frames: for each scene of the edit, the frames a reviewer looks at, each with what it
// should show and the words being said then. Shared by the review (npm run review) and the contact sheet (deliver).
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (f) => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
// src/beats.ts and src/changes/reel.ts
const MORPH_AT = 34;
const LAND = 54;
const VO_AT = 50;
const LOUPE_AT = 50;
const INTRO_AT = -8;

export function moments() {
  const episode = read('episode/episode.json');
  const tl = read('episode/timeline.json');
  const voice = read('episode/voice.json');
  const fpb = (60 * tl.fps) / tl.bpm;
  let b = 0;
  const scenes = tl.scenes.map((s) => {
    const from = Math.round(b * fpb);
    b += s.beats;
    return {...s, from, D: Math.round(b * fpb) - from};
  });
  const sceneOf = (id) => scenes.find((s) => s.id === id);
  // When each line plays (film frames), as src/voice.ts places it.
  const lines = voice.lines
    .filter((l) => l.id === 'intro' || sceneOf(l.id))
    .map((l) => ({...l, at: l.id === 'intro' ? sceneOf('stream').from + INTRO_AT : sceneOf(l.id).from + VO_AT}));
  const saying = (frame) => {
    const l = lines.find((x) => frame >= x.at && frame < x.at + Math.round((x.end - x.start) * 60) + 6);
    if (!l) return '';
    const t = l.start + (frame - l.at) / 60;
    const said = (l.words ?? []).filter((w) => w.a <= t).map((w) => w.w);
    return said.length ? `“…${said.slice(-5).join(' ')}”` : '';
  };
  const out = [];
  for (const s of scenes) {
    const at = (k, what) => out.push({scene: s.id, frame: s.from + k, what});
    if (s.id === 'logo') [[24, 'the icon swings in'], [70, 'the title and the day'], [s.D - 12, 'the dive into the blue']].forEach(([k, w]) => at(k, w));
    else if (s.id === 'stream') [[24, 'the merges stream past, the count runs'], [s.D - 8, 'the count lands']].forEach(([k, w]) => at(k, w));
    else if (s.id === 'top') [[44, `the top ${episode.changes.length}: each PR's title turning into its headline`], [s.D - 26, 'the list, as 01 opens']].forEach(([k, w]) => at(k, w));
    else if (s.id === 'end') [[40, 'out of the blue: the icon'], [120, 'the end card: icon, title, the day'], [s.D - 10, 'the last frame']].forEach(([k, w]) => at(k, w));
    else {
      const c = episode.changes.find((x) => `c${x.rank}` === s.id);
      const line = lines.find((l) => l.id === s.id);
      const lineEnd = line ? VO_AT + Math.round((line.end - line.start) * 60) : s.D - 20;
      at(30, `title: "${c.headline}"`);
      at(LAND + 6, 'the window has landed, the caption settled');
      at(MORPH_AT + LOUPE_AT + 30, 'the lens, focused on the block');
      for (const [ev, word] of Object.entries(c.motion?.sync ?? {})) {
        const w = line?.words?.find((x) => x.w.toLowerCase().replace(/[^a-z0-9#]/g, '').startsWith(word.toLowerCase().replace(/[^a-z0-9#]/g, '')));
        if (w) at(VO_AT + Math.round((w.a - line.start) * 60) + 14, `${ev} on "${word}"`);
      }
      at(Math.min(s.D - 20, lineEnd), 'the line ends');
      at(s.D - 18, 'the last look before the next change');
    }
  }
  return {episode, scenes, moments: out.sort((x, y) => x.frame - y.frame).map((m) => ({...m, saying: saying(m.frame)}))};
}
