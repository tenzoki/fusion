# Migration idempotency claim is false for un-markered `circles/*.md` — Setup nags forever with no resolution path

**Filed:** 260716-1959_*_migration-idempotency-hole-unmarkered-circle-md.md
**Severity:** Medium
**Domain:** code
**Filed by:** coderev
**Scope:** `skills/setup/SKILL.md` Step 0c

## Problem

Step 0c states the guarantee explicitly:

> **This is also the idempotency guarantee.** A successful migration removes exactly the
> things the detector looks for. Run this step twice and the second run finds nothing and
> does nothing.

The detector looks for, among other things, any `circles/*.md`. The executor skips a
`circles/*.md` that carries no parsable marker, loudly, and leaves it in place — correctly,
per its own "skip loudly rather than guess" posture. The two rules contradict: the executor
leaves behind a thing the detector looks for, so the second run finds it and asks again.
And the third. There is no state the user can reach through Setup that stops it.

## Evidence

Fixture with one un-markered `circles/README.md` plus normal content. First run of the
Step 0c Execute block:

```
UEBERSPRUNGEN: ./fusion-workbench/circles/README.md traegt keinen Marker.
---
verschoben=7 kollisionen=1 mv-fallbacks=0 mode=git
```

Second run of the Step 0c Survey block:

```
  planning/        -> shared/planning/        1
  circles/README.md
FOUND=1
```

`FOUND=1`, so Setup asks the user to migrate again. The `planning/` line is the collided
file and re-firing there is *intended* — the doc says so, and the user can resolve it. The
`circles/README.md` line is not resolvable: migrating again skips it again.

## Impact

Low-severity in consequence, medium in annoyance and trust. Every Setup run on an affected
workbench opens with a migration question that has nothing left to do. The user's only
escape is to delete or rename the file themselves — which Setup never tells them, because
the survey line for an un-markered file (`— KEIN MARKER, wird übersprungen`) reads as
information, not as an action item. A prompt that fires forever gets clicked through
without reading, which is exactly the habit that makes the *next*, real migration question
dangerous.

A `circles/README.md` is not hypothetical: a directory whose purpose is non-obvious is
where people put a README.

## Recommendation

Separate "would move" from "found something". Concretely: keep un-markered `circles/*.md`
out of `FOUND`, and report them as a standing note rather than a trigger.

- Survey: count un-markered `circles/*.md` into a separate `SKIPPED` counter, not `FOUND`.
  If `FOUND=0` and `SKIPPED>0`, print the one-line note in the Setup summary
  ("`circles/README.md` carries no marker and is ignored by the migration") and skip the
  question.
- Same treatment for the collision case would be wrong — a collision *is* resolvable and
  re-asking is the recovery path. Keep collisions in `FOUND`.

The general principle worth writing into the step: the detector must look for things the
executor can *remove*, not for things the executor merely *inspects*. The current detector
conflates the two, and the filesystem-is-the-flag design (which is otherwise the right
call) has no way to remember "the user already saw this one".

## Cross-references

- `skills/setup/SKILL.md` Step 0c → "Detection is by artifact presence, not by version" / "Survey" / "Execute"

---
Resolved: commit 6228391 (task T2-A). Verified by the orchestrator against the running system, not by reading.
