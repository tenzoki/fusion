# The domain-cascade lint is defeated by a decoy branch, and one of its two helpers has no negative control

---

**Severity:** Medium
**Domain:** code
**Filed by:** coderev, review of `8960e1a..HEAD` (session `260810-0241-orchestrator-session.md`, Turn 1)
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
  through to the artifact branches — issue `260807-1942_*_die-domaenenerkennung-entscheidet-vor-der-codezaehlung-und-erreicht-code-nie.md` reinstated with the suite green.

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
lint filed as `260810-0502_*_the-state-drift-lint-anchors-on-the-phrase-it-checks-and-one-negative-control-is-a-duplicate.md`, and worth saying.

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

## Reconciliation — `260810-0819`, session `260810-0241-orchestrator-session.md` Phase 3

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

So the decisive answer is yes: **`260807-1942_*_die-domaenenerkennung-entscheidet-vor-der-codezaehlung-und-erreicht-code-nie.md` can be reinstated in full with the suite green.**

`:143-145` remains a second positive assertion (`.not.toThrow()` on `assertAbsentCountFirst`);
nothing in the file demonstrates that helper rejecting anything. The record's own concession also
still holds — the fixture at `:127-136` is a faithful copy of the `2910cf6` cascade, which is more
than the sibling lint can say.

---

## Resolved — `260810-1646-orchestrator-session.md`, session `260810-1646-orchestrator-session.md` Turn 1

**Fix direction 2, taken.** The cascade is no longer linted as prose; it is executed.

`hooks/lib/domain-cascade.ts` extracts the fenced block from `agents/orchestrator.md`, parses each
branch's condition into an expression tree and evaluates it against a set of counts. There is
deliberately **no second copy** of the six branches in TypeScript: the interpreter runs the prompt's
own block, so prompt and function cannot drift — the drift is unrepresentable rather than guarded
against. The grammar is strict; anything it cannot read raises `CascadeError` rather than being
skipped, so a renamed count, an unanticipated condition form, a missing final `else` or a fifth
domain fails loudly instead of quietly narrowing what the gate covers.

`hooks/lib/__tests__/domain-cascade.test.ts` asserts three properties:

1. **Verdicts** for the projects commit `2910cf6` measured — this repository (88/21) and KRK
   (108/11) reach `code`, an ontology tree (2/30) reaches `data`, and Cargo (27), Go (19) and the
   frontend (11), whose data side was never measured, reach `code` for every data count that does
   not trip the documented ratio. Every `code`/`data` scenario carries the artifact profile that
   produced the original defect (122 commits, 3 open decisions against 1 open defect record), so a
   `strategic` answer anywhere is `260807-1942_*_die-domaenenerkennung-entscheidet-vor-der-codezaehlung-und-erreicht-code-nie.md` returning. One case measures this repository live
   through `bin/fusion-count-sources`.
2. **No dead branch** — every branch fires for some input across a 5 000-case sweep. A branch that
   can never fire is not decision logic.
3. **The absent count** stays out of arithmetic: `unavailable` is modelled as the string the helper
   actually prints, so a count branch lifted above the `counted_by == "none"` line raises instead of
   silently comparing. That is the behavioural form of the load-bearing position.

**All four defeats were applied to the real prompt and measured**, alongside the predecessor gate
taken verbatim from `HEAD` — which confirms this record's finding rather than taking it on trust:

| cascade | behavioural (new) | order lint (new) | order lint (the predecessor) |
|---|---|---|---|
| unmutated prompt | PASS | PASS | PASS |
| decoy `elif code_files < 0` above the pre-fix order | **FAIL** | PASS | PASS |
| inverted `elif code_files == 0` in the `> 0` slot | **FAIL** | PASS | PASS |
| dead threshold `elif code_files > 100000` | **FAIL** | PASS | PASS |
| token only in a trailing comment | **FAIL** | **FAIL** | PASS |

The order lint is kept as the narrower second gate — the prompt's own prose asks an editor for that
order, so something should measure it — but it is no longer the primary one and its header says so.
It now reads the **parsed condition** rather than the line's text, which is why the comment defeat
fails there too; it still cannot see a condition that can never hold, and that is the sibling file's
job by design, not an oversight.

**The second defect is closed too.** `assertAbsentCountFirst` now has a real negative control: a
cascade with `if code_files > 0` standing above the `counted_by == "none"` branch, expected to
throw, matched on `260807-1951_*_die-tiefenschranke-der-codezaehlung-sieht-keinen-cargo-workspace.md` — an issue ID only that helper emits. The pre-fix `.not.toThrow()`
assertion is kept alongside it, since the pre-fix absent-count position genuinely was correct.

`agents/orchestrator.md` was **not** edited: locating the block by its content needs no marker, and
the anti-drift property comes from having one definition rather than from an anchor.

Verification: `npm test` from `hooks/` — exit 0, 1096 tests across 41 files.
