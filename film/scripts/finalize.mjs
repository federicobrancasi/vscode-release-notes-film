// Normalizes the rendered film's audio to -14 LUFS / -1 dBTP (two-pass loudnorm) and copies the video stream.
// Usage: node scripts/finalize.mjs <input.mp4> <output.mp4>
import {spawnSync} from 'node:child_process';

const [input, output] = process.argv.slice(2);
if (!input || !output) {
  console.error('Usage: node scripts/finalize.mjs <input.mp4> <output.mp4>');
  process.exit(1);
}

const CEILING = -1.2; // dBTP measured on the encoded file: the -1 dBTP spec, with margin for the meter's 0.1 dB rounding
const ffmpeg = (args) => spawnSync('ffmpeg', args, {encoding: 'utf8'});
const truePeak = (file) => {
  const r = ffmpeg(['-hide_banner', '-nostats', '-i', file, '-vn', '-af', 'ebur128=peak=true', '-f', 'null', '-']);
  const m = r.stderr.slice(r.stderr.lastIndexOf('True peak:')).match(/Peak:\s+(-?[\d.]+)/);
  return m ? parseFloat(m[1]) : NaN;
};

// When the mix is too peaky for a linear gain, loudnorm limits dynamically to TP, and the AAC encode can overshoot that
// by up to ~1 dB. So measure the encoded file and, if it's over the ceiling, redo pass 2 with TP 0.3 dB lower: the first
// target that fits wins, so the peaks are never limited harder than they need to be.
const TPS = [-1.5, -1.8, -2.1, -2.4, -2.7, -3.0];
let tp;
let json;
let peak;
const tried = [];
for (tp of TPS) {
  const target = `I=-14:TP=${tp}:LRA=11`;
  const pass1 = ffmpeg(['-hide_banner', '-nostats', '-i', input, '-vn', '-af', `loudnorm=${target}:print_format=json`, '-f', 'null', '-']);
  json = JSON.parse(pass1.stderr.slice(pass1.stderr.lastIndexOf('{'), pass1.stderr.lastIndexOf('}') + 1));
  const measured = `measured_I=${json.input_i}:measured_TP=${json.input_tp}:measured_LRA=${json.input_lra}:measured_thresh=${json.input_thresh}:offset=${json.target_offset}`;

  // The h264 stream is encoded with the BT.601 matrix (Remotion's default) but was tagged 'unknown', so players assumed
  // BT.709 and shifted saturated colours. Tag it correctly without re-encoding.
  const pass2 = ffmpeg(['-v', 'error', '-y', '-i', input, '-c:v', 'copy', '-bsf:v', 'h264_metadata=matrix_coefficients=6:colour_primaries=1:transfer_characteristics=13', '-colorspace', 'smpte170m', '-color_primaries', 'bt709', '-color_trc', 'iec61966-2-1', '-af', `loudnorm=${target}:${measured}:linear=true,aresample=48000`, '-c:a', 'aac', '-b:a', '320k', '-movflags', '+faststart', output]);
  if (pass2.status !== 0) {
    console.error(pass2.stderr);
    process.exit(1);
  }
  peak = truePeak(output);
  tried.push(`TP ${tp} → ${peak}`);
  if (peak <= CEILING) break;
}
if (!(peak <= CEILING)) {
  console.error(`finalize: ${output} is still above ${CEILING} dBTP after every limiter target (${tried.join(', ')}). Lower the mix (music or effects volume) and render again.`);
  process.exit(1);
}
console.log(`finalize: ${input} (${json.input_i} LUFS) → ${output} (target -14 LUFS; true peak ${peak} dBTP; ${tried.join(', ')})`);
