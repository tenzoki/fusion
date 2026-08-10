# The domain-cascade lint is defeated by a decoy branch, and one of its two helpers has no negative control

---

**Severity:** Medium
**Domain:** code
**Filed by:** coderev, review of `8960e1a..HEAD` (session `260810-0241`, Turn 1)
**Affects:** `hooks/lib/__tests__/domain-cascade-order-lint.test.ts` — `firstIndex` (`:67`), `assertCodeCountFirst` (`:74-89`), `assertAbsentCountFirst` (`:92-104`), the negative-control block (`:138-146`)
**Cross-references:** commit `31d8bb3`; `shared/issues/260807-1942_*` (the defect the lint guards)

---

## The defect

The lint measures branch **order** by asking, for each branch, whether its text *mentions* a token:

```ts
:67   const firstIndex = (branches: string[], re: RegExp) => branches.findIndex((b) => re.test(b));
```

`firstIndex(branches, /\bcode_files\b/)` is satisfied by any branch containing the string
`code_files`, whether or not that branch can ever fire. Three edits that reinstate the original defect
therefore pass, all confirmed by probing the helpers directly:

- **A decoy branch.** Insert `elif code_files < 0: domain = "code"` as the second branch and restore
  the entire pre-fix order beneath it. Both helpers pass. `code_files < 0` is unsatisfiable, so the
  cascade behaves exactly as it did before `31d8bb3`.
- **An inverted condition.** `elif code_files == 0: domain = "code"` in the `code_files > 0` slot
  passes. Order preserved, meaning inverted.
- **A dead threshold.** `elif code_files > 100000: domain = "code"` passes. Every real project falls
  through to the artifact branches — issue `260807-1942` reinstated with the suite green.

## Second defect: one helper is never shown to reject anything

The negative-control block has two tests:

```ts
:139  it("rejects the pre-fix order, where both strategic branches precede the code count", () => {
:140    expect(() => assertCodeCountFirst(branchesFrom(preFixCascade))).toThrow(/260807-1942/);
:141  });
:143  it("accepts the pre-fix absent-count position, which was already correct", () => {
:144    expect(() => assertAbsentCountFirst(branchesFrom(preFixCascade))).not.toThrow();
:145  });
```

`:140` is a real gate: production helper, expects a throw, matched on an issue-ID substring only that
helper emits. `:144` is a second **positive** assertion, not a negative control. `assertAbsentCountFirst`
— the helper guarding the `counted_by == "none"` line, which `agents/orchestrator.md` calls
"load-bearing" — is never demonstrated to fail on anything. Probing it directly confirms it *can*
throw, so this is a gap in the test rather than in the helper.

## What is right, and should be kept

The fixture claim at `:125-136` ("the cascade exactly as it stood at `2910cf6`") is substantially
**true** — checked against `git show 2910cf6:agents/orchestrator.md:131-136`, byte-identical modulo
trailing comments and indentation that `branchesFrom` trims anyway. That is better than the sibling
lint filed as `260810-0502`, and worth saying.

The cascade itself is sound: read as a chain it is disjoint and complete, with a final `else`, so
`rules/critical-stance.md` §4 is satisfied by the design. The lint is the weak part, not the change.

## Fix direction

Two options, and the second is the one worth the effort.

1. Tighten the token match to the branch's *condition* rather than its text, so a decoy that can never
   fire is not counted as the code-count branch.
2. **Stop linting the prose and execute the cascade.** The cascade is six lines of pure decision logic
   over five integers. Lifting it into a small function next to `bin/fusion-count-sources` and asserting
   the *verdicts* for the projects the commit message already measured (Cargo 0→27, Go 0→19, frontend
   50→11, this repo 4→88, KRK 0→108, ontology 2/30) would gate behaviour instead of layout, and would
   catch all three defeats above. `circle-stash-git-exclusion.test.ts` in this same range is the
   worked precedent for extracting executable logic out of a prompt body and running it.

Either way, add the missing negative control for `assertAbsentCountFirst`.

---

## Reconciliation — `260810-0819`, session `260810-0241` Phase 3

**Still accurate. All three defeats reproduce, and there is a fourth.**
`hooks/lib/__tests__/domain-cascade-order-lint.test.ts` has not been touched since `31d8bb3`;
`firstIndex` (`:67`) still asks whether a branch line *mentions* `code_files`, not whether it can
fire. Both production helpers were loaded out of the test file and run against mutated cascades in
memory:

| Cascade | `assertCodeCountFirst` | `assertAbsentCountFirst` |
|---|---|---|
| HEAD (`agents/orchestrator.md:133-147`) | PASS | PASS |
| Decoy `elif code_files < 0` above the pre-fix order | **PASS** | **PASS** |
| Inverted `elif code_files == 0` in the `> 0` slot | **PASS** | **PASS** |
| Dead threshold `elif code_files > 100000` | **PASS** | **PASS** |
| Token only in a trailing comment | **PASS** | **PASS** |

The last row is new: `branchesFrom` (`:58-61`) keeps the whole line including its trailing comment,
and the cascade in the prompt is comment-heavy, so `elif issues_count < 0: domain = "code"   #
code_files not read` satisfies the order assertion. "Can still reach all four domains" (`:115-122`)
passes in every case too, because all four `domain = "..."` assignments survive.

So the decisive answer is yes: **`260807-1942` can be reinstated in full with the suite green.**

`:143-145` remains a second positive assertion (`.not.toThrow()` on `assertAbsentCountFirst`);
nothing in the file demonstrates that helper rejecting anything. The record's own concession also
still holds — the fixture at `:127-136` is a faithful copy of the `2910cf6` cascade, which is more
than the sibling lint can say.
