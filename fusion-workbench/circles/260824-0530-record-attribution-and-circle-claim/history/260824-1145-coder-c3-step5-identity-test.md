# Coder — C3 step 5: the helper's exit table, tested inside the line budget

**Status:** Complete
**Task:** Plan step 5 of `circles/260824-0530-record-attribution-and-circle-claim/planning/260824-0613_*_c3-attribution-on-records-and-a-claim-on-the-circle.md`
**Executor:** coder

## What was built

`hooks/lib/__tests__/fusion-identity.test.ts`, 180 lines, 8 cases. It drives the real bash script
through `child_process` against throwaway trees, the way `fusion-count-sources.test.ts` already
drives its own helper.

What is under test is the **exit table**, because the exit code is the whole interface: a caller
keys on a number and cannot key on stderr prose. The step text anticipated four exits; step 4
shipped six (`3ba7a46`), and all six are exercised.

| Case | Asserted |
|---|---|
| exit 0 | both lines; `PERSON` in git's `Name <email>` form; `CHECKOUT` is 8 lowercase hex **and equals what the file holds** |
| exit 1, `user.name` unset | status 1, stdout empty, stderr names the key, **no `.checkout-id` minted** |
| exit 1, `user.email` unset | the same, driven separately |
| exit 3 | `PERSON=` alone, `CHECKOUT` line absent |
| exit 4 | `CHECKOUT=` alone, `PERSON` line absent, stderr says not a git work tree, and the status is not a halt |
| exit 5 | neither line, stdout empty |
| mint-once | two successive calls return one identifier **and the file was not rewritten** |
| exit 2 | an argument is refused with nothing on stdout |

Both halves of exit 1 are driven separately on purpose: a check written against `user.name` alone
would pass a script that never looked at `user.email`.

The `PERSON`/`CHECKOUT` accessors return `null` for an absent line rather than `""`, so an absent
line and a present-but-empty one are distinguishable in an assertion — which is the property the
helper's header claims and the one a shell caller most easily mistakes.

## The one assertion worth more than the rest

Exit 1 minting nothing. The helper's header claims the halt path "leaves no trace", and a failing
call that left a `.checkout-id` behind would be a side effect on an error path. Both exit-1 cases
assert `existsSync(idFile) === false` with a named message.

## Three-layer git isolation

Every fixture and every script invocation runs with `HOME` pointed at the throwaway tree and
`GIT_CONFIG_GLOBAL`, `GIT_CONFIG_SYSTEM` and `GIT_CONFIG_NOSYSTEM` cutting off the other two config
layers. Without it the two exit-1 cases would inherit this machine's global `user.name`, pass here
and fail on a runner with no global identity.

## What was deliberately not tested, and why

**The concurrent mint.** Step 4 exercised twenty parallel invocations by hand and got one
identifier. A test of it forks twenty children, costs seconds of wall-clock on every full run, and
lands squarely in the load-sensitive flakiness this suite already has filed
(`shared/issues/260814-2118_*_the-hooks-suite-fails-differently-on-repeated-full-runs-and-does-so-on-clean-head.md`).
The property a caller can actually observe — one identifier across successive calls — is covered by
the mint-once case, and the atomicity underneath it is a property of `set -C`, not of this script.
The reasoning is written into the file's header so the next reader does not re-open the question.

## Measurements

- File: **180 lines** — the step's cap, and it was hit rather than approached: the first honest
  draft came in at 183 and three lines of comment prose were tightened out. No assertion was
  dropped.
- Hook-test surface **before**: 20 193 lines against a budget of 20 375 (floor 17 875 + 2 500 of
  head-room) — **182 free**. The step text says 188; step 3's citation-lint re-approval spent six.
- Hook-test surface **after**: 20 373 — **2 lines of slack**.
- `fixtures/surface-growth.golden` regenerated with `UPDATE_SURFACE_GOLDEN=1`, the documented
  mechanism. Its diff is two lines: the new file's entry and the total. **No baseline in
  `surface-growth-bound.test.ts` was edited**, and regenerating the golden moves none.

## Verification

`cd hooks && npm test` — exit 0, 42 files, 732 tests, all green.

## Note for whoever holds the budget next

The surface now stands 2 lines under its bound. The next test file added to `hooks/lib/__tests__/`
trips it on arrival, which is the instrument working as designed. The way out is a cut, in a commit
that names it.
