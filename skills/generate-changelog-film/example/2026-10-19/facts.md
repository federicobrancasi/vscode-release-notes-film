# Facts: Oct 19, top ten

Each pick: what a user sees now, and its UI strings as the diff has them.

- c1 · #342442 (@alexdima): signed out, the classic Welcome page offers "Sign in to GitHub" (codicon github) instead of "Try out the new Agents window". Setting `chat.welcomePage.signIn.enabled`, default true.
- c2 · #342404 (@alexdima): in the Agents window, a session row's first action is "New Nested Session" (⌘T), in place of Pin; one click starts a nested session ("New Session").
- c3 · #342455 (@alexdima): Stable shows the Agents window application badge by default (`sessions.showApplicationBadge`); it counts sessions waiting for input.
- c4 · #341230 (@DonJayamanne): in Agent Host chats, `/fork <title>` ("Fork conversation with a custom title") and `/fork prompt <prompt>` ("Fork conversation and send a prompt").
- c5 · #342430 (@aeschli): `vscode://` links `chat-plugin/add-marketplace` and `chat-plugin/install` open a confirmation first: "Add Marketplace", "Add Marketplace and Install"; installs warn "Plugins can run code on your machine."
- c6 · #342440 (@justschen): beside the "Image batch" status in chat, a download action: "Download All Images as ZIP" (partial: "Download {0} Ready Images as ZIP"); the ZIP is `generated-images.zip`.
- c7 · #337719 (@aiday-mar): Editor Language Status shows "Diagnostic highlights" with "Some diagnostics are not shown for performance reasons." when a diagnostic collection is truncated (1,000 per file), and "Only {0} diagnostics are highlighted in the editor for performance reasons." past the highlight limit, now 5,000 (was 500).
- c8 · #342370 (@karthiknadig): removing a queued steering message ("Remove from Queue") withdraws it: the agent doesn't receive it and it isn't added to the transcript (when the SDK hasn't taken it yet). No new UI strings.
- c9 · #342415 (@roblourens): reopened Cloud Sandbox sessions show the model picker once models load; workspaceless remote sessions start terminals in the host-reported working directory, not the local home. No new UI strings.
- c10 · #338904 (@aeschli): the Agents window's Sessions view Find matches a session's GitHub pull request numbers, with or without `#` (the PR's example: `#241533`). No new UI strings.
