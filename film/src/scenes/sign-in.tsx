import React from 'react';
import {clamp, settle} from '../motion';
import {Code} from '../ui/Editor';
import {AW, ClickRing, Codicon, Cursor, cursorAt} from '../ui/kit';
import {Menu} from '../ui/Overlays';
import {activityAt, contentTop, editorBox, ExplorerTree, Workbench} from '../ui/Workbench';
import {A, press, str} from './common';
import type {SceneMake} from './types';

// A sign-in the build can't do on camera, told in the Accounts menu: it opens on its word with its sign-in entry, the
// entry is picked, the account turns signed in, and the menu shows the account.
//   params: item (the menu's sign-in entry, the PR's words), account (the signed-in account's name), provider
//   events: menu (the Accounts menu opens), pick (the sign-in entry is picked)

const CODE = ['export function greet(name: string) {', '  return `Hello, ${name}!`;', '}'];

export const signIn: SceneMake = (params, {ev}) => {
  const provider = str(params, 'provider', 'GitHub');
  const item = str(params, 'item', `Sign in with ${provider} to use GitHub Copilot`);
  const account = str(params, 'account', 'my-account');
  const menuAt = ev('menu', A - 12, A - 30);
  const pick = ev('pick', menuAt + 46, menuAt + 26);
  const again = pick + 40;
  const [ax, ay] = activityAt('account');
  const before = [{label: item}, {separator: true, label: ''}, {label: 'Manage Trusted Extensions'}];
  const after = [{label: `${account} (${provider})`}, {label: 'Manage Trusted Extensions'}, {separator: true, label: ''}, {label: 'Sign Out'}];
  const menuY = (n: number) => ay + 26 - n * 24 - 10;
  const box = editorBox(true);
  const Component: React.FC<{f: number}> = ({f}) => {
    const signed = f >= pick + 12;
    const items = f >= again ? after : before;
    const y = menuY(items.filter((i) => !i.separator).length + items.filter((i) => i.separator).length * 0.4);
    const [cx, cy] = cursorAt(f, [
      [menuAt - 30, 300, 520],
      [menuAt - 4, ax + 13, ay + 13],
      [pick - 6, 52 + 150, menuY(2.4) + 16],
      [again - 6, ax + 13, ay + 13],
      [again + 26, ax + 70, ay + 40],
    ]);
    const open = f < again ? settle(f, menuAt + 2) * (1 - clamp((f - (pick + 4)) / 6)) : settle(f, again + 2);
    const ring = signed ? clamp((f - (pick + 12)) / 16) : 0;
    return (
      <Workbench avatar={signed} signIn={!signed} sidebar={{title: 'Explorer', content: <ExplorerTree project="my-project" files={['src', 'greet.ts', 'package.json']} open="greet.ts" />}} tabs={[{label: 'greet.ts', active: true}]} editor={<Code x={box.x} y={contentTop + 10} w={box.w} lines={CODE} current={2} />}>
        {ring > 0 && ring < 1 ? <div style={{position: 'absolute', left: ax + 13 - 11 - 10 * ring, top: ay + 13 - 11 - 10 * ring, width: 22 + 20 * ring, height: 22 + 20 * ring, borderRadius: '50%', border: '2px solid rgba(77,170,252,0.9)', opacity: 1 - ring}} /> : null}
        <Menu x={52} y={y} w={320} p={open} selected={f < again && f >= pick - 12 ? 0 : -1} items={items} />
        {f >= again && open > 0.5 ? (
          <div style={{position: 'absolute', left: 52 + 320 - 30, top: y + 9, opacity: open}}>
            <Codicon name="github" size={14} color={AW.muted} />
          </div>
        ) : null}
        {f >= menuAt - 30 ? <Cursor x={cx} y={cy} press={Math.max(press(f, menuAt), press(f, pick), press(f, again))} opacity={clamp((f - (menuAt - 30)) / 6)} /> : null}
        <ClickRing x={cx} y={cy} f={f} at={menuAt + 2} />
        <ClickRing x={cx} y={cy} f={f} at={pick + 2} />
        <ClickRing x={cx} y={cy} f={f} at={again + 2} />
      </Workbench>
    );
  };
  return {
    Component,
    loupe: {block: [0, menuY(4) - 24, 400, 720 - (menuY(4) - 24)]},
    cues: [{at: menuAt, sfx: 'click', volume: 0.2}, {at: pick, sfx: 'click', volume: 0.22}, {at: again, sfx: 'click', volume: 0.2}],
    chrome: 'window',
  };
};
