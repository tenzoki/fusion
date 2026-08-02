The corpus test's name and its vacuity message still say `rules/*.md` after the gate's file set became every `.md` under `rules/` at any depth
---
`hooks/lib/__tests__/provenance-header-lint.test.ts:160` and `:175` describe the gated set with the flat glob `rules/*.md`, but commit `cc004fc` made `gatedFiles()` recursive, and the file's own header comment at `:21` now says the opposite: "The file set is every `*.md` under `rules/` at ANY depth". Change both strings to `rules/**/*.md`, or to prose matching the header comment.
---
The two stale strings:

- `:160` — `it("passes on the whole corpus — every rules/*.md has a header in the window", ...)`. This is the line a contributor sees in the vitest runner when the gate fails.
- `:175` — the vacuity guard's message, `` `no rules/*.md files found under ${pluginRoot} — the corpus test above would pass vacuously` ``.

Both were correct before `cc004fc` and are now contradicted inside the same file. Verified against the code at `:105-118`: `gatedFilesUnder` calls `readdirSync(dir, { recursive: true, withFileTypes: true })` and `gatedFiles()` is a one-line wrapper over it.

Why it is worth fixing rather than tolerating: the recursion exists specifically so the `circles/260801-1244-curator` shards are gated whether they land as `rules/<name>.md` or `rules/<subdir>/<name>.md`. When a nested shard is the file that fails, the runner line a contributor reads will name a glob that does not include it. Low severity, but this is the same defect class as `260802-1253` (a claim that was true when written and was invalidated by the corpus moving), here invalidated by the code moving under it.

Scope: one test file. No behavioural effect — the assertions are correct, only the two human-readable strings are stale.
