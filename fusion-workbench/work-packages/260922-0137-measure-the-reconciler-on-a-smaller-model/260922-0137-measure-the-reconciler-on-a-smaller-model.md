# Run the reconciler once on a smaller model against the same workbench state and compare the two reports

---
**Domain:** code
**Status:** done
**Claim:** 5e8248d7 — Kai Stalmann <ks@qantr.com>, 260923-0710
**Active spec/plan:** 260923-0713_*_reconciler-on-haiku-measurement.md (the plan; the Directive stands as its spec)
**Cross-references:** 260827-1305_*_which-agents-run-on-a-smaller-model.md, 260827-1305-does-agent-frontmatter-model-reach-the-dispatch.md, 260909-1700-cut-fusion-to-working-minimum.md
**Filed by:** user, Kai Stalmann <ks@qantr.com>

---

## Directive

The decision `260827-1305_*_which-agents-run-on-a-smaller-model.md` has waited four weeks on an experiment no session starts by itself; the user chose on 260921 to file it as work rather than answer without evidence. Produce the evidence that record asks for: one reconciliation run with `agents/reconciler.md` carrying `model: haiku` in a work tree (`claude --plugin-dir .`), against the same anchor and the same workbench state as a control run on the session model, and a comparison of the two reports: discrepancies found, discrepancies missed, wrong claims. The control candidate is the 260921-2230 reconciliation (anchor `7a2361aa`, HEAD `cb8776f3`), which found 21 drift items and four located answers; if that state cannot be reproduced, take a fresh control pair on one day. The model actually used is read from the transcript (`subagents/*.jsonl`), never from the agent's own report. The item is reached when the comparison is written as an analysis and the decision record carries an `Answer located:` line pointing at it; ruling on the decision stays the user's.

## Closure — 260923-0812

Done, commit range `f45664a0..c6c9a9bb` (session 4c6ab811). Plan `260923-0713_*_reconciler-on-haiku-measurement.md`, read from `**Active spec/plan:**`, carried out in full and closed. One transcript-verified candidate run on `claude-haiku-4-5-20251001` beside a same-state control on `claude-opus-5-5`, both over `f45664a0` (not the plan's recorded `99a8e749`: the worktrees were created at the session-start HEAD; both runs share it). Result in `260923-0800-reconciler-haiku-versus-session-model.md`: haiku 8 found, 16 wrong, 13 missed, and reported zero drift where the control found and corrected two lagging records; it also wrote a comparison and an answer pointer outside its role. Not a clean candidate run by the decision's own bar. The decision `260827-1305_*_which-agents-run-on-a-smaller-model.md` carries the `Answer located:` line and stays open; the ruling is the user's.

Stop conditions: all seven put to the user and answered as holding. Branch evidence: the user answered "passt so", read as keeping `exp/reconciler-haiku-260923` (`e9860306`) and `exp/reconciler-control-260923` (`e863e255`) as local, unpushed branches. Review coverage: the four commits in range touch workbench records only, no code and no data, so no review pass was routed; they stay uncovered, and no earlier review carried a `**Not-opened:**` list.
