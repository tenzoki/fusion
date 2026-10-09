# Must FJ05 show Prior's access path on a real migrated workbench, and if so on which one?

---
**Domain:** code
**Filed by:** implementation-planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** 261009-1021-plan-fj05-release-acceptance-of-13-0-0-with-the-claim-takeover.md, 261009-1021-who-accepts-fj05-and-may-13-0-0-ship-on-fusions-evidence-alone.md, 261009-0650-prior-fusion-integration-status.md, 261009-0644-host-parity-claude-and-prior.md, 260928-1338-json-control-data-and-markdown-artefacts.md

---

## Question

Section 1.9 of Prior's specification says "Abnahme verlangt Nachweise für beide Zugangswege". The Claude path is proven on real workbenches: fusion's own, migrated on 2026-10-06, and the two foreign copies of 2026-10-04, which the FJ05 plan re-runs at the release candidate (step 15). The Prior path is proven against recorded protocol sessions, the shared fixture snapshot and scratch workbenches (`Prior: docs/design/prior-fusion-workbench-service.md` `## Verification`). No record shows `prior fusion` or Prior's adapter reading a real migrated workbench. Prior's own workbench is still v12 (`.fusion-setup` reads 12.0.0, no `workbench.json`). Section 8.2 assigns the migration proof to the Claude helper path and Prior's part to conformance, which suggests the recordings suffice (inference, analysis 261009-0650, A2). The plan's step 17 is either a real Prior-path read or not applicable, and it must know which before step 15's copies are discarded.

## Options

1. **No. Conformance against recordings is Prior's path evidence.** Step 17 is closed as not applicable, citing this record.
   - Pros: nothing new; section 8.2's split is kept as written.
   - Cons: "both access paths" then rests on recordings for one of them, and no real workbench has crossed hosts.
2. **Yes, read-only on a copy.** Fusion supplies a scratch copy of a workbench the release candidate migrated in step 15, or a copy of fusion's own. Prior runs `prior fusion` `list`, `show` and `validate` on it from its qualified pin, plus one write on the copy. The result reaches fusion through the user with the FJ05 answer.
   - Pros: a real migrated workbench crosses hosts; Prior's repository and Prior's own workbench stay untouched; Prior runs its own tool.
   - Cons: one more item in Prior's FJ05 answer; the paths of the foreign copies must stay out of every record, so the copy is handed over by location outside the workbench.
3. **Yes, on Prior's own workbench.** The release build migrates Prior's v12 workbench (the host-parity analysis's P7), and Prior's service then reads it.
   - Pros: the strongest evidence, and Prior gains JSON control for its own work.
   - Cons: it writes Prior's repository, which this package must not do; section 10 says that only FJ05 justifies migrating real projects, so doing it inside FJ05 reverses that order; the release would wait on Prior's own maintenance window.

## Constraints

- Prior's repository is read-only for fusion; every Prior run is Prior's to perform.
- The two foreign workbenches' locations are kept out of the workbench (analysis 261004-1516); only aggregate figures are recorded.
- Fusion under Claude Code needs no Prior component (spec section 1.9), so no option may make a Prior run a runtime dependency of 13.0.0.

## Recommendation

Option 2, using a copy of fusion's own workbench at the release candidate. Its location can be recorded, unlike the foreign copies. Option 3 belongs after the release, as the host-parity analysis recommends. Whether a "yes" from Prior on option 2 gates the release act follows from the ruling on 261009-1021-who-accepts-fj05-and-may-13-0-0-ship-on-fusions-evidence-alone.md.
