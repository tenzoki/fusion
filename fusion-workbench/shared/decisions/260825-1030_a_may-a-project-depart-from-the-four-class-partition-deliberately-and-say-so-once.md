# May a project depart from the four-class partition deliberately, and say so once?

---
**Domain:** code
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260825-1030_*_does-setup-repair-a-gitignore-that-departs-from-the-four-class-partition.md (the answer that raises this); 260825-1019_*_nothing-checks-that-a-tracked-workbenchs-gitignore-matches-the-four-class-partition.md; rules/workbench-tracking.md `## The four classes`

---

## Question

Setup will repair a `.gitignore` that departs from the four-class partition. A project may
have departed on purpose: the measured project excludes `fusion-workbench/.migration-v2-backup/`,
a class R1 frozen store, with a comment saying it is kept on disk and never tracked. A repair
with no opt-out overrules that, silently and on every Setup run, which is the same
silent-overrule shape the repair exists to prevent, arriving from the other side.

This must be settled before the repair is built: the opt-out's existence decides the
repair's shape, not the other way round.

## Options

1. **No opt-out.** The partition binds every tracked workbench. A project that wants an
   entry out states its case as a fusion change, not as a local exception.
   - Pros: one rule, no per-project state to read, and the repair stays a rewrite.
   - Cons: a project with a real reason fights Setup every run, and the likely outcome is
     that somebody switches the whole check off.
2. **An opt-out recorded in the project's own `fusion.json`.** A declared list of paths
   the repair leaves alone.
   - Pros: the departure is version-controlled and shows in a diff, like every other
     setting in that file; Setup reads the file already.
   - Cons: adds a live configuration leaf, and `orchestrator.maxTurns` is currently the
     loader's only one. A second leaf is a second thing that can go stale against the
     partition it names.
3. **An opt-out recorded in the `.gitignore` itself**, as a marked comment beside the
   departing line.
   - Pros: the statement sits where the departure sits and needs no second file; a person
     editing the line sees it.
   - Cons: Setup would parse `.gitignore` text to find the marker, and the constraint on
     the repair is that it asks `git check-ignore` rather than reading the file. This
     option reintroduces exactly the text read the other decision ruled out.

## A departure has two directions, and they are not one question

Measured 260825 in a scratch repository, because the answered decision's constraint
assumed one mechanism and there are two:

| | A: an R entry is excluded | B: an L entry is tracked |
|---|---|---|
| Detecting question | `git check-ignore -q` | `git ls-files` |
| Repair | remove the line | `git rm --cached`, then add the line |
| Weight of the repair | a text edit | a staged deletion of a committed file, losing nothing on disk |
| Cost of the departure | another checkout malfunctions | diff noise, except on `.checkout-id` |

**`git check-ignore -q` is blind to direction B.** For a tracked path whose pattern
matches it exits non-zero, reporting *not ignored*, because it consults the index; only
`--no-index` reports the match. So the question the answered decision prescribes detects
direction A and cannot see direction B at all.

**And a `.gitignore` line does not untrack.** A tracked file whose pattern matches stays in
the index and keeps reporting as modified. Repairing direction B therefore means staging a
deletion of a file the project committed. That is heavier than appending a line, and the
weight is not data loss: `git rm --cached` leaves the working file on disk and removes only
the index entry, so the checkout keeps everything it had. What is heavy is that Setup would
stage a deletion the user did not ask for, at the start of a session.

Whether the opt-out question is answered once or once per direction is therefore part of
this record, and it was not visible when the record was filed.

## Constraints

- Direction A's question stays `git check-ignore -q`, and an opt-out may be read from
  somewhere else but may not turn it back into a text search. Direction B needs a question
  of its own, and `git ls-files` is the candidate.
- A departure that nothing records is indistinguishable from the defect the repair exists
  to fix. Any opt-out must leave a durable statement, not a one-time answer at a gate.
- The four classes are not equally departable. `.checkout-id` is the one class L entry
  whose classification is load-bearing (`rules/workbench-tracking.md`), and tracking it
  defeats the collision it exists to detect. Whether an opt-out may reach that entry at
  all is part of this question.

## Recommendation

None yet. Option 2 looks closest to how the project already records settings, and option 3
is ruled out by the constraint it violates unless somebody finds a read that is not a text
search.

## Answer

**Option 1, split by direction, with one named exception in direction B.**

**Direction A, an entry that should travel is excluded.** Setup repairs it for class R2 and
class R3, the entries whose absence makes another checkout malfunction: without
`.fusion-setup` every agent in a fresh clone halts at Setup and every hook goes silent, and
without `orchestrator-events.jsonl` the cross-session record does not travel and the union
merge driver the project configured has no file to act on. No project reason can outweigh
that, because a project with such a reason is not collaborating on the workbench at all.

Setup **never** repairs an exclusion of a class R1 store, and this is what dissolves the
question in this record's title. An R1 exclusion is not distinguishable from the project's
choice not to track that part of its workbench, and `rules/workbench-tracking.md`
`## Whether to track the workbench at all` states that the choice is the project's. Nothing
is repaired there, so there is nothing to opt out of: no `fusion.json` leaf, no per-project
state to read, and no second surface that can go stale against the partition it names. The
measured deliberate case, a project excluding `.migration-v2-backup/` with a comment saying
so, needs no declaration and is simply left alone.

**Direction B, an entry that should stay local is tracked.** Setup reports it, with one
exception, and the exception rests on a criterion rather than on the entry's name:

> Direction B is repaired where tracking produces a **wrong answer**, and reported where it
> produces **noise**.

Today that criterion selects `.checkout-id` and nothing else. Two checkouts that share one
identifier are indistinguishable to every reader of a Circle's `Claim:` field, so
`/fusion:next` refuses a Circle on a collision it cannot tell from a real one. That is the
single collision the identifier exists to make visible, which is why
`rules/workbench-tracking.md` already calls this the one class L entry whose classification
is load-bearing. A report is too weak against an answer that is wrong rather than noisy.
Every other class L entry produces diff noise, is regenerated or rewritten anyway, and is
reported.

## Residual

**A project that excludes one R1 store while tracking the others gets no warning.** The
reasoning above treats an R1 exclusion as the project declining to track that part, which is
sound for `archive/` and the two frozen stores and reads oddly for `circles/` or `shared/`:
a project tracking `shared/` and excluding `circles/` is half-collaborating, and nothing
says so. It is left standing rather than patched, because the criterion that would separate
the two cases is the same criterion the whole record failed to find, and a special case
appended here would be the rim `rules/critical-stance.md` §2 names. Whether Setup should
**report** an R1 exclusion, at no mechanism cost and without repairing it, was raised when
this record was answered and deliberately not decided with it.

---
Answered: this record `## Answer` — option 1, with direction A repaired for classes R2 and R3 only and direction B reported except for `.checkout-id`. No opt-out mechanism is built, because nothing repairable is left for a project to opt out of. Stated by the user 2026-08-25 in session `260825-0858-orchestrator-session.md`.
