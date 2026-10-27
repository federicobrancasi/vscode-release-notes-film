---
name: generate-changelog-film
description: 'Make the daily VS Code changelog film: about a minute on the top ten picks of a #changelog report, each change shown in VS Code (recorded, or drawn from the scene library) under a Liquid Glass lens, one short line said as it shows, cut on the beat of its theme, reviewed frame by frame, delivered narrated and music-only. macOS. USE FOR: "make today''s changelog film", "the changelog film for 2026-10-20", "the motion-designed changelog video". DO NOT USE FOR: the changelog video with a Before → Now strip and arrows (use changelog-videos:generate-changelog-video), one pull request (use pr-studio:generate-video), editing a video.'
argument-hint: today (default), or a date YYYY-MM-DD
---

# Generate the changelog film

One film, about a minute, cut on the beat of its theme:
- the VS Code logo dives into the icon's blue;
- the day's merges stream past, and the top ten fly into a list;
- each change gets a blue title panel, which becomes VS Code's window;
- a Liquid Glass lens drops onto the block that changed, as one short line names it;
- the end card pulls back out of the blue.

You choose what each change shows and write its words. The film's tools time, voice, render and check it.

**The standard is the Oct 19 film** ([example/](example/2026-10-19/README.md)):
- Four changes recorded in VS Code and six drawn from the scene library.
- Every line at most 12 words.
- Every drawn event on the word that names it.

Read the example first. Setup installs it, so `npm run studio` in the film folder plays it.

**Needs:**
- macOS, Node.js 20+, ffmpeg, uv.
- `gh` signed in as an account that can read microsoft/vscode-engineering, where the report is made.
- The changelog-videos plugin installed (the film is built on its engine).
- VS Code Insiders signed in, to record chat and the Agents window.
- Rendering uses Remotion, which needs a company licence (README).

## 1. Set up

Run `node <plugin>/scripts/setup.mjs` by absolute path (`<plugin>` is two folders above this file). Its last lines are:
- `ENGINE=` (the top-ten engine);
- `PRS=` (its command);
- `VIDEOS=` (where projects go);
- `FILM=` (the film).

Below, `prs <x>` means `<PRS> <x>`, and `npm run <x>` runs in `<FILM>`. The first time, run `prs doctor` too: it installs Chrome for Testing and the voice.

## 2. Make the film

About 60–90 minutes. Post a one-line update after each step. Read these first:
- [film.md](film.md) before step 4;
- [scenes.md](scenes.md) before drawing a change;
- changelog-videos' `recording.md` (`<changelog-videos plugin>/skills/generate-changelog-video/recording.md`) before recording.

1. **The project.** `prs digest new` (or `--date YYYY-MM-DD`) makes `<VIDEOS>/changelog-<date>/` (its slug is `changelog-<date>`). It holds:
   - the report's top ten: `picks.json` and `brief.md`;
   - each PR in `<VIDEOS>/<owner>-<repo>-<n>/`: `brief.md`, `pr.diff`, its files;
   - the VS Code build that has them.

   `prs digest new` also writes a skeleton `storyboard.json` and `digest.json`; `npm run lines` replaces them. Never make the film in a changelog-videos project someone wrote: `npm run lines` refuses its `digest.json`.

   **A release week.** When an Insiders build lacks some picks, the engine builds VS Code from main (about 8 GB, a few minutes when its packages are cached). When that build fails, it falls back to the installed Insiders, and the picks it lacks say "not in the demo build" (on Oct 25 that was every pick; on Oct 26, one). Read the end of the build's log (`.prs-build.log`, its path is printed):
   - `Please use Node.js v<x> or newer` (main's `.nvmrc`): put that Node.js first on `PATH` for `prs digest new` only (the official build from nodejs.org, its checksum checked, in a folder of your own), and run `prs digest new` again. Don't change the Mac's own Node.js.
   - anything else: draw what needs the build, and say why in `notes.md`.

   When only a few picks are missing and Insiders is signed in, keeping Insiders can be the better choice: chat and the Agents window can be recorded there, and a build of main runs signed out. Draw the missing picks, and say so in `notes.md`.

   A build of main runs as Code OSS: signed in only when its own profile (`~/.vscode-oss-dev`) is, and its product name shows as "Code - OSS" where VS Code names itself (the issue reporter, the title).
2. **Facts.** For each pick, read its `brief.md` and search its `pr.diff`. Then write `facts.md` in the project:
   - what a user sees now;
   - its UI strings exactly as in the diff;
   - a before → now only when the diff shows both.

   Every word on screen and in the lines comes from this file.
3. **What each change shows**, in this order:
   - **Record it** when VS Code can show it, driven like a user (recording.md): menus, quick picks, hovers, dialogs, `vscode://` links, editors, settings, and, signed in, chat and the Agents window. Record the change itself, not its Settings row, unless the change is the setting.
   - **Draw it** from the [scene library](scenes.md) when a recording can't show it: an enterprise policy, another OS, the web, the network, Stable's update channel, a sign-in, a runtime, or a model's credits. Take the closest scene, with the PR's strings as its params. If none fits, add one (scenes.md).
   - **A card** only when nothing changes on screen.
4. **`film.json`** in the project ([film.md](film.md); the example's is the model):
   - the intro line;
   - for each change: its headline, eyebrow and line;
   - what it shows (`{"demo": "c2"}` or `{"scene": {"name", "params"}}`);
   - for a drawn change, the words its events happen on (`motion.sync`).

   Follow [style.md](style.md). Then run `npm run check -- <project>` until it passes.
5. **Voice.** `npm run lines -- <project>` writes the lines into the project. Then `prs voice <slug> --provider mai` voices them (MAI-Voice-2 at the film's pace, every word timed). If the Azure key lookup fails, wait a minute and run it again. Never use another voice.
6. **Recordings.** Run `prs demo check` once (`prs demo check` checks the installed Insiders: when the project has its own build, a build of main, run it with `PRS_VSCODE=<the build's folder>`, from `picks.json`'s `build.path`):
   - If VS Code doesn't start, draw every change, and say why in `notes.md`.
   - If it says NOT SIGNED IN, ask the user to sign in as it says, and run it again; if they'd rather not, draw what needs a sign-in.
   - If it fails at once with `The "data" argument must be of type string … Received an instance of Array`, run it again: that is the engine's error handler failing on Playwright's call log, which hides the real error, and on Oct 23 and 26 the next run passed. `prs demo <id>` can fail the same way on its first try. Each such try leaves a throwaway profile, `prs-demo-*` in the temp folder, holding a copy of the sign-in: remove it.

   For each recorded change, write `demos/<id>.mjs` (recording.md):
   - Pace it with `cue()` on the film's own line (film.md: recordings).
   - Do in the demo, before `begin()`, what needs a picker or a menu (the model picker, a drag): in `setup()` the recorded window isn't painted yet, and action widgets don't open there.
   - Keep the account's own things out of the frame: a welcome heading without the account's name (`sessions.chat.experimental.welcomeMessages`), no list of the account's machines or sessions. The Agents window's agent keeps any session a demo starts in `~/.copilot/session-state`, so start one only when the change needs it.
   - Run `prs demo <id> --slug <slug>`, and open its `contact.png`.
   - Then set its lens in `film.json`: `motion.loupe.block`, the whole block that changed, in the window's px (film.md tells how).

   When the same recording fails twice the same way, draw that change and say why in `notes.md`.
7. **The episode.** `npm run episode -- <project>` makes:
   - the recordings, encoded;
   - the narration, copied;
   - the edit, each change as long as its line and at least 5 s;
   - the music, fitted to it.

   Then run `npm run check -- <project>` again.
8. **Review**, below.
9. **Master and deliver.** `npm run master`: three renders voted frame by frame, both cuts at −14 LUFS, each with its review package. Both must say 9/9 checks pass. Then `npm run deliver` puts both cuts, a contact sheet and `notes.md` in `~/Downloads/changelog-videos/changelog-<date>-film/`. Record the narrated film and its contact sheet as chat artifacts if you can. End with three lines:
   - the path and its length;
   - which changes are recordings and which are scenes;
   - what the review found.

## 3. Review

`npm run review` writes a sheet per change (`out/review/<date>/c1.png` …): the title, the window landed, the lens focused, each synced event, and the end of the line. Each frame carries what it should show and the words being said then.

**A fresh pair of eyes checks every sheet.** Start a subagent with:
- the sheet paths;
- [style.md](style.md) and `facts.md`;
- the checklist `npm run review` prints.

Ask it to list every wrong frame. It hasn't seen your work, so it judges what is on screen. Without subagents, or when a subagent says it can't open images (on Oct 26 one had no file or image tools at all), open every sheet yourself at full size, and say the review was your own. The sheets are 1950 px wide and up to 2480 px tall: cut each into halves or thirds to see them at full size. When a later round's sheet is pixel-identical to an earlier round's, that review still holds.

Fix in `film.json` (or the scene), then run `npm run episode -- <project>` and `npm run review`, and have the new sheets checked. Two rounds at most. Note in `notes.md` what each round found. `npm run draft` renders a half-size film to watch whole.

## Runs nobody watches

Nobody answers questions, not even to sign in. Decide, and write each decision in one line in the project's `notes.md`. Never skip a recording, the voice or the review to save time or credits: they are what the film is for. Leave the engine as it is; if something in it is broken, say so in `notes.md`. Write files with your file-editing tool, not shell redirects.
