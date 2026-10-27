import React from 'react';
import {clamp} from '../motion';
import {AgentsWindow, ChatInput, UserBubble} from '../ui/AgentsWindow';
import {ModalEditor} from '../ui/Overlays';
import {settingBlock, settingModalBlock, SettingRow, SettingsEditor, SettingsModalContent} from '../ui/Settings';
import {Workbench} from '../ui/Workbench';
import {A, contextOf, openSession, str} from './common';
import type {Params, SceneMake} from './types';

// A setting in the Settings editor: searched for by its ID, its row lit; when its default changes (`before`), the
// value flips to the new default on its word, by itself (a default isn't a user's change: no pointer, no modified bar).
// With `window: "agents"`, a setting of the Agents window: Settings is a modal over it (VS Code 1.144 opens it so), and
// its row is wider than the lens takes at 1.4×, so the lens magnifies it less (by hand).
//   params: id, description (the PR's words), kind (checkbox, text, dropdown), before (the default before, only when the
//           PR changes it), after (the value now), window (main, agents), context (with agents)
//   events: flip (the value changes to the new default)

const valueOf = (p: Params, key: string, fallback: boolean | string) => (typeof p[key] === 'boolean' || typeof p[key] === 'string' ? (p[key] as boolean | string) : fallback);

export const setting: SceneMake = (params, {ev}) => {
  const kind = (str(params, 'kind', 'checkbox') as SettingRow['kind']) ?? 'checkbox';
  const after = valueOf(params, 'after', kind === 'checkbox' ? true : '');
  const hasBefore = params.before !== undefined;
  const before = valueOf(params, 'before', after);
  const row: SettingRow = {
    id: str(params, 'id', 'chat.welcomePage.signIn.enabled'),
    description: str(params, 'description', 'Show the GitHub sign-in button on the Welcome page when you are signed out.'),
    kind,
    value: after,
  };
  const flip = hasBefore ? ev('flip', A + 30, A + 10) : -1;
  const agents = str(params, 'window', 'main') === 'agents';
  if (agents) {
    const ctx = contextOf(params, {
      project: 'my-project',
      groups: [{label: 'my-project', icon: 'folder', sessions: [{title: 'Add an empty state', time: 'now', selected: true}, {title: 'To-do Tagline', time: 'yesterday'}]}],
      prompt: 'Add an empty state to the task list.',
      reply: '',
    });
    const Component: React.FC<{f: number}> = ({f}) => {
      const value = !hasBefore || f >= flip ? after : before;
      return (
        <AgentsWindow project={ctx.project} groups={ctx.groups} chatTitle={openSession(ctx)} transcript={<UserBubble y={92} text={ctx.prompt} />} input={<ChatInput model={{label: 'HydraFusion', effort: 'Default', p: 1}} />}>
          <ModalEditor title="Settings" icon="settings" actions={['go-to-file', 'open-in-product', 'screen-full', 'close']}>
            <SettingsModalContent query={row.id} row={{...row, value}} checked={value === true} />
          </ModalEditor>
        </AgentsWindow>
      );
    };
    const block = settingModalBlock(row);
    return {
      Component,
      // 1.18 × the window's 1.06: the whole row, readable (the lens shows 1.4× only up to 670 px).
      loupe: {block, mag: 1.18},
      cues: hasBefore ? [{at: flip, sfx: 'tick', volume: 0.16}] : [],
      chrome: 'window',
    };
  }
  const Component: React.FC<{f: number}> = ({f}) => {
    const flipped = !hasBefore || f >= flip;
    const value = flipped ? after : before;
    return (
      <Workbench sidebar={null} tabs={[{label: 'Settings', icon: 'settings-gear', active: true}]} editor={<SettingsEditor query={`@id:${row.id}`} row={{...row, value}} checked={typeof value === 'boolean' ? value : undefined} lit={hasBefore ? 0 : clamp((f - A) / 12)} />} />
    );
  };
  const [x, y, w, h] = settingBlock(row);
  return {
    Component,
    loupe: {block: [x, y, w, h]},
    cues: hasBefore ? [{at: flip, sfx: 'tick', volume: 0.16}] : [],
    chrome: 'window',
  };
};
