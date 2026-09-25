`README-agents.md` still cites `skills/next/SKILL.md:147-153` after step 10 moved the block to `:139-146`
---
Commit `f3f7895` (step 8) re-verified the `skills/direct/SKILL.md` line citations in the `## Dispatch parameters` table (`:64`, `:65`, `:66`, `:101-103`). Commit `8140cf3` (step 10) then removed nine lines above `skills/next/SKILL.md`'s Step 5b block. The table's `**Confirmed operations:**` and `**Proposal source:**` rows (`README-agents.md:60-61`) and the preamble (`:53`) still cite `skills/next/SKILL.md:147-153`, `:153` and `:156`; at HEAD the block header is at `:139` and `**Proposal source:**` at `:146`. No gate reads a `path:line` citation (`260818-1637_*_no-gate-resolves-a-path-line-citation-and-thirteen-drifted-in-a-single-change.md`, open), which is why the two steps, committed a second apart, passed each other.
---
**Filed by:** coderev (person half absent: the installed plugin at `$FUSION_PLUGIN_ROOT` carries no `bin/fusion-identity`, so attribution was dropped rather than composed)

Fix direction: re-read the three cells against HEAD and correct them; `260818-1637` stays the record for the class.

Severity: Low.
---
Resolved: fixed — the four `skills/next/SKILL.md` line citations in `README-agents.md` `## Dispatch parameters` were re-read against HEAD: the block is `:139-146`, `**Domain:**` `:138`, `**Proposal source:**` `:146`, the contract restatement `:148`; `README-agents.md:53,58,60,61`

Corrected: 260824-2147 (ontocoder, issue `260824-2155_*_the-readme-agents-closure-note-cites-a-line-that-does-not-cite-and-a-skills-next-line-that-is-blank.md`) — the citing lines of `README-agents.md` are 53, 59, 60 and 61, not 58; between them they carry five `skills/next/SKILL.md` tokens, `:139-146` (53, 60), `:97` and `:138` (59), `:146` and `:148` (61). The `:148` token the note called the contract restatement points at a blank line; the restatement is `skills/next/SKILL.md:149`, so `README-agents.md:61` carries a drifted citation the note did not correct (filed separately). The `Resolved:` line stands as written.
