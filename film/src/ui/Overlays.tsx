import React from 'react';
import {AW, Codicon, Kbd, T} from './kit';

// The pieces of VS Code that open over the window: the quick input (the Command Palette, a quick pick), a modal dialog,
// a notification toast, a context menu. Each at its place in the 1280×720 window, with `p` 0–1 its way in.

export const QUICK = {x: 340, y: 44, w: 600, rowH: 22};
export type QuickItem = {label: string; description?: string; detail?: string; icon?: string; keys?: string[]; separator?: string; isNew?: boolean; disabled?: boolean};

/** A label with the characters that match the query in bold, in the list's highlight blue. */
const Highlighted: React.FC<{text: string; query: string; color: string}> = ({text, query, color}) => {
  const q = query.replace(/^>\s*/, '').trim().toLowerCase();
  const i = q ? text.toLowerCase().indexOf(q) : -1;
  if (i < 0) return <T color={color}>{text}</T>;
  return (
    <T color={color}>
      {text.slice(0, i)}
      <span style={{color: '#2aaaff', fontWeight: 600}}>{text.slice(i, i + q.length)}</span>
      {text.slice(i + q.length)}
    </T>
  );
};

/**
 * The quick input: its input (`value`, typed so far; the cursor blinking while `focused`), a title, and its list, the
 * `selected` row highlighted.
 */
export const QuickInput: React.FC<{p: number; value: string; placeholder?: string; title?: string; items: QuickItem[]; selected: number; listP?: number; focused?: boolean; f?: number}> = ({p, value, placeholder = 'Type the name of a command to run.', title, items, selected, listP = 1, focused = true, f = 0}) => {
  if (p <= 0) return null;
  const head = title ? 26 : 0;
  const rows = listP > 0 ? items : [];
  const h = head + 38 + rows.length * QUICK.rowH + (rows.length ? 8 : 0) + rows.filter((r) => r.separator).length * 0;
  return (
    <div style={{position: 'absolute', left: QUICK.x, top: QUICK.y, width: QUICK.w, height: h, boxSizing: 'border-box', borderRadius: 8, background: '#202123', border: '1px solid #3a3b3e', boxShadow: '0 10px 32px rgba(0,0,0,0.55)', opacity: Math.min(1, p * 1.5), transform: `translateY(${(1 - p) * -8}px)`, overflow: 'hidden'}}>
      {title ? (
        <div style={{position: 'absolute', left: 0, right: 0, top: 6, textAlign: 'center'}}>
          <T color={AW.muted}>{title}</T>
        </div>
      ) : null}
      <div style={{position: 'absolute', left: 6, top: head + 6, width: QUICK.w - 14, height: 26, boxSizing: 'border-box', borderRadius: 4, background: '#2a2b2e', border: `1px solid ${AW.focus}`, display: 'flex', alignItems: 'center', paddingLeft: 7}}>
        {value ? <T color={AW.strong}>{value}</T> : <T color={AW.faint}>{placeholder}</T>}
        {focused && Math.floor(f / 16) % 2 === 0 ? <div style={{width: 1, height: 15, background: AW.strong, marginLeft: value ? 1 : -placeholder.length * 6.4}} /> : null}
      </div>
      {rows.map((it, i) => {
        const sel = i === selected;
        return (
          <div key={`${it.label}-${i}`} style={{position: 'absolute', left: 4, top: head + 40 + i * QUICK.rowH, width: QUICK.w - 10, height: QUICK.rowH, borderRadius: 4, background: sel ? '#04395e' : undefined, outline: sel ? '1px solid #2b79d1' : undefined, display: 'flex', alignItems: 'center', gap: 6, padding: '0 8px', boxSizing: 'border-box', opacity: listP}}>
            {it.icon ? <Codicon name={it.icon} size={14} color={it.disabled ? AW.faint : AW.muted} /> : null}
            <Highlighted text={it.label} query={value} color={it.disabled ? AW.faint : AW.strong} />
            {it.description ? (
              <T color={AW.muted} size={12} style={{marginLeft: 4, overflow: 'hidden', textOverflow: 'ellipsis'}}>
                {it.description}
              </T>
            ) : null}
            {it.separator ? (
              <T color={AW.muted} size={12} style={{marginLeft: 'auto'}}>
                {it.separator}
              </T>
            ) : null}
            {it.keys ? (
              <span style={{marginLeft: it.separator ? 10 : 'auto'}}>
                <Kbd keys={it.keys} />
              </span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};

export type DialogButton = {label: string; primary?: boolean};
const ICON_COLOR: Record<string, string> = {info: '#3794ff', warning: '#cca700', error: '#f14c4c', question: '#3794ff', shield: '#3794ff'};
/** Lines a text takes at 13 px in a box `w` wide (an estimate of the system face's measure). */
const linesOf = (text: string, w: number) => Math.max(1, Math.ceil((text.length * 6.7) / w));
/** A button's width for its label. */
const buttonW = (label: string) => Math.round(30 + label.length * 7);

/**
 * A row of a dialog's list (a setup's steps, the permissions it needs): done (a check), current (lit, with the row's
 * actions at its right), or to come.
 */
export type DialogRow = {label: string; state?: string; done?: boolean; current?: boolean};
const ROW_H = 36;
/** A dialog's box, its rows' and its buttons' boxes (window px): the component draws it, the pointer aims at it. */
export const dialogLayout = (title: string, detail: string | undefined, buttons: DialogButton[], top = 160, rows: DialogRow[] = [], rowActions: string[] = []) => {
  const w = rows.length ? 560 : 480;
  const x = (1280 - w) / 2;
  const text = w - 36 - 46;
  const listY = 18 + Math.max(36, linesOf(title, text) * 19 + (detail ? 8 + linesOf(detail, text) * 19 : 0)) + (rows.length ? 14 : 0);
  const bodyH = listY - 18 + rows.length * ROW_H;
  const h = 18 + bodyH + (buttons.length ? 18 + 26 + 16 : 20);
  let ar = x + w - 18 - 10;
  const actions = [...rowActions].reverse().map((a) => {
    const bw = Math.round(24 + a.length * 6.6);
    ar -= bw;
    const box = {label: a, x: ar, w: bw};
    ar -= 6;
    return box;
  });
  const current = rows.findIndex((r) => r.current);
  const rowBoxes = rows.map((r, i) => ({...r, x: x + 64, y: top + listY + i * ROW_H, w: w - 64 - 18, h: ROW_H - 4}));
  const rowActionBoxes = current < 0 ? [] : actions.reverse().map((a) => ({...a, y: rowBoxes[current].y + 5, h: 22}));
  let right = x + w - 18;
  const boxes = [...buttons].reverse().map((b) => {
    const bw = buttonW(b.label);
    right -= bw;
    const box = {label: b.label, primary: Boolean(b.primary), x: right, y: top + h - 16 - 26, w: bw, h: 26};
    right -= 8;
    return box;
  });
  return {x, y: top, w, h, buttons: boxes.reverse(), rows: rowBoxes, rowActions: rowActionBoxes};
};
/** A dialog's button centre, for the pointer. */
export const dialogButtonAt = (layout: ReturnType<typeof dialogLayout>, label: string): [number, number] => {
  const b = layout.rowActions.find((x) => x.label === label) ?? layout.buttons.find((x) => x.label === label) ?? layout.buttons[layout.buttons.length - 1];
  return [b.x + b.w / 2, b.y + b.h / 2];
};

/**
 * A modal dialog over a dimmed window: its icon, message (bold), detail (a sentence of it lit when `highlight` is set),
 * and buttons (the primary one blue, at the right); `pressed` the button being clicked.
 */
export const Dialog: React.FC<{p: number; icon?: string; title: string; detail?: string; highlight?: {text: string; p: number}; buttons: DialogButton[]; rows?: DialogRow[]; rowActions?: string[]; pressed?: {label: string; p: number}; hover?: {label: string; p: number}; top?: number}> = ({p, icon = 'info', title, detail, highlight, buttons, rows = [], rowActions = [], pressed, hover, top = 160}) => {
  if (p <= 0) return null;
  const L = dialogLayout(title, detail, buttons, top, rows, rowActions);
  const parts = detail && highlight && detail.includes(highlight.text) ? detail.split(highlight.text) : null;
  return (
    <>
      <div style={{position: 'absolute', inset: 0, background: `rgba(0,0,0,${0.3 * p})`}} />
      <div style={{position: 'absolute', left: L.x, top: L.y, width: L.w, height: L.h, opacity: Math.min(1, p * 1.4), transform: `scale(${0.96 + 0.04 * p})`}}>
        <div style={{position: 'absolute', inset: 0, borderRadius: 8, background: '#202123', border: '1px solid #454545', boxShadow: '0 20px 60px rgba(0,0,0,0.6)'}} />
        <div style={{position: 'absolute', left: 18, top: 18}}>
          <Codicon name={icon} size={32} color={ICON_COLOR[icon] ?? ICON_COLOR.info} />
        </div>
        <div style={{position: 'absolute', left: 64, top: 20, width: L.w - 64 - 18, display: 'flex', flexDirection: 'column', gap: 8}}>
          <T weight={600} color={AW.strong} style={{whiteSpace: 'normal', lineHeight: '19px'}}>
            {title}
          </T>
          {detail ? (
            <T color={AW.fg} style={{whiteSpace: 'normal', lineHeight: '19px'}}>
              {parts ? (
                <>
                  {parts[0]}
                  <span style={{background: `rgba(234, 92, 0, ${0.33 * highlight!.p})`, borderRadius: 2, color: highlight!.p > 0.5 ? AW.strong : AW.fg}}>{highlight!.text}</span>
                  {parts.slice(1).join(highlight!.text)}
                </>
              ) : (
                detail
              )}
            </T>
          ) : null}
        </div>
        {L.rows.map((r) => (
          <div key={r.label} style={{position: 'absolute', left: r.x - L.x, top: r.y - L.y, width: r.w, height: r.h, boxSizing: 'border-box', borderRadius: 5, background: r.current ? 'rgba(0,120,212,0.16)' : 'rgba(255,255,255,0.03)', border: r.current ? '1px solid rgba(0,120,212,0.55)' : '1px solid transparent', display: 'flex', alignItems: 'center', gap: 9, paddingLeft: 10}}>
            <Codicon name={r.done ? 'pass-filled' : 'circle-large'} size={15} color={r.done ? '#3fb950' : r.current ? '#3794ff' : AW.faint} />
            <T color={r.current || r.done ? AW.strong : AW.muted} weight={r.current ? 600 : 400}>
              {r.label}
            </T>
            {r.state ? (
              <T size={12} color={AW.muted}>
                {r.state}
              </T>
            ) : null}
          </div>
        ))}
        {L.rowActions.map((b, i) => {
          const down = pressed?.label === b.label ? pressed.p : 0;
          const over = hover?.label === b.label && hover.p > 0.5;
          const primary = i === L.rowActions.length - 1;
          return (
            <div key={b.label} style={{position: 'absolute', left: b.x - L.x, top: b.y - L.y, width: b.w, height: b.h, boxSizing: 'border-box', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', background: primary ? (down > 0 ? '#026ec1' : over ? '#1a85d8' : '#0078d4') : over || down > 0 ? '#3a3d41' : '#313235', transform: `scale(${1 - 0.06 * down})`}}>
              <T size={12} color={primary ? '#ffffff' : AW.strong}>
                {b.label}
              </T>
            </div>
          );
        })}
        {L.buttons.map((b) => {
          const down = pressed?.label === b.label ? pressed.p : 0;
          const over = hover?.label === b.label && hover.p > 0.5;
          return (
            <div key={b.label} style={{position: 'absolute', left: b.x - L.x, top: b.y - L.y, width: b.w, height: b.h, boxSizing: 'border-box', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', background: b.primary ? (down > 0 ? '#026ec1' : over ? '#1a85d8' : '#0078d4') : down > 0 || over ? '#3a3d41' : '#313235', border: b.primary ? '1px solid #2b79d1' : '1px solid #454545', transform: `scale(${1 - 0.06 * down})`}}>
              <T color={b.primary ? '#ffffff' : AW.strong}>{b.label}</T>
            </div>
          );
        })}
      </div>
    </>
  );
};

const SEVERITY: Record<string, [string, string]> = {info: ['info', '#3794ff'], warning: ['warning', '#cca700'], error: ['error', '#f14c4c']};
/** A toast's box and its actions' boxes (window px), at the window's bottom right. */
export const toastLayout = (message: string, actions: string[]) => {
  const w = 450;
  const h = 58 + linesOf(message, w - 24 - 60) * 18;
  const x = 1280 - 18 - w;
  const y = 720 - 40 - h;
  let right = x + w - 12;
  const boxes = [...actions].reverse().map((a) => {
    const bw = buttonW(a) - 6;
    right -= bw;
    const box = {label: a, x: right, y: y + h - 10 - 24, w: bw, h: 24};
    right -= 8;
    return box;
  });
  return {x, y, w, h, actions: boxes.reverse()};
};
export const toastActionAt = (layout: ReturnType<typeof toastLayout>, label: string): [number, number] => {
  const b = layout.actions.find((x) => x.label === label) ?? layout.actions[0];
  return b ? [b.x + b.w / 2, b.y + b.h / 2] : [layout.x + layout.w - 60, layout.y + layout.h - 22];
};

/** A notification toast at the bottom right: its severity icon, message, source, and actions (the first primary). */
export const Toast: React.FC<{p: number; severity?: string; message: string; source?: string; actions?: string[]; pressed?: {label: string; p: number}; hover?: {label: string; p: number}}> = ({p, severity = 'info', message, source, actions = [], pressed, hover}) => {
  if (p <= 0) return null;
  const [icon, color] = SEVERITY[severity] ?? SEVERITY.info;
  const L = toastLayout(message, actions);
  return (
    <div style={{position: 'absolute', left: L.x, top: L.y, width: L.w, height: L.h, opacity: Math.min(1, p * 1.5), transform: `translateY(${(1 - p) * 16}px)`}}>
      <div style={{position: 'absolute', inset: 0, borderRadius: 6, background: '#202123', border: '1px solid #454545', boxShadow: '0 8px 28px rgba(0,0,0,0.5)'}} />
      <div style={{position: 'absolute', left: 12, top: 11, right: 12, display: 'flex', gap: 8}}>
        <Codicon name={icon} size={16} color={color} />
        <T color={AW.strong} style={{whiteSpace: 'normal', lineHeight: '18px', flex: 1}}>
          {message}
        </T>
        <Codicon name="settings-gear" size={14} color={AW.muted} />
        <Codicon name="close" size={14} color={AW.muted} />
      </div>
      {source ? (
        <div style={{position: 'absolute', left: 12, bottom: 13}}>
          <T size={12} color={AW.muted}>
            {source}
          </T>
        </div>
      ) : null}
      {L.actions.map((b, i) => {
        const down = pressed?.label === b.label ? pressed.p : 0;
        const over = hover?.label === b.label && hover.p > 0.5;
        return (
          <div key={b.label} style={{position: 'absolute', left: b.x - L.x, top: b.y - L.y, width: b.w, height: b.h, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', background: i === 0 ? (down > 0 ? '#026ec1' : over ? '#1a85d8' : '#0078d4') : over ? '#3a3d41' : '#313235', transform: `scale(${1 - 0.06 * down})`}}>
            <T color={i === 0 ? '#ffffff' : AW.strong}>{b.label}</T>
          </div>
        );
      })}
    </div>
  );
};

export type MenuItem = {label: string; keys?: string[]; separator?: boolean; badge?: string};
/** A context menu at (x, y), its `selected` row highlighted. */
export const Menu: React.FC<{x: number; y: number; w?: number; items: MenuItem[]; selected?: number; p: number}> = ({x, y, w = 260, items, selected = -1, p}) =>
  p <= 0 ? null : (
    <div style={{position: 'absolute', left: x, top: y, width: w, padding: 4, boxSizing: 'border-box', borderRadius: 7, background: AW.menu, border: `1px solid ${AW.menuBorder}`, boxShadow: '0 10px 30px rgba(0,0,0,0.5)', opacity: Math.min(1, p * 1.4), transform: `translateY(${(1 - p) * 6}px)`}}>
      {items.map((it, i) =>
        it.separator ? (
          <div key={`sep-${i}`} style={{height: 1, margin: '4px 6px', background: AW.menuBorder}} />
        ) : (
          <div key={`${it.label}-${i}`} style={{height: 24, borderRadius: 4, display: 'flex', alignItems: 'center', padding: '0 10px', background: i === selected ? AW.menuSelected : undefined}}>
            <T color={AW.strong}>{it.label}</T>
            {it.badge ? (
              <span style={{marginLeft: 8, padding: '0 6px', borderRadius: 8, background: '#0078d4', fontSize: 10, lineHeight: '15px', color: '#ffffff'}}>
                {it.badge}
              </span>
            ) : null}
            {it.keys ? (
              <span style={{marginLeft: 'auto'}}>
                <Kbd keys={it.keys} />
              </span>
            ) : null}
          </div>
        ),
      )}
    </div>
  );

/**
 * A modal editor (Settings, Remote Environments): VS Code 1.144's modal editor part, 80 % of the window under its title
 * bar, centred, over the window dimmed to half. Measured on a capture of Settings in VS Code 1.144: 1024 × 548 at
 * (128, 86), its header 33 px on the panel colour with a border under it. A compact header (an editor with its own
 * chrome) is on the editor's colour, a little taller, with no icon and no border. `children` are in window px.
 */
export const MODAL = {x: 128, y: 86, w: 1024, h: 548};
export const modalBodyTop = (compact = false) => MODAL.y + (compact ? 37 : 34);
export const ModalEditor: React.FC<{title: string; icon?: string; compact?: boolean; actions?: string[]; children?: React.ReactNode}> = ({title, icon, compact = false, actions = ['screen-full', 'close'], children}) => (
  <>
    <div style={{position: 'absolute', left: 0, top: 0, width: 1280, height: 720, background: 'rgba(0,0,0,0.5)'}} />
    <div style={{position: 'absolute', left: MODAL.x, top: MODAL.y, width: MODAL.w, height: MODAL.h, boxSizing: 'border-box', borderRadius: 8, border: `1px solid ${AW.panelBorder}`, background: AW.chrome, overflow: 'hidden', boxShadow: '0 12px 40px rgba(0,0,0,0.45)'}}>
      <div style={{position: 'absolute', left: 0, top: 0, right: 0, height: modalBodyTop(compact) - MODAL.y - 1, boxSizing: 'border-box', background: compact ? AW.chrome : AW.panel, borderBottom: compact ? undefined : `1px solid ${AW.panelBorder}`, display: 'flex', alignItems: 'center', gap: 6, padding: '0 8px 0 14px'}}>
        {!compact && icon ? <Codicon name={icon} size={14} color={AW.muted} /> : null}
        <T color={compact ? AW.strong : AW.fg} weight={compact ? 600 : 400}>
          {title}
        </T>
        <div style={{marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4}}>
          {actions.map((a) => (
            <div key={a} style={{width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <Codicon name={a} size={16} color={AW.muted} />
            </div>
          ))}
        </div>
      </div>
    </div>
    {children}
  </>
);
