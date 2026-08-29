The release went out over a Turn whose six shipped-file commits no review pass opened, and the plan named that pass as a precondition

---
**Domain:** code
**Filed by:** reconciler
**Cross-references:** `260815-2109_*_may-a-circle-close-over-an-uncovered-review-range-and-who-decides.md`, `260810-1618_*_a-release-was-tagged-and-pushed-while-its-own-review-pass-was-still-running.md`, `260816-1915_*_the-compliance-guard-becomes-observation-only.md` `## Where this Circle stops`

---

## What happened

The plan states its own release precondition in `## Where this Circle stops`, and states it twice:
the tag and the marketplace bump are "a separate act at a user gate, **after step 15 and after
this Circle's review pass**", and the second of its three stated reasons is that the release
process makes the off-repository verification a precondition of tagging. Step 15 ran and passed.
The review pass over Turn 3 did not run at all.

Measured rather than inferred, `bin/fusion-review-coverage --since 3d41d4a` at HEAD:

```
commits=21  reviews=2  unusable=0  uncovered=9  verdict=uncovered
```

Both review files cover Turns 1 and 2 (`3d41d4a..3c2e1c6` and `3c2e1c6..1d1d3a3`, `not-opened=none`
on each). Turn 3 is the whole uncovered set. Split by hand into the two classes the answered
decision asks for — the filter itself is not implemented, see below:

| Commit | Shipped files | Subject |
|---|---|---|
| `1fb3f32` | 17 | the shipped text says the guard decides nothing |
| `5763550` | 7 | CLAUDE.md and the conventions rule stop describing a guard that decides |
| `18c125b` | 5 | the v10 upgrade note |
| `a7f70b9` | 3 | version 10.0.0 and the manifest |
| `e489133` | 2 | one growth baseline moves |
| `e331332` | 1 | the README Setup paragraph |
| `9ae7974`, `c65e1cf`, `a52cf14` | 0 | workbench-only writes |

`e331332` is the commit the tag `v10.0.0` points at. So six commits touching 35 shipped files
were tagged, pushed to `origin/main` and published to the marketplace without a reviewer opening
any of them.

---

## Why this is filed rather than folded into the closure note

**It is not the coverage policy question.** That one is answered:
`shared/decisions/260815-2109_a_*` was answered on 2026-08-16 as options 3 then 1 — filter the
uncovered set to shipped-file commits, keep coverage advisory, name the gap in the closure note.
Under that answer an uncovered range does not block a Circle from closing and does not by itself
flag the `Artifact↔Grounding` edge, and this record does not reopen it. The reconciler followed it
here.

**What is unanswered is the plan's own clause.** A plan may impose a precondition its project's
standing policy does not, and this one did, deliberately, citing
`shared/issues/260810-1618_o_*` by path as the defect it was written to avoid repeating. That
clause was then not met, and nothing in the tree says so. The release was a user act at an explicit
gate and the user holds that authority; what is missing is the record that the gate was crossed
with one of its two stated preconditions unmet.

**The class is adjacent to `260810-1618_*_a-release-was-tagged-and-pushed-while-its-own-review-pass-was-still-running.md`, not identical, and the difference is the worse half.**
That record is about a release tagged while its review pass was still running — the answer existed
and was not waited for. Here no pass was dispatched, so no answer exists to wait for. A finding
against v10.0.0 now lands in a v10.0.1 after consumers have been told to update, which is exactly
the cost that record priced.

**A second, smaller item in the same measurement.** Option 3 of `260815-2109` — filter the
uncovered set to commits touching at least one non-workbench path — is answered and **not
implemented**. `bin/fusion-review-coverage` still reports the unfiltered 9, so every consumer of
that number splits it by hand, which is what this record had to do. The record's own argument for
option 3 was that an unfiltered number "will be argued with every time it fires, and will lose".

## What it costs if it stands

The next release repeats it, because the only thing that would have caught it is a human reading
a clause in a plan that is now marked Complete. And the standing evidence for whether
reconciliation substitutes for review — the low-confidence point `260815-2109` flagged and asked
to be re-measured over the next two Circles — loses a data point, because nobody recorded that
this Circle was the second one.

## Options

1. **Record only.** This file is the record; nothing changes. Cheapest, and it is what the
   advisory-coverage answer already licenses. Costs: the next plan that writes such a clause has
   the same nothing enforcing it.
2. **Dispatch a review over `1d1d3a3..9ae7974` now, after the fact.** Findings cannot change
   v10.0.0 but can shape a v10.0.1, and the range is 6 commits. Costs one pass.
3. **Implement option 3 of `260815-2109`** so the number is honest at its source, and separately
   decide whether a plan-stated precondition gets any mechanism at all. Largest, and it is
   two questions rather than one.

Not recommended from here: this belongs to whoever holds the release gate, and the reconciler's
role ends at naming it.

---
Resolved: **option 2, executed at Turn 4 as `70f17da`.** `coderev` was dispatched over
`1d1d3a3..01932d6` — twelve commits, which subsumes all nine that were uncovered when this record
was filed and all six of those that touched shipped files, including `e331332`, the commit
`v10.0.0` points at. Five findings came out of it (`260817-1505_*_the-curator-and-its-skill-still-say-a-projects-guard-configuration-can-deny-a-write.md` through `260817-1509_*_no-test-pins-the-repeat-to-the-user-mandate-that-already-shipped-narrow-once.md`), and one of
them rode into the patch rather than waiting: `260817-1506_*_three-surfaces-say-the-retired-file-diagnostic-has-one-channel-and-the-orchestrator-fix-gave-it-two.md` was fixed in `dcb0784` and shipped in
v10.0.1, which is precisely the "findings cannot change v10.0.0 but can shape a v10.0.1" this
record's option 2 predicted.

Re-measured at HEAD by this pass: `bin/fusion-review-coverage --since 3d41d4a` now reports
`commits=27 reviews=3 unusable=0 uncovered=3`, down from `uncovered=9`. The three that remain are
`70f17da` (the review file itself), `dcb0784` and `d0f13fa`, all of them *after* the review — a
review cannot open the commit that adds it, so this residue is structural rather than the gap this
record names. Two files are carried as `not-opened` by the Turn-4 review's own header,
`hooks/lib/__tests__/fixtures/rules-emission.golden` and `.../surface-growth.golden`.

**What the closure does not discharge**, stated so it is not read as covered: option 3's second
half, "separately decide whether a plan-stated precondition gets any mechanism at all", is
untouched. This record's own `## What it costs if it stands` is therefore still live — the next
plan that writes such a clause has the same nothing enforcing it. It is now filed as its own
choice point, `260817-1613_*_does-a-plan-stated-precondition-get-any-mechanism-or-is-it-read-by-a-human-or-not-at-all.md`,
rather than left inside this closed record. Option 3's *first* half — the filter of the uncovered
set to shipped-file commits — remains unimplemented on
`260815-2109_*_may-a-circle-close-over-an-uncovered-review-range-and-who-decides.md`,
where it belongs.

The historical fact this record was filed about stands and cannot be undone: v10.0.0 was tagged
over a range no review had opened. What is closed is the gap, not the history.
