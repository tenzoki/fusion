The "declared but not parsed" guard is anchored like the regex, so two drift shapes still cover less
---
`38fe341` replaced the extension-count floors in `extensions()` with a structural guard:
every line that declares the variable must also parse. The guard decides "declares the
variable" with `line.startsWith(`${varName}=`)` — the same left-anchoring the match
regex uses. So a declaration the regex cannot see is also invisible to the guard, and
the drift the commit exists to catch still passes silently.

Measured against the shipped `bin/fusion-count-sources` (60 CODE_EXT extensions,
19 DATA_EXT): indenting one `CODE_EXT=` line, or rewriting one to `CODE_EXT+=`, leaves
bash computing the identical 60-extension value while `extensions("CODE_EXT")` returns
52 and throws nothing.
---
**Evidence**

`hooks/lib/__tests__/fusion-count-sources.test.ts:80-82`:

```ts
const declared = src.split("\n").filter((l) => l.startsWith(`${varName}=`));
if (declared.length === 0) throw new Error(`${varName}: no assignment lines found in ${script}`);
```

Run against the real script with the same function body, mutating only the one line
`CODE_EXT="$CODE_EXT|c|h|cc|cpp|cxx|hh|hpp|hxx"`:

```
baseline CODE_EXT = 60   DATA_EXT = 19
A: one line indented by two spaces  -> NO THROW, count = 52
B: one line rewritten to +=         -> NO THROW, count = 52
C: one line deleted outright        -> NO THROW, count = 52
```

Case C is correct — the script really does ship 52 then, and covering 52 is right; that
is why removing the floors was the right call. Cases A and B are the defect: both are
valid bash that preserves the runtime value, so the script still ships 60 while the
coverage test asserts over 52 and passes. That is exactly the class named in
`shared/issues/260810-0749_*_the-extension-parse-guards-against-matching-nothing-but-
not-against-matching-less.md`, re-entered at a different anchor by the commit that
closed it.

The three drift shapes the commit *does* close (trailing comment, `${VAR}` rewrite,
variable renamed away) are genuinely closed — verified, the new permanent test passes
and each mutation throws the expected message.

**Fix direction.** Widen only the `declared` filter, leaving the match regex anchored at
`^` so a widened line lands in the filter and then throws "declared but not parsed":

```ts
const decl = new RegExp(`^\\s*${varName}\\+?=`);
const declared = src.split("\n").filter((l) => decl.test(l));
```

Add the two mutations above to the existing permanent test in the same file
(`:302-331`), which already has the `mutate()` harness for exactly this.

**Scope:** `hooks/lib/__tests__/fusion-count-sources.test.ts` only. `bin/fusion-count-sources`
is correct as it stands; this is a test-integrity defect, not a counting defect.

Found in code review of `18b6094..a7c2b03`, commit `38fe341`.
