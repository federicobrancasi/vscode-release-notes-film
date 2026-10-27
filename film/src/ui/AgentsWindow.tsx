import React from 'react';
import {AW, Codicon, IconBtn, Kbd, T, TrafficLights} from './kit';

// The Agents window of VS Code Insiders 1.144 at 1280×720, laid out from the recorder's screen dump of the real one
// (work/cv-home/…/build/demos/c4/screen.txt): the title bar, the Sessions list, the chat panel with its tabs and input,
// and the side panel. Scenes fill in the sessions, the transcript and the input, and draw over it (cursor, menus).

/** A session row. `collapse` 0–1: filtered out, its row closing up (the rows under it slide up) as it fades. */
export type Session = {title: string; time: string; nested?: boolean; selected?: boolean; icon?: string; pr?: string; status?: React.ReactNode; highlight?: string; opacity?: number; collapse?: number};
export type Group = {label: string; icon: string; sessions: Session[]};
export type ModelPicker = {label: string; effort?: string; p: number; open?: boolean};

const SIDEBAR_W = 276;
export const CHAT = {x: 282, y: 47, w: 690, h: 667};
export const INPUT = {x: 335, y: 588, w: 583, h: 94};

const TitleBar: React.FC<{project: string}> = ({project}) => (
  <>
    <TrafficLights />
    <IconBtn x={86} y={12} name="layout-sidebar-left" />
    <IconBtn x={390} y={12} name="arrow-left" />
    <IconBtn x={413} y={12} name="arrow-right" color={AW.faint} />
    <div style={{position: 'absolute', left: 439, top: 11, width: 399, height: 24, boxSizing: 'border-box', borderRadius: 6, border: `1px solid ${AW.panelBorder}`, display: 'flex', alignItems: 'center', gap: 6, paddingLeft: 9}}>
      <Codicon name="folder" size={14} color={AW.muted} />
      <T color={AW.muted}>{project}</T>
    </div>
    <IconBtn x={841} y={12} name="play" />
    <div style={{position: 'absolute', left: 860, top: 15}}>
      <Codicon name="chevron-down" size={12} color={AW.muted} />
    </div>
    <IconBtn x={880} y={12} name="vscode" />
    <IconBtn x={1156} y={12} name="layout-panel-off" />
    <IconBtn x={1179} y={12} name="layout-sidebar-right" />
    <IconBtn x={1205} y={12} name="radio-tower" />
    <div style={{position: 'absolute', left: 1249, top: 13, width: 20, height: 20, borderRadius: 10, background: 'linear-gradient(140deg, #7aa7d8, #3b5f8f)', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.15)'}} />
  </>
);

const SessionsHeader: React.FC<{findActive?: boolean}> = ({findActive}) => (
  <>
    <div style={{position: 'absolute', left: 10, top: 51}}>
      <T weight={600} color={AW.strong}>
        Sessions
      </T>
    </div>
    <div style={{position: 'absolute', left: 118, top: 49, width: 74, height: 24, boxSizing: 'border-box', borderRadius: 5, border: `1px solid ${AW.inputBorder}`, display: 'flex', alignItems: 'center', gap: 7, paddingLeft: 9}}>
      <T color={AW.strong}>New</T>
      <Kbd keys={['⌘', 'N']} />
    </div>
    <IconBtn x={196} y={50} name="filter" />
    <IconBtn x={222} y={50} name="search" color={findActive ? AW.strong : AW.muted} bg={findActive ? AW.selected : undefined} />
    <IconBtn x={248} y={50} name="ellipsis" />
  </>
);

/** A session row: its title, then its folder and time (and a pull request when it has one), 52 px tall. */
const SessionRow: React.FC<{s: Session; y: number}> = ({s, y}) => {
  const indent = s.nested ? 24 : 0;
  // A row closing up is clipped to what's left of its slot, so it never overlaps the rows sliding up under it.
  const h = 52 * (1 - (s.collapse ?? 0));
  return (
    <div style={{position: 'absolute', left: 4, top: y, width: SIDEBAR_W - 8, height: h, overflow: 'hidden', borderRadius: 6, background: s.selected ? AW.selected : undefined, opacity: s.opacity ?? 1}}>
      <div style={{position: 'absolute', left: 21 + indent, top: 13, width: 5, height: 5, borderRadius: 3, background: AW.faint}} />
      <div style={{position: 'absolute', left: 34 + indent, top: 7}}>
        <T color={AW.strong}>{s.title}</T>
      </div>
      <div style={{position: 'absolute', left: 36 + indent, top: 27, display: 'flex', alignItems: 'center', gap: 5}}>
        <Codicon name={s.icon ?? 'folder'} size={13} color={AW.faint} />
        {s.pr ? (
          <>
            <Codicon name="git-pull-request" size={13} color={s.highlight ? AW.strong : AW.faint} />
            <T color={s.highlight ? AW.strong : AW.muted} style={s.highlight ? {background: 'rgba(234,92,0,0.33)', borderRadius: 2, padding: '0 1px'} : undefined}>
              {s.pr}
            </T>
          </>
        ) : null}
        <T color={AW.faint}>·</T>
        <T color={AW.muted}>{s.time}</T>
      </div>
      {s.status ? <div style={{position: 'absolute', right: 10, top: 16}}>{s.status}</div> : null}
    </div>
  );
};

const Customizations: React.FC = () => {
  const items: [string, string, string?][] = [
    ['home', 'Overview'],
    ['plug', 'Plugins', '1'],
    ['server', 'MCP Servers', '1'],
    ['lightbulb', 'Skills', '18'],
    ['book', 'Instructions', '1'],
    ['robot', 'Agents', '3'],
    ['symbol-event', 'Hooks'],
    ['tools', 'Tools', '15'],
  ];
  return (
    <>
      <div style={{position: 'absolute', left: 8, top: 444, width: SIDEBAR_W - 16, height: 1, background: AW.panelBorder}} />
      <div style={{position: 'absolute', left: 10, top: 457}}>
        <T weight={600} color={AW.strong}>
          Customizations
        </T>
      </div>
      {items.map(([icon, label, n], i) => (
        <div key={label} style={{position: 'absolute', left: 16, top: 487 + i * 28, width: SIDEBAR_W - 34, display: 'flex', alignItems: 'center', gap: 8}}>
          <Codicon name={icon} size={15} color={AW.muted} />
          <T>{label}</T>
          {n ? <T color={AW.muted} style={{marginLeft: 'auto'}}>{n}</T> : null}
        </div>
      ))}
    </>
  );
};

/** The Sessions list: Automations, Chats, then each group's sessions; `findBox` sits above them, pushing them down. */
export const SessionsList: React.FC<{groups: Group[]; findBox?: React.ReactNode; findH?: number}> = ({groups, findBox, findH = 0}) => {
  const top = 76 + findH;
  let y = top + 56;
  return (
    <>
      {findBox ? <div style={{position: 'absolute', left: 8, top: 78, width: SIDEBAR_W - 16}}>{findBox}</div> : null}
      {[
        ['calendar', 'Automations'],
        ['comment-discussion', 'Chats'],
      ].map(([icon, label], i) => (
        <div key={label} style={{position: 'absolute', left: 14, top: top + i * 28, height: 28, display: 'flex', alignItems: 'center', gap: 8}}>
          <Codicon name={icon} size={16} color={AW.muted} />
          <T weight={600} color={AW.muted}>
            {label}
          </T>
        </div>
      ))}
      {groups.map((g) => {
        const header = y;
        y += 27;
        const rows = g.sessions.map((s) => {
          const c = s.collapse ?? 0;
          const row = c >= 1 ? null : <SessionRow key={s.title} s={{...s, opacity: (s.opacity ?? 1) * (1 - c * c)}} y={y} />;
          y += 56 * (1 - c);
          return row;
        });
        y += 4;
        return (
          <React.Fragment key={g.label}>
            <div style={{position: 'absolute', left: 14, top: header, height: 26, display: 'flex', alignItems: 'center', gap: 8}}>
              <Codicon name={g.icon} size={16} color={AW.muted} />
              <T weight={600} color={AW.muted}>
                {g.label}
              </T>
            </div>
            {rows}
          </React.Fragment>
        );
      })}
    </>
  );
};

const SidePanel: React.FC = () => (
  <>
    {[
      ['diff-multiple', 96],
      ['files', 120],
      ['globe', 144],
    ].map(([icon, y]) => (
      <div key={icon as string} style={{position: 'absolute', left: 934, top: y as number, width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <Codicon name={icon as string} size={16} color={AW.muted} />
      </div>
    ))}
    <div style={{position: 'absolute', left: 990, top: 49, height: 24, display: 'flex', alignItems: 'center', gap: 6, padding: '0 8px', borderRadius: 5}}>
      <Codicon name="diff-multiple" size={14} color={AW.muted} />
      <T color={AW.muted}>Changes</T>
    </div>
    <div style={{position: 'absolute', left: 1080, top: 49, height: 24, display: 'flex', alignItems: 'center', gap: 6, padding: '0 8px', borderRadius: 5, background: AW.selected}}>
      <Codicon name="files" size={14} color={AW.strong} />
      <T color={AW.strong}>Files</T>
    </div>
    <IconBtn x={1136} y={50} name="add" />
    <div style={{position: 'absolute', left: 990, top: 79, display: 'flex', alignItems: 'center', gap: 5}}>
      <Codicon name="chevron-down" size={14} color={AW.muted} />
      <T>my-project</T>
    </div>
    <div style={{position: 'absolute', left: 1000, top: 101, display: 'flex', alignItems: 'center', gap: 6}}>
      <Codicon name="info" size={14} color={AW.link} />
      <T>README.md</T>
    </div>
  </>
);

/** The agent picker's button: the current agent (a custom one has no icon), and whether its menu is open. */
export type AgentPicker = {label: string; icon?: string; open?: boolean};
/** Where the model picker starts after the agent picker (its label's width). */
export const modelPickerX = (agent?: AgentPicker) => (agent ? 368 + 10 + (agent.icon ? 19 : 0) + Math.round(agent.label.length * 6.9) + 17 + 8 : 433);

/** The chat input: its text (or placeholder), the toolbar inside it, and the mode and permissions under it. */
export const ChatInput: React.FC<{text?: React.ReactNode; placeholder?: string; model?: ModelPicker | 'loading' | null; agent?: AgentPicker; focused?: boolean; working?: boolean}> = ({text, placeholder = 'Chat with Copilot', model = null, agent, focused = false, working = false}) => (
  <>
    <div style={{position: 'absolute', left: INPUT.x, top: INPUT.y, width: INPUT.w, height: INPUT.h, boxSizing: 'border-box', borderRadius: 8, background: AW.input, border: `1px solid ${focused ? AW.focus : AW.inputBorder}`}} />
    <div style={{position: 'absolute', left: 346, top: 600, width: 560}}>{text ?? <T color={AW.faint}>{placeholder}</T>}</div>
    <IconBtn x={342} y={656} name="add" />
    <div style={{position: 'absolute', left: 368, top: 656, height: 22, display: 'flex', alignItems: 'center', gap: 5, padding: '0 5px', borderRadius: 5, background: agent?.open ? AW.selected : undefined}}>
      {!agent || agent.icon ? <Codicon name={agent?.icon ?? 'agent'} size={14} color={AW.muted} /> : null}
      <T color={agent?.open ? AW.strong : AW.muted}>{agent?.label ?? 'Agent'}</T>
      <Codicon name="chevron-down" size={12} color={AW.muted} />
    </div>
    {model === 'loading' ? (
      <div style={{position: 'absolute', left: 437, top: 662, width: 88, height: 10, borderRadius: 5, background: 'linear-gradient(90deg, #2a2b2e, #35373b, #2a2b2e)'}} />
    ) : model && model.p > 0 ? (
      <div style={{position: 'absolute', left: modelPickerX(agent), top: 656, height: 22, display: 'flex', alignItems: 'center', opacity: Math.min(1, model.p * 1.5), transform: `scale(${0.92 + 0.08 * model.p})`, transformOrigin: 'left center'}}>
        <div style={{height: 22, display: 'flex', alignItems: 'center', gap: 5, padding: '0 6px', borderRadius: 5, background: model.open ? AW.selected : undefined}}>
          <Codicon name="sparkle" size={13} color={AW.muted} />
          <T color={model.open ? AW.strong : AW.muted}>{model.label}</T>
          <Codicon name="chevron-down" size={12} color={AW.muted} />
        </div>
        {model.effort ? (
          <div style={{height: 22, display: 'flex', alignItems: 'center', padding: '0 6px', borderLeft: `1px solid ${AW.panelBorder}`}}>
            <T color={AW.muted}>{model.effort}</T>
          </div>
        ) : null}
      </div>
    ) : null}
    <IconBtn x={864} y={656} name="mic" />
    {working ? (
      <div style={{position: 'absolute', left: 890, top: 656, width: 22, height: 22, borderRadius: 5, background: AW.selected, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{width: 8, height: 8, borderRadius: 1.5, background: AW.strong}} />
      </div>
    ) : (
      <IconBtn x={890} y={656} name="arrow-up" color={AW.faint} />
    )}
    <div style={{position: 'absolute', left: 341, top: 689, height: 22, display: 'flex', alignItems: 'center', gap: 6}}>
      <Codicon name="comment-discussion" size={14} color={AW.muted} />
      <T color={AW.muted}>Interactive</T>
      <div style={{width: 1, height: 14, background: AW.panelBorder, margin: '0 4px'}} />
      <T color={AW.muted}>Manual permissions</T>
    </div>
  </>
);

/** A message the user sent, right-aligned in its bubble, its top at y. */
export const UserBubble: React.FC<{y: number; text: string}> = ({y, text}) => (
  <div style={{position: 'absolute', right: 1280 - 918, top: y, maxWidth: 470, padding: '7px 12px', borderRadius: 8, background: AW.bubble}}>
    <T style={{whiteSpace: 'normal'}}>{text}</T>
  </div>
);

/**
 * The Agents window. `groups`: the sessions; `chatTitle`: the open session (the chat panel's tab); `transcript` and
 * `input`: what the chat panel shows; `children`: drawn over everything, in window px (menus, tooltips, the cursor).
 */
export const AgentsWindow: React.FC<{project?: string; groups: Group[]; findBox?: React.ReactNode; findH?: number; findActive?: boolean; chatTitle: string; transcript: React.ReactNode; input: React.ReactNode; children?: React.ReactNode}> = ({
  project = 'my-project',
  groups,
  findBox,
  findH,
  findActive,
  chatTitle,
  transcript,
  input,
  children,
}) => (
  <div style={{position: 'absolute', left: 0, top: 0, width: 1280, height: 720, background: AW.chrome, overflow: 'hidden'}}>
    <TitleBar project={project} />
    <SessionsHeader findActive={findActive} />
    <SessionsList groups={groups} findBox={findBox} findH={findH} />
    <Customizations />
    <div style={{position: 'absolute', left: CHAT.x, top: CHAT.y, width: CHAT.w, height: CHAT.h, boxSizing: 'border-box', borderRadius: 8, background: AW.panel, border: `1px solid ${AW.panelBorder}`, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 8, top: 4, height: 24, display: 'flex', alignItems: 'center', gap: 8}}>
        <div style={{width: 5, height: 5, borderRadius: 3, background: AW.faint}} />
        <T color={AW.strong}>{chatTitle}</T>
      </div>
      <IconBtn x={663} y={4} name="ellipsis" />
    </div>
    <div style={{position: 'absolute', left: 0, top: 0, width: 1280, height: 720}}>
      {transcript}
      {input}
    </div>
    <SidePanel />
    {children}
  </div>
);
