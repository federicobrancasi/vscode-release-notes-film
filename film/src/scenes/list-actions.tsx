import React from 'react';
import {Img, staticFile} from 'remotion';
import {clamp} from '../motion';
import {AgentsWindow, ChatInput, UserBubble} from '../ui/AgentsWindow';
import {codicon} from '../ui/icons';
import {AW, ClickRing, Codicon, Cursor, cursorAt, T, Tooltip} from '../ui/kit';
import {A, contextOf, list, num, obj, openSession, press, spin, str} from './common';
import type {SceneMake} from './types';

// A row whose actions change, in a chat response: the pointer comes to the row on its word, the new action lights up
// with its tooltip, and it's clicked on the word that names what it does. Under the row, its images (`images`) or its
// other rows. With `panel`, the rows are a details list in a panel above the chat input (a pull request's checks): its
// header names what they're the details of, and the row's action shows as the pointer reaches it.
//   params: rows [{label, sub, icon}], row (the one that changes, default 0), after {icon, tooltip} (its new action),
//           images (public/ paths shown under it, optional), panel {title, icon} (optional), context
//   events: hover (the pointer reaches the row), click (the action is clicked)

const ROW = {x: 335, y: 146, w: 583, h: 30};
const BTN = {x: ROW.x + ROW.w - 28, y: ROW.y + 4};
/** The details panel above the chat input (its rows 28 px, under a 34 px header). */
const PANEL = {x: 335, w: 583, bottom: 566, header: 34, row: 28};
/** A state icon's colour: failed red, passed green (the PR integration's colours), else muted. */
const stateColor = (icon: string) => (/error|fail/.test(icon) ? '#f14c4c' : /pass/.test(icon) ? AW.green : AW.muted);

export const listActions: SceneMake = (params, {ev}) => {
  const rows = list<{label?: string; sub?: string; icon?: string}>(params, 'rows');
  const k = Math.min(Math.max(0, num(params, 'row', 0)), Math.max(0, rows.length - 1));
  const row = rows[k] ?? {label: 'Image batch', sub: '4 images'};
  const others = rows.filter((_, i) => i !== k);
  const after = obj(params, 'after');
  const icon = codicon(after.icon, 'desktop-download');
  const tooltip = str(after, 'tooltip', 'Download All');
  const images = list<{label: string}>(params, 'images').map((i) => i.label);
  const panel = params.panel && typeof params.panel === 'object' ? obj(params, 'panel') : null;
  const ctx = contextOf(params, {
    project: 'my-project',
    groups: [{label: 'my-project', icon: 'folder', sessions: [{title: 'Lighthouse illustrations', time: 'now', selected: true}, {title: 'To-do Tagline', time: '2 hours ago'}]}],
    prompt: 'Make four lighthouse illustrations for the docs.',
    reply: 'Here are four lighthouses for the docs: cliffs at sunset, an island at night, a green headland, and a storm.',
  });
  const hoverAt = ev('hover', A + 4, A);
  const click = ev('click', hoverAt + 60, hoverAt + 30);
  if (panel) {
    const h = PANEL.header + rows.length * PANEL.row + 8;
    const top = PANEL.bottom - h;
    const rowY = (i: number) => top + PANEL.header + i * PANEL.row;
    const btn = {x: PANEL.x + PANEL.w - 32, y: rowY(k) + 3};
    const Component: React.FC<{f: number}> = ({f}) => {
      // The pointer's tip rests on the button's lower-right corner, so the icon shows beside it.
      const [cx, cy] = cursorAt(f, [
        [hoverAt - 32, 780, 330],
        [hoverAt, btn.x + 19, btn.y + 19],
      ]);
      const hover = clamp((f - hoverAt) / 5);
      // Once clicked, the action runs: its icon spins (VS Code's pending item action) and its tooltip goes.
      const running = f >= click + 4;
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
              <div style={{position: 'absolute', left: PANEL.x, top, width: PANEL.w, height: h, boxSizing: 'border-box', borderRadius: 8, background: AW.menu, border: `1px solid ${AW.menuBorder}`, boxShadow: '0 8px 24px rgba(0,0,0,0.35)'}} />
              <div style={{position: 'absolute', left: PANEL.x + 12, top: top + 9, display: 'flex', alignItems: 'center', gap: 8}}>
                <Codicon name={codicon(panel.icon, 'git-pull-request')} size={15} color={AW.green} />
                <T color={AW.strong} weight={600}>
                  {str(panel, 'title', '')}
                </T>
              </div>
              <div style={{position: 'absolute', left: PANEL.x + 1, top: top + PANEL.header - 3, width: PANEL.w - 2, height: 1, background: AW.panelBorder}} />
              {rows.map((r, i) => (
                <div key={`${r.label}-${i}`} style={{position: 'absolute', left: PANEL.x + 4, top: rowY(i) + 1, width: PANEL.w - 8, height: PANEL.row - 2, borderRadius: 4, background: i === k && hover > 0 ? `rgba(255,255,255,${0.06 * hover})` : undefined, display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 8, boxSizing: 'border-box'}}>
                  <Codicon name={codicon(r.icon, 'circle-large')} size={15} color={stateColor(String(r.icon ?? ''))} />
                  <T color={AW.strong}>{r.label ?? ''}</T>
                  {r.sub ? <T color={AW.muted}>{r.sub}</T> : null}
                </div>
              ))}
              <div style={{position: 'absolute', left: btn.x, top: btn.y, width: 22, height: 22, borderRadius: 5, opacity: hover, background: `rgba(255,255,255,${0.1 * hover + 0.14 * press(f, click)})`, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${1 - 0.14 * press(f, click)})`}}>
                {running ? <Codicon name="loading" size={16} color={AW.muted} style={{transform: `rotate(${spin(f)}deg)`}} /> : <Codicon name={icon} size={16} color={AW.strong} />}
              </div>
            </>
          }
          input={<ChatInput model={{label: 'HydraFusion', effort: 'Default', p: 1}} />}
        >
          <Tooltip x={btn.x + 10 - Math.round(tooltip.length * 6.15)} y={btn.y + 30} text={tooltip} p={clamp((f - (hoverAt + 6)) / 6) * (1 - clamp((f - click) / 6))} />
          {f >= hoverAt - 32 ? <Cursor x={cx} y={cy} press={press(f, click)} opacity={clamp((f - (hoverAt - 32)) / 6)} /> : null}
          <ClickRing x={cx} y={cy} f={f} at={click + 2} />
        </AgentsWindow>
      );
    };
    return {
      Component,
      loupe: {block: [PANEL.x - 6, top - 8, PANEL.w + 12, h + 14]},
      cues: [{at: click, sfx: 'click', volume: 0.22}],
      chrome: 'window',
    };
  }
  // Under the row: its images, else its other rows; then the reply.
  const under = images.length ? 188 + 138 : 188 + others.length * 30;
  const Component: React.FC<{f: number}> = ({f}) => {
    const [cx, cy] = cursorAt(f, [
      [hoverAt - 32, 780, 520],
      [hoverAt, BTN.x + 12, BTN.y + 13],
    ]);
    const hover = clamp((f - hoverAt) / 5);
    return (
      <AgentsWindow
        project={ctx.project}
        groups={ctx.groups}
        chatTitle={openSession(ctx)}
        transcript={
          <>
            <UserBubble y={92} text={ctx.prompt} />
            <div style={{position: 'absolute', left: ROW.x, top: ROW.y, width: ROW.w, height: ROW.h, borderRadius: 6, border: `1px solid ${AW.panelBorder}`, display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 10, boxSizing: 'border-box'}}>
              <Codicon name={codicon(row.icon, 'file-media')} size={15} color={AW.muted} />
              <T color={AW.strong}>{row.label ?? ''}</T>
              {row.sub ? <T color={AW.muted}>{row.sub}</T> : null}
            </div>
            <div style={{position: 'absolute', left: BTN.x, top: BTN.y, width: 22, height: 22, borderRadius: 5, background: hover > 0 ? `rgba(255,255,255,${0.1 * hover + 0.14 * press(f, click)})` : undefined, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${1 - 0.14 * press(f, click)})`}}>
              <Codicon name={icon} size={16} color={hover > 0.5 ? AW.strong : AW.muted} />
            </div>
            {images.length
              ? images.slice(0, 4).map((src, i) => <Img key={src} src={staticFile(src)} style={{position: 'absolute', left: 335 + i * 148, top: 188, width: 138, height: 138, borderRadius: 8, boxShadow: '0 0 0 1px rgba(255,255,255,0.08)'}} />)
              : others.map((o, i) => (
                  <div key={`${o.label}-${i}`} style={{position: 'absolute', left: ROW.x + 10, top: 190 + i * 30, display: 'flex', alignItems: 'center', gap: 8}}>
                    <Codicon name={codicon(o.icon, 'symbol-file')} size={15} color={AW.muted} />
                    <T>{o.label ?? ''}</T>
                    {o.sub ? <T color={AW.muted}>{o.sub}</T> : null}
                  </div>
                ))}
            {ctx.reply ? (
              <div style={{position: 'absolute', left: 335, top: under + 16, width: 583}}>
                <T style={{whiteSpace: 'normal', lineHeight: '20px'}}>{ctx.reply}</T>
              </div>
            ) : null}
          </>
        }
        input={<ChatInput model={{label: 'HydraFusion', effort: 'Default', p: 1}} />}
      >
        <Tooltip x={BTN.x + 10 - Math.round(tooltip.length * 6.15)} y={BTN.y + 30} text={tooltip} p={clamp((f - (hoverAt + 6)) / 6)} />
        {f >= hoverAt - 32 ? <Cursor x={cx} y={cy} press={press(f, click)} opacity={clamp((f - (hoverAt - 32)) / 6)} /> : null}
        <ClickRing x={cx} y={cy} f={f} at={click + 2} />
      </AgentsWindow>
    );
  };
  return {
    Component,
    loupe: {block: [ROW.x - 5, ROW.y - 8, ROW.w + 9, Math.max(110, under - ROW.y + 12)]},
    cues: [{at: click, sfx: 'click', volume: 0.22}],
    chrome: 'window',
  };
};
