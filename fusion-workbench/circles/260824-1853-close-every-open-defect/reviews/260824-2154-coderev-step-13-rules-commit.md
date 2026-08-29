# Code review: commit `01964e4`, step 13 (`rules/`) of Circle `260824-1853-close-every-open-defect`

**Sender:** coderev
**Date:** 2026-08-24
**Reviewed-range:** `a760849..01964e4`
**Not-opened:** none
**Scope:** the one commit in this range no earlier review opened, `01964e4` (Turn 1's review ended at `d5c34cd`, Turn 2's began after it; `bin/fusion-review-coverage` named it uncovered). Nine files under `rules/`, the `reference-resolution-lint` pin, the regenerated `rules-emission.golden`, and the 24 `Resolved:` notes the commit wrote, each read against the diff it cites. The commits `a760849..d5c34cd` were covered by `260824-2056-coderev-turn-1-defect-closure-range.md` and are not re-reviewed here.

## Summary

The nine rule edits are correct against the code they describe: the `cd` paragraph in `commit-lock.md` matches the `with` branch of `bin/fusion-commit-lock`, the nine-and-six inventory in `user-facing-output.md` matches both chat profiles, the exit-5 branch matches `bin/fusion-identity`'s table, the per-topic review pattern matches the regex in `hooks/lib/review-coverage.ts:193`, and every heading the commit cites exists. No heading was renamed, so no citation elsewhere broke; the placeholder-footer cut removed nothing another surface names. One Medium: the commit adds "cite a rule file by heading anchor, never by line number" and closes all 24 records with `rules/<file>.md:N`. Two Low, both on surfaces this step did not own.

## Totals

Critical 0 / High 0 / Medium 1 / Low 2. Three issues filed; report-accuracy notes below carry no record.

## Findings by theme

### Citation form (Medium)

**The commit forbids line-number citations into rule files and writes 24 of them.** `rules/fusion-workbench-conventions.md` `## Filename Patterns` gains "Cite a rule file by heading anchor … never by line number … no gate resolves `path:N`" (closing `260808-0030` and `260818-1637`). All 24 `Resolved:` lines the commit wrote end in `rules/<file>.md:<N>`, the two closing records included. One (`…260814-1332_*_…`, `:253`) is already off at HEAD after Turn 2's edits above it. The `_a_`/`_i_` rows of the decision table and the `### Decision files` templates still mandate `<path>:<line>` with no rule-file exception, so the same file now gives two instructions for the common case. Filed: `260824-2151_*_twenty-four-closure-notes-and-two-annotation-rows-cite-rule-files-by-line-number-in-the-commit-that-forbids-it.md`.

### Sibling surfaces left behind (Low)

**Two agent prompts still carry the form the rule replaced, and only a history file says so.** `agents/orchestrator.md:266` "two literal openings" against the rule's "exactly three"; `agents/playmaker.md:207` the single-line `split … into:` form against the header form in `rules/circle-records.md` `## Backlog — ranked` and `skills/next/SKILL.md:140`. The step report names both under `## Departures`; no issue record exists; `agents/` is a parallel coder's at this moment. Filed: `260824-2152_*_two-agent-prompts-still-carry-the-form-step-13-changed-and-only-a-history-file-records-it.md`.

**The `bin/fusion-commit-lock` header does not carry the `cd`.** The new paragraph is accurate (`with)` branch: `resolve_root` → `cd "$root"` → `do_acquire` → `"$@"`), but the header's `with` usage entry, which `CLAUDE.md` says carries the same contract, does not mention the directory or the absolute-pathspec consequence. `bin/` is a parallel coder's at this moment. Filed: `260824-2153_*_the-commit-lock-header-does-not-carry-the-cd-the-rule-now-states-as-part-of-its-contract.md`.

### Verified and holding (no finding)

- **Placeholder-footer cut** (`fusion-workbench-conventions.md` decision template): `grep -rn 'set when status moves\|placeholder footer\|footer stub'` over `agents/ skills/ rules/ docs/ README* CLAUDE.md templates/ bin/` finds nothing outside this commit's own records. The replacement sentence points at `## Inline State Tracking`, which exists (line 382 at HEAD) and defines the five annotation lines.
- **Headings.** `git show 01964e4 -- rules/ | grep -E '^[-+]#'` is empty: no heading added, removed or respelled. The four in-file anchors the commit newly cites resolve: `### Citation form in the portfolio` (`circle-records.md:324`), `### Citation form in a Circle record's head field` (`:348`), `## The setup marker is written on change, not on every run` (`workbench-tracking.md:57`), `### Who filed it` (`conventions:492`).
- **`commit-lock.md`** "no shipped call site holds the lock that way today": no `acquire`/`release` call in `agents/` or `skills/`; every committer uses `with` (`agents/{coder,ontocoder,bugfixer}.md`, `agents/orchestrator.md:623`, `skills/commit/SKILL.md:117,130`, `skills/cleanup/SKILL.md:141`). `agents/orchestrator.md:618` states the same `cd` and the measured exit 128.
- **`user-facing-output.md`** nine blacklist / six whitelist ids: `chat-voice-en.yaml` and `chat-voice-de.yaml` each carry exactly C01–C06, AI02, AI01, AI05, AI06, AI04, AI07, AI08, L04, AI11.
- **Exit 5** (`conventions` `### Who filed it`): `bin/fusion-identity` header, exit 3 prints `PERSON=` only, 4 prints `CHECKOUT=` only, 5 neither. The third claim opening in `circle-records.md` composes from the one printed line or `none (exit 5)`, consistent with that.
- **`review-contract.md`** per-topic pattern: `hooks/lib/review-coverage.ts:193` `/^\d{6}-\d{4}-([a-z][a-z0-9]*)(?:-|\.md$)/`; a `YYMMDD-NN-` name yields no sender and is "kept and named" (`:204`). No `YYMMDD-NN` or "sequential counter" text remains anywhere in `agents/ skills/ rules/ docs/ README*`.
- **Legacy-store citations** (`conventions` `## fusion-workbench Layout`): `skills/archive/SKILL.md:107`, `skills/log-activity/SKILL.md:82`, `agents/playmaker.md:61` each name both `stashes/` and `.migration-v2-backup/` at HEAD; `skills/setup/SKILL.md:58,65` are the probe paragraph and the probe. These are `skills/`/`agents/` line citations, which the new clause does not cover.
- **`.checkout-id` row** padded: every root entry's `#` sits at column 46.
- **`decision-record-examples.md`** fictional identity matches `circle-records.md:216`.
- **`**Provenance:**`** present once in each of the nine files; `provenance-header-lint` green in the step's run.
- **`reference-resolution-lint` pin** 1350 → 1353: the three paths named in the comment (`bin/fusion-review-coverage` from `review-contract.md`; `bin/fusion-workbench-root` and `bin/fusion-commit-lock` from `commit-lock.md`) are the three new rooted path tokens in the diff. Consistent.
- **Golden fixture** regenerated; `rules-emission-golden` passes 15/15 at HEAD.

## Report-accuracy notes (no record filed; the step report is a history file)

- **Always-on head-room.** Report: 431 → 209 (98 364 emitted). Measured over the five always-on files at `01964e4` with `wc -c`: 98 142 → 98 368, head-room 431 → **205**. The before figure agrees; the after is 4 bytes off. Speculation, not verified: the golden harness measures the emitted stream and may differ from file bytes by a newline or two. Not material to the bound.
- **Role budgets: two pre-existing, one caused by this commit.** `circle-records.md` 22 798 → 24 653 (+1 855); `commit-lock.md` 5 663 → 6 107 (+444; the report says 5 671 before). Playmaker's floor is `circle-records.md` alone: 22 798 was already 1 496 over 21 302 before this commit. Shaper's is `circle-records.md + design-diagrams.md`: 28 083 before, already 1 108 over 26 975. Orchestrator's is `circle-records.md + commit-lock.md`: 28 461 before, under 30 552; **this commit crosses it, by 208**. The report attributes the crossing to `commit-lock.md`'s growth; arithmetically neither file's growth crosses alone (+1 855 → 30 316; +444 → 28 905), only the two together. The budget is report-only and does not fail the suite.

## Cross-cutting observations

The one Medium is the same pattern the Circle has met twice already: a rule is written against a practice in the commit that still performs the practice. Here the writer of the clause was also the writer of the 24 counter-examples, in the same diff, so no gate could have caught it and no reviewer other than one reading the closure notes against the rule would.

## Recommended sequencing

None is a release blocker. `2151` first, because its records-half is a mechanical pass an ontocoder can run and its rules-half is one clause in two rows; `2152` and `2153` when the parallel `agents/` and `bin/` edits have landed, so the fix is measured against HEAD rather than a moving tree.

---
Reconciled: 260824-2159-reconciliation.md (reconciler) — all three findings closed in `5ad6185` (records `260824-2151_c_*`, `260824-2152_c_*`, `260824-2153_c_*`); no `_o_` record remains in this Circle's `issues/` at `5ad6185`.
