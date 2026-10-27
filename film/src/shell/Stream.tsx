import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Cue, cueOn} from '../cues';
import {BLUE, MONO, PANEL_BG, SANS, Theme, THEME} from '../design';
import {Ground, MergeIcon} from '../kit/Ground';
import {CHANGES, EP, two} from '../episode';
import {count, expo, Words} from '../kit/Kinetic';
import {clamp, hash, lerp, settle} from '../motion';
import {TL} from '../timeline';

// The stream and the top ten, one shot. The day's merges fly toward the camera in 3D around a counter that
// runs to their number. Then everything but the ten picks falls away, the picks fly into a list beside "Today's top
// ten", each PR's title turning into its change's headline, and the first one opens out into change 01's title panel.

const DS = TL.sceneOf('stream').durationInFrames;
const DT = TL.sceneOf('top').durationInFrames;
const MERGED = EP.merged?.items ?? [];
const pickIndex = new Map(CHANGES.map((c, i) => [c.number, i]));

const P = 900;
const NEAR = 300;
const FAR = -2700;
const SPEED = 15;
const CW = 560;
const CH = 66;
/** The top ten list's rows. */
const SLOT = {x: 1010, y: 150, w: 810, h: 64, pitch: 78};
const landAt = (k: number) => DS + 6 + k * 3;
const OPEN_AT = DS + DT - 24;
/** "ten": how many changes the day has, in words. */
const TOP = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'][CHANGES.length] ?? String(CHANGES.length);

/** A card's place in the stream at shot frame g (its 3D position, projected), and how visible it is. */
const streamPose = (i: number, g: number) => {
  const x = (hash(i, 1) * 2 - 1) * 1100;
  let y = (hash(i, 2) * 2 - 1) * 620;
  if (Math.abs(x) < 470 && Math.abs(y) < 240) y = Math.sign(y || 1) * (240 + hash(i, 3) * 360);
  const span = NEAR - FAR;
  const z = ((((hash(i, 4) * span + SPEED * g) % span) + span) % span) + FAR;
  const s = P / (P - z);
  const fog = clamp((z - FAR) / 700) * clamp((NEAR - z) / 240);
  return {X: 960 + x * s, Y: 540 + y * s, s, z, fog};
};

const CardBody: React.FC<{t: Theme; n: number; title: string; headline?: string; rank?: number; swap: number}> = ({t, n, title, headline, rank, swap}) => (
  <>
    <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', gap: 14, padding: '0 18px', opacity: 1 - swap}}>
      <MergeIcon size={20} color={t.purple} />
      <span style={{fontFamily: MONO, fontSize: 19, color: t.blue}}>#{n}</span>
      <span style={{fontFamily: SANS, fontSize: 21, color: t.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1, minWidth: 0}}>{title}</span>
    </div>
    {headline ? (
      <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', gap: 16, padding: '0 18px', opacity: swap}}>
        <span style={{fontFamily: MONO, fontSize: 20, fontWeight: 600, color: t.blue, width: 30}}>{two(rank ?? 0)}</span>
        <span style={{fontFamily: SANS, fontSize: 23, fontWeight: 500, color: t.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1, minWidth: 0, letterSpacing: '-0.01em'}}>{headline}</span>
        <span style={{fontFamily: MONO, fontSize: 15, color: t.muted}}>#{n}</span>
      </div>
    ) : null}
  </>
);

/** The stream and the top ten at shot frame g: the first pick opens into change 01's title panel. */
const StreamShot: React.FC<{g: number}> = ({g}) => {
  const t = THEME;
  const top = g >= DS;
  const cards = MERGED.map((m, i) => ({m, i, pose: streamPose(i, g), k: pickIndex.get(m.n)})).sort((a, b) => (g >= OPEN_AT ? Number(a.k === 0) - Number(b.k === 0) : 0) || a.pose.z - b.pose.z);
  const counterOut = clamp((g - DS) / 16);
  const open = expo(g, OPEN_AT, 24);
  const n = count(g, 8, 80, MERGED.length);
  return (
    <Ground>
      <StreamLight />
      {cards.map(({m, i, pose, k}) => {
        const pick = k === undefined ? undefined : CHANGES[k];
        const land = pick ? expo(g, landAt(k!), 40) : 0;
        const fall = !pick && top ? clamp((g - DS) / 22) : 0;
        if (pose.fog <= 0.01 && land === 0) return null;
        if (fall >= 1) return null;
        // A pick flies from its place in the stream to its slot in the list (and the first opens into the panel).
        const slotY = SLOT.y + (k ?? 0) * SLOT.pitch;
        let left = lerp(pose.X - (CW / 2) * pose.s, SLOT.x, land);
        let topY = lerp(pose.Y - (CH / 2) * pose.s, slotY, land);
        let w = lerp(CW, SLOT.w, land);
        let h = lerp(CH, SLOT.h, land);
        let scale = lerp(pose.s, 1, land);
        let radius = 14;
        const opening = k === 0 ? open : 0;
        if (opening > 0) {
          left = lerp(left, 0, opening);
          topY = lerp(topY, 0, opening);
          w = lerp(w, 1920, opening);
          h = lerp(h, 1080, opening);
          scale = 1;
          radius = 14 * (1 - opening);
        }
        const leave = pick && k !== 0 ? clamp((g - OPEN_AT) / 18) : 0;
        const o = pick ? Math.max(pose.fog * (1 - land), land) * (1 - leave) : pose.fog * (1 - fall);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: left + leave * 400,
              top: topY,
              width: w,
              height: h,
              borderRadius: radius,
              transformOrigin: '0 0',
              transform: `scale(${scale})`,
              background: t.card,
              boxShadow: t.floatSmall,
              opacity: o,
              filter: fall > 0 ? `blur(${fall * 10}px)` : undefined,
              overflow: 'hidden',
            }}
          >
            <CardBody t={t} n={m.n} title={m.t} headline={pick?.headline} rank={pick?.rank} swap={clamp((land - 0.4) / 0.4) * (1 - opening)} />
            {opening > 0 ? <AbsoluteFill style={{background: PANEL_BG, opacity: clamp(opening * 1.6)}} /> : null}
          </div>
        );
      })}
      {counterOut < 1 ? <div style={{position: 'absolute', left: 960 - 620, top: 250, width: 1240, height: 560, borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(10,12,16,0.92), rgba(10,12,16,0.6) 60%, transparent)', opacity: 1 - counterOut}} /> : null}
      {counterOut < 1 ? (
        <div style={{position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', opacity: settle(g, 6) * (1 - counterOut), transform: `scale(${1 - 0.15 * counterOut})`}}>
          <div style={{fontFamily: MONO, fontSize: 240, lineHeight: 1, fontWeight: 300, color: '#FFFFFF', letterSpacing: '-0.05em', fontVariantNumeric: 'tabular-nums', textShadow: `0 0 60px ${BLUE}66`}}>{n}</div>
          <Words text="pull requests merged into VS Code" frame={g} at={22} stagger={2} size={44} color={t.ink} font={SANS} align="center" style={{marginTop: 26}} />
          <Words text="in a single day." frame={g} at={34} stagger={2} size={44} color={t.ink} font={SANS} align="center" accent={{phrase: 'single day.', color: BLUE}} />
        </div>
      ) : null}
      {top && open < 0.5 ? <TopTitle t={t} g={g} opacity={1 - clamp((g - OPEN_AT) / 14)} /> : null}
      <AbsoluteFill style={{background: BLUE, opacity: 1 - clamp(g / 18)}} />
    </Ground>
  );
};

/** "Today's top ten", at the list's left, as of shot frame g. */
const TopTitle: React.FC<{t: Theme; g: number; opacity: number}> = ({t, g, opacity}) => (
  <div style={{position: 'absolute', left: 120, top: 330, opacity}}>
    <div style={{fontFamily: MONO, fontSize: 22, letterSpacing: '0.1em', textTransform: 'uppercase', color: t.muted, opacity: settle(g, DS + 8)}}>{EP.dateLong}</div>
    <Words text={`Today's top ${TOP}`} frame={g} at={DS + 8} stagger={3} size={112} color={t.ink} font={SANS} accent={{phrase: `top ${TOP}`, color: BLUE}} maxWidth={760} style={{marginTop: 18}} />
    <div style={{marginTop: 26, fontFamily: SANS, fontSize: 28, color: t.body, opacity: settle(g, DS + 28)}}>
      <span style={{fontFamily: MONO, color: t.ink}}>{MERGED.length}</span> merged · <span style={{fontFamily: MONO, color: t.ink}}>{CHANGES.length}</span> that change what you see
    </div>
  </div>
);

/** The stage's light behind the stream and the list. */
const StreamLight: React.FC = () => <AbsoluteFill style={{background: `radial-gradient(60% 50% at 50% 50%, ${BLUE}22, transparent)`}} />;
export const Stream: React.FC = () => <StreamShot g={useCurrentFrame()} />;
export const Top: React.FC = () => <StreamShot g={DS + useCurrentFrame()} />;

export const streamCues = (): Cue[] => [{at: 0, sfx: 'whoosh', volume: 0.16}, ...[14, 32, 50, 68].map((at) => ({at, sfx: 'tick', volume: 0.06}))];
export const topCues = (D: number): Cue[] => [...CHANGES.map((_, k) => ({at: landAt(k) - DS + 20, sfx: 'tick', volume: 0.06})), cueOn(D - 14, 'whoosh', 0.18)];
