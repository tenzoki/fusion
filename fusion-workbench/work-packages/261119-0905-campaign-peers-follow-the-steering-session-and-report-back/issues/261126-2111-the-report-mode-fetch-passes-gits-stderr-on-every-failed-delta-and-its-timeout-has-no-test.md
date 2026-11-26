# The report-mode fetch passes git's stderr on every failed delta, and its timeout has no test

---
On a move whose fetch fails, `fetchRef` passes git's stderr straight through, on every probe of the outage, while the first `failed=` warns with the probe's stderr, which is empty there. The header promises git's stderr once. The fetch's 60 s bound is not exercised by any test.
---
**Domain:** code
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Executor:** code-implementer
**Cross-references:** review `261126-2111-reviewer-closing-pass-over-13-6-0.md`

**Evidence:** `hooks/lib/campaign.ts:502` (`stdio: ["ignore", "ignore", "inherit"]`); `hooks/lib/campaign-watch.ts:307-308` (the delta's failure carries no stderr) and `:322` (`warn` of the probe's stderr); `bin/fusion-campaign` `## probe and watch`, the `failed=` row of the report mode ("git's stderr once with it"). `hooks/lib/__tests__/campaign-watch.test.ts:318-322` hangs `uploadpack`, which stops the `ls-remote` first, so the fetch's `timeout` in `fetchRef` is never reached.

**Acceptance:** in report mode the fetch's stderr is captured and passed on once with the first `failed=` of the outage, and a test hangs the fetch while `ls-remote` answers and sees `failed=fetch-failed` within the bound.
