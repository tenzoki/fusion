migrate: eight messages still name a helper subcommand without `--session`, and the 13.3.3 note says every one carries it
---
13.3.3 routed three message sites of `hooks/migrate.ts` through `command(wb, session, …)`. Other sites still tell the user to run a `bin/fusion-migrate` subcommand by its bare name. Under a non-default `--session <dir>` that name runs on the default session, where `recorded` refuses it (exit 5) or reaches another record. The release commit `8530c67c` and `skills/help/SKILL.md` `### 4. Update` both say every message naming a command now carries `--session`. That is false at the sites below. Same class as `261023-1403-migrate-unknown-outcome-and-refused-first-chunk-messages-spell-commands-without-the-session-flag.md`, whose evidence said "every other message site … builds it with `command()`". That claim was wrong, and the fix was scoped from it. Severity Low.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>

**Evidence** (at `8530c67c`, `hooks/migrate.ts`). Each site tells the user what to run, in a function that has `session` in scope:

- `preconditions`, the `way` fallback: "\`resume\`, \`rollback\` or the archive helper that set it closes it". This message comes from `run --session <dir>`.
- `run`, blocking findings: "\`repair --list\` proposes their repairs". `compose` reads `actorsFromLog(readRepairLog(session))`. So `repair --list` / `--apply` without the flag reads and writes the default session's repair log, and a control-only repair applied that way leaves `run --session <dir>` still blocked.
- `repair`, unknown finding id: "\`repair --list\` names the current ones". Same consequence.
- `resumeRun`, rolled-back record: "\`rollback\` finishes that".
- `rollback`, plan landed or pending: "\`resume\` first".
- `restoreBackup`, manifest/fence/plan standing: "\`rollback\` first".
- `setAside`, current record: "\`run\` starts a new migration" / "\`resume\` or \`rollback\` acts on it".
- `endLeftFence`, the `fence-ended=` note. It appends `--session` to `set-aside --consent` by hand but ends with a bare `run`, and for a `.stale-` session it names only `run`.

The following are descriptive and need no change: the `rollback --end-fence` mentions in `fenceWay`, "\`run\` refuses while it stands" in `setAside`, and the fault text in the top-level catch, where no session is in scope.

Release surfaces that overstate it:
- `skills/help/SKILL.md` `### 4. Update`: "13.3.3: `/fusion:migrate` messages naming a command carry `--session` under a non-default session."
- The `8530c67c` commit message: "every message that names a bin/fusion-migrate command carries --session <dir> under a non-default session". This is history and is not to be edited.

**Fix direction:** route every site above through `command(wb, session, …)`, the same helper the 13.3.3 sites use. The `endLeftFence` note should build its `run` the same way. If a site deliberately stays bare, narrow the help sentence to the sites that carry the flag. Exit codes stay unchanged.

**Acceptance test:**
- A `migrate.test.ts` case under `--session <dir>` reaches at least the `run` blocking, `resumeRun` rolled-back and `setAside` current-record refusals.
- It asserts that no stderr names a subcommand without `--session <dir>`. The match must include bare backticked subcommand names, not only `` `bin/fusion-migrate …` `` tokens, which is all the 13.3.3 case matches.
- It runs the named command and gets past `recorded`. 261023-1403 asked for this and its case does not do it.
- The help sentence matches what the code prints.
