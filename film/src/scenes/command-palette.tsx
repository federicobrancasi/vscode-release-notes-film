import React from 'react';
import {settle, typeOn} from '../motion';
import {Code} from '../ui/Editor';
import {QUICK, QuickInput, QuickItem} from '../ui/Overlays';
import {contentTop, editorBox, ExplorerTree, Workbench} from '../ui/Workbench';
import {A, list, str} from './common';
import type {SceneMake} from './types';

// The Command Palette: it opens, the query is typed on its word, the commands that match show, and the selection moves
// to the one the change is about (a new command, a renamed one, a new keybinding).
//   params: query (typed after ">"), items [{label ("Category: Title"), keybinding ("⌘K F"), isNew}]
//   events: type (the typing starts), select (the selection moves to the first isNew item, or the second)

const CODE = ['import {createApp} from "./app";', '', 'const app = createApp({', '  port: 3000,', '  logLevel: "info",', '});', '', 'app.start();'];

export const commandPalette: SceneMake = (params, {ev}) => {
  const query = str(params, 'query', 'Chat: Fork');
  const given = list<{label?: string; keybinding?: string; isNew?: boolean}>(params, 'items');
  const items: QuickItem[] = (given.length ? given : [{label: 'Chat: Fork Conversation', keybinding: ''}, {label: 'Chat: Fork Conversation with Title', isNew: true}, {label: 'Chat: Fork Conversation and Send', isNew: true}]).map((i) => ({
    label: i.label ?? '',
    keys: i.keybinding ? i.keybinding.split(/\s+/).filter(Boolean) : undefined,
    isNew: Boolean(i.isNew),
  }));
  const target = Math.max(0, items.findIndex((i) => i.isNew)) || Math.min(1, items.length - 1);
  const open = A - 30;
  const type = ev('type', A - 16, A - 24);
  const typedAt = type + query.length * 3 + 4;
  const select = ev('select', typedAt + 40, typedAt + 16);
  const box = editorBox(true);
  const Component: React.FC<{f: number}> = ({f}) => {
    const value = `>${query.slice(0, typeOn(f, type, typedAt, query.length))}`;
    const p = settle(f, open);
    const listP = settle(f, type + 4);
    return (
      <Workbench sidebar={{title: 'Explorer', content: <ExplorerTree project="my-project" files={['src', 'main.ts', 'package.json']} open="main.ts" />}} tabs={[{label: 'main.ts', active: true}]} editor={<Code x={box.x} y={contentTop + 10} w={box.w} lines={CODE} current={8} />}>
        <QuickInput p={p} value={f >= type ? value : '>'} items={items} selected={f >= select ? target : 0} listP={listP} f={f} />
      </Workbench>
    );
  };
  return {
    Component,
    loupe: {block: [QUICK.x - 14, QUICK.y - 14, QUICK.w + 28, 40 + items.length * QUICK.rowH + 8 + 28]},
    cues: [{at: open, sfx: 'tick', volume: 0.1}, {at: select, sfx: 'tick', volume: 0.12}],
    chrome: 'window',
  };
};
