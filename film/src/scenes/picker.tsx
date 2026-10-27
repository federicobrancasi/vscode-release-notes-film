import React from 'react';
import {clamp, settle} from '../motion';
import {AgentsWindow, ChatInput, INPUT, modelPickerX, UserBubble} from '../ui/AgentsWindow';
import {codicon} from '../ui/icons';
import {AW, ClickRing, Codicon, Cursor, cursorAt, T} from '../ui/kit';
import {A, bool, Context, contextOf, list, obj, openSession, press, str} from './common';
import type {Drawn, Ev, Params, SceneMake} from './types';

// A picker in the chat input: the pointer opens it on its word, and its entries show, the current one checked. With
// `loads`, the picker's button first loads (a placeholder), then appears on its word: a picker that's back. With
// `of: "agent"`, it's the agent picker (the custom agents with the built-in ones) instead of the model picker. With
// `details`, the model picker as VS Code 1.144 draws it (320 px, the current model checked at the left, its summary at
// the right of its row: "Medium · 1M ›"); on its word the current model's Details replace the list (the list goes, then
// the card comes: a back arrow, the model, and a section per setting, a title with a segmented control under it; a
// section with no value chosen shows its `value` beside its title, "Model default", and no option lit), and on its word
// an option of the section with `pick` is clicked: it lights, and the button's summary says it.
//   params: button {label} (the current entry), items [{label, icon, description, disabled}], loads (default false),
//           of (model, agent), tool (false: no tool call above the reply), context; details {model, sections [{title,
//           options, selected, value, pick}]} (with of: model)
//   events: load (with loads: the button appears), open (the picker opens), details (with details: the Details show),
//           pick (with details: the option is clicked)

type Section = {title?: string; options?: string[]; selected?: number; value?: string; pick?: number};

export const picker: SceneMake = (params, {ev}) => {
  const items = list<{label?: string; icon?: string; description?: string; disabled?: boolean}>(params, 'items');
  const entries = items.length ? items : [{label: 'Auto'}, {label: 'Claude Opus 5.5'}, {label: 'Claude Sonnet 5.5'}, {label: 'GPT-6.1 Sol'}];
  const current = str(obj(params, 'button'), 'label', entries[1]?.label ?? entries[0].label ?? '');
  const sel = Math.max(0, entries.findIndex((e) => e.label === current));
  const loads = bool(params, 'loads', false);
  const ofAgent = str(params, 'of', 'model') === 'agent';
  const tool = params.tool !== false;
  const currentIcon = entries[sel]?.icon;
  const agentIcon = ofAgent && currentIcon && currentIcon !== 'blank' ? codicon(currentIcon) : undefined;
  const ctx = contextOf(params, {
    project: 'my-project',
    groups: [{label: 'my-project', icon: 'folder', sessions: [{title: 'Run the unit tests', time: 'now', selected: true}, {title: 'To-do Tagline', time: 'yesterday'}]}],
    prompt: 'Run the unit tests and fix what fails.',
    reply: 'All 214 tests pass now: the date parsing in utils/date.ts handled time zones wrong, and the fix is in.',
  });
  if (!ofAgent && params.details && typeof params.details === 'object') return withDetails(params, ev, {entries, current, sel, tool, ctx});
  const load = loads ? ev('load', A + 40, A + 10) : -999;
  const click = loads ? ev('open', load + 40, load + 30) : ev('open', A + 30, A + 10);
  const pick = ofAgent ? {x: 368, y: 667} : {x: 439, y: 667};
  const Component: React.FC<{f: number}> = ({f}) => {
    const loaded = f >= load;
    const [cx, cy] = cursorAt(f, [
      [click - 28, 760, 520],
      [click - 2, pick.x + (ofAgent ? 10 + Math.round(current.length * 6.9) + 12 : 50), pick.y],
    ]);
    const open = settle(f, click + 6);
    return (
      <AgentsWindow
        project={ctx.project}
        groups={ctx.groups}
        chatTitle={openSession(ctx)}
        transcript={
          <>
            <UserBubble y={330} text={ctx.prompt} />
            {tool ? (
              <div style={{position: 'absolute', left: 335, top: 386, width: 583, height: 30, borderRadius: 6, border: `1px solid ${AW.panelBorder}`, display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 10, boxSizing: 'border-box'}}>
                <Codicon name="terminal" size={14} color={AW.muted} />
                <T color={AW.strong} mono size={12}>
                  npm test
                </T>
                <T color={AW.muted} mono size={12}>
                  {`/workspaces/${ctx.project.split(' · ').pop()}`}
                </T>
              </div>
            ) : null}
            <div style={{position: 'absolute', left: 335, top: tool ? 430 : 386, width: 583}}>
              <T style={{whiteSpace: 'normal', lineHeight: '20px'}}>{ctx.reply}</T>
            </div>
          </>
        }
        input={
          ofAgent ? (
            <ChatInput agent={{label: current, icon: agentIcon, open: open > 0}} model={{label: 'HydraFusion', effort: 'Default', p: 1}} />
          ) : (
            <ChatInput model={loaded ? {label: current, effort: 'Default', p: loads ? settle(f, load) : 1, open: open > 0} : 'loading'} />
          )
        }
      >
        {open > 0 ? (
          <div style={{position: 'absolute', left: pick.x - 6, top: 646 - 6 - entries.length * 26 - 8, width: 230, padding: 4, boxSizing: 'border-box', borderRadius: 7, background: AW.menu, border: `1px solid ${AW.menuBorder}`, boxShadow: '0 10px 30px rgba(0,0,0,0.5)', opacity: clamp(open * 1.4), transform: `translateY(${(1 - open) * 8}px)`}}>
            {entries.map((m, i) => (
              <div key={`${m.label}-${i}`} style={{height: 26, borderRadius: 4, display: 'flex', alignItems: 'center', gap: 8, padding: '0 8px', background: i === sel ? AW.menuSelected : undefined}}>
                <Codicon name={codicon(m.icon, 'sparkle')} size={13} color={AW.muted} />
                <T color={m.disabled ? AW.faint : AW.strong}>{m.label ?? ''}</T>
                {m.description ? (
                  <T color={AW.faint} size={12}>
                    {m.description}
                  </T>
                ) : null}
                {i === sel ? <Codicon name="check" size={14} color={AW.strong} style={{marginLeft: 'auto'}} /> : null}
              </div>
            ))}
          </div>
        ) : null}
        {f >= click - 28 ? <Cursor x={cx} y={cy} press={press(f, click)} opacity={clamp((f - (click - 28)) / 6)} /> : null}
        <ClickRing x={cx} y={cy} f={f} at={click + 2} />
      </AgentsWindow>
    );
  };
  return {
    Component,
    loupe: {block: [330, 320, 592, 395]},
    cues: [{at: click, sfx: 'click', volume: 0.22}],
    chrome: 'window',
  };
};

/** The model picker with a model's Details (`details`): see the comment at the top. */
const withDetails = (
  params: Params,
  ev: Ev,
  {entries, current, sel, tool, ctx}: {entries: {label?: string; icon?: string; description?: string; disabled?: boolean}[]; current: string; sel: number; tool: boolean; ctx: Context},
): Drawn => {
  const details = obj(params, 'details');
  const model = str(details, 'model', current);
  const sections = list<Section>(details, 'sections').map((s) => ({title: s.title ?? '', options: Array.isArray(s.options) ? s.options.map(String) : [], selected: typeof s.selected === 'number' ? s.selected : -1, value: s.value, pick: typeof s.pick === 'number' ? s.pick : undefined}));
  const picked = sections.findIndex((s) => s.pick !== undefined);
  const open = ev('open', A + 6, A - 30);
  const showDetails = ev('details', open + 50, open + 24);
  const pick = picked >= 0 ? ev('pick', showDetails + 50, showDetails + 24) : 99999;
  /** The button's summary, as VS Code joins a model's settings: the effort, then the context size ("Medium · 1M"). */
  const summary = (afterPick: boolean) =>
    sections
      .map((s, i) => (s.value && s.selected < 0 && !(afterPick && i === picked) ? s.value : s.options[afterPick && i === picked ? (s.pick as number) : s.selected] ?? ''))
      .filter(Boolean)
      .join(' · ');
  const W = 320;
  const X = 427;
  const BOTTOM = 646;
  const ROW = 24;
  const listH = 30 + entries.length * ROW + 8;
  const SEG = 26;
  const sectionH = 20 + SEG + 12;
  const cardH = 32 + sections.length * sectionH + 4;
  const listTop = BOTTOM - listH;
  const cardTop = BOTTOM - cardH;
  const rowY = (i: number) => listTop + 30 + 4 + i * ROW;
  const sectionY = (i: number) => cardTop + 32 + i * sectionH;
  const segW = (s: {options: string[]}) => (W - 24 - (s.options.length - 1) * 2) / Math.max(1, s.options.length);
  const optionAt = (i: number, o: number): [number, number] => {
    const s = sections[i];
    return [X + 12 + o * (segW(s) + 2) + segW(s) / 2, sectionY(i) + 20 + SEG / 2];
  };
  const button = {x: modelPickerX() + 40, y: 667};
  const summaryAt: [number, number] = [X + W - 40, rowY(sel) + ROW / 2];
  const [px, py] = picked >= 0 ? optionAt(picked, sections[picked].pick as number) : [0, 0];
  const Component: React.FC<{f: number}> = ({f}) => {
    const opened = settle(f, open + 4);
    // Swaps go out, then in: the list goes, then the card comes.
    const listOut = clamp((f - showDetails - 2) / 6);
    const cardIn = clamp((f - showDetails - 8) / 6);
    const afterPick = f >= pick + 2;
    const [cx, cy] = cursorAt(f, [
      [open - 28, 760, 520],
      [open - 2, button.x, button.y],
      [showDetails - 26, button.x + 20, button.y - 30],
      [showDetails - 2, summaryAt[0] + 8, summaryAt[1] + 4],
      [pick - 26, summaryAt[0] - 20, summaryAt[1] + 30],
      [pick - 2, px + 6, py + 6],
      [pick + 12, px + 6, py + 6],
      [pick + 34, px + 30, py + 30],
    ]);
    const clickAt = f < showDetails - 2 ? open : f < pick - 2 ? showDetails : pick;
    return (
      <AgentsWindow
        project={ctx.project}
        groups={ctx.groups}
        chatTitle={openSession(ctx)}
        transcript={
          <>
            <UserBubble y={tool ? 330 : 360} text={ctx.prompt} />
            {ctx.reply ? (
              <div style={{position: 'absolute', left: 335, top: 412, width: 583}}>
                <T style={{whiteSpace: 'normal', lineHeight: '20px'}}>{ctx.reply}</T>
              </div>
            ) : null}
          </>
        }
        input={<ChatInput model={{label: current, effort: summary(afterPick), p: 1, open: opened > 0}} />}
      >
        {opened > 0 && listOut < 1 ? (
          <div style={{position: 'absolute', left: X, top: listTop, width: W, height: listH, boxSizing: 'border-box', borderRadius: 7, background: AW.menu, border: `1px solid ${AW.menuBorder}`, boxShadow: '0 10px 30px rgba(0,0,0,0.5)', opacity: clamp(opened * 1.4) * (1 - listOut), transform: `translateY(${(1 - opened) * 8}px)`}}>
            <div style={{position: 'absolute', left: 6, top: 4, height: 22, display: 'flex', alignItems: 'center', gap: 6}}>
              <div style={{height: 22, padding: '0 8px', borderRadius: 4, background: AW.selected, display: 'flex', alignItems: 'center', gap: 5}}>
                <Codicon name="copilot" size={13} color={AW.strong} />
                <T color={AW.strong}>Copilot</T>
              </div>
              <Codicon name="add" size={14} color={AW.muted} />
            </div>
            <Codicon name="search" size={14} color={AW.muted} style={{position: 'absolute', right: 10, top: 8}} />
            {entries.map((m, i) => {
              const right = i === sel ? summary(false) : m.description;
              return (
                <div key={`${m.label}-${i}`} style={{position: 'absolute', left: 4, top: rowY(i) - listTop, width: W - 10, height: ROW, boxSizing: 'border-box', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 6, padding: '0 8px 0 6px', background: i === sel ? AW.menuSelected : undefined}}>
                  <div style={{width: 14, display: 'flex'}}>{i === sel ? <Codicon name="check" size={13} color={AW.strong} /> : null}</div>
                  <T color={m.disabled ? AW.faint : AW.strong}>{m.label ?? ''}</T>
                  {right ? (
                    <div style={{marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 3}}>
                      <T size={12} color={AW.muted}>
                        {right}
                      </T>
                      <Codicon name="chevron-right" size={12} color={AW.muted} />
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : null}
        {cardIn > 0 ? (
          <div style={{position: 'absolute', left: X, top: cardTop, width: W, height: cardH, boxSizing: 'border-box', borderRadius: 7, background: AW.menu, border: `1px solid ${AW.menuBorder}`, boxShadow: '0 10px 30px rgba(0,0,0,0.5)', opacity: cardIn}}>
            <div style={{position: 'absolute', left: 10, top: 8, height: 18, display: 'flex', alignItems: 'center', gap: 8}}>
              <Codicon name="arrow-left" size={14} color={AW.muted} />
              <T weight={600} color={AW.strong}>
                {model}
              </T>
            </div>
            {sections.map((s, i) => {
              const lit = i === picked && afterPick ? (s.pick as number) : s.selected;
              return (
                <React.Fragment key={s.title}>
                  <div style={{position: 'absolute', left: 12, top: sectionY(i) - cardTop, height: 18, display: 'flex', alignItems: 'center', gap: 6}}>
                    <T size={12} weight={600} color={AW.fg}>
                      {s.title}
                    </T>
                    {s.value && lit < 0 ? (
                      <T size={12} color={AW.muted}>
                        {s.value}
                      </T>
                    ) : null}
                  </div>
                  <div style={{position: 'absolute', left: 12, top: sectionY(i) - cardTop + 20, width: W - 24, height: SEG, boxSizing: 'border-box', borderRadius: 5, border: `1px solid ${AW.menuBorder}`, display: 'flex', gap: 2, padding: 1}}>
                    {s.options.map((o, k) => (
                      <div key={o} style={{flex: 1, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', background: k === lit ? '#3a3d41' : undefined, transform: i === picked && k === s.pick ? `scale(${1 - 0.05 * press(f, pick)})` : undefined}}>
                        <T size={12} color={k === lit ? AW.strong : AW.muted}>
                          {o}
                        </T>
                      </div>
                    ))}
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        ) : null}
        {f >= open - 28 ? <Cursor x={cx} y={cy} press={press(f, clickAt)} opacity={clamp((f - (open - 28)) / 6)} /> : null}
        <ClickRing x={cx} y={cy} f={f} at={open + 2} />
        <ClickRing x={cx} y={cy} f={f} at={showDetails + 2} />
        {picked >= 0 ? <ClickRing x={cx} y={cy} f={f} at={pick + 2} /> : null}
      </AgentsWindow>
    );
  };
  return {
    Component,
    // The picker whole in both its views (the list, the Details) and its button under them, from the input's left edge
    // (so the input's own words aren't cut at the rim).
    loupe: {block: [INPUT.x - 5, Math.min(listTop, cardTop) - 10, X + W + 10 - (INPUT.x - 5), 680 - (Math.min(listTop, cardTop) - 10)]},
    cues: [{at: open, sfx: 'click', volume: 0.22}, {at: showDetails, sfx: 'click', volume: 0.2}, ...(picked >= 0 ? [{at: pick, sfx: 'click', volume: 0.2}] : [])],
    chrome: 'window',
  };
};
