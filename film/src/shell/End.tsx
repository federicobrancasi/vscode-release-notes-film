import React from 'react';
import {useCurrentFrame} from 'remotion';
import {Cue} from '../cues';
import {BLUE, MONO, SANS, THEME as t} from '../design';
import {Ground} from '../kit/Ground';
import {EP} from '../episode';
import {expo, Words} from '../kit/Kinetic';
import {Icon, IconGlow} from '../kit/Logo';
import {clamp, settle} from '../motion';

// The end card, the opening's bookend: the VS Code icon, "VS Code Changelog" and the day, nothing else. From the last
// change's blue, the camera pulls back out of the icon's light blue bar (the opening's dive, reversed) to reveal the
// icon; then the title and the date rise, where the opening had them.

export const END = {size: 240, cx: 960, cy: 420};
const DIVE = {x: 0.885, y: 0.5};

/** Light turning slowly behind the icon (as in the opening). */
export const Rays: React.FC<{f: number; p: number}> = ({f, p}) =>
  p <= 0 ? null : (
    <div
      style={{
        position: 'absolute',
        left: END.cx - 760,
        top: END.cy - 760,
        width: 1520,
        height: 1520,
        borderRadius: '50%',
        background: `conic-gradient(from ${f * 0.35}deg, transparent 0deg, ${BLUE}26 18deg, transparent 38deg, transparent 90deg, ${BLUE}1C 108deg, transparent 128deg, transparent 180deg, ${BLUE}26 198deg, transparent 218deg, transparent 270deg, ${BLUE}1C 288deg, transparent 308deg)`,
        opacity: p,
        maskImage: 'radial-gradient(closest-side, #000 18%, transparent 100%)',
      }}
    />
  );

/** The title and the date under the icon, rising word by word from `at`. */
export const EndTitle: React.FC<{f: number; at: number}> = ({f, at}) => {
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 640}}>
      <Words text="VS Code Changelog" frame={f} at={at} stagger={3} size={96} color={t.ink} font={SANS} align="center" accent={{phrase: 'Changelog', color: BLUE}} />
      <div style={{marginTop: 24, textAlign: 'center', fontFamily: MONO, fontSize: 24, letterSpacing: '0.1em', textTransform: 'uppercase', color: t.muted, opacity: settle(f, at + 16), transform: `translateY(${(1 - settle(f, at + 16)) * 12}px)`}}>
        {EP.dateLong}
      </div>
    </div>
  );
};

export const End: React.FC = () => {
  const f = useCurrentFrame();
  const S = END.size;
  // 1 → 0: from inside the bar (24×, the bar's point at the frame's centre) back out to the icon at its place.
  const pull = 1 - expo(f, 0, 46);
  const s = Math.pow(24, pull);
  const toward = clamp(pull * 2.5);
  const px = S * DIVE.x;
  const py = S * DIVE.y;
  const left0 = END.cx - S / 2;
  const top0 = END.cy - S / 2;
  const dx = (END.cx - (left0 + px)) * toward;
  const dy = (540 - (top0 + py)) * toward;
  const landed = 1 - pull;
  return (
    <Ground>
      <Rays f={f} p={settle(f, 30) * landed} />
      <div style={{position: 'absolute', left: left0 + dx, top: top0 + dy, width: S, height: S, transformOrigin: `${px}px ${py}px`, transform: `scale(${s})`}}>
        <IconGlow size={S} p={landed} pulse={f >= 46 ? clamp((f - 46) / 34) : 0} />
        <Icon size={S} />
      </div>
      <EndTitle f={f} at={40} />
      <div style={{position: 'absolute', inset: 0, background: BLUE, opacity: 1 - clamp(f / 10)}} />
    </Ground>
  );
};

export const endCues = (): Cue[] => [
  {at: 0, sfx: 'air', volume: 0.16},
  {at: 40, sfx: 'thump', volume: 0.26},
  {at: 44, sfx: 'tick', volume: 0.1},
];
