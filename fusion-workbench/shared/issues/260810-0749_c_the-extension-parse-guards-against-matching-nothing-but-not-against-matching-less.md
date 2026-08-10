# The extension parse guards against matching nothing, but not against matching less

---

**Severity:** Low
**Domain:** code
**Filed by:** coderev, review of `ff70d3a..HEAD` (session `260810-0241`, Turn 2)
**Affects:** `hooks/lib/__tests__/fusion-count-sources.test.ts` — `extensions()` and the coverage test that calls it
**Cross-references:** commit `ea492e6`

---

## The defect

`extensions(varName)` reads the alternations out of `bin/fusion-count-sources` rather than
copying them, for a stated reason: a copy would drift the moment somebody adds a language while
the test kept passing over less. The guard against a failed parse is a floor:

```ts
expect(exts.length).toBeGreaterThan(floor);   // 50 for CODE_EXT, 15 for DATA_EXT
```

That catches a parse matching **nothing**. It does not catch a parse matching **some**, which is
the same drift arriving more quietly. Measured against the script at HEAD:

| Variable | assignment lines | extensions parsed | floor | slack |
|---|---|---|---|---|
| `CODE_EXT` | 11 | 60 | 50 | 10 |
| `DATA_EXT` | 3 | 19 | 15 | 4 |

The regex requires each continuation line to be spelled exactly `CODE_EXT="$CODE_EXT|…"`. A line
rewritten as `CODE_EXT="${CODE_EXT}|…"`, given a trailing comment, or wrapped, stops matching and
contributes nothing. `CODE_EXT`'s lines average 5.5 extensions, so **two** such lines can fall out
before the floor of 50 is crossed — and the test keeps passing while asserting coverage over a
smaller set than the script ships. `DATA_EXT` is not exposed: one dropped line takes it to 13,
under its floor.

## Suggested fix direction

Assert the line count as well as the extension count, so a line that stops matching is a failure
rather than a silent subtraction:

```ts
const declared = src.split("\n").filter((l) => l.startsWith(`${varName}=`)).length;
expect(matchedLines).toBe(declared);
```

That makes the guard structural rather than a magic number, and it removes the two floors, which
themselves have to be re-tuned by hand every time a language is added.

---
Resolved: 38fe341 — `extensions()` now requires every `VAR=` line to match, the variable to carry at least one line, and every parsed token to look like an extension. Both magic floors removed. The token-shape check was added beyond the filed direction: measured, the `${CODE_EXT}` rewrite the record cites does NOT stop matching (the continuation prefix is optional), so it grows the list instead of shrinking it and neither guard would have seen it. A permanent test mutates copies of the source string and asserts each mutation throws.
