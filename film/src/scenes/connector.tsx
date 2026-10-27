import React from 'react';
import {clamp} from '../motion';
import {AW, ClickRing, Codicon, Cursor, cursorAt, T} from '../ui/kit';
import {MODAL} from '../ui/Overlays';
import {ExplorerTree, Workbench} from '../ui/Workbench';
import {A, press, str} from './common';
import type {SceneMake} from './types';

// A Copilot connector's page in Chat: Open Customizations > Browse (EmbeddedMarketplaceDetail), a modal over the main
// window: Connect is clicked on its word and turns into the disabled Connecting... with Cancel beside it (the page waits
// for the browser's authorization); on its word Cancel is clicked, and Connect is back. Measured on a capture of the
// page in VS Code 1.144: the modal 1024 × 548 at (128, 86), its sections at the left (Browse first), the page a panel
// from x 329 to 1143 under the header; the connector's icon, name and publisher, its button at the right (64 × 24, at
// x 1037), its description, and Details (Type, Publisher, Source; rows of 24 px). The icon is an original tile.
//   params: name, publisher, description, icon (a codicon for its tile), color (the tile's), type, source, connecting
//           (the busy button's label), cancel (the new button's label)
//   events: connect (Connect is clicked: Connecting... and Cancel), cancel (Cancel is clicked: Connect is back)

const SECTIONS: [string, string?][] = [['Browse'], ['Plugins'], ['MCP Servers'], ['Skills', '11'], ['Instructions'], ['Agents', '5'], ['Hooks'], ['Prompts', '7']];
const PANEL = {x: 329, y: 127, w: 814, h: 498};
const ROW = {y: 184};
const BUTTON = {right: 1101, y: 172, h: 24};
const BLUE = '#457ea1';
/** A button's width for its label (13 px, 12 px padding each side). */
const widthOf = (label: string) => Math.round(24 + label.length * 6.9);

export const connector: SceneMake = (params, {ev}) => {
  const name = str(params, 'name', 'Release Notes Feed');
  const publisher = str(params, 'publisher', 'GitHub Copilot');
  const description = str(params, 'description', '');
  const icon = str(params, 'icon', 'plug');
  const color = str(params, 'color', '#7a5af8');
  const type = str(params, 'type', 'MCP server');
  const source = str(params, 'source', 'Copilot Connectors');
  const connecting = str(params, 'connecting', 'Connecting...');
  const cancelLabel = str(params, 'cancel', 'Cancel');
  const connect = ev('connect', A + 10, A);
  const cancel = ev('cancel', connect + 70, connect + 30);
  const connectW = widthOf('Connect');
  const cancelW = widthOf(cancelLabel);
  const busyW = widthOf(connecting);
  const connectBox = {x: BUTTON.right - connectW, y: BUTTON.y};
  const cancelBox = {x: BUTTON.right - cancelW, y: BUTTON.y};
  const busyBox = {x: cancelBox.x - 6 - busyW, y: BUTTON.y};
  const Component: React.FC<{f: number}> = ({f}) => {
    const busy = f >= connect + 4 && f < cancel + 4;
    // After each click the pointer drifts off below the header, clear of the lens.
    const away: [number, number] = [BUTTON.right + 30, BUTTON.y + 96];
    const [cx, cy] = cursorAt(f, [
      [connect - 30, 900, 420],
      [connect - 2, connectBox.x + connectW / 2 + 6, BUTTON.y + 16],
      [connect + 10, connectBox.x + connectW / 2 + 6, BUTTON.y + 16],
      [connect + 34, ...away],
      [cancel - 24, ...away],
      [cancel - 2, cancelBox.x + cancelW / 2 + 6, BUTTON.y + 16],
      [cancel + 10, cancelBox.x + cancelW / 2 + 6, BUTTON.y + 16],
      [cancel + 34, ...away],
    ]);
    const down = press(f, connect) + press(f, cancel);
    const onCancel = busy ? clamp((f - (cancel - 6)) / 4) : 0;
    return (
      <Workbench sidebar={{title: 'Explorer', content: <ExplorerTree project="my-project" files={['src', 'package.json', 'README.md']} />}} tabs={[]} editor={null}>
        <div style={{position: 'absolute', left: 0, top: 0, width: 1280, height: 720, background: 'rgba(0,0,0,0.5)'}} />
        <div style={{position: 'absolute', left: MODAL.x, top: MODAL.y, width: MODAL.w, height: MODAL.h, boxSizing: 'border-box', borderRadius: 8, border: '1px solid #262729', background: '#131416', overflow: 'hidden', boxShadow: '0 12px 40px rgba(0,0,0,0.45)'}}>
          <div style={{position: 'absolute', left: 10, top: 12, height: 18, display: 'flex', alignItems: 'center', gap: 4}}>
            <T weight={600} color={AW.strong}>
              Agent Customizations
            </T>
            <T color={AW.muted}>(Local · my-project)</T>
          </div>
          <div style={{position: 'absolute', right: 8, top: 10, display: 'flex', gap: 4}}>
            {['screen-full', 'close'].map((a) => (
              <div key={a} style={{width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <Codicon name={a} size={16} color={AW.muted} />
              </div>
            ))}
          </div>
          {SECTIONS.map(([label, count], i) => (
            <div key={label} style={{position: 'absolute', left: 4, top: 43 + i * 26, width: 192, height: 26, boxSizing: 'border-box', padding: '0 9px', display: 'flex', alignItems: 'center'}}>
              <T color={AW.fg}>{label}</T>
              {count ? (
                <T size={12} color={AW.muted} style={{marginLeft: 'auto'}}>
                  {count}
                </T>
              ) : null}
            </div>
          ))}
        </div>
        <div style={{position: 'absolute', left: PANEL.x, top: PANEL.y, width: PANEL.w, height: PANEL.h, boxSizing: 'border-box', borderRadius: 6, border: '1px solid #27282a', background: '#1a1b1d'}} />
        <Codicon name="arrow-left" size={16} color={AW.muted} style={{position: 'absolute', left: 374, top: ROW.y - 8}} />
        <div style={{position: 'absolute', left: 420, top: ROW.y - 11, width: 22, height: 22, borderRadius: 5, background: `linear-gradient(150deg, ${color}, #1b1d3a)`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <Codicon name={icon} size={14} color="#ffffff" />
        </div>
        <div style={{position: 'absolute', left: 460, top: ROW.y - 12, height: 24, display: 'flex', alignItems: 'baseline', gap: 8}}>
          <T size={18} weight={600} color={AW.strong}>
            {name}
          </T>
          <T color={AW.link}>{publisher}</T>
        </div>
        {busy ? (
          <>
            <div style={{position: 'absolute', left: busyBox.x, top: busyBox.y, width: busyW, height: BUTTON.h, borderRadius: 4, background: BLUE, opacity: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <T color="#ffffff">{connecting}</T>
            </div>
            <div style={{position: 'absolute', left: cancelBox.x, top: cancelBox.y, width: cancelW, height: BUTTON.h, boxSizing: 'border-box', borderRadius: 4, border: '1px solid #454545', background: onCancel > 0.5 ? '#3a3d41' : '#313235', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${1 - 0.06 * press(f, cancel)})`}}>
              <T color={AW.strong}>{cancelLabel}</T>
            </div>
          </>
        ) : (
          <div style={{position: 'absolute', left: connectBox.x, top: connectBox.y, width: connectW, height: BUTTON.h, borderRadius: 4, background: BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${1 - 0.06 * press(f, connect)})`}}>
            <T color="#ffffff">Connect</T>
          </div>
        )}
        {description ? (
          <div style={{position: 'absolute', left: 402, top: 224}}>
            <T color={AW.fg}>{description}</T>
          </div>
        ) : null}
        <div style={{position: 'absolute', left: 402, top: 266}}>
          <T weight={600} color={AW.strong}>
            Details
          </T>
        </div>
        <div style={{position: 'absolute', left: 402, top: 307, width: 700, height: 74, boxSizing: 'border-box', borderRadius: 4, border: '1px solid #28292b'}}>
          {[
            ['Type', type, false],
            ['Publisher', publisher, true],
            ['Source', source, true],
          ].map(([label, value, link], i) => (
            <div key={String(label)} style={{position: 'absolute', left: 0, top: i * 24, width: 698, height: 24, borderTop: i ? '1px solid #28292b' : undefined, boxSizing: 'border-box', display: 'flex', alignItems: 'center'}}>
              <T size={12} color={AW.muted} style={{position: 'absolute', left: 9}}>
                {String(label)}
              </T>
              <T size={12} color={link ? AW.link : AW.fg} style={{position: 'absolute', left: 153}}>
                {String(value)}
              </T>
            </div>
          ))}
        </div>
        {f >= connect - 30 ? <Cursor x={cx} y={cy} press={down} opacity={clamp((f - (connect - 30)) / 6)} /> : null}
        <ClickRing x={cx} y={cy} f={f} at={connect + 2} />
        <ClickRing x={cx} y={cy} f={f} at={cancel + 2} />
      </Workbench>
    );
  };
  return {
    Component,
    // The page's header whole (the back arrow, the connector, its buttons) and its description: wider than the lens
    // takes at 1.4×, so it magnifies less, by hand.
    loupe: {block: [366, 160, 746, 92], mag: 1.24},
    cues: [{at: connect, sfx: 'click', volume: 0.22}, {at: cancel, sfx: 'click', volume: 0.22}],
    chrome: 'window',
  };
};
