# Style: Federico's rules

What five rounds of review decided, for every film. A reviewer checks every frame against these.

## Words

- **No build words.** Never say or show where a change shipped ("Stable", "Insiders"): say what changed. ("The app icon
  now shows the badge", not "… on by default in Stable".)
- **One short line per change, said as it's shown.** At most 12 words, starting as the window lands. Nothing is said
  over the titles or the end card. The intro is the one line before the changes: it starts as the logo dives and may
  end over the top ten's first beats, as Oct 19's does; the count runs up to its number under it.
- **The line names what the lens shows**, in the UI's own words, and the change acts on the word that names it: the
  label rolls on "GitHub", the badge pops on "badge".
- **Plain and exact.** What a user sees now, from `facts.md`; no "now you can easily…".

## Showing a change

- **The lens sits on the whole block that changed.** That is the button with its label and the list it's in, never a lone button. It is set once and never moves or hops. It shows the block whole: zoomed enough to read, never cropped.
- **The glass is clean.** Nothing is drawn over the magnified UI: no glare, no streak, no tint, no doubled text as it
  opens.
- **What's in the lens stays.** A dialog doesn't close and a toast doesn't go while the lens is on them, unless the line
  says so, and then it happens on that word.
- **Two labels are never half-faded over each other.** Swaps go out, then in.
- **Clicks show.** The button presses in, the pointer squeezes, and a ring spreads.
- **The real UI.** Drawn UI is VS Code 1.144's, with codicons and the Mac's system face. Recorded and drawn changes
  look the same. App icons are tiles; VS Code's is the official logo on its white squircle. A default that changes
  flips by itself: no pointer clicks it, and Settings shows no "modified" bar.
- **Original drawings.** Apps, pages and desktops are drawn for the film, never another company's logo or artwork.

## The film

- **About a minute at 120 BPM**, every cut on the beat; each change as long as its line, at least 5 s. Everything moves
  briskly: no hold without a reason.
- **The shell.** The logo's dive, the day's merges, the top ten, then the changes. The end card is the icon,
  "VS Code Changelog" and the day, nothing more: no recap, no "that's today's changelog".
- **No letterbox, no black bars**, no flicker. The frame is full, with a fine grain and a soft vignette.
- **The music ducks under the voice.** The theme's drop lands on the first change; both cuts are −14 LUFS.
- **Delivered narrated and music-only**, with a contact sheet.

## Frames that are wrong

- The UI isn't the one the change is about, or a drawn label isn't the PR's word.
- The lens is on a lone control, moves, crops its block, or shows anything over the magnified UI.
- An event isn't on the word that names it, or happens before the lens is on.
- The line says what isn't on screen, or names a build.
- Something is cut off, covered or unreadable; a black bar; a flicker; a frame of another change.
