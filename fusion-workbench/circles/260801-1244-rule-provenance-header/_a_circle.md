# Every rule file states which record motivated it, and a test enforces it

---
**Domain:** code
**Status:** anticipated
**Filed by:** shaper (anticipated-circle mode)
**Active spec/plan:** shared/planning/260801-1122_o_spec-normative-consolidation.md (the spec covers all four Circles of this body of work; the per-Circle implementation plan is produced by the planner at activation)
**Active session history:** (none yet)

---

## Directive

Every rule file names the decision record, Circle, or analysis that produced it. The convention is documented in `rules/fusion-workbench-conventions.md`: what the header names, where it sits in the file, and what to write when no motivating record is recoverable. All nine of the plugin's rule files carry a header, each naming a record or stating honestly that none is recoverable, because an invented rationale is the fiction this capability exists to prevent. A lint gate in the plugin's own test suite fails when a file in `rules/` lacks a header and names the offending file, so a new rule file without one cannot land. The header requires no change to `bin/fusion-rules`, which keeps emitting paths without reading file content. What the header buys is a mechanical check that a rule outlived its reason: a rule whose motivating decision record carries the superseded marker becomes a retirement candidate any reader can spot, which is what makes the curator's grounding-in-history requirement true by construction rather than dependent on its diligence.

**Capabilities carried:** C8. The spec holds the header's form, the reach of the gate, the interaction with the archive, and the eight acceptance criteria under `### C8: Provenance header on rule files`. They are not restated here, so the spec stays the single source of detail.

## Grounding snapshot

D3 asked whether rule files should carry a provenance header. The spec's D-e answered it with full adoption now, over the earlier proposal to adopt the convention and defer both the backfill and the gate. The backfill is not optional because a convention applied to new files only leaves the nine oldest and largest rules, which carry most of the binding content, outside the check indefinitely.

The pattern already exists once in the corpus, at `rules/fusion-workbench-conventions.md:326` (`Binding decision: decisions/260716-1910_i_circle-marker-am-verzeichnis-oder-an-der-circle-datei.md`). This capability generalises the one instance rather than inventing a form.

**The gate's reach is bounded, and the bound is a decision rather than an oversight.** The lint gate lives in the plugin's test suite, in the shape of the existing `hooks/lib/__tests__/path-literal-lint.test.ts`, and reads the plugin's own `rules/` directory. It cannot reach a consuming project's `./rules/` or `.claude/rules/`, whose files are in no test set fusion controls. For consuming projects the header is documented convention, enforced only by the curator writing one whenever it creates or edits a rule file. A project therefore gains header-based evidence only for rules written or edited after it adopted the convention: the header narrows the evidence gap forward and does not close it backward.

**One coupling to watch.** A header pointing at a decision record that was later archived out of every read set resolves to nothing, because no `SCAN_*` key reaches the archive store (`shared/issues/260801-1020_o_scan-keys-never-reach-the-archive-store.md`). The curator's requirement to read the archive directly is what keeps such a citation resolvable. The two must land together, or the header degrades as projects age.

The shape of the gate is open for the planner: the header regex, the required position in the file, and whether the test validates that a cited record path exists.

**Spec and its prior decisions** (cited where they live, per the Origin Rule, not copied):

- Spec: `shared/planning/260801-1122_o_spec-normative-consolidation.md`. C8, and C2's eighth evidence source, which is what the header feeds.
- Gap analysis: `shared/analyses/260801-1020-normative-surface-drift-gap-analysis.md`.
- **D3** — `shared/decisions/260801-1020_a_provenance-header-on-rule-files.md`. The direct input to this Circle, answered by the spec's D-e and already walked to answered. The conventions-file documentation of the convention cites this record as its own motivating record, which is the acceptance criterion that makes the convention self-demonstrating.
- **D1** — `shared/decisions/260801-1020_a_where-does-normative-consistency-live.md`. A writing consolidation agent rather than a report-only detector. The consumer of the headers this Circle produces.
- **D2** — `shared/decisions/260801-1020_a_may-any-fusion-writer-touch-rules.md`. Rule-file writes through an environment-gated exemption. Not required here: the backfill happens in the plugin's own repository, where the write guard stands down (`hooks/lib/self-detect.ts:18-33`), so the nine files are editable without the flag.

## Dependencies

**(none)** — this Circle depends on no other, and can run in parallel with the two guard Circles.

Depended on by `260801-1244-curator`, and the direction is hard rather than advisory: the curator's closing work partitions `rules/fusion-workbench-conventions.md` into shards, every shard must carry a provenance header, and the lint gate is one of the checks that output has to pass. The gate has to exist before there are shards to check.

## Turn log

## Activation proposal

**Recommended as the next Circle — playmaker run 260801-2044 (trigger: user-fusion-next, portfolio refresh after `260801-1244-guard-bash-inspection` closed coherent).**

Ranked first of the three anticipated Circles under the code-domain heuristic, and the ranking does not depend on the tie-breakers. The `## Dependencies` section is empty, so the dependencies-closed check passes without argument. The `## Grounding snapshot` cites three decision records and no open ones: D1 (`shared/decisions/260801-1020_a_where-does-normative-consistency-live.md`), D2 (`shared/decisions/260801-1020_a_may-any-fusion-writer-touch-rules.md`), and D3 (`shared/decisions/260801-1020_a_provenance-header-on-rule-files.md`) are all answered and awaiting realisation. Zero open decisions plus zero unmet dependencies is the exact profile the code bias ranks highest. The unblock value is the second reason: this Circle is the only hard prerequisite of `260801-1244-curator`, which carries the substance of the parent Directive, while the sibling `260801-1244-guard-rules-write` became activatable at the same moment and blocks nothing hard.

**Urgency evidence, measured rather than argued.** The plugin's `rules/` directory now holds ten files. One of them, `rules/fusion-workbench-conventions.md:326`, carries a provenance line (`Binding decision: …`); the other nine carry none, verified by grep on 2026-08-01. The tenth file, `rules/protected-path-discipline.md`, was authored during the prerequisite Circle, hours after D3 was answered, and shipped without a header. This Circle's Directive was written against nine files and the backfill set is already ten. The decay it exists to stop is observable inside the session that decided to stop it, at a measured rate of one file per session, which is the strongest available case for taking this Circle before the two that can wait.

**Suggested activation timestamp:** 260801-2044 (or whenever the user activates).

**Activation notes (they do not change the ranking).** Two facts in the Grounding snapshot need refreshing by shaper in portfolio-activation mode before the planner produces the implementation plan. The file count is nine in the record and ten on disk. The Circle also states that the backfill is editable here because the write guard stands down in the plugin's own tree; that is still true, and the just-closed Circle extended the same stand-down to shell mutations, so a scripted backfill works here as well. The open scope the record hands to the planner is unchanged: the header regex, its required position in the file, and whether the lint test validates that a cited record path resolves.

*No `mv` and no `.active-circle` write by playmaker — the user confirms via `/fusion:next`, or the orchestrator activates. Proposal, not commitment.*
