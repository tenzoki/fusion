# May a project declare that it does not want a checkout registry?

---
**Domain:** code
**Filed by:** planner, Kai Stalmann <ks@qantr.com>
**Cross-references:**
`260904-1058-identity-per-instance-and-the-checkout-registry.md` `## Open Questions`, third bullet, where this question is named and deliberately left unfiled because it arises only if Option 1 is chosen;
`260904-1058_*_does-fusion-gain-a-tracked-checkout-registry-and-in-which-shape.md`, answered option 1, which is the choice that raises it;
`260825-1030_*_may-a-project-depart-from-the-four-class-partition-deliberately-and-say-so-once.md`, the sibling question about departing from a fusion convention once rather than per run;
`260904-1651_*_the-checkout-registry-names-each-instance-and-joins-one-persons-identities.md` `## Open Questions`, the plan that proceeds on the recommendation below

---

## Question

Option 1 was chosen, so `/fusion:setup` gains one act: it writes this checkout's entry into `shared/checkouts/`, a tracked store, in every consuming project on the next Setup run. The analysis named the question and did not file it, because it only exists once the registry does. It exists now.

The entry a first run writes carries the eight hex, a generated alias, the git identity as read, and a person the user either typed or left as the git identity. Nothing in it is new information: the git identity is in every commit that checkout has authored and on every event line it has written, and the alias is generated from the hex. So the cost is not exposure. It is that fusion begins writing a file into a project's tracked tree for a facility the project may never use, and that a project which does not want it has no way to say so once instead of deleting the store after every Setup.

The question is whether a project may declare that it wants no registry, and if so where the declaration lives.

## Options

1. **No declaration. Setup always registers.** A project that wants no registry deletes `shared/checkouts/` and gets it back on the next Setup.
   - Pros: nothing to build, nothing to document, no third state in any consumer; the store's absence already behaves as today's fusion in every reader, so the facility is inert until somebody reads it.
   - Cons: a project that has said no by deleting the store is answered by a rewrite, which is the shape of a nag; the deletion is not durable and nothing records that it was deliberate.
2. **One leaf in the project's `fusion.json`.** A `checkouts.register: false` under the existing per-project configuration, merged per leaf over the shipped default, read by `/fusion:setup` alone.
   - Pros: it is the surface a project already uses to depart from a fusion default, and the departure is in a git-tracked file where it shows in a diff; the loader and its merge already exist; one reader, so no consumer gains a branch.
   - Cons: the loader currently has exactly one live leaf, and adding a second re-opens a configuration surface the 260816 cut narrowed on purpose; a project that sets it and later wants the registry has to find the leaf again.
3. **A marker in the store itself.** An `shared/checkouts/.no-registry` file, written by hand, that Setup reads and honours.
   - Pros: the declaration sits where the thing it declines lives, so a reader who finds the empty store finds the reason beside it; no configuration surface moves.
   - Cons: a dotfile inside a record store is a mechanism nothing else in the workbench uses, and it would need its own row in the layout tree and its own class in the four-class partition for a file that holds no record.
4. **Setup asks once and takes no for an answer by writing nothing, then asks again on the next run.**
   - Pros: no new surface at all.
   - Cons: the answer is not durable, so it is a question per session in a project that has already answered it. Rejected in the plan's design for that reason, and named here so the option set is complete.

## Constraints

- Whatever is chosen must leave the absent-registry fallback exactly as it is: every consumer behaves as it does at HEAD when no entry exists, and no reader may gain a second branch for "declined" as distinct from "not yet registered".
- No option may make `/fusion:setup` halt, and none may make a filing agent halt.
- A declaration, if there is one, is read in one place. The registry has one writer by construction, and a second reader of the declaration would be a second place the answer could be wrong.

## Recommendation

Option 2, on the ground that the departure is durable, visible in a diff, and read by the one act it governs. `inference:` the cost the 260816 cut was protecting against was a configuration surface that decided behaviour in the guard on every tool call; a leaf read once per Setup by one step is a different thing wearing the same file.

Option 1 is defensible and is what the plan proceeds on, because the registry is inert until read and the plan does not want to build a configuration branch before anybody has asked for one. The plan says at its Setup step what changes under option 2, so choosing it later costs one guarded read and no rework of the store, the helper or any reader.

---
Answered:
Implemented:
Deferred:
Superseded by:
