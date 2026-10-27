import React from 'react';
import {Img, staticFile} from 'remotion';
import {VSCODE_ICON} from '../kit/Logo';
import {AW, Codicon, IconBtn, MW, T, TrafficLights} from './kit';

// The main window of VS Code Insiders 1.144, signed out, at 1280×720: laid out from a capture of the real one in a fresh
// profile (the classic Welcome page, the Explorer, the first-run Chat view, "Sign In" in the title bar). The Welcome
// page's agents banner sits in its footer, where gettingStarted.ts puts it, styled as the page's other categories.

const TitleBar: React.FC = () => (
  <>
    <TrafficLights />
    <IconBtn x={370} y={7} name="arrow-left" color={AW.faint} />
    <IconBtn x={397} y={7} name="arrow-right" color={AW.faint} />
    <div style={{position: 'absolute', left: 423, top: 6, width: 485, height: 24, boxSizing: 'border-box', borderRadius: 6, border: `1px solid ${MW.border}`, background: '#1d1e20'}}>
      <div style={{position: 'absolute', left: 10, top: 3}}>
        <T color={AW.muted}>my-project</T>
      </div>
      <div style={{position: 'absolute', left: 437, top: 3}}>
        <Codicon name="chat-sparkle" size={15} color={AW.muted} />
      </div>
      <div style={{position: 'absolute', left: 466, top: 5}}>
        <Codicon name="chevron-down" size={12} color={AW.muted} />
      </div>
    </div>
    <IconBtn x={920} y={7} name="agent" />
    <div style={{position: 'absolute', left: 947, top: 7, width: 57, height: 22, borderRadius: 4, background: MW.button, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <T color="#ffffff">Sign In</T>
    </div>
    <IconBtn x={1168} y={7} name="layout" />
    <IconBtn x={1194} y={7} name="layout-sidebar-left" />
    <IconBtn x={1220} y={7} name="layout-panel-off" />
    <IconBtn x={1246} y={7} name="layout-sidebar-right" />
  </>
);

const ActivityBar: React.FC = () => (
  <>
    {['files', 'search', 'source-control', 'debug-alt', 'extensions'].map((name, i) => (
      <div key={name} style={{position: 'absolute', left: 13, top: 44 + i * 44, width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <Codicon name={name} size={24} color={i === 0 ? AW.strong : AW.faint} />
      </div>
    ))}
    {bottomIcons.map(([name, y]) => (
      <div key={name} style={{position: 'absolute', left: 13, top: y, width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <Codicon name={name} size={24} color={AW.faint} />
      </div>
    ))}
  </>
);
const bottomIcons: [string, number][] = [
  ['account', 609],
  ['settings-gear', 653],
];

const Explorer: React.FC = () => (
  <>
    <div style={{position: 'absolute', left: 61, top: 44}}>
      <T color={AW.strong}>Explorer</T>
    </div>
    <IconBtn x={321} y={41} name="ellipsis" />
    <div style={{position: 'absolute', left: 60, top: 74, display: 'flex', alignItems: 'center', gap: 4}}>
      <Codicon name="chevron-down" size={14} color={AW.muted} />
      <T weight={600} color={AW.strong}>
        my-project
      </T>
    </div>
    <div style={{position: 'absolute', left: 64, top: 99, display: 'flex', alignItems: 'center', gap: 6}}>
      <Codicon name="info" size={14} color={AW.link} />
      <T>README.md</T>
    </div>
    {[
      ['Outline', 631],
      ['Timeline', 659],
    ].map(([label, y]) => (
      <React.Fragment key={label as string}>
        <div style={{position: 'absolute', left: 56, top: (y as number) - 6, width: 290, height: 1, background: MW.border}} />
        <div style={{position: 'absolute', left: 60, top: y as number, display: 'flex', alignItems: 'center', gap: 4}}>
          <Codicon name="chevron-right" size={14} color={AW.muted} />
          <T weight={600} color={AW.strong}>
            {label}
          </T>
        </div>
      </React.Fragment>
    ))}
  </>
);

/** The first-run Chat view in the secondary side bar. */
const ChatView: React.FC = () => (
  <div style={{position: 'absolute', left: 985, top: 36, width: 290, height: 652, boxSizing: 'border-box', borderRadius: 8, background: MW.editor, border: `1px solid ${MW.border}`}}>
    <div style={{position: 'absolute', left: 10, top: 6, height: 22, padding: '0 6px', borderRadius: 4, background: AW.selected, display: 'flex', alignItems: 'center'}}>
      <T color={AW.strong}>Chat</T>
    </div>
    {['add', 'layout', 'ellipsis', 'screen-full', 'close'].map((name, i) => (
      <IconBtn key={name} x={150 + i * 27} y={6} name={name} />
    ))}
    <div style={{position: 'absolute', left: 0, right: 0, top: 210, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4}}>
      <Codicon name="chat-sparkle" size={40} color={AW.muted} />
      <div style={{height: 12}} />
      <T weight={600} color={AW.strong}>
        Build with Agent
      </T>
      <T color={AW.muted}>AI responses may be inaccurate</T>
      <T color={AW.muted}>
        <span style={{color: AW.link}}>Generate Agent Instructions</span> to onboard AI
      </T>
      <T color={AW.muted}>onto your codebase.</T>
    </div>
    <div style={{position: 'absolute', left: 12, top: 543, width: 264, height: 52, boxSizing: 'border-box', borderRadius: 8, border: `1px solid ${AW.inputBorder}`, background: AW.input}}>
      <div style={{position: 'absolute', left: 10, top: 6}}>
        <T color={AW.faint}>Describe what to build</T>
      </div>
    </div>
    <div style={{position: 'absolute', left: 22, top: 600, display: 'flex', alignItems: 'center', gap: 10}}>
      <Codicon name="add" size={14} color={AW.muted} />
      <Codicon name="agent" size={13} color={AW.muted} />
      <T size={12} color={AW.muted} style={{marginLeft: -6}}>
        Agent
      </T>
      <T size={12} color={AW.muted}>
        Models
      </T>
      <Codicon name="settings" size={13} color={AW.muted} />
    </div>
    <div style={{position: 'absolute', left: 18, top: 627, display: 'flex', alignItems: 'center', gap: 6}}>
      <Codicon name="vm" size={13} color={AW.muted} />
      <T size={12} color={AW.muted}>
        Local
      </T>
      <Codicon name="shield" size={13} color={AW.muted} style={{marginLeft: 8}} />
      <T size={12} color={AW.muted}>
        Default permissions
      </T>
    </div>
  </div>
);

/** A button's label and its codicon. */
export type Label = {text: string; icon: string};
/**
 * The page's banner button: `before` and `after` its two labels, `swap` 0–1 rolling from one to the other (the old one up
 * and out, the new one in); `hover` 0–1 the cursor over it.
 */
export type Banner = {swap: number; hover: number; before: Label; after: Label};

/** The classic Welcome page, its top-left at the editor's, with the agents banner in its footer. */
const Welcome: React.FC<{banner: Banner}> = ({banner}) => {
  const start: [string, string][] = [
    ['new-file', 'New File...'],
    ['folder-opened', 'Open...'],
    ['source-control', 'Clone Git Repository...'],
    ['remote', 'Connect to...'],
    ['chat-sparkle', 'Generate New Workspace...'],
  ];
  return (
    <>
      <div style={{position: 'absolute', left: 416, top: 150}}>
        <T size={26} weight={500} color={AW.strong}>
          Visual Studio Code
        </T>
      </div>
      <div style={{position: 'absolute', left: 416, top: 186}}>
        <T size={18} weight={500} color={AW.muted}>
          Editing evolved
        </T>
      </div>
      <div style={{position: 'absolute', left: 416, top: 228}}>
        <T size={18} weight={500} color={AW.strong}>
          Start
        </T>
      </div>
      {start.map(([icon, label], i) => (
        <div key={label} style={{position: 'absolute', left: 419, top: 263 + i * 31, display: 'flex', alignItems: 'center', gap: 10}}>
          <Codicon name={icon} size={17} color={AW.link} />
          <T size={14} color={AW.link}>
            {label}
          </T>
        </div>
      ))}
      <div style={{position: 'absolute', left: 686, top: 228}}>
        <T size={18} weight={500} color={AW.strong}>
          Walkthroughs
        </T>
      </div>
      <div style={{position: 'absolute', left: 686, top: 263, width: 215, height: 68, borderRadius: 6, background: '#2a2a2c'}}>
        <div style={{position: 'absolute', left: 9, top: 9, width: 18, height: 18, borderRadius: 4, background: '#3794ff', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <Codicon name="star-full" size={12} color="#ffffff" />
        </div>
        <div style={{position: 'absolute', left: 34, top: 8}}>
          <T weight={600} color={AW.strong}>
            Get started with VS C...
          </T>
        </div>
        <div style={{position: 'absolute', left: 34, top: 27, width: 172}}>
          <T style={{whiteSpace: 'normal', lineHeight: '16px'}}>Customize your editor, learn the basics, and start coding</T>
        </div>
      </div>
      <div style={{position: 'absolute', left: 686, top: 348, width: 215, height: 31, borderRadius: 6, background: '#2a2a2c', display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 9, boxSizing: 'border-box'}}>
        <Codicon name="lightbulb" size={17} color={AW.muted} />
        <T weight={600} color={AW.strong}>
          Learn the Fundamentals
        </T>
      </div>
      <div style={{position: 'absolute', left: 416, top: 425}}>
        <T size={18} weight={500} color={AW.strong}>
          Recent
        </T>
      </div>
      <div style={{position: 'absolute', left: 416, top: 456}}>
        <T>You have no recent folders,</T>
      </div>
      <div style={{position: 'absolute', left: 416, top: 480}}>
        <T>
          <span style={{color: AW.link}}>open a folder</span> to start.
        </T>
      </div>
      <BannerCard banner={banner} />
      <div style={{position: 'absolute', left: 556, top: 652, display: 'flex', alignItems: 'center', gap: 8}}>
        <div style={{width: 16, height: 16, borderRadius: 3, border: `1px solid ${AW.inputBorder}`, background: AW.input, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <Codicon name="check" size={13} color={AW.strong} />
        </div>
        <T>Show welcome page on startup</T>
      </div>
    </>
  );
};

/** The banner, a Welcome page category in its footer (Oct 19: the Agents window's invitation, then GitHub sign-in). */
export const BANNER = {x: 533, y: 596, w: 250, h: 36};
/** The banner's box for its labels: 250 px wide, wider for long labels, centred where the page has it. */
export const bannerBox = (before: Label, after: Label) => {
  const w = Math.max(BANNER.w, Math.round(Math.max(before.text.length, after.text.length) * 6.6 + 44));
  return {x: BANNER.x + BANNER.w / 2 - w / 2, y: BANNER.y, w, h: BANNER.h};
};
const easeIO = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const BannerCard: React.FC<{banner: Banner}> = ({banner}) => {
  const {swap, hover, before, after} = banner;
  const box = bannerBox(before, after);
  // An odometer roll inside the button: the labels move together, one button-height apart, clipped by the button, so
  // they never overlap and the button is never empty.
  const p = easeIO(Math.min(1, Math.max(0, swap)));
  const labels: [string, string, number, number][] = [
    [before.icon, before.text, p < 1 ? 1 : 0, -box.h * p],
    [after.icon, after.text, p > 0 ? 1 : 0, box.h * (1 - p)],
  ];
  const lift = Math.round(8 * hover);
  return (
    <div style={{position: 'absolute', left: box.x, top: box.y, width: box.w, height: box.h, borderRadius: 6, background: `rgb(${42 + lift}, ${42 + lift}, ${44 + lift})`, overflow: 'hidden'}}>
      {labels.map(([icon, label, o, dy]) =>
        o <= 0 ? null : (
          <div key={label} style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: o, transform: `translateY(${dy}px)`}}>
            <Codicon name={icon} size={17} color={AW.strong} />
            <T weight={600} color={AW.strong}>
              {label}
            </T>
          </div>
        ),
      )}
    </div>
  );
};

/** The main window on its Welcome page (`tab`: the editor tab's label). */
export const MainWindow: React.FC<{banner: Banner; tab?: string; children?: React.ReactNode}> = ({banner, tab = 'Welcome', children}) => (
  <div style={{position: 'absolute', left: 0, top: 0, width: 1280, height: 720, background: MW.chrome, overflow: 'hidden'}}>
    <TitleBar />
    <ActivityBar />
    <Explorer />
    <div style={{position: 'absolute', left: 352, top: 36, width: 627, height: 652, boxSizing: 'border-box', borderRadius: 8, background: MW.editor, border: `1px solid ${MW.border}`, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 0, top: 0, right: 0, height: 33, background: MW.tabs}} />
      <div style={{position: 'absolute', left: 0, top: 0, width: 124, height: 33, background: MW.editor, display: 'flex', alignItems: 'center', gap: 7, paddingLeft: 11, boxSizing: 'border-box'}}>
        <Img src={staticFile(VSCODE_ICON)} style={{width: 15, height: 15}} />
        <T color={AW.strong}>{tab}</T>
        <Codicon name="close" size={14} color={AW.muted} style={{marginLeft: 6}} />
      </div>
      <IconBtn x={573} y={5} name="split-horizontal" />
      <IconBtn x={599} y={5} name="ellipsis" />
    </div>
    <div style={{position: 'absolute', left: 0, top: 0, width: 1280, height: 720}}>
      <Welcome banner={banner} />
    </div>
    <ChatView />
    <div style={{position: 'absolute', left: 16, top: 698, display: 'flex', alignItems: 'center', gap: 10}}>
      <Codicon name="remote" size={15} color={AW.muted} />
      <div style={{display: 'flex', alignItems: 'center', gap: 4, marginLeft: 8}}>
        <Codicon name="error" size={14} color={AW.muted} />
        <T size={12} color={AW.muted}>
          0
        </T>
        <Codicon name="warning" size={14} color={AW.muted} style={{marginLeft: 4}} />
        <T size={12} color={AW.muted}>
          0
        </T>
      </div>
    </div>
    <div style={{position: 'absolute', left: 1215, top: 698, display: 'flex', alignItems: 'center', gap: 16}}>
      <Codicon name="copilot" size={15} color={AW.muted} />
      <Codicon name="bell" size={15} color={AW.muted} />
    </div>
    {children}
  </div>
);
