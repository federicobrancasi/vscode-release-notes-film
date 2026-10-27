// What's wrong with a day's film.json, before it's voiced or rendered: every change is there with its headline, its
// line and what it shows; the words keep Federico's rules; a drawn scene exists and its labels are the PR's own words;
// each sync word is in its line; each lens block is inside the window; each recording is recorded. With the
// narration made, also that it says the lines as written. Exits 1 on a problem; notes are for the agent to judge.
// Usage: npm run check -- <engine project>
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const project = process.argv[2];
const read = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));
if (!project || !fs.existsSync(path.join(project, 'picks.json'))) {
  console.error('usage: npm run check -- <engine project: videos/changelog-<date>>');
  process.exit(1);
}
const filmFile = path.join(project, 'film.json');
if (!fs.existsSync(filmFile)) {
  console.error(`check: no ${filmFile} (SKILL.md, step 4)`);
  process.exit(1);
}
const picks = read(path.join(project, 'picks.json'));
const film = read(filmFile);
const library = read(path.join(ROOT, 'src', 'scenes', 'library.json'));
const problems = [];
const notes = [];
const words = (s) => String(s ?? '').split(/\s+/).filter(Boolean);
const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9#]/g, '');
const flat = (s) => String(s).toLowerCase().replace(/\s+/g, ' ').trim();
/** Words the film never says or shows: the build a change ships in isn't the change (Federico, round 4). */
const BUILD_WORDS = /\b(stable|insiders?|exploration build)\b/i;
const MAX_LINE = 12;
const MAX_HEADLINE = 52;
const MAX_EYEBROW = 26;
/** The largest block the lens shows whole, at its least magnification (src/changes/Loupe.tsx: (LENS_MAX - PAD) / T_MIN). */
const MAX_BLOCK = {w: 670, h: 420};
/**
 * When the lens is on, in window frames (src/beats.ts: ARRIVE), from when the line starts (VO_AT - MORPH_AT): a sync
 * word said before then can't have its event on it. `slack`: the few frames a scene's event may wait for the lens.
 */
const LENS = {voAt: 50, morphAt: 34, arrive: 54, slack: 6};

const get = (o, key) => key.split('.').reduce((x, k) => (x && typeof x === 'object' ? x[k] : undefined), o);
/**
 * The strings at a param path: "title", "after.text", "actions[]" (a list of strings), "items[].label" (a field of each
 * item), "items[isNew].label" (only the items with isNew set). Bold markers (**…**) aren't the PR's words: they go.
 */
const valuesAt = (params, key) => {
  const m = key.match(/^([\w.]+)\[(\w*)\](?:\.([\w.]+))?$/);
  const strings = (xs) => xs.filter((v) => typeof v === 'string' && v.trim()).map((v) => v.replace(/\*\*/g, ''));
  if (!m) return strings([get(params, key)]);
  const [, head, only, field] = m;
  const list = get(params, head);
  if (!Array.isArray(list)) return [];
  return strings(list.filter((x) => !only || (x && typeof x === 'object' && x[only])).map((x) => (field ? get(x, field) : typeof x === 'object' ? x?.label : x)));
};

const videos = path.dirname(path.resolve(project));
const diffOf = (pick) => {
  const file = path.join(videos, pick.slug ?? `microsoft-vscode-${pick.number}`, 'pr.diff');
  return fs.existsSync(file) ? flat(fs.readFileSync(file, 'utf8').replace(/^[+-]/gm, '')) : null;
};
/** The diff's strings with placeholders ("Install and enable '{0}'?"), as patterns: a drawn label fills them in. */
const templatesOf = (pick) => {
  const file = path.join(videos, pick.slug ?? `microsoft-vscode-${pick.number}`, 'pr.diff');
  if (!fs.existsSync(file)) return [];
  const literals = fs.readFileSync(file, 'utf8').matchAll(/"((?:[^"\\\n]|\\.)*\{\d+\}(?:[^"\\\n]|\\.)*)"/g);
  return [...literals].map((m) => new RegExp(`^${flat(m[1]).replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\\\{\d+\\\}/g, '.+')}$`));
};

if (!film.intro) problems.push('no intro line ("intro")');
else if (words(film.intro).length > 14) problems.push(`the intro has ${words(film.intro).length} words: at most 14`);

const timingFile = path.join(project, 'build', 'timeline.json');
const timing = fs.existsSync(timingFile) ? read(timingFile) : null;
const spoken = (id) => timing?.beats.find((b) => b.id === id);

for (const pick of picks.picks) {
  const id = `c${pick.rank}`;
  const c = film.changes?.[String(pick.rank)];
  const at = `${id} (#${pick.number})`;
  if (!c) {
    problems.push(`${at}: not in film.json`);
    continue;
  }
  if (!c.headline) problems.push(`${at}: no headline`);
  else if (c.headline.length > MAX_HEADLINE) problems.push(`${at}: the headline has ${c.headline.length} characters: at most ${MAX_HEADLINE}`);
  if (c.eyebrow && c.eyebrow.length > MAX_EYEBROW) problems.push(`${at}: the eyebrow has ${c.eyebrow.length} characters: at most ${MAX_EYEBROW}`);
  if (!c.say) problems.push(`${at}: no line ("say")`);
  else if (words(c.say).length > MAX_LINE) problems.push(`${at}: the line has ${words(c.say).length} words: at most ${MAX_LINE}`);
  for (const [field, text] of [['headline', c.headline], ['eyebrow', c.eyebrow], ['line', c.say]]) {
    if (text && BUILD_WORDS.test(text)) problems.push(`${at}: the ${field} names a build ("${text.match(BUILD_WORDS)[0]}"): say what changed, not where it shipped`);
  }
  for (const [event, word] of Object.entries(c.motion?.sync ?? {})) {
    if (!words(c.say).some((w) => norm(w).startsWith(norm(word)))) problems.push(`${at}: sync ${event}: "${word}" isn't a word of its line`);
  }
  const block = c.motion?.loupe?.block;
  if (block) {
    const [x, y, w, h] = block;
    if (block.length !== 4 || x < 0 || y < 0 || x + w > 1280 || y + h > 720) problems.push(`${at}: the lens block [${block}] isn't inside the 1280×720 window`);
    else if (w < 120 || h < 60) problems.push(`${at}: the lens block [${block}] is a lone control: frame the whole block that changed`);
    else if (w > MAX_BLOCK.w || h > MAX_BLOCK.h) problems.push(`${at}: the lens block [${block}] is bigger than the lens shows whole (${MAX_BLOCK.w} × ${MAX_BLOCK.h} at most): frame less`);
  }
  const v = c.visual ?? {};
  if (v.demo) {
    const demoFile = path.join(project, 'build', 'demos', v.demo, 'demo.json');
    // A recording is made after the narration (SKILL.md, step 6): before it, that it isn't made yet is a note.
    if (!fs.existsSync(demoFile)) (timing ? problems : notes).push(`${at}: demo ${v.demo} isn't recorded (prs demo ${v.demo}${timing ? '' : ', after prs voice'})`);
    else {
      const demo = read(demoFile);
      for (const m of c.motion?.hero ?? []) if (!demo.marks?.[m]) problems.push(`${at}: hero "${m}" isn't a mark of demo ${v.demo} (${Object.keys(demo.marks ?? {}).join(', ')})`);
      const from = c.motion?.from ?? Math.max(0, (demo.sync?.at ?? 0) - 16 / 60);
      if (from > demo.duration - 4) problems.push(`${at}: demo ${v.demo} plays from ${from}s but is ${demo.duration}s long: it needs 4 s from there`);
      if (!demo.sync && c.motion?.from === undefined) notes.push(`${at}: demo ${v.demo} has no narration sync (record it after prs voice, with cue()), so it plays from 0 s: set motion.from`);
      if (!block && !(c.motion?.hero ?? []).length) notes.push(`${at}: no lens block: the lens frames all of demo ${v.demo}'s marks`);
    }
  } else if (v.scene) {
    const def = library[v.scene.name];
    if (!def) problems.push(`${at}: the library has no scene "${v.scene.name}" (${Object.keys(library).join(', ')})`);
    else {
      const params = v.scene.params ?? {};
      for (const ev of Object.keys(c.motion?.sync ?? {})) if (!def.events?.[ev]) problems.push(`${at}: ${v.scene.name} has no event "${ev}" (it has: ${Object.keys(def.events ?? {}).join(', ') || 'none'})`);
      for (const ev of Object.keys(def.events ?? {})) if (!c.motion?.sync?.[ev]) notes.push(`${at}: ${v.scene.name}'s ${ev} isn't on a word (motion.sync.${ev}): it happens at its default time`);
      const diff = diffOf(pick);
      for (const key of def.strings ?? []) {
        for (const s of valuesAt(params, key)) {
          if (!diff) notes.push(`${at}: no pr.diff to check "${s}" against`);
          else if (!diff.includes(flat(s)) && !templatesOf(pick).some((t) => t.test(flat(s)))) problems.push(`${at}: ${v.scene.name} ${key} "${s}" isn't in the PR's diff: quote its strings exactly`);
        }
      }
    }
  } else problems.push(`${at}: no visual ({demo: "c2"} or {scene: {name, params}})`);
  if (timing && c.say) {
    const line = spoken(id);
    if (!line) problems.push(`${at}: the narration has no line ${id}: npm run lines, then prs voice`);
    else if (norm(line.text) !== norm(c.say)) problems.push(`${at}: the narration says "${line.text}", film.json "${c.say}": npm run lines, then prs voice --redo ${id}`);
    else if (v.scene) {
      // A drawn event waits for the lens: one on a word said before the lens is on can't be on its word (the review's
      // stills show the word's moment, not the event's, so it isn't seen there).
      for (const [event, word] of Object.entries(c.motion?.sync ?? {})) {
        const w = (line.words ?? []).find((x) => norm(x.display ?? x.w ?? '').startsWith(norm(word)));
        const fv = w ? LENS.voAt - LENS.morphAt + Math.round((w.a - line.start) * 60) : null;
        if (fv !== null && fv < LENS.arrive - LENS.slack) problems.push(`${at}: sync ${event}: "${word}" is said ${(w.a - line.start).toFixed(2)} s into the line, before the lens is on (about ${((LENS.arrive - LENS.voAt + LENS.morphAt) / 60).toFixed(1)} s in): the event can't be on it; pick a later word, or reword the line`);
      }
    }
  }
}
if (timing && film.intro && spoken('intro') && norm(spoken('intro').text) !== norm(film.intro)) problems.push(`intro: the narration says "${spoken('intro').text}": voice it again`);
if (!timing) notes.push('no narration yet (npm run lines, then prs voice): the line and sync checks ran on film.json alone');

for (const n of notes) console.log(`note: ${n}`);
for (const p of problems) console.log(`PROBLEM: ${p}`);
console.log(problems.length ? `check: ${problems.length} problem${problems.length > 1 ? 's' : ''}` : `check: film.json is ready (${picks.picks.length} changes${timing ? ', narration in step' : ''})`);
process.exit(problems.length ? 1 : 0);
