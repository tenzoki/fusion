# Can anything carry the rename→citation obligation when a record marker moves?

---
**Domain:** code
**Status:** answered
**Filed by:** coder, session `260816-0119`
**Cross-references:** `260811-1755_*_stale-marker-citations-recur-and-the-lint-does-not-read-the-hook-entrypoints-where-one-was-hiding.md` (item 2, the part this record carries out of a closed defect); `260806-0015_*_zitierform-fuer-workbench-records.md` (the wildcard form this class is supposed to be closed by); `hooks/lib/__tests__/reference-resolution-lint.test.ts` (the gate that catches the breakage after the fact)

---

## Question

Issue `260811-1755_*_stale-marker-citations-recur-and-the-lint-does-not-read-the-hook-entrypoints-where-one-was-hiding.md` closed on its mechanical half — the reference lint now reads `hooks/*.ts` as
well as `hooks/lib/*.ts`, so a stale marker citation in an entrypoint reddens the suite. Its second
item was explicitly not a fix and was left for a decision record: **should anything carry the
obligation to follow a marker rename into the text that cites the renamed record, and if so what?**

The asymmetry the record names is the whole reason it is a question. The renaming party is the only
party that ever holds both the old and the new name; the citing files are found by one `grep`. Yet
today nothing connects the two, so the coupling is discovered by a red suite in some later session
rather than by the session that caused it. Twice in one session in `260811-1755_*_stale-marker-citations-recur-and-the-lint-does-not-read-the-hook-entrypoints-where-one-was-hiding.md`, and a live third
instance stands at `hooks/guard.ts:307`, which resolves only because the record it cites has not
moved yet.

It must be answered now rather than later because the gate landing on 2026-08-16 changes the cost of
NOT answering: more surface is now watched, so the same rename breaks the suite in more places.

## Options

1. **Nothing — the gate is the answer.** The lint already fails on a stale marker with a message
   naming the wildcard fix. Leave the obligation with whoever meets the red suite.
   - Pros: no new mechanism, no new surface; the failure is already loud and already actionable.
   - Cons: the cost lands on a session that did not cause it; a one-character mismatch reddens a
     750-test suite, and behind `agents/coder.md`'s report shape every executor dispatched in that
     state reports `blocked` regardless of what it achieved (`260810-0703_*_…`).
2. **A step in the marker-transition convention.** `rules/fusion-workbench-conventions.md` gains a
   line: after renaming a record's marker, grep the shipped surface for the old name and rewrite
   each hit to the wildcard form.
   - Pros: puts the obligation on the only party holding both names; costs one `grep`; no code.
   - Cons: a written obligation nobody executes is how this class recurred in the first place — the
     wildcard form was already ratified when both `260811-1755_*_stale-marker-citations-recur-and-the-lint-does-not-read-the-hook-entrypoints-where-one-was-hiding.md` failures were written.
3. **A helper the renaming party runs.** A `bin/` script that takes the old and new names, finds the
   citing files and rewrites the marker position to `_*_`.
   - Pros: mechanical, so it does not depend on the rename being careful; would have prevented every
     instance measured so far.
   - Cons: a fifth `bin/` helper against a defect class the gate already catches; and it rewrites
     shipped text, which no fusion mechanism currently does (`rules/critical-stance.md` §2 — the
     lint is deliberately a guard and not a fixer).

## Constraints

- Whatever is chosen must not put a text-rewriting mechanism on an every-tool-call path.
- It must not require the citing text to know a record's state — that is precisely what
  `260806-0015`'s wildcard form removed.
- Option 3 would be the first fusion mechanism that edits shipped text; that is a threshold, not a
  detail, and answering it as a side effect of this record would be the wrong way to cross it.

## Recommendation

None from the filing agent — the trade is between a written obligation with a demonstrated failure
rate and a new mechanism against a class an existing gate already catches, and that is a judgement
about how fusion wants to spend surface, not a technical question. Recorded here so it stops living
inside a closed defect.

---
Answered: 260816-1500-orchestrator-session.md `## Decisions answered by the user` — option 1: nothing new; the reference lint remains the whole mechanism. No fusion mechanism rewrites shipped text. User answered inline 2026-08-16.
Implemented:
Deferred:
Superseded by:

---
**Reconciliation 260819-1400 (reconciler, domain `code`, HEAD `e435f03` / `v10.3.0`) — marker
unchanged at `_a_`, and this record can never reach `_i_` under the citation rule as it stands.
That is a class, not an oversight, and it is the second member.**

*The answer is on disk in the only sense a "nothing new" answer can be.* Option 1 chose the
reference lint as the whole mechanism, and the lint is present and covers the surface the record
was worried about: `hooks/lib/__tests__/reference-resolution-lint.test.ts` reads the top-level
`hooks/*.ts` entrypoints as well as `hooks/lib/*.ts` (`:178`, and `:495-497` records the count
movement that entry caused). Nothing in fusion rewrites shipped text, which is the answer's other
clause, and no `bin/` helper was added for the rename obligation.

*Why it stays `_a_`.* Every one of those facts predates the answer or is the *absence* of a change,
so there is no commit or `path:line` that a reader could resolve as "this is where the answer was
realised". `rules/fusion-workbench-conventions.md` `### Decision files` defines `Implemented:` as a
citation of a commit or a path, and a decision to build nothing has neither.

*The class.* This is the same shape as
`260719-2141_*_concurrency-worktree-slots-vs-single-active-circle.md`, whose
reconciliation note of 260731-2324-reconciliation.md left the identical judgement to the user: promote on
pre-existing surfaces, or accept that a no-op answer never reaches implementation. Two records in
`shared/decisions/` stood in it when this was written.

*And one of the two has since left the class rather than being decided out of it.* On 260822 the
user reversed `260719-2141`, which is now superseded, so its unanswerable question about
implementation no longer needs an answer: a superseded record is not waiting to be realised. That
does not settle the class, because the reason it left is unrelated to what made it hard. It does
mean this record is now the only member, and that a class of one is a thinner basis for deciding
the general question than a class of two. It is **not** the class that
`260815-2056_*_what-marks-an-answered-decision-whose-answer-can-no-longer-be-realised.md`
asks about — there the ground was removed after the answer; here the answer was never a thing to
build — and conflating the two would widen that record's question while it is still open.

**What binds a deep change.** The reference lint is the whole mechanism for stale-marker citations
and is load-bearing by decision, not by accident. A change that renames a record's marker carries
the grep for the old name itself; a change that removes or narrows the lint removes the only thing
standing behind this answer.

---
**Reconciliation 260824-1637** (reconciler, domain `code`, Phase 3 of session `260824-0539`, HEAD `cf7a5b0`; log `260824-1637-reconciliation.md`) — marker unchanged at `_a_`. **A worked instance landed in Circle `260824-0530-record-attribution-and-circle-claim`, and it was carried by hand.**

That Circle made the wildcarded citation form normative (`rules/fusion-workbench-conventions.md` `## Filename Patterns`, commit `2b055a0`) and then, at `0f5889e`, moved `260807-0158_*_how-is-a-unique-record-filename-obtained.md` from `_a_` to `_i_`. Two citations of that record in `260808-0030_*_line-number-citations-into-rule-files-go-stale-and-no-gate-reads-them.md` named the old marker literally, and they were rewritten to the `_*_` form at `6d439ba` — one commit *before* the rename that would have staled them, by a writer who saw it coming rather than by any mechanism.

So the obligation was met, and it was met by a person reading ahead. Nothing carried it. The new rule text makes the correct form normative and still names no carrier, which is precisely this record's question.
