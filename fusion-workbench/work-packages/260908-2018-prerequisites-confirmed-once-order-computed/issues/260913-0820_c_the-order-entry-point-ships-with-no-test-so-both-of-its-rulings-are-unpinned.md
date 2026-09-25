# The order entry point ships with no test, so the report-only ruling and the mandatory `note=` line are both unpinned

---

`hooks/order.ts` and `bin/fusion-work-order` are the only files this range added that no test
opens. The two properties a user ruled on, that no exit code carries the verdict and that a
`note=` line is mandatory, hold today and nothing holds them tomorrow. The direct sibling
`plan-size.test.ts` pins exactly those two properties for its own entry point.

---

**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>

**Related:**
`260908-2018-prerequisites-confirmed-once-order-computed.md` (the item that built the helper);
`260908-2018_*_does-the-record-template-mandate-the-prerequisite-field-or-merely-permit-it.md` (the ruling whose condition the `note=` line is);
`260909-1808_*_may-a-helper-compute-an-order-over-work-items-after-the-portfolio-layer-goes.md` (the report-only ruling)

**Measurement anchor.** Read in this work tree at commit `c2a12973` on 2026-09-13, with
`npm test` in `hooks/` green at 55 files and 926 tests.

## The defect

`grep -rln 'work-order\|order\.js' hooks/lib/__tests__/` returns one file,
`reference-resolution-lint.test.ts`, which counts the token as a citation and never runs the
program. `hooks/lib/__tests__/work-graph.test.ts` imports `computeWorkGraph` directly and never
reaches the entry point. So nothing exercises:

- **The rendering.** The five fixed columns of `renderItemRow` (`hooks/order.ts:77`), the
  `KEY=value` block, the `cycle=` rows and the `unresolved=` rows.
- **`roots=`** (`hooks/order.ts:135`). It is computed nowhere else, and the header's claim at
  `hooks/order.ts:33` that it equals `ready=` in an acyclic store and parts from it only at a
  cycle at depth 0 is unchecked by anything.
- **Ruling 4, report and never gate.** `hooks/order.ts:146` returns 0 on a cyclic store. No test
  asserts that a cycle is exit 0.
- **Ruling 5, the mandatory `note=`.** `hooks/order.ts:139` emits it when
  `noDependsOnField > 0`. It is the condition a user attached to ratifying the field as optional,
  and a future edit that drops the branch, or inverts the comparison, reddens nothing.
- **Exit 1 on an argument, exit 2 with no workbench above the working directory.**

The precedent is explicit and adjacent. `hooks/lib/__tests__/plan-size.test.ts:5` opens with the
same ruling ("REPORTS. The ceiling is carried in no exit code and no gate runs the program") and
its first case is "exits 0 over a plan above the ceiling, and prints the verdict". Of the five
stdout-verdict helpers, `fusion-work-order` is the only one whose entry point no test runs.

The gap is a consequence of how the work was sequenced rather than an oversight in the plan: step
C3 spent the whole 144-line test budget on the computation, and the plan named no test for step
C2 at all.

## Acceptance test

A new test running `hooks/dist/order.js` against scratch workbench roots, in the shape
`plan-size.test.ts` uses, asserting at least:

1. A store carrying a cycle exits 0 and prints `verdict=cyclic`.
2. A store with at least one item carrying no `**Depends-on:**` field prints exactly one line
   opening `note=`, and that line names the count. A store where every item carries the field
   prints no `note=` line.
3. `verdict=empty` on a workbench with no `circles/`, at exit 0.
4. An argument is exit 1; a working directory with no workbench above it is exit 2.
5. `roots=` and `ready=` are equal on an acyclic fixture and differ on one carrying a cycle at
   depth 0, which is the header's own claim.

## Scope

New `hooks/lib/__tests__/fusion-work-order.test.ts`. The hook-test surface is bounded and stood
at zero margin when the fixture test landed, so this needs its own room; that is a cut, never a
baseline edit.

---
Resolved: the commit that carries this line adds `hooks/lib/__tests__/fusion-work-order.test.ts`, five cases running `bin/fusion-work-order` against scratch workbench roots in `plan-size.test.ts`'s shape: a cyclic store is exit 0 with `verdict=cyclic`; a store whose root item carries no `**Depends-on:**` prints exactly one `note=` line naming the count and a store where every item carries the field and every entry resolves prints none; a workbench with no `circles/` is `verdict=empty` at exit 0; an argument is exit 1 and a working directory with no workbench above it is exit 2; `roots=` equals `ready=` on the acyclic fixture and reads `2` against `0` on the cycle at depth 0. The fixture builder is local, since `work-graph.test.ts` exports none. The file is 55 lines, the step's ceiling, funded by the package's earlier cut and by no baseline edit.
