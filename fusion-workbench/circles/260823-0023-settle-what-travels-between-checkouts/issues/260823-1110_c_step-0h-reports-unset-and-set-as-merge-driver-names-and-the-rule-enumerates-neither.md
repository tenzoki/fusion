Step 0h reports `unset` and `set` as merge driver names, and the rule enumerates only one of the two

---

**Severity:** Low for behaviour, which is correct in every branch. The fault is in what the step tells the user and in one unnamed case.
**Domain:** code
**Filed by:** coderev, reviewing C2 Turn 1
**Affects:** `skills/setup/SKILL.md:325`, `rules/workbench-tracking.md:51`
**Cross-references:** plan step 3 and its `## Approach` diagram in `circles/260823-0023-settle-what-travels-between-checkouts/planning/260823-0800_*_c2-what-travels-between-checkouts-is-settled.md`

---

## What is wrong

The catch-all branch reports:

```bash
*) echo "gitattributes: left alone — this path already has merge driver '$D'" ;;
```

Two values reach it that are not driver names.

- **`unset`**, which a project writes as `-merge`. Merging is switched *off* for that path. The message says the project "already has merge driver 'unset'", which states the opposite of the fact. The rule at `rules/workbench-tracking.md:51` does name this case correctly, so the fault is the operator string alone.
- **`set`**, which a project writes as a bare `merge` with no value. Git then uses its **default text merge**, which is precisely the conflicting behaviour Step 0h exists to prevent. The message calls it a driver, and the rule's enumeration at `:51` names only "a different driver, or switched merging off with `-merge`". This third value appears on neither surface.

Leaving the file alone is defensible in both cases: a project that wrote either line said something. What is not defensible is a report that misnames what it found, at the one moment the user could act on it.

## Verified

Measured at HEAD `2f1e3a6`, running the block as written against six scratch repositories:

```
none         merge: unspecified   -> written
unset        merge: unset         -> left alone — driver 'unset'
setnovalue   merge: set           -> left alone — driver 'set'
broadglob    merge: union         -> already union — nothing written
otherdriver  merge: ours          -> left alone — driver 'ours'
nonewline    merge: unspecified   -> written; neighbour `foo.txt merge=ours` still applies afterwards
```

Three consecutive runs against a `.gitattributes` carrying a comment and one unrelated rule wrote the line exactly once, left the neighbour applying, and wrote nothing on runs two and three. The branch set is disjoint and complete, the newline guard works, and the idempotency claim holds. Only the two messages and the rule's enumeration are wrong.

## One more value with no branch of its own

If `git check-attr` produces no output, `$D` is empty and the message reads "already has merge driver ''". That cannot happen while the guard above holds, and it is named here so a later reader does not take the catch-all for a total function over meaningful values.

## Direction, not a prescription

Split the catch-all's message by value: `unset` says merging is switched off for this path and fusion is leaving that alone; `set` says the path uses git's default text merge, which is the case the rule exists to prevent, and that Setup will not overrule it; anything else names the driver as today. Add the `set` case to `rules/workbench-tracking.md:51` so the rule enumerates the value space its own mechanism reads.

---

Resolved: 2026-08-23 by coder. Both surfaces name the value space they read.

`skills/setup/SKILL.md` splits the catch-all by value. `set` now reports that the path takes git's
default text merge (a bare `merge`), naming it as the case the step exists to prevent and saying
Setup does not overrule it. `unset` reports that merging is switched off for the path (`-merge`).
Anything else keeps the wording it had and names the driver. Behaviour is unchanged in all three:
the file is left alone, which was already correct. The step's branch table says the same in prose —
the fourth outcome reports what was found, "which is not always a driver".

`rules/workbench-tracking.md`'s third branch now enumerates all three: `set` as git's default text
merge and the behaviour the rule exists to prevent, `unset` as `-merge`, anything else as a driver
the project picked, all three deliberate and none overruled.

The empty-`$D` case the record names as having no branch of its own is left as it is: it is
unreachable while the work-tree guard holds, and giving it a branch would assert a value `check-attr`
does not return.

The step's four-outcome table still reads "Four outcomes", correctly — the shell now has five case
arms, but the outcomes for the FILE are still nothing written, written, left alone, and not a work
tree, and the third of those reports three ways.

**Measured.** `rules/workbench-tracking.md` stands on no bounded surface. The `skills/` spend is
accounted in
`260823-1110_*_step-0i-collapses-multiple-active-to-head-1-and-names-one-circle-arbitrarily.md`.

**Files:** `skills/setup/SKILL.md`, `rules/workbench-tracking.md`. Uncommitted at the time of
writing; the orchestrator commits.
