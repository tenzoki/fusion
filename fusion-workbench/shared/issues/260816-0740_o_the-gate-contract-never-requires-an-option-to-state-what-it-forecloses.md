The gate contract never requires an option to state what it forecloses, so a fully compliant prompt can still leave the user unable to decide

---
`rules/user-facing-output.md` `## Questions and gates` requires three properties of a query to
the user: the question is self-contained, the options are plain English rather than internal
verbs, and the default is marked. It requires nothing about consequence. An option may name a
choice without naming what that choice costs, what it makes unavailable, or what it removes
from the board, and the prompt still passes every clause in the section.

The user's own phrasing for the missing content: *"was ist grau und was verschwindet"*.

---
**Found by:** user, reported 2026-08-16 against a live orchestrator message; analysed by
`analyst` the same day.
**Owner:** `curator`. The change is to normative text and goes through the `CLAUDE.md` /
rule-file gate.
**Severity:** Medium-high. It is the fault the user reports as blocking, and it is independent
of the register defect filed alongside it: a prompt with every em-dash removed is exactly as
undecidable as before.
**Filed in the shared store** per the Origin Rule: no Circle is active.
**Cross-references:** `shared/analyses/260816-0740-rhetorical-register-of-agent-output.md`
finding 13 (the rhetorical diagnosis, the two latent decisions in the reported sample, and a
worked replacement prompt);
`shared/issues/260816-0740_o_the-always-on-rule-corpus-runs-at-sixteen-times-the-em-dash-ceiling-it-states.md`
(the independent register defect in the same output).

**The mechanism to carry it already exists and is unused.** The `AskUserQuestion` option schema
defines `description` as "Explanation of what this option means or what will happen if chosen.
Useful for providing context about trade-offs or implications." `## Questions and gates` never
points at that field, so the field that was built for foreclosures is filled, when it is filled
at all, with a restatement of the label.

**The reported sample, as evidence.** 231 words at a moment a response was expected. It carries
two latent decisions and surfaces neither as a choice:

| Latent decision | The sentence it hides in | Never stated |
|---|---|---|
| Does the `.gitignore` half still get done? | "nur Teil 1 gelandet ist. Die `.gitignore`-Hälfte lag außerhalb des Auftrags" | Whether it is queued, by whom, what happens if nobody queues it |
| Is the pre-existing test failure accepted? | "ein leerer Worktree auf HEAD schlägt bei derselben einen Zusicherung fehl" | Whether the session may proceed green, whether a record exists |

**Proposed fix, one clause.** `## Questions and gates` gains a fourth required property:

> **Every option states its foreclosure.** Say what the option costs, what becomes unavailable,
> and what leaves the board entirely. An option list without foreclosures is a menu without
> prices. Carry it in the `AskUserQuestion` option `description` field, which is specified for
> exactly this.

**A second, smaller gap found alongside it, recorded here rather than filed separately.**
`## Information architecture` point 1 already mandates *"If there's nothing for the user to do,
lead with that explicitly"*. That clause governs status reports and is not referenced from
`## Questions and gates`. The reported sample fails it as well: it arrived at a response moment
carrying neither a decision nor an explicit statement that none was needed. Binding the two
sections closes both shapes with one edit.

**What this is not.** It is not the register defect. It is not the stale-profile defect
(`shared/issues/260814-1419_o_*`). All three are visible in the same message and have three
different fixes.
