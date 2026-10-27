import React from 'react';
import {clamp} from '../motion';
import {Cursor, cursorAt} from '../ui/kit';
import {policyIndicatorAt, settingBlock, SettingRow, SettingsEditor} from '../ui/Settings';
import {Workbench} from '../ui/Workbench';
import {A, str} from './common';
import type {SceneMake} from './types';

// A setting your organization manages (an enterprise policy, which a recording can't set): the Settings editor on it,
// VS Code's "Managed by organization" indicator, and the pointer resting on it as its hover explains.
//   params: id, description, kind (checkbox, text, dropdown), value (what the policy sets), policyDescription (the
//           policy's own words for the hover, else VS Code's)
//   events: hover (the pointer reaches the indicator and its hover opens)

export const policy: SceneMake = (params, {ev}) => {
  const kind = (str(params, 'kind', 'checkbox') as SettingRow['kind']) ?? 'checkbox';
  const raw = params.value;
  const value = typeof raw === 'boolean' || typeof raw === 'string' ? raw : kind === 'checkbox' ? false : '';
  const row: SettingRow = {
    id: str(params, 'id', 'chat.agent.enabled'),
    description: str(params, 'description', 'Enable agent mode for chat. When enabled, agent mode can be activated via the dropdown in the view.'),
    kind,
    value,
    policy: true,
    policyDescription: typeof params.policyDescription === 'string' ? params.policyDescription : undefined,
  };
  const hover = ev('hover', A + 24, A + 6);
  const [ix, iy] = policyIndicatorAt(row);
  const [x, y, w, h] = settingBlock(row);
  const Component: React.FC<{f: number}> = ({f}) => {
    const [cx, cy] = cursorAt(f, [
      [hover - 36, ix + 140, iy + 160],
      [hover - 2, ix, iy],
    ]);
    return (
      <Workbench sidebar={null} tabs={[{label: 'Settings', icon: 'settings-gear', active: true}]} editor={<SettingsEditor query={`@id:${row.id}`} row={row} lit={clamp((f - A) / 12)} policyHover={clamp((f - (hover + 8)) / 8)} />}>
        {f >= hover - 36 ? <Cursor x={cx} y={cy} opacity={clamp((f - (hover - 36)) / 6)} /> : null}
      </Workbench>
    );
  };
  return {
    Component,
    loupe: {block: [x, y, w, Math.max(h, 150)]},
    cues: [{at: hover + 8, sfx: 'tick', volume: 0.1}],
    chrome: 'window',
  };
};
