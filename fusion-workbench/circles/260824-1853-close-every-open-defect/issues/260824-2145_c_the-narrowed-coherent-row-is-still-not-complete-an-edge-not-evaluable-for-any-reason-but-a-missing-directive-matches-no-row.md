The narrowed `coherent` row is still not complete: a `coherent` verdict with an edge `not evaluable` for any reason other than a missing Directive matches no recommendation row
---
`agents/reconciler.md:175-181` after `011cc92`: row 1 is "either Directive edge `not evaluable` **because no Directive was stated** → `state Directive`"; row 2 is "`coherent` with every edge evaluable → `none`". `:114` says an edge reads `not evaluable: <reason>` whenever "its input does not exist", and the Artifact↔Directive edge (`:111`) is built from `git log <session-start-HEAD>..HEAD`, so a session with a Directive and no commits (a planning-only Turn, an interrupted session resumed and closed) yields that edge `not evaluable: no commits` with the verdict `coherent` (computed "over the edges that were evaluable", `:114`). Neither row matches: the reason is not a missing Directive, and not every edge is evaluable. The recommendation line the orchestrator reads at `:754` is then whatever the reconciler improvises, which is the case `rules/critical-stance.md` §4 names.
---
**Filed by:** coderev (person half absent: the installed plugin at `$FUSION_PLUGIN_ROOT` carries no `bin/fusion-identity`, so attribution was dropped rather than composed)

Scope: `agents/reconciler.md:175-181`. Range `01964e4..13aaa85`, commit `011cc92`; follow-on to `260824-2056_c_the-reconcilers-state-directive-recommendation-overlaps-the-coherent-row-and-the-orchestrator-never-surfaces-it.md`.

Fix direction: one more row, "`coherent` with an edge `not evaluable` for any other reason → `none`, and the reason is carried on the edge line", or fold it into row 2 by dropping "with every edge evaluable" and making row 1 the only exception. Prose only.

Severity: Low.

---
Resolved: fixed — row 2 is now `coherent` otherwise → `none`, with a non-Directive `not evaluable` edge carrying its reason and row 1 the only exception; `agents/reconciler.md:177`
