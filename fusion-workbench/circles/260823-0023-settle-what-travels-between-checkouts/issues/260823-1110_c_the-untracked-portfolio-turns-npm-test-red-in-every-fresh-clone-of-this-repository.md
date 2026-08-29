The untracked portfolio turns `npm test` red in every fresh clone of this repository

---

**Severity:** Critical. It is a blocking gate, and it fires for somebody who changed nothing.
**Domain:** code
**Filed by:** coderev, reviewing C2 Turn 1
**Affects:** `hooks/lib/__tests__/workbench-citation-lint.test.ts:263`, `.gitignore:85`, and step 9 of this Circle's own plan
**Cross-references:** plan step 2 in `260823-0800_*_c2-what-travels-between-checkouts-is-settled.md`; `260821-1810_*_activating-a-circle-turns-the-suite-red-because-its-own-decision-records-cite-the-anticipated-marker.md` (a different cause, same class of failure)

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

---

Resolved: 2026-08-23 by coder. The tree assertion at
`hooks/lib/__tests__/workbench-citation-lint.test.ts:263` was replaced by a predicate assertion,
`expect(inCorpus(PORTFOLIO), …)`. The corpus predicate is unchanged: `portfolio.md` stays a corpus
member, so wherever a checkout has one its citations are still judged, and where it has none
`corpusFiles()` selects nothing and costs nothing.

**The fork was decided against option 1, and the record's own ground for it does not hold.**
The record argues option 1 is "the one consistent with `rules/workbench-tracking.md` class L".
Class L states what git carries between checkouts; it says nothing about what a gate may read.
`agentstate.yaml` and `orchestrator-live.md` are class L too and no gate reads them, not because
of their class but because they carry no citations. Two further reasons decide it:

1. **The corpus is a user's recorded answer.** It was set as "the Circle records, `portfolio.md`,
   the open decisions and the open issues" at the first shaping answer of Circle
   `260819-1645-four-constraints-on-deep-change` and pinned by decision
   `260819-1645_*_what-defines-the-citation-gates-corpus-and-what-happens-when-a-marker-move-changes-it.md`.
   Removing a named kind from it is a change to that answer and belongs at a user gate, not in a
   defect repair.
2. **Dropping it would lose real coverage and replace it with nothing.** The portfolio is the
   workbench's only generated markdown, and `portfolio-citation-form-lint.test.ts` gates the
   *generator*'s examples (`agents/playmaker.md`), never the generated output against the tree.
   This gate is the only thing that reads a produced portfolio's citations. A generator that emits
   a dead path emits it on every run.

**What the fresh clone actually broke was the assertion's method, not its subject.** Its three
siblings assert against the tree because their kinds are class R1 and git puts instances in every
checkout; the portfolio's does the same for a file git does not carry, which is a claim about one
working tree's transient state. The file's own precedent for this is the frozen-store clause a few
lines below, which puts constructed paths to `inCorpus()` rather than to a walk, for the stated
reason that a walk-derived assertion "would pass vacuously and go on passing after somebody deleted
the clause". The predicate form is the stronger of the two here: it holds in every checkout and can
be broken only by the clause leaving `inCorpus()`, which is the one failure this line exists to
catch.

**One site, and the search that establishes it.** `grep -rn portfolio` over `hooks/lib/` and
`hooks/lib/__tests__/` returns eleven other hits and none is a second instance: `staging-drift`'s
are scratch fixtures the test writes itself, `portfolio-citation-form-lint` reads
`agents/playmaker.md`, `fusion-paths.test.ts` reads the resolver's `PORTFOLIO` key, and the rest are
prose. `workbenchRoot` and `WORKBENCH_PRESENT` have four consumers in total and the other three
(`fenced-code-exemption`, `plan-stopping-section-lint`, `reference-resolution-lint`) name no
class L file.

**Reproduced both ways, at `e41393e`.** A fresh `git clone` of this repository into a scratch
directory, `hooks/node_modules` copied in: `npm test` failed 4 tests in 2 files. Three were
`committed-dist.test.ts` reporting a toolchain mismatch because `hooks/package-lock.json` is
gitignored and the copy carried none — an artifact of the reproduction, confirmed by copying the
lock file in, after which that file passes and the single remaining failure is this one:
`portfolio.md is in the corpus by name: expected false to be true`. After the repair, the same
clone with the change applied ran 724 tests in 41 files green with no `fusion-workbench/portfolio.md`
on disk. The working tree is green too.

**Two gates the repair moved, each accounted for.**
`hooks/lib/__tests__/fixtures/surface-growth.golden`: `workbench-citation-lint.test.ts 347 -> 370`
(+23, the comment stating why the portfolio is put to the predicate),
`reference-resolution-lint.test.ts 1069 -> 1076` (+7, the re-approval block below), `total 20126 ->
20156`. No other file and no other surface moved. Hook-test head-room: 249 free of 2 500 before,
219 after.
`reference-resolution-lint.test.ts` `BASELINE`: `paths 1292 -> 1293`, anchors and records unmoved.
The one token is `rules/workbench-tracking.md` entering `README-hooks.md:369`, whose description of
this gate's corpus now qualifies `portfolio.md` as class L and cites the file that defines the class
— the second half of this record's "Why it matters here and now". An accounting block was added
above the constant per that file's own invariant.

**Not repaired here:** the log above that constant closes at `paths 1291` while the constant read
`1292`, which is
`260823-1110_*_two-of-six-baseline-re-approvals-carry-no-accounting-and-the-log-now-contradicts-the-constant.md`.
The new block states its move against the constant and says so.

**Files:** `hooks/lib/__tests__/workbench-citation-lint.test.ts`,
`hooks/lib/__tests__/reference-resolution-lint.test.ts`,
`hooks/lib/__tests__/fixtures/surface-growth.golden`, `README-hooks.md`. The last reaches beyond
`hooks/` because the gate's user-facing description made the same claim the assertion did.
Uncommitted at the time of writing; the orchestrator commits.
