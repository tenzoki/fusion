# Coder: Turn 3 task G1, the citation sweep ships as `bin/fusion-citation-sweep`

**Date:** 260829-1750
**Agent:** coder
**Circle:** 260828-2342-citation-form-drops-store-segment
**Decision implemented:** `260829-1623_*_does-fusion-ship-the-citation-sweep-or-only-the-checker-and-under-which-guards.md`, option 2
**Status:** Complete

## What was done

- `hooks/citation-sweep.ts` replaces the `.mjs` script under `hooks/scripts/`; the logic is ported unchanged (sweep and repair pass) and compiled to `hooks/dist/citation-sweep.js`, so the install tarball runs it without `node_modules`. The script is deleted; no test depended on it.
- `bin/fusion-citation-sweep`: thin bash wrapper, exit 3 when the compiled entry is missing, header carries modes, guards and the exit table. `.gitignore` exception added; the file was staged under `fusion-commit-lock` because `committed-dist.test.ts` requires `git ls-files bin/` to equal the directory listing.
- Three guards on a writing mode (`--write`, with or without `--repair`): (a) tracked workbench in a clean git work tree, extra paths inside the same tree, else one stderr line and exit 4; (b) census first, `--yes` before any write, else exit 5; (c) no bare-stamp resolution and no option for one, stated in both headers.
- `hooks/lib/__tests__/citation-sweep.test.ts` rewritten against the compiled entry: rewrite table, repair pass, write-then-dry-run `rewrites=0` over a scratch repo, the three refusals verbatim, the missing option as a usage error, and `--dry-run` over this repository's own workbench reporting `rewrites=0` (skipped with a named reason outside this repo).
- Docs: `CLAUDE.md` Layout row, `README-hooks.md` Files row, the consumer paragraph in `docs/upgrading-to-v10-20.md`; the retired script path replaced in `CLAUDE.md`'s checker row, `bin/fusion-citation-check`, `hooks/citation-check.ts` and `skills/help/SKILL.md` (a 26-byte shrink).
- Three workbench records carried the store-prefixed form and made both the new gate and `workbench-citation-lint` red at HEAD: the Turn 2 history `260829-1420-coder-turn-2-r1-citation-grammar-and-repair.md`, the issue `260829-1623_*_the-sweep-starred-both-markers-of-a-shell-illustration-in-a-terminal-circle-record.md` and the `Answered:` line of the decision above. Each got exactly the rewrite the sweep prints; `--write` could not be used because the tree is in flight.
- Pins: `reference-resolution-lint` re-approved 1544 -> 1552 paths (every citation of the new helper; shares in the constant's comment); `surface-growth.golden` regenerated (hook tests 19713 -> 19876 lines, skills -26 bytes). No baseline map edited.

## Not done, and named

- `--repair --dry-run` over this tree reports `repairs=2`, both inline exhibits in issue `260829-1346_*_...` (lines 24 and 26), which the repair pass cannot tell from instances since they are not fenced. The idempotency gate covers the sweep, as the decision asked; the repair pass carries no such gate. Left as it stands.

## Verification

`cd hooks && npm run build && npm test` exit 0 (47 files, 805 tests).
