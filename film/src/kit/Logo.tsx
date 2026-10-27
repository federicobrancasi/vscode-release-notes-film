import React from 'react';
import {Img, staticFile} from 'remotion';

// The VS Code icon: the official "stable" file from code.visualstudio.com/brand (public/brand/vscode.svg), drawn whole.
// Per the brand guidelines it is never redrawn, recoloured, stretched or given a background of its own: the film moves
// it, scales it and puts light behind it, and leaves a clear space of at least a quarter of its size around it.

export const VSCODE_ICON = 'brand/vscode.svg';

export const Icon: React.FC<{size: number; style?: React.CSSProperties}> = ({size, style}) => (
  <Img src={staticFile(VSCODE_ICON)} style={{width: size, height: size, display: 'block', ...style}} />
);

/** A soft blue light behind the icon (never on it), with a ring of light leaving it once when it lands. */
export const IconGlow: React.FC<{size: number; p: number; pulse?: number; color?: string}> = ({size, p, pulse = 0, color = '#1F9CF0'}) => (
  <>
    <div
      style={{
        position: 'absolute',
        left: -size * 0.9,
        top: -size * 0.9,
        width: size * 2.8,
        height: size * 2.8,
        borderRadius: '50%',
        background: `radial-gradient(closest-side, ${color}66, ${color}22 55%, transparent 100%)`,
        opacity: p,
        transform: `scale(${0.7 + 0.3 * p + 0.12 * pulse})`,
        pointerEvents: 'none',
      }}
    />
    {pulse > 0 && pulse < 1 ? (
      <div
        style={{
          position: 'absolute',
          left: size / 2 - size * (0.6 + 0.9 * pulse),
          top: size / 2 - size * (0.6 + 0.9 * pulse),
          width: size * 2 * (0.6 + 0.9 * pulse),
          height: size * 2 * (0.6 + 0.9 * pulse),
          borderRadius: '50%',
          border: `2px solid ${color}`,
          opacity: (1 - pulse) * 0.7,
          pointerEvents: 'none',
        }}
      />
    ) : null}
  </>
);
