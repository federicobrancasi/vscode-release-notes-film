import React from 'react';
import {clamp, settle} from '../motion';
import {AgentsWindow, ChatInput, INPUT, UserBubble} from '../ui/AgentsWindow';
import {AW, ClickRing, Codicon, Cursor, cursorAt, T} from '../ui/kit';
import {A, contextOf, list, openSession, press, str} from './common';
import type {SceneMake} from './types';

// A chat's artifacts that share an integration, in one pill above the chat input (the Agents window): "5 Pull
// Requests", its icon the state that needs attention most, and a chevron. On its word the pill is clicked and its
// dropdown opens above it: a header (the integration's group label), then a row per artifact: its state icon, its
// number, its status sections (checks, comments) and its title, muted; the pointer comes to a row, and its actions show
// at its right (Open, Pin, Remove). Laid out from artifactIntegrationGroup.ts and its CSS (rows 24 px, the action
// widget's surface, at least 300 px wide).
//   params: label (the group label: "Pull Requests"), items [{number, title, state (failing, open, draft, merged,
//           closed), checks, comments}], context
//   events: open (the pill is clicked: its dropdown opens), hover (the pointer reaches the first row: its actions show)

/** A pull request's state: its codicon and colour (the GitHub integration's: failing orange, open green, draft grey, merged purple, closed red). */
const STATE: Record<string, [string, string]> = {
  failing: ['git-pull-request', '#d18616'],
  open: ['git-pull-request', AW.green],
  draft: ['git-pull-request-draft', AW.muted],
  merged: ['git-pull-request-done', '#a371f7'],
  closed: ['git-pull-request-closed', '#f14c4c'],
};
/** The state that needs attention most comes first (the group's icon). */
const RANK = ['failing', 'open', 'draft', 'merged', 'closed'];
const PILL = {x: INPUT.x, y: INPUT.y - 8 - 24, h: 24};
const W = 440;
const ROW = 24;

type Item = {number?: number | string; title?: string; state?: string; checks?: string; comments?: string};

export const artifactGroup: SceneMake = (params, {ev}) => {
  const label = str(params, 'label', 'Pull Requests');
  const given = list<Item>(params, 'items');
  const items = given.length ? given : [{number: 12, title: 'Add an empty state', state: 'open', checks: '3/3'}, {number: 11, title: 'Update the README', state: 'merged'}];
  const ctx = contextOf(params, {
    project: 'my-project',
    groups: [{label: 'my-project', icon: 'folder', sessions: [{title: 'Ship the fixes', time: 'now', selected: true}, {title: 'To-do Tagline', time: 'yesterday'}]}],
    prompt: 'Open a pull request for each fix.',
    reply: '',
  });
  const top = [...items].map((i) => i.state ?? 'open').sort((a, b) => RANK.indexOf(a) - RANK.indexOf(b))[0];
  const [groupIcon, groupColor] = STATE[top] ?? STATE.open;
  const pillText = `${items.length} ${label}`;
  const pillW = Math.round(8 + 16 + 5 + pillText.length * 6.9 + 5 + 12 + 8);
  const open = ev('open', A + 20, A);
  const hoverAt = ev('hover', open + 36, open + 20);
  const dropH = 4 + ROW + items.length * ROW + 6;
  const dropTop = PILL.y - 4 - dropH;
  const rowY = (i: number) => dropTop + 4 + ROW + i * ROW;
  const Component: React.FC<{f: number}> = ({f}) => {
    const opened = settle(f, open + 4);
    const hover = clamp((f - hoverAt) / 5);
    const [cx, cy] = cursorAt(f, [
      [open - 30, 760, 330],
      [open - 2, PILL.x + pillW / 2 + 6, PILL.y + 16],
      [open + 12, PILL.x + pillW / 2 + 6, PILL.y + 16],
      [hoverAt - 2, PILL.x + W - 120, rowY(0) + 16],
    ]);
    return (
      <AgentsWindow
        project={ctx.project}
        groups={ctx.groups}
        chatTitle={openSession(ctx)}
        transcript={
          <>
            <UserBubble y={92} text={ctx.prompt} />
            {ctx.reply ? (
              <div style={{position: 'absolute', left: 335, top: 148, width: 583}}>
                <T style={{whiteSpace: 'normal', lineHeight: '20px'}}>{ctx.reply}</T>
              </div>
            ) : null}
          </>
        }
        input={<ChatInput model={{label: 'HydraFusion', effort: 'Default', p: 1}} />}
      >
        <div style={{position: 'absolute', left: PILL.x, top: PILL.y, width: pillW, height: PILL.h, boxSizing: 'border-box', borderRadius: 6, border: `1px solid ${opened > 0 ? AW.focus : AW.menuBorder}`, background: opened > 0 ? AW.selected : AW.menu, display: 'flex', alignItems: 'center', gap: 5, padding: '0 8px', transform: `scale(${1 - 0.05 * press(f, open)})`}}>
          <Codicon name={groupIcon} size={14} color={groupColor} />
          <T color={AW.strong}>{pillText}</T>
          <Codicon name="chevron-down-compact" size={14} color={AW.muted} />
        </div>
        {opened > 0 ? (
          <div style={{position: 'absolute', left: PILL.x, top: dropTop, width: W, height: dropH, boxSizing: 'border-box', borderRadius: 7, background: AW.menu, border: `1px solid ${AW.menuBorder}`, boxShadow: '0 10px 30px rgba(0,0,0,0.5)', opacity: clamp(opened * 1.4), transform: `translateY(${(1 - opened) * 8}px)`}}>
            <div style={{position: 'absolute', left: 12, top: 4, height: ROW, display: 'flex', alignItems: 'center'}}>
              <T size={11} weight={600} color={AW.muted}>
                {label}
              </T>
            </div>
            {items.map((it, i) => {
              const [icon, color] = STATE[it.state ?? 'open'] ?? STATE.open;
              const lit = i === 0 ? hover : 0;
              const failing = it.state === 'failing';
              return (
                <div key={`${it.number}-${i}`} style={{position: 'absolute', left: 4, top: rowY(i) - dropTop, width: W - 10, height: ROW, boxSizing: 'border-box', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 8, padding: '0 6px 0 8px', background: lit > 0 ? `rgba(255,255,255,${0.06 * lit})` : undefined}}>
                  <Codicon name={icon} size={14} color={color} />
                  <T color={AW.strong}>{`#${it.number ?? ''}`}</T>
                  {it.checks ? (
                    <div style={{display: 'flex', alignItems: 'center', gap: 3}}>
                      <Codicon name={failing ? 'error-compact' : 'pass-filled-compact'} size={13} color={failing ? '#f14c4c' : AW.green} />
                      <T size={12} color={AW.muted}>
                        {it.checks}
                      </T>
                    </div>
                  ) : null}
                  {it.comments ? (
                    <div style={{display: 'flex', alignItems: 'center', gap: 3}}>
                      <Codicon name="comment" size={13} color={AW.muted} />
                      <T size={12} color={AW.muted}>
                        {it.comments}
                      </T>
                    </div>
                  ) : null}
                  <T color={lit > 0.5 ? AW.fg : AW.muted} style={{overflow: 'hidden', textOverflow: 'ellipsis', flex: 1, minWidth: 0}}>
                    {it.title ?? ''}
                  </T>
                  <div style={{display: 'flex', gap: 2, opacity: lit, visibility: lit > 0 ? 'visible' : 'hidden'}}>
                    {['link-external', 'pin', 'close'].map((a) => (
                      <div key={a} style={{width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        <Codicon name={a} size={14} color={AW.fg} />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
        {f >= open - 30 ? <Cursor x={cx} y={cy} press={press(f, open)} opacity={clamp((f - (open - 30)) / 6)} /> : null}
        <ClickRing x={cx} y={cy} f={f} at={open + 2} />
      </AgentsWindow>
    );
  };
  return {
    Component,
    // The pill, its dropdown above it, and the chat input under it whole (its words would be cut at the rim).
    loupe: {block: [INPUT.x - 10, dropTop - 10, W + 20, 716 - (dropTop - 10)]},
    cues: [{at: open, sfx: 'click', volume: 0.22}, {at: open + 4, sfx: 'pop', volume: 0.1}],
    chrome: 'window',
  };
};
