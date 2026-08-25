A bounded Circle holds a Draft spec with 49 unreconciled criteria that no scan reaches

---
`circles/260820-2051-style-rules-arrive-and-get-measured/planning/260820-2249_*_spec-style-rules-arrive-and-get-measured.md`
carries `**Status:** Draft`, the `_o_` marker, ten capabilities and 49 acceptance criteria, none of
them ticked. Its Circle reached Bounded Closure on 260821 and at least one of its capabilities is
demonstrably on disk. The Circle is terminal, so `bin/fusion-paths` emits no `SCAN_*` that reaches
the file.
---
**Filed by:** reconciler, Kai Stalmann <ks@qantr.com>
**Cross-references:** `circles/260820-2051-style-rules-arrive-and-get-measured/_b_circle.md` `## Closure note`; `circles/260820-2051-style-rules-arrive-and-get-measured/history/260821-0416-reconciliation.md` (the pass that reconciled the plan and not the spec); `circles/260824-1853-close-every-open-defect/decisions/260824-2013_*_do-archive-and-terminal-circles-stores-enter-any-scan-set-or-is-the-exclusion-written-down.md` (the open decision this is an instance of)

## What the tree holds

The spec's header says `Draft`. Its Circle's closure note says three of the Directive's four outcomes
were reached and names them: the refresh mechanism runs, the always-on corpus fell from 171 prose
em-dashes over 13 018 words to 8 over 13 292, and `rules/user-facing-output.md` states the
opening-sentence condition. Its C1 alone — *"Setup notices a copied asset that has gone stale, and
offers to replace it"* — is `skills/setup/SKILL.md` Step 0e at HEAD, with all five of its cases and
the two extra outcomes a later fix split out of the sixth. Not one of C1's six boxes is ticked.

`grep -c '^- \[x\]'` over the file returns 0 and `grep -c '^- \[ \]'` returns 49.

## Why the Circle's own reconciliation did not catch it

`circles/260820-2051-.../history/260821-0416-reconciliation.md` opens on exactly this class of fault
and finds it in the neighbouring file: *"The plan header never left `Draft`, against seventeen
`[DONE]` step markings."* It set the plan's header and closed the plan, which now carries `_c_`. The
spec beside it was not opened. The Circle record's `**Active spec/plan:**` names the plan, so a pass
that follows that field reaches the plan and nothing above it.

## Why it will not be caught later either

The Circle carries `_b_`. `bin/fusion-paths` resolves `SCAN_PLANS` to the active Circle's store and
`shared/`, and neither is this one, so no future reconciler, taskplanner or playmaker scan opens the
file. Whether a terminal Circle's stores enter any scan set is an open question in its own right, at
`circles/260824-1853-close-every-open-defect/decisions/260824-2013_*_do-archive-and-terminal-circles-stores-enter-any-scan-set-or-is-the-exclusion-written-down.md`
— which is itself inside a terminal Circle and therefore unreachable by the same argument.

## What this record does and does not claim

It does **not** claim the 49 criteria are met. Nobody has measured them, which is the point. This
pass set the header to `Partially Complete` on the closure note's authority, because `Draft` is false
against a Circle that executed against the spec, and left the marker at `_o_` because no criterion
has been verified.

It does **not** propose reopening the Circle. Two directions exist and both are somebody's decision:
reconcile the spec in place, inside a terminal Circle, which no store convention forbids and no scan
would ever ask for; or accept that a bounded Circle's spec stays unreconciled and say so once in
`rules/circle-records.md`, so the next reader stops treating an unticked box there as outstanding
work.

**Severity:** Medium. Nothing malfunctions. What is unknown is which of ten capabilities of a
delivered Circle actually shipped, and the file that would answer it is outside every scan.

**Found by:** reconciler, session-end pass over `a99e680..cfab17e`, HEAD `cfab17e`.
