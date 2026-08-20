# coder — the citation grammar learns the Circle-record form (plan step 8b)

**Status:** Complete
**Date:** 2026-08-20
**Agent:** coder
**Task:** Not a plan step. Opened by step 8's report, put to the user at the gate that record opened,
and answered there: fix the grammar first, then arm. The record is
`circles/260819-1645-four-constraints-on-deep-change/issues/260819-2321_*_a-citation-of-a-circle-record-produces-no-token-so-the-gate-cannot-see-the-form-the-repair-adopted.md`,
with the answer appended at its foot.
**HEAD at start:** `6e72cc2`, with one appended note in that issue record uncommitted in the tree.

## What changed

`hooks/lib/__tests__/helpers/citation-scan.ts`, +107 lines, one new token class and one new
resolution branch. Nothing else in the repository was edited except the machine-written golden
below.

**The grammar.** A new `CIRCLE_REC_RE` matches `circles/<stamp>-<slug>/_x_circle.md`, optionally
workbench-rooted, with `.md` optional exactly as everywhere else in this grammar. It is a separate
pattern rather than a widening of `REC_RE`, and the reason is in the shape of the two basenames
rather than in convenience: a store record is `<stamp>_<marker>_<slug>.md` and `REC_RE`'s tail is
anchored on that stamp, while a Circle record carries no stamp and no slug at all — the stamp lives
in the *directory* name. There is therefore no store segment to add to `STORES` and no tail to relax.
One pattern expressing both would have had to make its own anchor optional.

**The resolution.** `findRecord()`'s Circle branch splits on whether a store was cited: with a store
it is a record inside the Circle and keeps `anchoredUnder`, without one it is the Circle's own record
and takes a new `anchoredAt`. Both now share `unsweep()`, the one-sweep strip factored out of the
old `anchoredUnder` body, so the new form goes **through** step 6b's bound rather than around it and
the bound is still written once.

`anchoredAt` asks equality where `anchoredUnder` asks a prefix. That is not caution for its own sake:
a Circle record sits directly in the Circle directory and in no store below it, so `circles/<dir>` is
the whole of its `relDir`. A `startsWith` here would have accepted every record in every store inside
that Circle, and would have accepted a sibling Circle whose directory name merely begins with this
one's.

**The class.** `circle-record` is a new `CitationKind` and is in `GATE_KINDS`, so
`scanRecordCitations` — the gate's entry point — counts and judges it. It carries three statuses, not
four: there is no `wrong-store` retry, because `_x_circle.md` carries no stamp and no slug, so an
unanchored lookup matches *every* Circle's record and would answer a plainly wrong directory name
with a dozen "the record lives at" candidates. "Which store is it in" is not a question a Circle
record can be asked; it is in no store.

## The marker position behaves as it does everywhere else

This was the load-bearing property, and it is confirmed by exercise rather than asserted. Against the
real workbench index:

| cited | resolves as |
|---|---|
| `circles/260819-1645-…/_t_circle.md` (correct marker) | `resolved` |
| `circles/260819-1645-…/_*_circle.md` (wildcard) | `resolved` → `_t_circle.md` |
| `circles/260819-1645-…/_a_circle.md` (record is `_t_`) | **`stale-marker`** → `_t_circle.md` |
| `archive/<sweep>/circles/260719-1536-plane-mirror-integration/_c_circle.md` | `resolved` → the archived record |
| `circles/260719-1536-plane-mirror-integration/_c_circle.md` (live path, archived record) | `resolved` → the archived record |
| `circles/260719-1536-plane-mirror-integration/_a_circle.md` (live path, wrong marker) | **`stale-marker`** → the archived record |
| `fusion-workbench/circles/260819-1645-…/_t_circle.md` | `resolved` |
| `circles/260101-0000-nothing-here/_t_circle.md` | `dangling` |
| `circles/260801-1244-cura/_c_circle.md` (strict prefix of a real directory) | **`dangling`** — the negative control for `anchoredAt` |
| `circles/260819-1645-…/_t_circle` (no `.md`) | `resolved` — prefix form |
| `circles/260819-1645-…` (bare directory) | still `circle-dir`, unaffected |

## The measurement, as a before/after join

Both runs on the same tree, the second differing only by this edit. Every token joined on
`file:line:token`.

**Corpus A — the whole workbench excluding `archive/`**, 1 331 files. 12 922 tokens before,
13 116 after.

**Corpus B — step 8's wider repair reading** (Circle records in every state, `portfolio.md`, issues
carrying `_o_`, decisions carrying `_o_` or `_a_`, `archive/` excluded), 191 files. 1 728 tokens
before, 1 776 after. It is 191 rather than step 8's 190 because this Circle's own new issue record
joined the corpus; its 4 tokens account for the 1 728 against step 8's closing 1 724.

**The change is purely additive, and that is a measured statement, not an expectation.** Across both
corpora: **0 tokens disappeared** and **0 surviving tokens changed kind or status**. Every difference
is a new token.

| new tokens, by status | Corpus A | Corpus B |
|---|---|---|
| `resolved` | 91 | 37 |
| `stale-marker` | 98 | 10 |
| `dangling` | 1 | 0 |
| `exempt` | 4 | 1 |
| `wrong-store` | 0 — by construction | 0 |
| **total** | **194** | **48** |

The `exempt` hits are the parser's own exemptions firing, four of them blockquoted or announced
illustrations. `wrong-store` is structurally absent, per the three-statuses note above.

**What the gate would newly see: 99 violations in corpus A, 10 in corpus B.** Which of those two
numbers step 9 inherits depends on the corpus question that is still open in
`circles/260819-1645-four-constraints-on-deep-change/decisions/260819-1645_*_what-defines-the-citation-gates-corpus-and-what-happens-when-a-marker-move-changes-it.md`.
The 10 in corpus B are listed in full at the end of this log.

## The twenty-eight repairs from steps 7 and 8: all resolve, checked one at a time

Not inferred from a count. Every line in the workbench outside `archive/` carrying an
`archive/<sweep>/circles/<dir>/_x_circle.md` citation was enumerated by grep, then joined to the
after-scan by `file:line` **and** exact token. **30 such citations exist; all 30 produce a
`circle-record` token and all 30 are `resolved`.** None is `ambiguous`, `stale-marker` or `dangling`.

The 30 is the 28 plus two, and the two are accounted for exactly rather than waved at. Counting the
form at each commit: `5ec9dc6` → 0, `4aae336` (step 6b) → 1, `86a9db8` (step 7) → 14,
`6e72cc2` (step 8) → 30. So step 7 wrote 13 and step 8 wrote 16 — its 15 treatment-1 repairs plus the
one adjacent correction its log records separately, in
`shared/issues/260801-1020_*_plane-mirror-circle-closed-with-empty-turn-log.md:5`. One citation
predates both. 13 + 15 = the twenty-eight, and each is inside the verified 30.

Per file: `circles/260801-1244-curator/_c_circle.md` 5, `circles/260801-1244-guard-rules-write/_c_circle.md` 4,
`shared/issues/260813-0913_*_a-dependency-between-two-circles-…` 3,
`circles/260801-1244-rule-provenance-header/_c_circle.md` 3,
`shared/decisions/260719-2141_*_concurrency-worktree-slots-vs-single-active-circle.md` 2,
`circles/260816-1741-guard-becomes-observation-only/_b_circle.md` 2,
`circles/260815-0007-remove-eight-mechanisms-and-cap-growth/_c_circle.md` 2,
`circles/260813-0858-playmaker-maintains-backlog-store/_c_circle.md` 2,
`circles/260716-1847-workbench-umbau/_c_circle.md` 2, and one each in `portfolio.md`,
`circles/260718-1924-v5x-overhaul/_c_circle.md`,
`circles/260813-0858-playmaker-maintains-backlog-store/issues/260813-1545_*_the-deferred-version-bump-…`,
`shared/issues/260801-1410_*_unattributed-edit-to-ontocoder-prompt-during-session.md` and
`shared/issues/260801-1020_*_plane-mirror-circle-closed-with-empty-turn-log.md`.

## The twenty-five dead paths: all appear, the count is still twenty-five, and only fifteen are faults

Enumerated the same way — every non-archive-prefixed `circles/<dir>/_x_circle.md` citation outside
`archive/` whose `<dir>` is not a live Circle directory. **25 exactly**, unchanged from step 8's
figure, and every one of the 25 now produces a token. Across the same four names step 8 named:
`circles/260719-1536-plane-mirror-integration/_*_circle.md` 12,
`circles/260813-0910-documentation-matches-shipped-plugin/_*_circle.md` 10,
`circles/260801-1244-guard-bash-inspection/_*_circle.md` 2, and `260719-1536-demo-circle` 1 — the
fourth is written without the citation form deliberately, because no record of that name exists
anywhere to cite.

**The finding step 8 could not have had, because it had no grammar to measure with: the 25 are not
25 violations.**

| | count |
|---|---|
| `stale-marker` — the Circle was archived *and* its marker moved | 14 |
| `resolved` — the citation reaches the archived record through the one-sweep tolerance | 10 |
| `dangling` — nothing on disk, at any depth | 1 |

The 10 that resolve are the prefix-tolerance cost arriving on its third day. `circles/<dir>/…` and
`archive/<sweep>/circles/<dir>/…` produce the identical token, `anchoredAt` strips one sweep, and a
citation spelling the live path of a swept Circle therefore finds the archived record and is reported
as correct. The one `dangling` is `circles/260719-1536-demo-circle/_t_circle.md` in
`circles/260815-0007-…/history/260815-0751-ontocoder-remove-plane-data-files-and-fixtures.md:96` — a
name nothing in this workbench has ever carried.

**So the repair pass step 9 is waiting on is 15 hits, not 25** — and 13 of those 15 sit in history,
analyses and planning, which neither corpus reading opens. This does not make step 8's number wrong:
it counted *paths naming a directory that is not there*, which is exactly 25. It is the treatment
that splits, and it splits on a tolerance the scanner had already accepted for the store forms.

### The sharpest instance, confirmed visible

`shared/decisions/260719-2141_*_concurrency-worktree-slots-vs-single-active-circle.md` carries the
same target three times, and before this change the scanner saw none of them.

```
:7   circles/260719-1536-plane-mirror-integration/_c_circle.md                      circle-record  resolved
:40  archive/260817-1907-…/circles/260719-1536-plane-mirror-integration/_c_circle.md circle-record  resolved
:48  archive/260817-1907-…/circles/260719-1536-plane-mirror-integration/_c_circle.md circle-record  resolved
```

All three resolve to `archive/260817-1907-safe-cleanup-scoped/circles/260719-1536-plane-mirror-integration/_c_circle.md`.
`:7` is the one in the record's own `**Cross-references:**` field that step 7 left standing because no
scan ever named it; it is named now. And the three lines demonstrate the cost in one file: `:7` spells
the live path and `:40`/`:48` spell the archive path, the scanner reports all three identically, and
nothing in the token says which spelling a line used.

## The cost, as it is written at the branch

Written into the doc comment above `anchoredUnder`, beside step 6b's, because an accepted residual
that lives only in a workbench record stops being read.

**What the new form cannot distinguish.** `circles/<dir>/_c_circle.md` and
`archive/<sweep>/circles/<dir>/_c_circle.md` produce the identical token — `CIRCLE_REC_RE` begins its
match at `circles/` either way — so the scanner cannot say which of the two a line meant. The 10
resolved dead paths above are that residual, measured.

**One collision it also cannot distinguish, and this one is hypothetical.** A Circle present both
live and archived under one directory name would resolve `ambiguous` rather than to either copy. It
is hypothetical not by luck: a sweep *moves* the directory, so the two cannot coexist unless a Circle
is later re-created under an archived name, which the stable-directory-name convention exists to
prevent.

**What it deliberately leaves alone.** `circleDirs()` is untouched, so a citation of an archived
Circle *directory* is still `dangling` while a citation of the record inside it now resolves. That
asymmetry is exactly the subject of
`circles/260819-1645-four-constraints-on-deep-change/issues/260819-2300_*_circledirs-did-not-learn-the-archive-prefix-that-findrecord-did-so-an-archived-circle-directory-stays-unexpressible.md`,
which is open and is not answered here — extending a user's answer from the function it named to a
function it did not name is the move that record itself declines to make.

**The bound, and what was and was not verified.** `anchoredAt` was exercised on the eleven cases in
the table above, including the strict-prefix negative control, which is `dangling` as intended. The
two-sweep negative control on the **disk** side is still pinned by nothing but the pattern and the
comment, exactly as step 6b recorded — no workbench directory carries two sweeps and this step wrote
none. A two-sweep prefix in the **citation text** is a different question and is not bounded at all:
the token starts at `circles/` regardless of what precedes it, so such a citation resolves like any
other. That is inherited from `REC_RE`'s own shape and is not new here.

## Baselines and goldens

**`reference-resolution-lint.test.ts` `BASELINE` did not move.** It stands at
`{ paths: 1179, anchors: 155, records: 104 }` and the pin passed untouched. **No re-approval note was
written, and that is the correct outcome rather than an omission** — a note over an unmoved constant
claims a measurement that did not happen.

The reason it did not move is checkable rather than lucky. The gate scans the *shipped* text, and the
entire shipped surface contains exactly **one** Circle-record citation:
`skills/migrate/SKILL.md:96`, `circles/260716-1847-umbau/_t_circle.md`. That file is in
`RECORD_EXAMPLE_FILES` and is exempt wholesale, so its new token is reported `exempt` — neither
counted as resolved nor raised as a violation. `hooks/lib/__tests__/` is outside `surface()` by
construction, so this file's own new citations are not on the gate's surface either.

**One golden went stale and was regenerated:** `hooks/lib/__tests__/fixtures/surface-growth.golden`.
The diff is exactly two lines — `helpers/citation-scan.ts 621 -> 728` and `total 18897 -> 19004`. No
other surface moved. Regenerated with `UPDATE_SURFACE_GOLDEN=1`, diff read, then re-run without the
flag, per that file's own procedure. `TEST_LINE_BASELINE` was **not** touched. Regenerating records
growth and does not absolve it: the hook-test surface's budget is `17 875 + 2 500 = 20 375` lines and
it now measures 19 004, so **1 371 lines of head-room remain** and this step consumed 107 of them.

## What this log itself costs the corpus, measured

A log about dead citations writes dead citations, and the new grammar reads this file like any other.
Measured after writing it: **6 faults, all irreducible**, down from 19 in the first draft. The 13 that
went were avoidable spellings — the appendix now names each Circle in the `_*_` form with the spelled
marker in its own column, and the four archived Circle names in the paragraph above are cited as
records rather than left as bare `stamp-name` tokens.

What is left cannot be removed without deleting the finding it carries. `:57`, `:59` and `:60` are
three rows of the exercise table: the wrong-marker case and the two negative controls, and naming a
negative control requires writing it. `:132` and `:148` are the demo-circle name, the one genuinely
dead path among the 25. `:214` quotes `skills/migrate/SKILL.md:96` verbatim.

This paragraph made it 7 in its own first draft, by spelling the demo-circle name a third time in the
course of reporting the other two. It says "the demo-circle name" instead, and the re-measurement is
what caught it — which is the shape of the problem rather than an oversight in it, and is the reason
whoever sets the gate's corpus should know these six are here rather than meet them as a surprise.

## Verification

`cd hooks && npx vitest run` — **exit 0**, 37 test files and 678 tests passed. Run without a pipe so
the exit code is the process's own.

## Files changed

```
hooks/lib/__tests__/helpers/citation-scan.ts        +107 lines
hooks/lib/__tests__/fixtures/surface-growth.golden  2 lines (regenerated inventory)
```

Nothing was committed, no plan step was marked, and no workbench record other than this log was
written or edited. Step 8's tree is handed on as it was received.

## Appendix — the 10 new violations inside the repair corpus

All `stale-marker`; the treatment is to star the marker position.

The Circle is named in the repaired `_*_` form, and the marker the line actually spells is a separate
column — writing each row as the citation it currently is would have added ten more dead citations to
the corpus this Circle exists to clean.

| where | line spells | Circle |
|---|---|---|
| `circles/260801-1244-curator/issues/260814-0813_*_…-validation-case.md` | `:10` → `_a_`, `:42` → `_t_` | `circles/260801-1244-curator/_*_circle.md` (now `_c_`) |
| `circles/260801-1244-curator/issues/260814-1450_*_…-landed-the-review.md` | `:26` → `_t_` | `circles/260801-1244-curator/_*_circle.md` (now `_c_`) |
| `circles/260815-0007-…/issues/260815-0804_*_…-activation-renamed.md` | `:5` → `_a_` | `circles/260815-0007-remove-eight-mechanisms-and-cap-growth/_*_circle.md` (now `_c_`) |
| `circles/260815-0007-…/issues/260815-0804_*_…-and-lists-six.md` | `:15` → `_t_` | `circles/260815-0007-remove-eight-mechanisms-and-cap-growth/_*_circle.md` (now `_c_`) |
| `portfolio.md` | `:72` → `_a_` | `circles/260819-1645-four-constraints-on-deep-change/_*_circle.md` (now `_t_`) |
| `shared/issues/260811-2105_*_…-citations-are-stale.md` | `:37` → `_a_` | `circles/260801-1244-curator/_*_circle.md` (now `_c_`) |
| `shared/issues/260811-2105_*_…-citations-are-stale.md` | `:102` → `_t_` | `circles/260816-1741-guard-becomes-observation-only/_*_circle.md` (now `_b_`) |
| `shared/issues/260813-0913_*_…-may-write-the-other.md` | `:91`, `:112` → `_a_` | `circles/260813-0858-playmaker-maintains-backlog-store/_*_circle.md` (now `_c_`) |

Two of the files are worth naming to whoever repairs them, because they are records about this exact
class and now carry an instance of it:
`shared/issues/260811-2105_*_circle-records-carry-the-same-silent-citation-form-and-a-third-of-their-citations-are-stale.md`
and
`circles/260815-0007-remove-eight-mechanisms-and-cap-growth/issues/260815-0804_*_a-decision-records-cross-reference-points-at-an-a-circle-md-that-activation-renamed.md`.
