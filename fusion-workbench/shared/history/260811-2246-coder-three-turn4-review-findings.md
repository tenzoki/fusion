# coder — content-named citations, a two-input gate split four ways, and one missing Layout row

**Status:** Complete
**Date:** 260811-2246
**Agent:** coder
**Records:** `260811-2145_*_…`, `260811-2149_*_…`, `260811-2151_*_…`
**Filed:** `260811-2239_*_…`, `260811-2245_*_…`
**Verification:** `cd hooks && npm test` — 52 files, 1349 tests, exit 0

Three Turn-4 review findings, worked in the order dispatched.

## 1 — The deliverable-language citations (`260811-2145_*_the-deliverable-language-case-is-the-third-bullet-and-two-citing-surfaces-send-the-reader-to-the-fourth.md`)

Both citing surfaces pointed at the fourth bullet of `## Project language`, and the
deliverable case is the third. The record was right on every fact, checked against the
file: the fourth bullet says the language is fixed to English whatever either declaration
says, which is the opposite of what a reader following the citation is looking for.

**Chose the less obvious repair.** An ordinal into a bullet list is a citation form that
breaks on insertion, and `agents/editor.md` already carried the form that does not — "the
customer-deliverable case in …". Both surfaces now use it. Nothing was built for this: it
is two words in each of two sentences, and the class ends because the reference no longer
has a position to be wrong about.

**The owning file needed it too.** The record read its two in-section back-references as
correct, and they were — but they are the same form, and both are shorter for the change:
"every case except the deliverable one collapses" (:206) and "the deliverable case above"
(:224), plus the counted phrase "the other three cases" in the same lead. That is what
made the file's inclusion in the dispatched set genuine rather than convenient, and it is
what carries acceptance criterion 1: no shipped surface under `agents/`, `rules/`,
`skills/`, `docs/` or `CLAUDE.md` cites a case of that section by ordinal.

The empirical asymmetry worth keeping: `9f84254` wrote all three surfaces in one sitting
and got the two *in-file* ordinals right and the two *cross-file* ones wrong. An ordinal
under the list it indexes is verifiable at a glance; one in another file is not. Both are
gone anyway.

Criterion 2 (a lint case) is not met — the test is outside the dispatched file set — and
is on `260811-2245_*_no-test-pins-that-the-project-language-cases-are-cited-by-content-so-the-next-ordinal-ships-unnoticed.md`.

## 2 — The record-counts gate (`260811-2149_*_the-record-counts-block-still-gates-both-halves-together-when-session-started-is-missing-and-a-test-pins-it.md`)

The block had two inputs and one and a half gates. `29d62e2` split the anchor's failure
off correctly; the start stamp's failure still took both halves down, and the `now_` half
needs no start stamp at all — it asks git whether a name existed at the anchor.

`WHY` became `WHY_A` and `WHY_T`, and each half is gated on its own variable inside the
per-file loop. Two inputs, each usable or not, are four cases, and the block now writes
all four. The `unmeasured` line names both causes comma-joined; the two `partial` lines
name the one that fired. `no-anchor-in-agentstate` consequently narrows to the anchor
field alone, which the prose says and which removes the second, smaller point the record
raised — the cause name no longer contradicts the state it names.

**Two pinning assertions replaced, not deleted**, the way `29d62e2` treated the one it
inherited. Each replacement carries the comment the record asked for: what the old
assertion was right about, and why the branch it pinned moved.

- `:322` required `why=no-anchor-in-agentstate` on a missing start stamp. True of the
  combined gate — a missing `started` really did take both halves down under the anchor's
  name. It now asserts both causes and no counts, and the branch is reachable only when
  both inputs are absent.
- "describes the no-anchor branch as the disjunction it is" required the prose to say
  "missing either `git_head_at_start` or `started`". An accurate description of a gate
  that fired on either field; a description of an impossible branch now. It asserts the
  disjunction is gone and that `no-session-start` is documented as its own cause.

One new case per shell covers the leg that was untested: anchor present and usable,
`session.started` absent, `now_` counts taken and no `filed` count printed. It needed a
`start` shape on the fixture, mirroring `anchor`, and a `noFiledCounts` helper mirroring
`noNowCounts`.

## 3 — The Layout row (`260811-2151_*_bin-fusion-turn-budget-ships-with-no-claude-md-layout-row-while-its-sibling-added-in-the-same-turn-got-one.md`)

`bin/fusion-turn-budget` has a row, placed beside `bin/fusion-churn-rank` and in that
row's register: it cites the helper's own header as the authoritative usage block instead
of copying the `KEY=value` line and the exit table, so the output contract has one
surface. What it spells out is the thing the register asks for — the one thing a reader
gets wrong — namely that a failed read is a *state*, and the four things the orchestrator
does instead of inventing a number.

**Checked the rest of the table.** 15 files under `bin/`, 10 rows after this one. Five
absent: `fusion-commit-lock`, `fusion-count-sources`, `fusion-review-coverage`,
`fusion-staging-drift`, `fusion-state-drift` — exactly the five the record predicted.
Not "few and obvious": each is a real mechanism with a contract and a call site, and a
row apiece is five paragraphs of new text. Filed as `260811-2239_*_five-shipped-bin-helpers-have-no-claude-md-layout-row-and-the-table-says-nothing-about-being-a-selection.md`, which also carries the
inventory-or-selection question and points at `260810-0410_*_the-layout-tree-calls-itself-exhaustive-and-omits-the-two-plane-runtime-files.md` on the neighbouring table.

The one-line "this table is a selection" was **not** written, deliberately. The table makes
no exhaustiveness claim, so nothing in it is false today; writing that line would answer
the open question in passing and take away the reason to write the five rows.

## Nothing here was softened

Two of the three corrected text written earlier today. Each finding was checked against
the file before working it and each was right on its facts. The one place I went past a
record was `260811-2145_*_the-deliverable-language-case-is-the-third-bullet-and-two-citing-surfaces-send-the-reader-to-the-fourth.md`, where the record called two ordinals correct and I changed them
anyway — not because the record was wrong about them, but because they are the same form
and the change costs nothing.

## Files

- `agents/orchestrator.md` — the deliverable-language citation; the record-counts bash
  block (`WHY_A`/`WHY_T`, the four-case header, the two per-half gates in the loop); the
  header-line paragraph, the four-case bullet list and the `why=` cause list.
- `CLAUDE.md` — the deliverable-language citation; the `bin/fusion-turn-budget` Layout row.
- `rules/fusion-workbench-conventions.md` — three positional references in
  `## Project language` replaced by content-named ones.
- `hooks/lib/__tests__/record-counts-measurement.test.ts` — `start` fixture shape,
  `EXPECTED.nowOnly`, `noFiledCounts`, two replaced assertions, one new case per shell,
  fault 5 in the gate header.
- `hooks/lib/__tests__/fixtures/rules-emission.golden` — regenerated, per that test's
  `## Updating the golden`. The conventions edit moved the emitted rule text by 5 bytes,
  which every agent's total carries. Reviewed: the +5 on one file and the sixteen totals,
  no path set and no ordering change.
