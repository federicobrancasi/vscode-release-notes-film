import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {hash} from '../motion';

// The film's finish, over every scene: a soft vignette, a lifted black point, and a fine grain (six seeded 512 px tiles, a
// new one every other frame, so every render of the film has the same grain). No letterbox: the frame stays full.

const GRAIN = 512;

export const Finish: React.FC = () => {
  const f = useCurrentFrame();
  const tile = Math.floor(f / 2);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 78% 78% at 50% 50%, rgba(0,0,0,0) 58%, rgba(0,0,0,0.34) 100%)'}} />
      {/* The grade's black point: nothing in the picture goes below a very dark navy. */}
      <AbsoluteFill style={{background: 'rgb(13, 15, 21)', mixBlendMode: 'lighten'}} />
      <AbsoluteFill style={{mixBlendMode: 'overlay', opacity: 0.11, overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: -Math.round(hash(tile, 3) * GRAIN), top: -Math.round(hash(tile, 7) * GRAIN), width: GRAIN * 5, height: GRAIN * 3, display: 'flex', flexWrap: 'wrap'}}>
          {Array.from({length: 15}, (_, i) => (
            <Img key={i} src={staticFile(`fx/grain-${tile % 6}.png`)} style={{width: GRAIN, height: GRAIN, display: 'block'}} />
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
