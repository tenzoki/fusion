Dependency evaluation fails an edge on one dangling evidence binding and reads unvalidated targets
---
Three defects sit where `reconcile` and the work graph evaluate `depends_on` edges.

1. A `succeeded` edge whose target carries one accepted evidence binding and one binding that does not resolve is refused as `unresolved-reference`. The contract (`codec/contract/dependencies.json`, `min_accepted: 1`) says one accepted binding satisfies it.
2. The target package is read without schema validation. A schema-invalid target at `status: "done"` satisfies `terminal`, while `hooks/lib/work-graph.ts` treats the same target as unreadable.
3. `work-graph.ts` drops every codec entry with `status === "cycle"`. A cycle that runs through a terminal or unreadable package is reported by `reconcile` and lost here, so the verdict reads acyclic. `dependencies.json` says such a cycle is never silently cut.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Cross-references:** `261014-0830-reviewer-closing-pass-over-the-prior-module-bundle-package.md`

Evidence (read by the reviewer):

- `codec/src/cli/ops.ts:2327-2337`: `evidenceRecords` does `if (!hit.ok) continue;`, so an unresolvable binding is left out of the map.
- `codec/src/transitions.ts:300-303`: `if (record === undefined) { return refuse("unresolved-reference", …) }` runs inside the loop, before the other bindings are counted.
- `codec/src/cli/ops.ts:2340-2350`: `edgeEntries` reads the target with `resolvePackage` and evaluates `t.status` and `t.outcome` without `validate`.
- `hooks/lib/work-graph.ts:457`: `if (!isObject(e) || typeof e.path !== "string" || e.status === "cycle") continue;`.

The same delegated pass also reported two overstatements, not re-read by the reviewer: `dependencies.json`'s notes say cycle detection runs again at validate, and `package.schema.json`'s description credits `transitions.ts` with keeping `depends_on` targets distinct and acyclic, while only `setDependenciesPlan` enforces either.

Fix direction: count the resolvable bindings and report the dangling one as a separate finding, or state in the contract that one dangling binding blocks the edge; validate the target in `edgeEntries` and return `unmet` with the schema finding; surface cycle entries in the work graph; correct the two descriptions.

Acceptance: a codec test with one accepted and one dangling binding gives `satisfied`, or the contract says otherwise. A schema-invalid `done` target gives `unmet`. A cycle through a terminal package appears in `bin/fusion-work-order`'s output.

Progress (261022, plan 261022-1611 step 4): the codec half landed: `dependencySatisfied` (`codec/src/transitions.ts`) counts a binding with no supplied record as not accepted, so one accepted binding satisfies `succeeded` beside a dangling one, and `edgeEntries` (`codec/src/cli/ops.ts`) answers a schema-invalid target `unmet` with the schema finding; defects 1 and 2 hold no longer, defect 3 waits for step 6 and the two descriptions for step 13.

Progress (261022, plan 261022-1611 step 6): the hooks half landed: `readWorkGraph` (`hooks/lib/work-graph.ts`) reads each `reconcile` entry with `status: "cycle"` instead of skipping it, members named by container where a package row names the id and by id otherwise, and `orderOf` adds it to the report unless one component over the live nodes already holds all its members; a cycle entry naming no ids fails the read as unparseable. A cycle through a `done` package now prints under `cycle=` with `cycles=1` and `verdict=cyclic` (`hooks/lib/__tests__/fusion-work-order.test.ts`). Defect 3 holds no longer; the two descriptions wait for step 13.

---
Resolved: 2026-10-22, plan steps 4, 6 and 13 of `261022-1611-plan-prior-bundle-closing-review-follow-ups.md` together. Defects 1 and 2 are closed by step 4 (e46c6634) and defect 3 by step 6 (8481f3b9), as the two progress notes above record. Step 13 corrects the two descriptions, descriptions and notes only. The `codec/contract/dependencies.json` note now says cycle detection runs at `set-dependencies`, which refuses a list closing a cycle through the package it sets, and at `reconcile`, which reports every cycle through a package in its scope, and that `validate` does not look for cycles. `codec/schemas/package.schema.json` credits the distinct, not-self and acyclic `depends_on` rule to `setDependenciesPlan` in `codec/src/cli/ops.ts` (with `reconcile` reporting a standing cycle) and no longer to `transitions.ts`. No schema keyword, `$id` or contract value moved: `jq -S 'del(.description, .notes)'` over `HEAD` and the work tree compares equal for each changed file. `cd codec && CODEC_REQUIRE_GOLDENS=1 npm test` exit 0 (1857 tests); `codec/dist/fusion-record.js` rebuilt with the inlined schemas, sha256 `d6fc9da0b948cb9c8d014d17e2d799b9a4e1c53a9feea428288fb718ff388d97`; `codec/fixtures` did not move.
