# The churn key is anchored to the workbench root, and the ranking stops showing files that are gone

**Agent:** coder
**Session:** dispatched by orchestrator, session `260810-1402`, Turn 1, task `I:260809-2023-churn-key` (task 4 in `tasklist.md`)
**Status:** Complete
**HEAD at start:** `430d73a` (dispatch). Two other agents were working in this repository concurrently throughout.

---

## What was asked

Realise the answer in `260810-0920_*_what-should-a-churn-key-be-anchored-to-and-what-happens-to-the-535-entries-already-recorded.md`
against `260809-2023_*_the-churn-map-is-keyed-by-the-sessions-cwd-and-never-pruned-so-setups-thrashing-read-ranks-dead-paths.md`:
anchor the key to the workbench root (a), migrate what can be rewritten and state the merge rule
(b), keep every entry and exclude absent files from the ranking on the read path (c).

## What was changed

**`hooks/lib/churn.ts`** — three additions and one changed load.

- `churnKey(raw, cwd, root)` — `resolve(cwd, raw)` then `projectRelative(absolute, root)`, the two
  steps `narrowingTarget` in `tracker.ts` already ran for the protected-path measurement. Null for
  a path outside the root, for no workbench, and for the root itself: three causes, one meaning —
  there is no key to count under.
- `migrateChurnKeys(state, root, exists?)` — the one-off re-anchoring, run on load and skipped
  once the file carries `keyAnchor: "workbench-root"`. Idempotent independently of that stamp.
- `rankThrashing(state, root, limit, exists?)` — the read path: absent files excluded, `entries`
  and `absent` reported alongside, sorted score → lifetime total → path so a ranking read twice
  reads the same twice.
- `loadChurn()` migrates when the stamp is absent; `emptyState()` carries the stamp, because an
  empty map has nothing to migrate.

**`hooks/tracker.ts`** — the cwd-relative IIFE is replaced by `churnKey(...)` with
`findWorkbenchRoot()`. A path that yields no key emits its `tracker_record` event saying
`not tracked` and records nothing.

**`hooks/churn-rank.ts`** (new) and **`bin/fusion-churn-rank`** (new) — the read surface. The bash
wrapper resolves `hooks/dist/churn-rank.js` relative to itself, so an install copy and a work tree
each run their own build; exit 0 ranked, 1 usage, 2 no workbench, 3 compiled hooks missing (its own
code, because "no state to rank" is an answer about the project and a broken install must not wear
it).

**`agents/orchestrator.md` Setup Step 5** and **`skills/setup/SKILL.md` Step 3** — the Setup read is
the helper, not a direct read of `churn.json`, and the call carries the same `[ -x ]` guard as
`bin/fusion-count-sources` one block above it (decision
`260810-0921_*_how-should-a-prompt-call-a-bin-helper-that-the-installed-copy-may-not-have.md`
option (a1)). This helper is brand new, so without the guard every session running against an
older install takes exit 127 at Setup — the exact defect `260810-0352_*_setup-step-5-now-calls-a-helper-the-installed-copy-does-not-have.md` records, one task earlier in
this same queue. Churn is advisory and has no substitute value to print, so the absent branch
reports the reason on stderr and stays silent about high-thrash files.

**`.gitignore`** — `!bin/fusion-churn-rank`. `bin/*` is ignored wholesale with one exception line
per shipped helper, and the file's own warning says a helper missing from that list is silently
dropped from the distribution. Caught by reading `git status` rather than by a test: nothing in the
suite compares the exception list against `bin/`, so a helper that never ships fails only at the
Setup of a session running an install — which is the same shape as the defect one task earlier in
this queue, arriving from the packaging side instead of the version side.

**Docs** — `README-hooks.md` (the two file rows) and `CLAUDE.md` (the `bin/` layout row).

## The merge rule, stated

Two spellings of one file merge by **summing** `totalChanges` and `changesThisSession`, taking the
**later** `lastChange`, and **recomputing** `thrashingScore` from the merged counters.

Summing because the defect record's own finding is that each spelling is an independent counter
that under-reports the same file; the sum is the number that would have been recorded had the
anchor been right all along, and taking the max would silently discard whichever directory the file
was edited from less often. Recomputing the score because it is derived from the two counters, so
combining two derived values by any arithmetic invents a number the formula could not produce. The
recomputation can leave a merged entry scoring slightly below its pre-migration parts, since a
persisted score also carries a rapid-change penalty from a session `resetSession` has zeroed; that
is the latched lifetime alarm decision `260809-2004_*_should-the-latching-churn-and-cross-file-criticals-be-bounded-or-dropped.md` moved away from, and this moves the same way.

## What was deliberately not changed

- **`analyzeChurn`.** Untouched. Churn stays observation-only: nothing is enforced off this file,
  and no new caller reads the map for a decision. The helper is a reporter.
- **The unbounded growth of `churn.json`.** The answer says in as many words that this is a
  separate question it does not settle. The file still grows; entries are never deleted.
- **The live `fusion-workbench/.guard-state/churn.json`.** No hand-edit, and no rewrite from this
  session: the tracker's churn half stands down when cwd is this repository, so the first save
  that persists the migration comes from a session working below the root, or from a consuming
  project. The helper reads it without writing it.
- **`TRACKER_NOISE_FILES`.** Not extended. Worth knowing that the anchor change makes it work as
  written for the first time: `fusion-workbench/orchestrator-live.md` and its siblings only ever
  matched from a session started at the project root, which is why `tasklist.md` and
  `agentstate.yaml` accumulated churn at all. Their historical entries survive the migration
  re-anchored, so they can still appear in a ranking; they stop growing.

## Verification

| # | Acceptance criterion | How it was checked |
|---|---|---|
| 1 | One file, one key, whatever cwd | `churn.test.ts` compares four spellings from three working directories through `churnKey` and asserts one distinct answer. End to end in `churn-key-anchor.test.ts`: two real tracker subprocesses, one from the project root and one from `fusion-workbench/`, leave a single key with `totalChanges: 2`. |
| 2 | The ranking is dominated by files that exist | `bin/fusion-churn-rank` against this repository's live map: 590 entries in, 414 after re-anchoring, `absent=191`, and every one of the top ten exists. Before the change the top four held three deleted files and one path on another machine. Pinned in a test by a map whose top-scoring entry is a deleted file. |
| 3 | The migration runs once and is idempotent | Unit: `migrateChurnKeys(migrateChurnKeys(s))` deep-equals one pass, and the merged counter is not re-summed. Integration: two consecutive tracker calls leave the merged total at 42 and the new file at 2. |
| 4 | A deleted file's history survives while leaving the ranking | `rankThrashing` excludes it, `state.files` still holds its 147 lifetime changes, and the helper does not write the file back. |
| 5 | Nothing is enforced off `churn.json` | `analyzeChurn` is unchanged and still compares only session counters; the only new reader is the reporting helper. |
| 6 | `cd hooks && npm test` | See below. |

**The suite.** `cd hooks && npm test` — **exit 0**, 40 files, 1069 tests, 136s.

Two earlier full runs were red, both from a concurrent session working in the same checkout, and
both are worth recording because one of them was a real weakness in this task's own test file.

1. `reference-resolution-lint.test.ts` over `docs/plane-setup.md:275-276`. Another session had
   added the illustrative filename `260719-1600_*_open-issue.md`, which the lint reads as a
   workbench citation and cannot resolve. Not this file set; that session has since replaced the
   literal stamp with `<stamp>` and the run is green.
2. Every case that drove `bin/fusion-churn-rank` came back exit 3 — the wrapper's "compiled hooks
   are not installed". `npm run build` is `rm -rf dist && tsc`, and a second session running the
   suite in the same checkout deleted `dist/` while these cases were mid-flight. That one was
   mine to fix: the cases now spawn `hooks/churn-rank.ts` through the harness's `churnRankEntry()`
   (tsx by default, `dist` opt-in, exactly as `guardEntry` and `trackerEntry` already work), so no
   case depends on a build existing at that instant. What the wrapper adds over the program — it
   resolves its entry relative to itself, passes arguments through, propagates the exit code, and
   refuses with exit 3 when the entry is absent — is covered by two cases against a stub tree,
   which also need no build.

## Files changed

- `/Users/k1/Projects/productive/fusion/hooks/lib/churn.ts`
- `/Users/k1/Projects/productive/fusion/hooks/tracker.ts`
- `/Users/k1/Projects/productive/fusion/hooks/churn-rank.ts` (new)
- `/Users/k1/Projects/productive/fusion/bin/fusion-churn-rank` (new, +x)
- `/Users/k1/Projects/productive/fusion/hooks/lib/__tests__/churn.test.ts`
- `/Users/k1/Projects/productive/fusion/hooks/lib/__tests__/churn-key-anchor.test.ts` (new)
- `/Users/k1/Projects/productive/fusion/hooks/lib/__tests__/helpers/guard-harness.ts` (`churnRankEntry()`)
- `/Users/k1/Projects/productive/fusion/agents/orchestrator.md`
- `/Users/k1/Projects/productive/fusion/skills/setup/SKILL.md`
- `/Users/k1/Projects/productive/fusion/README-hooks.md`
- `/Users/k1/Projects/productive/fusion/CLAUDE.md`
- `/Users/k1/Projects/productive/fusion/hooks/dist/**` (rebuilt, never hand-edited)
- `/Users/k1/Projects/productive/fusion/260809-2023_*_the-churn-map-is-keyed-by-the-sessions-cwd-and-never-pruned-so-setups-thrashing-read-ranks-dead-paths.md` (`Resolved:` note appended; marker left `_o_`)

## One thing that happened to this task rather than in it

The `Resolved:` note this task appended to the defect record is **already in HEAD**, in commit
`7c4dfb2` — a concurrent session's commit for an unrelated docs task, which staged the file along
with its own. This task ran no git command at all. The content is intact and nothing is lost; what
it means for the orchestrator is that the defect record has no working-tree diff left to stage, and
the `_o_` → `_c_` rename is the only move still owed on it. The same commit swept the other
session's note on `260810-0352_*_setup-step-5-now-calls-a-helper-the-installed-copy-does-not-have.md` in the same way, so it is a staging breadth, not a one-off.

## Left for the orchestrator

The decision record `260810-0920_*_...` still needs its `Implemented: <hash> — …` line and the
`_a_` → `_i_` rename. It cites a commit hash this task cannot produce, since the orchestrator holds
the commit lock.
