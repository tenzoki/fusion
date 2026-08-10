# Two of the queue-ground lint's negative controls re-implement the logic instead of calling it, and the executor lint's fixture claim is overstated

---

**Severity:** Low
**Domain:** code
**Filed by:** coderev, review of `8960e1a..HEAD` (session `260810-0241`, Turn 1)
**Affects:** `hooks/lib/__tests__/queue-ground-lint.test.ts:222-256`; `hooks/lib/__tests__/executor-verification-report-lint.test.ts:180-193`
**Cross-references:** commits `ff70d3a`, `1f2faaf`; sibling records `260810-0502` (state-drift lint) and `260810-0503` (domain-cascade lint)

---

## The defect, part 1 — `queue-ground-lint.test.ts`

The file has three negative controls. One is real; two do not exercise the production assertions.

**Real** (`:258-269`): calls the shared helper and expects a throw.

```ts
expect(() => assertKeysOnThePointer(groundSection(markerKeyed))).toThrow(
  /does not key on `\.active-circle`/,
);
```

**Tautology** (`:223-234`): builds a string, then asserts that the string it just built lacks a
substring. `assertRidesTheAct` — the production helper — is never called.

```ts
const line = uniqueLine(standalone, /^\*\*The pointer write moves the ground/, "6.3");
expect(line).not.toMatch(/same command/);
```

**Re-implementation** (`:236-256`): the table-splitting logic from the real test at `:149-160` is
copied inline and asserted against, rather than the real test's assertion being invoked.

```ts
const table = section.split(/^\| The queue's head \| `\.active-circle` \| Verdict \|$/m)[1];
const rows = table.split(/^#### /m)[0].split("\n").filter((l) => /^\|/.test(l));
expect(rows.length).not.toBe(5);
```

Both prove something about the fixture and nothing about the gate. If the production row-count or
anchor logic changed, neither would notice.

## The defect, part 2 — `executor-verification-report-lint.test.ts`

The fixture comment at `:180-182` reads *"The coder's Implementation Process exactly as it stood at
HEAD before this change."* Checked against `git show 1f2faaf^:agents/coder.md:65-70`, two things
differ: step 2 (`**Locate** the source root …`) is omitted, and a `### Report shape` heading is
**prepended** that did not exist in the pre-fix text.

The prepended heading is not cosmetic. `reportShape()` requires exactly one `### Report shape` section
and throws otherwise, so the genuine pre-fix text would have failed there — at the parser — rather
than at `assertReportShape`, which is the assertion the test is demonstrating. The fixture was shaped
to route the failure to the intended place.

The negative controls in this file are otherwise the strongest of the four new lints: both call
`assertReportShape` and expect a throw, and the second (`:202-217`) drives a genuinely plausible
half-fix. Only the historical claim is overstated.

## Why this is filed together

`rules/critical-stance.md` §3 is the standard: a claim of verification is permitted only where the
verification happened. Four lints landed tonight and each carries a "the gate catches the defect it
exists for" block. Measured across the cohort: `circle-stash-git-exclusion` and `fusion-count-sources`
are genuine executable gates; `executor-verification-report-lint` is a real gate with an overstated
fixture claim; `queue-ground-lint` is two-thirds decorative; `domain-cascade-order-lint` is half a gate
(`260810-0503`); `state-drift-detection-lint` is the weakest (`260810-0502`).

The pattern is worth naming rather than fixing six times: a negative-control block is only a negative
control when it calls the **same** function the real test calls. Anything else is a second copy of the
logic, and a second copy is the thing these gates exist to prevent.

## Fix direction

Rewrite the two `queue-ground-lint` controls to call `assertRidesTheAct` and the table assertion
directly and expect a throw — which means factoring the table check out of the `it` block at `:147-164`
into a named helper first, the way `assertKeysOnThePointer` already is. Correct the fixture comment in
`executor-verification-report-lint.test.ts` to say the heading is supplied so the parser can reach the
assertion under test.

---

## Reconciliation — `260810-0819`, session `260810-0241` Phase 3

**Still accurate.** Neither `queue-ground-lint.test.ts` (introduced by `ff70d3a`) nor
`executor-verification-report-lint.test.ts` (introduced by `1f2faaf`) has been touched since; every
line range cited above is unchanged.

The two controls still re-implement rather than call: `:223-234` calls `uniqueLine` only and never
`assertRidesTheAct`, and `:236-256` copies the split-and-count from `:149-155` verbatim at `:253-254`.
The third control (`:258-269`, `assertKeysOnThePointer`) is genuine.

**Measured consequence:** replace the body of `assertRidesTheAct` (`:130-140`) with an empty block and
nothing in the file fails — `:223-234` never called it, and its only real caller at `:184` then
trivially passes. The whole four-call-point enforcement is deletable with the negative control
untouched. The same holds for the table check.

One structural note the fix direction should absorb: `assertRidesTheAct` is declared at `:130` as
`function assertRidesTheAct(): void` with **no parameter** — it closes over `orchestrator()`,
`nextSkill()` and `setupSkill()`, which read the real files. A fixture cannot be handed to it, so the
control had nowhere to go but a copy. The factoring the fix direction already asks for is a
precondition, not a tidy-up.

Worth stating so the title is not read too harshly: the *positive* tests here are real gates.
`:183-185` runs `assertRidesTheAct` against the live `agents/orchestrator.md:564`,
`skills/next/SKILL.md:104` and `:160`, and `skills/setup/SKILL.md:240`; `:147-164` counts the real
table's rows. What is decorative is the negative-control block, which is exactly what this record
claims.

**Part 2 (the executor fixture) is overstated by slightly more than the record says.** Against
`git show 1f2faaf^:agents/coder.md`, the fixture at `:180-182` diverges three ways, not two: step 2
(`**Locate** the source root`) is omitted; `### Report shape` is prepended and appears nowhere in the
pre-fix file; and step 5 is truncated at `:189`, keeping only the first clause of `**update status to
"Complete" as final step**`.
