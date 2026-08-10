Plugin settings.json grants no Agent(...) permission, so every subagent dispatch prompts the user

---

`settings.json` at the plugin root ships 16 scoped permission auto-allows and not one of them is
an `Agent(...)` entry. Every dispatch the orchestrator makes — `fusion:playmaker`, `fusion:coder`,
`fusion:taskplanner`, all of them — therefore raises a per-tool approval prompt on any project that
has no permission allowlist of its own. An orchestrator session is nothing but a sequence of
subagent dispatches, so the effect is one confirmation dialog per task, which is what makes the
plugin feel unusable rather than merely chatty.

`CLAUDE.md` states that this file "ships fusion's scoped permission auto-allows so an HTTPS install
has permission parity with a marketplace install". For agent dispatch that claim is false, and the
doc line should be corrected in the same change that closes the gap.

---

## Context

Found live on 260801 in this repository. The user ran `/fusion:setup`, then `/fusion:next`, and the
`Agent(fusion:playmaker)` dispatch prompted for approval. The project had no `.claude/` directory at
all, so the plugin's own `settings.json` was the only permission source in play.

Verified during triage:

- `~/.fusion/settings.json` `permissions.allow` holds `Write(fusion-workbench/**)`,
  `Edit(fusion-workbench/**)`, six `Bash(...)` workbench patterns, `Bash(date *)`, four git
  `Bash(...)` patterns. No `Agent(...)` entry, and no `Read`, `Glob` or `Grep` entry either.
- `~/.claude/settings.json` carries only `theme` and `tui`, no permissions block.
- `.claude/settings.local.json` is gitignored (`.gitignore:46`), so an unlock file written in one
  checkout never reaches another. A second checkout of the same project starts fully locked.

Ruled out during triage: the v5.8.0 Bash mutation guard is not involved. `hooks/guard.ts:153` writes
`{"decision":"block"}` and has no code path emitting an "ask" decision, so a guard hit is an outright
denial and never a confirmation prompt.

## Candidate fixes

1. Add `Agent(fusion:*)` (or the 16 agents enumerated) to `permissions.allow` in the plugin's
   `settings.json`. Smallest change that removes the dispatch prompts.
2. Reconsider the rest of the list while there. `Read`, `Glob` and `Grep` are absent too, and every
   agent's Setup begins by reading rule files outside the workbench.
3. Correct the "permission parity" sentence in `CLAUDE.md` under the HTTPS-installer section.

Open question for whoever picks this up: whether a plugin-level `settings.json` is honoured as a
permission source at all under `--plugin-dir`. If it is not, the file is decorative and the real fix
is for `/fusion:setup` to seed `.claude/settings.local.json` the way `/fusion:unlock` does. That is
unverified and needs checking before either fix is chosen.

---
Resolved: by measurement, and the measurement inverts the record's premise.

The question this record left open — is a plugin-level `settings.json` honoured as a permission source under `--plugin-dir`? — was answered empirically on Claude Code 2.1.226 rather than argued. **It is not.** One identical `permissions.allow` entry was placed in two locations and probed from a scratch project carrying no `.claude/` at any level, no user-level `permissions` block and no managed policy: from the project's `.claude/settings.json` the write was allowed, from a minimal two-file plugin's `settings.json` under `--plugin-dir` the same write was denied. The probe plugin was deliberately not fusion, so nothing in this tree could explain the result. Enforcement was shown to be live first, by denying a write to a path no entry covered. `Bash` was useless as a probe and was dropped: read-only shell commands run sandboxed and never reach the permission layer.

So the 16 scoped auto-allows this file ships grant nothing, and the fix this record proposed — adding `Agent(fusion:*)`, `Read`, `Glob` and `Grep` to it — would have granted nothing either. `settings.json` was correctly left untouched. What was wrong and is now corrected is the claim in `CLAUDE.md` that the file gives an HTTPS install permission parity with a marketplace install; both paths get zero, which is parity only in the emptiest sense.

Two findings the measurement produced that this record did not anticipate:

- **Directory path patterns did not match at all**, even from the honoured source. `Write(fusion-workbench/**)`, `Write(./fusion-workbench/**)`, `Write(sub/**)` and the absolute double-slash form were each denied; only the bare tool name matched. The cause was not characterised and is not claimed.
- **The original symptom did not reproduce.** With `--plugin-dir` and no `.claude/`, a `fusion:playmaker` dispatch ran with an empty denial array, while a `Write` in the same mode was denied — so the dispatch really was permitted. Whether Claude Code changed since this record was filed on 260801, or the interactive mode treats the Agent tool differently, these probes cannot separate. Both readings are written down in the successor record rather than one being chosen.

The real fix lives elsewhere and is queued rather than lost: `shared/issues/260810-0326_o_setup-must-seed-claude-settings-because-the-plugin-settings-json-is-not-a-permission-source.md` — `/fusion:setup` seeds `.claude/settings.local.json` the way `/fusion:unlock` does. It carries the full measurement, both findings above and three open sub-decisions.

Session: `shared/history/260810-0241-orchestrator-session.md` (task T1). Executor log: `shared/history/260810-0326-plugin-settings-permission-source-measurement.md`.
