The filing rule's duplicate check gives no criterion for a hit, and forbids the read that would settle one
---
`68d6838` added a pre-filing duplicate check to the always-on conventions file. It is executable as far as
the `ls` goes, and then stops short of the judgement it asks for.
---
**Severity:** Low — the paragraph's own tie-breaker ("in doubt, write the new record") makes the failure
mode a duplicate rather than a lost defect, which is the right way round. Filed because it is an always-on
rule read by every agent on every dispatch, so an unfollowable clause in it is paid fifteen times over.
**Domain:** code
**Filed by:** coderev, session `260816-0713-coderev-turn-5-6-range-3a0408a-f77633f.md`, reviewing range `3a0408a..f77633f`
**Owner:** coder
**Affects:** `rules/fusion-workbench-conventions.md:461`

## Evidence

> **Before writing, list what is already there.** One `ls` over the open (`_o_`) record names in the target
> store, plus `shared/` when a Circle is active. Names only, never bodies — a costlier check gets skipped.
> **On a hit**, append one line to that record: `Also seen: YYMMDD-HHMM by <agent> — <one clause>` …

What is missing is what makes a hit. The check is name-only by construction, so the agent has to decide
"same defect" from two slugs — and slugs for the same defect routinely differ (this session has
`260816-0130_*_the-dual-stack-docstrings-second-reason-cites-a-test-pin-the-same-commit-changed.md` "cites a test pin the same commit changed" and `260816-0110_*_the-macos-local-network-listener-claim-is-unverified-at-head-and-still-justifies-a-harness-constraint.md` "the claim is unverified at HEAD
and still justifies a harness constraint", two records about adjacent lines of one docstring). The rule
gives no threshold, so each agent picks its own, which is how the store ends up with both a duplicate and a
missed merge.

Two smaller gaps in the same paragraph:
- Where in the record the `Also seen:` line goes is unstated (end of file? under a `## Related`?).
- "the target store, plus `shared/` when a Circle is active" restates what `SCAN_ISSUES` already resolves
  to when a Circle is active (`rules/agent-setup.md`, "A single `SCAN_*` value may name two directories"),
  so an agent that follows the resolver and an agent that follows this line list the same thing twice.

## Fix

One sentence naming the test — e.g. "a hit is a record whose slug names the same file or the same
mechanism", with the tie-breaker as written — and one naming where the line goes.

---
**Reconciliation 260817-1836** (reconciler, domain `code`). Re-verified reproducible at HEAD `2552586`: `rules/fusion-workbench-conventions.md:461` still says names only, never bodies, with no criterion for a hit and no statement of where the cross-reference line goes. Marker stays open. Log: `260817-1836-reconciliation.md`.

---
Resolved: fixed — a hit is a slug naming the same file or the same mechanism, the Also-seen line goes at the end of the record, and the store list is $SCAN_ISSUES rather than a restatement of it; rules/fusion-workbench-conventions.md:472
