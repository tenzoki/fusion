# Closing pass over the migrate Step 7 package (13.1.3)

**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Reviewed-range:** `7a4cd8a7..e35a315c`
**Not-opened:** `fusion-workbench/orchestrator-events.jsonl`
**Review domain:** code
**Work-item:** `261015-1549-migrate-step-7-recognises-json-control-without-session.md`
**Verdict:** accept. The package meets its brief and plan. Two follow-up issues are filed. Neither blocks tag `v13.1.3`.

## Summary

The new `**Survey.**` block routes every `status` output shape correctly, and the issue's acceptance holds: on a JSON-controlled workbench with no local session, it says the workbench is on JSON control and stops. The fold-in of the sibling issue is complete except for two prose instructions. One untested cell, which the consultant flagged, ends in a loop with no exit. I reproduced it end to end. It is a helper gap that predates this package, and the package's case (e) mislabels it.

## Totals

Critical 0 · High 0 · Medium 1 · Low 1

## What was verified

- **The awk against `hooks/migrate.ts` `status()`.** With no session, `status` prints `run=none` and no `done=` or `rolled_back=`. `v["rolled_back"]` is then empty, so rule 1 does not fire and the route falls to `state=`. The values compared (`state`, `done`, `rolled_back`) are single tokens. `session=` is never compared, so `-F=` truncating a path is harmless. In awk, `?:` binds looser than `&&`, so the expression parses as the plan's table. `state=unsupported` comes back on exit 0 (store.ts returns `ok:true`), so case (g) gives `ROUTE=stop`. Exits 1, 3 (a corrupt `state.json` throws in `readState`), 4 and 8 (an `inspect` refusal) each print `EXIT=n`. `S="$(…)"; E=$?` carries the helper's exit status.
- **Tests.** `store-name-migration`, `surface-growth-bound` and `reference-resolution-lint` are green (87 tests). Full `npm test`: 1174 passed, 1 failed. That one is `workbench-citation-lint`, with exactly the two pre-existing findings in package `260928-1338`.
- **Bounds.** `skills/migrate/SKILL.md` is 28 530 bytes against the plan's cap of 28 568. The golden matches. The `BASELINE` move (2049 → 2059) has its attribution entry.
- **Step 2's `M` → `J` rename** is needed for case (h)'s `"$M"` assertion, and it changes no behaviour.
- **The help topic** implements decision `261015-1559-does-the-help-update-topic-at-13-1-3-…` option 2. `README-agents.md` `## Releasing` step 0 is reworded to match. The upgrade note's added sentence is accurate.
- **Version surfaces.** `plugin.json`, `install.sh` and `README.md` read 13.1.3, and no stale 13.1.2 pin remains. **The marketplace entry still reads `13.1.2`** (`claude-plugins/.claude-plugin/marketplace.json`). The plan is still `in_progress` at step 7, so the release is not finished until that entry is bumped. This is an open release step, not a finding.
- **Records.** Both `261015-1310-migrate-step-7-*` issues are `closed`/`fixed` and carry `Resolved:` lines. The decision is `answered`.

## Findings

### M1: a stale done session over a legacy tree loops in Interrupted (Medium)

The consultant asked about this cell: `done=true`, `rolled_back=false`, `state=legacy`, no rollback in flight. **It routes to `interrupted`, and from there nothing gets out.** I ran it on a real tree: I migrated a copy of `codec/fixtures/legacy-v12`, committed it, and ran `git reset --hard HEAD~1`. `.json-state/` is git-ignored and survives. The shipped block then printed `ROUTE=interrupted`. After that:

- `resume` printed `migrated=… result=no-op`, which is false about the tree (`hooks/migrate.ts` `resumeRun`).
- `rollback` exited 8 every time with `conflict/plan-file-changed`. It wrote nothing, and its stderr names no way out, though `**Interrupted.**` expects one.
- `run` no-ops (`run`, `previous?.done && !previous.rolled_back`).

The only exit is removing the session directory or passing `--session`, and nothing documents either. A plausible way in is discarding an uncommitted migration with git.

- **Is the route right?** Partly. `interrupted` is right for the case the plan meant, a rollback interrupted after the manifest left, where `rollback` resumes. `status` cannot tell the two apart, because it does not print `state.json`'s `rollback` field.
- **Case (e) mislabels the cell.** Its fixture writes `plan: null, rollback: null`, which is neither a real interrupted rollback nor the git-reset state. So the test passes without pinning the case it names.
- **Severity reasoning.** Before 13.1.3 the same cell said "already on JSON control" and stopped, which was false. No data is at risk, since rollback refuses before writing. The cell is reached only by a git revert on the same machine and the same path. That makes it Medium, not a blocker.
- **Issue:** `261015-2223-migrate-step-7-routes-a-stale-done-session-over-a-legacy-tree-to-interrupted-where-neither-option-gets-out.md`.
- **Fix direction:** `status` prints whether a rollback is in flight, and a separate route names the way out.

An untested sibling cell has the same root: `state=json-control`, `done=false`, `rolled_back=false`, where an abandoned local attempt was overtaken by another checkout's migrated tree. It also routes to `interrupted`, and `resume` would send chunks that the codec should refuse. I reasoned this from the code and did not run it. It is noted in the same issue's scope rather than filed separately.

### L1: two run instructions in Step 7 still lack the helper path (Low)

`skills/migrate/SKILL.md` `## Step 7` still says "run `repair --list` again" after a repair, and "(`rollback` again or `rollback --end-fence`)" in `**Interrupted.**`. Case (h) checks only for `"$M"`.

**Issue:** `261015-2223-migrate-step-7-still-tells-the-agent-to-run-two-subcommands-without-the-helper-path.md`.

## Cross-cutting observations

The session in `$HOME/.fusion-migrate/<hash>` is keyed by machine and path, not by tree. Whenever the tree changes under it (git, a pull, another checkout), the session's `done` and in-flight flags stop describing the tree. This package moved the format question onto the tree, which is right. The in-flight question still trusts the session alone. Issue `261010-1045-a-migration-backup-that-fails-to-verify-once-blocks-every-later-run-and-no-message-names-the-way-out.md` is the same pattern from the backup side: session state blocks every later run, and no message names the exit.

## Recommended sequencing

- **Tag `v13.1.3`: not blocked by any finding.** Before pushing, bump the marketplace entry (plan step 7) and run `bin/fusion-review-coverage --since v13.1.2`.
- **M1:** next migrate package. Decide first whether `status` may gain a field.
- **L1:** fold into whichever package next edits Step 7.
