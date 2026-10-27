// Frames of a composition as PNGs, from one bundle and one browser: the review's key moments, the master's fresh stills
// of the frames its renders disagree on, the gallery's contact sheet.
//   node scripts/stills.mjs <out-dir> <frame>,<frame>… [--scale=1] [--composition=Film] [--props='{"voice":false}']
import {bundle} from '@remotion/bundler';
import {openBrowser, renderStill, selectComposition} from '@remotion/renderer';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** Renders `frames` of composition `id` into `outDir` (<name>-NNNN.png); returns the files. */
export async function stills({outDir, frames, id = 'Film', scale = 1, inputProps = {}, name = 'frame', log = true}) {
  fs.mkdirSync(outDir, {recursive: true});
  // A private temp folder: the bundle is a copy of public/, removed at the end.
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'cf-stills-'));
  const serveUrl = await bundle({entryPoint: path.join(ROOT, 'src/index.ts'), publicDir: path.join(ROOT, 'public'), outDir: path.join(tmp, 'bundle')});
  // One browser for every still (a fresh one per still made later stills fail to load the bundle).
  const browser = await openBrowser('chrome');
  const files = [];
  let failed = 0;
  try {
    const composition = await selectComposition({serveUrl, id, inputProps, puppeteerInstance: browser});
    for (const frame of frames) {
      const output = path.join(outDir, `${name}-${String(frame).padStart(4, '0')}.png`);
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          await renderStill({serveUrl, composition, frame, output, inputProps, scale, imageFormat: 'png', puppeteerInstance: browser});
          files.push(output);
          if (log) console.log(path.relative(process.cwd(), output));
          break;
        } catch (err) {
          console.warn(`still ${frame} attempt ${attempt} failed: ${String(err.message ?? err).split('\n')[0]}`);
          if (attempt === 2) failed++;
        }
      }
    }
  } finally {
    await browser.close({silent: true});
    fs.rmSync(tmp, {recursive: true, force: true});
  }
  if (failed) throw new Error(`${failed} still(s) failed`);
  return files;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [outDir, list] = process.argv.slice(2).filter((a) => !a.startsWith('--'));
  const flag = (n, d) => process.argv.find((a) => a.startsWith(`--${n}=`))?.slice(n.length + 3) ?? d;
  if (!outDir || !list) {
    console.error('usage: node scripts/stills.mjs <out-dir> <frame>,<frame>… [--scale=1] [--composition=Film] [--props=JSON]');
    process.exit(1);
  }
  await stills({outDir: path.resolve(outDir), frames: list.split(',').map(Number), id: flag('composition', 'Film'), scale: Number(flag('scale', 1)), inputProps: JSON.parse(flag('props', '{}'))});
}
