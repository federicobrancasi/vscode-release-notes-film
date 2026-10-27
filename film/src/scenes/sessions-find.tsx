import React from 'react';
import {clamp, settle, typeOn} from '../motion';
import {AgentsWindow, ChatInput, Group, UserBubble} from '../ui/AgentsWindow';
import {AW, ClickRing, Codicon, Cursor, cursorAt, T} from '../ui/kit';
import {A, contextOf, ease, list, num, press, str} from './common';
import type {SceneMake} from './types';

// Finding a session: Find opens over the Sessions list on its word, the query is typed, the other sessions close up and
// the match slides to the top, then it's clicked and opens: the old chat goes out, then the match's comes in.
//   params: query (what's typed), sessions [{title, sub (its time), pr, prompt}], match (the one found, default the one
//           with a pr), context (project, group)
//   events: find (Find opens), type (the typing starts), typed (the typing ends, the list filters)

type Row = {title: string; time: string; pr?: string; prompt: string};

export const sessionsFind: SceneMake = (params, {ev}) => {
  const query = str(params, 'query', '#241533');
  const given = list<{title?: string; sub?: string; time?: string; pr?: number | string; prompt?: string}>(params, 'sessions');
  const rows: Row[] = (given.length
    ? given
    : [
        {title: 'Fix flaky terminal tests', sub: '2 hours ago', prompt: 'Find out why the terminal tests are flaky and fix them.'},
        {title: 'Welcome page sign-in', sub: 'yesterday', pr: 241533, prompt: 'Offer GitHub sign-in on the Welcome page when signed out.'},
        {title: 'Refactor quick pick', sub: '2 days ago'},
        {title: 'Update telemetry docs', sub: '3 days ago'},
      ]
  ).map((s) => ({title: s.title ?? '', time: s.sub ?? s.time ?? 'now', pr: s.pr !== undefined ? `#${String(s.pr).replace(/^#/, '')}` : undefined, prompt: s.prompt ?? `${s.title ?? ''}.`}));
  const m = Math.min(rows.length - 1, Math.max(0, num(params, 'match', Math.max(0, rows.findIndex((r) => r.pr)))));
  const first = rows.findIndex((_, i) => i !== m);
  const ctx = contextOf(params, {project: 'my-project', groups: [{label: 'my-project', icon: 'folder', sessions: []}], prompt: '', reply: ''});
  const group = ctx.groups[0] ?? {label: 'my-project', icon: 'folder', sessions: []};
  const find = ev('find', A - 12, A - 24);
  const type = ev('type', find + 26, find + 12);
  const typedAt = ev('typed', type + 70, type + 7 * 6);
  const OPEN = typedAt + 44;
  const Component: React.FC<{f: number}> = ({f}) => {
    const [cx, cy] = cursorAt(f, [
      [find - 30, 520, 260],
      [find - 2, 233, 61],
      [typedAt + 6, 233, 61],
      [OPEN - 20, 150, 219],
      [OPEN + 8, 150, 219],
      [OPEN + 40, 330, 300],
    ]);
    const findP = settle(f, find + 4);
    const typed = query.slice(0, typeOn(f, type, typedAt, query.length));
    const filter = ease(clamp((f - typedAt) / 20));
    const opened = clamp((f - (OPEN + 6)) / 6);
    const groups: Group[] = [
      {
        label: group.label,
        icon: group.icon,
        sessions: rows.map((s, i) => ({
          title: s.title,
          time: s.time,
          pr: s.pr,
          selected: i === m ? opened >= 0.5 : i === first && opened < 0.5,
          highlight: filter > 0 && i === m ? s.pr ?? query : undefined,
          collapse: i === m ? 0 : filter,
        })),
      },
    ];
    const findBox =
      findP > 0 ? (
        <div style={{height: 26, borderRadius: 5, background: AW.input, border: `1px solid ${AW.focus}`, display: 'flex', alignItems: 'center', gap: 6, padding: '0 8px', opacity: clamp(findP * 1.5), transform: `translateY(${(1 - findP) * -6}px)`}}>
          <Codicon name="search" size={14} color={AW.muted} />
          {typed ? <T color={AW.strong}>{typed}</T> : <T color={AW.faint}>Find</T>}
          {f >= find + 4 && f < typedAt + 6 ? <div style={{width: 1, height: 15, background: AW.strong, opacity: Math.floor(f / 16) % 2 ? 0.2 : 1}} /> : null}
          {filter > 0 ? (
            <T color={AW.muted} size={12} style={{marginLeft: 'auto', opacity: filter}}>
              1 result
            </T>
          ) : null}
        </div>
      ) : null;
    // The chat swap: the old message leaves (OPEN+6 → +12), then the new one comes in (+14 → +22). Never both.
    const out = clamp((f - (OPEN + 6)) / 6);
    const inn = clamp((f - (OPEN + 14)) / 8);
    const chats: [string, string, number, number][] = [
      [rows[first]?.title ?? '', rows[first]?.prompt ?? '', out < 1 ? 1 - out : 0, -8 * out],
      [rows[m].title, rows[m].prompt, inn, 8 * (1 - inn)],
    ];
    return (
      <AgentsWindow
        project={ctx.project}
        groups={groups}
        findBox={findBox}
        findH={34 * findP}
        findActive={findP > 0}
        chatTitle={f >= OPEN + 12 ? rows[m].title : rows[first]?.title ?? ''}
        transcript={chats.map(([title, text, o, dy]) =>
          o > 0 ? (
            <div key={title} style={{position: 'absolute', inset: 0, opacity: o, transform: `translateY(${dy}px)`}}>
              <UserBubble y={92} text={text} />
            </div>
          ) : null,
        )}
        input={<ChatInput model={{label: 'HydraFusion', effort: 'Default', p: 1}} />}
      >
        {f >= find - 30 ? <Cursor x={cx} y={cy} press={Math.max(press(f, find), press(f, OPEN))} opacity={clamp((f - (find - 30)) / 6)} /> : null}
        <ClickRing x={cx} y={cy} f={f} at={find + 2} />
        <ClickRing x={cx} y={cy} f={f} at={OPEN + 2} />
      </AgentsWindow>
    );
  };
  return {
    Component,
    loupe: {block: [0, 40, 290, 330]},
    cues: [
      {at: find, sfx: 'click', volume: 0.22},
      {at: typedAt + 44, sfx: 'click', volume: 0.22},
    ],
    chrome: 'window',
  };
};

