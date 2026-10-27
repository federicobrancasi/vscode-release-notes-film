import React from 'react';
import {clamp, settle} from '../motion';
import {AgentsWindow, ChatInput, Group, UserBubble} from '../ui/AgentsWindow';
import {AW, Codicon, T} from '../ui/kit';
import {A, contextOf, ease, list, spin, str} from './common';
import type {SceneMake} from './types';

// An agent organizing the Sessions list: asked in chat, it reads the list, then organizes it (its tool lines in the
// chat), and the list changes under the lens: the sessions it pins rise into Pinned, the ones it archives close up.
//   params: sessions [{title, time}], pin [titles], archive [titles], reading / read / organizing / organized (its tool
//           lines, the PR's words), context (project, group, prompt)
//   events: read (it reads the list), organize (it starts organizing), done (the list changes)

export const sessionsOrganize: SceneMake = (params, {ev}) => {
  const given = list<{title?: string; label?: string; time?: string}>(params, 'sessions');
  const sessions = (given.length ? given : [{title: 'Welcome page sign-in', time: 'yesterday'}, {title: 'Fix flaky terminal tests', time: '2 hours ago'}, {title: 'Refactor quick pick', time: '2 days ago'}, {title: 'Update telemetry docs', time: '3 weeks ago'}]).map((s) => ({title: s.title ?? s.label ?? '', time: s.time ?? 'now'}));
  const pin = new Set(list<{label: string}>(params, 'pin').map((p) => p.label));
  const archive = new Set(list<{label: string}>(params, 'archive').map((a) => a.label));
  if (!pin.size && !archive.size) {
    pin.add(sessions[0]?.title ?? '');
    archive.add(sessions[sessions.length - 1]?.title ?? '');
  }
  const lines = {
    reading: str(params, 'reading', 'Reading the Sessions list'),
    read: str(params, 'read', 'Read the Sessions list'),
    organizing: str(params, 'organizing', `Organizing the Sessions list (${pin.size + archive.size} changes)`),
    organized: str(params, 'organized', 'Organized the Sessions list'),
  };
  const ctx = contextOf(params, {project: 'my-project', groups: [{label: 'my-project', icon: 'folder', sessions: []}], prompt: 'Pin the Welcome page session and archive the old ones.', reply: ''});
  const group = ctx.groups[0] ?? {label: 'my-project', icon: 'folder', sessions: []};
  // Its tool lines follow the lens: what it shows is the list, and nothing happens before the lens is on.
  const read = ev('read', A, A - 4);
  const organize = ev('organize', read + 40, read + 20);
  const done = ev('done', organize + 40, organize + 24);
  const Component: React.FC<{f: number}> = ({f}) => {
    const moved = ease(clamp((f - done) / 22));
    const groups: Group[] = [
      ...(moved > 0
        ? [{label: 'Pinned', icon: 'pinned', sessions: sessions.filter((s) => pin.has(s.title)).map((s) => ({...s, collapse: 1 - moved, opacity: moved}))}]
        : []),
      {
        label: group.label,
        icon: group.icon,
        sessions: sessions.map((s) => ({...s, selected: false, collapse: pin.has(s.title) || archive.has(s.title) ? moved : 0})),
      },
    ];
    const step = (label: string, doing: string, at: number, end: number, i: number) =>
      f >= at ? (
        <div key={label} style={{position: 'absolute', left: 335, top: 148 + i * 26, display: 'flex', alignItems: 'center', gap: 8, opacity: settle(f, at)}}>
          <Codicon name={f >= end ? 'check' : 'loading'} size={14} color={AW.muted} style={f >= end ? undefined : {transform: `rotate(${spin(f)}deg)`}} />
          <T color={AW.muted}>{f >= end ? label : doing}</T>
        </div>
      ) : null;
    return (
      <AgentsWindow
        project={ctx.project}
        groups={groups}
        chatTitle="Tidy the Sessions list"
        transcript={
          <>
            <UserBubble y={92} text={ctx.prompt} />
            {step(lines.read, lines.reading, read, organize - 6, 0)}
            {step(lines.organized, lines.organizing, organize, done, 1)}
          </>
        }
        input={<ChatInput working={f < done + 10} model={{label: 'HydraFusion', effort: 'Default', p: 1}} />}
      />
    );
  };
  return {
    Component,
    loupe: {block: [0, 40, 290, 330]},
    cues: [{at: read, sfx: 'tick', volume: 0.1}, {at: done, sfx: 'pop', volume: 0.14}],
    chrome: 'window',
  };
};
