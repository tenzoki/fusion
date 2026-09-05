# The extraPaths advisory names what failed, not the container's type

**Status:** Complete
**Filed by:** coder, Kai Stalmann <ks@qantr.com>

## What was asked

Repair `260901-0323_*_the-extra-paths-diagnostic-names-the-containers-type-so-a-bad-element-is-reported-as-an-array.md`:
`CONTAINER_LEAF_RULES.citations.extraPaths` paired the check `isArrayOfNonEmptyStrings`
with the constant `expected: "an array of strings"`, and `validateLayer()` composed
`must be ${rule.expected}, got ${describeValue(leafValue)}`. `describeValue()` reports the
value's own type, so `["src/*.go", ""]` was told its array of strings must be an array of
strings. Scope: `hooks/lib/config.ts` and `hooks/lib/__tests__/config.test.ts` only.

## What changed

`hooks/lib/config.ts`. `LeafRule` no longer carries a `check` predicate and an `expected`
constant beside it. It carries one field, `explain(value): string | null` — `null` when the
value is usable, otherwise the whole clause completing `"<container>.<leaf>" ___.`,
including whatever that clause wants to say about what it got. The record's acceptance test
is what forces this: "a shared `expected` string cannot do both, so the rule needs a message
the check produces rather than a constant beside it." One mechanism, no special case for the
one leaf that has more than one way to fail.

`isPositiveInteger` and `isArrayOfNonEmptyStrings` were folded into `explainPositiveInteger`
and `explainArrayOfNonEmptyStrings`, keeping their docstrings. Folding rather than wrapping
keeps the rule and its message in one place: a predicate beside an explainer is the same two
copies of one rule that produced the defect.

`validateLayer()` now branches on the returned failure instead of on a boolean, and
interpolates the clause the rule produced.

### The wording

`orchestrator.maxTurns` is byte-identical to before — its check has one way to fail, so its
message stays one sentence.

Old, for `{"citations": {"extraPaths": ["src/*.go", ""]}}`:

```
"citations.extraPaths" must be an array of strings, got an array. The key was ignored and
inherits as if it were absent.
```

New (verified by running the loader against a scratch project, not composed by hand):

```
"citations.extraPaths" must be an array of non-empty strings, but the element at index 1 is
an empty string. The key was ignored and inherits as if it were absent.
```

The three refusals are three sentences now:

- not an array: `must be an array of non-empty strings, got a string`
- a non-string element: `must be an array of non-empty strings, but the element at index 1 is not a string`
- an empty-string element: `must be an array of non-empty strings, but the element at index 1 is an empty string`

Two things the new text carries that the old could not. The index, which is what a project
owner counts to in their own file — an advisory reaching them once per guarded tool call is
their only channel. And the non-empty half of the rule, which the record calls "the element
most worth refusing" because an empty `:(glob)` pathspec lists every tracked file.

The element message names the index and the property, not the offending value: the elements
are pathspecs and the index locates one unambiguously, while a dumped value has no bound on
its size.

### The test

`config.test.ts`, the existing `it.each` block over the three bad values, which asserted only
`toContain("an array of strings")` — one sentence accurate for exactly the first of its three
rows. It gains a third column holding the tail each row's own message must carry, so the
three rows can no longer pass on one shared sentence. Net +6 lines, kept minimal because
`surface-growth-bound.test.ts` measures the hook tests' growth and three sibling coders were
spending that budget in the same batch.

## Verification

`npx vitest run lib/__tests__/config.test.ts lib/__tests__/guard-project-config-integration.test.ts`
from `hooks/` — exit 0, 56 tests. `npx tsc --noEmit -p tsconfig.json` — exit 0.

Not run, by instruction: `npm test` (the full suite) and `npm run build` (`hooks/dist/` is
shared build output; the orchestrator builds once after the batch, so the committed `dist/`
is stale for this change until then).

## What was deliberately not touched

`README-hooks.md`, `fusion.json` and `templates/fusion.json` each describe the leaf as "an
array of strings with none of them empty". That prose is still true and is outside this
task's scope; the record asks about the advisory, not about the documentation.
