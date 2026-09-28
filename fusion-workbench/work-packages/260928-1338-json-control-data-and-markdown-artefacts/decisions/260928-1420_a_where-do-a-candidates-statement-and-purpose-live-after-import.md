# Where do a Prior candidate's `Statement` and `Purpose` live after import: narrative only, or also verbatim in provenance?

---
**Domain:** code
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260928-1341_*_plan-fj00-schemas-dto-mapping-and-reference-status-contract.md, 260928-1338-json-control-data-and-markdown-artefacts.md

---

## Question

Prior's `candidates.Candidate` carries two prose fields, `Statement` and `Purpose`. Under the spec's principle 1 (one source per piece of information) and principle 2 (Markdown is the authoring format for content), they belong in the issue's narrative Markdown. The FJ00 mapping also keeps them verbatim in `provenance.legacy_fields` so that `export(import(x))` reproduces Prior's bytes, which is the acceptance the plan's step 9 sets. That is a second copy of the same text, which principle 1 forbids in the long run: once the narrative is edited, the two diverge and the export is no longer of the record but of its import.

## Options

1. **Keep the verbatim copy for the round trip and mark it import-only** — `provenance.legacy_fields` is frozen at import, never updated, and the export documented as "the Prior view at import time"; a later export reads the narrative.
   - Pros: FJ00's byte-level acceptance holds; the copy is explicitly historical.
   - Cons: two texts on disk; a reader has to know which one is live.
2. **Narrative only; export renders `Statement`/`Purpose` from the Markdown** — the round trip is text-equal, not byte-equal, and the acceptance is relaxed to that for these two fields.
   - Pros: one source.
   - Cons: a byte-for-byte round trip is no longer the test; the narrative needs a stable structure the exporter can read.
3. **Narrative only, and Prior stops persisting the prose** — the Prior side moves `Statement`/`Purpose` out of the register into the record it references.
   - Pros: the cleanest split; matches the spec's ownership.
   - Cons: a Prior-side change, and FJ00 cannot wait for it.

## Constraints

- Spec §4.3: the candidate block must carry Prior's information without loss.
- Spec principle 1 and 2.

## Recommendation

Option 1 for FJ00, with option 3 raised to the Prior side through step 12's requests; the frozen copy is provenance, which the spec already allows to hold "die Originalfelder", and it stops being read once Prior no longer writes the prose.

---
Answered: Prior: docs/design/fusion-fj00-prior-response.md `## 6. Vocabularies and legacy prose` (6b, at Prior c512c4c) — option 1: Statement and Purpose stay verbatim and frozen in provenance.legacy_fields beside the narrative; the two mapping rows are kept after FJ04, since Prior still persists both and includes them in intake and revision identity; ruled by user, Kai Stalmann <ks@qantr.com>.
