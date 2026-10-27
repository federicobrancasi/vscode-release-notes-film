import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {makeChanges} from './changes/Changes';
import {makeLoupe} from './changes/Loupe';
import {dayOf, makeReel} from './changes/reel';
import type {Cue} from './cues';
import {Change, CHANGES, EP} from './episode';
import type {SceneCtx} from './scenes/types';
import {End, endCues} from './shell/End';
import {Finish} from './shell/Finish';
import {Logo, logoCues} from './shell/Logo';
import {Stream, streamCues, Top, topCues} from './shell/Stream';
import {Soundtrack} from './Soundtrack';
import {TL} from './timeline';
import {VOICE, wordFv} from './voice';

// The film: the logo dives into the icon's blue, the day's merges stream past and fall away to the top ten, each change
// is shown in VS Code under the lens (src/changes), and the end card pulls back out of the blue. One scene per entry of
// episode/timeline.json, hard cuts on the beat, the film's finish over all of it, and its sound.

/** A drawn change's events land on the words of its line (motion.sync); a recording plays as recorded. */
const ctxFor = (c: Change): Omit<SceneCtx, 'day'> => ({
  ev: (name, fallback, min = 0) => {
    const word = c.motion?.sync?.[name];
    return Math.max(min, word ? wordFv(`c${c.rank}`, word, fallback) : fallback);
  },
  has: (name) => Boolean(c.motion?.sync?.[name]),
});

export const REEL = makeReel(
  CHANGES,
  CHANGES.map((c) => TL.sceneOf(`c${c.rank}`)),
  ctxFor,
  dayOf(EP.date),
);

type Module = {Component: React.FC; cues?: (D: number) => Cue[]};
const MODULES: Record<string, Module> = {
  logo: {Component: Logo, cues: logoCues},
  stream: {Component: Stream, cues: streamCues},
  top: {Component: Top, cues: topCues},
  ...Object.fromEntries(makeChanges(REEL, makeLoupe(REEL)).map((s) => [s.id, {Component: s.Component, cues: s.cues}])),
  end: {Component: End, cues: endCues},
};

/** The music ducks to 36 % under each line. */
const DUCK = 0.64;

export const Film: React.FC<{voice?: boolean}> = ({voice = true}) => (
  <AbsoluteFill style={{background: '#000'}}>
    {TL.SCENES.map((s) => {
      const mod = MODULES[s.id];
      if (!mod) throw new Error(`scene "${s.id}" has no module`);
      return (
        <Sequence key={s.id} name={s.name} from={s.from} durationInFrames={s.durationInFrames} premountFor={30}>
          <mod.Component />
        </Sequence>
      );
    })}
    <Finish />
    <Soundtrack total={TL.TOTAL} scenes={TL.SCENES.map((s) => ({...s, cues: MODULES[s.id]?.cues}))} music={TL.THEME_FILE} voice={voice ? VOICE : null} duck={DUCK} />
  </AbsoluteFill>
);
