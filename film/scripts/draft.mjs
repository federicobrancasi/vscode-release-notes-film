// A quick look at the whole film: half size, narrated, out/draft-<date>.mp4 (a minute or two to render).
//   npm run draft
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const {date} = JSON.parse(fs.readFileSync(path.join(ROOT, 'episode', 'episode.json'), 'utf8'));
const out = path.join('out', `draft-${date}.mp4`);
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'cf-draft-'));
try {
  execFileSync('npx', ['remotion', 'render', 'Film', out, '--scale=0.5', '--crf=26', '--concurrency=4', '--log=error'], {cwd: ROOT, stdio: 'inherit', env: {...process.env, TMPDIR: tmp}});
} finally {
  fs.rmSync(tmp, {recursive: true, force: true});
}
console.log(`draft: ${out}`);
