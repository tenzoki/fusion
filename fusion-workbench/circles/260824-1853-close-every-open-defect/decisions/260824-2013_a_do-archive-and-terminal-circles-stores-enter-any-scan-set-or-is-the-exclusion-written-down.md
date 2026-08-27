# Do `archive/` and terminal Circles' stores enter any `SCAN_*` set, or is the exclusion written down?

---
**Domain:** code
**Filed by:** analyst
**Attribution backfilled 260825 (not written by the filing agent):** `analyst` filed this record; the person half of `**Filed by:**` is absent because the installed plugin at `$FUSION_PLUGIN_ROOT` carried no `bin/fusion-identity` at that time. See `shared/issues/260825-1329_*_every-session-runs-one-release-behind-on-a-bin-helper-the-same-repository-just-added.md`.
**Cross-references:** `shared/issues/260801-1020_*_scan-keys-never-reach-the-archive-store.md`; `circles/260823-0023-settle-what-travels-between-checkouts/issues/260823-1403_*_closing-a-circle-removes-its-open-records-from-every-agents-scan-set-and-no-closure-step-says-so.md`; `shared/analyses/260801-1020-normative-surface-drift-gap-analysis.md` (Question 4, where the first was found); `rules/fusion-workbench-conventions.md` `## Path Resolution (Pfadauflösung)` and `## State Markers — decisions` (the Grounding-Historie layer); `rules/workbench-path-resolution.md`; `bin/fusion-paths`; `agents/orchestrator.md` Phase 4; `skills/archive/SKILL.md`; plan `circles/260824-1853-close-every-open-defect/planning/260824-1905_*_plan-close-every-open-defect.md` step 1 (D-scan-scope)

---

## Question

Every `SCAN_*` key resolves to the active Circle's store plus `shared/`, and nothing else. Two stores therefore sit outside every agent's read set. `archive/` has held real content since `e59dea2` on 2026-08-17: planning, decision and issue records, and one cited record already lives there at a path no citation reaches. Terminal Circles under `circles/` held 75 open defects and 12 open decisions at the count of 2026-08-23, none archived, invisible to taskplanner, reconciler, playmaker, curator and the orchestrator from the moment `.active-circle` was cleared, and no closure step names or moves them. The consequence the first record predicts is that the `_s_` supersession the marker vocabulary exists for is never applied to a record nobody can see, so the Grounding-Historie layer stops being a layer. Both records say the choice is a design call and not a bug fix: unbounded read scope has its own cost, and an exclusion that is decided is defensible where one that is merely an omission is not. The second record says answering the two stores together is cheaper than answering either alone, which is why one record holds both. This Circle closes the stranded records of the terminal Circles, so the live instance of the second ends here; the mechanism does not.

## Options

1. **An explicit archive read key**, for example `SCAN_ARCHIVE`, emitted by `bin/fusion-paths` for consumers whose prompts name it, following the derive-from-prompt contract.
   - Pros: costs nothing for consumers that never ask; the history-grounded passes (reconciler, curator, analyst) regain the corpus.
   - Cons: read scope grows with every cleanup; the second record's store is not covered.
2. **A `SCAN_*` variant that reaches every Circle's store**, terminal ones included, with or without `archive/`.
   - Pros: the option the second record weighs, at the same cost as 1; covers both stores in one mechanism.
   - Cons: unbounded read scope; every scan silently grows.
3. **Name the closing Circle's open records at closure** — Phase 4 reports them to the user, so a deferral is a thing somebody saw.
   - Pros: cheapest; changes no store.
   - Cons: reaches only the terminal-Circle half, and only at the moment of closure.
4. **Relocate open records to `shared/` at closure**, the store defined for work with no Circle affiliation.
   - Pros: the records re-enter every scan without a resolver change.
   - Cons: invalidates every citation of them unless the move rewrites citations, the objection the Origin Rule already records against moves.
5. **State the exclusion deliberately** in `rules/fusion-workbench-conventions.md`: archived material and terminal Circles' stores are out of scope for all agent reads.
   - Pros: the exclusion becomes a decision rather than an omission; no scope grows.
   - Cons: the Grounding-Historie layer is then declared unreachable by agents, and the supersession vocabulary loses its reader.

Options 3 and 5 compose, and either composes with 1; options 2 and 4 each make 3 unnecessary for the store they cover.

## Constraints

- The resolver derives a key set from the consumer's prompt and declares none (`rules/workbench-path-resolution.md`); a new key is a prompt change on each consumer plus one resolver line.
- Citations of records must keep resolving under `hooks/lib/__tests__/workbench-citation-lint.test.ts`, whose corpus recomputes on every run; a relocation that breaks a citation reddens `npm test`.
- `rules/fusion-workbench-conventions.md` is the authoring home for both the layout and the resolution contract, and the always-on set has 431 bytes of head-room measured for this Circle.
- Whatever is chosen, the exclusion or the inclusion is visible in the conventions file; the current state, where the exclusion is invisible and grows, is what both records call indefensible.

## Recommendation

None. Both referring records call the choice the framework owner's and name option 2 of the first (option 5 here) defensible without endorsing it.

## Answer

Option 5, the exclusion written down, and in `rules/circle-records.md` rather than the conventions: the user's direction at the orchestrator gate of session `circles/260826-1613-cardinality-answered-cut-once-nineteen-cleared/history/260827-1749-orchestrator-session.md`, taken for record 6 of plan `circles/260826-1613-cardinality-answered-cut-once-nineteen-cleared/planning/260827-1756_*_repair-the-twenty-open-defect-records.md`. The rule now states, in `## State Markers — circles` beside the terminal-states statement, that a terminal Circle's spec and plan are history: read as evidence, never reconciled in place, and reachable only by naming the Circle as `bin/fusion-paths`' second argument. That file is emitted to the three agents that transition or rank a Circle and is not always-on, which is why the sentence sits there and not in the conventions. Options 1 and 2 (a scan key over archive or every Circle) are not taken; option 3 is not decided here. The `archive/` half is covered by the same reading: an archived record is history at its new path.

Answered: 260827-1845, Kai Stalmann <ks@qantr.com> at the gate named above; realised by plan step 6.

---
Implemented:
Deferred:
Superseded by:
Retired:
