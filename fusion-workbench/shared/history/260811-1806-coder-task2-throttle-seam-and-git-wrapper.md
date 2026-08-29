# Task 2 — the throttle store onto the guard-state seam, and one `lib/git.ts`

**Agent:** coder
**Status:** Complete
**Started:** 260811-1806
**Task:** `fusion-workbench/tasklist.md` task 2 (`I:260811-1730_*_realise-the-measurement-chassis-first-two-pieces-throttle-onto-the-existing-seam-and-one-git-wrapper.md`)
**Record:** `260811-1730_*_realise-the-measurement-chassis-first-two-pieces-throttle-onto-the-existing-seam-and-one-git-wrapper.md`
**Realises:** `260811-1146_*_does-the-measurement-family-get-a-shared-chassis-before-the-fourth-module.md`, option 2
**Active Circle:** none (`.active-circle` absent; every `OUT_*` resolved into `shared/`)
**Git HEAD at start:** `b261d83`

## What was built, and the bound that shaped it

Option 2 of the answered decision, and only option 2. Two pieces.

### (a) The throttle store moved onto `hooks/lib/guard-state-file.ts`

`guardStatePath`, `loadGuardState` and `saveGuardState` were widened by **one optional
`root?: string`**. That was the only thing the three measurement modules needed and did not
have: each is handed a workbench root by its caller and is deliberately anchored there rather
than at cwd, while the seam resolved the root itself by walking up from the working directory.
When no root is passed the walk still runs, so `escalation.ts` and `churn.ts` are unchanged in
signature and in behaviour. A caller that passes a root gets no `null` — it has already answered
the question the walk asks.

The six hand-written functions became six calls plus a coercion each:

| Module | Was | Now |
|---|---|---|
| `lib/state-drift.ts` | `lastReported` / `recordReported`, own read+`as` cast, own `mkdirSync`+`writeFileSync` | `loadGuardState`/`saveGuardState` + `coerceThrottle` |
| `lib/review-coverage.ts` | `lastReportedCoverage` / `recordReportedCoverage`, same shape | same, + `coerceCoverageThrottle` |
| `lib/staging-drift.ts` | `readStagingState` / `writeStagingState`, two fields | same, + `coerceStagingState` |

Three behavioural consequences, all in the direction the seam exists for:

1. **The write is atomic.** All three wrote with a bare `writeFileSync`; the seam writes through
   a `.tmp` and a `rename`. A tool call interrupted mid-write can no longer leave a half-written
   throttle.
2. **The read cannot throw.** All three read with an `as` cast inside a `try` that also wrapped
   the field access — which worked, but is the shape issue `260809-1101` was paid for. The
   coercions are total and run outside the `try`, so `null`, an array and unparseable text are
   one answer rather than three catch clauses.
3. **The file is pretty-printed and loses its trailing newline.** Nothing reads these files but
   the modules themselves (`grep` over the repo confirms: no consumer in `bin/`, `hooks/`,
   the monitor or any test), so the format change reaches nothing. It was verified by round-trip.

The three modules no longer know where `.guard-state/` is. Each now names its throttle **file
name** and the seam builds the path; `STATE_DIR_REL`, `THROTTLE_REL` and
`COVERAGE_THROTTLE_REL` are gone.

### (b) One `hooks/lib/git.ts`

`git(root, args, timeoutMs?)` — `execFileSync` in a named root, stderr discarded, every failure
collapsed to `null`. It existed verbatim in `review-coverage.ts` and `staging-drift.ts` and
inline inside `state-drift.ts`'s `commitsSince`. After the extraction, `execFileSync` appears
exactly once in the hooks source, and `"git"` as a command word appears in exactly one file.

**The timeout was not verbatim and is preserved as a difference.** The two copies used 5 s, the
third 10 s. The 10 s belongs to `git status --untracked-files=all` over a whole workbench — the
only call in the family that walks a working tree rather than reading refs — so `lib/git.ts`
defaults to 5 s and `staging-drift.ts` keeps a renamed `GIT_STATUS_TIMEOUT_MS = 10_000` that it
passes at that one call site. Its two `rev-parse` calls now take the default, which is what they
always should have had. Folding the 10 s into the shared default would have raised the budget for
every ref read in the family on the strength of one status call.

### (c) The trigger criterion

Written into `hooks/tracker.ts`, in a new documented section immediately above the three
`measure…ForModel` bodies — the one file a fourth measurement must touch. It states:

- what the three existing triggers are (every guarded tool call / a review file landing / HEAD
  having moved), which is the property that made them siblings rather than a merge;
- **three checkable questions** a proposal must pass to be a sibling: there is a nameable moment
  at which its answer turns from "not yet" to "wrong"; firing at that moment reports **nothing**
  on the commonest path (the disqualifying test, and issue `260810-0710`'s); and the condition is
  **read** from the repository or the hook input, never predicted from a command's text;
- what each failure means — no moment → it belongs inside an existing report; too-wide trigger →
  the trigger is wrong, not the sentence too loud; predicted → not a measurement at all;
- that two triggers that come out identical are one measurement with two rows, not siblings;
- the trip-wire, verbatim from the decision: **when a fourth measurement is proposed, the chassis
  is built first** — and the constraint on that chassis, that it must not flatten the three
  trigger arguments into a flag.

## What was deliberately NOT touched

The tracker's three `measure…ForModel` **bodies**, the three CLI mains under `hooks/`, and the
three `bin/` wrappers. The change to `tracker.ts` is a doc block above the section divider; no
statement inside any of the three functions moved. Option 1 remains taken at the fourth module.

## The third repeated thing, and what the throttle move did to it

The decision's table names a **`signature` contract** hand-rolled three times (stable identity, a
divergence that grows speaks again, a repaired one resets). It was out of scope and is untouched.

Moving the throttle changed nothing about it, and the coupling is worth stating precisely because
the two meet at the comparison. The signature is **produced** by each module's `measure…` function
and **compared** in the tracker; the throttle only carries the string between two tool calls. What
the seam changed is the read's failure mode, not the comparison: an unreadable throttle used to
yield `""` from a `catch` and now yields `""` from a total coercion. `""` is "never reported", so a
corrupt throttle makes a standing divergence speak once more — verified in the scratch project by
overwriting all three throttle files with `null`, `[1,2,3]` and `not json at all` and watching the
next call re-report and rewrite them. That is the same direction the old `catch` took. The
signatures themselves — what goes into them, and the three different join formats — were not read
and not changed.

## Verification

`cd hooks && npm test` — **exit 0**, 49 files, 1284 passed. Green at HEAD `b261d83` beforehand
with the same count, so no test was added, removed or skipped.

One test failed on the first run and it was a real gap, not a flake:
`derivable-enumerations-lint.test.ts` requires every `hooks/lib/*.ts` to have a row in
`README-hooks.md`'s files table. `lib/git.ts` got one. That gate is the reason a new lib module
cannot ship undocumented.

**Behavioural verification against a scratch project root**, in the shape the integration tests
use — a temp directory with its own git repository, `fusion-workbench/.fusion-setup` and
`agentstate.yaml`, driving `hooks/dist/tracker.js` over stdin exactly as Claude Code does:

1. First call in a fresh workbench: `staging-drift.json` written through the seam, pretty-printed,
   no `.tmp` residue, `head` armed and `reported: ""` — the first-sighting case.
2. Three commits and an unstaged record later: state drift **and** staging drift both reported in
   one `additionalContext`, both throttles written, `state_drift` and `staging_drift` both in the
   event log.
3. Identical next call: `{}` — both throttled. The round-trip through the seam reads back what it
   wrote.
4. A `Write` to a `.md` under `shared/reviews/`: review coverage fired on its own trigger and
   wrote its throttle; the every-call path stayed quiet, so the three triggers are still three.
5. All three throttle files corrupted (`null`, an array, unparseable text): tracker exit 0, stderr
   clean, each measurement re-reported once and rewrote its file. No coercion throws.
6. `bin/fusion-state-drift`, `bin/fusion-staging-drift`, `bin/fusion-review-coverage` all run
   unchanged in that project and print their `KEY=value` blocks — the wrappers and CLI mains were
   not touched and did not need to be.

**`hooks/dist/**` rebuilt** by `npm test`'s own `rm -rf dist && tsc` and checked to stay
self-contained: every `import` in `dist/*.js` and `dist/lib/*.js` is either relative (`./…js`) or
a `node:` builtin. `dist/lib/git.js` and `dist/lib/git.d.ts` are new and untracked — they must be
staged with the rest, or the HTTPS installer ships a tarball whose `tracker.js` imports a file
that is not there.

## Files changed

- `/Users/k1/Projects/productive/fusion/hooks/lib/git.ts` — new
- `/Users/k1/Projects/productive/fusion/hooks/lib/guard-state-file.ts`
- `/Users/k1/Projects/productive/fusion/hooks/lib/state-drift.ts`
- `/Users/k1/Projects/productive/fusion/hooks/lib/review-coverage.ts`
- `/Users/k1/Projects/productive/fusion/hooks/lib/staging-drift.ts`
- `/Users/k1/Projects/productive/fusion/hooks/tracker.ts` — the trigger criterion only
- `/Users/k1/Projects/productive/fusion/README-hooks.md` — the `lib/git.ts` row the lint requires
- `/Users/k1/Projects/productive/fusion/hooks/dist/**` — regenerated, including two new files

## Bookkeeping

- `260811-1730_*_…` → `_c_`, with a `Resolved:` note.
- `260811-1146_*_…` → `_i_`, with an `Implemented:` note citing paths rather
  than a hash, because this agent does not commit. The whole of what the answer asked to be
  **built** is built; the "option 1 at the fourth module" half is a standing condition, and the
  only thing that could be done for it — writing the trip-wire and the criterion where the next
  author reads them — is done.
- `fusion-workbench/tasklist.md` task 2 → `[x]`.
