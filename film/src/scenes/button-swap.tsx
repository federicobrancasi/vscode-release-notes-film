import React from 'react';
import {clamp} from '../motion';
import {codicon} from '../ui/icons';
import {Cursor, cursorAt} from '../ui/kit';
import {bannerBox, MainWindow} from '../ui/MainWindow';
import {A, ease, obj, str} from './common';
import type {SceneMake} from './types';

// A page whose button changes: the main window's Welcome page, its banner button rolling from the old label to the new
// one on the word that names it, then the pointer coming to rest on it.
//   params: before {text, icon}, after {text, icon}, tab (the editor tab, default "Welcome")
//   events: swap (the label rolls)

export const buttonSwap: SceneMake = (params, {ev}) => {
  const before = {text: str(obj(params, 'before'), 'text', 'Try out the new Agents window'), icon: codicon(obj(params, 'before').icon, 'agent')};
  const after = {text: str(obj(params, 'after'), 'text', 'Sign in to GitHub'), icon: codicon(obj(params, 'after').icon, 'github')};
  const tab = str(params, 'tab', 'Welcome');
  const box = bannerBox(before, after);
  const at = ev('swap', A + 30, A + 16);
  const Component: React.FC<{f: number}> = ({f}) => {
    // One roll, centred on the word: the old label rolls up and out as the new one rolls in (at-7 → at+7).
    const swap = clamp((f - (at - 7)) / 14);
    const [cx, cy] = cursorAt(f, [
      [at + 24, 880, 704],
      [at + 52, box.x + 150, box.y + 20],
    ]);
    return (
      <MainWindow tab={tab} banner={{swap, hover: ease(clamp((f - (at + 52)) / 14)), before, after}}>
        {f >= at + 24 ? <Cursor x={cx} y={cy} opacity={clamp((f - (at + 24)) / 6)} /> : null}
      </MainWindow>
    );
  };
  return {
    Component,
    loupe: {block: [box.x - 19, box.y - 27, box.w + 37, 90], mag: 2.1},
    cues: [{at, sfx: 'tick', volume: 0.12}],
    chrome: 'window',
  };
};
