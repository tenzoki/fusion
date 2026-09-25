Step 0e stamps a replace that may have failed, and a declined offer becomes a conflict named on every run

---

Two end-state defects in `/fusion:setup` Step 0e, both reachable from the answer path the step documents at `skills/setup/SKILL.md:214`.

**1. A failed `cp` is recorded as a successful replace.** `skills/setup/SKILL.md:217`:

```bash
for rel in <the files to replace>; do cp "$FUSION_SRC/$rel" "./fusion-workbench/$rel"; done
```

and the stamp block at `:222-230` then hashes `"$FUSION_SRC/$rel"`, the source, not the destination. If the `cp` fails — read-only workbench, a full disk, a path that does not exist — nothing catches it (`;`-separated, no `||`, no `set -e`), and the record is written anyway. On the next run that file classifies `case3-adapted`, `:205`: "Say nothing about it and do not touch it." A replace the user asked for, that did not happen, is silently converted into an edit the user is presumed to have made, and is never offered again.

The contrast is inside the step itself: Step 0d's copy loop at `:161-169` guards with `cp … || continue` and stamps the *destination* (`shasum -a 256 "./fusion-workbench/$rel"`), so a failed copy there is not stamped. Step 0e's replace has neither property.

**2. "Keep mine" converts into a permanent conflict on the next plugin move.** `:214` states the end state:

> On "keep mine", change no file and stamp anyway — the shipped checksum records *this divergence was seen and kept*, which turns the file into case 3 on the next run and re-raises it only when the plugin moves again.

Trace it. After declining, `R = S` and `P ≠ S`, so the next run reads `case3-adapted` and is silent. Correct. When the plugin then ships a new `S'`: `P ≠ S'`, `R` is non-empty, `P ≠ R` (since `P ≠ S = R`), and `S' ≠ R`. That is the last branch, `case4-conflict`.

Case 4's contract, `:206`: "Name it as a conflict and offer no one-click replace. The file is neither changed nor stamped, so it is **named again on every run until a human resolves it by hand**."

So a user who declines once is warned on every subsequent Setup, forever, with no documented way to stop. The only surface that could clear it is `.asset-provenance`, whose only reader and writer is `/fusion:setup` itself (`rules/fusion-workbench-conventions.md:84`), so "resolves it by hand" means hand-editing an undocumented checksum file. That sits badly beside the step's own budget clause at `:208`: "asks **at most one question** … Setup asks one question on a normal run and that is the budget."

Classifying it as a conflict is arguably the honest reading — both copies really have moved. The defect is the absence of an exit.

**Verified at HEAD `7832553`** by reading `skills/setup/SKILL.md:161-233` and tracing the four state variables through the branch chain at `:191-196`. Not verified by execution.

---
**Found by:** coderev, review of `7135a19..7832553`, review file `260821-0145-coderev-turn-1-prose-metric-setup-step-0e-and-the-repunctuation.md`.
**Owner:** `coder`.
**Severity:** Medium for part 1 (a user-requested change is silently recorded as done), Low-Medium for part 2 (a warning with no off-switch on a step whose stated design is to ask at most once).
**Direction, not a prescription.** Part 1 has an obvious shape and it is the one Step 0d already uses: guard the `cp`, stamp the destination. Part 2 is a design question rather than a bug to patch, and this record should not pre-empt it: either case 4 gets a way to be acknowledged, or the decline path should not produce a state that lands there.

---
Resolved: fixed — the replace loop guards the `cp`, stamps the destination and names a failed copy `replace-failed` so it is offered again rather than recorded as done; case 4 names its two ways out (replace by hand, or keep and delete the file's provenance line, which asks once more and then falls silent); `skills/setup/SKILL.md:206`, `:216-226`, `:242`
