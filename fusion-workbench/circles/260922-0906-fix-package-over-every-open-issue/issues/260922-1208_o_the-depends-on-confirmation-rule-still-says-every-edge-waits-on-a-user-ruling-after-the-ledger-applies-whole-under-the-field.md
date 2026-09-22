The `**Depends-on:**` confirmation rule still says every proposed edge waits on a user ruling at the curator's gate, after `57e2b7eb` let the ledger apply whole under `**Mode:** autonomous`
---
`agents/orchestrator.md:610` (since `57e2b7eb`, realising option 2 of `260922-1028_*_which-gates-does-the-autonomous-mode-answer-beyond-the-plan-the-claim-and-the-finish.md`, "edges included"): "Under `**Mode:** autonomous` on the item the survey targets, the ledger is applied whole: the apply dispatch carries `**Approved:** all`". An `**Edges:** on` survey's ledger carries `**Depends-on:**` proposals, so under the field they are written with no per-entry ruling.

Three normative statements still say the opposite, unqualified:

- `rules/fusion-workbench-conventions.md:229`: "**An entry stands on the user's confirmation, and no agent writes one without it** … the curator's `**Edges:** on` survey … whose proposals are inert until the user rules at its gate, so the write still stands on the user's confirmation."
- `agents/curator.md:240`: "is inert until the user rules: nothing reaches a work item before the gate"; `:242`: "as a proposal the user confirms".
- `docs/working-model.md:46`: "carries edges you confirmed".

Two binding surfaces now contradict each other on who confirms an edge. The ruling is the user's and stands; the rule text is what has to follow it, in the same shape `:207` of the conventions already uses for the field ("the user's standing answer … which gate conditions it answers … is `agents/orchestrator.md` `## Human Gate Rules`"). One further point for the fix to settle in the orchestrator paragraph: "on the item the survey targets" names an item a curator survey does not have unless `**Edges:** on` is set, so the paragraph should say which item's field it reads.

Acceptance: the three sites name the field as the one route by which an edge is written without a per-entry ruling, citing `agents/orchestrator.md` `## Human Gate Rules`; `awk '/^## Backlog entries/,/^## Dispatching/' rules/fusion-workbench-conventions.md | grep -c 'Mode:\*\* autonomous'` is at least `2`; `cd hooks && npm test` exits 0 (the conventions file is always-on, so the dispatch-path bound reports the byte delta; the pin moves only if a token is added).
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
Executor: `coder` (rule and prompt text; the conventions file is under `rules/`, so `rules/rule-file-provenance.md` applies to the edit). Found in the closing review `260922-1208-reviewer-closing-pass-over-the-51-issue-package-451bb312-to-bf515cad.md`.
