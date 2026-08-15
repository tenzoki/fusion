/fusion:setup must seed .claude/settings.local.json, because the plugin's own settings.json is not a permission source

---

Measured on 260810 against Claude Code 2.1.226: a plugin's `settings.json` is **not** read as a
permission source under `--plugin-dir`. The 16 scoped auto-allows fusion ships in
`settings.json` at the plugin root therefore grant nothing, in an HTTPS install and in a
marketplace install alike. The file is inert, and padding it (with `Agent(fusion:*)`, `Read`,
`Glob`, `Grep` or anything else) would not change any session's behaviour.

The real fix is the one the predecessor record named as its alternative: `/fusion:setup` seeds
`.claude/settings.local.json` in the consuming project the way `/fusion:unlock` already does.
That is a different file and a different acceptance criterion from the CLAUDE.md correction that
closed the documentation half, so it is filed here rather than carried in that change.

---

## Context

Predecessor: `fusion-workbench/shared/issues/260801-2352_o_plugin-settings-json-has-no-agent-allow-entries.md`
— it raised the question this record answers and left both candidate fixes open pending the
answer. Queue entry: `fusion-workbench/tasklist.md` task 1.

### How it was measured

A scratch project at `/private/tmp/fusion-perm-probe` with no `.claude/` directory, no `.claude`
in any ancestor, no `permissions` block in `~/.claude/settings.json` and no managed policy file.
Every probe ran `claude --model sonnet --output-format json -p …` and read the structured
`permission_denials` array from the result, so the verdict is the harness's own record of the
decision rather than the model's account of it.

Enforcement was confirmed live before anything was concluded from a *missing* denial: a `Write`
to a path no source allowed was denied, with the denial recorded. `Bash` turned out to be
useless as a probe, because read-only shell commands run sandboxed and never reach the
permission layer; `uname -a`, which no fusion allow entry covers, ran anyway. Every conclusion
below rests on `Write`.

The decisive pair, same project, same tool, same command, one identical allow entry
(`"Write"`, the bare tool name), differing only in which file it lived in:

| Probe | Where the entry lived | Outcome |
|---|---|---|
| F4 | project `.claude/settings.json` | permitted, file created |
| H | a minimal throwaway plugin's `settings.json`, loaded with `--plugin-dir` | denied, recorded in `permission_denials` |

Probe H used a two-file plugin (`.claude-plugin/plugin.json` plus `settings.json`) rather than
fusion itself, so nothing about fusion's own contents could account for the result.

### A second finding, load-bearing for the fix

Directory-scoped path patterns did not match at all in this Claude Code version, from a source
that *is* honoured. With the workspace trusted and the entry in the project's
`.claude/settings.json`, all three of these were denied for a write to `sub/probe.txt` or
`fusion-workbench/probe.txt`:

- `Write(fusion-workbench/**)` — the exact form fusion ships
- `Write(./fusion-workbench/**)`
- `Write(sub/**)`
- `Write(//private/tmp/fusion-perm-probe/sub/**)` (absolute, double-slash form)

Only the bare `Write` was honoured. Whoever implements the seeding must not assume fusion's
existing scoped patterns work once relocated: they were never exercised, because the file
holding them was never read. `/fusion:unlock` is unaffected and is the model to copy — it writes
bare tool names plus `defaultMode: "bypassPermissions"`.

Not characterised: why the scoped forms miss. It could be pattern syntax, a version regression,
or a rule I did not find. Treat it as measured behaviour, not as an explanation.

### On the dispatch prompt the predecessor reported

The predecessor's symptom was an approval dialog on every `Agent(fusion:…)` dispatch. That did
**not** reproduce here: with `--plugin-dir` and no `.claude/`, a dispatch of `fusion:playmaker`
was permitted and the subagent ran, with an empty `permission_denials`. Since a `Write` in the
same mode *was* denied, enforcement was live and the Agent call was allowed outright rather than
silently downgraded.

Two readings, and I cannot separate them from these probes: Claude Code changed between 260801
and 2.1.226, or interactive mode gates the Agent tool where print mode does not. So the
predecessor's `Agent(...)` gap may already be moot. What is not moot is the seeding gap: a fresh
consuming project still has no permission source of its own, and `Write`, `Edit` and the
non-sandboxed shell calls every fusion session makes will prompt or be denied there.

One further observation, unexplained and worth a look by whoever picks this up: running
`--agent fusion:orchestrator` in the scratch project, three `Bash` calls were denied that ran
fine under the default agent in the same directory. An agent with an explicit `tools:` allowlist
appears to lose the sandbox path that makes read-only shell calls permission-free. fusion's
orchestrator is the only agent with such a list.

## Proposed fix

1. `/fusion:setup` seeds `.claude/settings.local.json` in the consuming project, merging rather
   than overwriting, exactly as `/fusion:unlock` step 4 does. Reuse that skill's merge
   procedure and its gitignore step instead of writing a second one.
2. Decide what the seeded grant is. `/fusion:unlock` is deliberately permissive
   (`bypassPermissions`); a setup-time default may want to be narrower. That is a decision, not
   an executor's call, and the measurement above says a narrower grant cannot be expressed with
   the scoped path patterns fusion currently ships.
3. Decide what becomes of the inert `settings.json` at the plugin root: delete it, or keep it
   with a comment saying it is not read. Leaving it as-is invites the next reader to conclude
   from its contents what a session is allowed to do.

## Acceptance

- A fresh consuming project that has only run `/fusion:setup`, with no `.claude/` beforehand,
  completes an orchestrator Turn without a per-tool approval dialog.
- The seeded file is produced by the same merge procedure `/fusion:unlock` uses, not a second
  implementation of it.
- Whatever is decided about the plugin-root `settings.json`, no shipped document claims it
  grants permissions.

---
Resolved: `/fusion:setup` Step 0g offers once, defaulting to yes, to write `.claude/settings.local.json`
with `defaultMode: "bypassPermissions"` and bare tool names, then gitignores it; the `unlock` skill was
deleted and its merge procedure moved into that step verbatim, so exactly one implementation of the merge
exists. The plugin-root `settings.json` was deleted with its `install.sh` copy entry, and `CLAUDE.md`'s
installer bullet now states the measurement without naming a file that is gone. Both decisions this record
deferred are answered and implemented:
`circles/260815-0007-remove-eight-mechanisms-and-cap-growth/decisions/260815-0029_*_what-permission-grant-does-setup-seed-when-unlock-becomes-a-setup-step.md`.

**Two of the three acceptance criteria are met outright; the first is met with a bound that could not be
removed, and closing this record without naming it would misreport the fix.**

- *"The seeded file is produced by the same merge procedure `/fusion:unlock` uses, not a second
  implementation of it."* — **met**, by relocation rather than reuse. The skill body is gone and its
  procedure is now Setup's; there is one copy, not two.
- *"No shipped document claims the plugin-root `settings.json` grants permissions."* — **met**. The file
  does not exist, and no shipped surface names it.
- *"A fresh consuming project that has only run `/fusion:setup`, with no `.claude/` beforehand, completes
  an orchestrator Turn without a per-tool approval dialog."* — **met from the next session onward, and not
  in the session that ran Setup.** Claude Code reads permission settings at startup only, so a file written
  mid-session changes nothing about that session. No Setup-time seeding can close that half; the criterion
  as written is unreachable by any mechanism that writes the file during the run. Step 0g says so in its
  report rather than claiming the session is unlocked. It is also conditional on the user answering yes,
  which is the consent the answered decision deliberately kept.

Not settled by this fix, and filed on: whether the approval dialogs this record was written about still
occur at all on the current Claude Code version. The decision's *Not established* paragraph names it, and
if they are gone, Step 0g is asking a dead question. See
`circles/260815-0007-remove-eight-mechanisms-and-cap-growth/issues/260815-1617_o_re-measure-whether-a-fresh-project-still-raises-approval-dialogs-before-setup-keeps-asking.md`.
