# Five shipped `bin/` helpers have no `CLAUDE.md` Layout row, and the table says nothing about being a selection

---

**Severity:** Low — a developer's first-read index omits a third of the directory it indexes, silently
**Domain:** code
**Filed by:** coder (working `260811-2151_*_bin-fusion-turn-budget-ships-with-no-claude-md-layout-row-while-its-sibling-added-in-the-same-turn-got-one.md`, Turn 4 finding 3)
**Affects:** `CLAUDE.md:27-38` (the Layout table's `bin/` rows)
**Cross-references:**
`260811-2151_*_bin-fusion-turn-budget-ships-with-no-claude-md-layout-row-while-its-sibling-added-in-the-same-turn-got-one.md` (the row that has now been written; this record is the residue that finding asked to be reported);
`260810-0410_*_the-layout-tree-calls-itself-exhaustive-and-omits-the-two-plane-runtime-files.md` (the neighbouring table, the same undecided question)

---

## What is wrong

`bin/` holds 15 shipped executables. After the `bin/fusion-turn-budget` row landed, 10 have a Layout row in `CLAUDE.md`. Five do not:

- `bin/fusion-commit-lock` — POSIX mutex around `git add` / `git commit`, against the cross-agent staging race. Named as a requirement in `agents/coder.md` and every other executor prompt, and reachable from nowhere in the table.
- `bin/fusion-count-sources` — counts source and structured-data files for the workbench-domain heuristic at `agents/orchestrator.md` Setup Step 5.
- `bin/fusion-review-coverage` — tiles the review files' declared ranges against the session's commit range. Cited by name in the orchestrator's `## Review coverage` section.
- `bin/fusion-staging-drift` — names what the workbench holds that no commit carries.
- `bin/fusion-state-drift` — compares the session's bookkeeping surfaces against git and `orchestrator-events.jsonl`.

Each is a mechanism a fusion developer has to know exists, and each is discoverable today only by listing the directory.

## Why this is filed rather than fixed

`260811-2151_*_bin-fusion-turn-budget-ships-with-no-claude-md-layout-row-while-its-sibling-added-in-the-same-turn-got-one.md` asked for the five gaps to be closed inline **if they were few and obvious**. They are neither: each of these five is a real mechanism with a contract, a call site and a reason, and a row for each in the table's established register is five paragraphs of new authored text — the same weight as the `fusion-churn-rank` and `fusion-turn-budget` rows, which each took a commit of their own.

## The undecided question underneath

The table makes **no** exhaustiveness claim, so nothing in it is false today; it is silent. That silence is what let five helpers ship without anyone noticing an obligation was unmet. Two ways out, and they are not the same:

1. **The table is an inventory.** Write the five rows, and adding a `bin/` helper carries a row the way it carries a `[ -x ]` guard at its call sites.
2. **The table is a selection.** Say so in one line above it — "not every file under `bin/` has a row; `ls bin/` is the set" — and the omissions stop being gaps.

The second is cheap and was deliberately **not** taken while working `260811-2151_*_bin-fusion-turn-budget-ships-with-no-claude-md-layout-row-while-its-sibling-added-in-the-same-turn-got-one.md`: writing "this is not a list of everything" into the table answers the question in passing and removes the pull to write the five rows, and the question is worth answering once rather than by default. `260810-0410_*_the-layout-tree-calls-itself-exhaustive-and-omits-the-two-plane-runtime-files.md` is open against the neighbouring layout tree for the same reason, where the failure was the harder kind — an exhaustiveness claim that was false. Answer both together.

## Acceptance criteria

- Either the five rows exist, or the table states in one line that it is a selection.
- Whichever is chosen is recorded as a decision that also covers `260810-0410_*_the-layout-tree-calls-itself-exhaustive-and-omits-the-two-plane-runtime-files.md`, so the next table does not have to rediscover it.

---
Resolved: Closed on the first of the two acceptance branches: the table is exhaustive rather than labelled a selection. `ls bin/` returns 12 executables at HEAD `2552586` and `grep -c "^| \`bin/" CLAUDE.md` returns 12, one row each, including the four this record named as missing (`fusion-commit-lock`, `fusion-count-sources`, `fusion-staging-drift`, `fusion-review-coverage`). The fifth, `fusion-state-drift`, no longer ships — it was removed on 2026-08-15 with the counters it measured — so its row is moot rather than missing. The exhaustiveness is now gated in both directions by the `bin/` roster check in `hooks/lib/__tests__/derivable-enumerations-lint.test.ts` section 7, so the next helper added without a row fails the suite. Verified by reconciliation pass 260817-1836.
