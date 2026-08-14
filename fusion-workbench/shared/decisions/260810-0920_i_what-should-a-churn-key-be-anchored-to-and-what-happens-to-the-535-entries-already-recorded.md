# What should a churn key be anchored to, and what happens to the 535 entries already recorded?

---
**Domain:** code
**Status:** answered
**Filed by:** orchestrator (session `260810-0844`, Turn 1 — triage of a defect record that states a decision precedes the fix)
**Cross-references:** `shared/issues/260809-2023_*_the-churn-map-is-keyed-by-the-sessions-cwd-and-never-pruned-so-setups-thrashing-read-ranks-dead-paths.md` (the measurement); `shared/decisions/260809-2004_*_should-the-latching-churn-and-cross-file-criticals-be-bounded-or-dropped.md` (measurement 7 saw one entry of this and called it a missing boundary); `hooks/tracker.ts` (the normalisation), `hooks/lib/churn.ts` (the map), `agents/orchestrator.md` and `skills/setup/SKILL.md` (the reader)

---

## Question

`fusion-workbench/.guard-state/churn.json` holds 535 entries, of which 297 resolve to no file on
disk. The keys come in four incompatible spellings of the same file, because `trackChurn` derives
a key from wherever the session happened to start rather than from the file itself: relative to
`fusion-workbench/` (229 entries), absolute in this checkout (149), absolute in a scratch or
`/tmp` path (120), absolute in a different clone on a different machine (37). The spelling every
consumer would assume, relative to the repo root, occurs zero times.

Nothing prunes, by construction: `recordChange` only adds, and `resetSession` deliberately keeps
`totalChanges`. So a key survives the deletion, rename or move of the file it names for the life
of the project, and `thrashingScore` for a dead key is its undecayed lifetime count. Three of the
top four entries in the ranking the orchestrator reads at Setup name files that do not exist, and
the top one names a path on a machine this checkout is not on.

The defect record is explicit that this is not one question. Fixing the key without deciding the
other two either destroys history or leaves the map half-migrated.

## Options

The three parts are close to orthogonal; an answer picks one from each.

**(a) What the key is anchored to.**

1. **The workbench root.** `hooks/lib/workbench-root.ts` already resolves it and
   `hooks/lib/project-relative.ts` already does this shape of work for the guard. One file gets
   one key from any working directory.
   - Pros: reuses two existing helpers rather than adding a third mechanism; matches how the
     guard already reasons about paths, so the two subsystems stop disagreeing.
   - Cons: a file outside the project (a `/tmp` scratchpad, another clone) has no representation
     under this anchor and must either be dropped at write time or stored absolute, which
     reintroduces a second spelling for a narrow case.
2. **Leave it cwd-relative and document the limitation.**
   - Pros: no migration, no code change.
   - Cons: the Setup surface keeps reporting a ranking that is wrong in a way its reader cannot
     see. Not seriously proposed here; listed so the null option is on the record.

**(b) The 535 entries already recorded.**

1. **Migrate what can be rewritten.** Rewrite the 229 workbench-relative and 149 this-checkout
   keys to the new anchor; drop the 157 that name other roots.
   - Pros: keeps the lifetime counts that make the Setup ranking worth reading at all.
   - Cons: a one-off migration path in a module that has never had one, and the merge of two
     spellings for one file is a decision in itself (sum the counters, or take the max).
2. **Clear the map.** Start empty at the new anchor.
   - Pros: one line, no migration code, no merge rule.
   - Cons: the Setup ranking is empty for weeks and the observation the file exists for is lost.
     The defect record notes a hand-prune was deliberately *not* done earlier because it would
     regrow within days and destroy the evidence — clearing has the same property.
3. **Leave the old entries, write new ones under the new anchor.**
   - Pros: nothing is destroyed.
   - Cons: the map now holds five spellings instead of four. Strictly worse than either.

**(c) Whether an entry is dropped when its file disappears.**

1. **Never drop.** A deleted file's churn history is arguably the most interesting kind.
   - Pros: no per-write cost; history is preserved.
   - Cons: the ranking keeps being led by files nobody can open, which is today's symptom.
2. **Drop on absence, checked at write.**
   - Cons: a `stat` per entry per write. The defect record is explicit that this must not be
     settled by adding the check and seeing whether anyone complains.
3. **Keep the entry, exclude absent files from the ranking the reader sees.** The check moves to
   the read path, which runs once per Setup rather than once per write.
   - Pros: preserves history and fixes the reported symptom, since the symptom is entirely about
     the ranking; the cost is one `stat` per entry per Setup rather than per write.
   - Cons: the file keeps growing without bound. That is a separate question this decision does
     not answer.

## Constraints

- Churn is **observation-only** by construction (`README-hooks.md`). Nothing is enforced off this
  file, so no answer here can break the guard. This bounds the risk of every option and is the
  reason the decision can be taken without a migration rehearsal.
- Decision `260809-2004` removed the lifetime *threshold comparison* from `analyzeChurn` but left
  `totalChanges` and `thrashingScore` untouched on purpose, because the Setup read wants the
  lifetime number. Any answer that decays or resets lifetime counts reopens that decision rather
  than extending it.
- The existing 535 entries are the only evidence of the defect. An answer that discards them
  should say where the measurement is preserved first.

## Recommendation

Not offered. The filing agent has read the measurement but has not weighed (b) against the cost
of losing the current ranking, and (c)'s read-path variant is the filing agent's own addition to
the three the record named rather than something measured. `inference:` the read-path check looks
cheapest for the symptom actually reported, since the symptom is entirely about what Setup
displays; that is reasoning from the record, not from a profile of either path.

---
Answered:
Implemented:
Deferred:
Superseded by:

---
Reconciliation 260810-1205 (reconciler, domain `code`) — **stays `_o_`; awaiting the user. One number in the title has moved.**

`fusion-workbench/.guard-state/churn.json` now holds **588** entries under `files`, against the **535** this record's title names. Read with `python3 -c "import json; print(len(json.load(open('fusion-workbench/.guard-state/churn.json'))['files']))"` at `ed87d87`.

The title is not wrong — it was right when written, and the growth is the measurement this decision exists to settle rather than a defect in the record. It is noted here so the answer is not scoped to a number that will have moved again by the time it is given: whatever is decided about the entries already recorded has to name a rule, not a count.

`shared/issues/260809-2023_o_...` (the measurement) is unchanged and correctly still `_o_` — no code moved this session, by design.

---

## Answer (user, session 260810-0844)

**(a) The key is anchored to the workbench root.** `hooks/lib/workbench-root.ts` already resolves
it and `hooks/lib/project-relative.ts` already does this shape of work for the guard, so the two
subsystems stop disagreeing about what a path is.

**(b) Migrate what can be rewritten.** The workbench-relative and this-checkout keys are rewritten
to the new anchor; the entries naming other roots are dropped. This keeps the lifetime counts that
make the Setup ranking worth reading, which clearing would have destroyed along with the evidence
for the defect. The merge rule for two spellings of one file is left to the implementer and must
be stated in the commit.

**(c) Keep every entry, and exclude absent files from the ranking the reader sees.** The check
moves to the read path, which runs once per Setup rather than once per write, so a deleted file
keeps its churn history while the ranking stops being led by files nobody can open. Cost accepted:
one `stat` per entry per Setup, and a file that still grows without bound. That growth is a
separate question this answer does not settle.

**The count is not part of the answer.** The record's title says 535, the file held 588 at
`ed87d87`, and it will have moved again by the time this is built. The migration must be written
against a rule, not a number.

---
Answered: shared/history/260810-0844-orchestrator-session.md `## Grounding revision` — recorded at the Rebalance gate, session 260810-0844. Not yet realised in code; the defect record it unblocks stays open until a commit implements it.

---
Implemented: 25c5454 — churnKey() anchors on the workbench root, reusing hooks/lib/workbench-root.ts and hooks/lib/project-relative.ts (part a). migrateChurnKeys() rewrites workbench-relative and this-checkout keys and drops entries naming other roots; two spellings of one file are merged by summing the counters, taking the later lastChange, and recomputing thrashingScore from the merged counters rather than combining two derived values (part b). rankThrashing() excludes absent files on the read path, once per Setup, while the map keeps every entry (part c). Measured on the live map: 590 entries in, 414 after re-anchoring, 191 absent excluded from the ranking, all ten top-ranked files existing where three of the top four did not. Part (c)'s accepted cost stands: the file still grows without bound, which this answer did not settle.
