// The frame review, before the master: stills of every scene's key moments (scripts/moments.mjs), on one sheet per
// change (out/review/<date>/c1.png …) with what each frame should show and the words being said then, and the
// checklist. A fresh pair of eyes checks every sheet against skills/generate-changelog-film/style.md.
//   npm run review [-- c3,c6]   (only those scenes)
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {moments} from './moments.mjs';
import {stills} from './stills.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const only = process.argv[2]?.split(',');
const {episode, moments: all} = moments();
const want = all.filter((m) => !only || only.includes(m.scene));
const dir = path.join(ROOT, 'out', 'review', episode.date);
fs.rmSync(dir, {recursive: true, force: true});
fs.mkdirSync(path.join(dir, 'frames'), {recursive: true});
const frames = [...new Set(want.map((m) => m.frame))];
console.log(`review: ${frames.length} stills of ${new Set(want.map((m) => m.scene)).size} scenes…`);
await stills({outDir: path.join(dir, 'frames'), frames, log: false});
const groups = {};
for (const m of want) (groups[m.scene] ??= []).push({file: path.join(dir, 'frames', `frame-${String(m.frame).padStart(4, '0')}.png`), label: `${m.frame} · ${(m.frame / 60).toFixed(2)}s · ${m.what}${m.saying ? `  ${m.saying}` : ''}`});
const sheets = Object.entries(groups).map(([scene, tiles]) => {
  const c = episode.changes.find((x) => `c${x.rank}` === scene);
  return {out: path.join(dir, `${scene}.png`), title: c ? `${scene} · #${c.number} · ${c.headline} · line: “${c.say}”` : scene, tiles};
});
fs.writeFileSync(path.join(dir, 'sheets.json'), JSON.stringify({sheets}, null, 1));
execFileSync('uv', ['run', '--quiet', '--python', '3.12', '--with', 'pillow==13.0.0', 'python', path.join(ROOT, 'scripts', 'sheets.py'), path.join(dir, 'sheets.json')], {stdio: 'inherit'});
console.log(`review sheets: ${sheets.map((s) => path.relative(ROOT, s.out)).join(', ')}

Check every sheet at full size, against style.md. A frame is wrong when:
- the UI isn't the one the change is about, or a drawn label isn't the PR's word;
- the lens isn't on the whole block that changed, moves, cuts the block, or shows anything over the magnified UI;
- an event (a swap, a click, a badge) isn't on the word that names it, or happens before the lens is on;
- two labels are half-faded over each other, or a click doesn't show (no press, no ring);
- the caption, the title or the line says a build (Stable, Insiders), or the line says what isn't on screen;
- something is cut off, covered or unreadable; a black bar, a flicker, a frame from another change.`);
