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

Resolved: by the commit that carries this line. All four sites now say the same thing about who confirms an edge. `rules/fusion-workbench-conventions.md` `## Backlog entries — work items` keeps the rule and names the one exception in the shape `**Mode:** autonomous` already has there: the curator's proposals are inert until somebody rules at the gate, and the field on the item the survey targets is the one route by which a proposed entry is written without a per-entry ruling, with `agents/orchestrator.md` `## Human Gate Rules` cited as the authority for which gate conditions it answers. `agents/curator.md` says the same at both of its sites, the inertness sentence and the wide-field sentence. `docs/working-model.md` reads "carries the edges you ruled on, or that your `**Mode:** autonomous` field ruled on for you", and the helper paragraph further down, which carried the same wording about confirmed edges, now says the helper reports over the edges as the store carries them.

`agents/orchestrator.md` gains the identification the finding also asked for: the item whose field is read is the one the `**Edges:** on` survey targets, named on the survey dispatch, and a survey carrying no `**Edges:**` line targets no item, so no field is read and the gate asks as written.

Step 7's bound on the citation arm is untouched here: that step decides what the pass proposes, this one who confirms what it proposed.

`bin/fusion-prose-metric` reads the two prompts `over`, as it did at `49ab50e4` (curator 156 em-dashes both times, orchestrator 171 both times). No em-dash was added and both rates fell, 13.2 to 12.9 and 12.1 to 12.0 per 1 000 words. The plan expected `ok` on every row; neither prompt has been `ok`.
