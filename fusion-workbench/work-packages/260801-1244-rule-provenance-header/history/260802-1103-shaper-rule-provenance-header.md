# Shaper — rule provenance header (C8), spec written

**Date:** 2026-08-02
**Mode:** in-Circle clarification, round 2 (cold start after the four answers were proxied)
**Circle:** `260801-1244-rule-provenance-header`
**Status:** complete. Spec written, decision record closed, planner runs next.

## What was done

The four answers from the proxied round were folded into a spec at `260802-1103_*_spec-rule-provenance-header.md`. Scope is C8 only.

The answers, as specified:

- **Header form.** New keyword `Provenance:`, canonical form `**Provenance:** <citation>`, matched by one anchored case-sensitive regex tolerating up to three leading spaces, an optional blockquote marker, and optional bold pairs. The gate checks presence, not value, and a hollow value passes. Recorded as an accepted limitation rather than smoothed over.
- **Position.** Anywhere in the first ten lines. Ten is stated as a chosen constant with its rationale, that it clears the corpus's longest opening blockquote (`context-manifest.md`, lines 3 to 8), and the spec notes the margin is one line held by a single file.
- **Path validation.** Presence only, a pure text scan in the shape of `hooks/lib/__tests__/path-literal-lint.test.ts`. Dead citations go uncaught. The archive coupling is stated as untouched by this Circle rather than solved, citing `260801-1020_*_scan-keys-never-reach-the-archive-store.md` rather than refiling it.
- **Files with no record.** Admission plus introducing commit. The spec says plainly that a commit carries no state marker so the superseded check does not work on it, and that D3 rejected git as the *primary* mechanism while this answer admits it as a secondary, admission-scoped citation.

## The correction the answers forced

**The backfill set is ten files, not nine.** The Circle record and C8 both count nine plus one already-provenanced file. That count assumed `rules/fusion-workbench-conventions.md` was covered by its `Binding decision:` line at :326. The chosen keyword makes that line a section note rather than a file header, so the conventions file has no `Provenance:` header and would fail its own gate. It joins the backfill, in the admission-plus-commit group, which grows from five files to six.

The spec keeps the conventions file's own header (admission form, `git:b05b423`) distinct from the section note on the new documentation section (`Binding decision:` citing D3). Collapsing the two would break the self-demonstrating criterion, because the file predates its own convention by three months while the section has a real record to cite.

## Verification performed

Every fact in the spec was re-derived at HEAD `e8988d9` rather than carried forward from round 1.

- `ls -1 rules/` returns ten files.
- `grep -rn "Provenance:" rules/` returns nothing. Case-insensitively there is one hit, `rules/user-facing-output.md:178`, lowercase, no colon, line 178. It fails the match on three independent counts.
- `git log --diff-filter=A` per file gave all ten introducing commits. All ten hashes in the spec's backfill table come from that run.
- `circles/260718-1924-v5x-overhaul/decisions/` holds one record, on the reviewers' history-log step, unrelated to the three files citing that Circle. `circles/260801-1244-guard-bash-inspection/decisions/` is empty. So no Circle citation in the backfill can be upgraded to a record citation.
- Heads of all ten files read, to establish the position rule's margin.

## A limitation worth the planner's and the user's attention

Zero backfilled files cite a decision record. Four cite a Circle directory, six carry a commit, and neither form carries a state marker. The header's stated payoff, that a rule whose motivating decision is superseded becomes a mechanically visible retirement candidate, therefore has no live instance on the day this Circle closes. It becomes available for rule files written after the convention lands. The spec states this under `## Accepted limitations`. It is a gap between what C8 promises and what the backfill delivers, and none of the four answers closes it. It did not warrant a fifth question, because no available citation would change it.

## Artifacts

- Written: `260802-1103_*_spec-rule-provenance-header.md`.
- Closed: the round-1 decision record, `Answered:` line appended and renamed `_o_` to `_a_`, now at `260802-1018_*_what-a-rule-file-with-no-recoverable-record-cites.md`. Its `**Status:**` field moved from `open` to `answered`.
- Not touched: `_t_circle.md`. In-Circle clarification mode gives shaper no licence to edit a Circle record, so the record's `**Active spec/plan:**` field still points at the parent spec. The orchestrator repoints it if it wants the field current.

## Next

The planner produces the implementation plan from the spec. The spec's `## Open for Planner` section lists what is deliberately left to it: where the gate lives, how the fixtures are built, whether the backfill is scripted, and the order of the work.

---

## Appended 2026-08-02: two post-gate fixes

The user approved the spec at the gate with two fixes attached. Both are applied. No settled question was re-opened and no approved prose was rewritten.

### Fix 1 — the diagram's missing edge

`conceptrev` returned *acceptable* (`260802-1108-conceptrev-spec-rule-provenance-header.md`), one edge short of clean. Its Medium finding: `CONV` had fan-in 0 and no link to `RULES`, so `rules/fusion-workbench-conventions.md` sat in the graph twice, once anonymously inside "ten files" and once as a named node, with nothing tying the two together. That is the nine-versus-ten error the spec's own section at line 96 corrects, and it hid the self-demonstration property the Directive rests on.

Two edges added, per the assessment's first suggested correction. No redesign, no subgraphs:

- `CONV -->|is itself one of the ten| RULES` — the membership the graph was missing.
- `CONV -->|so its own header takes form 3| COMMIT` — the conventions file's own citation, matching the backfill table's `git:b05b423`. This keeps the file's two roles distinct in the graph as the spec keeps them distinct in prose at line 123: `CONV --> HEADER` is the file defining the convention, `CONV --> COMMIT` is the file being subject to it.

The advisory Low finding was taken as well, since it cost nothing. The five unlabeled edges now carry labels, and the three alternation edges out of `HEADER` are numbered to the spec's own form numbering, so they no longer read as production:

- `RULES -->|each file carries| HEADER` (containment)
- `HEADER -->|form 1| RECORD`, `HEADER -->|form 2| CIRCLE`, `HEADER -->|form 3| COMMIT` (alternation)
- `CONV -->|defines the convention| HEADER` (definition)

The three form-edges were reordered to run 1, 2, 3 rather than the previous Circle-Commit-Record order. Node declarations are untouched.

Graph after the change: 10 nodes, 11 edges, 1.1 edges per node, still acyclic (`GATE`/`CURATOR`/`CONV` remain the roots, and a topological order exists: `GATE`, `CURATOR`, `CONV`, `RULES`, `HEADER`, then the three form nodes and the two leaves), no orphans. Max fan-out moves from 3 at `HEADER` to 4 at `CONV`, which is the direct cost of drawing the conventions file's four genuine relations. The Low finding 3, structural subgraphs for the two enforcement regions, was **not** taken: the user excluded subgraphs.

Checked by reading, not by `mmdc`, which is unavailable on this machine for the same reason `conceptrev` recorded.

### Fix 2 — the Circle record repointed

`_t_circle.md`'s `**Active spec/plan:**` field named the parent spec, `260801-1122_*_spec-normative-consolidation.md`, which is what the previous section of this log flagged as not-touched. It now names this Circle's spec first, as a workbench-relative path, and keeps the parent as an adjacent pointer in the same field, since the parent still holds the other three Circles of this body of work. The field's own convention permits the cross-store path (`rules/fusion-workbench-conventions.md:392`).

No other section of the record was touched. The `## Grounding snapshot` is the version corrected at activation and stands.

**Observed, not changed:** the record's `**Status:**` field still reads `anticipated` although the record's filename marker is `_t_`. Outside the two fixes and outside shaper's licence here, so it is reported rather than fixed.
