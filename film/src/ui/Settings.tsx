import React from 'react';
import {AW, Codicon, T} from './kit';
import {contentTop, editorBox} from './Workbench';

// The Settings editor, in the editor panel: its search, the User and Workspace tabs, the table of contents, and one
// setting the change is about: its "Category › Section: Title", its description, and its control (a checkbox, a text
// box, a dropdown). A setting your organization manages shows VS Code's indicator (a briefcase, "Managed by
// organization"), its hover says why, and its control can't be changed.

export type SettingRow = {
  /** The setting ID (chat.welcomePage.signIn.enabled): its title is made from it, as VS Code does. */
  id: string;
  description: string;
  kind?: 'checkbox' | 'text' | 'dropdown';
  /** The value: a checkbox's state (true/false), or the text or option shown. */
  value: boolean | string;
  /** Managed by a policy: the indicator, and the hover that explains it (the policy's description, else VS Code's). */
  policy?: boolean;
  policyDescription?: string;
  modified?: boolean;
};

/** "chat.welcomePage.signIn.enabled" → ["Chat › Welcome Page › Sign In: ", "Enabled"], as the Settings editor titles it. */
export const settingTitle = (id: string): [string, string] => {
  const words = (s: string) => s.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, (c) => c.toUpperCase());
  const parts = id.split('.');
  const last = parts.pop() ?? id;
  return [`${parts.map(words).join(' › ')}: `, words(last)];
};

const TOC = ['Commonly Used', 'Text Editor', 'Workbench', 'Window', 'Features', 'Application', 'Security', 'Extensions'];

/** A checkbox's description sits beside it (VS Code's boolean settings), so it wraps narrower. */
const isBool = (row: SettingRow) => row.kind === 'checkbox' || row.kind === undefined;
const descWidth = (row: SettingRow) => (isBool(row) ? 533 : 560);
const descLinesOf = (row: SettingRow) => Math.ceil((row.description.length * 6.7) / descWidth(row));

/** Where the setting's control is (its centre), for the pointer. */
export const settingControlAt = (row: SettingRow): [number, number] => {
  const box = editorBox(true);
  const x = box.x + 214;
  if (isBool(row)) return [x + 9, contentTop + 150 + 23 + 9];
  const y = contentTop + 150 + 20 + descLinesOf(row) * 19 + 14;
  return [x + 120, y + 13];
};
/** The block the setting fills (window px): its title, description and control. */
export const settingBlock = (row: SettingRow): [number, number, number, number] => {
  const box = editorBox(true);
  const h = isBool(row) ? 22 + descLinesOf(row) * 19 + 14 + 24 : 20 + descLinesOf(row) * 19 + 14 + 26 + 24;
  return [box.x + 196, contentTop + 132, 640, h];
};

/** A checkbox as VS Code 1.144's Settings draws it (sampled on a capture): dark, a grey edge, a light check. */
const Checkbox: React.FC<{x: number; y: number; on: boolean; dim?: boolean}> = ({x, y, on, dim}) => (
  <div style={{position: 'absolute', left: x, top: y, width: 18, height: 18, boxSizing: 'border-box', borderRadius: 3, background: '#242527', border: '1px solid #6b6c70', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: dim ? 0.7 : 1}}>
    {on ? <Codicon name="check" size={14} color={AW.fg} /> : null}
  </div>
);

/**
 * The Settings editor in its modal (VS Code 1.144 opens Settings as a modal editor, the Agents window too: see
 * ModalEditor), laid out from a capture: its search over the whole width, User and Workspace, the table of contents'
 * edge, and the setting, its checkbox beside its description (which wraps in 719 px); a text box or a dropdown goes
 * under its description, as in the editor.
 */
const SM = {search: {x: 153, y: 135, w: 974}, tabs: 170, toc: 329, x: 367, y: 220, descW: 719};
const modalDescLines = (row: SettingRow) => Math.ceil((row.description.length * 6.7) / SM.descW);
/** The block the setting fills in the modal (window px): its title, checkbox and description (or its control under it). */
export const settingModalBlock = (row: SettingRow): [number, number, number, number] => [SM.x - 20, SM.y - 16, 27 + SM.descW + 40, 22 + modalDescLines(row) * 19 + 30 + (isBool(row) ? 0 : 10 + 26)];
export const SettingsModalContent: React.FC<{query: string; row: SettingRow; checked: boolean}> = ({query, row, checked}) => {
  const [prefix, title] = settingTitle(row.id);
  const bool = isBool(row);
  return (
    <>
      <div style={{position: 'absolute', left: SM.search.x, top: SM.search.y, width: SM.search.w, height: 25, boxSizing: 'border-box', borderRadius: 4, background: AW.panel, border: `1px solid ${AW.focus}`, display: 'flex', alignItems: 'center', gap: 8, padding: '0 6px 0 7px'}}>
        <T color={AW.strong}>{query}</T>
        <T color={AW.muted} size={12} style={{marginLeft: 'auto'}}>
          1 Setting Found
        </T>
        <Codicon name="clear-all" size={16} color={AW.muted} />
        <Codicon name="filter" size={16} color={AW.muted} />
      </div>
      <div style={{position: 'absolute', left: SM.search.x, top: SM.tabs, height: 22, display: 'flex', alignItems: 'center', gap: 4}}>
        <div style={{height: 22, padding: '0 8px', borderRadius: 4, background: AW.selected, display: 'flex', alignItems: 'center'}}>
          <T weight={600} color={AW.strong}>
            User
          </T>
        </div>
        <div style={{height: 22, padding: '0 8px', display: 'flex', alignItems: 'center'}}>
          <T color={AW.muted}>Workspace</T>
        </div>
      </div>
      <div style={{position: 'absolute', left: SM.toc, top: 205, width: 1, height: 428, background: AW.panelBorder}} />
      <div style={{position: 'absolute', left: SM.x, top: SM.y}}>
        <T color={AW.muted} weight={600}>
          {prefix}
          <span style={{color: AW.strong}}>{title}</span>
        </T>
      </div>
      {bool ? <Checkbox x={SM.x} y={SM.y + 22} on={checked} /> : null}
      <div style={{position: 'absolute', left: bool ? SM.x + 27 : SM.x, top: SM.y + 22, width: SM.descW}}>
        <T color={AW.muted} style={{whiteSpace: 'normal', lineHeight: '19px'}}>
          {row.description}
        </T>
      </div>
      {bool ? null : (
        <div style={{position: 'absolute', left: SM.x, top: SM.y + 22 + modalDescLines(row) * 19 + 10, width: 300, height: 26, boxSizing: 'border-box', borderRadius: 3, background: AW.input, border: `1px solid ${AW.inputBorder}`, display: 'flex', alignItems: 'center', padding: '0 8px'}}>
          <T color={AW.strong}>{String(row.value)}</T>
          {row.kind === 'dropdown' ? <Codicon name="chevron-down" size={14} color={AW.muted} style={{marginLeft: 'auto'}} /> : null}
        </div>
      )}
    </>
  );
};

/** The Settings editor's content: `query` in its search, the row; `p` 0–1 the row's value changing (`flip`). */
/** VS Code's own words for a setting a policy sets (settingsEditorSettingIndicators.ts). */
export const POLICY_LABEL = 'Managed by organization';
export const POLICY_DESCRIPTION = 'This setting is managed by your organization and its actual value cannot be changed.';
/** Where the policy indicator is (its centre), for the pointer. */
export const policyIndicatorAt = (row: SettingRow): [number, number] => {
  const box = editorBox(true);
  const [prefix, title] = settingTitle(row.id);
  return [box.x + 214 + (prefix.length + title.length) * 6.9 + 70, contentTop + 150 + 9];
};

export const SettingsEditor: React.FC<{query: string; row: SettingRow; checked?: boolean; hover?: number; lit?: number; policyHover?: number}> = ({query, row, checked, hover = 0, lit = 0, policyHover = 0}) => {
  const box = editorBox(true);
  const [prefix, title] = settingTitle(row.id);
  const x = box.x + 214;
  const y0 = contentTop + 150;
  const bool = isBool(row);
  const descLines = descLinesOf(row);
  const yc = bool ? y0 + 22 + descLines * 19 - 26 : y0 + 20 + descLines * 19 + 14;
  const on = checked ?? (typeof row.value === 'boolean' ? row.value : false);
  return (
    <>
      <div style={{position: 'absolute', left: box.x + 24, top: contentTop + 18, width: box.w - 48, height: 28, boxSizing: 'border-box', borderRadius: 4, background: AW.input, border: `1px solid ${AW.focus}`, display: 'flex', alignItems: 'center', paddingLeft: 10, gap: 8}}>
        <T color={query ? AW.strong : AW.faint}>{query || 'Search settings'}</T>
        {query ? (
          <T color={AW.muted} size={12} style={{marginLeft: 'auto', marginRight: 10}}>
            1 Setting Found
          </T>
        ) : null}
      </div>
      <div style={{position: 'absolute', left: box.x + 24, top: contentTop + 62, display: 'flex', gap: 22}}>
        <div style={{paddingBottom: 6, borderBottom: `1px solid ${AW.strong}`}}>
          <T color={AW.strong}>User</T>
        </div>
        <T color={AW.muted}>Workspace</T>
      </div>
      <div style={{position: 'absolute', left: box.x + 24, top: contentTop + 92, width: box.w - 48, height: 1, background: AW.panelBorder}} />
      {TOC.map((t, i) => (
        <div key={t} style={{position: 'absolute', left: box.x + 30, top: contentTop + 108 + i * 24}}>
          <T color={i === 0 ? AW.strong : AW.muted}>{t}</T>
        </div>
      ))}
      <div style={{position: 'absolute', left: x - 18, top: y0 - 16, width: 640, height: yc - y0 + 26 + 32, borderRadius: 4, background: `rgba(255,255,255,${0.035 + 0.03 * hover})`, boxShadow: lit > 0 ? `inset 3px 0 0 rgba(0,120,212,${lit})` : undefined}} />
      {row.modified ? <div style={{position: 'absolute', left: x - 12, top: y0, width: 2, height: yc - y0 + 26, background: '#0078d4'}} /> : null}
      <div style={{position: 'absolute', left: x, top: y0, display: 'flex', alignItems: 'center', gap: 6}}>
        <T color={AW.fg}>
          {prefix}
          <span style={{fontWeight: 600, color: AW.strong}}>{title}</span>
        </T>
        {row.policy ? (
          <span style={{display: 'inline-flex', alignItems: 'center', gap: 4, marginLeft: 8, padding: '0 6px', height: 18, borderRadius: 3, background: 'rgba(255,255,255,0.08)'}}>
            <Codicon name="briefcase" size={12} color={AW.muted} />
            <T size={12} color={AW.muted}>
              {POLICY_LABEL}
            </T>
          </span>
        ) : null}
      </div>
      <div style={{position: 'absolute', left: bool ? x + 27 : x, top: y0 + 22, width: descWidth(row)}}>
        <T color={AW.muted} style={{whiteSpace: 'normal', lineHeight: '19px'}}>
          {row.description}
        </T>
      </div>
      {row.kind === 'text' || row.kind === 'dropdown' ? (
        <div style={{position: 'absolute', left: x, top: yc, width: 300, height: 26, boxSizing: 'border-box', borderRadius: 3, background: row.policy ? 'rgba(42,43,46,0.5)' : AW.input, border: `1px solid ${AW.inputBorder}`, display: 'flex', alignItems: 'center', padding: '0 8px', opacity: row.policy ? 0.7 : 1}}>
          <T color={AW.strong}>{String(row.value)}</T>
          {row.kind === 'dropdown' ? <Codicon name="chevron-down" size={14} color={AW.muted} style={{marginLeft: 'auto'}} /> : null}
        </div>
      ) : (
        <Checkbox x={x} y={y0 + 23} on={on} dim={row.policy} />
      )}
      {row.policy && policyHover > 0 ? (
        <div style={{position: 'absolute', left: policyIndicatorAt(row)[0] - 60, top: y0 + 24, width: 330, padding: '6px 9px', boxSizing: 'border-box', borderRadius: 4, background: AW.tooltip, border: `1px solid ${AW.tooltipBorder}`, boxShadow: '0 4px 14px rgba(0,0,0,0.45)', opacity: Math.min(1, policyHover * 1.6)}}>
          <T style={{whiteSpace: 'normal', lineHeight: '18px'}}>{row.policyDescription ?? POLICY_DESCRIPTION}</T>
        </div>
      ) : null}
    </>
  );
};
