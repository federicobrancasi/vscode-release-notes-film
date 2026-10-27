import React from 'react';
import {clamp, settle} from '../motion';
import {AgentsWindow, ChatInput, UserBubble} from '../ui/AgentsWindow';
import {Dock, MenuBar, VSCODE_TILE, Wallpaper} from '../ui/MacDock';
import {A, contextOf, num, openSession} from './common';
import type {SceneMake} from './types';

// The app icon shows a badge: the Mac desktop, VS Code's window minimizing into its Dock tile, the tile bouncing, then
// the badge popping in on its word and counting up once.
//   params: count (the badge's number, default 2: it shows count - 1, then count), context (the window minimizing)
//   events: badge (the badge pops in)

export const appBadge: SceneMake = (params, {ev, day}) => {
  const count = Math.max(1, Math.round(num(params, 'count', 2)));
  const ctx = contextOf(params, {
    project: 'my-project',
    groups: [{label: 'my-project', icon: 'folder', sessions: [{title: 'Add an empty state', time: 'now', selected: true}, {title: 'Fix flaky terminal tests', time: 'now'}]}],
    prompt: 'Show an empty state when the sessions list has no sessions.',
    reply: '',
  });
  const badge1 = ev('badge', A + 40, A + 20);
  const badge2 = badge1 + 56;
  const bounceAt = A + 2;
  const Component: React.FC<{f: number}> = ({f}) => {
    const [tx, ty] = VSCODE_TILE;
    const m = clamp((f - 20) / 26);
    const e = m * m * m;
    const win = {x: 256, y: 64, w: 768, h: 432};
    const wx = win.x + (tx - win.x) * e;
    const wy = win.y + (ty - win.y) * e;
    const ws = 1 - (1 - 64 / win.w) * e;
    const u = (f - bounceAt) / 27;
    const bounce = u > 0 && u < 2 ? 34 * Math.abs(Math.sin(Math.PI * u)) * (u < 1 ? 1 : 0.55) : 0;
    const second = count > 1 && f >= badge2;
    const shown = second ? count : count > 1 ? count - 1 : count;
    const p = second ? 0.9 + 0.1 * settle(f, badge2) + 0.12 * clamp(1 - (f - badge2) / 8) : settle(f, badge1);
    return (
      <div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
        <Wallpaper />
        <MenuBar day={day} />
        {m < 1 ? (
          <div style={{position: 'absolute', left: wx, top: wy, width: 1280, height: 720, transformOrigin: '0 0', transform: `scale(${(ws * win.w) / 1280}, ${((ws * win.w) / 1280) * (1 - 0.25 * e)})`, opacity: 1 - clamp((m - 0.85) / 0.15), borderRadius: 18, overflow: 'hidden', boxShadow: '0 40px 90px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.12)'}}>
            <AgentsWindow project={ctx.project} groups={ctx.groups} chatTitle={openSession(ctx)} transcript={<UserBubble y={92} text={ctx.prompt} />} input={<ChatInput working />} />
          </div>
        ) : null}
        <Dock bounce={bounce} badge={{count: shown, p}} day={day} />
      </div>
    );
  };
  return {
    Component,
    loupe: {block: [VSCODE_TILE[0] - 62, VSCODE_TILE[1] - 35, 188, 123], mag: 2.3},
    cues: [{at: badge1, sfx: 'pop', volume: 0.16}, ...(count > 1 ? [{at: badge2, sfx: 'pop', volume: 0.16}] : [])],
    chrome: 'screen',
  };
};
