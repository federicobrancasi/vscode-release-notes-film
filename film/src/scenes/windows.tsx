import React from 'react';
import {Img, staticFile} from 'remotion';
import {UI} from '../design';
import {VSCODE_ICON} from '../kit/Logo';
import {clamp, settle} from '../motion';
import {AgentsWindow, ChatInput, UserBubble} from '../ui/AgentsWindow';
import {AW, ClickRing, Codicon, Cursor, cursorAt, T} from '../ui/kit';
import {UI_MONO} from '../design';
import {AppIcon} from '../ui/MacDock';
import {A, contextOf, list, num, obj, openSession, press, str} from './common';
import type {SceneMake} from './types';

// VS Code on Windows 11 (another OS): an original desktop and taskbar, VS Code's window with its Windows title bar
// controls, the taskbar tile's badge popping on its word, and a right-click opening its jump list. With `terminal`, the
// window shows a terminal running a command; with `prompt`, that command's own window (a sign-in) opens in front of VS
// Code on its word, and the lens is on it.
//   params: count (the badge's number, default 2), tasks [labels] (the jump list's tasks), recent [labels], context,
//           terminal [lines] (what the terminal shows), prompt {title, message, account, buttons [labels]}
//   events: badge (the badge appears), open (the jump list opens), prompt (the prompt opens in front of VS Code)

const BAR = {h: 48, y: 720 - 48};
const TILE = 40;
const TILES = ['start', 'search', 'files', 'browser', 'terminal', 'vscode'] as const;
const tileX = (i: number) => 640 - (TILES.length * (TILE + 6)) / 2 + i * (TILE + 6);
const VS = TILES.indexOf('vscode');

const Wallpaper: React.FC = () => (
  <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(80% 70% at 30% 30%, #2c5fb8 0%, rgba(44,95,184,0) 60%), radial-gradient(70% 60% at 80% 70%, #1a8f9e 0%, rgba(26,143,158,0) 60%), linear-gradient(160deg, #0e1f3d, #0a2a3a)'}}>
    <div style={{position: 'absolute', left: 120, top: 120, width: 1100, height: 520, borderRadius: '50%', border: '60px solid rgba(140,200,255,0.10)', filter: 'blur(18px)', transform: 'rotate(-12deg)'}} />
  </div>
);

/** An original start button: a 3 × 3 grid of dots (not any company's logo). */
const Start: React.FC = () => (
  <div style={{width: TILE, height: TILE, display: 'grid', gridTemplateColumns: 'repeat(3, 5px)', gap: 3, alignContent: 'center', justifyContent: 'center'}}>
    {Array.from({length: 9}, (_, i) => (
      <div key={i} style={{width: 5, height: 5, borderRadius: 1.5, background: '#9fd0ff'}} />
    ))}
  </div>
);

export const windows: SceneMake = (params, {ev, day}) => {
  const count = Math.max(1, Math.round(num(params, 'count', 2)));
  const tasks = list<{label: string}>(params, 'tasks').map((t) => t.label);
  const recent = list<{label: string}>(params, 'recent').map((t) => t.label);
  const jump = {recent: recent.length ? recent : ['my-project', 'docs-site', 'api-server'], tasks: tasks.length ? tasks : ['New Window', 'New Agents Window']};
  const ctx = contextOf(params, {
    project: 'my-project',
    groups: [{label: 'my-project', icon: 'folder', sessions: [{title: 'Add an empty state', time: 'now', selected: true}, {title: 'Fix flaky terminal tests', time: 'now'}]}],
    prompt: 'Show an empty state when the sessions list has no sessions.',
    reply: '',
  });
  const terminal = list<{label: string}>(params, 'terminal').map((l) => l.label);
  const ask = obj(params, 'prompt');
  const prompting = Object.keys(ask).length > 0;
  const promptAt = prompting ? ev('prompt', A + 10, A - 6) : -1;
  const pTitle = str(ask, 'title', 'Sign in');
  const pMessage = str(ask, 'message', 'Pick an account to continue.');
  const pAccount = str(ask, 'account', 'me@example.com');
  const pButtons = list<{label: string}>(ask, 'buttons').map((b) => b.label);
  const promptButtons = pButtons.length ? pButtons : ['Continue', 'Cancel'];
  const badge = prompting ? -999 : ev('badge', A + 4, A - 10);
  const open = prompting ? -999 : ev('open', badge + 56, badge + 30);
  const tx = tileX(VS);
  const rows = jump.recent.length + jump.tasks.length;
  const menuH = 30 + rows * 30 + 34;
  const menu = {x: tx + TILE / 2 - 140, y: BAR.y - 10 - menuH, w: 280};
  // The prompt, in the window's middle (screen px of the desktop).
  const PR = {x: 430, y: 150, w: 420, h: 236};
  const Component: React.FC<{f: number}> = ({f}) => {
    const b = prompting ? 0 : settle(f, badge);
    const m = prompting ? 0 : settle(f, open + 2);
    const pp = prompting ? settle(f, promptAt) : 0;
    const [cx, cy] = cursorAt(f, [
      [open - 34, 820, 420],
      [open - 4, tx + 22, BAR.y + 24],
    ]);
    return (
      <div style={{position: 'absolute', inset: 0, overflow: 'hidden', fontFamily: UI}}>
        <Wallpaper />
        <div style={{position: 'absolute', left: 150, top: 40, width: 980, height: 551, borderRadius: 8, overflow: 'hidden', boxShadow: '0 30px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.1)'}}>
          <div style={{position: 'absolute', left: 0, top: 0, width: 1280, height: 720, transform: `scale(${980 / 1280})`, transformOrigin: '0 0'}}>
            {terminal.length ? (
              <div style={{position: 'absolute', inset: 0, background: AW.chrome}}>
                <div style={{position: 'absolute', left: 0, top: 40, width: 1280, height: 680, background: '#121315'}} />
                <div style={{position: 'absolute', left: 20, top: 60}}>
                  <T color={AW.muted}>{`${ctx.project} — Visual Studio Code`}</T>
                </div>
                <div style={{position: 'absolute', left: 0, top: 360, width: 1280, height: 360, background: '#181818', borderTop: `1px solid ${AW.panelBorder}`}}>
                  <div style={{position: 'absolute', left: 20, top: 10, display: 'flex', gap: 22}}>
                    {['PROBLEMS', 'OUTPUT', 'TERMINAL'].map((t) => (
                      <T key={t} size={12} color={t === 'TERMINAL' ? AW.strong : AW.muted} style={t === 'TERMINAL' ? {borderBottom: `1px solid ${AW.strong}`, paddingBottom: 4} : undefined}>
                        {t}
                      </T>
                    ))}
                  </div>
                  {terminal.map((l, i) => (
                    <div key={`${l}-${i}`} style={{position: 'absolute', left: 20, top: 50 + i * 20, fontFamily: UI_MONO, fontSize: 14, lineHeight: '20px', color: i === terminal.length - 1 ? AW.strong : AW.fg, whiteSpace: 'pre'}}>
                      {l}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <AgentsWindow project={ctx.project} groups={ctx.groups} chatTitle={openSession(ctx)} transcript={<UserBubble y={92} text={ctx.prompt} />} input={<ChatInput working />} />
            )}
            {/* Windows draws its own window buttons at the top right, in place of the Mac's at the left. */}
            <div style={{position: 'absolute', left: 0, top: 0, width: 80, height: 40, background: AW.chrome}} />
            <div style={{position: 'absolute', left: 12, top: 12}}>
              <Img src={staticFile(VSCODE_ICON)} style={{width: 18, height: 18}} />
            </div>
            <div style={{position: 'absolute', right: 0, top: 0, height: 40, display: 'flex'}}>
              {['chrome-minimize', 'chrome-maximize', 'chrome-close'].map((n) => (
                <div key={n} style={{width: 46, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: AW.chrome}}>
                  <Codicon name={n} size={16} color={AW.fg} />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{position: 'absolute', left: 0, top: BAR.y, width: 1280, height: BAR.h, background: 'rgba(28,32,44,0.86)', borderTop: '1px solid rgba(255,255,255,0.08)'}} />
        {TILES.map((t, i) => (
          <div key={t} style={{position: 'absolute', left: tileX(i), top: BAR.y + 4, width: TILE, height: TILE, borderRadius: 6, background: t === 'vscode' && m > 0 ? 'rgba(255,255,255,0.1)' : undefined, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            {t === 'start' ? <Start /> : t === 'search' ? <Codicon name="search" size={20} color="#e8e8e8" /> : t === 'vscode' ? <Img src={staticFile(VSCODE_ICON)} style={{width: 26, height: 26}} /> : <AppIcon id={t} size={28} />}
            {t === 'vscode' || t === 'files' ? <div style={{position: 'absolute', left: TILE / 2 - (t === 'vscode' ? 8 : 3), bottom: 1, width: t === 'vscode' ? 16 : 6, height: 3, borderRadius: 2, background: t === 'vscode' ? '#60cdff' : '#9a9a9a'}} /> : null}
            {t === 'vscode' && b > 0 ? (
              <div style={{position: 'absolute', left: 22, top: 20, minWidth: 16, height: 16, borderRadius: 8, padding: '0 4px', boxSizing: 'border-box', background: '#60cdff', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${b})`, boxShadow: '0 0 0 2px rgba(28,32,44,0.9)'}}>
                <span style={{fontSize: 10, fontWeight: 700, color: '#0b1a2b', lineHeight: 1}}>{count}</span>
              </div>
            ) : null}
          </div>
        ))}
        <div style={{position: 'absolute', right: 16, top: BAR.y + 8, textAlign: 'right'}}>
          <div style={{fontSize: 12, color: '#ffffff'}}>9:41 AM</div>
          <div style={{fontSize: 12, color: '#ffffff'}}>{`${day.m}/${day.day}/${day.year}`}</div>
        </div>
        {m > 0 ? (
          <div style={{position: 'absolute', left: menu.x, top: menu.y, width: menu.w, height: menuH, borderRadius: 8, background: 'rgba(36,40,52,0.97)', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 16px 40px rgba(0,0,0,0.5)', opacity: clamp(m * 1.4), transform: `translateY(${(1 - m) * 10}px)`, padding: '8px 6px', boxSizing: 'border-box'}}>
            <div style={{padding: '2px 10px 6px'}}>
              <T size={12} weight={600} color={AW.muted}>Recent</T>
            </div>
            {jump.recent.map((r) => (
              <div key={r} style={{height: 30, display: 'flex', alignItems: 'center', gap: 10, padding: '0 10px'}}>
                <Codicon name="folder" size={15} color="#e8c46a" />
                <T color={AW.strong}>{r}</T>
              </div>
            ))}
            <div style={{height: 1, margin: '4px 8px', background: 'rgba(255,255,255,0.1)'}} />
            {jump.tasks.map((t) => (
              <div key={t} style={{height: 30, display: 'flex', alignItems: 'center', gap: 10, padding: '0 10px'}}>
                <Img src={staticFile(VSCODE_ICON)} style={{width: 15, height: 15}} />
                <T color={AW.strong}>{t}</T>
              </div>
            ))}
          </div>
        ) : null}
        {pp > 0 ? (
          <div style={{position: 'absolute', left: PR.x, top: PR.y, width: PR.w, height: PR.h, borderRadius: 8, background: '#202020', border: '1px solid rgba(255,255,255,0.14)', boxShadow: '0 24px 60px rgba(0,0,0,0.6)', opacity: clamp(pp * 1.5), transform: `scale(${0.94 + 0.06 * pp})`, overflow: 'hidden'}}>
            <div style={{position: 'absolute', left: 0, top: 0, right: 0, height: 32, display: 'flex', alignItems: 'center', paddingLeft: 12}}>
              <span style={{fontSize: 12, color: '#d0d0d0'}}>{pTitle}</span>
            </div>
            <div style={{position: 'absolute', right: 0, top: 0, width: 46, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <Codicon name="chrome-close" size={14} color="#d0d0d0" />
            </div>
            <div style={{position: 'absolute', left: 24, top: 48, fontSize: 20, fontWeight: 600, color: '#ffffff'}}>{pTitle}</div>
            <div style={{position: 'absolute', left: 24, top: 82, fontSize: 13, color: '#c8c8c8'}}>{pMessage}</div>
            <div style={{position: 'absolute', left: 24, right: 24, top: 112, height: 44, borderRadius: 6, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 12}}>
              <div style={{width: 26, height: 26, borderRadius: 13, background: 'linear-gradient(140deg, #7aa7d8, #3b5f8f)'}} />
              <span style={{fontSize: 13, color: '#ffffff'}}>{pAccount}</span>
            </div>
            <div style={{position: 'absolute', right: 24, bottom: 20, display: 'flex', gap: 8}}>
              {promptButtons.map((label, i) => (
                <div key={label} style={{height: 30, padding: '0 18px', borderRadius: 4, display: 'flex', alignItems: 'center', background: i === 0 ? '#4cc2ff' : 'rgba(255,255,255,0.08)'}}>
                  <span style={{fontSize: 13, color: i === 0 ? '#0b1a2b' : '#ffffff', fontWeight: i === 0 ? 600 : 400}}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}
        {!prompting && f >= open - 34 ? <Cursor x={cx} y={cy} press={press(f, open)} opacity={clamp((f - (open - 34)) / 6)} /> : null}
        {!prompting ? <ClickRing x={cx} y={cy} f={f} at={open + 2} /> : null}
      </div>
    );
  };
  return {
    Component,
    loupe: prompting ? {block: [PR.x - 30, PR.y - 30, PR.w + 60, PR.h + 60]} : {block: [menu.x - 20, menu.y - 20, menu.w + 40, 720 - menu.y + 20]},
    cues: prompting ? [{at: promptAt, sfx: 'pop', volume: 0.16}] : [{at: badge, sfx: 'pop', volume: 0.16}, {at: open, sfx: 'click', volume: 0.2}],
    chrome: 'screen',
  };
};
