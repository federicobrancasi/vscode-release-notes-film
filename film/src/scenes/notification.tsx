import React from 'react';
import {clamp, settle} from '../motion';
import {Code} from '../ui/Editor';
import {ClickRing, Cursor, cursorAt} from '../ui/kit';
import {Toast, toastActionAt, toastLayout} from '../ui/Overlays';
import {contentTop, editorBox, ExplorerTree, Workbench} from '../ui/Workbench';
import {A, list, press, str} from './common';
import type {SceneMake} from './types';

// A notification toast: it slides in at the bottom right on its word, and its first action is clicked.
//   params: severity (info, warning, error), message (the PR's words), source ("Source: …"), actions [labels], tab
//   events: show (it slides in), click (the first action is pressed and the toast goes: only on its word; without
//           one, the pointer comes to rest on the action)

const CODE = ['{', '  "name": "my-project",', '  "version": "1.0.0",', '  "scripts": {', '    "start": "node main.js",', '    "test": "node --test"', '  }', '}'];

export const notification: SceneMake = (params, {ev, has}) => {
  const severity = str(params, 'severity', 'info');
  const message = str(params, 'message', 'A new version of the extension is available. Restart the extension host to use it.');
  const source = str(params, 'source', '');
  const given = list<{label: string}>(params, 'actions').map((a) => a.label);
  // An empty list is no actions; no list at all, the example's.
  const actions = Array.isArray(params.actions) ? given : ['Restart Extensions', 'Later'];
  const tab = str(params, 'tab', 'package.json');
  const L = toastLayout(message, actions);
  const show = ev('show', A - 22, A - 30);
  const clicks = has('click') && actions.length > 0;
  const click = clicks ? ev('click', show + 90, show + 40) : show + 110;
  const [ax, ay] = toastActionAt(L, actions[0] ?? '');
  const box = editorBox(true);
  const Component: React.FC<{f: number}> = ({f}) => {
    const [cx, cy] = cursorAt(f, [
      [click - 34, ax - 200, ay - 150],
      [click - 4, ax, ay],
    ]);
    const leaving = clicks ? clamp((f - (click + 12)) / 10) : 0;
    const down = clicks ? press(f, click) : 0;
    return (
      <Workbench sidebar={{title: 'Explorer', content: <ExplorerTree project="my-project" files={['src', tab, 'README.md']} open={tab} />}} tabs={[{label: tab, active: true}]} editor={<Code x={box.x} y={contentTop + 10} w={box.w} lines={CODE} lang="json" current={2} />}>
        <Toast p={settle(f, show) * (1 - leaving)} severity={severity} message={message} source={source} actions={actions} pressed={{label: actions[0] ?? '', p: down}} hover={{label: actions[0] ?? '', p: clamp((f - click + 4) / 6)}} />
        {actions.length && f >= click - 34 && leaving < 1 ? <Cursor x={cx} y={cy} press={down} opacity={clamp((f - (click - 34)) / 6) * (1 - leaving)} /> : null}
        {clicks ? <ClickRing x={cx} y={cy} f={f} at={click + 2} /> : null}
      </Workbench>
    );
  };
  return {
    Component,
    loupe: {block: [L.x - 14, L.y - 14, L.w + 28, L.h + 28]},
    cues: [{at: show, sfx: 'pop', volume: 0.12}, ...(clicks ? [{at: click, sfx: 'click', volume: 0.22}] : [])],
    chrome: 'window',
  };
};
