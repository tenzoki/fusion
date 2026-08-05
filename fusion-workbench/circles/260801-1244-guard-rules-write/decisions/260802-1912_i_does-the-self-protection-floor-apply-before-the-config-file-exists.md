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

---

**Reconciliation 260803-1516 (reconciler, domain `code`) — stays `_a_`. The answer is recorded and correct; nothing has realised it.**

The floor this record decides sits in plan Step 6, and Step 6 has not begun: `hooks/lib/config.ts` has no `PROJECT_CONFIG_FILENAME`, no `diagnostics` field, and still resolves one source at module load (`:34`). There is no `fusion-guard.json` anywhere in the tree and no seeding block in `skills/setup/SKILL.md`, so the collision this record resolves has not yet been reachable in practice.

The `Answered:` footer cites "user decision at the plan gate, 260802-1912" rather than a `<path>:<line>`, which is what `rules/fusion-workbench-conventions.md` `## State Markers — decisions` asks for. The answer itself is unambiguous and is restated in full in the footer, so this is a citation-form note, not a doubt about the content. The resolvable citation is the plan's own `## Decision record to file` section and `## Open Questions` item 1, both of which now record the outcome.

The residual this record accepts — an agent may create a narrowing `fusion-guard.json` in a project that has never run `/fusion:setup` since this version — is still owed a sentence in `rules/protected-path-discipline.md` at Step 9. It is not there yet.

---

**Reconciliation 260804-1021 (reconciler, domain `code`) — stays `_a_`, unchanged. Re-verified, nothing has moved.**

Plan Step 6 has still not begun: `hooks/lib/config.ts:34` is still `const CONFIG_PATH = findConfigPath();` at module level, `:108` is still `loadConfig(configPath?: string)`, and grep finds no `diagnostics` field and no `PROJECT_CONFIG_FILENAME`. `find . -name fusion-guard.json` returns nothing anywhere in the tree, and `grep -n fusion-guard skills/setup/SKILL.md` returns nothing. The collision this record resolves is still unreachable in practice.

The two notes from reconciliation 260803-1516 both still stand: the `Answered:` footer cites a gate rather than a `<path>:<line>`, and the residual this record accepts is still owed a sentence in `rules/protected-path-discipline.md` at Step 9. Neither was acted on, and Step 9 acquired more work rather than less this session — see `issues/260803-1402_o_`.

---
Implemented: plan Step 6 — `floorApplies = projectConfigPath !== null && existsSync(projectConfigPath)` in `hooks/lib/config.ts`. The floor is keyed on the file's **existence**, not on its parseability, which the plan did not specify: the alternative would let a project unprotect its own configuration by breaking it. Six unit cases cover both halves, and a mutation applying the floor unconditionally fails five of them, including both byte-identity cases. Residual re-measured and found wider than this record bounded it, filed separately at `issues/260804-1427_o_the-accepted-floor-residual-reaches-the-guards-own-state-directory-not-only-protectedpaths.md`.

---

**Reconciliation 260805-2323 (reconciler, domain `code`) — stays `_i_`, terminal. Record and shipped documents reconciled on the residual's reach.**

This record bounds the accepted residual at "an agent may create a narrowing `fusion-guard.json` … and the guard will honour it" without stating how far the narrowing reaches. Issue `issues/260804-1427_c_` measured the reach one step wider than the record's framing: a narrowing file removes **everything** on the effective list, `fusion-workbench/.guard-state/**` and therefore the escalation machinery included. The issue's own instruction was to state the residual at its measured reach in the shipped documents *or* widen the floor, not both and not neither. The documentation leg was taken, in commit `373f5ed` (C5b remediation plan Step 7, obligation 10):

- `README-hooks.md:179` states the residual at its measured reach — "across **everything** on the effective list, `fusion-workbench/.guard-state/**` and therefore the escalation machinery included" — with the two measured bounds (git diff on a tracked file; an active halt blocks the narrowing write itself).
- `rules/protected-path-discipline.md:36-46` states the same in the project-layer paragraph ("The guard's own state directory is an ordinary entry and goes with the rest").

The record's own text keeps its original, narrower framing; this note is the bridge, so a reader of the record finds the measured bound where it now lives. No marker change — `_i_` is terminal and the implementation this record cites is unchanged.
