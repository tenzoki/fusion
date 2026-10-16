A rollback fence left in .json-state survives a git reset, and set-aside then leads to a run that refuses for good
---
After a refused first rollback chunk leaves its fence standing, a `git reset` back to Markdown keeps `.json-state/maintenance.json` (`.json-state/` ignores itself). Step 7 routes the stale record to `ROUTE=stale` and promises that a re-run continues. It does not: `run` refuses on the fence, and no subcommand can end a fence on a legacy store.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Cross-references:** `261016-1052-reviewer-closing-pass-over-the-migrate-step-7-stale-session-package.md`, `261016-0246-plan-migrate-step-7-a-way-out-of-a-stale-session-and-the-helper-path.md`

## Evidence

Reproduced on 2026-10-16 in a scratch git repository over a copy of `codec/fixtures/legacy-v12/workbench`, with the plugin at `9bd8db62`. HOME was outside the repository.

1. `fusion-migrate run`, then commit. Exit 0, `result=json-control`.
2. Append one line to one issue narrative in the fixture's shared issue store (the parser-slow one), then `fusion-migrate rollback`. Exit 8, `conflict/after-state-changed`, and stderr says "The fence 36b9ba8f-… this rollback began stands". `status` shows `fence=36b9ba8f-…`, `record=current`.
3. `git reset -q --hard HEAD~1`. `status` shows `state=legacy`, `fence=36b9ba8f-…`, `done=true`, `record=stale`. The Step 7 block routes this to `ROUTE=stale`.
4. `set-aside --consent`. Exit 0, `result=no-record`.
5. `run`. Exit 5: "a fence or a pending intent stands (…); `resume`, `rollback` or the archive helper that set it closes it."
6. `rollback` gives exit 5, "no run is recorded". The same call with `--session <dir>.stale-…` gives exit 5 (stale). `rollback --end-fence --session <dir>.stale-…` gives exit 5, "no fence of a refused rollback stands on a store under JSON control" (`hooks/migrate.ts` `endLeftFence` requires `state=json-control`).

The codec admits `maintenance end` on a legacy store only with rollback chunk 0's evidence (`codec/README.md` `## migration`, "`maintenance end` on a legacy store"), and in this cell there is none. The only way out is to delete `.json-state/maintenance.json` by hand, and nothing says so.

The skill makes a promise this cell breaks. `skills/migrate/SKILL.md` `## Step 7 — Repair, then migrate to JSON control`, the `ROUTE=stale` line, says "say a re-run of `/fusion:migrate` continues".

This is not a regression. At 13.1.3 the same cell already ended in exit 8 or exit 5 with no way out. What is new is that a route now promises a way out. A pending intent under `.json-state/journal/` that survives a reset is the same class of problem (inference, not reproduced).

## Fix direction

One of the following:

- `stale()`, or `set-aside`, also considers a fence or pending intent in `.json-state/` that the tree's state cannot close. Then `set-aside` either refuses and names the way out, or the helper gets a guarded way to end that fence on a legacy store.
- At the least, the `ROUTE=stale` line and the `current()` refusal stop promising that a re-run continues when `status` shows `fence=` other than `-`.

How the fence gets ended is a design question about the codec's legacy-store `maintenance end`. It may need a decision record.

## Acceptance

A test in `hooks/lib/__tests__/migrate.test.ts` runs steps 1 to 4 above. After the way out the skill names, `run` exits 0 with `result=json-control`, or Step 7 does not promise that and names what the user does instead.
