# Facts: Oct 26, top ten

Each pick: what a user sees now, and its UI strings as the diff has them. 36 pull requests merged in the report's
window (Oct 25 08:00 UTC to Oct 26 08:30 UTC).

- c1 · #344060 (@benibenj): in the Agents window, the agent gets two appearance tools and a built-in skill, on by
  default (`chat.agentSessions.appearanceTools.enabled`, new, default `true`, advanced, experiment-controlled):
  - Get Theme Colors ("Read the current theme's prominent colors in the Agents window") and Set Chat Background ("Set
    the chat background of the Agents window to an image or a pattern"), in the tool group "Appearance" ("Read theme
    colors and change the chat background of the Agents window.");
  - the built-in skill `/generate-chat-background`, in the slash menu with its description: "Generate or design an
    image for the chat background in the Agents window. Use when the user asks for a generated chat background,
    wallpaper, pattern, or illustration to decorate their chat."
  - Tool lines: "Reading the current theme colors" / "Read the current theme colors"; "Setting the chat background to
    Codicons" / "Set the chat background to Codicons"; "Setting the chat background to {0}".
  - Disabling the setting removes both tools and the skill; existing backgrounds and the manual controls stay.
- c2 · #344083 (@chrmarti): in the Agents window's Remote Environments ("Remotes"), rows of the "Environments" group
  (user-shared machines, online or "Offline") gain a Delete action after Rename: codicon `trash`, its label "Delete
  {0}". The row's actions: Connect ("Connect to {0}", `debug-connected`) or Disconnect ("Disconnect {0}",
  `debug-disconnect`), Rename ("Rename {0}...", `edit`), Delete. Delete asks first (a warning dialog): "Are you sure you
  want to delete environment '{0}'?", its detail "This removes the environment registration and disconnects this
  client. Files on the machine will not be deleted. The environment may reappear if its owning application registers it
  again.", its primary button "Delete". Confirmed, the registration is deleted and the row goes; SSH, WSL and tunnel
  rows don't get Delete. (The PR's description and the report say it acts without confirmation; the merged diff asks.)
- c3 · #344158 (@chrmarti): Remote Environments management is on by default:
  `sessions.chat.experimental.environmentPickerManageRemotes` defaults to `true` (was `false`), still experimental and
  experiment-controlled. Its entry points need the Environment picker (`sessions.chat.experimental.environmentPicker`,
  off by default) and remote agent hosts: the command "Manage Remote Environments" (Command Palette, and the Sessions
  list's More Actions menu) and "Manage..." at the bottom of the Environment picker. The per-environment Manage
  submenus are hidden when central management covers them. Description: "Controls whether Remote Environments management
  and its picker visibility preferences are enabled. Adds a command, a Sessions menu entry, and a Manage entry when the
  Environment picker and remote agent hosts are enabled. When disabled, saved visibility preferences are ignored but
  retained."
- c4 · #344164 (@alexdima): in the Agents window, the multi diff editor (a session's changes) defaults to cards, each
  file in its own card: `multiDiffEditor.experimental.variant` gets an Agents-window default of `cards`; the editor
  window keeps `noCards` ("Use the compact variant without cards."). Description: "Controls the experimental variant of
  the multi diff editor." Still experiment-controlled.
- c5 · #344192 (@vritant24): while a Copilot connector connects (Chat: Open Customizations > Browse, a connector's
  detail page), the page shows the disabled "Connecting..." (or "Reconnecting...") and a new enabled "Cancel" (its
  ARIA label "Cancel connecting {0}"). Cancel stops waiting for the browser's authorization; the page returns to
  "Connect" with no error (status "Connection cancelled for {0}."). Finishing consent in the browser can still connect
  it. The PR's examples: Slack, Azure Data Explorer. The detail page (Insiders, measured): the Agent Customizations
  modal, Browse; a back arrow, the connector's icon, name and publisher ("GitHub Copilot"), the primary button at the
  right; the description; "Details" (Type "MCP server", Publisher "GitHub Copilot", Source "Copilot Connectors").
- c6 · #344092 (@osortega): in a Cloud chat's model picker, a model's Details offer the context sizes the Cloud catalogue
  advertises as numeric choices (the PR's example: 272K and 1M) instead of only the overall maximum, with each tier's
  rates in Pricing details; the chosen "Context Size" survives model switches and reaches the first message. An
  unspecified effort shows "Model default" (no option checked) under "Effort Level" (was "Reasoning Effort"). A
  read-only capacity reads "Max {0}" (for example "Max 1M"). If the host can't accept the choice, the prompt isn't sent:
  "The sandbox could not confirm the selected configuration for {0}. Your prompt was not sent." Not in Insiders (merged
  07:31 UTC).
- c7 · #344133 (@justschen): Keep and Undo reviews of agent edits stay in sync: working-set files open in a live review
  diff ("Files open in a live review diff by default, following the chat.editing.openChangedFileInDiffEditor setting"),
  open diffs follow the agent's later edits, Keep/Undo wait for the decision before moving to the next file, and
  restoring a checkpoint keeps unsaved edits: "Save or revert unsaved changes to '{0}' before restoring a checkpoint."
- c8 · #344175 (@benibenj): in the Agents window (`chat.artifactIntegrations.enabled`), artifacts of one integration
  above the chat input share one pill: "{0} {1}" = "5 Pull Requests" (`groupLabel` "Pull Requests"), its icon the state
  that needs attention most (failing CI or conflicts, then open with comments, open, draft, merged, closed), and a
  chevron. Clicking it opens a dropdown headed "Pull Requests": per row the state icon, `#number`, its status sections
  (checks, comments, Autopilot) and its title; hovering a row shows Open, the entry's actions, Pin ("Pin") and Remove.
  Pin moves one into a pill of its own (Unpin). Merged PRs use `git-pull-request-done`.
- c9 · #344087 (@osortega): in Agent Host chats, relative file links in a response open against the chat's working
  directory, live and in history; a pending URL approval shows its target: "{0}: {1}" (the PR's test: "Read article:
  https://example.com/docs", title "Open URL"). In Insiders, the Copilot agent's fetch approval ("Fetch URL?", "Allow
  fetching web content?") already shows the URL in its Input, so the fallback doesn't show there (seen on a capture).
- c10 · #344017 (@sbatten): sending a steering message while a HydraFusion phase runs no longer leaves the chat looking
  stuck: the steering turn takes over the running workflow, the running phase's tile shows again in the new turn, and
  its tool calls keep appearing (before, 34 tool calls ran with nothing more shown). No UI strings.
