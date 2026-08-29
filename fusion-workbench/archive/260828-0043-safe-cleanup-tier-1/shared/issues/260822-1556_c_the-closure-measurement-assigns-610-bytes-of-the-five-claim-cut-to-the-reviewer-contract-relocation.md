The closure measurement assigns 610 bytes of the five-claim cut to the reviewer-contract relocation

---

Three records state the size of one relocation and two of them disagree with the third by 610
bytes. The figure reaches a closure gate, so the disagreement is worth a byte rather than a shrug.

---

**What each record says.** `260822-1350-coder-cut-agents-surface-step3.md:28` says
"**One relocation, 8 894 bytes out of two prompts**", and
`260822-1330_*_where-does-the-reviewer-contract-live-when-the-agents-surface-has-to-give-back-bytes.md`
repeats it in its `Implemented:` note: "`rules/review-contract.md` created carrying 8 894 bytes
lifted from `agents/coderev.md` and `agents/ontorev.md`".
`260822-1540-coder-c0-step-9-closure-measurement.md:69-73` states it differently:
"`coderev.md` gave back 5 240 bytes and `ontorev.md` 4 264, **both to `rules/review-contract.md`**",
and then accounts for "the remaining 5 459 bytes" as "five claims that stood in **all fifteen
prompts**" while listing the per-prompt reductions "across the other **thirteen** files".

**Which is right.** Measured per file at `181dd8a`, the fifteen prompts fell by 5 240 (`coderev`),
4 264 (`ontorev`), 637 (`editor`), 496 each (`shaper`, `playmaker`, `planner`, `orchestrator`,
`consultant`, `analyst`), 321 (`curator`) and 305 each (`taskplanner`, `reconciler`, `ontocoder`,
`coder`, `bugfixer`). The thirteen non-reviewer prompts sum to 5 459 and the two reviewer prompts to
9 504; the total, 14 963, is the figure both records agree on. The five claims stood in all fifteen
prompts, so `coderev` and `ontorev` each carry 305 bytes of that cut inside their 9 504. Subtracting
the two gives 8 894 for the relocation, which is what the step-3 history and the decision record say.
The closure measurement's "both to `rules/review-contract.md`" over-assigns those 610 bytes, and its
own next sentence contradicts it by counting a fifteen-prompt claim across thirteen files.

**Why it is worth filing rather than letting stand.** The relocation is the one item in this Circle
that was accepted at a user gate on the statement that it is a relocation and not a cut
(`260822-1330_*_…`, and the record's own constraint: "the relocation is reported as
a relocation; calling it a cut would put a byte figure in the closure note that nobody could
reproduce"). A closure note quoting 9 504 for it quotes a number 610 too large for exactly the
reason the constraint names. The head-room totals are unaffected: 14 963 is correct however it is
partitioned, and `agents/*.md` stands at 16 601 bytes either way.

**Fix direction.** Correct the sentence in the closure measurement to name 8 894 for the relocation
and 610 as the two reviewer prompts' share of the five-claim cut, and make the following sentence
say "the remaining 5 459 bytes across the other thirteen prompts" rather than implying the claims
stood in thirteen. Do not touch the step-3 history or the decision record: both are already right.

**Affects:** `260822-1540-coder-c0-step-9-closure-measurement.md:69-73`.

**Severity:** Low. No head-room figure and no gate reads the partition; what is wrong is one
sentence in the record a closure note will quote.

**Found by:** reconciler, session-end pass over `370bfc5..9f65463`, HEAD `9f65463`. Measured with
`git cat-file -s` over the fifteen prompts at `181dd8a` and its parent.

---
Resolved: fixed — the closure measurement carries the appended correction, 8 894 for the relocation and 610 as the reviewers' share of the five-claim cut; 260822-1540-coder-c0-step-9-closure-measurement.md:288
