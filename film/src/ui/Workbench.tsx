import React from 'react';
import {Img, staticFile} from 'remotion';
import {VSCODE_ICON} from '../kit/Logo';
import {AW, Codicon, IconBtn, MW, T, TrafficLights} from './kit';

// The main window of VS Code 1.144 at 1280×720, as MainWindow.tsx measured it on the real one (the title bar with the
// command center, the activity bar, the side bar on the window's chrome, the editor as a rounded panel, the status bar),
// with every part a scene fills: the side bar's view, the editor's tabs and content, the status bar's items, badges.

export const WB = {
  titleH: 36,
  panelY: 36,
  panelH: 652,
  sideX: 56,
  sideW: 290,
  editorX: 352,
  right: 1275,
  statusY: 690,
  tabsH: 33,
};
/** The editor panel's box in window px (with or without the side bar). */
export const editorBox = (sidebar: boolean) => {
  const x = sidebar ? WB.editorX : WB.sideX;
  return {x, y: WB.panelY, w: WB.right - x, h: WB.panelH};
};
/** Where an editor's content starts: under its tabs. */
export const contentTop = WB.panelY + WB.tabsH;

export type Tab = {label: string; icon?: string; vscode?: boolean; active?: boolean; dirty?: boolean; italic?: boolean};

const TitleBar: React.FC<{project: string; signIn: boolean; title?: string; lights: boolean}> = ({project, signIn, title, lights}) => (
  <>
    {lights ? <TrafficLights /> : null}
    <IconBtn x={370} y={7} name="arrow-left" color={AW.faint} />
    <IconBtn x={397} y={7} name="arrow-right" color={AW.faint} />
    <div style={{position: 'absolute', left: 423, top: 6, width: 485, height: 24, boxSizing: 'border-box', borderRadius: 6, border: `1px solid ${MW.border}`, background: '#1d1e20'}}>
      <div style={{position: 'absolute', left: 10, top: 3, display: 'flex', alignItems: 'center', gap: 6}}>
        <Codicon name="search" size={13} color={AW.faint} />
        <T color={AW.muted}>{title ?? project}</T>
      </div>
      <div style={{position: 'absolute', left: 437, top: 3}}>
        <Codicon name="chat-sparkle" size={15} color={AW.muted} />
      </div>
      <div style={{position: 'absolute', left: 466, top: 5}}>
        <Codicon name="chevron-down" size={12} color={AW.muted} />
      </div>
    </div>
    <IconBtn x={920} y={7} name="agent" />
    {signIn ? (
      <div style={{position: 'absolute', left: 947, top: 7, width: 57, height: 22, borderRadius: 4, background: MW.button, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <T color="#ffffff">Sign In</T>
      </div>
    ) : null}
    <IconBtn x={1168} y={7} name="layout" />
    <IconBtn x={1194} y={7} name="layout-sidebar-left" />
    <IconBtn x={1220} y={7} name="layout-panel-off" />
    <IconBtn x={1246} y={7} name="layout-sidebar-right" />
  </>
);

/** A count badge on an activity bar icon (the Manage gear's update, Extensions' installs). */
export const ActivityBadge: React.FC<{x: number; y: number; text: string; p?: number; color?: string}> = ({x, y, text, p = 1, color = '#0078d4'}) =>
  p <= 0 ? null : (
    <div style={{position: 'absolute', left: x, top: y, minWidth: 16, height: 16, padding: '0 4px', boxSizing: 'border-box', borderRadius: 8, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${p})`}}>
      <T size={10} weight={600} color="#ffffff">
        {text}
      </T>
    </div>
  );

export const ACTIVITY = ['files', 'search', 'source-control', 'debug-alt', 'extensions'] as const;
/** An activity bar icon's top-left (24 px icons in 26 px boxes, 44 px apart; the account and the gear at the bottom). */
export const activityAt = (name: string): [number, number] => {
  if (name === 'account') return [13, 609];
  if (name === 'settings-gear') return [13, 653];
  return [13, 44 + ACTIVITY.indexOf(name as (typeof ACTIVITY)[number]) * 44];
};

const ActivityBar: React.FC<{active: string | null; gearBadge?: React.ReactNode; accountBadge?: React.ReactNode; avatar?: boolean}> = ({active, gearBadge, accountBadge, avatar}) => (
  <>
    {ACTIVITY.map((name) => {
      const [x, y] = activityAt(name);
      return (
        <React.Fragment key={name}>
          {active === name ? <div style={{position: 'absolute', left: 0, top: y - 9, width: 2, height: 44, background: AW.strong}} /> : null}
          <div style={{position: 'absolute', left: x, top: y, width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <Codicon name={name} size={24} color={active === name ? AW.strong : AW.faint} />
          </div>
        </React.Fragment>
      );
    })}
    <div style={{position: 'absolute', left: 13, top: 609, width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      {avatar ? <div style={{width: 22, height: 22, borderRadius: 11, background: 'linear-gradient(140deg, #7aa7d8, #3b5f8f)', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.15)'}} /> : <Codicon name="account" size={24} color={AW.faint} />}
    </div>
    <div style={{position: 'absolute', left: 13, top: 653, width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <Codicon name="settings-gear" size={24} color={AW.faint} />
    </div>
    {accountBadge}
    {gearBadge}
  </>
);

/** The side bar's header (its view's title) and its content, on the chrome. */
const SideBar: React.FC<{title: string; children?: React.ReactNode}> = ({title, children}) => (
  <>
    <div style={{position: 'absolute', left: 61, top: 44}}>
      <T color={AW.strong}>{title}</T>
    </div>
    <IconBtn x={321} y={41} name="ellipsis" />
    {children}
  </>
);

/** The Explorer's tree: the project and its files (the first one selected when it's open in the editor). */
export const ExplorerTree: React.FC<{project: string; files: string[]; open?: string}> = ({project, files, open}) => (
  <>
    <div style={{position: 'absolute', left: 60, top: 74, display: 'flex', alignItems: 'center', gap: 4}}>
      <Codicon name="chevron-down" size={14} color={AW.muted} />
      <T weight={600} color={AW.strong}>
        {project}
      </T>
    </div>
    {files.map((f, i) => (
      <div key={f} style={{position: 'absolute', left: 56, top: 96 + i * 22, width: 290, height: 22, background: f === open ? AW.selected : undefined, display: 'flex', alignItems: 'center', gap: 6, paddingLeft: 26, boxSizing: 'border-box'}}>
        <Codicon name={f.includes('.') ? fileIcon(f) : 'folder'} size={14} color={fileColor(f)} />
        <T color={f === open ? AW.strong : AW.fg}>{f}</T>
      </div>
    ))}
  </>
);
/** A file's codicon and colour by its extension (Seti's colours, drawn with codicons). */
export const fileIcon = (f: string) => (/\.md$/.test(f) ? 'info' : /\.json$/.test(f) ? 'bracket-dot' : 'file-code');
export const fileColor = (f: string) => (/\.md$/.test(f) ? AW.link : /\.json$/.test(f) ? '#cbcb41' : /\.tsx?$/.test(f) ? '#519aba' : /\.py$/.test(f) ? '#a074c4' : AW.muted);

/** The editor's tabs: each its icon, label and close (or dirty dot); the active one on the editor's colour. */
export const Tabs: React.FC<{tabs: Tab[]; x: number; w: number}> = ({tabs, x, w}) => {
  let left = 0;
  return (
    <div style={{position: 'absolute', left: x, top: WB.panelY, width: w, height: WB.tabsH, background: MW.tabs, borderRadius: '8px 8px 0 0', overflow: 'hidden'}}>
      {tabs.map((t) => {
        const tw = Math.round(52 + t.label.length * 6.9);
        const at = left;
        left += tw;
        return (
          <div key={t.label} style={{position: 'absolute', left: at, top: 0, width: tw, height: WB.tabsH, background: t.active ? MW.editor : undefined, borderRight: `1px solid ${MW.border}`, boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: 7, paddingLeft: 11}}>
            {t.vscode ? <Img src={staticFile(VSCODE_ICON)} style={{width: 15, height: 15}} /> : <Codicon name={t.icon ?? fileIcon(t.label)} size={14} color={t.icon ? AW.muted : fileColor(t.label)} />}
            <T color={t.active ? AW.strong : AW.muted} style={t.italic ? {fontStyle: 'italic'} : undefined}>
              {t.label}
            </T>
            {t.dirty ? <div style={{width: 8, height: 8, borderRadius: 4, background: AW.fg, marginLeft: 4}} /> : t.active ? <Codicon name="close" size={14} color={AW.muted} style={{marginLeft: 4}} /> : null}
          </div>
        );
      })}
    </div>
  );
};

export type Status = {
  /** The remote indicator's text, or null for the bare indicator. */
  remote?: string | null;
  /** The remote indicator's background (a connected remote is coloured). */
  remoteBg?: string;
  left?: React.ReactNode;
  right?: string[];
  /** The status bar's colour (orange while debugging). */
  bg?: string;
};

const StatusBar: React.FC<{status: Status}> = ({status}) => (
  <div style={{position: 'absolute', left: 0, top: WB.statusY, width: 1280, height: 30, background: status.bg}}>
    <div style={{position: 'absolute', left: 8, top: 4, height: 22, display: 'flex', alignItems: 'center', gap: 6, padding: '0 8px', borderRadius: 4, background: status.remoteBg}}>
      <Codicon name="remote" size={15} color={status.remoteBg ? '#ffffff' : AW.muted} />
      {status.remote ? (
        <T size={12} color={status.remoteBg ? '#ffffff' : AW.muted}>
          {status.remote}
        </T>
      ) : null}
    </div>
    <div style={{position: 'absolute', left: status.remote ? 30 + status.remote.length * 6.6 + 24 : 44, top: 8, display: 'flex', alignItems: 'center', gap: 4}}>
      {status.left ?? (
        <>
          <Codicon name="error" size={14} color={status.bg ? '#ffffff' : AW.muted} />
          <T size={12} color={status.bg ? '#ffffff' : AW.muted}>
            0
          </T>
          <Codicon name="warning" size={14} color={status.bg ? '#ffffff' : AW.muted} style={{marginLeft: 4}} />
          <T size={12} color={status.bg ? '#ffffff' : AW.muted}>
            0
          </T>
        </>
      )}
    </div>
    <div style={{position: 'absolute', right: 16, top: 7, display: 'flex', alignItems: 'center', gap: 16}}>
      {(status.right ?? []).map((r) => (
        <T key={r} size={12} color={status.bg ? '#ffffff' : AW.muted}>
          {r}
        </T>
      ))}
      <Codicon name="copilot" size={15} color={status.bg ? '#ffffff' : AW.muted} />
      <Codicon name="bell" size={15} color={status.bg ? '#ffffff' : AW.muted} />
    </div>
  </div>
);

/**
 * The main window. `sidebar`: the side bar's title and content (null: hidden, the editor wider); `tabs` and `editor`:
 * the editor's tabs and what it shows (window px); `status`: the status bar; `children`: over everything (quick input,
 * dialogs, toasts, menus, the pointer).
 */
export const Workbench: React.FC<{
  project?: string;
  title?: string;
  signIn?: boolean;
  avatar?: boolean;
  activity?: string | null;
  gearBadge?: React.ReactNode;
  accountBadge?: React.ReactNode;
  sidebar?: {title: string; content?: React.ReactNode} | null;
  tabs?: Tab[];
  editor?: React.ReactNode;
  status?: Status;
  /** In a browser page (VS Code for the Web): no window buttons of its own. */
  web?: boolean;
  children?: React.ReactNode;
}> = ({project = 'my-project', title, signIn = false, avatar = false, activity = 'files', gearBadge, accountBadge, sidebar = {title: 'Explorer'}, tabs = [], editor, status = {}, web = false, children}) => {
  const box = editorBox(Boolean(sidebar));
  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: 1280, height: 720, background: MW.chrome, overflow: 'hidden'}}>
      <TitleBar project={project} signIn={signIn} title={title} lights={!web} />
      <ActivityBar active={activity} gearBadge={gearBadge} accountBadge={accountBadge} avatar={avatar} />
      {sidebar ? <SideBar title={sidebar.title}>{sidebar.content}</SideBar> : null}
      <div style={{position: 'absolute', left: box.x, top: box.y, width: box.w, height: box.h, boxSizing: 'border-box', borderRadius: 8, background: MW.editor, border: `1px solid ${MW.border}`, overflow: 'hidden'}} />
      {tabs.length ? <Tabs tabs={tabs} x={box.x + 1} w={box.w - 2} /> : null}
      <div style={{position: 'absolute', left: box.x, top: box.y, width: box.w, height: box.h, borderRadius: 8, overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: -box.x, top: -box.y, width: 1280, height: 720}}>{editor}</div>
      </div>
      <StatusBar status={status} />
      {children}
    </div>
  );
};
