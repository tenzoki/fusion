# coder — the declared filter gets wider than the match it guards

**Status:** Complete
**Agent:** coder
**Date:** 260810
**Source:** `260810-0939_*_the-declared-but-not-parsed-guard-is-anchored-like-the-regex-so-two-drift-shapes-still-cover-less.md`
**Files changed:** `hooks/lib/__tests__/fusion-count-sources.test.ts` (only)

## What the task asked

`38fe341` replaced the extension-count floors with a structural guard: every line that
declares the variable must also parse. The guard decided "declares" with
`line.startsWith(`${varName}=`)` — the same left-anchoring the match regex uses — so a
declaration the regex cannot see was invisible to the guard too, and the drift the commit
exists to catch still passed silently. Widen the filter, leave the match anchored.

## What was done

The filter is now its own pattern, deliberately wider than the match:

```ts
const assignment  = new RegExp(`^${varName}="(?:\\$${varName}\\|)?(.+)"$`);
const declaration = new RegExp(`^\\s*${varName}\\+?=`);
const declared = src.split("\n").filter((l) => declaration.test(l));
```

A widened line lands in `declared` and then fails `assignment`, so it throws "declared but
not parsed" instead of being dropped. The match regex is untouched. The comment block above
`extensions()` gained the third drift shape and — separately — the statement that a deleted
line must *not* be caught, since that is the whole difference between this guard and the
floors it replaced.

Three assertions were added to the existing permanent test, using its `mutate()` harness:

- one `CODE_EXT=` line indented by two spaces → throws `declared but not parsed`
- one rewritten to `CODE_EXT+="|c|h|…"` → throws `declared but not parsed`
- one deleted outright → does **not** throw, and the extension count drops by exactly 8,
  asserted relative to the unmutated count rather than against a literal 60/52

The `+=` fixture drops the `$CODE_EXT|` prefix (`CODE_EXT+="|c|h|…"`, not
`CODE_EXT+="$CODE_EXT|c|h|…"`). The record's spelling would have doubled the value at run
time; the fixture has to preserve it, or it is not the defect being pinned.

## Measured, not reasoned

A scratch probe ran both filters — old and new — against the real script for each mutation,
alongside the value bash actually computes for that mutated source:

```
                        bash   old filter      new filter
baseline                60     count 60        count 60
A indented two spaces   60     count 52        THROW declared but not parsed
B rewritten to +=       60     count 52        THROW declared but not parsed
C deleted outright      52     count 52        count 52
```

So both new assertions fail against the pre-fix filter (they are load-bearing, not decorative)
and case C is unchanged in both. The three shapes `38fe341` closes still throw — their
assertions are untouched and green.

## The residual, named rather than patched

Same probe, four more spellings. Each is valid bash that leaves the runtime value at 60, and
each escapes **both** filters — no throw, count 52:

```
export CODE_EXT="$CODE_EXT|…"          bash=60   old 52   new 52
declare CODE_EXT="$CODE_EXT|…"         bash=60   old 52   new 52
: ; CODE_EXT="$CODE_EXT|…"             bash=60   old 52   new 52
printf -v CODE_EXT '%s' "$CODE_EXT|…"  bash=60   old 52   new 52
```

The generalisation: **a declaration whose variable name is not the first token on the line
escapes the filter.** `typeset`/`readonly` behave as `declare`; `read -r CODE_EXT <<<…` and
`eval` behave as `printf -v`; `&&`/`||` behave as `;`. A value-preserving rewrite that *is*
first-token is already caught — `CODE_EXT="$CODE_EXT"'|c|h|…'` throws under both filters,
because the match regex rejects it.

Not widened further, per the task's instruction. Widening again would mean a filter matching
`CODE_EXT` anywhere on a line, which would start catching the script's own *uses*
(`count_matching "$CODE_EXT"`) and the header comment, and would be round four of a class
each of whose rounds moves one anchor. The question underneath is whether "what does this bash script
assign" is answerable by reading its text at all; the decided form of it — ask bash for the
value and compare — is a mechanism change, not another regex. That is the record's subject,
not this patch's.

## Verification

`cd hooks && npm test` — exit 0. 38 files passed, 1007 tests. Matches the stated baseline of
38 files at `7f617b1`. The test total is not stable run to run (filed as `260810-0918`); the
exit code was read from `$?` on a redirected run, not inferred from the summary line — the
first attempt's `${PIPESTATUS[0]}` read empty under zsh and was discarded rather than reported.

Nothing failed naming `bin/fusion-plane` or `hooks/clear-halt.ts`, the two files under
concurrent edit.

## Not done, by instruction

No commit, and the issue file's `_o_` marker is unchanged — the user does both after validating.
