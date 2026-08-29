# Which path-shaped tokens does the storeless form reach beyond a plain record citation: Circle-directory citations, the two head fields of a Circle record, and the annotation lines?

---
**Domain:** code
**Filed by:** planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** `260828-0904_*_does-the-mandated-citation-form-include-the-store-segment.md` (the form), `260828-0904_*_is-an-archived-record-a-citation-target.md` (why the gate keeps no archive lookup), `260829-1226_*_citation-form-drops-store-segment.md` (the plan that proceeds on the recommendation below), `rules/circle-records.md` `### Citation form in a Circle record's head field` and the paragraph opening "`Active spec/plan:` and `Active session history:` hold workbench-relative paths, not bare filenames", `rules/fusion-workbench-conventions.md` `## Filename Patterns` (last paragraph, the `path:line` sentence)

---

## Question

The user decided that a record is cited by its storeless basename, `YYMMDD-HHMM_*_<topic>.md`, and that a citation carrying a store segment is a violation the gates report. Three further token shapes in the workbench carry a store segment, and none of the five answered decisions names them. The workbench gate judges every Circle record, so each of the three either takes the storeless form or needs an exemption written into the grammar.

1. **Circle-directory citations**, `circles/<stamp>-<slug>` and the Circle's own record `circles/<stamp>-<slug>/_x_circle.md`. `circles/` is the segment an archive sweep moves. Measured at HEAD `dfd567c4`: the grammar resolves both through `circleDirs()`, which indexes the live `circles/` and every archive sweep, so today they survive an archive move only for the gate and for no other reader.
2. **The two head fields of a Circle record**, `**Active spec/plan:**` and `**Active session history:**`. `rules/circle-records.md` mandates workbench-relative paths there, reasoning from the cross-store case (a shared spec adopted by a Circle; a migrated plan in `shared/`). That reasoning assumed a reader resolves the field relative to a directory; a workbench-wide lookup by basename resolves both cases once basenames are unique, which they are (0 collisions over 2 235 marker-normalised stamped basenames, live tree and archive, at `dfd567c4`).
3. **The annotation lines** `Answered:`, `Implemented:`, `Resolved:`, `Revised by:`, `Superseded by:`, `Retired:`, `Deferred:`. The conventions call them point-in-time citations carried by their commit, "and there `path:line` is the form". 98 such lines in the live tree carry a store-prefixed record path today. In practice the workbench already stars them (the `Answered:` line of `260828-0904_*_is-an-archived-record-a-citation-target.md` cites its sibling with `_*_`), so they are treated as citations that must survive a move, not as frozen paths.

## Options

1. **One form everywhere.** A Circle is cited by its bare directory name (`<stamp>-<slug>`, already the `stamp-name` class and already what `.active-circle` holds); the two head fields carry the storeless basename and their consumers resolve by a workbench-wide `find`; an annotation line keeps its optional `:line` suffix and its path half is the storeless basename when the target is a record, and stays a path when the target is a rule file, a source file or a commit. Pros: the gate has one rule and no exemption list, which is the shape `rules/critical-stance.md` §4 asks for; every token survives both moves. Cons: `rules/circle-records.md`'s head-field paragraph and the four prompts that write or read the fields are rewritten (`agents/shaper.md`, `agents/orchestrator.md`, `rules/orchestrator-resume.md`, `skills/next/SKILL.md`, `skills/migrate/SKILL.md` for the pre-v4 re-pointing), and the conventions' `path:line` sentence gains one clause.
2. **Records only; the three shapes are exempt by line shape.** The grammar treats a token on an annotation line, in a head field, or in the `circles/<dir>` form as a path reference resolved as spelled, with no archive tolerance. Pros: no prompt edits. Cons: three special cases in the grammar, each a place the next archive sweep reddens the gate (a `Retired:` line on a live `_a_` decision citing an archived plan; a live record's `## Dependencies` citing an archived Circle), which is the decay the consumer reported, kept on purpose for three token shapes.
3. **Records and Circle directories; head fields and annotation lines stay paths, tolerated through one archive sweep.** Keeps `unsweep()` for two shapes. Cons: contradicts `260828-0904_*_is-an-archived-record-a-citation-target.md`, which says the archive lookup has no citation left to serve.

## Constraints

- `hooks/lib/__tests__/workbench-citation-lint.test.ts` judges Circle records in every state, so whatever the head fields carry is judged on every run.
- The five answered decisions are not reopened; option 3 would reopen the second.
- Whatever is chosen lands in the same commit as the sweep and the gate change, because the workbench gate has no baseline.

## Recommendation

Option 1. The plan proceeds on it; if the user picks option 2 instead, plan steps 2 and 4 shrink to a three-clause exemption in the grammar and the prompt edits in step 4 are dropped, and nothing else in the plan moves.

---
Answered: circles/260828-2342-citation-form-drops-store-segment/decisions/260829-1225_a_which-path-shaped-tokens-does-the-storeless-form-reach-beyond-a-record-citation.md — option 1, user 2026-08-29 at the plan gate: one form everywhere; a Circle is cited by its bare directory name, the two head fields carry the storeless basename, consumers resolve by a workbench-wide index.
