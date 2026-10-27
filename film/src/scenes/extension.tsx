import React from 'react';
import {clamp, settle, typeOn} from '../motion';
import {codicon} from '../ui/icons';
import {AW, ClickRing, Codicon, Cursor, cursorAt, T} from '../ui/kit';
import {contentTop, editorBox, Workbench} from '../ui/Workbench';
import {A, press, str} from './common';
import type {SceneMake} from './types';

// An extension (the Marketplace, the network): the Extensions view is searched on its word, the extension's page shows
// its verified publisher and what's new, and Install is clicked: it installs.
//   params: query, name, publisher, description, icon (a codicon for its original tile), color (the tile's), badge
//           (a label the change adds to its page, optional)
//   events: search (the typing starts), install (Install is clicked)

export const extension: SceneMake = (params, {ev}) => {
  const query = str(params, 'query', 'release notes');
  const name = str(params, 'name', 'Release Notes Helper');
  const publisher = str(params, 'publisher', 'release-tools');
  const description = str(params, 'description', 'Write release notes from your merged pull requests.');
  const icon = codicon(params.icon, 'notebook');
  const color = str(params, 'color', '#7a5af8');
  const badge = str(params, 'badge', '');
  const search = ev('search', A - 30, A - 40);
  const typed = search + query.length * 3 + 4;
  const install = ev('install', typed + 60, typed + 30);
  const box = editorBox(true);
  const btn = {x: box.x + 160, y: contentTop + 118, w: 64, h: 24};
  const Tile: React.FC<{size: number}> = ({size}) => (
    <div style={{width: size, height: size, borderRadius: size * 0.22, background: `linear-gradient(150deg, ${color}, #1b1d3a)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none'}}>
      <Codicon name={icon} size={size * 0.55} color="#ffffff" />
    </div>
  );
  const Component: React.FC<{f: number}> = ({f}) => {
    const text = query.slice(0, typeOn(f, search, typed, query.length));
    const found = settle(f, typed + 4);
    const state = f < install + 4 ? 'Install' : f < install + 40 ? 'Installing' : 'installed';
    const [cx, cy] = cursorAt(f, [
      [install - 34, btn.x + 200, btn.y + 160],
      [install - 4, btn.x + btn.w / 2, btn.y + btn.h / 2],
      [install + 40, btn.x + btn.w / 2 + 40, btn.y + 70],
    ]);
    return (
      <Workbench
        activity="extensions"
        sidebar={{
          title: 'Extensions',
          content: (
            <>
              <div style={{position: 'absolute', left: 62, top: 72, width: 276, height: 26, boxSizing: 'border-box', borderRadius: 4, background: AW.input, border: `1px solid ${f >= search ? AW.focus : AW.inputBorder}`, display: 'flex', alignItems: 'center', paddingLeft: 8}}>
                <T color={text ? AW.strong : AW.faint}>{text || 'Search Extensions in Marketplace'}</T>
              </div>
              {found > 0 ? (
                <div style={{position: 'absolute', left: 56, top: 108, width: 290, height: 62, background: AW.selected, display: 'flex', gap: 10, padding: '8px 12px', boxSizing: 'border-box', opacity: found}}>
                  <Tile size={40} />
                  <div style={{minWidth: 0}}>
                    <T weight={600} color={AW.strong}>{name}</T>
                    <div>
                      <T size={12} color={AW.muted} style={{overflow: 'hidden', textOverflow: 'ellipsis'}}>
                        {description}
                      </T>
                    </div>
                    <div style={{display: 'flex', alignItems: 'center', gap: 4}}>
                      <Codicon name="verified-filled" size={12} color={AW.link} />
                      <T size={12} color={AW.muted}>{publisher}</T>
                    </div>
                  </div>
                </div>
              ) : null}
            </>
          ),
        }}
        tabs={found > 0 ? [{label: `Extension: ${name}`, icon: 'extensions', active: true}] : []}
        editor={
          found > 0 ? (
            <div style={{position: 'absolute', inset: 0, opacity: found}}>
              <div style={{position: 'absolute', left: box.x + 40, top: contentTop + 30}}>
                <Tile size={100} />
              </div>
              <div style={{position: 'absolute', left: btn.x, top: contentTop + 30, display: 'flex', alignItems: 'center', gap: 10}}>
                <T size={24} weight={600} color={AW.strong}>{name}</T>
                {badge ? (
                  <span style={{padding: '1px 7px', borderRadius: 3, background: '#0078d4'}}>
                    <T size={11} weight={600} color="#ffffff">{badge}</T>
                  </span>
                ) : null}
              </div>
              <div style={{position: 'absolute', left: btn.x, top: contentTop + 64, display: 'flex', alignItems: 'center', gap: 5}}>
                <Codicon name="verified-filled" size={14} color={AW.link} />
                <T color={AW.link}>{publisher}</T>
                <T color={AW.faint}>|</T>
                <Codicon name="cloud-download" size={14} color={AW.muted} />
                <T color={AW.muted}>12,480</T>
              </div>
              <div style={{position: 'absolute', left: btn.x, top: contentTop + 88}}>
                <T color={AW.fg}>{description}</T>
              </div>
              <div style={{position: 'absolute', left: btn.x, top: btn.y, width: state === 'installed' ? 100 : state === 'Installing' ? 92 : btn.w, height: btn.h, borderRadius: 3, background: state === 'installed' ? '#313235' : '#0078d4', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, transform: `scale(${1 - 0.06 * press(f, install)})`}}>
                {state === 'Installing' ? <Codicon name="loading" size={13} color="#ffffff" style={{transform: `rotate(${(f * 9) % 360}deg)`}} /> : null}
                <T color="#ffffff">{state === 'installed' ? 'Uninstall' : state}</T>
              </div>
              <div style={{position: 'absolute', left: box.x + 40, top: contentTop + 170, width: box.w - 80, height: 1, background: AW.panelBorder}} />
              <div style={{position: 'absolute', left: box.x + 40, top: contentTop + 186, display: 'flex', gap: 24}}>
                {['Details', 'Features', 'Changelog'].map((t, i) => (
                  <T key={t} color={i === 0 ? AW.strong : AW.muted}>{t}</T>
                ))}
              </div>
            </div>
          ) : null
        }
      >
        {f >= install - 34 ? <Cursor x={cx} y={cy} press={press(f, install)} opacity={clamp((f - (install - 34)) / 6)} /> : null}
        <ClickRing x={cx} y={cy} f={f} at={install + 2} />
      </Workbench>
    );
  };
  return {
    Component,
    loupe: {block: [box.x + 20, contentTop + 14, 620, 150]},
    cues: [{at: typed + 4, sfx: 'tick', volume: 0.1}, {at: install, sfx: 'click', volume: 0.22}],
    chrome: 'window',
  };
};
