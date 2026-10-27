# This repo's film: Oct 26, 2026

The day this repo holds whole: [contact.png](contact.png). Ten changes from the #changelog report, 61 s (122 beats at
120 BPM), narrated by MAI-Voice-2 at pace 1.2. Made by the skill on its own, from its docs, and reviewed in two rounds.

<a href="https://github.com/federicobrancasi/vscode-release-notes-film/releases/download/2026-10-26/VSCode-Changelog-2026-10-26-1080p60.mp4"><img src="../../../../docs/media/changelog-2026-10-26.webp" width="640" alt="A preview of the Oct 26 film"></a>

**[▶ Watch](https://github.com/federicobrancasi/vscode-release-notes-film/releases/download/2026-10-26/VSCode-Changelog-2026-10-26-1080p60.mp4)** ·
[music only](https://github.com/federicobrancasi/vscode-release-notes-film/releases/download/2026-10-26/VSCode-Changelog-2026-10-26-music-1080p60.mp4) ·
[release notes](release-notes.md)

## What each change shows

| # | Change | Shown with | Why |
|---|--------|-----------|-----|
| 01 | The agent can now design your chat background | Recording `c1`: the Agents window's composer, `/generate-chat` typed on "generates", the slash menu showing `/generate-chat-background` and its description | |
| 02 | Shared environments get a Delete action | `remote-environments` with `rows` (added that day): the Environments group, a row's actions, Delete clicked on "Delete" and the confirmation it asks | It needs a user-shared machine; the editor lists the account's own |
| 03 | Remote Environments management, on by default | Recording `c3`: the Sessions list's More Actions menu, Manage Remote Environments first, opened on "now" | |
| 04 | In the Agents window, diffs default to cards | `setting` in the Agents window: `multiDiffEditor.experimental.variant` flips from `noCards` to `cards` on "cards" | The change is a default; a session's multi diff didn't open in a throwaway workspace |
| 05 | Cancel a connector while it connects | `connector` (added that day): Connect on "connects" turns into Connecting... with Cancel, clicked on "Cancel" | Connect starts an authorization on the account |
| 06 | Cloud models show their real context sizes | `picker` with `details` (added that day): a model's Details on "Details", 1M picked on "sizes", Effort Level's "Model default" | Not in the day's Insiders, and a Cloud chat needs a sandbox |
| 07 | Reviews of agent edits stay in sync | `card` | Timing between the agent and the editor: no new UI |
| 08 | Pull requests in a chat share one pill | `artifact-group` (added that day): "5 Pull Requests", its dropdown on "dropdown" | It needs a chat with several pull requests |
| 09 | Relative links open from the chat's folder | `card` | The day's fetch approval already showed its URL, and a relative link needs an agent's reply in a repository |
| 10 | Steering HydraFusion no longer looks stuck | `card` | A running HydraFusion workflow, steered mid-phase: no UI strings |

## How it differs from Oct 23 and Oct 25

- **A release week, kept on Insiders.** One pick wasn't in Insiders yet, and the build of main failed on main's
  `.nvmrc`. Insiders was kept, as it was signed in, so the Agents window could be recorded; the missing pick is drawn.
- **Four scenes gained what the day needed**:
  - two new ones, `connector` and `artifact-group`;
  - `picker` draws a model's Details;
  - `remote-environments` draws a group's rows and the confirmation Delete asks.
  The Agents window's Settings modal draws a dropdown too.
- **A rule from the review.** Three events were timed to a word said before the lens is on, which the review's stills
  can't show. `npm run check` now refuses that. [notes.md](notes.md) has every decision and what the two review rounds
  found.

## The files

| File | What |
|------|------|
| [film.json](film.json) | The film's words and choices |
| [facts.md](facts.md) | What each change is, from its PR |
| [notes.md](notes.md) | The run's decisions, and what its review found |
| [release-notes.md](release-notes.md) | The film's release notes, as written for its GitHub release (`skills/write-release-notes`) |
| [picks.json](picks.json), [merged.json](merged.json) | The report's ten picks, and the day's 36 merges |
| [demos/](demos) | The two recordings' scripts, each paced to its line |
| [episode/](episode) | What `npm run episode` made: the episode, the narration's timing and the edit |
| [media/](media) | The recordings and the narration |

The episode and media are also installed in `film/`, so the film renders from a clone as it is (the repo's README says
how). It was made with this repo's scenes as they are.
