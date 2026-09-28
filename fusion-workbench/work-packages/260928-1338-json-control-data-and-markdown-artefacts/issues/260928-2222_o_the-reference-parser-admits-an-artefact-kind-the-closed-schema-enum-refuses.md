The reference parser admits an artefact kind the closed schema enum refuses
---
Since `451e771c` (FJ01b step 7) `codec/schemas/common.schema.json` closes `artefact_ref.kind` to twenty tokens, but `codec/src/references.ts` `parseReference` still checks a structured `artefact_ref`'s `kind` against the lowercase-token pattern alone (`p.token`), so it returns `ok: true` for `{"kind": "markdown", ...}` that the schema refuses. `codec/src/__tests__/references.test.ts` builds artefact references with `kind: "markdown"` at lines 86, 88, 104, 105, 106 and 155 and stays green, which is the measurement: the parser and the schema answer differently for the same bytes.
---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260928-2110_*_plan-fj01b-fj00-follow-up-prior-rulings-applied-and-the-contract-frozen.md, 260928-1420_*_which-closed-vocabularies-do-artefact-kind-and-issue-disposition-kind-take.md

Evidence: `codec/src/references.ts` (the `artefact_ref` branch of `parseReference`, the line refusing `artefact_ref.kind is not a lowercase token`) and the six test lines above; found by the data-implementer at FJ01b step 7, reported rather than edited because `src/` was outside that step's scope.

Acceptance: `parseReference` refuses an `artefact_ref` whose `kind` is outside the schema's enum (reading the enum from `common.schema.json` rather than duplicating the list), the six test lines use kinds inside the enum, and one new test asserts the refusal for `markdown`. Executor: `code-implementer`. Whether the fix lands inside FJ01b or in FJ02 is the orchestrator's call at the next report.
