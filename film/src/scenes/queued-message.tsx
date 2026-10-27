import React from 'react';
import {clamp} from '../motion';
import {AgentsWindow, ChatInput, UserBubble} from '../ui/AgentsWindow';
import {AW, ClickRing, Codicon, Cursor, cursorAt, T, Tooltip} from '../ui/kit';
import {A, contextOf, list, openSession, press, spin, str} from './common';
import type {SceneMake} from './types';

// A message queued while the agent works: the pointer comes to its remove button (its tooltip says so), it's removed on
// its word, it closes up, and the agent finishes without it.
//   params: message (the queued message), action (the button's tooltip, default "Remove from Queue"),
//           steps [{verb, file}] (what the agent did), done (its reply when it's finished), context
//   events: remove (the button is clicked), done (the agent finishes)

const Q = {x: 335, y: 546, w: 583, h: 32};

export const queuedMessage: SceneMake = (params, {ev}) => {
  const message = str(params, 'message', 'Also add a test for the empty state');
  const action = str(params, 'action', 'Remove from Queue');
  const ctx = contextOf(params, {
    project: 'my-project',
    groups: [{label: 'my-project', icon: 'folder', sessions: [{title: 'Add an empty state', time: 'now', selected: true}, {title: 'To-do Tagline', time: 'yesterday'}]}],
    prompt: 'Show an empty state when the sessions list has no sessions.',
    reply: 'The sessions list now shows an empty state when there are no sessions.',
  });
  const given = list<{verb?: string; file?: string}>(params, 'steps');
  const steps: [string, string][] = given.length ? given.map((s) => [s.verb ?? 'Edited', s.file ?? '']) : [['Read', 'sessionsList.ts'], ['Edited', 'sessionsList.ts']];
  const remove = ev('remove', A + 30, A + 20);
  const doneAt = ev('done', remove + 70, remove + 40);
  const REMOVE = remove + 4;
  const trash = {x: Q.x + Q.w - 30, y: Q.y + 5};
  const Component: React.FC<{f: number}> = ({f}) => {
    const [cx, cy] = cursorAt(f, [
      [A - 36, 820, 430],
      [A - 6, trash.x + 11, trash.y + 12],
      [REMOVE + 8, trash.x + 11, trash.y + 12],
      [REMOVE + 44, trash.x - 60, trash.y + 90],
    ]);
    const gone = clamp((f - REMOVE) / 14);
    const done = f >= doneAt;
    const hovering = f >= A - 6;
    return (
      <AgentsWindow
        project={ctx.project}
        groups={ctx.groups}
        chatTitle={openSession(ctx)}
        transcript={
          <>
            <UserBubble y={318} text={ctx.prompt} />
            {steps.map(([verb, file], i) => (
              <div key={`${verb}-${i}`} style={{position: 'absolute', left: 335, top: 374 + i * 26, display: 'flex', alignItems: 'center', gap: 8}}>
                <Codicon name="check" size={14} color={AW.muted} />
                <T color={AW.muted}>{verb}</T>
                <T color={AW.link} mono size={12}>
                  {file}
                </T>
                {i === steps.length - 1 && verb === 'Edited' ? (
                  <>
                    <T color={AW.green} size={12} mono>
                      +18
                    </T>
                    <T color="#f85149" size={12} mono>
                      −2
                    </T>
                  </>
                ) : null}
              </div>
            ))}
            <div style={{position: 'absolute', left: 335, top: 374 + steps.length * 26, display: 'flex', alignItems: 'center', gap: 8}}>
              <Codicon name={done ? 'check' : 'loading'} size={14} color={AW.muted} style={done ? undefined : {transform: `rotate(${spin(f)}deg)`}} />
              <T color={AW.muted}>{done ? 'Done' : 'Working…'}</T>
            </div>
            {done ? (
              <div style={{position: 'absolute', left: 335, top: 406 + steps.length * 26, width: 583, opacity: clamp((f - doneAt) / 10)}}>
                <T style={{whiteSpace: 'normal', lineHeight: '20px'}}>{ctx.reply}</T>
              </div>
            ) : null}
            {gone < 1 ? (
              <div style={{position: 'absolute', left: Q.x, top: Q.y + 12 * gone, width: Q.w, height: Q.h * (1 - gone), borderRadius: 6, background: AW.input, border: `1px solid ${AW.inputBorder}`, boxSizing: 'border-box', opacity: 1 - gone, overflow: 'hidden'}}>
                <div style={{position: 'absolute', left: 10, top: 7, display: 'flex', alignItems: 'center', gap: 8}}>
                  <Codicon name="history" size={14} color={AW.muted} />
                  <T color={AW.muted}>Queued</T>
                  <T color={AW.strong}>{message}</T>
                </div>
              </div>
            ) : null}
            {gone < 1 ? (
              <div style={{position: 'absolute', left: trash.x, top: trash.y, width: 22, height: 22, borderRadius: 5, background: hovering ? 'rgba(255,255,255,0.1)' : undefined, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 1 - gone, transform: `scale(${1 - 0.1 * press(f, REMOVE - 4)})`}}>
                <Codicon name="trash" size={15} color={hovering ? AW.strong : AW.muted} />
              </div>
            ) : null}
          </>
        }
        input={<ChatInput working={!done} model={{label: 'HydraFusion', effort: 'Default', p: 1}} />}
      >
        <Tooltip x={trash.x - 60} y={trash.y - 32} text={action} p={f >= A && f < REMOVE ? clamp((f - A) / 6) : 0} />
        {f >= A - 36 ? <Cursor x={cx} y={cy} press={press(f, REMOVE - 4)} opacity={clamp((f - (A - 36)) / 6)} /> : null}
        <ClickRing x={cx} y={cy} f={f} at={REMOVE - 2} />
      </AgentsWindow>
    );
  };
  return {
    Component,
    loupe: {block: [330, 300, 640, 415]},
    cues: [{at: remove, sfx: 'click', volume: 0.22}],
    chrome: 'window',
  };
};
