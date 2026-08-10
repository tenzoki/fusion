# Is the plugin's settings.json a permission source? Measured, then corrected the doc

**Agent:** ontocoder
**Started:** 260810-0326
**Status:** Complete
**Task:** T1 — grant agent-dispatch permissions so a fusion session stops prompting once per dispatch
**Source record:** `fusion-workbench/shared/issues/260801-2352_o_plugin-settings-json-has-no-agent-allow-entries.md`
**Queue entry:** `fusion-workbench/tasklist.md` task 1
**Origin:** no Circle active; shared store per the Origin Rule

---

## Result

**A plugin's own `settings.json` is not read as a permission source under `--plugin-dir`.**
Measured, not inferred. So the branch the task defined for that answer applies: `settings.json`
at the plugin root was left untouched, the false parity claim in `CLAUDE.md` was corrected, and
the real fix was filed as a new defect record rather than implemented here.

## What was measured

Scratch project `/private/tmp/fusion-perm-probe`, with no `.claude/` directory, none in any
ancestor, no `permissions` block in `~/.claude/settings.json` (it holds `model`, `tui`,
`skipDangerousModePermissionPrompt`, `theme` and nothing else) and no managed policy directory.
Claude Code 2.1.226. Every probe ran `claude --model sonnet --output-format json -p …` and the
verdict was read from the harness's own `permission_denials` array, not from the model's prose.

Enforcement was established before anything was concluded from a missing denial:

- A `Write` to a path no source allowed was **denied**, and the denial was recorded. Print mode
  therefore maps "would ask" to "deny", which is what makes a missing denial meaningful.
- `Bash` proved useless as a probe. Read-only shell commands run sandboxed and never reach the
  permission layer: `uname -a`, covered by no fusion allow entry, ran anyway. Every conclusion
  rests on `Write`.

The decisive pair differed in one thing, the file the entry lived in:

| Probe | Identical entry `"Write"` lived in | Outcome |
|---|---|---|
| F4 | the project's `.claude/settings.json` | permitted, file created |
| H | a minimal throwaway plugin's `settings.json`, loaded via `--plugin-dir` | denied |

Probe H used a two-file plugin (`.claude-plugin/plugin.json` and `settings.json`) rather than
fusion itself, so nothing in fusion's own tree could account for the result.

Two dead ends worth recording so they are not re-run:

- The first attempt used fusion's real entry `Write(fusion-workbench/**)` and was confounded.
  That pattern is denied **from an honoured source too**, as are `Write(./fusion-workbench/**)`,
  `Write(sub/**)` and the absolute double-slash form. Only the bare tool name matched. Why the
  scoped forms miss was not characterised.
- A project's `.claude/settings.json` is ignored entirely until the workspace is trusted, with
  an explicit diagnostic saying so. The trust flag was set in `~/.claude.json` for the scratch
  path, then removed again afterwards; a backup of that file is at
  `/private/tmp/claude-json-backup-1786324968.json`.

The predecessor record's own symptom did **not** reproduce. With `--plugin-dir` and no
`.claude/`, a dispatch of `fusion:playmaker` was permitted and the subagent ran, with an empty
denial array. Since `Write` was denied in the same mode, the Agent call was allowed outright.
Either Claude Code changed since 260801 or interactive mode gates the Agent tool where print
mode does not; these probes cannot separate the two, and the new record says so rather than
picking one.

## Changes

| File | Change |
|---|---|
| `CLAUDE.md:100` | The HTTPS-installer bullet's "permission parity with a marketplace install" sentence, replaced with what the file actually grants: nothing, because it is not read. Cites the measurement, the new record, and the scoped-pattern finding. |
| `fusion-workbench/shared/issues/260810-0326_o_setup-must-seed-claude-settings-because-the-plugin-settings-json-is-not-a-permission-source.md` | New defect record. `/fusion:setup` should seed `.claude/settings.local.json` the way `/fusion:unlock` does. Carries the full measurement, the scoped-pattern finding, the unreproduced dispatch symptom, and three open sub-decisions. |

`settings.json` at the plugin root was deliberately **not** edited. `git diff -- settings.json`
is empty.

## Not done here, deliberately

- The `/fusion:setup` seeding change. Different file, different acceptance criterion; filed.
- The predecessor record `260801-2352_o_…` keeps its open marker and the queue entry stands. Its
  real fix has moved to the new record, and closing it is a reconciliation call, not this task's.
- The scoped-pattern finding was folded into the new record as context for whoever writes the
  seeding, rather than filed separately. It is not a live defect in shipped behaviour: the
  patterns sit in a file nothing reads.

## Verification

- `git diff --stat -- settings.json` and `git status --porcelain -- settings.json` both empty.
- The issue path cited in `CLAUDE.md` was extracted from the file by `grep -o` and tested with
  `test -f`; it exists.
- `git status --porcelain` shows `CLAUDE.md` modified and the new issue file untracked. The other
  modified paths in the tree belong to concurrent work by other agents and were not touched here.
