The cascade gate's file set is justified as "the files an agent executes", which is also true of `rules/`

---

`hooks/lib/domain-cascade.ts:637-642` justifies scanning only `agents/*.md` and `skills/*/SKILL.md`:

> Anything outside `agents/` and `skills/`. `docs/philosophy.md` says what each domain PRIORITISES,
> in a line shape-identical to a paraphrase, so widening the file set means either noise or an
> exemption list. **The gate's file set is the consumer set: the files an agent executes.**

Rule files under `rules/` are also files an agent executes. `rules/agent-setup.md` states the
contract: *"Read every path it emits — none is optional."* An agent obeys a rule file the same way it
obeys a skill body.

---

**The hole is named; the reason given for it is not sound.** "Everything outside these two
directories is out of reach" is honest and correct. "…because the file set is the consumer set" is
not, because `rules/` is part of the consumer set by the project's own rules-loading contract.

**Measured, so this is a reasoning defect and not a live second definition.** Running
`findCascadeStatements()` over every `rules/*.md`, `docs/*.md`, `README*.md` and `CLAUDE.md`:

| File | Result |
|---|---|
| all `rules/*.md` | no statement |
| all `README*.md`, `CLAUDE.md` | no statement |
| `docs/philosophy.md:19` | fires — the line the comment already names |

So nothing is wrong in the tree today. What is wrong is that a reader who takes the stated reason at
face value will conclude a rule file cannot hold a second definition, when the real reason `rules/`
is excluded is that nobody measured the false-positive cost there.

**Fix direction.** Either add `rules/*.md` to `consumerFiles()`
(`hooks/lib/__tests__/domain-cascade.test.ts:527-538`) — the measurement above says it costs zero
false positives today — or rewrite the comment to say plainly that the file set is `agents/` and
`skills/` because those were measured, that `rules/` is a consumer too and is not covered, and that
`docs/` is excluded for the specific false positive at `docs/philosophy.md:19`.

The first is cheap and closes a real gap. The second is honest and closes nothing. Both beat the
current text, which closes nothing while reading as though it closed the class.

**Cross-references.** `hooks/lib/domain-cascade.ts:616-645`;
`hooks/lib/__tests__/domain-cascade.test.ts:499-538`; `rules/agent-setup.md` `## Read every emitted path`;
`README-hooks.md:179`.

**Filed by:** coderev, review of session `260810-1646-orchestrator-session.md` Turn 2, range `da8c9db..b3cc034`.

---
Resolved: `rules/*.md` is in the file set, and the reason for every exclusion is now measured.

This record offered two fixes and said the first was cheap and closed a real gap. It was taken.
`REACH.fileSet` is `agents/*.md`, `skills/*/SKILL.md`, `rules/*.md`, and the test's `consumerFiles()`
is *derived* from that list rather than restating it, so the set the gate scans and the set the
claim names cannot differ. 45 files are scanned, up from 32.

**Cost, measured:** 0 false positives across all 13 rule files, with the widened matcher and the
continuation window both active. Demonstrated end to end as well: a statement of the cascade
spliced into an in-memory copy of `rules/agent-setup.md` is now selected at its line, and the old
file set could not read the file at all.

**The unsound reason is gone.** "The gate's file set is the consumer set: the files an agent
executes" no longer appears. `docs/` is excluded on the measured false positive at
`docs/philosophy.md:19` and says so.

**Two files are named as uncovered rather than dressed as exempt.** `REACH.excluded` carries
`docs/*.md` (fires), `CLAUDE.md` (clean) and `README-hooks.md` (clean), each with the verdict the
suite re-measures. `CLAUDE.md`'s note says plainly that it is a consumer by the same contract that
put `rules/` in the set, that it is not scanned, and that this is an uncovered file rather than a
justified exclusion — clean today with nothing keeping it clean. If any of those three verdicts
flips, the suite fails and names the file and line.

**Note for whoever holds `skills/cleanup/SKILL.md`:** its line 125 says the gate "scans every agent
prompt and every skill body". That is now one third short. That file was held by another executor
this Turn and was not touched here.
