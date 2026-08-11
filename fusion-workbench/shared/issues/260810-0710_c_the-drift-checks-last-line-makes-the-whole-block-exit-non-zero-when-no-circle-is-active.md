The drift check's last line makes the whole block exit non-zero when no Circle is active

---

The drift check added in commit `9bad4d6` (`agents/orchestrator.md`, `### Drift check` under `## Persistent State File`) ends with a guarded row of the shape `[ -n "$REC" ] && row "Circle Turn log" …`. When no Circle is active, `$REC` is empty, the `&&` short-circuits, and because that guard is the block's **final** command its status becomes the block's status. The whole drift check exits non-zero on the ordinary case of a session running outside a Circle.

---

**How it was found.** Reported by the executor of the queue-retirement fix (`3df0c17`) while working in the same file. It is not that task's defect and was left unfixed deliberately: different class, different commit.

**Why it matters more than an exit code usually does.** The drift check exists to detect a bookkeeping step that silently stopped happening. A check that reports failure on its own most common path teaches its reader to ignore its status, which is the failure mode it was built to catch, arriving one level up. The session where nothing is wrong is exactly the session in which the check cries wolf.

**It is the second instance of one shape tonight**, and that is the reason to read the two together rather than patch each:

- `260810-0506` — the activation pointer write in `/fusion:next` step 6.3 exits non-zero when no queue exists.
- This record — the drift check's trailing guard, `agents/orchestrator.md`.
- Both arrived in Turn 1 of session `260810-0241`, in `ff70d3a` and `9bad4d6` respectively, written by different agents within an hour of each other.

The shape is: a conditional written as `[ test ] && action` in final position, where the intended reading is "do this if applicable" and the delivered reading is "the block failed if it was not applicable". It is a well-known shell idiom hazard, and its appearance twice in one Turn suggests the corpus does not warn about it anywhere an author would meet it.

**Three questions, not one:**

1. Fix this site. Mechanically small: an explicit `if`, or a trailing `true`, or reordering so the guard is not final.
2. Fix `260810-0506` the same way, or decide the two are genuinely separate.
3. Decide whether the shape earns a check. `hooks/lib/__tests__/` now holds several lints that parse prompt and skill bash blocks; a guard in final position is a syntactic property those extractors could already see. Against it: the corpus has enough prose-parsing lints of doubtful value (`260810-0502`, `260810-0510`), and adding one more without deciding whether that whole cohort earns its keep is the rim of special cases `rules/critical-stance.md` §2 names.

---
Corrected 260811 (issue `260810-0751`): the opening read "third instance" and "the three" while the list under it carries two bullets, the sentence after it says "Both", and `8d66265`'s message says "second". Counted against the tree: two sites (`agents/orchestrator.md` drift check, `/fusion:next` step 6.3), two records, one fix commit `ac68437` touching exactly those two files, and no third record of the shape filed in that range. The number is two, and the text now says so once. The record stays closed; the corpus-wide count the third question below would need is a different question and is still open.

Resolved: ac68437 — explicit if at both sites. Measured by extracting each block from its own file and running it: drift check 1 to 0 with no Circle active, /fusion:next 6.3 1 to 0 with no queue, and 0 to 0 in both applicable cases with their output intact. A trailing true was rejected as broader than the defect. No lint added; the third question this record raises stays open.
