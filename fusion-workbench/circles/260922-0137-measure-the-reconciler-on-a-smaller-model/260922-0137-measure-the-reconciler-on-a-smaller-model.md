# Run the reconciler once on a smaller model against the same workbench state and compare the two reports

---
**Domain:** code
**Status:** open
**Cross-references:** 260827-1305_*_which-agents-run-on-a-smaller-model.md, 260827-1305-does-agent-frontmatter-model-reach-the-dispatch.md
**Filed by:** user, Kai Stalmann <ks@qantr.com>

---

## Directive

The decision `260827-1305_*_which-agents-run-on-a-smaller-model.md` has waited four weeks on an experiment no session starts by itself; the user chose on 260921 to file it as work rather than answer without evidence. Produce the evidence that record asks for: one reconciliation run with `agents/reconciler.md` carrying `model: haiku` in a work tree (`claude --plugin-dir .`), against the same anchor and the same workbench state as a control run on the session model, and a comparison of the two reports: discrepancies found, discrepancies missed, wrong claims. The control candidate is the 260921-2230 reconciliation (anchor `7a2361aa`, HEAD `cb8776f3`), which found 21 drift items and four located answers; if that state cannot be reproduced, take a fresh control pair on one day. The model actually used is read from the transcript (`subagents/*.jsonl`), never from the agent's own report. The item is reached when the comparison is written as an analysis and the decision record carries an `Answer located:` line pointing at it; ruling on the decision stays the user's.
