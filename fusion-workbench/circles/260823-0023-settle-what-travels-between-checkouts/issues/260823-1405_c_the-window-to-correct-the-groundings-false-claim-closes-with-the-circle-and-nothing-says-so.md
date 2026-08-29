The window to correct the Grounding's false claim closes with the Circle, and the record deferring it names no deadline

---

**Severity:** Low
**Domain:** code
**Filed by:** coderev, reviewing C2 Turn 3
**Affects:** `260823-0023-settle-what-travels-between-checkouts` `## Grounding snapshot`; `260823-0800_*_c2-what-travels-between-checkouts-is-settled.md:253` (the `## Open Questions` bullet that defers it)
**Cross-references:** `260823-0800_*_the-groundings-first-write-outside-the-workbench-claim-was-already-false-when-it-was-written.md`, the record left open; `rules/circle-records.md` `### The Directive is a pointer once a spec exists` ("a terminal record is history and is never edited"); `README-agents.md:25` and `agents/shaper.md:28`

---

## What is wrong

The plan's last open question reads:

> The Grounding's claim about Setup's first write outside the workbench is inaccurate, filed as a defect. Whether the Circle record itself is corrected is the record's owner's call, not this plan's.

That deferral has a deadline nobody wrote down. `## Grounding snapshot` has exactly one sanctioned writer, shaper in portfolio-activation mode, and `README-agents.md:25` bounds it to "an `_a_` **or** a `_t_` record, never a terminal one". `rules/circle-records.md` states the same from the other side: a terminal record is history and is never edited. So the correction is reachable while the record carries `_t_` and unreachable from the `mv` at Phase 4 step 3 onward.

The consequence is the one the defect record itself argues against: "That matters for a later reader, who would otherwise reconstruct a history in which `/fusion:setup` was workbench-only until 2026-08-23." After closure that reader meets the false sentence in a frozen record, with the correction in an `_o_` issue that has itself left every scan set.

**The decision is not affected and this is not a re-opening.** The user chose the behaviour, not the reasoning. What is at stake is whether the Circle's own founding text goes into the archive stating a measured falsehood.

## Verified

Read `## Grounding snapshot` at `a2a18f9`: the sentence stands unamended. `skills/setup/SKILL.md` Step 0g confirms the two pre-existing project-root writes the defect record names. `agents/shaper.md:28` and `README-agents.md:25` read for the writer bound; `agents/orchestrator.md:239-240` confirms the orchestrator's own record-write permission covers the two head fields and the Directive pointer literal, and not `## Grounding snapshot`.

## Direction, not a prescription

Two reachable shapes, and both are cheap.

Dispatch shaper in portfolio-activation mode before the rename, to correct the sentence in place while the record is still `_t_`.

Or carry it into the `## Closure note`, which Phase 4 step 3 writes onto the record *after* the rename and is therefore the one text that can still speak. Step 2b already has a mechanism for exactly this shape: a clause the user says does not hold is carried into the closure note "so the gap outlives the chat".

What should not happen is closing silently, which leaves a correction that was possible on the day and impossible the day after.

---
Resolved: the correction landed inside the window. `2ec2bc2` made a first attempt by hand and
`a40b330` completed it, both while the record still carries `_t_`, so the first of the two shapes this
record named was taken — not the closure-note fallback. `## Grounding snapshot` now states the fact
truly, verified at `skills/setup/SKILL.md` Steps 0f and 0g rather than taken from either commit
message (see `260823-1635_*_the-corrected-grounding-undercounts-setups-project-root-writes-and-omits-step-0f.md_*` for that verification).

The deferral this record was filed against is therefore discharged by outcome rather than by anyone
writing the deadline down. That distinction is deliberate and is why this note says so: nothing in
Phase 4 or in `rules/circle-records.md` yet tells a closing session that `## Grounding snapshot`
becomes unwritable at the rename. It took a human edit and an explicit user override to get the
correction made, which is the evidence that the deadline is still undocumented rather than the
evidence that it does not need to be.

**The window is still open and still has an occupant.** `260823-1642_*_the-hand-written-grounding-correction-breaks-the-paragraphs-own-two-costs-scaffolding-and-its-markup.md_*` names two residuals in the
same three lines — the paragraph's "two costs" scaffolding and a convention list that states
unscoped what `skills/setup/SKILL.md` scopes — and both freeze at the same rename. Closing this
record does not close that one.

Closed by reconciler, second Coherence pass, 260823-2130-reconciliation.md.
