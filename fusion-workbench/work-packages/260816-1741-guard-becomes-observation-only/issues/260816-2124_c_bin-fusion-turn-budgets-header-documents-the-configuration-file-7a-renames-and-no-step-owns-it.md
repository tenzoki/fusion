`bin/fusion-turn-budget`'s header documents the configuration file step 7a renames, and no step's Files list names the script

---

Step 7a renames `PROJECT_CONFIG_FILENAME` from `fusion-guard.json` to `fusion.json` and step 7b
deletes `hooks/config.json` with the plugin merge layer. `bin/fusion-turn-budget` states both of
those as live fact in its own header and appears in no step's Files list:

- `bin/fusion-turn-budget:39` — `#   fusion-guard.json   {"orchestrator": {"maxTurns": 12}}`, the
  worked example of where a project sets the budget.
- `:40-41` — "merged per leaf over the plugin's hooks/config.json and then the defaults, the same
  walk every guard setting takes." After 7a and 7b there is no `hooks/config.json`, no guard
  setting, and the walk has two layers rather than three.

This is not an ordinary stale comment. `CLAUDE.md`'s Layout row for this helper says "**Its own
header carries the authoritative usage block** — the `KEY=value` line it prints and the exit-code
table are spelled there, and this row deliberately does not restate them." The header is where a
reader is sent, by design, so a wrong filename in it is the wrong filename at the one place the
project nominated as right.

Step 11's list covers the other documentation surfaces of the same rename — `README.md`,
`README-agents.md:169`, `agents/orchestrator.md:122` — and `bin/monitor`, whose `:188` also names
`fusion-guard.json` and which is opened at step 11 anyway (step 11 runs after 7b, since it depends
on step 8 which depends on 7b). `bin/fusion-turn-budget` is the one file of that set nobody opens.

---

Context: found by `coderev` reviewing Turn 1 of this Circle, range `3d41d4a..3c2e1c6`, by grepping
`fusion-guard.json` across the shipped surfaces and matching each hit against a step's Files list.
Every other hit outside `hooks/`, the workbench and `docs/upgrading-to-v9.md` is owned by step 7b,
8 or 11.

Proposed shape of the fix: add `bin/fusion-turn-budget` to step 11's Files list, or to step 7a's —
7a is the better home, because the file is documentation *of* the loader change and the two would
then land in one diff. The edit is the example line, the merge sentence, and the "same walk every
guard setting takes" clause, which needs replacing rather than renaming since no guard setting
survives.

What it costs if it stands: a project reading the helper's own authoritative header is told to set
its Turn budget in a file the loader no longer reads, which is exactly the silent-budget-loss
failure step 7a's retired-file diagnostic exists to prevent, arriving through the surface that
diagnostic points people at.

---

Resolved: `bin/fusion-turn-budget`'s header now names `fusion.json` as the file a project sets `{"orchestrator": {"maxTurns": 12}}` in, and states the merge as two layers — that file over `DEFAULTS` — instead of the three-layer walk over `hooks/config.json`. The "same walk every guard setting takes" clause was replaced rather than renamed, because no guard setting survives; in its place the header says that a project root still carrying `fusion-guard.json` is told so on every guarded tool call, which is the silent-budget-loss failure this record named. Landed with plan step 11.
