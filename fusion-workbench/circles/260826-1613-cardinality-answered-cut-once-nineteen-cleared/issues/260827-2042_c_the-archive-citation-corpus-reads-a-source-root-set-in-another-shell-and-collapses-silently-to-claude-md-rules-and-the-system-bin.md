The archive citation corpus reads a source root set in another shell, and collapses silently to CLAUDE.md, rules/ and the system /bin

---
`skills/archive/SKILL.md:195` builds the citation corpus from `"$FUSION_SRC"/…`, a variable Step 1's block (`:39-44`) set in a different shell. Run as written with the variable empty, the corpus is `CLAUDE.md rules /bin`: every shipped surface the filter was widened to protect (`agents/`, `skills/`, `hooks/lib/`, `docs/`, `README*.md`) is dropped without a word, and `/bin` (the system directory, because `""/bin` exists) is grepped instead. The existence guards written to let a consuming project degrade gracefully are what make the collapse silent.
---
**Filed by:** coderev, Kai Stalmann <ks@qantr.com>
**Cross-references:** `260825-1440_*_the-archive-safety-filter-checks-only-claude-md-while-the-citation-lint-guards-a-corpus-thirty-one-files-wider.md` (the record this step closed; the failure it names returns through this defect); `260827-1756_*_which-citation-corpus-does-the-archive-safety-filter-protect.md`; `skills/setup/SKILL.md:26` (the opposite convention, stated: "Each shell call gets a fresh shell, so every executable check in this file calls the helper again")

## Evidence

Measured 260827 at `e9dc9b2`, the block at `skills/archive/SKILL.md:195` executed verbatim in this repository:

```
FUSION_SRC=""   -> corpus: CLAUDE.md rules /bin
FUSION_SRC=$PWD -> corpus: 21 entries
```

The same block's `2>/dev/null` on both `find` calls hides the `find ""` error. Commit `d1489cc`.

The `open_in()` function at `:187` inherits the same pattern for `$SHARED_ISSUES`, `$SHARED_PLANS`, `$SHARED_DECISIONS` (derived in Step 1's shell); that pattern predates this range and is noted here because a fix should cover both blocks the same way.

## Fix direction

Resolve the root inside the Step 4 block (the guarded `bin/fusion-source-root` call Step 1 uses, with the `$FUSION_PLUGIN_ROOT` fallback) and halt on an empty result the way `shared_of` already halts (`HYG-NO-SILENT-FAIL`); never let `""/bin` reach the corpus. Same treatment for the `$SHARED_*` values `open_in()` reads.

## Acceptance

The Step 4 block run in a fresh shell in this repository greps 21 entries, none of them `/bin`; run with `$FUSION_PLUGIN_ROOT` unset it stops and names the unresolved root instead of surveying.

**Resolved:** 260827, coder (Turn 2). `skills/archive/SKILL.md` Step 4 now resolves the source root inside its own block (`SRC` from the guarded `bin/fusion-source-root` call with the `$FUSION_PLUGIN_ROOT` fallback, the Step 0e form) and reads no variable from another shell; an empty root prints `filter 3 skipped: source root unresolved (FUSION_PLUGIN_ROOT unset)` and adds no entry, so `""/bin` never reaches the corpus. Filter 3 prose names the skip. Measured in a fresh `bash -c` from the repo root: resolved → 21 entries, none `/bin`; `FUSION_PLUGIN_ROOT` unset → the report line and 0 entries. Not done here, under the +300-byte `skills/` cap: the `$SHARED_*` values `open_in()` reads from Step 1 keep the cross-shell pattern the record notes as pre-existing.
