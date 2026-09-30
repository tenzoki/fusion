# How is a JSON-controlled pair archived, when its control record names its narrative by workbench path?

---
**Domain:** code
**Filed by:** implementation-planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260930-2305_*_plan-fj03c-the-write-client-setup-and-the-skills-on-json.md, 260828-0904_*_is-an-archived-record-a-citation-target.md, 260928-1338-json-control-data-and-markdown-artefacts.md

---

## Question

Row 9 of section 7 of the specification (Prior `930eb26`, unchanged since `7909838`) asks of archival: "Paare gemeinsam bewegen, Archive im Legacy-Lesemodus". Section 3 says both files of a pair are archived together. `/fusion:archive` moves candidates with `mv`. Measured on 2026-09-30 through the bundle at fusion `8dfaf018` over a scratch workbench made by `initialize` and `create`: after `shared/issues/<n>.md` and `<n>.record.json` were moved together to `archive/<stamp>/shared/issues/`, an unscoped `list` still lists the record at its new control path, and both `reconcile` and `validate` report `unresolved-reference/narrative-missing` on it, because the record's `narrative.path` still names `shared/issues/<n>.md`; `validate` answers `valid: false`. A package container moved whole has the same field. Rewriting `narrative.path` is a write to a control record, which only the codec may make, and no operation of section 6 moves a pair. So the archive skill cannot archive a JSON pair and leave the workbench valid with the inputs it has.

## Options

1. **A codec operation moves the pair** (working name `archive`): journaled, under the lock, it moves both files (a container whole) and rewrites `narrative.path` (and an evidence record's `report.path`), with a new revision.
   - Pros: one writer; the journal covers the multi-file move; references by id keep resolving.
   - Cons: a new operation and a digest move; it rewrites the bytes of terminal records, which the contract otherwise treats as immutable, and moves an evidence record's hash-bound report path.
2. **`archive/` leaves JSON control**: the codec's walk (`controlFiles` in `codec/src/store.ts`) skips `archive/`, and an archived pair is history read in legacy read mode, as row 9 words it. The host moves pairs whole; the archive skill excludes every record that a live record references by id (from `reconcile`'s references, dependencies and evidence bindings) as it already excludes cited ones.
   - Pros: matches "Archive im Legacy-Lesemodus" and section 3's "keine Massenumschreibung"; no terminal record is rewritten; archived records stay citable by basename (`260828-0904_*_is-an-archived-record-a-citation-target.md`).
   - Cons: a digest move (the walk); a live evidence record, or a by-id reference from a terminal record, into an archived package answers `record-not-found` in `reconcile`; the exclusion filter carries the burden and must cover evidence records and their bindings, not only references and dependencies.
3. **The narrative path resolves relative to the control file's directory.**
   - Pros: a plain move keeps a pair valid.
   - Cons: changes the meaning of a field every pinned session and fixture carries; ambiguous for a package's container.

## Constraints

- No host writes a control record; every JSON change goes through the codec (section 6, "kein zweiter unabhängiger Parser"; section 7 row 5, "keine konkurrierende JSON-Autorität").
- Any of the three changes the shared contract and needs Prior's answer and a re-pin; FJ03c's own paths are `skills/`, `hooks/` and `bin/`.
- Until answered, the archive skill must not move a control file, since a move leaves the workbench invalid.

## Recommendation

Inference, not measured beyond the one scratch run above: option 2, because it is the reading of row 9's own words and rewrites no terminal bytes. It is asked of Prior as request 36 in the FJ03c plan's step 1, and whichever option Prior accepts decides whether the codec half is a plan of its own.

---
Answered: plan `260930-2305_*_plan-fj03c-the-write-client-setup-and-the-skills-on-json.md` — option 2 — archive/ leaves JSON control (legacy read mode), the exclusion covering references, dependencies and evidence bindings, put to the Prior side as request 36; until it answers the archive skill moves no control file; the user approved it with the FJ03c plan on 2026-09-30; ruled by user, Kai Stalmann <ks@qantr.com>
