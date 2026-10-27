# Notes · Oct 23, 2026

- c1, c2: recorded the new settings with `workbench.editor.useModal: off`, so Settings opens in the editor and the row
  wraps within the lens (the modal Settings editor's row is 774 px wide, more than the lens shows whole).
- c1, c2: the demos find the row without calling `setting()` again (a second call re-types the search, and the cue
  came 1 s late); the pointer rests on the row's description, not the checkbox, whose hover shows the setting's ID
  over its title.
- c3: Windows-only: drawn with `windows`, its terminal running the PR's example (`Connect-AzAccount`) and an original
  sign-in prompt opening in front on "sign-in". The scene gained `terminal` and `prompt` for it.
- c4, c5, c8: cards: an SDK bump, state shared across windows, and Voice Mode (it needs an OpenAI key) have nothing
  to show on screen.
- c6: the first `prs demo c6` failed at once (an engine error writing an Array; transient: the same demo recorded on
  the second run).
- c7: drawn with a new scene, `sessions-organize` (an agent organizing the list needs a model's credits); its tool
  lines are the PR's.
- c9: drawn with `dialog`, which gained rows (Set Up Computer Use: Accessibility, then Screen Recording; Allow in
  Settings on "asks", then the next permission is current).
- c10: the allowlist setting "is not surfaced to end users", so the change is shown as the error a user gets, in the
  PR's words.

## Review (my own: subagents in this session can't open images)

- Round 1:
  - c9 showed the dialog example's detail ("Plugins can run code on your machine."), and c10 the example's source ("Source: Extensions"): film.json gave neither. Fixed in the scenes: a label a change shows never falls back to the example's.
  - c10's toast came 0.9 s after the lens: now on "MCP".
  - c7's tool lines came before the lens: now after it.
- Round 2: c7, c9, c10 clean; everything else was clean in round 1.
