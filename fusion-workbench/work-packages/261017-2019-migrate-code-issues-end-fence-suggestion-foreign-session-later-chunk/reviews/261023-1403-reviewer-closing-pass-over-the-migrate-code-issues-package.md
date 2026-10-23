# Closing review: `/fusion:migrate` code fixes, release 13.3.2

**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Reviewed-range:** `613e91bd..6b92d484`
**Not-opened:** none
**Review domain:** code
**Work-item:** `261017-2019-migrate-code-issues-end-fence-suggestion-foreign-session-later-chunk`
**Verdict:** accept

`613e91bd` is `v13.3.1`. The range holds a567d299, 29a96ed1, 2e5f4277, 0521dc83 and 6b92d484, plus the workbench-only 3ac7e25e and 30fdcccd. Both files the previous pass left unopened are opened here: `hooks/dist/migrate.js` and `codec/dist/fusion-record.js`.

## Summary

The three fixes do what the plan says. All six new cases were red on the pre-fix `hooks/migrate.ts`; this pass re-ran them, not only read the commit messages. They are green on the release commit. The four checks the plan asks of this review all hold. Both deviations hold up. `hooks/dist/migrate.js` is byte-identical to a fresh compile of the committed `hooks/migrate.ts`. One Low finding is filed. It is older than this range and is not a release blocker.

## Totals

- Critical: 0
- High: 0
- Medium: 0
- Low: 1 (pre-existing, filed)

## What was run

- **Dist provenance.** `git archive 6b92d484` into a scratch tree, then `tsc -p hooks/tsconfig.json --outDir <scratch>`. `migrate.js` and `migrate.d.ts` are byte-identical to `hooks/dist/`, and no other compiled file differs. The worktree's `hooks/dist` and `hooks/migrate.ts` equal the commit. For the codec, `node codec/scripts/build.mjs` in the same scratch tree reports `dist/fusion-record.js: unchanged`. `cmp` against the committed bundle and against the worktree is identical. `codec/` has no change in the range.
- **Red before the fix.** A second scratch tree at `6b92d484`, with `hooks/migrate.ts` swapped for `git show v13.3.1:hooks/migrate.ts`, ran `node scripts/run-tests.mjs lib/__tests__/migrate.test.ts`: **6 failed, 21 passed**. The six failures are exactly the six new cases, each for the reason its issue states:
  - later chunk: stderr matched `/--end-fence|stay under JSON control|…/`
  - foreign rolled-back: `run` exited 0, not 5
  - (a) moved own idle fence: `set-aside` and `run` named `rollback --end-fence --session … ends it`
  - (b) sibling current and (c) sibling with an intent pending: "ends it once no rollback chunk of that record landed", then `rollback --end-fence` refused
  - (d) cell D: `run` named `set-aside --consent`
- **Green after.** The release tree ran `migrate.test.ts` and `store-name-migration.test.ts`: 61 passed, 0 failed. The full suite, `reference-resolution-lint` and the growth bound were not re-run by this pass. Their state rests on 6b92d484's message, and the golden diff (help 16 591 to 16 843, migrate 29 752 to 29 643, tests 595 to 727 lines) is consistent with it.

## The four plan checks

### 1. Every end-fence and set-aside suggestion goes through `endFenceEnds` or a nothing-stands test: holds

The sites in `hooks/migrate.ts` at `6b92d484` that name `rollback --end-fence` or `set-aside --consent` as a way out:

- `endFenceWay` text: reached from `fenceWay` (class 5, guarded by `endFenceEnds(...) !== null`), from `current` (`fence = endFenceEnds(...)`) and from `setAside` (same).
- `current`, the "The way out:" tail: reached only when `!(fence === null && standing(i))`, so either nothing stands or `endFenceEnds` admitted the end-fence step first. `standing` is the same test `setAside`'s rename guard uses, so the suggestion and the guard agree.
- `preconditions` sibling branch: `ends !== null` where `ends = endFenceEnds(wb, sib, i)`.
- `endLeftFence`, the write-lock retry text and the `fence-ended=` note naming `set-aside --consent`: both inside `if (idle !== null)` with `idle = endFenceEnds(...)`. After the unlink nothing stands (`endFenceEnds` required no intent), and `stale` still reads the record as stale once `s.rollback` is cleared: `endFenceEnds` held only where `planHolds` was false.
- `fenceWay` classes 1, 3 and 4 mention the command only negatively ("does not end", "refuses").

`grep -n "idleFence(" hooks/migrate.ts` shows its definition and the one call in `endFenceEnds`, as step 6 asks.

**One site lies outside this predicate on purpose.** `refusedFirstChunk` names `bin/fusion-migrate rollback --end-fence` for the JSON-control branch of `endLeftFence` (the last `throw` before `endRollbackFence`), not the legacy branch `endFenceEnds` covers. With the `sent === 0` gate, that branch's conditions hold where the text is reached, under the default session. Under a non-default session they do not (Low finding below).

### 2. `endLeftFence`'s unlink and `setAside`'s rename unchanged in substance: holds

- `endLeftFence` at v13.3.1: `idle = i.state === "legacy" && stale(...) !== null ? idleFence(...) : null`. Now `endFenceEnds`, which adds `s.workbench === wb`. The only caller is `rollback`, which calls `recorded` first, and `recorded` refuses `s.workbench !== wb`. So the added conjunct is always true there. The write-lock check, the re-read and the unlink are textually unchanged.
- `setAside`: the guard sequence (`shows !== null && standing(i)` refuses; `shows === null` refuses; consent; target exists) is unchanged. Only the refusal texts inside the first branch moved.

### 3. `sent` cannot be non-zero for the first chunk: holds

`sent++` runs only after `send(...)` returns. A throw from the first `send` leaves `sent === 0`. Chunks skipped by `continue` (already stored) do not count. The begin `maintenance` request is sent before the `try`, so it cannot reach the `catch`. The new comment's claim, that a rollback chunk stored before the call implies a legacy tree, is the plan's premise. It is not re-verified against the codec here (inference).

### 4. Each test reproduced its cell before the fix: holds, measured

See "What was run". This pass confirms all six cells by execution, not only from the commit messages.

## The two deviations

### (a) `fenceWay` tests "reads as current" before "chunks landed": accepted

The order is now: intent pending, `shows === null`, `landedFence`, `s.workbench !== wb`, `endFenceEnds`.

- **Disjoint.** First match wins, so the implemented partition is disjoint by construction.
- **Complete.** Past the first four tests, `ownFence` holds (the entry check). No intent stands. `shows` is non-null. `landedFence` is null, so `landed` is empty. And `s.workbench === wb`. That is every conjunct of `endFenceEnds`, provided `shows` equals `stale(wb, s, i.state)` for the same `i`. All three callers compute it so: `current`, `setAside`, and `preconditions` with `sib`. Class 5 therefore always holds where it is reached.
- **Why the reorder is needed.** `landedThenReset` takes `shows: string`. Under the plan's order, a record that reads current with landed chunks would reach it with `null`. `current` and `setAside` never call `fenceWay` with `shows === null`. `preconditions` can, and its own `reset` was already gated on `shows !== null`. The reorder makes `fenceWay` agree with that gate.
- **Observation, not a finding.** The doc comment calls the five classes "disjoint" and names each by its own predicate. Taken alone, those predicates overlap (an intent can stand under a current record). They are disjoint only as a first-match list, and the comment's listing order matches the code. Completeness also rests on an unenforced caller contract, `shows === stale(...)`. Computing `stale` inside `fenceWay` would remove that contract. Not filed: the fallthrough below makes a broken contract loud rather than silent.

### (b) The unreachable fallthrough stops with exit 3: accepted

`throw new Stop(EXIT.fault, "… falls in none of the five fence classes; this is a defect of the helper")`. `bin/fusion-migrate`'s exit table defines 3 as "install incomplete … or an internal fault", so the code fits. Returning null would have sent the caller to the generic foreign-fence text and hidden the broken contract. Under (a) it is unreachable.

### `store-name-migration.test.ts` case (h)

The old pin (`toContain("the same helper")`) guarded the exit-8 sentence that 0aca3a0e made name the helper. Step 7 cut that sentence, so its object is gone. The new pin (`'"$FUSION_PLUGIN_ROOT/bin/fusion-migrate" rollback'`) matches the line's "2. undo" clause, which predates this range. It holds for the right reason: the line spells the helper. But it would not catch a bare `` `rollback` `` added back to the line later. The test's other assertion (`run \`<sub>\`` nowhere in Step 7) covers only the "run `…`" form. Accepted. A stronger pin would assert that no backticked bare subcommand remains in the line. Not filed.

## Findings

### L1 (Low, pre-existing): two messages spell helper commands without `--session`

- `refusedFirstChunk` writes `` `bin/fusion-migrate rollback` `` and `` `bin/fusion-migrate rollback --end-fence` `` literally.
- `send`'s unknown-outcome text writes `` `bin/fusion-migrate resume` `` literally.

Every other site goes through `command(wb, session, sub)`, which adds `--session` for a non-default session. Under `--session <dir>`, both texts point at the default session, where `recorded` refuses or another record answers. This is plan rule B1, missed at two sites outside the fence predicate. Neither text changed in this range.

Filed: `261023-1403-migrate-unknown-outcome-and-refused-first-chunk-messages-spell-commands-without-the-session-flag.md`.

## Cross-cutting observations

- The range turns three copies of the end-fence condition into one predicate with one reader. The residue L1 has the same shape at a different joint: a message spelling a command by hand where a helper exists for it.
- `current`'s rolled-back opening ("… as rolled back, kept for X, not this workbench") and `fenceWay` class 4 ("… records X, not this workbench …") can both appear in one message for a moved tree whose own fence stands. The path is then stated twice. Cosmetic, correct, not filed.

## Plan "Where this work stops": items this pass can see

- `README-hooks.md`, `docs/upgrading-to-v13.md` and `docs/upgrading-to-v12.md` are byte-identical to `30fdcccd`.
- `skills/migrate/SKILL.md` is 29 643 bytes, under 29 752.
- The help paragraph reads "Coming from 13.0.0 to 13.3.1" and "13.3.0 to 13.3.2 need no migration". The section holds three "Coming from 13.0.0" paragraphs.
- `plugin.json`, both pin examples and the marketplace working clone (`"version": "13.3.2"`, uncommitted there) read 13.3.2.
- The release commit states the `bin/fusion-review-coverage --since v13.3.1` result.
- The nine issues carry `Resolved:` lines and are `closed` with disposition `fixed`. `261017-2028-migrate-repair-apply-and-restore-backup-use-a-session-recorded-for-another-workbench-path.md` stays `open`, as planned.
- The plan record's step 10 moved to `done` in the worktree, uncommitted.
- Still open, as the plan intends: the tag, the pushes and the cache pull.

## Recommended sequencing

Nothing blocks the tag `v13.3.2`. L1 is cleanup for a later migrate package. It needs a test and a two-site change, and touches no exit code.
