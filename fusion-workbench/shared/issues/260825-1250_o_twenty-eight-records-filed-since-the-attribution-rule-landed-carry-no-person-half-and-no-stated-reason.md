Twenty-eight records filed since the attribution rule landed carry no person half and no stated reason

---
`rules/fusion-workbench-conventions.md` `### Who filed it` obliges every filing agent to write the
person half of `**Filed by:**`, or, where the identity helper cannot be reached, to file without it
and say so. Of the 63 records filed after that rule landed, 18 carry the person, 17 carry the stated
absence, and 28 carry neither.
---
**Filed by:** reconciler, Kai Stalmann <ks@qantr.com>
**Cross-references:** `shared/planning/260822-1136_*_spec-fusion-becomes-a-multi-user-tool.md` `### C3` (the acceptance criterion this leaves unmet); `rules/fusion-workbench-conventions.md` `### Who filed it` (the obligation); `bin/fusion-identity` (the helper); `circles/260824-0530-record-attribution-and-circle-claim/_c_circle.md` (the Circle that landed the rule)

## What was measured

Every record under `circles/` and `shared/` whose filename stamp is later than `260824-1214`, the
commit time of `2b055a0`, which is where `### Who filed it` landed. A record counts if it carries a
`**Filed by:**` line at all.

| Outcome | Count |
|---|---|
| Person half present, in git's `Name <email>` form | 18 |
| Person half absent with the reason stated on the line | 17 |
| Person half absent, nothing said | 28 |
| **Total** | **63** |

The 17 are compliant. Each carries the parenthetical the rule's third branch prescribes — *"person
half absent: the installed plugin at `$FUSION_PLUGIN_ROOT` carries no `bin/fusion-identity`, so
attribution was dropped rather than composed"* — which is the exit-127 case the rule names, and it
was true for that session: the helper reached `~/.fusion` only on 260825 at 08:29, and the records
carrying that note were filed on 260824.

The 28 are not. Six agents are represented — `analyst` (8, all the `260824-2013_o_*` decisions in
`circles/260824-1853-close-every-open-defect/`), `ontorev` (10), `coderev` (5), `coder` (3),
`reconciler` (2), `planner` (1) — so it is not one agent's prompt but the obligation's reach.

## Why this is the criterion and not an untidiness

`### C3`'s third acceptance criterion is *"Every agent that files a record writes the field"*. It is
the one criterion of the seven that is a claim about behaviour rather than about text, and it is the
only one of the seven that is not met. Its second half is separately stale — it prescribes `$USER`,
and `shared/decisions/260822-1136_*_which-identity-does-an-attributed-record-carry-when-the-transport-is-git.md`
replaced that with the git identity — but a corrected second half does not repair the first.

## What a fix would have to decide, and it is not obvious

The obligation is text in an always-on rule. Text is what the 28 records show is not sufficient, and
the two candidate directions differ in kind:

1. **Reach.** `### Who filed it` sits under `## Issue and Decision Filing — MANDATORY`, which by its
   own heading addresses defects and decisions. Eleven of the 28 are neither: two histories, one
   review, and the rest are issues. Whether a review file or a session history owes the field at all
   is not stated anywhere, and the spec's condition 1 speaks of *record templates*, three of them.
2. **A gate.** Nothing measures the field. The three blocking gates in `README-hooks.md` all read
   citations, plans and compiled output; none reads `**Filed by:**`. A gate over the field would be a
   fourth, on a surface with its own growth bound, and it would have to encode the two legitimate
   absences (exit 4, exit 127) as passes.

**Severity:** Medium. Nothing malfunctions; what is lost is the attribution the whole of C3 exists to
produce, in 44 per cent of the records written since it landed.

**Found by:** reconciler, session-end pass over `a99e680..cfab17e`, HEAD `cfab17e`.
