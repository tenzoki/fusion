# fusion-paths overloads exit 3 for two unrelated faults; the conventions Contract omits exit 3 entirely

**Filed:** 260716-2001_*_fusion-paths-exit-3-overloaded-contract-incomplete.md
**Severity:** Low
**Domain:** code
**Filed by:** coderev
**Scope:** `bin/fusion-paths`, `rules/fusion-workbench-conventions.md`

## Problem

Two small contract defects, same surface.

**1. Exit 3 means two different things.** The header documents it as one:

```
#   3  .active-circle is corrupt or orphaned (points at a missing directory)
```

But `value_for`'s unreachable branch also exits 3:

```bash
    *)
      # Unreachable: every key in a KEYS set must be resolvable here. Loud
      # rather than silent, so a future key added to a set without a value
      # cannot ship as an empty string.
      echo "fusion-paths: internal error — no value defined for key '$1'" >&2
      exit 3
```

The instinct is right — loud beats an empty string. The code is reached exactly when
someone adds a key to a `KEYS` set without adding it to `value_for`, which is a live risk
given the key-set changes P-4..P-7 will force. But it borrows a code that already has a
meaning, and the meaning it borrows is the one the conventions turn into user-facing
advice:

> A `.active-circle` pointing at a directory that does not exist is an error: message on
> stderr, non-zero exit, no silent fall back to `shared/`.

`skills/setup/SKILL.md` Step 2 makes it advice: *"A non-zero exit means the workbench state
is inconsistent (an orphaned `.active-circle`); fix that before continuing rather than
guessing a path."* So an agent hitting the internal error will tell the user to fix a
pointer that is fine. The stderr text distinguishes them; the exit code does not, and the
prompt keys on the code.

**2. The Contract section under-specifies exit codes.** `rules/fusion-workbench-conventions.md`
`## Path Resolution` → Contract:

> Exit 2 on unknown agent, exit 1 when no workbench is found — the same shape as
> `bin/fusion-rules`.

Exit 3 is absent, and it is the only code that is *not* the shape of `bin/fusion-rules` —
the one worth naming. `## Failure behaviour` says "non-zero exit" without the number. The
document is meant to be the definition; the script's header is currently more precise than
the document that governs it.

## Impact

Low. Both faults are cosmetic today: exit 3's second meaning is unreachable until someone
edits a key set, and the exit-code table is a doc gap, not a behaviour gap. Filed because
the resolver is about to become the dependency of all 15 agents and 11 skills, and because
the internal-error branch stops being hypothetical the moment issue
`260716-1957_*_fusion-paths-key-sets-miss-reads-agents-perform.md` is fixed — that fix is
precisely "add keys to `KEYS` sets".

## Recommendation

1. Give the internal error its own code — exit 4, or exit 70 (`EX_SOFTWARE`) if a sysexits
   convention is wanted. Anything that is not 3.
2. Add the full exit-code table to the conventions' Contract section: 0 success, 1 usage or
   no workbench, 2 unknown agent, 3 corrupt/orphaned pointer, `<new>` internal error. Note
   which codes are shared with `bin/fusion-rules` and which are this resolver's own — the
   "same shape as fusion-rules" claim is worth keeping, and it is only checkable if the
   divergence is written down.
3. Consider covering the internal-error branch in `hooks/lib/__tests__/fusion-paths.test.ts`.
   The suite has `emits no key it cannot resolve`, which asserts the branch is *not* taken;
   nothing asserts what happens when it is. A test that stubs a bad key would pin the code
   so a later renumbering cannot pass silently.

## Cross-references

- `bin/fusion-paths` header "Exit codes", §4 `value_for`
- `rules/fusion-workbench-conventions.md` `## Path Resolution (Pfadauflösung)` → Contract / Failure behaviour
- `skills/setup/SKILL.md` Step 2
- `hooks/lib/__tests__/fusion-paths.test.ts` → `emits no key it cannot resolve`
- Related: `260716-1957[o]-fusion-paths-key-sets-miss-reads-agents-perform.md`

---
Resolved: commit 6228391 (task T2-A). Verified by the orchestrator against the running system, not by reading.
