The untracked portfolio turns `npm test` red in every fresh clone of this repository

---

**Severity:** Critical. It is a blocking gate, and it fires for somebody who changed nothing.
**Domain:** code
**Filed by:** coderev, reviewing C2 Turn 1
**Affects:** `hooks/lib/__tests__/workbench-citation-lint.test.ts:263`, `.gitignore:85`, and step 9 of this Circle's own plan
**Cross-references:** plan step 2 in `circles/260823-0023-settle-what-travels-between-checkouts/planning/260823-0800_o_c2-what-travels-between-checkouts-is-settled.md`; `shared/issues/260821-1810_o_activating-a-circle-turns-the-suite-red-because-its-own-decision-records-cite-the-anticipated-marker.md` (a different cause, same class of failure)

---

## What is wrong

Commit `00ce4f0` ran `git rm --cached fusion-workbench/portfolio.md` and added `fusion-workbench/portfolio.md` to `.gitignore`. The file is now neither tracked nor trackable.

`hooks/lib/__tests__/workbench-citation-lint.test.ts:263` asserts that file by name:

```ts
expect(rels.has("portfolio.md"), "portfolio.md is in the corpus by name").toBe(true);
```

The corpus is built from the disk (`corpusFiles()` filters `markdownFilesUnder(workbenchRoot)`), so the assertion holds only while a working-tree copy exists. A fresh clone has no `fusion-workbench/portfolio.md` and no way to obtain one short of running the playmaker, and the enclosing `describe.runIf(WORKBENCH_PRESENT)` does not skip: `WORKBENCH_PRESENT` tests `fusion-workbench/.fusion-setup`, which is class R3 and still tracked.

## Verified

Measured at HEAD `2f1e3a6` by moving the file aside and running the gate alone:

```
× workbench citation lint: the corpus predicate > holds the four kinds the user's answer named
  → portfolio.md is in the corpus by name: expected false to be true
Test Files  1 failed (1)
```

The file was restored afterwards. The full suite is green in this working tree for one reason only: `git rm --cached` left the untracked copy on disk.

## Why it matters here and now

Step 9 of this Circle's plan builds two clones of this project and runs a session in each. Both clones start with a red suite. So does any second developer, which is the arrangement capability C2 exists to make work.

`README-hooks.md:369` also still describes the gate's corpus as "the Circle records, `portfolio.md`, the open issues and the live decisions", which now holds only in a checkout that generated one.

## Direction, not a prescription

Three shapes are available and the choice is a real fork.

1. Drop the `portfolio.md` line from the corpus predicate and from that assertion, and correct `README-hooks.md:369`. The portfolio is regenerated per checkout, so its citations are re-authored on every run and gating them adds little.
2. Keep it in the corpus and make the assertion conditional on the file existing. That keeps the check where a portfolio is present and costs a second reason why the corpus is not fixed.
3. Untrack it but keep a tracked copy for the gate. This contradicts class L and should not be taken.

Option 1 is the one consistent with `rules/workbench-tracking.md` class L.
