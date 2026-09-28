# What marks an implemented decision whose implementation was later deleted, with no superseding decision to cite?

---
**Domain:** code
**Status:** implemented
**Filed by:** curator
**Cross-references:** `260814-1332-curator-run.md` §3 (the corpus measurement this record is filed from); `rules/fusion-workbench-conventions.md` `## State Markers — decisions` (position A); `agents/curator.md` `## Remit` and `260801-1244-curator` `## Directive` (position B); `260801-1020_*_may-any-fusion-writer-touch-rules.md` and `260809-1527_*_should-the-revert-narrow-to-the-payload-path-for-the-four-write-tools.md` (the two instances inside `$SCAN_DECISIONS`); `260812-1232_*_remove-the-protected-path-half-of-the-compliance-guard.md` (the retirement that produced them)

---

## Question

This workbench holds 84 decision records spanning 40 days, and **none carries the superseded marker**. The curator's first validation run was dispatched to find out whether that is because the supersessions were never recorded or because there are none. Measured against HEAD `ae21c87` on 2026-08-14: across the 19 citation-linked pairs the run's selection rule reached inside `$SCAN_DECISIONS`, no live record overturns another, and four of those pairs say in their own text that they refine rather than supersede.

What the corpus *does* hold is a different relation, and the marker vocabulary has no state for it: **an implemented decision whose implementation was later deleted, where the deletion was authorised at a user gate and a plan rather than by a decision record.** Three retirements produced this shape — the branch policy on 2026-08-09, the write classifier on 2026-08-07, and the protected-path half on 2026-08-12. The last is the largest: it removed the write-tool deny, the before-and-after fingerprint, the write-back, the `FUSION_ALLOW_RULES_WRITE` exemption and the `guard.protectedPaths` configuration leaf. It was decided by the user directly at 260812-1230, planned in `260812-1232_*_remove-the-protected-path-half-of-the-compliance-guard.md`, and no decision record authorised it. Two records were filed as successor *questions* and both are still open.

At least two records inside the curator's editable surface are left in that state, and roughly eleven more sit in closed Circles:

- `260801-1020_*_may-any-fusion-writer-touch-rules.md` — marker `_i_`. Its whole answer was the environment-gated exemption plus the project-level `protectedPaths` leaf. Neither exists. Its `Implemented:` line still cites the release that shipped them.
- `260809-1527_*_should-the-revert-narrow-to-the-payload-path-for-the-four-write-tools.md` — marker `_i_`. Its subject, the revert, is gone.

The question must be answered now because it decides what the curator does on every future run against any project, and because the answer changes which of the two positions below an agent obeys when they disagree.

## Options

1. **Nothing changes: `_i_` already covers it.** `rules/fusion-workbench-conventions.md` classes `_i_` as Grounding-Historie, "preserved record of what was decided, **including elements that have been replaced** or postponed". Under this reading the record is correct as it stands: the decision *was* implemented, that is a permanent fact, and the deletion is the codebase's history rather than the record's.
   - Pros: no vocabulary change, no migration, no new writer. It is the reading the conventions file already supports in as many words, and it keeps `Superseded by:` meaning exactly one thing — a later decision overrode this one.
   - Cons: a reader running the documented "show project history" pass over all five markers cannot distinguish a decision whose implementation ships today from one whose implementation was deleted a week later. The two look identical, and the second is the one that misleads. This is the case the curator was built to catch, and under this option it catches it and may say nothing on the record itself.

2. **Widen `Superseded by:` to accept a plan or a commit range, not only a decision record.** The retiring artifact is cited wherever it lives, and the record is renamed `_i_` → `_s_`.
   - Pros: reuses the existing terminal-to-terminal transition the conventions file already permits (`_i_` → `_s_` is named there as "the one allowed terminal-to-terminal transition"). One annotation, one rename, no new marker letter. The information lands on the record a reader actually opens.
   - Cons: dilutes the marker. `_s_` currently means "a later *decision* overrode this", which is a statement about the project's reasoning; widened, it also means "the code went away", which is a statement about the tree. Those retire a decision for different reasons and a reader filtering on `_s_` would no longer know which they were looking at. It also puts a rename in the curator's hands on Tier 3 evidence, which is the weakest tier.

3. **Add a `Retired:` annotation and leave the marker at `_i_`.** One line in the same family as `Answered:`, `Implemented:`, `Deferred:` and `Superseded by:`, citing the plan, commit or gate that removed the implementation, with no rename.
   - Pros: keeps `_s_` meaning one thing and still puts the fact where a reader will see it. It is additive, so no existing record's marker moves and no glob, filter or count anywhere in fusion changes behaviour. It is also the smallest thing that makes the curator's Tier 3 findings landable.
   - Cons: a sixth annotation on a template that already carries four, and a filename marker that no longer tells the whole story — a reader who trusts the marker alone still learns nothing. Needs a line in `rules/fusion-workbench-conventions.md` `## Inline State Tracking` and in the decision-record template, which the growth bound now charges for.

4. **Treat it as out of scope for records entirely, and require the retiring plan to list what it retires.** The obligation moves to whoever removes a mechanism: name, in the plan, every decision record the removal retires.
   - Pros: puts the knowledge where it is cheapest to write, at the moment the author knows it, rather than reconstructing it months later from git. No vocabulary change at all.
   - Cons: nothing enforces it, and the three retirements this record is filed from all failed to do it — including the one whose plan was ten steps with a goes/stays/changes inventory. An obligation that the best-documented removal in the project's history already missed is not a mechanism.

## Constraints

- `_i_` and `_s_` are terminal. Whatever is chosen must not require walking a terminal marker backwards.
- Any option that changes `rules/fusion-workbench-conventions.md` or the decision-record template adds bytes to the always-on corpus, whose hard growth bound was armed on 2026-08-14 with 12 000 bytes of head-room. Option 3 is the only one that costs bytes there.
- The curator's editable surface is `$SCAN_DECISIONS`, which is the Circle in scope plus `shared/`. Roughly eleven of the affected records sit in closed Circles and are unreachable from any run that does not have that Circle in scope. Whatever is decided, a single pass cannot repair the corpus.
- Under `## Evidence tiers` this class of finding is Tier 3: the retirement date is statable (2026-08-12 for the largest case) and so is the successor (none). Tier 3 is the weakest tier and is the one the run downgrades to a candidate when either half is missing.

## Recommendation

**Option 3, at moderate confidence.**

The argument is the one option 1's Cons state: the reading it relies on is already in the conventions file, and it is precisely the reading that makes an implemented-then-deleted decision indistinguishable from a live one. That indistinguishability is not hypothetical here — the largest single retirement this project has performed left eleven records claiming a shipped mechanism, and the only way to learn otherwise today is to read a plan in a different store or a paragraph in `CLAUDE.md`.

Option 2 is the tempting one and should be declined for the reason its Cons give: `_s_` earns its value from meaning one thing. A marker that answers two different questions is a marker a reader has to open the file to interpret, which is the property the whole underscore vocabulary exists to avoid.

Option 4 is right about where the knowledge is cheapest and wrong about whether it will be written. It is worth adopting *alongside* option 3 rather than instead of it.

`inference:` the byte cost of option 3 is small — one annotation line in the template and two or three sentences in `## Inline State Tracking` — but it is charged against a bound armed the same day, so it should be landed in a commit that regenerates the golden rather than appended to an unrelated one.

`speculation:` the reason this shape has no marker is that fusion's decision vocabulary was designed around decisions superseding each other, and this project has instead retired decisions by deleting code at user gates. If that is a durable habit rather than an artefact of one guard-heavy quarter, option 3's annotation will be used more often than `Superseded by:` ever has been — which, across 84 records, is zero times.

---
Answered: 260814-2306-orchestrator-session.md:318 — Option 3: a `Retired:` annotation citing the plan, commit or gate that removed the implementation, with the marker left at `_i_`. Nothing renames, so no glob, filter or count changes behaviour, and `_s_` keeps its single meaning. Answered by the user at the Rebalance gate of Circle 260815-0007, where the population had grown from two records to about twenty-four.
Implemented: c8eac96 — the `Retired:` annotation is defined in `rules/fusion-workbench-conventions.md` at its three named places (the `_i_` marker row, the decision-files subsection of `## Inline State Tracking`, and the record template's footer) and applied to the 25 records a full enumeration of all 63 implemented records found to cite an artifact the tree no longer holds. No marker was renamed, which is the option's substance.
Deferred:
Superseded by:

---

**Reconciliation 260815-2056 (reconciler, HEAD `bd07ee7`) — the answer is applied. Marker
deliberately unchanged; the `_a_` → `_i_` transition is available and was not taken by this pass.**

Both halves of option 3 are on disk. The definition landed in
`rules/fusion-workbench-conventions.md` — the `_i_` row of `## State Markers — decisions` (:328), the
annotation form and its no-rename clause in `## Inline State Tracking` (:431-436), and the
`Retired:` line in `## Decision Record Template` (:520) — written by a parallel dispatch, not by this
pass. The annotation itself is on **twenty-five** records, listed in
`260815-2056-reconciliation.md`.
No marker moved anywhere, so the property the option was chosen for holds: no glob, filter or count
in fusion changes behaviour.

**The population is twenty-five, and none of the three earlier figures was right.** This record's own
text says "at least two records inside the curator's editable surface … roughly eleven more … in
closed Circles" — thirteen, the figure reported at gate G1 on 2026-08-14. The Circle's Phase-3
reconciliation on 2026-08-15 put it "near twenty-four" by adding nine `_i_` records this Circle's
removals produced plus two `_a_` records. Measured record by record against the tree at `bd07ee7`:
twenty-five `_i_` records, and the two `_a_` records are not instances of this question at all.

**The `_a_` case is a different question and was filed rather than absorbed.** `Retired:` as landed
cites what removed *the implementation*, and an `_a_` record has none. See
`260815-2056_*_what-marks-an-answered-decision-whose-answer-can-no-longer-be-realised.md`.
The `speculation:` block above guessed the annotation would be used more often than `Superseded by:`
ever has been; on the first day it was used twenty-five times against that record's zero.
