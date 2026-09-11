A Depends-on entry asserts an ordering where the section it was derived from asserts a conflict
---
The migration derives `**Depends-on:**` mechanically from a record's `## Dependencies` section, keeping entries that name a converted container. This workbench's claimed item now carries one such entry whose source section says the two pieces of work **conflict** — "substantive rather than an ordering nicety", in its own words — and that they cannot both proceed as written. The field name claims a precedence the body denies.
---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Cross-references:** a8f52f62 (step S10, which wrote the entry as the rule prescribes); 2f8d1082 (the derivation rule); 260909-1808_*_may-a-helper-compute-an-order-over-work-items-after-the-portfolio-layer-goes.md

**Why the entry was written rather than judged.** The migration's rule is deliberately mechanical and tells the converter not to inspect the prose. Reinterpreting a section the rule says not to read would have substituted one agent's judgement for a stated procedure, so the line was written as prescribed and the divergence filed. The full prose sits three lines below the field in the same record, so a human reader is not misled.

**Why it still matters.** `**Depends-on:**` is the machine-readable half of the design. `260909-1808_*_may-a-helper-compute-an-order-over-work-items-after-the-portfolio-layer-goes.md` authorises a helper to compute an order over work items from exactly this field, and that helper is the unbuilt work of the very item the edge names. So the harm is latent rather than live — but it is latent in the one place that will read the field first.

**The general defect behind the instance.** A prose `## Dependencies` section carried three relations without distinguishing them: this needs that first, this is blocked by that, and this contradicts that. The field carries one. A mechanical derivation from the first to the second cannot preserve which was meant, and the migration has no input that would let it.

**Acceptance.** Either the field's definition in `rules/fusion-workbench-conventions.md` says which relation it carries and the migration drops what it cannot express, naming each drop, or a second field distinguishes them. The one live instance is corrected in the same change. Deciding this is a decision record's job if the answer is not obvious from the field's one reader.
