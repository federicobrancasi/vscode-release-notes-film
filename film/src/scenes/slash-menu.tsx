import React from 'react';
import {clamp, settle, typeOn} from '../motion';
import {AgentsWindow, ChatInput, INPUT, UserBubble} from '../ui/AgentsWindow';
import {AW, T} from '../ui/kit';
import {A, contextOf, list, openSession, str} from './common';
import type {SceneMake} from './types';

// A slash command in the chat input: it's typed on its word, the suggestions open over the input, and the selection
// moves to the entry the change is about.
//   params: typed ("/fork"), entries [{label, description, isNew}], placeholder, context
//   events: type (the typing starts), select (the selection moves to the first isNew entry, or the second)

export const slashMenu: SceneMake = (params, {ev}) => {
  const typed = str(params, 'typed', '/fork');
  const placeholder = str(params, 'placeholder', 'Chat with Copilot');
  const given = list<{label?: string; description?: string; isNew?: boolean}>(params, 'entries');
  const entries = given.length
    ? given.map((e) => ({label: e.label ?? '', description: e.description ?? '', isNew: Boolean(e.isNew)}))
    : [
        {label: '/fork', description: 'Fork the conversation into a new session', isNew: false},
        {label: '/fork <title>', description: 'Fork it with a title', isNew: true},
        {label: '/fork prompt <prompt>', description: 'Fork it and send a prompt', isNew: true},
      ];
  const target = Math.max(0, entries.findIndex((e) => e.isNew)) || Math.min(1, entries.length - 1);
  const ctx = contextOf(params, {
    project: 'my-project',
    groups: [{label: 'my-project', icon: 'folder', sessions: [{title: 'To-do Tagline', time: 'now', selected: true}, {title: 'Fix flaky terminal tests', time: '2 hours ago'}]}],
    prompt: 'Suggest a one-line tagline for a to-do list app.',
    reply: '"Get it done, one tick at a time."',
  });
  const type = ev('type', A - 20, A - 40);
  const typedAt = type + typed.length * 4 + 6;
  const select = ev('select', typedAt + 34, typedAt + 14);
  const ROW = 24;
  const listH = entries.length * ROW + 8;
  const listY = INPUT.y - 6 - listH;
  const Component: React.FC<{f: number}> = ({f}) => {
    const text = typed.slice(0, typeOn(f, type, typedAt - 6, typed.length));
    const open = settle(f, typedAt - 4);
    const sel = f >= select ? target : 0;
    return (
      <AgentsWindow
        project={ctx.project}
        groups={ctx.groups}
        chatTitle={openSession(ctx)}
        transcript={
          <>
            <UserBubble y={92} text={ctx.prompt} />
            <div style={{position: 'absolute', left: 335, top: 140, width: 583}}>
              <T style={{whiteSpace: 'normal', lineHeight: '20px'}}>{ctx.reply}</T>
            </div>
          </>
        }
        input={<ChatInput focused={f >= type - 6} placeholder={placeholder} text={text ? <T color={AW.strong}>{text}</T> : undefined} model={{label: 'HydraFusion', effort: 'Default', p: 1}} />}
      >
        {open > 0 ? (
          <div style={{position: 'absolute', left: INPUT.x, top: listY, width: 470, height: listH, padding: 4, boxSizing: 'border-box', borderRadius: 6, background: AW.menu, border: `1px solid ${AW.menuBorder}`, boxShadow: '0 10px 30px rgba(0,0,0,0.5)', opacity: clamp(open * 1.4), transform: `translateY(${(1 - open) * 8}px)`}}>
            {entries.map((e, i) => (
              <div key={`${e.label}-${i}`} style={{height: ROW, borderRadius: 4, display: 'flex', alignItems: 'center', gap: 10, padding: '0 8px', background: i === sel ? AW.menuSelected : undefined}}>
                <T mono size={12} color={AW.strong}>
                  {e.label}
                </T>
                <T size={12} color={i === sel ? AW.fg : AW.muted} style={{overflow: 'hidden', textOverflow: 'ellipsis'}}>
                  {e.description}
                </T>
              </div>
            ))}
          </div>
        ) : null}
      </AgentsWindow>
    );
  };
  return {
    Component,
    loupe: {block: [INPUT.x - 10, listY - 12, 600, INPUT.y + INPUT.h - listY + 46]},
    cues: [{at: typedAt - 4, sfx: 'tick', volume: 0.1}, {at: select, sfx: 'tick', volume: 0.12}],
    chrome: 'window',
  };
};
