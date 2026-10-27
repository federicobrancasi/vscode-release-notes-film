import React from 'react';
import {clamp, settle} from '../motion';
import {AgentsWindow, ChatInput, UserBubble} from '../ui/AgentsWindow';
import {AW, ClickRing, Codicon, Cursor, cursorAt, IconBtn, T, Tooltip} from '../ui/kit';
import {Dialog, dialogLayout, MODAL, ModalEditor, modalBodyTop} from '../ui/Overlays';
import {A, contextOf, list, num, obj, openSession, press, spin, str} from './common';
import type {Params, SceneCtx, SceneMake} from './types';

// The Agents window's Remote Environments, a modal editor with a compact header (RemotesEditorInput): its search (Clear
// Search and Collapse All at its right) and the table of remotes by group (Name, Connection). A group refreshes, then
// shows what it needs on its word: a prompt and its action link (Sign In), with its guide; the link is clicked on its
// word (a spinner beside it: signing in), else the pointer comes to rest on it. Laid out from remotesWidget.ts and its
// CSS (the editor's padding 16 × 24; rows 30, 76, 26; columns 28, 0.8, 0.2, 72).
// With `rows`, the group lists its remotes instead (remotesTable.ts: the eye in the gutter, the name, the connection):
// as the window lands, the pointer comes to a row and its actions show at its right end (Connect or Disconnect, Rename,
// Delete: debug-connected or debug-disconnect, edit, trash); Delete is clicked on its word (at the earliest as the lens
// lands), and the confirmation it asks (`remove`, a warning dialog) opens and stays. The lens is on the dialog.
//   params: group (the group the prompt is in), label (the prompt), action (its link), docs (its guide link), above
//           [{label, empty, description, docs}] (the groups above it, each with its empty row), context; with rows:
//           rows [{label, connection}] (the group's remotes), row (the one acted on, default 0), remove {title, detail,
//           button} (the confirmation Delete asks)
//   events: show (the group's refresh ends and the prompt shows), click (the link is clicked; with rows, Delete is
//           clicked and its confirmation opens), hover (with rows: the pointer reaches the row, its actions show)

const ED = {x: MODAL.x + 1 + 24, w: MODAL.w - 2 - 48, top: modalBodyTop(true) + 16};
const NAME_W = Math.round((ED.w - 28 - 72) * 0.8);
const COL = {name: ED.x + 28 + 10, connection: ED.x + 28 + NAME_W + 10};
const H = {header: 30, group: 30, empty: 76, row: 26};
const HEADER_BG = 'rgba(255,255,255,0.045)';
/** The actions column's toolbar: its 22 px buttons, right-aligned in the 72 px column. */
const ACTIONS_X = ED.x + ED.w - 4 - 3 * 22;

type Above = {label?: string; empty?: string; description?: string; docs?: string};
type Remote = {label?: string; connection?: string};

const defaultContext = (params: Params) =>
  contextOf(params, {project: 'my-project', groups: [{label: 'my-project', icon: 'folder', sessions: [{title: 'Add an empty state', time: 'now', selected: true}, {title: 'To-do Tagline', time: 'yesterday'}]}], prompt: 'Add an empty state to the task list.', reply: ''});

/** The editor's search and the table's header, shared by both forms of the scene. */
const TableTop: React.FC<{tableTop: number}> = ({tableTop}) => (
  <>
    <div style={{position: 'absolute', left: ED.x, top: ED.top, width: ED.w - 34, height: 26, boxSizing: 'border-box', borderRadius: 4, background: AW.input, border: `1px solid ${AW.inputBorder}`, display: 'flex', alignItems: 'center', padding: '0 6px 0 8px', gap: 6}}>
      <T color={AW.faint}>Type to search...</T>
      <Codicon name="clear-all" size={16} color={AW.faint} style={{marginLeft: 'auto'}} />
      <Codicon name="collapse-all" size={16} color={AW.muted} />
    </div>
    <IconBtn x={ED.x + ED.w - 26} y={ED.top + 2} name="refresh" />
    <div style={{position: 'absolute', left: ED.x, top: tableTop, width: ED.w, height: H.header, background: HEADER_BG}} />
    <div style={{position: 'absolute', left: COL.name, top: tableTop, height: H.header, display: 'flex', alignItems: 'center'}}>
      <T weight={600} color={AW.strong}>
        Name
      </T>
    </div>
    <div style={{position: 'absolute', left: COL.connection, top: tableTop, height: H.header, display: 'flex', alignItems: 'center'}}>
      <T weight={600} color={AW.strong}>
        Connection
      </T>
    </div>
  </>
);

const GroupRow: React.FC<{top: number; label: string; count: number; refreshing?: boolean; f: number}> = ({top, label, count, refreshing = false, f}) => (
  <>
    <div style={{position: 'absolute', left: ED.x, top, width: ED.w, height: H.group, background: HEADER_BG}} />
    <div style={{position: 'absolute', left: ED.x + 6, top: top + 7}}>
      <Codicon name="chevron-down" size={16} color={AW.muted} />
    </div>
    <div style={{position: 'absolute', left: COL.name, top, height: H.group, display: 'flex', alignItems: 'center', gap: 6}}>
      <T weight={600} color={AW.strong}>
        {label}
      </T>
      <T size={12} color={AW.muted}>
        {count}
      </T>
      {refreshing ? <Codicon name="loading" size={14} color={AW.muted} style={{transform: `rotate(${spin(f)}deg)`}} /> : null}
    </div>
  </>
);

/** With `rows`: the group's remotes, a row's actions on hover, and the confirmation its Delete asks. */
const remoteRows = (params: Params, {ev}: SceneCtx, rows: Remote[]) => {
  const group = str(params, 'group', 'Environments');
  const above = list<Above>(params, 'above');
  const k = Math.min(Math.max(0, num(params, 'row', 0)), rows.length - 1);
  const remove = obj(params, 'remove');
  const title = str(remove, 'title', '');
  const detail = str(remove, 'detail', '');
  const button = str(remove, 'button', 'Delete');
  const buttons = [{label: 'Cancel'}, {label: button, primary: true}];
  const ctx = defaultContext(params);
  // Delete is clicked as the lens lands (it's at the far right of the table, outside the lens), so the lens opens on
  // what it asks; the pointer comes to the row and its actions show before, as the window lands.
  const hoverAt = ev('hover', A - 40, A - 60);
  const click = ev('click', Math.max(A + 2, hoverAt + 30), Math.max(A, hoverAt + 24));
  const tableTop = ED.top + 26 + 16;
  const groupY = tableTop + H.header + above.length * (H.group + H.empty);
  const rowY = (i: number) => groupY + H.group + i * H.row;
  const name = rows[k].label ?? '';
  const connected = /^connected$/i.test(rows[k].connection ?? '');
  const trash = {x: ACTIONS_X + 2 * 22, y: rowY(k) + 2};
  const L = dialogLayout(title, detail, buttons);
  const Component: React.FC<{f: number}> = ({f}) => {
    const hover = clamp((f - hoverAt) / 5);
    // The pointer rests on the row, goes to Delete (its tip on the button's lower right, the icon showing beside it),
    // and once it's clicked drifts off, clear of the lens.
    const [cx, cy] = cursorAt(f, [
      [hoverAt - 30, 760, 560],
      [hoverAt, ACTIONS_X - 90, rowY(k) + 16],
      [click - 20, ACTIONS_X - 90, rowY(k) + 16],
      [click - 2, trash.x + 15, trash.y + 16],
      [click + 10, trash.x + 15, trash.y + 16],
      [click + 34, trash.x + 70, trash.y + 90],
    ]);
    const onTrash = clamp((f - (click - 6)) / 4);
    const asked = settle(f, click + 4);
    return (
      <AgentsWindow project={ctx.project} groups={ctx.groups} chatTitle={openSession(ctx)} transcript={ctx.prompt ? <UserBubble y={92} text={ctx.prompt} /> : null} input={<ChatInput model={{label: 'HydraFusion', effort: 'Default', p: 1}} />}>
        <ModalEditor title="Remote Environments" compact actions={['screen-full', 'close']}>
          <TableTop tableTop={tableTop} />
          {above.map((g, i) => {
            const at = tableTop + H.header + i * (H.group + H.empty);
            return (
              <React.Fragment key={g.label}>
                <GroupRow top={at} label={g.label ?? ''} count={0} f={f} />
                <div style={{position: 'absolute', left: COL.name, top: at + H.group + 8, display: 'flex', flexDirection: 'column', gap: 4}}>
                  <T color={AW.fg}>{g.empty ?? ''}</T>
                  {g.description ? <T color={AW.muted}>{g.description}</T> : null}
                  {g.docs ? <T color={AW.link}>{g.docs}</T> : null}
                </div>
              </React.Fragment>
            );
          })}
          <GroupRow top={groupY} label={group} count={rows.length} f={f} />
          {rows.map((r, i) => {
            const lit = i === k ? hover : 0;
            const on = /^connected$/i.test(r.connection ?? '');
            return (
              <React.Fragment key={`${r.label}-${i}`}>
                <div style={{position: 'absolute', left: ED.x, top: rowY(i), width: ED.w, height: H.row, background: lit > 0 ? `rgba(255,255,255,${0.05 * lit})` : undefined}} />
                <div style={{position: 'absolute', left: ED.x + 6, top: rowY(i) + 5}}>
                  <Codicon name={on ? 'eye' : 'eye-closed'} size={16} color={on ? AW.muted : AW.faint} />
                </div>
                <div style={{position: 'absolute', left: COL.name, top: rowY(i), height: H.row, display: 'flex', alignItems: 'center'}}>
                  <T color={on ? AW.strong : AW.muted}>{r.label ?? ''}</T>
                </div>
                <div style={{position: 'absolute', left: COL.connection, top: rowY(i), height: H.row, display: 'flex', alignItems: 'center'}}>
                  <T color={AW.muted}>{r.connection ?? ''}</T>
                </div>
              </React.Fragment>
            );
          })}
          {hover > 0
            ? [connected ? 'debug-disconnect' : 'debug-connected', 'edit', 'trash'].map((icon, i) => (
                <div key={icon} style={{position: 'absolute', left: ACTIONS_X + i * 22, top: rowY(k) + 2, width: 22, height: 22, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: hover, background: icon === 'trash' && onTrash > 0 ? `rgba(90,93,94,${0.31 * onTrash})` : undefined, transform: icon === 'trash' ? `scale(${1 - 0.08 * press(f, click)})` : undefined}}>
                  <Codicon name={icon} size={16} color={AW.fg} />
                </div>
              ))
            : null}
          {f < click - 2 ? <Tooltip x={trash.x - 84} y={trash.y - 30} text={`Delete ${name}`} p={clamp((f - (click - 18)) / 5)} /> : null}
          {f >= hoverAt - 30 ? <Cursor x={cx} y={cy} press={press(f, click)} opacity={clamp((f - (hoverAt - 30)) / 6)} /> : null}
          <ClickRing x={cx} y={cy} f={f} at={click + 2} />
        </ModalEditor>
        <Dialog p={asked} icon="warning" title={title} detail={detail || undefined} buttons={buttons} />
      </AgentsWindow>
    );
  };
  return {
    Component,
    // The confirmation whole: what Delete asks is the change on screen (the row's actions are at the far right of a table
    // wider than the lens). It takes in the Connection column's labels beside the dialog, whole, so none is cut at the
    // rim; the actions column stays outside.
    loupe: {block: [L.x - 16, L.y - 16, COL.connection + 80 - (L.x - 16), L.h + 32] as [number, number, number, number]},
    cues: [{at: click, sfx: 'click', volume: 0.22}, {at: click + 4, sfx: 'pop', volume: 0.12}],
    chrome: 'window' as const,
  };
};

export const remoteEnvironments: SceneMake = (params, sceneCtx) => {
  const rowsGiven = list<Remote>(params, 'rows');
  if (rowsGiven.length) return remoteRows(params, sceneCtx, rowsGiven);
  const {ev, has} = sceneCtx;
  const group = str(params, 'group', 'Tunnels');
  const label = str(params, 'label', '');
  const action = str(params, 'action', '');
  const docs = str(params, 'docs', '');
  const above = list<Above>(params, 'above');
  const ctx = contextOf(params, {project: 'my-project', groups: [{label: 'my-project', icon: 'folder', sessions: [{title: 'Add an empty state', time: 'now', selected: true}, {title: 'To-do Tagline', time: 'yesterday'}]}], prompt: 'Add an empty state to the task list.', reply: ''});
  const show = ev('show', A + 10, A);
  const clicks = has('click');
  const click = clicks ? ev('click', show + 60, show + 30) : show + 50;
  const tableTop = ED.top + 26 + 16;
  let y = tableTop + H.header;
  const groupsAbove = above.map((g) => {
    const at = y;
    y += H.group + H.empty;
    return {...g, at};
  });
  const groupY = y;
  const rowY = groupY + H.group;
  // The link's place in the prompt's row: under the prompt (rows of the name cell are 4 px apart).
  const linkY = rowY + 8 + 18 + 4;
  const linkW = Math.round(action.length * 7.1);
  const Component: React.FC<{f: number}> = ({f}) => {
    const shown = settle(f, show);
    const [cx, cy] = cursorAt(f, [
      [click - 34, 700, 520],
      [click - 4, COL.name + linkW / 2, linkY + 9],
    ]);
    const signingIn = clicks && f >= click + 4;
    const hoverLink = clamp((f - (click - 4)) / 6);
    const emptyRow = (top: number, l: string, d: string | undefined, a: string | undefined, g: string | undefined, o = 1) => (
      <div style={{position: 'absolute', left: COL.name, top: top + 8, display: 'flex', flexDirection: 'column', gap: 4, opacity: o}}>
        <T color={AW.fg}>{l}</T>
        {d ? <T color={AW.muted}>{d}</T> : null}
        {a ? (
          <div style={{display: 'flex', alignItems: 'center', gap: 4}}>
            <T color={AW.link} style={{textDecoration: hoverLink > 0.5 && a === action ? 'underline' : undefined}}>
              {a}
            </T>
            {signingIn && a === action ? <Codicon name="loading" size={13} color={AW.muted} style={{transform: `rotate(${spin(f)}deg)`}} /> : null}
          </div>
        ) : null}
        {g ? <T color={AW.link}>{g}</T> : null}
      </div>
    );
    const groupRow = (top: number, l: string, refreshing: boolean) => (
      <>
        <div style={{position: 'absolute', left: ED.x, top, width: ED.w, height: H.group, background: HEADER_BG}} />
        <div style={{position: 'absolute', left: ED.x + 6, top: top + 7}}>
          <Codicon name="chevron-down" size={16} color={AW.muted} />
        </div>
        <div style={{position: 'absolute', left: COL.name, top, height: H.group, display: 'flex', alignItems: 'center', gap: 6}}>
          <T weight={600} color={AW.strong}>
            {l}
          </T>
          <T size={12} color={AW.muted}>
            0
          </T>
          {refreshing ? <Codicon name="loading" size={14} color={AW.muted} style={{transform: `rotate(${spin(f)}deg)`}} /> : null}
        </div>
      </>
    );
    return (
      <AgentsWindow project={ctx.project} groups={ctx.groups} chatTitle={openSession(ctx)} transcript={ctx.prompt ? <UserBubble y={92} text={ctx.prompt} /> : null} input={<ChatInput model={{label: 'HydraFusion', effort: 'Default', p: 1}} />}>
        <ModalEditor title="Remote Environments" compact actions={['screen-full', 'close']}>
          <div style={{position: 'absolute', left: ED.x, top: ED.top, width: ED.w - 34, height: 26, boxSizing: 'border-box', borderRadius: 4, background: AW.input, border: `1px solid ${AW.inputBorder}`, display: 'flex', alignItems: 'center', padding: '0 6px 0 8px', gap: 6}}>
            <T color={AW.faint}>Type to search...</T>
            <Codicon name="clear-all" size={16} color={AW.faint} style={{marginLeft: 'auto'}} />
            <Codicon name="collapse-all" size={16} color={AW.muted} />
          </div>
          <IconBtn x={ED.x + ED.w - 26} y={ED.top + 2} name="refresh" />
          <div style={{position: 'absolute', left: ED.x, top: tableTop, width: ED.w, height: H.header, background: HEADER_BG}} />
          <div style={{position: 'absolute', left: COL.name, top: tableTop, height: H.header, display: 'flex', alignItems: 'center'}}>
            <T weight={600} color={AW.strong}>
              Name
            </T>
          </div>
          <div style={{position: 'absolute', left: COL.connection, top: tableTop, height: H.header, display: 'flex', alignItems: 'center'}}>
            <T weight={600} color={AW.strong}>
              Connection
            </T>
          </div>
          {groupsAbove.map((g) => (
            <React.Fragment key={g.label}>
              {groupRow(g.at, g.label ?? '', false)}
              {emptyRow(g.at + H.group, g.empty ?? '', g.description, undefined, g.docs)}
            </React.Fragment>
          ))}
          {groupRow(groupY, group, f < show)}
          {shown > 0 ? emptyRow(rowY, label, undefined, action || undefined, docs || undefined, shown) : null}
          {f >= click - 34 ? <Cursor x={cx} y={cy} press={clicks ? press(f, click) : 0} opacity={clamp((f - (click - 34)) / 6)} /> : null}
          {clicks ? <ClickRing x={cx} y={cy} f={f} at={click + 2} /> : null}
        </ModalEditor>
      </AgentsWindow>
    );
  };
  return {
    Component,
    // The group that changed, its prompt whole: the Name column's (the rest of its row is empty).
    loupe: {block: [ED.x - 6, groupY - 8, 670, H.group + H.empty + 14]},
    cues: [{at: show, sfx: 'pop', volume: 0.12}, ...(clicks ? [{at: click, sfx: 'click', volume: 0.22}] : [])],
    chrome: 'window',
  };
};
