// The film's clock: 60 fps at 120 BPM, so a beat is 30 frames and every cut lands on the music. And the beats of one
// change, in frames: frames "into a change" count from its scene's start; frames "since the window appeared" (fv) count
// from MORPH_AT, when the title panel starts turning into the window. scripts/timeline.mjs has VO_AT too.

export const FPS = 60;
export const BPM = 120;
export const WIDTH = 1920;
export const HEIGHT = 1080;

/** The next change's title panel wipes in over the last one in WIPE frames; its number rolls on at TEXT_IN. */
export const WIPE = 14;
export const TEXT_IN = WIPE - 8;
/** The title holds, then the panel becomes the window: it starts at MORPH_AT and has landed at LAND. */
export const MORPH_AT = 34;
export const MORPH = 20;
export const LAND = MORPH_AT + MORPH;
/** The change's line starts here, as the window lands. */
export const VO_AT = 50;
/** The lens's way in: from LAND for SHOW frames. */
export const SHOW = 34;
/** Frames since the window appeared when the lens is on what changed: the drawn scenes act their change out from here. */
export const ARRIVE = LAND + SHOW - MORPH_AT;
