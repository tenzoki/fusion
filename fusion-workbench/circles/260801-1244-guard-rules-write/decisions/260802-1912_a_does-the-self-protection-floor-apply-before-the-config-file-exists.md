# Does the self-protection floor apply before `fusion-guard.json` exists?

---
**Domain:** code
**Status:** answered
**Filed by:** orchestrator, from a planner finding at the plan gate
**Cross-references:** `shared/planning/260801-1122_o_spec-normative-consolidation.md:293` (seeding) and `:301` (the floor); `circles/260801-1244-guard-rules-write/planning/260802-1856_o_plan-guard-rules-write.md` `## User Decisions Pending`; `circles/260801-1244-guard-rules-write/_t_circle.md` `## Directive`

---

## Question

The spec states two requirements that cannot both hold literally in a consuming project.

The self-protection floor (`:301`): the effective `protectedPaths` "always includes the project
configuration file itself, regardless of what that file says". Without it, an agent could unprotect
its own guard configuration in a single edit.

The seeding (`:293`): `/fusion:setup` creates `fusion-guard.json` the way it already seeds
`plane.config.yaml`, idempotently, never overwriting a filled-in file.

If the floor applies unconditionally, setup's own write is a write to a protected path, and the
guard denies it. The file can then never be created by the mechanism meant to create it. The planner
verified this by construction rather than by argument: `matchesAny("fusion-guard.json", [...,
"fusion-guard.json"])` returns true, and setup's `cp` is a recognised mutation with a literal
operand, so it reaches the deny.

Which requirement gives is a security property, not an implementation detail, which is why the
planner escalated rather than choosing.

## Options

1. **The floor applies once the file exists on disk.** Creating an absent file is permitted once;
   every subsequent write and every delete is blocked.
   - Pros: setup works unchanged, with no manual step. The absent state is not reachable again
     through a guarded surface, because `rm fusion-guard.json` targets an existing file and the
     floor is in force by then.
   - Cons: weakens a stated invariant. In a project that has not run `/fusion:setup` since this
     version, an agent could create a `fusion-guard.json` that narrows `protectedPaths`.
2. **The floor stays unconditional.** `/fusion:setup` tells the user to create the file in their own
   terminal.
   - Pros: preserves the invariant literally, with no residual.
   - Cons: costs every consuming project a manual step at setup. A manual setup step is the kind of
     friction that gets skipped, and a project that skips it silently keeps the plugin's list.

## Constraints

- Setting `FUSION_ALLOW_RULES_WRITE` must not open a route to the configuration file: the flag
  exempts the project's rule directories only, and `fusion-guard.json` is not one.
- Whatever is chosen must hold identically in a consuming project and be stated in the guard's own
  documentation, not only here.

---
Answered: user decision at the plan gate, 260802-1912 — **option 1, the floor applies once the file
exists**. The residual is accepted on the grounds that a creation appears in a git diff, which is
precisely the property decision D-c chose the project root to obtain
(`shared/decisions/260801-1020_a_may-any-fusion-writer-touch-rules.md`; spec `:291`). The plan
proceeds on this answer: Step 6's floor condition and Step 8's seeding block both implement it, and
the residual is to be stated in `rules/protected-path-discipline.md` at Step 9 rather than left in
this record alone.
