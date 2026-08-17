Step 11's line-scoped Changes text misses two stale lines in files it already opens

---

Step 11 lists nine files and, for six of them, names the lines to change. Two lines that are false
at HEAD sit in files the step already opens and are not among the lines it names, so an executor
working the Changes text literally leaves them.

**1. `agents/orchestrator.md:122` — the merge account, not only the filename.** Step 11's entry
reads "the Turn-budget paragraph at `:122` (filename)". The line says:

> it is declared in the project's `fusion-guard.json` as `{"orchestrator": {"maxTurns": <n>}}`,
> merged per leaf over the plugin's configuration and then over fusion's built-in default, exactly
> as every guard setting is.

Three things are wrong, and the parenthesis scopes the fix to one. The filename changed; the
plugin layer is gone, so there are two layers and not three (`hooks/lib/config.ts:4-18`); and
"exactly as every guard setting is" names a class with no members — the guard has no settings
(`hooks/lib/config.ts:344-345`). `README-agents.md:169` carries the same three errors and step 11
*does* name all of them there, which is what makes the narrower scoping here look deliberate
rather than short.

**2. `bin/monitor:188` — the second stale comment in a file the step opens for its first.** Step
11 names `bin/monitor:212` ("a comment lists a corrupted escalation counter among the causes of a
`guard_advisory`"). Twenty-four lines above it:

```
# for as long as its cause stands — a project whose fusion-guard.json carries a
# wrong-typed key, or the retired guard.protectedPaths key, gets one on every
# single call until the line is edited.
```

Both examples are now wrong in the same sentence: `fusion-guard.json` is not read at all, and
`guard.protectedPaths` is no longer a retired *leaf* — the leaf-scoped table folded away and the
key sits inside a retired container (`hooks/lib/config.ts:99-103`). The paragraph's argument — why
the advisory class gets its own cap — is unaffected and the two examples are simply out of date;
the fix is two clauses, and the current examples are to hand, a retired *file* and a retired
top-level key.

Neither line is reachable by `reference-resolution-lint`: `fusion-guard.json` written without a
directory is not a path, and `guard.protectedPaths` is a key rather than a file. This is the limit
Turn 1's cross-cutting observation 2 named, arriving in two more places.

**Severity:** Low. Both are comments, both are in files step 11 already opens, and the fix is one
sentence each. Filed rather than waved through because a line-scoped Changes text is exactly the
instrument that lets a file be edited and a line in it left alone.

**Scope:** `agents/orchestrator.md` is shipped to every consuming project; `bin/monitor` is a
developer-facing comment.

**Cross-references:**
- `circles/260816-1741-guard-becomes-observation-only/planning/260816-1915_p_the-compliance-guard-becomes-observation-only.md` step 11
- `circles/260816-1741-guard-becomes-observation-only/reviews/260816-2135-coderev-the-guard-stops-deciding-turn-1.md` `## Cross-cutting observations` 2
- `hooks/lib/config.ts:4-18`, `:99-103`, `:344-345`

---

Resolved: both lines corrected in full rather than at the clause the step's line-scoped text named. `agents/orchestrator.md:122` now reads `fusion.json`, states the merge as two layers over the built-in default, and says this is the only setting fusion resolves — so all three errors go, not the filename alone. `bin/monitor:188` replaces both stale examples with current ones: a wrong-typed key in `fusion.json`, and a project root still holding the retired `fusion-guard.json` **file** rather than the retired `guard.protectedPaths` leaf. The paragraph's argument for the advisory class having its own cap is untouched, as this record said it should be. The neighbouring fail-open comment 24 lines below was corrected in the same pass for the same reason — it named a corrupted escalation counter as an example fault and claimed a tracker failure does not stop the guard from blocking. Landed with plan step 11.
