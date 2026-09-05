# The extraPaths diagnostic names the container's type, so a bad element is reported as "an array"

---
`describeValue()` reports the value's own type, but `isArrayOfNonEmptyStrings` fails on an
element. A project writing `["src/*.go", ""]` is told its array of strings must be an array of
strings. Neither the offending element nor the non-empty requirement is named.
---
**Filed by:** coderev, Kai Stalmann <ks@qantr.com>

## The defect

`hooks/lib/config.ts`. `CONTAINER_LEAF_RULES.citations.extraPaths` pairs the check
`isArrayOfNonEmptyStrings` with `expected: "an array of strings"`, and `validateLayer()` composes
the diagnostic as `must be ${rule.expected}, got ${describeValue(leafValue)}`. `describeValue()`
returns `"an array"` for any array. So for `["src/*.go", ""]` the advisory reads:

```
"citations.extraPaths" must be an array of strings, got an array. The key was ignored and
inherits as if it were absent.
```

Two things are wrong with it as a message to a project owner. It is self-refuting for the element
class, which is the only class this check adds over "is it an array". And `expected` omits the
non-empty part of the rule, which the function's own docstring calls "the element most worth
refusing" because an empty `:(glob)` pathspec lists every tracked file.

The drop itself is correct and whole — verified: `config.citations.extraPaths` comes back `[]`,
inheriting exactly as an omission does. This is about what the advisory says, not what it does.

## Evidence, at `dcdca34c`

`config.test.ts` pins the current wording: the `it.each` block over
`["a bare string", "a list holding a number", "a list holding an empty string"]` asserts only
`toContain("citations.extraPaths")` and `toContain("an array of strings")`, so all three cases pass
with one sentence that is accurate for exactly the first of them.

## The acceptance test

The advisory for a bad element names the element and the property it failed, and the one for a
non-array still names the type. A shared `expected` string cannot do both, so the rule needs a
message the check produces rather than a constant beside it.

---
Reconciled 260905-2015 (reconciler, HEAD `5b84b13a`): still open, unmoved.

`hooks/lib/config.ts` is unchanged in every respect this record names.
`CONTAINER_LEAF_RULES.citations.extraPaths` at `:384-385` still pairs `isArrayOfNonEmptyStrings` with
the constant `expected: "an array of strings"`; `validateLayer()` at `:508` still composes
`must be ${rule.expected}, got ${describeValue(leafValue)}`; and `describeValue()` at `:437` still
returns the container's type. So a list holding an empty string is still told it must be an array of
strings and is an array.

The drop itself is still correct, which is why this is a message defect and not a behaviour one.

Same file as no other open record: this is the only one of the twenty-three that would be repaired by
an edit to `hooks/lib/config.ts`.
