# The doc comment for `shippedPrompts` is stranded above `agentNames`

**Status:** open
**Filed by:** coderev, review `260822-1421-coderev-c0-cut-only-circle.md`
**Severity:** Low
**Scope:** `hooks/lib/__tests__/helpers/citation-scan.ts`
**Commit:** `5afb910` (row H5)

## What happened

`hooks/lib/__tests__/helpers/citation-scan.ts:815-829` places the doc comment describing
`shippedPrompts` immediately above `agentNames`, which carries its own one-line comment directly
beneath it:

```ts
/**
 * Every agent prompt plus each skill body, as `{ rel, abs }`. `exempt` names
 * skill DIRECTORIES to skip, which is how the marker-format and path-literal
 * gates let `setup` and `migrate` name what those gates otherwise forbid.
 * Four gates each carried a private copy of this walk until 2026-08-22.
 */
/** Every agent's name, read off the prompt directory rather than hard-coded. */
export function agentNames(): string[] {
```

`shippedPrompts` — the function four lint gates now depend on, and the one whose `exempt` parameter
is the non-obvious half of the refactor — has no doc comment at all. An editor's hover or a reader
scanning the file gets the wrong pairing in both directions.

## Fix

Move the four-line block down to sit immediately above `export function shippedPrompts`. No logic
changes, no test changes; the block already says what `shippedPrompts` does and nothing about
`agentNames`.

## Not a correctness defect

The refactor itself is correct. The four callers were verified against their previous private
walks and read the same file sets: `commit-message-path.test.ts` and `glob-nomatch-lint.test.ts`
pass no exempt set, matching their old `promptFiles()`/`gatedFiles()`; `marker-format-lint.test.ts`
and `path-literal-lint.test.ts` pass `EXEMPT_SKILLS`, matching theirs. The only behavioural
difference is that `readdirSync` results are now sorted, which changes report ordering and not
membership.

---
Resolved: The six-line block was moved down to sit immediately above `export function
shippedPrompts`, leaving `agentNames` with its own one-liner. The finding named the right pair —
verified by reading the file before the move. Line-neutral (950 lines before and after), so no
baseline map and no surface golden moved. `cd hooks && npm test` — exit 0, 41 files, 724 tests.
