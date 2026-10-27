import React from 'react';
import {clamp, settle} from '../motion';
import {Code} from '../ui/Editor';
import {AW, Codicon, T} from '../ui/kit';
import {contentTop, editorBox, ExplorerTree, Workbench} from '../ui/Workbench';
import {A, str} from './common';
import type {SceneMake} from './types';

// VS Code for the Web (another platform): an original browser window (its tab, its address bar with the page's
// address) with VS Code in it, connecting on its word: the remote indicator turns to where it's connected.
//   params: url (the address), tab (the page's title), connected (the remote indicator once connected), file,
//           focus ("status": the lens on the remote indicator, default; "address": on the tab and the address bar)
//   events: connect (it connects)

const TOP = 76;
const SCALE = (720 - TOP) / 720;

export const web: SceneMake = (params, {ev}) => {
  const url = str(params, 'url', 'vscode.dev/tunnel/my-machine/home/me/my-project');
  const tab = str(params, 'tab', 'my-project [Tunnel] - Visual Studio Code');
  const connected = str(params, 'connected', 'Tunnel: my-machine');
  const file = str(params, 'file', 'app.ts');
  const connect = ev('connect', A + 20, A);
  const focus = str(params, 'focus', 'status');
  const box = editorBox(true);
  const left = (1280 - 1280 * SCALE) / 2;
  const Component: React.FC<{f: number}> = ({f}) => {
    const done = f >= connect;
    const glow = clamp((f - connect) / 10) * (1 - clamp((f - connect - 50) / 30));
    const spin = (f * 9) % 360;
    return (
      <div style={{position: 'absolute', inset: 0, background: '#2b2d31', overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: 84, top: 8, width: 360, height: 30, borderRadius: '8px 8px 0 0', background: '#3c3f45', display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px', boxSizing: 'border-box'}}>
          {done ? <Codicon name="vscode" size={14} color="#4daafc" /> : <Codicon name="loading" size={14} color={AW.muted} style={{transform: `rotate(${spin}deg)`}} />}
          <T size={12} color={AW.strong} style={{overflow: 'hidden', textOverflow: 'ellipsis'}}>
            {tab}
          </T>
          <Codicon name="close" size={12} color={AW.muted} style={{marginLeft: 'auto'}} />
        </div>
        <div style={{position: 'absolute', left: 0, top: 38, width: 1280, height: TOP - 38, background: '#3c3f45'}} />
        {['arrow-left', 'arrow-right', 'refresh'].map((n, i) => (
          <div key={n} style={{position: 'absolute', left: 14 + i * 30, top: 44, width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <Codicon name={n} size={15} color={i === 1 ? AW.faint : AW.fg} />
          </div>
        ))}
        <div style={{position: 'absolute', left: 110, top: 43, width: 1060, height: 26, borderRadius: 13, background: '#25272b', display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px', boxSizing: 'border-box'}}>
          <Codicon name="lock" size={13} color={AW.muted} />
          <T size={13} color={AW.strong}>
            {url}
          </T>
        </div>
        <div style={{position: 'absolute', left: 1190, top: 44, width: 24, height: 24, borderRadius: 12, background: 'linear-gradient(140deg, #7aa7d8, #3b5f8f)'}} />
        <div style={{position: 'absolute', left, top: TOP, width: 1280, height: 720, transformOrigin: '0 0', transform: `scale(${SCALE})`}}>
          <Workbench
            web
            title={`${connected.split(': ').pop()} [Tunnel]`}
            sidebar={{title: 'Explorer', content: done ? <ExplorerTree project="my-project" files={['src', file, 'package.json']} open={file} /> : null}}
            tabs={done ? [{label: file, active: true}] : []}
            editor={done ? <Code x={box.x} y={contentTop + 10} w={box.w} lines={['export const app = createApp();', '', 'app.listen(3000);']} current={1} /> : null}
            status={{remote: done ? connected : 'Opening Remote...', remoteBg: done ? '#16825d' : '#0078d4'}}
          />
          {glow > 0 ? <div style={{position: 'absolute', left: 6, top: 692, width: 30 + connected.length * 6.6 + 12, height: 26, borderRadius: 6, boxShadow: `0 0 0 2px rgba(255,255,255,${0.6 * glow}), 0 0 18px rgba(60,200,140,${0.8 * glow})`}} /> : null}
        </div>
        {!done ? (
          <div style={{position: 'absolute', left: 0, right: 0, top: 360, textAlign: 'center', opacity: 1 - settle(f, connect)}}>
            <T color={AW.muted}>Connecting to the tunnel...</T>
          </div>
        ) : null}
      </div>
    );
  };
  return {
    Component,
    loupe: {block: focus === 'address' ? [70, 2, 640, 72] : [0, 610, 380, 110]},
    cues: [{at: connect, sfx: 'pop', volume: 0.14}],
    chrome: 'window',
  };
};
