import React from 'react';
import {clamp, settle} from '../motion';
import {CODE, Code} from '../ui/Editor';
import {AW, Codicon, T} from '../ui/kit';
import {contentTop, editorBox, Workbench} from '../ui/Workbench';
import {A, list, num, str} from './common';
import type {SceneMake} from './types';

// Debugging (a runtime a recording can't start): the program stops at a breakpoint on its word (the line lit, the debug
// toolbar, the status bar orange), Variables shows the values, and a step moves to the next line with a value inline.
//   params: file, lines (the code), breakpoint (its line number), variables [{name, value}], inline (the value shown
//           after the line it steps to)
//   events: pause (it stops at the breakpoint), step (Step Over)

const DEFAULT = ['function total(items) {', '  let sum = 0;', '  for (const item of items) {', '    sum += item.price * item.qty;', '  }', '  return sum;', '}', '', 'const cart = [{price: 4, qty: 2}, {price: 10, qty: 1}];', 'console.log(total(cart));'];

export const debug: SceneMake = (params, {ev}) => {
  const file = str(params, 'file', 'cart.js');
  const given = list<{label: string}>(params, 'lines').map((l) => l.label);
  const lines = given.length ? given : DEFAULT;
  const bp = Math.round(num(params, 'breakpoint', 4));
  const vars = list<{name?: string; value?: string}>(params, 'variables');
  const variables = vars.length ? vars.map((v) => ({name: v.name ?? '', value: v.value ?? ''})) : [{name: 'sum', value: '8'}, {name: 'item', value: '{price: 10, qty: 1}'}, {name: 'items', value: 'Array(2)'}];
  const inline = str(params, 'inline', 'sum = 18');
  const pause = ev('pause', A - 6, A - 24);
  const step = ev('step', pause + 60, pause + 30);
  const box = editorBox(true);
  const top = contentTop + 10;
  const Component: React.FC<{f: number}> = ({f}) => {
    const paused = f >= pause;
    const stepped = f >= step + 6;
    const at = stepped ? bp + 1 : bp;
    const toolbar = settle(f, pause);
    return (
      <Workbench
        activity="debug-alt"
        sidebar={{
          title: 'Run and Debug',
          content: (
            <>
              {[['Variables', 0], ['Watch', 1], ['Call Stack', 2], ['Breakpoints', 3]].map(([label, i]) => (
                <div key={label as string} style={{position: 'absolute', left: 60, top: 74 + (i as number) * 26 + (i ? variables.length * 22 + 12 : 0), display: 'flex', alignItems: 'center', gap: 4}}>
                  <Codicon name={i === 0 ? 'chevron-down' : 'chevron-right'} size={14} color={AW.muted} />
                  <T weight={600} color={AW.strong} size={11} style={{textTransform: 'uppercase'}}>
                    {label}
                  </T>
                </div>
              ))}
              {paused
                ? variables.map((v, i) => (
                    <div key={v.name} style={{position: 'absolute', left: 82, top: 100 + i * 22, display: 'flex', gap: 6, opacity: clamp((f - pause - i * 3) / 8)}}>
                      <T color="#c586c0">{`${v.name}:`}</T>
                      <T color={i === 0 && stepped ? '#ffffff' : '#b5cea8'} style={i === 0 && stepped ? {background: 'rgba(0,120,212,0.35)', borderRadius: 2, padding: '0 2px'} : undefined}>
                        {i === 0 && stepped ? inline.split('=').pop()?.trim() ?? v.value : v.value}
                      </T>
                    </div>
                  ))
                : null}
            </>
          ),
        }}
        tabs={[{label: file, active: true}]}
        editor={<Code x={box.x} y={top} w={box.w} lines={lines} lang="ts" breakpoints={[bp]} paused={paused ? at : undefined} values={stepped ? [{line: bp, text: inline}] : []} />}
        status={{bg: paused ? '#cc6633' : undefined, left: paused ? <T size={12} color="#ffffff">{`Debugging ${file}`}</T> : undefined}}
      >
        {toolbar > 0 ? (
          <div style={{position: 'absolute', left: 560, top: 46, height: 28, display: 'flex', alignItems: 'center', gap: 4, padding: '0 6px', borderRadius: 6, background: '#2a2b2e', border: `1px solid ${AW.menuBorder}`, boxShadow: '0 6px 18px rgba(0,0,0,0.45)', opacity: toolbar, transform: `translateY(${(1 - toolbar) * -8}px)`}}>
            <Codicon name="gripper" size={14} color={AW.faint} />
            {[['debug-continue', '#75beff'], ['debug-step-over', '#75beff'], ['debug-step-into', '#75beff'], ['debug-step-out', '#75beff'], ['debug-restart', '#89d185'], ['debug-stop', '#f48771']].map(([name, color]) => (
              <div key={name} style={{width: 24, height: 24, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', background: name === 'debug-step-over' && Math.abs(f - step) < 6 ? 'rgba(255,255,255,0.14)' : undefined}}>
                <Codicon name={name} size={16} color={color} />
              </div>
            ))}
          </div>
        ) : null}
      </Workbench>
    );
  };
  return {
    Component,
    loupe: {block: [box.x + 4, top + (bp - 3) * CODE.lineH - 6, 640, 6 * CODE.lineH + 12]},
    cues: [{at: pause, sfx: 'pop', volume: 0.14}, {at: step, sfx: 'click', volume: 0.2}],
    chrome: 'window',
  };
};
