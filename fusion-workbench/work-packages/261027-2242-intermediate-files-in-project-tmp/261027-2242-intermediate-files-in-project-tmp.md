# Under fusion, intermediate files go to a gitignored tmp/ at the project root, never to the system temp directory

## Directive

The user's words (2026-10-27, de): "claude schreibt dateien mit zwischenständen häufig in den system Folder tmp. Der wird beim Neustart gelöscht. Heute sind mir nach einem Crash deshalb ein Masse aufwändig berechneter Zwischenergebnisse verloren gegangen. Ich möchte dass unter fusion alle Zwischendateien in eine tmp Folder im project root geschrieben werden. Der Ornder muss .gitignored sein. Wie können wir das erreichen und wie könnnen wir sicherstellen, dass das tools unter claude nicht trotzdem in den system Ordner uausweichen?"

Reached when, in a fusion project: `<root>/tmp/` exists and is gitignored; a fusion session's Claude Code temp root (scratchpad) and the `TMPDIR` its tools see lie under it; the Write/Edit tools are denied the system temp directories; fusion's own prompts, rules, skills, hooks and helpers name no system temp path; and a shell command naming a literal system temp path is reported to the session. The user chose (option 1) that this report **observes and does not block**, keeping the hooks observation-only.

## Measured before filing (this session, 2026-10-27)

- `CLAUDE_CODE_TMPDIR`, exported in the shell before `claude` starts, relocates Claude Code's temp root: `<dir>/claude-<uid>/<project-slug>/<session>/tasks` appeared under it, the same layout this session's scratchpad sits in (`…/<session>/scratchpad` beside `tasks`). The scratchpad itself was not observed directly, because `claude -p` creates none. The docs (code.claude.com/docs/en/env-vars) say the variable is **ignored in project and local settings**.
- `"env": {"TMPDIR": …}` in a project `.claude/settings.json` does **not** reach the Bash tool (it stayed `/var/folders/…/T/`), while another variable from the same `env` block did. `TMPDIR` exported in the shell before start **does** reach it: Python `tempfile` and Node `os.tmpdir()` used it. macOS `mktemp` with no argument ignored it and still wrote under `/var/folders/…/T/`.
- `permissions.deny` blocks under `bypassPermissions` and under `--dangerously-skip-permissions`, but only in the `Edit(//path/**)` form; a `Write(...)` rule never matches (Claude Code warns at start). `/tmp` and `/private/tmp` need one entry each. An `Edit` deny on `/tmp/…` did **not** stop `echo hi > /tmp/…` in Bash, although the docs say redirection targets are covered.
- 9 source files name a system temp path today: 1 under `agents/`, 2 under `skills/`, 5 under `hooks/lib/`, 1 under `bin/`; `commit-message-path.test.ts` pins the `/tmp` commit-message path.
- `tmp/` is not ignored in this repository today.

## Brief revised (2026-10-28)

The location changes from `<root>/tmp/` to `~/.fusion-tmp/<checkout-id>`, on the user's word, in three turns (de).

- On the sandbox: "sandbox ohne deny".
- On the location: "Dann könnte man überlegen, den tmp Folder generell nach ~/.fusion-tmp/<checkout-id> legen und nicht in die workbench oder den projekt folder."
- After the discussion `261028-0708-perfect-location-for-fusion-intermediate-files.md` converged: option 1, close and revise the plan with a view-only `<root>/tmp` symlink.

The "Reached when" clause of the Directive reads accordingly. The intermediate-file root is `~/.fusion-tmp/<checkout-id>`, granted without prompts through `.claude/settings.local.json`. It is not under the project. `<root>/tmp` is an optional view-only symlink to it.
