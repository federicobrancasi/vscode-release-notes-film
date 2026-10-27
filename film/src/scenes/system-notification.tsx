import React from 'react';
import {UI} from '../design';
import {clamp, settle} from '../motion';
import {AgentsWindow, ChatInput, UserBubble} from '../ui/AgentsWindow';
import {ClickRing, Cursor, cursorAt} from '../ui/kit';
import {AppIcon, Dock, MenuBar, Wallpaper} from '../ui/MacDock';
import {A, contextOf, list, openSession, press, str} from './common';
import type {SceneMake} from './types';

// A notification from the OS, outside VS Code's window (a session needs your input while you're elsewhere): the Mac
// desktop, VS Code's banner sliding in at the top right on its word, its action shown on hover and clicked.
//   params: title (the banner's title, default "Visual Studio Code"), message, actions [labels], context
//   events: show (it slides in), click (its action is clicked and the banner goes: only on its word; without one,
//           the pointer rests on it, its action showing)

const W = 344;
const X = 1280 - 12 - W;
const Y = 34;

export const systemNotification: SceneMake = (params, {ev, has, day}) => {
  const title = str(params, 'title', 'Visual Studio Code');
  const message = str(params, 'message', 'A session needs your input: "Add an empty state"');
  const given = list<{label: string}>(params, 'actions').map((a) => a.label);
  const actions = given.length ? given : ['Open'];
  const ctx = contextOf(params, {
    project: 'my-project',
    groups: [{label: 'my-project', icon: 'folder', sessions: [{title: 'Add an empty state', time: 'now', selected: true}, {title: 'Fix flaky terminal tests', time: 'now'}]}],
    prompt: 'Show an empty state when the sessions list has no sessions.',
    reply: '',
  });
  const show = ev('show', A - 10, A - 24);
  const clicks = has('click');
  const click = clicks ? ev('click', show + 80, show + 40) : show + 100;
  const H = 64 + Math.ceil(message.length / 44) * 16;
  const btn = {x: X + W - 12 - 80, y: Y + H - 6};
  const Component: React.FC<{f: number}> = ({f}) => {
    const p = settle(f, show);
    const hover = clamp((f - (click - 24)) / 8);
    const gone = clicks ? clamp((f - (click + 10)) / 10) : 0;
    const down = clicks ? press(f, click) : 0;
    const [cx, cy] = cursorAt(f, [
      [click - 40, 760, 360],
      [click - 4, btn.x + 40, btn.y + 14],
    ]);
    return (
      <div style={{position: 'absolute', inset: 0, overflow: 'hidden', fontFamily: UI}}>
        <Wallpaper />
        <MenuBar day={day} />
        <div style={{position: 'absolute', left: 90, top: 70, width: 760, height: 428, borderRadius: 12, overflow: 'hidden', boxShadow: '0 30px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.12)', opacity: 0.94}}>
          <div style={{position: 'absolute', left: 0, top: 0, width: 1280, height: 720, transform: `scale(${760 / 1280})`, transformOrigin: '0 0'}}>
            <AgentsWindow project={ctx.project} groups={ctx.groups} chatTitle={openSession(ctx)} transcript={<UserBubble y={92} text={ctx.prompt} />} input={<ChatInput working />} />
          </div>
        </div>
        <Dock bounce={0} badge={{count: 1, p: settle(f, show + 6)}} day={day} />
        {p > 0 && gone < 1 ? (
          <div style={{position: 'absolute', left: X + (1 - p) * (W + 24), top: Y, width: W, height: H + (hover > 0 ? 34 * hover : 0), borderRadius: 16, background: 'rgba(42,44,52,0.82)', border: '1px solid rgba(255,255,255,0.16)', boxShadow: '0 12px 40px rgba(0,0,0,0.45)', opacity: 1 - gone, overflow: 'hidden'}}>
            <div style={{position: 'absolute', left: 12, top: 12}}>
              <AppIcon id="vscode" size={38} />
            </div>
            <div style={{position: 'absolute', left: 60, top: 12, right: 14}}>
              <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <span style={{fontSize: 13, fontWeight: 600, color: '#ffffff'}}>{title}</span>
                <span style={{fontSize: 12, color: 'rgba(255,255,255,0.55)'}}>now</span>
              </div>
              <div style={{marginTop: 3, fontSize: 13, lineHeight: '16px', color: 'rgba(255,255,255,0.88)'}}>{message}</div>
            </div>
            {hover > 0 ? (
              <div style={{position: 'absolute', left: 60, right: 12, top: H - 4, display: 'flex', gap: 8, justifyContent: 'flex-end', opacity: hover}}>
                {actions.map((a) => (
                  <div key={a} style={{height: 26, padding: '0 16px', borderRadius: 8, background: 'rgba(255,255,255,0.14)', display: 'flex', alignItems: 'center', transform: `scale(${1 - 0.06 * down})`}}>
                    <span style={{fontSize: 13, color: '#ffffff'}}>{a}</span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
        {f >= click - 40 && gone < 1 ? <Cursor x={cx} y={cy} press={down} opacity={clamp((f - (click - 40)) / 6)} /> : null}
        {clicks ? <ClickRing x={cx} y={cy} f={f} at={click + 2} /> : null}
      </div>
    );
  };
  return {
    Component,
    loupe: {block: [X - 18, Y - 16, W + 30, H + 34 + 30]},
    cues: [{at: show, sfx: 'pop', volume: 0.16}, ...(clicks ? [{at: click, sfx: 'click', volume: 0.2}] : [])],
    chrome: 'screen',
  };
};
