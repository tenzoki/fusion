Step 0i detects MULTIPLE-ACTIVE only when the pointer is absent, and the likelier shape under two checkouts is the one it cannot see

---

**Severity:** Medium
**Domain:** code
**Filed by:** coderev, reviewing C2 Turn 2
**Affects:** `skills/setup/SKILL.md:354`, `skills/setup/SKILL.md:360`
**Cross-references:** `260823-1110_*_step-0i-collapses-multiple-active-to-head-1-and-names-one-circle-arbitrarily.md`, the Turn 1 finding this narrowing closed; `agents/playmaker.md:94`, which defines the condition; `rules/workbench-tracking.md` `## The four classes`, which is why the shape below arises

---

## What is wrong

Step 0i's probe short-circuits on the pointer:

```bash
[ -f ./fusion-workbench/.active-circle ] || find ./fusion-workbench/circles -mindepth 2 -maxdepth 2 -name '_t_circle.md' 2>/dev/null
```

`find` runs only when `.active-circle` is absent. With a pointer present the step prints nothing and reports nothing, whatever the tree holds.

`skills/setup/SKILL.md:360` nonetheless names its third branch as "`MULTIPLE-ACTIVE`, the condition `agents/playmaker.md` names beside `MISSING-POINTER`". That definition carries no pointer condition: `agents/playmaker.md:94` reads "More than one Circle record carries marker `_t_` → `MULTIPLE-ACTIVE`". So the branch names a whole condition and detects a proper subset of it.

**The uncovered half is the likelier one under the arrangement this Circle builds.** A `_t_` Circle record travels between checkouts and `.active-circle` is class L and does not, which is the premise Step 0i's own opening paragraph states. So a checkout that activated a Circle of its own holds a pointer, and pulling a colleague's work brings in that colleague's `_t_` record. The result is two active records with a pointer present, which is exactly the state the probe cannot reach. The state it does reach, two active records and no pointer at all, needs the local session never to have activated anything.

## What still holds, and is not the finding

The narrowing itself is sound. Turn 1 asked whether to decline or to offer a choice among several, and declining was taken on the ground that choosing among several active Circles is a portfolio judgement while `/fusion:next` owns activation. That ground distinguishes the one-record case correctly: a yes or no about the single Circle the project says is active is not a choice among Circles, so Setup keeping the one-path offer and refusing the many-path offer is coherent rather than inconsistent. The commit message argues it more weakly, as "the activation choice belongs to the skill that owns it", which on its own would forbid the one-path offer too. The shipped step gives the better reason.

The practical exposure is bounded: `/fusion:next` dispatches playmaker, which detects the condition without a pointer precondition and renders it as a warning. A user who runs the portfolio briefing sees it. A user who only runs Setup does not.

## Verified

Read at HEAD `b8a4c1a`. The probe is a single line and the short-circuit is unambiguous. `agents/playmaker.md:94` and `:153` were read for the definition; neither mentions `.active-circle`. `agents/playmaker.md:95` states the pointer condition for `MISSING-POINTER` alone.

## Direction, not a prescription

Two honest repairs, and the choice between them is a scope question rather than a technical one.

Widen the probe so the count is taken unconditionally and the pointer only gates the offer. That makes the branch match the name it uses, and costs bytes on a surface with 372 free.

Or narrow the words. Keep the probe and stop calling the branch `MULTIPLE-ACTIVE` outright: say that this step reports several active records **when this checkout has no pointer**, and that the general condition is `/fusion:next`'s to report. That costs nothing and leaves a reader with a true statement.
---

Resolved: 2026-08-23 by coder. The first of the two repairs this record offers was taken: the probe
was widened so the count is unconditional and the pointer gates the offer rather than the detection.
Step 0i's branch now matches the name it uses.

```bash
[ -f ./fusion-workbench/.active-circle ] && echo pointer-present
find ./fusion-workbench/circles -mindepth 2 -maxdepth 2 -name '_t_circle.md' 2>/dev/null
```

The pointer test is written first so `find` is the last command and the block exits 0 in all four
cases; ordered the other way it exits 1 whenever no pointer is present, which is one of the two
conditions this step exists to report. The branch table gained the pointer as a second reading:
nothing printed or one path with `pointer-present` reports nothing, one path without it is
`MISSING-POINTER` and keeps the offer unchanged, and more than one path is `MULTIPLE-ACTIVE`
whatever the pointer says. That last clause is the fix. `agents/playmaker.md:94` defines the condition
with no pointer precondition, and the step now detects the whole of it.

**Verified in a scratch tree, all four cases.** Two records with a pointer present, the shape this
record calls the likelier one under two checkouts and the one the shipped probe could not see, prints
`pointer-present` and both paths. Two records with no pointer prints both paths. One record with no
pointer prints one path. Nothing at all prints nothing. Exit 0 throughout. Run against the live
workbench the probe prints `pointer-present` and this Circle's own record, which is the report-nothing
branch and is correct.

**Measured, and the honest fix fitted.** `skills/setup/SKILL.md` 49 075 -> 49 245, +170 bytes. The
`skills/` surface stands at 240 237 of a 240 439 budget, 202 free, down from 372. No baseline was
moved and the narrowed-words alternative was not needed.
`hooks/lib/__tests__/fixtures/surface-growth.golden` was regenerated for that entry and for
`workbench-citation-lint.test.ts`.

**Files:** `skills/setup/SKILL.md`, `hooks/lib/__tests__/fixtures/surface-growth.golden`. Uncommitted
at the time of writing; the orchestrator commits.
