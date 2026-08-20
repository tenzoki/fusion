A citation of a Circle record produces no token, so the gate cannot see the very form the repair adopted

---

`circles/<dir>/_x_circle.md` — a citation of a Circle's **record** — yields no citation token at all.
`REC_RE` requires one of the ten store segments and `circles` is not among them; `CIRCLE_RE` matches a
Circle directory and stops at a directory followed by a further path segment. The form is therefore
invisible to `scanRecordCitations`, whether it resolves or not.

---

**Why this matters more than it looks.** That form is what steps 7 and 8 of this Circle *adopted* as
the repair for a citation of an archived Circle: cite the record at its archive path rather than the
bare directory. Step 7 used it 13 times, step 8 a further 15. Those 28 repairs are true paths, more
precise than what they replaced — and the gate step 9 is about to arm cannot verify a single one of
them. It will be green over them because it cannot see them, which is a different thing from being
green because they are right.

The Directive of this Circle says the live surfaces carry no dangling citation **and** that a blocking
test holds them there. The first clause holds for these 28. The second does not.

**Measured beyond the repairs:** outside `archive/`, 25 such paths name a Circle directory that no
longer exists there. The sharpest instance is
`shared/decisions/260719-2141_a_concurrency-worktree-slots-vs-single-active-circle.md`, which carries
one dead path three times. Step 7 repaired `:40` and `:48` because the scanner reported them, and left
`:7` — the record's own `**Cross-references:**` field, spelled identically — standing, because no scan
ever named it. One record, one path, two treatments, decided entirely by what the grammar happens to
tokenise.

**Adjacent but not the same as `260819-2300`.** That record says `circleDirs()` never learned the
one-sweep archive prefix, and cites this silence as the reason its workaround is safe. This record says
what the same silence costs on the form the workaround produced. Fixing either alone leaves the other.

**Not fixed here, and the reason is the one this session has been applying all day.** Teaching the
grammar the Circle-record form widens what both callers tokenise, which moves the sibling lint's pinned
counts and changes what step 9's gate must be green over before it can be armed. That is a decision
about scope, taken by the user, not an extension an executor or an orchestrator awards itself.

Filed by the orchestrator of session `260819-2006` from step 8's report, before step 9 is dispatched, so
that arming the gate is a choice made with this known and not one made around it.

---
**Answered by the user 2026-08-19, at the gate this record opened before step 9: fix the grammar
first, then arm.** `REC_RE` learns the Circle-record form, so `circles/<dir>/_x_circle.md` becomes a
token, and the gate is armed only after whatever that makes visible has been repaired.

The user chose this knowing the two costs it carries. It puts a further repair pass in front of the
arming, because the twenty-five dead paths outside the archive become violations the moment the
grammar can see them. And it widens what both callers tokenise, so the sibling lint's pinned counts
move and want a re-approval with the note its own convention requires.

The alternative that was available and not taken was to arm today over what the scanner already reads
and carry the blind spot as a named defect. That would have closed this Circle on the first clause of
its Directive while the second — that a blocking test holds the live surfaces there — did not reach
twenty-eight of the repairs it had just made.
