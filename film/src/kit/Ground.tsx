import React from 'react';
import {AbsoluteFill} from 'remotion';
import {THEME} from '../design';

/** The ground every shot stands on: a soft radial light. */
export const Ground: React.FC<{children?: React.ReactNode}> = ({children}) => <AbsoluteFill style={{background: THEME.ground}}>{children}</AbsoluteFill>;

/** The merge icon of Fluent UI System Icons (MIT, Microsoft Corporation), on its 20 px grid. */
const MERGE = 'M5 2.5a.5.5 0 0 0-1 0 7.45 7.45 0 0 0 4.78 7 7.45 7.45 0 0 0-4.78 7 .5.5 0 0 0 1 0c0-3.62 2.88-6.5 6.5-6.5h.8l-1.15 1.15a.5.5 0 0 0 .7.7l2-2a.5.5 0 0 0 0-.7l-2-2a.5.5 0 0 0-.7.7L12.29 9h-.79A6.46 6.46 0 0 1 5 2.5M8.5 4a.5.5 0 0 0 0 1H15c.52 0 1 .48 1 1v7c0 .52-.48 1-1 1H8.5a.5.5 0 0 0 0 1H15c1.08 0 2-.92 2-2V6c0-1.08-.92-2-2-2z';
export const MergeIcon: React.FC<{size: number; color: string}> = ({size, color}) => (
  <svg width={size} height={size} viewBox="0 0 20 20" style={{display: 'block', flex: 'none'}}>
    <path d={MERGE} fill={color} />
  </svg>
);
