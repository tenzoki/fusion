# Step 3 of the bounded-dispatch plan: `bin/fusion-turn-budget` prints the resolved dispatch bound

**Status:** Complete
**Filed by:** coder, Kai Stalmann <ks@qantr.com>

## What was asked

Step 3 of `260907-1450_*_plan-bounded-executor-dispatches.md`, and only that step: make the
existing helper print the value Step 2 put in the loader, as a second `KEY=value` line, and
correct the two documentation surfaces that specify its output. The step is written against
option B of `260907-1450_*_which-program-hands-the-orchestrator-the-dispatch-bound-at-setup.md`,
which the user ruled; option A, a separate helper, would have changed this step and Step 9 and
nothing else.

## What was done

Two files.

`hooks/turn-budget.ts`:

1. `main()`, immediately after the existing `max_turns=` write:
   `process.stdout.write(\`dispatch_minutes=${config.orchestrator.dispatchMinutes}\n\`)`.
   Two lines, in that order, from one process. The diagnostics loop above is untouched and
   still writes `config.diagnostics` verbatim.
2. The opening section of the module docstring: the program is now described as resolving the
   orchestrator's configured values, both of them, rather than the Turn budget alone, with one
   sentence saying why the name is still the Turn budget's.
3. `## Output and exits`: two lines rather than one, both shown; a statement that neither is
   conditional on the other and the order does not change; and the reason the second value
   rides this program rather than a second one, which is that the diagnostics loop runs once.

`bin/fusion-turn-budget`, the same two corrections to the header, which is this helper's
authoritative documentation: the opening description now covers both settings, and the
`Output on stdout` block names two lines with the same order and non-conditionality clause.

The exit codes were not touched, the script was not renamed, the diagnostics loop was not
narrowed, and neither line was made conditional on the other.

## What was verified

`cd hooks && npm run build && npm test` was run twice over this tree, and the two runs disagree.

The first, before this history file existed, exited **0**: 52 test files, 911 tests, all
passing, in 35 seconds. The second, over the tree as it stands with this file in it, exited
**1**: 909 of 911, in 88 seconds. The two failures are
`hook-fail-open.test.ts` ("delivers the tracker's report with its throttle record unwritable")
and `staging-drift.test.ts` ("treats the machine-written surfaces and this session's own history
file as in flight"). Run alone,
`npx vitest run lib/__tests__/staging-drift.test.ts lib/__tests__/hook-fail-open.test.ts`
exits **0** at 35 of 35.

Neither failure is this step's. Both assert on a subprocess's output — one on the tracker's
stderr, which came back empty, one on a `verdict=` field that fell back to `unchecked` — and
neither reads a file this step touched. This is the shape already filed as
`260908-0032_*_two-hook-tests-are-load-sensitive-and-fail-only-in-the-parallel-full-run.md`,
and the observation was appended to that record rather than filed again: it widens the record,
which named two cases in two files, since one of these files is a third and the
`staging-drift.test.ts` case is a different one from the case named there.

`turn-budget-lint.test.ts` and `committed-dist.test.ts` are green in both runs, with no edit to
either.

The step's own assertions were checked directly rather than inferred:

- From the project root, `bin/fusion-turn-budget` prints exactly `max_turns=12` and
  `dispatch_minutes=20`, on two lines, exit 0.
- `bin/fusion-turn-budget >/dev/null` leaves the loader's diagnostics on stderr. This project's
  configuration is clean, so it emits none; the loop was proven live in a scratch project root
  declaring `dispatchMinutes: 2.5` and `maxTurns: 0`, which printed one diagnostic per key on
  stderr, resolved both to their defaults, and exited 0.
- The same scratch root declaring `dispatchMinutes: 35` resolved 35.
- The three exit codes are unchanged: 0 resolved, 1 on an unknown argument, 2 with no workbench
  above the working directory.

`bin/fusion-citation-check` reports `edited-violations=0`, and neither edited file appears in
its violation rows. Both files sit inside this project's declared `citations.extraPaths`
(`bin/*`, `hooks/*.ts`), so the one record citation each of them now carries is read as a
pointer and had to resolve.

## What was not done

Nothing outside Step 3. `agents/orchestrator.md` Setup Step 2 still names one line; that is
Step 9's edit, which depends on this one. `CLAUDE.md`'s `bin/fusion-turn-budget` row still
describes one printed line; the step assigns that correction to Step 16 and requires the row to
cite this header rather than restate it.
