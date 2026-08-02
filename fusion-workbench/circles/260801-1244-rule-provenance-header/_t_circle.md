# Every rule file states which record motivated it, and a test enforces it

---
**Domain:** code
**Status:** anticipated
**Filed by:** shaper (anticipated-circle mode)
**Active spec/plan:** circles/260801-1244-rule-provenance-header/planning/260802-1103_o_spec-rule-provenance-header.md (this Circle's spec, C8 only; it supersedes C8's four open questions and is what the planner works from. Parent spec, covering all four Circles of this body of work and still authoritative for the other three: shared/planning/260801-1122_o_spec-normative-consolidation.md. The per-Circle implementation plan is produced by the planner.)
**Active session history:** (none yet)

---

## Directive

Every rule file names the decision record, Circle, or analysis that produced it. The convention is documented in `rules/fusion-workbench-conventions.md`: what the header names, where it sits in the file, and what to write when no motivating record is recoverable. All nine of the plugin's rule files carry a header, each naming a record or stating honestly that none is recoverable, because an invented rationale is the fiction this capability exists to prevent. A lint gate in the plugin's own test suite fails when a file in `rules/` lacks a header and names the offending file, so a new rule file without one cannot land. The header requires no change to `bin/fusion-rules`, which keeps emitting paths without reading file content. What the header buys is a mechanical check that a rule outlived its reason: a rule whose motivating decision record carries the superseded marker becomes a retirement candidate any reader can spot, which is what makes the curator's grounding-in-history requirement true by construction rather than dependent on its diligence.

**Capabilities carried:** C8. The spec holds the header's form, the reach of the gate, the interaction with the archive, and the eight acceptance criteria under `### C8: Provenance header on rule files`. They are not restated here, so the spec stays the single source of detail.

## Grounding snapshot

D3 asked whether rule files should carry a provenance header. The spec's D-e answered it with full adoption now, over the earlier proposal to adopt the convention and defer both the backfill and the gate. The backfill is not optional because a convention applied to new files only leaves the oldest and largest rules, which carry most of the binding content, outside the check indefinitely.

**The backfill set is ten files, not nine.** Verified by shaper on 2026-08-02 at HEAD `e8988d9`: `ls -1 rules/` returns ten entries. Exactly one of them carries a provenance line today. The nine without one are `agent-setup.md`, `context-lean-claude-md.md`, `context-manifest.md`, `critical-stance.md`, `decision-record-examples.md`, `design-diagrams.md`, `git-branch-discipline.md`, `protected-path-discipline.md` and `user-facing-output.md`. The Directive above still reads "all nine of the plugin's rule files" and refers to the same corpus at its earlier size; the count in this snapshot is the current one.

The tenth file, `rules/protected-path-discipline.md`, is the sharpest available evidence for the capability. It was authored during the immediately preceding Circle (`circles/260801-1244-guard-bash-inspection`, commit `3806a49`, 2026-08-01), hours after D3 was answered, and it shipped with no header. The decay this Circle exists to stop was observed inside the session that decided to stop it.

**The existing pattern is section-scoped, not file-scoped, and there are two instances rather than one.** `rules/fusion-workbench-conventions.md:326` reads `Binding decision: decisions/260716-1910_i_...`, and line 654 carries a second `Binding decision:` inside that file's `### Cross-references` block. Both name the motivating record of the section they close, not of the file as a whole. C8 asks for a file-level header, which is a different artifact from what the corpus already has. Generalising the existing form is therefore a design choice with a cost rather than a straight extension.

**Two lines in the corpus would satisfy a loose match without being anyone's provenance.** `rules/decision-record-examples.md:20` carries `**Cross-references:** issues/260430-1900_o_rag-sanitisation.md` inside a worked example of a decision record, and `rules/fusion-workbench-conventions.md:529` carries the same field inside the decision-record template. A gate that matches either keyword anywhere in the file passes both of those files on text that describes a template. Position, or a keyword the corpus does not already use, is what separates a real header from a decoy.

**Five of the nine files have no motivating record to cite.** The oldest record anywhere in the workbench is dated 260621, and five rule files predate it: `decision-record-examples.md` (2026-05-04), `user-facing-output.md` (2026-05-12), `critical-stance.md` (2026-06-18), `git-branch-discipline.md` (2026-06-24) and `design-diagrams.md` (2026-06-29). Four do have a recoverable Circle. `agent-setup.md`, `context-manifest.md` and `context-lean-claude-md.md` come from `circles/260718-1924-v5x-overhaul`, and `protected-path-discipline.md` from `circles/260801-1244-guard-bash-inspection`. All nine have a recoverable introducing commit. The honest "no motivating record recoverable" form is therefore the majority case in the backfill rather than an edge case, which bears directly on how much a citation-resolving check in the gate would exercise.

**The gate's reach is bounded, and the bound is a decision rather than an oversight.** The lint gate lives in the plugin's test suite, in the shape of the existing `hooks/lib/__tests__/path-literal-lint.test.ts`, and reads the plugin's own `rules/` directory. It cannot reach a consuming project's `./rules/` or `.claude/rules/`, whose files are in no test set fusion controls. For consuming projects the header is documented convention, enforced only by the curator writing one whenever it creates or edits a rule file. A project therefore gains header-based evidence only for rules written or edited after it adopted the convention: the header narrows the evidence gap forward and does not close it backward.

**One coupling to watch, latent here and live elsewhere.** A header pointing at a decision record that was later archived out of every read set resolves to nothing, because no `SCAN_*` key reaches the archive store (`shared/issues/260801-1020_o_scan-keys-never-reach-the-archive-store.md`). The curator's requirement to read the archive directly is what keeps such a citation resolvable. In this repository the coupling cannot bite yet: the archive store holds zero files, verified 2026-08-02. It becomes live the first time anything is archived, and it is live today in any consuming project with a populated archive.

**A citation-resolving check is mechanically possible here, which the earlier framing did not establish.** The plugin's own workbench is committed to git (237 tracked files under `fusion-workbench/`, because `.gitignore:50` is the commented-out `## fusion-workbench/`), so a test running in this repository can resolve a cited workbench-relative path against real bytes. Whether it should is a separate question from whether it can.

The shape of the gate was open for the planner and is being settled with the user first, because each part of it binds the wording of all nine backfills. Four questions are in play: the accepted header wording and the regex that matches it, the required position in the file, whether the test validates that a cited record path resolves, and what the five files with no recoverable record are permitted to say.

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

## Activation proposal

**Re-confirmed as the next Circle — playmaker run 260802-0811 (trigger: direct-dispatch, domain bias `code`).**

The ranking above stands unchanged, and this run re-derived it rather than carrying it over. The `## Dependencies` section is still empty, so the dependencies-closed check passes. The three decision records the Grounding snapshot cites are still answered rather than open: `shared/decisions/260801-1020_a_where-does-normative-consistency-live.md`, `shared/decisions/260801-1020_a_may-any-fusion-writer-touch-rules.md`, and `shared/decisions/260801-1020_a_provenance-header-on-rule-files.md`. The shared decision store holds no open record at all, so no competing Circle can win on that criterion either.

The urgency measurement was re-taken on 2026-08-02 and has not moved since the previous run. The plugin's `rules/` directory holds ten files; exactly one carries a provenance line, at `rules/fusion-workbench-conventions.md:326`. Nothing was added to `rules/` in the two sessions since, both of which ran Setup and stopped without a Directive, so the backfill set is still ten and the decay rate of one unprovenanced file per working session is unrefuted rather than confirmed. The Circle remains the only hard prerequisite of `260801-1244-curator`.

**Suggested activation timestamp:** 260802-0811 (or whenever the user activates).

**Activation notes, unchanged from the previous proposal.** Shaper should correct the rule-file count in the Grounding snapshot, which reads nine and is ten. The open scope handed to the planner is still the header regex, its required position in the file, and whether the lint test validates that a cited record path resolves.

*No `mv` and no `.active-circle` write by playmaker. Proposal, not commitment.*
