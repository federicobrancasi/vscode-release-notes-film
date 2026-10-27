#!/usr/bin/env node
// Gets the changelog film ready and prints what the skill uses, as its last lines:
//   ENGINE=<folder>   a copy of the changelog-videos engine that takes the report's top ten (PRS_TOP)
//   PRS=<file>        `prs` for the film: that engine, in the film's own home (its projects, the voice at the film's pace)
//   VIDEOS=<folder>   where the engine makes the film's projects (videos/changelog-<date>/)
//   FILM=<folder>     the Remotion project that renders the film
//
// The engine comes from the changelog-videos plugin (vscode-team-kit): this runs the plugin's own setup, then copies
// the engine it set up into ~/.cache/changelog-film/engine/<its version>-top10/ and patches the copy to take ten picks
// (cli/lib/report.mjs: PRS_TOP; cli/lib/digest.mjs: number words to twelve, budgets that scale with the picks). The
// plugin and its engine are never changed. The film's home (~/.cache/changelog-film/home) shares the plugin's voice,
// builds and packages (links), with its own settings: the voice at pace 1.2, as the film is cut. The first run also
// installs the film's packages and the Oct 19 example episode, so the Studio opens on the standard.
// Node built-ins only. CHANGELOG_FILM_HOME moves the home; CHANGELOG_VIDEOS_PLUGIN names the plugin's folder.
//
// Usage: node scripts/setup.mjs

import {execFileSync, spawnSync} from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FILM = path.join(REPO, 'film');
const EXAMPLE = path.join(REPO, 'skills', 'generate-changelog-film', 'example', '2026-10-19');
const HOME = process.env.CHANGELOG_FILM_HOME ? path.resolve(process.env.CHANGELOG_FILM_HOME) : path.join(os.homedir(), '.cache', 'changelog-film');
const VIDEOS_HOME = process.env.CHANGELOG_VIDEOS_HOME ? path.resolve(process.env.CHANGELOG_VIDEOS_HOME) : path.join(os.homedir(), '.cache', 'changelog-videos');
/** The film's voice pace: its lines are short, said as each change is shown. */
const PACE = 1.2;
/** Bump when the patch below changes, so copies are made again. */
const PATCH = 'top10-1';

const fail = (msg) => {
  console.error(`setup: ${msg}`);
  process.exit(1);
};
const has = (cmd, args = ['--version']) => spawnSync(cmd, args, {stdio: 'ignore'}).status === 0;

// ---- What the film needs on this machine ----------------------------------------------------------------------------

if (process.platform === 'win32') fail('the changelog film runs on macOS and Linux');
if (Number(process.versions.node.split('.')[0]) < 20) fail(`it needs Node.js 20 or newer; this is ${process.version}`);
for (const [cmd, why] of [
  ['ffmpeg', 'encodes the recordings and the masters'],
  ['ffprobe', 'measures them'],
  ['uv', 'runs the music fit, the vote and the review (Python, installed on demand)'],
  ['gh', 'reads the #changelog report and the day\'s merges'],
]) {
  if (!has(cmd, cmd === 'gh' ? ['--version'] : cmd === 'uv' ? ['--version'] : ['-version'])) fail(`${cmd} is not installed: it ${why}`);
}
const insiders = process.platform === 'darwin' ? fs.existsSync('/Applications/Visual Studio Code - Insiders.app') : has('code-insiders');
if (!insiders) console.error('setup: VS Code Insiders is not installed: recordings will use the build prs digest new downloads');

// ---- The changelog-videos plugin and its engine ---------------------------------------------------------------------

/** The changelog-videos plugin's folder: CHANGELOG_VIDEOS_PLUGIN, else where Copilot and VS Code install plugins. */
const findPlugin = () => {
  if (process.env.CHANGELOG_VIDEOS_PLUGIN) return path.resolve(process.env.CHANGELOG_VIDEOS_PLUGIN);
  const roots = [
    path.join(os.homedir(), '.copilot', 'Library', 'Caches', 'copilot', 'marketplaces'),
    path.join(os.homedir(), 'Library', 'Caches', 'copilot', 'marketplaces'),
    path.join(os.homedir(), '.cache', 'copilot', 'marketplaces'),
    path.join(os.homedir(), '.copilot', 'installed-plugins'),
    path.join(os.homedir(), '.copilot', 'plugins'),
  ];
  for (const root of roots) {
    if (!fs.existsSync(root)) continue;
    for (const market of fs.readdirSync(root)) {
      for (const dir of [path.join(root, market, 'changelog-videos'), path.join(root, market, 'plugins', 'changelog-videos')]) {
        if (fs.existsSync(path.join(dir, 'scripts', 'setup.mjs'))) return dir;
      }
    }
  }
  return null;
};
const plugin = findPlugin();
if (!plugin) fail('the changelog-videos plugin (vscode-team-kit) is not installed: install it, or set CHANGELOG_VIDEOS_PLUGIN to its folder');
const pluginSetup = spawnSync(process.execPath, [path.join(plugin, 'scripts', 'setup.mjs')], {encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit']});
const source = pluginSetup.stdout?.match(/^ENGINE=(.+)$/m)?.[1]?.trim();
if (pluginSetup.status !== 0 || !source) fail(`the changelog-videos setup failed (${path.join(plugin, 'scripts', 'setup.mjs')})`);

// ---- The film's engine: a copy that takes the top ten ---------------------------------------------------------------

const SKIP = new Set(['node_modules', 'videos', '.DS_Store', '__pycache__', '.setup-ready']);
const copyTree = (from, to) => {
  fs.mkdirSync(to, {recursive: true});
  for (const e of fs.readdirSync(from, {withFileTypes: true})) {
    if (SKIP.has(e.name)) continue;
    const a = path.join(from, e.name);
    const b = path.join(to, e.name);
    if (e.isDirectory()) copyTree(a, b);
    else if (e.isFile()) fs.copyFileSync(a, b);
  }
};
/** The patch: each file's replacements, every one of which must apply (an engine that changed fails here, loudly). */
const PATCHES = {
  'cli/lib/report.mjs': [
    ['const TOP = 5;', '// changelog-film: PRS_TOP=10 takes the main message\'s picks, then the thread\'s.\nconst TOP = Number(process.env.PRS_TOP) || 5;'],
    ["\treturn report.picks.filter(p => p.section === 'main').slice(0, TOP);", "\tconst main = report.picks.filter(p => p.section === 'main');\n\treturn (TOP <= main.length ? main : report.picks).slice(0, TOP);"],
  ],
  'cli/lib/digest.mjs': [
    ["const NUMBERS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven'];", "const NUMBERS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];"],
    [
      "\tnotes.push(`narration: ${words} words (about 150 make a 55-60 s video)`);\n\tif (words > 175) {\n\t\tproblems.push(`the narration has ${words} words: cut it to about 150 (the video should run under a minute)`);",
      "\t// changelog-film: the budgets scale with the number of picks (150 words and a minute for five).\n\tconst budget = Math.round(30 * storyboard.beats.filter(b => /^c\\d+$/.test(b.id)).length);\n\tnotes.push(`narration: ${words} words (about ${budget})`);\n\tif (words > Math.round(budget * 35 / 30)) {\n\t\tproblems.push(`the narration has ${words} words: cut it to about ${budget}`);",
    ],
    [
      "\t\t\tif (data.total > 75) {\n\t\t\t\tproblems.push(`the video runs ${data.total.toFixed(1)} s: aim for 55-65 s (shorter narration, faster clips: clip.after)`);",
      "\t\t\tconst chapters = data.segments.filter(x => x.kind === 'chapter').length;\n\t\t\tif (data.total > 15 * chapters) {\n\t\t\t\tproblems.push(`the video runs ${data.total.toFixed(1)} s: aim for ${11 * chapters}-${13 * chapters} s (shorter narration, faster clips: clip.after)`);",
    ],
  ],
};
const version = `${path.basename(source)}-${PATCH}`;
const engine = path.join(HOME, 'engine', version);
const homeDir = path.join(HOME, 'home');
const videos = path.join(homeDir, 'work', 'videos');
fs.mkdirSync(videos, {recursive: true});
if (!fs.existsSync(path.join(engine, '.film-ready'))) {
  console.error(`Setting up the film's engine (${version}) in ${engine}...`);
  const partial = `${engine}.partial-${process.pid}`;
  fs.rmSync(partial, {recursive: true, force: true});
  copyTree(source, partial);
  for (const [file, pairs] of Object.entries(PATCHES)) {
    const p = path.join(partial, file);
    let text = fs.readFileSync(p, 'utf8');
    for (const [a, b] of pairs) {
      if (!text.includes(a)) {
        fs.rmSync(partial, {recursive: true, force: true});
        fail(`the engine changed (${file} no longer has the lines the top-ten patch replaces): update PATCHES in scripts/setup.mjs`);
      }
      text = text.replace(a, b);
    }
    fs.writeFileSync(p, text);
  }
  fs.symlinkSync(fs.readlinkSync(path.join(source, 'node_modules')), path.join(partial, 'node_modules'), 'dir');
  fs.symlinkSync(videos, path.join(partial, 'videos'), 'dir');
  fs.writeFileSync(path.join(partial, '.film-ready'), `${version}\n`);
  fs.rmSync(engine, {recursive: true, force: true});
  fs.renameSync(partial, engine);
}

// ---- The film's home: the plugin's voice, builds and packages, its own settings ------------------------------------

for (const name of ['bin', 'builds', 'deps', 'http', 'kokoro', 'venv']) {
  const target = path.join(VIDEOS_HOME, name);
  const at = path.join(homeDir, name);
  fs.mkdirSync(target, {recursive: true});
  try {
    if (fs.readlinkSync(at) === target) continue;
    fs.rmSync(at, {force: true});
  } catch {
    if (fs.existsSync(at)) continue;
  }
  fs.symlinkSync(target, at, 'dir');
}
const pluginConfig = path.join(VIDEOS_HOME, 'config.json');
const config = fs.existsSync(pluginConfig) ? JSON.parse(fs.readFileSync(pluginConfig, 'utf8')) : {};
config.voice = {...(config.voice ?? {}), pace: PACE};
fs.writeFileSync(path.join(homeDir, 'config.json'), `${JSON.stringify(config, null, '\t')}\n`);
const prs = path.join(HOME, 'prs');
fs.writeFileSync(prs, `#!/bin/sh\n# prs for the changelog film: the top-ten engine, in the film's home (written by changelog-film's setup).\nexport CHANGELOG_VIDEOS_HOME="${homeDir}"\nexport PRS_TOP="\${PRS_TOP:-10}"\nexec node "${path.join(engine, 'cli', 'prs.mjs')}" "$@"\n`);
fs.chmodSync(prs, 0o755);

// ---- The film: its packages, and the example episode the first time -------------------------------------------------

const lock = crypto.createHash('sha256').update(fs.readFileSync(path.join(FILM, 'package-lock.json'))).digest('hex').slice(0, 12);
const marker = path.join(FILM, 'node_modules', '.film-lock');
if (!fs.existsSync(marker) || fs.readFileSync(marker, 'utf8').trim() !== lock) {
  console.error('Installing the film\'s packages (npm ci)...');
  execFileSync('npm', ['ci', '--no-audit', '--no-fund', '--loglevel=error'], {cwd: FILM, stdio: ['ignore', 'inherit', 'inherit']});
  fs.writeFileSync(marker, `${lock}\n`);
}
if (!fs.existsSync(path.join(FILM, 'episode', 'episode.json'))) {
  console.error('Installing the example episode (Oct 19, 2026)...');
  fs.mkdirSync(path.join(FILM, 'episode'), {recursive: true});
  for (const f of ['episode.json', 'voice.json', 'timeline.json']) fs.copyFileSync(path.join(EXAMPLE, 'episode', f), path.join(FILM, 'episode', f));
  copyTree(path.join(EXAMPLE, 'media'), path.join(FILM, 'public'));
  execFileSync('npm', ['run', '--silent', 'music'], {cwd: FILM, stdio: ['ignore', 'inherit', 'inherit']});
}

console.log(`ENGINE=${engine}`);
console.log(`PRS=${prs}`);
console.log(`VIDEOS=${videos}`);
console.log(`FILM=${FILM}`);
