import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Cue} from '../cues';
import {BLUE, MONO, SANS, THEME as t} from '../design';
import {Ground} from '../kit/Ground';
import {EP} from '../episode';
import {expo, Words} from '../kit/Kinetic';
import {Icon, IconGlow} from '../kit/Logo';
import {clamp, lerp, settle} from '../motion';

// The logo: a line of light scans the dark, the VS Code icon swings in out of a blur with light rays
// turning behind it and a ring of light as it lands, the title rises word by word, then the camera dives into the
// icon's light blue bar until it fills the frame: the stream opens out of that blue.

const SIZE = 240;
const CX = 960;
const CY = 420;
const DIVE = {x: 0.885, y: 0.5};

export const Logo: React.FC = () => {
  const f = useCurrentFrame();
  const {durationInFrames: D} = useVideoConfig();
  const scan = clamp(f / 20);
  const e = expo(f, 4, 36);
  const dive = expo(f, D - 40, 40);
  const s = lerp(2.4, 1, e) * Math.pow(24, dive);
  const ry = lerp(40, 0, e);
  const blur = (1 - e) * 22;
  const px = SIZE * DIVE.x;
  const py = SIZE * DIVE.y;
  const left0 = CX - SIZE / 2;
  const top0 = CY - SIZE / 2;
  const toward = clamp(dive * 2.5);
  const dx = (CX - (left0 + px)) * toward;
  const dy = (540 - (top0 + py)) * toward;
  const textOut = clamp((f - (D - 46)) / 12);
  const flood = clamp((f - (D - 16)) / 12);
  const rays = settle(f, 20) * (1 - dive);
  return (
    <Ground>
      <div
        style={{
          position: 'absolute',
          left: CX - 760,
          top: CY - 760,
          width: 1520,
          height: 1520,
          borderRadius: '50%',
          background: `conic-gradient(from ${f * 0.35}deg, transparent 0deg, ${BLUE}26 18deg, transparent 38deg, transparent 90deg, ${BLUE}1C 108deg, transparent 128deg, transparent 180deg, ${BLUE}26 198deg, transparent 218deg, transparent 270deg, ${BLUE}1C 288deg, transparent 308deg)`,
          opacity: rays,
          maskImage: 'radial-gradient(closest-side, #000 18%, transparent 100%)',
        }}
      />
      {f < 30 ? <div style={{position: 'absolute', left: 0, right: 0, top: CY, height: 2, background: `linear-gradient(90deg, transparent, ${BLUE}, transparent)`, opacity: Math.sin(Math.PI * scan), transform: `scaleX(${scan})`}} /> : null}
      <div style={{position: 'absolute', left: left0 + dx, top: top0 + dy, width: SIZE, height: SIZE, transformOrigin: `${px}px ${py}px`, transform: `perspective(1400px) rotateY(${ry}deg) scale(${s})`}}>
        <IconGlow size={SIZE} p={e * (1 - dive)} pulse={f >= 38 && dive === 0 ? clamp((f - 38) / 30) : 0} />
        <div style={{position: 'absolute', inset: 0, opacity: Math.min(1, e * 1.5), filter: blur > 0.3 ? `blur(${blur}px)` : undefined}}>
          <Icon size={SIZE} />
        </div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 640, opacity: 1 - textOut, transform: `translateY(${-textOut * 30}px) scale(${1 - 0.06 * textOut})`}}>
        <Words text="VS Code Changelog" frame={f} at={30} stagger={3} size={96} color={t.ink} font={SANS} align="center" accent={{phrase: 'Changelog', color: BLUE}} />
        <div style={{marginTop: 24, textAlign: 'center', fontFamily: MONO, fontSize: 24, letterSpacing: '0.1em', textTransform: 'uppercase', color: t.muted, opacity: settle(f, 46)}}>{EP.dateLong}</div>
      </div>
      <AbsoluteFill style={{background: BLUE, opacity: flood}} />
    </Ground>
  );
};

export const logoCues = (D: number): Cue[] => [
  {at: 0, sfx: 'charge', volume: 0.14},
  {at: 34, sfx: 'thump', volume: 0.32},
  {at: 30, sfx: 'tick', volume: 0.1},
  {at: D - 34, sfx: 'whoosh', volume: 0.2},
];
