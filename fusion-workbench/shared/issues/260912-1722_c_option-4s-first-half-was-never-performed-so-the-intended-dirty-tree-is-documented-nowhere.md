# Option 4's first half was never performed, so the intended dirty tree is documented nowhere

---
`260830-1843_*_how-does-the-commit-lock-stop-leaving-the-tree-it-just-committed-dirty.md` chose
option 4, whose name has two halves: **state the dirt as intended** and narrow the sweep's guard.
The implementation performed the second half only, and its own `Implemented:` line records that
`rules/commit-lock.md` was not opened. So the behaviour is intended, decided and implemented, and
no text a reader reaches says so. It reads as a defect to whoever notices it next, which it did
again on 2026-09-12.

---
**Filed by:** analyst, Kai Stalmann <ks@qantr.com>
**Cross-references:** `260830-1843_*_how-does-the-commit-lock-stop-leaving-the-tree-it-just-committed-dirty.md` (the decision whose first half is unperformed) · `rules/commit-lock.md` `### The lock writes the commit event` (where the statement belongs) · `rules/workbench-tracking.md` (class R2, why the file is tracked)

## The defect

`emit_commit_event()` appends the machine-written `commit` row to
`fusion-workbench/orchestrator-events.jsonl` after the wrapped command exits 0
(`bin/fusion-commit-lock:302-324`, called at line 383 inside the held region). The file is tracked
and class R2, so `git status --porcelain` is non-empty from the instant the commit lands. That is
settled and intended.

What no shipped text states:

1. **That the resulting dirty tree is intended at all.** `rules/commit-lock.md`
   `### The lock writes the commit event` describes the row, its conditions, its best-effort
   contract and the no-second-author rule. It does not say that the tree is dirty afterwards, and
   the decision's `Implemented:` line confirms the file was never opened. The only place the
   intent is recorded is inside a decision record, which no agent loads and no reader of the rule
   is sent to.

2. **That committing cannot reach a clean tree.** This is the sharper half and appears in no
   record at all. The emission's only skip conditions are an unset `FUSION_SESSION_ID` and a HEAD
   that did not move. A commit whose content is the event log alone moves HEAD, so it emits a row
   of its own and leaves the tree dirty again. Under the lock there is therefore no sequence of
   commits that ends clean: every pass creates the next pass's content. The decision reasoned
   about a standing dirty file and named two consequences, the sweep's guard and cleanup's splits.
   It did not reason about the fixed point.

## Why it matters

A reader who meets a never-clean tree and finds nothing saying it is intended has three moves, and
two are wrong: file it as a defect, or repair it by one of the three options the decision already
rejected, each of which costs a protocol property the record names. The third, reading the
decision store, requires already suspecting the answer is there.

The second point also bounds a real procedure. Anything that commits in a loop until the tree is
clean does not terminate under the lock. Nothing in the tree does that today, and `/fusion:cleanup`
makes one pass, so this is a bound on what may be built rather than a live failure.

## Not a defect in the mechanism

The row, its timing and its hash are correct and were chosen over three alternatives. Nothing here
proposes reopening that. `bin/fusion-staging-drift` already classifies the log as `in-flight`, the
machine-written set that is never a fault, so the drift reporter is not misled either.

## Proposed repair

Perform option 4's first half: a short paragraph in `rules/commit-lock.md`
`### The lock writes the commit event` stating that the tracked log leaves the tree dirty after
every landed commit, that this is intended, that the three rejected alternatives each cost a
protocol property, and that committing the log alone emits another row rather than settling.

Route: `coder`, one rule-file edit. The decision stays `_i_`: its implementation is not wrong, its
naming half was simply not carried out, and this issue is the carrier.

## Open question, not decided here

Whether the non-termination deserves more than a sentence, for instance a named skip condition so
a log-only commit emits nothing. That would be a fourth alternative to the three the decision
weighed and needs its own record if anyone wants it.

---
Resolved: option 4's first half performed in `rules/commit-lock.md` `### The lock writes the commit event` — one paragraph stating that the tracked, class-R2 log leaves the tree dirty after every landed commit and that this is intended, that the three weighed alternatives each cost a protocol property (the measured hash, the append-only union-merged log, or the log travelling at all) with the decision cited for which is which, and that a log-only commit moves HEAD and emits another row, so nothing that commits in a loop until clean terminates under the lock. No behaviour changed: `bin/fusion-commit-lock` was not opened and the decision record stays `_i_`. The closing open question — a skip condition so a log-only commit emits nothing — is deliberately unanswered and needs its own decision record.
