import React from 'react';
import {Composition, Folder} from 'remotion';
import {FPS, HEIGHT, WIDTH} from './beats';
import {Film} from './Film';
import {Gallery, GALLERY_TOTAL, OneScene, SCENE_FRAMES} from './Gallery';
import {TL} from './timeline';

// Film: the day's film, narrated (voice: false gives the music cut). Library: the scene library's reel (Scenes), and one
// scene with the params given (Scene: --props='{"name":"dialog","params":{…}}'), to try a day's scene before the film.
export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Film" component={Film} defaultProps={{voice: true}} durationInFrames={TL.TOTAL} fps={FPS} width={WIDTH} height={HEIGHT} />
    <Folder name="Library">
      <Composition id="Scenes" component={Gallery} durationInFrames={GALLERY_TOTAL} fps={FPS} width={WIDTH} height={HEIGHT} />
      <Composition id="Scene" component={OneScene} defaultProps={{name: 'button-swap', params: null}} durationInFrames={SCENE_FRAMES} fps={FPS} width={WIDTH} height={HEIGHT} />
    </Folder>
  </>
);
