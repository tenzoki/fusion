# Should rule files carry a provenance header naming the decision that motivated them?

---
**Domain:** code
**Status:** implemented
**Filed by:** analyst
**Cross-references:** `260801-1020-normative-surface-drift-gap-analysis.md` (Question 4, first thin spot); `260801-1020_*_where-does-normative-consistency-live.md` (the capability this would serve); `rules/fusion-workbench-conventions.md:326` (the one existing instance of the pattern)

---

## Question

A capability that prunes normative content on historical grounds must be able to answer, for any rule, why it exists and whether that reason still holds. Rule files carry no such information today. Should they?

The question is independent of who does the pruning, which is why it is filed separately. A provenance header pays off for a human reader and for a reviewer, not only for an agent.

## Verified current state

No rule file under the plugin's `rules/` states which decision motivated it or which Circle produced it, with exactly one exception. `rules/fusion-workbench-conventions.md:326` reads:

> Binding decision: `decisions/260716-1910_i_circle-marker-am-verzeichnis-oder-an-der-circle-datei.md`.

One line, in one section, of one file. The pattern is available and has been used once.

Reconstructing a rule's rationale therefore means reading git log. That works in fusion's own repo: 42 commits touch `rules/`, with conventional-commit messages that name intent (for example `2935d93 feat(rules): readability gate — pre-send self-review against jargon Kauderwelsch`). It works far less well in a consuming project, whose `./rules/` and `.claude/rules/` files may have been hand-authored outside any fusion session, or copied from `templates/`, or written before the project adopted fusion at all.

The decision store already holds the reasoning in the right shape. Decision records carry Question, Options, Constraints and Recommendation (`rules/fusion-workbench-conventions.md:516-558`), and their markers record whether the answer was realised or later overturned. The information exists; it is simply not linked from the artifact it produced.

## Options

1. **Required header on every rule file.** Each rule file opens with a `Binding decision:` or `Cross-references:` line naming the decision records, Circle, or analysis that motivated it. A lint gate enforces presence, in the shape of the existing path-literal lint (`hooks/lib/__tests__/path-literal-lint.test.ts`).
   - Pros: makes "grounded in history" mechanically checkable rather than aspirational. A rule whose motivating decision is `_s_` (superseded) becomes a detectable prune candidate with no judgement required. Cheap per file.
   - Cons: unenforceable in a consuming project, since the lint lives in the plugin's own test suite and a consuming project's rule files are not tested by it. Retrofitting the plugin's own nine rule files means reconstructing rationale that may not be recoverable for the older ones.

2. **Recommended convention, no enforcement.** Document the header in `rules/fusion-workbench-conventions.md` and in the rule-authoring guidance, and apply it going forward. Backfill opportunistically.
   - Pros: no false precision. Applies uniformly to plugin and consuming project, because neither is enforced. Matches how `rules/context-lean-claude-md.md:10-11` already handles its own convention: "It is a convention, not machinery."
   - Cons: conventions without enforcement decay, which is the exact failure this analysis was commissioned to study. `speculation:` a recommended-only header would reach perhaps half the rule files and then stall.

3. **Rely on git.** Change nothing. Require that rule-file commits carry a descriptive message and, where a decision motivated the change, cite it in the commit body.
   - Pros: zero new convention. The information lives where change history belongs. Already the de-facto state in fusion's own repo, and it works there.
   - Cons: fails in a consuming project whose workbench is untracked or whose rule files predate fusion. Fails for any rule file that arrived by copy rather than by commit. Reading git blame across a rule file to reconstruct why one paragraph exists is expensive and often inconclusive.

## Constraints

- Any header must not itself become drift. A `Cross-references:` line pointing at a decision that was later archived out of every read set (`260801-1020_*_scan-keys-never-reach-the-archive-store.md`) resolves to nothing. The two issues interact.
- The header must survive `bin/fusion-rules` emission unchanged, since the helper emits paths and never parses content (`bin/fusion-rules:153-165`). No parsing dependency is introduced by any option.
- Retrofitting the plugin's nine rule files is a bounded, one-time task; requiring it of consuming projects is not, and no option should try.

## Recommendation

Option 1 for the plugin's own `rules/`, option 2 for consuming projects. The split is not a hedge: enforcement is available in one place and unavailable in the other, so a single answer would be either unenforceable or false.

The reasoning is that this is the cheapest change in the whole analysis with a durable payoff, and it is the only one that makes the user's grounding-in-history requirement mechanically true rather than dependent on an agent's diligence. A rule whose motivating decision carries `_s_` is a prune candidate that any reader can spot without reconstructing anything.

Backfilling the plugin's nine rule files is the honest cost. Some of the older ones may not have a recoverable motivating decision, in which case the header should say so rather than invent one.

---
Answered:
Implemented:
Deferred:
Superseded by:
Answered: 260801-0936-orchestrator-session.md '## Design decisions (session, 260801)' D3/D-e — Full adoption now: rule files carry a provenance header, all nine plugin rule files are backfilled, and a lint gate fails a rule file that lacks one. User chose full adoption over the shaper's proposed adopt-going-forward-and-defer-backfill default. Realised as acceptance criteria in 260801-1122_*_spec-normative-consolidation.md.

**Reconciliation 260801-2029 (reconciler) — NOT promoted to `_i_`. Marker stays `_a_`.**

Checked against every file in the plugin's `rules/` at HEAD `9ab5a2a`. Zero of the ten carry a provenance header; the one pre-existing instance the record itself cites (`rules/fusion-workbench-conventions.md`, "Binding decision: …") is still the only instance, and it predates this decision. No lint gate exists for it.

The one rule file this session produced, `rules/protected-path-discipline.md` (commit `3806a49`, 203 lines), was written without a provenance header — which is worth recording, because it is the first rule file authored *after* the decision was answered and it did not pick the convention up. That is not a fault of the Circle, whose plan step 7 never named the header, but it is the decay mode option 2 of this record predicted, arriving early.

Realisation belongs to `260801-1244-rule-provenance-header` (`_a_`), which carries full adoption, the backfill of the plugin's rule files, and the lint gate. That Circle's `## Dependencies` correctly states it depends on nothing and can run in parallel; nothing in this session invalidated it, though it now has ten rule files to backfill rather than nine.

---

**Reconciliation 260802-1413-reconciliation.md (reconciler, domain `code`) — promoted `_a_` → `_i_`. This reverses the hold placed at 260801-2029, and the reason for the hold is exactly what has now been removed.**

Implemented: `929dbf5`, `c2c2a04`, `de9d5aa` — the three commits that realise the answer's three parts, in the order the answer names them.

The answer was full adoption: the convention, the backfill of the plugin's rule files, and a lint gate. All three are on disk at `b568ad9`, and each was verified against the tree rather than against a status marker.

- **The convention.** `rules/fusion-workbench-conventions.md:562`, `## Provenance headers on rule files`, closing with `Binding decision:` citing this record at `:592`. Landed in `c2c2a04`.
- **The backfill.** Ten of ten rule files carry a `Provenance:` line at line 3. Landed in `929dbf5`. Note the count: this record and the parent spec both say nine. Ten is right, and the correction is not a scope change — the tenth is `fusion-workbench-conventions.md` itself, which the earlier count treated as already provenanced on the strength of its `Binding decision:` line at `:326`. The separately chosen `Provenance:` keyword makes that line a section note, so the file needed a header like the rest and would otherwise have failed its own gate.
- **The gate.** `hooks/lib/__tests__/provenance-header-lint.test.ts`, landed in `de9d5aa`, corrected by `cc004fc` (recursion) and `b568ad9`. `npm test` from `hooks/` re-run by the reconciler at 260802-1411: 17 files, 780 tests, 0 failures.

**The decay this record predicted has stopped, and the stopping is measurable.** The 260801-2029 hold recorded that `rules/protected-path-discipline.md` was written *after* this decision was answered and shipped with no header — option 2's predicted decay, arriving early. That file now carries `**Provenance:** 260801-1244-guard-bash-inspection` at line 3, and the gate makes the same omission impossible to repeat: a new rule file without a header fails `npm test` and is named in the failure.

**What `_i_` does not certify.** This record's own recommendation argued the payoff as "a rule whose motivating decision carries `_s_` is a prune candidate that any reader can spot without reconstructing anything". That reading is unavailable for all ten backfilled files. Four cite a Circle directory and six cite a commit; neither carries a state marker, and the realising spec established that no citation in the backfill can be upgraded to the decision-record form, because neither cited Circle holds a record that motivated any of those files. The mechanism is complete and the payoff applies forward only. Recorded here rather than only in the Circle, because this is the record whose recommendation made the claim.
