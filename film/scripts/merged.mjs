// The day's merges into microsoft/vscode, for the film's stream: the #changelog report's window (from 08:00 UTC the day
// before to 08:30 UTC on the day, when the report runs), oldest first. The episode fetches them once into the project.
//   node scripts/merged.mjs <YYYY-MM-DD> --out <file> [--from <ISO> --to <ISO>]
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const date = args.find((a) => /^\d{4}-\d{2}-\d{2}$/.test(a));
const flag = (name) => {
  const i = args.indexOf(`--${name}`);
  return i < 0 ? undefined : args[i + 1];
};
const out = flag('out');
if (!date || !out) {
  console.error('usage: node scripts/merged.mjs <YYYY-MM-DD> --out <file> [--from <ISO> --to <ISO>]');
  process.exit(1);
}
const day = new Date(`${date}T00:00:00Z`);
const before = new Date(day.getTime() - 24 * 3600 * 1000).toISOString().slice(0, 10);
const from = flag('from') ?? `${before}T08:00:00Z`;
const to = flag('to') ?? `${date}T08:30:00Z`;
const json = execFileSync('gh', ['search', 'prs', '--repo', 'microsoft/vscode', '--merged', '--merged-at', `${from}..${to}`, '--limit', '200', '--json', 'number,title,closedAt'], {encoding: 'utf8'});
const merged = JSON.parse(json)
  .sort((a, b) => a.closedAt.localeCompare(b.closedAt))
  .map((r) => ({n: r.number, t: r.title, at: r.closedAt}));
fs.mkdirSync(path.dirname(path.resolve(out)), {recursive: true});
fs.writeFileSync(out, `${JSON.stringify({window: [from, to], merged}, null, 1)}\n`);
console.log(`${out}: ${merged.length} pull requests merged between ${from} and ${to}`);
