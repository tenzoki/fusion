Step 0h reports `unset` and `set` as merge driver names, and the rule enumerates only one of the two

---

**Severity:** Low for behaviour, which is correct in every branch. The fault is in what the step tells the user and in one unnamed case.
**Domain:** code
**Filed by:** coderev, reviewing C2 Turn 1
**Affects:** `skills/setup/SKILL.md:325`, `rules/workbench-tracking.md:51`
**Cross-references:** plan step 3 and its `## Approach` diagram in `circles/260823-0023-settle-what-travels-between-checkouts/planning/260823-0800_o_c2-what-travels-between-checkouts-is-settled.md`

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
