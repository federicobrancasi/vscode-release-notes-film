// The scene library's gallery: every scene of src/scenes/library.json shown the way the film shows a change.
//   npm run gallery -- --review [name,name]   stills of each scene at four moments, a sheet per scene
//                                             (out/gallery/review/<name>.png): to check a scene you made or changed
//   npm run gallery                           the reel (every scene, about two minutes) and its contact sheet, delivered
//                                             to ~/Downloads/changelog-videos/changelog-film-scenes/
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {stills} from './stills.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const library = JSON.parse(fs.readFileSync(path.join(ROOT, 'src', 'scenes', 'library.json'), 'utf8'));
const NAMES = Object.keys(library);
// src/Gallery.tsx
const INTRO = 120;
const SCENE = 300;
/** The moments of a scene, in frames into it: the window landed, the lens focused, its events, late. */
const MOMENTS = [
  [60, 'the window has landed'],
  [120, 'the lens, focused'],
  [190, 'its change'],
  [270, 'late, before the next'],
];
const uv = (script, args) => execFileSync('uv', ['run', '--quiet', '--python', '3.12', '--with', 'pillow==13.0.0', 'python', path.join(ROOT, 'scripts', script), ...args], {stdio: 'inherit'});

const args = process.argv.slice(2);
if (args.includes('--review')) {
  const only = args.find((a) => !a.startsWith('--'))?.split(',');
  const names = NAMES.filter((n) => !only || only.includes(n));
  const dir = path.join(ROOT, 'out', 'gallery', 'review');
  fs.rmSync(dir, {recursive: true, force: true});
  const frames = names.flatMap((n) => MOMENTS.map(([k]) => INTRO + NAMES.indexOf(n) * SCENE + k));
  console.log(`gallery review: ${frames.length} stills of ${names.length} scenes…`);
  await stills({outDir: path.join(dir, 'frames'), frames, id: 'Scenes', log: false});
  const sheets = names.map((n) => ({
    out: path.join(dir, `${n}.png`),
    title: `${n} · ${library[n].title} · ${library[n].for}`,
    tiles: MOMENTS.map(([k, what]) => ({file: path.join(dir, 'frames', `frame-${String(INTRO + NAMES.indexOf(n) * SCENE + k).padStart(4, '0')}.png`), label: `+${k} · ${what} · events: ${Object.keys(library[n].events).join(', ') || 'none'}`})),
  }));
  fs.writeFileSync(path.join(dir, 'sheets.json'), JSON.stringify({sheets}));
  uv('sheets.py', [path.join(dir, 'sheets.json')]);
} else {
  const out = path.join(ROOT, 'out', 'gallery');
  fs.mkdirSync(out, {recursive: true});
  const reel = path.join(out, 'changelog-film-scenes-1080p60.mp4');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'cf-gallery-'));
  try {
    execFileSync('npx', ['remotion', 'render', 'Scenes', reel, '--crf=16', '--audio-bitrate=320k', '--color-space=bt709', '--pixel-format=yuv420p', '--concurrency=4', '--log=error'], {cwd: ROOT, stdio: 'inherit', env: {...process.env, TMPDIR: tmp}});
  } finally {
    fs.rmSync(tmp, {recursive: true, force: true});
  }
  // The contact sheet: each scene as its change happens.
  const spec = path.join(out, 'contact.json');
  fs.writeFileSync(spec, JSON.stringify(NAMES.map((n, i) => ({frame: INTRO + i * SCENE + 190, label: `${String(i + 1).padStart(2, '0')} · ${n} · ${library[n].title}`}))));
  const dest = path.join(process.env.CHANGELOG_FILM_DELIVER ?? path.join(os.homedir(), 'Downloads', 'changelog-videos'), 'changelog-film-scenes');
  fs.mkdirSync(dest, {recursive: true});
  uv('contact.py', [reel, spec, path.join(dest, 'contact.png'), `The scene library · ${NAMES.length} scenes`]);
  fs.copyFileSync(reel, path.join(dest, path.basename(reel)));
  console.log(`gallery: ${dest}`);
}
