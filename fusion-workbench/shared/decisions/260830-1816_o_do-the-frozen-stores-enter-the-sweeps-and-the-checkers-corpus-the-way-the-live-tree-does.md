# Do the frozen stores enter the sweep's and the checker's corpus the way the live tree does?

---
**Domain:** code
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Cross-references:** `260819-1645_*_what-defines-the-citation-gates-corpus-and-what-happens-when-a-marker-move-changes-it.md`; `260820-0805_*_the-citation-gates-corpus-excludes-only-archive-so-a-frozen-copy-tree-would-enter-a-blocking-gate.md`; `260829-1623_*_does-fusion-ship-the-citation-sweep-or-only-the-checker-and-under-which-guards.md`; `260823-1414_*_does-the-workbench-citation-gates-corpus-cover-review-files.md`

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

No decision record carries the exclusion. `260819-1645_*_...` settles the gate's corpus as a marker
predicate and the zero-dangling property, and says nothing about frozen stores; the widening from
`archive/` alone to three came from the issue cited above, which is about a blocking gate over a
rollback copy and about nothing else.

So the question is not whether to introduce a rule. It is which of two rules already in the tree is
the one this project meant, and whether one answer is right for all three programs.

## Evidence

**fusion already swept its own archive, and the sweep's inclusion was never decided.** Commit
`f1099c5f` rewrote 566 `.md` files under `fusion-workbench/archive/`, 3082 insertions against 3082
deletions. A dry run over the workbench today reports `rewrites=0` with `archive/` in the file set,
so the archive is at the storeless form and stays there. The rewriting-history position, which is
the gate's stated reason, was overridden in practice for the sweep without anyone stating it.

**The grammar already resolves into the frozen stores.** `workbenchIndex()` walks the whole
workbench with no prefix filter, and `circleDirs()` carries an explicit `archive/<sweep>/circles`
branch whose comment says an archived Circle resolves wherever it is. So `archive/` is in-corpus for
resolution and out-of-corpus for reporting, in the same file.

**A store-prefixed citation inside an archived record is already dead.** The three store-prefixed
shapes are detected and never resolved, by design. Rewriting one to the storeless form makes it
resolve again, against an index that covers `archive/`. For that class the rewrite restores a
pointer rather than falsifying a record.

**`stashes/` was a move, not a copy.** The removed `/fusion:circle-stash` body states it: "the
capture is one move of one directory", and its Step 7 is headed "Execute the moves"; the
root-anchored files are copied and then removed at 7.7. A stashed Circle is the only copy of
itself, and its partner `/fusion:circle-pop` no longer exists, so it can never be restored to the
live tree.

**`.migration-v2-backup/` is a copy.** `rules/fusion-workbench-conventions.md` names it the retired
`/fusion:migrate-workbench-v2`'s rollback copy: the original was migrated in place and this tree is
the pre-migration state. Its value is byte-identity with that state.

**The checker's verdict claims coverage it does not have.** Of 2297 `.md` files in this workbench,
605 sit under `archive/`, 26 per cent, and no line of the checker's `KEY=value` block says they were
not read.

## Options

1. **Cut by move-versus-copy, and let the blocking gate keep its own answer.** A store that
   received a *move* (`archive/`, `stashes/`) holds the only copy of its records and enters the
   sweep's and the checker's corpus like the live tree. A store that is a *copy*
   (`.migration-v2-backup/`) stays out of the sweep, because a rewrite destroys the byte-identity
   that is its whole purpose. The blocking gate keeps all three exclusions unchanged.
   - Pros: one criterion, two classes, disjoint and complete over the three directories. It matches
     what the sweep already did to fusion's own archive rather than reversing it. It ends the
     sweep/checker disagreement, which is the defect the consuming project met. The gate keeps the
     cost `260819-1645_*_...` accepted deliberately, and nothing here reopens it.
   - Cons: three programs still do not read one list, so a fourth reader has two lists to choose
     between and needs this record to choose. `stashes/` is classified from a removed skill's body
     rather than from a tree anyone can measure, since neither copy tree exists here.
2. **Treat all three as live, everywhere, gate included.** One list, no exceptions.
   - Pros: the simplest statement, and the only one where a reader needs no criterion at all.
   - Cons: a rewrite of `.migration-v2-backup/` destroys a rollback whose purpose is byte-identity,
     with no way to notice: the sweep's guard (a) protects the git tree, not the meaning of a backup.
     It also reopens a cost the user already weighed, a blocking gate reddening over a copy tree
     nobody can repair.
3. **Exclude all three everywhere, sweep included.** Make the sweep match the checker.
   - Pros: one list, and the gate's stated reason applied consistently.
   - Cons: reverses `f1099c5f` in effect, since fusion's archive is already storeless and would have
     to be left half-converted or rewritten back. It also leaves every archived record's
     store-prefixed citations permanently unresolvable, which is the state the storeless form was
     introduced to end.

## Constraints

- Whatever is chosen, the sweep and the checker must agree. A rewriter whose corpus is wider than
  its reporter's is the shape the consuming project measured: the sweep changed files the checker
  then declared clean.
- The blocking gate's answer is separable and stays with `260819-1645_*_...` unless this record
  explicitly overrides it. A gate has a cost the other two do not: it reddens somebody's suite.
- The checker must state its corpus in its output whichever way this is answered. A verdict that
  silently omits 26 per cent of the tree is a coverage claim nobody can check.

## Recommendation

Option 1.

The criterion that separates the three is not how frozen they are but whether the store received a
move or a copy, and that criterion is decidable from what created the store rather than from a
judgement about its contents. A moved record is the only instance of itself: its citations are read,
they currently do not resolve, and the rewrite is the repair. A copied tree has its original
elsewhere, and the copy's worth is that it did not change.

The gate stays out of this on purpose. Its exclusion was argued from the cost of a red suite over a
tree with no honest remedy, and that argument is sound for a gate and does not transfer to a
reporter or to a hand-run rewriter. Option 1 leaves it exactly where the user put it.
