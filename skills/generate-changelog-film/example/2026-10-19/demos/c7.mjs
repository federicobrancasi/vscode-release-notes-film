// c7 · #337719: Language Status says when a file's diagnostics are cut. A stylesheet with 1,500 empty rules gets a
// warning per rule from the built-in CSS language features; an extension's diagnostic collection keeps 1,000 per file,
// so the language status reports that some diagnostics are not shown. Nothing is changed outside the throwaway profile.
const css = `${Array.from({length: 1500}, (_, i) => `.rule-${i + 1} {}`).join('\n')}\n`;

export const files = {'styles.css': css};
export const settings = {'workbench.startupEditor': 'none'};

export async function setup({page, sleep}) {
	await page.keyboard.press(process.platform === 'darwin' ? 'Meta+P' : 'Control+P');
	await page.locator('.quick-input-widget').waitFor({state: 'visible', timeout: 10_000});
	await page.keyboard.type('styles.css', {delay: 18});
	await sleep(700);
	await page.keyboard.press('Enter');
	await page.locator('.monaco-editor .view-lines').first().waitFor({state: 'visible', timeout: 15_000});
	// The CSS language server validates on open: give it time to publish its warnings.
	await sleep(6000);
}

export default async function demo({page, moveTo, mark, step, cue}) {
	const status = page.locator('a.statusbar-item-label[aria-label^="Editor Language Status"]').first();
	const hover = page.locator('.monaco-hover, .workbench-hover').filter({visible: true}).filter({hasText: 'Some diagnostics are not shown'}).first();
	mark('status', status);
	mark('hover', hover, {text: 'Some diagnostics are not shown'});
	await cue('Language Status');
	await moveTo(status, 20);
	await hover.waitFor({state: 'visible', timeout: 10_000});
	step('hover');
	await cue.end();
}
