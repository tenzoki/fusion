Re-measure whether a fresh project still raises approval dialogs, before Setup keeps asking about them

---

`/fusion:setup` Step 0g now asks every user of every new project one question: may fusion write a
permissive `.claude/settings.local.json`. The question exists to stop per-tool approval dialogs in a
project that has no permission source of its own. **Nobody has checked recently that those dialogs still
happen.**

## Context

Filed while closing `shared/issues/260810-0326_*_setup-must-seed-claude-settings-because-the-plugin-settings-json-is-not-a-permission-source.md`,
whose fix is Step 0g. That record's own measurement, taken on 2026-08-10 against Claude Code 2.1.226, is
where the doubt comes from, and it is stated there rather than inferred here:

- A `Write` to an unallowed path **was** denied, so enforcement was live.
- A dispatch of `fusion:playmaker` in the same project with no `.claude/` present **was permitted**, with
  an empty `permission_denials` — the exact symptom its own predecessor record was filed about.
- The record offers two readings it could not separate: Claude Code changed between 260801 and 2.1.226, or
  interactive mode gates the Agent tool where print mode does not.

The answered decision
`circles/260815-0007-remove-eight-mechanisms-and-cap-growth/decisions/260815-0029_*_what-permission-grant-does-setup-seed-when-unlock-becomes-a-setup-step.md`
carries the same doubt under *Not established*, in one sentence: "whether the approval-dialog problem still
exists at all. If the dialogs are gone, part (a) is answering a dead question and option 3 becomes honest."
The user answered the decision anyway, which was the right call for a question that had to be settled before
Setup could be edited. It does not settle this one.

## Why it is worth a record rather than a note

The cost of the question is paid by every user of every new project, once each, forever. The cost of
answering it is one scratch project. That asymmetry is the whole argument.

A second, unexplained observation in the same record deserves the same scratch project: running
`--agent fusion:orchestrator` there, three `Bash` calls were denied that ran fine under the default agent in
the same directory. fusion's orchestrator is the only agent with an explicit `tools:` allowlist, and the
record's guess is that such an allowlist loses the sandbox path that makes read-only shell calls
permission-free. If that is what happens, it affects far more than Setup.

## Acceptance

- A scratch project with no `.claude/` anywhere in its ancestry, on the Claude Code version current at the
  time of the measurement, running an ordinary orchestrator Turn **interactively** — not in print mode,
  which is what the 260810 probes used and is the reading that could not be separated.
- The measurement records the version, whether dialogs appeared, and for which tools.
- If no dialogs appear, Step 0g's question is proposed for removal in a decision record rather than deleted
  by an executor: it was put there by an answered decision and leaves the same way.
- The three-denied-`Bash`-calls observation is either reproduced or recorded as not reproducible.
