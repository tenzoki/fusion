# Pre-tag review — the fifth `**Status:**` value and the `**Active spec/plan:**` field

**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Reviewed-range:** `2319ce1f..9a323667`
**Not-opened:** `hooks/dist/lib/work-graph.d.ts`, `hooks/dist/lib/work-graph.js`, `hooks/dist/order.d.ts`, `hooks/dist/order.js`, `hooks/lib/__tests__/fixtures/rules-emission.golden`, `hooks/lib/__tests__/fixtures/surface-growth.golden`, `hooks/lib/__tests__/config.test.ts`, `hooks/lib/__tests__/work-graph.test.ts`, `hooks/lib/__tests__/reference-resolution-lint.test.ts`, `docs/fusion-intro.md`, `fusion-workbench/orchestrator-events.jsonl`
**Review domain:** code

**What "not opened" means here, file by file.** The four `hooks/dist/` files were not opened at all and are covered only by `committed-dist.test.ts`, which passed. The two goldens are generated and were read as diffs. The three test files and `docs/fusion-intro.md` were read as unified-diff hunks with context and never as whole files. The event log was grepped for commit rows and never read. Nothing in that list is untouched by a gate; every item in it is a place a later pass could still find something.

## Summary

The behaviour change is correct and I verified it by running it rather than by reading the diff: against a scratch store holding one item of each status, `bin/fusion-work-order` prints the paused item as a node with readiness `paused`, its dependent `blocked`, and no `unresolved=` line. `cd hooks && npm test` is green at HEAD — 55 files, 931 tests. Both settling commits carry `fusion-workbench/orchestrator-events.jsonl` alone and neither produced a `commit` row of its own; the only occurrence of `9a323667` in the log is a `session_start` row's `git_head_at_start`. `## Terminal states are history` is byte-identical to its state at `d92beb1a`, which I diffed rather than assumed.

What the pass found is all on the prose side, and all of one kind: the change was executed against a list of sites the plan enumerated, and the list was short. Seven findings, none of them a broken behaviour.

## Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 1 |
| Medium | 3 |
| Low | 3 |

## Findings by theme

### Theme 1 — the status partition, where a reader is told two things

**High — `rules/fusion-workbench-conventions.md:216` contradicts itself on which transitions are legal.** The bolded enumeration permits `paused` → `dropped`; the next sentence forbids any edge between `paused` and a terminal value in either direction, and `dropped` is terminal by the same document's table twelve lines above. The reason clause names only `done`, and the plan's own state diagram draws `paused --> dropped` while calling `paused --> done` deliberately absent — so the intent is recoverable and the shipped sentence does not carry it. This file is always-on and charged to all eleven dispatch paths. Filed: `260915-2139_*_the-paused-transition-sentence-names-dropped-as-an-exit-and-then-forbids-every-terminal-exit.md`.

**Medium — `bin/fusion-work-order`'s header still describes the pre-`paused` report.** The same three pieces of prose exist in `hooks/order.ts` and in the bash wrapper. `hooks/order.ts:21-44` was corrected on all three; `bin/fusion-work-order:21-31` was not touched, and `CLAUDE.md` names each helper's own header as that helper's authoritative documentation. `:31` states the node set as `open` or `claimed`, `:27-29` claims `ready=` and `roots=` differ only at a cycle, and `:21-22` shows no `paused` row. Worse, the closure note on `260910-2011_*_the-deferred-state-has-no-value-in-the-work-items-status-set.md` says the file was changed — `git diff v11.2.0..HEAD --stat` lists nothing under `bin/`. `rules/critical-stance.md` §3. Filed: `260915-2140_*_the-work-order-wrappers-header-still-says-the-node-set-is-open-or-claimed-and-a-closure-note-says-it-moved.md`.

**Medium — three shipped surfaces still state the set as four.** `skills/memo/SKILL.md:112` ("its four statuses", fifteen lines above a line the same commit edited), `CLAUDE.md:35` (the Layout row, spelling the four values, while `CLAUDE.md:65` was moved to five in the same commit), and `README.md:166` (spelling the four values; the plan's step 6 never reached `README.md`). The plan's risk row asserted "three sites state it as a numeral" and named them; `skills/memo/SKILL.md` is a fourth numeral site and the two enumeration sites fell outside the criterion. `rules/critical-stance.md` §5 — the count was asserted, not derived. Filed: `260915-2141_*_three-shipped-surfaces-still-state-the-status-set-as-four-and-the-plan-counted-only-the-numerals.md`.

**Where the partition holds, verified file by file.** `bin/fusion-claimed-item:208` tests `**Status:** claimed` exactly and is correct under the partition, unchanged and needing no change. `agents/orchestrator.md:426` (closure step 1) tests the terminal pair exactly and is correct. `skills/archive/SKILL.md:138` selects `done|dropped` for archive class, correct; `:146`'s dependency-target scan gained `paused`, which was the one behavioural edit in that file and is the right one — a terminal prerequisite of a paused item is now withheld. `hooks/lib/work-graph.ts:280` stays an allowlist, so a garbage status is still outside the node set. `hooks/lib/citation-corpus.ts` `ITEM_RECORD_RE` reads no status and is unaffected. `skills/migrate/SKILL.md:84`'s marker table maps `_t_` to `claimed` or `open` and correctly gains nothing.

### Theme 2 — `**Active spec/plan:**`, written at one end and read at the other

**Medium — the write rule keys on the claimed item; the `**Item:**` parameter writes into an item nobody claimed.** `agents/orchestrator.md:217` sets the field on "the claimed item". `agents/shaper.md:51` and `agents/planner.md:51` define `**Item:**` as how a dispatcher sends the agent into an item this checkout has *not* claimed, and `README-agents.md:57-58` lists both as live. So the artifact's destination and the field's destination are resolved from two different inputs and disagree on exactly the path the parameter exists for: the plan lands in item X's container and X's record never names it, and a later checkout closing X falls back to a session-held path that does not survive a session. The defect the field was added to fix returns on that path. Filed: `260915-2142_*_the-active-spec-plan-write-rule-keys-on-the-claimed-item-while-the-item-parameter-sends-a-plan-elsewhere.md`.

**Low — the field is append-only with no rule for a superseded plan.** `agents/orchestrator.md:217` appends "beside any value already there" and nothing maintains the field afterwards, by design. `rules/fusion-workbench-conventions.md:228` and the closure step's disambiguation both assume at most a spec and one plan. A **Modify** at the plan gate, which `agents/orchestrator.md` `**Plan**` step 5 offers, produces a second plan on one item and the read side has no tie-break. Filed: `260915-2143_*_the-active-spec-plan-field-is-append-only-and-nothing-says-what-a-second-plan-does-to-it.md`.

**Where the trace closes.** The read end is sound: closure step 3 resolves the field first, falls back to the session-held path only when absent, and is required to say which of the two it used and which of three absences it met — a real improvement over the previous "nothing on disk records the pairing". `skills/memo/SKILL.md:127` declares the field absent at filing. `skills/migrate/SKILL.md:146` carries it into the converted head under the same name, which is what keeps a pre-v11 `## Directive` pointer resolving; the head-field order in that template matches the conventions' template.

### Theme 3 — the migration, and what the byte budget cost

**Medium/Low boundary — the migration answer is right and the `_d_` case is stated where a user meets it.** `skills/migrate/SKILL.md:88`, the `DEFERRED>0` clause of the confirmation prompt at `:105`, and the report's `_d_` line at `:195` all now say the same thing: a `_d_` container is terminal, converts to nothing, and work wanted back is a new item set `paused` citing it. That is the answer the plan named and it costs `## Terminal states are history` nothing, which I verified by diff. No finding.

**Low — a compressed sentence inverted its own claim.** Funding the `**Active spec/plan:**` carry inside the 312-byte `skills/` margin rewrote the two-records-in-one-container bullet from "The conventions admit **no such shape** and no consumer handles it" to "…which the conventions admit and no consumer handles". The refusal still stands in the same sentence, so nothing executes wrongly; the stated authority for it now reads as its opposite. Filed: `260915-2144_*_a-compressed-sentence-in-migrate-now-says-the-conventions-admit-the-shape-they-forbid.md`.

**Low — the v11 upgrade note is live in one commit of this range and frozen in the other.** `950a606e` rewrote `docs/upgrading-to-v11.md:54-70` and `:153-158` to describe the migration as it behaves today; the plan for `55be2491` declined to touch the file because "it describes correctly what v11 did". The file now states current migration behaviour beside a four-value status set, and its reader is a project arriving from v10.26 at 11.3.0. Filed: `260915-2145_*_the-v11-upgrade-note-is-maintained-as-live-in-one-commit-of-this-range-and-frozen-in-the-other.md`.

## Cross-cutting observations

**One pattern produced five of the seven findings.** Every one of them is a site that states the status set or the report's shape in prose, duplicated somewhere the change did not look: `bin/fusion-work-order` duplicating `hooks/order.ts`, `CLAUDE.md:35` duplicating `CLAUDE.md:65`, `README.md:166` duplicating the conventions, `skills/memo/SKILL.md:112` duplicating the same. The change moved every site the plan enumerated and no site it did not, which is what an enumerated list buys and what it costs. The generalisable observation, stated as an observation and not filed: nothing in the tree measures whether two files state one fact the same way, and this project's own text is dense with that shape by design — the conventions are the single authoring home, and every pointer at them restates a little of what they say.

**The bounds were paid honestly and inside themselves.** No baseline map and no head-room constant moved, which I checked by diff. The hook-test surface stood at one line and ended at one line: twelve lines of fixture funded by twelve lines of import reformatting in `config.test.ts` and one line of re-approval-log roll in `reference-resolution-lint.test.ts`, the latter rolled into `260915-2006-reference-resolution-pin-re-approval-log-the-two-2026-09-09-entries.md` rather than dropped, per that header's own ROLL, NEVER DROP. `skills/` ended net negative. Neither cut touched a gate's reasoning; the `skills/migrate/SKILL.md` prose cuts did remove four rationale clauses, including the bullet explaining why `.active-circle` is deliberately not re-pointed, and one of them inverted its sentence (filed above).

**Two record-keeping deviations, noted rather than filed.** The decision record `260915-2028_*_what-shape-does-the-work-items-fifth-status-value-take.md` was created directly at `_a_`; `rules/fusion-workbench-conventions.md` `## Record filing` says "always `_o_` on creation, for issues and decisions alike". The transition happened inside one session and the `Answered:` line names the ruler, so nothing is lost, and it cannot be un-skipped now. Separately, `260915-2028_*_a-fifth-status-value-for-work-items.md` carries `**Status:** Draft` in its head with steps 1 through 7 marked `[DONE]`; step 8 is the release ceremony, so `_p_` on the filename is correct and only the head field is stale.

## Recommended sequencing

**Before the tag, because each is a sentence and two of them are in files the release step opens anyway:**

1. `260915-2139_*_…forbids-every-terminal-exit.md` — the conventions' transition sentence. It is the definitional text of the thing being released and it is charged to every dispatch.
2. `260915-2141_*_…the-plan-counted-only-the-numerals.md` — the three cardinality sites. `README.md` and `CLAUDE.md` are both measured surfaces; `README.md` is edited at release for the `FUSION_REF` pin, so the second edit is free of a separate pass.
3. `260915-2140_*_…a-closure-note-says-it-moved.md` — `bin/` is on no growth bound, so the header correction costs nothing anybody has to fund.

**After the tag:** the two `**Active spec/plan:**` findings and the two documentation ones. None of them changes what the release does; all four are about paths a user or a later session reaches rather than about this release's own behaviour.

## Would I tag this range

**Yes, after the three above.** The behaviour is correct and I ran it; the suite is green; the bounds were paid inside themselves; the two settling commits are clean. Nothing found is a release blocker in the sense of a broken flow. The one High finding is a contradiction in the sentence that defines the value this release exists to add, and fixing it before the tag rather than after is the difference between shipping a rule and shipping a rule that argues with itself.

**One precondition from the plan is still open and is the release step's, not mine.** `260915-2028_*_a-fifth-status-value-for-work-items.md` `## Where this work stops` requires that step 8 has run: the version bump, the update topic in `skills/help/SKILL.md` gaining this release's paragraph and dropping the oldest, and the marketplace entry. The commit message for `55be2491` says so in its last line. Both files are outside this pass's bounds by dispatch.

**Coverage.** `bin/fusion-review-coverage --since v11.2.0` reported `uncovered=4`, `carried=none`, `carried-from=260915-1847-reviewer-pre-tag-pass-over-the-log-only-commit-row-skip.md` — so nothing was folded in from the last pass, which had `not-opened=none`. This file's range tiles all four commits.

**Citation check.** `bin/fusion-citation-sweep --dry-run` was run over the tree with all eight new records in place: `files=0 rewrites=0`, and no residual line names any file written by this pass. `workbench-citation-lint.test.ts` and `declared-citation-paths.test.ts` pass with them present.

---
**Reconciliation 260921-2230 (reconciler, domain `code`, HEAD `cb8776f3`) — the seven defects this pass filed are all closed.** `260915-2139_*_the-paused-transition-sentence-names-dropped-as-an-exit-and-then-forbids-every-terminal-exit.md`, `260915-2140_*_the-work-order-wrappers-header-still-says-the-node-set-is-open-or-claimed-and-a-closure-note-says-it-moved.md` and `260915-2141_*_three-shipped-surfaces-still-state-the-status-set-as-four-and-the-plan-counted-only-the-numerals.md` closed at `d2fdd1b6` (the 11.3.0 release); `260915-2142_*_the-active-spec-plan-write-rule-keys-on-the-claimed-item-while-the-item-parameter-sends-a-plan-elsewhere.md` at `8b4be728`; `260915-2143_*_the-active-spec-plan-field-is-append-only-and-nothing-says-what-a-second-plan-does-to-it.md` at `205e3e35`; `260915-2144_*_a-compressed-sentence-in-migrate-now-says-the-conventions-admit-the-shape-they-forbid.md` at `65ac72a5`; `260915-2145_*_the-v11-upgrade-note-is-maintained-as-live-in-one-commit-of-this-range-and-frozen-in-the-other.md` at `a8b5bcd2` (the v11 upgrade note declared live). The plan it reviewed, `260915-2028_*_a-fifth-status-value-for-work-items.md`, carries `_c_`. Findings themselves are not rewritten.
