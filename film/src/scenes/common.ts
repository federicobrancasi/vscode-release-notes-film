import {ARRIVE} from '../beats';
import {clamp} from '../motion';
import type {Group, Session} from '../ui/AgentsWindow';
import type {Params} from './types';

/** Frames since the window appeared when the lens is on the block: a scene acts its change out from here. */
export const A = ARRIVE;
export const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
/** A click's squeeze, around frame `at` + 3. */
export const press = (f: number, at: number) => clamp(1 - Math.abs(f - at - 3) / 4);
/** A spinner's angle. */
export const spin = (f: number) => (f * 9) % 360;

/** A string param (`a.b` for a nested one), or the fallback. */
export const str = (p: Params, key: string, fallback = ''): string => {
  const v = key.split('.').reduce<unknown>((o, k) => (o && typeof o === 'object' ? (o as Record<string, unknown>)[k] : undefined), p);
  return typeof v === 'string' ? v : typeof v === 'number' ? String(v) : fallback;
};
export const num = (p: Params, key: string, fallback: number): number => {
  const v = p[key];
  return typeof v === 'number' && Number.isFinite(v) ? v : fallback;
};
export const bool = (p: Params, key: string, fallback: boolean): boolean => (typeof p[key] === 'boolean' ? (p[key] as boolean) : fallback);
/** A list param of objects (or of strings, as {label}). */
export const list = <T extends Record<string, unknown>>(p: Params, key: string): T[] => {
  const v = p[key];
  if (!Array.isArray(v)) return [];
  return v.map((x) => (typeof x === 'string' ? ({label: x} as unknown as T) : (x as T)));
};
export const obj = (p: Params, key: string): Params => {
  const v = p[key];
  return v && typeof v === 'object' && !Array.isArray(v) ? (v as Params) : {};
};

/**
 * The Agents window around a change (its `context` param): the project in the title bar, the session groups (the first
 * selected session is the one open), and the open session's prompt and the agent's reply. Example data: invented and
 * generic. A scene passes its own defaults.
 */
export type Context = {project: string; groups: Group[]; prompt: string; reply: string};
export const contextOf = (p: Params, d: Context): Context => {
  const c = obj(p, 'context');
  const groups = Array.isArray(c.groups)
    ? (c.groups as {label?: string; icon?: string; sessions?: Partial<Session>[]}[]).map((g) => ({
        label: g.label ?? 'my-project',
        icon: g.icon ?? 'folder',
        sessions: (g.sessions ?? []).map((s) => ({title: s.title ?? '', time: s.time ?? 'now', icon: s.icon, selected: s.selected, pr: s.pr})),
      }))
    : d.groups;
  return {project: str(c, 'project', d.project), groups, prompt: str(c, 'prompt', d.prompt), reply: str(c, 'reply', d.reply)};
};
/** The title of the open session: the first selected one. */
export const openSession = (c: Context) => c.groups.flatMap((g) => g.sessions).find((s) => s.selected)?.title ?? c.groups[0]?.sessions[0]?.title ?? 'New Session';
