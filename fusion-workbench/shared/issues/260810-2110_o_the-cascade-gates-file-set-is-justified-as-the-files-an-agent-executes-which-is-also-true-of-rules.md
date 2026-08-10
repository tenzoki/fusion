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

**Filed by:** coderev, review of session `260810-1646` Turn 2, range `da8c9db..b3cc034`.
