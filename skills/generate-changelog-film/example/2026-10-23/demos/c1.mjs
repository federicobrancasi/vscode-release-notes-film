// c1 · #343672: GitHub Environments, on by default: the new setting chat.agentHost.githubEnvironments.enabled. Settings
// opens in the editor (not the modal), so its row wraps narrow enough for the lens; setup opens it on the setting, and
// the pointer comes to its row on "GitHub".
export const settings = { 'workbench.editor.useModal': 'off' };

export async function setup({ setting }) {
	await setting('chat.agentHost.githubEnvironments.enabled');
}

export default async function demo({ page, mark, step, moveTo, cue }) {
	const row = page.locator('.monaco-list-row').filter({ visible: true }).filter({ hasText: 'Enable sharing this machine' }).first();
	mark('row', row);
	await cue('GitHub');
	await moveTo(row.getByText('Enable sharing this machine', { exact: false }).first(), 20);
	step('row');
	await cue.end({ offset: 1.6 });
}
