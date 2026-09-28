# Analysis: defect survey, group 1 of 3

**Date:** 2026-09-18 11:12
**Type:** Gap
**Status:** Complete
**Requested by:** orchestrator (work item `260918-1048-defekte-selbstaendig-abarbeiten-mit-zweitmeinung.md`)

## Question

Which of the 37 open defect records in group 1 qualify for an autonomous fix package, which are out and why, and which of them the tree at HEAD has already resolved.

## Scope

The 37 records listed in the dispatcher's `g1.txt`, each read in full, each checked against the code, prompt, skill or rule it names. Sibling groups 2 and 3 are not touched.

Tree read: `/Users/k1/Projects/productive/fusion`, branch `main`, HEAD `f14506554f6a7bdbf3f1b1b5500e217b1cd04b90` (2026-09-18 11:03:15 +0200), one commit ahead of `origin/main`, working tree dirty in `fusion-workbench/orchestrator-events.jsonl` only. Every present-tense claim below is dated by that commit. The suite was not run (a baseline run is in progress); two probes ran `hooks/dist/citation-sweep.js` against a scratch tree in the session scratchpad, never against the project.

Verdict vocabulary follows the dispatch: `IN`, `OUT-1` (ontology or structured data), `OUT-2` (consent or ambiguous mandate), `OUT-3` (not fixable in this repository), `OUT-4` (unverifiable), `RESOLVED-AT-HEAD`. The last class is used for two situations and the sentence says which: HEAD carries the fix, or HEAD removed the subject.

## Findings

| # | Record | Verdict | Why |
|---|---|---|---|
| 1 | `260827-1807_*_the-always-on-corpus-and-the-four-profiles-are-over-the-em-dash-ceiling-again-six-days-after-they-reached-it.md` | OUT-1 | Still over at HEAD (`bin/fusion-rules coder` set: 38 marks over 11 811 words, permit 11; `stilwerk/*.yaml`: 14 over 1 530), but half the fix edits the four `.yaml` profiles and the other half rewrites prose across the always-on rule corpus. |
| 2 | `260829-1348_*_circle-records-names-playmaker-as-a-resolver-of-the-head-field-and-the-playmaker-prompt-never-reads-it.md` | RESOLVED-AT-HEAD | Subject removed: `rules/circle-records.md` deleted at `76d833be`, `agents/playmaker.md` deleted at `2a785ba2`; neither file exists to disagree. |
| 3 | `260829-1623_*_the-sweep-starred-both-markers-of-a-shell-illustration-in-a-terminal-circle-record.md` | OUT-3 | The damaged line still reads both markers starred at line 104 of the closed Circle record in `260805-2005-textschicht-gegen-code-nachziehen`, but that is a hand edit to a terminal workbench record; the sweep half is already as the rule wants it (a fenced `mv` line is left alone, probed at HEAD; an inline one is the record's to fence per `rules/fusion-workbench-conventions.md` `## Marker globs`). |
| 4 | `260829-1810_*_the-repair-pass-rewrites-two-unfenced-exhibits-in-a-closed-issue-record-and-no-gate-holds-repairs-at-zero.md` | IN | `bin/fusion-citation-sweep --repair --dry-run` still prints `files=1 repairs=2` on the same two lines at HEAD, and `citation-sweep.test.ts` still pins `rewrites=0` only (line 525), so the fix is a fence around two lines plus one test case. |
| 5 | `260829-1811_*_a-nonexistent-extra-path-under-write-is-a-stack-trace-from-refusal-not-the-usage-line.md` | RESOLVED-AT-HEAD | `hooks/citation-sweep.ts:686` checks each extra path before `refusal()` runs at `:704`; probed at HEAD, `--write --yes /nonexistent/file.md` prints the `does not exist` line and the usage, no stack trace (the test case the record also asks for is absent). |
| 6 | `260829-1812_*_the-sweep-header-states-the-head-field-count-as-42-and-38-in-one-file-and-the-issue-it-cites-says-29.md` | IN | `hooks/citation-sweep.ts:56` says 42 and `:129` says 38, `hooks/lib/citation-scan.ts:127` says 42, none stamped with the tree it counts; the fix is comment text only. |
| 7 | `260829-1812_*_the-sweep-rewrites-a-marker-plus-wildcard-token-into-a-double-wildcard.md` | RESOLVED-AT-HEAD | Probed at HEAD on a scratch tree: a `<stamp>_o_*_<slug>.md` token is left untouched in write mode and a second dry run reports nothing on it, so the double-star result no longer occurs; the collapse rewrite the acceptance names is not implemented, the token is simply not classed. |
| 8 | `260905-0933_*_fusion-alias-is-exported-and-read-by-nothing-while-the-release-note-names-it-a-rendering-site.md` | OUT-2 | Still true (`hooks/hooks.json:24` writes it, no reader outside `hooks-wiring.test.ts`, `docs/upgrading-to-v10-23.md:11` still counts four), but the two ways to close it are removing a shipped export (consent, and the writer sits in a `.json`) or inventing a consumer. |
| 9 | `260905-0933_*_the-new-checkouts-store-is-absent-from-the-two-code-level-enumerations-of-the-artifact-stores.md` | OUT-2 | `STORES` (`hooks/lib/staging-drift.ts:237`) and `TYPE_FOLDERS` (`path-literal-lint.test.ts:41`) still lack `checkouts`, but the record's own design question (a bare `register` rewrites `**Refreshed:**` unconditionally, `bin/fusion-checkout-name:51,514`, so listing the store makes every setup a fault row) is unanswered and decides the fix. |
| 10 | `260905-0933_*_the-presence-join-key-is-free-text-so-two-humans-claiming-one-person-string-merge-into-one-party.md` | IN | `bin/fusion-checkout-name:534-541` still reports alias collisions only and the header's collision section (`:199-213`) still says nothing about `**Person:**`; either branch of the acceptance is a bounded edit. |
| 11 | `260908-0020_*_the-specs-open-for-planner-states-nine-c5-criteria-where-c5-carries-ten.md` | OUT-3 | The wrong figure is in a spec record (`260907-0820_*_spec-bounded-executor-dispatches.md`, lines 737-738 still say "states nine"); nothing shipped carries it. |
| 12 | `260908-0030_*_every-agents-history-file-can-redden-the-citation-gate-and-two-have-in-one-turn.md` | RESOLVED-AT-HEAD | The file class is gone: the history store is closed to writes (`0ec15cb9`, `rules/fusion-workbench-conventions.md` `## Session history`), and a record's citation form is now measured at the write (`hooks/lib/citation-form.ts`, `hooks/tracker.ts:532`). |
| 13 | `260908-1719_*_three-harness-spawning-tests-fail-intermittently-so-the-suite-cannot-answer-the-circles-green-clause.md` | OUT-2 | No cause is established, the failing set has widened to eight files (the 260912 note), the acceptance needs five consecutive full-suite runs on an idle tree, and the concurrency question is its own open record (`260905-2356_*_the-hook-suite-is-not-isolated-from-a-second-copy-of-itself-and-fails-at-forty-percent-under-one.md`); `testTimeout: 30_000` landed at `ea17e354` for the 5 s half. |
| 14 | `260908-1828_*_no-dispatch-of-this-session-reaches-an-executor-with-the-bounded-dispatch-rule-attached-by-setup.md` | RESOLVED-AT-HEAD | Subject removed: `rules/bounded-dispatch.md` and its emission were retired at `1e367195`; it was an installed-copy state, not a tree defect, in any case. |
| 15 | `260908-2112_*_unstamped-counts-over-the-whole-log-while-every-other-dispatch-figure-is-filtered.md` | IN | `hooks/lib/events-query.ts:585-591` still increments `unstamped` above the cutoff and agent filters while `:606` increments it below them; the record names the reorder. |
| 16 | `260908-2113_*_an-unparseable-cutoff-is-reported-to-the-user-as-unstamped-dispatches.md` | IN | Confirmed reachable at HEAD: `Date.parse("2026-13-45T00:00:00Z")` is `NaN`, the guard at `hooks/events-query.ts:555` admits it, and `:449-453` then prints the false sentence. |
| 17 | `260908-2115_*_the-bounded-returns-four-statements-and-nothing-else-leaves-the-verification-result-two-other-passages-read-off-it-nowhere-to-be-written.md` | RESOLVED-AT-HEAD | Subject removed with the bounded return at `1e367195`; `agents/orchestrator.md` carries no bounded-return passage. |
| 18 | `260908-2118_*_the-older-install-fallback-continues-a-bounded-return-with-no-stall-guard-and-that-is-every-consumers-state-until-they-update.md` | RESOLVED-AT-HEAD | Subject removed at `1e367195`; no `Absent (older install): continue` sentence survives in `agents/orchestrator.md`. |
| 19 | `260908-2122_*_the-unit-row-gate-is-satisfied-by-the-rules-intro-sentence-so-deleting-the-whole-unit-table-would-not-fail-it.md` | RESOLVED-AT-HEAD | Subject removed: `hooks/lib/__tests__/bound-agent-set.test.ts` deleted at `1e367195`. |
| 20 | `260907-1234_*_the-spec-review-analysis-ends-with-two-lines-of-tool-markup.md` | OUT-3 | The two closing tags are still the last two lines of the analysis record; a workbench record's text is the whole defect. |
| 21 | `260907-2301_*_the-retention-decisions-cross-reference-cites-the-tier-heading-by-its-pre-edit-wording.md` | OUT-3 | The stale anchor sits in a decision record (its line 8 still names "Terminal Circles + terminal markers" against `skills/archive/SKILL.md:90`), and the second half of the acceptance is a decision on gating. |
| 22 | `260908-0848_*_an-untracked-workbench-answers-new-equals-zero-forever-and-no-state-names-it.md` | IN | `bin/fusion-forum:247-338` still has no state or note for a store in no tree; the fixture in the record is reproducible and the fix is one branch plus one sentence in `skills/news/SKILL.md`. |
| 23 | `260908-0848_*_the-mark-helper-is-guarded-in-new-and-unguarded-in-seen-and-both-branches-are-wrong.md` | IN | `bin/fusion-forum:304-306` still guards without a note and `:358` still calls the sibling bare against a header table (`:76-77`) that says `seen` never exits 1. |
| 24 | `260908-0849_*_the-store-listing-admits-every-path-and-the-reader-parses-a-hex-out-of-whatever-it-gets.md` | IN | `bin/fusion-forum:332` still filters only this checkout's hex and `skills/news/SKILL.md:94` still derives the writer by field position. |
| 25 | `260908-0849_*_the-twenty-line-cap-counts-a-draft-that-is-never-the-file-that-gets-written.md` | IN | `skills/post/SKILL.md` Step 2 still pipes a `$DRAFT` no step assigns, says "twenty lines" beside "at most eight / at most nine", and Step 5 writes without recounting; all three gaps are in one file. |
| 26 | `260908-0850_*_the-read-mark-advances-over-entries-that-failed-to-render.md` | IN | `skills/news/SKILL.md` Step 4 still has no branch for `show` exiting 1 and Step 5 still runs `seen "$HEAD"` unconditionally. |
| 27 | `260908-0850_*_two-selector-names-share-one-step-and-the-coupling-runs-in-only-one-direction.md` | RESOLVED-AT-HEAD | Subject removed: cleanup is commit and push only since `115be68d`, with no `claude-md` or `forum` selector left to couple. |
| 28 | `260908-1612_*_readme-agents-calls-curate-the-only-path-to-claude-md-while-a-lint-forces-a-hand-edit.md` | IN | `README-agents.md:259` still says "The one path to `CLAUDE.md`" while `CLAUDE.md` keeps taking hand edits (`git log -- CLAUDE.md`: release and refactor commits) and a lint still pins a count in it (`derivable-enumerations-lint.test.ts:166`). |
| 29 | `260908-1612_*_the-migrate-carve-outs-authoring-home-has-no-heading-a-citation-can-address.md` | IN | The paragraph still sits under `## The second argument: the Circle in scope` in `rules/workbench-path-resolution.md`, and `skills/migrate/SKILL.md:24` still points at it by opening words. |
| 30 | `260908-1800_*_three-commits-shipped-a-red-citation-sweep-gate-because-an-expected-red-golden-masked-it.md` | OUT-2 | The acceptance asks for a process convention over deferred goldens, with no file or gate the record can name; the widened mechanism (a record written after the last suite run) is met at HEAD by the write-time measurement in `hooks/lib/citation-form.ts`, and the file class that carried it is closed (`## Session history`). |
| 31 | `260908-1853_*_the-reference-count-re-approval-omits-the-file-that-carries-its-whole-movement.md` | OUT-3 | The entry left `reference-resolution-lint.test.ts` at `b3649305` and appears in no rolled log under `shared/analyses/`; what remains is a workbench log to reconstruct, and the drop itself is a different defect from this one. |
| 32 | `260908-1854_*_archives-marker-cut-cites-a-list-of-markerless-kinds-that-does-not-carry-the-forum-entry.md` | IN | `skills/archive/SKILL.md:60` still cites the two State Markers sections and `rules/fusion-workbench-conventions.md:319` still lists no forum entry; the record's own second option (cite `## Filename Patterns`, whose forum row says `no`) is free of rule bytes. |
| 33 | `260908-1855_*_the-source-root-cut-left-two-of-four-bodies-without-the-do-not-improvise-instruction.md` | IN | `skills/next/` is gone (`2a785ba2`) and `skills/cleanup/SKILL.md` no longer reads the source root, but `skills/setup/SKILL.md:147` still stops at "nothing here reads through it", and the record's own recommended home, the exit-2 paragraph of `bin/fusion-source-root:25-27`, still says only "reads NOTHING through it". |
| 34 | `260908-1856_*_the-message-pass-is-missing-from-both-user-facing-enumerations-of-what-cleanup-does.md` | RESOLVED-AT-HEAD | Subject removed: cleanup has no message pass since `115be68d`, and `skills/help/SKILL.md:71-73` describes cleanup as commit and push and names `/fusion:post` separately. |
| 35 | `260909-1020_*_three-source-aspects-unnamed-and-the-proposal-pass-has-no-agent-or-surface.md` | OUT-3 | What closes it is text in a work-item record plus new decision records; its one code-shaped point (no agent owns the proposal pass) is answered at HEAD by the curator's `**Edges:**` survey (`rules/fusion-workbench-conventions.md:226`). |
| 36 | `260913-0818_*_the-new-cross-references-field-has-two-unswept-consumers-and-one-is-a-safety-filter.md` | IN | `skills/archive/SKILL.md:78,143,146` still walks `**Depends-on:**` alone and `agents/orchestrator.md:398` still names that field alone. |
| 37 | `260913-0819_*_ready-is-claimed-to-be-optimistic-by-exactly-one-count-and-a-dangling-entry-inflates-it-too.md` | IN | `hooks/lib/work-graph.ts:77` still says "exactly that count", `hooks/order.ts:38` and `bin/fusion-work-order:32` still say "no unmet prerequisite", and `work-graph.test.ts:104` pins the dangle row as `ready`. |

Counts: IN 16, RESOLVED-AT-HEAD 10, OUT-1 1, OUT-2 4, OUT-3 6, OUT-4 0.

## Candidates

Ranked by our confidence that an autonomous fix lands green, highest first. Every `.ts` edit under `hooks/` carries a `dist` rebuild with it, because `committed-dist.test.ts` compares the committed `dist` with the source.

### 1. #28 `260908-1612_*_readme-agents-calls-curate-the-only-path-to-claude-md-while-a-lint-forces-a-hand-edit.md`

- **Files:** `README-agents.md:259`. The same claim stands in `skills/curate/SKILL.md:8` and `agents/curator.md:46`; the acceptance names the README row only, and the other two sit under the growth bound.
- **Acceptance test:** `grep -n 'one path to' README-agents.md` shows the row qualified (the one path to a *reconciliation* of `CLAUDE.md`) or naming the same-commit lint exception beside it.
- **Effort:** small.
- **Growth risk:** no (README only); yes if the two sibling sites are swept too.
- **Options:** one clear option.

### 2. #6 `260829-1812_*_the-sweep-header-states-the-head-field-count-as-42-and-38-in-one-file-and-the-issue-it-cites-says-29.md`

- **Files:** `hooks/citation-sweep.ts:56,129`, `hooks/lib/citation-scan.ts:127`, plus the `dist` rebuild.
- **Acceptance test:** `grep -n '42\|38 head' hooks/citation-sweep.ts hooks/lib/citation-scan.ts` shows every figure stamped with the tree it counts (committed tree at `e9f2ed0b` versus working tree before `3276b1e1`), or one figure.
- **Effort:** small.
- **Growth risk:** no.
- **Options:** one clear option.

### 3. #23 `260908-0848_*_the-mark-helper-is-guarded-in-new-and-unguarded-in-seen-and-both-branches-are-wrong.md`

- **Files:** `bin/fusion-forum` (`new` at 304-306 gains a `note=`; `seen` at 358 gains the guard and an exit code the header table defines; the header's note vocabulary and exit table at 51-80), `hooks/lib/__tests__/fusion-forum.test.ts`.
- **Acceptance test:** with a stub `bin/` lacking `fusion-cadence-anchor`, `fusion-forum new shared/forum | grep -c '^note='` is 1 and `fusion-forum seen <sha>` exits with a tabled code; with the sibling present the existing suite is unchanged.
- **Effort:** medium.
- **Growth risk:** yes (test file).
- **Options:** one clear option.

### 4. #26 `260908-0850_*_the-read-mark-advances-over-entries-that-failed-to-render.md`

- **Files:** `skills/news/SKILL.md` Step 4 and Step 5.
- **Acceptance test:** Step 4 states what happens when `show` exits 1, and Step 5 either does not advance past a failed entry or says in one sentence that it does and why; readable by grep for the exit branch.
- **Effort:** small.
- **Growth risk:** yes (skill body).
- **Options:** two or more serious options (stop before the mark, or advance and state it); the acceptance admits both.

### 5. #33 `260908-1855_*_the-source-root-cut-left-two-of-four-bodies-without-the-do-not-improvise-instruction.md`

- **Files:** `bin/fusion-source-root:25-27` (the exit-2 paragraph gains "and writes nothing in its place from memory"); optionally `skills/setup/SKILL.md:147` to cite it.
- **Acceptance test:** every body that reads the source root (`grep -l fusion-source-root skills/*/SKILL.md`: archive, check, help, news, setup) carries the instruction or cites the header paragraph that does.
- **Effort:** small.
- **Growth risk:** no for the header; yes if `skills/setup/SKILL.md` is edited.
- **Options:** one clear option (the record's own recommendation).

### 6. #15 `260908-2112_*_unstamped-counts-over-the-whole-log-while-every-other-dispatch-figure-is-filtered.md`

- **Files:** `hooks/lib/events-query.ts:585-591` (agent filter first, then parse, then cutoff), `hooks/events-query.ts:449-453` and the `bin/fusion-events` header sentence, `hooks/lib/__tests__/fusion-events.test.ts` (the case at 367 keeps its expectation; one new case for an out-of-scope malformed start), plus `dist`.
- **Acceptance test:** a `task_start` with an unreadable `ts` for an agent outside the measured set does not raise `unstamped`; the existing case at `fusion-events.test.ts:367` still reads `unstamped: 2`.
- **Effort:** medium.
- **Growth risk:** yes (test file).
- **Options:** one clear option.

### 7. #24 `260908-0849_*_the-store-listing-admits-every-path-and-the-reader-parses-a-hex-out-of-whatever-it-gets.md`

- **Files:** `bin/fusion-forum:332-338` (admit only basenames matching the forum pattern, report the rest under a key that is not `entry=`), `skills/news/SKILL.md:94-100` (validate before `resolve`), `hooks/lib/__tests__/fusion-forum.test.ts`.
- **Acceptance test:** the record's fixture (two conforming entries, one the reader's own, plus `README.md`) lists one `entry=`; the new test case pins it.
- **Effort:** medium.
- **Growth risk:** yes (skill body and test).
- **Options:** one clear option.

### 8. #32 `260908-1854_*_archives-marker-cut-cites-a-list-of-markerless-kinds-that-does-not-carry-the-forum-entry.md`

- **Files:** `skills/archive/SKILL.md:60` (cite `rules/fusion-workbench-conventions.md` `## Filename Patterns` for the markerless half), and the `BASELINE` pin in `hooks/lib/__tests__/reference-resolution-lint.test.ts:464` if the anchor count moves.
- **Acceptance test:** the `## Marker vocabulary` section cites a heading that enumerates every markerless kind including the forum entry; `reference-resolution-lint.test.ts` green at the re-approved pin.
- **Effort:** small to medium (the pin re-approval is the second file).
- **Growth risk:** yes (skill body, test pin).
- **Options:** one clear option (the record rules out adding to the conventions line and recommends the citation).

### 9. #16 `260908-2113_*_an-unparseable-cutoff-is-reported-to-the-user-as-unstamped-dispatches.md`

- **Files:** `hooks/events-query.ts:555` (a calendar-date check beside the shape check) or `hooks/lib/events-query.ts:568,585` (test `cutoffMs` once and return its own field), `hooks/lib/__tests__/fusion-events.test.ts`, plus `dist`.
- **Acceptance test:** `bin/fusion-events dispatches --since 2026-13-45` either exits 1 naming the value or prints a line naming the cutoff as unparseable, and never prints the "carry no readable ts" sentence.
- **Effort:** small.
- **Growth risk:** yes (test file).
- **Options:** two or more serious options; the CLI guard is the smaller and the record accepts it.

### 10. #36 `260913-0818_*_the-new-cross-references-field-has-two-unswept-consumers-and-one-is-a-safety-filter.md`

- **Files:** `skills/archive/SKILL.md:78,143,146` (prose and the `sed` walk read both fields), `agents/orchestrator.md:398` (names the second field, paid for inside the file: zero head-room).
- **Acceptance test:** a scratch workbench with a live item whose head carries `**Cross-references:** <target>.md` and a `done` item `<target>`: the Step 3 walk, run standalone, lists `<target>` as excluded with the citing item; `surface-growth-bound.test.ts` green.
- **Effort:** medium.
- **Growth risk:** yes (both files; `agents/*.md` at zero head-room forces a cut elsewhere in the same file).
- **Options:** one clear option.

### 11. #29 `260908-1612_*_the-migrate-carve-outs-authoring-home-has-no-heading-a-citation-can-address.md`

- **Files:** `rules/workbench-path-resolution.md` (a heading over the "One consumer names the layout literally" paragraph), `skills/migrate/SKILL.md:24` (the anchor form), the `BASELINE` pin in `reference-resolution-lint.test.ts:464` (anchors move by one).
- **Acceptance test:** `reference-resolution-lint.test.ts` resolves the new anchor and is green at the re-approved pin; `provenance-header-lint.test.ts` unchanged.
- **Effort:** medium.
- **Growth risk:** yes (rule file, skill body, test pin).
- **Options:** one clear option.

### 12. #22 `260908-0848_*_an-untracked-workbench-answers-new-equals-zero-forever-and-no-state-names-it.md`

- **Files:** `bin/fusion-forum` (after `:323`, detect a store path absent from the fetched tree and either add a `state=` value or a `note=`), `skills/news/SKILL.md` Step 3 (what the user does about it), `hooks/lib/__tests__/fusion-forum.test.ts`.
- **Acceptance test:** the record's untracked fixture prints a state or note naming the condition or exits non-zero; the tracked fixture still prints `new=2` with no new note.
- **Effort:** medium.
- **Growth risk:** yes (skill body, test).
- **Options:** two or more serious options (`state=` with a non-zero exit, or `note=` on `state=ok`); the header at `:32` favours a state, since "nothing to read against" is what every non-ok value names.

### 13. #4 `260829-1810_*_the-repair-pass-rewrites-two-unfenced-exhibits-in-a-closed-issue-record-and-no-gate-holds-repairs-at-zero.md`

- **Files:** the closed record `260829-1346_*_the-committed-sweep-rewrote-29-date-head-fields-into-filenames-and-left-181-chained-tails-in-the-tree.md` (fence lines 24 and 26), `hooks/lib/__tests__/citation-sweep.test.ts` (a `--repair --dry-run` case beside the `rewrites=0` one at 506-527).
- **Acceptance test:** `bin/fusion-citation-sweep --repair --dry-run` prints `files=0 repairs=0`; the new case pins it.
- **Effort:** medium.
- **Growth risk:** yes (test file).
- **Options:** one clear option. Lower confidence because the fix edits a terminal workbench record, which the conventions otherwise keep untouched; the edit is a fence, not a state change, and the record's own acceptance asks for it.

### 14. #10 `260905-0933_*_the-presence-join-key-is-free-text-so-two-humans-claiming-one-person-string-merge-into-one-party.md`

- **Files:** `bin/fusion-checkout-name` (a second loop at 534-541 reporting `person-collision=<hex>` when `**Person:**` matches and `**Git identity:**` does not, and the header section at 199-213), `hooks/lib/__tests__/fusion-checkout-name.test.ts`.
- **Acceptance test:** `register` against a fixture roster holding the same `**Person:**` under another git identity prints the collision line; against the same identity it does not.
- **Effort:** medium.
- **Growth risk:** yes (test file).
- **Options:** two or more serious options (report, or document as accepted); reporting matches the alias precedent the header already argues.

### 15. #37 `260913-0819_*_ready-is-claimed-to-be-optimistic-by-exactly-one-count-and-a-dangling-entry-inflates-it-too.md`

- **Files:** `hooks/lib/work-graph.ts:77` and `hooks/order.ts:38,49,115`, `bin/fusion-work-order:32` (the stated error term), `hooks/lib/__tests__/work-graph.test.ts:104,127` (the dangle row is pinned `ready` today), plus `dist`.
- **Acceptance test:** the record's three-part test; the smaller shape is a second caveat line firing whenever `unresolved-edges=` is above zero, with the comments corrected, and the terminal-target row unchanged.
- **Effort:** medium.
- **Growth risk:** yes (test file).
- **Options:** two or more serious options (a third readiness value, or a caveat); the existing test pins the current row on purpose, so the caveat is the option that changes no pinned figure.

### 16. #25 `260908-0849_*_the-twenty-line-cap-counts-a-draft-that-is-never-the-file-that-gets-written.md`

- **Files:** `skills/post/SKILL.md` Steps 2 and 5.
- **Acceptance test:** the body names, executably, what is counted and when; "at most twenty" replaces "twenty lines in the file"; Step 5 writes the counted bytes or recounts the written file and removes it when over the cap.
- **Effort:** small.
- **Growth risk:** yes (skill body).
- **Options:** two or more serious options (count a scratch file before the gate, or write-then-verify in Step 5). Lowest confidence of the sixteen: shell state does not survive between Bash calls, so a `$DRAFT` assigned in Step 2 cannot be read in Step 5, and the write-then-verify shape is the one that needs no scratch location.

## Reading notes

Ten of the 37 records outlived their subject rather than being fixed: the bounded-dispatch family (#14, #17, #18, #19) went with `1e367195`, the Circle and playmaker records (#2) with `76d833be` and `2a785ba2`, the cleanup selectors and message pass (#27, #34) with `115be68d`, and the history-file class (#12) with the store closure at `0ec15cb9`. A reconciliation pass could close those ten on the commits named without opening any code. Two clusters of IN records share one file each and are cheaper as one package: #22, #23, #24 all edit `bin/fusion-forum` and its test, with #26 next door in `skills/news/SKILL.md`; #15 and #16 both edit the same loop in `hooks/lib/events-query.ts` and its wrapper, and the reorder for #15 is where the `cutoffMs` test for #16 naturally moves. Three IN records (#29, #32, and any fix that adds or removes a heading citation) touch the `BASELINE` pin in `reference-resolution-lint.test.ts`, whose re-approval entry is a measured attribution and not a number bump, so they should land in separate commits rather than one. Two side observations outside the group's mandate: `forum` is absent from `STORES` in `hooks/lib/staging-drift.ts:237` exactly as `checkouts` is (#9's sibling gap), and `file(1)` reports `hooks/lib/work-graph.ts` as `data`, which makes plain `grep` over it silent; `grep -a` reads it.

## Sources

- The 37 records under `fusion-workbench/circles/*/issues/` named in the table, read in full.
- `hooks/citation-sweep.ts`, `hooks/lib/citation-scan.ts`, `hooks/lib/citation-form.ts`, `hooks/lib/__tests__/citation-sweep.test.ts`, `hooks/lib/__tests__/fenced-code-exemption.test.ts`
- `hooks/lib/events-query.ts:560-640`, `hooks/events-query.ts:440-460,543-562`, `hooks/lib/__tests__/fusion-events.test.ts:360-380`
- `hooks/lib/work-graph.ts:40-100`, `hooks/order.ts`, `bin/fusion-work-order`, `hooks/lib/__tests__/work-graph.test.ts:97-145`
- `hooks/lib/staging-drift.ts:237-250`, `hooks/lib/__tests__/path-literal-lint.test.ts:38-60`, `hooks/hooks.json:24`, `hooks/lib/__tests__/hooks-wiring.test.ts:151-178`
- `hooks/lib/__tests__/reference-resolution-lint.test.ts:440-515`, `hooks/lib/__tests__/derivable-enumerations-lint.test.ts:52-90,160-170`, `hooks/lib/__tests__/committed-dist.test.ts`, `hooks/vitest.config.mjs`
- `bin/fusion-forum`, `bin/fusion-checkout-name:96-215,454-545`, `bin/fusion-source-root:20-30`, `bin/fusion-prose-metric` (run over the coder emission and `stilwerk/*.yaml`)
- `skills/news/SKILL.md`, `skills/post/SKILL.md:23-82`, `skills/cleanup/SKILL.md`, `skills/help/SKILL.md:71-73`, `skills/archive/SKILL.md:58-62,78-146`, `skills/migrate/SKILL.md:24`, `skills/setup/SKILL.md:142-147`
- `agents/orchestrator.md:392,398`, `README-agents.md:243-259`, `docs/upgrading-to-v10-23.md:11,33`, `rules/fusion-workbench-conventions.md`, `rules/workbench-path-resolution.md`
- `git log` for `1e367195`, `76d833be`, `2a785ba2`, `115be68d`, `0ec15cb9`, `ea17e354`, `b3649305`, `22d6f839`, `6357ebfc`
- Two scratch probes of `hooks/dist/citation-sweep.js` in the session scratchpad (records #5 and #7).

## Open Questions

- [ ] Whether the ten RESOLVED-AT-HEAD records are closed by a reconciliation pass in this work item or left to `/fusion:reconcile`.
- [ ] #7: the acceptance's collapse rewrite (`_<letter>_*_` to `_*_`) is not implemented; the token is left as written and unreported. Whether that residual is accepted or refiled.
- [ ] #31: the 2026-09-08 "steps 10 and 11" re-approval entry appears in no rolled log; if the header's "roll, never drop" rule was meant to cover it, that is a new defect.
