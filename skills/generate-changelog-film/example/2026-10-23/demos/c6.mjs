// c6 · #343498: the Agents window's new session composer, now the default. Setup opens the Agents window, which opens
// on a new session; the recording types an idea into the composer on "composer".
export async function setup({ openAgentsWindow, sleep }) {
	await openAgentsWindow();
	await sleep(1500);
}

export default async function demo({ page, click, type, mark, step, cue, sleep }) {
	const input = page.locator('.interactive-input-part').filter({ visible: true }).first();
	mark('composer', input);
	await sleep(300);
	await cue('new');
	await click(input);
	await type('Add a dark mode toggle to the settings page', { delay: 30 });
	step('typed');
	await cue.end({ offset: 1.6 });
}
