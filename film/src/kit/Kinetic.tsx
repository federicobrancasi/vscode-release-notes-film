import React from 'react';
import {accel, clamp, glide, settle} from '../motion';

// Kinetic type. Every word rises out of its own mask with the settle law (a fast snap, a soft landing), staggered, and
// leaves accelerating upward. An accent phrase (a run of words in the text) takes the accent colour.

type WordsProps = {
  text: string;
  frame: number;
  at: number;
  size: number;
  color: string;
  font: string;
  weight?: number;
  accent?: {phrase: string; color: string} | null;
  stagger?: number;
  exitAt?: number;
  lineHeight?: number;
  tracking?: string;
  maxWidth?: number;
  align?: 'left' | 'center';
  style?: React.CSSProperties;
};

/** The indices of the words that make up `phrase` in `words` (case-insensitive, punctuation-tolerant). */
const phraseRange = (words: string[], phrase: string | undefined): [number, number] | null => {
  if (!phrase) return null;
  const norm = (w: string) => w.toLowerCase().replace(/[^\p{L}\p{N}#/<>⌘.-]/gu, '');
  const want = phrase.split(/\s+/).map(norm).filter(Boolean);
  for (let i = 0; i + want.length <= words.length; i++) {
    if (want.every((w, k) => norm(words[i + k]) === w)) return [i, i + want.length - 1];
  }
  return null;
};

export const Words: React.FC<WordsProps> = ({text, frame, at, size, color, font, weight = 600, accent, stagger = 3, exitAt, lineHeight = 1.06, tracking = '-0.03em', maxWidth, align = 'left', style}) => {
  const words = text.split(/\s+/).filter(Boolean);
  const range = phraseRange(words, accent?.phrase);
  return (
    <div style={{fontFamily: font, fontSize: size, fontWeight: weight, lineHeight, letterSpacing: tracking, color, maxWidth, textAlign: align, ...style}}>
      {words.map((w, i) => {
        const p = settle(frame, at + i * stagger);
        const out = exitAt === undefined ? 0 : Math.min(1.5, accel(frame, exitAt + i, 0.05, 1.5));
        const on = range && i >= range[0] && i <= range[1];
        return (
          <span key={i} style={{display: 'inline-block', overflow: 'hidden', verticalAlign: 'top', paddingBottom: size * 0.16, marginBottom: -size * 0.16, paddingRight: size * 0.02}}>
            <span style={{display: 'inline-block', transform: `translateY(${((1 - p) * 1.15 + out) * 100}%)`, color: on ? accent!.color : color, opacity: p > 0 ? 1 : 0}}>
              {w}
              {i < words.length - 1 ? '\u00a0' : ''}
            </span>
          </span>
        );
      })}
    </div>
  );
};

/** A label that rolls from `prev` to `next` (a number, a short word), one line high. */
export const Roll: React.FC<{prev: string; next: string; frame: number; at: number; len?: number; size: number; style?: React.CSSProperties}> = ({prev, next, frame, at, len = 22, size, style}) => {
  const p = glide(frame, at, len);
  const h = Math.round(size * 1.1);
  return (
    <div style={{height: h, overflow: 'hidden', fontSize: size, lineHeight: `${h}px`, ...style}}>
      <div style={{transform: `translateY(${-p * h}px)`}}>
        <div style={{height: h, whiteSpace: 'nowrap'}}>{prev}</div>
        <div style={{height: h, whiteSpace: 'nowrap'}}>{next}</div>
      </div>
    </div>
  );
};

/** An integer counting from 0 to `to` between frames `at` and `at + len`, easing out. */
export const count = (frame: number, at: number, len: number, to: number) => Math.round(to * (1 - Math.pow(1 - clamp((frame - at) / len), 3)));

/** 0 → 1 → 0 over [a, b]: a smooth bump (for flashes and pulses). */
export const bump = (frame: number, a: number, b: number) => {
  const t = clamp((frame - a) / Math.max(1, b - a));
  return Math.sin(Math.PI * t);
};

/** Ease in-out (cubic) on [a, a + len]. */
export const inOut = (frame: number, a: number, len: number) => {
  const t = clamp((frame - a) / len);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

/** Ease in-out (exponential) on [a, a + len]: a fast middle, for flights and whips. */
export const expo = (frame: number, a: number, len: number) => {
  const t = clamp((frame - a) / len);
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  return t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2;
};
