# Should a rule be allowed to land without the check that enforces it?

---
**Domain:** code
**Status:** open
**Filed by:** orchestrator
**Cross-references:** `260810-0512-coderev-turn-1-range-8960e1a-to-head.md` § "Theme C — The empty-expansion class, established and then re-introduced"; `260810-0500_*_the-queue-retirement-writes-through-unchecked-resolver-values-and-can-move-the-queue-to-the-workbench-root.md` (the instance); `260810-0502_*_…`, `260810-0503_*_…`, `260810-0510_*_…` (the counter-evidence: three lints of doubtful value from the same Turn); `260810-0241-orchestrator-session.md`

---

## Question

In one Turn of one session, this project wrote a rule into the file every agent loads at Setup and then broke that same rule three commits later, in a consumer written after it.

The sequence, all on 260810:

| Commit | What it did |
|---|---|
| `6a69717` | Added an emptiness assertion to `/fusion:cadence`, naming the failure exactly: an empty pair makes `mkdir -p "$WORKBENCH/$OUT_MEMO"` read as `mkdir -p "/"` |
| `e99f0ef` | Wrote the rule into `rules/fusion-workbench-conventions.md`: a consumer receiving an empty or unset key stops and names it |
| `ff70d3a` | Added a new consumer without the check — and what it moves is `tasklist.md` |

The author of `ff70d3a` had loaded `fusion-workbench-conventions.md` at its own Setup. Its own account, when asked: *loading a rule is not reading it, and reading it at Setup is not recall forty minutes later while typing a `mkdir`.*

So the question is not whether the rule was clear, or whether the author was careless. It is whether **a rule stated only in prose is a mechanism at all**, and if not, what should be required to land beside it.

The same Turn produced the counter-argument. Four tasks each added a lint over prompt prose, and the reviewer judged two of them to be decorative: one anchors on the very phrase it checks, one's negative control is a renamed duplicate of its positive case, and two of another's re-implement the logic instead of calling it. So "require a check with every rule" risks buying a checkbox rather than a gate, and this project has just demonstrated it can produce those at speed.

## Options

1. **A rule that constrains a mechanical, syntactic property lands with an executable check, or it does not land.** The empty-expansion rule qualifies: `mkdir`/`mv` through `"$WORKBENCH/$KEY"` unpreceded by a non-empty test on both names is visible to the same extractors the existing lints already use, and such a check would have failed `ff70d3a` at `npm test`, four commits before a reviewer read it.
   - Pros: turns the rule into something that acts. Bounded — it applies only where the property is syntactic, so it is not a general "every rule needs a test" tax.
   - Cons: adds to a lint cohort whose value is already contested. Needs a criterion for "mechanical and syntactic" that does not itself become a judgement call.
2. **Require the check only when the rule is written *because* something broke.** All three of tonight's real instances were reactive. A rule written in response to a defect has a known failing input by construction, which is precisely what a negative control needs — and the absence of a genuine negative control is what made two of tonight's lints decorative.
   - Pros: cheapest criterion, and it directly targets the failure mode the reviewer found in the weak lints.
   - Cons: a rule written *before* the first failure gets nothing, which is the case where prevention is worth most.
3. **Accept that prose rules are advisory, and put the weight on review instead.** Tonight's reviewer did catch it, three hours later, having been asked explicitly to be suspicious.
   - Pros: honest about what prompt text can do. No new mechanism, no new maintenance.
   - Cons: the catch depended on a dispatch that asked for suspicion. It also scales badly: the rule set grows, the review window does not.

## Constraints

- Whatever is decided must not add to the decorative-lint problem. A check that parses prose and asserts the prose is still there is a change-detector, and three of those were filed as defects in the same review that motivated this question.
- The always-on rule set is byte-metered (`rules-emission-golden`), and every addition is paid on every dispatch. A decision that makes rules cheaper to add without making them more effective is a net loss.
- `rules/critical-stance.md` §4 applies to the decision itself: if "which rules are mechanically checkable" cannot be decided from the inputs available, the answer is a different question, not an approximation of this one.

## Recommendation

None yet, deliberately. The instance is fixed (`3df0c17`); this record exists so the pattern is not re-derived from scratch the next time it happens, and so the answer is chosen rather than defaulted into. It should be answered with the lint cohort's own fate (`260810-0502_*_the-state-drift-lint-anchors-on-the-phrase-it-checks-and-one-negative-control-is-a-duplicate.md`, `260810-0503_*_the-domain-cascade-lint-is-defeated-by-a-decoy-branch-and-one-helper-has-no-negative-control.md`, `260810-0510_*_two-of-the-queue-ground-lints-negative-controls-re-implement-the-logic-instead-of-calling-it.md`) in view, because option 1 is only worth taking if this project can tell a real gate from a decorative one — and tonight it produced four and got two right.

---
Deferred: until the lint cohort's own fate is settled — `260810-0502`, `260810-0503_*_the-domain-cascade-lint-is-defeated-by-a-decoy-branch-and-one-helper-has-no-negative-control.md`
and `260810-0510_*_two-of-the-queue-ground-lints-negative-controls-re-implement-the-logic-instead-of-calling-it.md`. User, session 260811-0752-orchestrator-session.md (chat). The record's own closing paragraph asks for
exactly this ordering: option 1 is worth taking only if this project can tell a real gate from a
decorative one, and on the day this record was filed it produced four lints and got two right.
Re-open when those three are answered; the instance that motivated the record is already fixed at
`3df0c17`, so nothing is blocked by the deferral.
