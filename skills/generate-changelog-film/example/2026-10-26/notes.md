# Notes: Oct 26, 2026

The decisions of a run nobody watched, one line each. Made by the generate-changelog-film skill, from its docs.

## Setup and the build

- `prs digest new` (no `--date`): today's report has 12 picks; the film takes the top ten (#344060 … #344017).
- One pick, c6 #344092 (merged 07:31 UTC), is in no Insiders build, so the engine built main (ff05b50d4): `npm ci` failed, as main's `.nvmrc` wants Node.js 24.22.1 and this Mac has 24.21.0.
- It fell back to the installed Insiders 1.144.0-insider (131aec7f1, built 04:58 UTC), which has the other nine picks: only c6 says "not in the demo build" (not every pick, as SKILL.md said: fixed there).
- Decided: kept Insiders and didn't build main with Node.js 24.22.1. Insiders is signed in, so chat and the Agents window can be recorded; a build of main runs as Code OSS, signed out here (Oct 25), and c6 needs a Cloud session either way, so it is drawn.
- The official Node.js 24.22.1 (nodejs.org, checksum checked) was fetched into the session's folder before that decision; it was never used, and is removed.
- `prs demo check` crashed twice at once ("The "data" argument must be of type string … Received an instance of Array"), then passed: Insiders starts in 4.3 s, signed in to GitHub.
- Engine (not changed, said here): `prs demo check`'s failure handler writes `error.log` with `fs.writeFileSync`; when that is an Array it throws, and the real error is lost.
- Engine (not changed, said here): the Array is Playwright's call log, which every failed Playwright call carries (`parsedError.log`); `prs demo` has the same handler. Its first try failed so at once three times today (`prs demo check`, `c1`, `c3`) and passed on the next; each failed try left a throwaway profile in the temp folder (removed).
- The day's merges: 36 (`npm run merged`, the report's window), for the intro.

## What each change shows

- Exploring first (`demos/x1`…`x8`, not in the film): Insiders' Agents window, signed in, to see what each change can show.
- c1 #344060: recording `c1`: the new-session composer, `/generate-chat` typed on "generates", the slash menu showing `/generate-chat-background` with its description. Its text goes in at once, as typing "/" first would list every skill of the profile (the user's own too).
- c1: before the line, the side panel is widened 100 px, so the composer (526 px) and its menu (the input's width, opening at the cursor) fit the lens whole; at its default width they span 716 px.
- c1, c3: the welcome heading is "What are we building?" (`sessions.chat.experimental.welcomeMessages`), so the account's first name doesn't show.
- c2 #344083: drawn, `remote-environments` with `rows` (added): the Environments group's rows, a row's actions on hover (Disconnect, Rename, Delete), Delete clicked on "Delete" and its confirmation. A user-shared environment would need a real machine, and the editor lists the account's own; the lens is on the dialog and the Connection column beside it (the row's actions are at the right end of a 974 px table).
- c2: the merged diff asks before deleting ("Are you sure you want to delete environment '{0}'?"); the PR's description and the report say it doesn't. The film follows the diff.
- c3 #344158: recording `c3`: the Sessions list's More Actions menu, Manage Remote Environments first. Its prerequisites (the Environment picker, remote agent hosts) are turned on in the throwaway profile, as the PR's manual test does; GitHub Environments off. Not opened: the editor and the picker list the account's machines by name.
- c4 #344164: drawn, `setting` in the Agents window: `multiDiffEditor.experimental.variant` flips from `noCards` to `cards` on "cards". The change is that default; a recording shows only its value, and the multi diff of a session's changes didn't open in the throwaway profile (the workspace isn't a repository; the edits' "+13 −0" button didn't open it). The Agents window's Settings modal gained the dropdown for it (it drew only checkboxes).
- c5 #344192: drawn, `connector` (a new scene): the connector page of Customizations > Browse, Connect turning into the disabled Connecting... and Cancel on "connects", Cancel clicked on "Cancel". Connect would start an authorization on the account; measured on a capture of the page (`x6`), its icon an original tile.
- c6 #344092: drawn, `picker` with `details` (added): a Cloud chat's model picker, the model's Details with Context Size (272K, 1M, the PR's example) and Effort Level's "Model default". Not in Insiders, and a Cloud chat needs a sandbox.
- c7 #344133: card: Keep and Undo stay in sync, open diffs follow later edits, a checkpoint keeps unsaved edits; it's timing between the agent and the editor, with no new UI to point at.
- c8 #344175: drawn, `artifact-group` (a new scene): a chat's pull requests in one pill, "5 Pull Requests", its dropdown on "dropdown". It needs a chat with several pull requests.
- c9 #344087: card: in Insiders the Copilot agent's fetch approval already shows its URL (in Input), so the fallback isn't visible; relative links need an agent's reply in a repository.
- c10 #344017: card: a running HydraFusion workflow and a steering message mid-phase; no UI strings.
- The model picker and other action widgets don't open during `setup()` in the throwaway window (it isn't painted until the recording starts); demos that need them do that work before `begin()`.

## The voice

- `prs voice changelog-2026-10-26 --provider mai`: MAI-Voice-2 at pace 1.2; all eleven lines heard as written but c7 ("and" missing): `--redo c7` gave a take heard as written.
- The intro's alignment score is 0.82 (a warning), heard as written: kept.

## Review (my own: this session's review subagents couldn't open images)

- Round 1's subagent was cleared before it reported; round 2's had no file or image tools ("I can't open images"). As
  SKILL.md says, I opened every sheet at full size myself (each cut in halves or thirds, 1950 px wide).
- Round 1 found:
  - c2: Delete was clicked on "Delete", the line's first word, said before the lens is on; the scene can only click
    once the lens lands, so the click wasn't on its word. Reworded: "Shared environments now offer Delete, and it asks
    you first." (the click on "Delete", 1.1 s in).
  - c9, c10: the card's lines came on "links" and "steering", said before the lens is on. Now on "open" and "phase".
  - The review's stills can't show this (each event still is taken 14 frames after its word, after the lens), so
    `npm run check` now refuses a sync word said before the lens is on (scripts/check.mjs).
  - Clean: the shell (logo, merges, the top ten, the end card); c1 and c3 (recordings); c4, c5, c6, c7, c8.
- Round 2: clean. c2, c9, c10 and c5 were reviewed again at full size (c5's sheet changed only in its stills' times:
  re-voicing c2 re-aligns every line by a few milliseconds); every other sheet is pixel-identical to round 1's.

## Side effects

- The Agents window's agent host keeps its sessions in `~/.copilot/session-state` whatever the demo's HOME is: the two exploring sessions (`x3`, `x4`: "Add JSDoc to greet and sum", in a throwaway folder) are there (`b26a78ca-…`, `2e9b0def-…`). Left in place, not deleted from a store another app manages.

## Master and delivery

- `npm run master`: three renders, the renders disagreed on 0 of 3660 frames; both cuts −14.0 LUFS, true peak −1.4 dBTP (narrated) and −1.5 dBTP (music); 9/9 checks pass for both. 61.1 s, 122 beats.
- The scene library's own checks: `npm run lint` passes; `npm run gallery -- --review` sheets of `connector`, `artifact-group`, `remote-environments` and `picker` checked at full size (the two extended scenes' original modes are unchanged).

## What I changed in changelog-film (uncommitted, as asked)

`git diff` against the state before this run (the Oct 25 changes were committed meanwhile, as 68c6e4b); 12 files changed, 2 added:

- **New scenes**: `film/src/scenes/connector.tsx` (a Copilot connector's page: Connect, Connecting... with Cancel) and `film/src/scenes/artifact-group.tsx` (a chat's pull requests in one pill and its dropdown); registered in `scenes/index.ts` and `scenes/library.json`.
- **Extended scenes**: `picker.tsx` (`details`: a model's Details, its settings as segmented controls); `remote-environments.tsx` (`rows`: a group's remotes, their actions, the confirmation Delete asks); `ui/Settings.tsx` and `setting.tsx` (the Agents window's Settings modal draws a text box or a dropdown).
- **`film/scripts/check.mjs`**: refuses a sync word said before the lens is on (its event can't be on it, and the review's stills can't show it).
- **The skill's docs**:
  - SKILL.md: a release week when only some picks are missing, and keeping Insiders; the engine's first-try "Array" error (run again, remove the profile it leaves); pickers that don't open in `setup()`; keeping the account's own things out of a recording; a review subagent that can't open images.
  - film.md: the new check.
  - scenes.md: the new and extended scenes, the counts, and the events-on-words rule.
- **README.md**: 28 scenes. **CHANGELOG.md**: an entry for Oct 26.
