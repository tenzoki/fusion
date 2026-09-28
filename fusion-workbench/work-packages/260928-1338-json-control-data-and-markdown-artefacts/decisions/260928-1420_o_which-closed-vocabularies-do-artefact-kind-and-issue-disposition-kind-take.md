# Which closed vocabularies do `artefact_ref.kind` and an issue's `disposition.kind` take?

---
**Domain:** code
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260928-1341_*_plan-fj00-schemas-dto-mapping-and-reference-status-contract.md, 260928-1338-json-control-data-and-markdown-artefacts.md

---

## Question

The FJ00 schemas (`codec/schemas/common.schema.json`, `record.schema.json`) carry two fields whose value set neither Prior's `concept/fusion-json-workbench-spec.md` nor the plan enumerates: the `kind` of an artefact reference (spec §4.4: "workbench-relativen Pfad, SHA-256 der exakten Bytes und Artefaktart") and the `kind` of an issue's structured disposition (spec §4.3: "strukturierte Disposition/Begründungsreferenz"). Both are open lowercase tokens in the shipped schemas today. An open token validates anything, so the two fields classify nothing until the set is closed, and closing it later is a schema change every fixture and both hosts have to follow.

## Options

1. **Close both now, from what fusion already names** — `artefact_ref.kind` from the artefact kinds `rules/fusion-workbench-conventions.md` `## Filename Patterns` lists (`spec`, `plan`, `issue`, `decision`, `discussion`, `review`, `analysis`, `consultation`, `memo`, `forum`, `report`, `patch`, `log`, `other`); `disposition.kind` from the issue's `Resolved:`/`Also seen:`/deferral vocabulary (`fixed`, `duplicate`, `deferred`, `rejected`, `out-of-scope`, `merged`, `superseded`).
   - Pros: the fields classify from the first fixture; both hosts validate the same set.
   - Cons: a set chosen before Prior's evidence kinds are known may need an additive change at FJ01/FH01.
2. **Leave both open through FJ00 and close them in FJ01 with the Prior side** — the codec decision names the moment both hosts bind.
   - Pros: one closing, agreed on both sides.
   - Cons: every FJ00 fixture written against an open field is unspecific evidence.
3. **Close `artefact_ref.kind` now (fusion owns the artefact kinds) and leave `disposition.kind` to FJ01** (Prior's candidate outcomes may feed it).

## Constraints

- Spec §4: unknown fields outside `extensions` are schema errors; an enumerated `kind` follows the same rule.
- Any set adopted must be additive-only afterwards under the spec's compatibility rule.

## Recommendation

Option 3. Fusion is the authority on what an artefact is, and that list exists; the disposition of an issue is the seam to Prior's candidate register, whose outcome set (`pending, selected, admitted, deferred, rejected, out_of_scope, merged`) the mapping already carries, so that field is closed once, together with the Prior side, at FJ01.
