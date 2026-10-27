# Changelog

## 0.2.0: vscode-release-notes-film

- **One film, whole.** This repo holds the Oct 26, 2026 film so a clone renders it again: its kit
  (`skills/generate-changelog-film/example/2026-10-26/`), and its episode, recordings and narration installed in
  `film/`. Its previews are in `docs/media/`.
- **Release notes, by an agent.** A new skill, [write-release-notes](skills/write-release-notes/SKILL.md), writes a
  film's release notes from its kit alone: each change's PR, what users see, and how the film shows it. It then
  publishes the GitHub release with both cuts and the contact sheet. Oct 26's
  [release notes](skills/generate-changelog-film/example/2026-10-26/release-notes.md) are the model.
- **A template.** "Use this template" for the next film: the README's "Make the next one" says how.

## Earlier, in changelog-film

- **Oct 26, 2026.** The skill made Oct 26, with Insiders signed in: two recordings in the Agents window, five drawn,
  three cards. One pick wasn't in Insiders, and the build of main failed on main's `.nvmrc`, so Insiders was kept. What
  it found is fixed:
  - two new scenes, `connector` (a Copilot connector's page: Connect, Connecting... with Cancel) and `artifact-group`
    (a chat's pull requests in one pill, its dropdown): the library has 28;
  - `picker` draws a model's Details (each setting a segmented control, "Model default"); `remote-environments` draws a
    group's rows, their actions and the confirmation Delete asks; the Agents window's Settings modal draws a text box or
    a dropdown;
  - `npm run check` refuses a sync word said before the lens is on (its event can't be on it, and the review's stills
    can't show it);
  - SKILL.md: a release week when only some picks are missing; the engine's first-try "Array" error (run again, remove
    the profile it leaves); pickers that don't open in `setup()`; keeping the account's own things out of a recording;
    a subagent that can't open images.
- **A release week.** The skill made Oct 25, 2026, when no Insiders build had the picks: VS Code built from main (with
  main's Node.js), one recording, nine drawn. The gaps it found are fixed in the docs, `npm run check` and the scenes:
  - two new scenes, `sessions-rename` and `remote-environments`;
  - `setting` flips a default by itself, and shows the Agents window's Settings (a modal); `picker` is also the agent
    picker; `list-actions` also draws a details list above the chat input; `card` wraps a long title;
  - `npm run check` matches the diff's strings with placeholders, and waits for the voice before asking for recordings.

## 0.1.0

- **The film.** The changelog film as a skill, `generate-changelog-film`. It is the Oct 19, 2026 film (Loupe · In place) made from any day's #changelog report:
  - the top ten picks, recorded or drawn;
  - one line each, voiced with MAI-Voice-2;
  - cut on the beat of an original theme;
  - reviewed frame by frame;
  - delivered narrated and music-only.
- **The scene library.** 24 scenes, each a piece of VS Code acted out under the lens:
  - Oct 19's six;
  - the changelog-videos engine's other seven;
  - eleven for what a recording can't show: a policy, Windows, the web, the OS's notification, a sign-in, an extension, a remote, a tool approval, the debugger, an update, and an agent organizing the Sessions list (added on the first new day).

  Its reel is `npm run gallery`.
- **Built on changelog-videos.** The setup takes the changelog-videos engine and patches a copy of it to take ten picks. Each day's recordings are paced to the film's own lines.
- **A new day.** The skill made Oct 23, 2026 by its own docs: three recordings, seven drawn, two review rounds. The gaps it found are fixed in the scripts and the docs.
- **Parity.** Rebuilt from this repo, Oct 19 matches the delivered film:
  - its audio is bit for bit the same;
  - its frames are within render noise (worst block 1.8 against the vote's 3.0; two renders of the original differ by 1.5).
