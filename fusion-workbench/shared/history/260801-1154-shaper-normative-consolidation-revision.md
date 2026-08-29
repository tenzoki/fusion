# Shaper session — normative-surface consolidation, revision pass

**Date:** 2026-08-01 11:54
**Agent:** shaper (user-direct mode, revision of a prior shaper output)
**Output:** `260801-1122_*_spec-normative-consolidation.md` (revised in place)
**Prior run:** `260801-1122-shaper-normative-consolidation.md`

## Request

Revise the spec after the user answered all eight decisions that the first pass left pending (D-a through D-h). Record each answer with its rationale, update every capability whose proposed default changed, re-assess the Circle split, and flag anything in the answers that creates a new problem.

## What was read

- The spec and the prior shaper history in full.
- `260801-0936-orchestrator-session.md` `## Design decisions (session, 260801)` and `## Spec decisions (D-a through D-h)`.
- `260801-1020_*_provenance-header-on-rule-files.md` (D3, now walked to anticipated and carrying its `Answered:` line).
- `bin/fusion-rules` emission block (lines 150-170, 255-300), `hooks/guard.ts` tool-interception block, `hooks/lib/config.ts`, `hooks/config.json`, `hooks/lib/__tests__/path-literal-lint.test.ts` header, `skills/setup/SKILL.md:141-144`, `.gitignore`.

## Verifications performed during this pass

Everything below was run, not inferred.

- **`.claude/` is gitignored in this repo** (`.gitignore:2` is `.claude/`). This makes `.claude/rules/retired/` a destination with the same durability failure the user rejected the workbench archive for. C4 gained a version-control precondition on the destination as a result.
- **The guard never path-checks a shell move.** `hooks/guard.ts:238-266`: `writeTools` is `Write`, `Edit`, `MultiEdit`, `NotebookEdit`; `Bash` is routed to `guardBashCommand`, which only inspects git branch and worktree operations. A `mv` or `git mv` of a rule file bypasses `protectedPaths` entirely, so C4's retirement move would work with `FUSION_ALLOW_RULES_WRITE` unset. Raised as Q2 in the spec.
- **`rules/**` is in `protectedPaths`** (`hooks/config.json:8-18`), so `rules/retired/` is itself protected and C5a's exemption has to cover it. Added as an acceptance criterion.
- **Six plugin rules are emitted by explicit path, not by pattern** (`bin/fusion-rules:262-267`). Relocation stops them loading, because `emit_if_exists` skips a missing file, but leaves the helper naming a dead path. C4 now requires the curator to report and stop in that case rather than leave the helper stale.
- **Citation load on the conventions file:** 131 citing lines across 42 files; 70 name a `##` section; 0 cite a line number. The absence of line-number citations is what makes C9's citation rewrite tractable.
- **Conventions file shape:** 32 second-level headings, 698 lines, 52 lines carrying a normative keyword. These are the numbers C9's preservation checks start from.
- **`/fusion:setup` seeds `plane.config.yaml` idempotently from `templates/`** (`skills/setup/SKILL.md:141-144`). C5b's seeding follows that shape.

## What changed in the spec

- Status rewritten: all eight decisions answered, four new questions raised.
- D3 in the frontmatter moved from open to answered, with the record's new `_a_` path.
- `## User Decisions Pending` replaced by `## Decisions taken` (D-a through D-h with rationale) plus a new `## Questions raised by the answers` (Q1 through Q4).
- C1: name `curator` confirmed; `bin/` and `hooks/` added to the explicit non-remit.
- C2: provenance header added as an eighth evidence source; the thin-spot paragraph now states that C8 narrows the gap forward but not backward.
- C4: destination changed from the workbench archive to `<root>/retired/`, with the two verified reasons; version-control precondition added; guard-bypass requirement added; explicit-emission caveat added.
- C5: configuration moved to the project root, git-tracked; seeding by `/fusion:setup` specified as inherit-by-default; self-protection floor restated for the new location.
- C6, C7: proposed defaults confirmed; skill named `/fusion:curate`.
- C8 (new): provenance header, backfill of all nine plugin rule files, lint gate.
- C9 (new): the conventions split, performed by the finished curator, with the preservation standard stated against the pre-split git blob.
- Mermaid diagram extended with the provenance source and the split node.
- Constraints and Out of Scope updated for the five new verified facts.

## Circle recommendation

Three Circles, not the two the first pass proposed. Recorded here rather than in the spec, since sequencing belongs to the planner and the spec should not carry an implementation order.

1. **Guard** (C5). Independent of the other two. Must be verified against something that is not the plugin repo, because the write guard stands down here.
2. **Provenance header** (C8). Independent of the guard. Must land before the split, because the split's output is checked by C8's lint gate.
3. **Curator** (C1 through C4, C6, C7, then C9 as the closing capability). Depends on C8. Depends on the guard only for the exemption to be exercisable in a consuming project; the curator itself is buildable and testable in this repo without it.

## Nothing filed

No new issues or decision records. Q2 (the guard bypass on shell moves) is the one candidate for a decision record, but it is a scope question inside this spec's own subject matter, so it is stated in the spec and put to the user rather than filed separately. If the user defers it rather than answering, it becomes a decision record at `$OUT_DECISION`.
