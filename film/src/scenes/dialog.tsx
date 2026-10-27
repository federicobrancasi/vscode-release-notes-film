import React from 'react';
import {clamp, settle} from '../motion';
import {Code} from '../ui/Editor';
import {ClickRing, Cursor, cursorAt} from '../ui/kit';
import {Dialog, dialogButtonAt, dialogLayout, DialogButton, DialogRow} from '../ui/Overlays';
import {contentTop, editorBox, ExplorerTree, Workbench} from '../ui/Workbench';
import {A, list, press, str} from './common';
import type {SceneMake} from './types';

// A modal dialog over the window (a confirmation, a warning, a permission): it opens on its word, the sentence that's
// new lights up, and its primary button is clicked.
//   params: icon (shield, warning, info, question), title, detail (wrap the sentence to light in **…**),
//           buttons [{label, primary}] (Cancel first, the primary last), tab (the file behind it), rows [{label, state,
//           done, current}] (a list in it: a setup's steps), rowActions [labels] (the current row's buttons, the last primary)
//   events: show (it opens), highlight (the marked sentence lights), click (the primary button is pressed and the
//           dialog closes: only on its word; without one, the pointer comes to rest on the button), act (with rows: the
//           current row's primary action is clicked; the dialog stays, and a moment later that row is done and the
//           next one is current: one at a time)

const README = ['# my-project', '', 'A small app to keep track of the day.', '', '## Getting started', '', '```', 'npm install', 'npm start', '```'];

export const dialog: SceneMake = (params, {ev, has}) => {
  const icon = str(params, 'icon', 'shield');
  const title = str(params, 'title', 'Install the plugin "Release Notes" from the marketplace?');
  // The labels a change shows never fall back to the example's: a dialog without a detail has none.
  const rawDetail = str(params, 'detail', '');
  const mark = rawDetail.match(/\*\*(.+?)\*\*/);
  const detail = rawDetail.replace(/\*\*(.+?)\*\*/g, '$1');
  const given = list<{label?: string; primary?: boolean}>(params, 'buttons');
  // An empty list is no buttons (a dialog whose rows have the actions); no list at all, the example's.
  const buttons: DialogButton[] = Array.isArray(params.buttons) ? given.map((b) => ({label: b.label ?? '', primary: Boolean(b.primary)})) : [{label: 'Cancel'}, {label: 'Install', primary: true}];
  const primary = buttons.find((b) => b.primary)?.label ?? buttons[buttons.length - 1]?.label ?? '';
  const tab = str(params, 'tab', 'README.md');
  const rows = list<{label?: string; state?: string; done?: boolean; current?: boolean}>(params, 'rows').map((r): DialogRow => ({label: r.label ?? '', state: r.state, done: Boolean(r.done), current: Boolean(r.current)}));
  const rowActions = list<{label: string}>(params, 'rowActions').map((a) => a.label);
  const acts = rows.some((r) => r.current) && rowActions.length > 0;
  // After the act, the current row is done and the next one is current.
  const cur = rows.findIndex((r) => r.current);
  const advanced = rows.map((r, i) => ({...r, done: r.done || i === cur, current: i === cur + 1}));
  const L = dialogLayout(title, detail, buttons, 160, rows, rowActions);
  const show = ev('show', A - 26, A - 34);
  const highlight = mark ? ev('highlight', show + 50, show + 20) : -1;
  // With rows, the pointer goes to the current row's primary action (clicked on `act`); else to the dialog's primary button.
  const target = acts ? rowActions[rowActions.length - 1] : primary;
  const clicks = acts ? true : has('click');
  const click = acts ? ev('act', Math.max(show, highlight) + 60, show + 30) : clicks ? ev('click', Math.max(show, highlight) + 50, show + 30) : Math.max(show, highlight) + 70;
  const [bx, by] = dialogButtonAt(L, target);
  const box = editorBox(true);
  const Component: React.FC<{f: number}> = ({f}) => {
    const p = settle(f, show);
    const [cx, cy] = cursorAt(f, [
      [click - 34, bx - 160, by + 120],
      [click - 4, bx, by],
    ]);
    const closing = clicks && !acts ? clamp((f - (click + 10)) / 8) : 0;
    const down = clicks ? press(f, click) : 0;
    return (
      <Workbench sidebar={{title: 'Explorer', content: <ExplorerTree project="my-project" files={['src', 'package.json', tab]} open={tab} />}} tabs={[{label: tab, active: true}]} editor={<Code x={box.x} y={contentTop + 10} w={box.w} lines={README} lang="md" current={3} />}>
        <Dialog p={p * (1 - closing)} icon={icon} title={title} detail={detail} highlight={mark ? {text: mark[1], p: clamp((f - highlight) / 10)} : undefined} buttons={buttons} rows={acts && f >= click + 34 ? advanced : rows} rowActions={rowActions} pressed={{label: target, p: down}} hover={{label: target, p: clamp((f - click + 4) / 6)}} />
        {f >= click - 34 && closing < 1 ? <Cursor x={cx} y={cy} press={down} opacity={clamp((f - (click - 34)) / 6) * (1 - closing)} /> : null}
        {clicks ? <ClickRing x={cx} y={cy} f={f} at={click + 2} /> : null}
      </Workbench>
    );
  };
  return {
    Component,
    loupe: {block: [L.x - 16, L.y - 16, L.w + 32, L.h + 32]},
    cues: [{at: show, sfx: 'pop', volume: 0.12}, ...(clicks ? [{at: click, sfx: 'click', volume: 0.22}] : [])],
    chrome: 'window',
  };
};
