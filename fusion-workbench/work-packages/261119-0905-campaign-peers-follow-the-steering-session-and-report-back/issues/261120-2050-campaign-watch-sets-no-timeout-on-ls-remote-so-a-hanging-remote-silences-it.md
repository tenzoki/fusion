# campaign watch sets no timeout on ls-remote, so a hanging remote silences it

---
**Domain:** code
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Executor:** code-implementer
**Cross-references:** plan `261119-1248-plan-campaign-peers-follow-the-steering-session-and-report-back.md` step 4; commit `98e36420`

---

## What happens

`bin/fusion-campaign watch` (`hooks/lib/campaign-watch.ts`) runs one `git ls-remote` per interval with no timeout, the same choice `sync` and `overview` make for their fetch. A remote that accepts the connection and then never answers does not fail, so the probe never returns: `watch` prints neither `moved=` nor `failed=`. The steering session and a waiting peer then believe the remote is quiet while they see nothing.

## Why it matters

The watch is the only route by which a steering session learns of a peer's question or result without the user asking (decision `261119-0851-how-does-a-campaign-steer-its-peers-and-get-their-results-and-questions-back.md`, ruling 2(a)). A silent stall is indistinguishable from a quiet campaign, which is the failure the watch exists to remove.

## What would fix it

A bound on each probe (for example 60 s) after which the probe counts as `failed=fetch-failed`, so the existing `failed=` / `recovered=` pair reports it. A test with a remote that never answers.

## Status

Left open on 2026-11-20 by the user's choice to continue with step 5; not part of the step 4 commit.
