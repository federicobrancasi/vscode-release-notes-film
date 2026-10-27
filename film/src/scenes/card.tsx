import React from 'react';
import {settle} from '../motion';
import {codicon} from '../ui/icons';
import {AW, Codicon, T} from '../ui/kit';
import {contentTop, editorBox, Workbench} from '../ui/Workbench';
import {A, list, str} from './common';
import type {SceneMake} from './types';

// A change with no UI to show (a default behind the scenes, telemetry, a fix that leaves the UI as it was): the change
// in words, as a page of release notes in the editor: its title, and its lines appearing one by one from its word.
//   params: icon, title (the change for users), lines [{text, mono, icon}] (1–3; mono for a setting ID or a command)
//   events: show (the lines start appearing)

export const card: SceneMake = (params, {ev}) => {
  const icon = codicon(params.icon, 'info');
  const title = str(params, 'title', 'Faster startup on large workspaces');
  const given = list<{text?: string; label?: string; mono?: boolean; icon?: string}>(params, 'lines');
  const lines = (given.length ? given : [{text: 'Files are indexed in the background'}, {text: 'search.indexing.background', mono: true}]).map((l) => ({text: l.text ?? l.label ?? '', mono: Boolean(l.mono), icon: l.icon ? codicon(l.icon) : null}));
  const show = ev('show', A + 6, A - 10);
  const box = editorBox(false);
  const x = box.x + 120;
  const y = contentTop + 120;
  // A title too long for the lens wraps (28 px, about 14.5 px a character, in the 540 px beside the icon).
  const TITLE_W = 540;
  const extra = (Math.ceil((title.length * 14.5) / TITLE_W) - 1) * 34;
  const Component: React.FC<{f: number}> = ({f}) => (
    <Workbench sidebar={null} tabs={[{label: 'Release Notes', vscode: true, active: true}]} editor={
      <>
        <div style={{position: 'absolute', left: x, top: y - 56}}>
          <T size={12} color={AW.muted} style={{letterSpacing: '0.08em', textTransform: 'uppercase'}}>
            What's new
          </T>
        </div>
        <div style={{position: 'absolute', left: x, top: y - 24, display: 'flex', alignItems: 'center', gap: 14}}>
          <div style={{width: 44, height: 44, borderRadius: 10, background: 'rgba(0,120,212,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none'}}>
            <Codicon name={icon} size={26} color="#4daafc" />
          </div>
          <div style={{width: TITLE_W}}>
            <T size={28} weight={600} color={AW.strong} style={{whiteSpace: 'normal', lineHeight: '34px', display: 'block'}}>
              {title}
            </T>
          </div>
        </div>
        <div style={{position: 'absolute', left: x, top: y + 44 + extra, width: 620, height: 1, background: AW.panelBorder}} />
        {lines.map((l, i) => {
          const p = settle(f, show + i * 14);
          return (
            <div key={`${l.text}-${i}`} style={{position: 'absolute', left: x, top: y + 70 + extra + i * 40, display: 'flex', alignItems: 'center', gap: 12, opacity: p, transform: `translateY(${(1 - p) * 10}px)`}}>
              <Codicon name={l.icon ?? 'check'} size={18} color={AW.green} />
              {l.mono ? (
                <span style={{padding: '2px 8px', borderRadius: 4, background: 'rgba(255,255,255,0.07)'}}>
                  <T size={15} mono color={AW.strong}>
                    {l.text}
                  </T>
                </span>
              ) : (
                <T size={17} color={AW.fg}>
                  {l.text}
                </T>
              )}
            </div>
          );
        })}
      </>
    } />
  );
  return {
    Component,
    loupe: {block: [x - 24, y - 76, 670, Math.min(420, 136 + extra + lines.length * 40 + 16)]},
    cues: [{at: show, sfx: 'tick', volume: 0.1}],
    chrome: 'window',
  };
};
