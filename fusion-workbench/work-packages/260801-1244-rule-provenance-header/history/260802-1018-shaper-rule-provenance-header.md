# Shaper — rule provenance header (C8), clarification round 1

**Date:** 2026-08-02
**Mode:** in-Circle clarification
**Circle:** `260801-1244-rule-provenance-header`
**Status:** paused, awaiting four user answers. No spec written yet.

## What was done

**Part 1, the Grounding correction, is complete.** The record's `## Grounding snapshot` said nine rule files. Re-verified independently rather than trusting the dispatching count: `ls -1 rules/` returns ten entries at HEAD `e8988d9`, one of which carries a provenance line. The section now states ten, names the nine without a header, and records that `rules/protected-path-discipline.md` was authored hours after D3 was answered and shipped without one.

Three findings were added to the snapshot that the earlier framing did not carry, each verified:

- The existing pattern is section-scoped rather than file-scoped, and there are two instances rather than one (`rules/fusion-workbench-conventions.md:326` and `:654`). C8 asks for a file-level header, which is a different artifact from what the corpus has.
- Two lines would satisfy a loose keyword match without being anyone's provenance: `rules/decision-record-examples.md:20`, inside a worked example, and `rules/fusion-workbench-conventions.md:529`, inside the decision-record template. A gate matching either keyword anywhere in the file passes both files on template text.
- Five of the nine files have no motivating record to cite. They predate the oldest record in the workbench, dated 260621. Four have a recoverable Circle. All nine have a recoverable introducing commit.

Two further facts were verified and added, correcting the record's earlier framing of the archive coupling. The archive store holds zero files here, so the coupling is latent rather than live in this repository. The plugin's workbench is committed to git (237 tracked files), so a citation-resolving check is mechanically possible at test time, which the earlier framing left open.

**Part 2 is incomplete by tool constraint.** `AskUserQuestion` is not available in a sub-agent dispatch, so the four questions were returned to the orchestrator for proxying rather than asked directly. The `## Tool Discipline` contract covers this case and requires the batch-and-return path instead of an interactive attempt.

## Research performed before the questions were drafted

`hooks/lib/__tests__/path-literal-lint.test.ts` was read in full, because the spec fixes the gate to that test's shape. It is a pure text scan over `agents/` and `skills/` using two anchored regexes, with no filesystem resolution of any cited path. A resolving check would therefore be a new capability in that shape, not an extension of it.

All ten rule files were read at the head, `git log --diff-filter=A` was run per file, and every record under the workbench was inventoried to test whether a motivating record exists for each of the nine. The result changed the character of the third question and produced the fourth.

## Artifacts

- Corrected: `260801-1244-rule-provenance-header` `## Grounding snapshot`. No other section touched.
- Filed: `260802-1018_*_what-a-rule-file-with-no-recoverable-record-cites.md`, open. The fourth question, which the spec does not cover.

## Next

The spec at `circles/260801-1244-rule-provenance-header/planning/` is written once the four answers arrive. The planner runs after it.
