import React from 'react';
import {UI_MONO} from '../design';
import {AW, Codicon} from './kit';

// An editor's text: code with Dark Modern's colours (a small tokenizer for TypeScript, JavaScript, JSON, Python and
// Markdown), line numbers, the current line, the cursor, breakpoints, a paused line and inline values, and text being
// inserted (highlighted as it lands).

export const CODE = {font: 12, lineH: 18, gutter: 64, char: 7.22};
const COLORS = {
  keyword: '#569cd6',
  control: '#c586c0',
  string: '#ce9178',
  number: '#b5cea8',
  comment: '#6a9955',
  fn: '#dcdcaa',
  type: '#4ec9b0',
  variable: '#9cdcfe',
  plain: '#cccccc',
  heading: '#569cd6',
};
const KEYWORDS = new Set(['const', 'let', 'var', 'function', 'class', 'interface', 'type', 'new', 'true', 'false', 'null', 'undefined', 'this', 'async', 'def', 'None', 'True', 'False', 'in', 'of', 'extends', 'enum']);
const CONTROL = new Set(['import', 'from', 'export', 'return', 'if', 'else', 'for', 'while', 'await', 'try', 'catch', 'throw', 'default', 'switch', 'case', 'break', 'yield', 'as']);

type Token = {text: string; color: string};
/** Splits a line of code into coloured tokens. */
export const tokenize = (line: string, lang = 'ts'): Token[] => {
  if (lang === 'md') {
    if (/^#+\s/.test(line)) return [{text: line, color: COLORS.heading}];
    return [{text: line, color: COLORS.plain}];
  }
  const out: Token[] = [];
  const re = /(\/\/.*$|#.*$)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_$][\w$]*)|(\s+)|(.)/g;
  let m: RegExpExecArray | null;
  const words: string[] = [];
  while ((m = re.exec(line))) {
    const [all, comment, str, num, word] = m;
    if (comment && (lang !== 'ts' || all.startsWith('//')) && !(lang === 'json')) out.push({text: all, color: COLORS.comment});
    else if (str) out.push({text: all, color: lang === 'json' && /^\s*:/.test(line.slice(re.lastIndex)) ? COLORS.variable : COLORS.string});
    else if (num) out.push({text: all, color: COLORS.number});
    else if (word) {
      const next = line.slice(re.lastIndex);
      const color = CONTROL.has(word) ? COLORS.control : KEYWORDS.has(word) ? COLORS.keyword : /^\s*\(/.test(next) ? COLORS.fn : /^[A-Z]/.test(word) ? COLORS.type : words.at(-1) === '.' ? COLORS.variable : COLORS.variable;
      out.push({text: all, color});
    } else out.push({text: all, color: COLORS.plain});
    words.push(all.trim() || words.at(-1) || '');
  }
  return out;
};

export type InlineValue = {line: number; text: string};
/**
 * Code at (x, y): `lines` from line number `first`; `current` the cursor's line (highlighted), `cursor` its column (a
 * blinking bar when `blink`); `breakpoints` (line numbers with a red dot), `paused` (the line the debugger stopped on);
 * `values` (inline values after a line); `inserted` (lines that just appeared, `p` 0–1 fading their highlight in).
 */
export const Code: React.FC<{
  x: number;
  y: number;
  w: number;
  lines: string[];
  lang?: string;
  first?: number;
  current?: number;
  cursor?: {line: number; col: number; on: boolean};
  breakpoints?: number[];
  paused?: number;
  values?: InlineValue[];
  inserted?: {from: number; to: number; p: number};
}> = ({x, y, w, lines, lang = 'ts', first = 1, current, cursor, breakpoints = [], paused, values = [], inserted}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: lines.length * CODE.lineH}}>
    {lines.map((line, i) => {
      const n = first + i;
      const top = i * CODE.lineH;
      const isInserted = inserted && n >= inserted.from && n <= inserted.to;
      return (
        <React.Fragment key={n}>
          {n === paused ? <div style={{position: 'absolute', left: 0, top, width: w, height: CODE.lineH, background: 'rgba(255, 204, 0, 0.18)', borderTop: '1px solid rgba(255,204,0,0.35)', borderBottom: '1px solid rgba(255,204,0,0.35)', boxSizing: 'border-box'}} /> : n === current ? <div style={{position: 'absolute', left: 0, top, width: w, height: CODE.lineH, boxSizing: 'border-box', border: '1px solid #282828'}} /> : null}
          {isInserted ? <div style={{position: 'absolute', left: CODE.gutter, top, width: w - CODE.gutter, height: CODE.lineH, background: `rgba(46, 160, 67, ${0.22 * inserted.p})`}} /> : null}
          {breakpoints.includes(n) ? <div style={{position: 'absolute', left: 8, top: top + 4, width: 10, height: 10, borderRadius: 5, background: '#e51400'}} /> : null}
          {n === paused ? (
            <div style={{position: 'absolute', left: 6, top: top + 1}}>
              <Codicon name="debug-stackframe" size={15} color="#ffcc00" />
            </div>
          ) : null}
          <div style={{position: 'absolute', left: 20, top, width: 32, textAlign: 'right', fontFamily: UI_MONO, fontSize: CODE.font, lineHeight: `${CODE.lineH}px`, color: n === current || n === paused ? AW.strong : '#6e7681'}}>{n}</div>
          <div style={{position: 'absolute', left: CODE.gutter, top, whiteSpace: 'pre', fontFamily: UI_MONO, fontSize: CODE.font, lineHeight: `${CODE.lineH}px`, opacity: isInserted ? Math.min(1, inserted.p * 2) : 1}}>
            {tokenize(line, lang).map((t, k) => (
              <span key={k} style={{color: t.color}}>
                {t.text}
              </span>
            ))}
            {values
              .filter((v) => v.line === n)
              .map((v) => (
                <span key={v.text} style={{marginLeft: 14, padding: '0 4px', borderRadius: 3, background: 'rgba(255, 200, 0, 0.12)', color: '#c5c5c5', fontStyle: 'italic'}}>
                  {v.text}
                </span>
              ))}
          </div>
          {cursor && cursor.line === n && cursor.on ? <div style={{position: 'absolute', left: CODE.gutter + cursor.col * CODE.char, top: top + 1, width: 2, height: CODE.lineH - 2, background: '#aeafad'}} /> : null}
        </React.Fragment>
      );
    })}
  </div>
);
