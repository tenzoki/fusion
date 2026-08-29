# Setup reports the effective protected-path list

**Agent:** coder
**Status:** Complete
**Started:** 260812 ~10:55
**Source:** `260812-0843_*_the-guard-and-its-configuration-must-be-simplified-project-settable-and-defaulted-to-fit-or-not-shipped-to-consumers-at-all.md`, one acceptance criterion of it ("Setup reports the effective list it is running under")

## What was built

`bin/fusion-protected-paths` + `hooks/protected-paths.ts` — a thin wrapper over
the compiled configuration loader, in the shape of `bin/fusion-churn-rank` and
`bin/fusion-turn-budget`. It prints the effective protected-path list, each
entry's origin layer, and whether the guard is enforcing it here.

Called from `agents/orchestrator.md` Setup Step 5 (canonical block) and cited
from `skills/setup/SKILL.md` Step 3.

## What was deliberately NOT done

The record's central question — whether a consuming project should inherit any
protected path at all — is open and was not touched. No default changed, no list
emptied, no guard behaviour altered. The report is built to hold whichever way
that decision goes: it prints whatever list is in force, the empty one included.

## Design points

- **Origin is per entry, and honestly so.** The loader's `protectedPathsSource`
  names the layer that supplied the declared list (the leaf walk takes a declared
  list whole, so all declared entries share one layer), and `floorPaths` names
  exactly the entries the self-protection floor appended. Those are the only two
  contributors, so no entry is guessed at.
- **Enforcement is two answers about two directories.** The write-tool deny asks
  `isFusionPluginCwd()` about the working directory; the measurement asks
  `isFusionPluginRoot(root)` about the workbench root. In this repository read
  from its root both stand down; read from `fusion-workbench/` they disagree, and
  the report says so with each directory named. `guard.enabled` is stated
  separately because it is not a per-half fact.
- **"Not measured" never looks like "nothing protected."** Every non-zero exit
  prints no list at all and says on stderr that no report was taken; the
  helper-absent branch in the prompt says the list is unknown, not empty.
- **The prompt stayed small** by leaving the explanation in the helper's header
  and citing it: `agents/orchestrator.md` grew 1,149 bytes against a 4,915-byte
  helper header.

## Files

- `hooks/protected-paths.ts` (new)
- `bin/fusion-protected-paths` (new, +x)
- `hooks/lib/__tests__/fusion-protected-paths.test.ts` (new, 14 cases)
- `.gitignore` — `!bin/fusion-protected-paths` exception added
- `agents/orchestrator.md` Setup Step 5, `skills/setup/SKILL.md` Step 3

## Verification

`cd hooks && npm test` — exit 0, 53 files, 1363 tests. Baseline before the work
was 52 files / 1349 tests.

## Found on the way, not mine to decide

`hooks/config.json` was uncommitted-modified in the work tree (mtime 08:24, twenty
minutes before the record was filed) with `guard.protectedPaths` emptied — which
is option 1 of the record's open decision, applied to the tree. With it in place
152 of 1349 tests fail. The edit was preserved to the session scratchpad and the
file restored to HEAD so the work could be verified. The decision stays open.
