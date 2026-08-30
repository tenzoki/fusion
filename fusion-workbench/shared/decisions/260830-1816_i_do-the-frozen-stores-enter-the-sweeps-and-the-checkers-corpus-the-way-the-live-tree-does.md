# Do the frozen stores enter the sweep's and the checker's corpus the way the live tree does?

---
**Domain:** code
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Cross-references:** `260819-1645_*_what-defines-the-citation-gates-corpus-and-what-happens-when-a-marker-move-changes-it.md`; `260820-0805_*_the-citation-gates-corpus-excludes-only-archive-so-a-frozen-copy-tree-would-enter-a-blocking-gate.md`; `260828-0904_*_is-an-archived-record-a-citation-target.md`; `260829-1623_*_does-fusion-ship-the-citation-sweep-or-only-the-checker-and-under-which-guards.md`; `260823-1414_*_does-the-workbench-citation-gates-corpus-cover-review-files.md`; `260830-1841_*_citation-mechanism-four-defect-repair.md` (the plan whose step 4 realised the answer); `260830-2225_*_should-an-archived-violation-move-the-checkers-verdict-line.md` (the residual this record left open)

---

## Question

Three programs share one citation grammar and disagree about what they read.

| Program | `archive/` | `stashes/` | `.migration-v2-backup/` |
|---|---|---|---|
| `workbench-citation-lint.test.ts` (blocking gate) | excluded | excluded | excluded |
| `hooks/citation-check.ts` (reports, never gates) | excluded | excluded | excluded |
| `hooks/citation-sweep.ts` (rewrites, run by hand) | **read** | **read** | **read** |
| `citation-sweep.ts --repair` | **read, on purpose** | read | read |

The gate's exclusion is reasoned in its own comment: an archived record is a frozen copy of what
was true when it was swept, and repairing its citations would rewrite history rather than correct
it; for the two copy trees, a blocking gate over a rollback copy has no honest remedy. The checker
inherited that list verbatim, citing the gate. The sweep never had it.

No decision record carries the exclusion. `260819-1645_*_what-defines-the-citation-gates-corpus-and-what-happens-when-a-marker-move-changes-it.md`
settles the gate's corpus as a marker predicate and the zero-dangling property, and says nothing
about frozen stores; the widening from `archive/` alone to three came from
`260820-0805_*_the-citation-gates-corpus-excludes-only-archive-so-a-frozen-copy-tree-would-enter-a-blocking-gate.md`,
which is about a blocking gate over a rollback copy and about nothing else.

So the question is not whether to introduce a rule. It is which of two rules already in the tree is
the one this project meant, and whether one answer is right for all three programs.

## Evidence

**fusion already swept its own archive, and the sweep's inclusion was never decided.** Commit
`f1099c5f` rewrote **565** `.md` files under the workbench's archive store, 3082 insertions against
3082 deletions. A dry run over the workbench today reports `rewrites=0` with the archive in the file
set, so the archive is at the storeless form and stays there. The rewriting-history position, which
is the gate's stated reason, was overridden in practice for the sweep without anyone stating it.

**The 566 this record carried as filed was wrong, and the correction is worth stating.** The figure
came from a `grep` for `archive/` over the commit's `--numstat`, which also matched
`skills/archive/SKILL.md` — a shipped skill body, not an archived record. Restricting the same
`--numstat` to paths under the workbench's archive store that end in `.md` gives 565 files and the
3082/3082 pair above. The order of magnitude the record reasons from is unchanged; the arithmetic
below is not built on it.

**The grammar already resolves into the frozen stores.** `workbenchIndex()` walks the whole
workbench with no prefix filter, and `circleDirs()` carries an explicit archive-sweep branch whose
comment says an archived Circle resolves wherever it is. So the archive was in-corpus for resolution
and out-of-corpus for reporting, in the same file.

**A store-prefixed citation inside an archived record is already dead.** The three store-prefixed
shapes are detected and never resolved, by design. Rewriting one to the storeless form makes it
resolve again, against an index that covers the archive. For that class the rewrite restores a
pointer rather than falsifying a record. That an archived record is a legitimate citation target is
already settled, by `260828-0904_*_is-an-archived-record-a-citation-target.md`.

**`stashes/` was a move, not a copy.** The removed Circle-stash skill body states it: "the capture is
one move of one directory", and its Step 7 is headed "Execute the moves"; the root-anchored files are
copied and then removed at 7.7. A stashed Circle is the only copy of itself, and its partner
`/fusion:circle-pop` no longer exists, so it can never be restored to the live tree.

**`.migration-v2-backup/` is a copy, and it holds nothing the sweep would touch.**
`rules/fusion-workbench-conventions.md` names it the retired migration skill's rollback copy: the
original was migrated in place and this tree is the pre-migration state. Its value is byte-identity
with that state. **Measured in the one consuming project that carries one: 205 `.md` files, and 0
store-prefixed citations among them.** All 205 carry pre-v4 bracket names, which the grammar declines
to rewrite for a separate reason recorded in
`260830-1842_*_may-the-grammar-resolve-a-bracket-marked-record-that-a-frozen-store-keeps-permanently.md`.
So the sweep has nothing to rewrite there, and the exception this record was built around has no
measured case.

**The checker's verdict claimed coverage it did not have.** Of the `.md` files this workbench held
when the record was filed, roughly a quarter sat under the archive, and no line of the checker's
`KEY=value` block said they were not read.

## Options

**The three options this record carried as filed were cut wider than the choice actually in front of
the user, and they are rewritten here to what was live.** As filed, the record's own recommendation
turned on a move-versus-copy carve-out for `.migration-v2-backup/`; the measurement above then found
that carve-out has no case to protect. The options below are the alternatives that survived that
measurement, and the record is answered on them.

All three hold the **blocking gate** fixed at its three exclusions. The gate's answer was argued in
`260820-0805_*_the-citation-gates-corpus-excludes-only-archive-so-a-frozen-copy-tree-would-enter-a-blocking-gate.md`
from the cost of a red suite over a tree with no honest remedy, and nobody proposed reopening it.
What the three divide is which of the frozen stores the **sweep** and the **checker** read — and both
take the same answer, because a rewriter whose corpus is wider than its reporter's is the defect that
produced this record.

1. **Both read all three frozen stores exactly as they read the live tree.**
   - Pros: one list for both programs, and no criterion for a later reader to apply. It matches what
     `f1099c5f` already did to this repository's own archive rather than reversing it. The checker's
     verdict stops silently omitting a quarter of the tree. And for the class that motivated the
     sweep, the rewrite restores a pointer that is dead as it stands.
   - Cons: the reporter's `dangling=` figure grows by every violation frozen into an archive, and
     nobody will repair one of them. That cost is real, and it is what the residual record now asks
     about.
2. **Both read the moved stores; neither reads the copy store.** The criterion is move-versus-copy:
   `archive/` and `stashes/` received a move and hold the only copy of their records, while
   `.migration-v2-backup/` is a rollback copy whose worth is byte-identity with the pre-migration
   state, so a rewrite destroys it.
   - Pros: it protects a backup from the one program that would change it, and the criterion is
     decidable from what created the store rather than from a judgement about its contents.
   - Cons: **no measured case.** The one copy tree anybody has holds 205 files and 0 store-prefixed
     citations, so the sweep would rewrite nothing there and the carve-out protects nothing that is
     under threat. It buys a second list in exchange, which a fourth reader of the grammar would have
     to choose between.
3. **Neither reads any of the three.** Make the sweep match the checker as the checker stood.
   - Pros: one list, and the gate's stated reason applied consistently to all three programs.
   - Cons: reverses `f1099c5f` in effect. This repository's archive is already at the storeless form,
     and the sweep is the only program that can verify it stayed there — the `rewrites=0` dry run
     that `citation-sweep.test.ts` pins as a release gate. Excluding the archive puts the tree the
     sweep converted permanently outside the check that it is still converted, and leaves every
     archived record's store-prefixed citations unresolvable, which is the state the storeless form
     was introduced to end.

**The cut, checked.** The dimension is which subset of the three frozen stores the two programs read:
all three, the two moved ones, or none. Those three are disjoint and no input falls between them.
Five further subsets exist arithmetically and none is named by any criterion in this tree — there is
no argument on offer that separates `archive/` from `stashes/`, or that admits the copy store while
refusing a moved one — so the enumeration is complete over the criteria available rather than over
the powerset, and this sentence is where that limit is stated instead of being hidden.

## Constraints

- Whatever is chosen, the sweep and the checker must agree. A rewriter whose corpus is wider than
  its reporter's is the shape the consuming project measured: the sweep changed files the checker
  then declared clean.
- The blocking gate's answer is separable and stays with
  `260819-1645_*_what-defines-the-citation-gates-corpus-and-what-happens-when-a-marker-move-changes-it.md`
  unless this record explicitly overrides it. A gate has a cost the other two do not: it reddens
  somebody's suite.
- The checker must state its corpus in its output whichever way this is answered. A verdict that
  silently omits a quarter of the tree is a coverage claim nobody can check.

## Recommendation

The record as filed recommended what is now option 2, on the ground that move-versus-copy separates
the three stores by what created them rather than by a judgement about their contents. **The
measurement removed that recommendation's basis.** The criterion is sound and it divides nothing:
with 0 store-prefixed citations across the 205 files of the only copy tree in existence, the
carve-out protects a backup from a rewrite that would not occur. What is left is a second list, and a
second list is the cost option 1 avoids.

So the recommendation stands corrected to **option 1**, and the record is answered on the
measurement rather than on the argument the original recommendation made.

---
Answered: 260830-1841_*_citation-mechanism-four-defect-repair.md step 4 — user 2026-08-30 at the plan-review gate, option 1: the frozen stores enter the sweep's and the checker's corpus the way the live tree does, and the blocking gate keeps all three exclusions.

---
Implemented: 32fe0d49 — `hooks/citation-check.ts` drops `FROZEN_PREFIXES` and the filter that applied it, so the checker reads every `.md` the workbench walk returns, and its `## Corpus` header block carries the four pieces of evidence above. Measured over this repository at that commit: the corpus grew by the 605 `.md` files under the archive store and `dangling` by 65 rows, every one of them in a file under the archive, spread over four sweep directories; `store-prefixed` held at 0 and `verdict=violations` did not move. `hooks/lib/__tests__/workbench-citation-lint.test.ts` keeps all three exclusions, untouched.
