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
