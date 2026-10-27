import React from 'react';
import {clamp, settle} from '../motion';
import {Code} from '../ui/Editor';
import {ClickRing, Cursor, cursorAt} from '../ui/kit';
import {QUICK, QuickInput, QuickItem} from '../ui/Overlays';
import {contentTop, editorBox, ExplorerTree, Workbench, WB} from '../ui/Workbench';
import {A, list, press, str} from './common';
import type {SceneMake} from './types';

// A remote window (infrastructure a recording doesn't have): the remote indicator is clicked on its word, VS Code's
// "Select an option to open a Remote Window" lists the ways to connect, one is picked, and the indicator says where the
// window now is.
//   params: items [{label, description, icon}] (the options), pick (the one picked), connected (the indicator after)
//   events: open (the indicator is clicked), connect (the option is picked and the window connects: only on its word;
//           without one, the selection rests on the option)

export const remote: SceneMake = (params, {ev, has}) => {
  const given = list<{label?: string; description?: string; icon?: string}>(params, 'items');
  const items: QuickItem[] = (given.length
    ? given
    : [
        {label: 'Connect to Tunnel...', description: 'Remote - Tunnels', icon: 'remote-explorer'},
        {label: 'Connect to Host...', description: 'Remote - SSH', icon: 'remote'},
        {label: 'Reopen in Container', description: 'Dev Containers', icon: 'vm'},
      ]
  ).map((i) => ({label: i.label ?? '', description: i.description, icon: i.icon ?? 'remote'}));
  const pick = Math.max(0, items.findIndex((i) => i.label === str(params, 'pick', '')));
  const connected = str(params, 'connected', 'Tunnel: my-machine');
  const open = ev('open', A - 16, A - 30);
  const connects = has('connect');
  const connect = connects ? ev('connect', open + 60, open + 36) : open + 60;
  const box = editorBox(true);
  const rowY = QUICK.y + 40 + pick * QUICK.rowH + 11;
  const Component: React.FC<{f: number}> = ({f}) => {
    const [cx, cy] = cursorAt(f, [
      [open - 30, 260, 520],
      [open - 4, 22, WB.statusY + 15],
      [connect - 30, 22, WB.statusY + 15],
      [connect - 4, QUICK.x + 160, rowY],
      ...(connects ? ([[connect + 30, QUICK.x + 420, rowY + 260]] as [number, number, number][]) : []),
    ]);
    const p = settle(f, open + 4) * (connects ? 1 - clamp((f - (connect + 6)) / 6) : 1);
    const done = connects && f >= connect + 18;
    const down = connects ? press(f, connect) : 0;
    return (
      <Workbench
        sidebar={{title: 'Explorer', content: <ExplorerTree project="my-project" files={['src', 'server.ts', 'package.json']} open="server.ts" />}}
        tabs={[{label: 'server.ts', active: true}]}
        editor={<Code x={box.x} y={contentTop + 10} w={box.w} lines={['import {serve} from "./http";', '', 'serve({port: 8080});']} current={3} />}
        status={{remote: done ? connected : null, remoteBg: done ? '#16825d' : f >= open ? '#0078d4' : undefined}}
      >
        <QuickInput p={p} value="" placeholder="Select an option to open a Remote Window" items={items} selected={f >= connect - 14 ? pick : 0} f={f} />
        {f >= open - 30 ? <Cursor x={cx} y={cy} press={Math.max(press(f, open), down)} opacity={clamp((f - (open - 30)) / 6)} /> : null}
        <ClickRing x={cx} y={cy} f={f} at={open + 2} />
        {connects ? <ClickRing x={cx} y={cy} f={f} at={connect + 2} /> : null}
      </Workbench>
    );
  };
  return {
    Component,
    loupe: {block: [QUICK.x - 14, QUICK.y - 14, QUICK.w + 28, 40 + items.length * QUICK.rowH + 36]},
    cues: [{at: open, sfx: 'click', volume: 0.2}, ...(connects ? [{at: connect, sfx: 'click', volume: 0.22}] : [])],
    chrome: 'window',
  };
};
