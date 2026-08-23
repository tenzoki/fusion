# How does the tracked event log behave when two checkouts have both appended to it?

---
**Domain:** code
**Filed by:** shaper
**Cross-references:**
`shared/planning/260822-1136_*_spec-fusion-becomes-a-multi-user-tool.md` (the spec that raised it, class R2 of its state partition and acceptance criterion 6 of C2);
`rules/workbench-tracking.md` (which classifies the log as a record and says why it is tracked);
`shared/decisions/260811-1534_*_does-the-guard-event-log-get-an-upper-bound-and-what-happens-to-the-evidence-in-it.md` (the sibling log, whose ceiling question was answered by the archive roll)

---

## Question

`fusion-workbench/orchestrator-events.jsonl` is the only file in the whole workbench that two checkouts both write and git must merge. It is tracked, it is append-only, and the user's answer at the round-2 gate made it the sole carrier of everything that travels between people: presence, and the record of which sessions ran.

Git merges it line by line and has no idea that the file is a log. Two people who each ran a session since the last common ancestor have each appended to the same last line region, so the merge is a textual conflict on nearly every exchange, not on an unlucky one. Somebody then resolves a conflict in a machine-written log by hand, which is where lines get lost.

The question has to be answered before the multi-user Circle that settles the transport can close, because every later capability writes to this file.

## Options

1. **A union merge driver, declared in `.gitattributes`.** `fusion-workbench/orchestrator-events.jsonl merge=union` makes git take both sides of every conflicting hunk. The driver is built into git and needs no per-clone configuration.
   - Pros: no conflict ever reaches a person; no line is lost; the mechanism is one line of configuration and nothing to maintain. Ordering is recoverable because every line carries `ts`.
   - Cons: the resulting order is neither chronological nor stable, so any consumer that reads the file positionally is wrong. A genuine conflict, if one were ever meaningful here, is silently accepted. A duplicated line survives duplication.
2. **One log file per checkout, and readers glob.** `orchestrator-events-<checkout>.jsonl`, each written by one tree and merged by git as a new file rather than a changed one.
   - Pros: no merge conflict is even possible; each file keeps one writer, which is the property that makes class R1 of the partition safe.
   - Cons: it contradicts the user's answer that the existing log alone is what travels, and it changes every consumer: `bin/monitor`, the Phase-4 sequence-diagram generator, the Turn-count derivation, `hooks/lib/staging-drift.ts`. It also multiplies files without bound as checkouts come and go.
3. **Leave it conflicting, and say so.** No mechanism. The person who pulls resolves the conflict, and the documentation tells them that keeping both sides is always the right resolution.
   - Pros: nothing is built, and a person sees exactly what happened.
   - Cons: a hand resolution of a machine-written log on every exchange is where lines get lost, and the log's whole value is that nothing has ever been removed from it.

## Constraints

- No line may be lost. The log is classified as evidence rather than telemetry, and it has no ceiling for the same reason.
- The answer may not require the currently ignored files to be tracked, which the user foreclosed as final.
- Whatever is chosen has to work in a clone that ran `/fusion:setup` and nothing else, with no per-machine git configuration step.

## Recommendation

Option 1, with the reading order made explicit at every consumer. The union driver is a built-in mechanism rather than a new one, it satisfies the no-line-lost constraint outright, and its one real cost, unordered output, is paid by consumers that already have a timestamp on every line. Option 2 is the technically cleanest and is refused here because it contradicts an answer the user gave as final. Option 3 is honest and puts the cost on the person at the moment they are least able to pay it.

---
Answered:
---
Answered: circles/260823-0023-settle-what-travels-between-checkouts/_*_circle.md `## Grounding snapshot`
— user decision at the shaping gate of `/fusion:direct`, 260823: **the union merge driver**, one line in
`.gitattributes`, which `/fusion:setup` creates or extends so a consuming project gets it too.

The choice rests on measurement rather than on reasoning. The driver was exercised end to end in
`circles/260822-1921-measure-what-two-checkouts-share/analyses/260822-2219-what-two-checkouts-of-one-project-actually-share.md`
section 7: the merge resolves cleanly and no line is lost from either side.

**The cost was stated at the gate and accepted:** the merged log is no longer chronological, so every
reader sorts by the `ts` field. `bin/monitor` already does (`bin/monitor:1165`, stable sort, a missing
stamp treated as oldest). Two readers do not, and C2 takes one of them — the Phase-4 sequence-diagram
generator — while the Turn count stays with C4, where its own defect already lives.

The two rejected options are recorded so a later reader sees what was weighed: one log per checkout
read by glob, which contradicts the answer that only the existing log travels and changes four
consumers; and leaving the conflict to be resolved by hand, which is where lines actually get lost.
Implemented:
Deferred:
Superseded by:

---
**Reconciliation 260822-1556 (reconciler, domain `code`, HEAD `9f65463`) — marker unchanged at
`_o_`. No answer exists on disk.**

Searched `shared/analyses/` (nineteen reports), `shared/planning/` (six specs and plans) and every
record in `shared/decisions/` for a merge-driver, union-append or two-writer answer: nothing states
one. `.gitattributes` does not exist at the repository root, so no merge driver is configured, and
`orchestrator-events.jsonl` is still an ordinary tracked text file that git will conflict on.
Correctly open; it blocks the close of C2 and C2 has not started.

---
**Reconciliation 260822-2236 (reconciler, domain `code`, range `f90de0c..b938f68`), marker unchanged
at `_o_`. Still no answer on disk, and option 1 now has the measurement it lacked.**

`.gitattributes` still does not exist at the repository root, re-checked at HEAD `b938f68`, so nothing
here is decided or configured. The marker is right.

What changed is the evidence base. The C1 isolation pass measured option 1 end to end, in
`circles/260822-1921-measure-what-two-checkouts-share/analyses/260822-2219-what-two-checkouts-of-one-project-actually-share.md`
`## Findings` section 7. Two checkouts each appended one line and pushed: without a driver, `KONFLIKT
(Inhalt)` and `UU` with conflict markers inside a machine-written log, which is what this record
predicts. With one line in a root `.gitattributes` reading
`fusion-workbench/orchestrator-events.jsonl merge=union`, the merge went clean, both lines survived, and
the output was **not** in timestamp order: a line stamped `11:01` preceded one stamped `11:00`. So both
halves of option 1 are confirmed, the benefit and the ordering cost, rather than one of them.

It also satisfies this record's third constraint, which the report does not say and a reader should not
have to derive: `union` is one of git's built-in drivers, so it needs no `.git/config` entry, and
`.gitattributes` is a tracked file that arrives with the clone. Nothing per machine.

**This note answers nothing.** The choice between the three options is the user's and belongs at C2's
planning gate, exactly as `shared/planning/260822-1136_*_spec-fusion-becomes-a-multi-user-tool.md`
`## User decisions pending` states. The report's own recommendation 2 says the measurement was
deliberately not appended to this record by the analyst pass; it is appended here as reconciliation
evidence so that whoever answers finds it from the record rather than by knowing the report exists.
