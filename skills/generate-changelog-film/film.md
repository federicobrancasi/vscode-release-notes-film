# The film: its grammar and its episode

## The shell

The film runs 120 BPM at 60 fps, so a beat is 30 frames and every scene is a whole number of beats. Every cut lands on
the music. `npm run episode` writes the edit to `film/episode/timeline.json`:

| Scene | Beats | What it shows |
|-------|-------|---------------|
| `logo` | 5 | A line of light scans; the VS Code icon swings in; "VS Code Changelog" and the day rise; the camera dives into the icon's light-blue bar. |
| `stream` | 4 | The day's merges fly past in 3D around a counter that runs to their number. The intro line starts as the logo dives. |
| `top` | 4 | Everything but the picks falls away. The picks fly into a list beside "Today's top ten", each PR's title turning into its change's headline. The first opens into change 01's title panel. |
| `c1` … `c10` | ≥ 10 each | One per change, as long as its line (from 50 frames in) plus a breath, rounded up to whole beats: `max(10, ceil((50 + line frames + 20) / 30))`. |
| `end` | 5 | The last change wipes into the icon's blue. The camera pulls back out of it to the icon, "VS Code Changelog" and the day. Nothing is said: the music has it. |

The theme (`film/assets/music/theme.flac`, an original track made for the film) is fitted to the edit every time it
changes. Its drop lands on change 01, it ends on the end card's fourth beat, and its last chord rings out. The music
ducks to 36 % under each line. Sound effects mark the cuts, the panels, the lens and each drawn click. There is no
letterbox; a fine grain, a soft vignette and a lifted black point finish every frame.

## A change

Frames into a change (`src/beats.ts`):

| Frame | What happens |
|-------|--------------|
| 0–14 | The change's blue title panel wipes in over the last one, an edge of light leading. Its number rolls on from the last one's. |
| 6 | The eyebrow and `#<PR>`, then the headline word by word. |
| 34–54 | The panel becomes VS Code's window, which settles at the right of the frame. Its words settle into a caption at the bottom left. |
| 50 | The line starts. |
| 84 (window frame 50) | The lens drops onto the block that changed. It opens as an aperture over the same UI, then magnifies it in place; a light runs once around its rim, and the window around it dims. |
| ~109 (window frame 75) | The lens has focused. A drawn change acts on its words from here. |

*Window frames* (`fv`) count from 34, when the window starts to appear. Drawn scenes time their events in window frames.

**The lens** (`src/changes/Loupe.tsx`):
- **One per change.** It is set once and never moves.
- **It frames the whole block that changed.** That is the button with its label and the list it's in, never the lone button.
- **It shows the block whole.** The block is at most 670 × 420 window px, so it shows at least 1.4× (`npm run check` refuses a bigger one).
- **It holds still.** It covers its block, stays inside the window, and never shows past the window's edges.
- **Nothing is drawn over the magnified UI.** The glass is a crisp rim, a light along its edge, and a shadow.

## film.json

The film's words and choices for the day, in the engine project next to `facts.md`. The example's
([example/2026-10-19/film.json](example/2026-10-19/film.json)) is the model.

```json
{
	"intro": "Forty-nine changes in a single day. Here are ten you'll notice.",
	"changes": {
		"1": {
			"headline": "Signed out? The Welcome page offers GitHub sign-in",
			"eyebrow": "When you're signed out",
			"say": "The Welcome page now offers GitHub sign-in when you're signed out.",
			"visual": { "scene": { "name": "button-swap", "params": {
				"before": { "text": "Try out the new Agents window", "icon": "agent" },
				"after": { "text": "Sign in to GitHub", "icon": "github" } } } },
			"motion": { "sync": { "swap": "GitHub" } }
		},
		"2": {
			"headline": "Session rows lead with New Nested Session",
			"eyebrow": "A session's first button",
			"say": "A session's first button now starts a nested session.",
			"visual": { "demo": "c2" },
			"motion": { "loupe": { "block": [0, 40, 290, 240] } }
		}
	}
}
```

- **`intro`**: about 12 words, said as the logo dives and the merges stream past. Name the day's number of merges in
  words and what's coming ("Forty-nine changes in a single day. Here are ten you'll notice.").
- **`changes`**: one per pick, by its rank in `picks.json`.
  - **`headline`**: what changed for users, at most 52 characters. It is the title panel's and the caption's. Sentence
    case, no period.
  - **`eyebrow`**: where it is, at most 26 characters (`In the Agents window`). Optional.
  - **`say`**: the line said as the change is shown, at most 12 words. It names what the lens shows, in the UI's words.
  - **`visual`**: `{"demo": "<id>"}`, a recording of `demos/<id>.mjs`, or `{"scene": {"name", "params"}}`, a scene of the
    library ([scenes.md](scenes.md)) drawn from the PR's strings.
  - **`motion`**:
    - **`sync`** (a scene): each event the scene acts out, on the word of the line that names it: `{"swap": "GitHub"}`. An
      event happens when the voice starts saying the first word that begins with its word (case and punctuation aside),
      and never before the lens is on. Pick the word that names what happens: the label that appears, the button that's
      pressed.
    - **`loupe`**: `{"block": [x, y, w, h]}`, the block the lens frames, in the window's 1280 × 720 px; `mag` sets its
      magnification by hand (rarely). Required for a recording; a scene has its own.
    - **`from`** (a recording): the second it starts at. By default it's where its narration starts in the recording, so
      its `cue()`s land on the film's words. Set it only when a recording was paced another way.
    - **`hero`** (a recording): the demo's marks that show what changed, when there's no `loupe` (the lens then frames
      them, padded).
- **`pronounce`** (optional): how the voice says a word (`{"vscode": "V S Code"}`), as in the engine's storyboard.

`npm run check -- <project>` refuses `film.json` when:
- a line is over 12 words;
- a headline or a line names a build (Stable, Insiders);
- a sync word isn't in its line, or isn't one of its scene's events;
- a sync word is said before the lens is on (in the line's first half second, once the lines are voiced): its event
  can't be on it;
- a scene's label isn't the PR's own string;
- a lens block isn't inside the window, is a lone control, or is bigger than the lens shows whole;
- a recording isn't recorded (once the lines are voiced: before, it's a note, as recordings come after the voice);
- the narration doesn't say the lines as written.

## Recordings

The engine records VS Code (`prs demo`, changelog-videos' `recording.md`). For the film:

- **Pace it to the film's line.** After `prs voice`, a demo's `cue('phrase')` waits for the film's own line to say the
  phrase. The line is short (about 3.5 s), so do the change on its last words: `cue('nested session')`, then
  `cue.end({ offset: 1.5 })` so the result stays on screen. The film plays the recording from where its narration
  starts, so the action lands on the word in the film too.
- **Keep it moving for 5 s** from the narration's start: that's what a change shows, and the lens is on it from about
  1.2 s.
- **What opens its own window.** The recording is of one window. When the change opens another one (the issue
  reporter does, by default), set the setting that opens it in the window instead
  (`'issueReporter.wizard.openLocation': 'editor'`), and say so in `notes.md`. Do what comes before the line (typing
  a command) first, then `begin()`: the narration starts there, and the change lands on its word.
- **A setting.** Open it in `setup()` with `setting(id)`, so the recording starts on its row, and find the row in the
  demo with a locator (`.monaco-list-row` filtered by its description): calling `setting()` again types the search
  again and makes the cues late. Set `export const settings = { 'workbench.editor.useModal': 'off' }`: Settings then
  opens in the editor, and its row wraps narrow enough for the lens (the modal's is 774 px wide). Rest the pointer on
  the description, not the checkbox: hovering the checkbox shows the setting's ID over its title.
- **Set the lens.** `build/demos/<id>/demo.json` has each mark's box (`marks.<name>.rect`, in the window's px when the
  viewport is 1280 × 720), and `contact.png` shows them. The block is the union of what changed and what it's in: the
  row and its list, the dialog whole, the input and its menu. Pad it 10–20 px and keep it within 670 × 420. Oct 19's:
  - the session list's top: `[0, 40, 290, 240]`;
  - the chat input with its slash menu: `[345, 573, 610, 127]`;
  - a dialog: `[405, 228, 470, 264]`;
  - the status bar's right end and its hover: `[745, 612, 535, 108]`.

## The commands (in `<FILM>`)

| Command | What it does |
|---------|--------------|
| `npm run check -- <project>` | `film.json` against the rules above (and the narration, once voiced) |
| `npm run lines -- <project>` | the lines into the project's `storyboard.json`, and which chapter shows which demo (`digest.json`), for `prs voice` and `cue()` |
| `npm run episode -- <project>` | the episode (`film/episode/`), the recordings and the narration (`film/public/`), the edit, the music |
| `npm run review [-- c3,c6]` | the review sheets (`out/review/<date>/`) |
| `npm run draft` | a half-size film to watch (`out/draft-<date>.mp4`) |
| `npm run master [-- --4k]` | the masters (`out/VSCode-Changelog-<date>-1080p60.mp4`, narrated, and `-music-1080p60.mp4`), each reviewed |
| `npm run deliver` | both cuts, the contact sheet and `notes.md` to `~/Downloads/changelog-videos/changelog-<date>-film/` |
| `npm run studio` | the Remotion Studio: Film (the day's), Library › Scenes (the scene library) and Scene (one scene) |
| `npm run gallery [-- --review name]` | the scene library's reel and contact sheet, or a review sheet of a scene |
| `npm run lint` | ESLint and TypeScript on `src/` |
