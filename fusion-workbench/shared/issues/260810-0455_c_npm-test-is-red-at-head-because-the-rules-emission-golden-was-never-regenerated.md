# `npm test` is red at HEAD: the rules-emission golden was never regenerated after the conventions file grew

---

**Severity:** High — release blocker for this range
**Domain:** code
**Filed by:** coderev, review of `8960e1a..HEAD` (session `260810-0241`, Turn 1)
**Affects:** `hooks/lib/__tests__/rules-emission-golden.test.ts:704`; caused by `rules/fusion-workbench-conventions.md`
**Cross-references:** commits `65f7c3b`, `e99f0ef`

---

## The defect

`npm test` fails at HEAD. Verified directly, not inferred from a summary:

```
 FAIL  lib/__tests__/rules-emission-golden.test.ts > rules emission golden
       > matches the checked-in golden, agent by agent

  [analyst]
    agent-setup.md 3513
-   fusion-workbench-conventions.md 39529
+   fusion-workbench-conventions.md 41680
-   total 90168
+   total 92319
```

Full suite: `Test Files 1 failed | 36 passed (37)`, `Tests 1 failed | 961 passed (962)`.

Two commits in this range grew `rules/fusion-workbench-conventions.md` and neither touched the
golden:

- `65f7c3b` added `### Which of them a tracked workbench tracks`
- `e99f0ef` added the empty-resolver-key paragraph to `## Path Resolution`

Measured growth: 39 529 → 41 680 bytes, exactly the 2 151 the assertion reports. The golden was
correct at `8960e1a` (39 529), so the red state was introduced inside this range rather than
inherited.

## Why it matters

The release process in `CLAUDE.md` opens with "**Validate first**". A tag cut from this commit ships
a suite that does not pass, and the next executor to run `npm test` for an unrelated reason meets a
failure it did not cause and has to decide whether to trust it.

Worse for the mechanism itself: this golden exists to make the per-dispatch byte cost of the always-on
rule set *visible and deliberate*. `fusion-workbench-conventions.md` is emitted to all sixteen agents
on every dispatch, so 2 151 bytes here is 2 151 bytes per agent per dispatch. Both authoring commits
stated the byte cost in their messages. Neither carried it into the one artefact whose whole job is
to force that number to be re-approved. A gate that is routinely left red teaches its readers to
ignore it.

The assertion aborts on the first mismatching agent (`analyst`), so whether other agents' totals also
drifted is not visible in the failure output. Regenerating will show the full set.

## Fix direction

Regenerate the golden deliberately, per the instruction in the test file's own header, and confirm the
new totals are the intended cost. If the cost is judged too high, the alternative is the one the
conventions file already documents for itself: partition the new material into its own authoring home
with a derived audience, the way `circle-records.md` and `workbench-stash-and-lock.md` were
partitioned out. See the separate finding
`260810-0455_o_the-tracked-workbench-section-re-enumerates-a-closed-list-and-leaves-one-surface-unclassified.md`,
which argues one of the two new sections does not earn an all-sixteen-agent audience.

---
Resolved: the fixture is regenerated, and the cost it forces a party to approve is stated here rather than left in a diff.

The golden moved `fusion-workbench-conventions.md` from 39 529 to 41 680 bytes, +2151, and every agent's emitted total by the same amount — from 84 495 to 86 646 for the twelve agents on the base set, and from 90 168 to 92 319 for the three that also receive `circle-records.md` and `workbench-stash-and-lock.md`. That is what each agent now carries on every dispatch.

Two sections account for it, both landed tonight, both stating their own cost in the commit that added them:

- `e99f0ef`, 670 bytes — the consumer-side end of the resolver's exit-4 refusal: a consumer receiving an empty or unset key stops and names it. Written once here rather than re-typed into eight skill bodies.
- `65f7c3b`, 1481 bytes — § "Which of them a tracked workbench tracks", which two dependent tasks (`260717-0030` stash sweep, `260801-1020` archive durability) needed in order to stop re-deriving the same answer.

**Approved deliberately, by the orchestrator, which is the party the gate is built to stop.** The gate exists so that growth in the always-on rule set is re-approved rather than absorbed, and both additions were argued for and trimmed before landing (the first was 896 bytes in draft). The reviewer's observation that neither authoring commit carried the regeneration is correct and is the actual lesson: the deferral was reasoned — two more rules edits were expected this session, and three fixture diffs where one suffices is real churn — but a deferral with no owner leaves `npm test` red across a session boundary, where the next reader cannot tell a deliberate red from a broken one.

**A residual this exposes, filed separately as `260810-0703`:** the executor report contract that landed tonight in `1f2faaf` derives `Result` from the suite's exit code, so a known-red baseline blocks every task that runs the suite. The R2 executor reported `blocked` for a failure in a file it never touched. That is the contract behaving as written; whether it should have a way to name a known-failing baseline is the open question.

Session: `shared/history/260810-0241-orchestrator-session.md` (Turn 2).
