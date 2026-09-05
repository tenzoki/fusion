# The mint announcement reaches the user

**Agent:** coder
**Filed by:** coder, Kai Stalmann <kai@qantr.com>
**Status:** Complete
**Task:** repair `260905-0933_*_the-mint-announcement-is-unreachable-on-every-path-that-actually-mints.md`

## What was asked

`bin/fusion-identity` announces a mint on stderr; both callers that run first in a
session discard stderr, and one of them is the caller that mints. Choose among three
routes, measure the stderr channel first because one route depends on it, and let a
test drive the delivering path rather than the helper.

## The measurement

Where does stderr from a SessionStart hook command go? Measured against Claude Code
2.1.261, three ways, none of them by reasoning from the docs.

1. A scratch project with three SessionStart hooks (stderr at exit 0, plain stdout,
   a `systemMessage` envelope) and a headless `claude -p` asking the model to echo
   any probe line it could see. It echoed the stdout line and nothing else.
2. The session transcript for that run. The stderr hook's attachment is
   `hook_success` with `content: ""` and the text parked in a `stderr` field; the
   stdout hook's carries it in `content`. A second probe at exit 1 and exit 2 gives
   `hook_non_blocking_error`, which does carry the stderr.
3. The shipped binary's own attachment renderer: `case "hook_success": return null`,
   against `case "hook_system_message"` rendering `<hook> says: <content>`. The
   SessionStart-to-context mapping takes `hook_additional_context` and a
   `hook_success` whose `content` is non-empty.

So a SessionStart command that exits 0 delivers its stderr to nobody, and route 1
(stop discarding stderr) would have changed nothing observable. That is the finding
the record could not have, and it decided the choice.

## What was done

Route 2. `hooks/hooks.json`'s identity clause merges stderr into its existing capture
and pipes it to a new `hooks/identity-notice.ts`, which selects the helper's own
announcement and emits it as a `systemMessage`. `bin/fusion-identity` is untouched.

- `hooks/identity-notice.ts` (new, 117 lines)
- `hooks/hooks.json` (one command string: `2>/dev/null` -> `2>&1`, plus the pipe)
- `hooks/lib/__tests__/identity-mint-notice.test.ts` (new, 118 lines) — reads the
  command out of `hooks.json` and runs it through `sh -c` against a throwaway
  workbench, so the wiring and the helper's wording are pinned together
- `README-hooks.md` — Architecture tree and `## Files` row
- `hooks/dist/` — rebuilt with `npm run build`

## Two gates moved, and neither was a growth baseline

`fixtures/surface-growth.golden` regenerated with `UPDATE_SURFACE_GOLDEN=1`; the
bound itself passes and `TEST_LINE_BASELINE` was not touched. The hook-test surface
has 11 lines of head-room left, which is worth knowing before the next test lands.
`reference-resolution-lint.test.ts`'s `BASELINE` re-approved 1583 -> 1584 with the
share and the token both measured by single-token revert, as that gate's own failure
text requires.

## Verification

`cd hooks && npm test` — exit 0, 49 files, 831 tests.
