# Does the container store take the name `work-packages/`, superseding the ruling that kept `circles/`?

---
**Domain:** code
**Filed by:** planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260910-2145_*_does-the-container-store-keep-the-directory-name-circles.md, 260922-1045_*_spec-prior-nomenclature-plugin-source.md, 260922-1038-prior-mapping.md, nomenclature.md (this container), 260922-1114_*_does-the-transition-windows-legacy-read-live-at-one-site-per-runtime.md

---

## Question

`260910-2145_*_does-the-container-store-keep-the-directory-name-circles.md` stands at `_a_` on option 1, keep `circles/`, with the recommendation that "a later cleanup with a quiet tree can take option 2 as one commit". `nomenclature.md` `### Fusion workbench migration` is that later ruling: `fusion-workbench/circles/` → `fusion-workbench/work-packages/`, action Rename, "a Circle is now a work package". The spec's C6 asks for a new record that supersedes the old one rather than an edit back, because the old record's marker is not terminal but a reversal of its answer is a new decision (`rules/fusion-workbench-conventions.md` `## State Markers — decisions`). This record is that question, filed by the planner so the orchestrator has a record to transition at the user's word.

## Options

1. **`work-packages/`**, the nomenclature's name, with the plugin reading `circles/` beside it for the bounded window the spec's C9 defines.
   - Pros: one name for the unit of work on every surface; the store is named for its records (naming rule 7); the window keeps every unmigrated workbench readable.
   - Cons: the cost the old record measured is now paid: every `circles/` literal in the plugin moves, and a consumer runs part (2)'s migration.
2. **`work/`**, the old record's own option 2.
   - Pros: shorter.
   - Cons: contradicts the nomenclature, which is the user's ruling.
3. **Keep `circles/`** and let the nomenclature's row stand unrealised.
   - Pros: nothing moves.
   - Cons: the store name says a concept the plugin no longer has, and the nomenclature marks the row Rename, not Review.

## Constraints

- The old record is not edited back: it gains `Superseded by:` citing this record and moves to `_s_`, performed by the orchestrator at the user's word.
- `rules/fusion-workbench-conventions.md` `## fusion-workbench Layout` cites this record where it cited the old one.
- No file under any `fusion-workbench/` moves under part (1); the store is renamed in the plugin's definition sites and helpers, and part (2) moves the consumers' files inside the window.

## Recommendation

Option 1. The nomenclature is the user's own ruling and names the store; the old record already said the debt would be paid by a later ruling. The `Answered:` line, when the user confirms, cites `nomenclature.md` `### Fusion workbench migration` as the answer's location.

---
Answered: nomenclature.md `### Fusion workbench migration` — option 1, the container store becomes `work-packages/`, with `circles/` read beside it for the v12 window; confirmed at the plan gate of 260923-0839-implement-prior-nomenclature.md; ruled by user, Kai Stalmann <ks@qantr.com>
