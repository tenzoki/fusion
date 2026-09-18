# Does the depends-on spec survive its own zero-yield finding, and is the curator the right performer?

---
**Domain:** code
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Partners:** orchestrator and consultant
**Rounds:** 4
**Ceiling:** 8
**Outcome:** still running
**Cross-references:** 260917-2256_*_spec-depends-on-edges-proposed-and-confirmed.md, 260917-2253-depends-on-edges-proposed-and-confirmed.md, 260909-1020_*_three-source-aspects-unnamed-and-the-proposal-pass-has-no-agent-or-surface.md, 260911-1747_*_the-migration-wrote-a-conflict-relation-into-depends-on-and-nobody-confirmed-it.md, 260911-1915-candidate-prerequisite-edges.md

---

## Question

The user asked for the depends-on proposal pass to be specified, counter-checked, corrected,
planned, counter-checked again and then built, and wants a working function at the end. The
shaper's spec settles six open points and then reports that the live work-item graph is a
single node, so the number of edges any pass could propose over the store as it stands is
zero, which meets the spec's own inherited stopping condition before the survey runs. This
discussion checks the load-bearing claims of that spec before a plan is drawn from it.

## What held up

### C1 — The live work-item graph is one node, so the number of `**Depends-on:**` edges any proposal pass could propose over the store as it stands is zero.

- **Advanced by:** first partner
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** `bin/fusion-work-order` run in the work tree prints `items=1 edges=0 ready=1 no-depends-on-field=1`. The node-set rule is in the source rather than only in a record: `hooks/lib/work-graph.ts` implements `**Status:**` as an allowlist of `open|claimed|paused` and cites `260908-2018_*_is-a-closed-prerequisite-a-satisfied-edge-or-no-edge-and-what-is-an-archived-one.md`.

### C2 — The spec's stopping condition is met before any survey runs.

- **Advanced by:** first partner
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** `260917-2256_*_spec-depends-on-edges-proposed-and-confirmed.md` `## Stops when`, bullet 1. The consultant's correction stands beside it: the prior spec's threshold reads "fewer than three candidate edges **the user confirms**" and the new spec dropped the qualifier, so the new threshold is strictly tighter than the one it says it inherits. Immaterial at a yield of zero, and a real difference at any store where the survey proposes more than the user confirms.

### C4 — A new `bin/` helper is gated on a cut in `hooks/lib/__tests__/`, because that surface holds 26 lines and a new helper brings a new test file with no baseline entry.

- **Advanced by:** first partner
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** Conclusion confirmed; the stated derivation is off by one entry. Measured at each file's adding commit, the six most recent helper test files run 70 to 220 lines rather than 140 to 220; the five most recent run 144 to 220, which reproduces the spec's "roughly 115 to 195" cut. The consultant adds a finding the spec missed: the two most recent helpers shipped a **library** test (`plan-size.test.ts`, `work-graph.test.ts`) rather than a test named after the helper, so the convention is "a new helper brings a new test file" and there is no escape by moving the logic into `hooks/lib/` and thin-wrapping it. The cost is identical either way.

### C5 — The curator is the right performer, and a work item as a fourth subject bounded to one head field does not break its eight exclusions.

- **Advanced by:** first partner
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** The user ruling is verbatim at `260911-1528_*_spec-prerequisites-confirmed-once-order-computed.md` `### C3`. Seven of the eight exclusions in `agents/curator.md` `### Explicitly not in your remit` are untouched. Exclusion 5 is a textual collision that has to be closed in the drafting rather than assumed away: it forbids editing "Code, **data**, ontology", and the ruling authorising the strike calls a machine-readable head field "**data** rather than narrative". The `## Scope` table resolves it by owner, and the prompt text does not say so.

### C6 — The store's one live `**Depends-on:**` value may be struck by the orchestrator at the user's word, and striking it closes the two open defect records.

- **Advanced by:** first partner
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** `260911-1747_*_may-a-done-work-items-head-field-be-edited-at-all-and-under-what-bound.md` reads that the entry "may now be struck; ruled by user, Kai Stalmann". Stronger than the claim stated: the consultant read both defects' acceptance tests and found the strike is the **last remaining criterion in each**. Every other criterion already landed, `skills/migrate/SKILL.md:162` now reading "`**Depends-on:**` is never written". Two defects close for one line removed.

### D1 — The zero yield is over-determined and does not rest on the node-set rule the dispatch put in question.

- **Advanced by:** consultant
- **Entered:** round 1
- **Evidence:** All 24 pre-grammar containers under `circles/` carry a terminal Circle marker (20 `_c_`, 3 `_b_`, 1 `_s_`), and all four Circle markers are terminal (`skills/migrate/SKILL.md:86`, `docs/upgrading-to-v11.md:48`). Admitting them admits 24 terminal records, which cannot be dependents under the same ruling that produces the zero. Already measured on disk: `260911-1915-candidate-prerequisite-edges.md` `## Density outside the node set` read all 24 `## Dependencies` sections, found 21 naming at least one other unit of work and 49 distinct names across the 24, and rejected them for three independently sufficient reasons, the first being that every dependent among them is terminal.

### E1 — A `/fusion:curate` parameter switching the edge pass on fits in 174 bytes or fewer.

- **Advanced by:** first partner
- **Entered:** round 2
- **Evidence:** Measured at 133 bytes, leaving 41. Two edits to `skills/curate/SKILL.md`, modelled on the `--full` precedent in the same file: the argument line gains `--edges` (+24), and one line after the survey-dispatch block passes `**Edges:** on` (+109). The apply dispatch needs nothing, because `skills/curate/SKILL.md:89-95` passes only `**Mode:**`, `**Ledger:**` and `**Approved:**` and the apply pass follows the ledger, so the parameter is survey-side only. One correction to the claim's framing: the spec put skill bytes against agent bytes as a trade, and there is no trade. `agents/curator.md:279-285` is the dispatch-parameter table's authoring home, so an `**Edges:**` row is charged to the agent surface on either route and the skill's 133 bytes are an addition on top.

### E2 — The pass routes a non-ordering relation into `**Cross-references:**` rather than only reporting it.

- **Advanced by:** first partner
- **Entered:** round 2
- **Evidence:** The field is defined widely enough to receive it: `rules/fusion-workbench-conventions.md:228` puts "work it merely touches" there, and nothing narrows it. Two corrections. The migrate precedent is narrower than the claim said — it routes only names its own pass converted and **drops** the rest, and it is relocating a name somebody already wrote rather than proposing a citation out of prose, so the routing form transfers and the act does not. And the bound does widen: two head fields is not one. The "one head field" sentence is the prior spec author's framing rather than the user's ruling, which reads only "The curator performs the pass", so this spec may restate the bound and must not claim to inherit it. Exclusion 5's `data` collision covers both fields in one amendment.

### D4 — Natively filed work items carry 0.67 names of other work items per record, and none of the observed relations is an ordering prerequisite.

- **Advanced by:** consultant
- **Entered:** round 2
- **Evidence:** Measured over all six item records at `5919fbdf`. The two carrying a `## Dependencies` section are the two converted from Circle records; the four filed natively as work items carry a Directive and a closure note and no such section. Of the four observed relations, one pair is the conflict whose own words refuse an ordering and the other is a supersession pair. This retires the two-names-per-record figure as an input to any trigger over work items.

### F3 — No route exists by which this session hands the user a running end-to-end proposal today that is anything other than a demonstration.

- **Advanced by:** first partner
- **Entered:** round 3
- **Evidence:** Every route to a second live node is a user act. `rules/fusion-workbench-conventions.md` puts filing with the user alone, makes `done` and `dropped` terminal with reopening being a new record rather than an edit back, and the node set is the allowlist in `hooks/lib/work-graph.ts`. Reopening a terminal item, widening the allowlist and an agent filing are each closed, the first two as dressed-up fabrication and the third as a rule violation. G1 below produces a real edge and does not refute this, because that edge is hand-written rather than proposed by a pass.

### F4 — The orchestrator may not answer the deferred re-run question itself, even under a blanket delegation of the session.

- **Advanced by:** first partner
- **Entered:** round 3
- **Evidence:** `rules/fusion-workbench-conventions.md` `## Inline State Tracking` `### Decision files`: "the writer is not the ruler — the orchestrator writes the line and the user rules." `260905-1042_a_*` answers it unqualified, and all 28 `Answered:` lines in this workbench read `ruled by user` though the grammar admits an agent. A delegation of session conduct is not a ruling on re-run semantics, so there is nothing to relay. The sub-question resolves too: a `_d_` record is terminal, so the question returns as a **new** decision record citing it, never as a rename.

### G1 — A real, user-confirmed edge can stand in a live item's field at the end of this session, legitimately and without the pass, by splitting this item at the seam the spec itself names.

- **Advanced by:** consultant
- **Entered:** round 3
- **Evidence:** `rules/fusion-workbench-conventions.md` `## Backlog entries — work items` puts splitting with the orchestrator at the user's word and states that none of the maintenance operations adds work to the store, which is what keeps the no-agent-originates bound intact across them. The seam is drawn by the spec's own `## Stops when`: "the pass is not built and the work stops after C1." The item bundles work doable today with work blocked on a store condition nobody controls. The edge that falls out is quoted rather than inferred, because the spec's C1 heading already states the ordering in words, and the field is where such a statement belongs rather than in prose. Result: two live nodes, one confirmed edge, and an order computed over more than one node — three of the item's four acceptance halves, with the fourth, that a run *proposes* edges, still unmet. Filing a third item to reach the build threshold would stop being maintenance and start being manufacture, and the no-agent-originates rule forecloses it anyway. It requires the user's word twice, once for the split and once for the entry, and neither is delegable for the reason F4 gives.

### G2 — The session's deliverable is five items, not four.

- **Advanced by:** consultant
- **Entered:** round 3
- **Evidence:** Strike the entry and close the two defects; correct the spec on everything these three rounds moved, including replacing the survey trigger with the arithmetic bound; file the re-run question as a new decision record citing the deferred one and put it to the user; put the route question to the user with the split named beside the three routes already listed; and do not run the by-hand survey.

### H2 (factual half) — The node-set rule does not reach `**Cross-references:**`, so only the dependent must be live.

- **Advanced by:** planner, relayed by first partner
- **Entered:** round 4
- **Evidence:** `rules/fusion-workbench-conventions.md` `## Backlog entries — work items` puts the ordering assertion on `**Depends-on:**` alone and says `**Cross-references:**` orders nothing, citing the node-set decision for the ordering field's terminal values only. The decision's own `Answered:` line speaks throughout of the graph, nodes, edges and `bin/fusion-work-order`, and reaches the citation field nowhere. Dependent live, target any work item.

### H3 — Three pinned baselines go red on the prompt edits, and re-approving them is legitimate rather than a way around a gate.

- **Advanced by:** planner, relayed by first partner
- **Entered:** round 4
- **Evidence:** `reference-resolution-lint.test.ts` pins its three counts as exact equality and says in its own text that re-approval is the expected response and that widening the assertion back into a floor is not. `rules-emission.golden` pins the conventions file's byte size in all eleven blocks. The dispatch-path baseline is **not** touched: its head-room bounds the sum rather than each component, and a shrink never trips it — verified by running rather than reading, the curator path holding 77 097 bytes of slack. One further pin stands on a file the plan edits, an exact section count on `## Project language`, and the planned edit does not reach it.

## What fell

### C3 — A new skill body is arithmetically impossible, and editing an existing `SKILL.md` is charged against the same 174 bytes, so neither is available without a cut in `skills/`.

- **Advanced by:** first partner
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** The arithmetic reproduces exactly on all three surfaces, and a new skill body is impossible: the smallest existing body is `commit/SKILL.md` at 6 113 bytes against 174 of head-room. The closing clause is false. An edit of 174 bytes or fewer lands with no cut at all, so a `/fusion:curate` parameter is not excluded by arithmetic and has to be judged on whether it fits.
- **Conceded:** first partner, round 1 — the spec carries the same error in its own words ("paid for by a cut in `skills/` of at least its own size") and it is corrected with this claim.

### C7 — Report-only is the correct treatment for a relation the field cannot carry, and the pass should propose nothing into `**Cross-references:**`.

- **Advanced by:** first partner
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** The first half holds: a non-ordering relation is never converted into `**Depends-on:**`. The second half is refuted by the line it cites. `skills/migrate/SKILL.md:162` does not report-and-stop; it **routes** the relation the field cannot carry into `**Cross-references:**` and reports only the residue it cannot resolve. The cited precedent supports proposing into that field rather than withholding from it. The spec itself files this as open (`## User Decisions Pending`, entry 4, "This spec **assumes** report-only"), so the claim advanced a settled reading of a question the spec had left open.
- **Conceded:** first partner, round 1 — the claim was read off the spec's assumption rather than off the precedent, and the precedent says the opposite.

### C8 — The route that best serves a working function is: strike the wrong entry, build the pass anyway and prove it on a fixture, accepting a live yield of zero today.

- **Advanced by:** first partner
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** Cost is not the objection, and the consultant checked that the route fits: the curator dispatch path measures 149 969 against a row of 227 066, and the agent surface holds 48 983. What fails is the proof. The pass has a cheap half (survey, ledger, gate, apply) the curator already runs for three other subjects, and a hard half (reading prose and telling relation types apart) that the 2026-09-11 survey measured as carrying at least five distinct relation types with nothing in the text to separate them. A fixture authored in the same session by the party that will run the pass is authored by someone who already knows the intended answer, so it cannot test the hard half. And it cannot touch the fourth capability at all: re-run semantics need a user who declined something on an earlier run, which no fixture has.
- **Conceded:** first partner, round 1 — the route buys a demonstration rather than an edge, and saying otherwise would sell the user a proof the fixture cannot give.

### E3 — The measured trigger of three to four live items is sound and converts an open-ended wait into a reported state.

- **Advanced by:** first partner
- **Entered:** round 2
- **Last moved:** round 2
- **Evidence:** Refuted by measurement on the item corpus, which is D4. The density the trigger rests on was taken over Circle records of 11 to 15 KB with long `## Dependencies` sections; the records it would be applied to are work items of 0.9 to 6 KB with no such section. The source analysis said so in its own words, restricting its claim to "a store of live items at comparable size". The consultant withdrew its own item count with the claim.
- **Conceded:** first partner, round 2 — the replacement is not a projection at all: re-run the by-hand survey and build when it returns three, which measures the thing the stopping condition names instead of a proxy for it.

### E4 — Build the pass in the curator now and ship the re-run capability on the honest re-ask fallback.

- **Advanced by:** first partner
- **Entered:** round 2
- **Last moved:** round 2
- **Evidence:** Refuted three ways on the user's own record. The `Deferred:` line of `260911-1833_*_how-does-the-curators-survey-know-not-to-re-propose-an-edge-the-user-declined.md` sets the condition for returning to the question as "when the store carries enough items to make the pass worth building", and the store carries one live item. The fallback's own stated con is that it makes the second run cost the same as the first, "which is what the first stopping condition in the spec already says is not worth invoking", so the package pays that stop's cost twice. And the spec's `## Stops when` bullet 2 unlocks the fallback only where the user judges the vocabulary widening too much for one subject, a judgement the user has not made; the record's own recommendation is option 1.
- **Conceded:** first partner, round 2 — what survives is the instinct that the re-run question is ripe. The same `Deferred:` line says nothing about the answer depends on the wait, because the defect is a property of the vocabulary and not of the corpus, so it can be answered now without building anything.

### E5 — No route produces an order over more than one node without the user filing at least two further work items.

- **Advanced by:** first partner
- **Entered:** round 2
- **Last moved:** round 2
- **Evidence:** The substance holds and the count is wrong. Every route to a second live node was checked and closed: the store holds no `paused` item; reopening a terminal item is forbidden and is filing a new one instead; every one of the 24 Circle containers carries a terminal marker so nothing converts; and `archive/**` is never opened. But an order over two nodes needs two live nodes and one edge, so **one** further filed item suffices. Two further is the right figure for a different target, the spec's build threshold of three candidate edges, which needs three nodes.
- **Conceded:** first partner, round 2 — restated correctly: one further live item can put an order over two nodes, and two further meet the spec's own build threshold.

### F1 — The session's deliverable is the strike, the re-run question put to the user, the spec corrected, and the by-hand survey run.

- **Advanced by:** first partner
- **Entered:** round 3
- **Last moved:** round 3
- **Evidence:** Refuted on one component and one omission. The survey component falls with F2. The omission is larger: the package puts one of the spec's four pending user decisions to the user and leaves the first one, the route to a store the pass can work on, unasked — which against the user's standing instruction is the load-bearing one. The register's own doubt about whether correcting the spec is worth it resolves against itself: a Draft spec named in a claimed item's `**Active spec/plan:**` is in force, so corrections go into it rather than beside it.
- **Conceded:** first partner, round 3 — replaced by G2.

### F2 — The by-hand candidate survey is worth running in this session.

- **Advanced by:** first partner
- **Entered:** round 3
- **Last moved:** round 3
- **Evidence:** Refuted. The survey's result is arithmetic rather than observation: candidate edges are bounded above by the ordered pairs among live nodes, and with one live node the bound is zero. The 2026-09-11 survey makes that argument about itself, calling its own single candidate "the largest number this corpus can produce". Running it now reads prose to reach a number the store's shape already fixes.
- **Conceded:** first partner, round 3 — the cheap substitute is to record the bound rather than the survey: the live-node count, the ceiling it implies, the threshold of three, and the count at which a prose survey first becomes worth running, written into the spec's stopping section beside the existing measurement.

### H1 — The re-run record's option 1 is degenerate, so option 5 replaces it.

- **Advanced by:** planner, relayed by first partner
- **Entered:** round 4
- **Last moved:** round 4
- **Evidence:** Refuted on the co-extension, by a class neither record considered. A **candidate** ledger entry is never offered for approval and the gate names candidates as text saying they are not on offer, yet the apply pass appends an outcome per entry and an unapproved entry takes `skipped`. So a candidate edge entry is `skipped` without its group ever having been offered: under option 1 it is not `declined`, and under option 5 it is suppressed forever and silently — which is the failure the 2026-09-11 record rejected option 2 for, arriving through a door option 5 left open. The live route is an unreadable cited record downgrading a finding to a candidate, reachable because the corpus resolves citations into the archive store. What holds, and is conceded: on the two cases the 2026-09-11 record actually named, both are `skipped` and both are `declined`, so option 1 buys no separation there. Option 5 is also not novel — it revives a premise that record explicitly rejected, which is legitimate on new evidence and must be recorded as a reopening rather than presented as a fifth option.
- **Conceded:** first partner, round 4 — option 5 needs a fourth branch, that a candidate entry is re-proposed rather than suppressed, or the run file must stop writing `skipped` on entries never on offer. Both remedies and the case go into the open decision record before the user rules.

### H2 (consequence) — The first run's non-empty yield changes what this session can hand the user and partly undoes the zero-yield finding.

- **Advanced by:** first partner
- **Entered:** round 4
- **Last moved:** round 4
- **Evidence:** Refuted by measurement. The live item's container names four other work items; its head already cites two. Both remaining ones appear in exactly one file, the spec this session wrote for this feature, and the one-hop corpus does not rescue them because the head's other cited records name no work item outside their own container. So the entire first-run citation yield is text this session authored for this pass, and the round-1 objection to a self-authored fixture lands on it unchanged.
- **Conceded:** first partner, round 4 — the yield is 2 rather than 0 and that is worth saying, but so is what it is: the first run exercises the plumbing on this session's own spec and exercises the judgement half not at all.

### H4 (arithmetic) — The cut returns about 85 bytes against the parameter's 133.

- **Advanced by:** planner, relayed by first partner
- **Entered:** round 4
- **Last moved:** round 4
- **Evidence:** The duplication and the defect in both copies are exact, and the head-room figure is exact. The arithmetic is not. The enumeration is 59 bytes, two copies are 118, and the shortest usable pointer naming a file and a heading is 34 bytes, so replacing both returns 50. Reaching 85 needs the surrounding framing cut as well and one pointer rather than two, which is a larger edit than the stated operation. The bound rather than the estimate: a minimal parameter edit near 150 bytes fits in 174 unaided, and the measurement after writing is what settles it.
- **Conceded:** first partner, round 4 — the figure is stated as 50 or the larger edit is described, and neither "roughly 85" nor an estimate reaches a commit message as though it were derived.

### H5 — The plan is sound enough to execute as written.

- **Advanced by:** first partner
- **Entered:** round 4
- **Last moved:** round 4
- **Evidence:** Refuted on three defects and one cardinality. The classification split is not disjoint: branch 2 is defined as the case where the words do not state the ordering and branch 3's condition explicitly includes an ordering whose direction the words do not fix, so every branch-2 input satisfies branch 3, and the section's own claim that an ambiguity can never become a guessed ordering is contradicted two paragraphs above it. The `**Decidability:**` line says the pass never predicts the relation type, which branch 2 does. And the survey pass advances the curator's anchor on writing its run file, so a gate-free survey run leaves the anchor at HEAD and the user's first real run reads nothing predating it and silently returns nothing — a bound the plan states for the suppression read and drops for the corpus read, under its own sentence that both omissions are defects waiting to happen. The cardinality: three terminal records cited in the head, not four, one of the four carrying the open marker.
- **Conceded:** first partner, round 4 — all four corrected before step 1 is drafted. The split recuts on direction rather than on source of evidence, which collapses two branches into one and makes the decidability line true. The edge corpus is ruled unanchored, because a dependency relation is a standing fact rather than a change event, and an edges-only run advances no anchor.

**What the round found sound and did not reopen:** the stopping section carries no yield or candidate-count threshold, so the struck rule returns by no door; the store figures reproduce by running the helper; the four-row byte table reproduces exactly; and the zero-prerequisite-proposal statement is correct and correctly stated three times.

## What could not be decided

## Open dissent

## Recommendation
