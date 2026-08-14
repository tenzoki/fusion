The curator's frontmatter description still carries the unqualified gate absolute the body dropped

---
`5a1ec16` closed the gate-rule / ungated-write overlap by qualifying two sentences in
`agents/curator.md` — the opening rule at line 16 and the two-passes rule at line 168 — so that
both now speak of changing an **existing** statement rather than of writing at all. A third site
carries the same unqualified absolute and was not reached: the agent's own frontmatter
`description` at `agents/curator.md:3` still reads "nothing is written before a user gate", which
`## Scope` (`:322-325`) contradicts by permitting three ungated writes.

---
**The three sites, at HEAD `5c843e6`.**

- `agents/curator.md:16` — fixed: "You never change an **existing** statement on any of the three
  surfaces before the user has approved the entry at the gate."
- `agents/curator.md:168` — fixed: "**No existing statement on any of the three surfaces is
  changed before the user has seen the complete change ledger.**"
- `agents/curator.md:3` — **not fixed**: "Every proposed change carries an evidence tier and a
  citation, nothing is written before a user gate, and a change justified only by re-reading the
  current text never removes a constraint."

Against `## Scope`:

> **You may write without a gate:**
> - Your run file under `$OUT_HISTORY`
> - An open decision record **you create in this run** at `$OUT_DECISION` …
> - A defect record at `$OUT_ISSUE` for work outside your remit

**Why this site matters more than its length suggests.** The `description` field is the text a
dispatching agent and the plugin's own agent listing read when deciding whether to invoke the
curator. It is the one sentence about the curator that a caller sees without opening the prompt,
and it states the agent's single safety property in a form the prompt itself now denies. This is
the same defect Turn 1 filed as
`260814-1023_c_the-gate-rule-and-the-ungated-write-list-overlap-on-the-decision-store.md`,
at the one site that fix did not reach.

**Two further sites, weaker and worth deciding on rather than fixing by reflex.**
`CLAUDE.md:16` and `README-agents.md:41` both say "nothing lands before a user gate". "Lands" is
looser than "is written" and can be read as covering only the three surfaces, which is true. Both
are user-facing summaries rather than the operative rule. Whether they are corrected with the
description or left is a judgement, not a defect.

**Constraint on the fix.** This is a frontmatter edit in the repository that broke its whole agent
fleet once on one (`CLAUDE.md` `## Where to look when something breaks`, the v2.8.1 row). The
`description` value is unquoted YAML, so the replacement must not introduce a colon. Re-run
`claude plugin validate .` after the edit.

**Suggested wording, one clause changed:** "…, no existing statement is changed before a user
gate, …".

**Scope.** `agents/curator.md` frontmatter. Executor: `coder`.

**Filed by:** coderev, review `circles/260801-1244-curator/reviews/260814-1128-coderev-curator-turn-2.md`.

---
Resolved: `agents/curator.md:3`, the `description` field, now reads "no existing statement is changed before a user gate" in place of "nothing is written before a user gate" — the suggested wording, one clause changed, matching the qualification `5a1ec16` gave `:16` and `:168`, so all three sites now state the same rule and none contradicts the three ungated writes in `## Scope`. No colon was introduced (the line's only two colons are the YAML key separator and the one inside `/fusion:curate`, both pre-existing and neither followed by a space). `claude plugin validate .` re-run from the repository root after the edit: passed, with the one pre-existing `CLAUDE.md` root-context warning and nothing else. `CLAUDE.md:16` and `README-agents.md:41` were left as they are — the record calls their looser "nothing lands before a user gate" a judgement rather than a defect, and this task's scope named the frontmatter.
