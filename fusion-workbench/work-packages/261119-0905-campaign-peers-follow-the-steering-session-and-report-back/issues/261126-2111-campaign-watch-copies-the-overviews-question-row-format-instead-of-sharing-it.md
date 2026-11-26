# campaign-watch copies the overview's question row format instead of sharing it

---
`steeringRows` spells the `new-question=` and `new-ready=` fields a second time ("The row text is `renderOverview`'s") and reaches `withSince` through an `as unknown as Overview` cast. A field added to the overview's row would not reach the watch's row, and the type checker would not say so.
---
**Domain:** code
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Executor:** code-implementer
**Cross-references:** review `261126-2111-reviewer-closing-pass-over-13-6-0.md`

**Evidence:** `hooks/lib/campaign-watch.ts:226-230`; `hooks/lib/campaign.ts:1274-1279` (`renderOverview`'s `question` and `ready` formatters) and `:1229` (`withSince(o: Overview, …)`).

**Acceptance:** one exported formatter for the two rows, used by `renderOverview` and `steeringRows`, and a `withSince` over the questions and ready lanes alone, so the cast goes. The existing campaign tests pass unchanged.
