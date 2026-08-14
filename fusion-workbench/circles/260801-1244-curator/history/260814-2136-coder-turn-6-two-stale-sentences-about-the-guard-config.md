# Turn 6, Task T13 — two sentences about the guard config that the same Turn had made false

**Status:** Complete
**Agent:** coder
**Circle:** `circles/260801-1244-curator`
**Task:** T13, Turn 6 — one High finding and one Low, both single-clause corrections.

---

## What the task was

Commit `f0d9d60`, earlier in this same Turn, changed both the repository's guard
configuration and the test that pins it, and left two sentences standing that described
the state before the change. Neither sentence was wrong when written. Both were wrong by
the time the commit landed.

## The High finding — `CLAUDE.md:30`

Record:
`circles/260801-1244-curator/issues/260814-2128_*_claude-md-still-calls-the-root-guard-config-byte-identical-to-the-template-after-the-same-turn-made-it-false.md`.

The `fusion-guard.json` row of the Layout table said the root copy was "byte-identical to
the template (pinned by `config.test.ts`)". Both halves had been falsified: the root copy
carries `"orchestrator": { "maxTurns": 12 }`, and the test case at
`hooks/lib/__tests__/config.test.ts:1445` now cuts the top-level entries named in
`PROJECT_SET_KEYS` out of both sides before comparing.

The replacement clause:

> the root copy here equals the template outside the top-level keys a project is meant to
> set for itself, and that is exactly what `config.test.ts` pins: it cuts the keys named in
> its `PROJECT_SET_KEYS` out of both sides and holds every remaining byte identical. This
> repository sets one of them, its own Turn budget (`orchestrator.maxTurns`).

Three decisions inside that wording are worth recording, because each was a choice and not
the only phrasing available.

**The key is named and the value is not.** Writing `12` into the row would put a tuned
runtime number on a normative surface that nothing re-measures, which is the defect the
same file already warns about twice in other rows (the always-on byte floor, the tracked
workbench file count). A reader who wants the current value runs `./bin/fusion-turn-budget`,
which the row two tables down already tells them to do.

**`PROJECT_SET_KEYS` is named rather than paraphrased.** The record asked for a third fact
the old sentence did not carry: where a future project-configurable key would be declared.
Naming the constant carries it in two words. The alternative, a sentence explaining that a
future exemption is added there and nowhere else, would have been the expansion the task
explicitly ruled out.

**Nothing else in the row moved.** The merge-per-leaf paragraph, the `guard.enabled`
sentence and the retired-`guard.protectedPaths` paragraph were all still true; the task was
a correction, not a rewrite.

## The Low finding — the Turn-budget record's footer

Record:
`circles/260801-1244-curator/issues/260814-2128_*_the-turn-budget-records-closing-footer-says-fusion-guard-json-was-not-edited-in-the-commit-that-commits-it.md`.

The `Resolved:` footer of
`shared/issues/260814-2022_c_this-repository-cannot-set-its-own-turn-budget-…` closed with
"`fusion-guard.json` and `templates/fusion-guard.json` were not edited." That was exact
about the Turn-6 task's own working scope and false about the commit that carries the
footer.

The correction separates the two acts rather than replacing one claim with the other: the
task edited neither JSON file, and `f0d9d60` is nonetheless where the working-tree line
`"orchestrator": { "maxTurns": 12 }`, uncommitted since 2026-08-14 19:35 local, entered
version control, because the test change is what makes it legal. The claim about
`templates/fusion-guard.json` survives untouched, and it survives *verified*:
`git show f0d9d60 --stat` lists `fusion-guard.json | 1 +` and no template.

Both records were correct about a real act. Keeping both is what makes the footer usable to
the future reader the record exists for, the one asking why this repository's guard config
differs from the template it is supposed to copy.

## Out of scope, and left open

`260814-2128_o_the-drift-checks-cut-helper-is-exercised-by-one-input-shape-and-its-last-entry-branch-by-none.md`
asks for test coverage of the JSON cut helper that `f0d9d60` added. The task named it out of
scope. It stays `_o_`.

## Verification

`cd hooks && npm test` — exit 0. Run twice in full: 49 files, 1030 tests, green both times.
The suite is known to fail non-deterministically on repeated full runs, including on clean
HEAD (`shared/issues/260814-2118_o_the-hooks-suite-fails-differently-on-repeated-full-runs-and-does-so-on-clean-head.md`);
neither run met it, in the lock and halt-reaping harnesses or anywhere else.

Neither edit in this task touches code, so a green suite is a statement about the tree the
edits sit in rather than about the edits themselves. The substantive check on the
`CLAUDE.md` clause is the one the record specified and this session ran by hand:
`git diff --no-index templates/fusion-guard.json fusion-guard.json` is exactly one added
line, and `./bin/fusion-turn-budget` prints `max_turns=12`, so the divergence the new
sentence describes is the divergence that exists.

## Files changed

- `/Users/k1/Projects/productive/fusion/CLAUDE.md` — the `fusion-guard.json` row's identity clause.
- `/Users/k1/Projects/productive/fusion/fusion-workbench/shared/issues/260814-2022_c_this-repository-cannot-set-its-own-turn-budget-because-a-test-pins-fusion-guard-json-to-the-template.md` — closing footer.
- Both Turn-6 records above: `Resolved:` note appended, `_o_` → `_c_`.
