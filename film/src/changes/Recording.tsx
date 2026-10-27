import React from 'react';
import {OffthreadVideo, staticFile} from 'remotion';
import type {RecordingVisual} from '../episode';

/**
 * A recording at the window's 1280×720, playing from second `from`. `f` is frames since the window appeared; `played`
 * is how many of them earlier scenes already played (a video's clock is its scene's).
 */
export const RecordingView: React.FC<{v: RecordingVisual; from: number; f: number; played: number}> = ({v, from, f, played}) => (
  <div style={{position: 'absolute', left: 0, top: 0, width: 1280, height: 720, transformOrigin: '0 0', transform: 'translate(0px, 0px) scale(1)'}}>
    {f >= 0 ? (
      <div style={{position: 'absolute', inset: 0, opacity: 1}}>
        <OffthreadVideo src={staticFile(v.src)} muted trimBefore={Math.max(0, Math.round(from * 60) + played)} style={{width: 1280, height: 720, display: 'block'}} />
      </div>
    ) : null}
  </div>
);
