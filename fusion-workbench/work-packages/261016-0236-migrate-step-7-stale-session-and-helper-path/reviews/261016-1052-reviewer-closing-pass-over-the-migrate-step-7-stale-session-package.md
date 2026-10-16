# Closing review: migrate Step 7, stale session and helper path (13.1.4, before the tag)

**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Reviewed-range:** `46bc80f8..9bd8db62`
**Not-opened:** none
**Domain:** code
**Work-item:** 261016-0236-migrate-step-7-stale-session-and-helper-path
**Cross-references:** `261016-0246-plan-migrate-step-7-a-way-out-of-a-stale-session-and-the-helper-path.md`, `261016-0246-how-does-a-migration-session-whose-record-the-tree-no-longer-carries-get-out-of-the-way.md`, `261016-1052-a-rollback-fence-left-in-json-state-survives-a-git-reset-and-set-aside-then-leads-to-a-run-that-refuses-for-good.md`, `261016-1052-the-stale-record-refusal-drops-the-session-flag-and-set-aside-names-resume-for-a-rolled-back-record.md`

## Summary

Verdict: **accept**. Nothing blocks the tag. The `stale()` predicate gives no false positive at any cut point of `drive()` or `rollback()` that I traced. The committed `hooks/dist` is the compile of the source. The full suite is green apart from the two known `workbench-citation-lint` findings.

One Medium finding: a sibling cell the predicate routes to `ROUTE=stale`, where the promised re-run then refuses for good. I reproduced it. It was already a dead end at 13.1.3, so it is not a regression. One Low finding covers two refusal messages. One release step is still owed before the push: the marketplace entry reads 13.1.3.

## Totals

| Severity | Count | Findings |
|---|---|---|
| Critical | 0 | |
| High | 0 | |
| Medium | 1 | M1 |
| Low | 3 | L1, L2, L3 |

## What was verified

- **The predicate at every cut point** (`hooks/migrate.ts:548-572` `stale()`). I traced it against the order in which `run()`, `drive()` and `rollback()` write session and tree. The codec order comes from `codec/README.md` `## The kernel and the journal`: the intent, then the files, then `ops/<id>.json`, then the intent is removed. The chunk 0 removal order is in `codec/src/migration.ts` `chunkZero` (index last).
  - Before the plan: `plan: null` over a legacy tree reads current.
  - Between the plan landing and its session write: `plan: null` again, and the tree is still legacy (plan does not activate), so current. `resume` re-sends under the same id.
  - Mid-apply, after verify and before the final write: the plan index stands, so current.
  - Rollback begun, before chunk 0: the index stands, so current.
  - Inside chunk 0, with the index gone and the answer only in the intent: `journal/<id>/` exists, so current. Test "record=current over a rollback cut inside chunk 0's intent".
  - After chunk 0 and before `rolled_back`: chunk 0's answer is stored, so current. Test (c).
  - `refusedFirstChunk` and `--end-fence` set `s.rollback = null` on a JSON tree with the index standing, so current.
  - `endLeftFence` runs before `current()` (`hooks/migrate.ts:489`), so a fence a refused rollback left can still be ended.
  - `restore-backup` does not consult the predicate, so it still works over a stale session through `--session`.
- **No other code removes the plan files.** `archive/migrations` and `MIGRATIONS_DIR` appear only in `codec/src/migration.ts`, not in `hooks/lib/record-archive.ts` or the archive skill. A done JSON-controlled tree therefore loses its plan index only by hand or through git, and the codec itself refuses rollback over a changed index (`plan-file-changed`). So `record=stale` there locks out nothing the codec would have allowed.
- **dist matches source.** `npm test` ran in a scratch clone at `9bd8db62`. The sync step left `git status` clean, and `committed-dist.test.ts` is 4/4 green once the gitignored lockfile is present. The suite had 1 174 passing tests and 4 failures. Three were a toolchain-pin artefact of the scratch clone, which had no `hooks/package-lock.json`; they were green on rerun. The fourth is the known `workbench-citation-lint` pair in package `260928-1338`.
- **Wrapper.** `bin/fusion-migrate` usage `sed -n '3,15p'` now ends at the `--session` lines (the plan said `3,14p`; the wider range is the better one). `set-aside` is in the `case` list and in `TAKES` (`hooks/migrate.ts:660`), and exit 5's text names it.
- **Skill.** The `awk` prepends one `record=="stale"` rule, and nothing else in the block moved. Every Step 7 command spells the helper path, and case (h) asserts the general property.
- **Event log.** 53 rows were added in range and none removed, and all 53 parse as JSON. The working-tree change to that file is outside the range.
- **Version surfaces.** `plugin.json`, `install.sh` and `README.md` read 13.1.4, and `grep 13.1.3` finds nothing in them. The help topic follows `README-agents.md` `## Releasing` step 0: the patch joins its predecessor's paragraph, which is relabelled.

## Findings

### M1. A rollback fence that survives a reset makes ROUTE=stale promise a re-run that cannot work (Medium)

Issue: `261016-1052-a-rollback-fence-left-in-json-state-survives-a-git-reset-and-set-aside-then-leads-to-a-run-that-refuses-for-good.md`.

Reproduced in scratch:

1. Migrate and commit.
2. Edit a narrative, then `rollback`. It exits 8 and leaves its fence standing.
3. `git reset --hard HEAD~1`. `.json-state/maintenance.json` survives. `status` shows `state=legacy`, `fence=<id>`, `record=stale`.
4. `set-aside --consent` exits 0.
5. `run` exits 5 because a fence stands.

After that, `rollback` and `rollback --end-fence` exit 5 under either session: no record, stale, or "not under JSON control". The `ROUTE=stale` line (`skills/migrate/SKILL.md` Step 7) says "a re-run of `/fusion:migrate` continues", and here it does not.

13.1.3 ended in the same dead end with a less honest route, so 13.1.4 does not make this cell worse. **It does not block the tag.** The fix needs a ruling on how a fence over a legacy store is ended.

### L1. Two refusal messages name the wrong next command (Low)

Issue: `261016-1052-the-stale-record-refusal-drops-the-session-flag-and-set-aside-names-resume-for-a-rolled-back-record.md`.

- `current()` (`hooks/migrate.ts:579`) names `set-aside --consent` without the `--session` that was passed. I reproduced this.
- `setAside()` (`hooks/migrate.ts:586`) tells a rolled-back record that `resume` or `rollback` acts on it. For that record, `run` is the command that acts.

Step 7 is unaffected because it always uses the default session.

### L2. ROUTE=stale says "re-run" where the decision says "the survey block again" (Low, no issue)

The decision's option 1 says that on a yes Step 7 "runs `set-aside --consent` and then the survey block again". The plan's step 4 says the same. The shipped line (`skills/migrate/SKILL.md` Step 7) tells the agent to say that a re-run of `/fusion:migrate` continues.

The outcome is the same: test (i) routes to `survey` after the move. The user now runs one extra command. The decision's `Implemented:` line does not mention the difference. Record it there, or leave it as is. Filed no issue.

### L3. The `stale()` doc comment over-states the unreadable case (Low, no issue)

`hooks/migrate.ts:557-558` says "an unreadable tree … [is] never stale". The code still returns stale for `state=unsupported` when the plan index is missing or changed (`:567-569`). The plan's own wording is the narrower one: "never makes a record stale by its state alone". The code is right and the comment is wider than the code. This is a one-word fix and needs no issue.

## Cross-cutting observations

- **The session is keyed by machine and path; `.json-state/` is keyed by nothing git sees.** M1 and the fixed issue share one root: two pieces of state survive a `git reset` that the tree's history does not carry. The package fixed the session half. The `.json-state/` half (a fence, a pending intent) is still open. The "known limit" this pass was told about, an uncommitted migration reset reading `record=current`, belongs to the same family. All three are cases where git and the codec's own state disagree about what happened.
- **The help paragraph** now carries three per-release sentences under one label. It reads in order (13.1.4, 13.1.3, 13.1.2), and each sentence opens with its version. It is still readable. A fourth patch release would push it past what a reader scans; step 0's join rule has no upper bound. Observation only.

## Recommended sequencing

1. **Before the push:** plan step 8, the marketplace entry. `<marketplace>/.claude-plugin/marketplace.json` still reads `"version": "13.1.3"`, and the last commit there is `a7bebba chore(fusion): 13.1.3`. This is the plan's own step, not a defect in the range.
2. Tag v13.1.4. No finding blocks it.
3. After the release: M1, with a decision on ending a legacy-store fence. Then L1. L2 and L3 can ride with either.
