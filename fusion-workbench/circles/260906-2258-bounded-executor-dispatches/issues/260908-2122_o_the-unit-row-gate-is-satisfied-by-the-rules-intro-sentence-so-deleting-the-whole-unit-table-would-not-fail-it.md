# The unit-row gate is satisfied by the rule's intro sentence, so deleting the whole unit table would not fail it

**Filed by:** coderev, Kai Stalmann <kai@qantr.com>
**Severity:** Medium
**Found in:** `260908-2110-coderev-bounded-dispatch-closure.md`, finding M4
**Range:** `637d0b04..20796615`

## What is wrong

`hooks/lib/__tests__/bound-agent-set.test.ts`, third case, titled *"every bound agent has a
unit row in rules/bounded-dispatch.md"*:

```
    const rule = readFileSync(join(pluginRoot, "rules", "bounded-dispatch.md"), "utf-8");
    const missing = [...BOUND_AGENTS].filter((a) => !new RegExp(`\`${a}\``).test(rule));
    expect(
      missing,
      "these bound agents are named by bin/fusion-rules and by BOUND_AGENTS but appear " +
        "nowhere in rules/bounded-dispatch.md, so nothing tells them what one unit is.",
    ).toEqual([]);
```

The assertion tests whether the agent's name appears **anywhere in the file wrapped in
backticks**. It does not test the unit table, the row, or that anything says what a unit
is.

All seven names already appear in backticks in the rule's opening paragraph,
`rules/bounded-dispatch.md:8-9`:

> If you are `coder`, `ontocoder`, `bugfixer`, `reconciler`, `coderev`, `ontorev` or
> `curator`, `bin/fusion-rules` emitted this file to you at Setup …

So the case passes on that sentence alone. **Deleting the entire seven-row unit table at
`rules/bounded-dispatch.md:52-60` would leave this gate green**, which is exactly the state
its own failure message declares impossible ("nothing tells them what one unit is").

## Why it is worth filing rather than shrugging at

The gate is the only automated statement that a bound agent knows where its unit boundary
falls, and a bound agent that cannot locate a boundary cannot honour the bound at all — it
is the one obligation the whole mechanism rests on, given the mechanism is requested and
never enforced.

It is also the defect the sibling test in the same range guards against explicitly.
`dispatch-bound-lint.test.ts:196-199` states the doctrine: "The two prompt scans above pass
trivially against a prompt that states nothing, so a pattern whose only evidence is an
empty result is indistinguishable from a broken one", and adds a measured-detector describe
block for exactly that reason. The same author applied the doctrine on one file and not on
the other, in one commit range.

## Fix direction

Assert against the table rather than the file. The rows have a stable shape —
`| \`<agent>\` | <unit> | <anchor> |` — so a per-agent regex anchored on a leading pipe
would test what the title claims:

```
new RegExp(`^\\|\\s*\`${a}\`\\s*\\|`, "m")
```

Worth pairing with an anti-vacuity check of its own, in the sibling's style: a fixture
string holding the intro sentence but no table should make the gate fail.

## What was checked and found sound in the same file

Recorded so the fix does not disturb it. The first two cases of
`bound-agent-set.test.ts` are correct and carefully built: the case-arm derivation names
the failure on both sides, the set-equality case's message says which side to change and
why the two copies exist, and it asserts the `emit_if_exists` line as well as the arm.
`dispatch-bound-lint.test.ts` is sound throughout — positive detection, four
legitimate-line negatives drawn from the real prompt, an anti-vacuity placeholder case, and
its own narrowness pinned as a deliberate absence with instructions for deleting the case
when `BOUND_CONTEXT` is widened.

## Scope

`hooks/lib/__tests__/bound-agent-set.test.ts` only. Neither `BOUND_AGENTS`,
`bin/fusion-rules` nor the rule file is wrong; the gate over them is weaker than it reads.
