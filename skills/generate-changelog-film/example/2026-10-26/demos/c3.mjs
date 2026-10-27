// c3 · #344158: Remote Environments management is on by default (environmentPickerManageRemotes: true). Its entry points
// need the Environment picker and remote agent hosts, so this profile turns those on, as the PR's manual test does;
// GitHub Environments stays off. On "now" the Sessions list's More Actions menu opens, with Manage Remote Environments
// first; on "Sessions" the pointer rests on it. It isn't opened: the editor would list the account's own machines.
export const settings = {
	'sessions.chat.experimental.environmentPicker': true,
	'sessions.chat.experimental.newSessionComposerLayout': true,
	'sessions.chat.unifiedWorkspacePicker.enabled': true,
	'chat.remoteAgentHostsEnabled': true,
	'chat.agentHost.githubEnvironments.enabled': false,
	'sessions.chat.experimental.welcomeMessages': { mode: 'replace', phrases: ['What are we building?'] },
};

export async function setup({ openAgentsWindow, sleep }) {
	await openAgentsWindow();
	await sleep(2500);
}

export default async function demo({ page, click, moveTo, press, sleep, mark, step, begin, cue }) {
	const more = page.locator('a.action-label[aria-label="More Actions..."]').filter({ visible: true }).first();
	const entry = page.locator('.monaco-menu .action-label, .context-view .action-label').filter({ visible: true }).filter({ hasText: 'Manage Remote Environments' }).first();
	const menu = page.locator('.monaco-menu, .context-view .monaco-menu-container').filter({ visible: true }).first();
	mark('more', more);
	mark('menu', menu);
	mark('entry', entry, { text: 'Manage Remote Environments' });
	await more.waitFor({ state: 'visible', timeout: 20_000 });
	await moveTo(page.locator('.agent-sessions-header-label').filter({ visible: true }).first(), 10);
	await sleep(400);
	begin();
	await cue('now', { offset: -0.1 });
	await click(more, { pause: 150 });
	if (!await entry.waitFor({ state: 'visible', timeout: 2500 }).then(() => true, () => false)) {
		await click(more, { pause: 100 });
		await entry.waitFor({ state: 'visible', timeout: 5000 });
	}
	step('menu');
	await cue('Sessions');
	// The pointer rests in the entry's row, past its label, covering none of its words.
	const box = await entry.boundingBox();
	await page.mouse.move(box.x + box.width + 16, box.y + box.height / 2 + 2, { steps: 12 });
	step('entry');
	await cue.end({ offset: 1.2 });
	await press('Escape');
}
