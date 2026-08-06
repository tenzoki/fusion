# Portfolio

**Generated:** 260806-2259 (by playmaker session 260806-2259-playmaker-user-fusion-next)
**Domain bias:** code

## Active (_t_)

(none). No Circle record carries the active marker and `.active-circle` is absent, which is the
consistent between-Turns state. The last Circle to close was
`260805-2005-textschicht-gegen-code-nachziehen` on 260806. Activation of the next Circle runs
through `/fusion:next`.

## Anticipated (_a_) — ranked

Recommended next: 260804-1205-shell-reachability-model — activation-ready as written, its one hard
dependency is closed and shipped, and the over-deny it removes is live in the released v5.10.0.

1. **260804-1205-shell-reachability-model** — "The mutation classifier asks whether the shell
   guarantees a segment, not what one adjacent operator says".

   Both anticipated Circles cite zero open decision records in their Grounding snapshot, and both
   pass the dependencies-closed check, so the code-domain heuristic ties and the tie breaks on
   readiness. This Circle is activatable as it stands. Its one hard dependency,
   `260801-1244-guard-rules-write`, closed coherent on 260805 and shipped as v5.9.0 through
   v5.9.2 with tags pushed, which also answers the sequencing question the record had left open:
   the shipped-first path was taken. The consequence is that the flat-joiner over-deny this Circle
   removes is live for consuming projects, tracked at
   `circles/260801-1244-guard-rules-write/issues/260804-0839_o_the-flat-joiner-model-ignores-shell-precedence-so-a-pipeline-and-an-if-body-degrade-a-cd-the-shell-guarantees.md`
   and still open at HEAD `38c5123`. The measured friction supports the priority rather than
   merely asserting it: in four days of the observed consuming project the guard produced 17
   fail-closed blocks and zero real hits, every one of them on an operand carrying a variable, a
   tilde, or a glob (`circles/260801-1244-guard-rules-write/analyses/260805-1830-zweck-nutzung-und-stand-des-plugins.md`
   section 3). Whoever activates this Circle absorbs that balance into its Grounding, together
   with the honest bound that a reachability model resolves the joiner families and leaves the
   unresolvable-operand class untouched. The record's appended proposals of runs 260805-2342,
   260806-1103 and 260806-2259 restate both activation items.

   Dependencies: `260801-1244-guard-rules-write` (closed-coherent). Clean, no cycle.

2. **260801-1244-curator** — "The curator reconciles the three normative surfaces, and proves it
   on fusion's own conventions file". Every dependency is closed
   (`260801-1244-rule-provenance-header` hard, `260801-1244-guard-rules-write` soft, transitively
   `260801-1244-guard-bash-inspection`), but the Circle is not activatable without a shaper
   re-shape first: its closing work C9 was partly done by hand during the guard Circles, which
   voids spec decision D-g and removes the Circle's designated validation case, as recorded in
   `circles/260805-2005-textschicht-gegen-code-nachziehen/_c_circle.md` `## Dependencies`.

## Recently closed (_c_ / _b_)

- **260805-2005-textschicht-gegen-code-nachziehen** — closed coherent (`_c_`) on 260806: four code
  fixes, a citation-form decision taken before the mechanical batches, two new lint tests, guard
  internals scoping measured at zero emissions from a consuming working directory; 60 of 66 corpus
  findings closed, suite at 1611 tests.
- **260801-1244-guard-rules-write** — closed coherent (`_c_`) on 260805: deliberate per-session
  rule-file writes, all twelve acceptance criteria verified, shipped as v5.9.0 through v5.9.2 with
  tags pushed.
- **260801-1244-rule-provenance-header** — closed coherent (`_c_`) on 260802: provenance headers
  plus the lint gate, eight commits, all eight acceptance criteria verified against the tree.
- **260801-1244-guard-bash-inspection** — closed coherent (`_c_`) on 260801: the protected-path
  list now binds file-mutating Bash commands, not only the four write tools.
- **260719-1536-plane-mirror-integration** — closed coherent (`_c_`) on 260720: the `bin/fusion-plane`
  push-only mirror plus `/fusion:seed-from-plane`, proven offline; two go-live follow-ups
  deliberately left open.

Four older closed Circles fall outside the last-five cutoff:
`260719-1536-brest-unite-co-creator-conversion`, `260718-1924-v5x-overhaul`,
`260717-1638-marker-format-ohne-glob-metazeichen`, `260716-1847-workbench-umbau`.

## Archived (_s_ / _d_)

(none). No Circle record carries the superseded or deferred marker.

## Warnings

- **The curator Circle cannot be activated as it stands.** `260801-1244-curator` needs a shaper
  re-shape first, because its closing work C9 was done by hand and spec decision D-g is void. That
  re-shape is its own shaper job and nobody owns it yet. Convene the shaper before offering this
  Circle at an activation gate.
- **One open decision has appeared since the previous portfolio run.**
  `shared/decisions/260806-1152_o_stash-manifest-dirname-and-pointer-content-duplicate.md` asks
  whether the stash manifest needs both `original_circle_dirname` and `active_circle_content` when
  the two always hold the same value. It is low-stakes and neither anticipated Circle cites it, so
  it does not affect the ranking above. The earlier portfolio's statement that the workbench holds
  no open decision records anywhere no longer holds and is not repeated here.
- **Two unowned residual defects have no Circle.** The setup and migrate scope residual at
  `circles/260805-2005-textschicht-gegen-code-nachziehen/issues/260806-0022_o_setup-klammer-probe-und-migrate-reformat-decken-verschiedene-baeume.md`
  was named a follow-up candidate by its Circle's closure note. The guard advisory clamp defect at
  `circles/260801-1244-guard-rules-write/issues/260803-1352_o_two-guard-advisory-details-skip-the-200-char-clamp-and-render-a-row-nine-times-normal-height.md`
  was re-verified live by the 260806-1152 reconciliation and became unowned when its Circle closed.
  You decide whether either rides along with the next Circle or waits.
- **The task queue is three weeks stale.** `tasklist.md` still holds the fully closed queue from
  the Circle that closed on 260716, tracked at
  `shared/issues/260801-2038_o_tasklist-holds-a-fully-closed-queue-from-a-circle-closed-two-weeks-ago.md`.
  A taskplanner run refreshes it; playmaker does not read or write that file.

No dependency cycles were detected among the anticipated Circles, no Circle carries the bounded
marker so no parent Grounding is stale, and the `.active-circle` pointer state is consistent
(absent while no Circle carries the active marker).
