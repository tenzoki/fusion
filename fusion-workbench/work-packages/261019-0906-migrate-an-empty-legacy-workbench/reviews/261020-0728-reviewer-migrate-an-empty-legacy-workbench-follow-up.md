# Follow-up closing review: a legacy workbench holding no record migrates to JSON control

**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Reviewed-range:** `35fb41b3..9ca7f473`
**Not-opened:** none

**Domain:** code. **Work package:** `261019-0906-migrate-an-empty-legacy-workbench.md`. **Plan:** `261019-0913-plan-migrate-an-empty-legacy-workbench.md`. **Prior review:** `261020-0644-reviewer-migrate-an-empty-legacy-workbench.md` (range `9409d998..35fb41b3`, verdict revise).

The range is `d12ef097` (the first review, its three issues, two decisions moved to implemented) and `9ca7f473` (the fixes). The first review's `**Not-opened:**` list is also covered here. Each generated file was opened by a method instead of being read line by line:

- `codec/dist/fusion-record.js`: digest `sha256:dfab3f21…`, unchanged in this range. `codec/src/__tests__/committed-bundle.test.ts` passed: it rebuilds a `git archive HEAD codec` extract with the pinned esbuild and compares bytes.
- The 26 exchanges `codec/fixtures/protocol-session-migration/71-*` to `83-*`: `round-trip-cli-migration.test.ts` passed with `UPDATE_PROTOCOL_SESSION_MIGRATION` unset, and `git status` showed no change afterwards. So they reproduce byte for byte.
- `codec/fixtures/invalid/migration/index-chunk-part-writes-negative.json`: validated with ajv against `migration-plan.schema.json`. As stored it fails `/parts/0/writes must be >= 0`. With `writes` set to 0 it is valid. So `writes: -1` is its only defect, which is what its manifest note says. `fixtures.test.ts` passed.
- `fusion-workbench/orchestrator-events.jsonl`: the 20 lines this range adds were read. They are the commits, the review task, the four creates and the eight transitions, matching the records.
- `261019-0913-plan-migrate-an-empty-legacy-workbench.record.json`: read. State `in_progress`, steps 1 to 8 `done`, `acceptance` bound. That fits a package whose last stop condition, the user's run on the Prior repository, is still open.

## Summary

The three fixes are correct. The four-cut-rows condition is exactly "no record to convert". The help ranges route every install. The new floor sentence holds against the measured boundary, including a write by the 13.0.0 to 13.1.12 bundle, which this pass measured. One Low defect remains in the same paragraph family: the report keys its 13.2.0 clause on a `proposal=` line that a resumed migration never prints, and resuming is the route the help topic names for the record-less case. Verdict: **revise**.

## Totals

| Critical | High | Medium | Low |
|---|---|---|---|
| 0 | 0 | 0 | 1 |

## Findings by theme

### The predicate: exact

`hooks/lib/legacy-import.ts` `composeProposal`. Every entry pushed into `records` carries a `row` of type `CutRow`, which is one of `package-live`, `package-terminal`, `record-live` or `record-closure`. `counts` starts those four at 0 and runs `for (const r of records) counts[r.row]++`. `plain-terminal` and `empty-container` are computed apart from `records`. So the sum of the four cut rows equals `records.length`, and "all four 0" holds exactly when `records` is empty. `hooks/migrate.ts` `run` derives the write count from `p.records` alone (`2 + (narrative_after === null ? 0 : 1)` per record). An empty `records` therefore means zero writes and one chunk. The skill's two observables, the four survey rows and `proposal=` `0 records`, are the same quantity.

Checked as well: can a repair between the survey and the question move a file into or out of the cut? The repairable classes are `answered-without-answer-line`, `mark-outside-numbered-step`, `unknown-step-mark`, `duplicate-step-number`, `unresolvable-active-document`, `active-document-role-unclear` and `circle-deferred`, plus the filed-by repairs (`hooks/lib/legacy-repair.ts` `REPAIRS`). Every one edits a file that is already in the cut, or a control field, and none changes which row a file lands in. `unknown-state`, the one class that could make a plain file live, is blocking and unrepairable, and Step 7 stops while it remains. Inference from the code, not run: the survey counts shown before the repairs still hold at the question.

Measured again in a scratch root holding one deferred issue: `survey` gives the four rows at 0 and `plain-terminal 1`, and `run` gives `proposal=… 0 records`, `1 chunks` and `result=json-control`.

### The new sentences against the helper and the boundary

- **"13.0.0 or later before it writes again."** `REQUESTS.md`'s second `### The version boundary, measured` measured reads, `validate`, survey, plan, apply and rollback with `fb170361…`, but no ordinary write. This pass added one. The blob at `v13.0.0` and at `v13.1.12` is the same `fb170361…`. Over the activated terminal-only scratch tree, that bundle answered `inspect` `json-control`, and `create` of an issue `ok: true` with the pair written. A later `validate` from both bundles answered `checked: 1`, `valid: true`. So 13.0.0 is a sufficient floor for writing, and the sentence is true.
- **"13.2.0 to roll back or re-run a migration that converts no record."** This matches the measured refusals: rollback is refused `conflict/plan-file-changed`, and the fresh-id plan is refused `migration-incomplete/receipt-unverified`. No statement in the range contradicts `REQUESTS.md`. `docs/upgrading-to-v13.md` ("must be on v13 before it writes again") is consistent with it.
- **The notice "terminal records stay as they are, nothing is rewritten".** True for the cut. Plain files get no pair and no narrative rewrite. Steps 5 and 6, the store renames and the citation sweep, come before Step 7 and are not part of the claim.
- **`codec/README.md`, "`originals/` where a chunk kept an original (never in a record-less run)".** Every proposed record carries `backup: originals(c.narrative)`, so a run with at least one pair keeps an original and one with none does not. `migrate.test.ts` asserts the record-less directory set. True.
- **The two Implemented: lines in `d12ef097`.** Both cite `a9ac4fe4`. No commit in `9409d998..9ca7f473` touches `hooks/migrate.ts`, `hooks/dist` or `bin/fusion-migrate`, so the host route is realised by the codec change alone, as the route decision's line says. Accurate.

### Help topic routing

`skills/help/SKILL.md` `### 4. Update` now has three install-from paragraphs: "13.0.0 to 13.1.12", "13.0.0 to 13.1.11" and "13.0.0 or 13.1.0", then "Older than that". The routes:

- 12.2.3 matches none of the three and reaches "Older than that", which sends it to the `upgrading-to` notes. `docs/upgrading-to-v13.md` is there.
- 13.0.0 to 13.1.12 match the first paragraph, which is true for each of them.

The overlap between the labels is cumulative by design, and the reader takes the first match. The three-paragraph cap holds. The prior L2 is closed.

### L1 (Low): the report's 13.2.0 clause keys on a line a resumed migration never prints

`skills/migrate/SKILL.md` Step 7, **Report**: "(13.2.0 to roll back or re-run a migration whose `proposal=` line said `0 records`)". Three points make this a defect:

- `hooks/migrate.ts` `run` builds `proposal=` inside the same array as `...drive(...)`, so a run that throws prints none. `resumeRun` returns `drive(...)` only, and `status` carries no record count. Measured: an old-style refused `run` (exit 8, no stdout) followed by `resume` printed `planned=`, `applied=`, `verified=`, `setup=`, `migrated=` and `result=json-control`, and no `proposal=` line.
- The help paragraph sends exactly that case, a record-less workbench a pre-13.2.0 run refused, through `ROUTE=interrupted` to `resume`. The **Interrupted** paragraph never reaches the question that carries the unconditional "a migration that converts no record" clause.
- **Run** does not tell the agent to show `proposal=`, and **Report** says "repeat the sentence" while wording it differently from the question's copy.

On that route the user hears a condition they cannot check. Per `REQUESTS.md`, a missed floor costs a refusal and moves no byte, hence Low. Fix direction: repeat the question's clause word for word, which is general and true on every route. Optionally add a record count to `bin/fusion-migrate status` if the report should say which case applies. Issue: `261020-0728-migrate-step-7-report-keys-the-13-2-0-floor-on-a-proposal-line-that-a-resumed-migration-never-prints.md`.

### Suites re-run in this pass

- `codec`: vitest over `committed-bundle.test.ts`, `round-trip-cli-migration.test.ts`, `fixtures.test.ts` and `migration.test.ts`, 608 passed.
- `hooks`: vitest over `migrate.test.ts`, `legacy-import.test.ts`, `surface-growth-bound.test.ts`, `reference-resolution-lint.test.ts`, `workbench-citation-lint.test.ts` and `citation-sweep.test.ts`, 136 passed.
- `git status --porcelain` afterwards named only `fusion-workbench/orchestrator-events.jsonl`, which was modified before the pass. The golden's +167 bytes are the two skill deltas (3 + 164), and no baseline moved.

## Cross-cutting observations

- The first review's cross-cutting point, one predicate for the skill and the help, is resolved for the question and the help. The remaining drift is inside the skill: its two copies of "the sentence" name the case differently, and only one of them is observable on every route. That is the same kind of drift the first review named, now between two paragraphs of one step.
- Package closure is unchanged. The plan's last stop condition, the user's run on the Prior repository, is still open. The tag decision stays `answered` until the tag. `git tag` ends at `v13.1.12`.

## Recommended sequencing

1. L1 is a one-clause text edit. It can ride with the 13.2.0 tag or the next release, because no route moves a byte without it.
2. Then the user's run on the Prior repository, and the tag.
