`README-agents.md` still cites `skills/next/SKILL.md:147-153` after step 10 moved the block to `:139-146`
---
Commit `f3f7895` (step 8) re-verified the `skills/direct/SKILL.md` line citations in the `## Dispatch parameters` table (`:64`, `:65`, `:66`, `:101-103`). Commit `8140cf3` (step 10) then removed nine lines above `skills/next/SKILL.md`'s Step 5b block. The table's `**Confirmed operations:**` and `**Proposal source:**` rows (`README-agents.md:60-61`) and the preamble (`:53`) still cite `skills/next/SKILL.md:147-153`, `:153` and `:156`; at HEAD the block header is at `:139` and `**Proposal source:**` at `:146`. No gate reads a `path:line` citation (`shared/issues/260818-1637_o_no-gate-resolves-a-path-line-citation-and-thirteen-drifted-in-a-single-change.md`, open), which is why the two steps, committed a second apart, passed each other.
---
**Filed by:** coderev (person half absent: the installed plugin at `$FUSION_PLUGIN_ROOT` carries no `bin/fusion-identity`, so attribution was dropped rather than composed)

Fix direction: re-read the three cells against HEAD and correct them; `260818-1637` stays the record for the class.

Severity: Low.
