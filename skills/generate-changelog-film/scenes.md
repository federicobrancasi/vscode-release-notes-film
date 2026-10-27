# The scene library

A scene draws one piece of VS Code at the recordings' 1280 × 720, from the change's params. It acts the change out:
- the pointer comes, a button presses in and a ring spreads;
- a label rolls, a badge pops, a menu opens.

Each scene has a lens block of its own, and events the film times to the words of the line (`motion.sync`).

The library is `film/src/scenes/` (`library.json` describes each scene, and `npm run check` reads it). To see every scene
as the film shows it:
- **Run `npm run gallery`.** It makes the reel and its contact sheet, in `~/Downloads/changelog-videos/changelog-film-scenes/`.
- **Or open the Studio.** In `npm run studio`, the Library › Scenes composition plays them all.

## Rules for every scene

- **The PR's words.** The labels a change is about come from params and are the PR's own strings. `npm run check`
  looks for each `strings` param of the scene in the PR's diff; a string of the diff with a placeholder (`"Install and
  enable '{0}'?"`) matches with it filled in. Everything around them is example data, invented and generic:
  `my-project`, `Add an empty state`, `release-tools`.
- **Give every label the change shows.** A scene's example (`library.json`) is for the gallery. A label you leave
  out shows nothing, never the example's: a dialog without `detail` has none, a toast without `source` has none. An
  explicitly empty list is none: `"buttons": []`, `"actions": []`.
- **VS Code's real UI.** Draw it in the 1.144 layout and colours (`src/ui/kit.tsx` AW and MW), with codicons
  (`<Codicon name>`; the engine's Fluent icon names map to codicons in `src/ui/icons.ts`) and the Mac's system face.
  Never invent UI that VS Code doesn't have: no "New" chips, no made-up badges.
- **Original drawings.** Apps, pages, desktops and icons are drawn for the film: no third-party logos or artwork. The
  VS Code icon is the official one, whole (`VSCODE_ICON`), on its white squircle as an app tile.
- **Events on words.** An event happens on its sync word, else at its default time, and never before the lens is on.
  An event that takes its block away happens only on its word; without one, the pointer comes to rest on the control. Such an event closes a dialog, dismisses a toast, or picks an option that closes a list.
  A word said before the lens is on (in a line's first half second) can't have its event on it: `npm run check` refuses
  it, as the review's stills can't show it. Pick a later word, or reword the line so the word comes later.
- **Clicks show.** The button presses in (`press`), the pointer squeezes, and a ring spreads (`ClickRing`).
- **Swaps go out, then in.** Two labels are never half-faded over each other.
- **The lens block** is the whole block that changed, at most 670 × 420, and stays in the window.

## The scenes

`strings` are the params checked against the PR's diff: `items[isNew].label` means the label of each item marked
`isNew`. Each scene's full example is in `library.json` (`example`).

### Oct 19's six

| Scene | For | Params | Events | Strings |
|-------|-----|--------|--------|---------|
| `button-swap` | A page whose button changes: the Welcome page's banner | `before` / `after` `{text, icon}`, `tab` | `swap` | `before.text`, `after.text` |
| `app-badge` | The app icon in the Mac's Dock with a count badge | `count` (shows count − 1, then count), `context` | `badge` | |
| `list-actions` | A row whose actions change: a new hover action, with its tooltip, clicked; with `panel`, the rows of a details list above the chat input (a pull request's checks), the action showing on hover and spinning once clicked | `rows [{label, sub, icon}]`, `row`, `after {icon, tooltip}`, `images` (public paths), `panel {title, icon}`, `context` | `hover`, `click` | `after.tooltip` |
| `picker` | A picker in the chat input: models, modes; with `loads`, a picker that's back; with `of: "agent"`, the agent picker (a custom agent has no icon: `"icon": "blank"`); with `details`, the model picker as 1.144 draws it (each row's summary at its right, "Medium · 1M ›"), the current model's Details replacing the list on its word (a back arrow, a section per setting with a segmented control; a section with no value chosen shows `value` beside its title, "Model default"), and an option of the section with `pick` clicked | `button {label}` (the current entry), `items [{label, icon, description, disabled, isNew}]`, `loads`, `of` (model, agent), `tool` (`false`: no tool call above the reply), `details {model, sections [{title, options, selected, value, pick}]}`, `context` | `load`, `open`, `details`, `pick` | `items[isNew].label`, `items[disabled].description`, `details.sections[].title`, `details.sections[].value` |
| `queued-message` | A message queued while the agent works: removed, and what the agent does | `message`, `action` (its button's tooltip), `steps [{verb, file}]`, `context` (`reply`: the agent's) | `remove`, `done` | `action` |
| `sessions-find` | Finding in the Sessions list: Find, the query typed, the match opened | `query`, `sessions [{title, sub, pr, prompt}]`, `match`, `context` | `find`, `type`, `typed` | |

### The engine's other seven

They take the params of changelog-videos' scenes of the same name, as `prs digest scenes` lists them. Its time params
(`swapAt`, `openAt`…) are ignored: the film's events are on words.

| Scene | For | Params | Events | Strings |
|-------|-----|--------|--------|---------|
| `slash-menu` | A slash command in the chat input and its suggestions | `typed`, `entries [{label, description, isNew}]`, `placeholder`, `context` | `type`, `select` (to the first `isNew`) | `entries[isNew].label`, `entries[isNew].description` |
| `dialog` | A modal dialog: a confirmation, a warning, a permission, a setup's steps | `icon` (shield, warning, info, question), `title`, `detail` (`**…**` marks the sentence to light), `buttons [{label, primary}]` (`[]`: none), `tab`, `rows [{label, state, done, current}]` (a list in it), `rowActions` (the current row's buttons, the primary last) | `show`, `highlight`, `click` (closes it: only on its word), `act` (with rows: the current row's action is clicked, then the next row is current) | `title`, `detail`, `buttons[primary].label`, `rows[].label`, `rowActions[]` |
| `setting` | A setting: a default the PR changes, flipping by itself on its word; a new setting. With `window: "agents"`, a setting of the Agents window: Settings as its modal (a checkbox beside its description; a text box or a dropdown under it) | `id`, `description`, `kind` (checkbox, text, dropdown), `before` (only when the default changes), `after`, `window` (main, agents), `context` | `flip` | `id`, `description` |
| `command-palette` | A new or renamed command, a new keybinding | `query`, `items [{label, keybinding, isNew}]` | `type`, `select` (to the first `isNew`) | `items[isNew].label` |
| `notification` | A notification toast: a new message, new actions | `severity`, `message`, `source`, `actions`, `tab` | `show`, `click` (dismisses it: only on its word) | `message`, `actions[]` |
| `editor` | Text appearing at the cursor: the PR's own example | `file`, `lines`, `insert` (lines joined with `\n`) | `insert` | `insert` |
| `card` | No UI to show: the change in words, as release notes (a long title wraps) | `icon`, `title`, `lines [{text, mono, icon}]` | `show` | `lines[mono].text` |

### Fifteen for what a recording can't show

`sessions-organize` was added on Oct 23, 2026, the first day the skill ran on its own; `sessions-rename` and
`remote-environments` on Oct 25, 2026; `connector` and `artifact-group` on Oct 26, 2026 (scenes.md: adding a scene).

| Scene | For | Params | Events | Strings |
|-------|-----|--------|--------|---------|
| `policy` | A setting your organization manages: VS Code's indicator and its hover | `id`, `description`, `kind`, `value`, `policyDescription` | `hover` | `id`, `description`, `policyDescription` |
| `windows` | VS Code on Windows: the taskbar tile's badge, the jump list; or a terminal whose app's window opens in front of VS Code | `count`, `tasks`, `recent`, `context`; `terminal` (lines) and `prompt {title, message, account, buttons}` | `badge`, `open`; with a prompt, `prompt` | `tasks[]` |
| `web` | VS Code for the Web: the browser's address, connecting to a tunnel | `url`, `tab`, `connected`, `file`, `focus` (status, address) | `connect` | |
| `system-notification` | The OS's notification, outside the window | `title`, `message`, `actions`, `context` | `show`, `click` (only on its word) | `message`, `actions[]` |
| `sign-in` | A sign-in, told in the Accounts menu: its entry, picked, signed in | `item` (the entry), `account`, `provider` | `menu`, `pick` | `item` |
| `extension` | An extension: searched, its page, Install, installed | `query`, `name`, `publisher`, `description`, `icon`, `color`, `badge` | `search`, `install` | `badge` |
| `remote` | A remote window: the remote indicator's options, one picked, connected | `items [{label, description, icon}]`, `pick`, `connected` | `open`, `connect` (only on its word) | `pick` |
| `tool-approval` | The agent asking before it runs something: Allow's options, the result | `title`, `command`, `options`, `pick`, `output`, `context` | `ask`, `allow` | `options[]` |
| `debug` | Paused at a breakpoint, Variables, a step with its value inline | `file`, `lines`, `breakpoint`, `variables [{name, value}]`, `inline` | `pause`, `step` | |
| `update` | The Manage gear's badge, Restart to Update, the release notes | `version`, `notes` | `badge`, `restart` (only on its word) | |
| `sessions-organize` | An agent organizing the Sessions list: its tool lines in chat, sessions pinned and archived | `sessions [{title, time}]`, `pin`, `archive`, `reading` / `read` / `organizing` / `organized` (its tool lines), `context` | `read`, `organize`, `done` | `reading`, `read`, `organized` |
| `sessions-rename` | A Sessions group renamed in place: the draft typed, the list refreshing under it, the draft kept | `group` (the saved name), `draft`, `icon`, `sessions [{title, time}]`, `arrives {title, time}` (what the refresh brings), `context` | `type`, `refresh` | |
| `remote-environments` | The Agents window's Remote Environments (a modal): a group's refresh ends in a prompt and its action link; with `rows`, a group's remotes, a row's actions on hover (Connect or Disconnect, Rename, Delete) and the confirmation its Delete asks (the lens on the dialog) | `group`, `label` (the prompt), `action` (its link), `docs` (its guide), `above [{label, empty, description, docs}]` (the groups above), `context`; with rows: `rows [{label, connection}]`, `row`, `remove {title, detail, button}` | `show`, `click` (only on its word; with rows, Delete is clicked and its confirmation opens, at the earliest as the lens lands); with rows, `hover` | `label`, `action`, `remove.title`, `remove.detail`, `remove.button` |
| `connector` | A Copilot connector's page in Customizations › Browse (an authorization on the account): Connect turning into the disabled Connecting... with Cancel, Cancel clicked, Connect back. Measured on a capture of 1.144's page; the icon is an original tile | `name`, `publisher`, `description`, `icon`, `color`, `type`, `source`, `connecting` (the busy label), `cancel` (the new button) | `connect`, `cancel` | `cancel` |
| `artifact-group` | A chat's artifacts of one integration in one pill above the chat input ("5 Pull Requests", its icon the state that needs attention most), its dropdown opened, the first row's actions on hover (Open, Pin, Remove) | `label` (the group label), `items [{number, title, state (failing, open, draft, merged, closed), checks, comments}]`, `context` | `open`, `hover` | `label` |

**`context`** (the scenes in the Agents window) sets what's around the change:
```json
{"project": "my-project", "groups": [{"label": "my-project", "icon": "folder", "sessions": [{"title": "Add an empty state", "time": "now", "selected": true}]}], "prompt": "…", "reply": "…"}
```
The selected session is the open one; `prompt` is its message and `reply` the agent's.

## Trying a scene with the day's params

Before the episode, render one scene with the change's params, as the film would show it (the events at their defaults):

```sh
npx remotion still Scene out/try.png --frame=190 --props='{"name":"dialog","params":{"title":"…","buttons":[{"label":"Cancel"},{"label":"Allow","primary":true}]}}'
```

Frames 60, 120, 190 and 270 are the window landed, the lens focused, the change, and late.

## Adding a scene

When no scene fits, add one, like the others:

1. **The file.** `film/src/scenes/<name>.tsx` exports a `SceneMake`: `(params, {ev, has, day}) => {Component, loupe,
   cues, chrome}`.
   - **`Component({f, D})`** draws the 1280 × 720 window at frame `f` (window frames: the lens is on from `A`, 54).
   - **`loupe.block`** is the block the lens frames.
   - **`cues`** are its sounds (`click`, `pop`, `tick`), at window frames.
   - **`chrome`** is `'window'` (the film draws the Mac's window buttons) or `'screen'` (a desktop that draws its own).

   Time each event with `ev('<name>', default, earliest)`; `has('<name>')` says whether it's on a word. Read params
   with `str`, `num`, `list`, `obj` and `contextOf` (`scenes/common.ts`).
2. **The UI kit.** Build it from the kit in `film/src/ui/`:
   - `Workbench`: the main window, its side bar, tabs, editor and status bar;
   - `AgentsWindow`, `ChatInput`, `UserBubble`;
   - `Code`: the editor's text, with breakpoints, inline values and inserted lines;
   - `QuickInput`, `Dialog`, `Toast`, `Menu`;
   - `SettingsEditor`;
   - the Mac desktop (`Wallpaper`, `MenuBar`, `Dock`, `AppIcon`);
   - `Cursor`, `cursorAt`, `ClickRing`, `Tooltip`, `Codicon`, `T`.

   Measure what you draw on a recording or a capture of the real UI.
3. **Register it.** Add it to `scenes/index.ts` (`SCENES`) and to `scenes/library.json` (`title`, `for`, `group: "new"`,
   `events`, `strings`, and an `example` with invented, generic data).
4. **Check it.** Run `npm run lint`, then `npm run gallery -- --review <name>`, and open its sheet
   (`out/gallery/review/<name>.png`). Check it against style.md, and that the lens shows its block whole at every
   moment.
