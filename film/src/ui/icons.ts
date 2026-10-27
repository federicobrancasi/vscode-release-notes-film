import {CODICONS} from './codiconMap';

// The engine's scene params name icons from Fluent UI (its icon set); the drawn UI uses VS Code's own codicons. A
// codicon name is used as it is; a Fluent name is mapped to the codicon VS Code shows for the same thing.
const FLUENT: Record<string, string> = {
  laptop: 'vm', desktop: 'vm', checkmark: 'check', checkRegular: 'check', x: 'close', dismiss: 'close', dismissRegular: 'close',
  people: 'organization', team: 'organization', download: 'desktop-download', upload: 'cloud-upload', image: 'file-media', branch: 'source-control',
  compare: 'diff', document: 'symbol-file', documentText: 'file-text', shieldError: 'shield', shieldLock: 'shield', lockFilled: 'lock', repeat: 'sync',
  settings: 'settings-gear', flash: 'flame', timer: 'watch', clock: 'watch', gauge: 'dashboard', chart: 'graph', trend: 'graph-line',
  puzzle: 'extensions', extension: 'extensions', chat: 'comment-discussion', chatMultiple: 'comment-discussion', eyeOff: 'eye-closed',
  stack: 'layers', panel: 'layout-panel', star: 'star-empty', starFilled: 'star-full', target: 'target', toggle: 'settings', keyboard: 'record-keys',
  cursor: 'debug-step-into', cpu: 'chip', box: 'package', wrench: 'tools', hourglass: 'watch', accessibility: 'eye', paint: 'paintcan',
  delete: 'trash', subtract: 'remove', open: 'folder-opened', git: 'git-commit', pr: 'git-pull-request', status: 'pulse', list: 'list-unordered',
  speaker: 'unmute', video: 'device-camera-video', map: 'map', bot: 'robot', brain: 'sparkle', brainCircuit: 'sparkle', thumbUp: 'thumbsup',
  thumbDown: 'thumbsdown', slash: 'symbol-operator', arrowUp: 'arrow-up', arrowDown: 'arrow-down', arrowRight: 'arrow-right', undo: 'discard',
  arrowReset: 'discard', fork: 'repo-forked', merge: 'git-merge', ticket: 'tag', certificate: 'verified', fingerprint: 'key', windows: 'window',
  tasks: 'tasklist', money: 'credit-card', wallet: 'credit-card', gavel: 'law', scales: 'law', graduation: 'mortar-board', leaf: 'symbol-misc',
  earth: 'globe', presenter: 'device-camera-video', notepad: 'note', clipboard: 'clippy', handStop: 'circle-slash', emoji: 'smiley',
  personFeedback: 'feedback', slideText: 'preview', handshake: 'organization', scan: 'search', magicWand: 'sparkle', coin: 'credit-card',
  mailCheck: 'mail-read', warningFilled: 'warning', infoFilled: 'info', circle: 'circle-large', eyeTracking: 'eye', personWalk: 'person',
  bookOpen: 'book', calendarCheck: 'calendar', commentCheck: 'comment', cut: 'screen-cut', cube: 'package', design: 'symbol-color', shapes: 'symbol-misc',
  pen: 'edit', film: 'device-camera-video', videoClip: 'device-camera-video', alert: 'bell', alarm: 'bell', flowchart: 'type-hierarchy',
  routing: 'git-compare', form: 'checklist', qr: 'symbol-misc', organization: 'organization', drawShape: 'symbol-color', glasses: 'eye',
  toolbox: 'tools', moon: 'color-mode', sun: 'color-mode', darkTheme: 'color-mode', prohibited: 'circle-slash', dataBar: 'graph',
  textBullet: 'list-unordered', split: 'split-horizontal', mic: 'mic', send: 'send', rocket: 'rocket', bug: 'bug',
};

/** The codicon for an icon name (a codicon, or one of the engine's Fluent names); `fallback` when neither. */
export const codicon = (name: unknown, fallback = 'circle-large'): string => {
  const n = typeof name === 'string' ? name : '';
  if (n in CODICONS) return n;
  const mapped = FLUENT[n];
  return mapped && mapped in CODICONS ? mapped : fallback;
};
