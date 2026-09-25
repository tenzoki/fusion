# coder — repair the `stamp-name` citations that name nothing (plan step 8)

**Status:** Complete
**Date:** 2026-08-19
**Agent:** coder
**Task:** Step 8 of `260819-2016_*_four-constraints-on-deep-change.md`.
**HEAD at start:** `86a9db8`

## The premise the step was written under had already changed

The plan states that this step "buys no gate", because `scanRecordCitations` skips every hit whose
kind is outside `GATE_KINDS` and `stamp-name` is outside it. The user has since answered
`260819-2016_*_does-the-citation-gate-judge-the-stamp-name-class-which-scanrecordcitations-does-not-read.md`
the other way: the gate reads the class, `GATE_KINDS` is widened at step 9, and these repairs are
held by the same mechanism as steps 5 to 7. Nothing about the repair itself changed; only what it is
worth.

## Corpus and driver

Step 7's driver, extended with one listing flag (`--stamp-name`) and otherwise untouched. It
assembles the file list from the tree — Circle records in every state, `portfolio.md`, issues
carrying `_o_`, decisions carrying `_o_` or `_a_` in the wider reading and `_o_` alone in the narrow
one, `archive/` excluded — and calls `scanCitationTokens` from
`hooks/lib/__tests__/helpers/citation-scan.ts`. Both readings were measured, because the corpus
question is still open.

## Before and after

**Wider reading** (decisions `_o_` or `_a_`), 190 files:

| | Before | After |
|---|---|---|
| `dangling`, kind `stamp-name` | 30 | **0** |
| `stale-marker` (step 7's deliberate literals) | 24 | 24 |
| **`partition()` `dangling`** | **54** | **24** |
| tokens | 1 746 | 1 724 |

**Narrow reading** (decisions `_o_` only), 170 files:

| | Before | After |
|---|---|---|
| `dangling`, kind `stamp-name` | 24 | **0** |
| `stale-marker` | 24 | 24 |
| **`partition()` `dangling`** | **48** | **24** |

**No deliberate literal was left in this class**, in either reading. The 24 that remain are step 7's
`stale-marker` leaves, named individually in its log and untouched here. The six-hit gap between the
readings is one `_a_` decision the narrow reading does not open,
`260810-2032_*_should-the-drift-checks-four-sentences-be-pinned-to-an-approved-baseline-instead-of-screened-by-a-blacklist.md`.

**14 records edited**, 49 insertions against 41 deletions. No marker was transitioned, no plan step
was marked, nothing was committed, no golden was regenerated and no pinned constant was written.

## The plan said 33 and the corpus holds 30, and the three are accounted for exactly

The 33 was measured at HEAD `b91c01c` on 2026-08-19 at 20:16, before steps 4 to 7 ran. Three of them
sit in
`260805-1548_*_wie-soll-ein-circle-verschwinden-duerfen-den-jemand-absichtlich-loescht.md`,
which **step 4 of this same plan transitioned `_a_` → `_i_`**. An `_i_` decision is in neither corpus
reading, so the file left the measured set with its three tokens still dead: one name from a
consuming project and two playmaker run identifiers, each appearing exactly once, none of them
resolving anywhere in this workbench. 33 − 3 = 30, with no residual.

They are **named and not repaired**, because that record is outside the repair corpus and outside
this step's file set. They matter to whoever answers
`260819-1645_*_what-defines-the-citation-gates-corpus-and-what-happens-when-a-marker-move-changes-it.md`:
this is that question's own subject, arriving inside the plan that asked it. A marker move took three
dead citations out of the gate's reach in the ordinary course of doing the work, and no mechanism
noticed.

## What each treatment did

**Treatment 1 — correct the path: 16 of the 30.** Two shapes, neither of them a guess.

- **15 citations of a Circle by its bare directory name**, where the Circle was archived by the
  `260817-1907` sweep. Five names: `260717-1638-marker-format-ohne-glob-metazeichen` (2 hits),
  `260719-1536-brest-unite-co-creator-conversion` (1), `260801-1244-guard-bash-inspection` (9),
  `260813-0910-documentation-matches-shipped-plugin` (3). Each is now a citation of the Circle's
  **record** at its archive path, which is the form step 7 established for the same targets in the
  `circle-dir` class, is more precise than the directory, and yields no token at all. The five
  directories were verified on disk under `archive/260817-1907-safe-cleanup-scoped/circles/` before
  any edit, and each record's marker was read off the file rather than assumed.
- **1 synthetic review filename inside a verbatim measurement block**, in
  `260816-0719_*_review-sender-cannot-parse-the-per-topic-review-filename-both-reviewer-prompts-mandate.md`.
  The fourth row of that block used `260811-1145-conceptrev-y.md`, a name nothing on disk ever
  carried. It was replaced by a real file in the same store,
  `260807-2035-conceptrev-plan-two-language-declarations.md`, and the row was **re-measured rather
  than rewritten**: `reviewSender` and `isMeasuredReview` are functions of the filename alone
  (`hooks/lib/review-coverage.ts:192-211`), and both names produce `sender: "conceptrev"`,
  `measured: false`. The record now carries a real file as evidence where it carried a fabricated
  one, and says so in one sentence beside the block.

**Treatment 2 — pull the substance into the text and drop the dead token: 14.** Three shapes.

- **10 in-session queue task identifiers** — `I:260801-2038-frozen-state` (5),
  `R:260810-1918-drift-lint-residuals`, `I:260810-0502-drift-lint`, `I:260810-1632-pty-case`,
  `R:260810-1918-monitor-residuals`, `I:260805-1830-coder-rust`. These were never citations. The
  taskplanner's queue is held by the caller and written to no file, so a `<prefix>:<stamp>-<label>`
  id names nothing on disk by construction, and the parser reads the part after the colon as a
  `stamp-name`. Each is now the task's label in prose plus a citation of the record the task was
  raised from, where the source is identifiable, and the label alone where the task bundled a
  batch. The identification of `I:260801-2038-frozen-state` is not inferred from its slug alone: the
  reconciliation note already inside the same decision record names
  `260801-2038_*_session-bookkeeping-froze-at-turn-1-while-three-turns-ran.md` as that
  task's prerequisite, in the same sequencing argument.
- **2 Circle names from a consuming project**, in
  `260803-1837_*_no-route-turns-existing-pre-circle-work-into-a-circle.md:149-150`,
  whose own sentence says none of the five files it lists exists in this workbench. Repairing them as
  citations is impossible and deleting them removes the record's evidence, so the stamps and the
  slugs are both kept and are no longer written in this workbench's citation form — which is what the
  sentence was already saying about them.
- **2 where the citation had somewhere better to live**: a mermaid node label in
  `260801-1244-curator:70`, where the full archive path would have been
  unreadable and the prose four lines above now carries it, and the H1 title of
  `260801-1020_*_plane-mirror-circle-closed-with-empty-turn-log.md`, whose house form
  carries no code span, so the token was swallowing the sentence around it.

**Treatment 3 — annotate as deliberately removed: 0.** No hit qualified, for the third pass running.
Every unresolvable target was archived, was an identifier of something that was never a file, or
belonged to another repository. `rules/circle-records.md` `### Deletion is outside the vocabulary`
was read first and its literal was not used: none of these targets was deleted, and writing that it
was would have asserted something that did not happen.

**No defect was filed.** Treatment 2 forced none — every dropped token's substance was recoverable
and is now in the text beside it, and no reference was lost.

## One adjacent correction, stated because it was not asked for

`260801-1020_*_plane-mirror-circle-closed-with-empty-turn-log.md:5` opened with
`260719-1536-plane-mirror-integration`, a live path for a Circle
archived on 2026-08-17. It is corrected to the archive path with the move dated in the sentence.
It was not a hit in any class — see the finding below — but the title repair above took the Circle's
name out of the H1, which left that line as the only place the record identifies its own subject.
Leaving a knowingly dead path there would have made the repair a net loss. The dated reconciliation
note at `:30` cites the same live path and is **not** touched: it was true on 260817-1836, which is
before the sweep at 260817-1907.

## The finding this pass produced, which is not in scope to fix

**A citation of a Circle's record — `circles/<dir>/_x_circle.md` — produces no token at all, so the
gate cannot see it whether it resolves or not.** `REC_RE` needs one of the ten store segments and
`circles` is not one; `CIRCLE_RE` stops at a directory followed by a further path segment. The
consequence is measurable today: outside `archive/`, **25 such paths name a Circle directory that no
longer exists there**, across four archived Circles — 24 of them, plus this log's own quotation of one
in the section above. Every one is silent to the scanner.

**The sharpest instance is in one file with its own siblings.**
`260719-2141_*_concurrency-worktree-slots-vs-single-active-circle.md` carries the
same dead path three times. Step 7 repaired the two at `:40` and `:48`, because those were tokens the
scanner reported. The one at `:7`, in the record's own `**Cross-references:**` field and spelled
identically, was left — not by a judgement, but because no scan ever named it. Two of the 25 sit
inside the repair corpus; the rest are in history, analyses and planning, which neither corpus reading
opens.

This is adjacent to
`260819-2300_*_circledirs-did-not-learn-the-archive-prefix-that-findrecord-did-so-an-archived-circle-directory-stays-unexpressible.md`
but is not the same defect. That record names the silence as the *reason the workaround is safe* —
"it yields no token at all". This says what the same silence costs on the live form: the most natural
way to cite a Circle is the one form the gate never judges, and step 9's gate will inherit that hole
with nothing in the corpus to show for it. Reported to the dispatcher rather than filed, because a
defect record is in this step's scope only where treatment 2 forces one, and it did not.

## Verification

`cd hooks && npx vitest run` — **exit 0**, 37 test files and 678 tests passed. Run without a pipe so
the exit code is the process's own.

The corpus scan was re-run in both readings after the last edit: **zero** `dangling` hits of kind
`stamp-name`, and the gate-kind classes are unchanged — zero `dangling`, zero `wrong-store`, and the
same 24 `stale-marker` literals step 7 named. Wider reading: 190 files, 1 724 tokens. Narrow: 170
files, 1 532 tokens.

## Files changed

```
2  circles/260716-1847-workbench-umbau/_c_circle.md
1  circles/260718-1924-v5x-overhaul/_c_circle.md
5  circles/260801-1244-curator/_c_circle.md
4  circles/260801-1244-guard-rules-write/_c_circle.md
1  circles/260801-1244-rule-provenance-header/_c_circle.md
1  portfolio.md
6  shared/decisions/260810-2032_*_should-the-drift-checks-four-sentences-be-pinned-to-an-approved-baseline-instead-of-screened-by-a-blacklist.md
2  shared/issues/260801-1020_*_plane-mirror-circle-closed-with-empty-turn-log.md
2  shared/issues/260803-1837_*_no-route-turns-existing-pre-circle-work-into-a-circle.md
1  shared/issues/260810-1820_*_an-executor-verified-a-gate-by-mutating-a-file-another-executor-held-in-the-live-tree.md
2  shared/issues/260810-2027_*_the-monitors-browser-gap-line-has-no-executable-gate.md
1  shared/issues/260811-1301_*_the-orchestrators-routing-table-omits-cargo-toml-from-the-build-manifests.md
2  shared/issues/260813-0913_*_a-dependency-between-two-circles-can-only-be-recorded-on-one-side-because-nobody-may-write-the-other.md
1  shared/issues/260816-0719_*_review-sender-cannot-parse-the-per-topic-review-filename-both-reviewer-prompts-mandate.md
```

The count beside each file is the number of `stamp-name` hits repaired in it, not the number of
edited lines: `260801-1020_*_…` carries one repaired hit plus the adjacent correction
above.
