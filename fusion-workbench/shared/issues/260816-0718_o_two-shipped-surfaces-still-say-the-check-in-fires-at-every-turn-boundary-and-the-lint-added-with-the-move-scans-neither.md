Two shipped surfaces still say the check-in fires "at every Turn boundary", and the lint added with the move scans neither
---
`b00a7a4` moved the Unresolved-budget check-in from the end of a Turn to its start, and added
`turn-budget-lint.test.ts`'s `BOUNDARY_CLAIM` pattern specifically to catch the old placement "coming
back in words". The pattern is scoped to `agents/orchestrator.md` alone. Two other shipped files state
the old placement and are green.
---
**Severity:** Medium — the orchestrator prompt is what an agent executes, so behaviour is correct; but
`README-agents.md` is what a user reads and `CLAUDE.md` is this repository's own normative surface, and
both now describe a mechanism that no longer exists. It is also the exact class `260811-2304` was filed
for, re-created at two new sites in the commit that closed it.
**Domain:** code
**Filed by:** coderev, session `260816-0713`, reviewing range `3a0408a..f77633f`
**Owner:** coder
**Affects:** `README-agents.md:169`, `CLAUDE.md:38`, `hooks/lib/__tests__/turn-budget-lint.test.ts`

## Evidence

`README-agents.md:169`:

> … treats the Max-Turns circuit breaker as not evaluable, and **asks the user at every Turn boundary
> instead**.

`CLAUDE.md:38` (the `bin/fusion-turn-budget` row):

> … and **bounds the loop by asking the user at every Turn boundary instead** (`agents/orchestrator.md`
> Setup Step 2, Step 3d).

Both are falsified by `agents/orchestrator.md:649` at HEAD: "**Where it runs: at the start of a Turn, as
Phase 2 step 1 — not at the end of one.**" `CLAUDE.md:38` additionally routes the reader to "Step 3d",
which is where the gate is *defined* but no longer where it runs.

The detector exists and would fire on both strings. `hooks/lib/__tests__/turn-budget-lint.test.ts`:

```
const BOUNDARY_CLAIM = /\b(?:every|each|the next) Turn boundary\b/i;
…
const offending = offenders(read(ORCHESTRATOR), BOUNDARY_CLAIM, (line) => !/check-in/i.test(line));
```

`ORCHESTRATOR` is the only surface passed to it. `README-agents.md:169` and `CLAUDE.md:38` each match
`BOUNDARY_CLAIM`; neither names "check-in" on the line, so widening the surface needs the exemption
reconsidered rather than copied — a sentence that mis-places the gate without naming it is exactly what
these two are, and the test's own docstring already records that residual as "not reached".

## Fix

Rewrite both sentences to the Turn-start placement, and decide whether the lint's surface widens to the
two READMEs and `CLAUDE.md`. If it does, the "must also say check-in" exemption cannot carry over as-is.
