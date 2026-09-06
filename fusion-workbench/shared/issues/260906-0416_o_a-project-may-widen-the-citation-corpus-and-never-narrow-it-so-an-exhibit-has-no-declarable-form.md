A project may widen the citation corpus and never narrow it, so an exhibit has no declarable form

---
A record whose subject is a path must quote that path. The checker judges such a token on its
shape, the sweep refuses to rewrite it, and a consuming project has no way to say so: the only
narrowing mechanism is a literal inside fusion's own source, and the one configuration leaf a
project owns adds files to the corpus and never removes them.

---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Reported by:** the consuming project `unite-co-creator`, 2026-09-06, against fusion 10.23.0

## The asymmetry

`citations.extraPaths` lets a project declare non-Markdown files as citation-bearing, so the
corpus grows. Nothing shrinks it. The Markdown half is fixed — every `.md` under the workbench
— and `RECORD_EXAMPLE_FILES`, the mechanism that exempts a whole file, is a literal in
`hooks/lib/citation-scan.ts`. A project cannot add to it, and a release that did would be
taking a position on that project's records.

So for a token the tool has itself decided nobody may rewrite, a project has no third move.
It cannot repair it, cannot exempt it, cannot remove its file from the corpus.

## Why the exhibits are legitimate

The reporting project has 11 of 13 standing violations inside fenced blocks where the store
segment is the subject rather than a pointer: a reproduced failure message from this very
checker including the path it printed; a shell transcript, which is a claim about what was
executed and is not that claim without the path; a survey listing five plan files at the paths
they were found at, where being found there is the finding; a two-line exhibit contrasting the
canonical form against what is on disk, where the on-disk path is the whole comparison. A
storeless rewrite falsifies each one.

## Measured here, and it is not a consumer-side phenomenon

At `8ce527ba` this repository reports `store-prefixed=395`, and **every one of the 395 is
unrewritable** — 42 under `archive/`, 353 in the live tree, 240 of those in two Circles'
records and planning files. Its verdict reads `clean` for one reason only: none of the 395
sits in a **live record**, which is what the verdict scope covers (`isLiveRecord`). The
reporting project's thirteen differ in that respect and in no other.

That is worth stating plainly. fusion is not clean of this class; it is clean of it *where the
verdict looks*.

## Two things the report got wrong, checked rather than assumed

`bin/fusion-citation-check` exits 0 on a violation, deliberately, and its header says so. The
red build leg is the reporting project's own wiring, so an unblock is available to them today
without waiting for fusion. And the verdict already narrows by editedness: a violation in a
record that has been closed leaves the verdict scope. Neither of these makes the asymmetry
above acceptable; both mean it is not the emergency the report frames it as.

## Not the same question as the fence

Whether a fenced shape-decided token should be exempt is a separate and larger question, and
it was measured and rejected on 2026-09-05 — un-silencing the fence reaches the sweep, which
shares the grammar, and proposed 370 rewrites across 64 files, mostly archived exhibits whose
content is a wrong spelling somebody filed on purpose. It is filed as
`260906-0416_*_should-a-project-be-able-to-declare-a-record-an-exhibit-and-what-does-that-declaration-cover.md`
because reversing a measured rejection is a ruling. This record is the narrower one: whatever
that ruling says, a project having no declarable form for an exhibit is a gap of its own.

## Acceptance

A project can express, in its own configuration and without a fusion release, that a named
record is an exhibit — and the checker then treats it as one, with the scope of that
declaration written down. Or the project's inability to do so is stated as deliberate, in the
checker's header where a reader meets the corpus rule, together with what such a project is
expected to do instead.

Interim, and already shipped at `260906-0428`: the output now carries
`unrewritable-violations=` and a per-row `unrewritable`/`rewritable` column, so a project can
gate on the half a human can actually act on. That is a mitigation and not this record's
acceptance — it makes the class visible, and does not make it declarable.
