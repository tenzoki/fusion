The v9 upgrade note's preamble calls all six checks optional, and check 2 describes a silent behaviour change

---

`docs/upgrading-to-v9.md:35-36` opens its checklist:

> Six checks. Each is optional — nothing here is load-bearing, and skipping all six leaves a working
> installation with some dead files in it.

`docs/upgrading-to-v9.md:54-59`, check 2, says the opposite about itself:

> **An unrecognised value is not an error: it falls back to `code`, silently**, in `taskplanner`,
> `reconciler` and `playmaker` alike. So an anticipated Circle record, a backlog entry or a dispatch
> prefix still carrying one of the two retired values will run, and will run as a `code` domain
> without saying so.

---

A domain that silently becomes `code` is not a dead file, and skipping the check does not leave a
working installation in the sense the preamble promises: it leaves three agents reading a domain the
project did not choose. Check 3 is a weaker instance of the same — `tasklist.md` is dead, but the note
adds *"If it holds open work you never transferred into issue or decision records, transfer it first —
nothing else in the workbench carries it"*, which is not optional either if the work matters. Check 1
carries the same shape for an unread Plane outbox.

**Why it matters beyond the doc.** The preamble is the sentence a reader takes the whole page's
disposition from, and it is what a later summary reasons from. It already has: `6781814` capped the
`/fusion:help` upgrade section and stated that of the three removed paragraphs *"exactly one held an
action that fails silently when skipped"*, which is what the preamble says and not what check 2 says.
That is filed as
`shared/issues/260822-1506_*_the-help-caps-standing-line-names-one-silent-action-and-the-v9-note-holds-a-second.md`.

**Out of the reviewed range, and named honestly.** `docs/upgrading-to-v9.md` was not touched by
`c2ad89c..6781814`; it was read as the destination of a paragraph that range removed. No gate covers
this: the file is prose, and nothing holds a preamble in agreement with the section under it.

---

**Found by:** coderev, reviewing `c2ad89c..6781814`, review file
`shared/reviews/260822-1506-coderev-the-guard-rationale-repair-and-the-capped-help-topic.md`.
**Owner:** `coder`.
**Severity:** Low.
**Affects:** `docs/upgrading-to-v9.md:35-36`.
**Filed in the shared store:** no Circle is active, and this arose beside the range rather than from it.

**The fix.** Split the preamble's claim rather than softening it: say that four of the six checks
remove dead files and that two change behaviour that is otherwise silent — check 2, the domain
fallback, and check 3 where the retired queue still holds untransferred work. `docs/` is on no bounded
surface, so the correction costs nothing.
