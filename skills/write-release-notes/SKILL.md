---
name: write-release-notes
description: 'Write and publish the release notes of a changelog film: a GitHub release with the film (narrated and music-only), its contact sheet, and notes saying, for each change, what users see, its pull request, and how the film shows it. Every fact comes from the film''s kit; nothing is invented. USE FOR: "write the release notes for this film", "publish the film as a release", "release notes for the Oct 26 film". DO NOT USE FOR: making the film (generate-changelog-film), VS Code''s own What''s new page, a pull request''s description.'
argument-hint: the film's date (YYYY-MM-DD), default the newest kit in skills/generate-changelog-film/example/
---

# Write the release notes of a changelog film

A film is delivered (generate-changelog-film, step 9) and its kit is in this repo. Write its release notes and publish
them as a GitHub release, with the film as its assets. The model is
[example/2026-10-26/release-notes.md](../generate-changelog-film/example/2026-10-26/release-notes.md): match its
sections, its order and its tone.

## 1. Gather (read everything first)

`<kit>` is `skills/generate-changelog-film/example/<date>/`, and `<film>` is
`~/Downloads/changelog-videos/changelog-<date>-film/` (the delivered folder). Read:

| File | What it gives the notes |
|------|-------------------------|
| `<kit>/film.json` | each change's headline, eyebrow, line (`say`), what it shows (`visual`) and its sync words |
| `<kit>/facts.md` | what a user sees now, and the UI strings exactly as the diff has them: **the only source** for what changed |
| `<kit>/picks.json` | each pick's number, url, author, title, summary, `inBuild`; the report's `title` and `date` |
| `<kit>/notes.md` | why each change is recorded, drawn or a card; the build; the voice; what each review round found |
| `<kit>/merged.json` | the day's merges (their count) |
| `<kit>/episode/timeline.json` | the film's beats |
| `<film>/notes.md`, the two `.mp4` | the delivered film: the files to attach, and their sizes |
| `film/out/VSCode-Changelog-<date>-*-review/` | the master's review of each cut: its checks (9/9) and its loudness |
| `<VIDEOS>/changelog-<date>/report.md` (when it's on this machine) | the report's picks past the top ten, for "Also in the report" |

Measure what's measurable:
- the length: `ffprobe -v error -show_entries format=duration -of csv=p=0 <mp4>`;
- the loudness and true peak: `ffmpeg -i <mp4> -af ebur128=peak=true -f null - 2>&1 | tail -12`.

Never estimate a figure: when one can't be found, leave it out.

## 2. Write `<kit>/release-notes.md`

The sections, in this order:

1. **Title**: `# VS Code Changelog · <Weekday, Month D, YYYY>`.
2. **One line**: the film in a sentence: its length, its ten changes, how many recorded, drawn and cards. Then the
   links: **▶ Watch** (the narrated cut's asset URL), music only, the contact sheet.
3. **The ten changes**, one `###` each, in the film's order: `### 01 · <headline>`. Under it:
   - one or two sentences on what users see now, from `facts.md`, quoting its UI strings exactly, in backticks or
     quotes as they are;
   - `[microsoft/vscode#<n>](<url>) by @<author>` (from `picks.json`);
   - **In the film:** how it's shown: "Recorded in the Agents window: …", "Drawn (`<scene>`): …", or "A card: …", and
     *why* when it isn't recorded (from `notes.md`), in a few words.
4. **Also in the report**: the report's picks past the top ten, one line each with their PR link (from `report.md`);
   leave the section out when there are none.
5. **How it was made**, in bullets:
   - the build (Insiders' version, or a build of main);
   - signed in or not;
   - the voice (MAI-Voice-2, pace 1.2);
   - the review rounds and what they fixed (from `notes.md`);
   - the master: three renders voted frame by frame, both cuts −14 LUFS, true peak, 9/9.
6. **Render it again**: from a clone, `cd film && npm ci && npm run music && npm run master` (the repo's README has the
   details).
7. **Credits**: the changes' authors (each @handle once, from `picks.json`). Then the film's tools:
   - Remotion (it needs a company licence);
   - MAI-Voice-2 (an AI voice);
   - the original theme;
   - the changelog-videos engine.
   Then: "VS Code and its icon are Microsoft's; see NOTICE."

## Rules

- **Every fact from the kit.** A user-facing claim is in `facts.md`; a number is in a file or measured. Never write a
  change the film doesn't show, a figure you didn't read, or what a PR "might" do.
- **Plain and exact** ([style.md](../generate-changelog-film/style.md)): what users see now, in the UI's words. No "now
  you can easily…", no superlatives, no emoji except ▶ on Watch.
- **No build words for a change** ("Stable", "Insiders"): a change is what it does. Name a build only under "How it
  was made".
- **Links are fully qualified**: `microsoft/vscode#344060`, never a bare `#344060` (in a release of this repo, a bare
  number is this repo's). Name the film's own changes "change 06", never "#06".
- **Short.** A change is at most three lines; the whole is one screen and a half.

## 3. Publish

Release assets are the film; the repo keeps its kit. Use the repo owner's account for every `gh` command (`GH_TOKEN=$(gh
auth token --user <owner>) gh …` when another account is active), and never switch the active account.

```sh
tag=<date>                                   # 2026-10-26
gh release create "$tag" --repo <owner>/<repo> --title "VS Code Changelog · <Mon D, YYYY>" \
  --notes-file "<kit>/release-notes.md" \
  "<film>/VSCode-Changelog-<date>-1080p60.mp4" "<film>/VSCode-Changelog-<date>-music-1080p60.mp4" \
  "<kit>/contact.png#Contact sheet"
```

Then check it: `gh release view "$tag" --json assets,body`. Every asset must be there with its size, and every link in
the notes must resolve (the assets' URLs are
`https://github.com/<owner>/<repo>/releases/download/<tag>/<file>`). Commit `release-notes.md` with the kit.

End with the release's URL, and the three links from step 2's line.
