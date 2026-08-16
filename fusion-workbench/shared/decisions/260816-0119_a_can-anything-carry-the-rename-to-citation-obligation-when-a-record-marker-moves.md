# Can anything carry the rename→citation obligation when a record marker moves?

---
**Domain:** code
**Status:** answered
**Filed by:** coder, session `260816-0119`
**Cross-references:** `shared/issues/260811-1755_*_stale-marker-citations-recur-and-the-lint-does-not-read-the-hook-entrypoints-where-one-was-hiding.md` (item 2, the part this record carries out of a closed defect); `circles/260805-2005-textschicht-gegen-code-nachziehen/decisions/260806-0015_*_zitierform-fuer-workbench-records.md` (the wildcard form this class is supposed to be closed by); `hooks/lib/__tests__/reference-resolution-lint.test.ts` (the gate that catches the breakage after the fact)

---

## Question

Issue `260811-1755` closed on its mechanical half — the reference lint now reads `hooks/*.ts` as
well as `hooks/lib/*.ts`, so a stale marker citation in an entrypoint reddens the suite. Its second
item was explicitly not a fix and was left for a decision record: **should anything carry the
obligation to follow a marker rename into the text that cites the renamed record, and if so what?**

The asymmetry the record names is the whole reason it is a question. The renaming party is the only
party that ever holds both the old and the new name; the citing files are found by one `grep`. Yet
today nothing connects the two, so the coupling is discovered by a red suite in some later session
rather than by the session that caused it. Twice in one session in `260811-1755`, and a live third
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
     state reports `blocked` regardless of what it achieved (`shared/issues/260810-0703_*_…`).
2. **A step in the marker-transition convention.** `rules/fusion-workbench-conventions.md` gains a
   line: after renaming a record's marker, grep the shipped surface for the old name and rewrite
   each hit to the wildcard form.
   - Pros: puts the obligation on the only party holding both names; costs one `grep`; no code.
   - Cons: a written obligation nobody executes is how this class recurred in the first place — the
     wildcard form was already ratified when both `260811-1755` failures were written.
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
Answered: shared/history/260816-1500-orchestrator-session.md `## Decisions answered by the user` — option 1: nothing new; the reference lint remains the whole mechanism. No fusion mechanism rewrites shipped text. User answered inline 2026-08-16.
Implemented:
Deferred:
Superseded by:
