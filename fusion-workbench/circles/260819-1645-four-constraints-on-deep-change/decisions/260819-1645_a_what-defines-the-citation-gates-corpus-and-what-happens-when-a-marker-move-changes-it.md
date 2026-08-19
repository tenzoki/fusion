# What defines the citation gate's corpus, and what happens when an ordinary marker move changes it?

---
**Domain:** code
**Filed by:** shaper
**Cross-references:** `shared/issues/260816-0725_*_the-citation-gates-new-exact-count-pin-is-coupled-to-workbench-contents-so-the-archive-step-can-turn-it-red.md`; `shared/issues/260819-1511_*_the-archive-citation-filter-reads-shipped-text-and-never-the-workbench-so-archiving-dangles-citations-invisibly.md`; `shared/issues/260819-1511_*_a-bare-stamp-citation-is-ambiguous-when-two-records-share-it-and-one-turn-log-resolves-to-the-wrong-record.md`; `hooks/lib/__tests__/helpers/citation-scan.ts`; `hooks/lib/__tests__/reference-resolution-lint.test.ts`

---

## Question

The user's second answer to the shaping of this Circle chose a blocking test in `npm test` for
the missing second caller of `scanRecordCitations`, and the first answer set its corpus: the
Circle records, `portfolio.md`, the open decisions and the open issues. Those two answers settle
what the gate scans. They do not settle what the gate does when the corpus changes under it, and
the corpus changes constantly, because membership is defined by a state marker that ordinary work
moves.

Three ordinary events change the corpus without anyone touching a citation. A defect is filed, so
a new `_o_` record enters the corpus carrying whatever citations it was written with. A defect is
closed, so a record leaves. The archive step of `/fusion:cleanup` moves a cited record out of
`shared/` and every citation of it stops resolving. Under a blocking gate, each of the three can
turn `npm test` red on a commit that did not cause the failure.

The question must be answered before the gate is armed, because the answer changes what the gate
asserts and therefore what it is. It cannot be deferred to the moment the suite first goes red:
whoever meets a red gate then has an incentive to make it pass, and the only cheap way to make an
exact-count gate pass is to write the new number in, which bakes the unresolved citation into the
baseline. That is a measured failure in this repository, not a hypothetical one. Issue
The record cited above as `shared/issues/260816-0725_*` states the same coupling for the existing
reference-resolution lint, its pin has
been re-approved twice rather than decoupled, and the reconciliation of 2026-08-19 found the gate
survived a real archive sweep only because the one surviving citation happened to sit in a
surface the lint does not scan.

## Options

1. **Zero-dangling over the corpus, recomputed on every run.** The gate resolves every citation in
   the live corpus and fails if any dangles. No baseline, no number to approve.
   - Pros: states exactly the property the user asked for, and states it without a number that can
     be edited to silence it. A reader who meets it learns which citation is dead and where.
   - Cons: any newly filed record with a bad citation reddens the suite for its author, who may
     have written the citation correctly against a record that has since transitioned. Archiving a
     cited record reddens it for whoever ran the housekeeping.
2. **Zero-dangling, with the archive and deletion annotations closing the loop.** Same assertion as
   option 1, plus the fourth answer's obligation carried far enough that the operations which
   orphan a citation repair it in the same act: the archive step rewrites or annotates the
   citations it breaks, and so does a deletion.
   - Pros: removes the largest of the three red-for-no-reason causes at its source rather than
     tolerating it. Archiving stops being a way to break the build.
   - Cons: the largest option. It makes `skills/archive/SKILL.md` a writer of other records, which
     is a new capability for that skill and needs its own bound. It does not address the newly
     filed record, which stays a live cause.
3. **An exact count pin with a written-down baseline**, in the shape
   `hooks/lib/__tests__/reference-resolution-lint.test.ts` already uses for its three classes.
   - Pros: consistent with the convention this repository already applies to gates that report what
     they examined, and the question of whether that is the convention is itself open
     (`shared/decisions/260816-0711_*_is-count-pinning-the-convention-for-every-gate-that-reports-what-it-examined.md`).
   - Cons: reproduces defect
     `shared/issues/260816-0725_*_the-citation-gates-new-exact-count-pin-is-coupled-to-workbench-contents-so-the-archive-step-can-turn-it-red.md`
     in a second place, knowingly. A count that may be
     re-approved is a gate that will be re-approved, and this repository has measured that twice on
     the one gate that has one.

## Constraints

- The gate asserts on the `dangling` partition only. The 677 `undecidable` tokens in the corpus
  are bare timestamps and ambiguous citations, which no mechanism reading the token can resolve.
  A gate that judged them would approximate an undecidable question, forbidden by
  `rules/critical-stance.md` §4.
- The corpus is defined by state markers, so no answer may assume it is stable between runs.
- The repair of the 245 dangling citations precedes the arming, per the user's own reading of
  answers 1 and 2. No option here changes that order.
- Whatever is chosen must not read the shared build tree during a run, the same constraint
  decision
  `shared/decisions/260816-0719_*_should-anything-assert-that-the-committed-hooks-dist-is-the-compilation-of-the-committed-source.md`
  carries, since concurrent suite runs in one checkout are supported by
  design.

## Recommendation

Option 1 as the gate, with option 2's archive half filed as the follow-on rather than folded in.

Option 1 is the only one of the three that states the property without a number, and the number is
where the two measured failures of the existing gate both live. Its cost is real but bounded: a
newly filed record with a dead citation is a defect in that record, and a gate that names it at the
commit that introduced it is the gate working rather than misfiring.

What I could not settle, and why it is the user's call rather than the planner's: option 2 is the
only one that stops archiving from breaking the build, and archiving is a routine step of
`/fusion:cleanup`, so under option 1 the user will meet that red suite. Whether that is acceptable
depends on how often they archive, which I do not know.

Also seen: 260819-2016 by planner — "the open decisions" has two readings and only one reproduces the Grounding's figures: `_o_` alone selects 4 records and yields 203 dangling tokens, while `_o_` plus `_a_` (the conventions' active-Grounding filter) selects 24 and yields 242. Whatever answer is given here has to state the corpus as a marker predicate, not as the word "open".

---
Answered:
Implemented:
Deferred:
Superseded by:
Retired:

---
Answered: circles/260819-1645-four-constraints-on-deep-change/history/260819-2006-orchestrator-session.md — user chose **option 1** at the plan-approval gate on 2026-08-19: zero dangling over the corpus, recomputed on every run. No baseline and no approvable number, so there is nothing that can be edited to silence the gate. Step 10 of the plan therefore does not exist: `skills/archive/SKILL.md` is not made a writer of records it did not create, and the archive half of the annotation obligation is not built.

The accepted cost is stated rather than argued away: a `/fusion:cleanup` archive sweep can turn `npm test` red, and so can a newly filed record carrying a bad citation — red, in both cases, for somebody who touched no citation. The user chose this knowing it, against the alternative of making the archive step repair what it breaks.

The measurement this session added to the argument against option 3: the corpus count moved by three tokens between the shaper's run and the planner's, with no citation touched by anyone. A number that drifts on its own is a number that will be re-approved rather than investigated.

---
**Evidence produced inside this Circle, 2026-08-19, after the answer.** Step 8 accounted for the
plan's 33 `stamp-name` hits and found 30. The missing three sit in
`circles/260801-1244-guard-rules-write/decisions/260805-1548_i_wie-soll-ein-circle-verschwinden-duerfen-den-jemand-absichtlich-loescht.md`,
which **step 4 of this same plan transitioned `_a_` → `_i_`**. An `_i_` decision is in neither corpus
reading, so the file left the measured set carrying three dead citations, and nothing reported it.

That is this record's own question, demonstrated by the work that answers it rather than argued: a
marker move in the ordinary course of a Turn took three dangling citations out of the gate's reach,
silently, and the gate that is about to be armed would have shown green over them. The three are named
in step 8's history log and were not repaired, being outside the repair corpus.

It is a cost of option 1 as chosen, not a defect in it. A recomputed corpus follows the markers, which
is what makes it need no baseline; the same property is what lets a record walk out of scope. The
alternative that would have caught it is not option 3 — a pinned count would have moved too — but a
corpus predicate that does not narrow as records reach their terminal state. Nobody has proposed one,
and this note does not.
