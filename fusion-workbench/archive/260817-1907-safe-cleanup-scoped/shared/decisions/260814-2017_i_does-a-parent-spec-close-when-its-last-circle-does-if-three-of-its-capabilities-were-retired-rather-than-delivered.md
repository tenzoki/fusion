# Does a parent spec close when its last Circle does, if three of its capabilities were retired rather than delivered?

---
**Domain:** code
**Status:** implemented
**Filed by:** reconciler
**Cross-references:** `260801-1122_*_spec-normative-consolidation.md` (the spec in question, with four reconciliation entries recording the state at each pass); `260801-1244-curator` `## Directive` and its "Four capabilities of the earlier spec are gone" paragraph; `260805-2005-textschicht-gegen-code-nachziehen` (where C9 was performed by hand); `260812-1232_*_remove-the-protected-path-half-of-the-compliance-guard.md` (the removal that deleted C5c's subject)

---

## Question

`260801-1122_*_spec-normative-consolidation.md` spans four Circles. As of
2026-08-14 all four have delivered their work and the fourth, `260801-1244-curator`, is closing.
The spec still carries the open marker `_o_`, and three earlier reconciliation passes each declined
to move it with the same reason: Circles were still outstanding. That reason has now expired.

But "all four Circles are done" is not "this spec is delivered". Three of its capabilities left the
scope rather than landing: **C9** (reconcile, compact, partition and scope the conventions file) was
performed by hand in another Circle and put out of scope by user direction; **C4** (rule-file
retirement by relocation, with tombstone and version-control check) was retired by user decision on
2026-08-14; and **C5c**'s subject, the guard's protected-path half, was deleted outright on
2026-08-12. A pass that renames the file `_c_` asserts a delivery that did not happen. A pass that
leaves it `_o_` asserts outstanding work that nobody intends to do. Both are false, so the marker
cannot be chosen by measurement and the question has to be answered rather than re-derived at the
next reconciliation.

It must be answered now because the spec is the last artifact of this body of work still carrying an
active marker. Once the Circle closes, nothing scans this file on any routine path, and the next
pass that reaches it will meet the same three-way choice with less context than exists today.

## Options

1. **Close it (`_c_`), with a closing note that names the three retirements.** The marker then means
   "this spec is finished as a live document", and the note carries what finished means. Pro: the
   marker matches the fact that no further work is planned against it, and the retirements are
   already recorded in decisions elsewhere. Con: `_c_` reads as delivered to anyone who does not open
   the file, and three capabilities were not.
2. **Defer it (`_d_`).** Pro: honest that the capabilities were dropped rather than met, and `_d_` is
   the vocabulary's own word for work that stopped without being done. Con: `_d_` normally means
   "we may come back to this", and nobody intends to come back to C9 or C4; C5c cannot be come back
   to at all, since its subject is deleted.
3. **Leave it `_o_` and make the spec's `**Status:**` line carry the whole answer** — "Final;
   superseded in part; four Circles closed; C4, C5c and C9 retired, each with its citation". Pro:
   no marker asserts anything false, and the prose is where the nuance already lives. Con: an `_o_`
   planning file is what a taskplanner and a reconciler both treat as live work, so this option pays
   a recurring cost at every future pass — which is exactly the cost the three previous passes paid.

## Constraints

- The planning-file vocabulary is `_o_ / _p_ / _c_ / _d_`. There is no `superseded` marker on this
  side; `_s_` belongs to decisions and to Circles. So option 3 cannot be improved by inventing one.
- Whatever is chosen must not rewrite the spec's capability text. It is the record of the state the
  work was specified against, and all four reconciliation entries so far have preserved it on that
  principle.
- The three retirements are each already recorded elsewhere. The answer cites them; it does not
  restate the reasoning.

## Recommendation

Option 1, with the closing note. The marker's job is to tell a reader whether anything is still
expected from this file, and nothing is. The objection to `_c_` — that it reads as delivered — is
answered by the note being mandatory rather than optional, which is the same device the project uses
for a Circle that closes bounded rather than complete. Option 3 is the status quo and its cost is
measurable: three passes have now spent effort re-deriving the same judgement, and this record exists
because a fourth was about to.

---
Answered: 260816-1500-orchestrator-session.md `## Decisions answered by the user` — option 1: close the spec `_c_` with a mandatory closing note naming the three retirements (C4, C5c, C9). User answered inline 2026-08-16.
Implemented: `260801-1122_*_spec-normative-consolidation.md` — the spec was renamed `_o_` → `_c_`, its `**Status:**` moved to Complete with the authoring text preserved, and the mandatory closing note naming C4, C5c and C9 was written into the file (reconciliation pass 260817-1836, `260817-1836-reconciliation.md`). Option 1 as answered, including the condition that made it option 1.
Deferred:
Superseded by:
