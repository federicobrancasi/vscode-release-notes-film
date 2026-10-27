import React from 'react';
import {clamp, settle} from '../motion';
import {AW, ClickRing, Cursor, cursorAt, T} from '../ui/kit';
import {Menu} from '../ui/Overlays';
import {ActivityBadge, activityAt, contentTop, editorBox, ExplorerTree, Workbench} from '../ui/Workbench';
import {A, list, press, str} from './common';
import type {SceneMake} from './types';

// An update (Stable's update channel, which a build can't show): the Manage gear's badge pops on its word, the gear is
// clicked, "Restart to Update (1)" is picked, and the release notes open.
//   params: version (e.g. 1.145), notes [lines] (the release notes' first lines)
//   events: badge (the gear's badge pops), restart (Restart to Update is clicked and the release notes open: only on
//           its word; without one, the pointer rests on it)

export const update: SceneMake = (params, {ev, has}) => {
  const version = str(params, 'version', '1.145');
  const given = list<{label: string}>(params, 'notes').map((n) => n.label);
  const notes = given.length ? given : ['Agents window: nested sessions', 'Chat: fork a conversation with a title', 'Settings: a policy indicator you can hover'];
  const badge = ev('badge', A - 8, A - 30);
  const menuAt = badge + 36;
  const restarts = has('restart');
  const restart = restarts ? ev('restart', menuAt + 44, menuAt + 26) : menuAt + 40;
  const [gx, gy] = activityAt('settings-gear');
  const items = [{label: 'Command Palette...', keys: ['⇧', '⌘', 'P']}, {label: 'Profiles'}, {label: 'Settings', keys: ['⌘', ',']}, {label: 'Extensions', keys: ['⇧', '⌘', 'X']}, {separator: true, label: ''}, {label: 'Themes'}, {separator: true, label: ''}, {label: 'Restart to Update (1)'}];
  const menu = {x: 50, y: gy - items.length * 24 + 26};
  const target = items.length - 1;
  const box = editorBox(true);
  const Component: React.FC<{f: number}> = ({f}) => {
    const [cx, cy] = cursorAt(f, [
      [menuAt - 30, 300, 520],
      [menuAt - 4, gx + 13, gy + 13],
      [restart - 14, menu.x + 120, menu.y + 4 + target * 24 - 8],
      [restart - 4, menu.x + 120, menu.y + 4 + target * 24 - 8],
    ]);
    const open = settle(f, menuAt + 2) * (restarts ? 1 - clamp((f - (restart + 6)) / 6) : 1);
    const restarted = restarts && f >= restart + 20;
    const fade = restarts ? clamp((f - (restart + 8)) / 12) : 0;
    const down = restarts ? press(f, restart) : 0;
    return (
      <Workbench
        gearBadge={restarted ? null : <ActivityBadge x={gx + 14} y={gy + 12} text="1" p={settle(f, badge)} />}
        sidebar={{title: 'Explorer', content: <ExplorerTree project="my-project" files={['src', 'package.json', 'README.md']} open={restarted ? undefined : 'README.md'} />}}
        tabs={restarted ? [{label: `Release Notes: ${version}`, vscode: true, active: true}] : [{label: 'README.md', active: true}]}
        editor={
          restarted ? (
            <div style={{position: 'absolute', left: box.x + 60, top: contentTop + 50, opacity: clamp((f - (restart + 20)) / 12)}}>
              <T size={26} weight={600} color={AW.strong}>{`What's new in ${version}`}</T>
              {notes.map((n, i) => (
                <div key={n} style={{marginTop: i ? 10 : 24}}>
                  <T size={15} color={AW.fg}>{`• ${n}`}</T>
                </div>
              ))}
            </div>
          ) : null
        }
      >
        {fade > 0 && !restarted ? <div style={{position: 'absolute', inset: 0, background: `rgba(18,19,21,${fade})`}} /> : null}
        <Menu x={menu.x} y={menu.y} w={280} p={open} selected={f >= restart - 14 ? target : -1} items={items} />
        {f >= menuAt - 30 && !restarted ? <Cursor x={cx} y={cy} press={Math.max(press(f, menuAt), down)} opacity={clamp((f - (menuAt - 30)) / 6)} /> : null}
        <ClickRing x={cx} y={cy} f={f} at={menuAt + 2} />
        {restarts ? <ClickRing x={cx} y={cy} f={f} at={restart + 2} /> : null}
      </Workbench>
    );
  };
  return {
    Component,
    loupe: {block: [0, menu.y - 20, 380, 720 - menu.y + 20]},
    cues: [{at: badge, sfx: 'pop', volume: 0.14}, {at: menuAt, sfx: 'click', volume: 0.2}, ...(restarts ? [{at: restart, sfx: 'click', volume: 0.22}] : [])],
    chrome: 'window',
  };
};
