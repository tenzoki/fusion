# What stable step anchor does an imported plan carry, and which criteria?

---
**Domain:** code
**Filed by:** implementation-planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260928-1338-json-control-data-and-markdown-artefacts.md, 261001-1804_*_plan-fj04-the-migration-of-a-legacy-workbench-proven-on-copies.md, 260929-1417_*_plan-fj02b-plan-progress-and-evidence-creation-through-the-kernel.md

---

## Question

Section 4.3 (Prior `590465d`): a plan's control holds versioned steps `{id, state}` and criteria; `[OPEN]`, `[IN PROGRESS]`, `[DONE]` are mapped explicitly at import; "Zustands- und Fortschrittsmarken aktiver Markdown-Records werden entfernt oder durch neutrale stabile Schrittanker ersetzt"; an unclear step structure blocks that plan's import. Neither the specification nor fusion says what a step anchor looks like in Markdown. The schema needs only a non-empty `id`; the write client creates plans with `steps: []` (`hooks/lib/record-write.ts`). Every future plan and FJ03d's rule text inherit whatever the migration writes, so this binds beyond FJ04. Measured at `15e4d52e`: 22 live plans; steps are written `N. [MARK] **Title**`, numbers include suffixed forms (`12a`), and citations in prose name them ("step 12a").

## Options

1. **The existing step number is the anchor.** `id` is the token before the full stop (`1`, `12a`); the import removes the bracket mark and changes nothing else in the line. Duplicate numbers, an unnumbered marked step or a mark outside a numbered line block that plan's import as a finding. Criteria are `[]` at import: no v12 grammar marks a criterion, and the `## Where this work stops` clauses stay prose.
   - Pros: no new syntax in the narrative; every existing citation of a step stays true; decidable from the line alone.
   - Cons: renumbering a step later breaks the binding, a rule FJ03d must state.
2. **An explicit anchor comment per step**, `<!-- step:<id> -->`, with a generated id.
   - Pros: survives renumbering.
   - Cons: new syntax in every live plan; invented ids; prose citations still use numbers, so two identities per step.
3. **Steps `[]` at import**; progress stays only in the backup.
   - Pros: nothing to parse.
   - Cons: loses live progress, which §4.3 requires to be mapped.

## Constraints

- Step texts stay; marks leave live narratives; nothing is guessed.
- Plan updates change existing ids only (requests 18–22): adding or reordering anchors is no state operation.

## Recommendation

Option 1, put to Prior as part of request 48 of the FJ04 plan.

---
Answered: plan `261001-1804_*_plan-fj04-the-migration-of-a-legacy-workbench-proven-on-copies.md` — option 1 — the existing step number is the anchor, criteria empty at import; sent to the Prior side as request 48 for confirmation; the user approved it with the FJ04 plan on 2026-10-01, the requests to be sent after the measurement part; ruled by user, Kai Stalmann <ks@qantr.com>
