// The edit: episode/timeline.json, written by scripts/timeline.mjs from the episode and its narration (each change lasts
// until its line ends plus a breath, in whole beats). Every scene is a whole number of beats, so every cut lands on the
// music.
import config from '../episode/timeline.json';

export type Scene = {id: string; name: string; beats: number; from: number; durationInFrames: number};
export type TimelineConfig = {title: string; fps: number; bpm: number; scenes: {id: string; name: string; beats: number}[]; music: {theme: string; drop?: {scene: string; beat: number}; end?: {scene: string; beat: number}}};

/** An edit's scenes in frames, each cut rounded from the running beat count (so cuts never drift off the music). */
export const makeTimeline = (tl: TimelineConfig) => {
  const beat = (60 / tl.bpm) * tl.fps;
  const scenes: Scene[] = tl.scenes.map((s, i) => {
    const before = tl.scenes.slice(0, i).reduce((n, x) => n + x.beats, 0);
    const from = Math.round(before * beat);
    return {...s, from, durationInFrames: Math.round((before + s.beats) * beat) - from};
  });
  const sceneOf = (id: string): Scene => {
    const s = scenes.find((x) => x.id === id);
    if (!s) throw new Error(`the timeline "${tl.title}" has no scene "${id}"`);
    return s;
  };
  return {config: tl, BEAT: beat, SCENES: scenes, TOTAL: scenes.reduce((n, s) => n + s.durationInFrames, 0), sceneOf, THEME_FILE: tl.music.theme};
};
export type Timeline = ReturnType<typeof makeTimeline>;

export const TL = makeTimeline(config as TimelineConfig);
