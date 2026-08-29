# Two skill bodies lost the `[ -x ]` guard rationale to a header that does not carry it

**Status:** closed
**Filed by:** coderev, review `260822-1421-coderev-c0-cut-only-circle.md`
**Severity:** High
**Scope:** `skills/cleanup/SKILL.md`, `skills/help/SKILL.md`
**Commit:** `c2ad89c` (row S1 of `260822-1226-cut-ledger-for-three-bounded-surfaces.md`)

## What happened

Row S1 replaced the "Why the branch, and why it is a call" paragraph in four skill bodies with a
pointer to `bin/fusion-source-root`'s own header. In `skills/setup/SKILL.md` and
`skills/next/SKILL.md` that paragraph was followed by a second one — **"The `[ -x ]` guard is the
one …"** — which survives the cut and still states why the guard is there.

`skills/cleanup/SKILL.md` and `skills/help/SKILL.md` have no such second paragraph. In those two,
the guard's rationale was the removed paragraph's final sentence:

> The `[ -x ]` guard is the one every prompt-called `bin/` helper carries: a helper added between
> releases is absent from an older install and a bare call is exit 127.

That sentence is now stated nowhere.

## Why the cited authoring home does not cover it

`bin/fusion-source-root`'s header authors two of the three claims row S1's own claim column names:
the criterion (lines 39-45, "Why the branch at all") and the four-copies history with its decision
citation (lines 31-37). It does **not** author the third. Its only mention of the guard is at
lines 76-79:

```
# difference is unreachable from the documented call sites: their guard is
# `[ -x "$FUSION_PLUGIN_ROOT/bin/fusion-source-root" ]`, which an unset variable
# already fails, so they never reach this script to see it.
```

That sentence *assumes* the guard in order to make a different point about branch ordering. It never
says a helper added between releases is absent from an older install, and it never says a bare call
is exit 127. Verified by `grep -n '\-x \|127\|guard' bin/fusion-source-root` — no other hit in the
header.

## Why this is High rather than cosmetic

Behaviour is unchanged: the `[ -x ]` guard is still in the shell block of both files
(`skills/cleanup/SKILL.md:18`, `skills/help/SKILL.md:20`). What was removed is the reason, and the
plan's own stopping clause covers exactly this case
(`260822-1154_*_plan-c0-cut-only-circle-buys-head-room-on-four-bounded-surfaces.md`,
`## Where this Circle stops`):

> Every cut that landed carries, in the ledger or in its step report, either a named authoring home
> that now holds the claim or a stated reason the text is not load-bearing. A cut that carries
> neither is not a cut this Circle may make, and its presence stops the Circle even if every byte
> target is met.

This cut carries a named authoring home that does not hold the claim, and no stated reason the text
is not load-bearing. A future editor of either body sees a guard with no recorded reason, and the
class of failure that produced this guard in the first place is issue `260811-0109` — a correction
that reached two of four copies.

## Fix direction

Two options, and the second is the one this project's own convention prefers.

1. Restore the one sentence to `skills/cleanup/SKILL.md` and `skills/help/SKILL.md`. Costs about
   340 bytes against the `skills/` bound, which currently holds 4 370 bytes of head-room.
2. Add the rationale to `bin/fusion-source-root`'s header, under the existing
   "Why this is one helper and not a line in each skill body" block, so that the pointer the four
   bodies now carry actually resolves to all three claims. Costs nothing against any bound — `bin/`
   is unbounded — and makes the four pointers correct rather than three-quarters correct.

Option 2 also removes the asymmetry: `setup` and `next` would no longer need their surviving second
paragraph either, which is a further cut rather than a restoration.

---
Resolved: Fix direction 2. `bin/fusion-source-root`'s header now authors the claim, in a new
paragraph "Why every documented call site guards the call with `[ -x ]`" between the
"Why the branch at all" paragraph and the no-upward-walk one. It states both facts the removed
sentence carried: a helper added to the plugin's work tree between releases is absent from an
older install, and a bare call there is exit 127 at the caller's own first step. It also states
what the absent branch and the unset-variable branch each do. `bin/` is on no bounded surface, so the
paragraph costs nothing. The pointer in `skills/cleanup/SKILL.md` and `skills/help/SKILL.md` now
reads "Why the branch, why it is a call, and why the call is guarded", so it names all three
claims its target holds (+25 bytes each; `skills/` head-room 4 370 -> 4 320). `setup` and `next`
keep their pointer and their second paragraph unchanged: that paragraph is **not** a restatement
of the header. It names each body's own other guarded call site (`setup` Step 3's domain
detection, `next` the orchestrator's Setup) and describes that body's own three-branch shell
block, neither of which a helper header can author. The second-order cut the review suggested was
therefore not taken.

The two line ranges this record cites in `bin/fusion-source-root` are the pre-fix file: lines
39-45 are unmoved, the guard mention formerly at 76-79 is now at 87-89.

---
Revised by: `260822-1506_*_the-declined-second-order-cut-is-declined-on-a-reason-the-same-commit-made-false.md`
— the `Resolved:` note's reason for not taking the second-order cut is false in both halves: the
header does author the three-branch description (`bin/fusion-source-root:48-57`, added by the
same commit), and `next` names no call site inside its own body. The defect this record closed
stays closed; the cut it declined has since been taken in `next` and taken in part in `setup`.
