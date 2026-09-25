The README-agents closure note cites a line that does not cite and a skills/next line that is blank
---
`260824-2056_*_readme-agents-still-cites-skills-next-at-line-147-153-after-step-10-moved-the-block-to-139-146.md` closes with a `Resolved: fixed` note that names four `skills/next/SKILL.md` citations in `README-agents.md` (the block `:139-146`, `**Domain:**` `:138`, `**Proposal source:**` `:146`, "the contract restatement `:148`") and locates them at `README-agents.md:53,58,60,61`. Read against HEAD (`13aaa85`): the lines of `README-agents.md` that cite `skills/next/SKILL.md` are 53, 59, 60 and 61, not 58; they carry `:139-146` (53, 60), `:97` and `:138` (59), and `:146` (61), five tokens, of which the note names four and omits `:97`. No line of `README-agents.md` cites `:148`, and `skills/next/SKILL.md:148` is a blank line; the sentence "List only the approved operations" is `:149`. The citations in the doc itself are right (`:97` opens the Step 3 dispatch fence, `:138` is `**Domain:**`, `:139-146` is the block, `:146` is `**Proposal source:**`); it is the closure note's account of them that is off, and closure notes leave the citation gate's corpus the moment the record is renamed (Turn 1 review, finding 4).
---
**Filed by:** ontorev
**Attribution backfilled 260825 (not written by the filing agent):** `ontorev` filed this record; the person half of `**Filed by:**` is absent because the installed plugin at `$FUSION_PLUGIN_ROOT` carried no `bin/fusion-identity` at that time. See `260825-1329_*_every-session-runs-one-release-behind-on-a-bin-helper-the-same-repository-just-added.md`.
**Severity:** Low
**Domain:** data
**Affects:** `260824-2056_*_readme-agents-still-cites-skills-next-at-line-147-153-after-step-10-moved-the-block-to-139-146.md` (last line)
**Cross-references:** `README-agents.md:53,59,60,61`; `skills/next/SKILL.md:97,138,139-146,149`; `260824-2059_*_two-stilwerk-closure-notes-cite-a-line-one-above-the-text-they-name.md` (the same class, and the `Corrected:` shape it established)

Attribution: the person half of `Filed by:` is absent because the installed plugin copy (`$FUSION_PLUGIN_ROOT/bin/`) does not carry `bin/fusion-identity`; the guarded call failed with the helper missing, not with exit 4, so an identity was owed and could not be read.

Fix: append a `Corrected:` line to the closed record naming the citing lines as 53, 59, 60, 61, the five tokens including `:97`, and that no `:148` citation exists (the restatement is `:149` and is not cited by the README). The `Resolved:` line stands as written.

---
Resolved: fixed — a `Corrected:` line names the citing lines 53, 59, 60, 61, the five tokens including `:97`, and that `:148` is a blank line whose restatement sits at `:149`; `260824-2056_*_readme-agents-still-cites-skills-next-at-line-147-153-after-step-10-moved-the-block-to-139-146.md:13`
