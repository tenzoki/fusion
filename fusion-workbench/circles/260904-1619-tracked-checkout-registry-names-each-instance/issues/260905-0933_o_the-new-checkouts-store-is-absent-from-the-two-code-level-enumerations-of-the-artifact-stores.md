The new checkouts store is absent from the two code-level enumerations of the artifact stores

---
`shared/checkouts/` was added to the layout tree, to the four-class partition and to CLAUDE.md. The two places in code that enumerate the artifact stores were not touched, so `bin/fusion-staging-drift` reports a registry entry as `unclassified` and states that nothing is claimed about it, while `rules/workbench-tracking.md` says the same file is class R1 and must be committed.

---
**Filed by:** coderev, Kai Stalmann <ks@qantr.com>

**Severity:** Medium. A registry entry left out of a staging list is never named, in every consuming project. It is the same class of miss `bin/fusion-staging-drift` was built to close.

**Cross-references:**
`260811-0114_*_the-queue-rebuild-and-its-history-file-never-entered-a-commit-and-survive-only-in-the-working-tree.md` (the defect the measurement answers).

## Evidence

- `hooks/lib/staging-drift.ts:204-215` — `STORES` is `planning, issues, decisions, history, reviews, analyses, investigations, consult, memos, backlog`. No `checkouts`.
- `hooks/lib/staging-drift.ts:94-97` — the module's own comment records the precedent: the example "used to be `shared/backlogs/`, a user's own note file … when the store was named, `backlog` joined `STORES`, and it is a `record` now."
- `rules/workbench-tracking.md:26` — "`shared/checkouts/` needs no exception. The store sits inside `shared/`, which the R1 row already carries … Track them."
- `rules/fusion-workbench-conventions.md:50` — the store is in the layout tree.
- `hooks/lib/__tests__/path-literal-lint.test.ts:41-55` — `TYPE_FOLDERS`, the second enumeration of the same set, also has no `checkouts`. A skill body or agent prompt naming `shared/checkouts/…` as a literal would pass the gate.

Measured against this repository's own workbench:

```
$ touch fusion-workbench/shared/checkouts/probe-test.md && bin/fusion-staging-drift
  unclassified   ?? shared/checkouts/probe-test.md  (not a record store and not live state — nothing is claimed about it)
```

Compare the same run's classification of a Circle record: `record … (an authored record under the issues store)`.

## The design question behind it

Adding `checkouts` to `STORES` makes every `/fusion:setup` run produce a fault row, because Step 0i's bare `register` rewrites `**Refreshed:**` unconditionally (`bin/fusion-checkout-name:380`) and the file is tracked. Either the stamp stops being rewritten when nothing else changed, or the store is a `record` and the stamp bump is a real staging obligation. The present state answers neither and is silently the weaker of the two.

## Acceptance test

`bin/fusion-staging-drift` classifies an uncommitted `shared/checkouts/<hex>.md` the same way it classifies an uncommitted `shared/decisions/<record>.md`, or `rules/workbench-tracking.md` says why it does not. Whichever, `TYPE_FOLDERS` and `STORES` hold the same set as the layout tree, and something measures that they do.
