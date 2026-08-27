The false scan-set claim also stands in the portfolio and in the history log, as a warning name

---
`260826-1815_*` locates the playmaker's false statement in the Circle record and states its
scope as "One Circle record". The same run wrote it into `portfolio.md` three times and into
its own history log once, where it is encoded as a warning category name. The portfolio copies
self-heal on the next regeneration; the record and the history log do not.

---
**Filed by:** coderev, Kai Stalmann <ks@qantr.com>

**Severity:** Medium. A scope correction on an open defect, plus one surface nobody is
currently going to correct.

**Cross-references:**
`circles/260826-1613-cardinality-answered-cut-once-nineteen-cleared/issues/260826-1815_*_a-ranking-rationale-asserts-a-resolver-behaviour-that-does-not-exist-and-it-stands-in-the-active-record.md`;
`circles/260826-1613-cardinality-answered-cut-once-nineteen-cleared/reviews/260826-1858-coderev-playmaker-prompt-and-the-two-fabricated-claims.md`
finding B2;
`rules/fusion-workbench-conventions.md` `## Path Resolution` → *Two invariants*

## Where it stands

All four written by the playmaker run of 260826-1705.

`circles/260826-1613-cardinality-answered-cut-once-nineteen-cleared/_t_circle.md:125-126`. The
instance `260826-1815_*` names.

`fusion-workbench/portfolio.md:30-31`, in the `Recommended next` rationale:

> inheritance is currently stranded: closing the parent Circle removed all nineteen records from every agent's scan set, so activation is the act that brings them back into scope.

`fusion-workbench/portfolio.md:43`: "It buys scope over nineteen stranded records".

`fusion-workbench/portfolio.md:138-139` and the identical bullet in
`shared/history/260826-1705-playmaker-direct-dispatch.md`, both under the warning name
`stranded-records-in-terminal-circles`: "open records sit inside five terminal Circles,
outside every agent's scan set".

## Why the warning name is the part that matters

The portfolio is regenerated in full on every playmaker run (`agents/playmaker.md:56`), so its
three copies go at the next dispatch with nobody acting. The history log is append-only and is
inside `$SCAN_HISTORY`, which every agent reads, so its copy is permanent in the same way the
Circle record's is.

And it is not a sentence there, it is a **name**. `stranded-records-in-terminal-circles`
encodes the false mechanism as a warning category, and a category is exactly the token a
later run copies forward from the history it reads. Correcting the prose in the record leaves
the name standing in two files.

## What is actually true

`rules/fusion-workbench-conventions.md` `## Path Resolution` → *Two invariants*, item 2: every
`SCAN_*` carries the Circle in scope and the shared store, and nothing else. Records inside a
non-active Circle were never in another Circle's scan set, so closing removed nothing. This is
not restated further; `260826-1815_*` argues it in full.

## Fix direction

Three parts, none of them the orchestrator's alone.

**The record.** As `260826-1815_*` says: a playmaker dispatch or a user edit, because
`## Activation proposal` is a playmaker-appended section.

**The portfolio.** Nothing to do, provided the next run does not regenerate the same warning.
That is what makes the warning name worth naming here rather than leaving to attrition.

**The history log.** A history entry is a point-in-time record of what a run did, and that run
did emit that warning. The honest repair is an appended correction line rather than a rewrite,
so the log keeps saying what happened and stops asserting the mechanism.

## Scope

Three workbench files. No shipped file. The prompt-side causes are filed separately as
`260826-1901_*` and `260826-1902_*`.
