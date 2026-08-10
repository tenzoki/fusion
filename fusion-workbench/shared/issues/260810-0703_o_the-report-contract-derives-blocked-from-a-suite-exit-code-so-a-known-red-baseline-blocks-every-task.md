The report contract derives blocked from a suite exit code, so a known-red baseline blocks every task

---

Commit `1f2faaf` gave `agents/coder.md` and `agents/ontocoder.md` a report shape in which `Verification:` admits three forms and `Result` is derived from it, so `done` requires an exit code of 0. The derivation is the load-bearing part of that fix and it works. It also has a consequence nobody stated: **the exit code it reads is the whole suite's, so any pre-existing failure blocks every task that runs the suite, whatever the task touched.**

Observed the same night the contract landed. The R2 executor fixed `bin/fusion-count-sources`, ran `npm test`, got 967 of 968 passing with the single failure in `rules-emission-golden` — a fixture drift in `rules/fusion-workbench-conventions.md`, a file that task never touched — and reported `Result: blocked, by the derivation in agents/coder.md — field 2 decides, not me`. That is the contract behaving exactly as written, and the executor was right to follow it rather than exercise judgement about which failures count.

---

**Why this is not simply "keep the baseline green".** Keeping it green is right and was done here. But the contract now makes a red baseline maximally expensive: it converts one unrelated failure into a blocked report from every executor dispatched until somebody clears it. During a long session with parallel executors, that is every task in flight. And the party who can clear it is often not the party being blocked, so the blocked reports arrive while the fix is somebody else's to make.

**What the contract cannot currently express.** There are three states and the shape only distinguishes two:

1. The verification passed.
2. The verification failed **because of this task**.
3. The verification failed for a reason that predates the task and is named, owned and tracked elsewhere.

Case 3 currently reads as case 2. The dispatch prompts in this session worked around it by naming the known failure in prose ("one failure is known and is not yours"), and every executor correctly reported *which* failure it was — so the information survived, in the report body, while the derived field said `blocked`. A convention that works only because the dispatcher remembers to warn is the shape `rules/critical-stance.md` §2 names.

**Three ways it could go, none obviously right:**

1. **Leave it.** A red baseline is a real defect and blocking on it is arguably correct: the alternative is executors deciding for themselves which failures are theirs, which is exactly the judgement the derivation removed. The cost is the noise above.
2. **Add a fourth `Verification:` form** for "failed, and the failure is named and predates this task". This reintroduces a judgement call, and the reviewer's own findings this session show how readily an agent's self-assessment overstates (`260810-0502`, `260810-0510`).
3. **Make the question narrower rather than the answer softer.** Ask the suite about the task's own surface — the tests that touch the changed files — so the exit code being read is about this task. That is the shape `critical-stance` §4 recommends when a question cannot be decided from the inputs at hand: change the question, not the tolerance. It costs a way to select tests per change, which this repository does not currently have.

**Not a defect in `1f2faaf`.** The derivation is what made `done` mean something. This records a consequence that was not visible until a red baseline and the new contract coexisted, which happened about two hours after it landed.
