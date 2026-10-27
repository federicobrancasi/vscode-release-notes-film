import {lerp} from '../motion';

// The window as a plane the camera moves (a pose), in the window's own 1280×720 px.

/**
 * Where the window is: its point (cx, cy) is shown at (fx, fy) on the 1920×1080 frame at scale s, the window turned by
 * rx, ry, rz degrees around that point (with perspective, so a turned window recedes).
 */
export type Pose = {cx: number; cy: number; s: number; fx: number; fy: number; rx: number; ry: number; rz: number};
/** The window filling the frame, flat: the title panel. */
export const FULL_POSE: Pose = {cx: 640, cy: 360, s: 1.5, fx: 960, fy: 540, rx: 0, ry: 0, rz: 0};
export const PERSPECTIVE = 1700;

/** a → b at t: the scale on a log curve (a zoom keeps its speed), the rest linear. */
export const lerpPose = (a: Pose, b: Pose, t: number): Pose => ({
  s: Math.exp(lerp(Math.log(a.s), Math.log(b.s), t)),
  cx: lerp(a.cx, b.cx, t),
  cy: lerp(a.cy, b.cy, t),
  fx: lerp(a.fx, b.fx, t),
  fy: lerp(a.fy, b.fy, t),
  rx: lerp(a.rx, b.rx, t),
  ry: lerp(a.ry, b.ry, t),
  rz: lerp(a.rz, b.rz, t),
});
/** Where a window point lands on the frame for a flat pose (exact when rx = ry = rz = 0). */
export const toScreen = (p: Pose, x: number, y: number): [number, number] => [p.fx + (x - p.cx) * p.s, p.fy + (y - p.cy) * p.s];
