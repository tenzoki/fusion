fusion-claude-md-weight's last line points at /fusion:curate, which cannot act on a weight finding
---
`bin/fusion-claude-md-weight` ends with 'Act on a finding with /fusion:curate', but curate asks only the truth question and cannot relocate, so the advice is a dead end.
---
**Filed by:** orchestrator (on the user's instruction), Kai Stalmann <ks@qantr.com>

Run on krk: `claude-md=weighed over=6`, last line names /fusion:curate; curate's two krk runs grew the file.

Evidence: `261020-0835-why-a-consumers-claude-md-grows-unchecked.md`

**Acceptance:** The helper's advice names a route that can act on an over-threshold section (a placement-capable curate invocation once it exists, or the hand dispatch until then).
