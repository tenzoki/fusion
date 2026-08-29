The executor report contract cites `agents/bugfixer.md` as its author, and bugfixer defines a different shape

---

`agents/coder.md:73` and `agents/ontocoder.md:92` both open the `### Report shape` section with
*"This is the report `agents/bugfixer.md` already defines, extended to you — one shape, not a second
mechanism, so the orchestrator reads every executor's report the same way."* `agents/bugfixer.md`
defines no such shape. Its report is `agents/bugfixer.md:98-102`, four bullets under Phase 6 step 18:
root cause, files changed, **"Verification result (pass/fail)"**, path to the history file. There is
no `Result` field, no `done`/`blocked` vocabulary, and no locked three-form `Verification:` line.

---

**Two shapes, not one.** The contract the two executors carry admits exactly three `Verification:`
forms — an exit code, a run that did not finish, or `none` — and derives `Result` from it, so
"done" is a claim about an exit code. `pass/fail` in bugfixer is the free-text field that contract
was written to replace: it has no place to record a run that never returned, and nothing derives
from it.

**Why nothing caught it.** `hooks/lib/__tests__/executor-verification-report-lint.test.ts:39` pins
the contract in `EXECUTORS = ["coder", "ontocoder"]` and in the orchestrator's acceptance step, and
in no other prompt. bugfixer is outside the gate's file set, so its report could drift — and did —
while the gate stayed green. The gate's own header names bugfixer nowhere; the *prompts* are what
name it, in a sentence no gate reads.

**Why it matters beyond the miscitation.** The sentence is the stated ground for not restating the
contract: it says the reader should go to bugfixer for the definition. A reader who does gets the
weaker shape. And the sentence is a duplication-reduction citation of exactly the kind
`260811-1734_*_reduce-the-surface-so-a-claim-cannot-go-stale-in-several-places-at-once.md`
asks for — a citation that points at the wrong file is worse than the restatement it replaced.

**Fix direction, one of two, and the choice is not this record's to make.**

1. Bring `agents/bugfixer.md`'s Phase 6 report onto the executor contract and add `"bugfixer"` to
   `EXECUTORS` in the lint, so the citation becomes true and the gate covers all three executors.
   This adds bytes to `agents/`, which the C0 Circle is currently cutting.
2. Correct the sentence in both executor prompts to name where the contract is actually authored,
   which today is the two prompts themselves plus the lint.

**Affects:** `agents/coder.md:73`; `agents/ontocoder.md:92`; `agents/bugfixer.md:98-102`;
`hooks/lib/__tests__/executor-verification-report-lint.test.ts:39`.

**Severity:** Medium. Nothing is broken at run time; a citation is false and a third executor's
report is outside the contract and outside the gate.

**Found by:** analyst, step 1 of `260822-1154_*_plan-c0-cut-only-circle-buys-head-room-on-four-bounded-surfaces.md`, while measuring restatement across `agents/*.md`. Ledger: `260822-1226-cut-ledger-for-three-bounded-surfaces.md`.

---
Resolved: fixed — option 2: both sentences name where the contract is authored (the two prompts and the lint) and describe bugfixer's Phase 6 report as the four-bullet prior art it extends, which is what it is; `agents/coder.md:73`, `agents/ontocoder.md:92`
