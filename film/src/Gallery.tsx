import React, {useMemo} from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {makeChanges} from './changes/Changes';
import {makeLoupe} from './changes/Loupe';
import {dayOf, makeReel} from './changes/reel';
import {BLUE, SANS, THEME} from './design';
import type {Change} from './episode';
import {Ground} from './kit/Ground';
import {Words} from './kit/Kinetic';
import {settle} from './motion';
import library from './scenes/library.json';
import type {Params, SceneCtx} from './scenes/types';
import {Soundtrack} from './Soundtrack';

// The scene library, shown the way the film shows a change: each scene's title panel, its window, its lens on its
// block, acting its change out at its default times (no line to sync to). Scenes (the reel): every scene of
// scenes/library.json with its example params. Scene: one scene, with the params given (to try a day's params).

type Entry = {title: string; for: string; group: string; events: Record<string, string>; strings: string[]; example: Params};
export const LIBRARY = library as Record<string, Entry>;
/** Each scene's length in the reel: 10 beats, as a change's least. */
export const SCENE_FRAMES = 300;
const INTRO = 120;
/** No line to sync to: every event at its default time, and none that takes its block away. */
const atDefaults: Omit<SceneCtx, 'day'> = {ev: (_, fallback, min = 0) => Math.max(min, fallback), has: () => false};
const DAY = dayOf('2026-10-19');

const changeOf = (name: string, i: number, params?: Params | null): Change => ({
  rank: i + 1,
  number: 0,
  url: '',
  author: '',
  title: '',
  headline: LIBRARY[name]?.title ?? name,
  eyebrow: null,
  say: '',
  visual: {kind: 'scene', name, params: params ?? LIBRARY[name]?.example ?? {}},
  motion: null,
  label: name,
});
const scenesOf = (n: number, from: number) => Array.from({length: n}, (_, k) => ({from: from + k * SCENE_FRAMES, durationInFrames: SCENE_FRAMES}));

const NAMES = Object.keys(LIBRARY);
const REEL = makeReel(NAMES.map((n, i) => changeOf(n, i)), scenesOf(NAMES.length, INTRO), () => atDefaults, DAY);
const MODULES = makeChanges(REEL, makeLoupe(REEL), {outro: false});
export const GALLERY_TOTAL = INTRO + NAMES.length * SCENE_FRAMES;

const Title: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Ground>
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 26}}>
        <Words text="The scene library" frame={f} at={6} stagger={3} size={110} color={THEME.ink} font={SANS} align="center" accent={{phrase: 'library', color: BLUE}} />
        <div style={{fontFamily: SANS, fontSize: 34, color: THEME.body, opacity: settle(f, 24)}}>{`${NAMES.length} ways to show a change in VS Code, each under the lens`}</div>
      </AbsoluteFill>
    </Ground>
  );
};

export const Gallery: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <Sequence durationInFrames={INTRO} premountFor={30}>
      <Title />
    </Sequence>
    {MODULES.map((m, k) => (
      <Sequence key={m.id} name={`${k + 1} · ${NAMES[k]}`} from={INTRO + k * SCENE_FRAMES} durationInFrames={SCENE_FRAMES} premountFor={30}>
        <m.Component />
      </Sequence>
    ))}
    <Soundtrack total={GALLERY_TOTAL} scenes={MODULES.map((m, k) => ({from: INTRO + k * SCENE_FRAMES, durationInFrames: SCENE_FRAMES, cues: m.cues}))} music={null} voice={null} duck={0} />
  </AbsoluteFill>
);

/** One scene of the library with the given params (default: its example), shown as the film would. */
export const OneScene: React.FC<{name: string; params?: Params | null}> = ({name, params = null}) => {
  const modules = useMemo(() => {
    const reel = makeReel([changeOf(name, 0, params)], scenesOf(1, 0), () => atDefaults, DAY);
    return makeChanges(reel, makeLoupe(reel), {outro: false});
  }, [name, params]);
  const M = modules[0];
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <M.Component />
      <Soundtrack total={SCENE_FRAMES} scenes={[{from: 0, durationInFrames: SCENE_FRAMES, cues: M.cues}]} music={null} voice={null} duck={0} />
    </AbsoluteFill>
  );
};
