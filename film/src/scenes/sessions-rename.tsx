import React from 'react';
import {clamp, typeOn} from '../motion';
import {AgentsWindow, ChatInput, Group, UserBubble} from '../ui/AgentsWindow';
import {AW, T} from '../ui/kit';
import {A, contextOf, ease, list, obj, openSession, str} from './common';
import type {SceneMake} from './types';

// A Sessions group renamed in place: its inline rename box is open on the saved name, the new name is typed on its
// word, then the list refreshes under it (a session arrives, the rows slide down) and the draft stays, still focused.
//   params: group (the saved name), draft (what's typed), icon (the group's, default folder-library), sessions
//           [{title, time}] (the group's), arrives {title, time} (the session the refresh brings), context (project,
//           prompt, reply: the open session's)
//   events: type (the typing starts), refresh (the list refreshes: the draft stays)

/** The group's header row in the Sessions list (window px): under Automations and Chats. */
const HEADER = {x: 14, y: 132, h: 26};
const BOX = {x: 36, y: HEADER.y + 2, w: 228, h: 22};

export const sessionsRename: SceneMake = (params, {ev}) => {
  const saved = str(params, 'group', 'Docs');
  const draft = str(params, 'draft', 'Docs and samples');
  const icon = str(params, 'icon', 'folder-library');
  const given = list<{title?: string; label?: string; time?: string}>(params, 'sessions');
  const sessions = (given.length ? given : [{title: 'Update the README', time: '1 hour ago'}, {title: 'Add a code sample', time: 'yesterday'}]).map((s) => ({title: s.title ?? s.label ?? '', time: s.time ?? 'now'}));
  const arrives = {title: str(obj(params, 'arrives'), 'title', 'Fix a broken link'), time: str(obj(params, 'arrives'), 'time', 'now')};
  const ctx = contextOf(params, {project: 'my-project', groups: [], prompt: `${sessions[0]?.title ?? ''}.`, reply: ''});
  const type = ev('type', A + 6, A);
  const typed = type + Math.max(12, draft.length * 2);
  const refresh = ev('refresh', typed + 40, typed + 16);
  const Component: React.FC<{f: number}> = ({f}) => {
    const arrive = ease(clamp((f - refresh) / 18));
    const groups: Group[] = [
      {
        label: '',
        icon,
        sessions: [
          ...(arrive > 0 ? [{...arrives, collapse: 1 - arrive, opacity: arrive}] : []),
          ...sessions.map((s, i) => ({...s, selected: i === 0})),
        ],
      },
    ];
    // Before the typing, the saved name is selected whole (the rename just started); then the draft is typed over it.
    const n = typeOn(f, type, typed, draft.length);
    const text = f < type ? saved : draft.slice(0, n);
    const selected = f < type;
    const caret = f >= type && Math.floor((f - typed) / 16) % 2 === 0;
    return (
      <AgentsWindow
        project={ctx.project}
        groups={groups}
        chatTitle={openSession({...ctx, groups})}
        transcript={<UserBubble y={92} text={ctx.prompt} />}
        input={<ChatInput model={{label: 'HydraFusion', effort: 'Default', p: 1}} />}
      >
        <div style={{position: 'absolute', left: BOX.x, top: BOX.y, width: BOX.w, height: BOX.h, boxSizing: 'border-box', borderRadius: 4, background: AW.input, border: `1px solid ${AW.focus}`, display: 'flex', alignItems: 'center', padding: '0 6px', overflow: 'hidden'}}>
          <T color={AW.strong} style={selected ? {background: '#264f78'} : undefined}>
            {text}
          </T>
          {!selected && caret ? <div style={{width: 1, height: 15, marginLeft: 1, background: AW.strong}} /> : null}
        </div>
      </AgentsWindow>
    );
  };
  return {
    Component,
    // The Sessions list's top (the rename box and the rows the refresh moves), narrow enough that the lens, which keeps
    // its margin at the right of a block on the window's left edge, stops at the sidebar's edge.
    loupe: {block: [0, 48, 250, 322]},
    cues: [
      {at: type, sfx: 'tick', volume: 0.1},
      {at: refresh, sfx: 'pop', volume: 0.14},
    ],
    chrome: 'window',
  };
};
