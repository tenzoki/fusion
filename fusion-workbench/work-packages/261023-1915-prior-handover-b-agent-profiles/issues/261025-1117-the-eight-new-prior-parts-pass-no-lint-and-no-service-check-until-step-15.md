The eight new profiles' `prior` parts pass no lint and no service check until plan step 15
---
The Prior token lint runs only over rendered Prior profiles, and `checkEntries` only over entries `supported` on Prior. All eight new agent entries are `prior: unsupported`, so nothing in `npm test` reads their `prior` parts today. A regression there stays green until step 15. Severity: Low.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Domain:** code
**Executor:** code-implementer
**Cross-references:** 261025-1117-reviewer-closing-review-of-prior-handover-b-agent-profiles.md; 261024-2111-agent-span-map-for-entry-profiles.md (Finding 8, blocker 3)

## Defect

- `catalog/src/__tests__/render.test.ts`, `describeLive("render prior (live catalog)")`: `priorTokenHits` runs over the files `renderPrior` writes. `catalog/src/render.ts` `priorProfiles` skips a profile whose referrers are all `unsupported` on Prior (`if (state === "unsupported") continue`).
- `render.ts` `checkEntries`: `if (e.support.prior !== "supported") continue`.
- `catalog/catalog.json`: the entries `orchestrator`, `consultant`, `analyst`, `requirements-designer`, `implementation-planner`, `data-implementer`, `document-editor`, `policy-curator` are `prior: unsupported`, and so are their roles.
- No test reads `prior` parts directly: `partsOf("prior")` feeds only the inlined-rule list.

The reviewer's own pass over all `prior` parts (`rv_services.py`, the three `CLAUDE_ONLY_TOKENS` regexes with include lines removed) found no hit today, so this is a coverage gap, not a present defect.

## Fix direction

Add a test that runs `priorTokenHits` over every `prior` part of every profile, include lines removed, whatever the support state; and one that reports, for every entry, the services its `prior` parts name against its `requires`, as a warning or as an explicit list of the known step-15 mismatches.

## Acceptance

- Inserting `AskUserQuestion` into any new profile's `prior` part turns `cd catalog && npm test` red.
- `cd catalog && npm test` exits 0 on the tree as it stands.

Also seen: 261025-2352 by reviewer — at `ec6c968e` the gap covers the 210 `prior` parts of the sixteen skill profiles too (all `prior: unsupported`), and `catalog/README.md` ("held to the same lints … the narrower Prior lint") and `eab95b30` ("skill parts are covered as they land") overstate it; no hit today with all sixteen set supported in a scratch copy.
