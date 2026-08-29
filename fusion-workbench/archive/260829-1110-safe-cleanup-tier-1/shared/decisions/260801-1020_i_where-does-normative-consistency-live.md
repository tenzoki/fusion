# Where does the cross-surface normative-consistency capability live?

---
**Domain:** code
**Status:** implemented
**Filed by:** analyst
**Cross-references:** `260801-1020-normative-surface-drift-gap-analysis.md` (the gap analysis that raised this); `260801-1020_*_may-any-fusion-writer-touch-rules.md` (the permission question this one depends on); `260801-1020_*_provenance-header-on-rule-files.md` (the evidence question, independent); `260801-1020_*_scan-keys-never-reach-the-archive-store.md` (constrains any history-grounded option)

---

## Question

Three normative surfaces drift as a fusion-governed project runs: decision records, rule files, and `CLAUDE.md`. The gap analysis established that fusion covers each surface's *state* and *bulk* but has nothing that reads two of the three *together*, and nothing at all that gives rule files a lifecycle. Where should the missing capability live?

The choice must be made now because it determines whether any permission work is needed at all. Two of the three options require changing the write guard; one does not.

## Options

1. **Extend the existing surfaces.** Widen `agents/reconciler.md` Step 2.5 from decision-against-Directive to decision-against-decision, reusing the algorithm that already exists in its `knowledge` protocol (`agents/reconciler.md:118-123`). Widen `skills/revise-claude-md/SKILL.md` Inputs (lines 22-29) to read the workbench, so its prune is grounded in project history rather than two days of git. Leave `rules/` uncovered, or cover it report-only.
   - Pros: reuses machinery that already reads every `_a_` and `_o_` record and already holds write permission on decision files. No new agent. No permission change for the decision and CLAUDE.md halves. Smallest surface area.
   - Cons: leaves rule files without a lifecycle, which is the gap the user named most sharply. Splits one concern across an agent and a skill, so the cross-surface comparison has no single home.

2. **A narrow report-only detector.** One new agent that reads decisions, rule files and `CLAUDE.md` together plus the retained history, and emits findings: contradictions, obsolescence candidates, and each with its historical justification. It writes only to the workbench, in the shape every read-and-judge agent already uses. The existing appliers act on the findings: reconciler for decision markers, `/fusion:revise-claude-md` for `CLAUDE.md`, a human for rule files.
   - Pros: needs no permission change whatsoever, since it never writes outside the workbench. Matches the contract analyst, consultant and investigator already honour. Covers all three surfaces in one place, including rule files. Its findings are auditable before anything changes.
   - Cons: costs the user a manual application step for rule files. Risks producing findings nobody acts on, which is the standard failure mode of report-only tooling. Partially overlaps option 1's reconciler extension, so the two are not fully independent.

3. **A writing consolidation agent.** One new agent that reads all three surfaces and edits all three, as originally proposed.
   - Pros: one owner, one cadence, no manual step. Closest to what the user described.
   - Cons: requires granting write access to `rules/**`, which inverts the guard's stated premise (`hooks/lib/self-detect.ts:3-9`) and is not implementable per-agent with the current hook payload (`hooks/guard.ts:80-85` carries no agent identity). Duplicates roughly half of `skills/revise-claude-md/SKILL.md` and `agents/reconciler.md:161-167`. Would appear to work when developed in fusion's own repo, where the write guard stands down (`hooks/guard.ts:271-283`), and be blocked in every consuming project.

## Constraints

- Any option that writes to `rules/**` is blocked by the guard in every consuming project, and the block is at the tool layer, so packaging the capability as a skill does not route around it. See the linked permission decision.
- The Origin Rule (`rules/fusion-workbench-conventions.md:68-85`) forbids moving a decision between stores. Line 85 pre-authorises "an explicit, recorded promotion step" as the sanctioned exception. Any option that wants to promote a Circle-local decision to `shared/` needs that step defined first.
- History grounding is achievable today for decisions and Circles, adequate-with-git for `CLAUDE.md` and fusion's own `rules/`, and thin for a consuming project's rule files. The provenance decision addresses the last case.
- The archive read-set issue constrains every option equally: the longer a project runs, the less of its history any option can see.

## Recommendation

Option 2, held at moderate confidence.

The reasoning is the Research Gate in `rules/critical-stance.md` §2 applied to the permission constraint. Fusion already owns three appliers, one per surface. What it lacks is one detector. Building a fourth applier means duplicating three and then weakening the guard to make the duplicate work, which is a pile of point-solutions where an integral one exists.

Option 2 also has the property that it can be wrong cheaply. If its findings prove valuable and the manual application step becomes the bottleneck, granting write access later is a smaller change than removing it after the fact.

`inference:` the manual-step objection is weaker than it looks, because rule-file edits should be rare by construction. A rule that needs frequent rewriting is a rule that was wrong.

The case against: option 2 needs a sharp output contract or it degenerates into a report nobody reads. If the user picks it, the shaper should specify what a finding looks like and where it lands before any implementation work begins.

---
Answered:
Implemented:
Deferred:
Superseded by:
Answered: 260801-0936-orchestrator-session.md '## Design decisions (session, 260801)' D1 — Option 3 selected: a writing consolidation agent that reads and edits all three normative surfaces. User chose against the recommended Option 2 (report-only detector); the permission objection that motivated Option 2 is resolved separately in decision 260801-1020_*_may-any-fusion-writer-touch-rules.md.

**Reconciliation 260801-2029 (reconciler) — NOT promoted to `_i_`. Marker stays `_a_`.**

`agents/curator.md` does not exist at HEAD `9ab5a2a`; `agents/` holds the same sixteen prompts as at session start. Nothing in `260801-1244-guard-bash-inspection` builds any part of the answer — the Circle removes a permission obstacle that stood in front of it, which is a different thing.

Realisation belongs to `260801-1244-curator` (`_a_`), which is the last of the four in dependency order.

---

**Reconciliation 260802-1413-reconciliation.md (reconciler, domain `code`) — re-checked, stays `_a_`.**

`agents/curator.md` still does not exist at `b568ad9`; `agents/` holds the same sixteen prompts. Realisation still belongs to `260801-1244-curator` (`_a_`), whose one hard prerequisite — the provenance gate — is now built, so the Circle is activatable. What this session added toward the answer is an input rather than a part of it: every rule file the curator will read now states what caused it to exist, which is the evidence source this decision's chosen agent was specified to work from.
Implemented: `6ba9d77` (the agent) and `1a36fe4` (its first real run) — `agents/curator.md` is the writing consolidation agent option 3 named. It reads and edits all three normative surfaces behind a user gate: its first run against this repository proposed 28 corrections across `CLAUDE.md`, nineteen shared decision records and three project rule files, the user approved all 28, and the apply pass landed all 28 with nothing stale or failed. Delivered by Circle `260801-1244-curator`; run file `260814-1332-curator-run.md`. The manual-application step the recommended option 2 would have required does not exist — the agent applies what it is approved to apply, which is the substance of the choice the user made against the recommendation.
