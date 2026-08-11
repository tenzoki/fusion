# Realise the measurement chassis, first two pieces: the throttle onto the existing seam, and one git wrapper

---
**Severity:** Medium
**Domain:** code
**Filed by:** orchestrator, session 260811-0752, realising an answered decision
**Affects:** `hooks/lib/state-drift.ts:512-531`, `hooks/lib/review-coverage.ts:560-579`, `hooks/lib/staging-drift.ts:449-466` (the three throttle copies); `hooks/lib/review-coverage.ts:315-326`, `hooks/lib/staging-drift.ts:260-271`, `hooks/lib/state-drift.ts:280-288` (the git wrapper, twice verbatim and once inline); `hooks/lib/guard-state-file.ts` (the seam all three bypassed)
**Cross-references:** `shared/decisions/260811-1146_a_does-the-measurement-family-get-a-shared-chassis-before-the-fourth-module.md` — the answer this realises

---

Option 2 of the answered decision. Move the throttle store onto `hooks/lib/guard-state-file.ts`,
whose own header names this exact failure class and which two other modules already use, and
extract the `execFileSync` git wrapper into one `lib/git.ts`.

**Explicitly out of scope, by the same answer:** the tracker's three `measure…ForModel` bodies,
the three CLI mains and the three `bin/` wrappers stay as they are. The full chassis is taken at
the fourth module, not now. Do not widen this record into option 1.

Also from that answer: write the **trigger** down as the thing that decides whether a new
measurement is a sibling at all. The three triggers differ (every guarded tool call, a review file
landing, HEAD having moved) and that difference is what made siblings the right relation.

**Acceptance:** three throttle copies become one call to the existing seam; one `lib/git.ts` with
no second copy anywhere; the trigger criterion is written where the next author will read it; the
tracker, CLIs and wrappers are untouched; suite green.
