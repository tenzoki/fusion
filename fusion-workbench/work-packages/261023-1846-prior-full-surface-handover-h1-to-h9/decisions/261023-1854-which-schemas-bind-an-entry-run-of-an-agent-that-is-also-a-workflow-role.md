# Which schemas bind an entry run of an agent that is also a workflow role: the profile's, or the `entry.v1` workflow's?

---
**Domain:** code
**Filed by:** implementation-planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** 261023-1846-prior-full-surface-handover-h1-to-h9.md; 261023-1854-plan-prior-full-surface-handover-h1-to-h9.md; 261010-1235-how-is-the-host-neutral-role-text-the-source-of-both-the-claude-agents-and-the-prior-profiles.md

---

## Question

A profile's `profile.json` carries one `input_schema` and one `result_schema`, two of the seven keys Prior decodes (`catalog/src/render.ts` `PRIOR_PROFILE_KEYS`). `code-implementer`, `reviewer` and `state-auditor` already have profiles whose schemas are the repair workflow's (`implementer-request.v1.json`, `review-request.v1.json`, `audit-request.v1.json` and their results), frozen and qualified. H2 and H3 put the agent profiles at `catalog/profiles/<id>/`, and H6 gives the generic workflow its own `entry-request.v1.json` and `entry-result.v1.json`. An entry run of `code-implementer` takes an entry request, not an implementer request, so one profile cannot declare both. The explorer precedent already names its role-input and result schemas in the workflow definition (`catalog/workflows/explorer.v1.json` `input_from.role_input_schema`, `completion.result_schema`) as well as in the profile, where the two agree.

## Options

1. **The workflow's declared schemas bind a run.** `entry.v1` declares `entry-request.v1.json` and `entry-result.v1.json` in its run step, and an entry run is validated against them whatever the profile declares. An agent has one profile; for the eight agents with no workflow role their `profile.json` names the entry schemas, and the three repair roles keep theirs. Skills get `skill-<name>` profiles naming the entry schemas.
   - Pros: one profile per agent, one text, no duplicated parts lists; follows the explorer precedent of schemas named in the definition; the repair and explorer contracts do not move.
   - Cons: Prior has to validate per workflow rather than per profile on its side; a reader of `profile.json` for the three repair roles sees schemas that an entry run does not use.
2. **A separate entry profile for every entry.** 27 profiles `entry-<id>`, each naming the entry schemas; an agent's entry profile takes its text from the role's parts (a fusion-only `parts_from` key, dropped in the render like `parts`).
   - Pros: one rule for all 27, and a profile's schemas are always the ones its runs use.
   - Cons: two profiles for every agent, a fusion-only indirection, and the catalog doubles in profile count.
3. **A separate entry profile only where a workflow role exists.** `code-implementer-entry`, `reviewer-entry`, `state-auditor-entry` beside the three role profiles; the eight other agents and the sixteen skills as in option 1.
   - Pros: the smallest change.
   - Cons: a special case keyed on history (which agents happened to be converted first), the kind of rim `rules/critical-stance.md` §4 calls a wrongly cut question.

## Constraints

- No frozen schema or qualified profile changes (`catalog/schemas/FROZEN`).
- Prior's loader at step 28 is Prior's to write; fusion's choice is a proposal the request puts and Prior may correct.

## Recommendation

Option 1. A schema binds a hand-over, and the hand-over is the workflow's; the explorer already says so in its definition. It keeps one profile per text and asks Prior one precise thing: validate an entry run against the definition's schemas.

---
Answered: the user in chat, 2026-10-23, answer "1" to the plan approval (approve the plan and the split, decide all five questions as recommended) — option 1, as recommended; ruled by user, Kai Stalmann <ks@qantr.com>
