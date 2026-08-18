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
test can call them on synthetic reports and assert on the returned string:

- `coverageSentence()` — `hooks/lib/review-coverage.ts:684`
- `stagingSentence()` — `hooks/lib/staging-drift.ts:617`

**Corrected 2026-08-18, before this record was closed.** This section originally asked for a
blacklist on identifier *shape* — that the returned string carry "no workbench-shaped identifier
and no bare short hash", by the two patterns `/\b\d{6}-\d{4}\b/` and `/\b[0-9a-f]{7,40}\b/`. **That
is the wrong criterion and a gate written to it cannot be run**, for the reason the reconciliation
note below states and the analysis
`shared/analyses/260818-0715-preventing-fusion-internal-identifiers-from-reaching-a-consuming-project.md`
then measured: the uncovered branch of `coverageSentence()` legitimately emits four or more of the
*consuming project's own* commit hashes, so the second pattern reddens on its first run against
real data. The wording is corrected here rather than left standing with a note, so that nobody
reading this closed record implements the rejected design.

The criterion that works is **containment**, stated as a set relation rather than as a pattern:

```
identifiers(builder(input)) ⊆ identifiers(input)
```

Every identifier in the emitted sentence must have entered through that call's input. A hash the
report supplied passes; a fusion record stamp typed into a `parts.push` literal has no input to
have come from, so it fails. The two patterns above are still how identifiers are *extracted* —
they are just applied to both sides of the relation instead of to a blacklist. There is no
allowlist and no exemption list.

Gating the output rather than the literals means a part added later is covered without anyone
remembering to extend a list, and a sentence assembled from several `parts.push` calls is covered
whole.

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

---

## Reconciliation 260817-2207 — still open, verified against HEAD `307a696`

Reconciler, final pass of session `260817-2037` (log `shared/history/260817-2207-reconciliation.md`).
Re-measured rather than re-asserted. Three findings.

**1. The record is genuinely open, and the gate does not exist.** No test in
`hooks/lib/__tests__/` drives `coverageSentence()` or `stagingSentence()` and asserts on the
returned string's identifiers: a `grep` for either pattern proposed above
(`\d{6}-\d{4}`, `[0-9a-f]{7,40}`) over `hooks/lib/__tests__/*.ts` returns nothing, and the only
reference to a sentence builder outside its own test file is a comment in
`commit-message-path.test.ts:309`. The premise the record rests on also still holds:
`hooks/lib/__tests__/reference-resolution-lint.test.ts` registers both modules with
`commentRe: TS_COMMENT_RE, recordsOnly: true`, so it still reads comment lines only.

**2. Why it was left open is recorded nowhere in this file.** The two session records carry it and
this record does not: `agentstate.yaml` `plan_context` ("Gate 2: Turn 2 covers M1+L1; 260817-2131
(M2) stays open"), `orchestrator-events.jsonl` (`gate_response`, turn 1, "user scoped Turn 2 to
M1+L1; M2 stays open"), and both coder history files ("`260817-2131` (the lint gate) was out of
scope and stays open"). Stated here so the record itself says why it survived a session that closed
the five defects around it: **user decision at the Turn 1 gate, 2026-08-17, not oversight and not a
missed dispatch.**

**3. The proposed gate fails on `coverageSentence()` as written, by construction.** The
recommendation asks the gate to assert that the returned string carries "no workbench-shaped
identifier **and no bare short hash**", and separately asks that both builders be driven through
their conditional branches. Those two requirements contradict each other for this builder.
`hooks/lib/review-coverage.ts:678-680` emits `report.since`, `report.head` and one `c.short` per
uncovered commit, so the uncovered branch always returns a string full of short hashes:

```
fusion: a review landed and 1 commit(s) in 82a860d..HEAD are still covered by no review's
declared range — 307a696 (fix(hooks): the fourth forbidden staging shape reaches a clause…).
```

Those hashes are the **consuming project's own** commits and are exactly what the sentence is for.
The defect this record is filed against is a citation that resolves in fusion's repository and
nowhere else, which is a property of the identifier's *origin*, not of its shape. Whoever builds
the gate has to separate the two — for example by asserting only against a synthetic report whose
own hashes and stamps are known, and treating anything else in the output as foreign. The record
does not say this, and a gate written to its letter reddens on its first run.

Nothing was renamed. The marker stays `_o_`.

---
Resolved: The containment gate is in — `hooks/lib/__tests__/sentence-identifier-containment.test.ts`,
273 lines. It calls both builders directly on synthetic reports and asserts
`identifiers(builder(input)) ⊆ identifiers(input)` on every branch: `coverageSentence`'s empty,
uncovered, carried-without-`carriedFrom`, carried-with-`carriedFrom` and both branches, and
`stagingSentence`'s no-faults, record (untracked and unstaged rows), commit-message and both
branches — the two that emit nothing included, pinned to `""`. Two further cases pin the gate's own
behaviour rather than the builders': sensitivity, against a stamp injected beside a true
measurement, and specificity, against the branch that emits four of the consuming project's own
hashes and must stay green. A companion assertion holds the registry equal to the `*Sentence`
symbols `hooks/tracker.ts` imports, so a third builder wired into the funnel fails the suite until
it is registered.

Verified by reintroducing a foreign identifier into `coverageSentence()`: four branch cases plus the
specificity case went red, each naming `FOREIGN 260810-1205 — record stamp (YYMMDD-HHMM)`, the
identifiers the input did supply, the sentence returned, the criterion and the fix. Reverted; the
builders are untouched by this change.

The shape-blacklist wording in `## What the gate should be` was corrected in place first (this
record was still open, so the body was edited rather than footnoted). Recommendation 3 of the
analysis — the convention in a rule file — was not chosen by the user and is out of scope here;
`260807-2153` stays open. The static shipped surface is deliberately ungated and must not be swept.
