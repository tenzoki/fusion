Churn and cross-file state are cast, not coerced, so a shape-valid state file swallows the protected-path halt message

---

`hooks/lib/churn.ts:80` and `hooks/lib/cross-file.ts:94` cast the parsed JSON
with `as` and catch only a missing file or a parse failure. A file that parses
to a valid JSON value of the wrong shape passes the `catch` and throws on the
next field access. The throw escapes to `hooks/tracker.ts:532`, which calls
`respond()` with no argument, discarding the protected-path halt message the
same tool call had already produced.

This is the identical defect that `260802-2334_*_a-shape-valid-escalation-json-makes-the-whole-guard-fail-open-on-both-surfaces.md_c` closed for `escalation.json`.
The fix was applied to one of the three state modules.

---

Context.

`hooks/lib/escalation.ts:60-127` documents this failure class at length and
fixes it with `coerceState`: require an object, default every field, force
`recentEvents` to an array. The two sibling state modules were not given the
same treatment.

`hooks/lib/churn.ts:78-83`:

```ts
  try {
    const content = readFileSync(paths.churnPath, "utf-8");
    return JSON.parse(content) as ChurnState;
  } catch {
    return empty;
  }
```

`hooks/lib/cross-file.ts:91-97` has the same shape.

Measured, not inferred. With `{}` seeded into
`fusion-workbench/.guard-state/churn.json` in a scratch workbench:

    loadChurn()                 -> {}                (no throw, no diagnostic)
    recordChange(state, "a.ts") -> TypeError: Cannot read properties of
                                   undefined (reading 'a.ts')

and driving the compiled hook with a `Write` payload:

    $ echo '{"tool_name":"Write","tool_input":{"file_path":"…/a.ts"}, …}' \
        | node hooks/dist/tracker.js
    [tracker] Error: TypeError: Cannot read properties of undefined (reading '…')
    {}

The severity comes from the ordering in `hooks/tracker.ts:525-529`. The
measurement runs first, so the revert and the halt both land and both persist.
What is lost is the sentence built at `hooks/tracker.ts:355-366`, which is the
only thing that tells the agent a protected path was changed, that the guard is
halted, and how a human clears it. `rules/protected-path-discipline.md:5` states
that the agent is told which file changed and what to do. Under this condition
the agent is told nothing and meets a silent revert, which is precisely the
failure the rule was written against.

Two amplifiers. The state file is never repaired, because `saveChurn` at
`hooks/tracker.ts:480` sits after the throw, so every subsequent tool call in
the project takes the same path until a human deletes the file. And the one
event that is emitted, `guard_error` at `hooks/tracker.ts:534`, is not rendered
by the dashboard (`260804-1607_*_guard-error-is-not-rendered-by-the-monitor-so-a-fail-open-guard-is-invisible.md_c`), so the condition is invisible there too.

---

Severity: High. The guard keeps enforcing but stops explaining, permanently,
from a single malformed file that no code path repairs.

Fix direction: give both modules a `coerceState` equivalent modelled on
`hooks/lib/escalation.ts:109-127` — require an object, default `files` to `{}`,
default the scalar fields. The analysis
`260809-1101-guard-support-layer.md` recommends landing this
together with target C2 (one shared state-file helper carrying the coercion
seam), so the third copy of the pattern cannot drift again.

Cross-references:
`260809-1101-guard-support-layer.md` (findings 1 and 5);
`260802-2334_*_a-shape-valid-escalation-json-makes-the-whole-guard-fail-open-on-both-surfaces.md`;
`260804-1607_*_guard-error-is-not-rendered-by-the-monitor-so-a-fail-open-guard-is-invisible.md`;
`rules/protected-path-discipline.md`.

---

**Reconciliation 260809-1651-reconciliation.md (reconciler, domain `code`) — stays `_o_`. Untouched by the defect round.**
The six commits `451a07e..fb262d8` touch `hooks/tracker.ts`, `hooks/lib/protected-snapshot.ts`, `hooks/lib/git-branch-guard.ts` and the new `hooks/lib/reverted-copy.ts`. `hooks/lib/config.ts`, `hooks/lib/churn.ts`, `hooks/lib/cross-file.ts` and `hooks/lib/escalation.ts` are not in the diff, so every line this record cites still reads as filed and its acceptance criteria are unmet.

---
Resolved (260809-1811-coerce-guard-state-files.md, coder — marker left at `_p_` for the orchestrator to close after its own validation):

Both loaders now coerce. The fix took the shared route the record and analysis C2 asked for rather than a second and third private copy: `hooks/lib/guard-state-file.ts` holds the resolve-read-coerce-write seam plus three coercion primitives, and the coercion is a PARAMETER of the load, so absence, unparseable text and a shape-valid value of the wrong type are one answer and neither state module has anywhere left to put an `as` cast. `hooks/lib/churn.ts` supplies `coerceChurnState`, `hooks/lib/cross-file.ts` supplies `coerceCrossFileState`; both round-trip a well-formed file unchanged.

`hooks/lib/escalation.ts` and `hooks/lib/protected-snapshot.ts` were NOT migrated onto the helper. Escalation was out of this task's scope, and the snapshot does not fit the seam as written: its load answers `null` rather than an empty state, its save removes the stale file when its own write fails, and its read unlinks as it goes. That leaves C2 partly open, and the reason is recorded in the helper's own header.

Verification: `hooks/lib/__tests__/guard-state-shape.test.ts` drives both hooks through the harness against a project seeded with a malformed state file, and asserts the halt sentence still reaches stdout. Checked against the pre-fix sources first — 8 of its 16 cases fail there with `[tracker] Error: TypeError: Cannot read properties of undefined`, which is the defect as filed. `npm test` in `hooks/` is green at 1113 tests, and the new file also passes with `FUSION_GUARD_ENTRY=dist`, against the compiled `dist/tracker.js`.

The monotonic-latch defect in the same two modules (`260809-1101_*_churn-and-cross-file-criticals-latch-permanently-and-never-reset.md`) was deliberately not touched: it is queued separately and blocked on a human decision.
