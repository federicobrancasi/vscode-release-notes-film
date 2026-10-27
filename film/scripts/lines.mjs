// The film's lines into the engine project, for the engine to voice and to pace the recordings by: storyboard.json
// (the intro and one line per change, from film.json) and a digest.json that only says which chapter shows which demo,
// at the narration's own pace (tempo 1), so a demo's cue('phrase') waits for the film's line to say it.
// Then: prs voice <slug> --provider mai (MAI-Voice-2 at the film's pace, every word timed).
// Usage: npm run lines -- <engine project>
import fs from 'node:fs';
import path from 'node:path';

const project = process.argv[2];
const read = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));
const fail = (msg) => {
  console.error(`lines: ${msg}`);
  process.exit(1);
};
if (!project || !fs.existsSync(path.join(project, 'picks.json'))) fail('usage: npm run lines -- <engine project: videos/changelog-<date>>');
const filmFile = path.join(project, 'film.json');
if (!fs.existsSync(filmFile)) fail(`no ${filmFile}: write the film's lines first (SKILL.md, step 4)`);
const picks = read(path.join(project, 'picks.json'));
const film = read(filmFile);
const MARK = "written by changelog-film's npm run lines: the film's narration, not a changelog-videos digest";

const beats = [{id: 'intro', say: film.intro}];
const chapters = {};
for (const pick of picks.picks) {
  const c = film.changes?.[String(pick.rank)];
  if (!c?.say) fail(`film.json change ${pick.rank} (#${pick.number}) has no line ("say")`);
  beats.push({id: `c${pick.rank}`, say: c.say});
  chapters[`c${pick.rank}`] = {pick: pick.rank, visual: c.visual?.demo ? {demo: c.visual.demo} : {scene: {name: c.visual?.scene?.name ?? 'card', params: {}}}};
}
if (!film.intro) fail('film.json has no intro line ("intro")');

// The project's digest.json: the film's (from an earlier run), or the skeleton prs digest new writes (every headline
// still TODO), are replaced; a changelog-videos digest someone wrote is never touched.
const digestFile = path.join(project, 'digest.json');
const isSkeleton = (d) => Object.values(d.chapters ?? {}).every((c) => String(c.headline ?? 'TODO').startsWith('TODO'));
if (fs.existsSync(digestFile)) {
  const d = read(digestFile);
  if (d.film !== MARK && !isSkeleton(d)) fail(`${digestFile} is a changelog-videos digest someone wrote: make the film in its own project (SKILL.md, step 1)`);
}
fs.writeFileSync(path.join(project, 'storyboard.json'), `${JSON.stringify({pronounce: film.pronounce ?? {}, beats: beats.map((b) => ({...b, need: 'digest', cues: {}, claims: []}))}, null, '\t')}\n`);
fs.writeFileSync(digestFile, `${JSON.stringify({film: MARK, timing: {tempo: 1}, chapters}, null, '\t')}\n`);
const words = beats.reduce((n, b) => n + b.say.split(/\s+/).filter(Boolean).length, 0);
console.log(`${path.join(project, 'storyboard.json')}: ${beats.length} lines, ${words} words; next: prs voice ${path.basename(project)} --provider mai`);
