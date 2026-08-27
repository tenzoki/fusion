The cut ledger states a HEAD anchor two commits behind where it ran, and the misdating produced a false defect record

---

`shared/analyses/260822-1226-cut-ledger-for-three-bounded-surfaces.md:54` opens its `## Scope` with
"Measured at HEAD `370bfc5`". The analyst ran after `4a58be1` and `faac921`, so the tree it read was
`faac921`. One of the three defects it filed states a record's marker as it stood after `4a58be1`
and attributes that state to `370bfc5`, which inverts what the commit did.

---

**The anchor.** `370bfc5` is this session's start commit and is what `agentstate.yaml`
`session.git_head_at_start` names. Step 8 of the plan ran first as task `P-8` and landed `4a58be1`;
`faac921` followed with the spec and the plan; the ledger landed as `aa44a8b`. So the ledger's own
commit is three past the anchor it quotes.

**What it cost.** `shared/issues/260822-1228_*_plan-step-8-asks-for-a-closure-that-was-already-made-and-the-record-already-carries-the-note.md`
opens "**Verified at HEAD `370bfc5`.** The file is `…260821-2204_c_…` — marker `_c_`, not the `_o_` a
step-8 closure would move." At `370bfc5` that record stands in the open state, which
`git ls-tree --name-only 370bfc5` prints as:

```
fusion-workbench/circles/260821-1042-reply-bounded-whole-question-answered/issues/260821-2204_o_a-growth-bound-lost-half-its-head-room-against-a-stated-stopping-criterion-and-the-finding-lives-only-in-a-history-log.md
```

The record as it stands is
`circles/260821-1042-reply-bounded-whole-question-answered/issues/260821-2204_*_a-growth-bound-lost-half-its-head-room-against-a-stated-stopping-criterion-and-the-finding-lives-only-in-a-history-log.md`,
and `4a58be1` is the commit that renamed it and appended the
`Resolved:` note. The defect reports the step's own effect as a pre-existing state and concludes the
step was redundant. It was not: it is the only reason the record is closed.

**What it did not cost.** `4a58be1` and `faac921` touch workbench records alone. Every shipped surface
is byte-identical and line-identical at `370bfc5` and at `faac921` (`agents/*.md` 416 205,
`skills/*/SKILL.md` 240 409, hook tests 20 363), so no measurement in the ledger is wrong. The
anchor is a citation, and it is the citation that failed.

**The class.** An agent dispatched inside a Turn loop reads the session anchor out of the dispatch or
out of `agentstate.yaml` and writes it as the HEAD it measured, without asking git what HEAD it is
actually standing on. That is cheap to get right — `git rev-parse --short HEAD` — and it is the
difference between a report a later reader can replay and one they cannot.

**Fix direction.** Correct the `## Scope` line to name `faac921` and say what stood between it and
`370bfc5`. `shared/issues/260822-1228_*_…` has been closed with the correction in its `Resolved:`
note rather than rewritten, since its body records what was concluded at the time.

**Affects:** `shared/analyses/260822-1226-cut-ledger-for-three-bounded-surfaces.md:54`;
`shared/issues/260822-1228_*_plan-step-8-asks-for-a-closure-that-was-already-made-and-the-record-already-carries-the-note.md`.

**Severity:** Medium. No measurement moved, but one defect was filed against a plan step on a false
premise and a closure gate would have read it.

**Found by:** reconciler, session-end pass over `370bfc5..9f65463`, HEAD `9f65463`.

---
Resolved: fixed — the ledger carries the appended correction naming `faac921` and what stood between it and `370bfc5`; shared/analyses/260822-1226-cut-ledger-for-three-bounded-surfaces.md:440
