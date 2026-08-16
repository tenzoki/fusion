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

---
Resolved: `rules/user-facing-output.md` `## Questions and gates` gained two bullets, applied by
`curator` at the user's approval on 2026-08-16 and recorded in
`shared/history/260816-1251-curator-run.md`. The section now carries five required properties
where it carried three.

**The proposed clause landed in modified form, and the modifications are the interesting part.**
The curator was asked to judge the proposal rather than transcribe it, and changed it on four
counts:

1. The aphorism "an option list without foreclosures is a menu without prices" was cut. It
   carries no normative content, and *sententia* is one of the thirteen figures the motivating
   analysis inventories as the register fault. An aphorism inside the rule that governs register
   argues against itself.
2. "What leaves the board entirely" was cut as metaphor. Its three-part list had a third member
   restating the second. The real distinction underneath, between what is deferred and what is
   given up for good, was kept and stated in those words.
3. **The claim about the `AskUserQuestion` schema was refused.** This record quotes the field's
   specification and says it "is specified for exactly this". The curator held no such tool on
   that dispatch, could not verify the quotation, and declined to put an assertion about an
   external tool's documentation into a rule file, on the ground that it acquires a falsification
   the day that wording changes. The landed clause names the field as the place to carry the
   content and asserts nothing about what its documentation says. That reasoning is sound and is
   recorded here because this record was the source of the unverified claim.
4. Two things this record lacked were added: an explicit ban on filling `description` with a
   restatement of the label, and a branch for gates that are plain chat text rather than
   `AskUserQuestion`. The first is required because this record itself observes that the field is
   filled, when filled at all, with a restatement, so a bare requirement to fill it reproduces the
   failure. The second is required because the worked example in the analysis is exactly such a
   gate.

**The second gap's premise in this record is half wrong, verified.** This record states that
`## Information architecture` point 1 "governs status reports and is not referenced from
`## Questions and gates`". The second half is true. The first is false: the file's opening
sentence at `:5` names gate prompts and `AskUserQuestion` text among the output every clause
governs, and `## Information architecture` carries no narrowing scope, so point 1 already bound
gate prompts. The gap was salience, not binding. The bullet still landed, on a different ground
than this record gives: nothing told an agent to decide which of the two shapes a response
moment is, and the reported sample fell in that gap rather than in a missing cross-reference.

**One thing the user should know was overridden.** The curator classified both entries as
candidates with no evidence tier, because authoring a new normative requirement is outside its
remit, and stated that approval would be the user overriding its evidence requirement rather than
a tiered change. The user was shown both texts in full and both tier reasonings, approved, and
the override is recorded as an override in section 9 of the run file. Neither entry was given a
tier retroactively.

**Cost.** 758 bytes on an always-on rule file, 410 for the foreclosure clause and 348 for the
response-moment clause. Head-room against the universal-core growth bound is 8 112 bytes of
12 000. The golden fixture was regenerated once for this change alone rather than being folded
in with the queued repunctuation sweep, so that two independent defect fixes do not share a
commit.

Verification: `cd hooks && npm test`, exit 0, 40 files, 764 tests, run by the orchestrator
independently of the executors.

Not closed by this record: the register defect
`260816-0740_o_the-always-on-rule-corpus-runs-at-sixteen-times-the-em-dash-ceiling-it-states.md`,
which is independent and stays open.
