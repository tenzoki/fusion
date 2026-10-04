# How is the partly overridden legacy-values decision 261001-1804 marked?

---
**Domain:** code
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Partners:** orchestrator and consultant
**Rounds:** 2
**Ceiling:** 8
**Outcome:** did not converge after 2 rounds
**Cross-references:** 261001-1804_*_how-are-legacy-values-with-no-v1-counterpart-mapped-at-import.md, 261003-1746_*_how-does-an-imported-record-carry-a-filer-its-legacy-workbench-never-recorded.md, 261001-1804_*_plan-fj04-the-migration-of-a-legacy-workbench-proven-on-copies.md

---

## Question

Decision `261001-1804_*_how-are-legacy-values-with-no-v1-counterpart-mapped-at-import.md` (marker `_a_`, option 1, a fixed mapping table with findings on everything else) was partly overtaken by the FJ04 plan's 2026-10-03 derive-and-carry amendment and by decision `261003-1746`. The orchestrator put three options to the user on 2026-10-04: (1) a cross-reference to `261003-1746` in the head, marker unchanged; (2) `Superseded by:` and a rename to `_s_`; (3) no change. The user answered with `/fusion:discuss` instead of a number. The question: which marking is correct under fusion's conventions, and is the option list itself right?

## What held up

### C1 — Decision 261001-1804 is overridden only in part: its `_d_`-Circle → finding clause, its unclear-role → finding clause and its catch-all ("any value the copies show beyond these stay findings") were replaced by defaults or by "reported, not blocking", while the `_c_`/`_b_`/`_s_` Circle table and the `answer_ref` mapping stand (the latter extended to a missing answer line).
- **Advanced by:** first partner
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** decision `:20`, `:34`; plan `:271`, `:282`, `:287`, `:289`; `hooks/lib/legacy-import.ts:240-244`, `:449-451`, `:602`, `:650`, `:752` (widened by the consultant in round 1 to include the catch-all)

### C2 — The source of the override is the FJ04 plan's amendment of 2026-10-03 (the user's chat ruling, departures 57 and 58), not decision 261003-1746, which rules only the unknown actor and the derived marking; a cross-reference naming 261003-1746 alone is incomplete.
- **Advanced by:** first partner
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** `261003-1746_*_…md:12,42`; plan `:265`, `:304-305`

### C3 — fusion's conventions provide no form for a partial override of a decision: the annotation list is closed, `Retired:` is for a removed subject, and the partial-reversal form `Revised by:` exists for issues only.
- **Advanced by:** first partner
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** `rules/fusion-workbench-conventions.md:395-400`, `:312`, `:404-433`, `:434-435`

### C5 — Adding a head cross-reference to a live `_a_` decision is permitted; the newer artefacts already cite the old record, so under option 3 the override is findable from the new side only, and a bare basename in `Cross-references:` does not say "partly overridden".
- **Advanced by:** first partner
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** conventions `:195`, `:519`, `:106`, `:471`; `261003-1746_*_…md:6`; plan `:282-283` (corrected by the consultant in round 1)

### C6 — Decision 261001-1804's marker is stale: its answer was realised in code as ruled at `b9d43fb1` (FJ04 step 2, 2026-10-01), so `_a_` → `_i_` with an `Implemented:` line applies; the state-auditor may make that move as well as the orchestrator, and the move is not independent of the override question (C7).
- **Advanced by:** first partner
- **Entered:** round 1
- **Last moved:** round 2
- **Evidence:** conventions `:332`, `:416`; `agents/state-auditor.md:132`; `agents/orchestrator.md:300`; citation corrected from `e7cb55c0` to `b9d43fb1` in round 2 by C10

### C7 — Once the record is `_i_` it is terminal and takes no later header change, so any cross-reference or note must be written before the `_a_` → `_i_` rename or in the same write.
- **Advanced by:** consultant
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** conventions `:370`, `:372`

### C8 — A fourth option, built from existing forms only, is permitted and better than 1–3: in one write, add 261003-1746 to `Cross-references:` (the plan is already there), append an `Implemented:` line with the content C13 gives, and rename `_a_` → `_i_`.
- **Advanced by:** consultant
- **Entered:** round 1
- **Last moved:** round 2
- **Evidence:** conventions `:414` (`Implemented:` carries a free one-line summary), `:332`, `:416`; decision `:6`; the line's content changed by C13 in round 2

### C10 — The commit C6 and C8 cited in round 1 is the wrong one for the parts realised as ruled: option 1 was realised in full at `b9d43fb1` (FJ04 step 2), and `e7cb55c0` (step 12d) is the later partial replacement; citing `e7cb55c0` alone misattributes.
- **Advanced by:** first partner
- **Entered:** round 2
- **Last moved:** round 2
- **Evidence:** `git log -S answer_ref` and `git log -S _c_` on `hooks/lib/legacy-import.ts` first hit `b9d43fb1`; its header comment (lines 44–52 at that commit) names the `_d_` and role findings; `e7cb55c0`'s message names only the departures

### C11 — The decision is correctly `_i_` even though three clauses were later replaced: `_i_` asserts the answer was realised and not that the implementation still exists, and it was realised in full at `b9d43fb1`; `Retired:` does not fit because a user ruling replaced the clauses.
- **Advanced by:** first partner
- **Entered:** round 2
- **Last moved:** round 2
- **Evidence:** conventions `:332` (both sentences); C10. The consultant checked it on this ground, not on the first partner's premise "partly not realised as ruled", which was wrong; the first partner accepts the corrected ground.

### C12 — C9 is outside this discussion's question: C8 needs no new form, while C9 asks for a new annotation in the shared conventions, a choice point that belongs in its own decision record or a `/fusion:curate` pass.
- **Advanced by:** first partner
- **Entered:** round 2
- **Last moved:** round 2
- **Evidence:** conventions `:332`, `:414-416`

### C13 — The `Implemented:` line should read: `Implemented: b9d43fb1 — option 1 realised as ruled (FJ04 step 2); the _d_, unclear-role and catch-all clauses later replaced at e7cb55c0 per the FJ04 plan's 2026-10-03 amendment (departures 57, 58)`.
- **Advanced by:** consultant
- **Entered:** round 2
- **Last moved:** round 2
- **Evidence:** conventions `:414` (one citation plus a free one-line summary); C10; C2

## What fell

### C4 — `_s_` is reachable only from `_i_`, so option 2 is not a legal transition on an `_a_` record.
- **Advanced by:** first partner
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** `_a_` is live (conventions `:344`), the `Superseded by:` template names no source marker (`:428`), and the `_i_` → `_s_` clause (`:338`) is the one exception to "terminal never moves", not a limit on what reaches `_s_`. Option 2 fails for another reason: `Superseded by:` must cite a new decision (`:334`, `:426`), none exists for the plan amendment, and `_s_` declares the whole decision overridden.
- **Conceded:** first partner, round 1 — conventions `:338`, `:344`, `:428`

## What could not be decided

### C9 — Whether decisions should get a `Revised by:` analogue for a later partial override is a convention gap.
- **Advanced by:** consultant
- **Entered:** round 1
- **Last moved:** round 2
- **Evidence:** missing input: the user's ruling on fusion's conventions, or a `/fusion:curate` survey. C8 does not depend on it (C12). Re-checked in round 2: nothing at hand decides it; `rules/decision-record-examples.md` has no partial-override form either.

## Recommendation

Qualified, and binding nothing. Mark decision 261001-1804 by C8 and C13 in one write: add 261003-1746 to its `Cross-references:`, append `Implemented: b9d43fb1 — option 1 realised as ruled (FJ04 step 2); the _d_, unclear-role and catch-all clauses later replaced at e7cb55c0 per the FJ04 plan's 2026-10-03 amendment (departures 57, 58)`, and rename `_a_` → `_i_`. None of the three options first offered fits: option 1 cites an incomplete source (C2), option 2 needs a superseding decision that does not exist and overstates the override (C4), option 3 leaves the stale `_a_` marker (C6). The outcome is "did not converge" only because C9 stays undecidable here; C9 does not bear on C8 (C12) and goes to its own decision record. The user chose this on 2026-10-04 (option 1 of the closing question).
