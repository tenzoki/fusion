Plan step 8's third verification expects a hash count of zero that a third passage makes unreachable

---
`260907-1450_*_plan-bounded-executor-dispatches.md` `### 8. Make the room` verification item 3 asks
that `grep -c '045a14f\|f38f37d' agents/orchestrator.md` return 0 once the two narratives have moved.
It returns 1. `f38f37d` also stands at `agents/orchestrator.md` in the `## Staging check` section, in
a passage beginning **Do not answer it by widening `git add`.**, which is not one of the two bullets
the step moves and which the step forbids moving.

---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>

**The step was performed correctly.** The coder reported the 1 rather than reaching for it, refused
to move a third passage to satisfy a number, and said why. `045a14f` did reach 0, and the two-way
grep over `rules/commit-lock.md` returns 2 as the step asks. The lossless-move criterion was met and
verified separately by diffing the moved prose against its own text at HEAD, byte for byte.

**What the wrong expectation costs.** An executor taking item 3 literally either fails its own
verification while having written exactly what was asked, or moves a passage the same step forbids
moving. This is the third defect of the same shape in this plan, after
`260908-1619_*_plan-step-5-prescribes-a-minute-illustration-its-own-acceptance-criterion-forbids.md`
and `260908-1648_*_plan-step-7-asks-for-eight-changed-golden-blocks-where-seven-bound-agents-exist.md`:
a verification or acceptance line stating a figure that the step's own instructions make unreachable.

**Acceptance test.** Item 3 names the two hashes separately, expecting `045a14f` to reach 0 and
`f38f37d` to reach 1 with the surviving passage named, or it drops the second hash and keeps the
first. Whether the plan is worth amending at all after the step has run is not decided here.

---
Reconciliation 2026-09-08: verified against the tree at `de94102f` and still open. The passage this record is about is unchanged in its source file, so the defect stands whatever the plan step's marker says.

---
Reconciliation 2026-09-08: verified against the tree at `de94102f`. `agents/orchestrator.md:1028` still carries `f38f37d` in a third passage that Step 8 did not move, so the step's third verification (`grep -c '045a14f\|f38f37d' agents/orchestrator.md` returns 0) reads 1 and is unreachable as written. Step 8 itself is correctly done: both moved narratives are in `rules/commit-lock.md` (grep returns 2) and neither is in the prompt. The marker stays `_o_`.

---
Resolved: verification item 3 now reads the two hashes separately, expecting `045a14f` to reach 0 and `f38f37d` to reach 1, and names the surviving `## Staging check` passage that makes the second unreachable. That is the first of the two repairs this record's acceptance test names. Corrected on the user's ruling of `260908-2051_*_is-a-completed-plan-amended-when-one-of-its-verification-lines-turns-out-unreachable.md`, option 1.
