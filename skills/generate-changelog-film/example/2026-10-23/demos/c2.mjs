// c2 · #343555: Voice Mode's session awareness: the new setting agents.voice.sessionAwareness, on by default. Settings
// opens in the editor (not the modal); setup opens it on the setting, and the pointer comes to its row on "tell".
export const settings = { 'workbench.editor.useModal': 'off' };

export async function setup({ setting }) {
	await setting('agents.voice.sessionAwareness');
}

export default async function demo({ page, mark, step, moveTo, cue }) {
	const row = page.locator('.monaco-list-row').filter({ visible: true }).filter({ hasText: 'bounded briefing' }).first();
	mark('row', row);
	await cue('tell');
	await moveTo(row.getByText('bounded briefing', { exact: false }).first(), 20);
	step('row');
	await cue.end({ offset: 1.8 });
}
