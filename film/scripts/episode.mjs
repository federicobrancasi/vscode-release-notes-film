// The day's episode, from the engine project (prs digest new, the recordings, the narration) and the film's own words
// and choices in the project's film.json. Writes what the film renders:
//   episode/episode.json    the day, its merges, and each change: headline, eyebrow, line, what it shows, the lens
//   episode/voice.json      the narration's lines and words, timed (from the project's prs voice)
//   episode/timeline.json   the edit (scripts/timeline.mjs), then the music fitted to it (npm run music)
//   public/screens/<date>/<demo>.mp4, public/voice/<date>.wav
// Usage: npm run episode -- <engine project> [--voice <dir with build/narration.wav>] [--no-music]
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {writeTimeline} from './timeline.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(`--${name}`);
  return i < 0 ? undefined : args[i + 1];
};
const project = args.find((a, i) => !a.startsWith('--') && !(i > 0 && ['--voice'].includes(args[i - 1])));
const read = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));
const fail = (msg) => {
  console.error(`episode: ${msg}`);
  process.exit(1);
};
if (!project || !fs.existsSync(path.join(project, 'picks.json'))) fail('usage: npm run episode -- <engine project: videos/changelog-<date>> [--voice <dir>] [--no-music]');
const filmFile = path.join(project, 'film.json');
if (!fs.existsSync(filmFile)) fail(`no ${filmFile}: write the film's lines and visuals first (SKILL.md, step 4)`);

const picks = read(path.join(project, 'picks.json'));
const film = read(filmFile);
const date = picks.date;
const NUMBER_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
const d = new Date(`${date}T12:00:00Z`);
const dateLong = d.toLocaleDateString('en-US', {weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC'});
const dateShort = d.toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC'});
/** The line's lead: the line starts this long after the window appears (src/beats.ts VO_AT - MORPH_AT). */
const LINE_LEAD = (50 - 34) / 60;

const screens = path.join(ROOT, 'public', 'screens', date);
fs.mkdirSync(screens, {recursive: true});

/** A demo's recording, encoded once from its frames at the window's size (an mp4 the film can seek frame by frame). */
const recording = (id) => {
  const dir = path.join(project, 'build', 'demos', id);
  if (!fs.existsSync(path.join(dir, 'demo.json'))) fail(`no recording of demo ${id}: run prs demo ${id} --slug ${path.basename(project)}`);
  const demo = read(path.join(dir, 'demo.json'));
  const mp4 = path.join(screens, `${id}.mp4`);
  const stale = !fs.existsSync(mp4) || fs.statSync(mp4).mtimeMs < fs.statSync(path.join(dir, 'demo.json')).mtimeMs;
  if (stale) {
    if (!fs.existsSync(path.join(dir, 'frames'))) fail(`demo ${id} has no frames left (the engine removes them after a week): record it again`);
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-framerate', String(demo.fps), '-i', path.join(dir, 'frames', '%05d.jpg'), '-c:v', 'libx264', '-preset', 'slow', '-crf', '12', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', mp4]);
  }
  const marks = Object.fromEntries(Object.entries(demo.marks ?? {}).map(([n, m]) => [n, {rect: m.rect, visible: m.visible}]));
  // Where the film starts it: where its narration starts (cue() paced it to the line), less the line's lead.
  const from = Math.max(0, Math.round(((demo.sync?.at ?? 0) - LINE_LEAD) * 100) / 100);
  return {kind: 'recording', demo: id, src: `screens/${date}/${id}.mp4`, fps: demo.fps, viewport: demo.viewport, duration: demo.duration, from, marks};
};

const changes = picks.picks.map((pick) => {
  const f = film.changes?.[String(pick.rank)];
  if (!f) fail(`film.json has no change ${pick.rank} (#${pick.number})`);
  for (const key of ['headline', 'say', 'visual']) if (!f[key]) fail(`film.json change ${pick.rank}: no ${key}`);
  const v = f.visual;
  const visual = v.demo ? recording(v.demo) : v.scene ? {kind: 'scene', name: v.scene.name, params: v.scene.params ?? {}} : fail(`film.json change ${pick.rank}: visual is {demo} or {scene: {name, params}}`);
  return {
    rank: pick.rank,
    number: pick.number,
    url: pick.url,
    author: pick.author,
    title: pick.title,
    headline: f.headline,
    eyebrow: f.eyebrow ?? null,
    say: f.say,
    visual,
    motion: f.motion ?? null,
  };
});

// The day's merges (the stream): the project's merged.json, fetched once.
const mergedFile = path.join(project, 'merged.json');
if (!fs.existsSync(mergedFile)) execFileSync('node', [path.join(ROOT, 'scripts', 'merged.mjs'), date, '--out', mergedFile], {stdio: 'inherit'});
const merged = read(mergedFile);

// The narration: the project's (prs voice of the film's lines), or --voice <dir>.
const voiceDir = path.resolve(flag('voice') ?? project);
const vt = path.join(voiceDir, 'build', 'timeline.json');
if (!fs.existsSync(vt)) fail(`no narration in ${voiceDir}/build: npm run lines -- ${project}, then prs voice ${path.basename(project)} --provider mai`);
const timing = read(vt);
fs.mkdirSync(path.join(ROOT, 'public', 'voice'), {recursive: true});
fs.copyFileSync(path.join(voiceDir, 'build', 'narration.wav'), path.join(ROOT, 'public', 'voice', `${date}.wav`));
const voice = {
  src: `voice/${date}.wav`,
  name: timing.voice?.name ?? null,
  lines: timing.beats.map((b) => ({id: b.id, start: b.start, end: b.end, text: b.text, words: (b.words ?? []).map((w) => ({w: w.display, a: w.a, b: w.b}))})),
};
for (const c of changes) if (!voice.lines.some((l) => l.id === `c${c.rank}`)) fail(`the narration has no line c${c.rank}: voice the film's lines again`);

const episode = {
  date,
  dateLong,
  dateShort,
  build: picks.build ? {name: picks.build.name, version: picks.build.version} : null,
  merged: {window: merged.window, items: merged.merged},
  intro: {say: film.intro ?? `${NUMBER_WORDS[merged.merged.length] ?? merged.merged.length} changes in a single day. Here are ${NUMBER_WORDS[changes.length]} you'll notice.`},
  changes,
  source: {project: path.resolve(project)},
};
const out = path.join(ROOT, 'episode');
fs.mkdirSync(out, {recursive: true});
fs.writeFileSync(path.join(out, 'episode.json'), `${JSON.stringify(episode, null, 1)}\n`);
fs.writeFileSync(path.join(out, 'voice.json'), `${JSON.stringify(voice, null, 2)}\n`);
console.log(`episode/episode.json: ${date}, ${changes.length} changes (${changes.map((c) => `${c.rank}:${c.visual.kind === 'recording' ? `rec ${c.visual.demo}` : c.visual.name}`).join(' ')}), ${merged.merged.length} merges`);
writeTimeline();
if (!args.includes('--no-music')) execFileSync('npm', ['run', '--silent', 'music'], {cwd: ROOT, stdio: 'inherit'});
