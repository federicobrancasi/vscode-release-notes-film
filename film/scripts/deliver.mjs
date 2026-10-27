// Delivers the day's film: the narrated master and the music cut (and the 4K ones when mastered), a contact sheet and
// the project's notes.md, to ~/Downloads/changelog-videos/changelog-<date>-film/.
//   npm run deliver
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {moments} from './moments.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const {episode, scenes} = moments();
const voice = JSON.parse(fs.readFileSync(path.join(ROOT, 'episode', 'voice.json'), 'utf8'));
const date = episode.date;
const dest = path.join(process.env.CHANGELOG_FILM_DELIVER ?? path.join(os.homedir(), 'Downloads', 'changelog-videos'), `changelog-${date}-film`);
const masters = fs.readdirSync(path.join(ROOT, 'out')).filter((f) => f.startsWith(`VSCode-Changelog-${date}-`) && f.endsWith('.mp4'));
const narrated = masters.find((f) => f === `VSCode-Changelog-${date}-1080p60.mp4`) ?? masters.find((f) => !f.includes('-music-'));
if (!narrated) {
  console.error(`deliver: no master of ${date} in out/: npm run master`);
  process.exit(1);
}
fs.mkdirSync(dest, {recursive: true});
for (const f of masters) fs.copyFileSync(path.join(ROOT, 'out', f), path.join(dest, f));
// The contact sheet: each change as its lens has focused, between the opening and the end card.
const pick = (id, k, label) => ({frame: scenes.find((s) => s.id === id).from + k, label});
const tiles = [
  pick('logo', 70, 'VS Code Changelog'),
  pick('stream', scenes.find((s) => s.id === 'stream').D - 10, `${episode.merged?.items.length ?? 0} pull requests`),
  pick('top', 44, `the top ${episode.changes.length}`),
  // Each change once its line has been said: every event has happened, and the next change hasn't begun.
  ...episode.changes.map((c) => {
    const s = scenes.find((x) => x.id === `c${c.rank}`);
    const line = voice.lines.find((l) => l.id === `c${c.rank}`);
    const k = Math.min(s.D - 24, line ? 50 + Math.round((line.end - line.start) * 60) + 10 : 114);
    return pick(`c${c.rank}`, k, `${String(c.rank).padStart(2, '0')} · ${c.headline}`);
  }),
  pick('end', 120, 'the end card'),
];
const spec = path.join(ROOT, 'out', `contact-${date}.json`);
fs.writeFileSync(spec, JSON.stringify(tiles));
execFileSync('uv', ['run', '--quiet', '--python', '3.12', '--with', 'pillow==13.0.0', 'python', path.join(ROOT, 'scripts', 'contact.py'), path.join(ROOT, 'out', narrated), spec, path.join(dest, 'contact.png'), `VS Code Changelog · ${episode.dateLong}`], {stdio: 'ignore'});
fs.rmSync(spec);
const notes = episode.source?.project && path.join(episode.source.project, 'notes.md');
if (notes && fs.existsSync(notes)) fs.copyFileSync(notes, path.join(dest, 'notes.md'));
const seconds = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path.join(dest, narrated)], {encoding: 'utf8'}));
console.log(`delivered: ${dest}\n  ${[...masters, 'contact.png', ...(fs.existsSync(path.join(dest, 'notes.md')) ? ['notes.md'] : [])].join('\n  ')}\n  ${seconds.toFixed(1)} s`);
