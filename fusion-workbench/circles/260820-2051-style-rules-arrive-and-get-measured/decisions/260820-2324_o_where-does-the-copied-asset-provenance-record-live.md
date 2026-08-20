# Where does the provenance record for a copied workbench asset live?

---
**Domain:** code
**Filed by:** planner
**Cross-references:** `circles/260820-2051-style-rules-arrive-and-get-measured/planning/260820-2324_*_plan-style-rules-arrive-and-get-measured.md` (step 3, which implements whichever answer stands), `circles/260820-2051-style-rules-arrive-and-get-measured/planning/260820-2249_*_spec-style-rules-arrive-and-get-measured.md` (`## Open for Planner`, which hands this question to the plan), `shared/issues/260814-1419_*_the-shipped-chat-voice-profiles-changed-and-the-workbench-copies-agents-actually-load-did-not.md`

---

## Question

Capability C1 makes "is this copy stale or has the project adapted it" decidable by recording a third
input: the checksum of what Setup copied, taken at the moment of copying. The spec leaves the record's
location to the plan, with two stated constraints. It must survive an archive pass, and it must not be
mistaken for a live artifact.

The choice binds more than this Circle. Every future asset Setup copies into a workbench is stamped
through whatever this answer names, and the format becomes a workbench surface that a consuming
project carries.

## Options

1. **A new root-anchored file, `fusion-workbench/.asset-provenance`.** One line per asset in the shape
   `shasum -a 256` prints, so the file is both human-readable and machine-checkable with one command.
   - Pros: single responsibility, one writer, one format. A dotfile at the workbench root sits outside
     every artifact store, so no archive sweep and no agent scan reaches it. It extends to a new asset
     by gaining a line.
   - Cons: it is a new root-anchored surface, and `rules/fusion-workbench-conventions.md`
     `## fusion-workbench Layout` requires the layout tree and `rules/workbench-tracking.md` to gain it
     in the same commit. The layout tree is an always-on rule file, so the row costs roughly 250 bytes
     against 5 704 of head-room.
2. **An `assets` object inside the existing `fusion-workbench/.fusion-setup` marker.**
   - Pros: no new root surface, no layout row, no always-on bytes.
   - Cons: the marker is written once early in Setup by a `printf` one-liner, and the asset comparison
     runs later. Carrying checksums means rewriting the whole marker after the comparison, which turns
     one write into two and makes an interrupted Setup produce a marker whose asset half is absent.
     `rules/workbench-tracking.md` currently classifies the marker as "written once, never rewritten",
     and that sentence would become false and would need correcting. JSON assembly in a skill body
     without `jq` is also more code than the line-per-asset form.
3. **A stamp beside each asset, for example `fusion-workbench/stilwerk/.provenance`.**
   - Pros: the record sits next to the thing it describes.
   - Cons: it generalises to one file per directory that ever receives a copied asset, so the number of
     provenance surfaces grows with the asset set rather than staying at one.

## Constraints

- The record must survive an archive pass and must not read as a live artifact (spec, `## Open for Planner`).
- A new root-anchored surface lands in the layout tree and in `rules/workbench-tracking.md` in the same
  commit (`rules/fusion-workbench-conventions.md` `## fusion-workbench Layout`).
- Whatever holds the record is classified in the record-versus-live-state split. This one is a record:
  a past version answers "what was this project given", and losing it puts every asset back into case 0.

## Recommendation

Option 1. The mechanism has one writer and one reader, and giving it one file keeps both readable. The
cost is two documentation rows and roughly 250 always-on bytes, which the measured head-room absorbs.
Option 2 is the fallback if the always-on bound turns out tighter than measured, and the plan names it
as such at step 3.

---
Answered:
Implemented:
Deferred:
Superseded by:
