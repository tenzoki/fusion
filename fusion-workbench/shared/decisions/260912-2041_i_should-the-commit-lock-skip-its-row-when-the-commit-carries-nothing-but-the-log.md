# Should the commit lock skip its row when the commit carries nothing but the log?

---
**Domain:** code
**Filed by:** analyst, Kai Stalmann <ks@qantr.com>
**Cross-references:** `260830-1843_*_how-does-the-commit-lock-stop-leaving-the-tree-it-just-committed-dirty.md` (the three alternatives already weighed and rejected; this is the fourth its cut did not carry) · `260912-1722_*_option-4s-first-half-was-never-performed-so-the-intended-dirty-tree-is-documented-nowhere.md` (where the question was raised and deliberately left open) · `rules/commit-lock.md` `### The lock writes the commit event` (the three properties any answer must keep, and the paragraph that now states the bound) · `rules/workbench-tracking.md` (class R2)

---

## Question

`emit_commit_event()` appends a `commit` row to `fusion-workbench/orchestrator-events.jsonl` after
any wrapped command that moved HEAD (`bin/fusion-commit-lock:302-324`, called at 383). The file is
tracked and class R2, so the row dirties the tree it was just committed from. A commit whose
content is the log alone moves HEAD too, so it emits a row of its own: under the lock there is no
sequence of commits that ends with a clean tree.

`260830-1843_*_how-does-the-commit-lock-stop-leaving-the-tree-it-just-committed-dirty.md` settled
the standing dirt as intended, choosing to narrow the sweep's guard rather than change the lock.
Its cut weighed three ways to avoid the dirt and rejected each for the protocol property it costs.
It did not consider a fourth shape, which costs none of those three: emit as now, but not for a
commit that carries nothing a person wrote.

It is worth answering now because the non-termination has just become a stated bound in
`rules/commit-lock.md` rather than an unwritten surprise. That makes leaving it open cheap, and it
also makes the question askable for the first time: a bound nobody had written down could not be
weighed against the cost of removing it.

## Options

The dimension is **when the lock emits**, and the options are ordered by how much they exclude.

1. **Always, as today.** The bound stands and the paragraph in `rules/commit-lock.md` is the whole
   answer.
   - Pros: no predicate added to a script whose recent history is the removal of predicates, and
     the invariant stays total: every landed commit under the lock has a row, with no exception a
     consumer must know about. Nothing is built today that loops until clean, so the bound costs
     nothing that is currently spent.
   - Cons: the tree is never clean after a fusion commit, so every later pass starts dirty and
     each housekeeping split drags the previous one's row. The bound is a standing constraint on
     what may be built, and constraints of that kind are discovered by the person who violates
     them rather than read in advance.

2. **Skip when the commit's only path is the event log.** After HEAD has moved, the lock asks the
   repository what the commit contains (`git show --name-only --format= HEAD`) and emits nothing
   when the sole path is `fusion-workbench/orchestrator-events.jsonl`.
   - Pros: it reaches a fixed point. One log-only commit settles the tree, and committing becomes
     terminating. The question is asked of the repository after the fact, never predicted from the
     command's text, so it does not repeat the undecidability that this codebase deleted two
     mechanisms over (`rules/critical-stance.md` §4). All three properties
     `rules/commit-lock.md` mandates survive untouched: the row still carries a measured hash, no
     caller gains the right to emit one, and the check is inside the held region where HEAD is
     already read, so it cannot change the wrapped command's exit code. The cost of the lost
     totality is measurable and small: `bin/monitor:1543` is the only reader of a `commit` row in
     the tree.
   - Cons: "every landed commit has a row" stops being total, and a later consumer that counts
     commits inherits an exception it must be told about. The log can then no longer answer when
     the log itself was last committed, which is a question somebody may ask precisely because it
     is the travelling artifact. One more `git` call per commit inside the held region.

3. **Skip when every path in the commit is machine-written**, reusing the `in-flight` class
   `hooks/lib/staging-drift.ts` already authors.
   - Pros: one list rather than one filename, authored in a place that already exists, so a future
     machine-written travelling file is covered without a second edit.
   - Cons: **it skips commits that cause no regress.** The class holds nine surfaces, and three of
     them travel and are tracked: the event log, `.fusion-setup` and `.asset-provenance`. Only the
     first regenerates itself on commit. A commit carrying only a rewritten setup marker is an
     ordinary commit that settles, and suppressing its row buys nothing and loses a record. It
     also couples the mutex to a reporter's classification, which is a wider blast radius than the
     defect.

**The cut, checked.** The three are disjoint over which commits emit: all of them, all but
log-only, all but machine-written-only. A fourth shape sometimes reached for, making the log
untracked so the question never arises, is **not** a fourth option here: it is option 3 of
`260830-1843_*_how-does-the-commit-lock-stop-leaving-the-tree-it-just-committed-dirty.md` and was
rejected there, and it is ruled out by the constraint below rather than re-weighed.

## Constraints

- The three properties in `rules/commit-lock.md` `### The lock writes the commit event` hold under
  any answer: the row exists for a landed commit, no caller emits one of its own, and the emission
  is best-effort and never changes the wrapped command's exit code.
- `orchestrator-events.jsonl` stays tracked and stays `merge=union`. Nothing here reopens class R2.
- No answer may decide whether a commit landed from the command's text. HEAD is read and compared,
  and any new test is asked of the repository after the fact.
- Whatever is chosen, `rules/commit-lock.md` says what it is. The paragraph there is now the
  reader's only account of this behaviour and must not be left describing the rejected world.

## Recommendation

`inference:` Option 2, and weakly. The argument for it is that it removes a standing bound at a
cost that was measured rather than feared: one reader of `commit` rows in the whole tree, one
`git` call in a region that already runs several, and no mandated property touched. The argument
against taking it at all is real and is not technical: nothing today loops until clean, so the
bound is unspent, and this project has repeatedly paid more for removing a predicate than for
keeping a constraint written down.

Option 3 is ruled out on its own evidence rather than on taste. It suppresses the row for
`.fusion-setup` and `.asset-provenance` commits, which settle on their own and whose rows nothing
asked to lose.

The residual to accept with option 2, stated rather than discovered later: the event log stops
being able to say when the event log was committed. That is a small hole and it is in the one file
whose purpose is to be the record after a clone.

## Open question this does not settle

Whether the lock should emit anything at all for a housekeeping commit is a wider question than
this one, and nothing here bears on it.

---
Answered: `260912-2041_*_should-the-commit-lock-skip-its-row-when-the-commit-carries-nothing-but-the-log.md` `## Options` — option 2: the lock emits no row when the landed commit's only path is `fusion-workbench/orchestrator-events.jsonl`, so a single log-only commit settles the tree and committing terminates. The residual is accepted as stated: the log can no longer say when the log itself was committed; ruled by user, Kai Stalmann <ks@qantr.com>.

---
Implemented: 8d4bbe07 — `commit_is_log_only()` added to `bin/fusion-commit-lock` between the HEAD comparison and the write; `rules/commit-lock.md` `### The lock writes the commit event` rewritten to the new behaviour; both geometries covered in `hooks/lib/__tests__/fusion-commit-lock.test.ts`.
