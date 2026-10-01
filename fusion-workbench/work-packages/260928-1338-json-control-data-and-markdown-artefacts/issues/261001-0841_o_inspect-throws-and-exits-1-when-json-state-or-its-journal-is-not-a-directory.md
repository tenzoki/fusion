inspect throws and exits 1 when .json-state or its journal is not a directory
---
Since `inspect` computes `pending` (initialize plan step 3 and 7a), a target whose `.json-state` is a regular file, or whose `.json-state/journal` is one, crashes the bundle. It prints an `ENOTDIR` stack and exits 1. The base bundle at `b1dcd3c6` answered the same target `ok: true, state: legacy`. `inspect` is the gate every Claude reader calls and the first request of Setup's `initialize` row, so a malformed entry now gives no answer where it used to give a typed one.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260930-1654_*_plan-initialize-the-codec-creates-a-new-workbench-and-list-names-its-state.md (steps 3, 7a), 260930-1654_*_a-directory-named-workbench-json-makes-the-bundle-throw-and-exit-1-instead-of-answering.md (same defect class, closed), 261001-0837-reviewer-fj03b-initialize-and-fj03c.md

Severity: Medium. Scope: `codec/src/cli/ops.ts` (`inspect`, `pendingInitialize`) and `codec/src/journal.ts` (`pendingIds`, `sweep`).

**Evidence:**

- `codec/src/cli/ops.ts`:
  - `inspect` calls `pendingInitialize(wb)`.
  - `pendingInitialize` iterates `pendingIds(wb)`.
- `codec/src/journal.ts`:
  - `pendingIds` catches only `ENOENT` (`if (… code === "ENOENT") return []; throw e;`).
  - `sweep` uses the same `ENOENT`-only catch.
- Reproduced, current `codec/dist/fusion-record.js`, `{"op":"inspect","workbench":<t>}`:
  - `<t>/.json-state` a file: `Error: ENOTDIR … scandir '<t>/.json-state/journal' at pendingIds`.
  - `<t>/.json-state/journal` a file: the same.
  - The `b1dcd3c6` bundle over the first target: `{"ok":true,"result":{…,"state":"legacy",…}}`.
- Prior `ae1ad78` §33 says unreadable journal data gives a diagnosis or refusal, never a clean `pending: null`. A crash is neither.
- Same root, second effect (from the review, not reproduced separately): when `journal` is a file, `initialize` takes the lock path and `sweep` throws inside `mutate`. The plan branch `if (isDir === false) found.push(rel);` in `initialContent`, meant to answer `target-not-empty` naming `.json-state/journal`, is never reached.

**Fix direction:**

- `pendingInitialize` maps any non-`ENOENT` failure to list the journal to `operation-unknown/pending-initialize-unreadable`, with the path in the detail.
- `initialize` answers `conflict/target-not-empty` before `sweep` whenever `.json-state/journal` or `.json-state/ops` exists and is not a directory.

**Acceptance:** new cases in `codec/src/__tests__/ops.test.ts`, each red against the current bundle:

- `inspect` over both targets exits 0 with a typed answer.
- `initialize` over the journal-is-a-file target answers `conflict/target-not-empty`, with the detail naming `.json-state/journal`.
- Recorded sessions replay unchanged.
