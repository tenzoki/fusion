A fourth bare call of the identity helper sits in the orchestrator and the repair did not reach it
---
`agents/orchestrator.md:286` tells the orchestrator to take the claim's person and checkout "from `bin/fusion-identity`": no root, no `[ -x ]` guard, and no citation of the section that carries the exit branches. It is the same defect `260824-1538_*_the-filing-rule-names-the-identity-helper-with-no-root-no-guard-and-no-branch-for-its-absence.md` closed, at a call site that record's three-row table did not list, so the repair at `3fba5c6` covered three sites of four.
---
**Filed by:** coderev

Found reviewing `0f5889e..3fba5c6`, the two commits that close the C3 Circle's high-severity findings.

**The five places shipped text names the helper, after the repair.**

| Site | Form | Guard | Exit branches reached |
|---|---|---|---|
| `rules/fusion-workbench-conventions.md:494` | `"$FUSION_PLUGIN_ROOT/bin/fusion-identity"` | `[ -x ]` stated | authored here |
| `skills/setup/SKILL.md:340` | `"$FUSION_PLUGIN_ROOT/bin/fusion-identity"` | `[ -x ]` in the bash line | cites `### Who filed it` |
| `skills/next/SKILL.md:207` | `"$FUSION_PLUGIN_ROOT/bin/fusion-identity"` | `[ -x ]` stated | none |
| `agents/shaper.md:93` | `bin/fusion-identity` | none | cites `### Who filed it` by name |
| `agents/orchestrator.md:286` | `bin/fusion-identity` | none | **none** |

`agents/shaper.md:93` is bare but delegates in the same clause, "under `rules/fusion-workbench-conventions.md` `### Who filed it`, which states there and only there what each of that helper's exit codes obliges you to do", so a shaper reaching that rule now finds the rooted form, the guard and the absent-helper branch. `agents/orchestrator.md:286` delegates nothing: the section around it (`:259-268`) cites `rules/circle-records.md` `## Circle record template` and `### The claim field`, and neither of those carries a call form or an exit table either.

**What the orchestrator is left holding.** A bare `bin/fusion-identity` is resolved against the working directory, which in a consuming project holds no `bin/`, so the call is exit 127 with no guard in front of it. The claim's activation value is written in the same command as the `_a_`→`_t_` rename (`agents/orchestrator.md:277-286`, "Write each field in the same command as the act that moves it"), so a failing call sits inside the rename. `rules/circle-records.md:167-172` fixes the value as person plus checkout "composed nowhere else", and there is nothing to compose from.

**Measured on this machine, today**, the same way the closed record measured it: `$FUSION_PLUGIN_ROOT` is `/Users/k1/.fusion` and `[ -x "$FUSION_PLUGIN_ROOT/bin/fusion-identity" ]` is false, because the installed plugin predates the Circle that added the helper. Every consuming install is in that state until it updates. The rooted call at the three repaired sites now has a stated answer for it; the orchestrator's has neither the root nor the answer.

**Why the closed record did not catch it.** Its table names the three sites "written in this Circle". `agents/orchestrator.md:286` was written in this Circle too, at `0a726b5`, and was measured as a *claim* site rather than as a *helper call* site: `circles/260824-0530-record-attribution-and-circle-claim/reviews/260824-1538-coderev-c3-attribution-and-claim-full-range.md:85` cites the same line for what it leaves undefined about the claim's value, not for how it calls the helper. Two reviews of one line, each reading it for a different property, and the call form fell between them.

Fix direction: give the row the same rooted, guarded form the other three now carry, and cite `rules/fusion-workbench-conventions.md` `### Who filed it` for the exit branches the way `agents/shaper.md:93` does, rather than restating them. `agents/` is byte-bounded (`hooks/lib/__tests__/surface-growth-bound.test.ts`, 18 000 above baseline) and `agents/orchestrator.md` is the largest file in that surface at 155 704 bytes, so measure the bound after.

Adjacent, and a different question: `circles/260824-0530-record-attribution-and-circle-claim/issues/260824-1538_*_the-claim-has-no-defined-value-when-the-identity-helper-produces-one-half-or-neither.md` asks what the claim's *value* is when the helper returns a partial identity. This record asks only that the same line call the helper the way the other sites do. Fixing either leaves the other standing.

---
**Reconciliation 260824-1637** (reconciler, domain `code`, Phase 3 of session `260824-0539`, HEAD `cf7a5b0`; log `circles/260824-0530-record-attribution-and-circle-claim/history/260824-1637-reconciliation.md`) — **STAYS `_o_`.** `agents/orchestrator.md:286` still reads "its person and checkout from `bin/fusion-identity` (`PERSON=`, `CHECKOUT=`) and composed nowhere else", with no root, no `[ -x ]` guard and no citation of `### Who filed it`. This pass reads it as the exception on property 2 of the plan's `## Where this Circle stops`: the claim's authoring home is correct about who writes the field and when, and is not runnable as written from a consuming project.

---
Resolved: fixed — the `**Claim:**` row calls the helper in the rooted, `[ -x ]`-guarded form and cites `rules/fusion-workbench-conventions.md` `### Who filed it` for the exit branches; agents/orchestrator.md:286
