Nothing stops a fusion workbench id returning to an emitted hook sentence, because the lint reads comment lines only

---

`bd2db5c` removed four fusion-internal identifiers from the two model-facing sentence builders
by hand. It added no gate. The next edit to either sentence can put one back, and every check
in the repository stays green — which is how the four got there in the first place.

---

## Why no gate saw them

`hooks/lib/__tests__/reference-resolution-lint.test.ts` is the gate that resolves citations in
shipped text. It **does** scan both modules, and it scans **comment lines only**
(`:173-177` and `:183-187`, each entry carrying `commentRe: TS_COMMENT_RE`, which is
`/^\s*(?:\/\/|\/\*|\*)/` at `:129`). Its own comment states the exclusion and its reason
(`:169-173`):

> Code lines stay out of scope: string literals there are classifier inputs and deny-reason
> text, not references.

That premise held when it was written, for the guard-era modules. It does not hold for
`hooks/lib/review-coverage.ts` and `hooks/lib/staging-drift.ts`: their string literals were
references, they cited four workbench records and a commit hash, and they were the *only*
citations in the plugin addressed to a reader who cannot resolve them.

Note that the gate could not have caught them even if it had scanned those lines. It asserts
that a citation resolves **in this repository**, and all four did. The defect is the reverse
property: a citation that resolves here and nowhere else. No existing check expresses it.

## What the gate should be

Assert on the **output**, not on the source text. Both builders are exported and pure, so a
test can call them on synthetic reports and assert the returned string carries no
workbench-shaped identifier and no bare short hash:

- `coverageSentence()` — `hooks/lib/review-coverage.ts:684`
- `stagingSentence()` — `hooks/lib/staging-drift.ts:617`

Two patterns cover everything that has appeared: `/\b\d{6}-\d{4}\b/` (the `YYMMDD-HHMM` record
stamp) and `/\b[0-9a-f]{7,40}\b/` (a git object name). Gating the output rather than the
literals means a part added later is covered without anyone remembering to extend a list, and
a sentence assembled from several `parts.push` calls is covered whole.

Both builders need to be driven through their conditional branches for the check to be worth
anything: `coverageSentence` has an uncovered branch and a carried branch,
`stagingSentence` a `record` branch and a `commit-message` branch, and each returns `""` when
its report is empty.

## Scope

`hooks/lib/review-coverage.ts`, `hooks/lib/staging-drift.ts`, and whatever hook sentence
builder is added next — the gate is worth having precisely because it covers the third one
nobody has written yet.

`hooks/lib/domain-cascade.ts:528` names two records in a `CascadeError` and is **out of scope**
by the user's decision at the 2026-08-17 gate: that module is reached only from the lint tests,
so its text never enters a consuming session. Recorded here only so the exclusion is visible to
whoever writes the gate, not as a defect against that file.

**Severity:** Medium
**Filed by:** coderev, review of `82a860d..bd2db5c`
**Cross-references:** `shared/issues/260817-2110_*_the-hook-sentences-cite-fusions-own-workbench-ids-and-a-fusion-commit-hash-into-a-consuming-projects-session.md` (the defect this would gate against), `shared/issues/260807-2153_*_the-exempt-surface-list-is-plugin-repo-shaped-but-ships-to-every-consumer.md` (same class, one layer up)
