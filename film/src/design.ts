import {loadFont} from '@remotion/fonts';
import {continueRender, delayRender, staticFile} from 'remotion';

// Type: Mona Sans with Monaspace Neon for numbers and labels (GitHub, OFL). The redrawn VS Code UI uses the Mac's system
// face and Menlo, as the real app does; on Linux it falls back to Inter and Cascadia Code. A face that fails to load
// falls back down its stack.
type Face = {family: string; url: string; weight: string; format: 'woff2' | 'truetype'};
const FACES: Face[] = [
  {family: 'Cascadia Code', url: 'fonts/CascadiaCode-Variable.woff2', weight: '200 700', format: 'woff2'},
  // VS Code's own icon font (@vscode/codicons, CC BY 4.0): the redrawn UI's icons (src/ui/kit.tsx Codicon).
  {family: 'codicon', url: 'fonts/codicon.ttf', weight: '400', format: 'truetype'},
  {family: 'Inter', url: 'fonts/Inter-Variable.woff2', weight: '100 900', format: 'woff2'},
  {family: 'JetBrains Mono', url: 'fonts/JetBrainsMono-Variable.woff2', weight: '100 800', format: 'woff2'},
  {family: 'Mona Sans', url: 'fonts/MonaSans-Variable.woff2', weight: '200 900', format: 'woff2'},
  {family: 'Monaspace Neon', url: 'fonts/MonaspaceNeon-Variable.woff2', weight: '200 800', format: 'woff2'},
];

const handle = delayRender('Loading fonts');
Promise.allSettled(FACES.map((f) => loadFont({family: f.family, url: staticFile(f.url), weight: f.weight, format: f.format, display: 'block'})))
  .then((results) => {
    results.forEach((r, i) => r.status === 'rejected' && console.warn(`font ${FACES[i].family} ${FACES[i].weight} missing: ${FACES[i].url}`));
    continueRender(handle);
  })
  .catch(() => continueRender(handle));

export const SANS = '"Mona Sans", "Inter", system-ui, sans-serif';
export const MONO = '"Monaspace Neon", "JetBrains Mono", ui-monospace, monospace';
/** The rebuilt VS Code UI uses the Mac's system face, as the real app does (the recordings: ".SF NS" and Menlo). */
export const UI = '-apple-system, BlinkMacSystemFont, "Inter", system-ui, sans-serif';
export const UI_MONO = 'Menlo, "Cascadia Code", ui-monospace, monospace';

/** The film's colours, on its dark ground. */
export const THEME = {
  /** The ground: a soft radial light, never flat. */
  ground: 'radial-gradient(130% 95% at 50% 36%, #1A1D24 0%, #101217 52%, #07080B 100%)',
  ink: '#F3F4F6',
  body: '#A9ADB6',
  muted: '#767A84',
  card: '#16181D',
  blue: '#3A96DD',
  purple: '#A98BE3',
  /** A small card floating over the ground (the stream's cards). */
  floatSmall: '0 0 0 1px rgba(255,255,255,0.08), 0 8px 24px -8px rgba(0,0,0,0.6)',
} as const;
export type Theme = typeof THEME;

/** The light blue of the icon's right bar: the logo dives into it, and the stream opens out of it. */
export const BLUE = '#1F9CF0';
/** A change's title panel: the product's blues, lit from the top right. */
export const PANEL_BG = 'radial-gradient(120% 120% at 78% 28%, #2AA1F5 0%, #0B6DC4 36%, #083B78 70%, #061B3A 100%)';
