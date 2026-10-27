import React from 'react';
import {Img, staticFile} from 'remotion';
import {UI, UI_MONO} from '../design';
import {VSCODE_ICON} from '../kit/Logo';
import type {Day} from '../scenes/types';
import {Codicon} from './kit';

// A Mac desktop at 1280×720 (the app's badge, the system's notifications): an original wallpaper, the menu bar, and a
// Dock in the style of macOS 26. The other apps are original Mac-style icons (no Apple artwork). VS Code is the
// app's own macOS tile: the official logo on its white squircle, placed where the Insiders tile has its logo (the logo
// box measured on Code - Insiders.icns: 69.8% of the tile, 14.1% in from the left, 15.2% down from the top).

/** A superellipse (n = 5), the continuous-corner squircle of macOS app icons, as an SVG path in a size×size box. */
export const squirclePath = (size: number, inset = 0) => {
  const n = 5;
  const r = size / 2 - inset;
  const pts: string[] = [];
  for (let i = 0; i < 160; i++) {
    const a = (i / 160) * Math.PI * 2;
    const c = Math.cos(a);
    const s = Math.sin(a);
    const x = size / 2 + Math.sign(c) * Math.pow(Math.abs(c), 2 / n) * r;
    const y = size / 2 + Math.sign(s) * Math.pow(Math.abs(s), 2 / n) * r;
    pts.push(`${i ? 'L' : 'M'}${x.toFixed(2)},${y.toFixed(2)}`);
  }
  return `${pts.join(' ')} Z`;
};
const SQ = squirclePath(100);
const DEFAULT_DAY: Day = {weekday: 'Mon', month: 'Oct', day: 19, year: 2026, m: 10};

/** An app tile: a 100×100 drawing clipped to the squircle, with the light rim app icons have. */
const Tile: React.FC<{size: number; id: string; bg: [string, string]; children: React.ReactNode}> = ({size, id, bg, children}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{display: 'block', overflow: 'visible'}}>
    <defs>
      <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={bg[0]} />
        <stop offset="1" stopColor={bg[1]} />
      </linearGradient>
      <clipPath id={`${id}-clip`}>
        <path d={SQ} />
      </clipPath>
    </defs>
    <path d={SQ} fill="rgba(0,0,0,0.28)" transform="translate(0 1.6)" style={{filter: 'blur(1.4px)'}} />
    <g clipPath={`url(#${id}-clip)`}>
      <rect width="100" height="100" fill={`url(#${id}-bg)`} />
      {children}
      <rect width="100" height="50" fill="url(#gloss)" opacity="0.5" />
    </g>
    <path d={SQ} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.8" />
  </svg>
);

const gear = (cx: number, cy: number, r: number, teeth = 8) => {
  const pts: string[] = [];
  for (let i = 0; i < teeth * 4; i++) {
    const a = (i / (teeth * 4)) * Math.PI * 2;
    const out = i % 4 === 0 || i % 4 === 1;
    const rr = out ? r : r * 0.8;
    pts.push(`${(cx + Math.cos(a) * rr).toFixed(2)},${(cy + Math.sin(a) * rr).toFixed(2)}`);
  }
  return pts.join(' ');
};

export type AppId = 'files' | 'browser' | 'mail' | 'chat' | 'calendar' | 'notes' | 'terminal' | 'vscode' | 'settings' | 'downloads' | 'trash';

/** Each app's original icon. */
export const AppIcon: React.FC<{id: AppId; size: number; day?: Day}> = ({id, size, day = DEFAULT_DAY}) => {
  switch (id) {
    case 'files':
      return (
        <Tile size={size} id={id} bg={['#63BEFF', '#1F6FEB']}>
          <rect x="21" y="29" width="26" height="12" rx="3" fill="#D9EDFF" />
          <rect x="18" y="35" width="64" height="40" rx="6" fill="#EAF5FF" />
          <rect x="18" y="41" width="64" height="34" rx="6" fill="#FFFFFF" />
          <rect x="18" y="41" width="64" height="6" fill="#D2E8FF" />
        </Tile>
      );
    case 'browser':
      return (
        <Tile size={size} id={id} bg={['#FFFFFF', '#DCE6F2']}>
          <defs>
            <linearGradient id="globe" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#4FB3FF" />
              <stop offset="1" stopColor="#1554C9" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="31" fill="url(#globe)" />
          <g fill="none" stroke="#FFFFFF" strokeWidth="2.4" opacity="0.92">
            <circle cx="50" cy="50" r="31" />
            <ellipse cx="50" cy="50" rx="13" ry="31" />
            <line x1="19" y1="50" x2="81" y2="50" />
            <path d="M24 36 Q50 42 76 36" />
            <path d="M24 64 Q50 58 76 64" />
          </g>
        </Tile>
      );
    case 'mail':
      return (
        <Tile size={size} id={id} bg={['#58A6FF', '#2B5FE3']}>
          <rect x="19" y="31" width="62" height="40" rx="6" fill="#FFFFFF" />
          <path d="M21 34 L50 55 L79 34" fill="none" stroke="#9CC2FF" strokeWidth="3" strokeLinejoin="round" />
        </Tile>
      );
    case 'chat':
      return (
        <Tile size={size} id={id} bg={['#3DDBC4', '#0E7C70']}>
          <rect x="30" y="22" width="48" height="32" rx="14" fill="rgba(255,255,255,0.5)" />
          <path d="M22 44 a14 14 0 0 1 14 -14 h22 a14 14 0 0 1 14 14 v6 a14 14 0 0 1 -14 14 h-18 l-12 9 l2 -10 a14 14 0 0 1 -8 -13 z" fill="#FFFFFF" />
          {[38, 48, 58].map((x) => (
            <circle key={x} cx={x} cy="47" r="3.2" fill="#0E7C70" />
          ))}
        </Tile>
      );
    case 'calendar':
      return (
        <Tile size={size} id={id} bg={['#FFFFFF', '#EEEEEE']}>
          <rect width="100" height="30" fill="#F2453D" />
          <text x="50" y="22" textAnchor="middle" fontFamily={UI} fontSize="15" fontWeight="700" fill="#FFFFFF" letterSpacing="1">
            {day.month.toUpperCase()}
          </text>
          <text x="50" y="78" textAnchor="middle" fontFamily={UI} fontSize="44" fontWeight="600" fill="#1F2328">
            {day.day}
          </text>
        </Tile>
      );
    case 'notes':
      return (
        <Tile size={size} id={id} bg={['#FFE88A', '#F2B92E']}>
          <g transform="rotate(-6 50 50)">
            <rect x="24" y="17" width="52" height="66" rx="5" fill="#FFFDF4" />
            {[34, 45, 56, 67].map((y) => (
              <line key={y} x1="31" y1={y} x2="69" y2={y} stroke="#E4D7AE" strokeWidth="2.4" strokeLinecap="round" />
            ))}
          </g>
        </Tile>
      );
    case 'terminal':
      return (
        <Tile size={size} id={id} bg={['#34363B', '#121316']}>
          <rect x="14" y="16" width="72" height="68" rx="9" fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="2" />
          <text x="25" y="58" fontFamily={UI_MONO} fontSize="28" fontWeight="700" fill="#4ADE80">
            {'>_'}
          </text>
        </Tile>
      );
    case 'settings':
      return (
        <Tile size={size} id={id} bg={['#A9B0BB', '#4D5562']}>
          <polygon points={gear(50, 50, 30, 10)} fill="#E9ECF1" />
          <circle cx="50" cy="50" r="15" fill="#6B7380" />
          <circle cx="50" cy="50" r="8" fill="#E9ECF1" />
        </Tile>
      );
    case 'downloads':
      return (
        <Tile size={size} id={id} bg={['rgba(150,190,255,0.55)', 'rgba(70,120,220,0.55)']}>
          <path d="M50 24 V62 M34 47 L50 63 L66 47" fill="none" stroke="#FFFFFF" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="30" y1="76" x2="70" y2="76" stroke="#FFFFFF" strokeWidth="7" strokeLinecap="round" />
        </Tile>
      );
    case 'trash':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" style={{display: 'block'}}>
          <path d="M26 30 H74 L69 86 Q68 92 62 92 H38 Q32 92 31 86 Z" fill="rgba(255,255,255,0.22)" stroke="rgba(255,255,255,0.75)" strokeWidth="2" />
          <rect x="22" y="22" width="56" height="9" rx="4" fill="rgba(255,255,255,0.5)" />
          {[40, 50, 60].map((x) => (
            <line key={x} x1={x} y1="38" x2={x} y2="84" stroke="rgba(255,255,255,0.55)" strokeWidth="2.2" />
          ))}
        </svg>
      );
    case 'vscode':
      return (
        <div style={{position: 'relative', width: size, height: size}}>
          <Tile size={size} id={id} bg={['#FFFFFF', '#F1F2F4']}>
            <g />
          </Tile>
          <Img src={staticFile(VSCODE_ICON)} style={{position: 'absolute', left: size * 0.141, top: size * 0.152, width: size * 0.698, height: size * 0.698}} />
        </div>
      );
  }
};

const APPS: AppId[] = ['files', 'browser', 'mail', 'chat', 'calendar', 'notes', 'terminal', 'vscode', 'settings'];
const RUNNING = new Set<AppId>(['files', 'browser', 'terminal', 'vscode']);
export const DOCK = {T: 64, gap: 8, pad: 10, sep: 16};
const dockWidth = () => (APPS.length + 2) * DOCK.T + (APPS.length + 1) * DOCK.gap + DOCK.sep + 2 * DOCK.pad;
export const DOCK_X = (1280 - dockWidth()) / 2;
export const DOCK_Y = 720 - 8 - (DOCK.T + 2 * DOCK.pad);
/** A tile's top-left in the desktop (index into the Dock: the apps, then Downloads and Trash past the separator). */
export const tileAt = (i: number): [number, number] => [DOCK_X + DOCK.pad + i * (DOCK.T + DOCK.gap) + (i >= APPS.length ? DOCK.sep : 0), DOCK_Y + DOCK.pad];
export const VSCODE_TILE = tileAt(APPS.indexOf('vscode'));

/** The macOS app badge: a red disc with the count. */
const Badge: React.FC<{count: number; p: number; size: number}> = ({count, p, size}) =>
  p <= 0 ? null : (
    <div style={{width: size, height: size, borderRadius: size / 2, background: 'linear-gradient(180deg, #FF5B4F, #E5302A)', boxShadow: '0 1px 3px rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${p})`}}>
      <span style={{fontFamily: UI, fontSize: size * 0.62, fontWeight: 600, color: '#FFFFFF', lineHeight: 1}}>{count}</span>
    </div>
  );

/** The Dock. `bounce`: px the VS Code tile is lifted; `badge`: its count and scale. */
export const Dock: React.FC<{bounce: number; badge: {count: number; p: number}; day?: Day}> = ({bounce, badge, day}) => {
  const T = DOCK.T;
  return (
    <>
      <svg width={0} height={0} style={{position: 'absolute'}}>
        <defs>
          <linearGradient id="gloss" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.35" />
            <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
      <div
        style={{
          position: 'absolute',
          left: DOCK_X,
          top: DOCK_Y,
          width: dockWidth(),
          height: T + 2 * DOCK.pad,
          borderRadius: 24,
          background: 'linear-gradient(180deg, rgba(255,255,255,0.24), rgba(255,255,255,0.12))',
          border: '1px solid rgba(255,255,255,0.32)',
          boxShadow: '0 18px 40px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.45)',
        }}
      />
      {[...APPS, 'downloads' as AppId, 'trash' as AppId].map((id, i) => {
        const [x, y] = tileAt(i);
        const lift = id === 'vscode' ? bounce : 0;
        return (
          <React.Fragment key={id}>
            <div style={{position: 'absolute', left: x, top: y - lift, width: T, height: T}}>
              <AppIcon id={id} size={T} day={day} />
              {id === 'vscode' ? (
                <div style={{position: 'absolute', left: T - 17, top: -7}}>
                  <Badge count={badge.count} p={badge.p} size={24} />
                </div>
              ) : null}
            </div>
            {RUNNING.has(id) ? <div style={{position: 'absolute', left: x + T / 2 - 2, top: DOCK_Y + T + 2 * DOCK.pad - 6, width: 4, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.85)'}} /> : null}
          </React.Fragment>
        );
      })}
      <div style={{position: 'absolute', left: tileAt(APPS.length)[0] - DOCK.sep / 2 - DOCK.gap / 2 - 0.5, top: DOCK_Y + 14, width: 1, height: T + 2 * DOCK.pad - 28, background: 'rgba(255,255,255,0.35)'}} />
    </>
  );
};

/** An original wallpaper: deep blues with soft light. */
export const Wallpaper: React.FC = () => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      background:
        'radial-gradient(70% 60% at 18% 12%, rgba(77,121,255,0.85) 0%, rgba(77,121,255,0) 62%), radial-gradient(60% 55% at 86% 26%, rgba(148,92,255,0.75) 0%, rgba(148,92,255,0) 60%), radial-gradient(80% 60% at 55% 105%, rgba(24,170,233,0.7) 0%, rgba(24,170,233,0) 62%), linear-gradient(160deg, #0d1433 0%, #141c45 48%, #0a0f26 100%)',
    }}
  >
    <div style={{position: 'absolute', left: -200, top: 330, width: 1700, height: 260, borderRadius: '50%', background: 'rgba(120,170,255,0.16)', filter: 'blur(40px)', transform: 'rotate(-9deg)'}} />
    <div style={{position: 'absolute', left: -100, top: 420, width: 1600, height: 160, borderRadius: '50%', background: 'rgba(170,130,255,0.14)', filter: 'blur(34px)', transform: 'rotate(-6deg)'}} />
  </div>
);

/** The menu bar while VS Code is the active app (its macOS app menu is "Code"), its clock on the film's day. */
export const MenuBar: React.FC<{day?: Day}> = ({day = DEFAULT_DAY}) => (
  <div style={{position: 'absolute', left: 0, top: 0, width: 1280, height: 26, background: 'rgba(10,14,30,0.32)', display: 'flex', alignItems: 'center', padding: '0 14px', boxSizing: 'border-box', gap: 18}}>
    <span style={{fontFamily: UI, fontSize: 13, fontWeight: 700, color: '#FFFFFF'}}>Code</span>
    {['File', 'Edit', 'Selection', 'View', 'Go', 'Run', 'Terminal', 'Window', 'Help'].map((m) => (
      <span key={m} style={{fontFamily: UI, fontSize: 13, color: 'rgba(255,255,255,0.92)'}}>
        {m}
      </span>
    ))}
    <div style={{marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 14}}>
      <Codicon name="search" size={14} color="rgba(255,255,255,0.9)" />
      <div style={{width: 22, height: 11, borderRadius: 3, border: '1.2px solid rgba(255,255,255,0.85)', position: 'relative'}}>
        <div style={{position: 'absolute', left: 1.5, top: 1.5, width: 14, height: 6, borderRadius: 1.5, background: 'rgba(255,255,255,0.9)'}} />
      </div>
      <span style={{fontFamily: UI, fontSize: 13, color: '#FFFFFF'}}>{`${day.weekday} ${day.month} ${day.day} 9:41`}</span>
    </div>
  </div>
);
