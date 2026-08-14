# Does the write guard's stand-down in fusion's own repository survive the loss of its subject?

---
**Domain:** code
**Status:** open
**Filed by:** planner, planning the protected-path removal
**Cross-references:**
`shared/planning/260812-1232_*_remove-the-protected-path-half-of-the-compliance-guard.md` (step 6, which keeps the code and corrects the comment),
`hooks/guard.ts:401-415` (the stand-down), `hooks/lib/self-detect.ts` (both entry points and why they ask about different directories),
`shared/decisions/260812-1232_o_does-the-escalation-counter-survive-a-block-source-that-ships-inert.md` (the answer here follows that one)

---

## Question

`hooks/guard.ts:405` stands the write guard down when the working directory is the fusion plugin's own repository, and its comment states the reason plainly: "The protected paths (agents/**, rules/**, plugin.json, etc.) are the very files a fusion developer needs to edit."

The protected-path removal deletes that subject. What the stand-down would then govern is the two checks that remain: an active halt at CHECK 1, and a decision-governed path at `high` sensitivity at CHECK 3. Neither was ever argued for. Nobody decided that a halt should not bind in fusion's own tree; it followed from a branch placed above CHECK 1 for an unrelated reason.

The consequence is small today and not nothing. In this repository a halt does not block the write tools, so a fusion developer whose guard is halted from an earlier session will not notice, and `clear-halt.js` will report a halt they never met. If CHECK 3 is ever given data here, it would not fire either.

The plan keeps the code and corrects the comment rather than deciding this, because deleting a stand-down is a behaviour change in the one tree where the whole team works, and it is not what the user approved.

## Options

1. **Keep the stand-down and say what it now covers.** The comment names the halt and the decision-governed check instead of the protected paths.
   - Pros: no behaviour change in the repository everyone works in. Honest about its own scope.
   - Cons: keeps a branch whose motivating reason is gone. It is the shape the complexity analysis names as the dominant defect class, a claim in prose surviving the mechanism it described, except that here the mechanism survives its claim.
2. **Remove the stand-down, so fusion's own repository behaves like any consuming project.** `isFusionPluginCwd()` loses its last caller and goes with it; `isFusionPluginRoot()` stays, because the churn stand-down at `tracker.ts:1161` still asks it.
   - Pros: one fewer special case, and the special case is the one the project's own `CLAUDE.md` warns makes local testing unrepresentative. A halt would bind here, which is what a halt is for.
   - Cons: a behaviour change nobody asked for, landing in the tree where an unexpected block is most expensive. It also removes the symmetry with the churn stand-down, which stays for its own reasons.
3. **Decide it with the escalation question rather than separately.** If escalation and CHECK 3 both go, guard.ts decides nothing at all and the stand-down has no possible subject; the question dissolves.
   - Pros: avoids answering twice. The two questions are genuinely coupled.
   - Cons: leaves a comment correct only by the plan's care in the meantime.

## Constraints

- `isFusionPluginRoot()` must stay whichever way this goes: the churn heatmap's stand-down asks it of the workbench root, and churn is out of scope.
- The two stand-downs deliberately ask about different directories, and `hooks/lib/self-detect.ts` carries the measured reason. Nothing here may collapse them into one question.
- Whatever is decided, the comment in `guard.ts` must not go on claiming a subject that no longer exists.

## Recommendation

Option 3, resolved after the escalation question. The coupling is real: if the escalation counter and CHECK 3 both go, `guard.ts` has no verdict left to stand down and this decision answers itself. Until then, option 1 is what the removal plan implements, and the comment correction in its step 6 is the whole of the obligation.

If the escalation question is answered by keeping the apparatus, option 2 becomes the better answer, on the ground that a halt that does not bind where the code is written is a halt nobody will ever test.

---
Answered:
Implemented:
Deferred:
Superseded by:
