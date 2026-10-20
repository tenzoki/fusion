# Closing review: a legacy workbench holding no record migrates to JSON control

**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Reviewed-range:** `9409d998..35fb41b3`
**Not-opened:** `codec/dist/fusion-record.js`, `codec/fixtures/protocol-session-migration/71-survey.request.json`, `codec/fixtures/protocol-session-migration/71-survey.response.json`, `codec/fixtures/protocol-session-migration/72-plan.request.json`, `codec/fixtures/protocol-session-migration/72-plan.response.json`, `codec/fixtures/protocol-session-migration/73-apply.request.json`, `codec/fixtures/protocol-session-migration/73-apply.response.json`, `codec/fixtures/protocol-session-migration/74-inspect.request.json`, `codec/fixtures/protocol-session-migration/74-inspect.response.json`, `codec/fixtures/protocol-session-migration/75-verify.request.json`, `codec/fixtures/protocol-session-migration/75-verify.response.json`, `codec/fixtures/protocol-session-migration/76-maintenance.request.json`, `codec/fixtures/protocol-session-migration/76-maintenance.response.json`, `codec/fixtures/protocol-session-migration/77-inspect.request.json`, `codec/fixtures/protocol-session-migration/77-inspect.response.json`, `codec/fixtures/protocol-session-migration/78-list.request.json`, `codec/fixtures/protocol-session-migration/78-list.response.json`, `codec/fixtures/protocol-session-migration/79-maintenance.request.json`, `codec/fixtures/protocol-session-migration/79-maintenance.response.json`, `codec/fixtures/protocol-session-migration/80-rollback.request.json`, `codec/fixtures/protocol-session-migration/80-rollback.response.json`, `codec/fixtures/protocol-session-migration/81-rollback.request.json`, `codec/fixtures/protocol-session-migration/81-rollback.response.json`, `codec/fixtures/protocol-session-migration/82-maintenance.request.json`, `codec/fixtures/protocol-session-migration/82-maintenance.response.json`, `codec/fixtures/protocol-session-migration/83-inspect.request.json`, `codec/fixtures/protocol-session-migration/83-inspect.response.json`, `codec/fixtures/invalid/migration/index-chunk-part-writes-negative.json`, `fusion-workbench/orchestrator-events.jsonl`, `261019-0913-plan-migrate-an-empty-legacy-workbench.record.json`

**Domain:** code. **Work package:** `261019-0906-migrate-an-empty-legacy-workbench.md`. **Plan:** `261019-0913-plan-migrate-an-empty-legacy-workbench.md`.

The dispatch excluded the generated bundle and the recorded exchanges from line-by-line reading. Instead, the bundle's digest was checked (`sha256:dfab3f21…`, as the hand-over states), and both files' content was checked by running the suites. The plan record's step states were read with `bin/fusion-record`-equivalent JSON reads, not as a diff.

## Summary

The codec change is correct and minimal. `cut` emits chunk 1 with `writes: []` only when no chunk was emitted. A run with pairs is unchanged. No later phase depends on a non-zero write count. Tests cover the record-less run at the codec, recorded-session and host levels, and all of them pass. Two defects are in the shipped text. The Step 7 notice and the 13.2.0 version floor use a predicate a terminal-only workbench fails (Medium). The help update topic tells pre-13 installs no migration is needed (Low). One codec README sentence is wrong for the new case (Low). Verdict: **revise**.

## Totals

| Critical | High | Medium | Low |
|---|---|---|---|
| 0 | 0 | 1 | 2 |

## Findings by theme

### Codec correctness: no finding

- `codec/src/migration.ts` `cut`: the guard `if (current.length === 0 && out.length > 0) return;` fires only on the final `close()`. The loop's own `close()` is gated by `current.length > 0`, so an empty chunk can never come before a real one. With at least one pair, the output equals the earlier output.
- `migrationPlan`: the `order.length === 0` refusal is gone, and every other check runs in its old order.
- Nothing else depends on writes being non-empty. `readIndex` still refuses an index with no chunk part. `landedChunks`, `exemptSet`, `chunkZero` and the rollback removal loops iterate over `chunk.writes` and are fine with zero items. The kernel commits an empty intent: `migration.test.ts` shows `revisions: {}` and an unchanged tree. Verify's eight checks pass over zero items, and the receipt's `checks` `minItems: 1` still holds. The host's `Math.floor(writes / 48) + 1` schedules exactly one apply id and two rollback ids.
- The schema delta is exactly the two bounds plus three description clauses. The id bounds of `$defs/schedule` and the proposal's `operation_ids` are unchanged, which is what a one-chunk run needs.

### Test adequacy: adequate, one gap closed by measurement

- `codec/src/__tests__/migration.test.ts`, new describe block: freeze, apply 1 and fence, verify, activation, the second-run no-op, rollback after activation, rollback before activation, and a full abort.
- Base E, exchanges 71 to 83, recorded byte for byte. Exchanges 01 to 70 are unchanged (`git diff --name-status --diff-filter=MDR` names only the README).
- `hooks/lib/__tests__/migrate.test.ts`: end to end through `bin/fusion-migrate`, `bin/fusion-paths` exit 3 then 0, rollback, and both ways out of the record a refused plan left.
- Re-run in this pass: `codec` vitest over `migration.test.ts`, `round-trip-cli-migration.test.ts` and `fixtures.test.ts`, 604 passed. `hooks` vitest over `migrate.test.ts`, `legacy-import.test.ts` and `surface-growth-bound.test.ts`, 56 passed. Neither run changed the tree.
- Gap: no end-to-end case covers a workbench whose only records are terminal. Measured by hand instead (finding M1). The codec behaves correctly there. Also measured by hand, untested: `run`, then `rollback`, then `run` on a record-less tree. The host takes a fresh id (`…-v12-2`) and reaches `json-control`.

### Shipped text against behaviour

**M1 (Medium).** `skills/migrate/SKILL.md` `## Step 7 — Repair, then migrate to JSON control` gives the record-less notice and the "(13.2.0 when every `count=` was 0)" floor only when all six counts are 0. The zero-write plan is cut whenever `records` is empty. That holds when the four cut rows are 0, whatever `plain-terminal` and `empty-container` say (`hooks/lib/legacy-import.ts` `composeProposal`, `counts`). Measured on a scratch tree holding one closed issue: `count=plain-terminal 1`, then `proposal=… 0 records`, `1 chunks`, `chunks/1.json` `"writes": []`, `result=json-control`. That migration's rollback is just as unreachable for a 13.1.x checkout (`codec/fixtures/prior/REQUESTS.md` `### The version boundary, measured`), and Step 7 never says so. Two wording points come with this. The floor names "before it writes again", but what an older checkout loses is the rollback and the no-op re-run, not reading. And the help paragraph's "holds no record" does not describe a terminal-only workbench. Issue: `261020-0644-migrate-step-7-keys-the-record-less-notice-and-the-13-2-0-floor-on-every-count-being-0-which-a-terminal-only-workbench-misses.md`.

**L1 (Low).** `codec/README.md` `## \`migration\``, the "No directory is removed" bullet, says a complete rollback leaves "exactly" `chunks/`, `parts/` and `originals/` under `archive/migrations/<id>/`. A record-less run leaves no `originals/`. `migrate.test.ts` asserts exactly that set without `originals`, and a scratch run reproduced it. Issue: `261020-0644-codec-readme-names-an-originals-tree-a-record-less-rollback-never-leaves.md`.

The empty directories themselves are documented, intended behaviour: that same bullet, plus limit (1) under "Two limits". Git does not track them. `docs/upgrading-to-v13.md` `**Undo.**` does not mention them. Inference: no reader acts on them. A re-run takes a new migration id and succeeds, as measured above. No issue filed for their presence.

**L2 (Low).** `skills/help/SKILL.md` `### 4. Update`: `ec76d4fd` dropped the 12.2.3 paragraph, as the topic's three-paragraph rule requires. The new top paragraph, "Coming from 13.1.12 or earlier: 13.2.0 needs no migration; `fusion --update` is the whole update", has no lower bound, so it also matches a v12 install, for which it is false. Issue: `261020-0644-help-update-topic-tells-a-pre-13-install-that-fusion-update-is-the-whole-update.md`.

### Release surfaces: coherent inside this repository

`.claude-plugin/plugin.json`, `install.sh`'s header pin, `README.md`'s pin and the help topic all name 13.2.0. The marketplace entry and the tag are the release act and outside the range. `git tag -l` ends at `v13.1.12`. The tag's precondition under `261019-0913-may-a-codec-revision-after-13-1-0-be-tagged-before-prior-re-qualifies-its-bundle.md` (option 2) is Prior's acceptance of 71. `REQUESTS.md` records that acceptance at Prior `8f59121`, quoted. The reference-resolution pin re-approval (2061 to 2058) and the growth-golden regeneration move no baseline and no head-room. `7429df6e` (selecting the Node gate by its output) and `954cc258` (two issue narratives respelt) are sound repairs that unblocked red suites.

## Cross-cutting observations

- The same predicate drift shows up on two surfaces, and for one reason. The text describes the case as "no record" or "every count 0", while the mechanism keys on "no pair in the cut". The brief said "zero record pairs", the codec README says "a proposal naming no record", and the user-facing text says something narrower. M1's fix should give both the skill and the help one predicate.
- Package closure, not a code defect: the plan's `## Where this work stops` names the user's run on the Prior repository. `/Users/kai/Projects/productive/F09-Prior/fusion-workbench/` still has no `workbench.json` and no `archive/migrations/`, read 261020. The three decisions in this package are `answered`. The run-shape decision is realised at `a9ac4fe4`, and its `implemented` transition is for the dispatcher to send.

## Recommended sequencing

1. M1 before the 13.2.0 tag. It changes what a user is told before a migration whose rollback older checkouts cannot perform.
2. L1 and L2 can ride with M1 or the next release. Neither changes behaviour.
3. Then the user's run on the Prior repository, which closes the package's last stop condition.
