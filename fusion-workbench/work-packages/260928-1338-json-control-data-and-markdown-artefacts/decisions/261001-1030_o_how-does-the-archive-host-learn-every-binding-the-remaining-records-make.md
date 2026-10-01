# How does the archive host learn every binding the remaining records make?

---
**Domain:** code
**Filed by:** implementation-planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** 261001-1030_*_plan-the-archive-revision-archive-leaves-json-control-and-json-archival-follows-its-qualification.md, 260930-2305_*_how-is-a-json-controlled-pair-archived-when-its-control-record-names-its-narrative-by-workbench-path.md, 261001-0638_*_json-pairs-cannot-be-archived-until-request-36-is-answered-and-the-archive-safety-filter-reserves-no-json-surface.md, 260828-0904_*_is-an-archived-record-a-citation-target.md

---

## Question

Prior `b912302` (`Prior: docs/design/fusion-fj03c-prior-response.md` `## 36`) rules that before an archive move every record that stays under JSON control, terminal records and evidence included, must keep every ID and path binding it makes: references, origins, mode provenance, active documents, dependencies, evidence and outcome bindings, evidence predecessors, report paths and backup artefacts. Prior also states that `reconcile`'s three arrays do not enumerate all of them at the pinned revision. Read at fusion `01304fc8`, `referenceSites` in `codec/src/cli/ops.ts` gives an evidence record only `/predecessor`, so a healthy report yields no row, and no kind gets a row for `provenance.backup` (`codec/schemas/common.schema.json`, `$defs.provenance`). Prior allows two routes: the host reads each record "through the existing codec record views", or this revision adds "an explicitly recorded additive reconcile delta". The codec revision of this plan needs the choice before step 1 submits its contract delta.

## Options

1. **An additive `reconcile` delta makes `references` complete.** `referenceSites` gains `/report` for an evidence record and `/provenance/backup` for every kind that carries one. Each new row is resolved the way `referenceEntry` already resolves an artefact reference. A codec test derives the binding sites from the closed schemas (every position reaching `record_ref`, `artefact_ref`, `reference`, `evidence_ref` or `narrative`, with `extensions` and `legacy_fields` excluded as opaque) and holds `referenceSites` equal to that set, the record's own narrative excepted. The host then reads one answer.
   - Pros: the codec stays the one reader of control semantics. Completeness becomes a test over the schemas, not a promise. A later schema field without a site turns that test red. The host needs one request per survey.
   - Cons: recorded `reconcile` answers that cover an evidence record or a backup move bytes. Each moved exchange needs a reviewed delta file, as `15-reconcile.role-delta.json` did for the role.
2. **The host reads every remaining record through `show` and extracts the binding fields itself.**
   - Pros: no reconcile bytes move.
   - Cons: the host carries a second map of where bindings sit in each kind's schema, the competing JSON authority section 7 row 5 forbids. It costs one `show` per record, the cost the initialize plan removed from the citation sweep. A schema addition goes unseen on the host.

## Constraints

- No host writes or re-derives control semantics (section 6, "kein zweiter unabhängiger Parser"; section 7 row 5).
- A moved recorded byte needs a reviewed, versioned delta. No session is regenerated silently.
- Prose citations are not a source of holds. A storeless basename citation resolves over the whole index, `archive/` included (`260828-0904_*_is-an-archived-record-a-citation-target.md`, implemented `f1099c5f`), and Prior `b912302` keeps legacy basename citations supported.

## Recommendation

Option 1. It is the only option in which the host decides archival safety from one codec answer without a second parser. The schema-derived test also makes completeness decidable, where Prior's finding showed the enumeration had drifted. If the user rules this way, plan step 1 sends it as request 40 and plan step 6 implements it.

A second opinion (2026-10-01) agrees with option 1 and sharpens two points.

- **Request 40 is a notice, not a permission request.** `## 36` already allows the additive delta, so the request tells Prior that recorded answers move and names the delta files of step 6. It does not ask whether they may move.
- **The departure on prose is stated openly.** Prior lists prose citations among the bindings that must not break (`## 36`, "Which objects must remain outside the archive") and keeps only basename citations supported. Option 1 holds nothing for prose. Basename citations still resolve after the move. A full-path citation in prose is not protected. Request 40 says so.
