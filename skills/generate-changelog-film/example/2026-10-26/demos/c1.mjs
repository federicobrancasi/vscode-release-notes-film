// c1 · #344060: the Agents window's agent gets appearance tools (Get Theme Colors, Set Chat Background) and a built-in
// skill, /generate-chat-background, on by default. The new-session composer: on "generates", /generate-chat goes in and
// suggestions are asked for, so the slash menu shows the skill alone with its description (typed letter by letter, "/"
// would first list every skill of the profile); on "background" the pointer comes to it. Before the line, the side
// panel is widened so the composer narrows and its menu (the input's width, at the cursor) fits the lens with it. The
// welcome heading has no name (welcomeMessages), so no account's name shows.
export const settings = {
	'sessions.chat.experimental.welcomeMessages': { mode: 'replace', phrases: ['What are we building?'] },
};

export async function setup({ openAgentsWindow, sleep }) {
	await openAgentsWindow();
	await sleep(2500);
}

export default async function demo({ page, click, moveTo, press, sleep, mark, step, begin, cue }) {
	const input = page.locator('.interactive-input-part .monaco-editor, .chat-input-container .monaco-editor, .new-chat-input-area .monaco-editor').filter({ visible: true }).last();
	const composer = page.locator('.interactive-input-part, .new-chat-input-area').filter({ visible: true }).last();
	const skill = page.locator('.suggest-widget .monaco-list-row').filter({ visible: true }).filter({ hasText: 'generate-chat-background' }).first();
	const ask = async () => {
		// /generate-chat goes in at once, then suggestions are asked for: the menu opens on the skill alone (typed letter
		// by letter, "/" would first list every skill of the profile, and a fuzzy filter keeps others).
		await page.keyboard.insertText('/generate-chat');
		await press('Control+Space');
		await skill.waitFor({ state: 'visible', timeout: 5000 });
	};
	mark('composer', composer);
	mark('skill', skill, { text: 'Generate or design an image' });
	await input.waitFor({ state: 'visible', timeout: 20_000 });
	// Before the line (not in the film): the side panel is made 100 px wider, so the composer narrows and the slash menu
	// (the input's width, opening at the cursor) stays within the lens with the input.
	const sash = await page.evaluate(() => {
		const r = [...document.querySelectorAll('.monaco-sash.vertical')].map(s => s.getBoundingClientRect()).filter(b => b.height > 300 && b.x > 900 && b.x < 1000)[0];
		return r ? { x: r.x + r.width / 2, y: r.y + r.height / 2 } : null;
	});
	if (sash) {
		await page.mouse.move(sash.x, sash.y, { steps: 6 });
		await sleep(250);
		await page.mouse.down();
		await page.mouse.move(sash.x - 50, sash.y, { steps: 6 });
		await page.mouse.move(sash.x - 100, sash.y, { steps: 6 });
		await page.mouse.up();
		await sleep(600);
	}
	await click(input);
	await sleep(300);
	await page.mouse.move(760, 300, { steps: 10 });
	await sleep(400);
	begin();
	await cue('generates', { offset: -0.15 });
	await ask();
	step('skill');
	await cue('background');
	// The pointer comes to rest just past the row's end, covering none of its words.
	const row = await skill.boundingBox();
	await page.mouse.move(row.x + row.width + 10, row.y + row.height / 2 + 2, { steps: 14 });
	await cue.end({ offset: 1.5 });
	await press('Escape');
}
