The deferred state has no value in the work item's status set
---
`**Status:**` takes `open | claimed | done | dropped`. The Circle vocabulary's `_d_`, deferred, maps to none of them. The migration body proposes `dropped` and marks every such Circle as formerly deferred so the user can say `open` instead before confirming, but after the migration the live distinction between "we decided not to" and "not now" is gone.
---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Cross-references:** 76d833be (the status set and its justification); 07961552 (the migration body); 260909-1843_*_implementation-cut-fusion-to-a-working-minimum.md step D1

**Evidence.** The status set was chosen deliberately and its reasoning is in the conventions: `dropped` collapses the issue vocabulary's `_c_`/`_d_` and the Circle vocabulary's `_c_`/`_b_`/`_s_`/`_d_`, because the body says which happened and the marker only ever abbreviated it. That argument holds for the closed-versus-bounded pair. It is weaker for deferred, because deferred is not a way of finishing: a dropped item is not coming back and a deferred one is waiting.

**Why it matters at D1 and not before.** The migration is the one-way step, and it is where every deferred Circle in this workbench takes a status it did not have. The body's `[was deferred]` marking makes the choice visible at the confirmation, which is the right place — but the choice offered is between two values, neither of which means what the old one did.

**Acceptance.** Before D1 runs, the conventions say either that `open` is the correct target for a deferred Circle and why the distinction is not worth a value, or that the status set gains a fifth. The migration body then names the target rather than proposing one. Whichever, the answer is written down before the one-way step, not after it.
