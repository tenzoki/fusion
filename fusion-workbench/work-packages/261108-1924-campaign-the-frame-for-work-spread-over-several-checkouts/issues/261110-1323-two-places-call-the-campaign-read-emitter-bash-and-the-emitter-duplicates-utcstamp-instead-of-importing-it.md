Two places call the `campaign_read` emitter bash, and the emitter duplicates `utcStamp` instead of importing it
---
`hooks/lib/orchestrator-events.ts:27-30` says of `campaign_read`: "That emitter is bash too and shares this module's schema by convention, as the `commit` row's does", and `README-hooks.md`'s row for `lib/orchestrator-events.ts` says "the two bash emitters sharing the schema by convention". The `commit` row's emitter is bash (`bin/fusion-commit-lock` `emit_commit_event`); the `campaign_read` row's is TypeScript, `hooks/lib/campaign-sync.ts:157` `campaignReadRow`, reached through the bash wrapper `bin/fusion-campaign`, which composes nothing. Being TypeScript it could import; instead `campaign-sync.ts:154` defines `stamp = (ms) => new Date(ms).toISOString().slice(0, 19)`, the body of `orchestrator-events.ts:173` `utcStamp(now)`, which `hooks/lib/record-write.ts` already imports for the same `ts` format. The comment names the one reason a convention replaces an import ("bash") and the reason does not hold.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Severity:** Low
**Executor:** code-implementer

**Evidence.** `hooks/lib/orchestrator-events.ts:18-30, 173-175`; `hooks/lib/campaign-sync.ts:84-91, 153-167`; `README-hooks.md` `## Files`, the `lib/orchestrator-events.ts` row (the sentence "the two bash emitters sharing the schema by convention"); `hooks/lib/record-write.ts:180` (`import { utcStamp } from "./orchestrator-events.js"`).

**Acceptance.** `campaign-sync.ts` imports `utcStamp` and carries no `stamp` of its own, or states in its header why it does not import; the module comment and the README row name the emitter as `hooks/lib/campaign-sync.ts` behind `bin/fusion-campaign sync` and say "bash" of the `commit` row alone; `hooks/dist/` is rebuilt in the same commit and `cd hooks && npm test` is green.

**Cross-references:** `261108-2301-plan-campaign-the-frame-for-work-spread-over-several-checkouts.md` (step 17)
---
Resolved: `hooks/lib/campaign-sync.ts` imports `utcStamp` from `hooks/lib/orchestrator-events.ts` and its local `stamp` is gone; the module comment of `hooks/lib/orchestrator-events.ts` (`## Why a hook writes these rows at all`, the `campaign_read` bullet) and the `lib/orchestrator-events.ts` row of `README-hooks.md` `## Files` name the emitter as `hooks/lib/campaign-sync.ts` (`campaignReadRow`) behind `bin/fusion-campaign sync` and say "bash" of the `commit` row alone; `hooks/dist/` rebuilt in the same change.
