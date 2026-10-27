import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {LAND, MORPH, MORPH_AT, TEXT_IN, WIPE} from '../beats';
import {Cue, cueOn} from '../cues';
import {BLUE, MONO, PANEL_BG, SANS, Theme, THEME} from '../design';
import {Change, two} from '../episode';
import {Ground} from '../kit/Ground';
import {expo, inOut, Roll, Words} from '../kit/Kinetic';
import {clamp, lerp, settle} from '../motion';
import {TrafficLights} from '../ui/kit';
import {Plane} from './Plane';
import {FULL_POSE, lerpPose, Pose} from './pose';
import {RecordingView} from './Recording';
import type {Reel, Shot} from './reel';

// The change grammar. Each change: a blue title panel wipes in over the last one (its number rolling on from the
// previous, its headline word by word); the panel becomes the product's window while its words settle into a caption at
// the bottom left; then the stage (the lens, Loupe.tsx) shows what changed. The last change ends in the icon's blue,
// which the end card pulls back out of.

export type StageProps = {t: Theme; k: number; c: Change; shot: Shot; fk: number; fv: number; D: number; local: number; m: number; pose: Pose};
/** A way of showing the changes: where the window is, and what's drawn on it and over it. */
export type Stage = {
  /** The window's pose from LAND on (the morph takes the panel to the pose at LAND). */
  pose: (k: number, fk: number, D: number) => Pose;
  /** On the window plane, over the visual (window px). */
  OnPlane?: React.FC<StageProps>;
  /** Over the frame, under the caption (screen px). */
  Over?: React.FC<StageProps>;
  /** The dark under the caption. */
  captionShade: string;
  cues?: (k: number, D: number) => Cue[];
};

/** A change's visual at fv frames since the window appeared (`played`: of those, how many earlier scenes played). */
export const ChangeView: React.FC<{c: Change; shot: Shot; fv: number; Dv: number; played: number}> = ({c, shot, fv, Dv, played}) =>
  c.visual.kind === 'recording' ? <RecordingView v={c.visual} from={c.motion?.from ?? c.visual.from} f={fv} played={played} /> : shot.Drawn ? <shot.Drawn f={fv} D={Dv} /> : null;

/** Title layout → caption layout, per text element: position and font size. */
const NUM = {a: {x: 128, y: 70, size: 300}, b: {x: 120, y: 858, size: 40}};
const EYE = {a: {x: 140, y: 448, size: 26}, b: {x: 192, y: 873, size: 16}};
const HEAD = {a: {x: 136, y: 498, size: 92}, b: {x: 120, y: 914, size: 50}};
const morphStyle = (a: {x: number; y: number; size: number}, b: {x: number; y: number; size: number}, m: number): React.CSSProperties => ({
  position: 'absolute',
  left: a.x,
  top: a.y,
  transformOrigin: '0 0',
  transform: `translate(${(b.x - a.x) * m}px, ${(b.y - a.y) * m}px) scale(${lerp(1, b.size / a.size, m)})`,
});

/** A wipe's edge of light at x. */
const WipeEdge: React.FC<{x: number}> = ({x}) => <div style={{position: 'absolute', left: x - 2, top: 0, width: 3, height: 1080, background: '#9CDCFE', boxShadow: '0 0 34px #9CDCFE'}} />;

const Layer: React.FC<{reel: Reel; stage: Stage; k: number; fk: number; local: number; push?: number; wipe?: number}> = ({reel, stage, k, fk, local, push = 0, wipe = 1}) => {
  const t = THEME;
  const c = reel.changes[k];
  const shot = reel.shots[k];
  const D = reel.D(k);
  const Dv = D - MORPH_AT;
  const m = inOut(fk, MORPH_AT, MORPH);
  const pose = fk < LAND ? lerpPose(FULL_POSE, stage.pose(k, LAND, D), m) : stage.pose(k, fk, D);
  const fv = fk - MORPH_AT;
  const textIn = k === 0 ? 4 : TEXT_IN;
  const cover = 1 - clamp((m - 0.4) / 0.6);
  const clipLeft = (1 - wipe) * 1920;
  const radius = (shot.chrome === 'screen' ? 14 : 12) * m;
  const sp: StageProps = {t, k, c, shot, fk, fv, D, local, m, pose};
  const outer: React.CSSProperties = push > 0 ? {transform: `translateX(${-360 * push}px) scale(${1 - 0.1 * push})`, filter: `blur(${push * 12}px)`, opacity: 1 - 0.5 * push} : {};
  return (
    <AbsoluteFill style={{transformOrigin: '960px 540px', ...outer}}>
      <AbsoluteFill style={{clipPath: clipLeft > 0.5 ? `inset(0 0 0 ${clipLeft}px)` : undefined}}>
        <Plane pose={pose}>
          {m > 0 ? <div style={{position: 'absolute', inset: 0, borderRadius: radius, boxShadow: '0 30px 90px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.12)', opacity: m}} /> : null}
          <div style={{position: 'absolute', inset: 0, borderRadius: radius, overflow: 'hidden', background: '#121315'}}>
            {fv >= 0 ? <ChangeView c={c} shot={shot} fv={fv} Dv={Dv} played={fv - local} /> : null}
            {stage.OnPlane && fv >= 0 ? <stage.OnPlane {...sp} /> : null}
            {shot.chrome === 'window' && fv >= 0 ? <TrafficLights /> : null}
            {cover > 0 ? <div style={{position: 'absolute', inset: 0, background: PANEL_BG, opacity: cover}} /> : null}
          </div>
        </Plane>
        {stage.Over && fv >= 0 ? <stage.Over {...sp} /> : null}
        <div style={{position: 'absolute', inset: 0, opacity: m, background: stage.captionShade}} />
        {/* The panel's words ride on the panel: masked by the same wipe, so they never float over the last change. */}
        <AbsoluteFill style={{textShadow: m > 0 ? `0 2px 14px rgba(0,0,0,${0.55 * m})` : undefined}}>
          <div style={morphStyle(NUM.a, NUM.b, m)}>
            <Roll prev={k > 0 ? two(reel.changes[k - 1].rank) : '00'} next={two(c.rank)} frame={fk} at={textIn} len={20} size={NUM.a.size} style={{fontFamily: MONO, fontWeight: 200, letterSpacing: '-0.06em', color: m > 0.5 ? t.blue : '#FFFFFF', opacity: settle(fk, textIn - 2)}} />
          </div>
          <div style={{...morphStyle(EYE.a, EYE.b, m), fontFamily: MONO, fontSize: EYE.a.size, letterSpacing: '0.09em', textTransform: 'uppercase', color: m > 0.5 ? 'rgba(255,255,255,0.62)' : 'rgba(255,255,255,0.78)', opacity: settle(fk, textIn + 4), whiteSpace: 'nowrap'}}>
            {c.label ?? (
              <>
                {c.eyebrow ? `${c.eyebrow} · ` : ''}#{c.number}
              </>
            )}
          </div>
          <div style={morphStyle(HEAD.a, HEAD.b, m)}>
            <Words text={c.headline} frame={fk} at={textIn + 6} stagger={2} size={HEAD.a.size} lineHeight={1.04} color="#FFFFFF" font={SANS} maxWidth={1560} />
          </div>
        </AbsoluteFill>
      </AbsoluteFill>
      {wipe < 1 ? <WipeEdge x={clipLeft} /> : null}
    </AbsoluteFill>
  );
};

/** The reel at frame g (frames since its first change began): the change on screen, and the one it wipes over. */
export const ChangesShot: React.FC<{reel: Reel; stage: Stage; g: number; outro?: boolean}> = ({reel, stage, g, outro: endsInBlue = true}) => {
  const local = useCurrentFrame();
  const k = Math.max(0, reel.changes.findIndex((_, i) => g < reel.start(i) + reel.D(i)));
  const fk = g - reel.start(k);
  const D = reel.D(k);
  const wipe = k === 0 ? 1 : expo(fk, 0, WIPE);
  // The last change ends in the icon's blue: a flat blue wipes in over it; the end card pulls back out of it.
  const outro = endsInBlue && k === reel.N - 1 ? expo(fk, D - WIPE - 2, WIPE) : 0;
  return (
    <Ground>
      {k > 0 && wipe < 1 ? <Layer reel={reel} stage={stage} k={k - 1} fk={g - reel.start(k - 1)} local={local} push={wipe} /> : null}
      <Layer reel={reel} stage={stage} k={k} fk={fk} local={local} wipe={wipe} push={outro} />
      {outro > 0 ? (
        <>
          <AbsoluteFill style={{background: BLUE, clipPath: `inset(0 0 0 ${(1 - outro) * 1920}px)`}} />
          {outro < 1 ? <WipeEdge x={(1 - outro) * 1920} /> : null}
        </>
      ) : null}
    </Ground>
  );
};

/** The reel's change scenes (ids c<rank>), each with its sounds. */
export const makeChanges = (reel: Reel, stage: Stage, {outro = true}: {outro?: boolean} = {}) =>
  reel.changes.map((c, k) => {
    const Component: React.FC = () => <ChangesShot reel={reel} stage={stage} g={reel.start(k) + useCurrentFrame()} outro={outro} />;
    Component.displayName = `Change-${c.rank}`;
    return {
      id: `c${c.rank}`,
      Component,
      cues: (D: number): Cue[] => [
        ...(k > 0 ? [cueOn(0, 'whoosh', 0.2)] : []),
        {at: k === 0 ? 4 : TEXT_IN, sfx: 'tick', volume: 0.12},
        cueOn(MORPH_AT, 'whoosh', 0.08),
        ...(stage.cues?.(k, D) ?? []),
        ...reel.shots[k].cues.map((q) => ({...q, at: q.at + MORPH_AT})),
        ...(outro && k === reel.N - 1 ? [cueOn(D - WIPE - 2, 'whoosh', 0.16)] : []),
      ],
    };
  });
