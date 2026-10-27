import {Audio} from '@remotion/media';
import React from 'react';
import {interpolate, Sequence, staticFile, useVideoConfig} from 'remotion';
import type {Cue} from './cues';
import type {VoiceLine} from './voice';

const CLAMP = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export type SoundScene = {from: number; durationInFrames: number; cues?: (D: number) => Cue[]};

/**
 * The film's sound: the theme (`music`, fitted to the edit; none for the effects alone), every scene's sound effects,
 * and the narration (`voice`), with the music ducked under each line by `duck`.
 */
export const Soundtrack: React.FC<{total: number; scenes: SoundScene[]; music: string | null; voice: {src: string; lines: VoiceLine[]} | null; duck: number}> = ({total, scenes, music, voice, duck}) => {
  const {fps} = useVideoConfig();
  const lines = voice?.lines ?? [];
  const ducked = (f: number) => {
    const e = lines.reduce((m, l) => Math.max(m, Math.min(interpolate(f, [l.from - 10, l.from], [0, 1], CLAMP), interpolate(f, [l.from + l.frames, l.from + l.frames + 16], [1, 0], CLAMP))), 0);
    return 1 - duck * e;
  };
  const volume = (f: number) => 0.85 * interpolate(f, [0, 6], [0, 1], CLAMP) * interpolate(f, [total - 20, total], [1, 0], CLAMP) * ducked(f);
  const cues = scenes.flatMap((s) => (s.cues?.(s.durationInFrames) ?? []).map((c) => ({...c, at: s.from + c.at})));
  return (
    <>
      {music ? <Audio src={staticFile(music)} volume={volume} /> : null}
      {cues.map((c, i) =>
        c.at < 0 ? null : (
          <Sequence key={i} from={c.at} layout="none">
            <Audio src={staticFile(`sfx/${c.sfx}.wav`)} volume={(c.volume ?? 0.4) * (voice ? 0.7 : 1)} />
          </Sequence>
        ),
      )}
      {voice
        ? lines.map((l) => (
            <Sequence key={l.id} from={l.from} durationInFrames={l.frames + Math.round(0.2 * fps)} layout="none">
              <Audio src={staticFile(voice.src)} trimBefore={Math.round(l.start * fps)} trimAfter={Math.round(l.end * fps) + Math.round(0.2 * fps)} />
            </Sequence>
          ))
        : null}
    </>
  );
};
