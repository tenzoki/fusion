# Is the work tree the refresh source when Setup runs in the plugin's own repository?

---
**Domain:** code
**Filed by:** planner
**Cross-references:** `260810-1544_*_should-prompt-called-bin-helpers-get-one-guarded-call-convention-and-does-the-work-tree-preference-extend-to-them.md` (part (c), unanswered and never filed), `260820-2249_*_spec-style-rules-arrive-and-get-measured.md` (correction 5 of the appended binding section), `260820-2308-assessment-of-the-style-rules-spec.md` (finding F5)

---

## Question

Correction 5 of the spec's binding section states that C1's refresh source is "the work tree where one
is detected, and the installed copy otherwise". That correction is right about the failure it repairs:
comparing against `$FUSION_PLUGIN_ROOT` would offer to replace this repository's workbench profiles
with the pre-Circle text the installed tarball holds, because `install.sh` reads a GitHub tarball and
never the work tree.

It also states something the project has deliberately not decided. `CLAUDE.md` says of
`bin/fusion-source-root` that it roots reads of shipped **text** only, and that an asset a skill copies
is still taken from `$FUSION_PLUGIN_ROOT`, with the wider question recorded as part (c) of decision
`260810-1544_*_should-prompt-called-bin-helpers-get-one-guarded-call-convention-and-does-the-work-tree-preference-extend-to-them.md`. That part has been unanswered since 2026-08-10, has never been filed as its own record
as its parent instructs, and four shipped surfaces tell their reader not to assume it.

Two questions therefore sit together and should be separated. Does the C1 comparison read the work tree
in this repository? And does answering that answer part (c)?

## Options

1. **Take correction 5 narrowly.** The C1 comparison and refresh resolve their source through
   `bin/fusion-source-root`, guarded with `[ -x ]`. Nothing else changes, and part (c) stays open for
   helper resolution, which is a different mechanism.
   - Pros: the capability works in the repository where it will first be exercised. The helper already
     exists and already implements exactly this rule, so nothing new is built.
   - Cons: `CLAUDE.md`'s statement that a copied asset comes from `$FUSION_PLUGIN_ROOT` becomes false
     and must be corrected in the same commit, and a reader may then take the correction as an answer
     to part (c) that nobody gave.
2. **Take correction 5 and answer part (c) with it**, filing the general rule that the work-tree
   preference extends to every prompt-called resolution in the plugin's own repository.
   - Pros: one rule instead of a growing list of exceptions.
   - Cons: it answers a recorded open question as a side effect of a style Circle, on evidence drawn
     from one capability. The parent record's own constraint says `CLAUDE.md`'s statement about hooks
     stands unless part (c) explicitly overturns it, and this Circle has not studied hooks at all.
3. **Compare against `$FUSION_PLUGIN_ROOT` as `CLAUDE.md` currently states**, and accept that this
   repository refreshes its workbench copies only after a release.
   - Pros: no normative surface moves.
   - Cons: it reinstates exactly the expiry trap F5 identified, and the spec's acceptance criterion for
     C1 in this repository becomes unreachable inside the Circle.

## Constraints

- Correction 5 governs the plan where it and the spec body disagree, so option 3 requires the user to
  overrule the correction rather than the planner to ignore it.
- Whatever is decided, `CLAUDE.md`'s `bin/fusion-source-root` row and its "an asset a skill copies"
  clause are read by a later author as the statement of record and must match what ships.
- A call to `bin/fusion-source-root` is guarded with `[ -x ]`, per part (b) of `260810-1544_*_should-prompt-called-bin-helpers-get-one-guarded-call-convention-and-does-the-work-tree-preference-extend-to-them.md`, which is
  answered and realised.

## Recommendation

Option 1, and the plan is written against it. It is the smallest change that makes the capability
correct, it reuses a helper built for precisely this branch, and it leaves part (c) where its parent
record put it. The plan's step 3 carries the `CLAUDE.md` correction in the same commit as the mechanism,
worded so that it states what changed for copied assets and repeats that part (c) is unanswered.

---
Answered:
Implemented:
Deferred:
Superseded by:

---

**Reconciliation 260825-1241-reconciliation.md (reconciler, domain `code`, HEAD `cfab17e`).** Option 1 is on disk and
the record never recorded it. `skills/setup/SKILL.md` Step 0e resolves its comparison root through
`[ -x "$FUSION_PLUGIN_ROOT/bin/fusion-source-root" ] && SRC="$(...)"` in all three of its bash blocks
— the classification block, the replace block and the stamp block — with the `source-root-unresolved`
skip the record's option 1 required. `CLAUDE.md`'s `bin/fusion-source-root` row states the same
outcome and cites this record for it, so the normative surface the record's second constraint names
already matches what ships. Marker `_o_` → `_i_`: the answer skipped the recorded-answer step and
went straight to code, which `rules/fusion-workbench-conventions.md` `## Inline State Tracking`
allows.

---
Implemented: 3464575 — `skills/setup/SKILL.md` Step 0e resolves its root through `bin/fusion-source-root` (option 1); the mechanism itself landed in `dc78da2` against `$FUSION_PLUGIN_ROOT` and this commit moved it.
