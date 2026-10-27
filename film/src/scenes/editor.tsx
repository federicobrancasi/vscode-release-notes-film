import React from 'react';
import {clamp} from '../motion';
import {CODE, Code} from '../ui/Editor';
import {contentTop, editorBox, ExplorerTree, Workbench} from '../ui/Workbench';
import {A, list, str} from './common';
import type {SceneMake} from './types';

// An editor with a file open, where text appears at the cursor on its word (pasted, inserted by a command): the PR's own
// example, highlighted as it lands.
//   params: file (its tab), lines (what's in it, up to 12), insert (the text that appears, lines joined with \n)
//   events: insert (it appears)

export const editor: SceneMake = (params, {ev}) => {
  const file = str(params, 'file', 'notes.md');
  const lang = /\.md$/.test(file) ? 'md' : /\.json$/.test(file) ? 'json' : /\.py$/.test(file) ? 'py' : 'ts';
  const given = list<{label: string}>(params, 'lines').map((l) => l.label);
  const lines = given.length ? given.slice(0, 12) : ['# Release checklist', '', '- Update the changelog', '- Tag the release', ''];
  const insert = str(params, 'insert', '- Announce it in the team channel\n- Close the milestone').split('\n');
  const at = lines.length;
  const insertAt = ev('insert', A + 24, A + 8);
  const box = editorBox(true);
  const top = contentTop + 10;
  const Component: React.FC<{f: number}> = ({f}) => {
    const done = f >= insertAt;
    const shown = done ? [...lines, ...insert] : [...lines];
    const line = done ? at + insert.length : at;
    const col = done ? insert[insert.length - 1].length : (lines[lines.length - 1] ?? '').length;
    return (
      <Workbench sidebar={{title: 'Explorer', content: <ExplorerTree project="my-project" files={['src', file, 'package.json']} open={file} />}} tabs={[{label: file, active: true, dirty: done}]} editor={<Code x={box.x} y={top} w={box.w} lines={shown} lang={lang} current={line} cursor={{line, col, on: Math.floor(f / 18) % 2 === 0 || Math.abs(f - insertAt) < 20}} inserted={done ? {from: at + 1, to: at + insert.length, p: clamp((f - insertAt) / 8) * (1 - 0.6 * clamp((f - insertAt - 60) / 40))} : undefined} />} />
    );
  };
  const last = lines.length + insert.length;
  const blockTop = Math.max(contentTop + 4, top + (lines.length - 4) * CODE.lineH - 8);
  return {
    Component,
    loupe: {block: [box.x + 8, blockTop, 600, Math.min(300, top + last * CODE.lineH + 16 - blockTop)]},
    cues: [{at: insertAt, sfx: 'pop', volume: 0.12}],
    chrome: 'window',
  };
};
