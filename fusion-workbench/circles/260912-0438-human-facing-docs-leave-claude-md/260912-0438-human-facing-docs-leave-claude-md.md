# Human-directed documentation leaves `CLAUDE.md`, which keeps only what a session needs

---
**Status:** done
**Claim:** 5e8248d7 — Kai Stalmann <ks@qantr.com>, 260916-1129
**Active spec/plan:** 260916-1058_*_spec-human-facing-docs-leave-claude-md.md (spec), 260916-1126_*_implementation-human-facing-docs-leave-claude-md.md (plan drawn from it)
**Filed by:** user, Kai Stalmann <ks@qantr.com>
---

## Directive

A project's `CLAUDE.md` should carry only what Claude genuinely needs under fusion in every
session. Everything else belongs behind links, and mostly in the workbench. These files have been
swelling again, and the cost is paid on every dispatch: in fusion's own repository a third of the
file is a helper roster, more than half of whose rows say the real documentation is in the file's
own header. The aim is to keep documentation written for human readers out of `CLAUDE.md`, in
fusion's own repository and in the convention it ships to other projects. Whether the helper roster
moves, shrinks or goes is
`260911-2237_*_where-does-the-bin-helper-roster-belong-when-a-third-of-claude-md-is-pointers-charged-eleven-times.md`;
this item is the wider principle behind it.

---

## Closure, 260916

The work landed. `CLAUDE.md` went from 62 505 bytes over 130 lines to 8 114 over 66: 22 passages
relocated into `README-agents.md` and `README-hooks.md`, 27 pointer lines left behind, nothing
deleted. All eleven dispatch paths fell by exactly 54 391 bytes, the tightest now 110 237 against
189 012. Session range `99fbaa8a..7ea6e40b`, nine commits.

The plan closed with all eight steps done, and its seven stop clauses were put to the user at this
closure. All seven hold, and four of them held by firing rather than by being irrelevant: the
blast-radius pause was shown and accepted, the head-room stop was reached twice and each time the
shortfall was measured and ruled rather than taken, and the curator was dispatched only after the
installed copy was checked for the prompt change.

**The review is the one pass this work gets**, and it opened all nine commits with nothing carried
and nothing left unopened:
`260916-2213-reviewer-closing-pass-over-the-claude-md-relocation-and-the-gates-that-followed-it.md`.
It verified the relocation independently of both executors' reports — 22 of 22 After texts present
exactly once at the section their entry names, none present twice, 22 Before texts gone, 27 pointer
lines on disk — re-derived the head-room raise to the line with no baseline moved, and found no gate
asserting less than before, with three asserting more.

It filed **eight defects, one high and none critical**, which stay open in this item's store for
follow-on work. Six are one shape and worth naming as such: a sentence that was true where it was
written and is false or circular where it now sits. Byte-for-byte relocation moves a passage's deixis
with it, and no gate can see that, because a pronoun is not a token anything resolves. The sharpest
has one bullet claiming a zero-margin bound reaches its file two lines below another saying nothing
bounds that file at all.

**A coverage gap, named rather than tidied away:** `10978bff` landed from a second session while the
review was running and no review has opened it. Coverage is advisory and does not hold a closure, so
this item closes over it.

Eleven further defects were closed inside this item during the session, two of which the session
found itself. One was filed to the shared store instead, a test that fails under suite load and
passes in isolation, because it did not arise from this directive.
