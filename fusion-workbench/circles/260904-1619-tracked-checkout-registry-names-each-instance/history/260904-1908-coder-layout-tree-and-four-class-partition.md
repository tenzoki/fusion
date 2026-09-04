# Coder: the checkout store joins the layout tree and the four-class partition, and each still tiles

**Date:** 2026-09-04 19:08
**Status:** Complete
**Trigger:** Dispatch — step 3 of `260904-1651_o_the-checkout-registry-names-each-instance-and-joins-one-persons-identities.md`
**Filed by:** coder, Kai Stalmann <ks@qantr.com>, checkout 5e8248d7

## Task

Step 3 only: give `shared/checkouts/` a line in the layout tree and a reason in the paragraph on what `shared/` holds, and state in the tracking rule which class it falls in. Neither file defines the entry grammar; both cite the helper header, which was read first (`bin/fusion-checkout-name`, `## The store, and the entry grammar`).

## What changed

- `rules/fusion-workbench-conventions.md` `## fusion-workbench Layout`: `checkouts/` is the last entry of the `shared/` block, with the comment that `bin/fusion-checkout-name` writes it and nothing else. `backlog/` moves from `└──` to `├──`.
- The same file, the `shared/`-only paragraph: `checkouts/` joins the enumeration with its own reason — a checkout entry names an instance of the project rather than anything done in one — and the closing sentence points at the helper header for the grammar and says this document does not restate it. The heading's count and the sentence's back-reference both lose their numeral (`plus four of its own` → `plus stores of its own`, `None of the four` → `None of them`) rather than moving from four to five: the members are named beside it, and a number beside its list is the copy that drifts (`rules/critical-stance.md` §5).
- `rules/workbench-tracking.md`, between the class table and the class-L reasoning: one paragraph saying the store needs no exception. It sits inside `shared/`, which the R1 row already carries with every store inside it, and it is R1 for the reason the shared decision store is — one writer per file by construction, since `register` writes the file named after this checkout's own identifier and no other. The R1 row's entry list is unchanged, as the step specified.

## Tiling, checked against the tree as left

`shared/checkouts/` falls in R1 and in no other class, through the R1 row's `shared/` with every store inside it. No entry of the tree falls in none: the tree gained exactly one entry, inside a subtree the partition already covered wholesale.

## Byte cost, and a figure from the plan that does not reproduce

- `rules/fusion-workbench-conventions.md` 51 456 → 51 897 (+441). This is the only edited file on the always-on surface.
- `rules/workbench-tracking.md` 17 121 → 17 538 (+417); emitted to no agent, so it is charged to no dispatch.
- Step total +858, under the 1 200 the plan budgeted.
- Always-on core after the step: 66 234 bytes against a floor of 65 498 and a budget of 77 498, so **11 264 bytes of head-room remain** (11 705 before). No baseline was touched.

The plan's step 3 states 19 115 bytes free before this step. That figure does not reproduce against the instrument: the core is `agent-setup.md` + `fusion-workbench-conventions.md` + `critical-stance.md`, whose `RULE_BASELINE` entries sum to 65 498, and the set measured 65 793 before this edit, leaving 11 705 of the 12 000. The step's own budget was the binding number either way and is met with room in both readings.

## Two gates left red, and why they were not touched

Both are mechanical re-approvals caused by this diff, and both live under `hooks/`, which the dispatch put out of scope.

- `reference-resolution-lint.test.ts`: `paths` reads 1 566 against a pin of 1 563. The three new tokens are the three new mentions of `bin/fusion-checkout-name` — one in the tree comment, one in each edited prose paragraph — counted exactly by `git diff -U0 -- rules/ | grep '^+' | grep -o 'bin/fusion-checkout-name' | wc -l`. Every one of them resolves; only the pin has moved.
- `fixtures/rules-emission.golden`: `fusion-workbench-conventions.md` reads 51 897 against 51 456. The remedy is one command, `cd hooks && UPDATE_RULES_GOLDEN=1 npx vitest run lib/__tests__/rules-emission-golden.test.ts`, and a read of the diff.

## Verification

`cd hooks && npm test` — exit 1. 45 of 48 files pass, 811 of 814 tests. Three failures: the two re-approvals above, and `citation-sweep.test.ts`, which was red at this session's start commit and is filed as `260904-1839_*_citation-sweep-test-is-red-at-head-and-was-already-red-before-this-session-started.md`. It fails on this repository's committed workbench, which this step did not touch.
