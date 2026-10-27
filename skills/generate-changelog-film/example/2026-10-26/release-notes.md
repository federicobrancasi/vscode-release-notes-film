# VS Code Changelog · Monday, October 26, 2026

A 61-second film of the day's top ten changes in VS Code: two recorded in the Agents window, five drawn, three cards.
Narrated, cut on the beat of its theme, and reviewed frame by frame.

**[▶ Watch](https://github.com/federicobrancasi/vscode-release-notes-film/releases/download/2026-10-26/VSCode-Changelog-2026-10-26-1080p60.mp4)** ·
[music only](https://github.com/federicobrancasi/vscode-release-notes-film/releases/download/2026-10-26/VSCode-Changelog-2026-10-26-music-1080p60.mp4) ·
[contact sheet](https://github.com/federicobrancasi/vscode-release-notes-film/releases/download/2026-10-26/contact.png)

## The ten changes

### 01 · The agent can now design your chat background
In the Agents window, the agent gets two tools, Get Theme Colors and Set Chat Background (the "Appearance" tool group),
and a built-in skill, `/generate-chat-background`. They're on by default; `chat.agentSessions.appearanceTools.enabled`
turns them off. [microsoft/vscode#344060](https://github.com/microsoft/vscode/pull/344060) by @benibenj
**In the film:** recorded in the Agents window: `/generate-chat` typed in a new session, and the slash menu shows the skill with its description.

### 02 · Shared environments get a Delete action
In Remote Environments, a user-shared environment's row has Delete after Rename. It asks first ("Are you sure you want
to delete environment '{0}'?") and removes the registration, not the machine's files.
[microsoft/vscode#344083](https://github.com/microsoft/vscode/pull/344083) by @chrmarti
**In the film:** drawn (`remote-environments`): Delete clicked, and its confirmation. A user-shared environment needs a real machine.

### 03 · Remote Environments management, on by default
`sessions.chat.experimental.environmentPickerManageRemotes` is now on by default: "Manage Remote Environments" is in
the Command Palette and the Sessions list's More Actions menu, and "Manage..." in the Environment picker.
[microsoft/vscode#344158](https://github.com/microsoft/vscode/pull/344158) by @chrmarti
**In the film:** recorded in the Agents window: the More Actions menu, Manage Remote Environments first.

### 04 · In the Agents window, diffs default to cards
In the Agents window, the multi diff editor (a session's changes) shows each file in its own card by default:
`multiDiffEditor.experimental.variant` defaults to `cards` there, while the editor window keeps `noCards`.
[microsoft/vscode#344164](https://github.com/microsoft/vscode/pull/344164) by @alexdima
**In the film:** drawn (`setting`): the setting's value flips from `noCards` to `cards` in the Agents window's Settings.

### 05 · Cancel a connector while it connects
While a Copilot connector connects, its page in Chat: Open Customizations › Browse shows the disabled "Connecting..."
and a new "Cancel"; cancelling returns to "Connect" with no error.
[microsoft/vscode#344192](https://github.com/microsoft/vscode/pull/344192) by @vritant24
**In the film:** drawn (`connector`): Connect, then Connecting... with Cancel, then Cancel. Connecting would start an authorization on the account.

### 06 · Cloud models show their real context sizes
In a Cloud chat, a model's Details offer the context sizes the Cloud catalogue advertises (for example 272K and 1M),
the choice survives model switches, and an unset effort shows "Model default" under "Effort Level".
[microsoft/vscode#344092](https://github.com/microsoft/vscode/pull/344092) by @osortega
**In the film:** drawn (`picker`): a model's Details, 1M picked. A Cloud chat needs a sandbox.

### 07 · Reviews of agent edits stay in sync
Copilot edit reviews keep open diffs current, wait for each Keep or Undo before moving to the next file, and keep
unsaved edits when a checkpoint is restored. [microsoft/vscode#344133](https://github.com/microsoft/vscode/pull/344133) by @justschen
**In the film:** a card: it's timing between the agent and the editor, with no new UI to point at.

### 08 · Pull requests in a chat share one pill
In the Agents window, artifacts from one integration share one pill above the chat input, such as "5 Pull Requests",
its icon showing the state that needs attention most; its dropdown lists each one, with Open, Pin and Remove.
[microsoft/vscode#344175](https://github.com/microsoft/vscode/pull/344175) by @benibenj
**In the film:** drawn (`artifact-group`): the pill, and its dropdown opened. It needs a chat with several pull requests.

### 09 · Relative links open from the chat's folder
In Agent Host chats, relative file links in a response open against the chat's working directory, in history too, and
a URL approval shows its target before you approve.
[microsoft/vscode#344087](https://github.com/microsoft/vscode/pull/344087) by @osortega
**In the film:** a card: a relative link needs an agent's reply in a repository.

### 10 · Steering HydraFusion no longer looks stuck
A steering message sent while a HydraFusion phase runs now takes over the running workflow: the phase shows again, and
its tool calls keep appearing. [microsoft/vscode#344017](https://github.com/microsoft/vscode/pull/344017) by @sbatten
**In the film:** a card: a running HydraFusion workflow, with no UI strings.

## Also in the report

- [microsoft/vscode#343974](https://github.com/microsoft/vscode/pull/343974): a Canvases filter in the customization marketplace. By @jruales.
- [microsoft/vscode#344135](https://github.com/microsoft/vscode/pull/344135): Remotes shows connection errors and fixes its layout. By @chrmarti.

## How it was made

- From the #changelog report's top ten; 36 pull requests merged in its window.
- Recorded in VS Code Insiders 1.144, signed in. One pick (change 06) wasn't in Insiders yet, and building main failed
  on its Node.js version, so it is drawn.
- Narrated by MAI-Voice-2 at pace 1.2, every line heard as written.
- Reviewed in two rounds, every sheet at full size:
  - round 1 moved three events that came before the lens (changes 02, 09 and 10);
  - round 2 was clean.
- Mastered from three renders voted frame by frame (they disagreed on 0 of 3,660 frames). Both cuts are −13.9 LUFS,
  with a true peak of −1.4 dBTP (narrated) and −1.5 dBTP (music). Both pass 9/9 checks.

## Render it again

From a clone of this repo: `cd film && npm ci && npm run music && npm run master`. The repo's README has the details.

## Credits

The changes are by @benibenj, @chrmarti, @alexdima, @vritant24, @osortega, @justschen and @sbatten.

The film uses:
- [Remotion](https://remotion.dev), which needs a company licence;
- MAI-Voice-2, an AI voice;
- an original theme made for the film;
- the changelog-videos engine.

VS Code and its icon are Microsoft's; see NOTICE.
