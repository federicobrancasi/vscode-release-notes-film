import React from 'react';
import {UI, UI_MONO} from '../design';
import {CODICONS} from './codiconMap';

// The redrawn VS Code UI: drawn at the recordings' logical size (1280×720, the size the recorder's window has) in
// the colours and layout of VS Code Insiders 1.144, measured on the recordings (screen dumps and sampled pixels), with
// the product's own icons (codicons) and the Mac's system face, so drawn changes and recorded ones look the same.

/** The 1.144 dark theme, sampled from the recordings. AW: the Agents window; MW: the main window. */
export const AW = {
  chrome: '#121315',
  panel: '#191a1c',
  panelBorder: '#2a2b2d',
  gap: '#111214',
  selected: '#2c2d2f',
  hover: '#242527',
  bubble: '#212224',
  input: '#202123',
  inputBorder: '#34363a',
  fg: '#cccccc',
  strong: '#e6e6e6',
  muted: '#9d9d9d',
  faint: '#6b6c70',
  link: '#4daafc',
  focus: '#0078d4',
  kbd: '#2b2c2e',
  menu: '#202123',
  menuBorder: '#3a3b3e',
  menuSelected: '#04395e',
  tooltip: '#202020',
  tooltipBorder: '#454545',
  green: '#3fb950',
};
export const MW = {chrome: '#191a1c', editor: '#121315', tabs: '#202123', border: '#2a2b2d', lineHighlight: '#242527', button: '#0078d4'};

/** A codicon by name (@vscode/codicons), in the font design.ts loads. */
export const Codicon: React.FC<{name: string; size?: number; color?: string; style?: React.CSSProperties}> = ({name, size = 16, color, style}) => {
  const code = CODICONS[name];
  if (code === undefined) throw new Error(`no codicon "${name}"`);
  return (
    <span
      style={{
        fontFamily: 'codicon',
        fontSize: size,
        lineHeight: `${size}px`,
        width: size,
        height: size,
        display: 'inline-block',
        textAlign: 'center',
        color: color ?? 'inherit',
        flex: 'none',
        fontStyle: 'normal',
        fontWeight: 'normal',
        ...style,
      }}
    >
      {String.fromCodePoint(code)}
    </span>
  );
};

/** UI text: the Mac's system face at VS Code's 13 px. */
export const T: React.FC<{size?: number; color?: string; weight?: number; mono?: boolean; style?: React.CSSProperties; children: React.ReactNode}> = ({size = 13, color = AW.fg, weight = 400, mono = false, style, children}) => (
  <span style={{fontFamily: mono ? UI_MONO : UI, fontSize: size, lineHeight: `${Math.round(size * 1.38)}px`, color, fontWeight: weight, whiteSpace: 'nowrap', ...style}}>{children}</span>
);

/** An icon button the size VS Code's toolbars use (22×22, a 16 px icon), at a top-left corner. */
export const IconBtn: React.FC<{x: number; y: number; name: string; color?: string; bg?: string; size?: number}> = ({x, y, name, color = AW.muted, bg, size = 16}) => (
  <div style={{position: 'absolute', left: x, top: y, width: 22, height: 22, borderRadius: 5, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
    <Codicon name={name} size={size} color={color} />
  </div>
);

/** A keybinding chip (⌘N). */
export const Kbd: React.FC<{keys: string[]}> = ({keys}) => (
  <span style={{display: 'inline-flex', gap: 2}}>
    {keys.map((k) => (
      <span key={k} style={{minWidth: 14, height: 16, padding: '0 3px', boxSizing: 'border-box', borderRadius: 3, background: AW.kbd, fontFamily: UI, fontSize: 11, lineHeight: '16px', color: AW.muted, textAlign: 'center'}}>
        {k}
      </span>
    ))}
  </span>
);

/** A hover tooltip (Dark theme's editorHoverWidget), its top-left corner at x, y. */
export const Tooltip: React.FC<{x: number; y: number; text: string; p: number}> = ({x, y, text, p}) =>
  p <= 0 ? null : (
    <div style={{position: 'absolute', left: x, top: y, padding: '4px 8px', borderRadius: 4, background: AW.tooltip, border: `1px solid ${AW.tooltipBorder}`, boxShadow: '0 4px 14px rgba(0,0,0,0.45)', opacity: Math.min(1, p * 1.6)}}>
      <T>{text}</T>
    </div>
  );

/** The macOS window buttons, for a window the film draws around a recording or a drawn window. */
export const TrafficLights: React.FC<{x?: number; y?: number; size?: number}> = ({x = 14, y = 15, size = 12}) => (
  <div style={{position: 'absolute', left: x, top: y, display: 'flex', gap: size * 0.66}}>
    {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => (
      <div key={c} style={{width: size, height: size, borderRadius: size / 2, background: c, boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.25)'}} />
    ))}
  </div>
);

/** A pointer arrow, its tip at x, y; `press` 0–1 squeezes it as it clicks. */
export const Cursor: React.FC<{x: number; y: number; press?: number; opacity?: number}> = ({x, y, press = 0, opacity = 1}) => (
  <svg width={22} height={30} viewBox="0 0 22 30" style={{position: 'absolute', left: x - 2, top: y - 1, opacity, transform: `scale(${1 - 0.12 * press})`, transformOrigin: '2px 1px', filter: 'drop-shadow(0 1px 1.5px rgba(0,0,0,0.5))'}}>
    <path d="M2 1 L2 23 L7.4 17.8 L11 26.4 L14.6 24.9 L11.1 16.5 L18.6 16.5 Z" fill="#000" stroke="#fff" strokeWidth={1.4} strokeLinejoin="round" />
  </svg>
);

/** A click shown: a ring spreading from the pointer's tip, from the click's frame `at`. */
export const ClickRing: React.FC<{x: number; y: number; f: number; at: number}> = ({x, y, f, at}) => {
  const t = (f - at) / 16;
  if (t < 0 || t > 1) return null;
  const r = 6 + 20 * (1 - Math.pow(1 - t, 2));
  return (
    <div
      style={{
        position: 'absolute',
        left: x - r,
        top: y - r,
        width: 2 * r,
        height: 2 * r,
        borderRadius: r,
        boxSizing: 'border-box',
        border: '2px solid rgba(255,255,255,0.9)',
        boxShadow: '0 0 12px rgba(77,170,252,0.7)',
        opacity: 1 - t,
      }}
    />
  );
};

/** Where a cursor is between keyed points [frame, x, y], gliding between them (ease in-out). */
export const cursorAt = (f: number, keys: [number, number, number][]): [number, number] => {
  if (f <= keys[0][0]) return [keys[0][1], keys[0][2]];
  for (let i = 1; i < keys.length; i++) {
    const [f1, x1, y1] = keys[i];
    const [f0, x0, y0] = keys[i - 1];
    if (f < f1) {
      const t = (f - f0) / (f1 - f0);
      const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      return [x0 + (x1 - x0) * e, y0 + (y1 - y0) * e];
    }
  }
  const last = keys[keys.length - 1];
  return [last[1], last[2]];
};
