import React from 'react';
import {clamp, settle} from '../motion';
import {AgentsWindow, ChatInput, UserBubble} from '../ui/AgentsWindow';
import {AW, ClickRing, Codicon, Cursor, cursorAt, T} from '../ui/kit';
import {A, contextOf, list, openSession, press, str} from './common';
import type {SceneMake} from './types';

// The agent asks before it runs a command (a model and credits a recording can't spend): the confirmation shows the
// command, its Allow menu opens on its word, an option is picked, and the command's output follows.
//   params: title (the confirmation's question), command, options [labels] (Allow's menu), pick (the option chosen),
//           output [lines], context
//   events: ask (the confirmation appears), allow (the option is picked)

const BOX = {x: 335, y: 150, w: 583};

export const toolApproval: SceneMake = (params, {ev}) => {
  const title = str(params, 'title', 'Run command in terminal?');
  const command = str(params, 'command', 'npm test');
  const given = list<{label: string}>(params, 'options').map((o) => o.label);
  const options = given.length ? given : ['Allow Once', 'Allow in this Session', 'Always Allow'];
  const pick = Math.max(0, options.indexOf(str(params, 'pick', 'Allow in this Session')));
  const output = list<{label: string}>(params, 'output').map((o) => o.label);
  const out = output.length ? output : ['> my-project@1.0.0 test', '> node --test', '', '✔ tests 24  ✔ pass 24  ✖ fail 0'];
  const ctx = contextOf(params, {
    project: 'my-project',
    groups: [{label: 'my-project', icon: 'folder', sessions: [{title: 'Run the unit tests', time: 'now', selected: true}, {title: 'To-do Tagline', time: 'yesterday'}]}],
    prompt: 'Run the unit tests and tell me what fails.',
    reply: 'All 24 tests pass.',
  });
  const ask = ev('ask', A - 24, A - 34);
  const menuAt = ask + 46;
  const allow = ev('allow', menuAt + 36, menuAt + 24);
  const btn = {x: BOX.x + 12, y: BOX.y + 82};
  const menu = {x: btn.x, y: btn.y + 30};
  const Component: React.FC<{f: number}> = ({f}) => {
    const p = settle(f, ask);
    const open = settle(f, menuAt + 2) * (1 - clamp((f - (allow + 6)) / 6));
    const ran = f >= allow + 10;
    const [cx, cy] = cursorAt(f, [
      [menuAt - 30, 700, 520],
      [menuAt - 4, btn.x + 62, btn.y + 12],
      [allow - 4, menu.x + 90, menu.y + 4 + pick * 24 + 12],
      [allow + 40, menu.x + 260, menu.y + 160],
    ]);
    return (
      <AgentsWindow
        project={ctx.project}
        groups={ctx.groups}
        chatTitle={openSession(ctx)}
        transcript={
          <>
            <UserBubble y={92} text={ctx.prompt} />
            {p > 0 ? (
              <div style={{position: 'absolute', left: BOX.x, top: BOX.y, width: BOX.w, height: ran ? 70 + out.length * 18 + 16 : 118, boxSizing: 'border-box', borderRadius: 8, border: `1px solid ${AW.panelBorder}`, background: '#1d1e20', opacity: Math.min(1, p * 1.4), transform: `translateY(${(1 - p) * 8}px)`, overflow: 'hidden'}}>
                <div style={{position: 'absolute', left: 12, top: 10, display: 'flex', alignItems: 'center', gap: 8}}>
                  <Codicon name={ran ? 'check' : 'terminal'} size={15} color={ran ? AW.green : AW.muted} />
                  <T weight={600} color={AW.strong}>
                    {ran ? `Ran ${command}` : title}
                  </T>
                </div>
                <div style={{position: 'absolute', left: 12, top: 38, right: 12, height: 26, borderRadius: 4, background: '#141517', display: 'flex', alignItems: 'center', paddingLeft: 10}}>
                  <T mono size={12} color={AW.strong}>{`$ ${command}`}</T>
                </div>
                {ran ? (
                  out.map((l, i) => (
                    <div key={`${l}-${i}`} style={{position: 'absolute', left: 22, top: 72 + i * 18, opacity: clamp((f - (allow + 10 + i * 6)) / 6)}}>
                      <T mono size={12} color={/✔|pass/.test(l) ? AW.green : AW.muted}>
                        {l || ' '}
                      </T>
                    </div>
                  ))
                ) : (
                  <>
                    <div style={{position: 'absolute', left: 12, top: 82, height: 24, display: 'flex', borderRadius: 4, overflow: 'hidden', transform: `scale(${1 - 0.05 * press(f, menuAt)})`}}>
                      <div style={{padding: '0 12px', display: 'flex', alignItems: 'center', background: '#0078d4'}}>
                        <T color="#ffffff">Allow</T>
                      </div>
                      <div style={{width: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#026ec1', borderLeft: '1px solid rgba(255,255,255,0.25)'}}>
                        <Codicon name="chevron-down" size={13} color="#ffffff" />
                      </div>
                    </div>
                    <div style={{position: 'absolute', left: 104, top: 82, height: 24, padding: '0 12px', borderRadius: 4, display: 'flex', alignItems: 'center', background: '#313235'}}>
                      <T color={AW.strong}>Skip</T>
                    </div>
                  </>
                )}
              </div>
            ) : null}
          </>
        }
        input={<ChatInput working={!ran} model={{label: 'HydraFusion', effort: 'Default', p: 1}} />}
      >
        {open > 0 ? (
          <div style={{position: 'absolute', left: menu.x, top: menu.y, width: 230, padding: 4, boxSizing: 'border-box', borderRadius: 7, background: AW.menu, border: `1px solid ${AW.menuBorder}`, boxShadow: '0 10px 30px rgba(0,0,0,0.5)', opacity: clamp(open * 1.4), transform: `translateY(${(1 - open) * 6}px)`}}>
            {options.map((o, i) => (
              <div key={o} style={{height: 24, borderRadius: 4, display: 'flex', alignItems: 'center', padding: '0 10px', background: f >= allow - 12 && i === pick ? AW.menuSelected : undefined}}>
                <T color={AW.strong}>{o}</T>
              </div>
            ))}
          </div>
        ) : null}
        {f >= menuAt - 30 ? <Cursor x={cx} y={cy} press={Math.max(press(f, menuAt), press(f, allow))} opacity={clamp((f - (menuAt - 30)) / 6)} /> : null}
        <ClickRing x={cx} y={cy} f={f} at={menuAt + 2} />
        <ClickRing x={cx} y={cy} f={f} at={allow + 2} />
      </AgentsWindow>
    );
  };
  return {
    Component,
    loupe: {block: [BOX.x - 10, BOX.y - 12, BOX.w + 20, Math.max(118 + 30 + options.length * 24, 70 + out.length * 18 + 16) + 26]},
    cues: [{at: ask, sfx: 'pop', volume: 0.12}, {at: menuAt, sfx: 'click', volume: 0.2}, {at: allow, sfx: 'click', volume: 0.22}],
    chrome: 'window',
  };
};
