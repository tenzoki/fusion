Churn and cross-file state are cast, not coerced, so a shape-valid state file swallows the protected-path halt message

---

`hooks/lib/churn.ts:80` and `hooks/lib/cross-file.ts:94` cast the parsed JSON
with `as` and catch only a missing file or a parse failure. A file that parses
to a valid JSON value of the wrong shape passes the `catch` and throws on the
next field access. The throw escapes to `hooks/tracker.ts:532`, which calls
`respond()` with no argument, discarding the protected-path halt message the
same tool call had already produced.

This is the identical defect that `260802-2334_c` closed for `escalation.json`.
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
by the dashboard (`260804-1607_c`), so the condition is invisible there too.

---

Severity: High. The guard keeps enforcing but stops explaining, permanently,
from a single malformed file that no code path repairs.

Fix direction: give both modules a `coerceState` equivalent modelled on
`hooks/lib/escalation.ts:109-127` — require an object, default `files` to `{}`,
default the scalar fields. The analysis
`shared/analyses/260809-1101-guard-support-layer.md` recommends landing this
together with target C2 (one shared state-file helper carrying the coercion
seam), so the third copy of the pattern cannot drift again.

Cross-references:
`shared/analyses/260809-1101-guard-support-layer.md` (findings 1 and 5);
`circles/260801-1244-guard-rules-write/issues/260802-2334_c_a-shape-valid-escalation-json-makes-the-whole-guard-fail-open-on-both-surfaces.md`;
`circles/260801-1244-guard-rules-write/issues/260804-1607_c_guard-error-is-not-rendered-by-the-monitor-so-a-fail-open-guard-is-invisible.md`;
`rules/protected-path-discipline.md`.
