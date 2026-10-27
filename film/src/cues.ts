import {FPS} from './beats';

/** A sound effect at frame `at` of its scene (public/sfx/<sfx>.wav). */
export type Cue = {at: number; sfx: string; volume?: number};

/**
 * When each sound effect crests, in seconds after it starts. Start a sound this much before its event so the crest
 * lands on the frame: `cueOn(eventFrame, 'whoosh')`.
 */
export const SFX_CREST: Record<string, number> = {whoosh: 0.33, charge: 0.68};
export const cueOn = (frame: number, sfx: string, volume?: number): Cue => ({at: frame - Math.round((SFX_CREST[sfx] ?? 0) * FPS), sfx, volume});
